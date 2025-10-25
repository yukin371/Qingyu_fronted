/**
 * HTTP Service
 * Core HTTP client wrapper with enhanced features
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { ElMessage } from 'element-plus'
import { apiConfig } from '../config/api.config'
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants'
import { ErrorHandler } from '@/utils/errorHandler'

export interface RequestConfig extends InternalAxiosRequestConfig {
  skipErrorHandler?: boolean
  silent?: boolean
  deduplicate?: boolean
  retry?: number
}

export interface APIResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
  request_id?: string
}

class HttpService {
  private instance: AxiosInstance
  private pendingRequests: Map<string, AbortController>

  constructor() {
    this.pendingRequests = new Map()

    this.instance = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add timestamp to prevent caching for GET requests
        if ((config.method || 'get').toLowerCase() === 'get') {
          config.params = {
            ...(config.params as Record<string, unknown>),
            _t: Date.now()
          }
        }

        // Handle request deduplication
        const requestConfig = config as RequestConfig
        if (requestConfig.deduplicate) {
          const requestKey = this.getRequestKey(config)

          // Cancel previous identical request
          if (this.pendingRequests.has(requestKey)) {
            this.pendingRequests.get(requestKey)?.abort()
          }

          // Create new abort controller
          const controller = new AbortController()
          config.signal = controller.signal
          this.pendingRequests.set(requestKey, controller)
        }

        return config
      },
      (error: unknown) => {
        console.error('Request configuration error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        // Clean up pending request
        const requestKey = this.getRequestKey(response.config)
        this.pendingRequests.delete(requestKey)

        const { data } = response

        // Handle v1.3 API response format
        if (data && typeof data === 'object' && 'code' in data) {
          const { code, message, data: responseData, timestamp, request_id } = data

          // Log request info in development
          if (request_id && import.meta.env.DEV) {
            const time = timestamp ? new Date(timestamp * 1000).toLocaleString() : 'N/A'
            console.debug(`[API] ${request_id} - ${time}`)
          }

          // Success response (2xx codes)
          if (code === HTTP_STATUS.OK || code === HTTP_STATUS.CREATED || (code >= 200 && code < 300)) {
            return responseData !== undefined ? responseData : data
          } else {
            // Business error
            const config = response.config as RequestConfig
            if (!config.skipErrorHandler && !config.silent) {
              ElMessage.error(message || ERROR_MESSAGES.SERVER_ERROR)
            }

            const error = new Error(message || ERROR_MESSAGES.SERVER_ERROR) as any
            error.code = code
            error.request_id = request_id
            error.timestamp = timestamp
            return Promise.reject(error)
          }
        }

        // Direct data return (backward compatibility)
        return data
      },
      (error: AxiosError<any>) => {
        // Clean up pending request
        const requestKey = this.getRequestKey(error.config)
        this.pendingRequests.delete(requestKey)

        const config = error.config as RequestConfig

        // Log error request_id in development
        const { request_id } = error.response?.data || {}
        if (request_id && import.meta.env.DEV) {
          console.error(`[API Error] ${request_id}`, error.response?.data)
        }

        // Skip error handling if configured
        if (config?.skipErrorHandler) {
          return Promise.reject(error)
        }

        // Use unified error handler
        const appError = ErrorHandler.handle(error, {
          silent: config?.silent,
          showMessage: !config?.silent
        })

        return Promise.reject(appError)
      }
    )
  }

  private getRequestKey(config: any): string {
    return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string): void {
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }

  /**
   * Clear authentication token
   */
  public clearAuthToken(): void {
    delete this.instance.defaults.headers.common['Authorization']
  }

  /**
   * GET request
   */
  public get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.get<T, T>(url, config)
  }

  /**
   * POST request
   */
  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post<T, T>(url, data, config)
  }

  /**
   * PUT request
   */
  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put<T, T>(url, data, config)
  }

  /**
   * PATCH request
   */
  public patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.patch<T, T>(url, data, config)
  }

  /**
   * DELETE request
   */
  public delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.delete<T, T>(url, config)
  }

  /**
   * Get the axios instance
   */
  public getInstance(): AxiosInstance {
    return this.instance
  }

  /**
   * Cancel all pending requests
   */
  public cancelAllRequests(): void {
    this.pendingRequests.forEach((controller) => controller.abort())
    this.pendingRequests.clear()
  }
}

// Export singleton instance
export const httpService = new HttpService()

// Also export the class for testing
export default httpService

