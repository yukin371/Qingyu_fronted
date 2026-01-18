# 页面开发指南

本文档说明如何开发页面组件，包括页面结构、路由配置、数据获取和状态管理。

## 页面 vs 组件

**页面组件（View）**：

- 对应一个路由
- 组合多个组件
- 处理页面级状态和逻辑
- 命名：`XxxView.vue`

**普通组件（Component）**：

- 可复用
- 只负责展示和交互
- 接收props，发出events

## 页面结构

### 基础页面模板

```vue
<template>
  <div class="home-view">
    <!-- 顶部 Banner -->
    <section class="home-view__banner">
      <BannerCarousel :banners="banners" :loading="loading" />
    </section>

    <!-- 推荐书籍 -->
    <section class="home-view__recommendations">
      <h2 class="section__title">推荐书籍</h2>
      <BookGrid 
        :books="recommendedBooks"
        :loading="loading"
        @book-click="handleBookClick"
      />
    </section>

    <!-- 榜单 -->
    <section class="home-view__rankings">
      <h2 class="section__title">热门榜单</h2>
      <RankingList 
        :rankings="rankings"
        @view-more="handleViewMore"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookstoreStore } from '@/stores/bookstore'
import { storeToRefs } from 'pinia'
import BannerCarousel from '@/components/BannerCarousel.vue'
import BookGrid from '@/components/BookGrid.vue'
import RankingList from '@/components/RankingList.vue'

/**
 * 首页
 */

const router = useRouter()
const bookstoreStore = useBookstoreStore()

// 从 store 获取响应式数据
const { banners, recommendedBooks, rankings, loading } = storeToRefs(bookstoreStore)

// 页面初始化
onMounted(async () => {
  await bookstoreStore.fetchHomepageData()
})

// 事件处理
const handleBookClick = (book) => {
  router.push(`/books/${book.id}`)
}

const handleViewMore = (type) => {
  router.push(`/rankings/${type}`)
}
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.home-view__banner {
  margin-bottom: 40px;
}

.home-view__recommendations,
.home-view__rankings {
  margin-bottom: 40px;
}

.section__title {
  font-size: 24px;
  margin-bottom: 20px;
}
</style>
```

## 数据获取

### 1. 使用 Pinia Store（推荐）

```vue
<script setup>
import { onMounted } from 'vue'
import { useBookstoreStore } from '@/stores/bookstore'
import { storeToRefs } from 'pinia'

const store = useBookstoreStore()
const { books, loading, error } = storeToRefs(store)

onMounted(async () => {
  try {
    await store.fetchBooks()
  } catch (err) {
    ElMessage.error('加载失败')
  }
})
</script>
```

### 2. 直接调用 API

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { bookstoreAPI } from '@/api/bookstore'
import { ElMessage } from 'element-plus'

const books = ref([])
const loading = ref(false)

const fetchBooks = async () => {
  loading.value = true
  try {
    const response = await bookstoreAPI.getBooks()
    books.value = response.data
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBooks()
})
</script>
```

### 3. 使用 Composable

```javascript
// composables/useBooks.js
import { ref } from 'vue'
import { bookstoreAPI } from '@/api/bookstore'

export function useBooks() {
  const books = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchBooks = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await bookstoreAPI.getBooks()
      books.value = response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    books,
    loading,
    error,
    fetchBooks
  }
}
```

在页面中使用：

```vue
<script setup>
import { onMounted } from 'vue'
import { useBooks } from '@/composables/useBooks'

const { books, loading, error, fetchBooks } = useBooks()

onMounted(() => {
  fetchBooks()
})
</script>
```

## 路由配置

### 基础路由

```javascript
// router/index.js
export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/books',
      name: 'Books',
      component: () => import('@/views/BooksView.vue'),
      meta: { title: '书籍列表' }
    }
  ]
})
```

### 动态路由

```javascript
{
  path: '/books/:id',
  name: 'BookDetail',
  component: () => import('@/views/BookDetailView.vue'),
  props: true,  // 将路由参数作为 props 传递
  meta: { title: '书籍详情' }
}
```

在页面中使用：

```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 方式1：接收 props
const props = defineProps({
  id: String
})

// 方式2：使用 useRoute
const route = useRoute()
const bookId = computed(() => route.params.id)
</script>
```

### 嵌套路由

```javascript
{
  path: '/user',
  component: () => import('@/views/UserLayout.vue'),
  children: [
    {
      path: 'profile',
      component: () => import('@/views/user/ProfileView.vue')
    },
    {
      path: 'settings',
      component: () => import('@/views/user/SettingsView.vue')
    }
  ]
}
```

## 页面状态管理

### 1. 本地状态（简单页面）

```vue
<script setup>
import { ref } from 'vue'

