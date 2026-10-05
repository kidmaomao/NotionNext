/** @jest-environment node */
import { scryptSync } from 'node:crypto'
import {
  adminConfigured,
  authenticated,
  adminCookie,
  createAdminToken,
  verifyAdminPassword
} from '@/lib/server/visitAdminAuth'
import {
  analyticsRange,
  requestDevice,
  requestLocation,
  validateEvent
} from '@/lib/server/visitAnalytics'
import adminData from '@/pages/api/visit-admin/data'
import adminSession from '@/pages/api/visit-admin/session'
import events from '@/pages/api/visit-events'
import {
  readAnalytics,
  recordAnalyticsEvent
} from '@/lib/server/visitAnalytics'
import { getStore } from '@/lib/server/visitStatsMongo'

jest.mock('@/lib/server/visitStatsMongo', () => ({
  getStore: jest.fn(),
  checkRate: jest.fn().mockResolvedValue(true)
}))
jest.mock('@/lib/server/visitAnalytics', () => ({
  ...jest.requireActual('@/lib/server/visitAnalytics'),
  readAnalytics: jest.fn(),
  recordAnalyticsEvent: jest.fn()
}))
const savedEnv = { ...process.env }
const uuid = '11223344-5566-7788-9900-aabbccddeeff'
const base = {
  eventId: uuid,
  sessionId: uuid,
  visitorId: uuid,
  path: '/article/20260814',
  title: 'Example',
  referrer: 'https://example.test/a?token=secret',
  activeSeconds: 12,
  scrollPercent: 30,
  clicks: 1,
  lastLink: 'https://outside.test/article?token=secret#name'
}
const req = () => ({
  method: 'POST',
  body: base,
  headers: {
    host: 'example.test',
    origin: 'https://example.test',
    'content-type': 'application/json'
  }
})
const res = () => {
  const r = { setHeader: jest.fn(), status: jest.fn(), json: jest.fn() }
  r.status.mockReturnValue(r)
  return r
}
const now = Date.parse('2026-10-05T08:00:00Z')
beforeEach(() => {
  process.env.VISIT_STATS_ADMIN_PASSWORD_HASH =
    'scrypt:' +
    'a'.repeat(32) +
    ':' +
    scryptSync('test-only-password', 'a'.repeat(32), 64).toString('hex')
  process.env.NEXT_PUBLIC_ANALYTICS_SELF_HOSTED_ENABLE = 'true'
  process.env.VISIT_STATS_MONGODB_URI = 'mongodb://localhost:27017'
  delete process.env.NEXT_PUBLIC_LINK
  delete process.env.VERCEL_ENV
  getStore.mockResolvedValue({ rates: {} })
  readAnalytics.mockResolvedValue({ summary: { views: 12 } })
})
afterEach(() => {
  process.env = { ...savedEnv }
})
test('passwords use scrypt, malformed configuration fails closed', () => {
  expect(adminConfigured()).toBe(true)
  expect(verifyAdminPassword('test-only-password')).toBe(true)
  expect(verifyAdminPassword('wrong')).toBe(false)
  process.env.VISIT_STATS_ADMIN_PASSWORD_HASH = 'plaintext'
  expect(adminConfigured()).toBe(false)
  expect(verifyAdminPassword('plaintext')).toBe(false)
})
test('signed cookies expire and reject tampering and future timestamps', () => {
  const token = createAdminToken(now)
  const request = { headers: { cookie: 'visit_admin_session=' + token } }
  expect(authenticated(request, now)).toBe(true)
  expect(authenticated(request, now + 8 * 3600000)).toBe(false)
  expect(authenticated(request, now - 1000)).toBe(false)
  expect(
    authenticated(
      {
        headers: { cookie: 'visit_admin_session=' + token.slice(0, -1) + 'x' }
      },
      now
    )
  ).toBe(false)
  expect(
    authenticated({ headers: { cookie: 'visit_admin_session=0.admin' } }, now)
  ).toBe(false)
})
test('cookie is HTTP-only and strict; production uses Secure', () => {
  process.env.NODE_ENV = 'production'
  expect(adminCookie('token', req())).toContain(
    'HttpOnly; SameSite=Strict; Max-Age=28800; Secure'
  )
  expect(adminCookie('', req())).toContain('Max-Age=0')
})
test('changing the password invalidates previous sessions', () => {
  const token = createAdminToken(now)
  process.env.VISIT_STATS_ADMIN_PASSWORD_HASH =
    'scrypt:' + 'b'.repeat(32) + ':' + 'c'.repeat(128)
  expect(
    authenticated({ headers: { cookie: 'visit_admin_session=' + token } }, now)
  ).toBe(false)
})
test('anonymous access cannot read any visitor data', async () => {
  const response = res()
  await adminData({ method: 'GET', headers: {}, query: {} }, response)
  expect(response.status).toHaveBeenCalledWith(401)
  expect(readAnalytics).not.toHaveBeenCalled()
  expect(response.json).toHaveBeenCalledWith({ error: 'unauthorized' })
})
test('an authenticated admin can read statistics with caching disabled', async () => {
  const response = res()
  await adminData(
    {
      method: 'GET',
      headers: { cookie: 'visit_admin_session=' + createAdminToken() },
      query: {}
    },
    response
  )
  expect(response.status).toHaveBeenCalledWith(200)
  expect(response.setHeader).toHaveBeenCalledWith(
    'Cache-Control',
    'private, no-store'
  )
})
test('rejects cross-origin login and logout without modifying cookies', async () => {
  const request = req()
  request.headers.origin = 'https://other.test'
  const response = res()
  await adminSession(request, response)
  expect(response.status).toHaveBeenCalledWith(403)
  expect(getStore).not.toHaveBeenCalled()
  expect(response.setHeader).not.toHaveBeenCalledWith(
    'Set-Cookie',
    expect.anything()
  )
})
test('login with a wrong password does not issue an authenticated cookie', async () => {
  const request = req()
  request.body = { password: 'wrong' }
  const response = res()
  await adminSession(request, response)
  expect(response.status).toHaveBeenCalledWith(401)
  expect(response.setHeader).not.toHaveBeenCalledWith(
    'Set-Cookie',
    expect.anything()
  )
})
test('valid login issues a signed session and logout expires it', async () => {
  const request = req()
  request.body = { password: 'test-only-password' }
  const response = res()
  await adminSession(request, response)
  expect(response.status).toHaveBeenCalledWith(200)
  expect(response.setHeader).toHaveBeenCalledWith(
    'Set-Cookie',
    expect.stringContaining('visit_admin_session=')
  )
  request.method = 'DELETE'
  await adminSession(request, response)
  expect(response.setHeader).toHaveBeenCalledWith(
    'Set-Cookie',
    expect.stringContaining('Max-Age=0')
  )
})
test('event validation strips query strings, fragments and referrer paths', () => {
  const event = validateEvent(base)
  expect(event.referrer).toBe('example.test')
  expect(event.lastLink).toBe('outside.test/article')
  expect(JSON.stringify(event)).not.toContain('secret')
})
test.each([
  '/admin/visitors',
  '/privacy/analytics',
  '/api/data',
  '/a?token=secret',
  '//evil.test'
])('does not accept analytics path %s', path => {
  expect(() => validateEvent({ ...base, path })).toThrow()
})
test.each([
  { activeSeconds: -1 },
  { activeSeconds: 14401 },
  { scrollPercent: 101 },
  { clicks: 501 },
  { eventId: 'bad' },
  { sessionId: 'bad' }
])('bounds event input %j', change => {
  expect(() => validateEvent({ ...base, ...change })).toThrow()
})
test('only accepts geolocation from Vercel headers, rounded to coarse coordinates', () => {
  const headers = {
    'x-vercel-ip-country': 'JP',
    'x-vercel-ip-city': '%E6%9D%B1%E4%BA%AC',
    'x-vercel-ip-latitude': '35.6895',
    'x-vercel-ip-longitude': '139.6917'
  }
  delete process.env.VERCEL
  expect(requestLocation(headers).latitude).toBe(null)
  process.env.VERCEL = '1'
  expect(requestLocation(headers)).toMatchObject({
    country: 'JP',
    city: '東京',
    latitude: 35.7,
    longitude: 139.7
  })
  expect(requestLocation({ 'x-vercel-ip-latitude': '1234' }).latitude).toBe(
    null
  )
})
test('empty click targets stay empty rather than recording a nonexistent link', () => {
  expect(validateEvent({ ...base, lastLink: '' }).lastLink).toBe('')
  expect(validateEvent({ ...base, lastLink: undefined }).lastLink).toBe('')
})
test('device classification does not return a raw user agent', () => {
  expect(
    requestDevice({
      'user-agent': 'Mozilla/5.0 (iPhone) Version/15 Mobile Safari/605'
    })
  ).toEqual({ device: '手机', browser: 'Safari', os: 'iOS' })
})
test('uses Shanghai date ranges and strictly bounded admin filters', () => {
  expect(
    analyticsRange(
      { days: '1' },
      Date.parse('2026-10-05T16:10:00Z')
    ).from.toISOString()
  ).toBe('2026-10-05T16:00:00.000Z')
  expect(() => analyticsRange({ visitor: { $ne: null } }, now)).toThrow()
  expect(() => analyticsRange({ days: 90 }, now)).toThrow()
  expect(() => analyticsRange({ country: ['CN', 'JP'] }, now)).toThrow()
  expect(() => analyticsRange({ page: 101 }, now)).toThrow()
  expect(() => analyticsRange({ area: ['CN', 'HK'] }, now)).toThrow()
  expect(() => analyticsRange({ area: 'US' }, now)).toThrow()
  expect(() => analyticsRange({ session: { $ne: null } }, now)).toThrow()
  expect(analyticsRange({ area: 'HK' }, now).area).toBe('HK')
})
test('new behavior fields are bounded and sharing parameters are not retained', () => {
  expect(
    validateEvent({ ...base, sourceTag: 'qq', rapidClicks: 1, leftPage: true })
  ).toMatchObject({ sourceTag: 'qq', rapidClicks: 1, leftPage: true })
  expect(
    validateEvent({ ...base, sourceTag: 'private-person' }).sourceTag
  ).toBe('')
  expect(() => validateEvent({ ...base, rapidClicks: 101 })).toThrow()
  expect(() => validateEvent({ ...base, rapidClicks: -1 })).toThrow()
})
test('recording events cannot be triggered across origins', async () => {
  const request = req()
  request.headers.origin = 'https://other.test'
  const response = res()
  await events(request, response)
  expect(response.status).toHaveBeenCalledWith(403)
  expect(recordAnalyticsEvent).not.toHaveBeenCalled()
})
test('event recording responds without exposing stored records or credentials', async () => {
  const response = res()
  await events(req(), response)
  expect(response.json).toHaveBeenCalledWith({ ok: true })
  recordAnalyticsEvent.mockRejectedValueOnce(
    new Error('mongodb://user:password@private')
  )
  await events(req(), response)
  expect(response.json).toHaveBeenLastCalledWith({ error: 'unavailable' })
})
