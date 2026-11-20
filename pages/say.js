import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { getPublishedTypedPages } from '@/lib/site/typedCollections'
import { readMomentPreview } from '@/lib/site/momentPreview'
import {
  buildSimpleMoments,
  getMomentCommentProvider
} from '@/themes/simple/homepage'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import pLimit from 'p-limit'

const Twikoo = dynamic(() => import('@/components/Twikoo'), { ssr: false })
const NotionComments = dynamic(() => import('@/components/NotionComments'), {
  ssr: false
})

function MomentComments({ note, provider }) {
  return (
    <div
      className='journal-say-comments'
      role='region'
      aria-label={'评论，' + (note.title || note.date || '说说')}
    >
      {provider === 'twikoo' ? (
        <Twikoo containerId={'twikoo-' + note.anchor} threadPath={note.href} />
      ) : (
        <NotionComments postId={note.id} />
      )}
    </div>
  )
}

export default function SayPage({ moments, momentCommentProvider }) {
  const [open, setOpen] = useState(null)
  useEffect(() => {
    function fromHash() {
      const hash = window.location.hash.slice(1)
      const target = moments.find(
        note => note.comments && 'comments-' + note.anchor === hash
      )
      setOpen(target?.anchor || null)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [moments])
  return (
    <main className='journal-say'>
      <header className='journal-page-heading'>
        <h1>说说</h1>
        <p>洛奇近况、临时提醒，还有游戏里的小事。</p>
      </header>
      {moments.length ? (
        <ol className='journal-say-feed'>
          {moments.map((note, index) => (
            <li key={note.anchor} id={note.anchor}>
              {(index === 0 ||
                note.date.slice(0, 4) !==
                  moments[index - 1].date.slice(0, 4)) && (
                <h2>{note.date.slice(0, 4) || '日期未记录'}</h2>
              )}
              <article>
                <time dateTime={note.date + (note.time ? 'T' + note.time : '')}>
                  {note.date.slice(5).replace('-', ' / ')}
                  {note.time && <span>{note.time}</span>}
                </time>
                <div className='journal-say-bubble'>
                  <p>{note.text}</p>
                  {note.pictures?.map((image, index) => (
                    <figure key={index}>
                      <img
                        src={image.src}
                        alt={image.caption || '说说配图'}
                        loading='lazy'
                        decoding='async'
                      />
                      {image.caption && (
                        <figcaption>{image.caption}</figcaption>
                      )}
                    </figure>
                  ))}
                  {note.comments && momentCommentProvider && (
                    <>
                      <div
                        className='journal-say-actions'
                        id={'comments-' + note.anchor}
                      >
                        <button
                          type='button'
                          aria-expanded={open === note.anchor}
                          aria-controls={'thread-' + note.anchor}
                          onClick={() => {
                            const target =
                              open === note.anchor ? null : note.anchor
                            setOpen(target)
                            const hash = target
                              ? 'comments-' + target
                              : note.anchor
                            window.history.replaceState(
                              window.history.state,
                              '',
                              '#' + hash
                            )
                          }}
                        >
                          <i aria-hidden='true' className='far fa-comment' />
                          {open === note.anchor ? '收起评论' : '评论'}
                        </button>
                      </div>
                      <div
                        id={'thread-' + note.anchor}
                        hidden={open !== note.anchor}
                      >
                        {open === note.anchor && (
                          <MomentComments
                            note={note}
                            provider={momentCommentProvider}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <p className='journal-say-empty'>暂时还没有公开的说说。</p>
      )}
    </main>
  )
}

export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({ from: 'say-index-props', locale })
  const posts = getPublishedTypedPages({
    allPages: props.allPages,
    type: 'Moment'
  })
  const byHref = new Map(posts.map(post => [post.href, post]))
  const limit = pLimit(3)
  props.momentCommentProvider = getMomentCommentProvider(props.NOTION_CONFIG)
  props.moments = await Promise.all(
    buildSimpleMoments(posts).map(note =>
      limit(() =>
        readMomentPreview(note, byHref.get(note.href), props.allPages)
      )
    )
  )
  delete props.allPages
  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}
