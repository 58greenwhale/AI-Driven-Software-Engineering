# A13 v0.1 候选交接（实际）

版本：工作区候选，源码指纹见runs中最新build记录；后续测试文件/样式改动需核对记录文件清单。任务状态：实现中，尚未发布，不代表独立验收通过。

## 输入

先读根/示例AGENTS、docs/empirical-scope、empirical-contracts、empirical-ui、test-strategy、features/TASK-001及权限/领域。原产品完整愿景不等于本地切片。

## 环境

应用目录examples/focustask/app；Node24.14.0路径位于本机.nvm，npm11.9.0。专用PostgreSQL18.3进程在127.0.0.1:55461，数据目录app/.runtime/postgres；5432为用户已有服务不可改。测试数据库focustask_test，配置与虚构密码在忽略的.runtime/test.json，不打印其值。

准备：node scripts/setup.mjs test；依赖按lockfile安装。测试：npm test；生产构建：npm run build；E2E：npm run test:e2e，测试自行启动3211端口。实际命令需Node24环境；沙箱网络/共享内存不足按环境权限执行。

## 已执行与失败

9个Vitest单元/数据库测试通过；lint、typecheck与生产构建通过；早期Chromium9条E2E通过，但尚未覆盖全部新增用例。正在运行完整三浏览器检查；不能把早期结果套到新候选。

初次initdb因沙箱共享内存权限失败；授权后初始化，但Unix socket路径过长；改为回环TCP后成功。早期浏览器缺headless-shell导致UI未执行，安装后已解决。全部需要在最终报告区分环境失败和实现失败。

## 当前缺口与下一步

只读审阅当前实现是否满足契约和AC，特别是权限、幂等、超时、会话/限流、表单/焦点、安全与版本证据。不修改产品实现，报告预期/实际/复现与文件位置。生产回退/性能/故障注入/独立接手仍未实施。

已有记录是工具实测或用户明确授权，不能补造PR、用户批准、运行或生产SLA。
