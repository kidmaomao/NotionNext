import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import SayPage, { getStaticProps } from '@/pages/say'
import { fetchGlobalAllData, getPostBlocks } from '@/lib/db/SiteDataApi'
import { readMomentPreview } from '@/lib/site/momentPreview'
import { execFileSync } from 'child_process'
jest.mock('p-limit', () => () => fn => fn())
// The ESM renderer is exercised below in Node, outside Jest's CJS loader.
jest.mock('@/themes/simple/components/MomentContent', () => function MomentContent({ note }) { return <p>{note.text}</p> })

jest.mock('@/lib/db/SiteDataApi', () => ({
  fetchGlobalAllData: jest.fn(),
  getPostBlocks: jest.fn()
}))
jest.mock(
  '@/components/SmartLink',
  () =>
    function Link({ prefetch, ...props }) {
      return <a {...props} />
    }
)

test('publishes only public short notes and orders same-day entries by time', async () => {
  const note = {
    type: 'Post',
    status: 'Published',
    category: '说说',
    title: '今日日程',
    summary: '集合地点变更',
    publishDate: Date.parse('2026-11-20'),
    date: { start_date: '2026-11-20' }
  }
  fetchGlobalAllData.mockResolvedValue({
    NOTION_CONFIG: { COMMENT_TWIKOO_ENV_ID: 'https://twikoo.example' },
    allPages: [
      {
        ...note,
        id: 'morning',
        href: '/morning',
        title: undefined,
        summary: '',
        date: { ...note.date, start_time: '08:00', end_date: '2026-11-20' }
      },
      { ...note, id: 'draft', status: 'Draft' },
      { ...note, id: 'hidden', status: 'Invisible' },
      { ...note, id: 'locked', password: 'protected' },
      { ...note, id: 'article', category: '攻略' },
      {
        ...note,
        id: 'evening',
        href: '/evening',
        date: { ...note.date, start_time: '21:10' }
      }
    ]
  })
  getPostBlocks.mockImplementation(id => Promise.resolve(
    id === 'morning'
      ? {
          block: {
            morning: {
              value: { id, type: 'page', content: ['a', 'pic', 'unsized', 'wide', 'private'] }
            },
            a: {
              value: {
                type: 'text',
                properties: { title: [['直接写在正文里的提醒']] }
              }
            },
            pic: {
              value: {
                type: 'image',
                format: { block_width: 148 },
                properties: {
                  source: [['https://example.com/game.webp']],
                  caption: [['游戏截图']]
                }
              }
            },
            unsized: {
              value: {
                type: 'image',
                properties: { source: [['/small.png']], caption: [['未设置尺寸']] }
              }
            },
            wide: {
              value: {
                type: 'image',
                format: { block_page_width: true, block_width: 148 },
                properties: { source: [['/wide.png']], caption: [['通栏配图']] }
              }
            },
            private: {
              value: {
                type: 'page',
                properties: { title: [['嵌套页面不进入说说']] }
              }
            }
          }
        }
      : null
  ))
  const { props } = await getStaticProps({ locale: 'zh-CN' })
  expect(props.allPages).toBeUndefined()
  expect(props.moments.map(note => note.anchor)).toEqual([
    'say-evening',
    'say-morning'
  ])
  expect(props.moments[1]).toMatchObject({
    title: '',
    text: '直接写在正文里的提醒'
  })
  const page = render(<SayPage {...props} />)
  expect(screen.getByText('集合地点变更')).toBeVisible()
  expect(screen.getByText('直接写在正文里的提醒')).toBeVisible()
  const blocks = props.moments[1].blockMap.block
  expect(blocks.pic.value.format.block_width).toBe(148)
  expect(blocks.unsized.value.format.block_width).toBe('min(100%, 20rem)')
  expect(blocks.wide.value.format.block_page_width).toBe(true)
  expect(blocks.private).toBeUndefined()
  expect(screen.queryByText('嵌套页面不进入说说')).toBeNull()
  expect(getPostBlocks).toHaveBeenCalledTimes(2)
  expect(screen.getByText('21:10')).toBeVisible()
  expect(screen.queryByText(/查看原文/)).toBeNull()
  const actions = screen.getAllByRole('button', { name: '评论' })
  fireEvent.click(actions[0])
  expect(window.location.hash).toBe('#comments-say-evening')
  expect(actions[0]).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(actions[1])
  expect(actions[0]).toHaveAttribute('aria-expanded', 'false')
  expect(window.location.hash).toBe('#comments-say-morning')
  page.unmount()
  const linked = render(<SayPage {...props} />)
  expect(screen.getByRole('button', { name: '收起评论' })).toHaveAttribute(
    'aria-controls',
    'thread-say-morning'
  )
  linked.rerender(<SayPage moments={[]} />)
  expect(screen.getByText('暂时还没有公开的说说。')).toBeVisible()
})

