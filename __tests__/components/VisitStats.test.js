import { render, screen, waitFor } from '@testing-library/react'
import {
  ArticleViewCount,
  SiteVisitStats,
  VisitStatsProvider
} from '@/components/VisitStats'
import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'

jest.mock('@/lib/config', () => ({ siteConfig: jest.fn() }))
jest.mock('next/router', () => ({ useRouter: jest.fn() }))
const article = { id: '3bc5bc0b-8896-8057-bb4a-f741c7687f68', type: 'Post' }
const stats = {
  articleViews: 123,
  siteViews: 345,
  siteVisitors: 67,
  todayViews: 8,
  todayVisitors: 4
}
const savedFetch = global.fetch
const content = post => (
  <VisitStatsProvider post={post}>
    <ArticleViewCount />
    <SiteVisitStats />
  </VisitStatsProvider>
)

beforeEach(() => {
  sessionStorage.clear()
  siteConfig.mockReturnValue(true)
  useRouter.mockReturnValue({ asPath: '/article/20260814', isReady: true })
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: () => Promise.resolve(stats) })
  Object.defineProperty(global.crypto, 'randomUUID', {
    configurable: true,
    value: () => '11223344-5566-7788-9900-aabbccddeeff'
  })
})
afterAll(() => {
  global.fetch = savedFetch
})

test('shares read and count requests between article and footer and displays real counts', async () => {
  render(content(article))
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent('123')
  )
  expect(screen.getByTestId('site-visit-stats')).toHaveTextContent('今日访客 4')
  expect(screen.getByTestId('site-visit-stats')).toHaveTextContent(
    '累计访客 67'
  )
  expect(global.fetch).toHaveBeenCalledTimes(2)
  const writes = global.fetch.mock.calls.filter(
    ([, options]) => options.method === 'POST'
  )
  expect(writes).toHaveLength(1)
  expect(JSON.parse(writes[0][1].body)).toMatchObject({
    postId: article.id,
    path: '/article/20260814'
  })
})
test('does not count theme queries or anchor changes as a new visit', async () => {
  const view = render(content(article))
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent('123')
  )
  useRouter.mockReturnValue({
    asPath: '/article/20260814?theme=simple#heading',
    isReady: true
  })
  view.rerender(content(article))
  expect(global.fetch).toHaveBeenCalledTimes(2)
})
test('does not send tracking requests when disabled', () => {
  siteConfig.mockReturnValue(false)
  render(content(article))
  expect(global.fetch).not.toHaveBeenCalled()
  expect(screen.queryByTestId('site-visit-stats')).not.toBeInTheDocument()
})
test('shows unavailable on failure and keeps the region visible', async () => {
  global.fetch.mockRejectedValue(new Error('offline'))
  render(content(article))
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent(
      '暂不可用'
    )
  )
  expect(screen.getByTestId('article-view-count')).toBeVisible()
  expect(screen.getByTestId('site-visit-stats')).toHaveTextContent('暂不可用')
})
test('rejects malformed counts instead of showing zero', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ ...stats, articleViews: null })
  })
  render(content(article))
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent(
      '暂不可用'
    )
  )
})
test('ignores an old response after navigating to another article', async () => {
  let resolveOld
  global.fetch.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        resolveOld = resolve
      })
  )
  const view = render(content(article))
  useRouter.mockReturnValue({ asPath: '/article/other', isReady: true })
  view.rerender(
    content({ ...article, id: '11223344-5566-7788-9900-aabbccddeeff' })
  )
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent('123')
  )
  resolveOld({
    ok: true,
    json: () => Promise.resolve({ ...stats, articleViews: 999 })
  })
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).not.toHaveTextContent(
      '999'
    )
  )
})

const cacheKey = `noginogi:visit-stats-cache:v1:/article/20260814:${article.id}`
function cacheStats(overrides = {}) {
  const now = Date.now()
  sessionStorage.setItem(
    cacheKey,
    JSON.stringify({
      savedAt: now,
      day: new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10),
      stats,
      ...overrides
    })
  )
}

test('displays saved counts while requesting the latest counts', async () => {
  cacheStats()
  let complete
  global.fetch.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        complete = resolve
      })
  )
  render(content(article))
  expect(screen.getByTestId('article-view-count')).toHaveTextContent('123')
  expect(global.fetch).toHaveBeenCalledTimes(1)
  complete({
    ok: true,
    json: () => Promise.resolve({ ...stats, articleViews: 124 })
  })
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent('124')
  )
  expect(
    screen
      .getByTestId('article-view-count')
      .querySelectorAll('[data-flipping="true"]')
  ).toHaveLength(1)
  expect(JSON.parse(sessionStorage.getItem(cacheKey)).stats.articleViews).toBe(
    124
  )
})

test.each([
  ['expired', { savedAt: Date.now() - 300001 }],
  ['previous day', { day: '2026-01-01' }],
  ['invalid counts', { stats: { ...stats, articleViews: null } }]
])('ignores %s cached counts', async (_, entry) => {
  cacheStats(entry)
  let complete
  global.fetch.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        complete = resolve
      })
  )
  render(content(article))
  expect(screen.getByTestId('article-view-count')).toHaveTextContent('…')
  complete({ ok: true, json: () => Promise.resolve(stats) })
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent('123')
  )
})

test('reports a failed refresh instead of presenting cached counts as live', async () => {
  cacheStats()
  global.fetch.mockRejectedValue(new Error('offline'))
  render(content(article))
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent(
      '暂不可用'
    )
  )
})

test('shows saved database counts before flipping to the recorded visit', async () => {
  let read, write
  global.fetch
    .mockImplementationOnce(
      () =>
        new Promise(resolve => {
          read = resolve
        })
    )
    .mockImplementationOnce(
      () =>
        new Promise(resolve => {
          write = resolve
        })
    )
  render(content(article))
  read({
    ok: true,
    json: () => Promise.resolve({ ...stats, articleViews: 122 })
  })
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent('122')
  )
  write({ ok: true, json: () => Promise.resolve(stats) })
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent('123')
  )
  expect(
    screen
      .getByTestId('article-view-count')
      .querySelectorAll('[data-flipping="true"]')
  ).toHaveLength(1)
})

test('does not replace updated counts with a late read response', async () => {
  let read
  global.fetch.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        read = resolve
      })
  )
  render(content(article))
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent('123')
  )
  read({
    ok: true,
    json: () => Promise.resolve({ ...stats, articleViews: 122 })
  })
  await waitFor(() =>
    expect(
      JSON.parse(sessionStorage.getItem(cacheKey)).stats.articleViews
    ).toBe(123)
  )
  expect(screen.getByTestId('article-view-count')).toHaveTextContent('123')
})
