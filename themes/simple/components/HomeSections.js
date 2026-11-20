import JournalArticleCard from './JournalArticleCard'
import NotionIcon from '@/components/NotionIcon'
import SmartLink from '@/components/SmartLink'
import { useEffect, useId, useRef, useState } from 'react'
import ArrowDownSLineIcon from 'remixicon-react/ArrowDownSLineIcon'
import Pushpin2LineIcon from 'remixicon-react/Pushpin2LineIcon'
import { categoryAppearance } from './CategoryIcon'
import Announcement from './Announcement'
import { noticeHeadline } from '../homepage'

function CategoryRail({ name, href, posts }) {
  const [Icon, accent] = categoryAppearance(name)
  const id = useId()
  const track = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  useEffect(() => {
    const list = track.current
    const edgeTolerance =
      (parseFloat(getComputedStyle(list).paddingInlineStart) || 0) + 1
    function update() {
      const start = list.scrollLeft <= edgeTolerance
      const end =
        list.scrollLeft + list.clientWidth >= list.scrollWidth - edgeTolerance
      setEdges(previous =>
        previous.start === start && previous.end === end
          ? previous
          : { start, end }
      )
    }
    update()
    list.addEventListener('scroll', update, { passive: true })
    const observer =
      typeof ResizeObserver === 'function' && new ResizeObserver(update)
    observer && observer.observe(list)
    return () => {
      list.removeEventListener('scroll', update)
      observer && observer.disconnect()
    }
  }, [posts])

  function slide(direction) {
    const list = track.current
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0
    const step = list.firstElementChild.offsetWidth + gap
    if (!step) return
    const visibleCards = Math.max(
      1,
      Math.floor((list.clientWidth + gap) / step)
    )
    list.scrollBy({
      left: step * visibleCards * direction,
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
        </div>
      </div>
      <div className='journal-rail-viewport'>
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
          {posts.map((post, index) => (
            <li key={post.href} style={{ '--card-index': index }}>
              <JournalArticleCard post={post} category={name} />
            </li>
          ))}
        </ul>
        {!(edges.start && edges.end) && (
          <div className='journal-arrows'>
            <button
              type='button'
              aria-label={name + '，上一张'}
              aria-controls={id}
              disabled={edges.start}
              onClick={() => !edges.start && slide(-1)}
            >
              <span aria-hidden='true'>‹</span>
            </button>
            <button
              type='button'
              aria-label={name + '，下一张'}
              aria-controls={id}
              disabled={edges.end}
              onClick={() => !edges.end && slide(1)}
            >
              <span aria-hidden='true'>›</span>
            </button>
          </div>
        )}
      </div>
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

function LatestPosts({ posts }) {
  const days = new Map()
  for (const post of posts) {
    const day = post.date || ''
    if (!days.has(day)) days.set(day, [])
    days.get(day).push(post)
  }

  return (
    <section
      id='latest-articles'
      className='simple-home-panel simple-home-latest'
      aria-labelledby='latest-articles-heading'
    >
      <h2 id='latest-articles-heading'>最新文章</h2>
      <dl className='journal-updates'>
        {Array.from(days, ([day, articles]) => (
          <div key={day} className='journal-update-day'>
            <dt>
              {day ? (
                <time dateTime={day}>
                  <span>{day.slice(0, 4)}.</span>
                  {day.slice(5).replace('-', '.')}
                </time>
              ) : (
                '日期未记录'
              )}
            </dt>
            <dd>
              <ul className='journal-update-articles'>
                {articles.map(post => (
                  <li key={post.href}>
                    <SmartLink href={post.href} prefetch={false}>
                      <span className='journal-title-icon' aria-hidden='true'>
                        {post.icon ? (
                          <NotionIcon icon={post.icon} />
                        ) : (
                          <i className='far fa-file-alt' />
                        )}
                      </span>
                      <span className='journal-update-title'>{post.title}</span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default function HomeSections({
  groups,
  pinnedPosts,
  latestPosts = [],
  notice
}) {
  const home = useRef(null)
  useEffect(() => {
    if (
      !window.IntersectionObserver ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const rows = Array.from(home.current.querySelectorAll('.journal-rail'))
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.dataset.reveal = 'in'
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.06 }
    )
    for (const row of rows) {
      row.dataset.reveal =
        row.getBoundingClientRect().top >= window.innerHeight ? 'pending' : 'in'
      if (row.dataset.reveal === 'pending') observer.observe(row)
    }
    return () => {
      observer.disconnect()
      rows.forEach(row => delete row.dataset.reveal)
    }
  }, [groups])
  return (
    <main ref={home} className='simple-home' aria-label='文章'>
      {notice?.blockMap && !notice.password && (
        <details className='journal-notice'>
          <summary>
            <span className='journal-notice-pin' aria-hidden='true'>
              <Pushpin2LineIcon size={22} />
            </span>
            <span className='journal-notice-copy'>
              <span className='journal-notice-label'>公告板</span>
              <span className='journal-notice-headline'>
                {noticeHeadline(notice)}
              </span>
              <span className='journal-notice-close'>收起公告</span>
            </span>
            <span className='journal-notice-chevron' aria-hidden='true'>
              <ArrowDownSLineIcon size={20} />
            </span>
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

      {latestPosts.length > 0 && <LatestPosts posts={latestPosts} />}

      <div className='journal-rails'>
        {groups.map(group => (
          <CategoryRail key={group.href} {...group} />
        ))}
      </div>
    </main>
  )
}
