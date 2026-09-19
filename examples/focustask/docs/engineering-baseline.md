# A09 实际工程基线

应用位置：examples/focustask/app。Node24.14.0/npm11.9.0锁定；框架Next15.5.25、React19.3.0、TypeScript5.9.3、Prisma6.19.3；精确依赖见package-lock.json。PostgreSQL18.3本机二进制用于专用实例，理由见ADR-0003。

## 从环境到运行

在app目录使用Node24执行npm ci，然后node scripts/setup.mjs test。脚本仅初始化.runtime/postgres，在回环55461启动，并建立独立focustask_test库；不会重置已有数据。dev/release/drill分别传对应参数，保持环境数据库分离。配置、密码和数据库目录被Git忽略。

命令：npm run lint、npm run typecheck、npm test、npm run test:e2e、npm run build。E2E先要求已有生产构建，然后自行启动test环境3211服务；浏览器依赖用锁定Playwright安装。

开发入口：node scripts/run.mjs dev npm run dev。生产测试入口：node scripts/start-production.mjs test。可移交发布产物使用scripts/release.mjs；固定v0.1和v0.2 rc2独立验收及本地演练已完成，见evidence/acceptance-v01、acceptance-v02及releases。

## 真实状态与限制

初次准备两次失败分别是沙箱共享内存限制、macOS Unix socket路径过长。授权后只用回环TCP，迁移和夹具生成成功。最初9条Vitest和9条Chromium通过；后续已扩展到15单元/集成、55条三浏览器功能/性能通过及真实缩放验证，旧结果保留原版本。首次浏览器下载未完成的阻塞不计为通过。

这些是阶段性事实，不是整体完成。生产构建和后续检查通过scripts/record.mjs保存命令、时间、源码/规格摘要、退出码及脱敏输出；没有证据的命令不得在交付报告勾选。

## 实证后的复现核对

已执行npm ci从锁文件重新安装412个包，官方审计0风险；重新generate/migrate/seed测试环境，迁移显示无待执行且数据不覆盖；重装后15项单元/集成通过。发布用保存产物，本机3212/3213进程演练后停止，重新启动依A18核对状态。

推荐顺序：准备→lint→typecheck→test→build→test:e2e。build与typecheck不可并行；后续测试文件增加后再typecheck即可，无业务变更无需重复所有发布演练。
