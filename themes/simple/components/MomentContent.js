import { NotionRenderer, Text } from 'react-notion-x'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import NotionLink from '@/components/NotionLink'
import NotionEmbed from '@/components/NotionEmbed'
import { mapImgUrl } from '@/lib/db/notion/mapImage'
import { normalizeTitlelessQuoteBlocks } from '@/lib/notion/normalizeTitlelessQuoteBlocks'

const Equation = dynamic(() =>
  import('@/components/Equation').then(m => m.Equation)
)
const Pdf = dynamic(() => import('@/components/Pdf').then(m => m.Pdf), {
  ssr: false
})
const TweetEmbed = dynamic(() => import('react-tweet-embed'), { ssr: false })

const components = {
  Link: NotionLink,
  PageLink: NotionLink,
  Embed: NotionEmbed,
  Equation,
  Pdf,
  Tweet: ({ id }) => <TweetEmbed tweetId={id} />,
  Code: ({ block }) => (
    <pre className='notion-code'>
      <code>
        <Text value={block.properties?.title} block={block} />
      </code>
    </pre>
  ),
  Image: ({ src, alt, className, style }) => (
    <img
      src={src}
      alt={alt || '说说配图'}
      className={className}
      style={style}
      loading='lazy'
      decoding='async'
    />
  )
}

export default function MomentContent({ note }) {
  const recordMap = useMemo(
    () => normalizeTitlelessQuoteBlocks(note.blockMap),
    [note.blockMap]
  )
  if (
    recordMap &&
    Object.values(recordMap.block).some(entry => entry.value.type !== 'page')
  ) {
    return (
      <NotionRenderer
        recordMap={recordMap}
        className='journal-say-content'
        mapImageUrl={(src, block) =>
          mapImgUrl(src, {
            ...block,
            format: {
              ...block.format,
              block_width:
                typeof block.format?.block_width === 'number'
                  ? block.format.block_width
                  : undefined
            }
          })
        }
        mapPageUrl={id => '/' + id.replace(/-/g, '')}
        components={components}
        fullPage={false}
        isImageZoomable={false}
        forceCustomImages
      />
    )
  }
  return (
    <>
      <p>{note.text}</p>
      {note.pictures?.map((image, index) => (
        <figure key={index}>
          <img
            src={image.src}
            alt={image.caption || '说说配图'}
            className={image.width ? undefined : 'journal-say-thumbnail'}
            style={image.width ? { width: image.width } : undefined}
            loading='lazy'
            decoding='async'
          />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      ))}
    </>
  )
}
