import {
  buildArchivePageData,
  getPublishedTypedPages,
  groupPublishedPostsByMonth,
  getTypedPages,
  sortTypedPagesByPublishDate
} from '@/lib/site/typedCollections'

const pages = [
  { id: 'post-1', type: 'Post', status: 'Published', publishDate: 10 },
  { id: 'member-1', type: 'Member', status: 'Published', publishDate: 20 },
  { id: 'member-2', type: 'Member', status: 'Invisible', publishDate: 30 },
  { id: 'event-1', type: 'Event', status: 'Published', publishDate: 40 }
]

describe('typedCollections', () => {
  it('archives by publication month across categories, regardless of pins or edits', () => {
    const old = {
      id: 'old',
      category: '心得',
      publishDate: Date.parse('2025-12-30'),
      lastEditedDate: '2027-01-05',
      pinned: true
    }
    const recent = {
      id: 'recent',
      category: '攻略',
      publishDate: Date.parse('2026-01-15')
    }
    const older = {
      id: 'older',
      category: '情报',
      publishDate: Date.parse('2025-12-02')
    }
    const months = groupPublishedPostsByMonth([old, older, recent])
    expect(Object.keys(months)).toEqual(['2026-01', '2025-12'])
    expect(
      Object.values(months)
        .flat()
        .map(p => p.id)
    ).toEqual(['recent', 'old', 'older'])
  })
  it('filters pages by content type', () => {
    expect(getTypedPages({ allPages: pages, type: 'Member' })).toEqual([
      pages[1],
      pages[2]
    ])
  })

  it('filters published pages by content type', () => {
    expect(getPublishedTypedPages({ allPages: pages, type: 'Member' })).toEqual(
      [pages[1]]
    )
  })

  it('sorts typed pages by publish date without mutating input', () => {
    const input = [pages[1], pages[3], pages[0]]

    expect(sortTypedPagesByPublishDate(input).map(page => page.id)).toEqual([
      'event-1',
      'member-1',
      'post-1'
    ])
    expect(input.map(page => page.id)).toEqual([
      'member-1',
      'event-1',
      'post-1'
    ])
  })
})

describe('archive page data', () => {
  const newer = {
    id: 'newer',
    type: 'Post',
    status: 'Published',
    href: '/article/newer',
    title: 'Newer',
    category: '攻略',
    date: { start_date: '2026-01-01' },
    publishDate: Date.parse('2026-01-01'),
    summary: 'Metadata only the non-Simple themes may need.'
  }
  const older = {
    type: 'Post',
    status: 'Published',
    href: '/article/older',
    title: 'Older',
    publishDate: Date.parse('2025-12-31'),
    pinned: true
  }
  const allPages = [
    older,
    { ...newer, category: '说说' },
    { ...newer, type: 'Moment' },
    { ...newer, status: 'Invisible' },
    newer
  ]
  const input = { allPages, posts: ['old list'], allNavPages: ['/archive'] }

  it('keeps the existing archive layout values in order without serializing full or duplicate posts', () => {
    const compact = buildArchivePageData(input, true)
    expect(compact).toEqual({
      allNavPages: ['/archive'],
      archivePosts: {
        '2026-01': [{
          id: newer.id,
          href: newer.href,
          title: newer.title,
          category: newer.category,
          date: newer.date,
          publishDate: newer.publishDate
        }],
        '2025-12': [{
          href: older.href,
          title: older.title,
          publishDate: older.publishDate
        }]
      }
    })
    expect(Object.keys(compact.archivePosts)).toEqual(['2026-01', '2025-12'])
    expect(Object.keys(compact.archivePosts['2025-12'][0])).not.toContain('id')
    expect(input.posts).toEqual(['old list'])
  })

  it('keeps full props for other archive themes', () => {
    expect(buildArchivePageData(input, false)).toEqual({
      allNavPages: ['/archive'],
      posts: [older, newer],
      archivePosts: { '2026-01': [newer], '2025-12': [older] }
    })
  })
})
