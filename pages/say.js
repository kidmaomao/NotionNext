import BLOG from '@/blog.config'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { getPublishedTypedPages } from '@/lib/site/typedCollections'
import { buildSimpleMoments } from '@/themes/simple/homepage'
import { readMomentPreview } from '@/lib/site/momentPreview'
import pLimit from 'p-limit'

export default function SayPage({ moments }) {
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
                  <SmartLink
                    href={note.href}
                    aria-label={'查看说说原文，' + note.title}
                    prefetch={false}
                  >
                    查看原文 <span aria-hidden='true'>↗</span>
                  </SmartLink>
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
    type: 'Post'
  })
  const byHref = new Map(posts.map(post => [post.href, post]))
  const limit = pLimit(3)
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
