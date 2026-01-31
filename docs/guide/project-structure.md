# 项目结构

本文档详细说明青羽书城前端项目的目录结构和文件组织方式。

## 目录结构

```
qingyu-frontend/
├── public/                    # 静态资源
│   ├── favicon.ico           # 网站图标
│   └── default-book-cover.jpg # 默认书籍封面
│
├── src/                      # 源代码
│   ├── api/                  # API接口层
│   │   ├── auth.ts          # 认证接口
│   │   ├── bookstore.ts     # 书城接口
│   │   ├── user.ts          # 用户接口
│   │   └── reading/         # 阅读相关接口
│   │
│   ├── assets/              # 资源文件
│   │   ├── images/          # 图片资源
│   │   ├── icons/           # 图标
│   │   └── styles/          # 全局样式
│   │
│   ├── components/          # 公共组件
│   │   ├── common/          # 通用组件
│   │   │   ├── Loading.vue
│   │   │   └── Empty.vue
│   │   ├── auth/            # 认证组件
│   │   ├── BannerCarousel.vue
│   │   ├── BookGrid.vue
│   │   └── RankingList.vue
│   │
│   ├── composables/         # 组合式函数
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useUtils.ts
│   │
│   ├── modules/             # 功能模块
│   │   └── writer/          # 写作端模块
│   │
│   ├── router/              # 路由配置
│   │   └── index.ts         # 路由定义
│   │
│   ├── stores/              # 状态管理
│   │   ├── auth.ts          # 认证状态
│   │   ├── bookstore.ts     # 书城状态
│   │   └── user.ts          # 用户状态
│   │
│   ├── utils/               # 工具函数
│   │   ├── request.ts       # HTTP请求工具
│   │   └── storage.ts       # 存储工具
│   │
│   ├── views/               # 页面组件
│   │   ├── HomeView.vue     # 首页
│   │   ├── RankingsView.vue # 榜单页
│   │   ├── BooksView.vue    # 书籍列表
│   │   ├── ProfileView.vue  # 个人中心
│   │   └── admin/           # 管理后台
│   │
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
│
├── tests/                   # 测试文件
│   ├── unit/               # 单元测试
│   └── e2e/                # 端到端测试
│
├── doc/                    # 项目文档
│
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── .eslintrc.ts           # ESLint配置
├── .prettierrc            # Prettier配置
├── .gitignore             # Git忽略文件
├── index.html             # HTML模板
├── package.tson           # 项目配置
├── vite.config.ts         # Vite配置
└── README.md              # 项目说明
```

## 目录说明

### `public/` - 静态资源

存放不需要构建处理的静态文件：

- 直接复制到构建输出目录
- 通过绝对路径访问：`/favicon.ico`
- 适合存放：图标、字体、第三方库等

### `src/api/` - API接口层

**职责**：封装后端API调用

```javascript
// api/bookstore.ts
import axios from 'axios'

export const bookstoreAPI = {
  getHomepage() {
    return axios.get('/bookstore/homepage')
  },
  
  getRanking(type, limit = 20) {
    return axios.get(`/bookstore/rankings/${type}`, {
      params: { limit }
    })
  }
}
```

**规范**：

- 按业务模块划分文件
- 统一导出API对象
- 使用async/await

### `src/components/` - 公共组件

**分类**：

- `common/` - 通用UI组件（Loading、Empty、Button等）
- `auth/` - 认证相关组件（登录表单、注册表单等）
- 其他 - 业务组件（BannerCarousel、BookGrid等）

**命名**：PascalCase（如 `BookCard.vue`）

### `src/composables/` - 组合式函数

可复用的逻辑封装：

```javascript
// composables/useAuth.ts
export function useAuth() {
  const isLoggedIn = ref(false)
  const user = ref(null)
  
  const login = async (credentials) => {
    // 登录逻辑
  }
  
  return { isLoggedIn, user, login }
}
```

### `src/router/` - 路由配置

