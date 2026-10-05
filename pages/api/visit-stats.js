import {
  isSameOrigin,
  normalizePostId,
  readVisitStats,
  recordVisit,
  validateVisit,
  VisitStatsError
} from '@/lib/server/visitStats'

export const config = { api: { bodyParser: { sizeLimit: '2kb' } } }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }
  try {
    if (req.method === 'GET') {
      const postId = normalizePostId(req.query.postId)
      return res.status(200).json(await readVisitStats(postId))
    }
    if (!isSameOrigin(req)) {
      return res.status(403).json({ error: 'invalid_origin' })
    }
    if (
      !String(req.headers['content-type'] || '').startsWith('application/json')
    ) {
      return res.status(415).json({ error: 'invalid_content_type' })
    }
    const visit = validateVisit(req.body)
    const ip = String(
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
    )
      .split(',')[0]
      .trim()
    return res.status(200).json(await recordVisit(visit, ip))
  } catch (error) {
    if (error instanceof VisitStatsError) {
      if (error.status === 429) res.setHeader('Retry-After', '60')
      return res.status(error.status).json({ error: error.code })
    }
    // 统计故障只影响计数，响应不泄露凭据或内部连接信息。
    return res.status(503).json({ error: 'unavailable' })
  }
}
