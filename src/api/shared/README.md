# Shared API 前端接口文档

## 概述

本目录包含青羽平台共享服务（Shared Services）的前端 API 接口封装，对应后端 `/api/v1/shared/` 路径下的服务。

## 模块说明

### 1. 认证服务 (auth.js)

提供用户认证相关功能：

- 用户注册、登录、登出
- Token 刷新
- 权限和角色查询

```javascript
import { authAPI } from '@/api/shared'

// 登录
const result = await authAPI.login({
  username: 'user',
  password: 'pass123'
})

// 获取权限
const permissions = await authAPI.getUserPermissions()
```

### 2. 钱包服务 (wallet.js)

提供钱包管理功能：

- 余额查询
- 充值、消费、转账
- 交易记录查询
- 提现管理

```javascript
import { walletAPI } from '@/api/shared'

// 查询余额
const balance = await walletAPI.getBalance()

// 充值
const transaction = await walletAPI.recharge({
  amount: 100,
  method: 'alipay'
})

// 查询交易记录
const transactions = await walletAPI.getTransactions({
  page: 1,
  page_size: 20
})
```

### 3. 存储服务 (storage.js)

提供文件存储功能：

- 文件上传、下载、删除
- 文件列表查询
- 文件信息获取
- 临时访问URL生成

```javascript
import { storageAPI } from '@/api/shared'

// 上传文件
const fileInfo = await storageAPI.uploadFile(file, 'uploads/images')

// 查询文件列表
const files = await storageAPI.listFiles({
  page: 1,
  page_size: 10
})

// 获取文件访问URL
const { url } = await storageAPI.getFileURL(fileId, 3600)
```

### 4. 管理服务 (admin.js)

提供管理员功能（需要管理员权限）：

- 内容审核
- 提现审核
- 用户统计查询
- 操作日志查询

```javascript
import { adminAPI } from '@/api/shared'

// 获取待审核内容
const reviews = await adminAPI.getPendingReviews()

// 审核内容
await adminAPI.reviewContent({
  content_id: '123',
  content_type: 'novel',
  action: 'approve',
  reason: '审核通过'
})
```

## 使用方式

### 方式一：使用默认导出

```javascript
import sharedAPI from '@/api/shared'

// 使用认证服务
await sharedAPI.auth.login(...)

// 使用钱包服务
await sharedAPI.wallet.getBalance()

// 使用存储服务
await sharedAPI.storage.uploadFile(...)

// 使用管理服务
await sharedAPI.admin.getPendingReviews()
```

### 方式二：按需导入

```javascript
import { authAPI, walletAPI } from '@/api/shared'

await authAPI.login(...)
await walletAPI.getBalance()
```

### 方式三：单独导入

```javascript
import { login, logout } from '@/api/shared/auth'
import { getBalance, recharge } from '@/api/shared/wallet'

await login({ username: 'user', password: 'pass' })
const balance = await getBalance()
```

## API 响应处理

所有 API 都使用统一的请求工具 (`@/utils/request`)，自动处理：

1. **Token 注入**：自动添加认证 Token 到请求头
2. **错误处理**：统一捕获和展示错误消息
3. **响应解包**：自动提取 `data` 字段
4. **重试机制**：网络错误自动重试

### 成功响应

API 调用成功时，直接返回 `data` 字段内容：

```javascript
// 后端响应：
// {
//   "code": 200,
//   "message": "操作成功",
//   "data": { "balance": 100 }
// }

// 前端接收：
const result = await walletAPI.getBalance()
// result = { "balance": 100 }
```

### 错误处理

API 调用失败时，会抛出错误并自动显示错误消息：

```javascript
try {
  await walletAPI.consume({ amount: 1000 })
} catch (error) {
  // 错误已在拦截器中显示
  console.error('操作失败:', error.message)
}
```

## 文件上传

文件上传使用 `FormData` 格式：

```javascript
// 单文件上传
const file = document.querySelector('input[type="file"]').files[0]
const result = await storageAPI.uploadFile(file, 'my-path')

// 使用 Element Plus Upload 组件
const handleUpload = async (fileObj) => {
  const result = await storageAPI.uploadFile(fileObj.raw)
  console.log('上传成功:', result)
}
```

## 分页参数

需要分页的 API 使用统一的分页参数：

```javascript
const params = {
  page: 1,          // 页码，从 1 开始
  page_size: 20     // 每页数量
}

const transactions = await walletAPI.getTransactions(params)
```

## 认证要求

大部分 API 需要用户登录后才能调用。Token 会自动从 store 中获取并添加到请求头。

```javascript
// 请求拦截器自动添加 Token
// Authorization: Bearer <token>
```

## 测试页面

访问 `/shared-api-test` 可以打开测试页面，测试所有 Shared API 功能。

测试页面提供：

- 可视化的 API 测试界面
- 实时的请求响应展示
- 完整的测试流程指导

详见：[Shared API 测试指南](../../../doc/shared-api-test-guide.md)

## 开发建议

1. **错误处理**：始终使用 try-catch 捕获异步错误
2. **加载状态**：在 API 调用期间显示加载状态
3. **数据验证**：在调用 API 前进行前端验证
4. **缓存策略**：对频繁查询的数据进行合理缓存
5. **权限检查**：调用管理 API 前检查用户权限

## 扩展开发

### 添加新的 API

1. 在对应的服务文件中添加方法：

```javascript
// wallet.js
export const newMethod = (params) => {
  return request({
    url: '/shared/wallet/new-endpoint',
    method: 'post',
    data: params
  })
}
```

2. 在 `index.js` 中确保导出

3. 在组件中使用：

```javascript
import { walletAPI } from '@/api/shared'
await walletAPI.newMethod(params)
```

### 添加新的服务模块

1. 创建新文件，如 `messaging.js`
2. 按照现有模式实现 API 方法
3. 在 `index.js` 中添加导出
4. 更新本文档

## 注意事项

1. **Token 过期**：Token 过期时会自动跳转到登录页
2. **并发请求**：支持多个请求并发，但注意接口限流
3. **大文件上传**：大文件上传需要考虑超时和分片上传
4. **权限变更**：权限变更后需要重新登录或刷新 Token

## 相关文档

- [后端 Shared API 文档](../../../../Qingyu_backend/doc/api/shared/)
- [请求工具文档](../../utils/request.js)
- [测试指南](../../../doc/shared-api-test-guide.md)
- [前端架构设计](../../../doc/architecture/前端架构设计.md)
