# 图解生成说明

图解使用 [Mermaid 配置](mermaid-config.json)，以 `.mmd` 为可编辑源，导出 SVG 和 PNG。设计范围见[图解说明](../visual-guide.md)。

## 输入与产出

渲染器需要本目录下的四份源码：`lifecycle.mmd`、`collaboration.mmd`、`artifacts.mmd`、`organization.mmd`；每份源码导出同基名的 `.svg` 与 `.png`。Mermaid 是唯一可编辑源，导出物不手工编辑。

## 运行与检查

```sh
node scripts/render-model-diagrams.mjs --cli /path/to/mmdc --puppeteer-config /path/to/puppeteer-config.json
```

`--cli` 指定 mermaid-cli 可执行文件，`--puppeteer-config` 指向的 JSON 用 `executablePath` 指定本机 Chrome 或 chrome-headless-shell 并可带 `args`。绘图工具与浏览器安装在仓库外，不提交机器路径，也不在仓库内新增依赖。缺输入时脚本在调用外部工具前报告“缺少图解源码”及文件列表，退出码为 1。

导出后逐张检查文字、连线、遮挡和语义：截断、乱码、节点重叠、连线错位、默认顺序（构建→重构→审查→精修）与反馈返回方向；发现问题只改源码后重新导出。
