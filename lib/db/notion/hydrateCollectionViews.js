import { getBlockValue } from 'notion-utils'

/**
 * loadPageChunk can omit the view records of an inline database even though
 * queryCollection returns its rows. Load that database's own chunk to recover
 * the actual view settings; never guess a view type or change its ordering.
 */
export async function hydrateCollectionViews(recordMap, api) {
  let changed = false
  const databases = Object.values(recordMap?.block || {})
    .map(getBlockValue)
    .filter(
      block =>
        ['collection_view', 'collection_view_page'].includes(block?.type) &&
        block.view_ids?.some(
          id => !getBlockValue(recordMap.collection_view?.[id])?.type
        )
    )

  for (const block of databases) {
    try {
      const chunk = await api.getPageRaw(block.id)
      const source = chunk?.recordMap
      const collectionId =
        block.collection_id || block.format?.collection_pointer?.id
      for (const viewId of block.view_ids) {
        if (getBlockValue(recordMap.collection_view?.[viewId])?.type) continue
        const view = getBlockValue(source?.collection_view?.[viewId])
        if (!view?.id || !view?.type) continue

        recordMap.collection_view ||= {}
        recordMap.collection_view[viewId] = { value: view }
        changed = true

        // The first query ran without this view's filters/grouping. Query
        // again with its real settings, retaining existing rows on failure.
        if (!collectionId) continue
        try {
          const data = await api.getCollectionData(collectionId, viewId, view, {
            spaceId: block.space_id || block.format?.collection_pointer?.spaceId
          })
          for (const table of ['block', 'collection']) {
            recordMap[table] = {
              ...recordMap[table],
              ...data?.recordMap?.[table]
            }
          }
          if (data?.result?.reducerResults) {
            recordMap.collection_query ||= {}
            recordMap.collection_query[collectionId] ||= {}
            recordMap.collection_query[collectionId][viewId] =
              data.result.reducerResults
          }
        } catch (error) {
          console.warn('[CollectionView] query failed:', viewId, error.message)
        }
      }
    } catch (error) {
      console.warn('[CollectionView] hydrate failed:', block.id, error.message)
    }
  }
  return changed
}
