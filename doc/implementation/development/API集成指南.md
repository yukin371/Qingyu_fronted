# API集成指南

## 1. 概述

本文档详细说明如何在青羽书城前端项目中集成后端API，包括API封装、请求发送、错误处理等内容。

### 1.1 API集成架构

```
组件 → Store (可选) → API Service → Axios实例 → 后端服务
                                    ↓
                              拦截器处理
                          (请求/响应/错误)
```

## 2. Axios配置

### 2.1 创建Axios实例

```javascript
// utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default service
```

### 2.2 请求拦截器

```javascript
// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加认证token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    // 添加时间戳（防止缓存）
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    // 日志记录（开发环境）
    if (import.meta.env.DEV) {
      console.log('API请求:', config.method.toUpperCase(), config.url, config)
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)
```

### 2.3 响应拦截器

```javascript
// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据业务code判断
    if (res.code !== 200) {
      // 业务错误处理
      ElMessage.error(res.message || '请求失败')
      
      // 特殊错误码处理
      if (res.code === 401) {
        // token过期，跳转登录
        const userStore = useUserStore()
        userStore.logout()
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    // 返回数据
    return res.data
  },
  error => {
    console.error('响应错误:', error)
    
    // 网络错误
    if (!error.response) {
      ElMessage.error('网络错误，请检查网络连接')
      return Promise.reject(error)
    }
    
    // HTTP错误
    const status = error.response.status
    const errorMap = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '拒绝访问',
      404: '请求资源不存在',
      500: '服务器错误',
      503: '服务不可用'
    }
    
    ElMessage.error(errorMap[status] || `请求失败 (${status})`)
    return Promise.reject(error)
  }
)
```

## 3. API封装

### 3.1 API模块化

```
src/api/
├── index.js          # API统一导出
├── request.js        # Axios实例
├── books.js          # 书籍相关API
├── user.js           # 用户相关API
├── reader.js         # 阅读器相关API
└── common.js         # 通用API
```

### 3.2 书籍API示例

```javascript
// api/books.js
import request from '@/utils/request'

/**
 * 书籍相关API
 */
export const booksAPI = {
  /**
   * 获取书籍列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页数量
   * @param {string} params.category - 分类
   * @param {string} params.keyword - 搜索关键词
   * @returns {Promise}
   */
  getList(params) {
    return request({
      url: '/books',
      method: 'get',
      params
    })
  },

  /**
   * 获取书籍详情
   * @param {string} id - 书籍ID
   * @returns {Promise}
   */
  getDetail(id) {
    return request({
      url: `/books/${id}`,
      method: 'get'
    })
  },

  /**
   * 搜索书籍
   * @param {string} keyword - 搜索关键词
   * @param {Object} options - 其他选项
   * @returns {Promise}
   */
  search(keyword, options = {}) {
    return request({
      url: '/books/search',
      method: 'get',
      params: {
        keyword,
        ...options
      }
    })
  },

  /**
   * 创建书籍（需要权限）
   * @param {Object} data - 书籍数据
   * @returns {Promise}
   */
  create(data) {
    return request({
      url: '/books',
      method: 'post',
      data
    })
  },

  /**
   * 更新书籍
   * @param {string} id - 书籍ID
   * @param {Object} data - 更新数据
   * @returns {Promise}
   */
  update(id, data) {
    return request({
      url: `/books/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除书籍
   * @param {string} id - 书籍ID
   * @returns {Promise}
   */
  delete(id) {
    return request({
      url: `/books/${id}`,
      method: 'delete'
    })
  },

  /**
   * 批量获取书籍
   * @param {string[]} ids - 书籍ID数组
   * @returns {Promise}
   */
  batchGet(ids) {
    return request({
      url: '/books/batch',
      method: 'post',
      data: { ids }
    })
  }
}
```

### 3.3 统一导出

```javascript
// api/index.js
export * from './books'
export * from './user'
export * from './reader'
export * from './common'

// 或者
import { booksAPI } from './books'
import { userAPI } from './user'
import { readerAPI } from './reader'

export {
  booksAPI,
  userAPI,
  readerAPI
}
```

## 4. 在组件中使用API

### 4.1 直接调用API

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { booksAPI } from '@/api/books'
import { ElMessage } from 'element-plus'

const books = ref([])
const loading = ref(false)

const fetchBooks = async () => {
  loading.value = true
  
  try {
    const data = await booksAPI.getList({
      page: 1,
      size: 20
    })
    books.value = data
  } catch (error) {
    console.error('获取书籍列表失败:', error)
    ElMessage.error('获取书籍列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBooks()
})
</script>
```

### 4.2 通过Store调用

