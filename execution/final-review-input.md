# P5 最终独立交付复核入口

任务：只读判断实施计划1.1的最终交付是否满足本地实证目标。不要修改产品实现或自行降低验收标准。工作区包含全部待提交结果，不能只看git tracked差异。

先读AI_LIFECYCLE_IMPLEMENTATION_PLAN、execution/completion-audit、delivery-report、status及根/示例AGENTS。继续按model总纲/目录/模板和examples/focustask/evidence索引核对规范、提示词、制品实例、实际验证、发布、维护和模型评价。

应用固定产物是v0.2.0-rc2；正常产品文件未改变，后续新增仅验证脚本和证据。独立acceptance-v01/v02和维护权限复核已存在。源码/构建/截图/基线可用node scripts/audit-evidence.mjs核对，文档用node scripts/check-docs.mjs。读取脚本确认检查范围，不以脚本返回0替代语义验收。

最后结果包括：15单元/集成、55E2E通过/2非Chromium性能副本跳过、真实Chrome200%缩放1通过、lint/typecheck/build/官方audit通过、npm ci后再准备和测试通过。所有失败保留；构建与类型检查竞态已顺序复验。发布维护直接本地，无Docker；应用3210–3213当前均无监听，任务专用数据库55461保留、用户5432不操作。

重点核对：制品不仅有标题且说明下游用途和操作提示词；教学/真实记录不混用；独立失败请求由协调者执行脚本/独立者复核的事实不被扩大；原始未提交文档迁移保存；迭代/回退数据和版本可追踪；评价的未测范围与计划允许本地范围一致。

## 末轮新增FIX-002

针对你指出的zoom截图局限，追加真实全字段边界断言后发现日期框被操作区遮挡，记录changes/FIX-002-zoom及失败runs。已修CSS并生成v0.2.0-rc3快照/产物，zoom-v02-rc3通过，新的viewport/date截图与browser-zoom-rc3.json展示完整边界。请以新候选审查UI修复并允许（或拒绝）后续本地发布；其余后端/依赖与rc2一致，历史演练仍独立存在。三浏览器E2E完成后核对新记录，不能让旧rc2放行直接替代新候选。

结果写execution/final-review.md，结论逐项通过/失败/无法判定/阻塞。发现缺项先明确预期/实际/复现/证据及是否阻止本地目标。现有的真实生产/大型团队/实机和长期指标仅是外推限制，不能宣称它们已验证，也不扩大本地实验范围。
