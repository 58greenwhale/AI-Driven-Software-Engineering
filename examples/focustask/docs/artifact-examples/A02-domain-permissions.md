# A02 领域与权限规则 — FocusTask 教学示例

> 教学填写示例。用于演示文档内容与检查方法，不作通过结论。

## 元信息

- 实例ID：FocusTask-A02-teaching
- 版本：teaching-1
- 状态：草稿（教学）
- 责任角色：业务责任人
- 输入：[FocusTask 教学上下文](../context.md)，版本 teaching-1。
- 确认来源：教学设定；实际项目需另行确认。
- 下游用途：接口与数据设计者、服务端实现和权限测试。
- 生成方式：按制品模板填写的教学例。

## 术语与实体

Task 属于 Project；title 去空格 1–100 字符；createdBy 取服务端会话。

## 状态与转换

创建固定 todo；归档项目对所有成员只读。

## 权限矩阵

Admin/Editor 可创建；Viewer 隐藏入口且 API 拒绝；Non-member 不可查看。

## 一致性与时间

同用户/项目/幂等键只有一条；dueDate 按项目 Asia/Shanghai 当天校验。

## 边界验证与决策

权限变化后重新校验；不以隐藏按钮替代服务端测试。

## 检查与交接

运行类检查：未执行。实际采用时替换项目输入并验证。

下一步：使用 [A02 操作指南](../../../../model/artifacts/A02-domain-permissions.md) 的 START/GENERATE，再由 REVIEW/VERIFY 检查实际结果。涉及关键业务规则未确认时用 CLARIFY，不跳过来源。
