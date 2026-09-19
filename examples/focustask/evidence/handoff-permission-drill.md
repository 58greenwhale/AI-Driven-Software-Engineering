# DRILL-001 独立候选验收入口

请依据TASK-001 AC-09及权限矩阵检查候选http://127.0.0.1:3213，不修改产品或演练实现。允许在专用focustask_drill数据库使用虚构账号执行指定写入测试，禁止操作release/test之外用户数据库。此候选用于隔离演练，验收标准仍是Viewer只读。

应用目录app；Node24；配置在忽略.runtime/drill.json，字段FOCUSTASK_SEED_PASSWORD供虚构viewer@example.test登录，不能打印配置值/Cookie。项目ID为20000000-0000-4000-8000-000000000001。GET tasks获得total，POST任务需JSON、Origin为该本地地址和UUID Idempotency-Key。

创建前后比较总数；预期403且数量不变。请实际执行，记录状态、数量、任务ID（若意外产生）、请求ID和候选源摘要；源位于app/.runtime/permission-drill/src/server/tasks.ts，构建位于其.next。健康可读取版本，别只依靠UI隐藏入口。

可新增可重复使用的验收脚本和evidence/maintenance/permission报告，但不能修改任何产品实现。任务结束报告真实结论；后续修复候选将用同一脚本重验。新用户确认不必编造，授权来自根计划的演练。
