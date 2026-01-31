# 状态管理指南

本文档说明如何使用 Pinia 进行状态管理，包括 Store 设计、数据流和最佳实践。

## Pinia 简介

Pinia 是 Vue 3 官方推荐的状态管理库，具有以下优势：

- ✅ 类型安全
- ✅ 开发工具支持
- ✅ 模块化设计
- ✅ 更简洁的API

## Store 基础

### 创建 Store

```javascript
// stores/bookstore.js
import { defineStore } from 'pinia'
import { bookstoreAPI } from '@/api/bookstore'

export const useBookstoreStore = defineStore('bookstore', {
  // 状态
  state: () => ({
    books: [],
    currentBook: null,
    loading: false,
    error: null
  }),

  // 计算属性
  getters: {
    // 获取书籍数量
    bookCount: (state) => state.books.length,
    
    // 获取特定书籍
    getBookById: (state) => {
      return (id) => state.books.find(book => book.id === id)
    },
    
    // 过滤书籍
    featuredBooks: (state) => {
      return state.books.filter(book => book.featured)
    }
  },

  // 操作
  actions: {
    // 获取书籍列表
    async fetchBooks() {
      this.loading = true
      this.error = null
      
      try {
        const response = await bookstoreAPI.getBooks()
        this.books = response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取单个书籍
    async fetchBookById(id) {
      this.loading = true
      try {
        const response = await bookstoreAPI.getBookById(id)
        this.currentBook = response.data
      } finally {
        this.loading = false
      }
    },
    
    // 更新书籍
    updateBook(book) {
      const index = this.books.findIndex(b => b.id === book.id)
      if (index !== -1) {
        this.books[index] = book
      }
    },
    
    // 清除错误
    clearError() {
      this.error = null
    }
  }
})
```

### 在组件中使用

```vue
<script setup>
import { useBookstoreStore } from '@/stores/bookstore'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const bookstore = useBookstoreStore()

// 解构响应式状态（必须使用 storeToRefs）
const { books, loading, error } = storeToRefs(bookstore)

// 解构方法（不需要 storeToRefs）
const { fetchBooks, updateBook } = bookstore

// 使用计算属性
const bookCount = computed(() => bookstore.bookCount)

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>
    <p>共 {{ bookCount }} 本书</p>
    <div v-for="book in books" :key="book.id">
      {{ book.title }}
    </div>
  </div>
</template>
```

## State 状态设计

### 规范化状态

```javascript
state: () => ({
  // 实体数据
  entities: {
    books: {},      // { id: book }
    authors: {},
    categories: {}
  },
  
  // ID列表
  bookIds: [],
  
  // UI状态
  ui: {
    loading: {
      books: false,
      authors: false
    },
    errors: {},
    selectedId: null
  },
  
  // 分页
  pagination: {
    page: 1,
    size: 20,
    total: 0
  }
})
```

### 状态命名

```javascript
// ✅ 好的命名
books: []              // 数据列表
currentBook: null      // 当前项
loading: false         // 加载状态
isAuthenticated: false // 布尔标志

// ❌ 避免
data: []               // 太泛化
item: null             // 不明确
flag: false            // 不明确
```

## Getters 计算属性

### 基础 Getter

```javascript
getters: {
  // 简单计算
  bookCount: (state) => state.books.length,
  
  // 使用其他 getter
  hasBooks: (state) => state.bookCount > 0,
  
  // 返回函数（带参数）
  getBookById: (state) => {
    return (id) => state.books.find(book => book.id === id)
  }
}
```

### 访问其他 Store

```javascript
// stores/bookstore.js
import { useUserStore } from './user'

export const useBookstoreStore = defineStore('bookstore', {
  getters: {
    userBooks: (state) => {
      const userStore = useUserStore()
      return state.books.filter(book => 
        book.authorId === userStore.currentUser?.id
      )
    }
  }
})
```

## Actions 操作

### 异步操作

```javascript
actions: {
  async fetchBooks(params = {}) {
    const loadingKey = 'fetchBooks'
    
    this.ui.loading[loadingKey] = true
    this.ui.errors[loadingKey] = null
    
    try {
      const response = await bookstoreAPI.getBooks(params)
      
      // 规范化数据
      response.data.forEach(book => {
        this.entities.books[book.id] = book
      })
      
      this.bookIds = response.data.map(b => b.id)
      this.pagination = response.pagination
      
      return response.data
    } catch (error) {
      this.ui.errors[loadingKey] = error.message
      throw error
    } finally {
      this.ui.loading[loadingKey] = false
    }
  }
}
```

### 同步操作

```javascript
actions: {
  // 添加书籍
  addBook(book) {
    this.books.push(book)
  },
  
  // 删除书籍
  removeBook(id) {
    const index = this.books.findIndex(b => b.id === id)
    if (index !== -1) {
      this.books.splice(index, 1)
    }
  },
  
  // 更新书籍
  updateBook(id, updates) {
    const book = this.books.find(b => b.id === id)
    if (book) {
      Object.assign(book, updates)
    }
  },
  
  // 重置状态
  $reset() {
    this.books = []
    this.currentBook = null
    this.loading = false
    this.error = null
  }
}
```

