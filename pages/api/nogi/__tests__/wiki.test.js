import handler from '../wiki'

const originalEnv = { ...process.env }
const key = 'test-only-012345678901234567890123456789'
function request(
  body = { query: '女神像' },
  cookies = {},
  origin = 'https://www.noginogi.sbs'
) {
  return {
    method: 'POST',
    body,
    cookies,
    headers: { host: 'www.noginogi.sbs', origin }
  }
}
function response() {
  return {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value
    },
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  }
}
beforeEach(() => {
  process.env.NOGI_WIKI_API_KEY = key
  process.env.NOGI_WIKI_API_URL =
    'https://wiki-api.noginogi.sbs/api/nogi/wiki/query'
  fetch.mockReset()
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ ok: true, text: '百科条目', page: 1, pages: 2 })
  })
})
afterAll(() => {
  process.env = originalEnv
})

test('only the wiki payload is forwarded; caller session and commands are discarded', async () => {
  const res = response()
  await handler(
    request({
      query: '女神像',
      session_id: 'forged',
      command: 'chat',
      prompt: 'hello'
    }),
    res
  )
  const [url, options] = fetch.mock.calls[0]
  expect(url).toBe(process.env.NOGI_WIKI_API_URL)
  expect(options.redirect).toBe('error')
  expect(options.headers.Authorization).toBe(`Bearer ${key}`)
  expect(JSON.parse(options.body)).toEqual({
    action: 'search',
    category: '全部',
    query: '女神像',
    session_id: expect.stringMatching(/^[0-9a-f-]{36}$/)
  })
  expect(res.headers['Set-Cookie']).toContain('HttpOnly; SameSite=Strict')
  expect(res.headers['Cache-Control']).toBe('no-store')
  expect(JSON.stringify(res.json.mock.calls)).not.toContain(key)
})

test('signed session is reused; tampered session is replaced', async () => {
  const first = response()
  await handler(request(), first)
  const cookie = first.headers['Set-Cookie'].split(';')[0].split('=')[1]
  const id = JSON.parse(fetch.mock.calls[0][1].body).session_id
  await handler(
    request({ action: 'page', page: 2 }, { nogi_wiki_session: cookie }),
    response()
  )
  expect(JSON.parse(fetch.mock.calls[1][1].body).session_id).toBe(id)
  await handler(
    request(
      {},
      {
        nogi_wiki_session: cookie.replace(
          /.$/,
          cookie.endsWith('a') ? 'b' : 'a'
        )
      }
    ),
    response()
  )
  // An empty search never reaches upstream; validate with a real query.
  await handler(
    request(
      { query: '重击' },
      {
        nogi_wiki_session: cookie.replace(
          /.$/,
          cookie.endsWith('a') ? 'b' : 'a'
        )
      }
    ),
    response()
  )
  expect(JSON.parse(fetch.mock.calls[2][1].body).session_id).not.toBe(id)
})

test.each([
  { action: 'chat', query: '你好' },
  { action: 'page', page: true },
  { query: '/洛奇 更新资料' },
  { category: [], query: 'a' },
  { query: 'a'.repeat(201) }
])('invalid query is rejected: %j', async body => {
  const res = response()
  await handler(request(body), res)
  expect(res.status).toHaveBeenCalledWith(400)
  expect(fetch).not.toHaveBeenCalled()
})

test('cross-origin requests are rejected before reaching the plugin', async () => {
  const res = response()
  await handler(
    request({ query: '女神像' }, {}, 'https://elsewhere.example'),
    res
  )
  expect(res.status).toHaveBeenCalledWith(403)
  expect(fetch).not.toHaveBeenCalled()
})

test('missing or unsafe connection settings fail closed', async () => {
  for (const url of [
    '',
    'https://wiki.example/api/config',
    'https://secret@wiki.example/api/nogi/wiki/query'
  ]) {
    process.env.NOGI_WIKI_API_URL = url
    const res = response()
    await handler(request(), res)
    expect(res.status).toHaveBeenCalledWith(503)
  }
  expect(fetch).not.toHaveBeenCalled()
})

test('upstream authentication failure returns no internal details or LLM fallback', async () => {
  fetch.mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ error: 'internal secret' })
  })
  const res = response()
  await handler(request(), res)
  expect(res.status).toHaveBeenCalledWith(503)
  expect(res.json).toHaveBeenCalledWith({
    ok: false,
    error: '百科资料暂时无法读取，请稍后重试。'
  })
  expect(fetch).toHaveBeenCalledTimes(1)
})
