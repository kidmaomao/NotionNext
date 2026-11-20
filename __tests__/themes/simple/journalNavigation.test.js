import { fireEvent, render, screen, within } from '@testing-library/react'
import HomeSections from '@/themes/simple/components/HomeSections'
import TopicIndex from '@/themes/simple/components/TopicIndex'
import ArticleContents from '@/themes/simple/components/ArticleContents'
import { BlogItem } from '@/themes/simple/components/BlogItem'

jest.mock('@/components/SmartLink', () => {
  return function Link({ prefetch, ...props }) {
    return <a {...props} />
  }
})
jest.mock('@/themes/simple/components/Announcement', () => () => null)

const articles = [
  {
    title: '副本走位',
    icon: '🎯',
    cover: '/notion-cover.webp',
    date: '2026-11-02',
    category: '攻略',
    tags: ['副本'],
    href: '/article/one'
  },
  {
    title: '更新简报',
    date: '2026-11-01',
    category: '情报',
    tags: ['副本'],
    href: '/article/two'
  }
]
const categories = [
  { name: '攻略', count: 1 },
  { name: '情报', count: 1 }
]

test('scrolls each category separately with the mouse or keyboard', () => {
  const groups = categories.map(({ name }, index) => ({
    name,
    href: '/category/' + name,
    posts: [articles[index]]
  }))
  render(
    <HomeSections groups={groups} pinnedPosts={[]} latestPosts={articles} />
  )
  const tracks = groups.map(({ name }) =>
    screen.getByRole('list', { name: name + '文章' })
  )
  for (const track of tracks) {
    Object.defineProperties(track, {
      clientWidth: { value: 400 },
      scrollWidth: { value: 750 }
    })
    Object.defineProperty(track.firstElementChild, 'offsetWidth', {
      value: 200
    })
    track.style.columnGap = '16px'
    track.scrollBy = jest.fn()
    fireEvent.scroll(track)
  }
  fireEvent.click(screen.getByRole('button', { name: '情报，下一张' }))
  expect(tracks[1].scrollBy).toHaveBeenCalledWith({
    left: 216,
    behavior: 'smooth'
  })
  expect(tracks[0].scrollBy).not.toHaveBeenCalled()
  fireEvent.keyDown(tracks[0], { key: 'ArrowRight' })
  expect(tracks[0].scrollBy).toHaveBeenCalledWith({
    left: 216,
    behavior: 'smooth'
  })
})

test('groups the latest article links by publication day and omits a second archive link', () => {
  const latest = [
    articles[0],
    { ...articles[1], date: articles[0].date },
    { href: '/article/last-year', title: '去年攻略', date: '2025-11-02' },
    { href: '/article/undated', title: '未注明日期' }
  ]
  render(<HomeSections groups={[]} pinnedPosts={[]} latestPosts={latest} />)
  const section = screen.getByRole('region', { name: '最新文章' })
  expect([...section.querySelectorAll('time')].map(time => time.dateTime)).toEqual([
    '2026-11-02', '2025-11-02'
  ])
  expect(within(section).getByText('2026.11.02', { selector: 'time' })).toBeVisible()
  expect(within(section).getAllByRole('list')[0].children).toHaveLength(2)
  expect(
    within(section).getAllByRole('link').map(link => link.getAttribute('href'))
  ).toEqual(latest.map(post => post.href))
  expect(within(section).getByText('🎯')).toBeInTheDocument()
  expect(within(section).getByText('日期未记录')).toBeInTheDocument()
  expect(section.querySelector('a[href="/archive"]')).toBeNull()
})

