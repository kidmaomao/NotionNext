import SmartLink from '@/components/SmartLink'

function PostLinks({ posts }) {
  return (
    <ul className='simple-home-posts'>
      {posts.map(({ href, title, date }) => (
        <li key={href}>
          <SmartLink href={href} prefetch={false}>
            <span>{title}</span>
            {date && <time dateTime={date}>{date}</time>}
          </SmartLink>
        </li>
      ))}
    </ul>
  )
}

export default function HomeSections({
  groups,
  pinnedPosts,
  latestPosts = []
}) {
  return (
    <main className='simple-home' aria-label='文章'>
      {pinnedPosts.length > 0 && (
        <section className='simple-home-panel simple-home-pinned'>
          <h2 className='simple-home-panel-heading'>
            <i className='fa-solid fa-thumbtack' aria-hidden='true' /> 置顶
          </h2>
          <PostLinks posts={pinnedPosts} />
        </section>
      )}

      {latestPosts.length > 0 && (
        <section className='simple-home-panel simple-home-latest'>
          <h2 className='simple-home-panel-heading'>NEW</h2>
          <PostLinks posts={latestPosts} />
        </section>
      )}

      <div className='simple-home-grid'>
        {groups.map(({ name, href, posts }) => (
          <section key={href} className='simple-home-panel'>
            <div className='simple-home-panel-heading'>
              <h2>{name}</h2>
              <SmartLink
                href={href}
                prefetch={false}
                aria-label={href === '/archive' ? undefined : `查看全部${name}`}
                className='simple-home-more'
              >
                {href === '/archive' ? '文章归档' : '查看全部'}
                <i className='fa-solid fa-angle-right' aria-hidden='true' />
              </SmartLink>
            </div>
            <PostLinks posts={posts} />
          </section>
        ))}
      </div>
    </main>
  )
}
