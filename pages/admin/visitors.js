import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { authenticated, adminConfigured } from '@/lib/server/visitAdminAuth'
import regional from '@/lib/analytics/regional-map.json'
import {
  AREA_LABELS,
  KIND_LABELS,
  sessionStatus
} from '@/lib/analytics/journeys'
import styles from '@/styles/VisitorDashboard.module.css'

const countryNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' })
const countryName = code => {
  try {
    return (
      { CN: '中国大陆', HK: '香港', MO: '澳门', TW: '台湾' }[code] ||
      (code ? countryNames.of(code) : '位置未知')
    )
  } catch {
    return '位置未知'
  }
}
const cityNames = {
  Guangzhou: '广州',
  Shenzhen: '深圳',
  Beijing: '北京',
  Shanghai: '上海',
  Jinan: '济南',
  'Hong Kong': '香港',
  Macao: '澳门',
  Macau: '澳门',
  Taipei: '台北',
  Singapore: '新加坡',
  Tokyo: '东京',
  Seoul: '首尔'
}
const locationName = location =>
  [
    countryName(location?.country),
    cityNames[location?.city] || location?.city || location?.region
  ]
    .filter(Boolean)
    .join(' · ')
const number = value => Number(value || 0).toLocaleString('zh-CN')
const duration = value =>
  value >= 60
    ? `${Math.floor(value / 60)} 分 ${Math.round(value % 60)} 秒`
    : `${Math.round(value || 0)} 秒`
const time = value =>
  new Date(value).toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
const errors = {
  invalid_password: '密码不正确',
  rate_limited: '尝试次数较多，请稍后再试',
  admin_not_configured: '管理密码尚未配置',
  unauthorized: '登录已过期，请重新登录'
}

function Icon({ name }) {
  const shapes = {
    chart: (
      <>
        <path d='M4 19h16M6 16v-5m6 5V5m6 11V8' />
      </>
    ),
    globe: (
      <>
        <circle cx='12' cy='12' r='8' />
        <path d='M4 12h16M12 4c5 5 5 11 0 16-5-5-5-11 0-16' />
      </>
    ),
    people: (
      <>
        <circle cx='9' cy='8' r='3' />
        <path d='M3 20v-3a6 6 0 0 1 12 0v3m1-15a3 3 0 0 1 0 6m1 3a5 5 0 0 1 4 5' />
      </>
    ),
    clock: (
      <>
        <circle cx='12' cy='12' r='8' />
        <path d='M12 7v5l3 2' />
      </>
    ),
    arrow: (
      <>
        <path d='M6 18L18 6M6 6h12v12' />
      </>
    ),
    refresh: (
      <>
        <path d='M19 8a8 8 0 1 0 1 7M19 3v5h-5' />
      </>
    ),
    lock: (
      <>
        <rect x='5' y='10' width='14' height='11' rx='3' />
        <path d='M8 10V7a4 4 0 0 1 8 0v3m-4 5v2' />
      </>
    )
  }
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      {shapes[name] || shapes.chart}
    </svg>
  )
}

function Login({ configured, onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/visit-admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(errors[result.error] || '暂时无法登录，请稍后再试')
      setPassword('')
      onLogin()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <Icon name='lock' />
        </div>
        <span className={styles.eyebrow}>洛奇记事本 · 管理后台</span>
        <h1>看看访客的足迹</h1>
        <p>登录后查看访问地图、文章热度与浏览路径。</p>
        <form
          onSubmit={event => {
            void submit(event)
          }}
        >
          <label htmlFor='admin-password'>管理密码</label>
          <input
            id='admin-password'
            type='password'
            autoComplete='current-password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={!configured || busy}
          />
          {(!configured || error) && (
            <p className={styles.error} role='alert'>
              {error || '请先配置管理密码，再启用后台。'}
            </p>
          )}
          <button className={styles.primary} disabled={!configured || busy}>
            {busy ? '正在登录…' : '进入访客后台'}
            <span>→</span>
          </button>
        </form>
        <Link href='/'>← 返回网站</Link>
        <small>访客明细仅对管理员开放</small>
      </div>
    </div>
  )
}

