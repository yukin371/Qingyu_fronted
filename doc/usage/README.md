# 使用指南文档导航

## 📋 概述

本目录包含青羽书城前端的使用指南文档，帮助开发者快速上手和使用项目中的各种功能和组件。

## 📁 文档列表

### 🚀 快速开始
- [快速开始](./快速开始.md) - 项目快速启动和基本使用
- [项目概览](./项目概览.md) - 项目整体介绍和功能概览

### 🧩 组件使用
- [组件使用指南](./组件使用指南.md) - 各组件的详细使用方法
- [组件API参考](./组件API参考.md) - 组件属性、事件、插槽参考

### 🔌 API使用
- [API使用指南](./API使用指南.md) - API调用方法和示例
- [状态管理使用](./状态管理使用.md) - Pinia状态管理使用说明

### 🎨 主题定制
- [主题定制指南](./主题定制指南.md) - 主题颜色和样式定制
- [组件样式覆盖](./组件样式覆盖.md) - 如何覆盖组件样式

### 🔧 工具使用
- [插件使用指南](./插件使用指南.md) - 项目中使用的插件说明
- [工具函数使用](./工具函数使用.md) - 常用工具函数使用

### ❓ 帮助文档
- [常见问题FAQ](./常见问题FAQ.md) - 常见问题解答
- [故障排除](./故障排除.md) - 问题排查和解决方案

### 📚 示例代码
- [基础示例](./examples/基础示例.md) - 基础功能使用示例
- [高级示例](./examples/高级示例.md) - 高级功能使用示例
- [完整应用示例](./examples/完整应用示例.md) - 完整应用开发示例

## 🚀 快速开始

### 安装和启动

```bash
# 1. 克隆项目
git clone <repository-url>
cd Qingyu

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
# http://localhost:5173
```

### 项目结构

```
Qingyu/
├── src/
│   ├── api/          # API接口
│   ├── assets/       # 静态资源
│   ├── components/   # 公共组件
│   ├── router/       # 路由配置
│   ├── stores/       # 状态管理
│   ├── utils/        # 工具函数
│   ├── views/        # 页面组件
│   ├── App.vue       # 根组件
│   └── main.js       # 入口文件
├── public/           # 公共资源
└── package.json      # 项目配置
```

## 🧩 组件使用示例

### BookCard组件

```vue
<template>
  <BookCard 
    :book="book"
    :show-author="true"
    @click="handleBookClick"
  />
</template>

<script setup>
import BookCard from '@/components/BookCard.vue'

const book = {
  id: '1',
  title: '示例书籍',
  author: '示例作者',
  cover: '/images/book.jpg'
}

const handleBookClick = (book) => {
  console.log('点击了书籍:', book)
}
</script>
```

### BookGrid组件

```vue
<template>
  <BookGrid 
    :books="books"
    :loading="loading"
    :columns="4"
    @book-click="handleBookClick"
    @load-more="handleLoadMore"
  />
</template>

<script setup>
import { ref } from 'vue'
import BookGrid from '@/components/BookGrid.vue'

const books = ref([])
const loading = ref(false)

const handleBookClick = (book) => {
  // 处理点击
}

const handleLoadMore = () => {
  // 加载更多
}
</script>
```

## 🔌 API使用示例

### 调用书城API

```javascript
import { bookstoreAPI } from '@/api/bookstore'

// 获取首页数据
const getHomepageData = async () => {
  try {
    const response = await bookstoreAPI.getHomepage()
    console.log('首页数据:', response.data)
  } catch (error) {
    console.error('获取失败:', error)
  }
}

// 获取榜单数据
const getRankings = async () => {
  try {
    const response = await bookstoreAPI.getRealtimeRanking(20)
    console.log('榜单数据:', response.data)
  } catch (error) {
    console.error('获取失败:', error)
  }
}
```

### 使用Pinia状态管理

```javascript
import { useBookstoreStore } from '@/stores/bookstore'

// 在组件中使用
const bookstore = useBookstoreStore()

// 获取状态
console.log(bookstore.homepageData)

// 调用action
await bookstore.fetchHomepageData()

// 使用getter
console.log(bookstore.getHomepageBanners)
```

## 🎨 主题定制

### 自定义主题颜色

```css
/* 在全局样式中定义CSS变量 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
}

/* 使用主题颜色 */
.custom-button {
  background-color: var(--primary-color);
}
```

### 覆盖Element Plus主题

```javascript
// main.js
import ElementPlus from 'element-plus'

app.use(ElementPlus, {
  // 自定义主题配置
})
```

## 🔧 常用工具

### 日期格式化

```javascript
import { formatDate } from '@/utils/date'

const formattedDate = formatDate(new Date(), 'YYYY-MM-DD')
console.log(formattedDate) // 2025-10-13
```

### 本地存储

```javascript
import storage from '@/utils/storage'

// 保存数据
storage.set('user', { name: '张三' })

// 获取数据
const user = storage.get('user')

// 删除数据
storage.remove('user')
```

## ❓ 常见问题

### Q1: 如何添加新页面？

```javascript
// 1. 在views目录创建页面组件
// views/NewPage.vue

// 2. 在router配置中添加路由
{
  path: '/new-page',
  component: () => import('@/views/NewPage.vue')
}
```

### Q2: 如何调用API接口？

```javascript
// 1. 在api目录创建API文件
// api/myapi.js
export const myAPI = {
  getData() {
    return api.get('/data')
  }
}

// 2. 在组件中使用
import { myAPI } from '@/api/myapi'
const data = await myAPI.getData()
```

### Q3: 如何使用状态管理？

```javascript
// 1. 创建store
// stores/mystore.js
export const useMyStore = defineStore('my', {
  state: () => ({ data: null }),
  actions: {
    async fetchData() {
      // 获取数据
    }
  }
})

// 2. 在组件中使用
import { useMyStore } from '@/stores/mystore'
const myStore = useMyStore()
```

## 🔗 相关文档

- [项目开发规范](../项目开发规范.md) - 开发规范和约定
- [组件设计文档](../design/components/) - 组件详细设计
- [API文档](../api/) - 接口文档
- [实施指南](../implementation/) - 开发指南

---

**最后更新**：2025年10月13日

