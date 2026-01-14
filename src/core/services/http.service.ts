// src/core/services/http.service.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { Router } from 'vue-router'
import type { ErrorResponse } from '@/types/error.types'

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证令牌
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 令牌刷新队列
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}>[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    // 统一返回 data 字段
    return response.data
  },
  async (error: AxiosError<ErrorResponse>) => {
    const { response, config } = error

    // 网络错误处理
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        ElMessage.error('请求超时，请检查网络连接')
      } else {
        ElMessage.error('网络连接失败，请检查网络')
      }
      return Promise.reject(error)
    }

    const { code, message, error: errorType } = response.data

    // 处理令牌过期 - 尝试刷新
    if (code === 1102 && config) {
      // TOKEN_EXPIRED (1102)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(config)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const res = await axios.post('/api/v1/auth/refresh', { token: refreshToken })

        const { token: newToken } = res.data.data
        localStorage.setItem('token', newToken)

        processQueue(null, newToken)

        return apiClient(config)
      } catch (err) {
        processQueue(err, null)
        handleAuthError()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // 根据错误码分类处理
    switch (code) {
      // 认证错误 - 跳转登录
      case 1002: // UNAUTHORIZED (1002)
      case 1102: // TOKEN_EXPIRED (1102)
      case 1103: // TOKEN_INVALID (1103)
        handleAuthError()
        break

      // 权限错误
      case 1003: // FORBIDDEN (1003)
        ElMessage.error('您没有权限执行此操作')
        break

      // 参数错误
      case 1001: // INVALID_PARAMS (1001)
        ElMessage.warning(message || '参数错误，请检查输入')
        break

      // 资源不存在
      case 1004: // NOT_FOUND (1004)
        ElMessage.warning(message || '请求的资源不存在')
        break

      // 业务逻辑错误
      case 1007: // RATE_LIMIT_EXCEEDED (1007)
        ElMessage.error('操作过于频繁，请稍后再试')
        break

      // 系统错误
      case 5000: // INTERNAL_ERROR (5000)
        ElMessage.error('服务器内部错误，请稍后重试')
        break

      default:
        ElMessage.error(message || '请求失败，请稍后重试')
    }

    return Promise.reject(error)
  }
)

// 处理认证错误
function handleAuthError() {
  ElMessage.warning('登录已过期，请重新登录')
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')

  // 延迟跳转，避免路由拦截器问题
  setTimeout(() => {
    const router = require('@/router').default as Router
    router.push('/login')
  }, 1000)
}

// 导出实例供模块使用
export default apiClient
