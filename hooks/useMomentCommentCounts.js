import { useEffect, useReducer, useState } from 'react'
import { siteConfig } from '@/lib/config'

// Use the same paths as the open discussion, including replies.
async function readCounts(notes, provider, envId, cdn, signal) {
  if (provider === 'twikoo') {
    const { getTwikoo } = await import('@/components/Twikoo')
    const sdk = await getTwikoo(cdn)
    if (signal.aborted) return []
    const rows = await sdk.getCommentsCount({
      envId,
      urls: notes.map(note => note.href),
      includeReply: true
    })
    const byPath = new Map(rows.map(row => [row.url, row.count]))
    return notes.map(note => [note.anchor, byPath.get(note.href) ?? 0])
  }
  const ids = notes.map(note => note.id).join(',')
  const response = await fetch(
    '/api/notion-comments?countFor=' + encodeURIComponent(ids),
    { signal }
  )
  if (!response.ok) throw new Error('Comment count unavailable')
  const counts = await response.json()
  return notes.map(note => [note.anchor, counts[note.id] ?? null])
}

export default function useMomentCommentCounts(moments, provider, config) {
  const [counts, setCounts] = useState({})
  const [revision, refresh] = useReducer(value => value + 1, 0)
  const envId = siteConfig('COMMENT_TWIKOO_ENV_ID', '', config)
  const cdn = siteConfig('COMMENT_TWIKOO_CDN_URL', '', config)
  useEffect(() => {
    if (!provider) return
    const notes = moments.filter(note => note.comments)
    const controller = new AbortController()
    async function load() {
      for (let i = 0; i < notes.length && !controller.signal.aborted; i += 30) {
        const batch = notes.slice(i, i + 30)
        try {
          const entries = await readCounts(
            batch,
            provider,
            envId,
            cdn,
            controller.signal
          )
          if (!controller.signal.aborted) {
            setCounts(old => ({ ...old, ...Object.fromEntries(entries) }))
          }
        } catch {
          if (!controller.signal.aborted)
            setCounts(old => ({
              ...Object.fromEntries(batch.map(note => [note.anchor, null])),
              ...old
            }))
        }
      }
    }
    load()
    return () => controller.abort()
  }, [moments, provider, envId, cdn, revision])
  return [counts, refresh]
}
