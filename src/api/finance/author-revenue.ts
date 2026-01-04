/**
 * 作者收入 API
 */
import request from '../request'

// 收入记录
export interface AuthorEarning {
  id: string
  author_id: string
  book_id: string
  book_title?: string
  type: string
  amount: number
  description: string
  status: 'pending' | 'confirmed' | 'paid'
  created_at: string
  updated_at: string
}

// 提现申请
export interface WithdrawalRequest {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  method: string
  account_info: string
  fee: number
  actual_amount: number
  reject_reason?: string
  created_at: string
  processed_at?: string
}

// 结算记录
export interface Settlement {
  id: string
  author_id: string
  period: string
  total_amount: number
  total_earnings: number
  status: string
  created_at: string
}

// 收入统计
export interface RevenueStatistics {
  id: string
  author_id: string
  period: string
  total_earnings: number
  total_readers: number
  total_books: number
  rank?: number
}

// 收入明细
export interface RevenueDetail {
  id: string
  author_id: string
  book_id: string
  book_title: string
  total_earnings: number
  total_readers: number
  total_chapters: number
  subscribe_count: number
  chapter_count: number
}

// 税务信息
export interface TaxInfo {
  id: string
  user_id: string
  id_type: string
  id_number: string
  name: string
  status: string
  created_at: string
  updated_at: string
}

/**
 * 获取收入列表
 */
export function getAuthorEarnings(params: {
  page?: number
  page_size?: number
  book_id?: string
  type?: string
  status?: string
}) {
  return request<{
    items: AuthorEarning[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/finance/author/earnings',
    method: 'get',
    params
  })
}

/**
 * 获取收入统计
 */
export function getRevenueStatistics(params: {
  period?: string
  limit?: number
}) {
  return request<RevenueStatistics[]>({
    url: '/api/v1/finance/author/revenue-statistics',
    method: 'get',
    params
  })
}

/**
 * 获取收入明细
 */
export function getRevenueDetails(params: {
  page?: number
  page_size?: number
}) {
  return request<{
    items: RevenueDetail[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/finance/author/revenue-details',
    method: 'get',
    params
  })
}

/**
 * 获取提现申请列表
 */
export function getWithdrawalRequests(params: {
  page?: number
  page_size?: number
  status?: string
}) {
  return request<{
    items: WithdrawalRequest[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/finance/author/withdrawals',
    method: 'get',
    params
  })
}

/**
 * 创建提现申请
 */
export function createWithdrawal(data: {
  amount: number
  method: string
  account_info: string
}) {
  return request<WithdrawalRequest>({
    url: '/api/v1/finance/author/withdraw',
    method: 'post',
    data
  })
}

/**
 * 获取结算记录
 */
export function getSettlements(params: {
  page?: number
  page_size?: number
}) {
  return request<{
    items: Settlement[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/finance/author/settlements',
    method: 'get',
    params
  })
}

/**
 * 获取结算详情
 */
export function getSettlementDetail(settlementId: string) {
  return request<Settlement>({
    url: `/api/v1/finance/author/settlements/${settlementId}`,
    method: 'get'
  })
}

/**
 * 获取税务信息
 */
export function getTaxInfo() {
  return request<TaxInfo>({
    url: '/api/v1/finance/author/tax-info',
    method: 'get'
  })
}

/**
 * 更新税务信息
 */
export function updateTaxInfo(data: {
  id_type: string
  id_number: string
  name: string
}) {
  return request<TaxInfo>({
    url: '/api/v1/finance/author/tax-info',
    method: 'put',
    data
  })
}

/**
 * 获取收入总览
 */
export function getRevenueOverview() {
  return request<{
    total_earnings: number
    pending_earnings: number
    paid_amount: number
    withdrawable_amount: number
    month_earnings: number
    today_earnings: number
    total_readers: number
  }>({
    url: '/api/v1/finance/author/overview',
    method: 'get'
  })
}
