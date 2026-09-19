# A04 本地实证契约

版本：0.1；状态：依据既有规则的设计草稿；范围见empirical-scope。重要局部选择在decisions/0002-local-experiment记录，不声称业务规则获得了新的人工批准。

## 分层与协议

页面和Route Handler只做交互/协议；server服务认证、权限、校验、事务与Prisma访问。API前缀/api/v1；成功 {data: ...}，失败 {error:{code,message,fields?,requestId}}。日志只有路由、状态、耗时、请求ID和错误类型，禁止正文/认证头/Cookie。

## 接口

| 方法/路径 | 输入和作用 | 关键失败 |
| --- | --- | --- |
| POST /api/v1/auth/login | email、password；验证慢哈希后创建服务端会话 | 错误账户或密码统一401；格式400；失败限流429 |
| POST /api/v1/auth/logout | 当前会话，注销并删除Cookie | 幂等退出，不暴露会话内容 |
| GET /api/v1/me | 当前身份及显示名 | 未登录401 |
| GET /api/v1/projects | 当前用户有成员关系的预置项目 | 未登录401 |
| GET /api/v1/projects/:id | 项目、当前角色、成员 | 非成员/不存在404 |
| GET /api/v1/projects/:id/tasks | v0.1全部；v0.2可选status | 未登录401，非成员404，非法筛选400 |
| POST /api/v1/projects/:id/tasks | title、assigneeId?、dueDate?；UUID Idempotency-Key | Viewer403，非成员404，归档409，非法输入400，同键异内容409 |
| GET /api/v1/health | 应用与数据库连接健康，版本标识 | 数据库故障503；不得泄露连接串 |

创建时只接受三个业务字段，拒绝createdBy/status/projectId及未知字段。title trim后按Unicode码点计数1–100，不折叠内部空格。负责人必须为当前项目成员。日期为有效YYYY-MM-DD且不早于项目时区今天；非法日期不能被JS日期归一化静默接受。

幂等键作用域为用户+项目。相同规范化内容返回首次任务201，同键异内容409；创建任务与幂等记录同事务，数据库唯一约束消除并发重复。处理重试时先重新校验会话、权限与项目状态，不能以幂等缓存绕过授权。

重试内容先做结构规范化和指纹匹配；已有成功结果不得因跨过项目午夜而重新触发“过去日期”的新建校验。当前调用者权限及项目状态仍重新校验；仅新写入检查当日日期和负责人当前有效性。这是AC-08首次结果语义的明确化。

列表按updatedAt倒序、id稳定排序。v0.2 status缺省/空表示全部，合法值todo/in_progress/done，未知值400；这是既有输入校验规则的保守延伸，须在变更实施前测试。数据集有限，不增加未确认分页。

## 会话、安全与本地环境

## 具体数据形状与成功状态

以下为本地实证正式接口契约；UUID为字符串，日期为YYYY-MM-DD，时间戳为ISO8601 UTC。所有响应使用JSON，未列出的字段不能由客户端写入。

```ts
type UserView = { id: string; email: string; displayName: string };
type Role = 'admin' | 'editor' | 'viewer';
type ProjectView = { id: string; name: string; status: 'active' | 'archived'; timeZone: string; role: Role };
type MemberView = UserView & { role: Role };
type TaskView = {
  id: string; projectId: string; title: string;
  status: 'todo' | 'in_progress' | 'done'; assigneeId: string | null;
  assignee: { id: string; displayName: string } | null;
  dueDate: string | null; createdBy: string;
  createdAt: string; updatedAt: string; version: number;
};
```

| 接口 | 成功状态/响应data | 输入补充 |
| --- | --- | --- |
| login | 200，UserView；Set-Cookie设置会话 | email规范化trim+小写，password原样非空字符串；不回传秘密 |
| logout | 200，{signedOut:true}，删除Cookie | 无业务正文；无会话也成功 |
| me | 200，UserView | 无请求体 |
| projects | 200，ProjectView[]，无项目为空数组 | 无请求体 |
| project detail | 200，{project:ProjectView,members:MemberView[]} | members按显示名、邮箱升序 |
| task list | 200，{tasks:TaskView[],total:number} | total为当前筛选结果数，空结果tasks=[]和total=0 |
| create task | 201，TaskView；相同幂等重试同结构 | title:string；assigneeId:string或null；dueDate:string或null；可选字段缺省规范化null |
| health | 200，{status:'ok',database:'ok',version:string} | 不返回内部路径或连接串；失败503通用错误 |

成功示例：空列表为 {"data":{"tasks":[],"total":0}}；退出为 {"data":{"signedOut":true}}。失败fields只对字段校验出现，例如 {"error":{"code":"VALIDATION_ERROR","message":"提交内容有误","fields":{"title":"请输入任务标题"},"requestId":"example-request"}}；requestId示例不是真实运行ID。

## 配套接口验收编号

| 编号 | 给定/操作 | 预期 |
| --- | --- | --- |
| API-01 | 正确虚构账户登录并读取me | 两次UserView.id一致，Cookie含HttpOnly/SameSite；响应无密码/令牌 |
| API-02 | 错误密码、不存在账户、会话过期 | 统一401；字段类型不合法400；不得泄露账户是否存在 |
| API-03 | 成员读取projects/detail，非成员读取同id | 仅允许项目返回规定字段；非成员404且不带项目名 |
| API-04 | 空项目读列表，创建后重读 | 空结构精确；201字段与存储一致，total增1 |
| API-05 | 退出后读me；重复退出 | me401，logout仍200 signedOut:true |
| API-06 | 错误来源写请求与失败限流 | 来源拒绝403；同客户端每分钟最多10次失败尝试，再次429 |
| API-07 | 数据库不可用健康探测/服务请求 | 通用503/可识别失败，处理时间不超过10秒，不泄露内部异常 |
| API-08 | v0.2未知status查询 | 400 VALIDATION_ERROR，合法筛选不改变数据 |

## 会话与配置执行规则

服务端会话存随机令牌摘要和过期时间；客户端只持随机Cookie，HttpOnly、SameSite与适用Secure。写请求校验来源，登录失败按客户端来源限流，不能相信任意转发头。运行配置缺失明确失败；密码和会话密钥不打印。

本地实证的HTTP回环配置与真实HTTPS生产配置明确区分；本地设置不能被当作生产安全验证。数据库使用任务专用数据目录与端口，不连接用户原有数据库进行写入。会话默认有限有效期，可由测试夹具模拟过期，不暴露生产故障开关。

## 数据与迁移

沿用领域模型UUID、UTC时间戳、date、角色、三状态和版本字段；Project显式保存timeZone。增加会话、登录失败限流和幂等记录所需数据；DB外键与唯一约束必须真实存在。迁移测试覆盖空库和已有库及重复deploy不重复应用。

实现前记录确切运行时/依赖版本及必要ADR，不能把工具缺失标为就绪。前版构建与迁移状态一同记录，为本地升级/回退提供兼容依据。
