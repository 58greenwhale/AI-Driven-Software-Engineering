# 活动指南、A23–A27 制品与生命周期图解建设计划

> 计划版本：1.0 · 目标模型版本：0.3 · 状态：待执行
>
> 用途：定义本轮扩展任务的交付内容、执行顺序、验收标准与检查方式。整体目标见[方法论建设计划](AI_LIFECYCLE_V03_REFINEMENT_PLAN.md)，当前进度见[执行状态](execution/status.md)。

## 1. 目标与范围

本轮把仓库从"22 类制品 + 3 份阶段指南 + 无图解"推进到"27 类制品 + 4 份活动指南 + 3 份阶段指南 + 四组图解与真实导出"，是 [V03 计划](AI_LIFECYCLE_V03_REFINEMENT_PLAN.md) 中 V03-03（活动指南）、V03-04（A23–A27 制品）与 V03-06（图解与入口）的越序部分执行。

范围内：

- 四份开发活动指南，含每份 7 类操作提示词与教学示例入口。
- A23–A27 五类制品的规范、空白模板与教学填写示例，共 15 份文件。
- 制品索引、制品目录、约定、裁剪、总纲与教学上下文的同步更新。
- 文档检查器与测试扩展：27 类制品、四项活动提示词校验、渲染器与图解用例。
- 四份 Mermaid 源码及其真实导出的 SVG/PNG，以及图解入口文档。

范围外，保持未完成并在状态中如实标注：

- V03-01/V03-02 的体系化改写，以及 A01–A22 正文重写；本轮只更新指向编号范围的引用句。
- `model/workflow-index.json` 与检查器的活动/阶段索引整合，属 V03-05。
- V03-07 静态验收与十二场景走查。
- 任何应用、数据库、真实证据目录、部署演练或应用实证。

工作规则：一次推进一个可检查任务；保护已有工作区改动；不伪造确认、测试、导出或发布结果；教学材料使用虚构数据并标注未执行；导出图由源码生成、不手工编辑；渲染器 CLI 与退出行为不变；不在仓库内新增依赖或 `package.json`。

## 2. 执行任务与顺序

| 任务 | 依赖 | 工作内容 | 完成条件 |
| --- | --- | --- | --- |
| DG-01 盘点与准备 | 无 | 核对 Git 工作区与已有材料，运行基线检查并记录 | 基线结果可复查：检查器 0 错误、测试全绿、渲染器因缺源码退出 1 |
| DG-02 活动指南 | DG-01 | 新建四份活动指南，更新三份阶段指南的输入与返回衔接 | 28 条提示词齐备且各有活动语义，衔接段点名四活动与 A23–A27 |
| DG-03 A23–A27 规范与模板 | DG-02 | 新建 5 份规范与 5 份模板 | 章节、9 类提示词、配套链接与建议输出位置齐备 |
| DG-04 A23–A27 教学例 | DG-03 | 新建 5 份教学例，更新教学上下文说明 | 教学边界标记、输入版本与未执行说明齐备 |
| DG-05 索引与入口 | DG-04 | 更新索引、目录、约定、裁剪与总纲 | 检查器 0 错误、无断链、编号范围与裁剪规则一致 |
| DG-06 检查器与测试 | DG-05 | 扩展到 27 类制品与四项活动校验，补夹具与反例 | 正例通过，反例失败并给出对应诊断 |
| DG-07 图解源码与导出 | DG-06 | 编写四份 `.mmd`，仓库外安装渲染工具，真实导出 8 个文件 | 逐张视觉与语义检查通过，记录实际命令与工具版本 |
| DG-08 图解文档与测试 | DG-07 | 更新图解说明、生成说明、README、AGENTS，补渲染器与图解用例 | 图文一致，渲染器接口未变，测试全绿 |
| DG-09 状态更新与交付 | DG-08 | 更新执行状态，运行全部检查，提交并推送 | 远端与本地一致，范围、检查与未完成项如实记录 |

