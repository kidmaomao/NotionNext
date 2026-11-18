/** @jest-environment node */

import {
  buildSimpleHomepage,
  sortSimpleCategories
} from '@/themes/simple/homepage'

function post(slug, category, date, pinned = false) {
  return {
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
    post('newest-guide', '攻略', '2026-11-13'),
    post('third-guide', '攻略', '2026-11-02'),
    post('second-guide', '攻略', '2026-11-06'),
    post('fourth-guide', '攻略', '2026-10-28'),
    post('fifth-guide', '攻略', '2026-10-25'),
    post('summary', '汇总', '2026-10-05'),
    post('notes', '心得', '2026-10-04'),
    post('event', '活动', '2026-10-03'),
    post('other', '其他', '2026-10-02'),
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
  expect(result.groups.map(group => group.name)).toEqual([
    '情报',
    '汇总',
    '心得',
    '攻略',
    '活动',
    '其他',
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
