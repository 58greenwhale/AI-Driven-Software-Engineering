# A13 独立接手任务：API-07 故障验证

任务：P4-04会话接手实证中的真实下一步；不要求此时全部生命周期已经完成。请仅凭仓库读取事实，记录还需询问什么。

## 目标和边界

完成API-07的验证缺口：数据库不可达时健康接口给通用失败、不泄露内部错误；响应处理不应无限等待（契约10秒上限）。当前实现位于app/src/server/api.ts和db.ts，契约见docs/empirical-contracts.md，策略见docs/test-strategy.md。

允许新增测试文件与验证证据，不修改产品实现。不要停止共享55461或用户5432服务。可以在独立子进程中用无服务的回环端口配置模拟数据库不可达，或用测试替身验证超时机制；分别说明证据能支持的范围，不能把替身结果说成真实数据库故障。

## 环境与入口

在examples/focustask/app执行；Node24.14.0在本机.nvm，npm11.9.0。npm依赖已安装；真实test配置在忽略.runtime/test.json，不能输出秘密。运行脚本scripts/run.mjs可给子命令注入test配置，scripts/record.mjs保存脱敏日志和版本摘要。

命令模板：node scripts/record.mjs api07-handoff node_modules/.bin/vitest run tests/api-health.test.ts。

## 下一步与完成

先读取根/示例AGENTS、本交接、相关规格和实现。提出可复现的最小验证，新增tests/api-health.test.ts或同等目标文件并运行，写evidence/handoff-api07-result.md，包含接手输入、追加澄清次数、实际命令、版本/日志、结论与局限。

这是新会话接手，不应接收父Agent的聊天摘要或假设通过。若环境授权阻止子进程/网络，按工具要求处理；未运行的检查记阻塞。发现产品缺陷报告给协调者，不自行修产品。
