# 青羽书城前端API集成规范

## 1. API集成概述

### 1.1 设计目标

前端API集成旨在建立一套标准化、可维护、高性能的接口调用体系，确保前后端数据交互的稳定性和一致性。

**核心目标**：
- **统一性**：标准化的接口调用方式和数据格式
- **可靠性**：完善的错误处理和重试机制
- **性能**：优化的缓存策略和请求合并
- **可维护性**：清晰的代码结构和文档
- **可扩展性**：支持新接口的快速集成

### 1.2 技术栈

- **HTTP客户端**：Axios - 基于Promise的HTTP库
- **状态管理**：Pinia - Vue官方推荐的状态管理库
- **类型检查**：JSDoc - JavaScript文档和类型注释
- **错误处理**：统一的错误处理机制
- **缓存策略**：内存缓存 + localStorage持久化

## 2. API客户端架构

### 2.1 客户端配置

```javascript
// api/client.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器
client.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求ID用于追踪
    config.headers['X-Request-ID'] = generateRequestId()
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    // 请求日志
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data)
    
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
client.interceptors.response.use(
  (response) => {
    // 响应日志
    console.log(`[API Response] ${response.config.url}`, response.data)
    
    // 统一响应格式处理
    const { code, data, message } = response.data
    
    if (code === 200) {
      return { ...response.data, success: true }
    } else {
      // 业务错误处理
      const error = new Error(message || '请求失败')
      error.code = code
      error.data = data
      throw error
    }
  },
  (error) => {
    // HTTP错误处理
    const { response, request, message } = error
    
    if (response) {
      // 服务器响应错误
      const { status, data } = response
      const errorMessage = data?.message || getStatusMessage(status)
      
      // 特殊状态码处理
      switch (status) {
        case 401:
          // 未授权，跳转登录
          handleUnauthorized()
          break
        case 403:
          // 禁止访问
          ElMessage.error('访问被拒绝')
          break
        case 404:
          // 资源不存在
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          // 服务器错误
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(errorMessage)
      }
      
      error.message = errorMessage
    } else if (request) {
      // 网络错误
      ElMessage.error('网络连接失败，请检查网络设置')
      error.message = '网络连接失败'
    } else {
      // 其他错误
      ElMessage.error(message || '请求失败')
    }
    
    console.error('[API Response Error]', error)
    return Promise.reject(error)
  }
)

export default client
```

### 2.2 工具函数

```javascript
// api/utils.js

/**
 * 生成请求ID
 * @returns {string} 请求ID
 */
export function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 获取认证token
 * @returns {string|null} token
 */
export function getAuthToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
}

/**
 * 获取HTTP状态码对应的消息
 * @param {number} status HTTP状态码
 * @returns {string} 错误消息
 */
export function getStatusMessage(status) {
  const messages = {
    400: '请求参数错误',
    401: '未授权访问',
    403: '访问被拒绝',
    404: '请求的资源不存在',
    405: '请求方法不允许',
    408: '请求超时',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  }
  return messages[status] || `请求失败 (${status})`
}

/**
 * 处理未授权访问
 */
export function handleUnauthorized() {
  // 清除本地token
  localStorage.removeItem('auth_token')
  sessionStorage.removeItem('auth_token')
  
  // 跳转到登录页
  window.location.href = '/login'
}
```

## 3. API模块设计

### 3.1 模块结构

```
api/
├── client.js              # HTTP客户端配置
├── utils.js               # 工具函数
├── types.js               # 类型定义
├── cache.js               # 缓存管理
├── modules/               # API模块
│   ├── bookstore.js       # 书城相关接口
│   ├── user.js            # 用户相关接口
│   ├── auth.js            # 认证相关接口
│   └── upload.js          # 文件上传接口
└── index.js               # 统一导出
```

### 3.2 书城API模块

