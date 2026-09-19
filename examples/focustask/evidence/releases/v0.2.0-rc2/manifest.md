# A17 v0.2.0 修复候选 rc2

原v0.2.0候选因APP-06筛选竞态no-go，本目录是新构建，不能覆盖旧候选记录。

- 产品集合摘要382915b5f3f2bb45a7117071312098a2b02af33b1da84ca3c386a644547478b6。
- 产物27c056a2a9fee7a04031dab153916b9893551c853cab2174f1e0e562d5645302；完整清单在source-files.json、artifact.json。
- 修订仅客户端按请求完成时的当前URL重新加载和提示，消除旧submit闭包覆盖；并清理ref警告。后端/依赖/schema保持之前已测版本。
- build-v02-rc2、lint-v02-rc2通过且无lint警告；e2e-v02-rc2为52通过/2非Chromium性能副本跳过，包含CF-09四视口三引擎。
- 另外补CF-05/06角色、归档与非法URL恢复浏览器组合，结果写filter-role-v02-rc2。
- 性能原始样本performance-v02-rc2；截图归档screenshots/v0.2.0-rc2，180张。
- 发布决定：go，仅限本地实证。acceptance-v02已独立复核源码、产物、CF-09及180张截图，APP-06关闭；在原发布数据库上部署，实际数据验证仍在后续A19记录。
