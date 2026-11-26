import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { buildArchivePageData } from '@/lib/site/typedCollections'

export async function loadArchiveProps(locale, allowCompact) {
  const siteData = await fetchGlobalAllData({ from: 'archive-index', locale })
  const theme = siteConfig('THEME', BLOG.THEME, siteData.NOTION_CONFIG)
  const props = buildArchivePageData(siteData, allowCompact && theme === 'simple')

  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}