```javascript
// api/modules/bookstore.js
import client from '../client.js'
import { withCache } from '../cache.js'

/**
 * 书城相关API
 */
export const bookstoreAPI = {
  /**
   * 获取首页数据
   * @returns {Promise<Object>} 首页数据
   */
  @withCache(5 * 60 * 1000) // 缓存5分钟
  async getHomepage() {
    return client.get('/bookstore/homepage')
  },

  /**
   * 获取实时榜单
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 榜单数据
   */
  async getRealtimeRanking(limit = 20) {
    return client.get('/bookstore/rankings/realtime', {
      params: { limit }
    })
  },

  /**
   * 获取周榜单
   * @param {string} period - 周期，格式：2024-W03
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 榜单数据
   */
  async getWeeklyRanking(period = '', limit = 20) {
    return client.get('/bookstore/rankings/weekly', {
      params: { period, limit }
    })
  },

  /**
   * 获取月榜单
   * @param {string} period - 周期，格式：2024-01
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 榜单数据
   */
  async getMonthlyRanking(period = '', limit = 20) {
    return client.get('/bookstore/rankings/monthly', {
      params: { period, limit }
    })
  },

  /**
   * 获取新人榜单
   * @param {string} period - 周期，格式：2024-01
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 榜单数据
   */
  async getNewbieRanking(period = '', limit = 20) {
    return client.get('/bookstore/rankings/newbie', {
      params: { period, limit }
    })
  },

  /**
   * 获取Banner列表
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} Banner数据
   */
  @withCache(30 * 60 * 1000) // 缓存30分钟
  async getBanners(limit = 5) {
    return client.get('/bookstore/banners', {
      params: { limit }
    })
  },

  /**
   * 获取书籍详情
   * @param {string} id - 书籍ID
   * @returns {Promise<Object>} 书籍详情
   */
  async getBookById(id) {
    return client.get(`/bookstore/books/${id}`)
  },

  /**
   * 获取推荐书籍
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise<Object>} 分页数据
   */
  async getRecommendedBooks(page = 1, size = 20) {
    return client.get('/bookstore/books/recommended', {
      params: { page, size }
    })
  },

  /**
   * 获取精选书籍
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise<Object>} 分页数据
   */
  async getFeaturedBooks(page = 1, size = 20) {
    return client.get('/bookstore/books/featured', {
      params: { page, size }
    })
  },

  /**
   * 搜索书籍
   * @param {string} keyword - 搜索关键词
   * @param {Object} filters - 过滤条件
   * @param {string} filters.category - 分类ID
   * @param {string} filters.author - 作者
   * @param {string} filters.status - 状态
   * @param {number} filters.page - 页码
   * @param {number} filters.size - 每页数量
   * @returns {Promise<Object>} 搜索结果
   */
  async searchBooks(keyword, filters = {}) {
    return client.get('/bookstore/books/search', {
      params: { keyword, ...filters }
    })
  },

  /**
   * 增加书籍浏览量
   * @param {string} id - 书籍ID
   * @returns {Promise<Object>} 操作结果
   */
  async incrementBookView(id) {
    return client.post(`/bookstore/books/${id}/view`)
  },

  /**
   * 增加Banner点击次数
   * @param {string} id - Banner ID
   * @returns {Promise<Object>} 操作结果
   */
  async incrementBannerClick(id) {
    return client.post(`/bookstore/banners/${id}/click`)
  },

  /**
   * 获取分类树
   * @returns {Promise<Array>} 分类树数据
   */
  @withCache(60 * 60 * 1000) // 缓存1小时
  async getCategoryTree() {
    return client.get('/bookstore/categories/tree')
  },

  /**
   * 获取分类详情
   * @param {string} id - 分类ID
   * @returns {Promise<Object>} 分类详情
   */
  async getCategoryById(id) {
    return client.get(`/bookstore/categories/${id}`)
  },

  /**
   * 获取分类下的书籍
   * @param {string} categoryId - 分类ID
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise<Object>} 分页数据
   */
  async getBooksByCategory(categoryId, page = 1, size = 20) {
    return client.get(`/bookstore/categories/${categoryId}/books`, {
      params: { page, size }
    })
  }
}
```

### 3.3 用户API模块

```javascript
// api/modules/user.js
import client from '../client.js'

export const userAPI = {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   * @returns {Promise<Object>} 登录结果
   */
  async login(credentials) {
    return client.post('/auth/login', credentials)
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 注册结果
   */
  async register(userData) {
    return client.post('/auth/register', userData)
  },

  /**
   * 获取用户信息
   * @returns {Promise<Object>} 用户信息
   */
  async getUserInfo() {
    return client.get('/user/profile')
  },

  /**
   * 更新用户信息
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateUserInfo(userData) {
    return client.put('/user/profile', userData)
  },

  /**
   * 用户登出
   * @returns {Promise<Object>} 登出结果
   */
  async logout() {
    return client.post('/auth/logout')
  }
}
```

