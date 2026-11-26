import { isMomentPage } from '@/lib/site/typedCollections'
import { getPostBlocks } from '@/lib/db/SiteDataApi'
import { mapImgUrl } from '@/lib/db/notion/mapImage'
import {
  adapterNotionBlockMap,
  normalizeNotionBlockType
} from '@/lib/utils/notion.util'
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

/** Keep the note's body tree, without serializing nested pages or databases. */
function momentBody(recordMap, post, allPages) {
  const records = new Map(
    Object.entries(recordMap.block).map(([id, entry]) => [
      normalizePostId(id),
      { ...entry.value, id: entry.value.id || id }
    ])
  )
  const root = records.get(normalizePostId(post.id))
  if (!root) return null
  const block = {}
  const signed_urls = {}
  const visit = (id, parent) => {
    const source = records.get(normalizePostId(id))
    if (!source || block[source.id]) return null
    if (
      parent &&
      ['page', 'collection_view', 'collection_view_page'].includes(source.type)
    )
      return null
    const value = {
      id: source.id,
      type: normalizeNotionBlockType(source.type),
      properties: parent ? source.properties || { title: [] } : { title: [] },
      format: parent ? { ...source.format } : {},
      ...(parent ? { parent_id: parent, parent_table: 'block' } : {})
    }
    block[value.id] = { value }
    if (source.type === 'image') {
      const width = pictureWidth(source.format)
      value.format.block_full_width = false
      value.format.block_page_width = width === '100%'
      value.format.block_width =
        typeof width === 'number' ? width : 'min(100%, 20rem)'
      // Let the natural aspect ratio determine height inside the narrow feed.
      delete value.format.block_height
      delete value.format.block_preserve_scale
      if (!value.properties.source && source.format?.display_source) {
        value.properties = {
          ...value.properties,
          source: [[source.format.display_source]]
        }
      }
    }
    const signed = recordMap.signed_urls?.[source.id]
    if (signed) signed_urls[source.id] = signed
    value.content = (source.content || [])
      .map(child => visit(child, value.id))
      .filter(Boolean)
    return value.id
  }
  visit(root.id)

  // Page mentions need only the public title/icon, never the referenced body.
  const publicPages = new Set(
    (allPages || [])
      .filter(page => page.status === 'Published' && !page.password)
      .map(page => normalizePostId(page.id))
  )
  for (const entry of Object.values(block)) {
    for (const runs of Object.values(entry.value.properties)) {
      for (const run of Array.isArray(runs) ? runs : []) {
        for (const decoration of run[1] || []) {
          if (decoration[0] !== 'p') continue
          const id = decoration[1]
          const page = records.get(normalizePostId(id))
          if (!page || !publicPages.has(normalizePostId(id)) || block[id])
            continue
          block[id] = {
            value: {
              id,
              type: 'page',
              properties: { title: page.properties?.title || [] },
              format: { page_icon: page.format?.page_icon || '' }
            }
          }
        }
      }
    }
  }
  return {
    block,
    signed_urls,
    notion_user: {},
    collection: {},
    collection_view: {},
    collection_query: {}
  }
}

/** Read the public body and retain a plain summary for the homepage bubble. */
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
    const publicMap = getPublicPostBlockMap(
      post,
      adapterNotionBlockMap(raw),
      allPages
    )
    const { block } = publicMap
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
      blockMap: momentBody(publicMap, post, allPages),
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
