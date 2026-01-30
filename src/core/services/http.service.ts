/**
 * HTTP Service Optimized
 * Unified HTTP client wrapper with strict typing, retry logic, and enhanced features.
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig, // 拦截器里用这个
  type AxiosResponse,
  type AxiosRequestConfig, // 公开方法参数用这个
} from 'axios'
import { message } from '@/design-system/services'
import { useAuthStore } from '@/stores/auth' // 引入 Pinia
import { ErrorHandler } from '@/utils/errorHandler'
import type { APIResponse } from '@/types/api' // 引入统一类型
import { convertObjectKeysToCamelCase } from '@/utils/caseConverter' // 引入字段名转换工具
import { errorReporter } from './error-reporter' // 引入错误上报服务
import { getApiBaseUrl } from '@/config/apiVersions' // 引入API版本配置

// 扩展 Axios 请求配置
export interface RequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean // 是否跳过全局错误提示
  silent?: boolean // 是否静默模式（不弹窗）
  deduplicate?: boolean // 是否开启防抖/去重
  retry?: number // 失败重试次数
  retryDelay?: number // 重试延迟(ms)
  returnFullResponse?: boolean // 是否返回完整的 AxiosResponse (包含 headers 等)
  isUpload?: boolean // 是否是文件上传
  keepCache?: boolean // 是否保持缓存
  skipCaseConversion?: boolean // 是否跳过字段名转换（snake_case -> camelCase）
}

class HttpService {
  private instance: AxiosInstance
  private pendingRequests: Map<string, AbortController>

  constructor() {
    this.pendingRequests = new Map()
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || getApiBaseUrl(),
      timeout: 10000,
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
    })
    this.setupInterceptors()
  }

  /**
   * 生成请求的唯一 Key
   * 优化：包含 method, url, params 和 data，并对对象键进行排序以保证一致性
   */
  private getRequestKey(config: InternalAxiosRequestConfig): string {
    const { method, url, params, data } = config

    // 辅助函数：对对象键排序并序列化
    const sortedStringify = (obj: any) =>
      obj && typeof obj === 'object' ? JSON.stringify(obj, Object.keys(obj).sort()) : String(obj)
    return [method, url, sortedStringify(params), sortedStringify(data)].join('&')
  }

  /**
   * 检查废弃API响应头
   */
  private checkDeprecatedAPI(response: AxiosResponse) {
    const deprecated = response.headers['x-api-deprecated']
    const sunsetDate = response.headers['x-api-sunset-date']
    const warning = response.headers['warning']

    if (deprecated || sunsetDate || warning) {
      const warningMsg = `[HTTP] API已废弃: ${response.config.url}`
      console.warn(warningMsg, {
        deprecated,
        sunsetDate,
        warning
      })

      // 发送到错误监控系统
      errorReporter.report({
        code: 9999,  // 自定义错误码：API已废弃
        message: `API已废弃: ${response.config.url}`,
        details: JSON.stringify({
          deprecated,
          sunsetDate,
          warning,
          url: response.config.url
        }),
        timestamp: Date.now()
      })
    }
  }

  private setupInterceptors(): void {
    // Request 拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 0. 自动添加 /api/v1 前缀（如果路径以 / 开头但不是 /api/v1）
        if (config.url && config.url.startsWith('/') && !config.url.startsWith('/api/v1') && !config.url.startsWith('/socket.io')) {
          config.url = `/api/v1${config.url}`
        }

        // 1. 自动注入 Token
        const authStore = useAuthStore()
        if (authStore.token && config.headers) {
          config.headers.Authorization = `Bearer ${authStore.token}`
        }

        // 2. 处理去重
        if (config.deduplicate) {
          const key = this.getRequestKey(config)
          if (this.pendingRequests.has(key)) {
            this.pendingRequests.get(key)?.abort()
            this.pendingRequests.delete(key)
          }
          const controller = new AbortController()
          config.signal = controller.signal
          this.pendingRequests.set(key, controller)
        }

        // 3. GET 缓存控制
        if (config.method?.toLowerCase() === 'get' && !config.keepCache) {
          config.params = { ...config.params, _t: Date.now() }
        }

        // 4. 上传处理
        if (config.isUpload && config.headers) {
          config.headers['Content-Type'] = 'multipart/form-data'
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // Response 拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        const config = response.config

        // 检查废弃API
        this.checkDeprecatedAPI(response)

        // 清理去重 Map
        if (config.deduplicate) {
          const key = this.getRequestKey(config)
          this.pendingRequests.delete(key)
        }

        const { data } = response

        // 二进制流直接返回
        if (config.responseType === 'blob' || config.responseType === 'arraybuffer') {
          return data
        }

        // 兼容逻辑：如果 data 不是标准结构，直接返回
        if (!data || typeof data !== 'object' || !('code' in data)) {
          return data
        }

        // 手动映射顶层字段（snake_case -> camelCase）
        const apiData: APIResponse = {
          code: data.code,
          message: data.message,
          data: data.data,
          timestamp: data.timestamp,
          requestId: data.request_id  // request_id -> requestId
        }

        // 打印日志
        if (import.meta.env.DEV && apiData.requestId) {
          console.debug(`[API] ${apiData.requestId}`, apiData)
        }

        // 成功判定 (后端规范：成功码=0)
        const code = apiData.code
        const isSuccess = code === 0  // 后端规范：成功码=0，不接受HTTP状态码200-299
        if (isSuccess) {
          // ★ 关键决策：
          // 默认只返回 result (data.data)，让组件代码更干净。
          // 如果配置了 returnFullResponse: true，则返回整个 APIResponse

          const dataToReturn = config.returnFullResponse ? apiData : apiData.data

          // 递归转换data字段（snake_case -> camelCase）
          // 注意：跳过某些已知已经使用camelCase的API
          const skipConversion = config.skipCaseConversion || false

          if (!skipConversion && dataToReturn && typeof dataToReturn === 'object') {
            try {
              // 对data字段进行递归转换
              if (config.returnFullResponse) {
                // 如果返回完整响应，只转换data部分
                const converted = convertObjectKeysToCamelCase(dataToReturn.data)
                return {
                  ...dataToReturn,
                  data: converted
                }
              } else {
                // 直接返回转换后的data
                return convertObjectKeysToCamelCase(dataToReturn)
              }
            } catch (error) {
              // 转换失败时返回原始数据
              console.warn('[HTTP] 字段名转换失败，返回原始数据:', error)
              return dataToReturn
            }
          }

          return dataToReturn
        }

        // 业务错误处理
        return this.handleBusinessError(apiData, config)
      },
      (error: AxiosError) => {
        // 上报网络错误到监控系统（仅生产环境）
        if (import.meta.env.PROD && error.response?.data) {
          const errorResponse = {
            code: error.response.status,
            message: error.message,
            error: 'NETWORK_ERROR',
            timestamp: Math.floor(Date.now() / 1000)
          }
          errorReporter.report(errorResponse)
        }

        // 401 认证失败处理
        if (error.response?.status === 401) {
          const authStore = useAuthStore()

          // 判断是否为登录请求，避免登录失败时触发登出
          const isLoginRequest = error.config?.url?.includes('/login')
          const isRegisterRequest = error.config?.url?.includes('/register')

          // 只有在非登录/注册请求的401时才自动登出（表示token过期）
          if (!isLoginRequest && !isRegisterRequest && authStore.isLoggedIn) {
            authStore.logout()
          }
        }

        // 统一错误处理
        if (!error.config?.skipErrorHandler) {
          ErrorHandler.handle(error)
        }
        return Promise.reject(error)
      }
    )
  }

  private handleBusinessError(data: APIResponse, config: InternalAxiosRequestConfig) {
    const err = new Error(data.message) as any
    err.code = data.code

    // 上报错误到监控系统（仅生产环境）
    if (import.meta.env.PROD) {
      const errorResponse = {
        code: data.code,
        message: data.message,
        error: data.code.toString(),
        timestamp: data.timestamp || Math.floor(Date.now() / 1000),
        requestId: data.requestId  // 添加requestId字段
      }
      errorReporter.report(errorResponse)
    }

    if (!config.silent && !config.skipErrorHandler) {
      message.error(data.message)
    }
    return Promise.reject(err)
  }

  // --- 公开方法 (使用泛型 T 指代业务 Data 类型) ---

  public get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
    return this.instance.get(url, { params, ...config })
  }

  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  public delete<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
    return this.instance.delete(url, { params, ...config })
  }

  public patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.patch(url, data, config)
  }

  /**
   * 设置认证令牌
   */
  public setAuthToken(token: string): void {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  /**
   * 清除认证令牌
   */
  public clearAuthToken(): void {
    delete this.instance.defaults.headers.common['Authorization']
  }

  /**
   * 文件上传封装
   */
  public upload<T = any>(
    url: string,
    file: File | FormData,
    config?: InternalAxiosRequestConfig
  ): Promise<T> {
    let formData: FormData
    if (!(file instanceof FormData)) {
      formData = new FormData()
      formData.append('file', file)
    } else {
      formData = file
    }
    return this.instance.post(url, formData, {
      ...config,
      isUpload: true,
      timeout: config?.timeout || 60000, // 上传通常需要更长时间
    } as RequestConfig)
  }

  public cancelAllRequests(): void {
    this.pendingRequests.forEach((controller) => controller.abort())
    this.pendingRequests.clear()
  }

  public getInstance(): AxiosInstance {
    return this.instance
  }
}

// 扩展 axios 模块声明，加入自定义配置属性
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    skipErrorHandler?: boolean
    silent?: boolean
    deduplicate?: boolean
    retry?: number
    retryDelay?: number
    returnFullResponse?: boolean
    isUpload?: boolean // 是否为文件上传
    keepCache?: boolean
    skipCaseConversion?: boolean // 是否跳过字段名转换
  }
}

export const httpService = new HttpService()
export default httpService
