import SmartLink from '@/components/SmartLink'
import { useEffect, useId, useRef, useState } from 'react'
import CalendarIcon from 'remixicon-react/CalendarLineIcon'
import CompassIcon from 'remixicon-react/Compass3LineIcon'
import FeatherIcon from 'remixicon-react/QuillPenLineIcon'
import FolderIcon from 'remixicon-react/Folder2LineIcon'
import ShoppingBagIcon from 'remixicon-react/ShoppingBagLineIcon'
import SignalIcon from 'remixicon-react/SignalTowerLineIcon'
import StackIcon from 'remixicon-react/StackLineIcon'
import Announcement from './Announcement'
import { noticeHeadline } from '../homepage'

const categoryIcons = new Map([
  ['情报', [SignalIcon, '#a183d2']],
  ['汇总', [StackIcon, '#73aa80']],
  ['心得', [FeatherIcon, '#c97e99']],
  ['攻略', [CompassIcon, '#72aadd']],
  ['活动', [CalendarIcon, '#c89c50']],
  ['消费', [ShoppingBagIcon, '#d68b68']]
])

function CategoryRail({ name, href, posts }) {
  const [Icon, accent] = categoryIcons.get(name) ?? [FolderIcon, '#7ca4be']
  const id = useId()
  const track = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  useEffect(() => {
    const list = track.current
    function update() {
      const start = list.scrollLeft < 2
      const end = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2
      setEdges(previous =>
        previous.start === start && previous.end === end
          ? previous
          : { start, end }
      )
    }
    update()
    list.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(list)
    return () => {
      list.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [posts])

  function slide(direction) {
    const list = track.current
    const step =
      list.firstElementChild.offsetWidth +
      parseFloat(getComputedStyle(list).columnGap)
    list.scrollBy({
      left: step * direction,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth'
    })
  }

  return (
    <section
      className='journal-rail'
      style={{ '--category-accent': accent }}
      aria-labelledby={id + '-title'}
    >
      <div className='journal-row-heading'>
        <h2 id={id + '-title'} className='simple-home-category-title'>
          <span className='simple-home-category-icon' aria-hidden='true'>
            <Icon size={20} />
          </span>
          {name}
        </h2>
        <div className='journal-rail-tools'>
          <SmartLink
            href={href}
            prefetch={false}
            className='simple-home-more'
            aria-label={href === '/archive' ? '文章归档' : '查看全部' + name}
          >
            {href === '/archive' ? '文章归档' : '查看全部'}
          </SmartLink>
          {!(edges.start && edges.end) && (
            <div className='journal-arrows'>
              <button
                type='button'
                aria-label={name + '，上一张'}
                aria-controls={id}
                aria-disabled={edges.start}
                onClick={() => !edges.start && slide(-1)}
              >
                ‹
              </button>
              <button
                type='button'
                aria-label={name + '，下一张'}
                aria-controls={id}
                aria-disabled={edges.end}
                onClick={() => !edges.end && slide(1)}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
      <ul
        ref={track}
        id={id}
        tabIndex={0}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            slide(event.key === 'ArrowLeft' ? -1 : 1)
          }
        }}
        aria-label={name + '文章'}
        className='journal-track'
      >
        {posts.map(post => (
          <li key={post.href}>
            <SmartLink
              href={post.href}
              prefetch={false}
              className='journal-card'
            >
              <span className='journal-art'>
                <Icon aria-hidden='true' className='journal-watermark' />
                {post.cover && (
                  <img
                    key={post.cover}
                    src={post.cover}
                    alt=''
                    loading='lazy'
                    decoding='async'
                    onError={event => {
                      event.currentTarget.hidden = true
                    }}
                  />
                )}
                <span className='journal-card-title'>{post.title}</span>
              </span>
              <span className='journal-card-meta'>
                {post.date && (
                  <time dateTime={post.date}>
                    {post.date.replace(/-/g, '.')}
                  </time>
                )}
                {!!post.tags?.length && <span>{post.tags.join(' · ')}</span>}
              </span>
            </SmartLink>
          </li>
        ))}
      </ul>
    </section>
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
  latestPosts = [],
  notice
}) {
  return (
    <main className='simple-home' aria-label='文章'>
      {notice?.blockMap && !notice.password && (
        <details className='journal-notice'>
          <summary>
            <span>
              <i aria-hidden='true' className='fas fa-bullhorn' /> 公告板
            </span>
            <span className='journal-notice-headline'>
              {noticeHeadline(notice)}
            </span>
            <span className='journal-disclosure'>展开公告</span>
          </summary>
          <Announcement post={notice} />
        </details>
      )}
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
          <div className='simple-home-panel-heading'>
            <h2>最新文章</h2>
            <SmartLink
              href='/archive'
              prefetch={false}
              className='journal-time-link'
            >
              按时间看全部文章 <span aria-hidden='true'>→</span>
            </SmartLink>
          </div>
          <PostLinks posts={latestPosts} />
        </section>
      )}

      <div className='journal-rails'>
        {groups.map(group => (
          <CategoryRail key={group.href} {...group} />
        ))}
      </div>
    </main>
  )
}
