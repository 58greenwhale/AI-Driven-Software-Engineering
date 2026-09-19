# A14 v0.1 本地发布候选独立复核

- 日期：2026-09-19；审查者：独立验收 Agent `/root/v01_review`。
- 结论：**通过，允许固定候选进入已授权的本地发布与部署后验证。** 此结论限回环地址、虚构数据、任务专用数据库和独立进程；不代表公网生产就绪、全部原产品非功能要求通过或发布已经发生。
- 输入：[首次独立审查](application-review-01.md)、[追踪表](traceability.md)、[产品文件清单](releases/v0.1.0/source-files.json)、[产物清单](releases/v0.1.0/artifact.json)，以及仓库内实证范围、契约、原 TASK-001 AC 和验证策略。
- 本轮仅修改本报告。读取产品、测试、原始运行记录和本地截图，独立重算哈希；未修改实现、运行应用测试、启动服务或写数据库。真实测试由已有执行者运行，本轮复核其证据和适用候选。

## 候选与证据绑定

独立读取并重算产品清单全部 28 个文件，当前源码无差异。对清单解析结果执行 `SHA256(JSON.stringify(rows))` 得到 `2537ce2fb5f37e756f33c4f7e5083a555e5824c095e83262906ed3cb29799573`。该摘要是产品文件集合摘要，不是各运行记录的 app 全树 `sourceSha256`。

固定产物 Build ID 为 `OXsrd6NG9ACbhy0NJUxWk`，产物摘要为 `1d85408ee4ec001326fdaa55b46efd9f95f2fbf1778e067a260c53fe6804edba`。独立检查打包目录中清单所列 1,996 个文件，逐文件哈希与汇总哈希全部匹配；再逐文件与当前 `.next/standalone` 及 `.next/static` 比较，无差异，Build ID 一致。

| 运行记录 | 与固定产品候选的关系 | 结论 |
| --- | --- | --- |
| unit-remediated-retry、build-remediated、e2e-remediated | 28 个产品文件全部一致；当时全树摘要为 `1b0b2b4fbde3d0be3fcf8d36454cab8c67d863ee36632f2c55445a1222da28f6` | 通过绑定 |
| 最终 api07-handoff、performance-v01、webkit-local-v01、unit-complete-v01 | 28 个产品文件全部一致；新增测试令全树摘要变为 `a9a26ba5c8c8b64dfcb858ba65cabdae62ec68049d8aec088d3f832830b418ea` | 通过绑定 |
| lint-release-candidate、typecheck-release-candidate | 28 个产品文件全部一致；发布脚本等变化令全树摘要变为 `704a00f76a6572cad3036b3919d7efbe04535a0d2209f639095d2629b9df6c7c` | 通过绑定 |
| audit-remediated、baseline-remediated | 早于 api/tasks 后续修补，不能证明当前业务行为；package.json、锁文件、Prisma 模型和迁移与候选一致 | 仅依赖审计/工具链迁移证据通过绑定 |

较早记录与当前 docs 的差异位于迭代状态、依赖 ADR 状态；最终 API-07、性能、WebKit 与 14 项测试所存规格摘要与当前 docs 一致。没有用 Git HEAD 或全树摘要相同的假设代替逐文件核对。

## APP-01–05 修补复核

