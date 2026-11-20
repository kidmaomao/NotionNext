import { useRouter } from 'next/router'

export default function SearchInput({ keyword = '' }) {
  const router = useRouter()
  function submit(event) {
    event.preventDefault()
    const value = event.currentTarget.elements.s.value.trim()
    if (value) router.push('/search/' + encodeURIComponent(value))
  }
  return (
    <form
      role='search'
      className='journal-result-search'
      action='/search'
      onSubmit={submit}
    >
      <input
        type='search'
        name='s'
        aria-label='搜索关键词'
        placeholder='输入关键词'
        defaultValue={keyword}
        required
      />
      <button type='submit'>搜索</button>
    </form>
  )
}
