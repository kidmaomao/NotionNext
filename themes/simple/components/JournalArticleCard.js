import SmartLink from '@/components/SmartLink'
import NotionIcon from '@/components/NotionIcon'
import { categoryAppearance } from './CategoryIcon'

export default function JournalArticleCard({ post, category = post.category }) {
  const [Icon, accent] = categoryAppearance(category)
  const tags = (post.tags || []).slice(0, 2)
  return (
    <SmartLink
      href={post.href}
      prefetch={false}
      className='journal-card'
      style={{ '--category-accent': accent }}
    >
      <span className='journal-art'>
        <Icon aria-hidden='true' className='journal-watermark' />
        {post.cover && (
          <img
            key={post.cover}
            className='journal-cover'
            src={post.cover}
            alt=''
            loading='lazy'
            decoding='async'
            onError={event => {
              event.currentTarget.hidden = true
            }}
          />
        )}
        <span className='journal-card-title'>
          {post.icon && (
            <span className='journal-title-icon' aria-hidden='true'>
              <NotionIcon icon={post.icon} />
            </span>
          )}
          {post.title}
        </span>
      </span>
      <span className='journal-card-meta'>
        {post.date && (
          <time dateTime={post.date}>{post.date.replace(/-/g, '.')}</time>
        )}
        {tags.length > 0 && <span>{tags.join(' · ')}</span>}
      </span>
    </SmartLink>
  )
}
