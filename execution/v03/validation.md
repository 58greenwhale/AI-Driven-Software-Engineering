# V03 检查记录

命令均在仓库根运行，结果按实际输出登记。V03-01 未修改模型、模板、教学材料或工具，本目录三份记录是该轮唯一新增文件。

## V03-01 实际检查

| 命令 | 退出码 | 结果 |
| --- | --- | --- |
| `node scripts/check-docs.mjs` | 0 | 111 份 Markdown、366 个本地链接、artifacts 27、activities 4、stages 3、errors 0 |
| `node --test scripts/check-docs.test.mjs` | 0 | 36 项通过、0 失败/跳过 |
| `git diff --check` | 0 | 无空白错误 |
| `git status -sb`、`git rev-parse HEAD`、`git rev-parse origin/master` | 0 | 盘点起点 `master` 与 `origin/master` 同为 bdcef91，工作区干净 |
| `node scripts/render-model-diagrams.mjs` | 1 | 未指定 `--cli` 时抛未捕获 `spawnSync mmdc ENOENT`；未生成或覆盖任何导出文件，此结果只说明诊断缺失，不表示导出成功 |

文档检查与测试的数字在建立本目录三份记录之后运行取得，已包含这三份文件自身。

## V03-02 实际检查

| 命令 | 退出码 | 结果 |
| --- | --- | --- |
| `node scripts/check-docs.mjs` | 0 | 111 份 Markdown、375 个本地链接、artifacts 27、activities 4、stages 3、errors 0 |
| `node --test scripts/check-docs.test.mjs` | 0 | 36 项通过、0 失败/跳过 |
| `git diff --check` | 0 | 无空白错误 |

改动文件：`model/overview.md`（组织方式指向裁剪、地图条目描述）、`model/tailoring.md`（标题改为“裁剪、组合与并行”，新增活动组织与并行小节及 TAILOR-ORG 提示词）、`model/practices/initialization.md`（AGENTS 七项最低内容与工程基线清单）、`model/conventions.md`（新增追踪范围与演化）、`model/practices/change-control.md`（同类问题排查横贯规则）、四份活动指南的交接出口各补一句裁剪与并行衔接、`execution/status.md` 覆盖行措辞。

一致性核对：四份活动指南的触发、输入、产出、退出与失败返回逐项对应计划 2.2 至 2.5；产出制品与总纲点名的 A23 至 A27 一致；`model/visual-guide.md` 的活动组织段与裁剪文档新增表格口径一致（按功能、按迭代、混合组织，裁剪选择记录在 A10）；同类问题排查在重构、审查、维护指南与变更控制实践中均已出现，构建、精修与独立验收指南的点名留待 V03-03。本轮未运行图解导出，8 个导出文件未变。

## V03-03 实际检查

| 命令 | 退出码 | 结果 |
| --- | --- | --- |
| `node scripts/check-docs.mjs` | 0 | 111 份 Markdown、380 个本地链接、artifacts 27、activities 4、stages 3、errors 0 |
| `node --test scripts/check-docs.test.mjs` | 0 | 36 项通过、0 失败/跳过 |
| `git diff --check` | 0 | 无空白错误 |
| `grep -rn 独立验证 model/ examples/ README.md` | 1 | 无匹配，阶段名已统一 |

文档检查的数字在更新本目录记录之后运行取得。改动文件：`model/stages/05-verification.md`（标题与 VAL-START 小节名、验收者与独立性表述、产出补 A26、VAL-REVIEW 补同类排查）、四份活动指南（链接文字统一，构建与精修补同类排查）、`model/stages/06-release.md`（失败返回点名四项活动）、`model/stages/07-maintenance.md`、`model/conventions.md`、`model/practices/verification.md` 与两份教学例的术语。

一致性核对：三份阶段指南的触发、输入、产出、退出与失败返回均点名上游活动与制品，独立验收输入含 A23 至 A27，维护返回构建/重构/精修并经审查，发布返回四项活动；同类问题排查在构建、重构、审查、精修、独立验收、维护六份指南与变更控制实践中均可到达；`.mmd` 源码未改，8 个导出文件未变。

## V03-04 批次 1 实际检查

| 命令 | 退出码 | 结果 |
| --- | --- | --- |
| `node scripts/check-docs.mjs` | 0 | 111 份 Markdown、381 个本地链接、artifacts 27、activities 4、stages 3、errors 0 |
| `node --test scripts/check-docs.test.mjs` | 0 | 36 项通过、0 失败/跳过 |
| `git diff --check` | 0 | 无空白错误 |
| `grep -rn 任务与依赖计划 model/ model/templates/ examples/ README.md` | 1 | 无匹配，A10 旧名已清除 |

改动文件：A03 与 A10 的规范、模板、教学例，`model/artifact-index.json` 两条 title，`model/artifact-catalog.md` 两行，`model/artifacts/A01-scope.md` 与 `model/artifacts/A02-domain-permissions.md` 的质量标准段，`model/artifacts/A23-prototype-feedback.md` 与 `examples/focustask/README.md` 的引用。

