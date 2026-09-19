# 图解生成说明

图解使用 [Mermaid 配置](mermaid-config.json)，以 `.mmd` 为可编辑源，导出 SVG 和 PNG。设计范围见[图解说明](../visual-guide.md)。

## 输入

渲染器需要本目录下的四份源码：`lifecycle.mmd`、`collaboration.mmd`、`artifacts.mmd`、`organization.mmd`。当前源码未提供，任务安排见[建设计划](../../AI_LIFECYCLE_V03_REFINEMENT_PLAN.md)。

## 运行与检查

```sh
node scripts/render-model-diagrams.mjs
```

可用 `--cli /path/to/mmdc` 和 `--puppeteer-config /path/to/config.json` 指定渲染器和浏览器配置。缺输入时脚本在调用外部工具前报告“缺少图解源码”及文件列表，退出码为 1。

输入齐备后核验工具、运行导出，再检查文字、连线、遮挡和语义；导出图由源码生成，不直接编辑。
