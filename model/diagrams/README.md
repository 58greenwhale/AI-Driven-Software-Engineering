# 新版图解生成准备

当前仅保留 [Mermaid 配置](mermaid-config.json)。新版源码和导出仍待[修订计划](../../AI_LIFECYCLE_V03_REFINEMENT_PLAN.md)生成，见[图解说明](../visual-guide.md)。

后续创建 lifecycle、collaboration、artifacts、organization 的 `.mmd`，由渲染脚本生成 SVG/PNG。Mermaid 是可编辑源，不手改导出图。

```sh
node scripts/render-model-diagrams.mjs
```

可用 `--cli /path/to/mmdc` 和 `--puppeteer-config /path/to/config.json` 指定工具。没有源码时应在调用渲染器前报告“新版图解待建立”并非零退出。当前不安装工具或生成替代图，待源码齐备再验证实际导出及视觉质量。
