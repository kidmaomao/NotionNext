jest.mock('@/lib/cache/cache_manager', () => ({
  getDataFromCache: jest.fn(),
  getOrSetDataWithCache: jest.fn(),
  setDataToCache: jest.fn()
}))
jest.mock('@/lib/db/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {
    getBlocks: jest.fn(),
    getPage: jest.fn(),
    getSignedFileUrls: jest.fn()
  }
}))
jest.mock('p-limit', () => () => fn => fn())
jest.mock('notion-utils', () => ({
  getBlockValue: jest.fn(entry => entry?.value?.value || entry?.value || entry),
  idToUuid: jest.fn(id => {
    const raw = String(id).replace(/-/g, '').toLowerCase()
    return raw.replace(
      /^(........)(....)(....)(....)(............)$/,
      '$1-$2-$3-$4-$5'
    )
  })
}))

import {
  fetchNotionPageBlocks,
  formatNotionBlock,
  hasExpiredSignedUrls,
  preferStablePdfSignedUrls
} from '@/lib/db/notion/getPostBlocks'
import {
  getOrSetDataWithCache,
  setDataToCache
} from '@/lib/cache/cache_manager'
import notionAPI from '@/lib/db/notion/getNotionAPI'
import {
  isExternalVideoEmbedUrl,
  isAppleMusicEmbedUrl,
  normalizeExternalMediaBlock
} from '@/lib/db/notion/normalizeExternalMediaBlock'

const compactMentionPageId = '3765bc0b889681a9bd95fe4635f2c9f4'
const mentionPageId = '3765bc0b-8896-81a9-bd95-fe4635f2c9f4'

function createArticleRecordMap() {
  return {
    block: {
      article: {
        value: {
          id: 'article',
          type: 'page',
          properties: {
            title: [['无限连击', [['p', compactMentionPageId]]]]
          }
        }
      }
    }
  }
}

function createMentionPageRecord() {
  return {
    value: {
      id: mentionPageId,
      type: 'page',
      properties: {
        title: [['无限连击']]
      }
    }
  }
}

describe('fetchNotionPageBlocks page mention hydration', () => {
  beforeEach(() => {
    getOrSetDataWithCache.mockReset()
    setDataToCache.mockReset().mockResolvedValue(undefined)
    notionAPI.getBlocks.mockReset()
    notionAPI.getPage.mockReset()
    notionAPI.getSignedFileUrls.mockReset()
  })

  it('hydrates a missing page mention record from the batch response', async () => {
    getOrSetDataWithCache.mockResolvedValue(createArticleRecordMap())
    notionAPI.getBlocks.mockResolvedValue({
      recordMap: {
        block: {
          [mentionPageId]: createMentionPageRecord()
        }
      }
    })

    const result = await fetchNotionPageBlocks('article', 'test')

    expect(notionAPI.getBlocks).toHaveBeenCalledWith([mentionPageId])
    expect(notionAPI.getPage).not.toHaveBeenCalled()
    expect(result.block[mentionPageId]).toEqual(createMentionPageRecord())
    expect(setDataToCache).toHaveBeenCalledWith(
      'page_block_article',
      result,
      null
    )
  })

  it('falls back to getPage when the batch response is unusable', async () => {
    getOrSetDataWithCache.mockResolvedValue(createArticleRecordMap())
    notionAPI.getBlocks.mockResolvedValue({
      recordMap: {
        block: {
          [mentionPageId]: {
            value: {
              role: 'none'
            }
          }
        }
      }
    })
    notionAPI.getPage.mockResolvedValue({
      block: {
        [mentionPageId]: createMentionPageRecord()
      }
    })

    const result = await fetchNotionPageBlocks('article', 'test')

    expect(notionAPI.getBlocks).toHaveBeenCalledWith([mentionPageId])
    expect(notionAPI.getPage).toHaveBeenCalledWith(mentionPageId)
    expect(result.block[mentionPageId]).toEqual(createMentionPageRecord())
  })

  it('does not refetch a page mention record that is already usable', async () => {
    const recordMap = createArticleRecordMap()
    recordMap.block[compactMentionPageId] = createMentionPageRecord()
    getOrSetDataWithCache.mockResolvedValue(recordMap)

    const result = await fetchNotionPageBlocks('article', 'test')

    expect(notionAPI.getBlocks).not.toHaveBeenCalled()
    expect(notionAPI.getPage).not.toHaveBeenCalled()
    expect(setDataToCache).not.toHaveBeenCalled()
    expect(result).toBe(recordMap)
  })
})

