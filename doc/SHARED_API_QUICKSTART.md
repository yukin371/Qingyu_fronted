# Shared API 快速启动指南

## 快速开始

### 1. 启动后端服务

```bash
cd Qingyu_backend
go run main.go
```

后端服务将在 `http://localhost:8080` 启动

### 2. 启动前端服务

```bash
cd Qingyu
npm install  # 如果是第一次运行
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

### 3. 访问测试页面

在浏览器中打开：
```
http://localhost:5173/shared-api-test
```

## 测试流程

### 第一步：用户注册和登录

1. 在"用户注册"区域填写信息：
   - 用户名: `testuser`
   - 邮箱: `test@example.com`
   - 密码: `password123`

2. 点击"测试注册"

3. 在"用户登录"区域填写：
   - 用户名: `testuser`
   - 密码: `password123`

4. 点击"测试登录"

5. 登录成功后，Token 会自动保存

### 第二步：测试钱包功能

1. 点击"查询余额"查看当前余额

2. 测试充值：
   - 金额: `100`
   - 支付方式: `alipay`
   - 点击"测试充值"

3. 测试消费：
   - 金额: `10`
   - 原因: `购买书籍`
   - 点击"测试消费"

4. 点击"查询交易记录"查看历史

### 第三步：测试文件存储

1. 点击"选择文件"选择一个测试文件

2. 点击"测试上传"

3. 上传成功后，点击"查询文件列表"

4. 在文件列表中可以查看信息或删除文件

### 第四步：查看测试结果

页面底部会显示所有测试结果，包括：
- API 名称
- 成功/失败状态
- 完整响应数据
- 测试时间

## API 端点

所有 API 都在 `/api/v1/shared/` 路径下：

### 认证服务
- POST `/shared/auth/register` - 注册
- POST `/shared/auth/login` - 登录
- POST `/shared/auth/logout` - 登出
- POST `/shared/auth/refresh` - 刷新Token
- GET `/shared/auth/permissions` - 获取权限
- GET `/shared/auth/roles` - 获取角色

### 钱包服务
- GET `/shared/wallet/balance` - 查询余额
- GET `/shared/wallet` - 获取钱包信息
- POST `/shared/wallet/recharge` - 充值
- POST `/shared/wallet/consume` - 消费
- POST `/shared/wallet/transfer` - 转账
- GET `/shared/wallet/transactions` - 查询交易记录
- POST `/shared/wallet/withdraw` - 申请提现
- GET `/shared/wallet/withdrawals` - 查询提现申请

### 存储服务
- POST `/shared/storage/upload` - 上传文件
- GET `/shared/storage/download/:id` - 下载文件
- DELETE `/shared/storage/files/:id` - 删除文件
- GET `/shared/storage/files/:id` - 获取文件信息
- GET `/shared/storage/files` - 列出文件
- GET `/shared/storage/files/:id/url` - 获取文件URL

### 管理服务（需要管理员权限）
- GET `/shared/admin/reviews/pending` - 获取待审核内容
- POST `/shared/admin/reviews` - 审核内容
- POST `/shared/admin/withdraw/review` - 审核提现
- GET `/shared/admin/users/:id/statistics` - 获取用户统计
- GET `/shared/admin/operation-logs` - 获取操作日志

## 代码示例

### 在组件中使用

```vue
<template>
  <div>
    <p>余额: {{ balance }}</p>
    <button @click="loadBalance">刷新余额</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { walletAPI } from '@/api/shared'

const balance = ref(0)

const loadBalance = async () => {
  balance.value = await walletAPI.getBalance()
}
</script>
```

### 直接调用

```javascript
import sharedAPI from '@/api/shared'

// 登录
await sharedAPI.auth.login({ username: 'user', password: 'pass' })

// 查询余额
const balance = await sharedAPI.wallet.getBalance()

// 上传文件
const file = document.querySelector('input[type="file"]').files[0]
const result = await sharedAPI.storage.uploadFile(file)
```

## 常见问题

### 1. 后端连接失败

确保后端服务已启动：
```bash
cd Qingyu_backend
go run main.go
```

### 2. 数据库连接失败

检查 `config.yaml` 中的数据库配置

### 3. Token 过期

点击"刷新Token"或重新登录

### 4. 权限不足

管理员 API 需要管理员权限，确保使用管理员账户

## 详细文档

- [完整测试指南](./doc/shared-api-test-guide.md)
- [API 使用文档](./src/api/shared/README.md)
- [实现清单](./doc/shared-api-implementation.md)

## 技术支持

如有问题，请查看：
1. 浏览器控制台的错误信息
2. 后端服务的日志输出
3. 测试页面的测试结果显示

## 项目结构

```
Qingyu/
├── src/
│   ├── api/shared/          # API 接口
│   │   ├── auth.js         # 认证
│   │   ├── wallet.js       # 钱包
│   │   ├── storage.js      # 存储
│   │   ├── admin.js        # 管理
│   │   └── index.js        # 导出
│   └── views/
│       └── SharedAPITestView.vue  # 测试页面
└── doc/
    ├── shared-api-test-guide.md    # 详细指南
    └── shared-api-implementation.md # 实现清单
```