## 4. 缓存策略

### 4.1 缓存管理器

```javascript
// api/cache.js

/**
 * API缓存管理器
 */
class APICache {
  constructor() {
    this.cache = new Map()
    this.ttl = new Map()
    this.maxSize = 100 // 最大缓存条目数
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} data - 缓存数据
   * @param {number} ttl - 生存时间（毫秒）
   */
  set(key, data, ttl = 5 * 60 * 1000) {
    // 检查缓存大小
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
    
    this.ttl.set(key, ttl)
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存数据
   */
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    const ttl = this.ttl.get(key)
    const isExpired = Date.now() - item.timestamp > ttl

    if (isExpired) {
      this.delete(key)
      return null
    }

    return item.data
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key)
    this.ttl.delete(key)
  }

  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear()
    this.ttl.clear()
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      const ttl = this.ttl.get(key)
      if (now - item.timestamp > ttl) {
        this.delete(key)
      }
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 创建全局缓存实例
const apiCache = new APICache()

/**
 * 缓存装饰器
 * @param {number} ttl - 缓存时间（毫秒）
 * @returns {Function} 装饰器函数
 */
export function withCache(ttl = 5 * 60 * 1000) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      // 生成缓存键
      const cacheKey = `${target.constructor.name}_${propertyKey}_${JSON.stringify(args)}`
      
      // 尝试从缓存获取
      const cached = apiCache.get(cacheKey)
      if (cached) {
        console.log(`[Cache Hit] ${cacheKey}`)
        return cached
      }

      // 执行原方法
      console.log(`[Cache Miss] ${cacheKey}`)
      const result = await originalMethod.apply(this, args)

      // 缓存结果
      apiCache.set(cacheKey, result, ttl)

      return result
    }

    return descriptor
  }
}

/**
 * 手动缓存函数
 * @param {string} key - 缓存键
 * @param {Function} fn - 异步函数
 * @param {number} ttl - 缓存时间
 * @returns {Promise<any>} 结果
 */
export async function cached(key, fn, ttl = 5 * 60 * 1000) {
  const cached = apiCache.get(key)
  if (cached) {
    return cached
  }

  const result = await fn()
  apiCache.set(key, result, ttl)
  return result
}

export { apiCache }
```

### 4.2 持久化缓存

```javascript
// api/persistentCache.js

/**
 * 持久化缓存管理器
 */
class PersistentCache {
  constructor(prefix = 'qingyu_cache_') {
    this.prefix = prefix
  }

  /**
   * 设置持久化缓存
   * @param {string} key - 缓存键
   * @param {any} data - 缓存数据
   * @param {number} ttl - 生存时间（毫秒）
   */
  set(key, data, ttl = 24 * 60 * 60 * 1000) {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    }

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set persistent cache:', error)
    }
  }

  /**
   * 获取持久化缓存
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存数据
   */
  get(key) {
    try {
      const itemStr = localStorage.getItem(this.prefix + key)
      if (!itemStr) return null

      const item = JSON.parse(itemStr)
      const isExpired = Date.now() - item.timestamp > item.ttl

      if (isExpired) {
        this.delete(key)
        return null
      }

      return item.data
    } catch (error) {
      console.warn('Failed to get persistent cache:', error)
      return null
    }
  }

  /**
   * 删除持久化缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (error) {
      console.warn('Failed to delete persistent cache:', error)
    }
  }

  /**
   * 清空所有持久化缓存
   */
  clear() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear persistent cache:', error)
    }
  }
}

export const persistentCache = new PersistentCache()
```

## 5. 状态管理集成

### 5.1 Pinia Store集成