const currentTab = ref('recent')
const filters = ref({
  category: '',
  status: ''
})

const handleTabChange = (tab) => {
  currentTab.value = tab
}
</script>
```

### 2. Store 状态（复杂页面）

```vue
<script setup>
import { useBookstoreStore } from '@/stores/bookstore'
import { storeToRefs } from 'pinia'

const store = useBookstoreStore()
const { books, filters, currentPage } = storeToRefs(store)

const handleFilterChange = (newFilters) => {
  store.updateFilters(newFilters)
  store.fetchBooks()
}
</script>
```

## 加载状态

### 骨架屏

```vue
<template>
  <div v-if="loading" class="skeleton">
    <div class="skeleton__item" v-for="i in 6" :key="i"></div>
  </div>
  <div v-else class="content">
    <!-- 实际内容 -->
  </div>
</template>

<style scoped>
.skeleton__item {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

### 使用 Loading 组件

```vue
<template>
  <Loading v-if="loading" />
  <div v-else-if="error" class="error">
    {{ error }}
  </div>
  <div v-else class="content">
    <!-- 内容 -->
  </div>
</template>
```

## 错误处理

### 错误边界

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  errorMessage.value = err.message
  console.error('页面错误:', err, info)
  return false  // 阻止错误传播
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  // 重新获取数据
}
</script>

<template>
  <div v-if="hasError" class="error-page">
    <h2>出错了</h2>
    <p>{{ errorMessage }}</p>
    <button @click="retry">重试</button>
  </div>
  <div v-else>
    <!-- 正常内容 -->
  </div>
</template>
```

## 页面导航

### 编程式导航

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到指定路由
const goToDetail = (id) => {
  router.push(`/books/${id}`)
}

// 带查询参数
const goToSearch = (keyword) => {
  router.push({
    name: 'Search',
    query: { q: keyword }
  })
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 替换当前路由
const replaceRoute = () => {
  router.replace('/new-path')
}
</script>
```

### 路由守卫

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 离开页面前
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('有未保存的更改，确定离开？')
    if (!answer) return false
  }
})

// 路由更新（同一组件，参数变化）
onBeforeRouteUpdate(async (to, from) => {
  // 重新获取数据
  await fetchData(to.params.id)
})
</script>
```

## 页面性能优化

### 1. 懒加载

```javascript
// 路由懒加载
const routes = [
  {
    path: '/books',
    component: () => import('@/views/BooksView.vue')
  }
]
```

### 2. 预加载

```vue
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 预加载可能访问的页面
  router.push({ name: 'BookDetail' })
})
</script>
```

### 3. Keep-alive

```vue
<!-- App.vue 或父组件 -->
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="['HomeView', 'BooksView']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

## SEO 优化

### 设置页面标题

```vue
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

watch(
  () => route.meta.title,
  (title) => {
    document.title = title || '青羽书城'
  },
  { immediate: true }
)
</script>
```

### Meta 标签

```javascript
// router/index.js
{
  path: '/books/:id',
  component: () => import('@/views/BookDetailView.vue'),
  meta: {
    title: '书籍详情',
    description: '查看书籍详细信息',
    keywords: '书籍,阅读,小说'
  }
}
```

## 最佳实践

### 1. 页面组件只负责编排

```vue
<!-- ✅ 好的做法 -->
<template>
  <div class="books-view">
    <SearchBar @search="handleSearch" />
    <FilterPanel v-model="filters" />
    <BookGrid :books="books" />
    <Pagination v-model="page" :total="total" />
  </div>
</template>

<!-- ❌ 避免 -->
<template>
  <div class="books-view">
    <!-- 大量复杂的模板逻辑 -->
  </div>
</template>
```

### 2. 使用Composable提取逻辑

```javascript
// composables/useBookList.js
export function useBookList() {
  const books = ref([])
  const loading = ref(false)
  const filters = ref({})
  
  const fetchBooks = async () => {
    // 获取书籍逻辑
  }
  
  const updateFilters = (newFilters) => {
    filters.value = newFilters
    fetchBooks()
  }
  
  return {
    books,
    loading,
    filters,
    fetchBooks,
    updateFilters
  }
}
```

### 3. 统一错误处理

```vue
<script setup>
import { ElMessage } from 'element-plus'

const handleError = (error) => {
  console.error(error)
  ElMessage.error(error.message || '操作失败')
}

const fetchData = async () => {
  try {
    // 获取数据
  } catch (error) {
    handleError(error)
  }
}
</script>
```

## 参考资料

- [Vue Router](https://router.vuejs.org/)
- [状态管理](./state-management.md)
- [API集成](./api-integration.md)

---

**最后更新**：2025年10月17日