test('renders rich links, bookmarks, nested content and media in source order without publishing other pages', async () => {
  const post = { id: 'moment', type: 'Moment', status: 'Published' }
  const value = (id, type, properties = {}, content = [], format = {}) => ({ value: { id, type, properties, content, format } })
  const raw = {
    block: {
      moment: value('moment', 'page', { secret: [['not public']] }, ['intro', 'image', 'bookmark', 'list', 'quote', 'toggle', 'todo', 'file', 'audio', 'video', 'end', 'nested', 'locked']),
      intro: value('intro', 'text', { title: [['官网', [['a', 'https://example.com/event'], ['b']]], [' 和强调', [['i']]]] }),
      image: value('image', 'image', { source: [['https://example.com/image.png']], caption: [['图文顺序']] }, [], { block_width: 148 }),
      bookmark: value('bookmark', 'bookmark', { title: [['活动书签']], link: [['https://example.com/bookmark']] }),
      list: value('list', 'bulleted_list', { title: [['列表第一项']] }, ['nested-list']),
      'nested-list': value('nested-list', 'numbered_list', { title: [['嵌套清单']] }),
      quote: value('quote', 'quote', {}, ['quoted']),
      quoted: value('quoted', 'text', { title: [['引用内容']] }),
      toggle: value('toggle', 'toggle', { title: [['展开说明']] }, ['detail']),
      detail: value('detail', 'text', { title: [['折叠正文']] }),
      todo: value('todo', 'to_do', { title: [['已完成任务']], checked: [['Yes']] }),
      file: value('file', 'file', { title: [['附件']], source: [['https://example.com/file.zip']] }),
      audio: value('audio', 'audio', { source: [['https://example.com/audio.mp3']] }),
      video: value('video', 'video', { source: [['https://example.com/video.mp4']] }),
      end: value('end', 'text', { title: [['正文末尾'], ['‣', [['p', 'public-ref']]]] }),
      'public-ref': value('public-ref', 'page', { title: [['公开页面引用']], secret: [['reference secret']] }, ['outside']),
      outside: value('outside', 'text', { title: [['引用页面正文不进入说说']] }),
      nested: value('nested', 'page', { title: [['嵌套页面']] }, ['private-child']),
      'private-child': value('private-child', 'text', { title: [['私有子页面内容']] }),
      locked: value('locked', 'page', { title: [['加密页面内容']] }, ['locked-image']),
      'locked-image': value('locked-image', 'image', { source: [['https://example.com/secret.png']] })
    },
    signed_urls: { 'locked-image': 'https://example.com/signed-secret' }
  }
  getPostBlocks.mockResolvedValue(raw)
  const note = await readMomentPreview({ text: '摘要' }, post, [post, { id: 'public-ref', status: 'Published' }, { id: 'locked', password: 'protected' }])
  const serialized = JSON.stringify(note.blockMap)
  expect(serialized).not.toMatch(/not public|reference secret|私有|加密|signed-secret|引用页面正文/)
  expect(raw.block.moment.value.properties.secret).toBeDefined()
  const markup = execFileSync(process.execPath, ['--input-type=module', '-e', `
    import React from 'react'
    import { renderToStaticMarkup } from 'react-dom/server'
    import { NotionRenderer } from 'react-notion-x'
    let input = ''
    for await (const chunk of process.stdin) input += chunk
    process.stdout.write(renderToStaticMarkup(React.createElement(NotionRenderer, {
      recordMap: JSON.parse(input), isImageZoomable: false, forceCustomImages: true,
      components: { Image: ({src, alt}) => React.createElement('img', {src, alt}) }
    })))
  `], { encoding: 'utf8', input: serialized })
  const host = document.createElement('div')
  host.innerHTML = markup
  expect(within(host).getByRole('link', { name: '官网' })).toHaveAttribute('href', 'https://example.com/event')
  expect(host.querySelector('b')).toHaveTextContent('官网')
  expect(host.querySelector('em')).toHaveTextContent('和强调')
  expect(within(host).getByRole('link', { name: /活动书签/ })).toHaveAttribute('href', 'https://example.com/bookmark')
  expect(host.querySelector('ul ol')).toHaveTextContent('嵌套清单')
  expect(host.querySelector('blockquote')).toHaveTextContent('引用内容')
  expect(host.querySelector('details')).toHaveTextContent('折叠正文')
  expect(host.querySelector('audio')).toHaveAttribute('src', 'https://example.com/audio.mp3')
  expect(host.querySelector('video')).toHaveAttribute('src', 'https://example.com/video.mp4')
  expect(within(host).getByRole('link', { name: /附件/ })).toHaveAttribute('href', 'https://example.com/file.zip')
  expect(within(host).getByRole('link', { name: /公开页面引用/ })).toHaveAttribute('href', '/publicref')
  expect(markup.indexOf('图文顺序')).toBeLessThan(markup.indexOf('活动书签'))
  expect(markup.indexOf('活动书签')).toBeLessThan(markup.indexOf('正文末尾'))
})

test('shows real counts for each closed thread, including zero, without mounting the comments', async () => {
  const moments = ['one', 'two', 'hidden'].map(id => ({
    id, href: '/article/' + id, anchor: 'say-' + id,
    date: '2026-11-20', text: id, comments: id !== 'hidden'
  }))
  window.twikoo = {
    init: jest.fn(),
    getCommentsCount: jest.fn().mockResolvedValue([
      { url: '/article/two', count: 0 }, { url: '/article/one', count: 3 }
    ])
  }
  try {
    render(<SayPage moments={moments} momentCommentProvider='twikoo'
      NOTION_CONFIG={{ COMMENT_TWIKOO_ENV_ID: 'demo' }} />)
    await waitFor(() => expect(screen.getByRole('button', { name: /评论\s*3/ })).toBeVisible())
    expect(screen.getByRole('button', { name: /评论\s*0/ })).toBeVisible()
    expect(window.twikoo.getCommentsCount).toHaveBeenCalledWith({
      envId: 'demo', urls: ['/article/one', '/article/two'], includeReply: true
    })
    expect(window.twikoo.init).not.toHaveBeenCalled()
  } finally {
    delete window.twikoo
  }
})