test('combines category and tag filters using the same published articles', () => {
  render(
    <TopicIndex
      categoryOptions={categories}
      tagOptions={[{ name: '副本', count: 2 }]}
      topicPosts={articles}
    />
  )
  expect(screen.getByRole('button', { name: /所有/ })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  expect(
    within(screen.getByRole('list'))
      .getAllByRole('link')
      .map(link => link.getAttribute('href'))
  ).toEqual(['/article/one', '/article/two'])
  const card = screen.getByRole('link', { name: /副本走位/ })
  expect(card.querySelector('.journal-cover')).toHaveAttribute('src', '/notion-cover.webp')
  expect(card.querySelector('.journal-title-icon')).toHaveTextContent('🎯')
  fireEvent.click(screen.getByRole('button', { name: /攻略/ }))
  fireEvent.click(screen.getByRole('button', { name: /#副本/ }))
  const list = screen.getByRole('list')
  expect(within(list).getByRole('link', { name: /副本走位/ })).toHaveAttribute(
    'href',
    '/article/one'
  )
  expect(within(list).queryByRole('link', { name: /更新简报/ })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /所有/ }))
  expect(within(list).getAllByRole('link')).toHaveLength(2)
})

test('keeps the latest articles and shows each category as a text module or a card rail', () => {
  const groups = articles.map(post => ({
    name: post.category,
    href: '/category/' + post.category,
    posts: [post]
  }))
  const props = {
    groups,
    pinnedPosts: [],
    latestPosts: articles
  }
  const home = render(<HomeSections {...props} />)
  const latest = screen.getByRole('region', { name: '最新文章' })
  const latestRows = latest.querySelector('.journal-updates').outerHTML
  expect(screen.getByRole('button', { name: '方块' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(screen.getByRole('button', { name: '纯文字' }))
  expect(screen.getByRole('region', { name: '最新文章' })).toBe(latest)
  expect(latest.querySelector('.journal-updates').outerHTML).toBe(latestRows)
  for (const { name, href, posts } of groups) {
    const section = screen.getByRole('region', { name })
    const list = within(section).getByRole('list')
    expect(within(list).getAllByRole('link')).toHaveLength(1)
    expect(within(list).getByText(posts[0].title).closest('a')).toHaveAttribute('href', posts[0].href)
    expect(within(list).getByText(posts[0].date, { selector: 'time' })).toBeVisible()
    expect(list.querySelector('img,.journal-title-icon,.journal-card')).toBeNull()
    expect(within(section).getByRole('link', { name: '查看全部' + name })).toHaveAttribute('href', href)
  }
  home.unmount()
  render(<HomeSections {...props} />)
  expect(screen.getByRole('button', { name: '纯文字' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(screen.getByRole('button', { name: '方块' }))
  for (const { name } of groups) {
    expect(screen.getByRole('list', { name: name + '文章' }).querySelector('.journal-card')).toBeVisible()
  }
  window.localStorage.clear()
})

test('search results use regular article cards and mark a literal search term', () => {
  const post = {
    title: '攻略 [BOSS]', href: '/article/guide', pageCover: '/guide.webp', pageIcon: '🎯',
    date: { start_date: '2026-11-02' }, results: ['进入 [Boss] 房间。'], category: '攻略'
  }
  const { rerender } = render(<BlogItem post={post} keyword='[boss]' />)
  const card = screen.getByRole('link', { name: /攻略/ })
  expect(card).toHaveClass('journal-card')
  expect(card).toHaveAttribute('href', post.href)
  expect(card.querySelector('time')).toHaveAttribute('datetime', '2026-11-02')
  expect(card.querySelector('img')).toHaveAttribute('src', post.pageCover)
  expect([...card.querySelectorAll('mark')].map(mark => mark.textContent)).toEqual(['[BOSS]', '[Boss]'])
  rerender(<BlogItem post={{ ...post, password: 'protected' }} keyword='[boss]' />)
  expect(card.querySelector('.journal-cover,.journal-card-excerpt')).toBeNull()
})

test('keeps the tag filters while changing the shared home and topic preference', () => {
  const page = render(<TopicIndex categoryOptions={categories} tagOptions={[]} topicPosts={articles} />)
  fireEvent.click(screen.getByRole('button', { name: /攻略/ }))
  fireEvent.click(screen.getByRole('button', { name: '纯文字' }))
  const list = screen.getByRole('list')
  expect(within(list).getAllByRole('link')).toHaveLength(1)
  expect(within(list).getByText('副本走位')).toBeVisible()
  expect(list.querySelector('.journal-art,img')).toBeNull()
  page.unmount()
  render(<HomeSections groups={[]} latestPosts={articles} pinnedPosts={[]} />)
  expect(screen.getByRole('button', { name: '纯文字' })).toHaveAttribute('aria-pressed', 'true')
  window.localStorage.clear()
})

test('opens the chapter menu from the keyboard and dismisses it after jumping or pressing Escape', () => {
  const id = '7db08e21-a94b-464f-8231-b5d31bcd4134'
  render(<ArticleContents items={[{ id, text: '机制', indentLevel: 0 }]} />)
  const button = screen.getByRole('button', { name: /文章目录/ })
  expect(button).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(button)
  const anchor = screen.getByRole('link', { name: '机制' })
  expect(anchor).toHaveAttribute('href', '#' + id.replace(/-/g, ''))
  fireEvent.click(anchor)
  expect(button).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(button)
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('navigation', { name: '文章目录' })).toBeNull()
})
