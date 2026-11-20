import { fireEvent, render, screen } from '@testing-library/react'
import SayPage, { getStaticProps } from '@/pages/say'
import { fetchGlobalAllData, getPostBlocks } from '@/lib/db/SiteDataApi'
jest.mock('p-limit', () => () => fn => fn())

jest.mock('@/lib/db/SiteDataApi', () => ({
  fetchGlobalAllData: jest.fn(),
  getPostBlocks: jest.fn()
}))
jest.mock(
  '@/components/SmartLink',
  () =>
    function Link({ prefetch, ...props }) {
      return <a {...props} />
    }
)

test('publishes only public short notes and orders same-day entries by time', async () => {
  const note = {
    type: 'Post',
    status: 'Published',
    category: '说说',
    title: '今日日程',
    summary: '集合地点变更',
    publishDate: Date.parse('2026-11-20'),
    date: { start_date: '2026-11-20' }
  }
  fetchGlobalAllData.mockResolvedValue({
    NOTION_CONFIG: { COMMENT_TWIKOO_ENV_ID: 'https://twikoo.example' },
    allPages: [
      {
        ...note,
        id: 'morning',
        href: '/morning',
        date: { ...note.date, start_time: '08:00', end_date: '2026-11-20' }
      },
      { ...note, id: 'draft', status: 'Draft' },
      { ...note, id: 'hidden', status: 'Invisible' },
      { ...note, id: 'locked', password: 'protected' },
      { ...note, id: 'article', category: '攻略' },
      {
        ...note,
        id: 'evening',
        href: '/evening',
        date: { ...note.date, start_time: '21:10' }
      }
    ]
  })
  getPostBlocks.mockImplementation(async id =>
    id === 'morning'
      ? {
          block: {
            morning: {
              value: { id, type: 'page', content: ['a', 'pic', 'private'] }
            },
            a: {
              value: {
                type: 'text',
                properties: { title: [['直接写在正文里的提醒']] }
              }
            },
            pic: {
              value: {
                type: 'image',
                properties: {
                  source: [['https://example.com/game.webp']],
                  caption: [['游戏截图']]
                }
              }
            },
            private: {
              value: {
                type: 'page',
                properties: { title: [['嵌套页面不进入说说']] }
              }
            }
          }
        }
      : null
  )
  const { props } = await getStaticProps({ locale: 'zh-CN' })
  expect(props.allPages).toBeUndefined()
  expect(props.moments.map(note => note.anchor)).toEqual([
    'say-evening',
    'say-morning'
  ])
  const page = render(<SayPage {...props} />)
  expect(screen.getByText('集合地点变更')).toBeVisible()
  expect(screen.getByText('直接写在正文里的提醒')).toBeVisible()
  expect(screen.getByRole('img', { name: '游戏截图' })).toBeVisible()
  expect(screen.queryByText('嵌套页面不进入说说')).toBeNull()
  expect(getPostBlocks).toHaveBeenCalledTimes(2)
  expect(screen.getByText('21:10')).toBeVisible()
  expect(screen.queryByText(/查看原文/)).toBeNull()
  const actions = screen.getAllByRole('button', { name: '评论' })
  fireEvent.click(actions[0])
  expect(window.location.hash).toBe('#comments-say-evening')
  expect(actions[0]).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(actions[1])
  expect(actions[0]).toHaveAttribute('aria-expanded', 'false')
  expect(window.location.hash).toBe('#comments-say-morning')
  page.unmount()
  const linked = render(<SayPage {...props} />)
  expect(screen.getByRole('button', { name: '收起评论' })).toHaveAttribute(
    'aria-controls',
    'thread-say-morning'
  )
  linked.rerender(<SayPage moments={[]} />)
  expect(screen.getByText('暂时还没有公开的说说。')).toBeVisible()
})