按表顺序推进，中断后先读执行状态与实际 Git 差异再继续未完成项，不重做已完成制品。阶段性检查不能冒充最终完整检查。

## 3. 四项活动指南

新建 `model/stages/01-prototype-building.md`、`model/stages/02-prototype-refactoring.md`、`model/stages/03-prototype-review.md`、`model/stages/04-prototype-polishing.md`。

结构对齐 [独立验证指南](model/stages/05-verification.md)：`## 进入、职责与输出`（触发/输入/产出/人与 AI 分工/退出/失败返回）、`## 执行步骤与提示词`（引导段 + 7 个 `### 前缀-KEY：说明`，每节含围栏提示词与"预期输出与判断"）、`## FocusTask 教学填写示例`、`## 交接出口`。

提示词前缀：构建 `BUILD`、重构 `REFR`、审查 `AUDIT`、精修 `POLISH`；七类键为 `START`、`DECIDE`、`GENERATE`、`REVIEW`、`VERIFY`、`HANDOFF`、`RECOVER`。内容取自 V03 计划第 2.2–2.5 节的活动定义，逐条针对本活动写作，不复制同一段文字换名。

| 前缀 | 各提示词必须落实的要点 |
| --- | --- |
| BUILD | START 从顶层目标与部分细节启动并标记假设/模拟/未决；DECIDE 处理需求歧义与关键规则缺失且不伪装确认；GENERATE 同步 A03、A10、A11 与 A23；REVIEW 整理体验反馈与差异并区分事实/建议/待决；VERIFY 核对选定行为、运行入口、模拟边界与权限安全底线；HANDOFF 交出当前版本、确认行为、未决项与下一条指令；RECOVER 处理原型不可运行、环境失败或反馈冲突 |
| REFR | START 建立当前与目标技术状态及行为保持基线；DECIDE 处理技术选型与架构取舍，含整体替换与 A06 触发；GENERATE 产出 A24 并更新实现、测试、A04 与 A08；REVIEW 检查确认行为保持、契约一致与 AGENTS.md 同步；VERIFY 运行适用检查与回归；HANDOFF 移交结果、剩余风险与下一步；RECOVER 处理行为变化或检查失败时的回退 |
| AUDIT | START 确定候选与覆盖范围，区分首轮逐行与后续差异；DECIDE 决定分批策略、依赖与生成文件的检查方式及未覆盖理由；GENERATE 产出 A12、A25 与 A26；REVIEW 解释严重度与影响并提供可下钻解读；VERIFY 复核修复与回归并确认覆盖记录与代码版本一致；HANDOFF 移交结论、未覆盖部分与需人决定问题；RECOVER 处理大范围重写导致既有审查结论失效 |
| POLISH | START 明确精修目标、当前 A05 与权限数据流程约束；DECIDE 选择设计 AI、人工或外包、混合三种来源；GENERATE 组织设计提示词或设计简报，产出 A27 并更新 A05；REVIEW 检查交付完整性与行为差异分类；VERIFY 验证实现与视觉交互，行为变化触发 A03、A10 与验收项更新及回归；HANDOFF 移交确认设计、实施结果与重新审查范围；RECOVER 处理未确认图稿被当作需求或交付缺项 |

每份指南的活动产出对应：构建 → A03/A10/A11/A23；重构 → A24/A04/A06/A08；审查 → A12/A25/A26；精修 → A27/A05。

三份现有阶段指南只做衔接更新：`model/stages/05-verification.md`、`model/stages/06-release.md`、`model/stages/07-maintenance.md` 的输入与返回段点名四份活动指南及 A23–A27，教学示例提示词中的"A01–A22 规范、模板与教学例"改为"A01–A27"，其余规则、提示词与退出条件保持不变。

## 4. A23–A27 制品

基名用于 `model/artifacts/`、`model/templates/` 与 `examples/focustask/docs/artifact-examples/` 三处，均为 `.md`。