| 编号 | 预期与当前实现/证据 | 结论 |
| --- | --- | --- |
| APP-01 | [tasks.ts](../app/src/server/tasks.ts) 在当前成员、角色和项目状态校验后规范化内容并查幂等记录，命中则返回首次结果；仅新写入执行当日日期校验。[数据库测试](../app/tests/tasks.test.ts)覆盖项目午夜前创建、午夜后同键返回同 ID、新键拒绝过去日期；11 项及最终 14 项运行均通过。 | 通过 |
| APP-02 | [tasks.tsx](../app/src/features/tasks.tsx)将创建返回的 404 纳入关闭表单并刷新分支；刷新显示统一未找到页面。[core.spec.ts](../app/tests/e2e/core.spec.ts)真实夹具移除成员后提交，断言对话框关闭、项目名隐藏、数据库无任务；Chromium、Firefox、WebKit 均通过。 | 通过 |
| APP-03 | projectId、幂等键在生成事务锁前统一小写；[validation.ts](../app/src/server/validation.ts)规范化负责人 UUID 后才生成内容指纹。大小写变体并发测试返回同 ID、数据库只增一条；修补后的数据库测试通过。 | 通过 |
| APP-04 | 新写入在同一事务中先对负责人成员行执行 `FOR SHARE`，再检查其存在并插入任务；删除先完成会被拒绝，创建先获得锁时删除等待事务结束。先前静态检查窗口已关闭；有效/无效负责人集成测试通过。没有专门记录一次双事务暂停/删除的实测，不声称原风险曾被复现。 | 通过代码修补复核；专门并发演练无法判定 |
| APP-05 | 六个视口的正常、字段错误、空、归档、失败、加载、Viewer、Not Found 截图均加入浏览器名。实际核对每个浏览器 48 张、合计 144 张，无缺项。200% 等效布局的附加截图仍共用名称，故只有最后一张，三引擎该测试通过由各自日志证明。 | 通过规定状态截图隔离；三份独立缩放截图无法判定 |

APP-04 原记录是风险窗口，不因本次修补追写为“曾实测失败”。APP-05 的附加缩放截图限制不影响六视口八状态的独立截图，也不改变任何测试结果。

## 实际验证与边界

| 判据 | 证据与观察 | 结论 |
| --- | --- | --- |
| 单元/数据库集成及 API-07 测试 | [unit-complete-v01](runs/2026-09-19T02-15-54-787Z-unit-complete-v01.log)：3 文件、14/14，通过；含标题/日期边界、负责人、Viewer/非成员、幂等并发/冲突/跨日/大小写、归档/降权重验和故障处理。 | 通过已测场景 |
| Chromium/Firefox 核心回归 | [e2e-remediated](runs/2026-09-19T01-16-56-272Z-e2e-remediated.log)：两引擎各 13/13；同次 WebKit 11 项因浏览器路径缺失失败、2 项 API 测试通过。整次退出码为 1，不能改称全绿。 | 两引擎通过；当次 WebKit 阻塞 |
| WebKit 补跑 | [webkit-local-v01](runs/2026-09-19T01-27-29-949Z-webkit-local-v01.log)：项目专用浏览器缓存下 13/13，通过，产品源码与上述构建相同。 | 通过；原环境阻塞已解除 |
| UI、键盘与自动可访问性 | 上述三引擎覆盖 1440×900、1024×768、768×1024、390×844，补充 320×844、1920×1080，含焦点/Tab/Escape、字段错误和 axe 严重/关键问题为零；另有 720×450 等效缩放用例。独立抽看 WebKit 390 正常和 Chromium 1440 字段错误截图，未发现该截图内非预期控件裁切。 | 通过已测布局与交互 |
| lint、typecheck、生产构建 | [最终 lint](runs/2026-09-19T02-27-12-309Z-lint-release-candidate.log)、[最终 typecheck](runs/2026-09-19T02-26-32-397Z-typecheck-release-candidate.log)、[build-remediated](runs/2026-09-19T01-15-14-481Z-build-remediated.log)均退出 0；任务页构建报告 First Load JS 126 kB。 | 通过 |
| 依赖审计 | [audit-remediated](runs/2026-09-19T01-10-37-964Z-audit-remediated.log)，命令明确使用官方 registry，所有风险等级合计 0；锁文件与当前候选一致。旧镜像 404、旧漏洞报告仍保留。 | 通过本次审计；不是无漏洞保证 |
| 本机性能 | [performance-v01](performance-v01.json)保留 20 次页面、100 次 API 和 CLS 原始样本；与运行时指标 JSON 解析后完全相同。500 任务/20 成员，页面可见结果 P95 973.36ms、创建 API P95 10.47ms、最大 CLS 0.001656；[真实命令](runs/2026-09-19T01-22-01-055Z-performance-v01.log)退出 0。 | 通过本机已测指标 |
| API-07 数据库拒绝连接和脱敏 | [最终原始日志](runs/2026-09-19T01-21-58-677Z-api07-handoff.log)：真实无服务 TCP 端口触发 health/login 通用 503，分别 11.416ms/0.606ms；响应/日志未泄露测试秘密或内部异常。 | 通过这两条处理函数路径 |
| API-07 挂起依赖响应上限 | 健康依赖替换为不完成 Promise、受控时钟验证 9500ms 返回 503 TIMEOUT；[独立接手报告](handoff-api07-result.md)明确方法和限制。 | 通过处理器定时逻辑；真实 HTTP 慢依赖全链路无法判定 |
| 本地首版迁移准备 | [release-env-v01](runs/2026-09-19T02-21-32-647Z-release-env-v01.log)空发布库迁移通过；[baseline-remediated](runs/2026-09-19T01-10-32-589Z-baseline-remediated.log)生成及重复迁移通过，数据库和迁移文件匹配。 | 通过准备；部署尚未执行 |

