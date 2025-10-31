/**
 * 写作端 - 作家收入统计API
 */

import { httpService } from '@/core/services/http.service'

/**
 * 收入统计数据接口
 */
export interface RevenueStats {
  totalRevenue: number // 总收入
  todayRevenue: number // 今日收入
  availableBalance: number // 可提现余额
  totalWithdrawn: number // 已提现总额
  monthRevenue?: number // 本月收入
  lastMonthRevenue?: number // 上月收入
}

/**
 * 章节收入排行接口
 */
export interface ChapterRevenue {
  id: string
  chapterTitle: string
  chapterNumber: number
  views: number // 阅读量
  subscriptions: number // 订阅数
  revenue: number // 收入金额
  bookId?: string
  bookTitle?: string
}

/**
 * 收入趋势数据接口
 */
export interface RevenueTrend {
  date: string
  revenue: number
  subscriptions?: number
  tips?: number
}

/**
 * 收入来源分布接口
 */
export interface RevenueSource {
  type: 'subscription' | 'tip' | 'ad' | 'other'
  label: string
  amount: number
  percentage: number
}

/**
 * 获取作家收入统计
 * GET /api/v1/writer/revenue/stats
 */
export const getRevenueStats = () => {
  return httpService.get('/api/v1/writer/revenue/stats')
}

/**
 * 获取收入趋势
 * GET /api/v1/writer/revenue/trend
 */
export const getRevenueTrend = (days: number = 30) => {
  return httpService.get('/api/v1/writer/revenue/trend', {
    params: { days }
  })
}

/**
 * 获取收入来源分布
 * GET /api/v1/writer/revenue/sources
 */
export const getRevenueSources = () => {
  return httpService.get('/api/v1/writer/revenue/sources')
}

/**
 * 获取章节收入排行
 * GET /api/v1/writer/revenue/chapters/ranking
 */
export const getChapterRevenueRanking = (bookId: string, page: number = 1, size: number = 20) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/revenue/chapters`, {
    params: { page, size }
  })
}

/**
 * 获取作品列表（用于筛选）
 * GET /api/v1/writer/books
 */
export function getWriterBooks(params?: {
  page?: number
  size?: number
  status?: string
}) {
  return httpService.get<{
    list: Array<{
      id: string
      title: string
      status: string
      chapterCount: number
    }>
    total: number
  }>('/writer/books', { params })
}

/**
 * 获取详细收入记录
 * GET /api/v1/writer/revenue/records
 */
export function getRevenueRecords(params?: {
  bookId?: string
  type?: string // subscription, tip, ad
  page?: number
  size?: number
  startDate?: string
  endDate?: string
}) {
  return httpService.get('/writer/revenue/records', { params })
}

export default {
  getRevenueStats,
  getRevenueTrend,
  getRevenueSources,
  getChapterRevenueRanking
}

