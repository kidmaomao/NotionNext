import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import {
  getPublishedTypedPages,
  publicationDay,
  sortTypedPagesByPublishDate
} from '@/lib/site/typedCollections'
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
    const posts = getPublishedTypedPages({
      allPages: props.allPages,
      type: 'Post'
    })
    props.topicPosts = sortTypedPagesByPublishDate(posts).map(post => ({
      title: post.title,
      href: post.href,
      date: publicationDay(post),
      category: post.category || '',
      tags: post.tags || []
    }))
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