性能主机为 10 核/16GB，页面网络模拟 100ms RTT、10Mbps；不能据此声明原 4 核/8GB 基线达标。页面测试以 500 条列表项出现作为完成条件，不是标准化 TTI 测量；API 样本由本地请求上下文测得。v0.2 筛选性能不属于本候选。

真实移动软键盘、辅助技术、原规格最近两代实机浏览器、实际浏览器 200% 缩放、HTTPS 公网安全、长期 SLA、备份保留周期均无法由本轮证据判定。真实慢网络/数据库挂起时的 HTTP 全链路延迟、底层取消和后续事务副作用尚未实测；保留后续验证项，未标为已通过。

## 截图定位与保留

协调者已将 144 张截图保存到 [本地证据索引](screenshots/v0.1.0/index.json)。本轮逐文件比较归档副本与 `app/.runtime/screenshots/` 原文件，144 张均一致。示例：[WebKit 移动正常](screenshots/v0.1.0/webkit-390-normal.png)、[Chromium 桌面字段错误](screenshots/v0.1.0/chromium-1440-field-error.png)、[Firefox 移动 Viewer](screenshots/v0.1.0/firefox-390-viewer.png)。这是仓库工作区内的真实归档，不表示远程制品已上传。

本次按浏览器筛选文件名、排序并计算每张 SHA-256，再对 `[文件名,摘要]` 数组 JSON 汇总，便于后续核对截图未被覆盖：

| 浏览器 | 张数 | 截图集合 SHA-256 |
| --- | --- | --- |
| Chromium | 48 | `f0ead9ecd4d535fe72aeb9b1a3ace3c221128babe8be1ccb9f5c5b8863be5ff2` |
| Firefox | 48 | `6f39535e5e6aed548e2b278248c7ed17f5f7a8395c5e4590e97075144161f069` |
| WebKit | 48 | `d509ea618445adabf0821489b24101cf80725b32b999cc0a199b913872caab06` |

## 发布界限和下一步

已核对 APP-01–05 修补及固定候选的相关验证，无尚未解决的已确认阻断缺陷。允许协调者依既有 D06 授权，在回环 3212、专用发布数据库和独立进程上启动上述固定产物；无需 Docker，不产生新的用户批准记录。

启动后的健康、登录/创建/读取、进程重启后数据 ID 保留和失败恢复结果必须另写真实发布记录；这些是下一阶段退出条件，本报告不提前声称通过。v0.2、故障注入修复、回退演练也不在此验收结论中。若产品文件、依赖、迁移或产物哈希变化，本结论对影响项失效，重新核对及运行相关检查。

文档校验：本报告写入后运行根 `node scripts/check-docs.mjs`，退出码 0，首次结果为 `files:145`、`localLinks:313`、`artifacts:22`、`stages:6`、`errors:[]`；截图链接改为归档路径后再次执行，结果见本轮工具输出。本报告内容与证据边界另做语义检查。
