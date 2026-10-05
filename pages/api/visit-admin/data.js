import { authenticated } from '@/lib/server/visitAdminAuth'
import { readAnalytics } from '@/lib/server/visitAnalytics'
import { VisitStatsError } from '@/lib/server/visitStats'
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'method_not_allowed' })
  if (!authenticated(req))
    return res.status(401).json({ error: 'unauthorized' })
  try {
    return res.status(200).json(await readAnalytics(req.query))
  } catch (error) {
    if (error instanceof VisitStatsError)
      return res.status(error.status).json({ error: error.code })
    return res.status(503).json({ error: 'unavailable' })
  }
}
