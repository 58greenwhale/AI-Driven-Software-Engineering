# FocusTask 示例项目

FocusTask 是一个供小型团队使用的轻量任务管理器。本仓库当前提供一套完整的示例需求文档，用于演示如何让编码 Agent 实现功能，并让验收 Agent 根据相同规格独立验收。

> 这是文档示例，不包含可运行的产品代码。

## 示例范围

首个版本支持：

- 用户登录；
- 创建和查看项目；
- 邀请项目成员；
- 创建、查看和完成任务；
- 基于角色的访问控制。

批量操作、通知、评论、附件和第三方集成不在首个版本范围内。

## 文档入口

建议按以下顺序阅读：

1. [`docs/product.md`](docs/product.md)：产品目标、用户和版本范围；
2. [`docs/glossary.md`](docs/glossary.md)：统一术语；
3. [`docs/domain.md`](docs/domain.md)：数据模型和业务状态；
4. [`docs/permissions.md`](docs/permissions.md)：角色与权限；
5. [`docs/user-journeys.md`](docs/user-journeys.md)：端到端用户流程；
6. [`docs/design-system.md`](docs/design-system.md)：全局 UI 规则；
7. [`docs/architecture.md`](docs/architecture.md)：技术约束；
8. [`docs/non-functional.md`](docs/non-functional.md)：性能、安全和可靠性指标；
9. [`docs/roadmap.md`](docs/roadmap.md)：实施顺序；
10. [`docs/definition-of-done.md`](docs/definition-of-done.md)：统一完成标准。

具体任务从 [`docs/features/`](docs/features/) 和 [`docs/pages/`](docs/pages/) 开始。Agent 的执行规则见 [`AGENTS.md`](AGENTS.md)。

## 当前示例任务

`TASK-001`：项目编辑者创建任务。

- 功能规格：[`docs/features/TASK-001-create-task.md`](docs/features/TASK-001-create-task.md)
- 页面规格：[`docs/pages/task-list.md`](docs/pages/task-list.md)
- 决策记录：[`docs/decisions/0001-task-status-model.md`](docs/decisions/0001-task-status-model.md)

## 文档优先级

发生冲突时按以下优先级处理：

1. 已确认的决策记录；
2. 功能规格和页面规格；
3. 领域、权限及非功能规则；
4. 产品总纲和路线图；
5. README 中的概述。

如果高优先级文档仍存在歧义，Agent 应记录问题并请求产品负责人决策，不得自行创造关键业务规则。
