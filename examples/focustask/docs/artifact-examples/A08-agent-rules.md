# A08 Agent 工作规则 — FocusTask 教学示例

> 教学填写示例。用于演示文档内容与检查方法，不作通过结论。

## 元信息

- 实例ID：FocusTask-A08-teaching
- 版本：teaching-1
- 状态：草稿（教学）
- 责任角色：仓库维护人
- 输入：[FocusTask 教学上下文](../context.md)，版本 teaching-1。
- 确认来源：教学设定；实际项目需另行确认。
- 下游用途：任何进入仓库的新 Agent。
- 生成方式：按制品模板填写的教学例。

## 定位与目录

根目录管理模型；examples/focustask 仅管理教学上下文和填写示例。

## 事实来源

模型 overview/conventions 与教学 context；实际采用时另行确认范围、ADR 和功能规格。

## 执行与决策

局部命名自主；数据/权限未决询问；不丢弃原有改动。

## 命令和质量

应用具备后运行五项 npm 检查；未具备时记录无法执行。

## 安全与交付

不记录密钥；验收只读实现；交付列文件、结果、证据和风险。

## 检查与交接

运行类检查：未执行。实际采用时替换项目输入并验证。

下一步：使用 [A08 操作指南](../../../../model/artifacts/A08-agent-rules.md) 的 START/GENERATE，再由 REVIEW/VERIFY 检查实际结果。涉及关键业务规则未确认时用 CLARIFY，不跳过来源。
