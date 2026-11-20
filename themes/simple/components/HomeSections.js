import JournalArticleCard from './JournalArticleCard'
import ArticleRows from './ArticleRows'
import ArticleViewSwitch, { useArticleView } from './ArticleViewSwitch'
import SmartLink from '@/components/SmartLink'
import { useEffect, useId, useRef, useState } from 'react'
import ArrowDownSLineIcon from 'remixicon-react/ArrowDownSLineIcon'
import Pushpin2LineIcon from 'remixicon-react/Pushpin2LineIcon'
import { categoryAppearance } from './CategoryIcon'
import Announcement from './Announcement'
import { noticeHeadline } from '../homepage'

function CategoryRail({ name, posts }) {
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

function HomeCategory({ name, href, posts, textView }) {
  const headingId = useId()
  const [Icon, accent] = categoryAppearance(name)
  return (
    <section
      className={textView ? 'simple-home-panel' : 'journal-rail'}
      style={{ '--category-accent': accent }}
      aria-labelledby={headingId}
    >
      <div
        className={textView ? 'simple-home-panel-heading' : 'journal-row-heading'}
      >
        <h2 id={headingId} className='simple-home-category-title'>
          <span className='simple-home-category-icon' aria-hidden='true'>
            <Icon size={20} />
          </span>
          {name}
        </h2>
        <SmartLink
          href={href}
          prefetch={false}
          className='simple-home-more'
          aria-label={href === '/archive' ? '文章归档' : '查看全部' + name}
        >
          {href === '/archive' ? '文章归档' : '查看全部'}
        </SmartLink>
      </div>
      {textView ? (
        <PostLinks posts={posts} />
      ) : (
        <CategoryRail name={name} posts={posts} />
      )}
    </section>
  )
}

function LatestPosts({ posts, textView, onViewChange }) {
  return (
    <section
      id='latest-articles'
      className='simple-home-panel simple-home-latest'
      aria-labelledby='latest-articles-heading'
    >
      <div className='journal-home-list-heading'>
        <h2 id='latest-articles-heading'>最新文章</h2>
        <ArticleViewSwitch textView={textView} onViewChange={onViewChange} />
      </div>
      <ArticleRows posts={posts} showIcons />
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
  const [textView, changeView] = useArticleView()
  useEffect(() => {
    if (
      textView ||
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
  }, [groups, textView])
  return (
    <main
      ref={home}
      className='simple-home'
      data-view={textView ? 'text' : 'cards'}
      aria-label='文章'
    >
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

      {latestPosts.length > 0 && (
        <LatestPosts
          posts={latestPosts}
          textView={textView}
          onViewChange={changeView}
        />
      )}

      <div className={textView ? 'simple-home-grid' : 'journal-rails'}>
        {groups.map(group => (
          <HomeCategory key={group.href} {...group} textView={textView} />
        ))}
      </div>
    </main>
  )
}