| 编号与基名 | 标题 | 必需性与触发 | 建议输出位置 |
| --- | --- | --- | --- |
| A23-prototype-feedback | 原型版本与反馈确认记录 | 每轮构建必要；轻量项目可并入 A10/A16 章节，但保留版本与确认字段 | `evidence/prototypes/{版本}/feedback.md` |
| A24-refactoring-plan | 工程化差距与重构方案 | 条件触发；开展重构或整体替换时必要，无重构需要不强制 | `docs/refactoring-plan.md` |
| A25-implementation-guide | 面向人的实现解读 | 首轮系统审查后必要；可按模块增量，代码变化后同步 | `docs/implementation-guide.md` |
| A26-pattern-remediation | 同类问题排查与修复记录 | 发现问题时必要；未发现其他实例也须记录范围、方法与限制 | `evidence/pattern-remediation.md` |
| A27-design-delivery | 视觉与交互设计交付包 | 有 UI 且开展精修时必要；无 UI 不生成，保留 A05 | `docs/design/{特性}/delivery.md` |

规范结构对齐 [A12 规范](model/artifacts/A12-review.md)：`## 用途与生命周期`（适用与触发/生产者与责任角色/输入/使用者与用途/输出/配套链接模板与教学例）、`## 必填内容与字段含义`（章节表 + 元数据要求）、`## 质量标准与边界`（含"不足示例"与"可判定示例"）、`## 人驱动 AI 的操作链`（9 类提示词 `[Axx-START]`、`CLARIFY`、`SELECT`、`GENERATE`、`REVIEW`、`REVISE`、`VERIFY`、`HANDOFF`、`FAILURE`，每类一个小节与围栏提示词）、`## 完成、更新与交接`。

各规范"必填内容与字段含义"必须覆盖的章节：

- A23：原型版本与运行入口；当前范围与真实/模拟边界及假设；体验反馈与差异；确认来源、确认行为与未决项；版本演化关系与失效证据。
- A24：当前与目标技术状态及约束来源；差距清单（编号、领域、影响、依据）；保留/调整/替换策略、步骤与依赖、回退点；确认行为到实现的映射与回归范围；剩余风险与失败恢复。
- A25：解读范围与依据代码版本；模块关系、数据流与关键路径；A03 条目到实现与测试位置的映射；重要判断与设计理由及替代方案；风险与需人决定的问题；分层审阅入口与未覆盖部分。
- A26：原始问题、候选版本、位置与复现；根因与可重复出现的代码模式及业务条件；排查范围与方法（文本、结构、语义）及未检查部分；已确认/疑似/不适用分类与依据；修复、回归与结果；再次排查、剩余风险与规则沉淀。
- A27：设计简报与目标；来源与工具（设计 AI、人工或外包、混合）及使用限制；参考、效果图、源文件与版本修改关系；交互流程与加载/空/错误/权限状态、响应式、可访问性；与 A03/A05 的行为差异分类及受影响验收项；反馈、确认来源与范围、未确认项。

模板沿用现有形态：标题带 `{项目/任务/版本}`、空白模板提示、`## 元信息`（实例 ID/版本/状态/责任角色/输入及版本/确认来源/下游用途/生成方式）、与规范章节一一对应的"填写要求 + 占位"、`## 检查与交接`。

教学例与现有 22 例同规格，约 45–55 行：基于 [FocusTask 教学上下文](examples/focustask/docs/context.md) 的 `teaching-base` 与 `teaching-filter` 场景，保留"教学填写示例""不作通过结论"，标注输入版本、未执行检查与下游用途，运行类结论一律记未执行或无法判定。A27 只用文字描述设计交付，不生成真实图稿、不联系设计师、不伪造确认；A26 的排查演示使用虚构代码片段并说明不是仓库实现结果。

