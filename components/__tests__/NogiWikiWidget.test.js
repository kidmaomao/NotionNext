import { act, fireEvent, render, screen } from '@testing-library/react'
import NogiWikiWidget from '../NogiWikiWidget'

test('opens as a query window, displays candidates, pages, and safe sources', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: () =>
      Promise.resolve({
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
    json: () => Promise.resolve({ ok: true, text: '女神像详情' })
  })
  fireEvent.click(screen.getByRole('button', { name: '女神像 道具 →' }))
  expect(await screen.findByText('女神像详情')).toBeInTheDocument()
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
    action: 'search',
    mode: 'wiki',
    category: '道具',
    wikiView: '完整资料',
    query: '#123'
  })
  fireEvent.keyDown(input, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '打开洛奇百科助手' })).toHaveFocus()
})

test('recipe tools send quantities, library browsing is allowed, and help stays local', async () => {
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ ok: true, text: '材料汇总结果' })
  })
  render(<NogiWikiWidget />)
  fireEvent.click(screen.getByRole('button', { name: '打开洛奇百科助手' }))
  fireEvent.click(screen.getByRole('button', { name: '配方', exact: true }))
  fireEvent.click(screen.getByRole('button', { name: '基础材料汇总' }))
  fireEvent.change(screen.getByLabelText('制作数量'), {
    target: { value: '2' }
  })
  fireEvent.change(screen.getByLabelText('每件制作次数'), {
    target: { value: '4' }
  })
  fireEvent.change(screen.getByLabelText('查询名称'), {
    target: { value: '释魂者双手斧' }
  })
  fireEvent.click(screen.getByRole('button', { name: '查询', exact: true }))
  expect(await screen.findByText('材料汇总结果')).toBeInTheDocument()
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
    action: 'search',
    mode: 'recipe',
    operation: '汇总',
    query: '释魂者双手斧',
    quantity: 2,
    runs: 4
  })
  fireEvent.click(screen.getByRole('button', { name: '资料', exact: true }))
  fireEvent.change(screen.getByLabelText('资料专题'), {
    target: { value: '鉴定' }
  })
  expect(
    screen.getByRole('button', { name: '浏览', exact: true })
  ).toBeEnabled()
  fireEvent.click(screen.getByRole('button', { name: '使用说明' }))
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(screen.getByText(/所有工具 冰精通伤害/)).toBeInTheDocument()
})

test('switching modules aborts and ignores the old result; simulations allow an empty query', async () => {
  let resolve
  fetch.mockImplementationOnce(
    () =>
      new Promise(done => {
        resolve = done
      })
  )
  render(<NogiWikiWidget />)
  fireEvent.click(screen.getByRole('button', { name: '打开洛奇百科助手' }))
  fireEvent.click(screen.getByRole('button', { name: '女神像' }))
  const signal = fetch.mock.calls[0][1].signal
  fireEvent.click(screen.getByRole('button', { name: '模拟', exact: true }))
  expect(signal.aborted).toBe(true)
  await act(async () => {
    resolve({
      ok: true,
      json: () => Promise.resolve({ ok: true, text: '旧百科结果' })
    })
    await Promise.resolve()
  })
  expect(screen.queryByText('旧百科结果')).not.toBeInTheDocument()
  fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ ok: true, text: '抽蛋模拟结果' })
  })
  fireEvent.click(screen.getByRole('button', { name: '开始模拟' }))
  expect(await screen.findByText('抽蛋模拟结果')).toBeInTheDocument()
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
    action: 'search',
    mode: 'egg',
    query: ''
  })
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
  await act(async () => {
    resolve({
      ok: true,
      json: () => Promise.resolve({ ok: true, text: 'late result' })
    })
    await Promise.resolve()
  })
  fireEvent.click(screen.getByRole('button', { name: '打开洛奇百科助手' }))
  expect(screen.queryByText('late result')).not.toBeInTheDocument()
})