```javascript
// stores/books.js
import { defineStore } from 'pinia'
import { booksAPI } from '@/api/books'

export const useBooksStore = defineStore('books', {
  state: () => ({
    list: [],
    detail: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchList(params) {
      this.loading = true
      this.error = null
      
      try {
        this.list = await booksAPI.getList(params)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchDetail(id) {
      this.loading = true
      
      try {
        this.detail = await booksAPI.getDetail(id)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
```

```vue
<script setup>
import { useBooksStore } from '@/stores/books'
import { storeToRefs } from 'pinia'

const booksStore = useBooksStore()
const { list, loading } = storeToRefs(booksStore)

onMounted(() => {
  booksStore.fetchList({ page: 1, size: 20 })
})
</script>
```

## 5. 请求优化

### 5.1 请求取消

```javascript
// utils/request.js
const pendingRequests = new Map()

// 生成请求key
function generateReqKey(config) {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// 请求拦截器中
service.interceptors.request.use(config => {
  const reqKey = generateReqKey(config)
  
  // 取消之前的相同请求
  if (pendingRequests.has(reqKey)) {
    const cancel = pendingRequests.get(reqKey)
    cancel('请求被取消')
    pendingRequests.delete(reqKey)
  }
  
  // 添加取消token
  config.cancelToken = new axios.CancelToken(cancel => {
    pendingRequests.set(reqKey, cancel)
  })
  
  return config
})

// 响应拦截器中清除
service.interceptors.response.use(
  response => {
    const reqKey = generateReqKey(response.config)
    pendingRequests.delete(reqKey)
    return response.data
  },
  error => {
    if (axios.isCancel(error)) {
      console.log('请求已取消:', error.message)
    }
    return Promise.reject(error)
  }
)
```

### 5.2 请求缓存

```javascript
// utils/cache.js
const cache = new Map()

export function getCachedData(key) {
  const item = cache.get(key)
  
  if (!item) return null
  
  // 检查是否过期
  if (Date.now() > item.expiry) {
    cache.delete(key)
    return null
  }
  
  return item.data
}

export function setCachedData(key, data, ttl = 5 * 60 * 1000) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl
  })
}
```

```javascript
// api/books.js
import { getCachedData, setCachedData } from '@/utils/cache'

export const booksAPI = {
  async getList(params) {
    const cacheKey = `books_list_${JSON.stringify(params)}`
    
    // 尝试从缓存获取
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    // 发送请求
    const data = await request({
      url: '/books',
      method: 'get',
      params
    })
    
    // 缓存数据
    setCachedData(cacheKey, data)
    
    return data
  }
}
```

### 5.3 请求重试

```javascript
// utils/request.js
service.interceptors.response.use(
  response => response.data,
  async error => {
    const config = error.config
    
    // 如果没有配置重试或已重试过，直接reject
    if (!config || !config.retry || config.__retryCount >= config.retry) {
      return Promise.reject(error)
    }
    
    // 增加重试计数
    config.__retryCount = config.__retryCount || 0
    config.__retryCount += 1
    
    // 延迟重试
    await new Promise(resolve => {
      setTimeout(resolve, config.retryDelay || 1000)
    })
    
    // 重新发送请求
    return service(config)
  }
)
```

```javascript
// 使用重试
booksAPI.getList({
  page: 1,
  retry: 3,           // 重试3次
  retryDelay: 1000    // 每次重试延迟1秒
})
```

## 6. 文件上传

### 6.1 单文件上传

```javascript
// api/upload.js
export const uploadAPI = {
  /**
   * 上传文件
   * @param {File} file - 文件对象
   * @param {Function} onProgress - 进度回调
   * @returns {Promise}
   */
  uploadFile(file, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    
    return request({
      url: '/upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress && onProgress(percent)
      }
    })
  }
}
```

```vue
<template>
  <el-upload
    :action="uploadUrl"
    :http-request="customUpload"
    :on-progress="handleProgress"
  >
    <el-button type="primary">上传文件</el-button>
  </el-upload>
</template>

<script setup>
import { uploadAPI } from '@/api/upload'

const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/upload'

const customUpload = async ({ file, onProgress }) => {
  try {
    const response = await uploadAPI.uploadFile(file, percent => {
      onProgress({ percent })
    })
    
    ElMessage.success('上传成功')
    return response
  } catch (error) {
    ElMessage.error('上传失败')
    throw error
  }
}

const handleProgress = (event, file) => {
  console.log(`上传进度: ${file.percentage}%`)
}
</script>
```

### 6.2 分片上传

