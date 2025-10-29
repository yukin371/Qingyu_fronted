/**
 * 阅读器相关API
 * 章节、阅读设置、阅读历史、阅读进度
 */

import request from '@/utils/request'
import type {
  Chapter,
  ChapterContent,
  ReaderSettings,
  ReadingHistory,
  ReadingStats,
  ReadingProgress,
} from '@/types/reader'
import type { PaginationResponse } from '@/types/api'

// ============ 章节阅读 ============

/**
 * 获取章节信息
 * GET /api/v1/reader/chapters/:id
 */
export function getChapterInfo(chapterId: string) {
  return request.get<Chapter>(`/reader/chapters/${chapterId}`)
}

/**
 * 获取章节内容
 * GET /api/v1/reader/chapters/:id/content
 */
export function getChapterContent(chapterId: string) {
  return request.get<ChapterContent>(`/reader/chapters/${chapterId}/content`)
}

/**
 * 获取章节列表
 * GET /api/v1/reader/chapters
 */
export function getChapterList(params: { bookId: string; page?: number; pageSize?: number }) {
  return request.get<PaginationResponse<Chapter>>('/reader/chapters', { params })
}

// ============ 阅读设置 ============

/**
 * 获取阅读设置
 * GET /api/v1/reader/settings
 */
export function getReaderSettings() {
  return request.get<ReaderSettings>('/reader/settings')
}

/**
 * 保存阅读设置
 * POST /api/v1/reader/settings
 */
export function saveReaderSettings(data: Partial<ReaderSettings>) {
  return request.post<ReaderSettings>('/reader/settings', data)
}

/**
 * 更新阅读设置
 * PUT /api/v1/reader/settings
 */
export function updateReaderSettings(data: Partial<ReaderSettings>) {
  return request.put<ReaderSettings>('/reader/settings', data)
}

// ============ 阅读历史 ============

/**
 * 记录阅读历史
 * POST /api/v1/reader/reading-history
 */
export function recordReadingHistory(data: {
  bookId: string
  chapterId: string
  progress: number
  readDuration?: number
}) {
  return request.post<void>('/reader/reading-history', data)
}

/**
 * 获取阅读历史列表
 * GET /api/v1/reader/reading-history
 */
export function getReadingHistory(params?: { page?: number; pageSize?: number }) {
  return request.get<PaginationResponse<ReadingHistory>>('/reader/reading-history', { params })
}

/**
 * 获取阅读统计
 * GET /api/v1/reader/reading-history/stats
 */
export function getReadingStats() {
  return request.get<ReadingStats>('/reader/reading-history/stats')
}

/**
 * 删除阅读历史记录
 * DELETE /api/v1/reader/reading-history/:id
 */
export function deleteReadingHistory(historyId: string) {
  return request.delete<void>(`/reader/reading-history/${historyId}`)
}

/**
 * 清空阅读历史
 * DELETE /api/v1/reader/reading-history
 */
export function clearReadingHistory() {
  return request.delete<void>('/reader/reading-history')
}

// ============ 阅读进度 ============

/**
 * 获取阅读进度
 * GET /api/v1/reader/progress
 */
export function getReadingProgress(bookId: string) {
  return request.get<ReadingProgress>('/reader/progress', {
    params: { bookId },
  })
}

