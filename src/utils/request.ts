import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { ErrorHandler } from './errorHandler'
import type { APIResponse, PaginatedResponse } from '@/types/api'

// 请求配置接口
export interface RequestConfig extends InternalAxiosRequestConfig {
  skipErrorHandler?: boolean // 跳过错误处理
  silent?: boolean // 静默模式
  deduplicate?: boolean // 去重
}

// 自定义请求实例类型，响应拦截器返回的是提取后的数据，不是 AxiosResponse
export interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> {
  get<T = any>(url: string, config?: any): Promise<T>
  post<T = any>(url: string, data?: any, config?: any): Promise<T>
  put<T = any>(url: string, data?: any, config?: any): Promise<T>
  delete<T = any>(url: string, config?: any): Promise<T>
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>
}

// 创建axios实例
const request = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}) as CustomAxiosInstance

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证token
    const authStore = useAuthStore()
    if (authStore.token && config.headers) {
      config.headers.set('Authorization', `Bearer ${authStore.token}`)
    }

    // 添加请求时间戳，防止缓存
    if ((config.method || 'get').toLowerCase() === 'get') {
      config.params = {
        ...(config.params as Record<string, unknown>),
        _t: Date.now()
      }
    }

    return config
  },
  (error: unknown) => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 (v1.3)
request.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    const { data } = response

    // 统一处理响应格式
    if (data && typeof data === 'object' && 'code' in data) {
      // v1.3: 提取 timestamp 和 request_id
      const { code, message, data: responseData, timestamp, request_id } = data

      // 开发环境：记录 request_id 和时间戳
      if (request_id && import.meta.env.DEV) {
        const time = timestamp ? new Date(timestamp * 1000).toLocaleString() : 'N/A'
        console.debug(`[API] ${request_id} - ${time}`)
      }

      // 2xx状态码都视为成功 (v1.3: 支持 200 和 201)
      if (code === 200 || code === 201 || (code >= 200 && code < 300)) {
        // 返回完整响应对象（包含code, message, data等）
        // 这样前端可以统一处理响应
        return data
      } else {
        // 业务错误
        const config = response.config as RequestConfig
        if (!config.skipErrorHandler && !config.silent) {
          ElMessage.error(message || '请求失败')
        }

        // v1.3: 错误中包含 request_id 便于追踪
        const error = new Error(message || '请求失败') as any
        error.code = code
        error.request_id = request_id
        error.timestamp = timestamp
        return Promise.reject(error)
      }
    }

    // 直接返回数据（向后兼容）
    return data
  },
  (error: AxiosError<any>) => {
    const config = error.config as RequestConfig

    // v1.3: 记录错误中的 request_id
    const { request_id } = error.response?.data || {}
    if (request_id && import.meta.env.DEV) {
      console.error(`[API Error] ${request_id}`, error.response?.data)
    }

    // 跳过错误处理
    if (config?.skipErrorHandler) {
      return Promise.reject(error)
    }

    // 使用统一错误处理器
    const appError = ErrorHandler.handle(error, {
      silent: config?.silent,
      showMessage: !config?.silent,
      onError: () => {
        // 401错误特殊处理：清除token并跳转登录
        if (error.response?.status === 401) {
          const authStore = useAuthStore()
          authStore.logout()
        }
      }
    })

    return Promise.reject(appError)
  }
)

export default request


