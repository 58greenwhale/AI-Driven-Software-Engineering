# A13 v0.2 固定候选验收输入

任务：P4-01独立只读复核。先读CHANGE-001、TASK-004、empirical-contracts/UI/test-strategy、原AC，再读候选source-files/artifact与runs；不把实现者自评作为通过。

产品候选集合a4fb40fd42a8946676164744e84d95fc8b288abbd7d9817c85a0db2896f7517a，清单位于releases/v0.2.0；产物09a1038ec0bfec1833655fb3a0de344b7e1cfc03f01768d6d780a0b51396d02c，已pack但未发布。与v0.1无schema变更，新增API status、URL、空筛选及创建后不匹配反馈。

证据：unit-v02-node24 15/15、build-v02、lint/typecheck/audit-v02（0漏洞）；e2e-v02 52通过2跳过，跳过限非Chromium的CDP性能重复项。performance-v02筛选P95=833ms，归档截图180张。lint有ref清理建议，不掩盖。

请核对固定产品与产物、CF-01–08及原AC回归、已知限制，写acceptance-v02.md。只读产品，不修改源码；如证据不足指出具体范围，不以路径存在代替结果。输出限本地发布结论，真实生产和未执行演练不能提前通过。

## APP-06后的新候选

旧候选no-go保留；修复候选在releases/v0.2.0-rc2，产品集合382915b5f3f2bb45a7117071312098a2b02af33b1da84ca3c386a644547478b6、产物27c056a2a9fee7a04031dab153916b9893551c853cab2174f1e0e562d5645302。新增CF-09创建延迟期间后退，e2e-v02-rc2四视口三引擎通过（52通过2性能重复项跳过）；filter-role-v02-rc2额外三个浏览器组合通过，性能和180张新截图均另存rc2。请对这个新候选复核并给出限定本地发布结论。
