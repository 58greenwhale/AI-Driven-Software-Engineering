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

## 材料与工具盘点事实

| 项目 | 事实 |
| --- | --- |
| 制品三类文档 | `model/artifacts/`、`templates/`、`examples/focustask/docs/artifact-examples/` 各 27 份，编号 A01–A27 连续无缺 |
| 指南 | `model/stages/` 7 份：prototype-building、prototype-refactoring、prototype-review、prototype-polishing、verification、release、maintenance |
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
