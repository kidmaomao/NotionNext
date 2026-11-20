import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { DynamicLayout } from '@/themes/theme'
import { buildSimpleTopicPosts } from '@/themes/simple/homepage'

/**
 * 分类首页
 * @param {*} props
 * @returns
 */
export default function Category(props) {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return (
    <DynamicLayout theme={theme} layoutName='LayoutCategoryIndex' {...props} />
  )
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({ from: 'category-index-props', locale })
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  if (theme?.split(',')[0].trim() === 'simple') {
    props.topicPosts = buildSimpleTopicPosts(props.allPages)
  }
  delete props.allPages
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
