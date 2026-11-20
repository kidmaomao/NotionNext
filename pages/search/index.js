import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { DynamicLayout } from '@/themes/theme'
import { useRouter } from 'next/router'

/**
 * 搜索路由
 * @param {*} props
 * @returns
 */
const Search = props => {
  const router = useRouter()
  const value = router.query.s
  const keyword = (Array.isArray(value) ? value[0] : value)?.trim() || ''
  const term = keyword.toLowerCase()
  const posts = keyword
    ? (props.posts || []).filter(post =>
        [post.title, post.summary, post.tags, post.category]
          .flat()
          .join(' ')
          .toLowerCase()
          .includes(term)
      )
    : []

  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return (
    <DynamicLayout
      theme={theme}
      layoutName='LayoutSearch'
      {...props}
      posts={posts}
      postCount={posts.length}
      keyword={keyword}
      clientSearch
    />
  )
}

/**
 * 浏览器前端搜索
 */
export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({
    from: 'search-props',
    locale
  })
  const { allPages } = props
  props.posts = allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )
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

export default Search
