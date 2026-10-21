# 2026-10-21 选择性上游维护

基于本 Fork 的 `46960f1cf5534ebbf763f1e54ed3495c75ce1a00`，参考上游 v4.11.0 及 `60c640eb8b0a5496398a81c6f86488a2be62c0b9` 之前的相关修复。仅同步选定修复，不代表整库升级到上游版本。

## 更新范围

- 缓存维护接口在没有令牌时关闭，统一文件、内存及 Redis 数据失效；支持有界批量页面重建，并兼容 Vercel Hobby 的函数时限。
- 仅允许本站工作区内容；密码在服务端验证，保护嵌套内容、RSS 和搜索索引；保留隐藏发布子页面并避免临时 Notion 故障覆盖已有 ISR 页面。
- 修复 Gallery 包装层宽度、外链图片中转、高清放大与放大状态清理。
- 修复 Algolia 请求竞争和弹窗焦点、Notion OAuth 服务端授权流程、Mailchimp 错误反馈及订阅同意。
- 依赖与 v4.11.0 的依赖集合对齐；额外保留本 Fork 的 MongoDB 7.7.0 及其锁定依赖。
- CI 增加 maintenance/** 分支验证、隔离 Redis 集成测试和生产构建，无需创建 Pull Request。

## 保留的定制

Simple 的样式、布局、禁止悬停位移、背景和 favicon、个人介绍、字体与自有统计保持原样。保留访客后台、小羊工具、MongoDB 访问统计、无标题引用块规范化、页面提及补全与回退逻辑。正文 CSS 仅追加 Gallery 宽度规则，保留绿色文字以及联动文章 GIF 最大高度 320px。

没有引入 PWA、MCP、其他主题改版、父路径 URL 默认变更及上游的 Simple/Vercount 统计入口。

## 配置兼容

- `/api/cache`：需要服务端 `CACHE_REVALIDATION_TOKEN` 和对应 Bearer 请求头；未配置时返回 503，普通文章访问不受影响。
- `/api/revalidate`：仍使用 `REVALIDATION_TOKEN`。需要同时清除数据时传 `invalidateData: true`；全站重建传 `all: true`，收到 202 后继续处理 `remainingPaths`。
- `NOTION_WORKSPACE_ID` 可选，支持多个工作区 ID 以逗号分隔；默认从本站根页面推导。
- Notion OAuth 从 `/api/auth/notion` 发起。
- 原自有统计、访客后台和百科工具的环境变量继续沿用，无需更换数据库。

验证以维护分支和 main 的 GitHub Actions、部署检查为准；未经验证的工作区变更不直接推广到 main。