链接纪律：新文档只链接已存在文件，如 `model/overview.md`、`model/conventions.md`、`model/practices/prompt-protocol.md`、`model/artifact-catalog.md`、四份活动指南、对应模板与教学例；不链接未建文件，不引用尚未建设的索引。

## 5. 索引与入口文档

- `model/artifact-index.json`：追加 5 条，字段与顺序沿用 `id`、`title`、`spec`、`template`、`example`。
- [制品目录](model/artifact-catalog.md)：首段与 `[CATALOG-SELECT]` 中的 A01–A22 改为 A01–A27；导航表补 5 行，含用途链接、必需性与触发、输出位置；"依赖与更新"段补 A23–A27 的产生时机，以及 A12/A25/A26、A05/A27、A10/A24 的职责分工。
- [约定](model/conventions.md)：制品类型使用范围由 A01–A22 改为 A01–A27。
- [团队裁剪](model/tailoring.md)：条件制品段补 A23–A27 裁剪规则，包括无 UI 不生成 A27 但保留 A05、无重构需要不强制 A24、A23 可并入 A10/A16 章节、A25 可按模块增量、A26 未发现其他实例也须记录排查范围与方法。
- [模型总纲](model/overview.md)：活动段落点名 A23–A27 输出；"制品与操作入口"新增两条链接，分别指向四项活动指南与[图解说明](model/visual-guide.md)。
- [教学上下文](examples/focustask/docs/context.md)：首部用途范围改为 A01–A27；末尾补一句说明 A23–A27 教学演示仍为虚构场景、运行检查未执行。

## 6. 检查器与测试

- [检查器](scripts/check-docs.mjs)：`expectedIds` 与计数改为 27，错误文案改为 `Expected 27 unique artifact types A01-A27`；新增 `activities` 映射（`prototype-building: BUILD`、`prototype-refactoring: REFR`、`prototype-review: AUDIT`、`prototype-polishing: POLISH`），按与 `stages` 相同的七键校验提示词；JSON 输出新增 `activities: 4`，`stages` 保持 3，CLI 参数与其余字段不变，不把七份指南统称七阶段。
- [检查器测试](scripts/check-docs.test.mjs)：夹具生成 27 类制品并写出四份活动指南；正例断言 `artifacts: 27`、`activities: 4`、`stages: 3`；反例表补 A23 缺索引项、A25 缺 `[A25-VERIFY]`、A27 教学例缺"不作通过结论"、`prototype-review` 缺 `[AUDIT-RECOVER]`、重复编号；正则改为 `/Expected 27 unique/`，越界索引改用 `index[26]`。
- 渲染器用例改为夹具内断言：把 `scripts/render-model-diagrams.mjs` 复制到临时夹具的 `scripts/` 目录（其 root 由脚本位置解析为夹具根），断言退出 1、stderr 含"缺少图解源码"与 `organization.mmd`、stdout 为空、无 ENOENT；再在夹具写入三份源码，断言只报缺失的 `organization.mmd`。渲染器脚本本身不改。
- 新增图解用例：仓库根四份 `.mmd` 存在且以 `flowchart` 开头，四组 `.svg`/`.png` 存在且非空，`artifacts.mmd` 覆盖 A01–A27 全部 27 个编号。
- 临时夹具写在系统临时目录，不污染正文；不新增格式化检查平台。

## 7. 图解与真实导出

新建 `model/diagrams/lifecycle.mmd`、`collaboration.mmd`、`artifacts.mmd`、`organization.mmd`，统一使用 `flowchart`（外层方向按可读性在 `TD`、`TB`、`LR` 中选择：`lifecycle` 与 `organization` 用 `TD`，`collaboration` 用 `TB` 加两级包裹，`artifacts` 用 `LR` 列式），中文短标签、单行、不使用 HTML 标签，沿用现有 `model/diagrams/mermaid-config.json`；必要时只微调 `nodeSpacing` 与 `rankSpacing`，不改 18px 字号。

