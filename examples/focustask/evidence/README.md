# 实证证据索引

只记录真实发生的检查与交互。教学例子在docs/artifact-examples，不能作为此处结果。

| 阶段 | 当前证据 | 状态 |
| --- | --- | --- |
| 初始盘点 | 根execution/inventory、migration及baseline | 已发生 |
| 文档与提示词 | [交互记录](interactions.md)、[制品实际使用](artifact-usage.md) | 已定义并通过样例使用，普适性不外推 |
| 工程/应用 | [工程基线](../docs/engineering-baseline.md)、runs中当前源码/规格摘要与真实检查 | 最终15单元/集成、rc3 E2E56通过，4非Chromium测量API副本跳过 |
| 独立验收 | [文档审查](model-review-01.md)、[v0.1验收](acceptance-v01.md)、[v0.2验收](acceptance-v02.md)、[追踪表](traceability.md) | 原失败保存，固定rc2通过限定本地发布 |
| 发布/维护 | [v0.1运行](releases/v0.1.0/run.md)、[v0.2及回退运行](releases/v0.2.0-rc2/run.md)、[最终rc3运行](releases/v0.2.0-rc3/run.md)、[维护报告](maintenance/report.md) | 全部真实执行；权限故障/修复另有JSON与独立报告 |
| 新会话接手 | [实际结果](handoff-api07-result.md) | 0业务澄清、真实下一步完成，局限已记录 |
| 性能 | performance-v01.json及runs对应记录 | 本机测量通过，不扩展到其他硬件 |
| 真实缩放 | browser-zoom-rc3.json与screenshots/chromium-200-real-zoom-date-rc3.png | 修复遮挡后真实zoom=2.0时全部字段可用；长截图历史证据不证明完整视觉 |
| 证据完整性 | 根scripts/audit-evidence.mjs | 基线/源码/产物/截图摘要、运行日志和已知本地秘密扫描 |

候选证据必须有版本/源码快照，命令、工作目录、环境、时间、退出码与路径。模板里的占位结果不能进入真实报告。大型产物保存在忽略的本地目录并提供摘要及重建方式。
