import { useEffect } from 'react'
import { sourceTagFromSearch } from '@/lib/analytics/journeys'

const VISITOR_KEY = 'noginogi:visitor:v1'
const SESSION_KEY = 'noginogi:analytics-session:v1'
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
function identities() {
  // 使用现有统计的匿名访客标识；本地存储禁用时放弃行为记录。
  let visitorId = localStorage.getItem(VISITOR_KEY)
  if (!UUID.test(visitorId || '')) {
    visitorId = crypto.randomUUID()
    localStorage.setItem(VISITOR_KEY, visitorId)
  }
  let session
  try {
    session = JSON.parse(sessionStorage.getItem(SESSION_KEY))
  } catch {
    /* 新会话 */
  }
  if (!UUID.test(session?.id || '') || Date.now() - session.lastAt > 1800000)
    session = { id: crypto.randomUUID() }
  session.lastAt = Date.now()
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { visitorId, sessionId: session.id }
}

export default function VisitBehaviorTracker({ path, postId, title }) {
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_VISIT_ANALYTICS_ENABLE !== 'true' ||
      navigator.doNotTrack === '1' ||
      navigator.globalPrivacyControl ||
      /^\/(admin|privacy)(\/|$)/.test(path)
    )
      return
    let ids
    try {
      ids = identities()
    } catch {
      return
    }
    const event = {
      ...ids,
      eventId: crypto.randomUUID(),
      path,
      postId,
      title: title || document.title,
      referrer: document.referrer,
      sourceTag: sourceTagFromSearch(location.search),
      activeSeconds: 0,
      scrollPercent: 0,
      clicks: 0,
      rapidClicks: 0,
      leftPage: false,
      lastLink: ''
    }
    let activeMs = 0
    let lastAt = Date.now()
    let visible = document.visibilityState === 'visible'
    let started = false
    let pending = false
    let dirty = true
    let lastSignature = ''
    let clickTrail = []
    const accrue = () => {
      const now = Date.now()
      if (visible) activeMs += Math.max(0, Math.min(now - lastAt, 35000))
      lastAt = now
      event.activeSeconds = Math.min(14400, Math.floor(activeMs / 1000))
    }
    const progress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight
      const percent =
        height > 0 ? Math.round((window.scrollY / height) * 100) : 0
      event.scrollPercent = Math.min(
        100,
        Math.max(event.scrollPercent, percent)
      )
      dirty = true
    }
    const send = (beacon = false) => {
      accrue()
      try {
        const session = JSON.parse(sessionStorage.getItem(SESSION_KEY))
        if (session?.id === ids.sessionId) {
          session.lastAt = Date.now()
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
        }
      } catch {
        /* 会话存储失效时继续当前记录。 */
      }
      const signature = `${event.activeSeconds}:${event.scrollPercent}:${event.clicks}:${event.rapidClicks}:${event.leftPage}`
      if (!dirty && signature === lastSignature) return
      if (pending && !beacon) return
      // 初次请求完成后再发送心跳，避免到达顺序改变访问时间。
      if (beacon && !started) return
      lastSignature = signature
      dirty = false
      if (beacon && navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/visit-events',
          new Blob([JSON.stringify(event)], { type: 'application/json' })
        )
        return
      }
      pending = true
      fetch('/api/visit-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(event),
        keepalive: true
      })
        .then(response => {
          started = response.ok
          if (!response.ok) dirty = true
        })
        .catch(() => {
          dirty = true
        })
        .finally(() => {
          pending = false
        })
    }
    const visibility = () => {
      accrue()
      visible = document.visibilityState === 'visible'
      if (!visible) send(true)
    }
    const click = e => {
      const now = Date.now()
      // 仅在内存中比较点击位置；不上传坐标、元素文字或输入内容。
      clickTrail = clickTrail.filter(
        point =>
          now - point.at <= 2000 &&
          Math.hypot(point.x - e.clientX, point.y - e.clientY) <= 40
      )
      // 键盘触发和自动触发的点击不参与连续点击判断。
      if (e.isTrusted && e.detail > 0) {
        clickTrail.push({ at: now, x: e.clientX, y: e.clientY })
        if (clickTrail.length >= 5) {
          event.rapidClicks = Math.min(100, event.rapidClicks + 1)
          clickTrail = []
          dirty = true
        }
      }
      const link =
        e.target instanceof Element ? e.target.closest('a[href]') : null
      if (!link) return
      try {
        const url = new URL(link.href, location.origin)
        if (!['http:', 'https:'].includes(url.protocol)) return
        event.lastLink =
          `${url.origin === location.origin ? '' : url.hostname}${url.pathname}`.slice(
            0,
            256
          )
        event.clicks = Math.min(500, event.clicks + 1)
        dirty = true
      } catch {
        /* 无效链接 */
      }
    }
    const pageHide = () => {
      event.leftPage = true
      send(true)
    }
    progress()
    send()
    const timer = setInterval(() => send(), 30000)
    window.addEventListener('scroll', progress, { passive: true })
    document.addEventListener('click', click)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('pagehide', pageHide)
    return () => {
      pageHide()
      clearInterval(timer)
      window.removeEventListener('scroll', progress)
      document.removeEventListener('click', click)
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('pagehide', pageHide)
    }
  }, [path, postId, title])
  return null
}
