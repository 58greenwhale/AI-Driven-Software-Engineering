# 人驱动 AI 的软件生命周期模型

本模型以演化型原型为核心，由人提供目标、约束和反馈，驱动 AI 完成软件开发。开发活动包括**原型构建、原型重构、原型审查、原型精修**，可以按功能或迭代裁剪组合，并衔接独立验收、本地发布与维护。

仓库提供方法论、制品规范、空白模板和教学示例。教学材料使用虚构场景，用于说明工作方法与文档内容，不作为运行结果或模型效果的证据。

## 如何使用

1. 阅读[模型总纲](model/overview.md)，了解活动关系、人和 AI 的职责及适用边界。
2. 从[制品目录](model/artifact-catalog.md)选择所需规范、模板和填写示例；系统化工作先建立 A29 系统蓝图，再建立 A28 模块蓝图并展开各功能点 A03。
3. 根据[初始化](model/practices/initialization.md)与[裁剪规则](model/tailoring.md)确定工作环境和制品组合。
4. 使用[提示词协议](model/practices/prompt-protocol.md)驱动 AI 生成、检查、修订和交接制品。
5. 进入[原型构建](model/stages/01-prototype-building.md)、[原型重构](model/stages/02-prototype-refactoring.md)、[原型审查](model/stages/03-prototype-review.md)、[原型精修](model/stages/04-prototype-polishing.md)等活动指南。
6. 结合[FocusTask 教学上下文](examples/focustask/docs/context.md)和[示例入口](examples/focustask/README.md)练习完整的输入与输出表达。

## 目录

| 目录 | 用途 |
| --- | --- |
| `model/` | 模型、制品规范与通用实践 |
| `model/templates/` | 可填写的制品模板 |
| `examples/focustask/` | 教学上下文及制品填写示例 |
| `scripts/` | 文档检查和图解生成工具 |
| `execution/` | 建设状态和任务检查结果 |

## 检查与贡献

文档覆盖与建设进度见[执行状态](execution/status.md)，交付目标及任务见[方法论建设计划](AI_LIFECYCLE_V03_REFINEMENT_PLAN.md)。贡献前阅读 [AGENTS.md](AGENTS.md)，一次推进一个可检查任务，同步相关规范、示例、索引和状态。

在仓库根目录运行：

```sh
node scripts/check-docs.mjs
node --test scripts/check-docs.test.mjs
```

生命周期、人机协作、制品流转与活动组织四组图解含 Mermaid 源码及 SVG/PNG 导出，读图与生成方式见[图解说明](model/visual-guide.md)。本仓库的检查针对文档与工具；教学中的应用命令需要在实际目标项目中建立并验证。
