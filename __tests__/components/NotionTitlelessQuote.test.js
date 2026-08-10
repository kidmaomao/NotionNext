import NotionPage from '@/components/NotionPage'
import { render } from '@testing-library/react'
import { NotionRenderer } from 'react-notion-x'

jest.mock('react-notion-x', () => ({
  NotionRenderer: jest.fn(() => null)
}))

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, defaultValue) => defaultValue)
}))

jest.mock('@/lib/db/notion/mapImage', () => ({
  compressImage: jest.fn(value => value),
  mapImgUrl: jest.fn(value => value)
}))

jest.mock('@/lib/utils', () => ({
  isBrowser: false,
  loadExternalResource: jest.fn()
}))

jest.mock('@fisch0920/medium-zoom', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('@/components/OriginalityProof', () => () => null)

describe('NotionPage titleless quote normalization', () => {
  it('passes a renderable quote container to react-notion-x', () => {
    const blockMap = {
      block: {
        quote: {
          value: {
            id: 'quote',
            type: 'quote',
            content: ['text']
          }
        },
        text: {
          value: {
            id: 'text',
            type: 'text',
            parent_id: 'quote',
            properties: { title: [['Visible child text']] }
          }
        }
      }
    }

    render(<NotionPage post={{ blockMap }} />)

    const rendererProps = NotionRenderer.mock.calls[0][0]
    expect(rendererProps.recordMap.block.quote.value.properties).toEqual({
      title: []
    })
    expect(rendererProps.recordMap.block.text).toBe(blockMap.block.text)
    expect(rendererProps.components).not.toHaveProperty('Quote')
    expect(blockMap.block.quote.value.properties).toBeUndefined()
  })
})
