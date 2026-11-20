import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import CONFIG from '../config'

function withoutCategoryOverview(links) {
  return links.flatMap(link => {
    const subMenus = link?.subMenus
    if (!subMenus?.length) return link?.href === '/category' ? [] : [link]

    const remaining = subMenus.filter(item => item.href !== '/category')
    if (remaining.length === subMenus.length) return [link]
    if (remaining.length === 0) return []

    const [tag] = remaining
    if (remaining.length === 1 && tag.href === '/tag') {
      return [{ ...tag, name: tag.title, show: link.show, target: link.target }]
    }

    return [{ ...link, subMenus: remaining }]
  })
}

function Entry({ link, path, target }) {
  const label = (
    <>
      {link.icon && <i className={link.icon} aria-hidden='true' />}
      {link.name || link.title}
    </>
  )
  if (link.subMenus?.length) {
    return (
      <details className='journal-nav-group'>
        <summary>
          {label}
          <span aria-hidden='true'>⌄</span>
        </summary>
        <div className='journal-nav-popover'>
          {link.subMenus.map(item => (
            <Entry
              key={item.href || item.title}
              link={item}
              path={path}
              target={link.target}
            />
          ))}
        </div>
      </details>
    )
  }
  return (
    <SmartLink
      href={link.href}
      prefetch={false}
      target={link.target || target}
      aria-current={path === link.href ? 'page' : undefined}
    >
      {label}
    </SmartLink>
  )
}

export const MenuList = ({ customNav, customMenu }) => {
  const { locale } = useGlobal()
  const router = useRouter()
  const nav = useRef(null)
  useEffect(() => {
    const menus = nav.current
    const close = () =>
      menus?.querySelectorAll('details[open]').forEach(item => {
        item.open = false
      })
    const outside = event => {
      if (!menus?.contains(event.target)) close()
    }
    const escape = event => {
      if (event.key !== 'Escape') return
      const active = document.activeElement?.closest('details[open]')
      if (active && menus?.contains(active)) {
        active.open = false
        active.querySelector('summary')?.focus()
      } else close()
    }
    router.events.on('routeChangeStart', close)
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      router.events.off('routeChangeStart', close)
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [router.events])

  const defaults = [
    {
      icon: 'fas fa-search',
      name: locale.NAV.SEARCH,
      href: '/search',
      show: siteConfig('SIMPLE_MENU_SEARCH', null, CONFIG)
    },
    ...(customNav || [])
  ]
  const links = withoutCategoryOverview(
    (siteConfig('CUSTOM_MENU') ? customMenu : defaults) || []
  ).filter(link => link?.show)
  const primary = [
    { href: '/', name: '首页', icon: 'fas fa-home' },
    { href: '/tag', name: '文章标签', icon: 'fas fa-tag' },
    { href: '/say', name: '说说', icon: 'far fa-comment-dots' },
    { href: '/archive', name: '按时间看', icon: 'far fa-clock' }
  ].map(link => ({
    ...link,
    ...(links.find(item => item.href === link.href && !item.subMenus?.length) ||
      {}),
    ...(link.href === '/archive' ? { name: '按时间看' } : {})
  }))
  const others = links.filter(
    link =>
      !primary.some(item => item.href === link.href && !link.subMenus?.length)
  )
  const path = router.asPath.split(/[?#]/)[0]
  const entries = list =>
    list.map(link => (
      <Entry key={link.name || link.href} link={link} path={path} />
    ))
  return (
    <div ref={nav} className='journal-nav-links'>
      <div className='journal-nav-desktop'>
        {entries(primary)}
        <div className='journal-nav-extra'>{entries(others.slice(0, 5))}</div>
        {others.length > 0 && (
          <details className='journal-nav-group journal-nav-overflow' data-extra={others.length > 5 || undefined}>
            <summary>
              更多 <span aria-hidden='true'>⌄</span>
            </summary>
            <div className='journal-nav-popover'>
              <div className='journal-nav-compact-only'>{entries(others.slice(0, 5))}</div>
              {entries(others.slice(5))}
            </div>
          </details>
        )}
      </div>
      <details className='journal-nav-mobile journal-nav-group'>
        <summary>
          <i className='fas fa-bars' aria-hidden='true' /> 菜单
        </summary>
        <div className='journal-nav-popover'>
          {entries([...primary, ...others])}
        </div>
      </details>
    </div>
  )
}
