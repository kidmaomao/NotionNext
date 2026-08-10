/**
 * react-notion-x 7.10.0 skips quote blocks that do not have a properties
 * object. Newer Notion quote containers can store all visible content in
 * child blocks instead, so add an empty title only for those containers.
 *
 * The returned record map shares all unchanged data with the input and never
 * mutates the source map.
 */
export function normalizeTitlelessQuoteBlocks(recordMap) {
  const blocks = recordMap?.block
  if (!blocks || typeof blocks !== 'object') return recordMap

  let normalizedBlocks = blocks

  for (const [blockId, blockRecord] of Object.entries(blocks)) {
    const block = blockRecord?.value
    if (!isTitlelessQuoteContainer(block)) continue

    if (normalizedBlocks === blocks) {
      normalizedBlocks = { ...blocks }
    }

    normalizedBlocks[blockId] = {
      ...blockRecord,
      value: {
        ...block,
        properties: { title: [] }
      }
    }
  }

  if (normalizedBlocks === blocks) return recordMap

  return {
    ...recordMap,
    block: normalizedBlocks
  }
}

function isTitlelessQuoteContainer(block) {
  return (
    block?.type === 'quote' &&
    !block.properties &&
    Array.isArray(block.content) &&
    block.content.length > 0
  )
}
