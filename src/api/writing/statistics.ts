/**
 * 写作端 - 作品数据统计API
 */

import { httpService } from '@/core/services/http.service'

/**
 * 作品统计概览接口
 */
export interface BookStats {
  totalViews: number // 总阅读量
  subscribers: number // 订阅人数
  favorites: number // 收藏数
  comments: number // 评论数
  todayViews?: number // 今日阅读量
  monthViews?: number // 本月阅读量
  rating?: number // 评分
  wordCount?: number // 总字数
}

/**
 * 每日统计数据接口
 */
export interface DailyStats {
  date: string
  views: number
  newSubscribers?: number
  newFavorites?: number
  comments?: number
}

/**
 * 章节统计接口
 */
export interface ChapterStats {
  chapterId: string
  chapterTitle: string
  chapterNumber: number
  views: number
  comments: number
  avgReadTime?: number // 平均阅读时长（秒）
  retention?: number // 留存率
}

/**
 * 读者活跃度接口
 */
export interface ReaderActivity {
  type: 'daily' | 'weekly' | 'monthly' | 'inactive'
  label: string
  count: number
  percentage: number
}

/**
 * 阅读时段热力图接口
 */
export interface ReadingHeatmap {
  hour: number // 0-23
  day: number // 0-6 (周日到周六)
  value: number // 阅读量
}

/**
 * 获取作品统计概览
 * GET /api/v1/writer/books/:bookId/stats
 */
export const getBookStats = (bookId: string) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/stats`)
}

/**
 * 获取每日统计数据
 * GET /api/v1/writer/books/:bookId/stats/daily
 */
export const getDailyStats = (bookId: string, days: number = 30) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/stats/daily`, {
    params: { days }
  })
}

/**
 * 获取订阅增长数据
 * GET /api/v1/writer/books/:bookId/stats/subscribers
 */
export function getSubscribersTrend(
  bookId: string,
  params?: {
    days?: number
    startDate?: string
    endDate?: string
  }
) {
  return httpService.get(`/api/v1/writer/books/${bookId}/stats/subscribers`, { params })
}

/**
 * 获取章节统计数据
 * GET /api/v1/writer/books/:bookId/stats/chapters
 */
export const getChapterStats = (bookId: string, page: number = 1, size: number = 20) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/stats/chapters`, {
    params: { page, size }
  })
}

/**
 * 获取读者活跃度分布
 * GET /api/v1/writer/books/:bookId/stats/reader-activity
 */
export const getReaderActivity = (bookId: string) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/stats/reader-activity`)
}

/**
 * 获取阅读时段热力图数据
 * GET /api/v1/writer/books/:bookId/stats/heatmap
 */
export const getReadingHeatmap = (bookId: string) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/stats/reading-heatmap`)
}

/**
 * 获取作品对比数据（多作品对比）
 * GET /api/v1/writer/stats/compare
 */
export function compareBooks(
  bookIds: string[],
  params?: {
    metrics?: string[] // ['views', 'subscribers', 'favorites']
    startDate?: string
    endDate?: string
  }
) {
  return httpService.post('/api/v1/writer/stats/compare', {
    bookIds,
    ...params,
  })
}

export default {
  getBookStats,
  getDailyStats,
  getChapterStats,
  getReaderActivity,
  getReadingHeatmap
}

