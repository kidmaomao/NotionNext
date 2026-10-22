jest.mock('notion-utils', () => ({
  getBlockValue: entry => entry?.value?.value || entry?.value || entry
}))

import { hydrateCollectionViews } from '@/lib/db/notion/hydrateCollectionViews'

const view = {
  id: 'gallery',
  type: 'gallery',
  format: {
    gallery_cover: { type: 'property', property: 'preview' },
    property_filters: [
      {
        filter: {
          property: 'category',
          filter: {
            operator: 'enum_is',
            value: { type: 'exact', value: '衣服' }
          }
        }
      }
    ]
  },
  query2: { sort: [{ property: 'order', direction: 'ascending' }] }
}
const rowIds = Array.from({ length: 38 }, (_, i) => `reward-${i}`)

function fixture() {
  return {
    block: {
      article: { value: { id: 'article', type: 'page', content: ['inline'] } },
      inline: {
        value: {
          value: {
            id: 'inline',
            type: 'collection_view',
            collection_id: 'rewards',
            space_id: 'workspace',
            view_ids: ['gallery', 'table']
          }
        }
      }
    },
    collection: { rewards: { value: { id: 'rewards' } } },
    collection_query: { rewards: { gallery: { blockIds: rowIds } } }
  }
}

function apiFixture() {
  return {
    getPageRaw: jest.fn().mockResolvedValue({
      recordMap: {
        collection_view: {
          gallery: {
            spaceId: 'workspace',
            value: { value: view, role: 'reader' }
          },
          table: { value: { id: 'table', type: 'table' } },
          unrelated: { value: { id: 'unrelated', type: 'board' } }
        }
      }
    }),
    getCollectionData: jest.fn().mockResolvedValue({
      result: {
        reducerResults: { collection_group_results: { blockIds: rowIds } }
      },
      recordMap: {
        block: { 'reward-0': { value: { id: 'reward-0', type: 'page' } } }
      }
    })
  }
}

describe('inline collection view hydration', () => {
  it('recovers real nested views and requeries with cover, sorting and workspace intact', async () => {
    const map = fixture()
    const api = apiFixture()
    expect(await hydrateCollectionViews(map, api)).toBe(true)
    expect(api.getPageRaw).toHaveBeenCalledTimes(1)
    expect(api.getPageRaw).toHaveBeenCalledWith('inline')
    expect(api.getCollectionData).toHaveBeenCalledWith(
      'rewards',
      'gallery',
      view,
      { spaceId: 'workspace' }
    )
    expect(map.collection_view.gallery).toEqual({ value: view })
    expect(map.collection_view.unrelated).toBeUndefined()
    expect(
      map.collection_query.rewards.gallery.collection_group_results.blockIds
    ).toHaveLength(38)
    expect(map.block.article.value.content).toEqual(['inline'])
    expect(map.block.inline.value.value.view_ids).toEqual(['gallery', 'table'])
  })

  it('does no extra work when cached views are already complete', async () => {
    const map = fixture()
    const api = apiFixture()
    await hydrateCollectionViews(map, api)
    api.getPageRaw.mockClear()
    api.getCollectionData.mockClear()
    expect(await hydrateCollectionViews(map, api)).toBe(false)
    expect(api.getPageRaw).not.toHaveBeenCalled()
    expect(api.getCollectionData).not.toHaveBeenCalled()
  })

  it('keeps existing query rows when a query fails', async () => {
    const map = fixture()
    const api = apiFixture()
    api.getCollectionData.mockRejectedValue(new Error('temporary failure'))
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    await hydrateCollectionViews(map, api)
    expect(map.collection_query.rewards.gallery.blockIds).toEqual(rowIds)
    expect(map.collection_view.gallery.value.format).toEqual(view.format)
  })

  it('does not invent inaccessible views or fail the article', async () => {
    const map = fixture()
    const api = apiFixture()
    api.getPageRaw.mockResolvedValue({
      recordMap: { collection_view: { gallery: { value: { role: 'none' } } } }
    })
    expect(await hydrateCollectionViews(map, api)).toBe(false)
    expect(map.collection_view).toBeUndefined()
    expect(api.getCollectionData).not.toHaveBeenCalled()
  })
})
