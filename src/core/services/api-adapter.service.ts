/**
 * API适配服务 - 新旧API桥接层
 *
 * 功能：
 * 1. 提供统一的API调用接口
 * 2. 支持降级方案（新API失败时使用旧API）
 * 3. 保持向后兼容
 * 4. 逐步迁移支持
 *
 * @module core/services/api-adapter
 */

import type { APIResponse } from '@/types/api'

// ==================== 类型定义 ====================

/**
 * API适配选项
 */
export interface ApiAdapterOptions {
  /** 是否使用新API（默认true） */
  useNewApi?: boolean
  /** 新API失败时是否降级到旧API（默认true） */
  fallbackToOld?: boolean
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否记录降级事件 */
  logFallback?: boolean
  /** 降级回调函数 */
  onFallback?: (error: Error, usedFallback: boolean) => void
}

/**
 * API适配响应
 */
export interface ApiAdapterResponse<T = any> {
  /** 响应数据 */
  data: T
  /** 是否使用了降级方案 */
  usedFallback: boolean
  /** 使用的API类型 */
  apiType: 'new' | 'old'
}

/**
 * 旧API函数类型
 */
export type LegacyApiFunction<TParams = any, TResult = any> = (
  params: TParams
) => Promise<APIResponse<TResult> | TResult>

/**
 * 新API函数类型
 */
export type NewApiFunction<TParams = any, TResult = any> = (
  params: TParams
) => Promise<TResult>

// ==================== 降级事件记录 ====================

/**
 * 降级事件
 */
interface FallbackEvent {
  timestamp: number
  apiName: string
  error: string
  usedFallback: boolean
}

/**
 * 降级事件记录器
 */
class FallbackEventLogger {
  private events: FallbackEvent[] = []
  private maxEvents = 100

  log(apiName: string, error: Error, usedFallback: boolean): void {
    const event: FallbackEvent = {
      timestamp: Date.now(),
      apiName,
      error: error.message,
      usedFallback,
    }

    this.events.push(event)

    // 限制记录数量
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }
  }

  getEvents(): FallbackEvent[] {
    return [...this.events]
  }

  getStats(): { total: number; fallbackCount: number; fallbackRate: number } {
    const total = this.events.length
    const fallbackCount = this.events.filter((e) => e.usedFallback).length
    const fallbackRate = total > 0 ? fallbackCount / total : 0

    return { total, fallbackCount, fallbackRate }
  }

  clear(): void {
    this.events = []
  }
}

const fallbackLogger = new FallbackEventLogger()

// ==================== API适配服务 ====================

/**
 * API适配服务类
 */
class ApiAdapterService {
  /**
   * 包装新旧API函数，提供自动降级
   */
  wrapApi<TParams = any, TResult = any>(
    newApi: NewApiFunction<TParams, TResult>,
    oldApi?: LegacyApiFunction<TParams, TResult>,
    options: ApiAdapterOptions = {}
  ): (params: TParams) => Promise<ApiAdapterResponse<TResult>> {
    return async (
      params: TParams
    ): Promise<ApiAdapterResponse<TResult>> => {
      const {
        useNewApi = true,
        fallbackToOld = true,
        logFallback = true,
        onFallback,
      } = options

      // 如果不使用新API，直接调用旧API
      if (!useNewApi && oldApi) {
        const data = await oldApi(params)
        return {
          data,
          usedFallback: true,
          apiType: 'old',
        }
      }

      try {
        // 尝试使用新API
        const data = await newApi(params)
        return {
          data,
          usedFallback: false,
          apiType: 'new',
        }
      } catch (error) {
        const err = error as Error

        // 如果配置了旧API且启用降级
        if (oldApi && fallbackToOld) {
          if (logFallback) {
            const apiName = newApi.name || 'wrappedApi'
            fallbackLogger.log(apiName, err, true)
          }

          if (onFallback) {
            onFallback(err, true)
          }

          // 降级到旧API
          const data = await oldApi(params)
          return {
            data,
            usedFallback: true,
            apiType: 'old',
          }
        }

        throw err
      }
    }
  }

  /**
   * 获取降级事件统计
   */
  getFallbackStats(): { total: number; fallbackCount: number; fallbackRate: number } {
    return fallbackLogger.getStats()
  }

  /**
   * 获取降级事件列表
   */
  getFallbackEvents(): FallbackEvent[] {
    return fallbackLogger.getEvents()
  }

  /**
   * 清除降级事件记录
   */
  clearFallbackEvents(): void {
    fallbackLogger.clear()
  }
}

// ==================== 单例导出 ====================

const apiAdapterService = new ApiAdapterService()

export default apiAdapterService
export { ApiAdapterService, FallbackEventLogger }