```javascript
// api/upload.js
export const uploadAPI = {
  /**
   * 分片上传大文件
   * @param {File} file - 文件对象
   * @param {Function} onProgress - 进度回调
   * @returns {Promise}
   */
  async uploadLargeFile(file, onProgress) {
    const chunkSize = 5 * 1024 * 1024 // 5MB per chunk
    const chunks = Math.ceil(file.size / chunkSize)
    const fileHash = await calculateFileHash(file)
    
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('hash', fileHash)
      formData.append('index', i)
      formData.append('total', chunks)
      
      await request({
        url: '/upload/chunk',
        method: 'post',
        data: formData
      })
      
      onProgress && onProgress(Math.round((i + 1) / chunks * 100))
    }
    
    // 合并分片
    return request({
      url: '/upload/merge',
      method: 'post',
      data: {
        hash: fileHash,
        filename: file.name,
        total: chunks
      }
    })
  }
}
```

## 7. 错误处理

### 7.1 统一错误处理

```javascript
// utils/errorHandler.js
export function handleAPIError(error) {
  if (error.response) {
    // 服务器返回错误
    const status = error.response.status
    const message = error.response.data?.message || '请求失败'
    
    switch (status) {
      case 400:
        ElMessage.error(`请求参数错误: ${message}`)
        break
      case 401:
        ElMessage.error('未授权，请重新登录')
        // 跳转登录
        router.push('/login')
        break
      case 403:
        ElMessage.error('没有权限访问')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器错误，请稍后重试')
        break
      default:
        ElMessage.error(message)
    }
  } else if (error.request) {
    // 请求已发出但没有收到响应
    ElMessage.error('网络错误，请检查网络连接')
  } else {
    // 请求配置错误
    ElMessage.error('请求配置错误')
  }
  
  return Promise.reject(error)
}
```

### 7.2 业务错误处理

```javascript
// api/books.js
export const booksAPI = {
  async create(data) {
    try {
      const result = await request({
        url: '/books',
        method: 'post',
        data
      })
      return result
    } catch (error) {
      // 特定业务错误处理
      if (error.response?.data?.code === 'BOOK_EXISTS') {
        ElMessage.error('书籍已存在')
      } else if (error.response?.data?.code === 'INVALID_DATA') {
        ElMessage.error('数据格式不正确')
      } else {
        handleAPIError(error)
      }
      throw error
    }
  }
}
```

## 8. Mock数据

### 8.1 配置Mock

```javascript
// vite.config.js
import { viteMockServe } from 'vite-plugin-mock'

export default {
  plugins: [
    viteMockServe({
      mockPath: 'mock',
      enable: true
    })
  ]
}
```

### 8.2 创建Mock数据

```javascript
// mock/books.js
export default [
  {
    url: '/api/books',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, size = 20 } = query
      
      return {
        code: 200,
        message: 'success',
        data: {
          list: [
            {
              id: '1',
              title: '示例书籍',
              author: '作者名',
              cover: '/cover.jpg'
            }
          ],
          total: 100,
          page: Number(page),
          size: Number(size)
        }
      }
    }
  },
  
  {
    url: '/api/books/:id',
    method: 'get',
    response: ({ query }) => {
      return {
        code: 200,
        data: {
          id: query.id,
          title: '书籍详情',
          author: '作者',
          description: '这是一本很好的书'
        }
      }
    }
  }
]
```

## 9. 环境配置

### 9.1 环境变量

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_USE_MOCK=false

# .env.production
VITE_API_BASE_URL=https://api.qingyu.com/api/v1
VITE_USE_MOCK=false
```

### 9.2 动态API地址

```javascript
// utils/request.js
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 或根据环境动态设置
const baseURL = import.meta.env.PROD
  ? 'https://api.qingyu.com/api/v1'
  : 'http://localhost:8080/api/v1'
```

## 10. 最佳实践

### 10.1 API命名规范

```javascript
// ✅ 好的命名
booksAPI.getList()
booksAPI.getDetail(id)
booksAPI.create(data)
booksAPI.update(id, data)
booksAPI.delete(id)

// ❌ 不好的命名
booksAPI.get()
booksAPI.fetch()
booksAPI.add()
```

### 10.2 参数验证

```javascript
export const booksAPI = {
  getDetail(id) {
    if (!id) {
      return Promise.reject(new Error('书籍ID不能为空'))
    }
    
    return request({
      url: `/books/${id}`,
      method: 'get'
    })
  }
}
```

### 10.3 返回数据格式化

```javascript
export const booksAPI = {
  async getList(params) {
    const response = await request({
      url: '/books',
      method: 'get',
      params
    })
    
    // 格式化返回数据
    return {
      list: response.list || [],
      total: response.total || 0,
      hasMore: response.hasMore || false
    }
  }
}
```

## 11. 参考资料

- [Axios官方文档](https://axios-http.com/)
- [状态管理架构](../../architecture/状态管理架构.md)
- [组件开发指南](./组件开发指南.md)

---

**文档版本**：v1.0.0  
**创建时间**：2025年10月13日  
**最后更新**：2025年10月13日  
**维护者**：前端团队

