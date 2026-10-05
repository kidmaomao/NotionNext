import { isSameOrigin, VisitStatsError } from '@/lib/server/visitStats'
import {
  recordAnalyticsEvent,
  validateEvent
} from '@/lib/server/visitAnalytics'
export const config = { api: { bodyParser: { sizeLimit: '4kb' } } }
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  if (!isSameOrigin(req))
    return res.status(403).json({ error: 'invalid_origin' })
  if (!String(req.headers['content-type'] || '').startsWith('application/json'))
    return res.status(415).json({ error: 'invalid_content_type' })
  if (req.headers.dnt === '1' || req.headers['sec-gpc'] === '1')
    return res.status(200).json({ ok: true })
  try {
    const event = validateEvent(req.body)
    await recordAnalyticsEvent(event, req)
    return res.status(200).json({ ok: true })
  } catch (error) {
    if (error instanceof VisitStatsError)
      return res.status(error.status).json({ error: error.code })
    return res.status(503).json({ error: 'unavailable' })
  }
}
