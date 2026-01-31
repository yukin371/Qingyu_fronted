# 青羽平台 - API开发规范

> **版本**: v1.0.0  
> **最后更新**: 2025-10-29  
> **适用范围**: 所有API和服务层开发

---

## 📋 目录

1. [API封装模式](#api封装模式)
2. [服务层设计](#服务层设计)
3. [状态管理规范](#状态管理规范)
4. [类型定义规范](#类型定义规范)
5. [错误处理](#错误处理)
6. [最佳实践](#最佳实践)

---

## API封装模式

### 目录结构

```
src/
├── api/                      # 旧版API（逐步迁移）
│   ├── auth.ts
│   ├── bookstore.ts
│   └── README.md
│
└── modules/
    └── [module]/
        └── api/              # 新版模块化API
            ├── [feature].api.ts
            └── index.ts
```

### API文件结构

```typescript
// src/modules/bookstore/api/bookstore.api.ts

import { httpService } from '@core/services/http.service'
import type { 
  Book, 
  BookListParams, 
  BookListResponse,
  BookDetailResponse 
} from '../types/bookstore.types'

/**
 * 书城 API
 */
export const bookstoreAPI = {
  /**
   * 获取书籍列表
   * @param params 查询参数
   * @returns 书籍列表和分页信息
   */
  async getBooks(params: BookListParams): Promise<BookListResponse> {
    return httpService.get('/bookstore/books', { params })
  },

  /**
   * 获取书籍详情
   * @param id 书籍ID
   * @returns 书籍详情
   */
  async getBookById(id: string): Promise<BookDetailResponse> {
    return httpService.get(`/bookstore/books/${id}`)
  },

  /**
   * 搜索书籍
   * @param query 搜索关键词
   * @param params 其他参数
   * @returns 搜索结果
   */
  async searchBooks(query: string, params?: BookListParams): Promise<BookListResponse> {
    return httpService.get('/bookstore/books/search', {
      params: { query, ...params }
    })
  },

  /**
   * 增加书籍浏览量
   * @param id 书籍ID
   */
  async incrementView(id: string): Promise<void> {
    return httpService.post(`/bookstore/books/${id}/view`)
  },
}

// 导出API
export default bookstoreAPI
```

### HTTP Service

统一的HTTP客户端封装：

```typescript
// src/core/services/http.service.ts

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

class HttpService {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加 Token
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        return response.data
      },
      async (error) => {
        // 统一错误处理
        if (error.response?.status === 401) {
          // Token过期，尝试刷新
          await this.refreshToken()
        } else if (error.response?.status === 403) {
          ElMessage.error('没有权限访问')
        } else if (error.response?.status === 404) {
          ElMessage.error('请求的资源不存在')
        } else if (error.response?.status >= 500) {
          ElMessage.error('服务器错误，请稍后重试')
        }
        
        return Promise.reject(error)
      }
    )
  }

  private async refreshToken() {
    // Token刷新逻辑
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config)
  }
}

export const httpService = new HttpService()
export default httpService
```

---

## 服务层设计

### 服务层职责

1. **业务逻辑封装**
2. **多个API的编排**
3. **数据转换和格式化**
4. **缓存策略**
5. **错误处理**

### 服务层示例

```typescript
// src/modules/bookstore/services/bookstore.service.ts

import { bookstoreAPI } from '../api/bookstore.api'
import { cacheUtil } from '@/utils/cache'
import type { Book, BookListParams } from '../types/bookstore.types'

const CACHE_KEYS = {
  HOMEPAGE_DATA: 'bookstore:homepage',
  BOOK_DETAIL: (id: string) => `bookstore:book:${id}`,
}

const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,    // 5分钟
  MEDIUM: 30 * 60 * 1000,  // 30分钟
  LONG: 60 * 60 * 1000,    // 1小时
}

class BookstoreService {
  /**
   * 获取首页数据（带缓存）
   */
  async getHomepageData() {
    // 检查缓存
    const cached = cacheUtil.get(CACHE_KEYS.HOMEPAGE_DATA)
    if (cached) {
      return cached
    }

    // 并行请求多个接口
    const [banners, recommendBooks, rankings] = await Promise.all([
      bookstoreAPI.getBanners(),
      bookstoreAPI.getRecommendedBooks(),
      bookstoreAPI.getRankings('hot'),
    ])

    const data = {
      banners,
      recommendBooks,
      rankings,
    }

    // 缓存数据
    cacheUtil.set(CACHE_KEYS.HOMEPAGE_DATA, data, CACHE_TTL.SHORT)

    return data
  }

  /**
   * 获取书籍详情（带缓存和浏览量统计）
   */
  async getBookDetail(bookId: string): Promise<Book> {
    // 检查缓存
    const cached = cacheUtil.get(CACHE_KEYS.BOOK_DETAIL(bookId))
    if (cached) {
      // 后台更新浏览量
      this.incrementBookView(bookId).catch(console.error)
      return cached
    }

    // 获取数据
    const book = await bookstoreAPI.getBookById(bookId)

    // 数据转换
    const transformedBook = this.transformBookData(book)

    // 缓存数据
    cacheUtil.set(
      CACHE_KEYS.BOOK_DETAIL(bookId),
      transformedBook,
      CACHE_TTL.MEDIUM
    )

    // 后台更新浏览量
    this.incrementBookView(bookId).catch(console.error)

    return transformedBook
  }

  /**
   * 搜索书籍（带防抖）
   */
  async searchBooks(query: string, params?: BookListParams) {
    if (!query.trim()) {
      return { books: [], total: 0, totalPages: 0 }
    }

    const result = await bookstoreAPI.searchBooks(query, params)

    // 数据转换
    return {
      books: result.books.map(this.transformBookData),
      total: result.total,
      totalPages: result.totalPages,
    }
  }

  /**
   * 增加浏览量（静默失败）
   */
  private async incrementBookView(bookId: string): Promise<void> {
    try {
      await bookstoreAPI.incrementView(bookId)
    } catch (error) {
      // 静默失败，不影响用户体验
      console.error('Failed to increment view:', error)
    }
  }

  /**
   * 数据转换
   */
  private transformBookData(book: any): Book {
    return {
      ...book,
      // 格式化数据
      publishDate: new Date(book.publishDate),
      // 添加计算属性
      isNew: this.isNewBook(book.publishDate),
      // 数据清洗
      tags: book.tags?.filter(Boolean) || [],
    }
  }

  /**
   * 判断是否新书
   */
  private isNewBook(publishDate: string | Date): boolean {
    const date = typeof publishDate === 'string' ? new Date(publishDate) : publishDate
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return date >= monthAgo
  }

  /**
   * 清除缓存
   */
  clearCache() {
    cacheUtil.remove(CACHE_KEYS.HOMEPAGE_DATA)
  }

  /**
   * 清除书籍详情缓存
   */
  clearBookCache(bookId: string) {
    cacheUtil.remove(CACHE_KEYS.BOOK_DETAIL(bookId))
  }
}

export const bookstoreService = new BookstoreService()
export default bookstoreService
```

---

## 状态管理规范

### Pinia Store 结构

```typescript
// src/modules/bookstore/stores/bookstore.store.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bookstoreService } from '../services/bookstore.service'
import type { Book, BookFilters } from '../types/bookstore.types'

export const useBookstoreStore = defineStore('bookstore', () => {
  // ========== State ==========
  const homepageData = ref<any>(null)
  const books = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<BookFilters>({
    category: '',
    status: '',
    tags: [],
  })

  // ========== Getters ==========
  const filteredBooks = computed(() => {
    return books.value.filter(book => {
      if (filters.value.category && book.categoryId !== filters.value.category) {
        return false
      }
      if (filters.value.status && book.status !== filters.value.status) {
        return false
      }
      if (filters.value.tags.length > 0) {
        return filters.value.tags.some(tag => book.tags.includes(tag))
      }
      return true
    })
  })

  const recommendBooks = computed(() => {
    return books.value.filter(book => book.isRecommended).slice(0, 10)
  })

  // ========== Actions ==========
  async function fetchHomepageData() {
    loading.value = true
    error.value = null
    
    try {
      homepageData.value = await bookstoreService.getHomepageData()
    } catch (err: any) {
      error.value = err.message || '获取首页数据失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchBooks(params?: any) {
    loading.value = true
    error.value = null
    
    try {
      const result = await bookstoreService.searchBooks('', params)
      books.value = result.books
      return result
    } catch (err: any) {
      error.value = err.message || '获取书籍列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchBookDetail(bookId: string) {
    loading.value = true
    error.value = null
    
    try {
      currentBook.value = await bookstoreService.getBookDetail(bookId)
      return currentBook.value
    } catch (err: any) {
      error.value = err.message || '获取书籍详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: Partial<BookFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function resetFilters() {
    filters.value = {
      category: '',
      status: '',
      tags: [],
    }
  }

  function clearError() {
    error.value = null
  }

  // ========== Return ==========
  return {
    // State
    homepageData,
    books,
    currentBook,
    loading,
    error,
    filters,
    
    // Getters
    filteredBooks,
    recommendBooks,
    
    // Actions
    fetchHomepageData,
    fetchBooks,
    fetchBookDetail,
    setFilters,
    resetFilters,
    clearError,
  }
})
```

### Store 使用示例

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useBookstoreStore } from '@bookstore/stores/bookstore.store'

const bookstoreStore = useBookstoreStore()

onMounted(async () => {
  await bookstoreStore.fetchHomepageData()
})
</script>

<template>
  <div>
    <LoadingSpinner v-if="bookstoreStore.loading" />
    <ErrorMessage v-else-if="bookstoreStore.error" :message="bookstoreStore.error" />
    <HomepageContent v-else :data="bookstoreStore.homepageData" />
  </div>
</template>
```

---

## 类型定义规范

### API 类型定义

```typescript
// src/modules/bookstore/types/bookstore.types.ts

/**
 * 书籍状态
 */
export type BookStatus = 'draft' | 'published' | 'archived'

/**
 * 书籍接口
 */
export interface Book {
  id: string
  title: string
  author: string
  cover: string
  description: string
  categoryId: string
  categoryName: string
  status: BookStatus
  tags: string[]
  rating: number
  views: number
  favorites: number
  wordCount: number
  chapterCount: number
  isVip: boolean
  isRecommended: boolean
  isNew: boolean
  publishDate: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * 书籍列表查询参数
 */
export interface BookListParams {
  page?: number
  pageSize?: number
  category?: string
  status?: BookStatus
  tags?: string[]
  sortBy?: 'latest' | 'popular' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

/**
 * 书籍列表响应
 */
export interface BookListResponse {
  books: Book[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 书籍详情响应
 */
export interface BookDetailResponse {
  book: Book
  chapters: Chapter[]
  similarBooks: Book[]
}

/**
 * 章节接口
 */
export interface Chapter {
  id: string
  bookId: string
  title: string
  order: number
  wordCount: number
  isFree: boolean
  isPublished: boolean
  publishDate: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * 筛选条件
 */
export interface BookFilters {
  category: string
  status: BookStatus | ''
  tags: string[]
}
```

### 通用类型定义

```typescript
// src/core/types/api.types.ts

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

/**
 * 分页响应
 */
export interface PaginationResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * API 错误
 */
export interface ApiError {
  code: number
  message: string
  details?: any
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

/**
 * 查询参数基础接口
 */
export interface BaseQueryParams extends PaginationParams, Partial<SortParams> {
  [key: string]: any
}
```

---

## 错误处理

### 统一错误处理

```typescript
// src/utils/errorHandler.ts

import { ElMessage } from 'element-plus'

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export class AppError extends Error {
  code: ErrorCode
  details?: any

  constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN, details?: any) {
    super(message)
    this.code = code
    this.details = details
    this.name = 'AppError'
  }
}

export function handleError(error: any, showMessage = true) {
  let message = '操作失败，请稍后重试'
  let code = ErrorCode.UNKNOWN

  if (error instanceof AppError) {
    message = error.message
    code = error.code
  } else if (error.response) {
    const status = error.response.status
    switch (status) {
      case 401:
        message = '未登录或登录已过期'
        code = ErrorCode.UNAUTHORIZED
        break
      case 403:
        message = '没有权限访问'
        code = ErrorCode.FORBIDDEN
        break
      case 404:
        message = '请求的资源不存在'
        code = ErrorCode.NOT_FOUND
        break
      case 500:
        message = '服务器错误'
        code = ErrorCode.SERVER_ERROR
        break
      default:
        message = error.response.data?.message || message
    }
  } else if (error.code === 'ECONNABORTED') {
    message = '请求超时，请检查网络连接'
    code = ErrorCode.TIMEOUT
  } else if (!error.response) {
    message = '网络连接失败'
    code = ErrorCode.NETWORK_ERROR
  }

  if (showMessage) {
    ElMessage.error(message)
  }

  // 记录错误日志
  console.error('[Error]', {
    code,
    message,
    error,
  })

  return { code, message, error }
}
```

### 在服务层使用

```typescript
async function fetchData() {
  try {
    const data = await api.getData()
    return data
  } catch (error) {
    handleError(error)
    throw error
  }
}
```

---

## 最佳实践

### ✅ 推荐做法

1. **API层只做请求**：不包含业务逻辑
2. **服务层封装业务**：复杂逻辑放在服务层
3. **使用TypeScript**：完整的类型定义
4. **统一错误处理**：全局错误拦截
5. **合理使用缓存**：提升性能
6. **接口文档完善**：JSDoc注释

### ❌ 避免做法

1. **在组件中直接调用API**：应通过服务层
2. **缺少错误处理**：每个请求都要处理错误
3. **缺少类型定义**：避免使用any
4. **重复代码**：提取公共逻辑
5. **缺少缓存策略**：重复请求浪费资源

### 示例对比

```typescript
// ❌ 不好的做法
async function getBooksInComponent() {
  try {
    const response = await axios.get('/api/books')
    this.books = response.data.books.map(book => {
      return {
        ...book,
        isNew: new Date(book.publishDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    })
  } catch (error) {
    console.error(error)
  }
}

// ✅ 好的做法
// 1. API层
export const bookstoreAPI = {
  async getBooks(params: BookListParams): Promise<BookListResponse> {
    return httpService.get('/bookstore/books', { params })
  }
}

// 2. 服务层
class BookstoreService {
  async getBooks(params: BookListParams) {
    const result = await bookstoreAPI.getBooks(params)
    return {
      ...result,
      books: result.books.map(this.transformBook)
    }
  }
  
  private transformBook(book: any): Book {
    return {
      ...book,
      isNew: this.isNewBook(book.publishDate)
    }
  }
}

// 3. Store层
export const useBookstoreStore = defineStore('bookstore', () => {
  async function fetchBooks(params: BookListParams) {
    try {
      const result = await bookstoreService.getBooks(params)
      books.value = result.books
    } catch (error) {
      handleError(error)
    }
  }
  
  return { fetchBooks }
})

// 4. 组件中使用
const bookstoreStore = useBookstoreStore()
await bookstoreStore.fetchBooks({ page: 1 })
```

---

**维护者**: 前端团队  
**最后更新**: 2025-10-29  
**版本**: v1.0.0

