import NotionIcon from '@/components/NotionIcon'
import SmartLink from '@/components/SmartLink'
import { ArticleViewCount } from '@/components/VisitStats'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { publicationDay } from '@/lib/site/typedCollections'
import CONFIG from '../config'
import { simpleCategoryHref } from '../homepage'

export default function ArticleInfo({ post }) {
  const { locale } = useGlobal()
  const day = publicationDay(post)
  return (
    <header className='journal-article-heading'>
      {post.category && post.type === 'Post' && (
        <SmartLink
          className='journal-article-category'
          href={simpleCategoryHref(post.category)}
        >
          {post.category}
        </SmartLink>
      )}
      <h1>
        {siteConfig('POST_TITLE_ICON') && <NotionIcon icon={post.pageIcon} />}
        {post.title}
      </h1>
      {post.type !== 'Page' && (
        <div className='journal-byline'>
          <a href={siteConfig('SIMPLE_AUTHOR_LINK', null, CONFIG)}>
            {siteConfig('AUTHOR')}
          </a>
          {day && (
            <SmartLink href={'/archive#' + day.slice(0, 7)}>
              <time dateTime={day}>
                {locale.COMMON.POST_TIME} {day}
              </time>
            </SmartLink>
          )}
          {post.lastEditedDay && post.lastEditedDay !== post.publishDay && (
            <span>
              {locale.COMMON.LAST_EDITED_TIME} {post.lastEditedDay}
            </span>
          )}
          {(post.tags || []).map(tag => (
            <SmartLink key={tag} href={'/tag/' + encodeURIComponent(tag)}>
              #{tag}
            </SmartLink>
          ))}
          {siteConfig('ANALYTICS_SELF_HOSTED_ENABLE', false) ? (
            <ArticleViewCount />
          ) : (
            <span className='hidden busuanzi_container_page_pv'>
              <i className='fas fa-eye' aria-hidden='true' />{' '}
              <span className='busuanzi_value_page_pv' />
            </span>
          )}
        </div>
      )}
    </header>
  )
}
