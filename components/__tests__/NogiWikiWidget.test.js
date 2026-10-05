import { act, fireEvent, render, screen } from '@testing-library/react'
import NogiWikiWidget from '../NogiWikiWidget'

test('opens as a query window, displays candidates, pages, and safe sources', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      ok: true,
      text: '候选资料',
      page: 1,
      pages: 2,
      candidates: [{ name: '女神像', query: '#123', category: '道具' }],
      sources: ['https://gear.noginogi.sbs/baike.html', 'javascript:alert(1)']
    })
  })
  render(<NogiWikiWidget />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '打开洛奇百科助手' }))
  const input = screen.getByLabelText('查询名称')
  expect(input).toHaveFocus()
  fireEvent.change(input, { target: { value: '女神' } })
  fireEvent.click(screen.getByRole('button', { name: '查询' }))
  expect(await screen.findByText('候选资料')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled()
  expect(screen.getAllByRole('link')).toHaveLength(1)
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ ok: true, text: '女神像详情' })
  })
  fireEvent.click(screen.getByRole('button', { name: '女神像 道具 →' }))
  expect(await screen.findByText('女神像详情')).toBeInTheDocument()
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
    action: 'search',
    category: '道具',
    query: '#123'
  })
  fireEvent.keyDown(input, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '打开洛奇百科助手' })).toHaveFocus()
})

test('closing aborts pending queries and ignores a late response', async () => {
  let resolve
  fetch.mockImplementation(
    () =>
      new Promise(done => {
        resolve = done
      })
  )
  render(<NogiWikiWidget />)
  fireEvent.click(screen.getByRole('button', { name: '打开洛奇百科助手' }))
  fireEvent.click(screen.getByRole('button', { name: '女神像' }))
  const signal = fetch.mock.calls[0][1].signal
  fireEvent.click(screen.getByRole('button', { name: '关闭百科窗口' }))
  expect(signal.aborted).toBe(true)
  await act(async () =>
    resolve({ ok: true, json: async () => ({ ok: true, text: 'late result' }) })
  )
  fireEvent.click(screen.getByRole('button', { name: '打开洛奇百科助手' }))
  expect(screen.queryByText('late result')).not.toBeInTheDocument()
})
