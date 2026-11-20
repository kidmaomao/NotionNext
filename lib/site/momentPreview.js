import { isMomentPage } from '@/lib/site/typedCollections'
import { getPostBlocks } from '@/lib/db/SiteDataApi'
import { mapImgUrl } from '@/lib/db/notion/mapImage'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'
import { getPublicPostBlockMap, normalizePostId } from '@/lib/utils/publicPost'

const textTypes = new Set([
  'text',
  'quote',
  'bulleted_list',
  'numbered_list',
  'callout',
  'header',
  'sub_header',
  'sub_sub_header'
])
const plain = runs =>
  (runs || [])
    .map(run => (typeof run[0] === 'string' ? run[0] : ''))
    .join('')
    .trim()

function pictureWidth(format) {
  if (format?.block_full_width || format?.block_page_width) return '100%'
  const value = format?.block_width
  const width = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(width) && width > 0 ? width : undefined
}

/** Project only the note's own top-level paragraphs and pictures into its public feed. */
export async function readMomentPreview(note, post, allPages) {
  if (
    !post?.id ||
    post.password ||
    post.status !== 'Published' ||
    !isMomentPage(post)
  )
    return note
  try {
    const raw = await getPostBlocks(post.id, 'say', {
      cacheVersion: post.lastEditedDate
    })
    if (!raw?.block) return note
    const { block } = getPublicPostBlockMap(
      post,
      adapterNotionBlockMap(raw),
      allPages
    )
    const byId = new Map(
      Object.entries(block).map(([id, entry]) => [
        normalizePostId(id),
        entry.value
      ])
    )
    const root = byId.get(normalizePostId(post.id))
    const paragraphs = []
    const pictures = []
    for (const id of root?.content || []) {
      const child = byId.get(normalizePostId(id))
      if (textTypes.has(child?.type)) {
        const text = plain(child.properties?.title)
        if (text) paragraphs.push(text)
      } else if (child?.type === 'image') {
        const source =
          child.properties?.source?.[0]?.[0] || child.format?.display_source
        const src = mapImgUrl(source, child)
        if (src && /^(https?:\/\/|\/)/i.test(src)) {
          const width = pictureWidth(child.format)
          pictures.push({
            src,
            caption: plain(child.properties?.caption),
            ...(width ? { width } : {})
          })
        }
      }
    }
    const body = paragraphs.join('\n\n')
    return {
      ...note,
      text: body || note.text,
      ...(pictures.length ? { pictures } : {})
    }
  } catch (error) {
    console.warn(
      '[Say] Could not read the published note:',
      post.id,
      error.message
    )
    return note
  }
}
