# 人驱动 AI 的软件生命周期模型

人通过目标、约束和反馈驱动 AI 完成软件开发。最新方向以演化型原型为核心：**原型构建、原型重构、原型审查、原型精修**可按功能或迭代裁剪组合，之后进行独立验收、直接本地发布和维护。

## 当前状态

仓库已按[清理计划](AI_LIFECYCLE_V03_CLEANUP_PLAN.md)整理。现有 A01–A22、通用实践及教学例是后续输入；四项活动的详细指南、A23–A27 和新版图解仍待[修订计划](AI_LIFECYCLE_V03_REFINEMENT_PLAN.md)实施。

本仓库仅含方法论和教学材料，不提供应用、数据库或真实实证记录。教学例不代表实现完成、运行通过或模型效果已验证。

## 阅读与执行入口

1. [最新修订计划](AI_LIFECYCLE_V03_REFINEMENT_PLAN.md)：原则、任务与验收标准。
2. [模型总纲](model/overview.md)：活动与生命周期边界。
3. [制品目录](model/artifact-catalog.md)：规范、空白模板和教学例。
4. [提示词协议](model/practices/prompt-protocol.md)：输入、生成、检查与交接。
5. [初始化](model/practices/initialization.md)与[裁剪](model/tailoring.md)：工作规则和项目适配。
6. [FocusTask 教学入口](examples/focustask/README.md)：业务上下文及填写示例。

当前任务以[执行状态](execution/status.md)为准，提交及删除范围见[清理记录](execution/cleanup.md)。不要重复执行已完成的清理或恢复旧方案入口。

## 目录与检查

`model/` 保存规范和实践，`templates/` 保存模板，`examples/focustask/` 只保存教学材料，`execution/` 保存当前执行记录。

在根目录运行 `node scripts/check-docs.mjs` 检查文档，运行 `node --test scripts/check-docs.test.mjs` 检查工具。没有应用 npm 命令；新版图解源码尚未建立，渲染器应报告缺输入。

贡献前读取 [AGENTS.md](AGENTS.md)。一次推进一个可检查任务，同步规格、示例、索引和状态；不把教学或计划当作真实确认和通过证据。
