import { AdSlot } from '@/components/GoogleAdsense'
import replaceSearchResult from '@/components/Mark'
import NotionPage from '@/components/NotionPage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import { Transition } from '@headlessui/react'
import ArticleContents from './components/ArticleContents'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useRef } from 'react'
import BlogPostBar from './components/BlogPostBar'
import HomeSections from './components/HomeSections'
import TopicIndex from './components/TopicIndex'
import ArticleInfo from './components/ArticleInfo'
import BlogArchiveItem from './components/BlogArchiveItem'
import CONFIG from './config'
import { Style } from './style'
import { VisitStatsProvider } from '@/components/VisitStats'

const AlgoliaSearchModal = dynamic(
  () => import('@/components/AlgoliaSearchModal'),
  { ssr: false }
)

// 主题组件
const BlogListScroll = dynamic(() => import('./components/BlogListScroll'))
const ArticleLock = dynamic(() => import('./components/ArticleLock'), {
  ssr: false
})
const Comment = dynamic(() => import('@/components/Comment'), { ssr: false })
const ArticleAround = dynamic(() => import('./components/ArticleAround'), {
  ssr: false
})
const ShareBar = dynamic(() => import('@/components/ShareBar'), { ssr: false })
const TopBar = dynamic(() => import('./components/TopBar'), { ssr: false })
const Header = dynamic(() => import('./components/Header'))
const NavBar = dynamic(() => import('./components/NavBar'))
const SideBar = dynamic(() => import('./components/SideBar'), { ssr: false })
const JumpToTopButton = dynamic(() => import('./components/JumpToTopButton'), {
  ssr: false
})
const Footer = dynamic(() => import('./components/Footer'), { ssr: false })
const SearchInput = dynamic(() => import('./components/SearchInput'), {
  ssr: false
})
const WWAds = dynamic(() => import('@/components/WWAds'), { ssr: false })
const BlogListPage = dynamic(() => import('./components/BlogListPage'))
const RecommendPosts = dynamic(() => import('./components/RecommendPosts'), {
  ssr: false
})

// 主题全局状态
const ThemeGlobalSimple = createContext()
export const useSimpleGlobal = () => useContext(ThemeGlobalSimple)

/**
 * 基础布局
 *
 * @param {*} props
 * @returns
 */
const LayoutBase = props => {
  const { children, slotTop } = props
  const { onLoading, fullWidth, isLiteMode } = useGlobal()
  const searchModal = useRef(null)
  const isReading = props.post?.type === 'Post'
  const journalLayout = Boolean(
    props.homeSections || props.archivePosts || props.topicPosts || props.moments || isReading
  )

  return (
    <VisitStatsProvider post={props.post}>
      <ThemeGlobalSimple.Provider value={{ searchModal }}>
        <div
          id='theme-simple'
          data-grouped-home={props.homeSections ? '' : undefined}
          data-reading-post={isReading ? '' : undefined}
          data-lite={isLiteMode || undefined}
          className={`${siteConfig('FONT_STYLE')} min-h-screen flex flex-col dark:text-gray-300  bg-white dark:bg-black scroll-smooth`}
        >
          <Style />
          {onLoading && <div role='progressbar' aria-label='正在载入页面' className='journal-route-progress' />}

          {siteConfig('SIMPLE_TOP_BAR', null, CONFIG) && <TopBar {...props} />}

          {/* 顶部LOGO */}
          <Header
            {...props}
            compact={isReading || Boolean(props.archivePosts || props.topicPosts || props.moments)}
          />

          {/* 导航栏 */}
          <NavBar {...props} />

          {/* 主体 */}
          <div
            id='container-wrapper'
            className={
              (JSON.parse(siteConfig('LAYOUT_SIDEBAR_REVERSE'))
                ? 'flex-row-reverse'
                : '') +
              ' w-full flex-1 flex items-start max-w-9/10 mx-auto pt-12'
            }
          >
            <div id='container-inner' className='w-full flex-grow min-h-fit'>
              <Transition
                show={!onLoading}
                enter='transition-opacity ease-out duration-200'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='transition-opacity ease-in duration-150'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
                unmount={false}
              >
                {slotTop}

                {children}
              </Transition>
              <AdSlot type='native' />
            </div>

            {fullWidth || journalLayout ? null : (
              <div
                id='right-sidebar'
                className='hidden xl:block flex-none sticky top-8 w-96 border-l dark:border-gray-800 pl-12 border-gray-100'
              >
                <SideBar {...props} />
              </div>
            )}
          </div>

          <div className='fixed right-4 bottom-4 z-20'>
            <JumpToTopButton />
          </div>

          {/* 搜索框 */}
          <AlgoliaSearchModal cRef={searchModal} {...props} />

          <Footer {...props} />
        </div>
      </ThemeGlobalSimple.Provider>
    </VisitStatsProvider>
  )
}

