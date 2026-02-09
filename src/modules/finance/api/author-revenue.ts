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
 * @description 获取作者的收入记录列表，支持分页和筛选
 * @endpoint GET /api/v1/finance/author/earnings
 * @category finance
 * @tags 财务管理
 * @param {number} page - 页码（默认1）
 * @param {number} page_size - 每页数量（默认10）
 * @param {string} book_id - 书籍ID（可选）
 * @param {string} type - 收入类型（可选）
 * @param {string} status - 状态筛选（可选）
 * @response {Object} 200 - 成功返回收入列表
 * @response {AuthorEarning[]} items - 收入记录列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 获取作者的收入统计数据，按时间段统计
 * @endpoint GET /api/v1/finance/author/revenue-statistics
 * @category finance
 * @tags 财务管理
 * @param {string} period - 统计周期（可选）
 * @param {number} limit - 返回数量限制（可选）
 * @response {RevenueStatistics[]} 200 - 成功返回统计数据
 * @security BearerAuth
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
 * @description 获取作者的收入明细，按书籍维度展示
 * @endpoint GET /api/v1/finance/author/revenue-details
 * @category finance
 * @tags 财务管理
 * @param {number} page - 页码（默认1）
 * @param {number} page_size - 每页数量（默认10）
 * @response {Object} 200 - 成功返回收入明细
 * @response {RevenueDetail[]} items - 收入明细列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 获取作者的提现申请记录
 * @endpoint GET /api/v1/finance/author/withdrawals
 * @category finance
 * @tags 财务管理
 * @param {number} page - 页码（默认1）
 * @param {number} page_size - 每页数量（默认10）
 * @param {string} status - 状态筛选（可选）
 * @response {Object} 200 - 成功返回提现申请列表
 * @response {WithdrawalRequest[]} items - 提现申请列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 创建新的提现申请
 * @endpoint POST /api/v1/finance/author/withdraw
 * @category finance
 * @tags 财务管理
 * @param {Object} data - 提现申请数据
 * @param {number} data.amount - 提现金额
 * @param {string} data.method - 提现方式
 * @param {string} data.account_info - 账户信息
 * @response {WithdrawalRequest} 201 - 创建成功返回提现申请详情
 * @security BearerAuth
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
 * @description 获取作者的结算记录列表
 * @endpoint GET /api/v1/finance/author/settlements
 * @category finance
 * @tags 财务管理
 * @param {number} page - 页码（默认1）
 * @param {number} page_size - 每页数量（默认10）
 * @response {Object} 200 - 成功返回结算记录
 * @response {Settlement[]} items - 结算记录列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 获取指定结算记录的详细信息
 * @endpoint GET /api/v1/finance/author/settlements/:settlementId
 * @category finance
 * @tags 财务管理
 * @param {string} settlementId - 结算记录ID
 * @response {Settlement} 200 - 成功返回结算详情
 * @security BearerAuth
 */
export function getSettlementDetail(settlementId: string) {
  return request<Settlement>({
    url: `/api/v1/finance/author/settlements/${settlementId}`,
    method: 'get'
  })
}

/**
 * 获取税务信息
 * @description 获取作者的税务信息
 * @endpoint GET /api/v1/finance/author/tax-info
 * @category finance
 * @tags 财务管理
 * @response {TaxInfo} 200 - 成功返回税务信息
 * @security BearerAuth
 */
export function getTaxInfo() {
  return request<TaxInfo>({
    url: '/api/v1/finance/author/tax-info',
    method: 'get'
  })
}

/**
 * 更新税务信息
 * @description 更新作者的税务信息
 * @endpoint PUT /api/v1/finance/author/tax-info
 * @category finance
 * @tags 财务管理
 * @param {Object} data - 税务信息数据
 * @param {string} data.id_type - 证件类型
 * @param {string} data.id_number - 证件号码
 * @param {string} data.name - 真实姓名
 * @response {TaxInfo} 200 - 成功返回更新后的税务信息
 * @security BearerAuth
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
 * @description 获取作者的收入总览数据，包括总收入、待结算、已提现等
 * @endpoint GET /api/v1/finance/author/overview
 * @category finance
 * @tags 财务管理
 * @response {Object} 200 - 成功返回收入总览
 * @response {number} total_earnings - 总收入
 * @response {number} pending_earnings - 待结算收入
 * @response {number} paid_amount - 已提现金额
 * @response {number} withdrawable_amount - 可提现金额
 * @response {number} month_earnings - 本月收入
 * @response {number} today_earnings - 今日收入
 * @response {number} total_readers - 总读者数
 * @security BearerAuth
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

/**
 * 获取每日收入
 * @description 获取作者每日收入统计
 * @endpoint GET /api/v1/finance/author/daily-earnings
 * @category finance
 * @tags 财务管理
 * @param {string} start_date - 开始日期（可选）
 * @param {string} end_date - 结束日期（可选）
 * @param {number} limit - 返回数量限制（可选）
 * @response {Object[]} 200 - 成功返回每日收入列表
 * @security BearerAuth
 */
export function getDailyEarnings(params: {
  start_date?: string
  end_date?: string
  limit?: number
}) {
  return request<Array<{
    date: string
    amount: number
    orders: number
  }>>({
    url: '/api/v1/finance/author/daily-earnings',
    method: 'get',
    params
  })
}

/**
 * 获取月度收入
 * @description 获取作者月度收入统计
 * @endpoint GET /api/v1/finance/author/monthly-earnings
 * @category finance
 * @tags 财务管理
 * @param {number} year - 年份（可选）
 * @param {number} limit - 返回数量限制（可选）
 * @response {Object[]} 200 - 成功返回月度收入列表
 * @security BearerAuth
 */
export function getMonthlyEarnings(params: {
  year?: number
  limit?: number
}) {
  return request<Array<{
    month: string
    amount: number
    orders: number
  }>>({
    url: '/api/v1/finance/author/monthly-earnings',
    method: 'get',
    params
  })
}

/**
 * 提现收入
 * @description 创建提现申请的别名函数
 * @endpoint POST /api/v1/finance/author/withdraw
 * @category finance
 * @tags 财务管理
 * @param {Object} data - 提现申请数据
 * @param {number} data.amount - 提现金额
 * @param {string} data.method - 提现方式
 * @param {string} data.account_info - 账户信息
 * @response {WithdrawalRequest} 201 - 创建成功返回提现申请详情
 * @security BearerAuth
 */
export const withdrawEarnings = createWithdrawal

/**
 * 获取提现历史
 * @description 获取提现申请记录的别名函数
 * @endpoint GET /api/v1/finance/author/withdrawals
 * @category finance
 * @tags 财务管理
 * @param {number} page - 页码（默认1）
 * @param {number} page_size - 每页数量（默认10）
 * @param {string} status - 状态筛选（可选）
 * @response {Object} 200 - 成功返回提现申请列表
 * @response {WithdrawalRequest[]} items - 提现申请列表
 * @response {number} total - 总数量
 * @security BearerAuth
 */
export const getWithdrawalHistory = getWithdrawalRequests
