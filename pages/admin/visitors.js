import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { authenticated, adminConfigured } from '@/lib/server/visitAdminAuth'
import world from '@/lib/analytics/world-map.json'
import styles from '@/styles/VisitorDashboard.module.css'

const countryNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' })
const countryName = code => {
  try {
    return code ? countryNames.of(code) : '位置未知'
  } catch {
    return '位置未知'
  }
}
const locationName = location =>
  [countryName(location?.country), location?.city || location?.region]
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

function WorldMap({ locations, countries, country, onCountry }) {
  const [hover, setHover] = useState('')
  const counts = new Map(countries.map(row => [row._id, row.visitors]))
  const markers = locations.filter(
    row =>
      Number.isFinite(row._id?.latitude) && Number.isFinite(row._id?.longitude)
  )
  return (
    <div className={styles.mapWrap}>
      <svg
        className={styles.map}
        viewBox='0 0 1000 500'
        role='img'
        aria-label='访客的大致地区分布地图'
      >
        <defs>
          <pattern
            id='map-grid'
            width='80'
            height='80'
            patternUnits='userSpaceOnUse'
          >
            <path
              d='M80 0H0V80'
              fill='none'
              stroke='#dbe6e7'
              strokeWidth='.6'
            />
          </pattern>
        </defs>
        <rect width='1000' height='500' fill='url(#map-grid)' />
        {world.map((item, index) => (
          <path
            key={`${item.code}:${index}`}
            d={item.path}
            className={styles.country}
            fill={
              item.code === country
                ? '#5db9a9'
                : counts.has(item.code)
                  ? '#bee5dc'
                  : '#e5edec'
            }
            onMouseEnter={() =>
              setHover(
                `${countryName(item.code)} · ${counts.get(item.code) || 0} 位访客`
              )
            }
            onMouseLeave={() => setHover('')}
            onClick={() =>
              /^[A-Z]{2}$/.test(item.code) &&
              onCountry(item.code === country ? '' : item.code)
            }
          >
            <title>
              {countryName(item.code)} · {counts.get(item.code) || 0} 位访客
            </title>
          </path>
        ))}
        {markers.map((row, index) => (
          <g
            key={index}
            transform={`translate(${((row._id.longitude + 180) * 1000) / 360},${((90 - row._id.latitude) * 500) / 180})`}
          >
            <circle
              r={Math.min(20, 5 + Math.sqrt(row.visitors) * 2)}
              fill='#14967e'
              opacity='.16'
            />
            <circle r='4' fill='#168f78' stroke='white' strokeWidth='1.5'>
              <title>
                {locationName(row._id)} · {row.visitors} 位访客 · {row.views}{' '}
                次打开
              </title>
            </circle>
          </g>
        ))}
      </svg>
      <div className={styles.mapTooltip}>
        {hover ||
          (country
            ? `当前筛选：${countryName(country)}`
            : '点击国家／地区筛选访客')}
      </div>
      <div className={styles.mapCaption}>
        <span>
          <i />
          访客所在的大致地区
        </span>
        <span>地图：Natural Earth</span>
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

function VisitorDetail({ visitor, days, country, onClose, onExpired }) {
  const [visits, setVisits] = useState(null)
  const [error, setError] = useState('')
  const [truncated, setTruncated] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    fetch(
      `/api/visit-admin/data?days=${days}&visitor=${visitor._id}&country=${country}`,
      { signal: controller.signal }
    )
      .then(async response => {
        if (response.status === 401) {
          onExpired()
          return
        }
        if (!response.ok) throw new Error('浏览路径暂时无法加载')
        const result = await response.json()
        setVisits(result.visits)
        setTruncated(result.truncated)
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
  }, [visitor, days, country, onClose, onExpired])
  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        className={styles.drawer}
        role='dialog'
        aria-modal='true'
        aria-label='访客浏览路径'
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
        <span className={styles.eyebrow}>匿名访客</span>
        <h2>访客 {visitor._id.slice(0, 8)}</h2>
        <p className={styles.muted}>
          {locationName(visitor.location)} · {visitor.device} ·{' '}
          {visitor.browser}
        </p>
        <div className={styles.detailMetrics}>
          <div>
            <strong>{number(visitor.views)}</strong>
            <small>页面打开</small>
          </div>
          <div>
            <strong>{duration(visitor.duration)}</strong>
            <small>前台停留总计</small>
          </div>
        </div>
        <h3>
          浏览路径 <small>最近访问在上 · 北京时间</small>
        </h3>
        {error && (
          <p role='alert' className={styles.error}>
            {error}
          </p>
        )}
        {!visits && !error && <p>正在读取浏览路径…</p>}
        <div className={styles.timeline}>
          {visits?.map((visit, index) => (
            <article key={`${visit.at}:${index}`}>
              <small>{time(visit.at)}</small>
              <a href={visit.path} target='_blank' rel='noreferrer'>
                {visit.title || visit.path}
                <Icon name='arrow' />
              </a>
              <code>{visit.path}</code>
              <p>
                前台停留 {duration(visit.activeSeconds)} <span>·</span> 滚动{' '}
                {visit.scrollPercent}% <span>·</span> 点击 {visit.clicks} 次
              </p>
              {visit.lastLink && (
                <p>
                  最后点击：<code>{visit.lastLink}</code>
                </p>
              )}
              <div className={styles.visitTags}>
                <span>{visit.referrer || '直接访问'}</span>
                <span>{locationName(visit.location)}</span>
                <span>会话 {visit.session.slice(0, 6)}</span>
              </div>
            </article>
          ))}
        </div>
        {truncated && (
          <p className={styles.muted}>
            显示最近 200 次访问，请缩短时间范围查看更多细节。
          </p>
        )}
      </section>
    </div>
  )
}

export default function Visitors({ authenticated: initialAuth, configured }) {
  const [loggedIn, setLoggedIn] = useState(initialAuth)
  const [days, setDays] = useState(7)
  const [country, setCountry] = useState('')
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [selected, setSelected] = useState(null)
  useEffect(() => {
    if (!loggedIn) return
    const controller = new AbortController()
    setBusy(true)
    setError('')
    setData(null)
    fetch(
      `/api/visit-admin/data?days=${days}&country=${country}&page=${page}`,
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
  }, [loggedIn, days, country, page, refresh])
  const changeCountry = value => {
    setCountry(value)
    setPage(1)
    setSelected(null)
  }
  async function logout() {
    const response = await fetch('/api/visit-admin/session', {
      method: 'DELETE'
    })
    if (response.ok) {
      setLoggedIn(false)
      setData(null)
    }
  }
  const closeDetail = () => setSelected(null)
  const expired = () => {
    setLoggedIn(false)
    setSelected(null)
    setData(null)
  }
  const summary = data?.summary
  return (
    <>
      <Head>
        <title>访客后台 | 洛奇记事本</title>
        <meta name='robots' content='noindex,nofollow' />
      </Head>
      {!loggedIn ? (
        <Login configured={configured} onLogin={() => setLoggedIn(true)} />
      ) : (
        <div className={styles.dashboard}>
          <aside className={styles.sidebar}>
            <Link href='/' className={styles.brand}>
              <span>洛</span>
              <div>
                洛奇记事本<small>访客统计</small>
              </div>
            </Link>
            <div className={styles.workspace}>
              <i /> www.noginogi.sbs
            </div>
            <span className={styles.navLabel}>分析</span>
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
                访客与浏览路径
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
                <span className={styles.eyebrow}>VISITOR ANALYTICS</span>
                <h1>{tab === 'overview' ? '访客的足迹' : '访客与浏览路径'}</h1>
                <p>了解访客从哪里来，以及他们在看什么。</p>
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
                    className={days === value ? styles.selectedPeriod : ''}
                    key={value}
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
              <label>
                <Icon name='globe' />
                <select
                  aria-label='国家或地区筛选'
                  value={country}
                  onChange={e => changeCountry(e.target.value)}
                >
                  <option value=''>全部国家／地区</option>
                  {world
                    .filter(row => /^[A-Z]{2}$/.test(row.code))
                    .sort((a, b) =>
                      countryName(a.code).localeCompare(
                        countryName(b.code),
                        'zh-CN'
                      )
                    )
                    .map(row => (
                      <option key={row.code} value={row.code}>
                        {countryName(row.code)}
                      </option>
                    ))}
                </select>
              </label>
              <span className={styles.updated}>
                {data ? `更新于 ${time(data.generatedAt)}` : '北京时间'}
              </span>
            </div>
            <div className={styles.notice}>
              {process.env.NODE_ENV === 'development' && (
                <strong>本地测试环境 · </strong>
              )}
              后台统计页面打开次数，包含刷新；文章上显示的浏览次数继续按 5
              分钟去重。明细从功能启用后开始记录，保留 90 天。
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
                      '访问会话',
                      summary.sessions,
                      'globe',
                      '30 分钟未访问后新建'
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
                            <h2>访客地图</h2>
                            <p>IP 推断的大致地区，可能受到代理影响</p>
                          </div>
                          <span className={styles.pill}>
                            <i /> {data.countries.filter(row => row._id).length}{' '}
                            个地区
                          </span>
                        </div>
                        <WorldMap
                          locations={data.locations}
                          countries={data.countries}
                          country={country}
                          onCountry={changeCountry}
                        />
                      </section>
                      <section className={styles.panel}>
                        <div className={styles.panelHeading}>
                          <h2>地区分布</h2>
                          {country && (
                            <button
                              className={styles.textButton}
                              onClick={() => changeCountry('')}
                            >
                              清除筛选
                            </button>
                          )}
                        </div>
                        <div className={styles.regions}>
                          {data.countries.slice(0, 7).map((row, index) => (
                            <button
                              key={row._id || 'unknown'}
                              onClick={() => row._id && changeCountry(row._id)}
                            >
                              <span className={styles.rank}>
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <span>
                                {countryName(row._id)}
                                <small>{number(row.views)} 次打开</small>
                              </span>
                              <strong>
                                {number(row.visitors)}
                                <small>访客</small>
                              </strong>
                            </button>
                          ))}
                        </div>
                        {!data.countries.length && (
                          <p className={styles.empty}>还没有访客位置记录</p>
                        )}
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
                          <h2>访问来源</h2>
                        </div>
                        <Breakdown
                          rows={data.sources}
                          direct='直接访问／未提供来源'
                        />
                      </section>
                    </div>
                    <div className={styles.contentGrid}>
                      <section className={styles.panel}>
                        <div className={styles.panelHeading}>
                          <h2>热门页面</h2>
                          <span className={styles.muted}>按打开次数排序</span>
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
                            新访问产生后，热门页面将显示在这里
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
                      <h2>最近访客</h2>
                      <p>点击访客，查看访问顺序和页面行为</p>
                    </div>
                    <span className={styles.pill}>第 {page} 页</span>
                  </div>
                  <div className={styles.tableWrap}>
                    <table>
                      <thead>
                        <tr>
                          <th>匿名访客</th>
                          <th>大致位置</th>
                          <th>最近浏览</th>
                          <th>打开</th>
                          <th>前台停留</th>
                          <th>最近访问</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.visitors.map(visitor => (
                          <tr
                            key={visitor._id}
                            onClick={() => setSelected(visitor)}
                            className={styles.visitorRow}
                          >
                            <td>
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  setSelected(visitor)
                                }}
                                className={styles.visitorButton}
                              >
                                <span className={styles.avatar}>
                                  {visitor._id.slice(0, 2).toUpperCase()}
                                </span>
                                <span>
                                  访客 {visitor._id.slice(0, 8)}
                                  <small>
                                    {visitor.device} · {visitor.browser}
                                  </small>
                                </span>
                              </button>
                            </td>
                            <td>{locationName(visitor.location)}</td>
                            <td>
                              <span className={styles.lastPage}>
                                {visitor.lastTitle || visitor.lastPath}
                              </span>
                            </td>
                            <td>{visitor.views}</td>
                            <td>{duration(visitor.duration)}</td>
                            <td>{time(visitor.lastAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!data.visitors.length && (
                    <p className={styles.empty}>
                      目前还没有访问明细。功能启用后，新访客会出现在这里。
                    </p>
                  )}
                  <div className={styles.pagination}>
                    <span>每页最多 30 位访客 · 显示所选日期范围内的活动</span>
                    <div>
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(n => n - 1)}
                      >
                        上一页
                      </button>
                      <button
                        disabled={data.visitors.length < 30 || page >= 100}
                        onClick={() => setPage(n => n + 1)}
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}
            <footer className={styles.footer}>
              洛奇记事本 · 匿名访问统计{' '}
              <Link href='/privacy/analytics'>统计说明</Link>
            </footer>
          </main>
          {selected && (
            <VisitorDetail
              visitor={selected}
              days={days}
              country={country}
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
