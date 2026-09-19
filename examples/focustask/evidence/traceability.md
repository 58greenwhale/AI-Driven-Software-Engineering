# A16 实证追踪与证据状态

本表关联真实源文件和已保存运行记录。修改源码后按影响更新，文件存在不等于覆盖。完整运行摘要/源码文件哈希见runs中对应JSON。

| 范围 | 规格 | 实现 | 测试/证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| AC-01/02创建持久化 | TASK-001 | server/tasks、features/tasks | 浏览器刷新、API/数据库、发布重启及升级/回退检查点 | 通过，Task ID已验证跨进程/版本保留 |
| AC-03/04字段边界 | TASK-001、领域 | server/validation、表单 | validation.test、tasks.test、core空标题 | 通过 |
| AC-05/06负责人/日期 | 领域及项目时区 | server/validation、tasks | tasks.test和core字段错误；跨午夜重试追加 | 通过 |
| AC-07/08幂等 | TASK-001、契约 | server/tasks、Idempotency约束、客户端key复用 | 并发/异内容/跨午夜/UUID大小写集成及响应丢失E2E | 通过当前修订，见unit-remediated-retry |
| AC-09/10权限 | 权限矩阵 | server/auth/tasks、接口与UI | Viewer直调、非成员404、数据库不变、成员移除E2E | 通过 |
| AC-11归档 | 领域/页面 | server/tasks、UI刷新只读 | 数据库状态夹具＋表单打开后归档E2E | 通过 |
| AC-12网络恢复 | 功能规格 | 客户端同键重试 | route.fetch实际创建后abort，重试同键且仅一条 | 通过 |
| AC-13及UI | empirical-ui、设计系统 | CSS Modules、Radix与语义表单 | 三浏览器四视口+320/1920、键盘、axe、200%等效CSS视口 | 已运行范围通过；等效缩放不是实机辅助技术认证 |
| API-01–06 | empirical-contracts | auth/api | core登录/退出/身份/来源/限流/过期 | 通过已跑场景 |
| API-07 | 10秒/通用错误 | api/db | api-health.test及http-fault真实Next HTTP进程/停滞TCP握手 | 通过已测路径，health/login约5秒返回503；不外推CPU阻塞或所有事务取消 |
| 性能 | test-strategy适用映射 | 生产构建 | performance-v01，500任务20成员 | 本机测量通过，参考硬件不同 |
| 安全依赖 | 非功能安全 | lockfile/overrides | audit-remediated | 官方审计0风险，保留旧失败 |
| 首版发布 | 计划及A18 | release脚本 | deploy/smoke/restart/persist-v01及A19 | 完成，数据保留 |
| v0.2状态筛选 | CHANGE-001、TASK-004 | tasks服务、URL筛选UI、版本0.2 | CF01–09、四视口三浏览器、acceptance-v02和rc2实际发布 | 完成，旧候选no-go保留 |
| 维护故障/回退 | DRILL-001/002 | 隔离候选、版本化发布脚本 | A20、权限独立复核、坏包/回退/恢复数据JSON | 完成，仅本地实证 |
| 独立会话接手 | A13/P4-04 | handoff-api07 | handoff-api07-result与原始runs | 完成真实下一步，0业务澄清 |

## v0.1历史重要运行

- build-remediated：修复后生产构建通过；详细文件摘要在runs。
- unit-remediated-retry：11个测试通过，含UUID大小写与跨午夜。
- e2e-remediated：Chromium/Firefox通过；WebKit因共享缓存缺失未执行，不把该运行称全绿。
- webkit-local-v01：独立项目缓存补跑13/13通过，当前业务源码与之前构建一致。
- audit-remediated：0已报漏洞；baseline-remediated：Prisma生成及重复迁移通过。
- api07-handoff：独立接手3项测试与其局限见专门报告。

截图原始文件在app/.runtime/screenshots；已分别归档于evidence/screenshots/v0.1.0、v0.2.0、v0.2.0-rc2，按浏览器/视口/状态命名并有摘要索引。历史截图不支持后续未验版本。

## v0.2更新

产品候选与产物摘要在releases/v0.2.0，当前lint/typecheck/audit-v02均退出0（lint一个ref建议）；unit-v02-node24为15项通过；build-v02与e2e-v02对应同一产品文件。CF-01–07按四视口在三引擎执行；CF-08本机Chromium网络仿真筛选P95=833ms，详见performance-v02原始样本。数据库无迁移变化，v0.1历史通过仍仅对应旧构建。

截图已实际归档：screenshots/v0.1.0共144张，v0.2.0共180张，包含各自index.json与摘要。不能把旧截图当新版证明。

## 最终修订候选与补充验证

rc2产物/源快照独立复核通过，APP-06关闭。最终当前E2E合并新增角色场景为55通过/2非Chromium性能副本跳过，另补真实Chromium200%缩放通过并保存browser-zoom.json/截图。当前单元15项。依赖审计0、lint/typecheck/build通过；并行build/typecheck曾竞争.next，顺序重验通过且失败日志保留。

真实HTTP停滞数据库握手约5秒返回通用503，补充API-07处理器探针；原生实机与所有事务取消不外推。backup-restore验证发布库副本恢复后Task ID完全相同。A01–A22实际消费关系见artifact-usage；状态不再依赖聊天摘要。

## 最终交付rc3

FIX-002真实缩放日期覆盖已由CSS独立滚动修复。候选9139ec61…、产物f7f83f49…经独立复核，56 E2E通过/4项非Chromium测量API副本跳过，build/lint/typecheck通过；服务端、迁移与依赖不变，已有15单元/集成和0漏洞审计仍适用。发布及重启真实通过，数据8→9→10并保留所有前版检查点。最终依据releases/v0.2.0-rc3/run、browser-zoom-rc3、execution/final-review追加结论；旧版失败保留历史含义。

当前有效UI候选为rc3；上文v0.1/v0.2历史运行仅描述各自版本。全计划闭环完成依据execution/completion-audit，未把生产、长期指标或大型团队列为已验证。
