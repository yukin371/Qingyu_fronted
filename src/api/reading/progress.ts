/**
 * 阅读进度相关API
 *
 * 对接后端 /api/v1/reader/progress 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'

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
 * 获取书籍阅读进度
 * GET /api/v1/reader/progress/:bookId
 */
export function getReadingProgress(bookId: string) {
  return httpService.get<ReadingProgress>(`/reader/progress/${bookId}`)
}

/**
 * 保存阅读进度
 * POST /api/v1/reader/progress
 */
export function saveReadingProgress(data: {
  bookId: string
  chapterId: string
  chapterNumber: number
  progress: number
}) {
  return httpService.post<void>('/reader/progress', data)
}

/**
 * 更新阅读时长
 * POST /api/v1/reader/progress/time
 */
export function updateReadingTime(data: {
  bookId: string
  chapterId: string
  duration: number // 秒
}) {
  return httpService.post<void>('/reader/progress/time', data)
}

/**
 * 获取最近阅读
 * GET /api/v1/reader/progress/recent
 */
export function getRecentReading() {
  return httpService.get<ReadingProgress[]>('/reader/progress/recent')
}

/**
 * 获取阅读历史
 * GET /api/v1/reader/progress/history
 */
export function getReadingHistory(params?: { page?: number; pageSize?: number }) {
  return httpService.get<ReadingProgress[]>('/reader/progress/history', { params })
}

/**
 * 获取阅读统计
 * GET /api/v1/reader/progress/stats
 */
export function getReadingStats() {
  return httpService.get<ReadingStats>('/reader/progress/stats')
}

/**
 * 获取未读完的书籍
 * GET /api/v1/reader/progress/unfinished
 */
export function getUnfinishedBooks() {
  return httpService.get<ReadingProgress[]>('/reader/progress/unfinished')
}

/**
 * 获取已读完的书籍
 * GET /api/v1/reader/progress/finished
 */
export function getFinishedBooks() {
  return httpService.get<ReadingProgress[]>('/reader/progress/finished')
}