```javascript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  // ... 更多路由
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

### `src/stores/` - 状态管理

使用 Pinia 管理全局状态：

```javascript
// stores/bookstore.ts
import { defineStore } from 'pinia'

export const useBookstoreStore = defineStore('bookstore', {
  state: () => ({
    homepageData: null,
    loading: false
  }),
  
  actions: {
    async fetchHomepage() {
      this.loading = true
      // ... 获取数据
    }
  }
})
```

### `src/utils/` - 工具函数

通用工具和辅助函数：

- `request.ts` - HTTP请求封装
- `storage.ts` - 本地存储封装
- `format.ts` - 格式化工具
- `validate.ts` - 验证工具

### `src/views/` - 页面组件

**命名**：PascalCase + View后缀（如 `HomeView.vue`）

**特点**：

- 一个文件对应一个路由
- 组合多个组件构成页面
- 处理页面级状态和逻辑

## 文件命名规范

### 组件文件

- **单文件组件**：PascalCase

  ```
  ✅ BookCard.vue
  ✅ UserProfile.vue
  ❌ bookCard.vue
  ❌ book-card.vue
  ```

### JS/TS文件

- **工具函数**：camelCase

  ```
  ✅ formatDate.ts
  ✅ apiRequest.ts
  ❌ FormatDate.ts
  ```

- **API文件**：camelCase

  ```
  ✅ bookstore.ts
  ✅ userAuth.ts
  ```

### 样式文件

```
✅ main.css
✅ variables.css
✅ reset.css
```

## 路径别名

项目配置了路径别名，方便导入：

```javascript
// vite.config.ts
export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}
```

**使用示例**：

```javascript
// ✅ 使用别名
import BookCard from '@/components/BookCard.vue'
import { useBookstore } from '@/stores/bookstore'

// ❌ 相对路径（不推荐）
import BookCard from '../../components/BookCard.vue'
```

## 导入顺序

推荐的导入顺序：

```javascript
// 1. Vue 核心
import { ref, computed } from 'vue'

// 2. 第三方库
import { ElMessage } from 'element-plus'

// 3. 组件
import BookCard from '@/components/BookCard.vue'

// 4. Composables
import { useAuth } from '@/composables/useAuth'

// 5. 工具函数
import { formatDate } from '@/utils/format'

// 6. 类型定义（如使用 TypeScript）
import type { Book } from '@/types'
```

## 模块化组织

### 功能模块示例

```
src/modules/writer/
├── api/                 # 模块专用API
├── components/          # 模块专用组件
│   └── editor/
├── stores/             # 模块状态
│   └── writerStore.ts
├── utils/              # 模块工具
└── views/              # 模块页面
    ├── EditorView.vue
    └── ProjectListView.vue
```

### 何时创建模块

当功能满足以下条件时，考虑创建独立模块：

- 功能相对独立
- 有专属的组件和状态
- 可能被多个页面使用
- 代码量较大

## 最佳实践

### 1. 保持扁平化

避免过深的目录嵌套：

```
❌ src/components/business/books/list/items/card/BookCard.vue
✅ src/components/BookCard.vue
```

### 2. 按功能而非类型

```
✅ 按功能：
modules/writer/
├── components/
├── stores/
└── api/

❌ 按类型：
components/writer/
stores/writer/
api/writer/
```

### 3. 使用 index.ts

```javascript
// components/common/index.ts
export { default as Loading } from './Loading.vue'
export { default as Empty } from './Empty.vue'

// 使用时
import { Loading, Empty } from '@/components/common'
```

### 4. README 文件

在关键目录添加 README.md：

```
api/README.md          # API模块说明
components/README.md   # 组件库说明
stores/README.md       # 状态管理说明
```

## 下一步

- 学习 [组件开发](./component-guide.md)
- 了解 [状态管理](./state-management.md)
- 查看 [API集成](./api-integration.md)

---

**最后更新**：2025年10月17日
