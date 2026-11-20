import { useState } from 'react'
import SmartLink from '@/components/SmartLink'
import { simpleCategoryHref, sortSimpleCategories } from '../homepage'

export default function TopicIndex({
  categoryOptions,
  tagOptions = [],
  topicPosts
}) {
  const [category, setCategory] = useState('')
  const [tag, setTag] = useState('')
  const categories = sortSimpleCategories(categoryOptions)
  const posts = (topicPosts || []).filter(
    post => !category || post.category === category
  )
  const counts = new Map()
  if (category) {
    for (const post of posts) {
      for (const name of post.tags)
        counts.set(name, (counts.get(name) || 0) + 1)
    }
  }
  const matches = tag ? posts.filter(post => post.tags.includes(tag)) : posts

  return (
    <main className='journal-topics'>
      <h1>分类与标签</h1>
      <div className='journal-topic-categories' aria-label='按分类浏览'>
        {topicPosts && (
          <button
            aria-pressed={!category}
            onClick={() => {
              setCategory('')
              setTag('')
            }}
          >
            全部 <sup>{topicPosts.length}</sup>
          </button>
        )}
        {categories.map(({ name, count }) =>
          topicPosts ? (
            <button
              key={name}
              aria-pressed={category === name}
              onClick={() => {
                setCategory(name)
                setTag('')
              }}
            >
              {name}
              <sup>{count}</sup>
            </button>
          ) : (
            <SmartLink
              key={name}
              href={simpleCategoryHref(name)}
              prefetch={false}
            >
              {name}
              <sup>{count}</sup>
            </SmartLink>
          )
        )}
      </div>
      <section className='journal-tags'>
        <h2>标签</h2>
        <div>
          {(tagOptions || []).map(({ name, count, id }) => {
            const visibleCount = category ? counts.get(name) : count
            if (!visibleCount) return null
            return topicPosts ? (
              <button
                key={id || name}
                aria-pressed={tag === name}
                onClick={() => setTag(tag === name ? '' : name)}
              >
                #{name}
                <sup>{visibleCount}</sup>
              </button>
            ) : (
              <SmartLink
                key={id || name}
                href={'/tag/' + encodeURIComponent(name)}
                prefetch={false}
              >
                #{name}
                <sup>{visibleCount}</sup>
              </SmartLink>
            )
          })}
        </div>
      </section>
      {(category || tag) && (
        <section className='journal-topic-results'>
          <h2>
            {[category, tag && '#' + tag].filter(Boolean).join(' · ')}{' '}
            <small>{matches.length} 篇</small>
          </h2>
          <ul className='simple-home-posts'>
            {matches.map(post => (
              <li key={post.href}>
                <SmartLink href={post.href} prefetch={false}>
                  <span>{post.title}</span>
                  <time dateTime={post.date}>{post.date}</time>
                </SmartLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