| 图 | 必须表达 |
| --- | --- |
| lifecycle | 目标与最小准备 → 子图"可组合开发活动（默认顺序，可裁剪）"内构建（含体验反馈内循环，输出 A03/A10/A11/A23）→ 重构（A24/A04/A06/A08）→ 审查（A12/A25/A26）→ 精修（A27/A05）→ 独立验收（只读固定候选，A14）→ 直接本地发布（A17/A18/A19）→ 维护（A20/A15）；虚线返回边表达验收不通过回受影响活动、维护问题经 A15 回活动、体验反馈回构建、精修行为变化回构建与审查、下一轮演化回开发区域 |
| collaboration | 四个子图：构建内反馈环（人体验 → 反馈差异 → AI 整理未决 → 同步 A03/A10/A11 → A23 确认）；实现解读环（AI 产出 A25 → 人分层审阅并下钻代码 → 追问 → 更新解读与 A12 覆盖）；同类排查环（问题 → 根因与模式 → 全项目搜索 → 确认/疑似/不适用 → 修复与回归 → 再排查 → A26 与 A08 规则沉淀）；多来源设计（设计 AI／人工或外包／混合 → A27 统一交付包 → 人确认 → 按确认交付实施 A05） |
| artifacts | A01–A27 按用途分九个子图：目标与规格 A01–A03、设计与约束 A04–A07、工作环境 A08–A09、计划与实现 A10–A11、审查与交接 A12–A13、验收与追踪 A14–A16、发布与维护 A17–A20、实证 A21–A22、演化解读与设计 A23–A27；主流向 A03→A10→A11→A12→A14→A17→A19，另含 A07→A12/A14、A12/A14→A16、A18→A19、A19/A20→A15、A15→A03/A11、A11→A23→A03/A10、A23/A24→A11/A04、A11/A12→A25、A12/A14/A15→A26→A11/A08、A27→A05→A11、A21/A22 旁路 |
| organization | 三个子图：按功能并行（功能 A/B 各自活动链 + 共享约束 A01/A02/A08 + 依赖与工作边界 + 集成验证点）；按迭代顺序（迭代 1→2→3，每轮选定功能 → 活动组合 → 验收 → 发布）；混合组织（迭代内并行、迭代间顺序，冲突经 A15/A16 处理，集成候选进 A12/A14）。内容以总纲与裁剪文档现有表述为限，不新增未文档化的组织规则 |

导出步骤，需授权联网：

```sh
PUPPETEER_SKIP_DOWNLOAD=1 npm install --prefix /tmp/mmdc-tools @mermaid-js/mermaid-cli@11.15.0
node scripts/render-model-diagrams.mjs --cli /tmp/mmdc-tools/node_modules/.bin/mmdc --puppeteer-config /tmp/mmdc-tools/puppeteer-config.json
```

