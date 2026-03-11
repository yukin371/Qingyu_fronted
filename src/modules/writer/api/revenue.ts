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
 * @endpoint GET /api/v1/finance/author/revenue-statistics
 * @category writer
 * @tags 收入管理
 * @param {string} [period='monthly'] - 统计周期：daily（日）、monthly（月）、yearly（年）
 * @response {RevenueStats} 200 - 成功返回收入统计概览
 * @security BearerAuth
 */
export const getRevenueStats = (period: 'daily' | 'monthly' | 'yearly' = 'monthly') => {
  return httpService.get('/api/v1/finance/author/revenue-statistics', {
    params: { period }
  })
}

/**
 * 获取收入趋势
 * @description 获取当前登录作家的收入趋势数据，通过获取收入统计并使用period参数来获取趋势
 * @endpoint GET /api/v1/finance/author/revenue-statistics
 * @category writer
 * @tags 收入管理
 * @param {string} [period='daily'] - 统计周期：daily（日）用于趋势
 * @response {RevenueTrend[]} 200 - 成功返回收入趋势数据列表
 * @security BearerAuth
 */
export const getRevenueTrend = (period: 'daily' | 'monthly' | 'yearly' = 'daily') => {
  return httpService.get('/api/v1/finance/author/revenue-statistics', {
    params: { period }
  })
}

/**
 * 获取收入来源分布
 * @description 获取当前登录作家的收入来源分布数据，通过收入明细聚合计算
 * @endpoint GET /api/v1/finance/author/revenue-details
 * @category writer
 * @tags 收入管理
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.page_size=100] - 每页数量（默认取100条用于聚合分析）
 * @response {RevenueSource[]} 200 - 成功返回收入来源分布数据
 * @security BearerAuth
 */
export const getRevenueSources = (params?: { page?: number; page_size?: number }) => {
  return httpService.get('/api/v1/finance/author/revenue-details', {
    params: { page: params?.page ?? 1, page_size: params?.page_size ?? 100 }
  })
}

/**
 * 获取章节收入排行
 * @description 获取指定作品的章节收入排行数据，支持分页查询
 * @endpoint GET /api/v1/finance/author/earnings/:bookId
 * @category writer
 * @tags 收入管理
 * @param {string} bookId - 作品ID
 * @param {number} [page=1] - 页码，默认为1
 * @param {number} [pageSize=20] - 每页数量，默认为20
 * @response {{items: ChapterRevenue[], total: number}} 200 - 成功返回章节收入排行数据
 * @security BearerAuth
 */
export const getChapterRevenueRanking = (bookId: string, page: number = 1, pageSize: number = 20) => {
  return httpService.get(`/api/v1/finance/author/earnings/${bookId}`, {
    params: { page, page_size: pageSize }
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
 * @endpoint GET /api/v1/finance/author/revenue-details
 * @category writer
 * @tags 收入管理
 * @param {Object} [params] - 查询参数
 * @param {string} [params.bookId] - 作品ID筛选
 * @param {string} [params.type] - 收入类型筛选：subscription（订阅）、tip（打赏）、ad（广告）
 * @param {number} [params.page] - 页码
 * @param {number} [params.pageSize] - 每页数量
 * @param {string} [params.startDate] - 开始日期（ISO8601格式）
 * @param {string} [params.endDate] - 结束日期（ISO8601格式）
 * @response {{items: RevenueRecord[], total: number}} 200 - 成功返回收入记录列表
 * @security BearerAuth
 */
export function getRevenueRecords(params?: {
  bookId?: string
  type?: string // subscription, tip, ad
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}) {
  return httpService.get('/api/v1/finance/author/revenue-details', { params })
}

/**
 * 获取作者收入列表
 * @description 获取作者的收入记录列表
 * @endpoint GET /api/v1/finance/author/earnings
 * @category writer
 * @tags 收入管理
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @response {{items: any[], total: number}} 200 - 成功返回收入列表
 * @security BearerAuth
 */
export function getEarnings(params?: { page?: number; pageSize?: number }) {
  return httpService.get('/api/v1/finance/author/earnings', {
    params: { page: params?.page ?? 1, page_size: params?.pageSize ?? 20 }
  })
}

/**
 * 获取提现记录
 * @description 获取用户的提现申请记录
 * @endpoint GET /api/v1/finance/author/withdrawals
 * @category writer
 * @tags 收入管理
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @response {{items: any[], total: number}} 200 - 成功返回提现记录列表
 * @security BearerAuth
 */
export function getWithdrawals(params?: { page?: number; pageSize?: number }) {
  return httpService.get('/api/v1/finance/author/withdrawals', {
    params: { page: params?.page ?? 1, page_size: params?.pageSize ?? 20 }
  })
}

/**
 * 提现账户信息
 */
export interface WithdrawAccount {
  accountType: string
  accountName: string
  accountNo: string
  bankName?: string
  branchName?: string
}

/**
 * 申请提现
 * @description 作者申请提现
 * @endpoint POST /api/v1/finance/author/withdraw
 * @category writer
 * @tags 收入管理
 * @param {Object} data - 提现信息
 * @param {number} data.amount - 提现金额
 * @param {string} data.method - 提现方式：alipay、wechat、bank
 * @param {WithdrawAccount} data.accountInfo - 账户信息
 * @response {any} 200 - 成功返回提现申请结果
 * @security BearerAuth
 */
export function requestWithdraw(data: {
  amount: number
  method: 'alipay' | 'wechat' | 'bank'
  accountType: string
  accountName: string
  accountNo: string
  bankName?: string
  branchName?: string
}) {
  return httpService.post('/api/v1/finance/author/withdraw', data)
}

export default {
  getRevenueStats,
  getRevenueTrend,
  getRevenueSources,
  getChapterRevenueRanking,
  getRevenueRecords,
  getEarnings,
  getWithdrawals,
  requestWithdraw
}

