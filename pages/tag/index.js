import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { buildSimpleTopicPosts } from '@/themes/simple/homepage'
import { DynamicLayout } from '@/themes/theme'

/**
 * 标签首页
 * @param {*} props
 * @returns
 */
const TagIndex = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutTagIndex' {...props} />
}

export async function getStaticProps(req) {
  const { locale } = req

  const from = 'tag-index-props'
  const props = await fetchGlobalAllData({ from, locale })
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

export default TagIndex
