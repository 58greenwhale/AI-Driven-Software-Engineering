# 技术架构与项目约定

> 迁移说明：保留的 FocusTask 产品规格输入；本地实证仅覆盖选定切片，范围与状态以 [实证范围](empirical-scope.md) 和 [实证任务表](iteration-plan.md) 为准。本文不是功能已实现的证明。

## 1. 技术栈

此示例规定 MVP 使用以下技术栈：

- Web：Next.js 15、React 19、TypeScript 5；
- 样式：CSS Modules 和全局设计令牌；
- 服务端：Next.js Route Handlers；
- 数据库：PostgreSQL 16；
- ORM：Prisma；
- 身份认证：基于安全、HttpOnly Cookie 的服务端会话；
- 单元和集成测试：Vitest；
- 端到端测试：Playwright；
- 包管理器：npm，版本由仓库 `packageManager` 字段固定。

升级主要版本必须先记录决策，不得在单个功能任务中顺带升级。

## 2. 模块边界

```text
src/
  app/                 # 路由、页面及 Route Handlers
  components/          # 可复用 UI 组件
  features/            # 按业务功能组织的界面和应用逻辑
  server/              # 服务端业务服务、权限和数据访问
  lib/                 # 无业务归属的通用工具
  styles/              # 全局令牌和基础样式
tests/
  e2e/                 # Playwright 端到端测试
prisma/
  schema.prisma
  migrations/
```

规则：

- 页面层不得直接调用 Prisma；
- Route Handler 负责解析请求、认证和返回协议，业务规则放在 `server` 服务中；
- 权限检查必须在服务端业务入口执行；
- 通用组件不得依赖具体业务 feature；
- 数据验证规则应在服务端定义，并可在客户端复用时共享 schema。

## 3. API 约定

API 前缀为 `/api/v1`，请求和响应使用 JSON。

成功示例：

```json
{
  "data": {
    "id": "b2ddcb37-1255-4af7-9ab1-829925a420d4",
    "title": "准备周会材料"
  }
}
```

失败示例：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "提交内容有误",
    "fields": {
      "title": "请输入任务标题"
    },
    "requestId": "req_01J..."
  }
}
```

常用状态码：

- `200`：读取或更新成功；
- `201`：创建成功；
- `400`：请求格式或字段校验失败；
- `401`：未登录；
- `403`：已登录但无操作权限；
- `404`：资源不存在或用户无查看权限；
- `409`：幂等冲突或乐观锁冲突；
- `500`：未预期的服务端错误。

## 4. 创建任务接口

`POST /api/v1/projects/:projectId/tasks`

请求头：

```text
Content-Type: application/json
Idempotency-Key: <client-generated-uuid>
```

请求体：

```json
{
  "title": "准备周会材料",
  "assigneeId": null,
  "dueDate": "2026-09-21"
}
```

服务端拒绝客户端伪造的 `createdBy`、`status` 或 `projectId` 字段。

## 5. 数据库约定

- 表和字段在数据库层使用 `snake_case`，应用层使用 `camelCase`；
- 主键使用 UUID；
- 时间戳使用带时区类型并以 UTC 处理；
- 每次 schema 变化必须提交迁移；
- 生产数据不得通过修改旧迁移回溯变更；
- 关键唯一性和引用完整性必须由数据库约束保证。

## 6. 环境变量

```text
DATABASE_URL           # PostgreSQL 连接地址
SESSION_SECRET         # 会话签名密钥
APP_BASE_URL           # 应用公开地址
LOG_LEVEL              # debug、info、warn 或 error
```

仓库只提供 `.env.example`，不得提交真实值。服务启动时校验必需变量，缺失时明确失败。

## 7. 错误和日志

- 每个请求生成 `requestId` 并返回给客户端；
- 服务端日志使用结构化 JSON；
- 未预期异常记录错误类型、请求标识和必要上下文；
- 日志中不得包含密码、会话 Cookie、令牌或完整请求正文；
- 客户端显示可行动的用户信息，不显示数据库或堆栈细节。

## 8. 命令约定

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

创建实际代码仓库时，以上脚本必须在 `package.json` 中存在，或者同步修订本文档。

## 9. 决策记录

会影响多个功能或难以逆转的技术、数据或产品决定，应新增到 `examples/focustask/docs/decisions/`。决策记录至少包括背景、决定、替代方案和后果。
