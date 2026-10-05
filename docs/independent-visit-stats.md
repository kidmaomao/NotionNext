# 独立文章与访客统计

这是 `kidmaomao/NotionNext` 的个人功能，使用自己的 MongoDB 保存累计数据。文章计数位于 Simple 主题标题信息栏的最后编辑时间之后；页脚显示今日访客、累计访客、总浏览量。

## 启用

在 **NotionNext 的 Vercel 项目** `notion-next-20250821` 中设置以下环境变量，然后重新部署。Twikoo 是另一个项目，其环境变量不会自动传给 NotionNext。

| 变量 | 值 | 范围 |
| --- | --- | --- |
| `NEXT_PUBLIC_ANALYTICS_SELF_HOSTED_ENABLE` | `true` | Production |
| `VISIT_STATS_MONGODB_URI` | MongoDB 连接字符串，可复用 Twikoo 的 MongoDB 服务 | Production，Secret |
| `VISIT_STATS_MONGODB_DATABASE` | `notionnext_visits` | Production |
| `VISIT_STATS_NAMESPACE` | `noginogi:visits:production:v1` | Production |
| `VISIT_STATS_HASH_SECRET` | 随机生成的固定密钥 | Production，Secret |

只有开关使用 `NEXT_PUBLIC_`。数据库地址、密码和密钥不得放入 Notion 配置表、浏览器脚本、代码仓库或聊天回复。密钥用于生成匿名标识，长期保持不变；更换密钥会使同一浏览器被视为新访客。未设置密钥时使用连接字符串作为密钥，因此建议显式设置。

MongoDB 需要支持事务的副本集（例如 MongoDB Atlas）。统计默认使用独立数据库 `notionnext_visits`，仅访问 `visit_stats_counters`、`visit_stats_visitors`、`visit_stats_windows`、`visit_stats_rates` 四个集合。不会读取或修改 Twikoo 的评论、配置和用户集合。复用现有连接时，数据库用户须有此统计数据库的读写及建索引权限。

Preview 默认不写入统计。需要测试预览时，配置独立测试数据库和 namespace，再设置 `VISIT_STATS_ALLOW_PREVIEW=true`；不要给预览配置生产统计凭据。

## 统计口径

- 浏览量：一次打开页面计一次；同一浏览器在 5 分钟内重复打开同一文章/页面不重复计数。每日跨过上海时间零点后可以计入新一天。
- 文章以 Notion 页面 ID 为标识，更换文章标题或路径仍保留累计次数。
- 访客：以浏览器随机标识去重，按浏览器统计，不等同于真实人数。更换设备、清理存储或禁用存储会影响去重。
- 今日统计按 `Asia/Shanghai` 的日期计算。
- 查询参数、主题切换、文章锚点不单独计数。
- MongoDB 事务保证重复请求与并发访问不会覆盖计数；匿名标识和网络地址经服务端 HMAC 处理后使用，不保存原始 IP。
- 每个浏览器每分钟最多 60 次请求，每个网络地址最多 240 次；这是基础防刷限制。
- 计数保存在数据库中，重新部署不会清空。统计数据没有经过缓存清理接口。

开启后，Simple 文章信息栏切换为独立计数，同时停止原不蒜子统计脚本。未开启时保留既有行为。加载时显示占位提示；接口异常、未配置数据库或数据库权限不足时显示“暂不可用”，不把故障显示成 0 次。

旧不蒜子的累计次数不自动导入。若能取回原始数字，可另行制定一次性的初始化方案；启用本功能本身不会访问或清空旧统计服务。

## 验证

2026-10-05：267 个项目测试、类型检查与 Simple 生产构建通过。使用独立的本地 MongoDB 副本集验证了 7 个场景：并发重复请求、跨文章访客去重、五分钟后再次计数、连接重启后持久化、上海时间跨日、不同访客并发写入与请求限流。真实 Notion 文章桌面端和 390px 手机端均已验证，计数位置与原文章信息栏一致。
