# 生命周期图的源码与导出

面向读者的说明见[模型图解](../visual-guide.md)。本目录提供同源生成的 Mermaid、SVG 与 PNG，Markdown 平台无需 Mermaid 插件也能通过 SVG 查看图。

| 图 | 可编辑源 | 矢量图 | 高清位图 |
| --- | --- | --- | --- |
| 生命周期总览 | [lifecycle.mmd](lifecycle.mmd) | [SVG](lifecycle.svg) | [PNG](lifecycle.png) |
| 人驱动 AI 协作时序 | [collaboration.mmd](collaboration.mmd) | [SVG](collaboration.svg) | [PNG](collaboration.png) |
| 制品流转 | [artifacts.mmd](artifacts.mmd) | [SVG](artifacts.svg) | [PNG](artifacts.png) |

## 重新渲染

使用 `@mermaid-js/mermaid-cli` 11.15.0（本次实际渲染版本）和可用的 Chromium/Chrome。它是文档导出工具，不是 FocusTask 运行依赖，可安装在独立工具目录。

在仓库根目录运行：

```bash
node scripts/render-model-diagrams.mjs --cli /path/to/mmdc --puppeteer-config /path/to/puppeteer.json
node scripts/check-docs.mjs
```

若 `mmdc` 已在 PATH 中且 Puppeteer 浏览器已配置好，直接运行 `node scripts/render-model-diagrams.mjs`。

自定义已有浏览器的配置示例（替换为实际可执行文件）：

```json
{
  "executablePath": "/path/to/chrome"
}
```

配色、字号、间距使用[统一渲染配置](mermaid-config.json)。PNG 采用 2 倍缩放生成；SVG 保留可缩放文字和可访问描述。直接在支持 Mermaid 的平台打开源码也可渲染，其默认主题与此导出可能不同。

## 内容核对

更新后应确认六阶段与反馈路径完整、人驱动和 AI 执行职责清楚、A01–A22 无遗漏、条件制品未被画成强制每轮创建，以及图中文字和箭头没有遮挡。渲染成功只证明语法可处理，仍需视觉和语义检查。
