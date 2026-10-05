// 只保存固定来源类别，不保存分享参数或搜索关键词。
export const SOURCE_TAGS = {
  google: 'Google',
  baidu: '百度',
  bing: 'Bing',
  qq: 'QQ 社群',
  wechat: '微信社群',
  weixin: '微信社群',
  telegram: 'Telegram 社群',
  discord: 'Discord 社群',
  group: '社群分享',
  social: '社群分享',
  bilibili: '哔哩哔哩',
  zhihu: '知乎'
}
export const NEARBY_REGIONS = [
  'JP',
  'KR',
  'KP',
  'MN',
  'VN',
  'TH',
  'SG',
  'MY',
  'ID',
  'PH',
  'KH',
  'LA',
  'MM',
  'BN',
  'RU',
  'KZ',
  'KG',
  'TJ',
  'AF',
  'PK',
  'IN',
  'NP',
  'BT',
  'BD',
  'LK'
]
export const AREA_LABELS = {
  '': '全部访问',
  CN: '中国大陆',
  HK: '香港',
  MO: '澳门',
  TW: '台湾',
  nearby: '周边地区',
  other: '其他／未知'
}
export const KIND_LABELS = {
  new: '新客',
  returning: '熟客',
  unknown: '旧记录 · 未判定'
}

export function sourceTagFromSearch(search) {
  const params = new URLSearchParams(search)
  const tag = (params.get('utm_source') || '').toLowerCase()
  return Object.hasOwn(SOURCE_TAGS, tag) ? tag : ''
}
export function classifySource(referrer, sourceTag = '', siteHost = '') {
  if (Object.hasOwn(SOURCE_TAGS, sourceTag))
    return { label: SOURCE_TAGS[sourceTag], evidence: '分享标记' }
  const host = String(referrer || '').toLowerCase()
  const belongs = domain => host === domain || host.endsWith('.' + domain)
  if (
    !host ||
    host === siteHost ||
    host === 'www.noginogi.sbs' ||
    host === 'noginogi.sbs' ||
    host.endsWith('.noginogi.sbs')
  )
    return { label: '直接进入／来源未提供', evidence: '未提供外部来源' }
  if (
    /^(?:[a-z0-9-]+\.)*google\.(?:com|cn|com\.hk|co\.jp|com\.tw|com\.sg|co\.uk)$/.test(
      host
    )
  )
    return { label: 'Google', evidence: '来源网站', host }
  if (belongs('baidu.com')) return { label: '百度', evidence: '来源网站', host }
  if (belongs('bing.com')) return { label: 'Bing', evidence: '来源网站', host }
  if (belongs('weixin.qq.com') || belongs('wechat.com'))
    return { label: '微信社群', evidence: '来源网站', host }
  if (belongs('qq.com')) return { label: 'QQ 社群', evidence: '来源网站', host }
  if (belongs('t.me') || belongs('telegram.org'))
    return { label: 'Telegram 社群', evidence: '来源网站', host }
  if (belongs('discord.com') || belongs('discord.gg'))
    return { label: 'Discord 社群', evidence: '来源网站', host }
  if (belongs('bilibili.com'))
    return { label: '哔哩哔哩', evidence: '来源网站', host }
  if (belongs('zhihu.com')) return { label: '知乎', evidence: '来源网站', host }
  return { label: '其他网站', evidence: '来源网站', host }
}
export function anomalyReasons(visit) {
  const reasons = []
  if (visit.rapidClicks > 0)
    reasons.push(`疑似连续点击 · ${visit.rapidClicks} 次触发`)
  if (
    visit.clicks >= 100 ||
    (visit.clicks >= 30 &&
      visit.clicks >= Math.max(visit.activeSeconds || 0, 1))
  )
    reasons.push('高频链接点击')
  return reasons
}
export function sessionStatus(session, now = Date.now()) {
  if (now - new Date(session.lastAt || session.at).getTime() >= 1800000)
    return { label: '会话已结束', hint: '30 分钟无活动，按最后一页推断离开页' }
  if (session.leftPage)
    return {
      label: '已发出离开信号',
      hint: '最后一页发出了离开信号，访客仍可能回来'
    }
  return { label: '最近仍有活动', hint: '尚未确认离开，显示当前最后一页' }
}
