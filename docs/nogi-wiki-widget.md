# 洛奇资料助手小羊入口

全站右下角小羊使用透明 WebP、主题适配的细描边和阴影。点击打开资料助手，手机上缩小到 64px，并为返回顶部和屏幕安全区域留出空间。

五个功能入口：百科（6类、制作浮动、改造与高级筛选）、配方（成品、材料反查、基础材料汇总与数量换算）、资料（阿尔卡纳、奥甘、蛋物、外观、精灵外观、副本、尔格、黑暗尔格、回音、鉴定、音乐）、韩拍（实时挂单、近7/30天已采集成交）、模拟（抽蛋、遗物复原、硬币制作及评分）。支持候选点击、按功能隔离的翻页、来源及插图；使用说明在浏览器本地展示，不发起查询请求。

查询链路：网页 → `/api/nogi/wiki` → 插件专用 `/api/nogi/wiki/query` → `NogiNogiPlugin.answer`。仅允许七个固定查询/模拟模块，不经过 AstrBot 消息或 LLM 管线。查询内容可以使用对应插件功能的筛选语法，但不能变成其他命令。管理、更新、群公告不对访客开放。算命网站配置DeepSeek密钥时会调用模型，因此本版网页不接入算命。

## 接入配置

在 AstrBot 百科插件中启用 `web_query_enabled`，设置随机密钥 `web_query_key`（至少32字符）。监听端口默认6191、地址默认127.0.0.1。容器内使用0.0.0.0时，将宿主机发布地址限定到127.0.0.1；不要重建容器或改动已有端口来试运行。

Vercel 项目设置以下**服务端**环境变量，不能加 NEXT_PUBLIC_ 前缀：

| 变量                             | 值                                                               |
| -------------------------------- | ---------------------------------------------------------------- |
| `NOGI_WIKI_API_URL`              | 独立百科入口的 HTTPS 完整地址，路径必须是 `/api/nogi/wiki/query` |
| `NOGI_WIKI_API_KEY`              | 与插件 `web_query_key` 一致的密钥                                |
| `NOGI_WIKI_ACCESS_CLIENT_ID`     | 若入口使用 Cloudflare Access，填写服务令牌的 Client ID           |
| `NOGI_WIKI_ACCESS_CLIENT_SECRET` | 对应服务令牌的 Secret                                            |

百科入口只发布这个查询路径，其余路径返回404。使用 Cloudflare 时，为百科入口设置独立的 Service Auth 应用；不要修改 AstrBot / NapCat 管理域名现有邮箱验证与 JWT 保护。

未设置连接配置时，小羊窗口仍可打开，查询显示“百科入口正在准备中”，不会产生模拟答案或调用 LLM。Mac、Docker 与隧道需要在线才能查询；插件查询记录保留15分钟。

## 验证

运行 `jest pages/api/nogi/__tests__/wiki.test.js components/__tests__/NogiWikiWidget.test.js --runInBand`，以及修改文件的 ESLint 和 `next build`。插件在 AstrBot Python 环境运行 `python -m unittest astrbot_plugin_noginogi.tests.test_web_query`，并复验既有百科和翻页测试。

首次发布前确认实际 HTTPS 入口连通、来源链接正确，以及未授权入口请求被拒绝。先使用预览部署检查网站；正式上线只合并到自己的 Fork。

## 费用

复用现有 Cloudflare Tunnel、域名子域名、普通HTTPS证书与Access服务令牌，不需要新增服务器或证书费用；访客不会占用Access用户席位。Mac与插件之间仍可使用本地HTTP，公网使用免费HTTPS即可。当前方案不需要Workers、R2等付费附加产品。

实际 Vercel 团队当前标记为Pro，包含每月20美元基础设施抵扣，超出后按量收费；这些用量与团队其他项目共享。无LLM入口不产生模型调用费用。缓存与限频可降低资源消耗，但不能当作账单上限。预算通知不会停止计费；自动暂停会影响团队全部正式部署，且检查有延迟。此次没有改动任何账单设置。

核对日期2026-10-05：[Cloudflare计费](https://developers.cloudflare.com/billing/understand/how-charges-accrue/)、[服务令牌与用户席位](https://developers.cloudflare.com/cloudflare-one/team-and-resources/users/seat-management/)、[Vercel Pro](https://vercel.com/docs/plans/pro-plan)、[预算控制](https://vercel.com/docs/spend-management)。
