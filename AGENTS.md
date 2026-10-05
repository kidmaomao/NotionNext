# 独立 Fork 的维护约定

本项目是 `kidmaomao/NotionNext`，基于 `notionnext-org/NotionNext` 做了个人修改，由用户独立维护。

- 用户已明确：这些定制不准备合并回原作者项目。不要向上游仓库推送代码或创建 PR。
- `origin` 必须指向 `https://github.com/kidmaomao/NotionNext.git`。`upstream` 仅用于获取和比较原项目更新。本地已禁用 `upstream` 的推送地址，默认推送目标为 `origin`。
- 先比较共同基线、上游更新和 Fork 定制，再决定同步范围。无文本冲突不代表没有功能、样式或配置变化。
- 优先保留 Simple 主题样式、禁止内容卡片悬停位移的定制、`public/images/simple-hero-bg.webp`、个人 favicon、`themes/simple/config.js` 中的个人介绍，以及正文绿色文字样式。
- 保留 `components/NotionPage.js` 与 `lib/notion/normalizeTitlelessQuoteBlocks.js` 的无标题引用块修复；保留 `lib/db/notion/getPostBlocks.js` 的页面提及记录补全、批量失败后逐页回退、可用记录过滤和缓存更新，以及对应测试。除非已证明上游完整替代这些行为，否则不得删除。
- `lib/db/notion/getPostBlocks.js`、其测试和 `styles/notion.css` 需要按具体改动合并，不要直接用上游整份文件覆盖，也不要用个人整份文件阻挡所有上游修复。
- 默认字体、Simple 页眉页脚统计、PWA 图标、URL 配置、依赖升级需要检查对个人站点的影响。仓库元信息或文档中的上游地址迁移不能改变本项目的 `origin`。
- 不运行整库同步脚本或直接同步 main 来代替范围评估。用户仅要求判断时，完成报告和合并模拟即可；只有用户要求实际同步时才实施同步。
- 同步在独立分支准备和验证。远程推送、合并与部署按用户实际授权范围执行。

2026-10-05 的评估基准：Fork `c18cfc21819d12eb4be199eca71aafe32079b3b2`，上游 `2a11032252faa3cb3cd62438e821afd245810164`，共同基线 `3223b66f89d38ae89d4638c617c39d091a1ad7e1`。后续评估必须重新获取分支状态，不能把这些提交当作永远最新。
