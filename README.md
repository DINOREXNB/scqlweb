# SCQL Web
# 功能
- [x] 用户登入注册
- [x] 查看/创建/删除数据库/表
- [x] 切换数据库
- [x] 查看CCL
- [x] 授予CCL
- [x] 查询自身所有表
- [x] 联合其他非己所有表数据进行查询
- [x] 快捷键执行查看数据库/CCL
- [x] 框选数据导出为csv
- [x] root于客户端添加新用户
- [ ] 用户导入数据集
- [ ] 历史查询记录
# 项目架构
## 前端(CommonJS)
- 登录/注册界面
  - 验证/创建用户信息
- SCQL主界面 
  - 执行查询操作
  - 导出查询数据
## 后端(nodeJS & SCDB)
### Web服务器(nodeJS)
- 处理登录/注册请求
- 接受查询语句并转发至SCDB
- 接收SCDB服务器的响应并处理
### 安全协作查询数据库服务器(SCDB)
- 使用隐语(secretflow)搭建的SCDB服务器
- 通过`SCDB`提供的API`submit_and_get`对提交的查询进行联合数据分析，将分析结果返回至Web服务器
### 配置文件说明
- `settings.yaml`
- `mysql`部分为数据库相关配置，用于存储用户的登录账户和密码
- `server`部分为Web服务器配置
```yaml
mysql:
 host: 'localhost'
 port: 3306
 user: 'root'
 password: 'your_password'
 database: 'scql'

server:
 host: "localhost"
 port: 80
 location: "your_server_url" 
```
### 创建本地数据库
- 填写`settings.yaml`后，使用`/sql/Userinfo.sql`在`mysql`创建一新数据库用于存储登录用户账户密码，该数据库名称为`scql`
# 安全性说明
> 摘自隐语"安全保障和威胁模型"

对于单次查询，`SCQL` 在计算过程中提供满足 `CCL` 权限要求的数据机密性保护。

`SCQL` 不保护查询语句，因为查询语句对 SCQL 所有的参与方公开。`SCQL` 也不保护中间计算结果的大小（维度）信息。

`SCQL` 构建在 MPC 框架 secretflow/spu 之上，使用的是 `semi-honest` 安全模型。`SCQL semi-honest` 模型假设所有的参与方，包括查询者，数据拥有方(SCQLEngine 部署在数据拥有方) ，和 `SCDB` 等都严格遵守协议，但有可能会尝试分析自己得到的中间信息以获得额外的其他参与方的隐私信息。

和所有基于密码学的隐私计算系统一样，现阶段 `SCQL` 无法解决建立在合法查询结果上的反推原始数据隐私的问题。目前学术界解决该问题的方案一般都是通过 `DP` 加噪音。虽然 `CCL` 机制可以让数据 owner 对自己的数据进行使用限制授权，能一定程度地缓解风险，但是不能完全杜绝风险。`SCQL` 也不解决参与方篡改自己原始输入从而得到其他参与方隐私信息的问题。