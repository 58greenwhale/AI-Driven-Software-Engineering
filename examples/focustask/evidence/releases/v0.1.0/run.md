# A19 v0.1.0 实际本地发布

结论：通过本地首版部署及重启持久化验证。范围限用户授权的本地实证，未执行真实生产发布。

## 产物与环境

源文件和Build ID以同目录source-files.json、artifact.json及独立acceptance-v01为依据。生产standalone产物运行在回环3212；发布数据库focustask_release位于任务专用55461实例，与测试库分离。真实配置未记录在报告。

## 实际步骤

1. release-env-v01：空发布库应用202609190001_initial迁移并建立虚构夹具。
2. release pack v0.1.0：保留版本目录，文件摘要1d85408ee4ec001326fdaa55b46efd9f95f2fbf1778e067a260c53fe6804edba。
3. deploy-v01：核验产物摘要，启动专属进程，health应用/数据库正常，版本0.1.0。
4. smoke-v01：Editor真实登录/创建/读取；同键重试同ID；Viewer写入403；任务3→4。
5. restart-v01：核对进程归属后重启同一产物，保留数据库；persist-v01再次核对原任务并合法新增。

命令、开始结束时间、退出码、源码与规格摘要见evidence/runs中同名记录；data checkpoint保存在忽略配置，脱敏结果文件在本发布目录的上级。没有把“健康通过”单独当作业务验收。

## 下一阶段

v0.1产物不再覆盖。按CHANGE-001实现v0.2筛选，再使用同一发布数据升级；后续故障和回退演练需独立记录，本次不提前声明完成。
