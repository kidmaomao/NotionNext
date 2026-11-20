import SmartLink from '@/components/SmartLink'
import { useEffect, useId, useRef, useState } from 'react'
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
