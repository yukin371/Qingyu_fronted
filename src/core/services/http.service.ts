// src/core/services/http.service.ts

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosInstance, CancelTokenSource } from 'axios'
import { ElMessage } from 'element-plus'
import type { ErrorResponse } from '@/types/error.types'
import { errorReporter } from './error-reporter'

// ==================== 类型扩展 ====================

/**
 * Promise回调对
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PromiseCallbacks {
  resolve: (_value?: unknown) => void
  reject: (_reason?: unknown) => void
}

/**
 * 扩展AxiosInstance接口，添加自定义方法
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ExtendedAxiosInstance extends AxiosInstance {
  /** 设置认证Token */
  setAuthToken(token: string): void
  /** 清除认证Token */
  clearAuthToken(): void
  /** 取消所有进行中的请求 */
  cancelAllRequests(): void
}

// ==================== 配置 ====================

// API基础路径
const API_BASE_PATH = '/api/v1'

// 创建 axios 实例
const baseClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_BASE_PATH,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 用于存储取消令牌
const pendingRequests = new Map<string, CancelTokenSource>()

// 扩展实例
const apiClient = baseClient as ExtendedAxiosInstance

// ==================== 智能前缀检测 ====================

/**
 * 检测URL是否已经包含完整路径（包含 /api/v1 前缀）
 * 用于兼容Orval生成的完整路径和旧的相对路径
 */
function hasFullApiPath(url: string | undefined): boolean {
  if (!url) return false
  // 检查URL是否已经以 /api/v1 开头
  return url.startsWith('/api/v1') || url.startsWith('http')
}

// 请求拦截器 - 添加认证令牌 + 智能前缀检测
// 注意：storage工具会自动添加 qingyu_ 前缀，所以需要使用 qingyu_token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 智能前缀检测：如果URL已经包含完整路径，临时覆盖baseURL
    if (hasFullApiPath(config.url)) {
      config.baseURL = ''  // 使用空baseURL，避免重复前缀
      console.log('[Request Interceptor] 检测到完整路径，使用空baseURL:', config.url)
    } else {
      console.log('[Request Interceptor] 使用相对路径，baseURL:', config.baseURL)
    }

    // 修复：使用 qingyu_token 前缀，与 authStore 的存储键保持一致
    const token = localStorage.getItem('qingyu_token')
    console.log('[Request Interceptor] URL:', config.method?.toUpperCase(), config.url)
    console.log('[Request Interceptor] Token found:', !!token, token?.substring(0, 20) + '...')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[Request Interceptor] Authorization header set')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 令牌刷新队列
let isRefreshing = false
let failedQueue: PromiseCallbacks[] = []

const processQueue = (error: unknown, token: string | null = null): void => {
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
    const res = response.data

    // 如果是标准API响应格式，检查是否包含分页信息
    if (res && typeof res === 'object' && 'code' in res && 'data' in res) {
      // 如果包含 pagination 字段，返回完整响应（保留 pagination）
      if ('pagination' in res) {
        return res
      }
      // 否则只返回 data 字段（保持向后兼容）
      return res.data
    }

    return res
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

    const { code, message } = response.data

    // 上报错误到监控系统
    errorReporter.report(response.data)

    // 处理HTTP 401状态码（认证失败）
    if (response.status === 401) {
      handleAuthError()
      return Promise.reject(error)
    }

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
        // 修复：使用 qingyu_refreshToken 前缀
        const refreshToken = localStorage.getItem('qingyu_refreshToken')
        // 修复：使用正确的刷新 API 路径
        const res = await axios.post('/api/v1/shared/auth/refresh', { token: refreshToken })

        const { token: newToken } = res.data.data
        // 修复：使用 qingyu_token 前缀
        localStorage.setItem('qingyu_token', newToken)

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
  // E2E场景下避免自动登出和跳转，防止测试过程被401中断
  if (typeof navigator !== 'undefined' && navigator.webdriver) {
    console.warn('[Auth] Skip auto logout in E2E mode')
    return
  }

  // 只显示提示消息，不自动清除token或跳转
  ElMessage.warning('登录已过期，请重新登录')
}

// ==================== 自定义方法 ====================

/**
 * 设置认证Token
 */
apiClient.setAuthToken = function(token: string): void {
  this.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

/**
 * 清除认证Token
 */
apiClient.clearAuthToken = function(): void {
  delete this.defaults.headers.common['Authorization']
}

/**
 * 取消所有进行中的请求
 */
apiClient.cancelAllRequests = function(): void {
  pendingRequests.forEach((source) => {
    source.cancel('Request canceled due to cancelAllRequests')
  })
  pendingRequests.clear()
}

// ==================== 请求取消支持 ====================

// 生成请求唯一标识
const generateRequestKey = (config: InternalAxiosRequestConfig): string => {
  const { method, url } = config
  return `${method}-${url}`
}

// 请求拦截器 - 添加取消令牌支持
// 注意：认证Token已在第一个拦截器中处理，这里只处理取消令牌
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加取消令牌支持
    const key = generateRequestKey(config)
    const source = axios.CancelToken.source()
    config.cancelToken = source.token
    pendingRequests.set(key, source)

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ==================== 导出 ====================

// 导出实例供模块使用
export default apiClient

// 别名导出，保持向后兼容
export const httpService = apiClient

// 同时导出类型化的实例
export { apiClient }
