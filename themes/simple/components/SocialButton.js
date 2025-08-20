import { siteConfig } from '@/lib/config'

/**
 * 社交联系方式按钮组
 * @returns {JSX.Element}
 * @constructor
 */
const SocialButton = () => {
  return (
    <div className='w-52 justify-center flex-wrap flex my-2'>
      <div className='space-x-5 md:text-xl text-3xl text-gray-600 dark:text-gray-400 text-center'>
        {siteConfig('CONTACT_WEIBO') && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'weibo'}
            href={siteConfig('CONTACT_WEIBO')}>
            <i className='fab fa-weibo transform hover:scale-125 duration-150' />
          </a>
        )}
        {siteConfig('CONTACT_INSTAGRAM') && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'instagram'}
            href={siteConfig('CONTACT_INSTAGRAM')}>
            <i className='fab fa-instagram transform hover:scale-125 duration-150' />
          </a>
        )}
        {siteConfig('CONTACT_EMAIL') && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'email'}
            href={`mailto:${siteConfig('CONTACT_EMAIL')}`}>
            <i className='fas fa-envelope transform hover:scale-125 duration-150' />
          </a>
        )}
        {JSON.parse(siteConfig('ENABLE_RSS')) && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'RSS'}
            href={'/rss/feed.xml'}>
            <i className='fas fa-rss transform hover:scale-125 duration-150' />
          </a>
        )}
        {siteConfig('CONTACT_BILIBILI') && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'bilibili'}
            href={siteConfig('CONTACT_BILIBILI')}>
            <i className='fab fa-bilibili transform hover:scale-125 duration-150' />
          </a>
        )}
         {siteConfig('CONTACT_YOUTUBE') && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'youtube'}
            href={siteConfig('CONTACT_YOUTUBE')}>
            <i className='fab fa-youtube transform hover:scale-125 duration-150' />
          </a>
        )}
        {siteConfig('CONTACT_THREADS') && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'threads'}
            href={siteConfig('CONTACT_THREADS')}>
            <i className='fab fa-threads transform hover:scale-125 duration-150' />
          </a> 
        )}
      </div>
    </div>
  )
}
export default SocialButton
