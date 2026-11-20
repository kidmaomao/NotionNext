import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import { simpleCategoryHref } from '../homepage'
import SocialButton from './SocialButton'

/**
 * 网站顶部
 * @returns
 */
export default function Header(props) {
  const { siteInfo, homeSections, compact } = props
  const moment = homeSections?.latestMoment

  if (compact) {
    return (
      <header className='journal-masthead'>
        <SmartLink href='/'>{siteInfo?.title || siteConfig('TITLE')}</SmartLink>
        <SmartLink href='/archive' prefetch={false}>
          按时间看
        </SmartLink>
      </header>
    )
  }

  return (
    <header
      className={`text-center justify-between items-center px-6 bg-white h-80 dark:bg-black relative z-10${homeSections ? ' simple-home-header' : ''}${moment ? ' journal-with-moment' : ''}`}
    >
      {moment && (
        <aside className='journal-moment' aria-label='最近的说说'>
          <SmartLink
            className='journal-moment-label'
            href={simpleCategoryHref('说说')}
          >
            最近的说说 <span aria-hidden='true'>↗</span>
          </SmartLink>
          <SmartLink className='journal-moment-text' href={moment.href}>
            {moment.text}
          </SmartLink>
          {moment.date && <time dateTime={moment.date}>{moment.date}</time>}
        </aside>
      )}
      <div className='float-none inline-block py-12'>
        <SmartLink href='/'>
          {/* 可使用一张单图作为logo */}
          <div className='flex space-x-6 justify-center'>
            <div className='hover:rotate-45 hover:scale-125 transform duration-200 cursor-pointer justify-center items-center flex'>
              <LazyImage
                priority={true}
                src={siteInfo?.icon}
                className='rounded-full'
                width={100}
                height={100}
                alt={siteConfig('AUTHOR')}
              />
            </div>

            <div className='flex-col flex justify-center'>
              <div className='text-2xl font-serif dark:text-white py-2 hover:scale-105 transform duration-200'>
                {siteConfig('AUTHOR')}
              </div>
              <div
                className='font-light dark:text-white py-2 hover:scale-105 transform duration-200 text-center'
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
    </header>
  )
}
