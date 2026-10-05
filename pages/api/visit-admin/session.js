import {
  adminConfigured,
  adminCookie,
  authenticated,
  createAdminToken,
  limitAdminLogin,
  verifyAdminPassword
} from '@/lib/server/visitAdminAuth'
import { isSameOrigin, VisitStatsError } from '@/lib/server/visitStats'
export const config = { api: { bodyParser: { sizeLimit: '1kb' } } }
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  if (!['GET', 'POST', 'DELETE'].includes(req.method))
    return res.status(405).json({ error: 'method_not_allowed' })
  if (req.method === 'GET')
    return res
      .status(200)
      .json({
        authenticated: authenticated(req),
        configured: adminConfigured()
      })
  if (!isSameOrigin(req))
    return res.status(403).json({ error: 'invalid_origin' })
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', adminCookie('', req))
    return res.status(200).json({ ok: true })
  }
  if (!adminConfigured())
    return res.status(503).json({ error: 'admin_not_configured' })
  if (!String(req.headers['content-type'] || '').startsWith('application/json'))
    return res.status(415).json({ error: 'invalid_content_type' })
  try {
    await limitAdminLogin(req)
    if (!verifyAdminPassword(req.body?.password))
      return res.status(401).json({ error: 'invalid_password' })
    res.setHeader('Set-Cookie', adminCookie(createAdminToken(), req))
    return res.status(200).json({ ok: true })
  } catch (error) {
    if (error instanceof VisitStatsError)
      return res.status(error.status).json({ error: error.code })
    return res.status(503).json({ error: 'unavailable' })
  }
}
