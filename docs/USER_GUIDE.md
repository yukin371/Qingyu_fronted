# 青羽写作平台 - 使用指南

本指南面向开发者和用户，介绍如何使用青羽写作平台进行开发和日常使用。

## 目录

- [快速开始](#快速开始)
- [开发者指南](#开发者指南)
- [功能模块说明](#功能模块说明)
- [用户使用指南](#用户使用指南)
- [API调用指南](#api调用指南)
- [常见问题](#常见问题)

---

## 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **后端**: Go 1.21+ (如需启动完整服务)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd 青羽
```

2. **安装前端依赖**
```bash
cd Qingyu_fronted
npm install
```

3. **配置环境变量**
```bash
# 开发环境使用默认配置即可
cp .env.example .env.development
```

4. **启动开发服务器**
```bash
# 只启动前端（使用Mock数据）
npm run dev

# 或启动完整服务（前端+后端）
# 终端1: 启动后端
cd ../Qingyu_backend
go run cmd/server/main.go

# 终端2: 启动前端
cd Qingyu_fronted
npm run dev
```

5. **访问应用**
```
前端地址: http://localhost:5173
后端API: http://localhost:8080
```

---

## 开发者指南

### 项目结构

```
Qingyu_fronted/
├── src/
│   ├── core/              # 核心服务
│   │   ├── services/      # HTTP服务、错误处理等
│   │   └── types/         # TypeScript类型定义
│   ├── modules/           # 业务模块
│   │   ├── bookstore/     # 书店模块
│   │   ├── reader/        # 阅读器模块
│   │   ├── writer/        # 写作模块
│   │   ├── user/          # 用户模块
│   │   ├── social/        # 社交模块
│   │   ├── finance/       # 财务模块
│   │   ├── notification/  # 通知模块
│   │   ├── admin/         # 管理模块
│   │   ├── ai/            # AI模块
│   │   └── shared/        # 共享模块（认证、存储等）
│   ├── stores/            # Pinia状态管理
│   ├── router/            # Vue Router路由
│   ├── views/             # 页面视图
│   ├── components/        # 公共组件
│   ├── directives/        # Vue指令
│   ├── utils/             # 工具函数
│   └── styles/            # 全局样式
├── docs/                  # 文档
├── scripts/               # 部署脚本
└── public/                # 静态资源
```

### 模块化开发

每个业务模块都是独立的，包含自己的API、组件和路由：

**添加新模块：**
```bash
src/modules/your-module/
├── api/                   # API接口
│   └── index.ts
├── components/            # 模块组件
├── views/                 # 模块视图
├── stores/                # 模块状态（可选）
└── types.ts               # 模块类型定义
```

**模块API开发示例：**
```typescript
// src/modules/your-module/api/index.ts
import { httpService } from '@/core/services/http.service'

export function getData(params?: any) {
  return httpService.get<DataType>('/your-module/data', { params })
}

export function createData(data: any) {
  return httpService.post<DataType>('/your-module/data', data)
}
```

**使用模块API：**
```vue
<script setup lang="ts">
import { getData } from '@your-module/api'

const data = ref([])

onMounted(async () => {
  data.value = await getData()
})
</script>
```

### 路由配置

路由采用模块化结构，每个模块管理自己的路由：

```typescript
// src/modules/your-module/router/index.ts
export default [
  {
    path: '/your-module',
    name: 'your-module',
    component: () => import('../views/YourModuleView.vue'),
    meta: { title: '你的模块', requiresAuth: true }
  }
]
```

### 状态管理

使用Pinia进行状态管理：

```typescript
// src/stores/your-store.ts
import { defineStore } from 'pinia'

export const useYourStore = defineStore('your', () => {
  const state = ref({})
  const getters = computed(() => {})
  const actions = {
    async fetchData() {
      // ...
    }
  }

  return { state, getters, ...actions }
})
```

### 代码规范

**组件命名：**
- PascalCase: `BookDetailView.vue`
- 组件内使用 Composition API + `<script setup>`

**API调用：**
- 统一使用 `httpService`
- 不要直接使用 axios
- 使用 TypeScript 类型定义

**错误处理：**
- 使用 `ElMessage` 显示错误
- 不要使用 `console.error`（生产环境会被移除）

**样式：**
- 使用 SCSS
- 遵循 BEM 命名规范
- 模块化样式文件

### 调试技巧

1. **Vue DevTools**
   - 安装浏览器扩展
   - 开发环境自动启用

2. **API健康检查**
   - 启动时自动检查后端连接
   - 查看控制台输出

3. **性能监控**
   - 首屏渲染时间
   - 页面性能指标（开发环境自动输出）

4. **网络请求调试**
   - 浏览器 Network 标签
   - 查看请求/响应详情

---

## 功能模块说明

### 1. 书店模块 (Bookstore)

**功能：**
- 书籍浏览和搜索
- 书籍详情查看
- 分类浏览
- 推荐书籍

**主要页面：**
- 首页 (`/`) - 精选书籍推荐
- 分类页 (`/books/category/:id`) - 按分类浏览
- 搜索页 (`/books/search`) - 搜索功能
- 详情页 (`/books/:id`) - 书籍详情

**API示例：**
```typescript
import { getBookDetail, getBookList } from '@bookstore/api'

const book = await getBookDetail('book-id')
const books = await getBookList({ page: 1, pageSize: 20 })
```

### 2. 阅读器模块 (Reader)

**功能：**
- 书架管理
- 章节阅读
- 阅读进度保存
- 书签管理
- 评论和点赞
- 阅读设置（字体、主题等）

**主要页面：**
- 书架 (`/bookshelf`) - 我的书架
- 阅读器 (`/reader/:bookId/:chapterId`) - 章节阅读
- 阅读历史 (`/reading/history`) - 阅读记录

**核心功能：**
```typescript
import {
  getBookshelf,
  addToBookshelf,
  getChapterContent,
  saveReadingProgress
} from '@reader/api'

// 添加到书架
await addToBookshelf('book-id')

// 获取章节内容
const chapter = await getChapterContent('book-id', 'chapter-id')

// 保存阅读进度
await saveReadingProgress({
  bookId: 'book-id',
  chapterId: 'chapter-id',
  position: 1234
})
```

### 3. 写作模块 (Writer)

**功能：**
- 作品管理
- 章节编辑
- 发布管理
- 稿费统计
- 数据分析

**主要页面：**
- 作品管理 (`/writer/works`) - 管理我的作品
- 章节编辑 (`/writer/editor/:bookId`) - 编辑章节
- 发布管理 (`/writer/publish`) - 发布和审核
- 数据统计 (`/writer/stats`) - 收入和阅读数据

**写作流程：**
1. 创建作品
2. 添加章节
3. 编辑内容（支持Markdown）
4. 保存草稿
5. 提交审核
6. 查看审核状态

### 4. 社交模块 (Social)

**功能：**
- 书单管理
- 关注作者
- 消息通知
- 评论和点赞
- 收藏分享

**主要页面：**
- 书单 (`/booklists`) - 发现书单
- 关注 (`/following`) - 我的关注
- 消息 (`/messages`) - 消息中心
- 评论 (`/comments`) - 我的评论

### 5. 用户模块 (User)

**功能：**
- 注册登录
- 个人资料
- 账户安全
- 会员订阅
- 作者认证

**主要页面：**
- 登录注册 (`/auth`) - 认证
- 个人中心 (`/account`) - 个人信息
- 会员中心 (`/vip`) - 会员服务
- 作者认证 (`/author/apply`) - 成为作者

---

## 用户使用指南

### 新手入门

#### 第一步：注册账号

1. 访问 `http://localhost:5173/auth?mode=register`
2. 填写用户信息：
   - 用户名（3-20个字符）
   - 邮箱
   - 密码（6-20个字符）
3. 点击"注册"
4. 系统自动登录

#### 第二步：浏览书店

1. 首页查看推荐书籍
2. 使用搜索功能查找感兴趣的书籍
3. 点击书籍封面查看详情

#### 第三步：开始阅读

1. 在书籍详情页点击"开始阅读"
2. 自动添加到书架
3. 进入阅读器
4. 使用阅读设置调整字体和主题

#### 第四步：成为作者（可选）

1. 访问个人中心
2. 点击"成为作者"
3. 填写作者信息
4. 提交审核
5. 审核通过后开始创作

### 日常使用

**阅读书籍：**
- 访问书架查看所有正在阅读的书籍
- 点击继续阅读
- 阅读进度自动保存

**管理书架：**
- 支持批量操作（移动分类、导出、删除）
- 创建自定义分类
- 搜索书架中的书籍

**写作发布：**
- 在作品管理页面创建新作品
- 添加章节并编辑内容
- 保存草稿或提交审核
- 查看审核状态和反馈

**社交互动：**
- 关注喜欢的作者
- 创建和分享书单
- 对章节进行评论
- 点赞和支持作品

---

## API调用指南

### HTTP服务

项目使用统一的HTTP服务 (`httpService`)：

```typescript
import { httpService } from '@/core/services/http.service'

// GET请求
const data = await httpService.get<DataType>('/api/endpoint', { params })

// POST请求
const result = await httpService.post<ResultType>('/api/endpoint', data)

// PUT请求
const updated = await httpService.put<DataType>('/api/endpoint/:id', data)

// DELETE请求
await httpService.delete('/api/endpoint/:id')
```

### 请求配置

```typescript
// 启用重试
await httpService.get('/api/data', { retry: 3, retryDelay: 1000 })

// 静默模式（不显示错误提示）
await httpService.post('/api/data', data, { silent: true })

// 返回完整响应（包含headers等）
const response = await httpService.get('/api/data', { returnFullResponse: true })

// 跳过错误处理
await httpService.get('/api/data', { skipErrorHandler: true })

// 防抖/去重
await httpService.get('/api/data', { deduplicate: true })
```

### 错误处理

```typescript
try {
  const data = await apiCall()
} catch (error: any) {
  // error.code - 错误代码
  // error.message - 错误消息
  ElMessage.error(error.message)
}
```

### 完整示例

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getBookList, type Book } from '@bookstore/api'
import { ElMessage } from 'element-plus'

const books = ref<Book[]>([])
const loading = ref(false)

const fetchBooks = async () => {
  loading.value = true
  try {
    const response = await getBookList({
      page: 1,
      pageSize: 20
    })
    books.value = response.items
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <div v-loading="loading">
    <div v-for="book in books" :key="book.id">
      {{ book.title }}
    </div>
  </div>
</template>
```

---

## 常见问题

### 开发相关

**Q: 如何修改API地址？**
A: 编辑 `.env.development` 文件中的 `VITE_API_BASE_URL`

**Q: 如何添加新的路由？**
A: 在对应模块的 `router/index.ts` 中添加路由配置

**Q: 如何调试API请求？**
A: 打开浏览器开发者工具 → Network标签，查看请求详情

**Q: 构建失败怎么办？**
A:
1. 检查Node.js版本（>= 18.0.0）
2. 删除 `node_modules` 和 `package-lock.json`
3. 重新安装依赖：`npm install`

**Q: 如何启用Mock数据？**
A: 在 `.env.development` 中设置 `VITE_ENABLE_MOCK=true`

### 使用相关

**Q: 阅读进度不保存？**
A: 确保已登录，阅读进度需要登录才能保存

**Q: 如何成为作者？**
A: 个人中心 → 成为作者 → 填写信息 → 提交审核

**Q: 章节审核需要多久？**
A: 通常1-3个工作日，可在发布管理页面查看进度

**Q: 如何导出书架？**
A: 书架页面 → 选择书籍 → 导出书单 → 选择格式

**Q: 评论被删除了？**
A: 评论可能违反社区规范，请遵守社区准则

---

## 相关文档

- [API连接配置指南](./api-connection-guide.md) - 环境配置和部署
- [部署指南](./deployment-guide.md) - 生产环境部署
- [API文档](../README.md#API) - 后端API接口
- [测试指南](../TESTING_GUIDE.md) - 功能测试验证

---

## 更新日志

- **2025-01-14**: 创建使用指南
- 完善开发者指南
- 添加功能模块说明
- 添加用户使用指南
- 添加API调用指南
