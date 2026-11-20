import { siteConfig } from '@/lib/config'
import { useEffect, useRef, useState } from 'react'
import { BlogItem } from './BlogItem'
import ArticleRows from './ArticleRows'
import { toPostLink } from '../homepage'

export default function BlogListScroll({
  posts,
  keyword,
  NOTION_CONFIG,
  textView
}) {
  const perPage = Number(siteConfig('POSTS_PER_PAGE', 12, NOTION_CONFIG)) || 12
  const [limit, setLimit] = useState(perPage)
  const more = useRef(null)
  const hasMore = limit < posts.length
  useEffect(() => {
    if (!more.current || !window.IntersectionObserver) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setLimit(current => current + perPage)
      }
    })
    observer.observe(more.current)
    return () => observer.disconnect()
  }, [hasMore, perPage])
  return (
    <>
      {textView ? (
        <ArticleRows posts={posts.slice(0, limit).map(toPostLink)} />
      ) : (
        <ul className='journal-topic-grid'>
          {posts.slice(0, limit).map(post => (
            <li key={post.id || post.href}>
              <BlogItem post={post} keyword={keyword} />
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <div className='journal-list-pager'>
          <button
            type='button'
            ref={more}
            onClick={() => setLimit(limit + perPage)}
          >
            加载更多文章
          </button>
        </div>
      )}
    </>
  )
}
