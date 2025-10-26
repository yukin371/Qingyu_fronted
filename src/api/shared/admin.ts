/**
 * 管理员 API
 */
import request from '@/utils/request'
import type { APIResponse } from '@/types/api'
import type {
  DashboardStats,
  ReviewItem,
  WithdrawalRequest,
  UserManagementItem,
  OperationLog
} from '@/modules/admin/types/admin.types'

/**
 * 获取仪表盘统计数据
 */
export async function getDashboardStats(): Promise<APIResponse<DashboardStats>> {
  return request.get<APIResponse<DashboardStats>>('/admin/dashboard/stats')
}

/**
 * 获取待审核内容列表
 */
export async function getReviewList(params?: {
  page?: number
  pageSize?: number
  status?: string
  type?: string
}): Promise<APIResponse<{ items: ReviewItem[]; total: number }>> {
  return request.get<APIResponse<{ items: ReviewItem[]; total: number }>>('/admin/reviews', { params })
}

/**
 * 获取待审核内容列表（别名）
 */
export async function getPendingReviews(params?: {
  page?: number
  pageSize?: number
  status?: string
  type?: string
}): Promise<APIResponse<{ items: ReviewItem[]; total: number }>> {
  return getReviewList(params)
}

/**
 * 审核内容
 */
export async function reviewContent(id: string, params: {
  status: 'approved' | 'rejected'
  reason?: string
}): Promise<APIResponse<void>> {
  return request.post<APIResponse<void>>(`/admin/reviews/${id}`, params)
}

/**
 * 获取提现申请列表
 */
export async function getWithdrawalList(params?: {
  page?: number
  pageSize?: number
  status?: string
}): Promise<APIResponse<{ items: WithdrawalRequest[]; total: number }>> {
  return request.get<APIResponse<{ items: WithdrawalRequest[]; total: number }>>('/admin/withdrawals', { params })
}

/**
 * 处理提现申请
 */
export async function handleWithdrawal(id: string, params: {
  status: 'approved' | 'rejected'
  reason?: string
}): Promise<APIResponse<void>> {
  return request.post<APIResponse<void>>(`/admin/withdrawals/${id}`, params)
}

/**
 * 审核提现申请（别名）
 */
export async function reviewWithdraw(id: string, params: {
  status: 'approved' | 'rejected'
  reason?: string
}): Promise<APIResponse<void>> {
  return handleWithdrawal(id, params)
}

/**
 * 获取用户管理列表
 */
export async function getUserList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
  role?: string
  status?: string
}): Promise<APIResponse<{ items: UserManagementItem[]; total: number }>> {
  return request.get<APIResponse<{ items: UserManagementItem[]; total: number }>>('/admin/users', { params })
}

/**
 * 更新用户信息
 */
export async function updateUser(id: string, params: Partial<UserManagementItem>): Promise<APIResponse<void>> {
  return request.put<APIResponse<void>>(`/admin/users/${id}`, params)
}

/**
 * 删除用户
 */
export async function deleteUser(id: string): Promise<APIResponse<void>> {
  return request.delete<APIResponse<void>>(`/admin/users/${id}`)
}

/**
 * 获取操作日志
 */
export async function getOperationLogs(params?: {
  page?: number
  pageSize?: number
  action?: string
  operatorId?: string
  startTime?: number
  endTime?: number
}): Promise<APIResponse<{ items: OperationLog[]; total: number }>> {
  return request.get<APIResponse<{ items: OperationLog[]; total: number }>>('/admin/logs', { params })
}


