import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from 'node:crypto'
import { getVisitStatsConfig, VisitStatsError } from './visitStats.js'
import { getStore, checkRate } from './visitStatsMongo.js'
import { hashIdentity } from './visitAnalytics.js'

const COOKIE = 'visit_admin_session'
const HOURS = 8 * 3600
export function adminConfigured() {
  return /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(
    process.env.VISIT_STATS_ADMIN_PASSWORD_HASH || ''
  )
}
export function verifyAdminPassword(password) {
  if (
    !adminConfigured() ||
    typeof password !== 'string' ||
    password.length > 256
  )
    return false
  const [, salt, expected] =
    process.env.VISIT_STATS_ADMIN_PASSWORD_HASH.split(':')
  const actual = scryptSync(password, salt, 64)
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'))
}
function sign(value) {
  return createHmac('sha256', process.env.VISIT_STATS_ADMIN_PASSWORD_HASH)
    .update(value)
    .digest('hex')
}
export function createAdminToken(now = Date.now()) {
  if (!adminConfigured()) throw new VisitStatsError('admin_not_configured')
  const value = `${Math.floor(now / 1000)}.${randomBytes(16).toString('hex')}`
  return `${value}.${sign(value)}`
}
export function authenticated(req, now = Date.now()) {
  if (!adminConfigured()) return false
  const cookie = String(req.headers.cookie || '')
    .split(';')
    .map(s => s.trim())
    .find(s => s.startsWith(COOKIE + '='))
    ?.slice(COOKIE.length + 1)
  if (!cookie || !/^\d{10}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(cookie))
    return false
  const [issued, nonce, signature] = cookie.split('.')
  const age = Math.floor(now / 1000) - Number(issued)
  return (
    age >= 0 &&
    age < HOURS &&
    timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(sign(`${issued}.${nonce}`), 'hex')
    )
  )
}
export function adminCookie(token, req) {
  const secure =
    process.env.NODE_ENV === 'production' ||
    req.headers['x-forwarded-proto'] === 'https'
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${token ? HOURS : 0}${secure ? '; Secure' : ''}`
}
export async function limitAdminLogin(req, now = Date.now()) {
  const config = getVisitStatsConfig()
  const { rates } = await getStore(config.uri, config.database)
  const network = hashIdentity(
    config,
    `admin:${String(
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
    )
      .split(',')[0]
      .trim()}`
  )
  const limits = await Promise.all([
    checkRate(
      rates,
      `${config.prefix}:admin:${network}:minute:${Math.floor(now / 60000)}`,
      5,
      now
    ),
    checkRate(
      rates,
      `${config.prefix}:admin:${network}:hour:${Math.floor(now / 3600000)}`,
      20,
      now,
      3720000
    )
  ])
  if (limits.some(value => !value))
    throw new VisitStatsError('rate_limited', 429)
}
