# A11 v0.1 实现包

实例：FocusTask-A11-v0.1.0；范围源：empirical-scope与TASK-001；候选：evidence/releases/v0.1.0/source-files.json和artifact.json。

## 实际模块

- app/src/app：登录、项目入口、任务列表路由与API Route Handler。
- app/src/features：受控表单、网络恢复、权限变化、角色显示和任务列表。
- app/src/server：scrypt密码、有限会话、来源校验、失败限流、字段/日期、成员权限、事务和幂等。
- app/prisma：实体、唯一约束、外键、状态/标题检查约束、迁移与虚构夹具。
- app/tests：字段边界、数据库并发/权限、真实数据库不可达和模拟时钟、三浏览器UI/API与性能。
- app/scripts：专用环境、脱敏证据、生产启动、版本打包/发布与冒烟。

## 生成与修订来源

依据计划和IMP操作链，先生成契约与测试策略再实现。独立审查发现跨午夜重试、成员移除404、UUID大小写串行锁等问题，修复并保存原失败。审计发现漏洞后采用ADR-0004，不通过豁免发布。

## 输入输出与数据

接口形状见empirical-contracts；页面不访问数据库。会话只在服务器存令牌摘要，Cookie不在日志中。创建成功返回服务端Task；同键同内容返回原任务，异内容409。读写只能访问成员项目，归档只读，非成员404。

schema位于app/prisma/schema.prisma，初始迁移202609190001_initial。新增应用配置名与本地运行方式见engineering-baseline；真实值保存在忽略目录。

## 自检与交付

当前真实结果及版本见evidence/traceability和runs：14单元/集成、生产构建、三浏览器功能/状态、官方audit0、性能样本。实现者自检不等于独立验收；最终独立报告与发布运行单独关联。

切片不含项目创建、邀请、状态编辑、搜索或分页。v0.2筛选通过CHANGE-001另行实现。真实生产、多版本实机与长期SLA不由本地样例证明。
