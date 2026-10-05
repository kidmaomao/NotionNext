import { createHmac } from 'node:crypto'
import {
  getVisitStatsConfig,
  validateVisit,
  VisitStatsError
} from './visitStats.js'
import { getStore, checkRate } from './visitStatsMongo.js'
import {
  AREA_LABELS,
  NEARBY_REGIONS,
  SOURCE_TAGS,
  classifySource,
  anomalyReasons
} from '../analytics/journeys.js'

const UUID =
  /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i
let analyticsIndexes
let indexKey
const cleanText = (value, length) =>
  typeof value === 'string'
    ? value
        .replace(/[\x00-\x1f\x7f]/g, '')
        .slice(0, length)
        .trim()
    : ''
export const hashIdentity = (config, value) =>
  createHmac('sha256', config.secret).update(value).digest('hex')

export function validateEvent(body) {
  const visit = validateVisit(body)
  if (/^\/(admin|privacy)(\/|$)/.test(visit.path))
    throw new VisitStatsError('invalid_path', 400)
  if (
    typeof body.eventId !== 'string' ||
    typeof body.sessionId !== 'string' ||
    !UUID.test(body.eventId) ||
    !UUID.test(body.sessionId)
  )
    throw new VisitStatsError('invalid_event', 400)
  const metric = (value, max) => {
    if (!Number.isSafeInteger(value) || value < 0 || value > max)
      throw new VisitStatsError('invalid_metric', 400)
    return value
  }
  let referrer = ''
  try {
    const url = new URL(body.referrer)
    if (['http:', 'https:'].includes(url.protocol))
      referrer = url.hostname.slice(0, 253)
  } catch {
    /* 直接访问没有来源。 */
  }
  let lastLink = ''
  try {
    if (typeof body.lastLink !== 'string' || !body.lastLink.trim())
      throw new Error('empty_link')
    const url = new URL(body.lastLink, 'https://local.invalid')
    if (['http:', 'https:'].includes(url.protocol))
      lastLink =
        `${url.hostname === 'local.invalid' ? '' : url.hostname}${url.pathname}`.slice(
          0,
          256
        )
  } catch {
    /* 非网页链接不记录。 */
  }
  return {
    ...visit,
    eventId: body.eventId.replaceAll('-', '').toLowerCase(),
    sessionId: body.sessionId.replaceAll('-', '').toLowerCase(),
    title: cleanText(body.title, 160),
    referrer,
    sourceTag: Object.hasOwn(SOURCE_TAGS, body.sourceTag) ? body.sourceTag : '',
    lastLink,
    activeSeconds: metric(body.activeSeconds ?? 0, 14400),
    scrollPercent: metric(body.scrollPercent ?? 0, 100),
    clicks: metric(body.clicks ?? 0, 500),
    rapidClicks: metric(body.rapidClicks ?? 0, 100),
    leftPage: body.leftPage === true
  }
}

export function requestLocation(headers) {
  // 只采用托管平台提供的位置，客户端不能通过请求正文指定地理位置。
  if (process.env.VERCEL !== '1')
    return {
      country: '',
      region: '',
      city: '',
      latitude: null,
      longitude: null
    }
  let city = cleanText(headers['x-vercel-ip-city'], 100)
  try {
    city = decodeURIComponent(city)
  } catch {
    /* 编码损坏时保留原文本。 */
  }
  const coordinate = (value, limit) => {
    if (typeof value !== 'string' || !value.trim()) return null
    const number = Number(value)
    return Number.isFinite(number) && Math.abs(number) <= limit
      ? Math.round(number * 10) / 10
      : null
  }
  return {
    country: /^[A-Z]{2}$/.test(headers['x-vercel-ip-country'] || '')
      ? headers['x-vercel-ip-country']
      : '',
    region: cleanText(headers['x-vercel-ip-country-region'], 30),
    city: cleanText(city, 100),
    latitude: coordinate(headers['x-vercel-ip-latitude'], 90),
    longitude: coordinate(headers['x-vercel-ip-longitude'], 180)
  }
}

