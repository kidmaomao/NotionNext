import JournalArticleCard from './JournalArticleCard'
import ArticleRows from './ArticleRows'
import ArticleViewSwitch, { useArticleView } from './ArticleViewSwitch'
import useArticleReveal from './useArticleReveal'
import { useEffect, useMemo, useRef, useState } from 'react'
import SmartLink from '@/components/SmartLink'
import { simpleCategoryHref, sortSimpleCategories } from '../homepage'
import { categoryAppearance } from './CategoryIcon'

function TagLane({ options, selected, choose, reverse }) {
  const lane = useRef(null)
  const original = useRef(null)
  const [cycle, setCycle] = useState({ width: 0, copies: 0 })
  useEffect(() => {
    const measure = () => {
      const group = original.current
      const style = getComputedStyle(group)
      const gap = parseFloat(style.columnGap) || 0
      const natural =
        [...group.children].reduce(
          (n, el) => n + el.getBoundingClientRect().width,
          0
        ) +
        gap * Math.max(0, group.childElementCount - 1) +
        (parseFloat(style.paddingInlineStart) || 0) +
        (parseFloat(style.paddingInlineEnd) || 0)
      const copies =
        natural > 0 && group.childElementCount >= 3
          ? Math.ceil(lane.current.clientWidth / natural)
          : 0
      setCycle(previous =>
        previous.width === natural && previous.copies === copies
          ? previous
          : { width: natural, copies }
      )
    }
    measure()
    if (typeof ResizeObserver !== 'function') return
    const observer = new ResizeObserver(measure)
    observer.observe(lane.current)
    observer.observe(original.current)
    return () => observer.disconnect()
  }, [options])
  function segment(copy) {
    return (
      <div
        key={copy}
        className='journal-tag-segment'
        ref={copy ? undefined : original}
        aria-hidden={Boolean(copy) || undefined}
      >
        {options.map(({ name, count }) =>
          choose ? (
            <button
              key={name}
              type='button'
              tabIndex={copy ? -1 : undefined}
              aria-pressed={selected === name}
              onClick={() => choose(name)}
            >
              #{name}
              <sup>{count}</sup>
            </button>
          ) : (
            <SmartLink
              key={name}
              tabIndex={copy ? -1 : undefined}
              prefetch={false}
              href={'/tag/' + encodeURIComponent(name)}
            >
              #{name}
              <sup>{count}</sup>
            </SmartLink>
          )
        )}
      </div>
    )
  }
  return (
    <div
      className='journal-tag-lane'
      ref={lane}
      data-roll={cycle.copies > 0 || undefined}
    >
      <div
        className='journal-tag-track'
        style={{
          '--tag-duration': Math.max(24, cycle.width / 23) + 's',
          '--tag-shift': -cycle.width + 'px',
          animationDirection: reverse ? 'reverse' : 'normal'
        }}
      >
        {Array.from({ length: cycle.copies + 1 }, (_, i) => segment(i))}
      </div>
    </div>
  )
}

function TagCloud({ options, selected, choose }) {
  const section = useRef(null)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    let inView = true
    const update = () => setVisible(inView && !document.hidden)
    const observer =
      typeof IntersectionObserver === 'function' &&
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting
        update()
      })
    if (observer) observer.observe(section.current)
    else update()
    document.addEventListener('visibilitychange', update)
    return () => {
      if (observer) observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  const rows = Array.from({ length: Math.min(3, options.length) }, () => [])
  options.forEach((option, index) => rows[index % rows.length].push(option))
  return (
    <section
      ref={section}
      className='journal-tag-cloud'
      data-still={paused || undefined}
      data-visible={visible || undefined}
    >
      <header>
        <h2>标签</h2>
        {options.length > 0 && (
          <button
            type='button'
            className='journal-motion-toggle'
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? '继续流动' : '暂停流动'}
          </button>
        )}
      </header>
      {rows.map((row, index) => (
        <TagLane
          key={index}
          options={row}
          selected={selected}
          choose={choose}
          reverse={index % 2 === 1}
        />
      ))}
      {!rows.length && <p>这个分类还没有标签。</p>}
    </section>
  )
}

export default function TopicIndex({
  categoryOptions,
  tagOptions = [],
  topicPosts,
  category: initialCategory = '',
  tag: initialTag = ''
}) {
  const [category, setCategory] = useState(initialCategory)
  const [tag, setTag] = useState(initialTag)
  const [textView, changeView] = useArticleView()
  const results = useRef(null)
  const revealRevision = useMemo(() => ({ topicPosts, category, tag }), [topicPosts, category, tag])
  useArticleReveal(results, '.journal-topic-grid > li', !textView, revealRevision)
  useEffect(() => {
    setCategory(initialCategory)
    setTag(initialTag)
  }, [initialCategory, initialTag])
  const categories = sortSimpleCategories(categoryOptions)
  const posts = (topicPosts || []).filter(
    post => !category || post.category === category
  )
  const counts = new Map()
  if (category) {
    for (const post of posts)
      for (const name of post.tags)
        counts.set(name, (counts.get(name) || 0) + 1)
  }
  const options = (tagOptions || [])
    .map(option => ({
      ...option,
      count: category ? counts.get(option.name) : option.count
    }))
    .filter(option => option.count)
  const matches = tag ? posts.filter(post => post.tags.includes(tag)) : posts
  const tabs = topicPosts
    ? [{ name: '所有', count: topicPosts.length }, ...categories]
    : categories
  return (
    <main className='journal-topics'>
      <header className='journal-page-heading'>
        <h1>文章标签</h1>
        {topicPosts && <p>共 {topicPosts.length} 篇文章</p>}
      </header>
      <div
        className='journal-topic-categories'
        role='group'
        aria-label='按分类浏览'
      >
        {tabs.map(({ name, count }) => {
          const [Icon] = categoryAppearance(name)
          const value = name === '所有' ? '' : name
          const label = (
            <>
              <Icon size={20} aria-hidden='true' />
              <span>{name}</span>
              <sup>{count}</sup>
            </>
          )
          return topicPosts ? (
            <button
              type='button'
              key={name}
              aria-pressed={category === value}
              onClick={() => {
                setCategory(value)
                setTag('')
              }}
            >
              {label}
            </button>
          ) : (
            <SmartLink
              key={name}
              href={simpleCategoryHref(name)}
              prefetch={false}
            >
              {label}
            </SmartLink>
          )
        })}
      </div>
      <TagCloud
        options={options}
        selected={tag}
        choose={topicPosts ? name => setTag(tag === name ? '' : name) : null}
      />
      {topicPosts && (
        <section className='journal-topic-results' ref={results}>
          <div className='journal-home-list-heading'>
            <h2>
              {[category, tag && '#' + tag].filter(Boolean).join(' · ') ||
                '所有文章'}{' '}
              <small>{matches.length} 篇 · 按发文时间</small>
            </h2>
            <ArticleViewSwitch textView={textView} onViewChange={changeView} />
          </div>
          {textView ? (
            <ArticleRows posts={matches} />
          ) : (
            <ul className='journal-topic-grid'>
              {matches.map((post, index) => (
                <li key={post.href} style={{ '--card-index': index % 4 }}>
                  <JournalArticleCard post={post} />
                </li>
              ))}
            </ul>
          )}
          {!matches.length && <p>暂时没有符合条件的文章。</p>}
        </section>
      )}
    </main>
  )
}
