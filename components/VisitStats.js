import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { siteConfig } from '@/lib/config'

const VisitStatsContext = createContext({ status: 'loading', stats: null })
const VISITOR_KEY = 'noginogi:visitor:v1'
const pending = new Map()
let memoryVisitorId

function getVisitorId() {
  if (!memoryVisitorId) {
    try {
      memoryVisitorId = localStorage.getItem(VISITOR_KEY)
    } catch {
      /* 浏览器禁止本地存储时，本次会话仍可正常统计。 */
    }
    if (
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
        memoryVisitorId || ''
      )
    ) {
      memoryVisitorId = crypto.randomUUID()
      try {
        localStorage.setItem(VISITOR_KEY, memoryVisitorId)
      } catch {
        /* 使用会话标识 */
      }
    }
  }
  return memoryVisitorId
}

function fetchStats(path, postId) {
  const key = `${path}:${postId || ''}`
  if (pending.has(key)) return pending.get(key)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)
  const promise = fetch('/api/visit-stats', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, postId, visitorId: getVisitorId() }),
    signal: controller.signal
  })
    .then(async response => {
      if (!response.ok) throw new Error('statistics_unavailable')
      const stats = await response.json()
      const fields = [
        'siteViews',
        'siteVisitors',
        'todayViews',
        'todayVisitors'
      ]
      if (postId) fields.push('articleViews')
      if (
        fields.some(
          field => !Number.isSafeInteger(stats[field]) || stats[field] < 0
        )
      ) {
        throw new Error('statistics_unavailable')
      }
      return stats
    })
    .finally(() => {
      clearTimeout(timeout)
      pending.delete(key)
    })
  pending.set(key, promise)
  return promise
}

export function VisitStatsProvider({ post, children }) {
  const router = useRouter()
  const enabled = siteConfig('ANALYTICS_SELF_HOSTED_ENABLE', false)
  const path =
    (router.asPath || '/').split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  const postId = post?.type === 'Post' ? post.id : null
  const key = `${path}:${postId || ''}`
  const [state, setState] = useState({
    key: '',
    status: 'loading',
    stats: null
  })

  useEffect(() => {
    if (!enabled || !router.isReady) return
    let cancelled = false
    setState({ key, status: 'loading', stats: null })
    fetchStats(path, postId).then(
      stats => {
        if (!cancelled) setState({ key, status: 'ready', stats })
      },
      () => {
        if (!cancelled) setState({ key, status: 'error', stats: null })
      }
    )
    return () => {
      cancelled = true
    }
  }, [enabled, router.isReady, path, postId, key])

  const value = state.key === key ? state : { status: 'loading', stats: null }
  return (
    <VisitStatsContext.Provider value={value}>
      {children}
    </VisitStatsContext.Provider>
  )
}

function Count({ value, status }) {
  return (
    <span>
      {status === 'ready' && Number.isSafeInteger(value)
        ? value.toLocaleString('zh-CN')
        : status === 'loading'
          ? '…'
          : '暂不可用'}
    </span>
  )
}

export function ArticleViewCount() {
  const { status, stats } = useContext(VisitStatsContext)
  return (
    <span
      className='font-light mr-2 whitespace-nowrap'
      data-testid='article-view-count'
      aria-live='polite'
    >
      <i className='mr-1 fas fa-eye' aria-hidden='true' />
      {status === 'error' ? (
        '浏览次数暂不可用'
      ) : (
        <>
          浏览 <Count value={stats?.articleViews} status={status} /> 次
        </>
      )}
    </span>
  )
}

export function SiteVisitStats() {
  const { status, stats } = useContext(VisitStatsContext)
  if (!siteConfig('ANALYTICS_SELF_HOSTED_ENABLE', false)) return null
  if (status !== 'ready') {
    return (
      <div
        className='text-center text-xs pt-3'
        data-testid='site-visit-stats'
        aria-live='polite'
      >
        访客统计：{status === 'loading' ? '加载中…' : '暂不可用'}
      </div>
    )
  }
  return (
    <div
      className='text-center text-xs pt-3 flex flex-wrap justify-center gap-x-4 gap-y-1'
      data-testid='site-visit-stats'
      aria-live='polite'
    >
      <span>
        今日访客 <Count value={stats.todayVisitors} status={status} />
      </span>
      <span>
        累计访客 <Count value={stats.siteVisitors} status={status} />
      </span>
      <span>
        总浏览 <Count value={stats.siteViews} status={status} />
      </span>
    </div>
  )
}