export function requestDevice(headers) {
  const ua = cleanText(headers['user-agent'], 600)
  return {
    device: /bot|crawler|spider|headless/i.test(ua)
      ? '机器人'
      : /iPad|Tablet/i.test(ua)
        ? '平板'
        : /Mobile|Android|iPhone/i.test(ua)
          ? '手机'
          : '电脑',
    browser: /Edg\//.test(ua)
      ? 'Edge'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : '其他',
    os: /Android/i.test(ua)
      ? 'Android'
      : /iPhone|iPad/i.test(ua)
        ? 'iOS'
        : /Windows/i.test(ua)
          ? 'Windows'
          : /Macintosh/i.test(ua)
            ? 'macOS'
            : /Linux/i.test(ua)
              ? 'Linux'
              : '其他'
  }
}

export async function analyticsStore(config) {
  const store = await getStore(config.uri, config.database)
  const events = store.db.collection('visit_analytics_events')
  const sessions = store.db.collection('visit_analytics_sessions')
  const key = config.uri + ':' + config.database
  if (!analyticsIndexes || indexKey !== key) {
    indexKey = key
    analyticsIndexes = Promise.all([
      events.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      events.createIndex({ prefix: 1, at: -1 }),
      events.createIndex({ prefix: 1, visitor: 1, at: -1 }),
      events.createIndex({ prefix: 1, 'location.country': 1, at: -1 }),
      events.createIndex({ prefix: 1, session: 1, at: 1 }),
      sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      sessions.createIndex({ prefix: 1, session: 1 }, { unique: true })
    ]).catch(error => {
      analyticsIndexes = null
      throw error
    })
  }
  await analyticsIndexes
  return { ...store, events, sessions }
}

async function ensureSession(store, config, event, req, visitor, now) {
  const session = hashIdentity(config, `session:${event.sessionId}`)
  const id = `${config.prefix}:${session}`
  if (await store.sessions.findOne({ _id: id }, { projection: { _id: 1 } }))
    return session
  const [firstEvent, firstSessionEvent, knownVisitor] = await Promise.all([
    store.events.findOne(
      { prefix: config.prefix, visitor, expiresAt: { $gt: new Date(now) } },
      { sort: { at: 1 } }
    ),
    store.events.findOne(
      {
        prefix: config.prefix,
        visitor,
        session,
        expiresAt: { $gt: new Date(now) }
      },
      { sort: { at: 1 } }
    ),
    store.visitors.findOne(
      { _id: `${config.prefix}:all:${visitor}` },
      { projection: { createdAt: 1 } }
    )
  ])
  const landing = firstSessionEvent || event
  const at = firstSessionEvent?.at || new Date(now)
  const firstSeen = knownVisitor?.createdAt || firstEvent?.at || at
  // 计数请求可能先于行为请求几毫秒抵达。同一首次会话仍算新客。
  const kind =
    (firstEvent && firstEvent.session !== session) ||
    at.getTime() - firstSeen.getTime() >= 1800000
      ? 'returning'
      : 'new'
  try {
    await store.sessions.updateOne(
      { _id: id },
      {
        $setOnInsert: {
          prefix: config.prefix,
          visitor,
          session,
          at,
          firstSeen,
          kind,
          source: classifySource(
            landing.referrer,
            firstSessionEvent ? '' : event.sourceTag,
            String(req.headers.host || '').split(':')[0]
          ),
          landingPath: landing.path,
          landingTitle: landing.title,
          expiresAt: new Date(at.getTime() + 90 * 86400000)
        }
      },
      { upsert: true }
    )
  } catch (error) {
    if (error.code !== 11000) throw error
  }
  return session
}

