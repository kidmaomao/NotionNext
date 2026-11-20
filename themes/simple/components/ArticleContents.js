import { useEffect, useId, useRef, useState } from 'react'
import { normalizePostId } from '@/lib/utils/publicPost'
import ListIcon from 'remixicon-react/ListUnorderedIcon'

export default function ArticleContents({ items }) {
  const id = useId()
  const shell = useRef(null)
  const trigger = useRef(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  useEffect(() => {
    if (!open) return
    const headings = items
      .map(item => document.getElementById(normalizePostId(item.id)))
      .filter(Boolean)
    let frame = 0
    function update() {
      frame = 0
      let current = headings[0]
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > 100) break
        current = heading
      }
      setActive(current?.id || '')
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    function outside(event) {
      if (!shell.current?.contains(event.target)) setOpen(false)
    }
    function escape(event) {
      if (event.key !== 'Escape') return
      setOpen(false)
      if (shell.current?.contains(document.activeElement))
        trigger.current?.focus()
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open, items])
  return (
    <aside
      className='journal-toc-dock'
      ref={shell}
      onPointerEnter={e => {
        if (e.pointerType === 'mouse') setOpen(true)
      }}
      onPointerLeave={e => {
        if (
          e.pointerType === 'mouse' &&
          !shell.current.contains(document.activeElement)
        )
          setOpen(false)
      }}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={trigger}
        type='button'
        aria-expanded={open}
        aria-controls={id}
        onClick={e =>
          setOpen(current =>
            e.detail &&
            window.matchMedia('(hover:hover) and (pointer:fine)').matches
              ? true
              : !current
          )
        }
      >
        <ListIcon size={20} aria-hidden='true' />
        <span>目录</span>
        <span className='sr-only'>，文章目录</span>
      </button>
      <nav
        hidden={!open}
        id={id}
        aria-label='文章目录'
        className='journal-toc-list'
      >
        <h2>
          文章目录 <small>{items.length}</small>
        </h2>
        {items.map(item => {
          const target = normalizePostId(item.id)
          return (
            <a
              key={target}
              href={'#' + target}
              aria-current={active === target ? 'location' : undefined}
              style={{ paddingInlineStart: 12 + (item.indentLevel || 0) * 14 }}
              onClick={() => setOpen(false)}
            >
              {item.text}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