/**
 * 博客首页
 * @param {*} props
 * @returns
 */
const LayoutIndex = props => {
  if (props.homeSections)
    return <HomeSections {...props.homeSections} notice={props.notice} />
  return <LayoutPostList {...props} />
}
/**
 * 博客列表
 * @param {*} props
 * @returns
 */
const LayoutPostList = props => {
  return (
    <>
      <BlogPostBar {...props} />
      {siteConfig('POST_LIST_STYLE') === 'page' ? (
        <BlogListPage {...props} />
      ) : (
        <BlogListScroll {...props} />
      )}
    </>
  )
}

/**
 * 搜索页
 * 也是博客列表
 * @param {*} props
 * @returns
 */
const LayoutSearch = props => {
  const { keyword } = props

  useEffect(() => {
    if (isBrowser) {
      replaceSearchResult({
        doms: document.getElementById('posts-wrapper'),
        search: keyword,
        target: {
          element: 'span',
          className: 'text-red-500 border-b border-dashed'
        }
      })
    }
  }, [])

  const slotTop = siteConfig('ALGOLIA_APP_ID') ? null : (
    <SearchInput {...props} />
  )

  return <LayoutPostList {...props} slotTop={slotTop} />
}

/**
 * 归档页
 * @param {*} props
 * @returns
 */
const LayoutArchive = props => {
  const { archivePosts } = props
  const months = Object.keys(archivePosts)
  return (
    <main className='journal-archive'>
      <div className='journal-archive-heading'>
        <div>
          <h1>按时间看文章</h1>
          <p>全部分类 · 按发文时间从新到旧</p>
        </div>
        {months.length > 1 && (
          <label>
            跳转月份{' '}
            <select
              defaultValue=''
              onChange={event => {
                if (event.target.value)
                  window.location.hash = event.target.value
              }}
            >
              <option value=''>选择月份</option>
              {months.map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {months.map(month => (
        <BlogArchiveItem
          key={month}
          archiveTitle={month}
          archivePosts={archivePosts}
        />
      ))}
      {!months.length && <p>还没有发布文章。</p>}
    </main>
  )
}

/**
 * 文章详情
 * @param {*} props
 * @returns
 */
const LayoutSlug = props => {
  const { post, lock, validPassword, prev, next, recommendPosts } = props
  const { fullWidth } = useGlobal()

  return (
    <>
      {lock && <ArticleLock validPassword={validPassword} />}

      {!lock && post && (
        <div
          className={
            post.type === 'Post'
              ? 'journal-reading' + (fullWidth ? ' journal-reading-wide' : '')
              : `px-2 ${fullWidth ? '' : 'xl:max-w-4xl 2xl:max-w-6xl'}`
          }
        >
          {/* 文章信息 */}
          <ArticleInfo post={post} />
          {post.type === 'Post' && post.toc?.length > 0 && (
            <ArticleContents key={post.id} items={post.toc} />
          )}

          {/* 广告嵌入 */}
          {/* <AdSlot type={'in-article'} /> */}
          <WWAds orientation='horizontal' className='w-full' />

          <div id='article-wrapper'>
            {/* Notion文章主体 */}
            {!lock && <NotionPage post={post} />}
          </div>

          {/* 分享 */}
          <ShareBar post={post} />

          {/* 广告嵌入 */}
          <AdSlot type={'in-article'} />

          {post?.type === 'Post' && (
            <>
              <ArticleAround prev={prev} next={next} />
              <RecommendPosts recommendPosts={recommendPosts} />
            </>
          )}

          {/* 评论区 */}
          <Comment frontMatter={post} />
        </div>
      )}
    </>
  )
}

/**
 * 404
 * @param {*} props
 * @returns
 */
const Layout404 = props => {
  const { post } = props
  const router = useRouter()
  const waiting404 = siteConfig('POST_WAITING_TIME_FOR_404') * 1000
  useEffect(() => {
    // 404
    if (!post) {
      setTimeout(() => {
        if (isBrowser) {
          const article = document.querySelector(
            '#article-wrapper #notion-article'
          )
          if (!article) {
            router.push('/404').then(() => {
              console.warn('找不到页面', router.asPath)
            })
          }
        }
      }, waiting404)
    }
  }, [post])
  return <>404 Not found.</>
}

/**
 * 分类列表
 * @param {*} props
 * @returns
 */
const LayoutCategoryIndex = TopicIndex
const LayoutTagIndex = TopicIndex

export {
  Layout404,
  LayoutArchive,
  LayoutBase,
  LayoutCategoryIndex,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG
}