## 多 Store 协作

### Store 之间调用

```javascript
// stores/cart.js
import { useBookstoreStore } from './bookstore'

export const useCartStore = defineStore('cart', {
  actions: {
    async addToCart(bookId) {
      const bookstore = useBookstoreStore()
      const book = bookstore.getBookById(bookId)
      
      if (book) {
        this.items.push({
          bookId,
          title: book.title,
          price: book.price
        })
      }
    }
  }
})
```

### 组合多个 Store

```vue
<script setup>
import { useBookstoreStore } from '@/stores/bookstore'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

const bookstore = useBookstoreStore()
const user = useUserStore()
const cart = useCartStore()

const addBookToCart = (bookId) => {
  if (!user.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  cart.addToCart(bookId)
}
</script>
```

## 持久化

### 使用插件

```javascript
// stores/index.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
```

### 配置持久化

```javascript
// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    userInfo: null
  }),
  
  // 持久化配置
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token', 'userInfo']  // 只持久化这些字段
  }
})
```

### 手动持久化

```javascript
// stores/bookstore.js
export const useBookstoreStore = defineStore('bookstore', {
  state: () => ({
    favorites: []
  }),
  
  actions: {
    // 添加收藏
    addFavorite(bookId) {
      this.favorites.push(bookId)
      this.saveFavorites()
    },
    
    // 保存到本地
    saveFavorites() {
      localStorage.setItem(
        'favorites',
        JSON.stringify(this.favorites)
      )
    },
    
    // 从本地加载
    loadFavorites() {
      const saved = localStorage.getItem('favorites')
      if (saved) {
        this.favorites = JSON.parse(saved)
      }
    }
  }
})
```

## 开发工具

### Vue DevTools

1. 安装 Vue DevTools 浏览器扩展
2. 打开开发者工具，找到 "Pinia" 标签
3. 可以查看：
   - 所有 Store 的状态
   - State 变化历史
   - 时间旅行调试

### 在代码中调试

```javascript
// 监听 store 变化
bookstore.$subscribe((mutation, state) => {
  console.log('Store 变化:', mutation.type, state)
})

// 监听 actions
bookstore.$onAction(({ name, args, after, onError }) => {
  console.log(`Action ${name} 开始`, args)
  
  after((result) => {
    console.log(`Action ${name} 完成`, result)
  })
  
  onError((error) => {
    console.error(`Action ${name} 失败`, error)
  })
})
```

## 最佳实践

### 1. 按功能模块划分 Store

```
stores/
├── auth.js         # 认证
├── bookstore.js    # 书城
├── user.js         # 用户
├── cart.js         # 购物车
└── index.js        # 导出所有 store
```

### 2. 保持 State 简单

```javascript
// ✅ 好的设计
state: () => ({
  books: [],
  filters: {
    category: '',
    status: ''
  }
})

// ❌ 避免
state: () => ({
  booksWithFiltersAndPagination: []
})
```

### 3. Actions 处理副作用

```javascript
// ✅ 在 actions 中处理 API 调用
actions: {
  async fetchBooks() {
    const response = await bookstoreAPI.getBooks()
    this.books = response.data
  }
}

// ❌ 不要在 组件中直接修改 state
// const books = useBookstoreStore().books
// books.push(newBook)  // 错误！
```

### 4. 使用 storeToRefs

```vue
<script setup>
import { storeToRefs } from 'pinia'

// ✅ 正确
const { books, loading } = storeToRefs(bookstore)

// ❌ 错误 - 失去响应性
const { books, loading } = bookstore
</script>
```

### 5. 错误处理

```javascript
actions: {
  async fetchBooks() {
    this.loading = true
    this.error = null
    
    try {
      const response = await bookstoreAPI.getBooks()
      this.books = response.data
    } catch (error) {
      this.error = error.message
      // 不要在这里显示通知，让组件处理
      throw error
    } finally {
      this.loading = false
    }
  }
}
```

## 常见问题

**Q: 什么时候使用 Store，什么时候使用组件状态？**

- 使用 Store：跨组件共享、需要持久化、复杂状态
- 使用组件状态：仅在组件内使用、简单UI状态

**Q: 如何重置 Store？**

```javascript
// 方式1：调用 $reset
bookstore.$reset()

// 方式2：自定义 reset 方法
actions: {
  reset() {
    this.books = []
    this.loading = false
    this.error = null
  }
}
```

**Q: 如何在 setup 外使用 Store？**

```javascript
// router/index.js
import { useUserStore } from '@/stores/user'

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})
```

## 参考资料

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [组件开发](./component-guide.md)
- [API集成](./api-integration.md)

---

**最后更新**：2025年10月17日
