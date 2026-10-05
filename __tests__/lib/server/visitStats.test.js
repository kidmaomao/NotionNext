/** @jest-environment node */
import handler from '@/pages/api/visit-stats'
import {
  recordVisit,
  validateVisit,
  isSameOrigin,
  readVisitStats
} from '@/lib/server/visitStats'
import { readMongoStats, recordMongoVisit } from '@/lib/server/visitStatsMongo'

jest.mock('@/lib/server/visitStatsMongo', () => ({
  readMongoStats: jest.fn(),
  recordMongoVisit: jest.fn()
}))

const postId = '3bc5bc0b-8896-8057-bb4a-f741c7687f68'
const visitorId = '11223344-5566-7788-9900-aabbccddeeff'
const visit = { postId, visitorId, path: '/article/20260814' }
const savedEnv = { ...process.env }
const makeRes = () => {
  const res = { setHeader: jest.fn(), status: jest.fn(), json: jest.fn() }
  res.status.mockReturnValue(res)
  return res
}
const request = body => ({
  method: 'POST',
  body,
  headers: {
    host: 'www.noginogi.sbs',
    origin: 'https://www.noginogi.sbs',
    'content-type': 'application/json',
    'x-forwarded-for': '192.0.2.1'
  }
})

beforeEach(() => {
  process.env.NEXT_PUBLIC_ANALYTICS_SELF_HOSTED_ENABLE = 'true'
  process.env.VISIT_STATS_MONGODB_URI = 'mongodb://localhost:27017'
  delete process.env.VERCEL_ENV
  recordMongoVisit.mockResolvedValue([12, 4, 3, 2, 8])
  readMongoStats.mockResolvedValue([12, 4, 3, 2, 8])
})
afterEach(() => {
  process.env = { ...savedEnv }
})

