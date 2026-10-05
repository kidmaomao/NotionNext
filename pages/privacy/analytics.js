import Head from 'next/head'
import Link from 'next/link'
export default function AnalyticsNotice() {
  return (
    <main
      style={{
        maxWidth: 760,
        margin: '60px auto',
        padding: '32px',
        lineHeight: 1.9,
        color: '#334155',
        background: '#fff',
        borderRadius: 24
      }}
    >
      <Head>
        <title>访问统计说明 | 洛奇记事本</title>
      </Head>
      <Link href='/'>← 返回网站</Link>
      <h1 style={{ fontSize: 30, fontWeight: 700, margin: '24px 0' }}>
        访问统计说明
      </h1>
      <p>
        为了解文章的使用情况，本网站记录匿名访问统计，并保存在站点自己的数据库中。
      </p>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 24 }}>
        记录的信息
      </h2>
      <p>
        访问时间、页面标题与路径、来源网站、设备和浏览器类别、页面前台停留时间、滚动进度、链接点击次数，以及网络地址推断的大致国家／地区和城市。地理位置可能受到代理、运营商等影响，并不代表访客的实际位置。
      </p>
      <p>
        浏览器本地保存一个随机标识，用于区分匿名访客。数据库保存该标识的散列值；不保存原始
        IP、完整浏览器识别字符串、URL 查询参数、表单内容、聊天或评论内容。
      </p>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 24 }}>
        计数与保存期限
      </h2>
      <p>
        文章显示的浏览次数在同一浏览器、同一文章的 5
        分钟内去重。后台“页面打开次数”记录页面进入，可能包含重复刷新，因此与文章浏览次数不同。
      </p>
      <p>
        访问明细保留 90
        天，到期自动清理；匿名累计计数继续保留。明细仅供站点管理员登录后查看。
      </p>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 24 }}>
        浏览器选择
      </h2>
      <p>
        浏览器发送“请勿追踪”（DNT）或全局隐私控制（GPC）信号时，不记录行为明细；文章与页脚的匿名累计计数保持原有规则。清除本地标识、使用无痕窗口或更换设备会被视作新访客。
      </p>
      <p style={{ marginTop: 24, color: '#64748b' }}>
        启用日期：2026 年 10 月。此功能不采集精确定位。
      </p>
    </main>
  )
}
AnalyticsNotice.standalone = true
