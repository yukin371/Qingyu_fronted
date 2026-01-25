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
 * @description 获取当前登录作家的收入统计概览，包括总收入、今日收入、可提现余额等
 * @endpoint GET /api/v1/writer/revenue/stats
 * @category writer
 * @tags 收入管理
 * @response {RevenueStats} 200 - 成功返回收入统计概览
 * @security BearerAuth
 */
export const getRevenueStats = () => {
  return httpService.get('/api/v1/writer/revenue/stats')
}

/**
 * 获取收入趋势
 * @description 获取当前登录作家的收入趋势数据，支持自定义统计天数
 * @endpoint GET /api/v1/writer/revenue/trend
 * @category writer
 * @tags 收入管理
 * @param {number} [days=30] - 统计天数，默认30天
 * @response {RevenueTrend[]} 200 - 成功返回收入趋势数据列表
 * @security BearerAuth
 */
export const getRevenueTrend = (days: number = 30) => {
  return httpService.get('/api/v1/writer/revenue/trend', {
    params: { days }
  })
}

/**
 * 获取收入来源分布
 * @description 获取当前登录作家的收入来源分布数据，包括订阅、打赏、广告等不同来源的占比
 * @endpoint GET /api/v1/writer/revenue/sources
 * @category writer
 * @tags 收入管理
 * @response {RevenueSource[]} 200 - 成功返回收入来源分布数据
 * @security BearerAuth
 */
export const getRevenueSources = () => {
  return httpService.get('/api/v1/writer/revenue/sources')
}

/**
 * 获取章节收入排行
 * @description 获取指定作品的章节收入排行数据，支持分页查询
 * @endpoint GET /api/v1/writer/books/:bookId/revenue/chapters
 * @category writer
 * @tags 收入管理
 * @param {string} bookId - 作品ID
 * @param {number} [page=1] - 页码，默认为1
 * @param {number} [size=20] - 每页数量，默认为20
 * @response {{items: ChapterRevenue[], total: number}} 200 - 成功返回章节收入排行数据
 * @security BearerAuth
 */
export const getChapterRevenueRanking = (bookId: string, page: number = 1, size: number = 20) => {
  return httpService.get(`/api/v1/writer/books/${bookId}/revenue/chapters`, {
    params: { page, size }
  })
}

/**
 * 获取作品列表（用于筛选）
 * @description 获取当前登录作家的作品列表，支持分页和状态筛选
 * @endpoint GET /api/v1/writer/books
 * @category writer
 * @tags 作品管理
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.size] - 每页数量
 * @param {string} [params.status] - 作品状态筛选
 * @response {{list: BookItem[], total: number}} 200 - 成功返回作品列表
 * @security BearerAuth
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
 * @description 获取当前登录作家的详细收入记录，支持按作品、类型、日期范围筛选
 * @endpoint GET /api/v1/writer/revenue/records
 * @category writer
 * @tags 收入管理
 * @param {Object} [params] - 查询参数
 * @param {string} [params.bookId] - 作品ID筛选
 * @param {string} [params.type] - 收入类型筛选：subscription（订阅）、tip（打赏）、ad（广告）
 * @param {number} [params.page] - 页码
 * @param {number} [params.size] - 每页数量
 * @param {string} [params.startDate] - 开始日期（ISO8601格式）
 * @param {string} [params.endDate] - 结束日期（ISO8601格式）
 * @response {{items: RevenueRecord[], total: number}} 200 - 成功返回收入记录列表
 * @security BearerAuth
 */
export function getRevenueRecords(params?: {
  bookId?: string
  type?: string // subscription, tip, ad
  page?: number
  size?: number
  startDate?: string
  endDate?: string
}) {
  return httpService.get('/api/v1/writer/revenue/records', { params })
}

export default {
  getRevenueStats,
  getRevenueTrend,
  getRevenueSources,
  getChapterRevenueRanking
}

