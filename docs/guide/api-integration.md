# API集成指南

本文档说明如何集成后端API，包括请求封装、错误处理和最佳实践。

## API架构

```
utils/request.js     # HTTP客户端封装
api/                 # API接口定义
  ├── bookstore.js   # 书城API
  ├── user.js        # 用户API
  └── auth.js        # 认证API
stores/              # 状态管理（调用API）
components/views/    # 组件/页面（使用Store）
```

## HTTP客户端封装

### request.js

```javascript
// utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加Token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    // 添加请求ID（用于追踪）
    config.headers['X-Request-ID'] = generateRequestId()
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}`, response.data)
    
    // 统一响应格式
    const { code, data, message } = response.data
    
    if (code === 200) {
      return { ...response.data, success: true }
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    // HTTP错误处理
    const { response } = error
    
    if (response) {
      const { status, data } = response
      const message = data?.message || getStatusMessage(status)
      
      switch (status) {
        case 401:
          ElMessage.error('未登录或登录已过期')
          // 跳转到登录页
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('无权访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(message)
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    
    return Promise.reject(error)
  }
)

// 生成请求ID
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 获取状态码消息
function getStatusMessage(status) {
  const messages = {
    400: '请求参数错误',
    401: '未授权访问',
    403: '访问被拒绝',
    404: '请求的资源不存在',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用'
  }
  return messages[status] || `请求失败 (${status})`
}

export default request
```

## API模块定义

### 书城API

```javascript
// api/bookstore.js
import request from '@/utils/request'

export const bookstoreAPI = {
  /**
   * 获取首页数据
   */
  getHomepage() {
    return request.get('/bookstore/homepage')
  },

  /**
   * 获取榜单
   * @param {string} type - 榜单类型：realtime/weekly/monthly/newbie
   * @param {number} limit - 数量限制
   */
  getRanking(type, limit = 20) {
    return request.get(`/bookstore/rankings/${type}`, {
      params: { limit }
    })
  },

  /**
   * 获取书籍列表
   * @param {Object} params - 查询参数
   */
  getBooks(params = {}) {
    return request.get('/bookstore/books', { params })
  },

  /**
   * 获取书籍详情
   * @param {string} id - 书籍ID
   */
  getBookById(id) {
    return request.get(`/bookstore/books/${id}`)
  },

  /**
   * 搜索书籍
   * @param {string} keyword - 关键词
   * @param {Object} filters - 过滤条件
   */
  searchBooks(keyword, filters = {}) {
    return request.get('/bookstore/books/search', {
      params: { keyword, ...filters }
    })
  }
}
```

### 用户API

```javascript
// api/user.js
import request from '@/utils/request'

export const userAPI = {
  /**
   * 用户登录
   */
  login(credentials) {
    return request.post('/auth/login', credentials)
  },

  /**
   * 用户注册
   */
  register(userData) {
    return request.post('/auth/register', userData)
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return request.get('/user/profile')
  },

  /**
   * 更新用户信息
   */
  updateUserInfo(userData) {
    return request.put('/user/profile', userData)
  },

  /**
   * 退出登录
   */
  logout() {
    return request.post('/auth/logout')
  }
}
```

## 在Store中使用

```javascript
// stores/bookstore.js
import { defineStore } from 'pinia'
import { bookstoreAPI } from '@/api/bookstore'
import { ElMessage } from 'element-plus'

export const useBookstoreStore = defineStore('bookstore', {
  state: () => ({
    books: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchBooks(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await bookstoreAPI.getBooks(params)
        this.books = response.data
        return response.data
      } catch (error) {
        this.error = error.message
        // 不在这里显示错误消息，让调用者决定
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
```

## 在组件中使用

### 通过Store

```vue
<script setup>
import { onMounted } from 'vue'
import { useBookstoreStore } from '@/stores/bookstore'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

const bookstore = useBookstoreStore()
const { books, loading } = storeToRefs(bookstore)

onMounted(async () => {
  try {
    await bookstore.fetchBooks()
  } catch (error) {
    ElMessage.error('加载书籍失败')
  }
})
</script>
```

### 直接调用（不推荐）

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { bookstoreAPI } from '@/api/bookstore'

const books = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const response = await bookstoreAPI.getBooks()
    books.value = response.data
  } finally {
    loading.value = false
  }
})
</script>
```

## 错误处理

### 全局错误处理

已在request.js的响应拦截器中统一处理。

### 特定错误处理

```vue
<script setup>
import { ElMessage } from 'element-plus'

const fetchBooks = async () => {
  try {
    await bookstore.fetchBooks()
  } catch (error) {
    if (error.response?.status === 404) {
      ElMessage.warning('没有找到书籍')
    } else {
      ElMessage.error('加载失败，请重试')
    }
  }
}
</script>
```

## Loading状态

### 统一Loading

```vue
<template>
  <div v-loading="loading">
    <div v-for="book in books" :key="book.id">
      {{ book.title }}
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useBookstoreStore } from '@/stores/bookstore'

const bookstore = useBookstoreStore()
const { books, loading } = storeToRefs(bookstore)
</script>
```

### 多个Loading状态

```javascript
// stores/bookstore.js
state: () => ({
  loading: {
    books: false,
    detail: false,
    search: false
  }
}),

actions: {
  async fetchBooks() {
    this.loading.books = true
    try {
      // ...
    } finally {
      this.loading.books = false
    }
  }
}
```

## 请求取消

```vue
<script setup>
import { ref, onUnmounted } from 'vue'
import axios from 'axios'
import { bookstoreAPI } from '@/api/bookstore'

const source = ref(null)

const fetchBooks = async () => {
  // 取消之前的请求
  if (source.value) {
    source.value.cancel('请求被取消')
  }
  
  // 创建新的取消令牌
  source.value = axios.CancelToken.source()
  
  try {
    await bookstoreAPI.getBooks({ cancelToken: source.value.token })
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('请求被取消:', error.message)
    }
  }
}

// 组件卸载时取消请求
onUnmounted(() => {
  if (source.value) {
    source.value.cancel('组件已卸载')
  }
})
</script>
```

## 请求重试

```javascript
// utils/retry.js
export async function retryRequest(fn, maxRetries = 3) {
  let lastError
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // 不重试客户端错误（4xx）
      if (error.response?.status < 500) {
        throw error
      }
      
      if (i < maxRetries) {
        const delay = Math.pow(2, i) * 1000  // 指数退避
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}
```

使用：

```javascript
import { retryRequest } from '@/utils/retry'

await retryRequest(() => bookstoreAPI.getBooks())
```

## 环境配置

### 环境变量

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1

# .env.production
VITE_API_BASE_URL=https://api.qingyu.com/api/v1
```

### 使用环境变量

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
}
```

## 最佳实践

### 1. 统一响应格式

后端返回格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 2. 使用TypeScript类型（可选）

```typescript
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface Book {
  id: string
  title: string
  author: string
}

const getBooks = (): Promise<ApiResponse<Book[]>> => {
  return request.get('/books')
}
```

### 3. API版本管理

```javascript
const request = axios.create({
  baseURL: '/api/v1'  // 版本号
})
```

### 4. 请求日志

```javascript
// 开发环境记录详细日志
if (import.meta.env.DEV) {
  request.interceptors.request.use(config => {
    console.log(`[${config.method}] ${config.url}`, config.params || config.data)
    return config
  })
}
```

## 参考资料

- [Axios 文档](https://axios-http.com/)
- [状态管理](./state-management.md)
- [错误处理](../standards/best-practices.md)

---

**最后更新**：2025年10月17日
