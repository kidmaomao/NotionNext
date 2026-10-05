import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from '@/styles/NogiWikiWidget.module.css'
import {
  libraryCategories,
  modes,
  recipeOperations,
  tabs,
  wikiCategories,
  wikiViews
} from '@/lib/nogi/wikiModes'

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
  const [mode, setMode] = useState('wiki')
  const [libraryCategory, setLibraryCategory] = useState('阿尔卡纳')
  const [wikiView, setWikiView] = useState('完整资料')
  const [operation, setOperation] = useState('成品')
  const [quantity, setQuantity] = useState(1)
  const [runs, setRuns] = useState(3)
  const [history, setHistory] = useState(0)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const launcher = useRef(null)
  const input = useRef(null)
  const panel = useRef(null)
  const request = useRef(null)
  const sequence = useRef(0)
  const current = modes[mode]
  const simulation = ['egg', 'relic', 'coin'].includes(mode)
  const optionalQuery = mode === 'library' || simulation

  function changeMode(next) {
    sequence.current += 1
    request.current?.abort()
    setMode(next)
    setQuery('')
    setResult(null)
    setError('')
    setBusy(false)
  }

  function payload(overrides = {}) {
    return {
      action: 'search',
      mode,
      query: query.trim(),
      ...(mode === 'wiki' ? { category, wikiView } : {}),
      ...(mode === 'library' ? { category: libraryCategory } : {}),
      ...(mode === 'recipe' ? { operation, quantity, runs } : {}),
      ...(mode === 'auction' ? { history } : {}),
      ...overrides
    }
  }

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
    if (query.trim() && !busy) search(payload())
    else if (optionalQuery && !busy) search(payload())
  }

  function selectCandidate(candidate) {
    if (typeof candidate.query !== 'string') return
    const nextMode = candidate.mode || mode
    if (!Object.hasOwn(modes, nextMode)) return
    const overrides = { mode: nextMode, query: candidate.query }
    if (nextMode === 'wiki') {
      if (!wikiCategories.includes(candidate.category)) return
      setCategory(candidate.category)
      overrides.category = candidate.category
    }
    if (nextMode === 'library') {
      if (!libraryCategories.includes(candidate.category)) return
      setLibraryCategory(candidate.category)
      overrides.category = candidate.category
    }
    if (nextMode === 'recipe') {
      const nextOperation = candidate.operation || operation
      if (!recipeOperations.includes(nextOperation)) return
      setOperation(nextOperation)
      overrides.operation = nextOperation
    }
    setMode(nextMode)
    setQuery(candidate.query)
    search(payload(overrides))
  }

  function handleKeys(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      const controls = Array.from(
        panel.current.querySelectorAll(
          'button:not(:disabled), input, select, a[href]'
        )
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
              <h2 id='nogi-wiki-title'>洛奇资料助手</h2>
            </div>
            <button
              className={styles.close}
              onClick={close}
              aria-label='关闭百科窗口'
            >
              ×
            </button>
          </header>

          <nav className={styles.modes} aria-label='功能入口'>
            {tabs.map(item => (
              <button
                key={item.id}
                type='button'
                aria-pressed={
                  item.id === mode || (item.id === 'simulation' && simulation)
                }
                className={
                  item.id === mode || (item.id === 'simulation' && simulation)
                    ? styles.activeMode
                    : ''
                }
                onClick={() =>
                  changeMode(item.id === 'simulation' ? 'egg' : item.id)
                }
              >
                {item.label}
              </button>
            ))}
          </nav>

          <form className={styles.form} onSubmit={submit}>
            {mode === 'wiki' && (
              <>
                <div
                  className={styles.categories}
                  role='group'
                  aria-label='百科分类'
                >
                  {wikiCategories.map(item => (
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
                <label className={styles.option}>
                  查看内容
                  <select
                    value={wikiView}
                    onChange={event => setWikiView(event.target.value)}
                    disabled={busy}
                  >
                    {wikiViews.map(item => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {mode === 'library' && (
              <label className={styles.option}>
                资料专题
                <select
                  value={libraryCategory}
                  onChange={event => {
                    setLibraryCategory(event.target.value)
                    setResult(null)
                  }}
                  disabled={busy}
                >
                  {libraryCategories.map(item => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            )}
            {mode === 'recipe' && (
              <>
                <div
                  className={styles.categories}
                  role='group'
                  aria-label='配方查询方式'
                >
                  {recipeOperations.map(item => (
                    <button
                      key={item}
                      type='button'
                      aria-pressed={operation === item}
                      className={operation === item ? styles.selected : ''}
                      disabled={busy}
                      onClick={() => setOperation(item)}
                    >
                      {item === '成品'
                        ? '成品配方'
                        : item === '材料'
                          ? '材料反查'
                          : '基础材料汇总'}
                    </button>
                  ))}
                </div>
                {operation !== '材料' && (
                  <div className={styles.numbers}>
                    <label className={styles.option}>
                      制作数量
                      <input
                        type='number'
                        min={1}
                        max={1000}
                        value={quantity}
                        onChange={event =>
                          setQuantity(Number(event.target.value))
                        }
                        disabled={busy}
                      />
                    </label>
                    {operation === '汇总' && (
                      <label className={styles.option}>
                        每件制作次数
                        <input
                          type='number'
                          min={1}
                          max={1000}
                          value={runs}
                          onChange={event =>
                            setRuns(Number(event.target.value))
                          }
                          disabled={busy}
                        />
                      </label>
                    )}
                  </div>
                )}
              </>
            )}
            {mode === 'auction' && (
              <label className={styles.option}>
                查询范围
                <select
                  value={history}
                  onChange={event => setHistory(Number(event.target.value))}
                  disabled={busy}
                >
                  <option value={0}>实时挂单</option>
                  <option value={7}>近7天成交记录</option>
                  <option value={30}>近30天成交记录</option>
                </select>
              </label>
            )}
            {simulation && (
              <div
                className={styles.categories}
                role='group'
                aria-label='模拟类型'
              >
                {[
                  ['egg', '抽蛋'],
                  ['relic', '遗物'],
                  ['coin', '硬币']
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type='button'
                    aria-pressed={mode === id}
                    className={mode === id ? styles.selected : ''}
                    onClick={() => changeMode(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
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
                placeholder={current.placeholder}
                disabled={busy}
              />
              <button
                type='submit'
                className={styles.submit}
                disabled={busy || (!optionalQuery && !query.trim())}
              >
                {busy
                  ? '处理中'
                  : simulation
                    ? '开始模拟'
                    : mode === 'library' && !query.trim()
                      ? '浏览'
                      : '查询'}
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
                {simulation ? '正在进行模拟…' : '正在查找资料…'}
              </p>
            )}
            {!result && !busy && (
              <div className={styles.welcome}>
                <span className={styles.book} aria-hidden='true'>
                  ✦
                </span>
                <h3>{current.title}</h3>
                <p>{current.description}</p>
                {simulation && (
                  <p className={styles.note}>仅模拟，不影响真实游戏结果。</p>
                )}
                <div className={styles.examples}>
                  {current.examples.map(name => (
                    <button
                      key={name}
                      onClick={() => {
                        setQuery(name)
                        search(payload({ query: name }))
                      }}
                    >
                      {name || `浏览${libraryCategory}`}
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
                          <span>
                            {item.name}
                            {item.description && (
                              <span className={styles.candidateDescription}>
                                {item.description}
                              </span>
                            )}
                          </span>
                          <small>
                            {item.category || item.label || '详情'} →
                          </small>
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
                    search({ action: 'page', mode, page: result.page - 1 })
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
                    search({ action: 'page', mode, page: result.page + 1 })
                  }}
                >
                  下一页
                </button>
              </div>
            ) : (
              <span>NogiNogi 百科资料库</span>
            )}
            <button
              disabled={busy}
              className={styles.help}
              onClick={() => {
                setResult({
                  text: current.help,
                  images: [],
                  sources: [],
                  candidates: []
                })
                setError('')
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
        <span className={styles.tooltip}>洛奇资料助手</span>
      </button>
    </aside>
  )
}
