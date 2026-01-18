/**
 * 管理员 API
 */
import { httpService } from '@/core/services/http.service'
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
  return httpService.get<APIResponse<DashboardStats>>('/admin/dashboard/stats')
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
  return httpService.get<APIResponse<{ items: ReviewItem[]; total: number }>>('/admin/reviews', { params })
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
  return httpService.post<APIResponse<void>>(`/admin/reviews/${id}`, params)
}

/**
 * 获取提现申请列表
 */
export async function getWithdrawalList(params?: {
  page?: number
  pageSize?: number
  status?: string
}): Promise<APIResponse<{ items: WithdrawalRequest[]; total: number }>> {
  return httpService.get<APIResponse<{ items: WithdrawalRequest[]; total: number }>>('/admin/withdrawals', { params })
}

/**
 * 处理提现申请
 */
export async function handleWithdrawal(id: string, params: {
  status: 'approved' | 'rejected'
  reason?: string
}): Promise<APIResponse<void>> {
  return httpService.post<APIResponse<void>>(`/admin/withdrawals/${id}`, params)
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
  return httpService.get<APIResponse<{ items: UserManagementItem[]; total: number }>>('/admin/users', { params })
}

/**
 * 更新用户信息
 */
export async function updateUser(id: string, params: Partial<UserManagementItem>): Promise<APIResponse<void>> {
  return httpService.put<APIResponse<void>>(`/admin/users/${id}`, params)
}

/**
 * 删除用户
 */
export async function deleteUser(id: string): Promise<APIResponse<void>> {
  return httpService.delete<APIResponse<void>>(`/admin/users/${id}`)
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
  return httpService.get<APIResponse<{ items: OperationLog[]; total: number }>>('/admin/logs', { params })
}

/**
 * ==================== 配额管理 ====================
 * 对接后端: /api/v1/admin/quota/*
 */

/**
 * 获取用户配额详情
 */
export async function getUserQuotaDetails(userId: string): Promise<APIResponse<any>> {
  return httpService.get<APIResponse<any>>(`/admin/quota/${userId}`)
}

/**
 * 更新用户配额
 */
export async function updateUserQuota(userId: string, params: {
  quotaType?: 'free' | 'paid' | 'trial'
  totalQuota?: number
  resetDate?: string
}): Promise<APIResponse<void>> {
  return httpService.put<APIResponse<void>>(`/admin/quota/${userId}`, params)
}

/**
 * 暂停用户配额
 */
export async function suspendUserQuota(userId: string, reason?: string): Promise<APIResponse<void>> {
  return httpService.post<APIResponse<void>>(`/admin/quota/${userId}/suspend`, { reason })
}

/**
 * 激活用户配额
 */
export async function activateUserQuota(userId: string): Promise<APIResponse<void>> {
  return httpService.post<APIResponse<void>>(`/admin/quota/${userId}/activate`)
}

/**
 * 获取配额统计
 */
export async function getQuotaStatistics(): Promise<APIResponse<{
  totalUsers: number
  activeUsers: number
  totalQuota: number
  usedQuota: number
}>> {
  return httpService.get<APIResponse<any>>('/admin/quota/statistics')
}

/**
 * ==================== 审核管理 ====================
 * 对接后端: /api/v1/admin/audit/*
 */

/**
 * 获取待审核内容
 */
