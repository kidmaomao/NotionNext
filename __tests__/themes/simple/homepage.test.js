/** @jest-environment node */

import { buildSimpleHomepage } from '@/themes/simple/homepage'

function post(slug, category, date, pinned = false) {
  return {
    href: `/article/${slug}`,
    title: slug,
    category,
    publishDate: Date.parse(date),
    pinned
  }
}

test('uses the whole catalog for pins and picks the latest three posts for each category', () => {
  const posts = [
    post('news', '情报', '2026-11-12'),
    post('older-guide', '攻略', '2026-10-12', true),
    post('newest-guide', '攻略', '2026-11-13'),
    post('third-guide', '攻略', '2026-11-02'),
    post('second-guide', '攻略', '2026-11-06'),
    post('new-category', '练习/指南', '2026-11-05'),
    post('unclassified', '', '2026-11-01')
  ]
  const categories = ['情报', '攻略', '练习/指南', '活动'].map(name => ({
    name
  }))
  const result = buildSimpleHomepage(posts, categories)

  expect(result.pinnedPosts).toEqual([
    { href: '/article/older-guide', title: 'older-guide', date: '2026-10-12' }
  ])
  expect(result.groups.map(group => group.name)).toEqual([
    '攻略',
    '情报',
    '练习/指南',
    '未分类'
  ])
  expect(result.groups[0].posts.map(entry => entry.title)).toEqual([
    'newest-guide',
    'second-guide',
    'third-guide'
  ])
  expect(result.groups[2].href).toBe(
    '/category/%E7%BB%83%E4%B9%A0%2F%E6%8C%87%E5%8D%97'
  )
  expect(result.groups[3].href).toBe('/archive')
})
