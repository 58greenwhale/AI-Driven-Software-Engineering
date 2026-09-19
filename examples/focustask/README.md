# FocusTask 生命周期实证

目标是用一个真实可运行切片验证模型和制品。v0.1、v0.2迭代及最终缩放修复rc3已完成独立候选验证和本地发布，维护演练与数据验证完整保留；总体模型效果与局限见[评价](evaluation.md)，最终审计见[执行状态](../../execution/status.md)。

## 阅读顺序

1. [实证范围](docs/empirical-scope.md)：v0.1/v0.2边界及与原愿景的差异。
2. [任务表](docs/iteration-plan.md)：依赖和当前执行状态。
3. [功能规格](docs/features/TASK-001-create-task.md)、[领域](docs/domain.md)、[权限](docs/permissions.md)。
4. [实证契约](docs/empirical-contracts.md)、[页面范围](docs/empirical-ui.md)、[验证策略](docs/test-strategy.md)。
5. [评价基线](evaluation.md)和[真实证据索引](evidence/README.md)。

[原产品愿景](docs/product.md)及原路线图保留为输入，不代表本实证实现了全部功能。docs/artifact-examples 是教学填写示例，不可作为已执行的测试、评审或部署记录。

## 当前运行状态

在app目录使用Node24.14.0/npm11.9.0，先npm ci，再node scripts/setup.mjs dev。配置与虚构账号密码由脚本生成到忽略的.runtime/dev.json，不打印或提交秘密。启动node scripts/run.mjs dev npm run dev，访问http://127.0.0.1:3210。

测试环境用node scripts/setup.mjs test，然后依次运行npm run lint、npm run typecheck、npm test、npm run build、npm run test:e2e。E2E自动启停测试服务3211，使用三种浏览器。WebKit保存在项目.runtime/browsers，安装时给Playwright设置同名PLAYWRIGHT_BROWSERS_PATH；Chromium/Firefox使用已安装的锁定版本。完整环境与已知限制见[工程基线](docs/engineering-baseline.md)。

生产构建/版本打包/部署与回退见[本地发布指南](docs/deploy-rollback.md)。本任务数据库55461及应用进程演练后均已停止，用户已有5432服务不受操作；数据与历史构建保留。重开本机已保存的最终产物，先运行node scripts/setup.mjs release启动专用数据库，再运行node scripts/release.mjs start v0.2.0-rc3，访问http://127.0.0.1:3212；虚构登录密码在.runtime/release.json本地读取，不上传。其他机器先构建自己的候选，不能假定忽略目录存在。

完整检查按顺序执行，尤其build不能和typecheck同时运行（共享.next）。历史v0.1产物保留在本机供回退，当前源码代表v0.2；不能用当前源码的构建冒充旧版字节相同产物。
