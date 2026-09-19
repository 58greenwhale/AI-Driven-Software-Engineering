# A15 缺陷与变更单 — FocusTask 教学示例

> 教学填写示例。用于演示文档内容与检查方法，不作通过结论。

## 元信息

- 实例ID：FocusTask-A15-teaching
- 版本：teaching-1
- 状态：草稿（教学）
- 责任角色：变更责任人
- 输入：[FocusTask 教学上下文](../context.md)，版本 teaching-1。
- 确认来源：教学设定；实际项目需另行确认。
- 下游用途：需求/设计/实现的责任人，回归与发布者。
- 生成方式：按制品模板填写的教学例。

## 来源与类型

CHANGE-teaching-filter：教学场景中的状态筛选变更。

## 现状与期望

teaching-base只列全部；teaching-filter按todo/in_progress/done筛选，支持URL和空结果。

## 影响与选择

新增query读行为，无schema变化；创建后不符合筛选时提示而不重置筛选。

## 决定与执行

范围为教学设定；非法筛选返回 400，实际实现前须由目标项目确认。

## 回归与关闭

重验创建权限与幂等，筛选持久化，teaching-filter本地发布冒烟。

## 检查与交接

运行类检查：未执行。实际采用时替换项目输入并验证。

下一步：使用 [A15 操作指南](../../../../model/artifacts/A15-change-defect.md) 的 START/GENERATE，再由 REVIEW/VERIFY 检查实际结果。涉及关键业务规则未确认时用 CLARIFY，不跳过来源。
