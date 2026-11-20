import NotionIcon from '@/components/NotionIcon'
import SmartLink from '@/components/SmartLink'

export default function ArticleRows({ posts, showIcons = false }) {
  const days = new Map()
  for (const post of posts) {
    const day = post.date || ''
    if (!days.has(day)) days.set(day, [])
    days.get(day).push(post)
  }
  return (
    <dl className='journal-updates' data-text={showIcons ? undefined : ''}>
      {Array.from(days, ([day, articles]) => (
        <div key={day} className='journal-update-day'>
          <dt>
            {day ? (
              <time dateTime={day}>{day.replace(/-/g, '.')}</time>
            ) : (
              '日期未记录'
            )}
          </dt>
          <dd>
            <ul className='journal-update-articles'>
              {articles.map(post => (
                <li key={post.href}>
                  <SmartLink href={post.href} prefetch={false}>
                    {showIcons && (
                      <span className='journal-title-icon' aria-hidden='true'>
                        {post.icon ? (
                          <NotionIcon icon={post.icon} />
                        ) : (
                          <i className='far fa-file-alt' />
                        )}
                      </span>
                    )}
                    <span className='journal-update-title'>{post.title}</span>
                  </SmartLink>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  )
}
