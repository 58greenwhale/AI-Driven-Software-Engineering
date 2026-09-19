# A10 实证任务与依赖

版本：0.1；范围来源：[实证范围](empirical-scope.md)。本表仅记录实证任务；[旧路线图](roadmap.md)是产品愿景输入，不能把其中的“就绪”当环境事实。

| 任务 | 目标 | 依赖 | 状态 | 退出证据 |
| --- | --- | --- | --- | --- |
| EMP-SPEC | 范围、契约、验证策略与评价 | 用户计划 | 完成 | model-review-01文档独立复核 |
| EMP-CORE | 应用、数据库、会话与检查基线 | EMP-SPEC | 完成 | baseline-remediated与acceptance-v01 |
| EMP-AUTH | 登录/退出及安全规则 | EMP-CORE基线可用 | 完成 | 会话/限流/API测试及acceptance-v01 |
| EMP-PROJECT | 预置项目与成员读取 | EMP-AUTH候选可用 | 完成 | 角色/资源不可探测及acceptance-v01 |
| TASK-001 | 创建与查看任务 | EMP-PROJECT候选可用 | 完成 | 原AC-01–13、边界回归和独立复核 |
| EMP-QA | 独立验收v0.1 | TASK-001候选达到待验收（不要求任务已完成） | 完成 | acceptance-v01指定快照独立核对 |
| EMP-RELEASE-01 | 本地生产构建发布 | EMP-QA | 完成 | releases/v0.1.0/run |
| CHANGE-001 | 状态筛选与v0.2再发布 | EMP-RELEASE-01 | 完成 | 原候选no-go，rc2修复/复核/实际升级 |
| DRILL-001 | Viewer权限缺陷注入与修复 | CHANGE-001 | 完成 | 原脚本失败→修复通过及独立闭环复核 |
| DRILL-002 | 受控失败版本回退 | CHANGE-001 | 完成 | A20及数据检查点保留 |
| HANDOFF-001 | 独立新上下文接手 | 可恢复交接候选 | 完成 | handoff-api07-result，0额外业务澄清 |

一般任务前驱完成后重新核对就绪条件；EMP-QA例外，消耗TASK-001的待验收候选，自检通过即可启动独立验收。EMP-QA通过且候选集成后，TASK-001与EMP-QA均可完成，再启动EMP-RELEASE-01。发布只依赖本版本明确选入任务，不依赖自身。就绪前缺的是前置成果时注明依赖，不能误写业务规则已确认就等于可立即实现。