export async function recordAnalyticsEvent(event, req, now = Date.now()) {
  if (process.env.NEXT_PUBLIC_VISIT_ANALYTICS_ENABLE !== 'true')
    throw new VisitStatsError('not_configured')
  const config = getVisitStatsConfig()
  const store = await analyticsStore(config)
  const visitor = hashIdentity(config, `visitor:${event.visitorId}`)
  const network = hashIdentity(
    config,
    `network:${String(
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
    )
      .split(',')[0]
      .trim()}`
  )
  const minute = Math.floor(now / 60000)
  const allowed = await Promise.all([
    checkRate(
      store.rates,
      `${config.prefix}:events:visitor:${visitor}:${minute}`,
      30,
      now
    ),
    checkRate(
      store.rates,
      `${config.prefix}:events:network:${network}:${minute}`,
      200,
      now
    )
  ])
  if (allowed.some(value => !value))
    throw new VisitStatsError('rate_limited', 429)
  const session = await ensureSession(store, config, event, req, visitor, now)
  const id = `${config.prefix}:${visitor}:${event.eventId}`
  let update = {
    $setOnInsert: {
      prefix: config.prefix,
      visitor,
      session,
      path: event.path,
      postId: event.postId,
      title: event.title,
      referrer: event.referrer,
      location: requestLocation(req.headers),
      ...requestDevice(req.headers),
      at: new Date(now),
      day: new Date(now + 28800000).toISOString().slice(0, 10),
      expiresAt: new Date(now + 90 * 86400000)
    },
    $max: {
      activeSeconds: event.activeSeconds,
      scrollPercent: event.scrollPercent,
      clicks: event.clicks,
      rapidClicks: event.rapidClicks,
      lastAt: new Date(now)
    },
    $set: {
      ...(event.lastLink ? { lastLink: event.lastLink } : {}),
      ...(event.leftPage ? { leftPage: true } : {})
    }
  }
  // 只允许访问创建后四小时内更新进度，不能靠重复心跳无限延长保存期限。
  const existing = await store.events.findOne(
    { _id: id },
    { projection: { at: 1, path: 1 } }
  )
  if (
    existing &&
    (existing.path !== event.path || now - existing.at.getTime() > 14400000)
  )
    return
  try {
    await store.events.updateOne({ _id: id }, update, { upsert: true })
  } catch (error) {
    if (error.code !== 11000) throw error
    delete update.$setOnInsert
    await store.events.updateOne({ _id: id }, update)
  }
}

export function analyticsRange(query, now = Date.now()) {
  if (Array.isArray(query.days) || Array.isArray(query.page))
    throw new VisitStatsError('invalid_filter', 400)
  const days = Number(query.days || 7)
  const page = Number(query.page || 1)
  if (
    ![1, 7, 30].includes(days) ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 100
  )
    throw new VisitStatsError('invalid_filter', 400)
  const country = query.country || ''
  const area = query.area || ''
  const visitor = query.visitor || ''
  const session = query.session || ''
  if (
    typeof country !== 'string' ||
    (country && !/^[A-Z]{2}$/.test(country)) ||
    typeof visitor !== 'string' ||
    (visitor && !/^[a-f0-9]{64}$/.test(visitor)) ||
    typeof session !== 'string' ||
    (session && !/^[a-f0-9]{64}$/.test(session)) ||
    typeof area !== 'string' ||
    !Object.hasOwn(AREA_LABELS, area)
  )
    throw new VisitStatsError('invalid_filter', 400)
  const dayStart = Math.floor((now + 28800000) / 86400000) * 86400000 - 28800000
  return {
    days,
    page,
    country,
    area,
    visitor,
    session,
    from: new Date(dayStart - (days - 1) * 86400000),
    to: new Date(now),
    dayStart
  }
}