```javascript
// stores/bookstore.js
import { defineStore } from 'pinia'
import { bookstoreAPI } from '@/api/modules/bookstore.js'

export const useBookstoreStore = defineStore('bookstore', {
  state: () => ({
    // 首页数据
    homepageData: null,
    
    // 榜单数据
    rankings: {
      realtime: [],
      weekly: [],
      monthly: [],
      newbie: []
    },
    
    // 书籍数据
    books: {
      recommended: [],
      featured: [],
      searchResults: []
    },
    
    // 加载状态
    loading: {
      homepage: false,
      rankings: false,
      books: false
    },
    
    // 错误状态
    errors: {}
  }),

  getters: {
    // 获取首页Banner
    getHomepageBanners: (state) => {
      return state.homepageData?.banners || []
    },

    // 获取首页推荐书籍
    getHomepageRecommended: (state) => {
      return state.homepageData?.recommendedBooks || []
    },

    // 获取榜单数据
    getRankingByType: (state) => {
      return (type) => state.rankings[type] || []
    },

    // 检查是否有错误
    hasError: (state) => {
      return (key) => !!state.errors[key]
    },

    // 检查是否正在加载
    isLoading: (state) => {
      return (key) => !!state.loading[key]
    }
  },

  actions: {
    /**
     * 设置加载状态
     * @param {string} key - 加载键
     * @param {boolean} loading - 加载状态
     */
    setLoading(key, loading) {
      this.loading[key] = loading
    },

    /**
     * 设置错误状态
     * @param {string} key - 错误键
     * @param {string|null} error - 错误信息
     */
    setError(key, error) {
      if (error) {
        this.errors[key] = error
      } else {
        delete this.errors[key]
      }
    },

    /**
     * 获取首页数据
     */
    async fetchHomepageData() {
      const loadingKey = 'homepage'
      
      this.setLoading(loadingKey, true)
      this.setError(loadingKey, null)

      try {
        const response = await bookstoreAPI.getHomepage()
        this.homepageData = response.data
      } catch (error) {
        this.setError(loadingKey, error.message)
        throw error
      } finally {
        this.setLoading(loadingKey, false)
      }
    },

    /**
     * 获取榜单数据
     * @param {string} type - 榜单类型
     * @param {string} period - 周期
     * @param {number} limit - 限制数量
     */
    async fetchRanking(type, period = '', limit = 20) {
      const loadingKey = `ranking_${type}`
      
      this.setLoading(loadingKey, true)
      this.setError(loadingKey, null)

      try {
        let response
        switch (type) {
          case 'realtime':
            response = await bookstoreAPI.getRealtimeRanking(limit)
            break
          case 'weekly':
            response = await bookstoreAPI.getWeeklyRanking(period, limit)
            break
          case 'monthly':
            response = await bookstoreAPI.getMonthlyRanking(period, limit)
            break
          case 'newbie':
            response = await bookstoreAPI.getNewbieRanking(period, limit)
            break
          default:
            throw new Error(`无效的榜单类型: ${type}`)
        }

        this.rankings[type] = response.data
      } catch (error) {
        this.setError(loadingKey, error.message)
        throw error
      } finally {
        this.setLoading(loadingKey, false)
      }
    },

    /**
     * 搜索书籍
     * @param {string} keyword - 搜索关键词
     * @param {Object} filters - 过滤条件
     */
    async searchBooks(keyword, filters = {}) {
      const loadingKey = 'search'
      
      this.setLoading(loadingKey, true)
      this.setError(loadingKey, null)

      try {
        const response = await bookstoreAPI.searchBooks(keyword, filters)
        this.books.searchResults = response.data
      } catch (error) {
        this.setError(loadingKey, error.message)
        throw error
      } finally {
        this.setLoading(loadingKey, false)
      }
    },

    /**
     * 增加书籍浏览量
     * @param {string} bookId - 书籍ID
     */
    async incrementBookView(bookId) {
      try {
        await bookstoreAPI.incrementBookView(bookId)
      } catch (error) {
        console.error('增加浏览量失败:', error)
      }
    },

    /**
     * 增加Banner点击次数
     * @param {string} bannerId - Banner ID
     */
    async incrementBannerClick(bannerId) {
      try {
        await bookstoreAPI.incrementBannerClick(bannerId)
      } catch (error) {
        console.error('增加Banner点击次数失败:', error)
      }
    }
  }
})
```

### 5.2 组合式函数

