# Shared API 测试指南

## 概述

本文档介绍如何使用前端最小应用验证后端 Shared API 服务的功能。

## 前置条件

1. 后端服务已启动（默认端口：8080）
2. 前端开发服务已启动（默认端口：5173）
3. 已配置正确的 API 基础路径

## API 模块说明

### 1. 认证服务 (Auth API)

#### 功能列表

- **用户注册** - `POST /api/v1/shared/auth/register`
  - 参数：`username`, `email`, `password`
  - 返回：用户信息和 Token

- **用户登录** - `POST /api/v1/shared/auth/login`
  - 参数：`username`, `password`
  - 返回：Token 和用户信息

- **用户登出** - `POST /api/v1/shared/auth/logout`
  - 需要认证：是
  - 返回：成功消息

- **刷新Token** - `POST /api/v1/shared/auth/refresh`
  - 需要认证：是
  - 返回：新的 Token

- **获取用户权限** - `GET /api/v1/shared/auth/permissions`
  - 需要认证：是
  - 返回：权限列表

- **获取用户角色** - `GET /api/v1/shared/auth/roles`
  - 需要认证：是
  - 返回：角色列表

### 2. 钱包服务 (Wallet API)

#### 功能列表

- **查询余额** - `GET /api/v1/shared/wallet/balance`
  - 需要认证：是
  - 返回：余额数值

- **获取钱包信息** - `GET /api/v1/shared/wallet`
  - 需要认证：是
  - 返回：完整钱包信息

- **充值** - `POST /api/v1/shared/wallet/recharge`
  - 需要认证：是
  - 参数：`amount` (金额), `method` (支付方式: alipay/wechat/bank)
  - 返回：交易记录

- **消费** - `POST /api/v1/shared/wallet/consume`
  - 需要认证：是
  - 参数：`amount` (金额), `reason` (消费原因)
  - 返回：交易记录

- **转账** - `POST /api/v1/shared/wallet/transfer`
  - 需要认证：是
  - 参数：`to_user_id` (收款用户ID), `amount` (金额), `reason` (备注)
  - 返回：交易记录

- **查询交易记录** - `GET /api/v1/shared/wallet/transactions`
  - 需要认证：是
  - 参数：`page`, `page_size`, `type` (交易类型)
  - 返回：交易记录列表

- **申请提现** - `POST /api/v1/shared/wallet/withdraw`
  - 需要认证：是
  - 参数：`amount` (金额), `account` (提现账户)
  - 返回：提现申请记录

- **查询提现申请** - `GET /api/v1/shared/wallet/withdrawals`
  - 需要认证：是
  - 参数：`page`, `page_size`, `status` (状态)
  - 返回：提现申请列表

### 3. 存储服务 (Storage API)

#### 功能列表

- **上传文件** - `POST /api/v1/shared/storage/upload`
  - 需要认证：是
  - 参数：`file` (文件), `path` (存储路径，可选)
  - 返回：文件信息

- **下载文件** - `GET /api/v1/shared/storage/download/{file_id}`
  - 需要认证：是
  - 返回：文件二进制数据

- **删除文件** - `DELETE /api/v1/shared/storage/files/{file_id}`
  - 需要认证：是
  - 返回：成功消息

- **获取文件信息** - `GET /api/v1/shared/storage/files/{file_id}`
  - 需要认证：是
  - 返回：文件详细信息

- **列出文件** - `GET /api/v1/shared/storage/files`
  - 需要认证：是
  - 参数：`page`, `page_size`, `category` (分类)
  - 返回：文件列表

- **获取文件访问URL** - `GET /api/v1/shared/storage/files/{file_id}/url`
  - 需要认证：是
  - 参数：`expire` (过期时间，秒，默认3600)
  - 返回：临时访问URL

### 4. 管理服务 (Admin API)

#### 功能列表

- **获取待审核内容** - `GET /api/v1/shared/admin/reviews/pending`
  - 需要认证：是
  - 需要权限：管理员
  - 参数：`content_type` (内容类型)
  - 返回：待审核内容列表

- **审核内容** - `POST /api/v1/shared/admin/reviews`
  - 需要认证：是
  - 需要权限：管理员
  - 参数：`content_id`, `content_type`, `action` (approve/reject), `reason`
  - 返回：成功消息

- **审核提现** - `POST /api/v1/shared/admin/withdraw/review`
  - 需要认证：是
  - 需要权限：管理员
  - 参数：`withdraw_id`, `approved` (bool), `reason`
  - 返回：成功消息

- **获取用户统计** - `GET /api/v1/shared/admin/users/{user_id}/statistics`
  - 需要认证：是
  - 需要权限：管理员
  - 返回：用户统计信息

- **获取操作日志** - `GET /api/v1/shared/admin/operation-logs`
  - 需要认证：是
  - 需要权限：管理员
  - 参数：`page`, `page_size`, `admin_id`, `operation`
  - 返回：操作日志列表

## 使用测试页面

### 访问测试页面

在浏览器中访问：`http://localhost:5173/shared-api-test`

### 测试流程

#### 1. 认证测试流程

```
1. 用户注册
   - 填写用户名、邮箱、密码
   - 点击"测试注册"按钮
   - 查看返回结果

2. 用户登录
   - 填写用户名、密码
   - 点击"测试登录"按钮
   - 保存返回的 Token（自动保存到请求头）

3. 获取权限和角色
   - 点击"获取用户权限"
   - 点击"获取用户角色"
   - 查看当前用户的权限和角色

4. 刷新Token
   - 点击"刷新Token"
   - 获取新的 Token

5. 登出
   - 点击"登出"
   - Token 失效
```

