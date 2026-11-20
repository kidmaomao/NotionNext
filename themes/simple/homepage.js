import {
  publicationDay,
  sortTypedPagesByPublishDate
} from '@/lib/site/typedCollections'

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
  return { href: post.href, title: post.title, date: publicationDay(post) }
}

function toCard(post) {
  const card = toPostLink(post)
  const tags = (post.tags || []).filter(Boolean).slice(0, 2)
  if (tags.length) card.tags = tags
  if (!post.password) {
    const cover = post.pageCoverThumbnail || post.pageCover
    if (cover && !/\/images\/page-cover\/solid[_-]/i.test(cover))
      card.cover = cover
    else if (/布里列赫|布本/.test([post.title, ...tags].join(' '))) {
      card.cover = '/images/bri-leith-cover.webp'
    }
  }
  return card
}

export function buildSimpleHomepage(
  publishedPosts,
  categoryOptions,
  now = Date.now()
) {
  const orderedPosts = sortTypedPagesByPublishDate(publishedPosts)
  const categoryPosts = new Map(
    (categoryOptions ?? []).map(({ name }) => [name, []])
  )
  const pinnedPosts = []
  const uncategorized = []
  let latestMoment = null

  for (const post of orderedPosts) {
    if (post.pinned === true) pinnedPosts.push(toPostLink(post))
    if (!latestMoment && post.category === '说说' && !post.password) {
      const end = post.date?.end_date
      if (!end || Date.parse(end.slice(0, 10) + 'T23:59:59.999+08:00') >= now) {
        latestMoment = {
          ...toPostLink(post),
          text: post.summary?.trim() || post.title
        }
      }
    }

    const posts = categoryPosts.get(post.category) ?? uncategorized
    if (posts.length < postsPerSection) posts.push(toCard(post))
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
    latestMoment,
    latestPosts: orderedPosts.slice(0, postsPerSection).map(toPostLink)
  }
}

export function noticeHeadline(notice) {
  if (notice?.password || !notice?.blockMap?.block) return ''
  const blocks = notice.blockMap.block
  const root = Object.values(blocks).find(({ value }) => value?.type === 'page')
  for (const id of root?.value?.content || []) {
    const block = blocks[id]?.value
    if (block?.type !== 'text') continue
    const text = (block.properties?.title || [])
      .map(run => run[0])
      .join('')
      .trim()
    if (text) return text.split(/\r?\n/)[0]
  }
  return ''
}
