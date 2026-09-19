# 迁移映射

初始正文冻结于 [baseline](baseline/README.md)。每个当前入口迁移后仅保留新链接，避免两份活动规格。

| 原文件 | 活动内容目标 |
| --- | --- |
| docs/product、glossary、domain、permissions、architecture、non-functional、design-system、user-journeys | examples/focustask/docs/ 下对应文件 |
| docs/features、pages、decisions | examples/focustask/docs/ 下对应目录 |
| docs/roadmap | examples/focustask/docs/roadmap.md 保留愿景任务；实证任务另列 |
| docs/definition-of-done | model/practices/verification.md；示例保留质量标准与适用映射 |
| docs/repository-initialization | model/practices/initialization.md |
| docs/development-workflow | model/overview.md 与 stages/、practices/ |
| docs/agent-context-management | model/practices/context.md |
| docs/release-readiness | model/stages/release.md |
| AI_PROJECT_DOCUMENTATION_GUIDE | model/overview.md 与 model/artifact-catalog.md |
| README、AGENTS | 根目录改为模型入口与实际执行规则 |

## 已发现的冲突

| 来源 | 条款/问题 | 影响与处置 |
| --- | --- | --- |
| 原 roadmap | 多数任务为就绪但依赖未完成；RELEASE-001 依赖所有 P0 含自身 | 历史数据保留；新的实证路线图纠正，不把旧状态当完成事实 |
| 原 workflow 与 DoD | 完成要求已合并，合并要求先验收 | 区分候选版本验收和任务完成，不让验收依赖合并 |
| 原架构 | “忽略并拒绝”伪造字段语义相冲突 | 按禁止客户端伪造的严格规则在示例契约明确拒绝未知写字段 |
| 原发布指南 | “可重复执行迁移”含混 | 改为迁移工具记录已执行版本，验证重跑不重复应用 |
| 原指南边界 | 排除发布维护 | 新用户定位和实施计划已扩展范围；历史文本冻结，活动指南更新 |

决策责任：前三类流程/表述纠正依据已确认计划直接处理；新的业务结果差异仍由用户决定。
