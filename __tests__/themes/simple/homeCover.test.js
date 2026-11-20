import { act, fireEvent, render, screen } from '@testing-library/react'
import Header from '@/themes/simple/components/Header'

jest.mock(
  '@/components/LazyImage',
  () =>
    function Image({ src, alt }) {
      return <img src={src} alt={alt} />
    }
)
jest.mock(
  '@/components/SmartLink',
  () =>
    function Link(props) {
      return <a {...props} />
    }
)
jest.mock('@/themes/simple/components/SocialButton', () => () => null)
jest.mock('@/lib/config', () => ({
  siteConfig: key =>
    ({ AUTHOR: '氪的猫', SIMPLE_LOGO_DESCRIPTION: '洛奇笔记' })[key] || ''
}))

const moment = {
  anchor: 'say-1',
  text: '今晚集合',
  date: '2026-11-20',
  comments: true
}
const cover = (note = moment, lite = false) =>
  render(
    <Header
      siteInfo={{ icon: '/cat.png' }}
      homeSections={{ latestMoment: note }}
      lite={lite}
    />
  )
beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

test('opens a single note after the centered profile and returns after reading', () => {
  cover()
  expect(screen.getByText('氪的猫').closest('[aria-hidden]')).toHaveAttribute(
    'aria-hidden',
    'false'
  )
  expect(screen.queryByRole('complementary')).toBeNull()
  act(() => jest.advanceTimersByTime(4200))
  const bubble = screen.getByRole('complementary', { name: '最近的说说' })
  expect(screen.getByRole('link', { name: '评论' })).toHaveAttribute(
    'href',
    '/say#comments-say-1'
  )
  fireEvent.pointerEnter(bubble)
  act(() => jest.advanceTimersByTime(12000))
  expect(screen.getByRole('complementary')).toBe(bubble)
  fireEvent.pointerLeave(bubble)
  act(() => jest.advanceTimersByTime(6500))
  expect(screen.queryByRole('complementary')).toBeNull()
  act(() => jest.advanceTimersByTime(20000))
  expect(screen.getByRole('button', { name: '看最近的说说' })).toHaveAttribute(
    'aria-pressed',
    'false'
  )
})

test('allows manual replay in lite mode and omits the toggle for an empty feed', () => {
  const view = cover(moment, true)
  act(() => jest.advanceTimersByTime(20000))
  fireEvent.click(screen.getByRole('button', { name: '看最近的说说' }))
  expect(screen.getByRole('complementary')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '返回站长介绍' }))
  expect(screen.queryByRole('complementary')).toBeNull()
  view.unmount()
  cover(null)
  expect(screen.queryByRole('button')).toBeNull()
})
