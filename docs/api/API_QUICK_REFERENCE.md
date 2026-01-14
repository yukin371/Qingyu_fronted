# 🚀 API 导入快速参考

## 📍 三分钟快速上手

### ✅ 正确做法

**在 Service 层导入 API：**
```typescript
// src/modules/bookstore/services/bookstore.service.ts
import { bookstore } from '@/api'  // 推荐

class BookstoreService {
  async getHomepage() {
    return await bookstore.getHomepage()
  }
}
```

**在 Component 中使用 Service：**
```typescript
// src/modules/bookstore/views/HomeView.vue
import { bookstoreService } from '../services/bookstore.service'

export default {
  async setup() {
    const data = await bookstoreService.getHomepage()
    return { data }
  }
}
```

---

## ❌ 错误做法

```typescript
// ❌ 不要这样
import { getHomepage } from '@/api/bookstore'              // 错误：在 Component 导入 API
import { httpService } from '@/core/services/http.service'  // 错误：绕过 Service 层
import request from '@/utils/request'                       // 错误：旧的请求工具（已废弃）
```

---

## 🎯 API 模块速查表

| 模块 | 导入语句 | 场景 |
|-----|--------|------|
| 书城 | `import { bookstore } from '@/api'` | 书籍、分类、排行榜 |
| 阅读 | `import { reading } from '@/api'` | 章节、进度、评论 |
| 用户 | `import { user } from '@/api'` | 个人资料、安全 |
| 共享 | `import { shared } from '@/api'` | 认证、钱包、管理 |
| 写作 | `import { writing } from '@/api'` | AI、统计、收入 |
| 推荐 | `import { recommendation } from '@/api'` | 个性化推荐 |

---

## 🔧 常用方法

```typescript
// API Gateway（可选的高级用法）
import { apiGateway } from '@/core/services/api-gateway.service'

// 方式 1：直接调用
await apiGateway.bookstore.getHomepage()

// 方式 2：动态调用
await apiGateway.call('bookstore', 'getHomepage')

// 认证令牌管理
apiGateway.setAuthToken(token)
apiGateway.clearAuthToken()

// 取消所有请求
apiGateway.cancelAllRequests()
```

---

## 📂 文件位置

```
src/core/
├── services/
│   ├── http.service.ts              # HTTP 客户端
│   └── api-gateway.service.ts       # API 网关（新增）✨
├── config/
│   └── api.config.ts                # API 配置
└── API_IMPORT_GUIDE.md              # 详细规范（新增）✨

src/api/                             # 统一 API 目录
├── index.ts                         # 统一导出
├── bookstore/
├── reading/
├── user/
├── shared/
├── writing/
└── recommendation/
```

---

## 🎓 架构图

```
Vue Components
      ↓ 导入 Service
Service Layer
      ↓ 使用 API
API Layer (/api/)
      ↓ 调用
HTTP Service
      ↓ 真实请求
Backend API
```

---

## 💡 记住这些

✅ **Service 层** = 导入 API 的地方  
✅ **Component 层** = 调用 Service 的地方  
✅ **API 层** = 调用 httpService 的地方  
✅ **httpService** = 发起真实请求的地方  

❌ **不要** 在 Component 中直接导入 API  
❌ **不要** 在 Component 中使用 httpService  
❌ **不要** 使用 utils/request（已废弃）  

---

## 📚 详细文档

- 📖 [API 导入规范指南](src/core/API_IMPORT_GUIDE.md) - 完整规范
- 📖 [实现总结](src/core/API_GATEWAY_SUMMARY.md) - 详细总结
- 📖 [API 文档](src/api/README.md) - 各模块 API 说明

---

**快速链接**
- [API 网关服务](src/core/services/api-gateway.service.ts)
- [HTTP 服务](src/core/services/http.service.ts)
- [API 配置](src/core/config/api.config.ts)
