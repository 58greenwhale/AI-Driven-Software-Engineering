# FocusTask 教学示例

本目录仅演示生命周期制品如何填写，不含应用、数据库、运行证据或已发布产品。所有场景使用虚构数据，不作通过结论。

## 使用入口

先读[教学上下文](docs/context.md)，了解创建任务和任务列表的范围、权限、幂等、筛选及验收设定，再从[制品目录](../../model/artifact-catalog.md)选择规范、模板和填写示例。

建议先看 [A03 功能规格](docs/artifact-examples/A03-feature-spec.md)、[A07 验证策略](docs/artifact-examples/A07-verification-strategy.md)和 [A14 验收记录](docs/artifact-examples/A14-acceptance.md)，了解如何定义行为、规划验证及记录缺少运行条件。

## 示例与实际项目

`teaching-base`、`teaching-filter` 只是场景标识。代码结构、接口和命令是未来目标项目的设定，不是本目录已有实现。实际采用时需要确认范围、建立候选与环境、实际运行并保存证据。

本目录没有 npm 启动或部署命令。文档检查从仓库根运行 `node scripts/check-docs.mjs`。新活动串联示例及制品仍待[修订计划](../../AI_LIFECYCLE_V03_REFINEMENT_PLAN.md)完成。