function Trend({ rows, days, from }) {
  const points = Array.from({ length: days }, (_, index) => {
    const day = new Date(new Date(from).getTime() + index * 86400000 + 28800000)
      .toISOString()
      .slice(0, 10)
    return { day, views: rows.find(row => row._id === day)?.views || 0 }
  })
  const max = Math.max(1, ...points.map(row => row.views))
  return (
    <div className={styles.trend}>
      {points.map(row => (
        <div
          key={row.day}
          className={styles.barColumn}
          title={`${row.day} · ${row.views} 次打开`}
        >
          <span>{days <= 7 ? row.views : ''}</span>
          <div className={styles.barTrack}>
            <div
              className={styles.bar}
              style={{
                height: `${(row.views / max) * 100}%`,
                minHeight: row.views ? 4 : 0
              }}
            />
          </div>
          <small>{days === 30 ? row.day.slice(8) : row.day.slice(5)}</small>
        </div>
      ))}
    </div>
  )
}
function Breakdown({ rows, direct }) {
  const total = rows.reduce((sum, row) => sum + row.views, 0)
  return (
    <div className={styles.breakdown}>
      {rows.map(row => (
        <div key={row._id || 'direct'}>
          <div>
            <span>{row._id || direct}</span>
            <strong>{number(row.views)}</strong>
          </div>
          <div className={styles.meter}>
            <i
              style={{ width: `${(row.views / Math.max(total, 1)) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {!rows.length && <p className={styles.empty}>还没有访问记录</p>}
    </div>
  )
}

function RegionalMap({ locations, countries, area, onArea }) {
  const [hover, setHover] = useState('')
  const counts = new Map(countries.map(row => [row._id, row.visitors]))
  const project = (longitude, latitude) => [
    ((longitude - 72) * 1000) / 74,
    ((56 - latitude) * 760) / 56
  ]
  const markers = locations.filter(
    row =>
      Number.isFinite(row._id?.latitude) &&
      Number.isFinite(row._id?.longitude) &&
      row._id.longitude >= 72 &&
      row._id.longitude <= 146 &&
      row._id.latitude >= 0 &&
      row._id.latitude <= 56
  )
  return (
    <div className={styles.mapWrap}>
      <svg
        className={styles.map}
        viewBox='0 0 1000 760'
        role='img'
        aria-label='中国、港澳台与周边访客地图'
      >
        <defs>
          <pattern
            id='map-grid'
            width='70'
            height='70'
            patternUnits='userSpaceOnUse'
          >
            <path
              d='M70 0H0V70'
              fill='none'
              stroke='#364858'
              strokeWidth='.7'
            />
          </pattern>
        </defs>
        <rect width='1000' height='760' fill='url(#map-grid)' />
        {regional.countries.map(item => (
          <path
            key={item.code}
            d={item.path}
            className={styles.country}
            fill={
              item.code === area
                ? '#315d76'
                : counts.has(item.code)
                  ? '#294653'
                  : '#252e38'
            }
            onMouseEnter={() =>
              setHover(
                countryName(item.code) +
                  ' · ' +
                  (counts.get(item.code) || 0) +
                  ' 位访客'
              )
            }
            onMouseLeave={() => setHover('')}
            onClick={() =>
              onArea(
                ['CN', 'HK', 'MO', 'TW'].includes(item.code)
                  ? item.code
                  : 'nearby'
              )
            }
          >
            <title>
              {countryName(item.code)} · {counts.get(item.code) || 0} 位访客
            </title>
          </path>
        ))}
        <g className={styles.provinces}>
          {regional.provinces.map(item => (
            <path
              key={item.code}
              d={item.path}
              onMouseEnter={() => setHover(item.name)}
              onMouseLeave={() => setHover('')}
            >
              <title>{item.name}</title>
            </path>
          ))}
        </g>
        {[
          ['中国大陆', 104, 36],
          ['台湾', 123, 24],
          ['日本', 138, 38],
          ['韩国', 128, 36],
          ['蒙古', 103, 47],
          ['越南', 106, 16],
          ['新加坡', 106, 2]
        ].map(([label, lon, lat]) => (
          <text
            key={label}
            x={project(lon, lat)[0]}
            y={project(lon, lat)[1]}
            className={styles.mapLabel}
          >
            {label}
          </text>
        ))}
        {markers.map((row, index) => (
          <g
            key={index}
            transform={
              'translate(' +
              project(row._id.longitude, row._id.latitude).join(',') +
              ')'
            }
          >
            <circle
              r={Math.min(24, 8 + Math.sqrt(row.visitors) * 3)}
              fill='#9cdbff'
              opacity='.14'
            />
            <circle r='4.5' fill='#9cdbff' stroke='#15191f' strokeWidth='2'>
              <title>
                {locationName(row._id)} · {row.visitors} 位访客 · {row.views}{' '}
                次打开
              </title>
            </circle>
          </g>
        ))}
        <g className={styles.mapCallouts}>
          {[
            ['HK', '香港', 114.2, 22.3, 710, 510],
            ['MO', '澳门', 113.5, 22.2, 518, 470]
          ].map(([code, label, lon, lat, x, y]) => (
            <g key={code} onClick={() => onArea(code)}>
              <path
                d={'M' + project(lon, lat).join(',') + 'L' + x + ',' + y}
                stroke='#9cdbff'
                strokeWidth='1'
              />
              <circle
                cx={project(lon, lat)[0]}
                cy={project(lon, lat)[1]}
                r='4'
                fill='#f2bd72'
              />
              <rect
                x={x - 20}
                y={y - 25}
                width='108'
                height='39'
                rx='8'
                fill='#17212b'
                stroke='#506679'
              />
              <text x={x - 8} y={y}>
                {label} {counts.get(code) || 0}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <div className={styles.mapTooltip}>
        {hover || '中国、港澳台及周边 · 点击地区筛选'}
      </div>
      <div className={styles.mapCaption}>
        <span>
          <i />
          IP 推断的大致位置
        </span>
        <span>Natural Earth · 非精确定位</span>
      </div>
    </div>
  )
}

function PageLabel({ path, title, seconds }) {
  return (
    <span className={styles.pageLabel}>
      <span title={title || path}>{title || path}</span>
      <small>
        {path}
        {seconds !== undefined ? ' · ' + duration(seconds) : ''}
      </small>
    </span>
  )
}
function JourneyDetail({ journey, days, onClose, onExpired }) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/visit-admin/data?days=' + days + '&session=' + journey._id, {
      signal: controller.signal
    })
      .then(async response => {
        if (response.status === 401) {
          onExpired()
          return
        }
        if (!response.ok) throw new Error('浏览路径暂时无法加载')
        setResult(await response.json())
      })
      .catch(e => {
        if (e.name !== 'AbortError') setError(e.message)
      })
    const key = e => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', key)
    return () => {
      controller.abort()
      document.removeEventListener('keydown', key)
    }
  }, [journey._id, days, onClose, onExpired])
  const visits = result?.visits ? [...result.visits].reverse() : null
  const latest = visits?.at(-1)
  const status = sessionStatus(latest || journey)
  const source = result?.metadata?.source || journey.source
  const kind = result?.metadata?.kind || journey.kind
  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        className={styles.drawer}
        role='dialog'
        aria-modal='true'
        aria-label='访客访问全过程'
        onClick={e => e.stopPropagation()}
      >
        <button
          className={styles.close}
          onClick={onClose}
          aria-label='关闭访客详情'
          autoFocus
        >
          ×
        </button>
        <span className={styles.eyebrow}>VISITOR JOURNEY</span>
        <h2>访客 {journey.visitor.slice(0, 8)}</h2>
        <p className={styles.muted}>
          {locationName(journey.location)} · {journey.device} ·{' '}
          {journey.browser}
        </p>
        <div className={styles.visitTags}>
          <span className={kind === 'returning' ? styles.returningTag : ''}>
            {KIND_LABELS[kind]}
          </span>
          <span>{time(journey.at)} 开始</span>
          <span>{status.label}</span>
        </div>
        <div className={styles.journeySummary}>
          <section>
            <span>01 / 从哪里来</span>
            <strong>{source.label}</strong>
            <small>
              {source.evidence}
              {source.host ? ' · ' + source.host : ''}
            </small>
            {result?.metadata?.firstSeen && (
              <small>首次识别于 {time(result.metadata.firstSeen)}</small>
            )}
          </section>
          <section>
            <span>02 / 落地页面</span>
            <PageLabel
              path={journey.landingPath}
              title={journey.landingTitle}
              seconds={journey.landingSeconds}
            />
            <small>第一篇页面的前台停留估算</small>
          </section>
          <section>
            <span>03 / 最后页面与离开</span>
            <PageLabel
              path={latest?.path || journey.lastPath}
              title={latest?.title || journey.lastTitle}
            />
            <small>{status.hint}</small>
          </section>
        </div>
        {journey.flaggedPages > 0 && (
          <div className={styles.alertBox}>
            <strong>异常点击提示 · {journey.flaggedPages} 个页面</strong>
            <p>
              连续点击：2 秒内、40 像素范围连续点击 5 次。高频链接点击：至少 30
              次且平均每秒至少 1 次，或单页累计达到 100
              次。标记供排查，不代表恶意访问。
            </p>
          </div>
        )}
        <h3>
          04 / 浏览顺序 <small>按进入时间排列 · 北京时间</small>
        </h3>
        {error && (
          <p role='alert' className={styles.error}>
            {error}
          </p>
        )}
        {!visits && !error && (
          <p className={styles.muted}>正在读取完整浏览路径…</p>
        )}
        {result?.truncated && (
          <p className={styles.muted}>
            此会话较长，仅显示最近 200 个页面；落地页见上方。
          </p>
        )}
        <div className={styles.timeline}>
          {visits?.map((visit, index) => (
            <article key={visit.at + ':' + index}>
              <small>
                {String(index + 1).padStart(2, '0')} · {time(visit.at)}
              </small>
              <a href={visit.path} target='_blank' rel='noreferrer'>
                {visit.title || visit.path}
                <Icon name='arrow' />
              </a>
              <code>{visit.path}</code>
              <p>
                前台停留 {duration(visit.activeSeconds)} <span>·</span> 滚动{' '}
                {visit.scrollPercent}% <span>·</span> 链接点击 {visit.clicks} 次
              </p>
              {visit.lastLink && <p>最后点击：{visit.lastLink}</p>}
              {(visit.anomalies || []).map(reason => (
                <span className={styles.anomalyBadge} key={reason}>
                  {reason}
                </span>
              ))}
              {index === visits.length - 1 && (
                <div className={styles.visitTags}>
                  <span>{status.label}</span>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
function ShareLinks() {
  const [path, setPath] = useState('/')
  const [copied, setCopied] = useState('')
  const valid =
    /^\/(?!\/)[^?#\s]*$/.test(path) && !/^\/(admin|api)(\/|$)/.test(path)
  const copy = async source => {
    if (!valid) return
    try {
      await navigator.clipboard.writeText(
        'https://www.noginogi.sbs' +
          path +
          '?utm_source=' +
          source +
          '&utm_medium=social'
      )
      setCopied(source)
    } catch {
      setCopied('error')
    }
  }
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <h2>社群分享链接</h2>
          <p>聊天应用可能隐藏来源，使用带标记的链接可区分分享渠道。</p>
        </div>
      </div>
      <div className={styles.shareLinks}>
        <label htmlFor='share-path'>要分享的页面路径</label>
        <input
          id='share-path'
          value={path}
          onChange={e => {
            setPath(e.target.value)
            setCopied('')
          }}
          placeholder='/article/20260814'
        />
        <div>
          {[
            ['qq', 'QQ'],
            ['wechat', '微信'],
            ['group', '其他社群']
          ].map(([value, label]) => (
            <button
              key={value}
              disabled={!valid}
              onClick={() => {
                void copy(value)
              }}
            >
              {copied === value ? '已复制' : '复制' + label + '链接'}
            </button>
          ))}
        </div>
        {!valid && <small>请输入站内路径，例如 /article/20260814</small>}
        {copied === 'error' && (
          <small>
            浏览器未允许复制，请手动添加 ?utm_source=qq&utm_medium=social
          </small>
        )}
      </div>
    </section>
  )
}
export default function Visitors({ authenticated: initialAuth, configured }) {
  const [loggedIn, setLoggedIn] = useState(initialAuth)
  const [days, setDays] = useState(7)
  const [area, setArea] = useState('')
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [selected, setSelected] = useState(null)
  const [onlyFlagged, setOnlyFlagged] = useState(false)
  useEffect(() => {
    if (!loggedIn) return
    const controller = new AbortController()
    setBusy(true)
    setError('')
    setData(null)
    fetch(
      '/api/visit-admin/data?days=' + days + '&area=' + area + '&page=' + page,
      { signal: controller.signal }
    )
      .then(async response => {
        if (response.status === 401) {
          setLoggedIn(false)
          return
        }
        if (!response.ok) throw new Error('统计数据暂时无法读取，请稍后刷新')
        setData(await response.json())
      })
      .catch(e => {
        if (e.name !== 'AbortError') setError(e.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false)
      })
    return () => controller.abort()
  }, [loggedIn, days, area, page, refresh])
  const changeArea = value => {
    setArea(value)
    setPage(1)
    setSelected(null)
  }
  const closeDetail = useCallback(() => setSelected(null), [])
  const expired = useCallback(() => {
    setLoggedIn(false)
    setSelected(null)
    setData(null)
  }, [])
  const logout = async () => {
    const response = await fetch('/api/visit-admin/session', {
      method: 'DELETE'
    })
    if (response.ok) expired()
  }
  const summary = data?.summary
  const journeys = data?.sessions || []
  const rows = onlyFlagged
    ? journeys.filter(row => row.flaggedPages > 0)
    : journeys
  const newCount = data?.kinds?.find(row => row._id === 'new')?.views || 0
  const returningCount =
    data?.kinds?.find(row => row._id === 'returning')?.views || 0
  return (
    <>
      <Head>
        <title>访客后台 | noginogi</title>
        <meta name='robots' content='noindex,nofollow' />
        <meta name='color-scheme' content='dark' />
      </Head>
      {!loggedIn ? (
        <Login configured={configured} onLogin={() => setLoggedIn(true)} />
      ) : (
        <div className={styles.dashboard}>
          <aside className={styles.sidebar}>
            <Link href='/' className={styles.brand}>
              <span>洛</span>
              <div>
                noginogi<small>洛奇记事本 · 访客后台</small>
              </div>
            </Link>
            <div className={styles.workspace}>
              <i />
              www.noginogi.sbs
            </div>
            <span className={styles.navLabel}>访问分析</span>
            <nav>
              <button
                className={tab === 'overview' ? styles.activeNav : ''}
                onClick={() => setTab('overview')}
              >
                <Icon name='chart' />
                访问概览
              </button>
              <button
                className={tab === 'visitors' ? styles.activeNav : ''}
                onClick={() => setTab('visitors')}
              >
                <Icon name='people' />
                访问明细
              </button>
              <a href='/privacy/analytics' target='_blank' rel='noreferrer'>
                <Icon name='lock' />
                统计说明
              </a>
            </nav>
            <div className={styles.sidebarFooter}>
              <span>
                <Icon name='lock' />
                仅管理员可见
              </span>
              <button
                onClick={() => {
                  void logout()
                }}
              >
                退出登录 ↗
              </button>
            </div>
          </aside>
          <main className={styles.main}>
            <header className={styles.header}>
              <div>
                <span className={styles.eyebrow}>
                  NOGINOGI / VISITOR ANALYTICS
                </span>
                <h1>
                  {tab === 'overview' ? '访客的足迹' : '每一次访问，从来到离开'}
                </h1>
                <p>来源、落地页与浏览顺序，放在同一条记录里。</p>
              </div>
              <button
                className={styles.refresh}
                onClick={() => setRefresh(n => n + 1)}
                disabled={busy}
              >
                <Icon name='refresh' />
                {busy ? '加载中' : '刷新'}
              </button>
            </header>
            <div className={styles.toolbar}>
              <div className={styles.periods}>
                {[
                  [1, '今天'],
                  [7, '近 7 天'],
                  [30, '近 30 天']
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={days === value ? styles.selectedPeriod : ''}
                    onClick={() => {
                      setDays(value)
                      setPage(1)
                      setSelected(null)
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className={styles.updated}>
                {data ? '更新于 ' + time(data.generatedAt) : '北京时间'}
              </span>
            </div>
            <div className={styles.areaFilters} aria-label='地区筛选'>
              {Object.entries(AREA_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  aria-pressed={area === value}
                  className={area === value ? styles.activeArea : ''}
                  onClick={() => changeArea(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.notice}>
              {process.env.NODE_ENV === 'development' && (
                <strong>本地测试环境 · </strong>
              )}
              页面打开包含刷新，文章浏览次数仍按 5 分钟去重。行为明细保留 90
              天。
            </div>
            {error && (
              <p role='alert' className={styles.error}>
                {error}
              </p>
            )}
            {busy && <div className={styles.loading}>正在读取访问记录…</div>}
            {data && (
              <>
                <div className={styles.kpis}>
                  {[
                    ['页面打开', summary.views, 'chart', '含重复刷新'],
                    [
                      '匿名访客',
                      summary.visitors,
                      'people',
                      '按浏览器标识去重'
                    ],
                    [
                      '新客会话 / 熟客会话',
                      newCount + ' / ' + returningCount,
                      'globe',
                      '同一访客可多次进入'
                    ],
                    [
                      '平均前台停留',
                      duration(summary.duration),
                      'clock',
                      '页面可见时长估算'
                    ]
                  ].map(([label, value, icon, hint]) => (
                    <section key={label}>
                      <div>
                        <span>{label}</span>
                        <Icon name={icon} />
                      </div>
                      <strong>
                        {typeof value === 'number' ? number(value) : value}
                      </strong>
                      <small>{hint}</small>
                    </section>
                  ))}
                </div>
                {tab === 'overview' && (
                  <>
                    <div className={styles.mapGrid}>
                      <section className={styles.panel}>
                        <div className={styles.panelHeading}>
                          <div>
                            <h2>中国与周边的访问</h2>
                            <p>中国大陆、香港、澳门、台湾与周边地区</p>
                          </div>
                          <span className={styles.pill}>
                            <i />
                            区域地图
                          </span>
                        </div>
                        <RegionalMap
                          locations={data.locations}
                          countries={data.countries}
                          area={area}
                          onArea={changeArea}
                        />
                      </section>
                      <section className={styles.panel}>
                        <div className={styles.panelHeading}>
                          <h2>地区分布</h2>
                          {area && (
                            <button
                              className={styles.textButton}
                              onClick={() => changeArea('')}
                            >
                              查看全部
                            </button>
                          )}
                        </div>
                        <div className={styles.regions}>
                          {['CN', 'HK', 'MO', 'TW', 'nearby', 'other'].map(
                            (key, index) => {
                              const row = data.areas?.find(
                                row => row._id === key
                              )
                              return (
                                <button
                                  key={key}
                                  onClick={() => changeArea(key)}
                                >
                                  <span className={styles.rank}>
                                    {String(index + 1).padStart(2, '0')}
                                  </span>
                                  <span>
                                    {AREA_LABELS[key]}
                                    <small>{number(row?.views)} 次打开</small>
                                  </span>
                                  <strong>
                                    {number(row?.visitors)}
                                    <small>访客</small>
                                  </strong>
                                </button>
                              )
                            }
                          )}
                        </div>
                        <div className={styles.geoNote}>
                          代理与运营商可能影响位置。其他地区访问仍保留在明细中。
                        </div>
                      </section>
                    </div>
                    <div className={styles.contentGrid}>
                      <section className={styles.panel}>
                        <div className={styles.panelHeading}>
                          <h2>访问趋势</h2>
                          <span className={styles.muted}>页面打开次数</span>
                        </div>
                        <Trend rows={data.trend} days={days} from={data.from} />
                      </section>
                      <section className={styles.panel}>
                        <div className={styles.panelHeading}>
                          <div>
                            <h2>从哪里进入网站</h2>
                            <p>按访问会话统计，以落地页来源为准</p>
                          </div>
                        </div>
                        <Breakdown
                          rows={data.sessionSources}
                          direct='直接进入／来源未提供'
                        />
                        <p className={styles.geoNote}>
                          来源缺失时无法判断是否来自社群；带标记的分享链接可识别渠道。
                        </p>
                      </section>
                    </div>
                    <div className={styles.contentGrid}>
                      <section className={styles.panel}>
                        <div className={styles.panelHeading}>
                          <h2>热门页面</h2>
                          <span className={styles.muted}>
                            打开 / 访客 / 平均停留
                          </span>
                        </div>
                        <div className={styles.tableWrap}>
                          <table>
                            <thead>
                              <tr>
                                <th>页面</th>
                                <th>打开</th>
                                <th>访客</th>
                                <th>平均停留</th>
                                <th>滚动</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.pages.map(row => (
                                <tr key={row._id}>
                                  <td>
                                    <a
                                      href={row._id}
                                      target='_blank'
                                      rel='noreferrer'
                                    >
                                      {row.title || row._id}
                                    </a>
                                    <small>{row._id}</small>
                                  </td>
                                  <td>{number(row.views)}</td>
                                  <td>{number(row.visitors)}</td>
                                  <td>{duration(row.duration)}</td>
                                  <td>{Math.round(row.scroll)}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {!data.pages.length && (
                          <p className={styles.empty}>
                            新访问产生后，页面热度会显示在这里。
                          </p>
                        )}
                      </section>
                      <section className={styles.panel}>
                        <div className={styles.panelHeading}>
                          <h2>使用设备</h2>
                        </div>
                        <Breakdown rows={data.devices} />
                        <div className={styles.lifetime}>
                          <span>原有累计统计</span>
                          <strong>
                            {number(data.lifetime.views)}
                            <small>有效浏览</small>
                          </strong>
                          <strong>
                            {number(data.lifetime.visitors)}
                            <small>累计访客</small>
                          </strong>
                        </div>
                      </section>
                    </div>
                  </>
                )}
                <section className={styles.panel}>
                  <div className={styles.panelHeading}>
                    <div>
                      <h2>访问明细</h2>
                      <p>
                        每行是一段访问会话，点击查看完整过程；相同编号表示同一浏览器。
                      </p>
                    </div>
                    <span className={styles.pill}>第 {page} 页</span>
                  </div>
                  <div className={styles.journeyToolbar}>
                    <span>
                      {summary.sessions} 段会话 · {data.flaggedSessions}{' '}
                      段有异常点击提示
                    </span>
                    <label>
                      <input
                        type='checkbox'
                        checked={onlyFlagged}
                        onChange={e => setOnlyFlagged(e.target.checked)}
                      />
                      只看本页有标记的记录
                    </label>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.journeyTable}>
                      <thead>
                        <tr>
                          <th>访客 / 时间</th>
                          <th>来源 / 新客熟客</th>
                          <th>落地页面 / 停留</th>
                          <th>最后页面 / 状态</th>
                          <th>浏览 / 总停留</th>
                          <th>点击标记</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(journey => (
                          <tr
                            key={journey._id}
                            className={styles.visitorRow}
                            onClick={() => setSelected(journey)}
                          >
                            <td>
                              <button
                                className={styles.visitorButton}
                                onClick={e => {
                                  e.stopPropagation()
                                  setSelected(journey)
                                }}
                              >
                                <span className={styles.avatar}>
                                  {journey.visitor.slice(0, 2).toUpperCase()}
                                </span>
                                <span>
                                  访客 {journey.visitor.slice(0, 8)}
                                  <small>{time(journey.at)}</small>
                                </span>
                              </button>
                              <small>{locationName(journey.location)}</small>
                            </td>
                            <td>
                              <span className={styles.sourceLabel}>
                                {journey.source.label}
                              </span>
                              <small>{journey.source.evidence}</small>
                              <span
                                className={
                                  journey.kind === 'returning'
                                    ? styles.returningBadge
                                    : styles.kindBadge
                                }
                              >
                                {KIND_LABELS[journey.kind]}
                              </span>
                            </td>
                            <td>
                              <PageLabel
                                path={journey.landingPath}
                                title={journey.landingTitle}
                                seconds={journey.landingSeconds}
                              />
                            </td>
                            <td>
                              <PageLabel
                                path={journey.lastPath}
                                title={journey.lastTitle}
                              />
                              <small title={sessionStatus(journey).hint}>
                                {sessionStatus(journey).label}
                              </small>
                            </td>
                            <td>
                              {journey.views} 个页面
                              <small>{duration(journey.duration)}</small>
                            </td>
                            <td>
                              {journey.flaggedPages > 0 ? (
                                <span className={styles.anomalyBadge}>
                                  {journey.flaggedPages} 页待查看
                                </span>
                              ) : (
                                <span className={styles.muted}>无标记</span>
                              )}
                              <small>{journey.clicks} 次链接点击</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!rows.length && (
                    <p className={styles.empty}>
                      {onlyFlagged
                        ? '本页没有异常点击标记。'
                        : '此范围还没有访问明细。'}
                    </p>
                  )}
                  <div className={styles.pagination}>
                    <span>每页 30 段会话 · 新客判定从已保存的匿名记录开始</span>
                    <div>
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(n => n - 1)}
                      >
                        上一页
                      </button>
                      <button
                        disabled={journeys.length < 30 || page >= 100}
                        onClick={() => setPage(n => n + 1)}
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                </section>
                {tab === 'visitors' && <ShareLinks />}
              </>
            )}
            <footer className={styles.footer}>
              noginogi · 洛奇记事本
              <Link href='/privacy/analytics'>统计说明</Link>
            </footer>
          </main>
          {selected && (
            <JourneyDetail
              journey={selected}
              days={days}
              onClose={closeDetail}
              onExpired={expired}
            />
          )}
        </div>
      )}
    </>
  )
}
Visitors.standalone = true
export function getServerSideProps({ req, res }) {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  return {
    props: { authenticated: authenticated(req), configured: adminConfigured() }
  }
}
