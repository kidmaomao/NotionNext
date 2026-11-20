export function getTypedPages({ allPages, type, status } = {}) {
  if (!Array.isArray(allPages) || !type) return []

  return allPages.filter(page => {
    if (page?.type !== type) return false
    if (status === undefined) return true
    return page?.status === status
  })
}

export function getPublishedTypedPages({ allPages, type } = {}) {
  return getTypedPages({ allPages, type, status: 'Published' })
}

export function sortTypedPagesByPublishDate(items) {
  if (!Array.isArray(items)) return []

  return [...items].sort(
    (a, b) =>
      (b?.publishDate ?? 0) - (a?.publishDate ?? 0) ||
      (b?.date?.start_time || '').localeCompare(a?.date?.start_time || '')
  )
}

export function publicationDay(post) {
  return (
    post.date?.start_date?.slice(0, 10) ||
    (Number.isFinite(post.publishDate)
      ? new Date(post.publishDate).toISOString().slice(0, 10)
      : '')
  )
}

export function groupPublishedPostsByMonth(posts) {
  const months = {}
  for (const post of sortTypedPagesByPublishDate(posts)) {
    const month = publicationDay(post).slice(0, 7) || '日期未记录'
    if (!months[month]) months[month] = []
    months[month].push(post)
  }
  return months
}
