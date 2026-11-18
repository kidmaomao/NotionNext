import { sortTypedPagesByPublishDate } from '@/lib/site/typedCollections'

const navigationOrder = ['攻略', '汇总', '心得', '情报', '活动', '其他']
const homepageOrder = ['情报', '汇总', '心得', '攻略', '活动', '其他']
export const postsPerSection = 5

export function sortSimpleCategories(categories, order = navigationOrder) {
  const ranks = new Map(order.map((name, index) => [name, index]))
  ranks.set('辟谣', order.length + 1)
  return [...(categories ?? [])].sort(
    (left, right) =>
      (ranks.get(left.name) ?? order.length) -
      (ranks.get(right.name) ?? order.length)
  )
}

export function simpleCategoryHref(name) {
  return `/category/${encodeURIComponent(name)}`
}

function toPostLink(post) {
  const { href, title, publishDate } = post
  const date =
    post.date?.start_date?.slice(0, 10) ||
    (Number.isFinite(publishDate)
      ? new Date(publishDate).toISOString().slice(0, 10)
      : '')

  return { href, title, date }
}

export function buildSimpleHomepage(publishedPosts, categoryOptions) {
  const orderedPosts = sortTypedPagesByPublishDate(publishedPosts)
  const categoryPosts = new Map(
    (categoryOptions ?? []).map(({ name }) => [name, []])
  )
  const pinnedPosts = []
  const uncategorized = []

  for (const post of orderedPosts) {
    if (post.pinned === true) pinnedPosts.push(toPostLink(post))

    const posts = categoryPosts.get(post.category) ?? uncategorized
    if (posts.length < postsPerSection) posts.push(toPostLink(post))
  }

  const groups = [...categoryPosts]
    .filter(([, posts]) => posts.length > 0)
    .map(([name, posts]) => ({ name, href: simpleCategoryHref(name), posts }))

  if (uncategorized.length) {
    groups.push({ name: '未分类', href: '/archive', posts: uncategorized })
  }

  return {
    groups: sortSimpleCategories(groups, homepageOrder),
    pinnedPosts,
    latestPosts: orderedPosts.slice(0, postsPerSection).map(toPostLink)
  }
}
