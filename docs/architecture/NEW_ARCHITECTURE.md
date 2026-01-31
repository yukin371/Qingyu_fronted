# 青羽前端架构 v2.0

## 架构概述

青羽前端采用现代化的分层模块化架构，基于 Vue 3 + TypeScript + Pinia 技术栈构建。

## 核心设计原则

1. **分层架构**: 清晰的四层架构（表现层、业务逻辑层、数据访问层、基础设施层）
2. **模块化**: 功能模块独立组织，高内聚低耦合
3. **服务化**: 业务逻辑从状态管理中分离到服务层
4. **类型安全**: 完整的 TypeScript 类型覆盖
5. **可扩展性**: 易于添加新功能和模块

## 目录结构

```
src/
├── core/                    # 核心基础设施
│   ├── config/             # 配置文件
│   │   ├── app.config.ts   # 应用配置
│   │   ├── api.config.ts   # API配置
│   │   └── constants.ts    # 常量定义
│   ├── services/           # 核心服务
│   │   ├── http.service.ts      # HTTP客户端
│   │   ├── storage.service.ts   # 存储服务
│   │   └── validation.service.ts # 验证服务
│   ├── types/              # 核心类型
│   │   ├── api.types.ts    # API类型
│   │   └── common.types.ts # 通用类型
│   └── utils/              # 核心工具

├── shared/                  # 共享资源
│   ├── components/         # 共享组件
│   │   ├── base/          # 基础UI组件
│   │   ├── common/        # 通用业务组件
│   │   └── layout/        # 布局组件
│   ├── composables/       # 组合函数
│   └── types/             # 共享类型
│
├── modules/                # 功能模块
│   ├── bookstore/         # 书城模块
│   │   ├── api/          # API层
│   │   ├── components/   # 组件
│   │   ├── services/     # 服务层（业务逻辑）
│   │   ├── stores/       # 状态管理
│   │   ├── types/        # 类型定义
│   │   ├── views/        # 页面
│   │   ├── routes.ts     # 路由配置
│   │   └── index.ts      # 模块导出
│   │
│   ├── reader/           # 阅读器模块
│   ├── writer/           # 写作模块
│   ├── user/             # 用户模块
│   └── admin/            # 管理模块
│
├── router/               # 路由系统
│   ├── index.ts         # 路由配置
│   └── guards.ts        # 路由守卫
│
├── App.vue              # 根组件
└── main.ts              # 入口文件
```

## 分层架构详解

### 1. 基础设施层 (Infrastructure Layer)

**位置**: `src/core/`

**职责**:
- 应用配置管理
- 核心服务（HTTP、存储、验证）
- 通用工具函数
- 基础类型定义

**示例**:
```typescript
// 使用HTTP服务
import { httpService } from '@core'
const data = await httpService.get('/api/endpoint')

// 使用存储服务
import { storageService } from '@core'
storageService.set('key', value, { ttl: 5 * 60 * 1000 })

// 使用验证服务
import { validationService } from '@core'
const result = validationService.validateEmail(email)
```

### 2. 数据访问层 (Data Access Layer)

**位置**: `src/modules/*/api/`

**职责**:
- 封装 HTTP 请求
- 定义 API 接口
- 处理请求参数和响应数据

**示例**:
```typescript
// src/modules/bookstore/api/bookstore.api.ts
export const bookstoreAPI = {
  async getHomepage(): Promise<HomepageData> {
    return httpService.get('/bookstore/homepage')
  },
  
  async getBookById(id: string): Promise<Book> {
    return httpService.get(`/bookstore/books/${id}`)
  }
}
```

### 3. 业务逻辑层 (Business Logic Layer)

**位置**: `src/modules/*/services/` 和 `src/modules/*/stores/`

#### 服务层 (Services)

**职责**:
- 复杂业务逻辑
- 数据转换和格式化
- 多个 API 的编排
- 缓存策略
- 验证和错误处理

**示例**:
```typescript
// src/modules/bookstore/services/bookstore.service.ts
class BookstoreService {
  async getHomepageData(): Promise<HomepageData> {
    // 检查缓存
    const cached = cacheUtil.get(CACHE_KEYS.HOMEPAGE_DATA)
    if (cached) return cached
    
    // 获取数据
    const data = await bookstoreAPI.getHomepage()
    
    // 缓存数据
    cacheUtil.set(CACHE_KEYS.HOMEPAGE_DATA, data, CACHE_TTL.SHORT)
    
    return data
  }
  
  async getBookDetail(bookId: string): Promise<Book> {
    const book = await bookstoreAPI.getBookById(bookId)
    
    // 后台增加浏览量
    this.incrementBookView(bookId).catch(console.error)
    
    return book
  }
}
```

#### 状态管理 (Stores)

**职责**:
- 管理应用状态
- 提供状态访问接口
- 协调服务层调用

**示例**:
```typescript
// src/modules/bookstore/stores/bookstore.store.ts
export const useBookstoreStore = defineStore('bookstore', {
  state: () => ({
    homepageData: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchHomepageData() {
      this.loading = true
      try {
        this.homepageData = await bookstoreService.getHomepageData()
      } catch (error) {
        this.error = '获取数据失败'
      } finally {
        this.loading = false
      }
    }
  }
})
```