```javascript
// composables/useBookstore.js
import { computed } from 'vue'
import { useBookstoreStore } from '@/stores/bookstore.js'
import { storeToRefs } from 'pinia'

/**
 * 书城数据组合式函数
 */
export function useBookstore() {
  const store = useBookstoreStore()
  
  // 响应式状态
  const { 
    homepageData, 
    rankings, 
    books, 
    loading, 
    errors 
  } = storeToRefs(store)

  // 计算属性
  const banners = computed(() => store.getHomepageBanners)
  const recommendedBooks = computed(() => store.getHomepageRecommended)
  const isHomepageLoading = computed(() => store.isLoading('homepage'))
  const homepageError = computed(() => store.hasError('homepage'))

  // 方法
  const {
    fetchHomepageData,
    fetchRanking,
    searchBooks,
    incrementBookView,
    incrementBannerClick
  } = store

  return {
    // 状态
    homepageData,
    rankings,
    books,
    loading,
    errors,
    
    // 计算属性
    banners,
    recommendedBooks,
    isHomepageLoading,
    homepageError,
    
    // 方法
    fetchHomepageData,
    fetchRanking,
    searchBooks,
    incrementBookView,
    incrementBannerClick
  }
}

/**
 * 榜单数据组合式函数
 */
export function useRankings() {
  const store = useBookstoreStore()
  const { rankings, loading } = storeToRefs(store)

  const getRanking = (type) => computed(() => store.getRankingByType(type))
  const isRankingLoading = (type) => computed(() => store.isLoading(`ranking_${type}`))

  const fetchAllRankings = async () => {
    const promises = [
      store.fetchRanking('realtime'),
      store.fetchRanking('weekly'),
      store.fetchRanking('monthly'),
      store.fetchRanking('newbie')
    ]

    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('获取榜单数据失败:', error)
    }
  }

  return {
    rankings,
    loading,
    getRanking,
    isRankingLoading,
    fetchRanking: store.fetchRanking,
    fetchAllRankings
  }
}
```

## 6. 错误处理策略

### 6.1 错误分类

```javascript
// api/errors.js

/**
 * API错误类
 */
export class APIError extends Error {
  constructor(message, code, data = null) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.data = data
  }
}

/**
 * 网络错误类
 */
export class NetworkError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NetworkError'
  }
}

/**
 * 业务错误类
 */
export class BusinessError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
  }
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  static handle(error) {
    if (error instanceof APIError) {
      return this.handleAPIError(error)
    } else if (error instanceof NetworkError) {
      return this.handleNetworkError(error)
    } else if (error instanceof BusinessError) {
      return this.handleBusinessError(error)
    } else {
      return this.handleUnknownError(error)
    }
  }

  static handleAPIError(error) {
    console.error('[API Error]', error)
    
    // 根据错误码进行不同处理
    switch (error.code) {
      case 401:
        // 未授权，跳转登录
        this.redirectToLogin()
        break
      case 403:
        // 权限不足
        ElMessage.error('权限不足')
        break
      case 404:
        // 资源不存在
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        // 服务器错误
        ElMessage.error('服务器内部错误，请稍后重试')
        break
      default:
        ElMessage.error(error.message || '请求失败')
    }
  }

  static handleNetworkError(error) {
    console.error('[Network Error]', error)
    ElMessage.error('网络连接失败，请检查网络设置')
  }

  static handleBusinessError(error) {
    console.error('[Business Error]', error)
    ElMessage.error(error.message)
  }

  static handleUnknownError(error) {
    console.error('[Unknown Error]', error)
    ElMessage.error('发生未知错误，请稍后重试')
  }

  static redirectToLogin() {
    // 清除认证信息
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')
    
    // 跳转登录页
    window.location.href = '/login'
  }
}
```

### 6.2 重试机制

