/** @jest-environment node */

import {
  buildSimpleHomepage,
  noticeHeadline,
  sortSimpleCategories
} from '@/themes/simple/homepage'

function post(slug, category, date, pinned = false) {
  return {
    type: 'Post',
    status: 'Published',
    href: `/article/${slug}`,
    title: slug,
    category,
    publishDate: Date.parse(date),
    pinned
  }
}

test('shows the newest five articles overall and per homepage section in reading order', () => {
  const posts = [
    post('news', '情报', '2026-11-12'),
    post('older-guide', '攻略', '2026-10-12', true),
    { ...post('newest-guide', '攻略', '2026-11-13'), pageIcon: '🧭' },
    post('third-guide', '攻略', '2026-11-02'),
    post('second-guide', '攻略', '2026-11-06'),
    post('fourth-guide', '攻略', '2026-10-28'),
    post('fifth-guide', '攻略', '2026-10-25'),
    post('summary', '汇总', '2026-10-05'),
    post('notes', '心得', '2026-10-04'),
    post('event', '活动', '2026-10-03'),
    post('other', '其他', '2026-10-02'),
    post('shop', '消费', '2026-10-01'),
    post('new-category', '练习/指南', '2026-11-05'),
    post('unclassified', '', '2026-11-01'),
    post('debunk', '辟谣', '2026-10-01')
  ]
  const categories = [
    '辟谣',
    '其他',
    '攻略',
    '汇总',
    '情报',
    '心得',
    '活动',
    '练习/指南',
    '消费',
    '空栏目'
  ].map(name => ({
    name
  }))
  const result = buildSimpleHomepage(posts, categories)

  expect(result.pinnedPosts).toEqual([
    { href: '/article/older-guide', title: 'older-guide', date: '2026-10-12' }
  ])
  expect(result.latestPosts.map(entry => entry.title)).toEqual([
    'newest-guide',
    'news',
    'second-guide',
    'new-category',
    'third-guide'
  ])
  expect(result.latestPosts[0].icon).toBe('🧭')
  expect(result.groups.map(group => group.name)).toEqual([
    '情报',
    '汇总',
    '心得',
    '攻略',
    '活动',
    '其他',
    '消费',
    '练习/指南',
    '未分类',
    '辟谣'
  ])
  expect(
    result.groups
      .find(group => group.name === '攻略')
      .posts.map(entry => entry.title)
  ).toEqual([
    'newest-guide',
    'second-guide',
    'third-guide',
    'fourth-guide',
    'fifth-guide'
  ])
  expect(result.groups.find(group => group.name === '活动').posts).toHaveLength(
    1
  )
  expect(result.groups.find(group => group.name === '练习/指南').href).toBe(
    '/category/%E7%BB%83%E4%B9%A0%2F%E6%8C%87%E5%8D%97'
  )
  expect(result.groups.find(group => group.name === '未分类').href).toBe(
    '/archive'
  )
})

test('keeps the existing category order in the site navigation', () => {
  const options = ['情报', '活动', '汇总', '其他', '攻略', '心得'].map(
    name => ({ name })
  )
  expect(sortSimpleCategories(options).map(group => group.name)).toEqual([
    '攻略',
    '汇总',
    '心得',
    '情报',
    '活动',
    '其他'
  ])
})

test('prefers the Notion page cover and preserves game fallbacks and locked media', () => {
  const cards = ['剧场', '布里列赫攻略', '隐藏图'].map(title => ({
    ...post(title, '攻略', '2026-11-01'),
    tags: ['副本']
  }))
  cards[0].pageCover = '/uploaded.webp'
  cards[0].pageCoverThumbnail = '/thumbnail.webp'
  cards[0].pageIcon = '🎮'
  cards.push({ ...cards[1], title: '布本的旧文章' })
  cards[1].pageCover = 'https://www.notion.so/images/page-cover/solid_beige.png'
  cards[2].password = 'protected'
  cards[2].pageCover = '/secret.webp'
  const { groups } = buildSimpleHomepage(cards, [{ name: '攻略' }])
  expect(groups[0].posts.map(p => p.cover)).toEqual([
    '/uploaded.webp',
    cards[1].pageCover,
    undefined,
    '/images/bri-leith-cover.webp'
  ])
  expect(groups[0].posts[0].icon).toBe('🎮')
  expect(groups[0].posts[0].tags).toEqual(['副本'])
})

test('short notes expire from the hero after their end date in Hong Kong and stay off every article list', () => {
  const locked = {
    ...post('locked', '说说', '2026-11-19'),
    password: 'protected',
    summary: 'private'
  }
  const reminder = {
    ...post('reminder', '说说', '2026-11-18'),
    date: { start_date: '2026-11-18', end_date: '2026-11-20' },
    summary: '今晚到期'
  }
  const older = post('previous', '说说', '2026-11-15')
  const articles = [locked, reminder, older]
  const categories = [{ name: '说说' }]
  const active = buildSimpleHomepage(
    articles,
    categories,
    Date.parse('2026-11-20T23:59:59+08:00')
  )
  expect(active.latestMoment.text).toBe('今晚到期')
  const expired = buildSimpleHomepage(
    articles,
    categories,
    Date.parse('2026-11-21T00:00:00+08:00')
  )
  expect(expired.latestMoment.text).toBe('previous')
  expect(expired.groups).toEqual([])
  expect(expired.latestPosts).toEqual([])
  expect(expired.pinnedPosts).toEqual([])
})

test('notice preview reads only the first published paragraph in document order', () => {
  const notice = {
    blockMap: {
      block: {
        page: { value: { type: 'page', content: ['h', 'b', 'a'] } },
        a: { value: { type: 'text', properties: { title: [['Later']] } } },
        h: { value: { type: 'header' } },
        b: {
          value: {
            type: 'text',
            properties: { title: [['本周'], ['更新\n第二行']] }
          }
        }
      }
    }
  }
  expect(noticeHeadline(notice)).toBe('本周更新')
  expect(noticeHeadline({ ...notice, password: 'protected' })).toBe('')
})
