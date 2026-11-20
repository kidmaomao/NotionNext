import { render, screen, waitFor } from '@testing-library/react'
import Twikoo from '@/components/Twikoo'

jest.mock('@/lib/config', () => ({
  siteConfig: (key, fallback) =>
    ({ COMMENT_TWIKOO_ENV_ID: 'demo', LANG: 'zh-CN' })[key] || fallback
}))

test('uses a separate canonical path for each note and mounts only the selected thread', async () => {
  const destroy = jest.fn()
  window.twikoo = {
    init: jest.fn().mockImplementation(({ el }) => {
      document.querySelector(el).textContent = '讨论'
      return { $destroy: destroy }
    })
  }
  try {
    const view = render(
      <Twikoo threadPath='/article/one' containerId='twikoo-say-one' />
    )
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull())
    expect(window.twikoo.init).toHaveBeenLastCalledWith({
      path: '/article/one',
      el: '#twikoo-say-one',
      envId: 'demo',
      lang: 'zh-CN'
    })
    view.rerender(
      <Twikoo threadPath='/article/two' containerId='twikoo-say-two' />
    )
    await waitFor(() =>
      expect(window.twikoo.init).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: '/article/two', el: '#twikoo-say-two' })
      )
    )
    expect(document.getElementById('twikoo-say-one')).toBeNull()
    expect(destroy).toHaveBeenCalledTimes(1)
  } finally {
    delete window.twikoo
  }
})
