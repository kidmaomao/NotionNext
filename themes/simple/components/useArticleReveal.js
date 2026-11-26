import { useEffect } from 'react'

/** Reveal only off-screen items on approach; content remains visible without JS. */
export default function useArticleReveal(
  container,
  selector,
  enabled,
  revision
) {
  useEffect(() => {
    if (
      !enabled ||
      !container.current ||
      !window.IntersectionObserver ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const items = Array.from(container.current.querySelectorAll(selector))
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
    for (const item of items) {
      item.dataset.reveal =
        item.getBoundingClientRect().top >= window.innerHeight
          ? 'pending'
          : 'in'
      if (item.dataset.reveal === 'pending') observer.observe(item)
    }
    return () => {
      observer.disconnect()
      items.forEach(item => delete item.dataset.reveal)
    }
  }, [container, selector, enabled, revision])
}