test('normalizes a stable Notion article id while preserving the path', () => {
  expect(validateVisit({ ...visit, path: visit.path + '/' })).toEqual({
    path: visit.path,
    postId: postId.replaceAll('-', ''),
    visitorId: visitorId.replaceAll('-', '')
  })
})
test.each([
  '//other.test',
  '/api/visit-stats',
  '/_next/data',
  '/a?theme=simple',
  '/a#title',
  '/a\\b',
  '/a b',
  'https://other.test/a',
  '/' + 'x'.repeat(1024)
])('rejects unsupported path %s', path => {
  expect(() => validateVisit({ ...visit, path })).toThrow('invalid_path')
})
test('rejects invalid ids and accepts a site-only visit', () => {
  expect(() => validateVisit({ ...visit, visitorId: 'invalid' })).toThrow(
    'invalid_visitor'
  )
  expect(() =>
    validateVisit({ ...visit, postId: { malicious: true } })
  ).toThrow('invalid_post')
  expect(validateVisit({ ...visit, postId: null }).postId).toBe('')
})
test('rejects missing and cross-site origins', () => {
  expect(isSameOrigin({ headers: {} })).toBe(false)
  expect(
    isSameOrigin({
      headers: { host: 'www.noginogi.sbs', origin: 'https://elsewhere.test' }
    })
  ).toBe(false)
  expect(isSameOrigin(request(visit))).toBe(true)
  expect(
    isSameOrigin({
      headers: { ...request(visit).headers, 'sec-fetch-site': 'cross-site' }
    })
  ).toBe(false)
})
test('uses Shanghai day boundaries and passes only hashed visitor and network identities to storage', async () => {
  const normalized = validateVisit(visit)
  const result = await recordVisit(
    normalized,
    '192.0.2.1',
    Date.parse('2026-10-05T16:00:00Z')
  )
  expect(result).toMatchObject({
    day: '2026-10-06',
    articleViews: 8,
    siteViews: 12,
    todayVisitors: 2
  })
  const args = recordMongoVisit.mock.calls[0]
  expect(args[2]).toMatch(/^[a-f0-9]{64}$/)
  expect(args[3]).toMatch(/^[a-f0-9]{64}$/)
  expect(JSON.stringify(args.slice(1))).not.toContain('192.0.2.1')
  expect(JSON.stringify(args.slice(1))).not.toContain(normalized.visitorId)
})
test('does not write when reading counts', async () => {
  await readVisitStats(postId.replaceAll('-', ''))
  expect(readMongoStats).toHaveBeenCalledTimes(1)
  expect(recordMongoVisit).not.toHaveBeenCalled()
})
test('returns unavailable when storage is not configured, without fake zero counts', async () => {
  delete process.env.VISIT_STATS_MONGODB_URI
  const res = makeRes()
  await handler(request(visit), res)
  expect(res.status).toHaveBeenCalledWith(503)
  expect(res.json).toHaveBeenCalledWith({ error: 'not_configured' })
  expect(recordMongoVisit).not.toHaveBeenCalled()
})
test('prevents preview traffic from writing production statistics by default', async () => {
  process.env.VERCEL_ENV = 'preview'
  delete process.env.VISIT_STATS_ALLOW_PREVIEW
  await expect(recordVisit(validateVisit(visit), '192.0.2.1')).rejects.toThrow(
    'not_configured'
  )
  expect(recordMongoVisit).not.toHaveBeenCalled()
})
test('returns actual counters and disables caching', async () => {
  const res = makeRes()
  await handler(request(visit), res)
  expect(res.status).toHaveBeenCalledWith(200)
  expect(res.setHeader).toHaveBeenCalledWith(
    'Cache-Control',
    'private, no-store, max-age=0'
  )
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ articleViews: 8, siteViews: 12 })
  )
})
test('blocks cross-site writes before accessing storage', async () => {
  const req = request(visit)
  req.headers.origin = 'https://elsewhere.test'
  const res = makeRes()
  await handler(req, res)
  expect(res.status).toHaveBeenCalledWith(403)
  expect(recordMongoVisit).not.toHaveBeenCalled()
})
test('returns rate limits with a retry hint', async () => {
  recordMongoVisit.mockResolvedValue(['rate_limited'])
  const res = makeRes()
  await handler(request(visit), res)
  expect(res.status).toHaveBeenCalledWith(429)
  expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '60')
})
test('does not disclose a database connection error', async () => {
  recordMongoVisit.mockRejectedValue(
    new Error('mongodb://user:secret@private.example')
  )
  const res = makeRes()
  await handler(request(visit), res)
  expect(res.status).toHaveBeenCalledWith(503)
  expect(res.json).toHaveBeenCalledWith({ error: 'unavailable' })
})
test.each([
  [1, 2],
  [1, null, 3, 4, 5],
  [1, 2, 3, 4, -1]
])(
  'rejects invalid backend results instead of displaying fabricated counts',
  async result => {
    recordMongoVisit.mockResolvedValue(result)
    const res = makeRes()
    await handler(request(visit), res)
    expect(res.status).toHaveBeenCalledWith(503)
  }
)
test('rejects non-JSON writes and unsupported methods', async () => {
  const req = request(visit)
  req.headers['content-type'] = 'text/plain'
  const res = makeRes()
  await handler(req, res)
  expect(res.status).toHaveBeenCalledWith(415)
  await handler({ method: 'DELETE', headers: {} }, res)
  expect(res.status).toHaveBeenCalledWith(405)
})
test('GET retrieves counts and rejects repeated query parameters', async () => {
  const res = makeRes()
  await handler({ method: 'GET', query: { postId }, headers: {} }, res)
  expect(res.status).toHaveBeenCalledWith(200)
  expect(recordMongoVisit).not.toHaveBeenCalled()
  await handler(
    { method: 'GET', query: { postId: [postId, postId] }, headers: {} },
    res
  )
  expect(res.status).toHaveBeenCalledWith(400)
})
