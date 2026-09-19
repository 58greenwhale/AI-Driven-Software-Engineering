# ADR-0004：发布前依赖修复

- 状态：修复已应用；官方审计0风险、Prisma生成、重复迁移、锁文件重装和完整应用回归已通过，见final-*与post-ci-*真实记录。
- 来源：evidence/runs中audit-official-v01真实结果；本地npm镜像审计404不能算通过。

## 问题与决定

官方审计发现PostCSS高风险传递依赖、Prisma配置依赖deepmerge-ts高风险及Vitest中风险。保留Next15、Prisma6已选主线，通过npm overrides固定PostCSS8.5.28、deepmerge-ts8.0.2，并将Vitest修补到4.1.11；这些版本来自官方注册表元数据。

备选是整体升级框架/ORM或降低版本；它们会扩大契约和工程变化。传递依赖覆盖更小，但deepmerge-ts涉及主要版本变化，必须重新执行Prisma generate/migrate、所有检查与生产构建，不能仅凭audit归零判兼容。

## 验证与失效

旧构建、单元、E2E证据保留原适用快照。新锁文件后重跑依赖审计、客户端生成、重复迁移、lint/typecheck/test/build/E2E。未完成前发布no-go。若覆盖不兼容，撤销本选择并形成替代ADR，不豁免已确认安全要求。
