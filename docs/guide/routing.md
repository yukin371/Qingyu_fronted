# 路由配置指南

本文档说明如何配置和使用Vue Router，包括路由定义、导航守卫和最佳实践。

## 路由配置

### 基础路由

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: '首页'
      }
    },
    {
      path: '/books',
      name: 'Books',
      component: () => import('@/views/BooksView.vue'),
      meta: {
        title: '书籍列表'
      }
    }
  ]
})

export default router
```

### 动态路由

```javascript
{
  path: '/books/:id',
  name: 'BookDetail',
  component: () => import('@/views/BookDetailView.vue'),
  props: true,  // 将路由参数作为props传递
  meta: {
    title: '书籍详情'
  }
}
```

在组件中获取参数：

```vue
<script setup>
// 方式1：通过props
const props = defineProps({
  id: String
})

// 方式2：使用useRoute
import { useRoute } from 'vue-router'
const route = useRoute()
const id = computed(() => route.params.id)
</script>
```

### 嵌套路由

```javascript
{
  path: '/user',
  component: () => import('@/views/UserLayout.vue'),
  children: [
    {
      path: '',  // /user
      redirect: '/user/profile'
    },
    {
      path: 'profile',  // /user/profile
      component: () => import('@/views/user/ProfileView.vue')
    },
    {
      path: 'settings',  // /user/settings
      component: () => import('@/views/user/SettingsView.vue')
    }
  ]
}
```

Layout组件：

```vue
<template>
  <div class="user-layout">
    <aside class="sidebar">
      <router-link to="/user/profile">个人资料</router-link>
      <router-link to="/user/settings">设置</router-link>
    </aside>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>
```

## 编程式导航

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转
const goToDetail = (id) => {
  router.push(`/books/${id}`)
}

// 带查询参数
const goToSearch = (keyword) => {
  router.push({
    name: 'Search',
    query: { q: keyword, page: 1 }
  })
}

// 替换（不留历史记录）
const replaceRoute = () => {
  router.replace('/new-path')
}

// 前进/后退
const goBack = () => router.back()
const goForward = () => router.forward()
const go = (n) => router.go(n)  // n可正可负
</script>
```

## 路由守卫

### 全局前置守卫

```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '青羽书城'

  // 权限检查
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      next('/login')
      return
    }
  }

  next()
})
```

### 全局后置守卫

```javascript
router.afterEach((to, from) => {
  // 页面访问统计
  console.log(`从 ${from.path} 到 ${to.path}`)
})
```

### 路由独享守卫

```javascript
{
  path: '/admin',
  component: () => import('@/views/AdminView.vue'),
  beforeEnter: (to, from, next) => {
    const userStore = useUserStore()
    if (userStore.isAdmin) {
      next()
    } else {
      next('/403')
    }
  }
}
```

### 组件内守卫

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 离开当前路由前
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('有未保存的更改，确定离开？')
    if (!answer) return false
  }
})

// 路由更新（参数变化）
onBeforeRouteUpdate(async (to, from) => {
  await fetchData(to.params.id)
})
</script>
```

## 路由Meta

```javascript
{
  path: '/admin',
  meta: {
    title: '管理后台',
    requiresAuth: true,
    roles: ['admin'],
    keepAlive: true,
    breadcrumb: ['首页', '管理后台']
  }
}
```

使用meta：

```javascript
router.beforeEach((to) => {
  // 检查权限
  if (to.meta.requiresAuth) {
    // ...
  }

  // 设置标题
  document.title = to.meta.title

  // 角色检查
  if (to.meta.roles) {
    // ...
  }
})
```

## 路由懒加载

### 基础懒加载

```javascript
{
  path: '/books',
  component: () => import('@/views/BooksView.vue')
}
```

### 分组懒加载

```javascript
{
  path: '/admin',
  component: () => import(/* webpackChunkName: "admin" */ '@/views/AdminView.vue')
}
```

## 滚动行为

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回上一页时恢复位置
    if (savedPosition) {
      return savedPosition
    }
    
    // 有锚点时滚动到锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // 默认滚动到顶部
    return { top: 0 }
  }
})
```

## 路由过渡

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## Keep-alive

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="['HomeView', 'BooksView']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

## 动态路由

### 添加路由

```javascript
// 添加单个路由
router.addRoute({
  path: '/about',
  component: () => import('@/views/AboutView.vue')
})

// 添加嵌套路由
router.addRoute('User', {
  path: 'posts',
  component: () => import('@/views/user/PostsView.vue')
})
```

### 删除路由

```javascript
// 通过名称删除
router.removeRoute('About')

// 通过添加同名路由覆盖
router.addRoute({ path: '/about', name: 'About', component: NewAbout })
router.addRoute({ path: '/about', name: 'About', component: OverrideAbout })
```

## 路由命名视图

```vue
<!-- Layout.vue -->
<template>
  <div>
    <router-view name="sidebar" />
    <router-view />
    <router-view name="footer" />
  </div>
</template>
```

```javascript
{
  path: '/dashboard',
  components: {
    default: Dashboard,
    sidebar: Sidebar,
    footer: Footer
  }
}
```

## 路由别名

```javascript
{
  path: '/books',
  alias: ['/library', '/reading'],
  component: BooksView
}
```

## 最佳实践

### 1. 使用命名路由

```javascript
// ✅ 推荐
router.push({ name: 'BookDetail', params: { id: '123' } })

// ❌ 避免
router.push(`/books/${id}`)
```

### 2. 路由参数验证

```javascript
{
  path: '/books/:id',
  beforeEnter: (to) => {
    if (!/^\d+$/.test(to.params.id)) {
      return '/404'
    }
  }
}
```

### 3. 统一错误页面

```javascript
{
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/error/NotFound.vue')
}
```

### 4. 路由模块化

```javascript
// router/modules/book.js
export default [
  {
    path: '/books',
    component: () => import('@/views/BooksView.vue')
  },
  {
    path: '/books/:id',
    component: () => import('@/views/BookDetailView.vue')
  }
]

// router/index.js
import bookRoutes from './modules/book'

const routes = [
  ...bookRoutes,
  // ...
]
```

## 常见问题

**Q: 如何刷新当前页面？**

```javascript
// 方式1：重新导航
router.push({ name: route.name, params: route.params, query: { ...route.query, _t: Date.now() } })

// 方式2：使用key
<router-view :key="$route.fullPath" />
```

**Q: 如何获取上一个路由？**

```javascript
router.beforeEach((to, from, next) => {
  // from 就是上一个路由
  console.log('从', from.path, '到', to.path)
  next()
})
```

**Q: 如何实现路由缓存？**

```vue
<keep-alive :include="cachedViews">
  <router-view />
</keep-alive>

<script setup>
const cachedViews = ref(['HomeView', 'BooksView'])
</script>
```

## 参考资料

- [Vue Router 官方文档](https://router.vuejs.org/)
- [页面开发](./page-guide.md)
- [导航守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html)

---

**最后更新**：2025年10月17日
