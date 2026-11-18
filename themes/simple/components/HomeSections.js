import SmartLink from '@/components/SmartLink'
import CalendarIcon from 'remixicon-react/CalendarLineIcon'
import CompassIcon from 'remixicon-react/Compass3LineIcon'
import FeatherIcon from 'remixicon-react/QuillPenLineIcon'
import FolderIcon from 'remixicon-react/Folder2LineIcon'
import SignalIcon from 'remixicon-react/SignalTowerLineIcon'
import StackIcon from 'remixicon-react/StackLineIcon'

const categoryIcons = new Map([
  ['情报', [SignalIcon, '#a183d2']],
  ['汇总', [StackIcon, '#73aa80']],
  ['心得', [FeatherIcon, '#c97e99']],
  ['攻略', [CompassIcon, '#72aadd']],
  ['活动', [CalendarIcon, '#c89c50']]
])

function CategoryTitle({ name }) {
  const [Icon, accent] = categoryIcons.get(name) ?? [FolderIcon, '#7ca4be']
  return (
    <h2 className='simple-home-category-title'>
      <span
        className='simple-home-category-icon'
        style={{ '--category-accent': accent }}
        aria-hidden='true'>
        <Icon size={22} />
      </span>
      {name}
    </h2>
  )
}

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
              <CategoryTitle name={name} />
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
