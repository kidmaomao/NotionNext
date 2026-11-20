import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useEffect, useRef, useState } from 'react'
import CONFIG from '../config'
import SocialButton from './SocialButton'

function Profile({ siteInfo }) {
  return (
    <div className='journal-profile'>
      <SmartLink href='/'>
        <div className='flex space-x-6 justify-center'>
          <div className='hover:rotate-45 hover:scale-125 transform duration-200 flex items-center'>
            <LazyImage
              priority
              src={siteInfo?.icon}
              className='rounded-full'
              width={100}
              height={100}
              alt={siteConfig('AUTHOR')}
            />
          </div>
          <div className='flex-col flex justify-center'>
            <div className='text-2xl font-serif dark:text-white py-2'>
              {siteConfig('AUTHOR')}
            </div>
            <div
              className='font-light dark:text-white py-2 text-center'
              dangerouslySetInnerHTML={{
                __html: siteConfig('SIMPLE_LOGO_DESCRIPTION', null, CONFIG)
              }}
            />
          </div>
        </div>
      </SmartLink>
      <div className='flex justify-center'>
        <SocialButton />
      </div>
      <div className='text-xs mt-4 text-gray-500 dark:text-gray-300'>
        {siteConfig('DESCRIPTION')}
      </div>
    </div>
  )
}

function HomeCover({ siteInfo, moment, lite }) {
  const [showNote, setShowNote] = useState(false)
  const [reading, setReading] = useState(false)
  const [arrived, setArrived] = useState(false)
  const intro = useRef(null)
  const auto = useRef(null)

  useEffect(() => {
    setArrived(true)
    if (!moment || lite) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!motion.matches) {
      auto.current = setTimeout(() => {
        if (
          !document.hidden &&
          !motion.matches &&
          !intro.current?.contains(document.activeElement)
        )
          setShowNote(true)
      }, 4200)
    }
    return () => clearTimeout(auto.current)
  }, [moment?.anchor, lite])

  useEffect(() => {
    if (!showNote || reading) return
    const timer = setTimeout(() => setShowNote(false), 6500)
    return () => clearTimeout(timer)
  }, [showNote, reading])

  return (
    <header
      className='text-center h-80 relative z-10 simple-home-header'
      data-arrived={arrived || undefined}
      data-view={showNote ? 'note' : 'profile'}
    >
      <div className='journal-hero-stage'>
        <div
          className='journal-hero-profile'
          ref={intro}
          aria-hidden={showNote}
          inert={showNote ? '' : undefined}
        >
          <Profile siteInfo={siteInfo} />
        </div>
        {moment && (
          <aside
            className='journal-thought'
            aria-label='最近的说说'
            aria-hidden={!showNote}
            inert={showNote ? undefined : ''}
            onPointerEnter={() => setReading(true)}
            onPointerLeave={event =>
              setReading(event.currentTarget.contains(document.activeElement))
            }
            onFocus={() => setReading(true)}
            onBlur={event =>
              setReading(event.currentTarget.contains(event.relatedTarget))
            }
          >
            <span className='journal-thought-seal' aria-hidden='true'>
              <i className='fas fa-paw' />
            </span>
            <SmartLink className='journal-thought-label' href='/say'>
              最近的说说 <span aria-hidden='true'>↗</span>
            </SmartLink>
            <SmartLink
              className='journal-thought-text'
              href={'/say#' + moment.anchor}
            >
              {moment.text}
            </SmartLink>
            <footer>
              <time dateTime={moment.date}>
                {[moment.date, moment.time].filter(Boolean).join(' ')}
              </time>
              {moment.comments !== false && (
                <SmartLink href={'/say#comments-' + moment.anchor}>
                  <i className='far fa-comment' aria-hidden='true' /> 评论
                </SmartLink>
              )}
            </footer>
          </aside>
        )}
      </div>
      {moment && (
        <button
          className='journal-hero-switch'
          type='button'
          aria-pressed={showNote}
          aria-label={showNote ? '返回站长介绍' : '看最近的说说'}
          title={showNote ? '返回站长介绍' : '看最近的说说'}
          onClick={() => {
            clearTimeout(auto.current)
            setReading(false)
            setShowNote(visible => !visible)
          }}
        >
          <i
            className={showNote ? 'fas fa-paw' : 'far fa-comment-dots'}
            aria-hidden='true'
          />
        </button>
      )}
    </header>
  )
}

export default function Header({ siteInfo, homeSections, compact, lite }) {
  if (compact)
    return (
      <header className='journal-masthead'>
        <SmartLink href='/'>{siteInfo?.title || siteConfig('TITLE')}</SmartLink>
      </header>
    )
  if (homeSections)
    return (
      <HomeCover
        key={homeSections.latestMoment?.anchor || 'profile'}
        siteInfo={siteInfo}
        moment={homeSections.latestMoment}
        lite={lite}
      />
    )
  return (
    <header className='text-center justify-between items-center px-6 bg-white h-80 dark:bg-black relative z-10'>
      <div className='float-none inline-block py-12'>
        <Profile siteInfo={siteInfo} />
      </div>
    </header>
  )
}
