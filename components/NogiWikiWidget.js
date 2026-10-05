import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from '@/styles/NogiWikiWidget.module.css'

const categories = ['全部', '道具', '技能', '释放', '头衔', '料理']
const examples = ['女神像', '重击', '猎鼠者']

function safeLinks(values) {
  return Array.isArray(values)
    ? values
        .filter(value => {
          try {
            const url = new URL(value)
            return url.protocol === 'https:' && !url.username && !url.password
          } catch {
            return false
          }
        })
        .slice(0, 20)
    : []
}

export default function NogiWikiWidget() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const launcher = useRef(null)
  const input = useRef(null)
  const panel = useRef(null)
  const request = useRef(null)
  const sequence = useRef(0)

  function close() {
    sequence.current += 1
    request.current?.abort()
    setBusy(false)
    setOpen(false)
    launcher.current?.focus()
  }

  useEffect(() => {
    if (open) input.current?.focus()
    return () => request.current?.abort()
  }, [open])

  async function search(payload) {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    const id = ++sequence.current
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/nogi/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
        signal: controller.signal
      })
      const data = await response.json().catch(() => ({ ok: false }))
      if (!response.ok || !data.ok) {
        throw new Error(data.error || '百科资料暂时无法读取，请稍后重试。')
      }
      if (sequence.current === id) {
        setResult({
          ...data,
          sources: safeLinks(data.sources),
          images: safeLinks(data.images)
        })
      }
    } catch (exception) {
      if (exception.name !== 'AbortError' && sequence.current === id) {
        setError(
          exception instanceof TypeError
            ? '连接暂时不可用，请稍后重试。'
            : exception.message || '连接暂时不可用，请稍后重试。'
        )
      }
    } finally {
      if (sequence.current === id) setBusy(false)
    }
  }

  function submit(event) {
    event.preventDefault()
    if (query.trim() && !busy)
      search({ action: 'search', category, query: query.trim() })
  }

  function selectCandidate(candidate) {
    if (
      !categories.includes(candidate.category) ||
      typeof candidate.query !== 'string'
    )
      return
    setCategory(candidate.category)
    setQuery(candidate.query)
    search({
      action: 'search',
      category: candidate.category,
      query: candidate.query
    })
  }

  function handleKeys(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      const controls = Array.from(
        panel.current.querySelectorAll('button:not(:disabled), input, a[href]')
      )
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
  }

  return (
    <aside className={styles.widget} aria-label='洛奇百科助手'>
      {open && (
        <section
          className={styles.panel}
          id='nogi-wiki-panel'
          role='dialog'
          aria-labelledby='nogi-wiki-title'
          ref={panel}
          onKeyDown={handleKeys}
        >
          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}>NOGINOGI</span>
              <h2 id='nogi-wiki-title'>洛奇百科</h2>
            </div>
            <button
              className={styles.close}
              onClick={close}
              aria-label='关闭百科窗口'
            >
              ×
            </button>
          </header>

          <form className={styles.form} onSubmit={submit}>
            <div
              className={styles.categories}
              role='group'
              aria-label='百科分类'
            >
              {categories.map(item => (
                <button
                  key={item}
                  type='button'
                  aria-pressed={category === item}
                  className={category === item ? styles.selected : ''}
                  onClick={() => setCategory(item)}
                  disabled={busy}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className={styles.label} htmlFor='nogi-wiki-query'>
              查询名称
            </label>
            <div className={styles.inputRow}>
              <input
                id='nogi-wiki-query'
                ref={input}
                value={query}
                maxLength={200}
                onChange={event => setQuery(event.target.value)}
                autoComplete='off'
                placeholder='输入名称或道具编号'
              />
              <button
                type='submit'
                className={styles.submit}
                disabled={busy || !query.trim()}
              >
                {busy ? '查询中' : '查询'}
              </button>
            </div>
          </form>

          <div className={styles.results} aria-busy={busy}>
            {error && (
              <p className={styles.error} role='alert'>
                {error}
              </p>
            )}
            {busy && (
              <p className={styles.loading} role='status'>
                正在查找百科资料…
              </p>
            )}
            {!result && !busy && (
              <div className={styles.welcome}>
                <span className={styles.book} aria-hidden='true'>
                  ✦
                </span>
                <h3>想查点什么？</h3>
                <p>
                  道具属性、技能效果、释放与头衔，
                  <br />
                  输入名称即可查找。
                </p>
                <div className={styles.examples}>
                  {examples.map(name => (
                    <button
                      key={name}
                      onClick={() => {
                        setQuery(name)
                        search({ action: 'search', category, query: name })
                      }}
                    >
                      {name}
                      <span aria-hidden='true'> ↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {result && (
              <article className={styles.article} aria-label='百科查询结果'>
                <p className={styles.resultText}>{result.text}</p>
                {Array.isArray(result.candidates) &&
                  result.candidates.length > 0 && (
                    <div className={styles.candidates}>
                      <p>点击条目查看详情</p>
                      {result.candidates.map((item, index) => (
                        <button
                          key={`${item.category}-${item.query}-${index}`}
                          disabled={busy}
                          onClick={() => selectCandidate(item)}
                        >
                          <span>{item.name}</span>
                          <small>{item.category} →</small>
                        </button>
                      ))}
                    </div>
                  )}
                {result.images.slice(0, 3).map(url => (
                  // Source illustrations retain their native aspect ratio.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt='百科资料插图'
                    className={styles.illustration}
                    loading='lazy'
                    referrerPolicy='no-referrer'
                  />
                ))}
                {result.sources.length > 0 && (
                  <div className={styles.sources}>
                    <h3>资料来源</h3>
                    {result.sources.map((url, index) => (
                      <a
                        key={url}
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {result.sources.length > 1 ? `${index + 1}. ` : ''}
                        {new URL(url).hostname} ↗
                      </a>
                    ))}
                  </div>
                )}
              </article>
            )}
          </div>

          <footer className={styles.footer}>
            {Number.isInteger(result?.page) &&
            Number.isInteger(result?.pages) &&
            result.pages > 1 ? (
              <div className={styles.pager}>
                <button
                  disabled={busy || result.page <= 1}
                  onClick={() => {
                    search({ action: 'page', page: result.page - 1 })
                  }}
                >
                  上一页
                </button>
                <span aria-live='polite'>
                  {result.page} / {result.pages}
                </span>
                <button
                  disabled={busy || result.page >= result.pages}
                  onClick={() => {
                    search({ action: 'page', page: result.page + 1 })
                  }}
                >
                  下一页
                </button>
              </div>
            ) : (
              <span>资料来自 NogiNogi 百科</span>
            )}
            <button
              disabled={busy}
              className={styles.help}
              onClick={() => {
                search({ action: 'help' })
              }}
            >
              使用说明
            </button>
          </footer>
        </section>
      )}
      <button
        ref={launcher}
        type='button'
        className={styles.launcher}
        aria-label={open ? '收起洛奇百科助手' : '打开洛奇百科助手'}
        aria-expanded={open}
        aria-controls='nogi-wiki-panel'
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Image
          src='/images/nogi-wiki-sheep.webp'
          width={88}
          height={88}
          sizes='(max-width: 640px) 64px, 88px'
          quality={90}
          alt=''
          draggable='false'
        />
        <span className={styles.tooltip}>洛奇百科</span>
      </button>
    </aside>
  )
}
