import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { siteConfig } from '@/lib/config'
import styles from '@/styles/VisitStats.module.css'

const VisitStatsContext = createContext({ status: 'loading', stats: null })
const VISITOR_KEY = 'noginogi:visitor:v1'
const CACHE_PREFIX = 'noginogi:visit-stats-cache:v1:'
const CACHE_TTL = 5 * 60 * 1000
const pending = new Map()
let memoryVisitorId

function validStats(stats, postId) {
  if (!stats || typeof stats !== 'object') return false
  const fields = ['siteViews', 'siteVisitors', 'todayViews', 'todayVisitors']
  if (postId) fields.push('articleViews')
  return fields.every(
    field => Number.isSafeInteger(stats[field]) && stats[field] >= 0
  )
}

function shanghaiDay(now) {
  return new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function readCachedStats(key, postId) {
  try {
    const entry = JSON.parse(sessionStorage.getItem(CACHE_PREFIX + key))
    const now = Date.now()
    if (
      entry &&
      Number.isFinite(entry.savedAt) &&
      now >= entry.savedAt &&
      now - entry.savedAt < CACHE_TTL &&
      entry.day === shanghaiDay(now) &&
      validStats(entry.stats, postId)
    )
      return entry.stats
  } catch {
    /* 存储被禁用或缓存损坏时，照常向服务端查询。 */
  }
  return null
}

function saveCachedStats(key, stats) {
  try {
    const now = Date.now()
    sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({
        savedAt: now,
        day: stats.day || shanghaiDay(now),
        stats
      })
    )
  } catch {
    /* 缓存只改善显示速度，不参与计数或访客去重。 */
  }
}

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

function fetchStats(path, postId, readOnly = false) {
  const key = `${readOnly ? 'read' : 'write'}:${path}:${postId || ''}`
  if (pending.has(key)) return pending.get(key)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)
  const url = readOnly
    ? `/api/visit-stats?postId=${encodeURIComponent(postId || '')}`
    : '/api/visit-stats'
  const promise = fetch(url, {
    method: readOnly ? 'GET' : 'POST',
    credentials: 'same-origin',
    ...(readOnly
      ? {}
      : {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, postId, visitorId: getVisitorId() })
        }),
    signal: controller.signal
  })
    .then(async response => {
      if (!response.ok) throw new Error('statistics_unavailable')
      const stats = await response.json()
      if (!validStats(stats, postId)) {
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
    let receivedLatest = false
    // 缓存仅用于先显示最近的真实数字；每次进入页面仍请求最新计数。
    const cached = readCachedStats(key, postId)
    setState({ key, status: cached ? 'ready' : 'loading', stats: cached })
    // 首次打开也先读取已保存的数字；只读请求不增加浏览次数。
    if (!cached)
      fetchStats(path, postId, true).then(
        stats => {
          if (!cancelled && !receivedLatest) {
            saveCachedStats(key, stats)
            setState({ key, status: 'ready', stats })
          }
        },
        () => {
          /* 只读请求失败时等待计数请求，不覆盖后续真实结果。 */
        }
      )
    fetchStats(path, postId).then(
      stats => {
        receivedLatest = true
        saveCachedStats(key, stats)
        if (!cancelled) setState({ key, status: 'ready', stats })
      },
      () => {
        receivedLatest = true
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

function FlipNumber({ value }) {
  const formatted = value.toLocaleString('zh-CN')
  const lastValue = useRef(formatted)
  const sequence = useRef(0)
  const [flip, setFlip] = useState({
    previous: formatted,
    current: formatted,
    active: false,
    sequence: 0
  })
  useEffect(() => {
    const previous = lastValue.current
    lastValue.current = formatted
    if (previous === formatted) return
    setFlip({
      previous,
      current: formatted,
      active: true,
      sequence: ++sequence.current
    })
    const timer = setTimeout(
      () => setFlip(state => ({ ...state, active: false })),
      520
    )
    return () => clearTimeout(timer)
  }, [formatted])

  const length = Math.max(flip.previous.length, flip.current.length)
  const previous = flip.previous.padStart(length, ' ')
  const current = flip.current.padStart(length, ' ')
  return (
    <span className={styles.number}>
      <span className='sr-only'>{formatted}</span>
      <span className={styles.digits} aria-hidden='true'>
        {Array.from(current, (digit, index) => {
          const old = previous[index]
          const changed = flip.active && old !== digit
          return (
            <span
              key={`${flip.sequence}:${index}`}
              className={digit === ',' ? styles.separator : styles.digit}
              data-flipping={changed ? 'true' : undefined}
            >
              {changed ? (
                <>
                  <span className={`${styles.half} ${styles.top}`}>
                    <span>{digit}</span>
                  </span>
                  <span
                    className={`${styles.half} ${styles.bottom} ${styles.oldBottom}`}
                  >
                    <span>{old}</span>
                  </span>
                  <span
                    className={`${styles.half} ${styles.top} ${styles.oldTop}`}
                  >
                    <span>{old}</span>
                  </span>
                  <span
                    className={`${styles.half} ${styles.bottom} ${styles.newBottom}`}
                  >
                    <span>{digit}</span>
                  </span>
                </>
              ) : (
                digit
              )}
            </span>
          )
        })}
      </span>
    </span>
  )
}

function Count({ value, status }) {
  return (
    <span>
      {status === 'ready' && Number.isSafeInteger(value) ? (
        <FlipNumber value={value} />
      ) : status === 'loading' ? (
        '…'
      ) : (
        '暂不可用'
      )}
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