内容改写依据计划 3.1：A03 标题明确为功能规格（SOP），必填章节的流程与数据变化补角色与权限判定，并写明顶层目标留在 A01、术语与权限以 A02 为准、模拟与假设须澄清；A10 标题改为设计与实施计划（plan），新增方案与理由、活动裁剪与并行边界、验证与集成条件三章，模板与教学例同步填 FocusTask 教学内容，九类提示词中的名称与检查要点一并更新；A01 补顶层目标与细节边界，A02 补未确认交互不自动进入规则。文档检查的数字在更新本目录记录之后运行取得。

## V03-04 批次 2 实际检查

| 命令 | 退出码 | 结果 |
| --- | --- | --- |
| `node scripts/check-docs.mjs` | 0 | 111 份 Markdown、381 个本地链接、artifacts 27、activities 4、stages 3、errors 0 |
| `node --test scripts/check-docs.test.mjs` | 0 | 36 项通过、0 失败/跳过 |
| `git diff --check` | 0 | 无空白错误 |
| 结构一致性核对脚本（临时运行，未入库） | 0 | 27 类制品的规范章节表与模板 H2 全部对应，教学例仅多出教学样例章节，0 处不一致 |

改动文件：A04、A05、A06、A07 的规范、模板与教学例共 12 份。

内容改写依据计划 3.1：A04 新增“现状、目标与确认设计”章节并在质量标准与三条提示词中要求区分当前实现、目标约束与确认设计，重构差距归 A24；A05 新增“设计来源与确认”章节，写明本文保存当前用于编码与验证的 UI 行为、设计交付与确认过程归 A27、未确认图稿不自动成为要求；A06 触发条件补重构技术选型与精修设计取舍，新增“触发活动与关联”章节；A07 新增“验证类型与责任”章节，质量标准列明体验检查、行为保持、工程质量、审查后回归、视觉交互验证与独立验收六类的判据、执行者与记录位置。文档检查的数字在更新本目录记录之后运行取得。

## V03-04 批次 3 实际检查

| 命令 | 退出码 | 结果 |
| --- | --- | --- |
| `node scripts/check-docs.mjs` | 0 | 111 份 Markdown、382 个本地链接、artifacts 27、activities 4、stages 3、errors 0 |
| `node --test scripts/check-docs.test.mjs` | 0 | 36 项通过、0 失败/跳过 |
| `git diff --check` | 0 | 无空白错误 |
| 结构一致性核对脚本（临时运行，未入库） | 0 | 27 类制品的规范章节表与模板 H2、教学例 H2 逐项对应，0 处不一致 |

改动文件：A08、A09、A11、A12、A13、A14 的规范、模板与教学例共 18 份。

内容改写依据计划 3.1：A08 章节表补齐 AGENTS 七项最低内容（新增技术栈与规范，定位补非目标、事实来源补冲突处理与状态入口、执行与决策补演化与同类排查、命令补工作目录与待建立标记、安全与交付补候选版本与证据），质量标准补生成指导并链接首次准备；A09 新增增强路线章节，质量标准写明先最小可运行再逐步增强、不把完整基础设施设为前提；A11 新增演化来源章节，质量标准写明整体替换仍属演化并由 A23 记版本与确认；A12 检查覆盖补首轮逐行与后续差异、未覆盖原因与单列检查方式，新增解读与排查入口章节；A13 补当前所处活动与下一活动入口，写明自检不等于验收；A14 依据与环境补独立性依据，质量标准写明独立性体现为职责、依据与记录，可用同种或不同 AI 工具。文档检查的数字在更新本目录记录之后运行取得。

## 材料与工具盘点事实

| 项目 | 事实 |
| --- | --- |
| 制品三类文档 | `model/artifacts/`、`model/templates/`、`examples/focustask/docs/artifact-examples/` 各 27 份，编号 A01–A27 连续无缺 |
| 指南 | `model/stages/` 7 份：01-prototype-building、02-prototype-refactoring、03-prototype-review、04-prototype-polishing、05-verification、06-release、07-maintenance |
| 实践 | `model/practices/` 5 份：initialization、prompt-protocol、context、change-control、verification |
| 图解 | `model/diagrams/` 4 份 `.mmd`（lifecycle、collaboration、artifacts、organization）、4 份 `.svg`、4 份 `.png`，另有 `mermaid-config.json` 与生成说明 |
| 索引 | `model/artifact-index.json` 为 27 条数组；`model/workflow-index.json` 不存在 |
| 检查器 | `scripts/check-docs.mjs` 把活动与阶段清单写在脚本内（activities 4、stages 3），未读取工作流索引 |
| 规范标题 | A03 为“功能规格”、A10 为“任务与依赖计划”，与计划 3.1 要求的“功能规格（SOP）”“设计与实施计划（plan）”不一致 |
| 工具版本 | Node v26.2.0、npm 11.13.0、git 2.54.0（Apple Git-157） |
| 仓库外绘图工具 | `/tmp/mmdc-tools` 内 @mermaid-js/mermaid-cli 11.15.0，`node_modules/.bin/mmdc` 可执行；其 `puppeteer-config.json` 的 `executablePath` 指向本机 chrome-headless-shell 152.0.7977.30，该文件实际存在 |

V03-06 重新导出时使用已核实的仓库外工具，命令形如：

```sh
node scripts/render-model-diagrams.mjs --cli <mermaid-cli 可执行文件> --puppeteer-config <指向本机浏览器的 JSON>
```

本轮未运行导出命令，8 个导出文件保持上一轮产物；届时需记录实际路径、退出码并逐张核对文字、连线、遮挡与语义。
