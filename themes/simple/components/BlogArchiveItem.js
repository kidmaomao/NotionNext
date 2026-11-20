import SmartLink from '@/components/SmartLink'
import { publicationDay } from '@/lib/site/typedCollections'
import { simpleCategoryHref } from '../homepage'

export default function BlogArchiveItem({ archiveTitle, archivePosts }) {
  return (
    <section className='journal-month' aria-labelledby={archiveTitle}>
      <h2 id={archiveTitle}>
        {archiveTitle} <small>{archivePosts[archiveTitle].length} 篇</small>
      </h2>
      <ul>
        {archivePosts[archiveTitle].map(post => {
          const day = publicationDay(post)
          return (
            <li key={post.id || post.href}>
              <time dateTime={day || undefined}>{day.slice(5)}</time>
              <SmartLink href={post.href} prefetch={false}>
                {post.title}
              </SmartLink>
              {post.category && (
                <SmartLink
                  className='journal-archive-category'
                  href={simpleCategoryHref(post.category)}
                  prefetch={false}
                >
                  {post.category}
                </SmartLink>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