### 4. 表现层 (Presentation Layer)

**位置**: `src/modules/*/views/` 和 `src/modules/*/components/`

**职责**:
- 页面组件
- 业务组件
- UI 交互
- 状态展示

**示例**:
```vue
<template>
  <div class="home-view">
    <LoadingComponent v-if="loading" />
    <ErrorComponent v-else-if="error" :message="error" />
    <HomepageContent v-else :data="homepageData" />
  </div>
</template>

<script setup lang="ts">
import { useBookstoreStore } from '@bookstore'

const bookstore = useBookstoreStore()

onMounted(() => {
  bookstore.fetchHomepageData()
})
</script>
```

## 功能模块详解

### 模块结构

每个功能模块遵循统一的结构:

```
modules/feature-name/
├── api/              # API调用
│   └── feature.api.ts
├── components/       # 功能组件
│   └── ComponentName.vue
├── services/         # 业务逻辑
│   └── feature.service.ts
├── stores/           # 状态管理
│   └── feature.store.ts
├── types/            # 类型定义
│   └── feature.types.ts
├── views/            # 页面视图
│   └── ViewName.vue
├── routes.ts         # 路由配置
└── index.ts          # 模块导出
```

### 模块列表

#### 1. Bookstore (书城模块)

**功能**: 书籍发现、浏览、搜索

**包含**:
- 首页展示
- 书籍列表
- 书籍详情
- 分类浏览
- 排行榜
- 搜索功能

#### 2. Reader (阅读器模块)

**功能**: 阅读体验、书架管理

**包含**:
- 章节阅读
- 阅读设置
- 书架管理
- 阅读历史
- 书签管理
- 评论评分

#### 3. Writer (写作模块)

**功能**: 内容创作

**包含**:
- 项目管理
- 编辑器
- 章节管理
- 数据统计
- 收入统计

#### 4. User (用户模块)

**功能**: 用户管理

**包含**:
- 认证登录
- 个人资料
- 账户设置
- 钱包管理

#### 5. Admin (管理模块)

**功能**: 后台管理

**包含**:
- 数据仪表板
- 内容审核
- 用户管理
- 提现审核
- 操作日志

## 路径别名

配置了模块化的路径别名，简化导入:

```typescript
// tsconfig.json & vite.config.js
{
  "@/*": ["./src/*"],
  "@core/*": ["./src/core/*"],
  "@shared/*": ["./src/shared/*"],
  "@bookstore/*": ["./src/modules/bookstore/*"],
  "@reader/*": ["./src/modules/reader/*"],
  "@writer/*": ["./src/modules/writer/*"],
  "@user/*": ["./src/modules/user/*"],
  "@admin/*": ["./src/modules/admin/*"]
}
```

**使用示例**:
```typescript
// 导入核心服务
import { httpService, storageService } from '@core'

// 导入模块功能
import { bookstoreService, useBookstoreStore } from '@bookstore'

// 导入共享组件
import BaseButton from '@shared/components/base/BaseButton.vue'
```

## 数据流

```
用户交互
  ↓
组件 (Component)
  ↓
Store Action
  ↓
Service (业务逻辑)
  ↓
API (HTTP请求)
  ↓
Service (数据处理)
  ↓
Store (更新状态)
  ↓
组件 (重新渲染)
```

## 最佳实践

### 1. 服务层使用

- 所有业务逻辑放在服务层
- 服务方法保持职责单一
- 使用缓存提升性能
- 统一错误处理

### 2. 状态管理

- Store 只管理状态
- 复杂逻辑委托给服务
- 使用 getters 派生状态
- 避免直接修改 state

### 3. 组件设计

- 保持组件纯粹（UI关注点）
- 使用组合式 API
- Props 和 Events 明确定义
- 合理使用组合函数

### 4. 类型安全

- 所有函数添加类型注解
- 避免使用 any
- 导出类型供外部使用
- 使用泛型增强灵活性

### 5. 代码组织

- 相关代码就近放置
- 模块职责清晰
- 避免循环依赖
- 公共代码提取到 shared

## 性能优化

### 1. 代码分割

- 路由级懒加载
- 组件异步加载
- 第三方库按需引入

### 2. 缓存策略

- 使用服务层缓存
- 配置合理的 TTL
- 定期清理过期缓存

### 3. 请求优化

- 请求去重
- 并发请求控制
- 请求取消机制

## 扩展指南

### 添加新模块

1. 创建模块目录结构
2. 实现服务层
3. 创建 API 函数
4. 定义类型
5. 创建 Store
6. 构建组件和视图
7. 配置路由
8. 导出模块API

### 添加新功能

1. 确定所属模块
2. 在服务层添加业务逻辑
3. 在 API 层添加接口调用
4. 在 Store 添加状态管理
5. 创建或更新组件
6. 更新路由配置

## 参考资料

- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vite 文档](https://vitejs.dev/)

---

**文档版本**: 2.0.0  
**最后更新**: 2025-10-25  
**维护者**: 前端架构团队

