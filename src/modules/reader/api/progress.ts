/**
 * 阅读进度相关 API
 * 对接后端 /api/v1/reader/progress 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 阅读进度
 */
export interface ReadingProgress {
  bookId: string
  chapterId: string
  chapterNumber: number
  progress: number // 0-100
  lastReadTime: string
}

/**
 * 阅读统计
 */
export interface ReadingStats {
  totalBooks: number
  finishedBooks: number
  unfinishedBooks: number
  totalReadingTime: number // 分钟
  todayReadingTime: number
}

/**
 * 阅读 API 接口 (v1.0)
 * 对接后端: /api/v1/reader/progress
 */
export const progressAPI = {
  /**
   * 获取书籍阅读进度
   * GET /api/v1/reader/progress/:bookId
   */
  async getReadingProgress(bookId: string): Promise<APIResponse<ReadingProgress>> {
    return httpService.get<APIResponse<ReadingProgress>>(`/reader/progress/${bookId}`)
  },

  /**
   * 保存阅读进度
   * POST /api/v1/reader/progress
   */
  async saveReadingProgress(data: {
    bookId: string
    chapterId: string
    chapterNumber: number
    progress: number
  }): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>('/reader/progress', data)
  },

  /**
   * 更新阅读时长
   * POST /api/v1/reader/progress/time
   */
  async updateReadingTime(data: {
    bookId: string
    chapterId: string
    duration: number // 秒
  }): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>('/reader/progress/time', data)
  },

  /**
   * 获取最近阅读
   * GET /api/v1/reader/progress/recent
   */
  async getRecentReading(): Promise<APIResponse<ReadingProgress[]>> {
    return httpService.get<APIResponse<ReadingProgress[]>>('/reader/progress/recent')
  },

  /**
   * 获取阅读历史
   * GET /api/v1/reader/progress/history
   */
  async getReadingHistory(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<ReadingProgress>> {
    return httpService.get<PaginatedResponse<ReadingProgress>>('/reader/progress/history', {
      params
    })
  },

  /**
   * 获取阅读统计
   * GET /api/v1/reader/progress/stats
   */
  async getReadingStats(): Promise<APIResponse<ReadingStats>> {
    return httpService.get<APIResponse<ReadingStats>>('/reader/progress/stats')
  },

  /**
   * 获取未读完的书籍
   * GET /api/v1/reader/progress/unfinished
   */
  async getUnfinishedBooks(): Promise<APIResponse<ReadingProgress[]>> {
    return httpService.get<APIResponse<ReadingProgress[]>>('/reader/progress/unfinished')
  },

  /**
   * 获取已读完的书籍
   * GET /api/v1/reader/progress/finished
   */
  async getFinishedBooks(): Promise<APIResponse<ReadingProgress[]>> {
    return httpService.get<APIResponse<ReadingProgress[]>>('/reader/progress/finished')
  }
}

// 向后兼容：导出旧的函数名
export const getReadingProgress = (bookId: string) => progressAPI.getReadingProgress(bookId)
export const saveReadingProgress = (data: any) => progressAPI.saveReadingProgress(data)
export const updateReadingTime = (data: any) => progressAPI.updateReadingTime(data)
export const getRecentReading = () => progressAPI.getRecentReading()
export const getReadingHistory = (params?: any) => progressAPI.getReadingHistory(params)
export const getReadingStats = () => progressAPI.getReadingStats()
export const getUnfinishedBooks = () => progressAPI.getUnfinishedBooks()
export const getFinishedBooks = () => progressAPI.getFinishedBooks()

export default progressAPI