```javascript
// api/retry.js

/**
 * 重试配置
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    // 网络错误或5xx服务器错误才重试
    return !error.response || (error.response.status >= 500)
  }
}

/**
 * 重试装饰器
 * @param {Object} config - 重试配置
 * @returns {Function} 装饰器函数
 */
export function withRetry(config = RETRY_CONFIG) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      let lastError
      
      for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args)
        } catch (error) {
          lastError = error
          
          // 检查是否应该重试
          if (attempt === config.maxRetries || !config.retryCondition(error)) {
            throw error
          }
          
          // 等待后重试
          const delay = config.retryDelay * Math.pow(2, attempt) // 指数退避
          console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
      
      throw lastError
    }

    return descriptor
  }
}

/**
 * 手动重试函数
 * @param {Function} fn - 异步函数
 * @param {Object} config - 重试配置
 * @returns {Promise<any>} 结果
 */
export async function retry(fn, config = RETRY_CONFIG) {
  let lastError
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === config.maxRetries || !config.retryCondition(error)) {
        throw error
      }
      
      const delay = config.retryDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}
```

## 7. 性能优化

### 7.1 请求合并

```javascript
// api/batcher.js

/**
 * 请求批处理器
 */
class RequestBatcher {
  constructor() {
    this.batches = new Map()
    this.batchTimeout = 50 // 50ms内的请求合并
  }

  /**
   * 批量请求
   * @param {string} batchKey - 批次键
   * @param {Function} batchFn - 批处理函数
   * @param {any} item - 请求项
   * @returns {Promise<any>} 结果
   */
  batch(batchKey, batchFn, item) {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, {
          items: [],
          promises: [],
          timeout: null
        })
      }

      const batch = this.batches.get(batchKey)
      batch.items.push(item)
      batch.promises.push({ resolve, reject })

      // 清除之前的定时器
      if (batch.timeout) {
        clearTimeout(batch.timeout)
      }

      // 设置新的定时器
      batch.timeout = setTimeout(async () => {
        const { items, promises } = batch
        this.batches.delete(batchKey)

        try {
          const results = await batchFn(items)
          
          // 分发结果
          promises.forEach((promise, index) => {
            promise.resolve(results[index])
          })
        } catch (error) {
          // 分发错误
          promises.forEach(promise => {
            promise.reject(error)
          })
        }
      }, this.batchTimeout)
    })
  }
}

const requestBatcher = new RequestBatcher()

/**
 * 批量获取书籍详情
 * @param {Array<string>} bookIds - 书籍ID数组
 * @returns {Promise<Array>} 书籍详情数组
 */
async function batchGetBooks(bookIds) {
  return client.post('/bookstore/books/batch', { ids: bookIds })
}

/**
 * 获取单个书籍详情（支持批处理）
 * @param {string} bookId - 书籍ID
 * @returns {Promise<Object>} 书籍详情
 */
export function getBookById(bookId) {
  return requestBatcher.batch('books', batchGetBooks, bookId)
}
```

### 7.2 请求去重

```javascript
// api/deduplicator.js

/**
 * 请求去重器
 */
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map()
  }

  /**
   * 去重请求
   * @param {string} key - 请求键
   * @param {Function} requestFn - 请求函数
   * @returns {Promise<any>} 结果
   */
  dedupe(key, requestFn) {
    // 如果已有相同请求在进行中，返回该请求的Promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)
    }

    // 创建新请求
    const promise = requestFn().finally(() => {
      // 请求完成后清除
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * 取消请求
   * @param {string} key - 请求键
   */
  cancel(key) {
    this.pendingRequests.delete(key)
  }

  /**
   * 清空所有请求
   */
  clear() {
    this.pendingRequests.clear()
  }
}

const requestDeduplicator = new RequestDeduplicator()

/**
 * 去重装饰器
 * @returns {Function} 装饰器函数
 */
export function withDeduplication() {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function(...args) {
      const key = `${target.constructor.name}_${propertyKey}_${JSON.stringify(args)}`
      return requestDeduplicator.dedupe(key, () => originalMethod.apply(this, args))
    }

    return descriptor
  }
}
```

## 8. 监控和分析

### 8.1 API监控

