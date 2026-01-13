/**
 * 阅读历史相关 API
 * 对接后端 /api/v1/reader/reading-history 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 阅读历史记录
 */
export interface ReadingHistory {
  id: string
  bookId: string
  chapterId: string
  position: number
  duration?: number
  timestamp: string
}

/**
 * 阅读 API 接口 (v1.0)
 * 对接后端: /api/v1/reader/reading-history
 */
export const historyAPI = {
  /**
   * 获取阅读历史列表
   * GET /api/v1/reader/reading-history
   */
  async getReadingHistories(params?: {
    page?: number
    pageSize?: number
    sortBy?: string
    period?: string
    keyword?: string
    startDate?: string
    endDate?: string
  }): Promise<PaginatedResponse<ReadingHistory>> {
    return httpService.get<PaginatedResponse<ReadingHistory>>(
      '/reader/reading-history',
      { params }
    )
  },

  /**
   * 记录阅读历史
   * POST /api/v1/reader/reading-history
   */
  async recordReadingHistory(data: {
    bookId: string
    chapterId: string
    position: number
    duration?: number
  }): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>('/reader/reading-history', data)
  },

  /**
   * 删除阅读历史
   * DELETE /api/v1/reader/reading-history/:id
   */
  async deleteHistory(historyId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/reader/reading-history/${historyId}`)
  },

  /**
   * 批量删除历史记录
   * DELETE /api/v1/reader/reading-history (批量)
   */
  async batchDeleteHistory(historyIds: string[]): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>('/reader/reading-history', {
      data: { ids: historyIds }
    })
  },

  /**
   * 清空所有阅读历史
   * DELETE /api/v1/reader/reading-history
   */
  async clearHistories(): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>('/reader/reading-history')
  },

  /**
   * 获取阅读统计
   * GET /api/v1/reader/reading-history/stats
   */
  async getReadingStats(): Promise<APIResponse<{
    totalBooks: number
    finishedBooks: number
    unfinishedBooks: number
    totalReadingTime: number
    todayReadingTime: number
  }>> {
    return httpService.get<APIResponse<any>>('/reader/reading-history/stats')
  }
}

// 向后兼容：导出旧的函数名
export const getReadingHistories = (params?: any) => historyAPI.getReadingHistories(params)
export const recordReadingHistory = (data: any) => historyAPI.recordReadingHistory(data)
export const deleteHistory = (id: string) => historyAPI.deleteHistory(id)
export const batchDeleteHistory = (ids: string[]) => historyAPI.batchDeleteHistory(ids)
export const clearAllHistory = () => historyAPI.clearHistories()
export const clearHistory = () => historyAPI.clearHistories()
export const getBookProgress = (bookId: string) => historyAPI.getReadingHistories({ bookId })
export const updateReadingProgress = (data: any) => historyAPI.recordReadingHistory(data)

export default historyAPI
