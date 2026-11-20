import { siteConfig } from '@/lib/config'
import { useEffect, useRef, useState } from 'react'

const scripts = new Map()

function getTwikoo(url) {
  if (window.twikoo?.init) return Promise.resolve(window.twikoo)
  if (!url) return Promise.reject(new Error('Missing Twikoo script'))
  if (scripts.has(url)) return scripts.get(url)
  const ready = new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find(
      script => script.src === url
    )
    const script = existing || document.createElement('script')
    function finish() {
      clearTimeout(timeout)
      script.removeEventListener('load', finish)
      script.removeEventListener('error', finish)
      if (window.twikoo?.init) resolve(window.twikoo)
      else {
        script.remove()
        reject(new Error('Twikoo is unavailable'))
      }
    }
    const timeout = setTimeout(finish, 15000)
    script.addEventListener('load', finish)
    script.addEventListener('error', finish)
    if (!existing) {
      script.src = url
      document.head.appendChild(script)
    }
  }).catch(error => {
    scripts.delete(url)
    throw error
  })
  scripts.set(url, ready)
  return ready
}

export default function Twikoo({ threadPath, containerId }) {
  const envId = siteConfig('COMMENT_TWIKOO_ENV_ID')
  const configuredId = siteConfig('COMMENT_TWIKOO_ELEMENT_ID', '#twikoo')
  const mountId = containerId || configuredId.replace(/^#/, '')
  const url = siteConfig('COMMENT_TWIKOO_CDN_URL')
  const lang = siteConfig('LANG')
  const path =
    threadPath ||
    (typeof window !== 'undefined' ? window.location.pathname : '')
  const host = useRef(null)
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const wrapper = host.current
    const mount = document.createElement('div')
    mount.id = mountId
    wrapper.replaceChildren(mount)
    let cancelled = false
    let instance
    setStatus('loading')
    getTwikoo(url)
      .then(async sdk => {
        if (cancelled) return
        instance = await sdk.init({
          envId,
          el: '#' + mountId,
          lang,
          ...(path ? { path } : {})
        })
        if (cancelled) instance?.$destroy?.()
        else setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
      instance?.$destroy?.()
      wrapper.replaceChildren()
    }
  }, [envId, mountId, lang, url, path, attempt])

  return (
    <div>
      {status === 'loading' && <p role='status'>正在载入评论…</p>}
      {status === 'error' && (
        <p role='status'>
          评论暂时未能载入。{' '}
          <button type='button' onClick={() => setAttempt(n => n + 1)}>
            重试
          </button>
        </p>
      )}
      <div ref={host} />
    </div>
  )
}
