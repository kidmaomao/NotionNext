import { createHash, createHmac } from 'node:crypto'
import { readMongoStats, recordMongoVisit } from './visitStatsMongo.js'

const UUID =
  /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i
export class VisitStatsError extends Error {
  constructor(code, status = 503) {
    super(code)
    this.code = code
    this.status = status
  }
}

export function normalizePostId(value) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new VisitStatsError('invalid_post', 400)
  }
  return value.replaceAll('-', '').toLowerCase()
}

export function validateVisit(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new VisitStatsError('invalid_visit', 400)
  }
  if (typeof value.visitorId !== 'string' || !UUID.test(value.visitorId)) {
    throw new VisitStatsError('invalid_visitor', 400)
  }
  const path = value.path
  if (
    typeof path !== 'string' ||
    path.length > 1024 ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    /[\\\s\x00-\x1f\x7f?#]/.test(path) ||
    /^\/(api|_next)(\/|$)/.test(path)
  ) {
    throw new VisitStatsError('invalid_path', 400)
  }
  return {
    path: path === '/' ? '/' : path.replace(/\/+$/, ''),
    postId: normalizePostId(value.postId),
    visitorId: value.visitorId.replaceAll('-', '').toLowerCase()
  }
}

export function isSameOrigin(req) {
  if (req.headers['sec-fetch-site'] === 'cross-site') return false
  try {
    const origin = new URL(req.headers.origin)
    const configured = process.env.NEXT_PUBLIC_LINK
      ? new URL(process.env.NEXT_PUBLIC_LINK).origin
      : ''
    return (
      ['http:', 'https:'].includes(origin.protocol) &&
      (origin.host === req.headers.host || origin.origin === configured)
    )
  } catch {
    return false
  }
}

export function getVisitStatsConfig() {
  if (
    process.env.NEXT_PUBLIC_ANALYTICS_SELF_HOSTED_ENABLE !== 'true' ||
    (process.env.VERCEL_ENV === 'preview' &&
      process.env.VISIT_STATS_ALLOW_PREVIEW !== 'true')
  ) {
    throw new VisitStatsError('not_configured')
  }
  const uri = process.env.VISIT_STATS_MONGODB_URI
  if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri))
    throw new VisitStatsError('not_configured')
  const database =
    process.env.VISIT_STATS_MONGODB_DATABASE || 'notionnext_visits'
  if (!/^[a-zA-Z0-9_-]{1,63}$/.test(database))
    throw new VisitStatsError('not_configured')
  const namespace = process.env.VISIT_STATS_NAMESPACE || 'noginogi:visits:v1'
  const prefix = createHash('sha256')
    .update(namespace)
    .digest('hex')
    .slice(0, 16)
  return {
    uri,
    database,
    prefix,
    secret: process.env.VISIT_STATS_HASH_SECRET || uri
  }
}

function counterIds(config, now, postId) {
  const day = new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return {
    day,
    site: `${config.prefix}:site`,
    today: `${config.prefix}:day:${day}`,
    article: postId ? `${config.prefix}:article:${postId}` : null
  }
}

function formatStats(result, day, postId) {
  if (result[0] === 'rate_limited')
    throw new VisitStatsError('rate_limited', 429)
  if (result.length !== 5) throw new VisitStatsError('unavailable')
  if (result.some(value => typeof value !== 'number'))
    throw new VisitStatsError('unavailable')
  const values = result
  if (values.some(value => !Number.isSafeInteger(value) || value < 0)) {
    throw new VisitStatsError('unavailable')
  }
  return {
    siteViews: values[0],
    siteVisitors: values[1],
    todayViews: values[2],
    todayVisitors: values[3],
    articleViews: postId ? values[4] : null,
    postId: postId || null,
    day
  }
}

export async function recordVisit(visit, ip, now = Date.now()) {
  const config = getVisitStatsConfig()
  const hash = value =>
    createHmac('sha256', config.secret).update(value).digest('hex')
  const visitor = hash(`visitor:${visit.visitorId}`)
  const network = hash(`network:${ip || visit.visitorId}`)
  const identity = visit.postId || visit.path
  const ids = counterIds(config, now, visit.postId)
  const result = await recordMongoVisit(
    config,
    ids,
    visitor,
    network,
    hash(identity),
    now
  )
  return formatStats(result, ids.day, visit.postId)
}

export async function readVisitStats(postId, now = Date.now()) {
  const config = getVisitStatsConfig()
  const ids = counterIds(config, now, postId)
  const result = await readMongoStats(config, ids)
  return formatStats(result, ids.day, postId)
}
