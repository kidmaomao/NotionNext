import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { queryPayload } from '@/lib/nogi/wikiModes'

const cookieName = 'nogi_wiki_session'
const sessionPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

export const config = {
  api: { bodyParser: { sizeLimit: '4kb' } },
  maxDuration: 90
}

function signature(session, key) {
  return createHmac('sha256', key)
    .update(`nogi-wiki-session:${session}`)
    .digest('hex')
}

function getSession(req, res, key) {
  const raw = req.cookies?.[cookieName]
  const [session = '', signed = ''] =
    typeof raw === 'string' ? raw.split('.') : []
  if (
    sessionPattern.test(session) &&
    /^[0-9a-f]{64}$/.test(signed) &&
    timingSafeEqual(
      Buffer.from(signed, 'hex'),
      Buffer.from(signature(session, key), 'hex')
    )
  ) {
    return session
  }
  const id = randomUUID()
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${cookieName}=${id}.${signature(id, key)}; Path=/api/nogi/wiki; HttpOnly; SameSite=Strict; Max-Age=86400${secure}`
  )
  return id
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: '请使用百科查询窗口。' })
  }
  if (req.headers.origin) {
    try {
      const origin = new URL(req.headers.origin)
      if (
        origin.host !== req.headers.host ||
        !['http:', 'https:'].includes(origin.protocol)
      ) {
        return res
          .status(403)
          .json({ ok: false, error: '请从本站打开百科查询窗口。' })
      }
    } catch {
      return res.status(403).json({ ok: false, error: '查询来源无效。' })
    }
  }
  const payload = queryPayload(req.body)
  if (!payload)
    return res.status(400).json({
      ok: false,
      error: '请选择分类，输入不超过200字的名称或有效页码。'
    })
  const key = process.env.NOGI_WIKI_API_KEY || ''
  let endpoint
  try {
    endpoint = new URL(process.env.NOGI_WIKI_API_URL || '')
    const local =
      process.env.NODE_ENV !== 'production' &&
      endpoint.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname)
    if (
      (!local && endpoint.protocol !== 'https:') ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash ||
      endpoint.pathname !== '/api/nogi/wiki/query' ||
      key.length < 32 ||
      key !== key.trim()
    )
      throw new Error('Invalid configuration')
  } catch {
    return res
      .status(503)
      .json({ ok: false, error: '百科入口正在准备中，请稍后再来。' })
  }
  const session = getSession(req, res, key)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 80000)
  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    }
    // Optional Cloudflare Access service token for a separate encyclopedia route.
    // Admin dashboard Access policies stay intact.
    if (
      process.env.NOGI_WIKI_ACCESS_CLIENT_ID &&
      process.env.NOGI_WIKI_ACCESS_CLIENT_SECRET
    ) {
      headers['CF-Access-Client-Id'] = process.env.NOGI_WIKI_ACCESS_CLIENT_ID
      headers['CF-Access-Client-Secret'] =
        process.env.NOGI_WIKI_ACCESS_CLIENT_SECRET
    }
    const upstream = await fetch(endpoint.href, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...payload, session_id: session }),
      signal: controller.signal,
      redirect: 'error',
      cache: 'no-store'
    })
    const data = await upstream.json()
    if (!upstream.ok || data.ok !== true || typeof data.text !== 'string') {
      const status = [400, 429, 504].includes(upstream.status)
        ? upstream.status
        : 503
      return res.status(status).json({
        ok: false,
        error:
          [400, 429, 504].includes(status) && typeof data.error === 'string'
            ? data.error
            : '百科资料暂时无法读取，请稍后重试。'
      })
    }
    return res.status(200).json({
      ok: true,
      text: data.text,
      mode: payload.mode,
      view: data.view,
      page: Number.isInteger(data.page) ? data.page : null,
      pages: Number.isInteger(data.pages) ? data.pages : null,
      sources: Array.isArray(data.sources) ? data.sources : [],
      images: Array.isArray(data.images) ? data.images : [],
      candidates: Array.isArray(data.candidates)
        ? data.candidates.slice(0, 50)
        : []
    })
  } catch {
    return res.status(controller.signal.aborted ? 504 : 503).json({
      ok: false,
      error: controller.signal.aborted
        ? '百科查询超时，请稍后重试。'
        : '百科连接暂时不可用，请稍后重试。'
    })
  } finally {
    clearTimeout(timeout)
  }
}
