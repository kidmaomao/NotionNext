/**
 * @jest-environment node
 */

import getPageProperties, {
  adjustPageProperties
} from '@/lib/db/notion/getPageProperties'
import { getTextContent } from 'notion-utils'

jest.mock('notion-utils', () => ({
  getDateValue: jest.fn(),
  getTextContent: jest.fn()
}))

jest.mock('@/lib/db/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {
    getUsers: jest.fn()
  }
}))

describe('getPageProperties', () => {
  it.each([
    ['Yes', true],
    ['No', false],
    [undefined, false]
  ])('decodes the Notion 置顶 checkbox value %s', async (value, pinned) => {
    getTextContent.mockImplementation(property => property[0][0])
    const properties = value === undefined ? {} : { pin: [[value]] }
    const post = await getPageProperties(
      'post-id',
      { properties, created_time: 1700000000000 },
      { pin: { type: 'checkbox', name: '置顶' } }
    )

    expect(post.pinned).toBe(pinned)
  })
})

describe('adjustPageProperties', () => {
  it('uses category mapping for pages only when the page category is mapped', () => {
    const NOTION_CONFIG = {
      POST_URL_PREFIX: '%category%/%year%/%month%/%day%',
      POST_URL_PREFIX_MAPPING_CATEGORY: {
        Guide: 'manual'
      },
      PSEUDO_STATIC: false
    }

    const mappedPage = {
      id: 'page-id',
      type: 'Page',
      slug: 'a-manual',
      category: 'Guide'
    }
    const plainPage = {
      id: 'plain-id',
      type: 'Page',
      slug: 'a-book',
      category: 'Book'
    }

    adjustPageProperties(mappedPage, NOTION_CONFIG)
    adjustPageProperties(plainPage, NOTION_CONFIG)

    expect(mappedPage.slug).toBe('manual/a-manual')
    expect(mappedPage.href).toBe('/manual/a-manual')
    expect(plainPage.slug).toBe('a-book')
    expect(plainPage.href).toBe('/a-book')
  })
})
