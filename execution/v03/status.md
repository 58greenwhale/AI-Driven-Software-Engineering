# V03 任务状态

本目录记录[方法论建设计划](../../AI_LIFECYCLE_V03_REFINEMENT_PLAN.md) V03-01 至 V03-07 的执行状态、决定与检查，是中断后的恢复入口。仓库整体进度见[执行状态](../status.md)，检查命令与实际结果见[检查记录](validation.md)，取舍见[决定记录](decisions.md)。

## 任务进度

| 任务 | 状态 | 依据与剩余工作 |
| --- | --- | --- |
| V03-01 现状盘点与任务准备 | 完成 | 材料、Git 工作区、工具与缺口已核对；未修改模型、模板、教学材料或工具 |
| V03-02 总纲与裁剪 | 待执行 | 下一任务：完善总纲、约定、初始化与跨阶段实践、三种活动组织方式 |
| V03-03 活动指南 | 部分完成 | 四份活动指南与三份阶段指南已建；输入、决定与返回关系需在 V03-02 后复核 |
| V03-04 制品与示例 | 部分完成 | A23–A27 三类文档已建；A01–A22 标题与正文改写未开展 |
| V03-05 索引与校验 | 待执行 | `model/workflow-index.json` 未建，检查器活动与阶段清单仍写在脚本内 |
| V03-06 图解与入口 | 部分完成 | 四组源码与 8 个导出已交付；渲染器未指定 `--cli` 时的行为待决定 |
| V03-07 静态验收与交付 | 待执行 | 十二场景走查未开展，交付记录届时建立 |

## 盘点基线

基线提交 bdcef91，`master` 与 `origin/master` 一致，工作区无未提交或未跟踪改动，`.DS_Store` 由 `.gitignore` 忽略，无需保护的既有用户改动。

材料齐备度：`model/artifacts/`、`templates/`、`examples/focustask/docs/artifact-examples/` 各 27 份，覆盖 A01–A27；`model/stages/` 7 份指南（构建、重构、审查、精修四项活动与独立验收、发布、维护三个阶段）；`model/practices/` 5 份；`model/diagrams/` 4 份 `.mmd` 与 8 个 SVG/PNG 导出；`model/artifact-index.json` 27 条。

主要缺口按计划章节：3.1 的 A01–A22 标题与正文改写（例如 A03 现为“功能规格”、A10 现为“任务与依赖计划”）；3.4 的工作流索引与检查器整合；5.2 的渲染器诊断；5.3 的十二场景静态走查。逐项事实见[检查记录](validation.md)。

## 文件边界

可修改：`model/`、`templates/`、`examples/focustask/`、`scripts/`、`README.md`、`AGENTS.md`、`execution/`。不修改：已导出的 SVG/PNG（只改 `.mmd` 后重新导出）、仓库依赖与 `package.json`、任何应用或数据库。教学目录同时遵循 `examples/focustask/AGENTS.md`。

## 未决项与下一步

未决项：渲染器在未指定 `--cli` 时抛出未捕获 ENOENT，是加干净诊断还是在文档中固定要求带参数，需人在 V03-06 前确认，详见[决定记录](decisions.md)的 D-V03-03。

下一步：执行 V03-02，完成条件为四项活动的输入、决定、返回关系及裁剪责任一致；检查入口为 `node scripts/check-docs.mjs` 与 `node --test scripts/check-docs.test.mjs`。
