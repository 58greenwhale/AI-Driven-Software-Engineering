# A17 v0.2.0 本地发布候选

来源：CHANGE-001与TASK-004；范围：在v0.1上增加状态筛选及URL/空状态/创建后反馈，无数据库schema变化。

- 源码摘要：source-files.json，产品集合a4fb40fd42a8946676164744e84d95fc8b288abbd7d9817c85a0db2896f7517a。
- 产物摘要：artifact.json，09a1038ec0bfec1833655fb3a0de344b7e1cfc03f01768d6d780a0b51396d02c。
- 构建：build-v02实际通过，含一个ref清理的lint建议，无错误；重复检查结果保留。
- 单元/集成：unit-v02-node24，15/15；较早unit-v02误用了系统Node26也通过，但基线以24的运行记录为准。
- E2E：e2e-v02，52通过/2跳过。两项跳过为Firefox/WebKit不支持CDP网络测量的性能副本；三引擎功能用例均执行，性能只在Chromium按计划采样。
- 性能：performance-v02.json保留页面/API/筛选/CLS原始样本，限本机测量环境。
- 截图：screenshots/v0.2.0下180张独立浏览器/视口/状态证据。
- 目标：回环3212、原focustask_release库，保留v0.1数据；配置仅引用忽略文件。
- 回退：v0.1构建已保存且schema兼容，切换进程不删除数据。
- 发布决定：no-go；独立复核发现创建请求延迟期间浏览器历史切换导致旧筛选回调覆盖结果。该候选保留，修复后以v0.2.0-rc2新产物重新验收，不覆盖原文件。