export async function readAnalytics(query, now = Date.now()) {
  const config = getVisitStatsConfig()
  const range = analyticsRange(query, now)
  const { events, counters, sessions } = await analyticsStore(config)
  const mainRegions = ['CN', 'HK', 'MO', 'TW', ...NEARBY_REGIONS]
  const areaMatch =
    range.area === 'nearby'
      ? { $in: NEARBY_REGIONS }
      : range.area === 'other'
        ? { $nin: mainRegions }
        : range.area || null
  const match = {
    prefix: config.prefix,
    at: { $gte: range.from, $lte: range.to },
    expiresAt: { $gt: new Date(now) },
    ...(range.country ? { 'location.country': range.country } : {}),
    ...(areaMatch ? { 'location.country': areaMatch } : {})
  }
  if (range.visitor || range.session) {
    // 会话详情展示完整保留期内的路径，不被日期或地理筛选切断。
    const detailMatch = range.session
      ? {
          prefix: config.prefix,
          session: range.session,
          expiresAt: { $gt: new Date(now) }
        }
      : { ...match, visitor: range.visitor }
    const visits = await events
      .find(detailMatch, { projection: { _id: 0, prefix: 0, expiresAt: 0 } })
      .sort({ at: -1 })
      .limit(200)
      .toArray()
    const metadata = range.session
      ? await sessions.findOne(
          { _id: `${config.prefix}:${range.session}` },
          { projection: { _id: 0, prefix: 0, expiresAt: 0 } }
        )
      : null
    return {
      visits: visits.map(visit => ({
        ...visit,
        anomalies: anomalyReasons(visit)
      })),
      metadata,
      visitor: range.visitor,
      truncated: visits.length === 200
    }
  }
  const distinctMetrics = {
    views: { $sum: 1 },
    visitors: { $addToSet: '$visitor' }
  }
  const metricsProjection = { views: 1, visitors: { $size: '$visitors' } }
  const journeyPipeline = [
    { $sort: { at: 1, _id: 1 } },
    {
      $group: {
        _id: '$session',
        visitor: { $first: '$visitor' },
        at: { $first: '$at' },
        lastPageAt: { $last: '$at' },
        lastAt: { $max: { $ifNull: ['$lastAt', '$at'] } },
        landingPath: { $first: '$path' },
        landingTitle: { $first: '$title' },
        landingSeconds: { $first: '$activeSeconds' },
        referrer: { $first: '$referrer' },
        lastPath: { $last: '$path' },
        lastTitle: { $last: '$title' },
        leftPage: { $last: '$leftPage' },
        location: { $first: '$location' },
        device: { $first: '$device' },
        browser: { $first: '$browser' },
        views: { $sum: 1 },
        duration: { $sum: '$activeSeconds' },
        clicks: { $sum: '$clicks' },
        rapidClicks: { $sum: { $ifNull: ['$rapidClicks', 0] } },
        flaggedPages: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $gt: [{ $ifNull: ['$rapidClicks', 0] }, 0] },
                  { $gte: ['$clicks', 100] },
                  {
                    $and: [
                      { $gte: ['$clicks', 30] },
                      {
                        $gte: ['$clicks', { $max: ['$activeSeconds', 1] }]
                      }
                    ]
                  }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'visit_analytics_sessions',
        localField: '_id',
        foreignField: 'session',
        pipeline: [
          { $match: { prefix: config.prefix } },
          { $project: { _id: 0, prefix: 0, expiresAt: 0 } }
        ],
        as: 'metadata'
      }
    },
    { $set: { metadata: { $first: '$metadata' } } },
    {
      $lookup: {
        from: 'visit_analytics_events',
        localField: '_id',
        foreignField: 'session',
        pipeline: [
          {
            $match: {
              prefix: config.prefix,
              expiresAt: { $gt: new Date(now) }
            }
          },
          { $sort: { at: 1, _id: 1 } },
          { $limit: 1 },
          { $project: { path: 1, title: 1, at: 1, activeSeconds: 1 } }
        ],
        as: 'landing'
      }
    },
    { $set: { landing: { $first: '$landing' } } },
    { $sort: { lastPageAt: -1 } },
    {
      $facet: {
        rows: [{ $skip: (range.page - 1) * 30 }, { $limit: 30 }],
        sources: [
          {
            $group: {
              _id: {
                $ifNull: ['$metadata.source.label', '$referrer']
              },
              views: { $sum: 1 }
            }
          },
          { $sort: { views: -1 } },
          { $limit: 10 }
        ],
        kinds: [
          {
            $group: {
              _id: { $ifNull: ['$metadata.kind', 'unknown'] },
              views: { $sum: 1 }
            }
          }
        ],
        flagged: [{ $match: { flaggedPages: { $gt: 0 } } }, { $count: 'count' }]
      }
    }
  ]
  const [result, journeyResult] = await Promise.all([
    events
      .aggregate(
        [
          { $match: match },
          {
            $facet: {
              areas: [
                {
                  $group: {
                    _id: {
                      $switch: {
                        branches: [
                          {
                            case: {
                              $in: [
                                '$location.country',
                                ['CN', 'HK', 'MO', 'TW']
                              ]
                            },
                            then: '$location.country'
                          },
                          {
                            case: {
                              $in: ['$location.country', NEARBY_REGIONS]
                            },
                            then: 'nearby'
                          }
                        ],
                        default: 'other'
                      }
                    },
                    ...distinctMetrics
                  }
                },
                { $project: { ...metricsProjection } },
                { $sort: { views: -1 } }
              ],

              summary: [
                {
                  $group: {
                    _id: null,
                    ...distinctMetrics,
                    sessions: { $addToSet: '$session' },
                    duration: { $avg: '$activeSeconds' },
                    clicks: { $sum: '$clicks' }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    ...metricsProjection,
                    sessions: { $size: '$sessions' },
                    duration: 1,
                    clicks: 1
                  }
                }
              ],
              trend: [
                { $group: { _id: '$day', ...distinctMetrics } },
                { $project: { ...metricsProjection } },
                { $sort: { _id: 1 } }
              ],
              locations: [
                { $group: { _id: '$location', ...distinctMetrics } },
                { $project: { ...metricsProjection } },
                { $sort: { views: -1 } },
                { $limit: 150 }
              ],
              countries: [
                { $group: { _id: '$location.country', ...distinctMetrics } },
                { $project: { ...metricsProjection } },
                { $sort: { views: -1 } },
                { $limit: 100 }
              ],
              pages: [
                {
                  $group: {
                    _id: '$path',
                    title: { $last: '$title' },
                    ...distinctMetrics,
                    duration: { $avg: '$activeSeconds' },
                    scroll: { $avg: '$scrollPercent' }
                  }
                },
                {
                  $project: {
                    title: 1,
                    ...metricsProjection,
                    duration: 1,
                    scroll: 1
                  }
                },
                { $sort: { views: -1 } },
                { $limit: 15 }
              ],
              sources: [
                { $group: { _id: '$referrer', views: { $sum: 1 } } },
                { $sort: { views: -1 } },
                { $limit: 8 }
              ],
              devices: [
                { $group: { _id: '$device', views: { $sum: 1 } } },
                { $sort: { views: -1 } }
              ],
              visitors: [
                { $sort: { at: -1 } },
                {
                  $group: {
                    _id: '$visitor',
                    lastAt: { $first: '$at' },
                    firstAt: { $last: '$at' },
                    location: { $first: '$location' },
                    device: { $first: '$device' },
                    browser: { $first: '$browser' },
                    lastPath: { $first: '$path' },
                    lastTitle: { $first: '$title' },
                    views: { $sum: 1 },
                    duration: { $sum: '$activeSeconds' }
                  }
                },
                { $sort: { lastAt: -1 } },
                { $skip: (range.page - 1) * 30 },
                { $limit: 30 }
              ]
            }
          }
        ],
        { maxTimeMS: 5000, allowDiskUse: true }
      )
      .toArray(),
    events
      .aggregate([{ $match: match }, ...journeyPipeline], {
        maxTimeMS: 5000,
        allowDiskUse: true
      })
      .toArray()
  ])
  const total = await counters.findOne(
    { _id: `${config.prefix}:site` },
    { projection: { pv: 1, uv: 1 } }
  )
  return {
    ...result[0],
    sessions: (journeyResult[0]?.rows || []).map(row => ({
      ...row,
      landingPath:
        row.metadata?.landingPath || row.landing?.path || row.landingPath,
      landingTitle:
        row.metadata?.landingTitle || row.landing?.title || row.landingTitle,
      landingSeconds: row.landing?.activeSeconds ?? row.landingSeconds,
      at: row.metadata?.at || row.landing?.at || row.at,
      source: row.metadata?.source || classifySource(row.referrer),
      kind: row.metadata?.kind || 'unknown'
    })),
    sessionSources: Object.entries(
      (journeyResult[0]?.sources || []).reduce((counts, row) => {
        const label =
          row._id && !row._id.includes('.')
            ? row._id
            : classifySource(row._id).label
        counts[label] = (counts[label] || 0) + row.views
        return counts
      }, {})
    ).map(([_id, views]) => ({ _id, views })),
    kinds: journeyResult[0]?.kinds || [],
    flaggedSessions: journeyResult[0]?.flagged?.[0]?.count || 0,
    summary: result[0]?.summary[0] || {
      views: 0,
      visitors: 0,
      sessions: 0,
      duration: 0,
      clicks: 0
    },
    lifetime: { views: total?.pv ?? 0, visitors: total?.uv ?? 0 },
    days: range.days,
    page: range.page,
    from: range.from,
    generatedAt: new Date(now)
  }
}
