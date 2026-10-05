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
  siteConfig.mockReturnValue(true)
  useRouter.mockReturnValue({ asPath: '/article/20260814', isReady: true })
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => stats })
  Object.defineProperty(global.crypto, 'randomUUID', {
    configurable: true,
    value: () => '11223344-5566-7788-9900-aabbccddeeff'
  })
})
afterAll(() => {
  global.fetch = savedFetch
})

test('shares one request between article and footer and displays real counts', async () => {
  render(content(article))
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).toHaveTextContent('123')
  )
  expect(screen.getByTestId('site-visit-stats')).toHaveTextContent('今日访客 4')
  expect(screen.getByTestId('site-visit-stats')).toHaveTextContent(
    '累计访客 67'
  )
  expect(global.fetch).toHaveBeenCalledTimes(1)
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toMatchObject({
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
  expect(global.fetch).toHaveBeenCalledTimes(1)
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
    json: async () => ({ ...stats, articleViews: null })
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
  resolveOld({ ok: true, json: async () => ({ ...stats, articleViews: 999 }) })
  await waitFor(() =>
    expect(screen.getByTestId('article-view-count')).not.toHaveTextContent(
      '999'
    )
  )
})
