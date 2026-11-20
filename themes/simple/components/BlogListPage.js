import { AdSlot } from '@/components/GoogleAdsense'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'
import CONFIG from '../config'
import { BlogItem } from './BlogItem'
import ArticleRows from './ArticleRows'
import { toPostLink } from '../homepage'

export default function BlogListPage({
  posts,
  keyword,
  page = 1,
  postCount,
  textView,
  NOTION_CONFIG
}) {
  const router = useRouter()
  const perPage = siteConfig('POSTS_PER_PAGE', 12, NOTION_CONFIG)
  const totalPages = Math.ceil(postCount / perPage)
  const current = Number(page)
  const base = router.asPath
    .split(/[?#]/)[0]
    .replace(/\.html$/, '')
    .replace(/\/page\/\d+\/?$/, '')
    .replace(/\/$/, '')
  const pageHref = number =>
    number === 1 ? base || '/' : base + '/page/' + number
  const ads = siteConfig('SIMPLE_POST_AD_ENABLE', false, CONFIG)
  return (
    <>
      {textView ? (
        <ArticleRows posts={posts.map(toPostLink)} />
      ) : (
        <ul className='journal-topic-grid'>
          {posts.map((post, index) => (
            <li key={post.id || post.href}>
              {ads && (index + 1) % 3 === 0 && <AdSlot type='in-article' />}
              {ads && index === 3 && <AdSlot type='flow' />}
              <BlogItem post={post} keyword={keyword} />
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <nav className='journal-list-pager' aria-label='文章分页'>
          {current > 1 && (
            <SmartLink href={pageHref(current - 1)} rel='prev'>
              上一页
            </SmartLink>
          )}
          <span>
            第 {current} / {totalPages} 页
          </span>
          {current < totalPages && (
            <SmartLink href={pageHref(current + 1)} rel='next'>
              下一页
            </SmartLink>
          )}
        </nav>
      )}
    </>
  )
}
