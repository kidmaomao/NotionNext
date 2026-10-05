import {
  sourceTagFromSearch,
  classifySource,
  anomalyReasons,
  sessionStatus
} from '@/lib/analytics/journeys'

test('recognizes search and community referrers without treating lookalike domains as trusted', () => {
  expect(classifySource('www.google.com').label).toBe('Google')
  expect(classifySource('m.baidu.com').label).toBe('百度')
  expect(classifySource('mp.weixin.qq.com').label).toBe('微信社群')
  expect(classifySource('qq.com.evil.test').label).toBe('其他网站')
  expect(classifySource('google.com.evil.test').label).toBe('其他网站')
  expect(classifySource('www.noginogi.sbs').label).toBe('直接进入／来源未提供')
  expect(classifySource('').evidence).toBe('未提供外部来源')
})
test('only accepts fixed campaign tags and never returns arbitrary URL values', () => {
  expect(sourceTagFromSearch('?utm_source=qq&token=secret')).toBe('qq')
  expect(classifySource('', 'qq')).toEqual({
    label: 'QQ 社群',
    evidence: '分享标记'
  })
  expect(sourceTagFromSearch('?utm_source=private-person')).toBe('')
  expect(sourceTagFromSearch('?utm_source=__proto__')).toBe('')
  expect(classifySource('', 'private-person').label).toBe(
    '直接进入／来源未提供'
  )
})
test('click flags require a burst or a concrete high-frequency threshold', () => {
  expect(anomalyReasons({ clicks: 2, activeSeconds: 1 })).toEqual([])
  expect(
    anomalyReasons({ rapidClicks: 1, clicks: 0, activeSeconds: 90 })
  ).toHaveLength(1)
  expect(anomalyReasons({ clicks: 30, activeSeconds: 100 })).toEqual([])
  expect(anomalyReasons({ clicks: 30, activeSeconds: 15 })).toContain(
    '高频链接点击'
  )
  expect(anomalyReasons({ clicks: 100, activeSeconds: 3600 })).toContain(
    '高频链接点击'
  )
})
test('exit labels distinguish current activity, a browser signal, and a timed-out inference', () => {
  const now = Date.parse('2026-10-05T10:00:00Z')
  expect(sessionStatus({ lastAt: new Date(now) }, now).label).toBe(
    '最近仍有活动'
  )
  expect(
    sessionStatus({ lastAt: new Date(now), leftPage: true }, now).label
  ).toBe('已发出离开信号')
  expect(
    sessionStatus({ lastAt: new Date(now - 1800000), leftPage: false }, now)
      .label
  ).toBe('会话已结束')
})
