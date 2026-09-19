# 领域模型与业务规则

> 迁移说明：保留的 FocusTask 产品规格输入；本地实证仅覆盖选定切片，范围与状态以 [实证范围](empirical-scope.md) 和 [实证任务表](iteration-plan.md) 为准。本文不是功能已实现的证明。

## 1. 核心实体

### User

| 字段 | 类型 | 规则 |
| --- | --- | --- |
| id | UUID | 主键，不可修改 |
| email | string | 必填；规范化后全局唯一；最长 254 字符 |
| displayName | string | 必填；去除首尾空格后 1–50 字符 |
| passwordHash | string | 只保存安全哈希，不保存明文密码 |
| createdAt | datetime | 服务端生成，UTC 存储 |

### Project

| 字段 | 类型 | 规则 |
| --- | --- | --- |
| id | UUID | 主键 |
| name | string | 必填；去除首尾空格后 1–80 字符 |
| description | string/null | 可选；最长 1000 字符 |
| status | enum | `active` 或 `archived` |
| createdBy | User.id | 创建项目的用户 |
| createdAt | datetime | UTC 存储 |
| archivedAt | datetime/null | 归档时由服务端写入 |

### ProjectMember

| 字段 | 类型 | 规则 |
| --- | --- | --- |
| projectId | Project.id | 与 `userId` 组成唯一键 |
| userId | User.id | 必须引用存在的用户 |
| role | enum | `admin`、`editor` 或 `viewer` |
| joinedAt | datetime | 用户加入项目的时间 |

一个项目至少保留一名管理员。创建项目的人自动成为该项目管理员。

### Task

| 字段 | 类型 | 规则 |
| --- | --- | --- |
| id | UUID | 主键 |
| projectId | Project.id | 必填；创建后不可移动到其他项目 |
| title | string | 必填；去除首尾空格后 1–100 字符 |
| status | enum | `todo`、`in_progress` 或 `done` |
| assigneeId | User.id/null | 可选；必须是当前项目成员 |
| dueDate | date/null | 可选；创建时不得早于项目所在时区的今天 |
| createdBy | User.id | 创建人，创建后不可修改 |
| createdAt | datetime | UTC 存储 |
| updatedAt | datetime | 每次有效修改后由服务端更新 |
| version | integer | 乐观锁版本，从 1 开始 |

## 2. 实体关系

```text
User 1 ---- * ProjectMember * ---- 1 Project
Project 1 ------------------------ * Task
User 1 --------------------------- * Task (creator)
User 1 --------------------------- * Task (optional assignee)
```

## 3. 任务状态转换

| 当前状态 | 操作 | 下一状态 | 允许角色 | 失败条件 |
| --- | --- | --- | --- | --- |
| `todo` | 开始任务 | `in_progress` | Admin、Editor | 项目已归档或版本冲突 |
| `todo` | 标记完成 | `done` | Admin、Editor | 项目已归档或版本冲突 |
| `in_progress` | 标记完成 | `done` | Admin、Editor | 项目已归档或版本冲突 |
| `in_progress` | 移回待处理 | `todo` | Admin、Editor | 项目已归档或版本冲突 |
| `done` | 重新打开 | `todo` | Admin、Editor | 项目已归档或版本冲突 |

MVP 不允许从 `done` 直接变为 `in_progress`。重新打开后先进入 `todo`。

## 4. 项目状态规则

- `active` 项目允许按权限读写。
- `archived` 项目对所有项目成员只读。
- 只有 Admin 能归档项目。
- 归档不删除成员和任务。
- MVP 不提供恢复已归档项目的界面；是否支持恢复属于待决策事项。

## 5. 创建任务规则

- 标题在服务端去除首尾空格后验证并保存。
- 未指定状态时默认为 `todo`。
- 未指定负责人和截止日期时保存为 `null`。
- 客户端为每次用户提交生成幂等键；同一用户、同一项目和同一幂等键只能创建一条任务。
- 创建失败时不得留下不完整任务。

## 6. 并发修改规则

- 修改任务时客户端必须提交最后读取到的 `version`。
- 服务端仅在版本相同时更新，并将版本加 1。
- 版本不一致时返回冲突，不覆盖其他用户的修改。
- 客户端提示“任务已被其他人更新”，并提供重新加载入口。

## 7. 时间规则

- 时间戳使用 UTC 存储，通过 ISO 8601 传输。
- 仅日期字段 `dueDate` 使用 `YYYY-MM-DD`，不进行 UTC 换算。
- “今天”按项目时区计算。MVP 项目时区在创建时取创建者时区，之后不可修改。

## 8. 删除和保留

- MVP 不提供任务物理删除。
- 项目归档后至少保留 180 天。
- 数据保留期限结束后的删除机制属于后续版本，不在当前实现范围内。
