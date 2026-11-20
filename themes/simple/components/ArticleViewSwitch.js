import { useEffect, useState } from 'react'

const preferenceKey = 'nogi.articles.view'

export function useArticleView() {
  const [textView, setTextView] = useState(false)

  useEffect(() => {
    function restore() {
      try {
        setTextView(window.localStorage.getItem(preferenceKey) === 'text')
      } catch {
        /* Storage is optional. */
      }
    }
    restore()
    window.addEventListener('storage', restore)
    return () => window.removeEventListener('storage', restore)
  }, [])

  function changeView(text) {
    setTextView(text)
    try {
      window.localStorage.setItem(preferenceKey, text ? 'text' : 'cards')
    } catch {
      /* Keep the choice for this page when storage is unavailable. */
    }
  }
  return [textView, changeView]
}

export default function ArticleViewSwitch({ textView, onViewChange }) {
  return (
    <div className='journal-view-switch' role='group' aria-label='文章展示方式'>
      <button
        type='button'
        aria-pressed={!textView}
        onClick={() => onViewChange(false)}
      >
        方块
      </button>
      <button
        type='button'
        aria-pressed={textView}
        onClick={() => onViewChange(true)}
      >
        纯文字
      </button>
    </div>
  )
}
