/**
 * 作家收入统计API
 * 注意：这些API后端尚未完全实现，需要后端开发
 */

import request from '@/utils/request'

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
export function getRevenueStats(params?: {
  bookId?: string
  startDate?: string
  endDate?: string
}) {
  return request.get<RevenueStats>('/writer/revenue/stats', { params })
}

/**
 * 获取收入趋势
 * GET /api/v1/writer/revenue/trend
 */
export function getRevenueTrend(params?: {
  bookId?: string
  days?: number // 7, 30, 90
  startDate?: string
  endDate?: string
}) {
  return request.get<RevenueTrend[]>('/writer/revenue/trend', { params })
}

/**
 * 获取收入来源分布
 * GET /api/v1/writer/revenue/sources
 */
export function getRevenueSources(params?: {
  bookId?: string
  startDate?: string
  endDate?: string
}) {
  return request.get<RevenueSource[]>('/writer/revenue/sources', { params })
}

/**
 * 获取章节收入排行
 * GET /api/v1/writer/revenue/chapters/ranking
 */
export function getChapterRevenueRanking(params?: {
  bookId?: string
  page?: number
  size?: number
  startDate?: string
  endDate?: string
}) {
  return request.get<{
    list: ChapterRevenue[]
    total: number
  }>('/writer/revenue/chapters/ranking', { params })
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
  return request.get<{
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
  return request.get('/writer/revenue/records', { params })
}

