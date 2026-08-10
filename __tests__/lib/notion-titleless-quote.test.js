import { normalizeTitlelessQuoteBlocks } from '@/lib/notion/normalizeTitlelessQuoteBlocks'

describe('normalizeTitlelessQuoteBlocks', () => {
  it('adds an empty title to quote containers whose content lives in child blocks', () => {
    const recordMap = {
      block: {
        quote: {
          role: 'reader',
          value: {
            id: 'quote',
            type: 'quote',
            content: ['text', 'image']
          }
        },
        text: {
          value: {
            id: 'text',
            type: 'text',
            properties: { title: [['Visible child text']] }
          }
        }
      },
      collection: {}
    }

    const result = normalizeTitlelessQuoteBlocks(recordMap)

    expect(result).not.toBe(recordMap)
    expect(result.block).not.toBe(recordMap.block)
    expect(result.block.quote).toEqual({
      role: 'reader',
      value: {
        id: 'quote',
        type: 'quote',
        content: ['text', 'image'],
        properties: { title: [] }
      }
    })
    expect(result.block.text).toBe(recordMap.block.text)
    expect(recordMap.block.quote.value.properties).toBeUndefined()
  })

  it('leaves legacy quote blocks with their own title unchanged', () => {
    const recordMap = {
      block: {
        quote: {
          value: {
            id: 'quote',
            type: 'quote',
            properties: { title: [['Legacy quote']] },
            content: ['image']
          }
        }
      }
    }

    expect(normalizeTitlelessQuoteBlocks(recordMap)).toBe(recordMap)
  })

  it('does not create visible markup for empty titleless quotes', () => {
    const recordMap = {
      block: {
        quote: {
          value: {
            id: 'quote',
            type: 'quote'
          }
        }
      }
    }

    expect(normalizeTitlelessQuoteBlocks(recordMap)).toBe(recordMap)
  })
})
