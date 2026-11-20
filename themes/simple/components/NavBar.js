import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useSimpleGlobal } from '..'
import { MenuList } from './MenuList'

export default function NavBar(props) {
  const [searching, setSearching] = useState(false)
  const router = useRouter()
  const { searchModal } = useSimpleGlobal()
  function submit(event) {
    event.preventDefault()
    const term = event.currentTarget.elements.s.value.trim()
    if (term) {
      setSearching(false)
      router.push('/search/' + encodeURIComponent(term))
    }
  }
  return (
    <nav aria-label='网站导航' className='journal-nav'>
      {searching ? (
        <form
          role='search'
          onSubmit={submit}
          onKeyDown={e => {
            if (e.key === 'Escape') setSearching(false)
          }}
        >
          <input
            autoFocus
            name='s'
            type='search'
            aria-label='搜索文章'
            placeholder='输入关键词，回车搜索'
            autoComplete='off'
          />
        </form>
      ) : (
        <MenuList {...props} />
      )}
      <button
        type='button'
        className='journal-nav-search'
        aria-label={searching ? '关闭搜索' : '搜索文章'}
        onClick={() =>
          siteConfig('ALGOLIA_APP_ID')
            ? searchModal.current?.openSearch()
            : setSearching(!searching)
        }
      >
        <i
          aria-hidden='true'
          className={searching ? 'fas fa-times' : 'fas fa-search'}
        />
      </button>
    </nav>
  )
}
