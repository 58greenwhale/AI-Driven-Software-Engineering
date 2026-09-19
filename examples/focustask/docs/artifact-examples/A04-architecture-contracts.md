# A04 架构与契约 — FocusTask 教学示例

> 教学填写示例。用于演示文档内容与检查方法，不作通过结论。

## 元信息

- 实例ID：FocusTask-A04-teaching
- 版本：teaching-1
- 状态：草稿（教学）
- 责任角色：技术责任人
- 输入：[FocusTask 教学上下文](../context.md)，版本 teaching-1。
- 确认来源：教学设定；实际项目需另行确认。
- 下游用途：工程初始化、服务端/界面实现、集成验证和发布者。
- 生成方式：按制品模板填写的教学例。

## 组件与边界

Next Route Handler→server→Prisma→PostgreSQL；页面不直接调用 Prisma。

## 运行时与依赖

采用教学上下文中的架构设定；实际补丁与运行时由环境核验后锁定，安装状态需实际核验。

## 接口契约

创建返回 {data: task}；失败返回 error.code/message/fields/requestId。

## 数据与兼容

幂等键有数据库唯一约束；迁移记录已应用版本，重复部署不重新执行。

## 安全与配置

HttpOnly 会话，写接口检查身份和来源；日志不记录密码/Cookie。

## 非功能与验证

创建 API P95≤500ms；生产构建测 100 次，保存原始结果。

## 检查与交接

运行类检查：未执行。实际采用时替换项目输入并验证。

下一步：使用 [A04 操作指南](../../../../model/artifacts/A04-architecture-contracts.md) 的 START/GENERATE，再由 REVIEW/VERIFY 检查实际结果。涉及关键业务规则未确认时用 CLARIFY，不跳过来源。
