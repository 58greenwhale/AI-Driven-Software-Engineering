# 制品目录

制品由用途决定，编号稳定，实例随项目和版本更新。本目录列出 A01–A27 的用途、适用条件和生成规范，每类配套空白模板及教学填写示例。

下表输出位置以目标项目为根目录，是实例存放位置的建议。教学输入见 [FocusTask 上下文](../examples/focustask/docs/context.md)，文档覆盖与建设进度见[执行状态](../execution/status.md)。

## 导航

| 编号 | 类型 | 必需性与触发 | 输出位置（项目内示例） |
| --- | --- | --- | --- |
| A01 | [范围说明](artifacts/A01-scope.md) | 必要；可与 A02/A03 合并；首次项目、版本目标或范围发生变化 | `docs/scope.md` |
| A02 | [领域与权限规则](artifacts/A02-domain-permissions.md) | 有业务数据时必要；术语可独立文件；业务实体、状态、权限或数据约束发生变化 | `docs/domain-permissions.md` |
| A03 | [功能规格（SOP）](artifacts/A03-feature-spec.md) | 每项业务功能必要；AC 可嵌入本文；新增功能、确认需求变化或发现规格歧义 | `docs/features/TASK-001-create-task.md` |
| A04 | [架构与契约](artifacts/A04-architecture-contracts.md) | 必要；接口和非功能可分文档；首次设计、公共接口/数据/依赖边界变化 | `docs/architecture-contracts.md` |
| A05 | [UI 与交互规格](artifacts/A05-ui-spec.md) | 有 UI 时必要；全局令牌可共用；新增页面、布局、交互或状态变化 | `docs/pages/task-list.md` |
| A06 | [重要决定记录](artifacts/A06-adr.md) | 条件触发；不为普通命名创建；影响多功能、难以逆转或修改既有主要约束 | `docs/decisions/0002-example.md` |
| A07 | [验证策略](artifacts/A07-verification-strategy.md) | 必要；不能实现后倒推放宽标准；实现前建立；风险或范围变化后更新 | `docs/test-strategy.md` |
| A08 | [Agent 工作规则](artifacts/A08-agent-rules.md) | 必要；根规则与示例规则各自限定范围；首次初始化、工具/模块/验证规则变化 | `AGENTS.md` |
| A09 | [工程基线](artifacts/A09-engineering-baseline.md) | 新项目必要；非文档主体加基线清单；新项目、环境或依赖变化 | `app/ 与 docs/engineering-baseline.md` |
| A10 | [设计与实施计划（plan）](artifacts/A10-task-plan.md) | 必要；可用表格无需项目管理系统；首次拆分、范围/依赖/执行状态变化 | `docs/iteration-plan.md` |
| A11 | [实现包](artifacts/A11-implementation.md) | 功能变更必要；源代码为主体，清单不能替代；功能实现、修复或已确认重构 | `app/ 与 docs/implementation.md` |
| A12 | [代码与制品评审记录](artifacts/A12-review.md) | 必要；可用本地记录，外部PR非必需；候选形成、修复后复评 | `evidence/review.md` |
| A13 | [会话交接](artifacts/A13-handoff.md) | 条件触发；可并入交付记录；上下文切换、长任务检查点、执行者变化 | `evidence/handoff.md` |
| A14 | [独立验收报告](artifacts/A14-acceptance.md) | 必要；只读产品实现；候选自检后及影响行为的变更后 | `evidence/acceptance.md` |
| A15 | [缺陷与变更单](artifacts/A15-change-defect.md) | 条件触发；缺陷和需求变更标不同类型；问题或范围变化出现时，早于改代码 | `docs/changes/CHANGE-001.md` |
| A16 | [制品与验收追踪表](artifacts/A16-traceability.md) | 必要；表格即可，可自动汇总但需查内容；每次生成、修订、验证、发布后增量更新 | `evidence/traceability.md` |
| A17 | [发布清单](artifacts/A17-release-manifest.md) | 每次发布必要；每个发布候选生成，变化则重新核对 | `evidence/releases/{版本}/manifest.md` |
| A18 | [部署与回退指南](artifacts/A18-deploy-rollback.md) | 每个部署目标必要；可共享版本化脚本；首次部署目标、配置或兼容性变化 | `docs/deploy-rollback.md` |
| A19 | [发布运行记录](artifacts/A19-release-run.md) | 每次发布必要；教学记录不可代替；实际部署或回退发生时逐步记录 | `evidence/releases/{版本}/run.md` |
| A20 | [维护验证报告](artifacts/A20-maintenance.md) | 项目按维护事件触发；每次修复/变更/回退演练 | `evidence/maintenance/report.md` |
| A21 | [实际人机交互记录](artifacts/A21-interaction-log.md) | 研究实证时必要；普通项目可简化；关键活动、决定、反馈和恢复时记录 | `evidence/interactions.md` |
| A22 | [模型实证评价](artifacts/A22-model-evaluation.md) | 开展模型评价时使用；先定义问题，再填真实观察与局限 | `evaluation.md` |
| A23 | [原型版本与反馈确认记录](artifacts/A23-prototype-feedback.md) | 每轮原型构建必要；轻量项目可并入A10/A16章节但保留版本与确认字段；新版本、体验反馈或确认行为变化时更新 | `evidence/prototypes/{版本}/feedback.md` |
| A24 | [工程化差距与重构方案](artifacts/A24-refactoring-plan.md) | 条件触发；开展重构、模拟实现替换或整体重写时必要；无重构需要不强制 | `docs/refactoring-plan.md` |
| A25 | [面向人的实现解读](artifacts/A25-implementation-guide.md) | 首轮系统审查后必要；可按模块增量；代码变化后同步更新 | `docs/implementation-guide.md` |
| A26 | [同类问题排查与修复记录](artifacts/A26-pattern-remediation.md) | 发现缺陷、验收失败或维护问题时必要；未发现其他实例也记录范围、方法与限制 | `evidence/pattern-remediation.md` |
| A27 | [视觉与交互设计交付包](artifacts/A27-design-delivery.md) | 有UI且开展精修时必要；无UI不生成但保留A05；设计来源、版本或交付内容变化时更新 | `docs/design/{特性}/delivery.md` |