`/tmp/mmdc-tools/puppeteer-config.json` 的 `executablePath` 指向本机 `~/.cache/hyperframes/chrome/chrome-headless-shell/mac_arm-152.0.7977.30/chrome-headless-shell-mac-arm64/chrome-headless-shell`，`args` 含 `--no-sandbox`；若导出出现中文方块或乱码，改用 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` 重导。脚本固定输出 1800×1200、缩放 2、白底、id `ai-lifecycle-<name>`，产出四组 `.svg` 与 `.png` 共 8 个文件，全部入库；不新增忽略规则，不在仓库内建立依赖。

逐张做视觉与语义检查：文字截断、乱码、节点遮挡、连线错位、默认顺序（构建→重构→审查→精修）、反馈返回边方向、A01–A27 覆盖是否齐全。发现问题只改 `.mmd` 后重导，导出物不手工编辑；实际命令、工具版本与检查结论写入执行状态，缺输入诊断不算成功导出。

文档同步：

- [图解说明](model/visual-guide.md)：删除"当前未提供图解源码及导出"，改为四小节，每节 1–2 句读图要点并内嵌对应 `diagrams/<name>.svg`。
- [生成说明](model/diagrams/README.md)：改为四份源码与导出已提供并列出文件对应关系；给出占位示例命令，说明 `executablePath` 指向本机浏览器，不提交机器路径；保留缺输入退出 1 的说明，强调 Mermaid 是唯一可编辑源、改源码须重导出、绘图工具装在仓库外。
- [README](README.md)：图解那句改为说明四组图解含源码与导出，链接指向不变。
- [AGENTS](AGENTS.md)：Verification and Delivery 段补一句"修改 `.mmd` 后重新导出 SVG/PNG 并核对图文一致"，与现有措辞不重复堆叠。
- [执行状态](execution/status.md)：文档覆盖表更新为 A01–A27 与四项活动指南已建、图解源码及导出已交付；仍待建设项列出 A01–A22 内容改写、工作流索引与导航整合、静态验收与应用实证；新增本轮任务行，记录实际命令、退出码与工具版本，明确 V03-03/V03-04/V03-06 为部分完成，下一任务仍指向 V03-01 与 V03-02。

## 8. 验收标准

| 编号 | 验收项 | 通过依据 |
| --- | --- | --- |
| AC-DG-01 | 制品齐全 | A01–A27 三类文档均存在，检查器 `artifacts: 27` 且 0 错误 |
| AC-DG-02 | 活动指南可用 | 四份指南各含 7 类提示词，`activities: 4`、`stages: 3`；三份阶段指南衔接点名活动与 A23–A27 |
| AC-DG-03 | 提示词可执行 | 每条提示词含参数占位、能力与边界、输出与失败处理；无换名复制；教学示例提示词引用 A01–A27 |
| AC-DG-04 | 教学边界 | 五份教学例含"教学填写示例""不作通过结论"，运行检查标未执行，不扩展 FocusTask 功能范围 |
| AC-DG-05 | 索引与导航一致 | 目录表含 27 行，约定范围为 A01–A27，裁剪规则含 A23–A27，总纲与教学上下文链接有效，无断链 |
| AC-DG-06 | 检查器可信 | 正例通过；缺索引项、缺提示词、缺教学边界标记、重复编号、活动指南缺 RECOVER 等反例全部失败并给出诊断 |
| AC-DG-07 | 图解真实导出 | 8 个导出文件非空，逐张视觉与语义检查通过，不只检查文件非空 |
| AC-DG-08 | 图文一致 | 图解说明四小节与图内容一致，生成说明命令可复现且用占位路径，渲染器 CLI 与退出行为未变 |
| AC-DG-09 | 状态真实 | 执行状态区分已完成、部分完成与待建设，记录实际命令与退出码，不声称 V03 全部完成或应用实证 |
| AC-DG-10 | 交付可控 | 两次提交范围正确，无无关文件与二进制垃圾，推送后远端与本地一致 |

每项记录候选与证据，使用通过/失败/无法判定/阻塞；适用性须有依据，不取消必需项来绕过失败。工具不足或授权缺失导致阻塞时记录原因、影响与解除条件，继续无依赖工作，不伪造确认或降低标准。

## 9. 必须执行的检查

在仓库根运行并记录退出码与实际输出：

```sh
node scripts/check-docs.mjs
node --test scripts/check-docs.test.mjs
node scripts/render-model-diagrams.mjs --cli /tmp/mmdc-tools/node_modules/.bin/mmdc --puppeteer-config /tmp/mmdc-tools/puppeteer-config.json
git diff --check
git status --short
```

期望结果：检查器退出 0 且报告 `artifacts: 27`、`activities: 4`、`stages: 3`、`errors: []`；测试全部通过；渲染器打印 8 行 `Rendered model/diagrams/...` 并退出 0；差异检查无空白错误。

## 10. 文件清单

新增 32 个文件：

- 活动指南 4 份：`model/stages/01-prototype-building.md`、`02-prototype-refactoring.md`、`03-prototype-review.md`、`04-prototype-polishing.md`。
- 制品规范 5 份：`model/artifacts/A23-prototype-feedback.md`、`A24-refactoring-plan.md`、`A25-implementation-guide.md`、`A26-pattern-remediation.md`、`A27-design-delivery.md`。
- 模板 5 份：`model/templates/` 下同基名文件。
- 教学例 5 份：`examples/focustask/docs/artifact-examples/` 下同基名文件。
- 图解源码 4 份与导出 8 份：`model/diagrams/` 下 `lifecycle`、`collaboration`、`artifacts`、`organization` 的 `.mmd`、`.svg`、`.png`。
- 本计划文件。

修改 16 个文件：`model/artifact-index.json`、`model/artifact-catalog.md`、`model/conventions.md`、`model/tailoring.md`、`model/overview.md`、`model/visual-guide.md`、`model/diagrams/README.md`、`model/stages/05-verification.md`、`model/stages/06-release.md`、`model/stages/07-maintenance.md`、`examples/focustask/docs/context.md`、`scripts/check-docs.mjs`、`scripts/check-docs.test.mjs`、`README.md`、`AGENTS.md`、`execution/status.md`。

## 11. 禁止事项与失败恢复

禁止：创建应用、数据库、真实证据目录或运行服务；伪造确认、测试、导出、发布或验收结果；把教学示例写成实际结果；手工编辑导出的 SVG/PNG；修改渲染器 CLI 与退出行为；在仓库内新增依赖或 `package.json`；改写 A01–A22 正文（编号范围引用句除外）；引入 `model/workflow-index.json`；把七份指南统称七阶段；为未建文件建立链接。

失败恢复：渲染工具或浏览器不可用时记录工具、版本、字体与错误输出，说明影响与解除条件，先完成无依赖的文档与检查工作；导出失败不得用缺输入诊断或空文件冒充成功。提交或推送失败时保留工作并报告阻塞，不强制推送。中断后由执行状态与实际 Git 差异决定续做位置。

## 12. 交给 goal 的执行文本

```text
按 AI_LIFECYCLE_EXPANSION_PLAN.md 执行 DG-01 至 DG-09。
先读 AGENTS.md、execution/status.md、本计划、model/overview.md 与 model/conventions.md，
核对 Git 工作区并保护已有用户改动，按任务表顺序一次推进一个可检查任务。
交付四份活动指南（BUILD/REFR/AUDIT/POLISH 各 7 类提示词）、A23–A27 规范/模板/教学例、
索引与入口文档同步、检查器扩展到 27 类制品与四项活动校验、四组 Mermaid 源码及真实导出的 SVG/PNG。
渲染工具装在仓库外（/tmp/mmdc-tools），浏览器配置写在 /tmp，不提交机器路径，不在仓库新增依赖；
导出需要联网授权时如实请求，失败则记录原因与解除条件，不用缺输入诊断冒充成功。
不创建应用或数据库，不开展应用实证，不伪造确认、测试或发布结果；教学例使用 FocusTask 虚构场景并标注未执行。
每步运行 node scripts/check-docs.mjs、node --test scripts/check-docs.test.mjs、
node scripts/render-model-diagrams.mjs（带 --cli 与 --puppeteer-config）与 git diff --check，记录退出码。
按第 8 节十项验收标准逐项给结论与依据，修复后重验受影响项。
完成后更新 execution/status.md：区分已完成、部分完成与待建设，记录实际命令、工具版本与未完成项，
明确 V03-03/V03-04/V03-06 为部分完成，V03-01/V03-02/V03-05/V03-07 仍待执行。
按 AGENTS.md 分两次提交（制品与指南、图解与导出）并推送到 origin/master，推送后核对远端与本地一致。
全部完成时报告"活动指南、A23–A27 制品与四组图解交付完成，应用实证未开展"。
```
