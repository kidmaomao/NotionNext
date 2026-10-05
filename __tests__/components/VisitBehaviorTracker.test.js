import { act, render, waitFor } from '@testing-library/react'
import VisitBehaviorTracker from '@/components/VisitBehaviorTracker'
const originalFetch = global.fetch
const savedEnv = { ...process.env }
let beacon
const uuid = '11223344-5566-7788-9900-aabbccddeeff'
beforeEach(() => {
  process.env.NEXT_PUBLIC_VISIT_ANALYTICS_ENABLE = 'true'
  localStorage.clear()
  sessionStorage.clear()
  localStorage.setItem('noginogi:visitor:v1', uuid)
  Object.defineProperty(navigator, 'doNotTrack', {
    value: '0',
    configurable: true
  })
  Object.defineProperty(navigator, 'globalPrivacyControl', {
    value: false,
    configurable: true
  })
  beacon = jest.fn(() => true)
  Object.defineProperty(navigator, 'sendBeacon', {
    value: beacon,
    configurable: true
  })
  Object.defineProperty(crypto, 'randomUUID', {
    value: jest.fn(() => uuid),
    configurable: true
  })
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }))
})
afterEach(() => {
  process.env = { ...savedEnv }
  global.fetch = originalFetch
})
test.each([{ doNotTrack: '1' }, { globalPrivacyControl: true }])(
  'respects browser privacy preference %j',
  preference => {
    for (const [key, value] of Object.entries(preference))
      Object.defineProperty(navigator, key, { value, configurable: true })
    render(<VisitBehaviorTracker path='/article/example' />)
    expect(fetch).not.toHaveBeenCalled()
  }
)
test('disabled behavior tracking and admin pages do not send events', () => {
  process.env.NEXT_PUBLIC_VISIT_ANALYTICS_ENABLE = 'false'
  const { rerender } = render(<VisitBehaviorTracker path='/article/example' />)
  expect(fetch).not.toHaveBeenCalled()
  process.env.NEXT_PUBLIC_VISIT_ANALYTICS_ENABLE = 'true'
  rerender(<VisitBehaviorTracker path='/admin/visitors' />)
  expect(fetch).not.toHaveBeenCalled()
})
test('initial event reuses the existing anonymous identity and has no URL query', async () => {
  render(<VisitBehaviorTracker path='/article/example' title='文章示例' />)
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
  const [url, options] = fetch.mock.calls[0]
  const event = JSON.parse(options.body)
  expect(url).toBe('/api/visit-events')
  expect(event.visitorId).toBe(uuid)
  expect(event.path).toBe('/article/example')
  expect(event.title).toBe('文章示例')
  expect(event.activeSeconds).toBe(0)
  expect(event.scrollPercent).toBeGreaterThanOrEqual(0)
})
test('leaving a page sends progress without a new event identifier', async () => {
  const { unmount } = render(<VisitBehaviorTracker path='/article/example' />)
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
  const event = JSON.parse(fetch.mock.calls[0][1].body)
  window.dispatchEvent(new Event('scroll'))
  unmount()
  expect(beacon).toHaveBeenCalledTimes(1)
  const [url, blob] = beacon.mock.calls[0]
  expect(url).toBe('/api/visit-events')
  expect(blob.type).toBe('application/json')
  expect(event.eventId).toBe(uuid)
})
