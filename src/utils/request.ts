import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { ErrorHandler } from './errorHandler'

// 请求配置接口
export interface RequestConfig extends InternalAxiosRequestConfig {
  skipErrorHandler?: boolean // 跳过错误处理
  silent?: boolean // 静默模式
  deduplicate?: boolean // 去重
}

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

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

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    const { data } = response

    // 统一处理响应格式
    if (data && typeof data === 'object' && 'code' in data) {
      // 2xx状态码都视为成功
      if (data.code >= 200 && data.code < 300) {
        return data.data ?? data
      } else {
        // 业务错误
        const config = response.config as RequestConfig
        if (!config.skipErrorHandler && !config.silent) {
          ElMessage.error(data.message || '请求失败')
        }
        return Promise.reject(data)
      }
    }

    // 直接返回数据
    return data
  },
  (error: AxiosError<any>) => {
    const config = error.config as RequestConfig

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


