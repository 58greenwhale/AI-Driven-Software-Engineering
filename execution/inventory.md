# 初始盘点

时间：2026-09-19；读取当前工作区，未执行 reset/checkout。

- 当前 master，原有 5 个已跟踪修改、4 个未跟踪指南及已保存计划。完整文档冻结于 baseline，包含先前未提交的新增内容。
- Node v26.2.0、npm 11.13.0、PostgreSQL 18.3 客户端/安装包可找到；没有 Docker、Colima、Podman。数据库服务尚未验证。
- 没有应用 package.json；npm 验证命令目前无法执行，不记为通过。
- brew list 的默认查询发生 DNS 错误；使用环境审批重试。它的部分输出不等于环境初始化完成。
- 未发现嵌套 AGENTS。基线正文是历史样例，不是新的实证记录。

## 工作区文档指纹（迁移前）

| 原路径 | SHA-256 |
| --- | --- |
| README.md | c69aac48b0b0490235d503842da888ab831f7927c50e688f872c1d829232b0c3 |
| AGENTS.md | f100d1f5cc521a1e604b6e74d34c900c9ae303d2e98eceb27b948631ee3dcb26 |
| docs/product.md | 557071890c9cbcb1dd7cb759e7a4fb4f67950ed930a4b8d1f45463d1f973efba |
| docs/glossary.md | f996b7011417cec3db5c54952b87d0b01826d8b33dae14211b9097a58140bd9b |
| docs/domain.md | b4d0038fb174b3a0e3d1ed8c0d714c0260539a9859af7f9443d37638730ca350 |
| docs/permissions.md | a568489c5ed21a4a4f758d75e2d5236cad114ee3a6e3e6c2d534e4c88bcd42f4 |
| docs/architecture.md | 8c4ea5c72b2eac05b76930e46e7cd4e99ed748e834c334ccdf604e63d551d895 |
| docs/non-functional.md | ed7f9116f79647312a566357a27dc6fc77bd2168a936ed4aa32b6b503724277d |
| docs/design-system.md | 3c264b74eafb71b943a7cb40853a5850fa082ce84a6c123485896e2fe86b9aac |
| docs/user-journeys.md | 46102646babe626a61aecbae7ca0f004d29c4fb0ee6c12f907d3c433b3eac16b |
| docs/roadmap.md | 07894d15cd96b8806e4f07dfb1b29a32d5a94bb5f4f44fa32853d4cb81978261 |
| docs/definition-of-done.md | 16d65d4e455e74f97475be896abde8d05957cc5677f94ecfb67c1869706fcd35 |
| docs/features/TASK-001-create-task.md | 3e286b6caf76f509a3acabeb78ed81f67b8496a1346ae9e495606a29c9cf90ca |
| docs/pages/task-list.md | 41c506d58f94cdc9b07da14dad630b05cc9cb9703e0e0f54b3fb223b1cf07417 |
| docs/decisions/0001-task-status-model.md | ec8b172d432642ca1a6495179c084a96565e93dda4839996fad54858304476df |
| docs/repository-initialization.md | 777b85a783c2f839a077b3efd26280b6686be1a5d3c9104416eaa388e4de8e84 |
| docs/development-workflow.md | 4637006f0bc0ca02c7e181083f44abf8d2f0f4d5a4ff517290e3fb006a841e98 |
| docs/agent-context-management.md | 883a9e1fce7c84308ff4998c67f9c6f8318016700816a3e629b2eca5ed149899 |
| docs/release-readiness.md | 7215251eee34eed6964e074821d923b73b32232c5b89845c237c38a4f5941a22 |
| AI_PROJECT_DOCUMENTATION_GUIDE.md | 677f9a707e0c3327564bb8d72dc7cce3785283ac603986717d4af3d5c76b67ec |
