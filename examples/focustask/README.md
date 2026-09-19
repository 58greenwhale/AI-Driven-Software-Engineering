# FocusTask 教学示例

FocusTask 用创建任务和任务列表场景演示生命周期制品的填写。材料使用虚构数据，包含业务上下文、规范对应的填写示例和检查方法；运行类检查不作通过结论。

## 使用方式

先阅读[教学上下文](docs/context.md)，了解范围、权限、幂等、筛选和验收设定，再从[制品目录](../../model/artifact-catalog.md)选择规范和模板。

建议从以下示例开始：

1. [A03 功能规格（SOP）](docs/artifact-examples/A03-feature-spec.md)：将业务规则写成可验证行为。
2. [A07 验证策略](docs/artifact-examples/A07-verification-strategy.md)：选择观察手段和测试条件。
3. [A14 验收记录](docs/artifact-examples/A14-acceptance.md)：区分预期结果、实际结果和运行条件缺口。

## 采用到实际项目

`teaching-base` 和 `teaching-filter` 是教学场景标识。示例中的接口、代码结构和命令描述目标项目的设定。实际采用时需要确认范围、建立候选与环境、执行检查并保存证据；教学例本身不授予执行权限。

本目录只提供文档。检查从仓库根运行 `node scripts/check-docs.mjs`。