describe('formatNotionBlock', () => {
  it('detects Apple Music single-track embed URLs', () => {
    expect(
      isAppleMusicEmbedUrl(
        'https://embed.music.apple.com/us/song/neon-blue/324357768'
      )
    ).toBe(true)

    expect(
      isAppleMusicEmbedUrl(
        'https://embed.music.apple.com/us/album/girls-come-too/324357208'
      )
    ).toBe(false)
  })

  it('rewrites Apple Music song video blocks to embeds directly', () => {
    const blockValue = {
      type: 'video',
      properties: {
        source: [
          ['https://embed.music.apple.com/us/song/neon-blue/324357768']
        ]
      }
    }

    normalizeExternalMediaBlock(blockValue)

    expect(blockValue.type).toBe('embed')
  })

  it('rewrites external video player pages to embeds directly', () => {
    const url =
      'https://www.happinessrailway.com/dplayer.htm?n=https%3A%2F%2Fvip.lz-cdn16.com%2F20230312%2F12364_a86fbcc4%2Findex.m3u8'
    const blockValue = {
      type: 'video',
      properties: {
        source: [[url]]
      }
    }

    expect(isExternalVideoEmbedUrl(url)).toBe(true)
    normalizeExternalMediaBlock(blockValue)

    expect(blockValue.type).toBe('embed')
  })

  it('leaves non-matching video blocks unchanged during direct normalization', () => {
    const blockValue = {
      type: 'video',
      properties: {
        source: [['https://www.youtube.com/watch?v=dQw4w9WgXcQ']]
      }
    }

    normalizeExternalMediaBlock(blockValue)

    expect(blockValue.type).toBe('video')
  })

  it('normalizes Apple Music song embeds from video blocks to embed blocks', () => {
    const formatted = formatNotionBlock({
      'apple-music-song': {
        value: {
          id: 'apple-music-song',
          type: 'video',
          properties: {
            source: [[
              'https://embed.music.apple.com/us/song/never-gonna-give-you-up/1559523357?i=1559523359'
            ]]
          }
        }
      }
    })

    expect(formatted['apple-music-song'].value.type).toBe('embed')
  })

  it('normalizes external video player pages from video blocks to embed blocks', () => {
    const formatted = formatNotionBlock({
      'external-player': {
        value: {
          id: 'external-player',
          type: 'video',
          properties: {
            source: [[
              'https://www.happinessrailway.com/dplayer.htm?n=https%3A%2F%2Fvip.lz-cdn16.com%2F20230312%2F12364_a86fbcc4%2Findex.m3u8'
            ]]
          }
        }
      }
    })

    expect(formatted['external-player'].value.type).toBe('embed')
  })

  it('relinks synced block content children to the original parent', () => {
    const formatted = formatNotionBlock({
      page: {
        value: {
          id: 'page',
          type: 'page',
          content: ['sync']
        }
      },
      sync: {
        value: {
          id: 'sync',
          type: 'sync_block',
          parent_id: 'page',
          content: ['notice-line']
        }
      },
      'notice-line': {
        value: {
          id: 'notice-line',
          type: 'text',
          parent_id: 'sync',
          properties: {
            title: [['Notice']]
          }
        }
      }
    })

    expect(formatted.page.value.content).toEqual(['sync_child_0'])
    expect(formatted.sync).toBeUndefined()
    expect(formatted['notice-line']).toBeUndefined()
    expect(formatted.sync_child_0.value.id).toBe('sync_child_0')
    expect(formatted.sync_child_0.value.parent_id).toBe('page')
  })

  it('relinks synced block inline children to the original parent', () => {
    const formatted = formatNotionBlock({
      page: {
        value: {
          id: 'page',
          type: 'page',
          content: ['sync']
        }
      },
      sync: {
        value: {
          id: 'sync',
          type: 'sync_block',
          parent_id: 'page',
          children: [
            {
              value: {
                id: 'inline-child',
                type: 'text',
                parent_id: 'sync',
                properties: {
                  title: [['Inline notice']]
                }
              }
            }
          ]
        }
      }
    })

    expect(formatted.page.value.content).toEqual(['sync_child_0'])
    expect(formatted.sync).toBeUndefined()
    expect(formatted.sync_child_0.value.id).toBe('sync_child_0')
    expect(formatted.sync_child_0.value.parent_id).toBe('page')
  })

  it('keeps regular hosted videos as video blocks', () => {
    const formatted = formatNotionBlock({
      'hosted-video': {
        value: {
          id: 'hosted-video',
          type: 'video',
          properties: {
            source: [['https://cdn.example.com/videos/demo.mp4']]
          }
        }
      }
    })

    expect(formatted['hosted-video'].value.type).toBe('video')
  })

  it('rewrites newer Notion pdf file URLs to signed URLs', () => {
    const formatted = formatNotionBlock({
      pdf: {
        value: {
          id: 'pdf-block',
          type: 'pdf',
          properties: {
            source: [[
              'https://prod-files-secure.s3.us-west-2.amazonaws.com/space/file.pdf'
            ]]
          }
        }
      }
    })

    expect(formatted.pdf.value.properties.source[0][0]).toBe(
      'https://notion.so/signed/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fspace%2Ffile.pdf?table=block&id=pdf-block'
    )
  })

  it('does not rewrite lookalike Notion file URLs', () => {
    const url = 'https://evil.example/secure.notion-static.com/file.pdf'
    const formatted = formatNotionBlock({
      pdf: {
        value: {
          id: 'pdf-block',
          type: 'pdf',
          properties: {
            source: [[url]]
          }
        }
      }
    })

    expect(formatted.pdf.value.properties.source[0][0]).toBe(url)
  })

  it('detects expired cached Notion signed URLs', () => {
    expect(
      hasExpiredSignedUrls({
        signed_urls: {
          pdf: 'https://file.notion.so/f/file.pdf?expirationTimestamp=1'
        }
      })
    ).toBe(true)
  })

  it('uses stable Notion signed entry for pdf preview URLs', () => {
    const recordMap = {
      signed_urls: {
        pdf: 'https://file.notion.so/f/file.pdf?expirationTimestamp=1'
      },
      block: {
        pdf: {
          value: {
            id: 'pdf',
            type: 'pdf',
            properties: {
              source: [['https://prod-files-secure.s3.us-west-2.amazonaws.com/file.pdf']]
            }
          }
        }
      }
    }

    preferStablePdfSignedUrls(recordMap)

    expect(recordMap.signed_urls.pdf).toBe(
      'https://notion.so/signed/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Ffile.pdf?table=block&id=pdf'
    )
  })
})
