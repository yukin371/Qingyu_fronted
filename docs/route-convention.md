# 路由规范文档

## 概述

本项目使用 `unplugin-vue-router` 实现约定式自动路由系统。

## 文件命名规范

### 页面文件

所有页面文件必须使用 `.page.vue` 扩展名，以确保只有页面文件会被识别为路由。

```
src/pages/
├── bookstore/
│   ├── index.page.vue        # → /bookstore
│   ├── books.page.vue        # → /bookstore/books
│   └── books/
│       └── [id].page.vue     # → /bookstore/books/:id
└── [...all].page.vue         # → 404 捕获
```

### 动态参数

使用 `[paramName]` 语法定义动态路由参数：

```vue
<!-- src/pages/user/[userId].page.vue -->
<template>
  <UserProfile :user-id="userId" />
</template>

<script setup lang="ts">
defineProps<{ userId: string }>()
</script>

<route lang="json5">
{
  name: 'user:profile',
  props: true,
  meta: { title: '用户资料' }
}
</route>
```

### 嵌套路由

使用目录结构创建嵌套路由：

```
src/pages/
├── reader/
│   └── [bookId]/
│       └── [chapterId].page.vue  # → /reader/:bookId/:chapterId
```

## 路由命名规范

采用 `模块:页面` 格式，确保全局唯一：

| 路由名称 | 路径 | 说明 |
|---------|------|------|
| `bookstore:home` | `/bookstore` | 书店首页 |
| `bookstore:books` | `/bookstore/books` | 书库列表 |
| `bookstore:book-detail` | `/bookstore/books/:id` | 书籍详情 |
| `user:profile` | `/user/profile` | 用户资料 |
| `reader:chapter` | `/reader/:bookId/:chapterId` | 阅读器 |

## 路由元数据

在 `<route>` 块中定义路由元数据：

```vue
<route lang="json5">
{
  name: 'bookstore:books',
  meta: {
    title: '书库',
    requiresAuth: false,
    layout: 'main',
    roles: [],
    keepAlive: false,
    hidden: false
  }
}
</route>
```

### 元数据字段说明

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | - | 页面标题 |
| `requiresAuth` | `boolean` | `false` | 是否需要登录 |
| `roles` | `string[]` | `[]` | 允许的角色列表 |
| `layout` | `'blank' \| 'main' \| 'writer'` | `'main'` | 使用的布局 |
| `keepAlive` | `boolean` | `false` | 是否缓存组件 |
| `hidden` | `boolean` | `false` | 是否在菜单中隐藏 |

## 动态参数处理

### 使用 props 传递参数

推荐使用 `props: true` 让路由参数自动作为组件 props 传递：

```vue
<script setup lang="ts">
// ✅ 推荐：使用 props
defineProps<{ id: string }>()
</script>

<route lang="json5">
{
  props: true
}
</route>
```

### 在组件中使用参数

```vue
<template>
  <div>
    <h1>书籍 ID: {{ id }}</h1>
  </div>
</template>

<script setup lang="ts">
defineProps<{ id: string }>()
</script>
```

## 布局系统

### 可用布局

- **main** - 主布局（默认），包含头部导航和底部
- **writer** - 作者布局，包含作者侧边栏
- **blank** - 空白布局，无额外包装

### 指定布局

```vue
<route lang="json5">
{
  meta: { layout: 'writer' }
}
</route>
```

### 创建新布局

在 `src/layouts/` 下创建布局文件：

```vue
<!-- src/layouts/custom.vue -->
<template>
  <div class="custom-layout">
    <slot />
  </div>
</template>
```

## 类型安全的导航

### 使用 router.push

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// ✅ 类型安全
router.push({
  name: 'bookstore:book-detail',
  params: { id: '123' }
})

// ❌ 类型不安全（字符串路径）
router.push('/bookstore/books/123')
```

### 使用 RouterLink

```vue
<template>
  <!-- ✅ 类型安全 -->
  <RouterLink :to="{ name: 'bookstore:book-detail', params: { id: book.id } }">
    {{ book.title }}
  </RouterLink>

  <!-- ❌ 类型不安全 -->
  <RouterLink to="/bookstore/books/123">
    {{ book.title }}
  </RouterLink>
</template>
```

## 最佳实践

1. **始终使用 .page.vue 扩展名** - 确保只有页面文件被识别为路由
2. **使用路由名称而非路径** - 获得类型安全和 IDE 智能提示
3. **使用 props: true** - 提高组件可测试性和类型安全性
4. **遵循命名规范** - 使用 `模块:页面` 格式
5. **合理使用元数据** - 设置适当的权限、布局和标题
6. **保持页面文件简洁** - 页面文件只负责路由，业务逻辑在 views 中

## 迁移指南

### 将现有模块迁移到自动路由

1. 在 `src/pages/` 下创建对应的目录结构
2. 为每个路由创建 `.page.vue` 文件
3. 在页面文件中引入对应的 view 组件
4. 添加 `<route>` 块配置路由元数据
5. 从 `src/router/index.ts` 移除旧的路由导入
6. 删除废弃的 `routes.ts` 文件

### 示例

```vue
<!-- src/pages/bookstore/books.page.vue -->
<template>
  <BooksView />
</template>

<script setup lang="ts">
import BooksView from '@/modules/bookstore/views/BooksView.vue'
</script>

<route lang="json5">
{
  name: 'bookstore:books',
  meta: {
    title: '书库',
    requiresAuth: false
  }
}
</route>
```

## 故障排查

### 路由不生效

1. 确认文件使用 `.page.vue` 扩展名
2. 确认文件在 `src/pages/` 目录下
3. 重启开发服务器
4. 检查 `typed-router.d.ts` 是否已更新

### 类型提示不工作

1. 确认 `tsconfig.json` 包含 `typed-router.d.ts`
2. 确认 `env.d.ts` 包含 `unplugin-vue-router/client` 类型引用
3. 重启 TypeScript 语言服务
4. 确认使用 Volar 而非 Vetur

### 构建失败

1. 检查是否有重复的路由名称
2. 确认所有页面文件的语法正确
3. 检查 `<route>` 块的 JSON5 语法

## 参考资料

- [unplugin-vue-router 官方文档](https://uvr.esm.is/)
- [Vue Router 官方文档](https://router.vuejs.org/)
- [vite-plugin-vue-layouts 文档](https://github.com/JohnCampionJr/vite-plugin-vue-layouts)