export async function getPendingAudits(params?: {
  page?: number
  pageSize?: number
  contentType?: string
  riskLevel?: string
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return httpService.get<APIResponse<{ items: any[]; total: number }>>('/admin/audit/pending', { params })
}

/**
 * 获取高风险审核
 */
export async function getHighRiskAudits(params?: {
  page?: number
  pageSize?: number
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return httpService.get<APIResponse<{ items: any[]; total: number }>>('/admin/audit/high-risk', { params })
}

/**
 * 获取审核统计
 */
export async function getAuditStatistics(): Promise<APIResponse<{
  pending: number
  approved: number
  rejected: number
  highRisk: number
}>> {
  return httpService.get<APIResponse<any>>('/admin/audit/statistics')
}

/**
 * 审核内容
 */
export async function reviewAudit(auditId: string, params: {
  approved: boolean
  reason?: string
}): Promise<APIResponse<void>> {
  return httpService.post<APIResponse<void>>(`/admin/audit/${auditId}/review`, params)
}

/**
 * ==================== 公告管理 ====================
 * 对接后端: /api/v1/admin/announcements/*
 */

/**
 * 获取公告列表
 */
export async function getAnnouncements(params?: {
  page?: number
  pageSize?: number
  status?: string
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return httpService.get<APIResponse<{ items: any[]; total: number }>>('/admin/announcements', { params })
}

/**
 * 创建公告
 */
export async function createAnnouncement(data: {
  title: string
  content: string
  type: 'system' | 'event' | 'maintenance'
  priority: 'low' | 'medium' | 'high'
  effectiveStartTime: string
  effectiveEndTime: string
}): Promise<APIResponse<any>> {
  return httpService.post<APIResponse<any>>('/admin/announcements', data)
}

/**
 * 更新公告
 */
export async function updateAnnouncement(id: string, data: any): Promise<APIResponse<any>> {
  return httpService.put<APIResponse<any>>(`/admin/announcements/${id}`, data)
}

/**
 * 删除公告
 */
export async function deleteAnnouncement(id: string): Promise<APIResponse<void>> {
  return httpService.delete<APIResponse<void>>(`/admin/announcements/${id}`)
}

/**
 * 批量更新公告状态
 */
export async function batchUpdateAnnouncementStatus(ids: string[], status: 'active' | 'inactive'): Promise<APIResponse<void>> {
  return httpService.put<APIResponse<void>>('/admin/announcements/batch-status', { ids, status })
}

/**
 * ==================== 配置管理 ====================
 * 对接后端: /api/v1/admin/config/*
 */

/**
 * 获取所有配置
 */
export async function getAllConfigs(): Promise<APIResponse<Record<string, any>>> {
  return httpService.get<APIResponse<Record<string, any>>>('/admin/config')
}

/**
 * 获取单个配置
 */
export async function getConfigByKey(key: string): Promise<APIResponse<any>> {
  return httpService.get<APIResponse<any>>(`/admin/config/${key}`)
}

/**
 * 更新配置
 */
export async function updateConfig(key: string, value: any): Promise<APIResponse<void>> {
  return httpService.put<APIResponse<void>>('/admin/config', { key, value })
}

/**
 * 批量更新配置
 */
export async function batchUpdateConfig(configs: Record<string, any>): Promise<APIResponse<void>> {
  return httpService.put<APIResponse<void>>('/admin/config/batch', { configs })
}

/**
 * 验证配置
 */
export async function validateConfig(configs: Record<string, any>): Promise<APIResponse<{
  valid: boolean
  errors?: string[]
}>> {
  return httpService.post<APIResponse<{ valid: boolean; errors?: string[] }>>('/admin/config/validate', { configs })
}

/**
 * ==================== 配置备份 ====================
 * 对接后端: /api/v1/admin/config/backup/*
 */

/**
 * 获取配置备份列表
 */
export async function getConfigBackups(): Promise<APIResponse<any[]>> {
  return httpService.get<APIResponse<any[]>>('/admin/config/backups')
}

/**
 * 恢复配置备份
 */
export async function restoreConfigBackup(backupId: string): Promise<APIResponse<void>> {
  return httpService.post<APIResponse<void>>(`/admin/config/backups/${backupId}/restore`)
}

/**
 * ==================== Banner管理 ====================
 * 对接后端: /api/v1/admin/banners/*
 */

/**
 * 获取Banner列表
 */
export async function getBanners(params?: {
  page?: number
  pageSize?: number
  position?: string
  status?: string
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return httpService.get<APIResponse<{ items: any[]; total: number }>>('/admin/banners', { params })
}

/**
 * 创建Banner
 */
export async function createBanner(data: {
  title: string
  imageUrl: string
  link?: string
  position: string
  sortOrder?: number
  startTime?: string
  endTime?: string
}): Promise<APIResponse<any>> {
  return httpService.post<APIResponse<any>>('/admin/banners', data)
}

/**
 * 更新Banner
 */
export async function updateBanner(id: string, data: any): Promise<APIResponse<any>> {
  return httpService.put<APIResponse<any>>(`/admin/banners/${id}`, data)
}

/**
 * 删除Banner
 */
export async function deleteBanner(id: string): Promise<APIResponse<void>> {
  return httpService.delete<APIResponse<void>>(`/admin/banners/${id}`)
}

