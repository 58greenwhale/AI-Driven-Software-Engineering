# A01–A22 实例与实际使用

本表连接规范类型和真实项目实例，教学示例不是实证证据。复合制品可分散在数份文件，代码/配置不能被Markdown说明替代。

| 类型 | 实例入口 | 实际下游动作 | 可复查消费/结果 |
| --- | --- | --- | --- |
| A01 | [实例](../docs/empirical-scope.md) | 范围进入设计与实证任务表 | [结果](acceptance-v01.md) |
| A02 | [实例](../docs/domain.md) | 角色、日期、幂等用于server与测试；权限另见permissions | [结果](application-review-01.md) |
| A03 | [实例](../docs/features/TASK-001-create-task.md) | 原AC指导实现和独立验证；TASK-004指导迭代 | [结果](acceptance-v02.md) |
| A04 | [实例](../docs/empirical-contracts.md) | API字段与失败码用于Route Handler和API测试 | [结果](handoff-api07-result.md) |
| A05 | [实例](../docs/empirical-ui.md) | 页面状态、焦点、视口用于界面与三引擎截图 | [结果](acceptance-v01.md) |
| A06 | [实例](../docs/decisions/0004-dependency-remediation.md) | 实际漏洞促成覆盖依赖选择，审计/迁移/构建重验 | [结果](application-review-01.md) |
| A07 | [实例](../docs/test-strategy.md) | 提前建立AC、风险、环境及非功能适用性 | [结果](acceptance-v02.md) |
| A08 | [实例](../AGENTS.md) | 独立接手者先读范围和命令限制 | [结果](handoff-api07-result.md) |
| A09 | [实例](../docs/engineering-baseline.md) | 专用数据库、命令和工具链用于验证与发布 | [结果](releases/v0.1.0/run.md) |
| A10 | [实例](../docs/iteration-plan.md) | 修正依赖循环，候选验收先于任务完成 | [结果](model-review-01.md) |
| A11 | [实例](../docs/implementation.md) | 真实代码/迁移/测试作为候选供审查和打包 | [结果](acceptance-v01.md) |
| A12 | [实例](application-review-01.md) | 独立发现跨午夜/UUID/权限UI问题，修复后复核 | [结果](acceptance-v01.md) |
| A13 | [实例](handoff-api07.md) | 独立会话据此完成真实API故障测试 | [结果](handoff-api07-result.md) |
| A14 | [实例](acceptance-v02.md) | 原候选no-go，rc2验证放行后才本地发布 | [结果](releases/v0.2.0-rc2/run.md) |
| A15 | [实例](../docs/changes/DRILL-001.md) | 先定义演练边界与原判据，再注入/修复 | [结果](maintenance/report.md) |
| A16 | [实例](traceability.md) | 复核者按文件和版本核对覆盖 | [结果](acceptance-v02.md) |
| A17 | [实例](releases/v0.2.0-rc2/manifest.md) | 固定源码/构建用于发布，旧no-go不自动继承 | [结果](releases/v0.2.0-rc2/run.md) |
| A18 | [实例](../docs/deploy-rollback.md) | 版本目录/PID/数据恢复步骤用于真实回退 | [结果](maintenance/report.md) |
| A19 | [实例](releases/v0.1.0/run.md) | 实际首版运行给维护数据检查点 | [结果](releases/v0.2.0-rc2/run.md) |
| A20 | [实例](maintenance/report.md) | 变更、缺陷、恢复结果进入模型评价 | [结果](final-model-evaluation.md) |
| A21 | [实例](interactions.md) | 区分真实用户决定与授权模板实例，评价澄清和返工 | [结果](../evaluation.md) |
| A22 | [实例](../evaluation.md) | 预先问题与真实结果形成模型修订 | [结果](final-model-evaluation.md) |

本表证明的是本样例中的使用链，不证明22种模板均由独立普通用户首次使用成功。团队裁剪、完全缺失业务规则的人工决策分支、真实生产与长期运维效果未验证；规范和教学示例与实际效果结论分别标注。