#### 2. 钱包测试流程

```
前提：已登录

1. 查询钱包信息
   - 点击"查询余额"或"查询钱包信息"
   - 查看当前余额

2. 充值
   - 填写充值金额
   - 选择支付方式
   - 点击"测试充值"
   - 余额自动更新

3. 消费
   - 填写消费金额和原因
   - 点击"测试消费"
   - 余额自动更新

4. 转账（需要另一个用户ID）
   - 填写收款用户ID、金额、备注
   - 点击"测试转账"
   - 余额自动更新

5. 查询交易记录
   - 点击"查询交易记录"
   - 查看所有交易历史
```

#### 3. 存储测试流程

```
前提：已登录

1. 上传文件
   - 点击"选择文件"
   - 选择要上传的文件
   - 点击"测试上传"
   - 文件上传成功后自动刷新文件列表

2. 查看文件列表
   - 点击"查询文件列表"
   - 查看已上传的文件

3. 文件操作
   - 点击"查看信息"查看文件详情
   - 点击"删除"删除文件
```

#### 4. 管理测试流程

```
前提：已登录且具有管理员权限

1. 查看待审核内容
   - 点击"获取待审核列表"
   - 查看需要审核的内容

2. 查看操作日志
   - 点击"获取操作日志"
   - 查看管理员操作记录
```

## 测试结果说明

### 成功响应

测试成功时，结果会显示在页面底部的"测试结果"卡片中：
- 绿色背景表示成功
- 显示 API 名称和"成功"标签
- 显示完整的响应数据（JSON 格式）
- 显示测试时间

### 失败响应

测试失败时：
- 红色背景表示失败
- 显示 API 名称和"失败"标签
- 显示错误信息
- 显示测试时间

### 清空结果

点击"清空结果"按钮可以清除所有测试结果。

## API 响应格式

### 标准响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

### 分页响应格式

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100
  }
}
```

### 错误响应格式

```json
{
  "code": 400,
  "message": "错误描述"
}
```

## 常见问题

### 1. 401 未授权错误

**原因**：未登录或 Token 过期

**解决方案**：
1. 先进行用户登录
2. 如果已登录，尝试刷新 Token
3. 如果仍失败，重新登录

### 2. 403 权限不足错误

**原因**：当前用户没有访问该 API 的权限

**解决方案**：
1. 确认该 API 是否需要特殊权限（如管理员权限）
2. 使用具有相应权限的账户登录

### 3. 500 服务器错误

**原因**：后端服务异常

**解决方案**：
1. 检查后端服务是否正常运行
2. 查看后端日志获取详细错误信息
3. 确认数据库连接是否正常

### 4. 网络连接失败

**原因**：无法连接到后端服务

**解决方案**：
1. 检查后端服务是否启动
2. 确认 API 基础路径配置是否正确
3. 检查网络连接

## 配置说明

### API 基础路径配置

在 `.env` 文件中配置：

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 开发环境运行

```bash
# 启动后端服务
cd Qingyu_backend
go run main.go

# 启动前端服务
cd Qingyu
npm run dev
```

## 代码结构

```
Qingyu/
├── src/
│   ├── api/
│   │   └── shared/          # Shared API 接口定义
│   │       ├── auth.js      # 认证服务API
│   │       ├── wallet.js    # 钱包服务API
│   │       ├── storage.js   # 存储服务API
│   │       ├── admin.js     # 管理服务API
│   │       └── index.js     # 统一导出
│   ├── views/
│   │   └── SharedAPITestView.vue  # 测试页面
│   └── router/
│       └── index.js         # 路由配置
└── doc/
    └── shared-api-test-guide.md  # 本文档
```

## 扩展测试

### 添加新的测试用例

1. 在 `SharedAPITestView.vue` 中添加新的表单或按钮
2. 创建对应的测试方法
3. 调用 API 并处理响应
4. 使用 `addTestResult()` 记录测试结果

### 示例

```javascript
const testNewFeature = async () => {
  loading.newFeature = true
  try {
    const result = await sharedAPI.someModule.someMethod(params)
    addTestResult('新功能测试', true, result)
    ElMessage.success('测试成功')
  } catch (error) {
    addTestResult('新功能测试', false, { error: error.message })
  } finally {
    loading.newFeature = false
  }
}
```

## 注意事项

1. **Token 管理**：登录后 Token 会自动添加到请求头，无需手动处理
2. **文件上传**：文件上传使用 `multipart/form-data` 格式
3. **权限验证**：管理员 API 需要特殊权限，普通用户无法访问
4. **数据验证**：后端会对请求参数进行验证，确保输入符合要求
5. **错误处理**：所有错误都会在页面上显示，便于调试

## 后续优化建议

1. 添加更多的表单验证
2. 实现自动化测试脚本
3. 添加性能测试功能
4. 支持批量操作测试
5. 添加 API 响应时间统计
6. 实现测试结果导出功能

## 相关文档

- [后端 API 文档](../Qingyu_backend/doc/api/shared/)
- [前端开发规范](./项目开发规范.md)
- [架构设计](./architecture/前端架构设计.md)

