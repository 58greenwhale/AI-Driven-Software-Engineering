# 人驱动 AI 的软件生命周期模型

本模型以演化型原型组织开发：人负责目标、关键业务规则和重要取舍，AI 协助分析、生成制品、执行、解释和验证。本仓库使用的 vibe coding 指这一协作方式。适用范围从需求澄清到维护，市场发现与商业运营不展开。

## 生命周期与活动

目标与最小准备 → 按项目组织原型构建、原型重构、原型审查、原型精修 → 独立验收 → 直接本地发布 → 维护与下一轮。

原型构建包含需求获取、分析、设计、实现、体验反馈和澄清。原型持续演化：下一版本以当前原型、反馈和确认行为为输入，代码可以部分或全部替换。模拟和未确认行为须经澄清后才能成为正式需求。

原型重构对齐技术栈、架构和非功能约束，同步实现、测试与工作规则。原型审查检查实现、生成面向人的解读，并从单个问题排查全项目同类实例。原型精修使用 AI、人工或混合设计改善 UI 与交互；行为变化同步规格并重新审查、回归。

四项活动分别产生 A23 原型版本与反馈确认记录、A24 工程化差距与重构方案、A25 面向人的实现解读、A26 同类问题排查与修复记录、A27 视觉与交互设计交付包。

活动可按功能并行、按迭代顺序或混合组织，可裁剪合并；三种方式的执行条件、A10 记录项与并行责任见[裁剪](tailoring.md)。适用的质量、确认和追踪责任持续有效，安全与数据保护从构建开始落实。

独立验收依据确认规格和固定候选，验收者只读实现；发现问题后交回相关活动，修复后对新候选复验。发布与维护在本地目标环境操作，按项目要求验证服务、数据及恢复能力。

## 制品与操作入口

本节按用途分组，便于直接进入某项操作；首次阅读与阅读时机见下文模型文档地图。

- [制品目录](artifact-catalog.md)：按用途选择规范、模板与教学例。
- [初始化](practices/initialization.md)、[裁剪](tailoring.md)、[提示词协议](practices/prompt-protocol.md)：准备工作与操作方法。
- [原型构建](stages/01-prototype-building.md)、[原型重构](stages/02-prototype-refactoring.md)、[原型审查](stages/03-prototype-review.md)、[原型精修](stages/04-prototype-polishing.md)：四项开发活动的操作链与提示词。
- [生命周期图解](visual-guide.md)：活动关系、人机协作、制品流转与组织方式。
- [交接](practices/context.md)、[变更](practices/change-control.md)、[验证规则](practices/verification.md)：贯穿各项活动的工作机制。
- [独立验收](stages/05-verification.md)、[发布](stages/06-release.md)、[维护](stages/07-maintenance.md)：候选交付与运行反馈的操作指南。
- [教学上下文](../examples/focustask/docs/context.md)：创建任务和任务列表的示例输入。

制品版本、确认来源和证据失效遵循[约定](conventions.md)。文档覆盖与建设进度见[执行状态](../execution/status.md)。

## 模型文档地图

本节按阅读时机排列：先看全景与规则，再确定制品和准备方式，然后进入操作，最后是教学与建设状态。

- 总纲（本文）：活动关系、人与 AI 职责及适用边界；首次阅读与模型变更前的起点。
- [生命周期图解](visual-guide.md)：四组图解与读图要点；需要整体关系或向人解释模型时，改源码或重新导出见[生成说明](diagrams/README.md)。
- [约定](conventions.md)：制品标识、状态分类、证据与失效规则；生成或修订任何制品前核对。
- [裁剪](tailoring.md)：活动组织、并行边界和 A10 记录要求；首次采用、组织方式或团队/风险变化时。
- [制品目录](artifact-catalog.md)：A01–A27 的规范、模板与教学例入口；选择或填写制品时。机器可读清单见[制品索引](artifact-index.json)，供文档检查器校验编号与三类文档齐备。
- 实践：对应操作开始前读相应实践，含[初始化](practices/initialization.md)、[提示词协议](practices/prompt-protocol.md)、[交接](practices/context.md)、[变更](practices/change-control.md)、[验证规则](practices/verification.md)。
- 活动与阶段：进入对应活动或阶段时读相应指南，含四项活动（[构建](stages/01-prototype-building.md)、[重构](stages/02-prototype-refactoring.md)、[审查](stages/03-prototype-review.md)、[精修](stages/04-prototype-polishing.md)）与[独立验收](stages/05-verification.md)、[发布](stages/06-release.md)、[维护](stages/07-maintenance.md)。
- [教学上下文](../examples/focustask/docs/context.md)：虚构教学输入；练习填写与检查方法时。
- [执行状态](../execution/status.md)与[方法论建设计划](../AI_LIFECYCLE_V03_REFINEMENT_PLAN.md)：当前任务、覆盖与验收标准；接手或交付前。