```javascript
// api/monitor.js

/**
 * API监控器
 */
class APIMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalTime: 0,
      slowRequests: 0
    }
    this.slowThreshold = 3000 // 3秒
  }

  /**
   * 记录请求开始
   * @param {Object} config - 请求配置
   * @returns {Function} 结束函数
   */
  startRequest(config) {
    const startTime = Date.now()
    this.metrics.requests++

    return (error = null) => {
      const duration = Date.now() - startTime
      this.metrics.totalTime += duration

      if (duration > this.slowThreshold) {
        this.metrics.slowRequests++
        console.warn(`[Slow Request] ${config.method?.toUpperCase()} ${config.url} took ${duration}ms`)
      }

      if (error) {
        this.metrics.errors++
        this.reportError(config, error, duration)
      }

      this.reportMetrics(config, duration, error)
    }
  }

  /**
   * 报告错误
   * @param {Object} config - 请求配置
   * @param {Error} error - 错误对象
   * @param {number} duration - 请求时长
   */
  reportError(config, error, duration) {
    const errorData = {
      url: config.url,
      method: config.method,
      status: error.response?.status,
      message: error.message,
      duration,
      timestamp: Date.now()
    }

    // 发送错误报告到监控系统
    this.sendToMonitoring('api_error', errorData)
  }

  /**
   * 报告指标
   * @param {Object} config - 请求配置
   * @param {number} duration - 请求时长
   * @param {Error|null} error - 错误对象
   */
  reportMetrics(config, duration, error) {
    const metricsData = {
      url: config.url,
      method: config.method,
      duration,
      success: !error,
      timestamp: Date.now()
    }

    // 发送指标到监控系统
    this.sendToMonitoring('api_metrics', metricsData)
  }

  /**
   * 发送数据到监控系统
   * @param {string} type - 数据类型
   * @param {Object} data - 数据
   */
  sendToMonitoring(type, data) {
    // 这里可以集成第三方监控服务
    // 如：Sentry、DataDog、自建监控系统等
    console.log(`[Monitor] ${type}:`, data)
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.metrics,
      averageTime: this.metrics.requests > 0 ? this.metrics.totalTime / this.metrics.requests : 0,
      errorRate: this.metrics.requests > 0 ? this.metrics.errors / this.metrics.requests : 0,
      slowRequestRate: this.metrics.requests > 0 ? this.metrics.slowRequests / this.metrics.requests : 0
    }
  }
}

export const apiMonitor = new APIMonitor()
```

### 8.2 性能分析

```javascript
// api/performance.js

/**
 * 性能分析器
 */
export class PerformanceAnalyzer {
  /**
   * 测量API调用性能
   * @param {string} name - 测量名称
   * @param {Function} fn - 异步函数
   * @returns {Promise<any>} 结果
   */
  static async measure(name, fn) {
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 记录性能指标
      this.recordMetric(name, duration, true)
      
      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 记录错误指标
      this.recordMetric(name, duration, false)
      
      throw error
    }
  }

  /**
   * 记录性能指标
   * @param {string} name - 指标名称
   * @param {number} duration - 持续时间
   * @param {boolean} success - 是否成功
   */
  static recordMetric(name, duration, success) {
    const metric = {
      name,
      duration,
      success,
      timestamp: Date.now()
    }

    // 发送到分析系统
    this.sendToAnalytics('performance', metric)
  }

  /**
   * 发送数据到分析系统
   * @param {string} type - 数据类型
   * @param {Object} data - 数据
   */
  static sendToAnalytics(type, data) {
    // 集成分析服务
    console.log(`[Analytics] ${type}:`, data)
  }
}
```

## 9. 最佳实践

### 9.1 API设计原则

1. **RESTful设计**：遵循REST API设计规范
2. **统一响应格式**：所有接口返回统一的数据格式
3. **错误处理**：提供详细的错误信息和错误码
4. **版本控制**：通过URL路径进行API版本控制
5. **文档完善**：提供详细的API文档和示例

### 9.2 前端集成原则

1. **单一数据源**：使用Pinia作为唯一的状态管理
2. **错误边界**：在组件层面处理API错误
3. **加载状态**：为所有异步操作提供加载状态
4. **缓存策略**：合理使用缓存提高性能
5. **类型安全**：使用JSDoc或TypeScript确保类型安全

### 9.3 性能优化建议

1. **请求合并**：将多个相似请求合并为批量请求
2. **请求去重**：避免重复的API调用
3. **缓存策略**：合理设置缓存时间和策略
4. **懒加载**：按需加载数据和组件
5. **分页处理**：对大量数据使用分页或虚拟滚动

---

**文档版本**：v1.0.0  
**最后更新**：2024年1月  
**维护者**：前端API团队