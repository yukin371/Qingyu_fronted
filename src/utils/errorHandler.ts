/**
 * 全局错误处理工具
 */
import { ElMessage, ElNotification } from 'element-plus'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'

export interface ErrorOptions {
  showMessage?: boolean // 是否显示错误消息
  messageType?: 'message' | 'notification' // 消息显示类型
  silent?: boolean // 静默模式（不显示任何提示）
  logToConsole?: boolean // 是否打印到控制台
  onError?: (error: AppError) => void // 自定义错误处理
}

export enum ErrorCode {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // 业务错误
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // 服务器错误
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // 其他错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  code: ErrorCode
  message: string
  details?: any
  statusCode?: number
  timestamp: number
}

/**
 * 错误处理类
 */
export class ErrorHandler {
  private static defaultOptions: ErrorOptions = {
    showMessage: true,
    messageType: 'message',
    silent: false,
    logToConsole: true
  }

  /**
   * 处理错误
   */
  static handle(error: any, options: ErrorOptions = {}): AppError {
    const opts = { ...this.defaultOptions, ...options }
    const appError = this.parseError(error)

    // 打印到控制台
    if (opts.logToConsole && !opts.silent) {
      console.error('[Error Handler]', appError)
    }

    // 显示错误消息
    if (opts.showMessage && !opts.silent) {
      this.showError(appError, opts.messageType!)
    }

    // 自定义错误处理
    if (opts.onError) {
      opts.onError(appError)
    }

    return appError
  }

  /**
   * 解析错误
   */
  private static parseError(error: any): AppError {
    const timestamp = Date.now()

    // Axios 错误
    if (this.isAxiosError(error)) {
      return this.parseAxiosError(error, timestamp)
    }

    // API 响应错误
    if (this.isApiError(error)) {
      return this.parseApiError(error, timestamp)
    }

    // 普通错误对象
    if (error instanceof Error) {
      return {
        code: ErrorCode.UNKNOWN_ERROR,
        message: error.message,
        details: error.stack,
        timestamp
      }
    }

    // 字符串错误
    if (typeof error === 'string') {
      return {
        code: ErrorCode.UNKNOWN_ERROR,
        message: error,
        timestamp
      }
    }

    // 未知错误
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: '发生未知错误',
      details: error,
      timestamp
    }
  }

  /**
   * 解析 Axios 错误
   */
  private static parseAxiosError(error: AxiosError, timestamp: number): AppError {
    const statusCode = error.response?.status

    // 网络错误
    if (!error.response) {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: error.message || '网络连接失败，请检查网络设置',
        timestamp
      }
    }

    // 根据状态码解析
    switch (statusCode) {
      case 400:
        return {
          code: ErrorCode.BAD_REQUEST,
          message: '请求参数错误',
          statusCode,
          details: error.response.data,
          timestamp
        }
      case 401:
        return {
          code: ErrorCode.UNAUTHORIZED,
          message: '未登录或登录已过期，请重新登录',
          statusCode,
          timestamp
        }
      case 403:
        return {
          code: ErrorCode.FORBIDDEN,
          message: '没有权限访问此资源',
          statusCode,
          timestamp
        }
      case 404:
        return {
          code: ErrorCode.NOT_FOUND,
          message: '请求的资源不存在',
          statusCode,
          timestamp
        }
      case 409:
        return {
          code: ErrorCode.CONFLICT,
          message: '资源冲突',
          statusCode,
          details: error.response.data,
          timestamp
        }
      case 422:
        return {
          code: ErrorCode.VALIDATION_ERROR,
          message: '数据验证失败',
          statusCode,
          details: error.response.data,
          timestamp
        }
      case 500:
        return {
          code: ErrorCode.SERVER_ERROR,
          message: '服务器内部错误',
          statusCode,
          timestamp
        }
      case 503:
        return {
          code: ErrorCode.SERVICE_UNAVAILABLE,
          message: '服务暂时不可用，请稍后再试',
          statusCode,
          timestamp
        }
      default:
        return {
          code: ErrorCode.UNKNOWN_ERROR,
          message: `请求失败 (${statusCode})`,
          statusCode,
          details: error.response.data,
          timestamp
        }
    }
  }

  /**
   * 解析 API 响应错误
   */
  private static parseApiError(error: ApiResponse, timestamp: number): AppError {
    return {
      code: ErrorCode.BAD_REQUEST,
      message: error.message || '操作失败',
      statusCode: error.code,
      details: error,
      timestamp
    }
  }

  /**
   * 显示错误消息
   */
  private static showError(error: AppError, type: 'message' | 'notification') {
    const message = this.getErrorMessage(error)

    if (type === 'notification') {
      ElNotification.error({
        title: '错误',
        message,
        duration: 4000
      })
    } else {
      ElMessage.error({
        message,
        duration: 3000
      })
    }
  }

  /**
   * 获取用户友好的错误消息
   */
  private static getErrorMessage(error: AppError): string {
    // 对于某些错误，可以提供更友好的提示
    switch (error.code) {
      case ErrorCode.NETWORK_ERROR:
        return '网络连接失败，请检查网络设置'
      case ErrorCode.TIMEOUT:
        return '请求超时，请稍后重试'
      case ErrorCode.UNAUTHORIZED:
        return '登录已过期，请重新登录'
      case ErrorCode.FORBIDDEN:
        return '没有权限执行此操作'
      case ErrorCode.NOT_FOUND:
        return '请求的内容不存在'
      case ErrorCode.SERVER_ERROR:
        return '服务器错误，请稍后重试'
      case ErrorCode.SERVICE_UNAVAILABLE:
        return '服务暂时不可用，请稍后重试'
      default:
        return error.message || '操作失败，请稍后重试'
    }
  }

  /**
   * 判断是否为 Axios 错误
   */
  private static isAxiosError(error: any): error is AxiosError {
    return error?.isAxiosError === true
  }

  /**
   * 判断是否为 API 错误
   */
  private static isApiError(error: any): error is ApiResponse {
    return (
      typeof error === 'object' &&
      'code' in error &&
      'message' in error &&
      'data' in error
    )
  }
}

/**
 * 全局错误处理函数（便捷方法）
 */
export function handleError(error: any, options?: ErrorOptions): AppError {
  return ErrorHandler.handle(error, options)
}

/**
 * 静默处理错误（不显示提示）
 */
export function handleErrorSilently(error: any): AppError {
  return ErrorHandler.handle(error, {
    silent: true,
    logToConsole: true
  })
}

/**
 * 异步错误包装器
 */
export async function catchAsync<T>(
  promise: Promise<T>,
  options?: ErrorOptions
): Promise<[AppError | null, T | null]> {
  try {
    const data = await promise
    return [null, data]
  } catch (error) {
    const appError = ErrorHandler.handle(error, options)
    return [appError, null]
  }
}

/**
 * 重试包装器
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000 } = options
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }

  throw lastError
}

/**
 * Vue 错误处理器
 */
export function createVueErrorHandler() {
  return (err: Error, instance: any, info: string) => {
    console.error('[Vue Error]', {
      error: err,
      component: instance?.$options?.name || 'Unknown',
      info
    })

    handleError(err, {
      messageType: 'notification',
      showMessage: true
    })
  }
}

/**
 * Promise 拒绝处理器
 */
export function createPromiseRejectionHandler() {
  return (event: PromiseRejectionEvent) => {
    console.error('[Unhandled Promise Rejection]', event.reason)

    handleError(event.reason, {
      messageType: 'notification',
      showMessage: false,
      logToConsole: true
    })
  }
}

