# 人驱动 AI 的软件生命周期模型

这个仓库定义从需求分析到维护的 AI 驱动开发流程。人表达目标、提供约束、作出关键决定；AI 完成澄清、设计、编码、测试、发布和修订。每个阶段定义制品，每个人机操作配套可复制的示例提示词。

## 从哪里开始

先看[生命周期模型图解](model/visual-guide.md)：总览、协作时序和制品流转，均附可编辑源码与 SVG/PNG。

![人驱动AI的软件生命周期总览](model/diagrams/lifecycle.svg)

1. [模型总纲](model/overview.md)：六阶段、反馈路径、人和 AI 的职责。
2. [制品目录](model/artifact-catalog.md)：A01–A22 的用途、生成规范和下游使用方式。
3. [提示词协议](model/practices/prompt-protocol.md)：参数、执行链、失败处理与事实来源。
4. [A03 功能规格样板](model/artifacts/A03-feature-spec.md)：内容规范、操作提示词、模板与教学示例。
5. [团队裁剪](model/tailoring.md)：个人、小团队和大型团队如何简化。
6. [FocusTask 示例](examples/focustask/README.md)：产品输入、实证切片、应用与证据入口。

## 生命周期指南

[需求分析](model/stages/requirements.md) → [设计](model/stages/design.md) → [实现](model/stages/implementation.md) → [验证](model/stages/verification.md) → [发布](model/stages/release.md) → [维护](model/stages/maintenance.md)。失败按原因返回相关阶段，不必重建全部文档。

首次准备见[仓库初始化](model/practices/initialization.md)。[上下文交接](model/practices/context.md)、[变更控制](model/practices/change-control.md)和[验证规则](model/practices/verification.md)贯穿全过程。

## 规范、模板、示例、证据

- model：可重复使用的模型与制品规范。
- templates：空白模板；不代表真实决定或结果。
- examples/focustask/docs：保留的产品规格、实证范围和标注为教学的填写示例。
- examples/focustask/evidence：仅存真实运行与交互记录；未执行的步骤不能预填通过。
- execution：实施计划的进度、决定、阻塞和迁移基线。

当前建设状态见[执行状态](execution/status.md)，范围和最终验收见[实施计划](AI_LIFECYCLE_IMPLEMENTATION_PLAN.md)。FocusTask已完成首版发布、筛选迭代、权限缺陷修复、坏版本回退、独立会话接手和最终rc3缩放修复发布；[交付报告](execution/delivery-report.md)与[实证评价](examples/focustask/evaluation.md)分别记录结论和局限。应用的实际准备/运行入口见示例README，不能据此声称效率提升、企业规模有效性或真实生产就绪。

## 文档验证

在仓库根目录运行 `node scripts/check-docs.mjs`。应用目录examples/focustask/app提供真实的lint、typecheck、test、test:e2e和build脚本；需先按示例README准备隔离环境。实际结果见evidence/runs，不存在或未执行的命令不记为通过。

## 事实来源与贡献

模型变更依据用户确认的目标和实施计划。项目业务冲突按[约定](model/conventions.md)处理：适用的已接受 ADR > 当前功能/页面规格 > 领域/权限/非功能规则 > 范围与路线图 > 概述。模板和教学实例没有覆盖已确认规则的权力。

先阅读[AGENTS.md](AGENTS.md)，一次完成一个可验收任务，保存证据和版本。原文档入口保留迁移链接，历史正文冻结于 execution/baseline，不再作为活动操作指南。
