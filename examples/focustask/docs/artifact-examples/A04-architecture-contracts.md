# A04 架构与契约 — FocusTask 教学示例

> 教学填写示例，不是实际验收、部署或人工确认记录。真实证据在 evidence 中另行产生；本文件不得用来宣称运行通过。

完整的真实项目实例见 [A04 实证实例](../empirical-contracts.md)；实际使用及证据关系见 [制品使用表](../../evidence/artifact-usage.md)。本教学文件保留简化结构，真实实例展示填充深度与版本/证据要求。

## 元信息

- 实例ID：FocusTask-A04-teaching
- 版本：0.1
- 状态：草稿（教学）
- 责任角色：技术责任人
- 输入：已存在的 FocusTask 规格及实施计划 1.1；不虚构未生成的代码版本。
- 确认来源：项目范围沿用计划，本文是解释结构的示例。
- 下游用途：工程初始化、服务端/界面实现、集成验证和发布者。
- 生成方式：示例内容，由规范作者撰写；不是实际用户逐条输入。

## 组件与边界

Next Route Handler→server→Prisma→PostgreSQL；页面不直接调用 Prisma。

## 运行时与依赖

沿用既有栈；实际补丁与运行时由环境核验后锁定，本文不声称已安装。

## 接口契约

创建返回 {data: task}；失败返回 error.code/message/fields/requestId。

## 数据与兼容

幂等键有数据库唯一约束；迁移记录已应用版本，重复部署不重新执行。

## 安全与配置

HttpOnly 会话，写接口检查身份和来源；日志不记录密码/Cookie。

## 非功能与验证

创建 API P95≤500ms；生产构建测 100 次，保存原始结果。

## 检查与交接

运行类检查：未执行，本教学示例不作通过结论。内容需按实际项目输入替换后验证。

下一步：使用 [A04 操作指南](../../../../model/artifacts/A04-architecture-contracts.md) 的 START/GENERATE，再由 REVIEW/VERIFY 检查实际结果。涉及关键业务规则未确认时用 CLARIFY，不跳过来源。
