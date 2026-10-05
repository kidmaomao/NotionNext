# 洛奇百科小羊入口

全站右下角小羊使用透明 WebP、主题适配的细描边和阴影。点击打开百科窗口，支持全部、道具、技能、释放、头衔、料理，候选详情、翻页、来源及插图。手机上缩小到 64px，并为返回顶部和屏幕安全区域留出空间。

查询链路：网页 → `/api/nogi/wiki` → 插件专用 `/api/nogi/wiki/query` → `NogiNogiPlugin.answer`。仅允许百科、百科翻页、查询来源与帮助，不经过 AstrBot 消息或 LLM 管线。

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
