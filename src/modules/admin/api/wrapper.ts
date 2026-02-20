/**
 * Admin API Wrapper
 * 将orval生成的工厂模式API转换为更易使用的格式
 *
 * 使用方式：
 * import * as adminAPI from '@/modules/admin/api'
 * const stats = await adminAPI.getDashboardStats()
 */

import { getApi } from './generated/admin'
import type { APIResponse } from '@/types/api'
import type {
  DashboardStats,
  UserManagementItem,
  OperationLog
} from '@/modules/admin/types/admin.types'

// 获取生成的API对象
const api = getApi()

// ==================== 仪表盘相关 API ====================

/**
 * 获取仪表盘统计数据
 * 兼容旧API: getDashboardStats()
 * 使用生成的 getApiV1AdminStats
 */
export async function getDashboardStats(): Promise<APIResponse<DashboardStats>> {
  return api.getApiV1AdminStats() as any
}

/**
 * 获取统计数据（别名）
 */
export const getStats = getDashboardStats

// ==================== 审核相关 API ====================

/**
 * 获取待审核内容列表
 * @deprecated 请使用 getPendingAudits 代替
 */
export const getReviewList = getPendingAudits

/**
 * 获取待审核内容列表（别名）
 */
export const getPendingReviews = getReviewList

/**
 * 审核内容
 * @deprecated 请使用 reviewAudit 代替
 */
export const reviewContent = reviewAudit

// ==================== 提现相关 API ====================

/**
 * 获取提现申请列表
 * @deprecated 提现功能已移至 finance 模块
 * 请使用: import { getAuthorWithdrawals, getWalletWithdrawals } from '@/modules/finance/api'
 */
export const getWithdrawalList = (...args: any[]) => {
  throw new Error(
    '[DEPRECATED] getWithdrawalList 已移至 finance 模块。' +
    '请使用:\n' +
    '  - financeAPI.getAuthorWithdrawals() 获取作者提现记录\n' +
    '  - financeAPI.getWalletWithdrawals() 获取钱包提现记录'
  )
}

/**
 * 处理提现申请
 * @deprecated 请使用 reviewWithdrawRequest 代替
 * 提现功能已移至 finance 模块
 */
export const handleWithdrawal = (...args: any[]) => {
  throw new Error(
    '[DEPRECATED] handleWithdrawal 已移至 finance 模块。\n' +
    '请使用:\n' +
    '  - financeAPI.reviewAuthorWithdrawal() 审核作者提现申请\n' +
    '  - financeAPI.reviewWalletWithdrawal() 审核钱包提现申请'
  )
}

/**
 * 审核提现申请（别名）
 * @deprecated 请使用 reviewWithdrawRequest 代替
 * 提现功能已移至 finance 模块
 */
export const reviewWithdraw = handleWithdrawal

// ==================== 用户管理相关 API ====================

/**
 * 获取用户管理列表
 * 兼容旧API: getUserList(params)
 */
export async function getUserList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
  role?: string
  status?: string
}): Promise<APIResponse<{ items: UserManagementItem[]; total: number }>> {
  return api.getApiV1AdminUsers(params as any) as any
}

/**
 * 更新用户信息
 * 兼容旧API: updateUser(id, params)
 */
export async function updateUser(id: string, params: Partial<UserManagementItem>): Promise<APIResponse<void>> {
  return api.putApiV1AdminUsersId(id, params as any) as any
}

/**
 * 删除用户
 * 兼容旧API: deleteUser(id)
 */
export async function deleteUser(id: string): Promise<APIResponse<void>> {
  return api.deleteApiV1AdminUsersId(id)
}

/**
 * 更新用户状态
 * 兼容旧API: updateUserStatus(id, params)
 */
export async function updateUserStatus(
  id: string,
  params: { status: string; reason?: string }
): Promise<APIResponse<void>> {
  return api.putApiV1AdminUsersIdStatus(id, params as any) as any
}

/**
 * 分配角色
 * 兼容旧API: assignRole(id, params)
 */
export async function assignRole(
  id: string,
  params: { role: string; reason?: string }
): Promise<APIResponse<void>> {
  return api.putApiV1AdminUsersIdRole(id, params as any) as any
}

/**
 * 更新用户角色（别名）
 * 使用 putApiV1AdminUsersIdRole
 */
export const updateUserRole = api.putApiV1AdminUsersIdRole

/**
 * 批量删除用户
 * 兼容旧API: batchDeleteUsers(params)
 */
export async function batchDeleteUsers(params: {
  userIds: string[]
  reason?: string
}): Promise<APIResponse<void>> {
  return api.postApiV1AdminUsersBatchDelete(params as any) as any
}

// ==================== 操作日志相关 API ====================

/**
 * 获取操作日志
 * 兼容旧API: getOperationLogs(params)
 */
export async function getOperationLogs(params?: {
  page?: number
  pageSize?: number
  action?: string
  operatorId?: string
  startTime?: number
  endTime?: number
}): Promise<APIResponse<{ items: OperationLog[]; total: number }>> {
  return api.getApiV1AdminOperationLogs(params as any) as any
}

// ==================== 配额管理相关 API ====================

/**
 * 获取用户配额详情
 * 兼容旧API: getUserQuotaDetails(userId)
 */
export async function getUserQuotaDetails(userId: string): Promise<APIResponse<any>> {
  return api.getApiV1AdminQuotaUserId(userId) as any
}

/**
 * 更新用户配额
 * 兼容旧API: updateUserQuota(userId, params)
 */
export async function updateUserQuota(userId: string, params: {
  quotaType?: 'free' | 'paid' | 'trial'
  totalQuota?: number
  resetDate?: string
}): Promise<APIResponse<void>> {
  return api.putApiV1AdminQuotaUserId(userId, params as any) as any
}

/**
 * 暂停用户配额
 * 兼容旧API: suspendUserQuota(userId, reason)
 */
export async function suspendUserQuota(userId: string): Promise<APIResponse<void>> {
  return api.postApiV1AdminQuotaUserIdSuspend(userId) as any
}

/**
 * 激活用户配额
 * 兼容旧API: activateUserQuota(userId)
 */
export async function activateUserQuota(userId: string): Promise<APIResponse<void>> {
  return api.postApiV1AdminQuotaUserIdActivate(userId) as any
}

/**
 * 更新配额
 * @deprecated 请使用 updateUserQuota 代替
 */
export const updateQuota = updateUserQuota

// ==================== 审核管理相关 API ====================

/**
 * 获取待审核内容列表
 * 兼容旧API: getPendingAudits(params)
 */
export async function getPendingAudits(params?: {
  page?: number
  pageSize?: number
  contentType?: string
  riskLevel?: string
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return api.getApiV1AdminAuditPending(params as any) as any
}

/**
 * 获取高风险审核列表
 * 兼容旧API: getHighRiskAudits(params)
 */
export async function getHighRiskAudits(params?: {
  page?: number
  pageSize?: number
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return api.getApiV1AdminAuditHighRisk(params as any) as any
}

/**
 * 获取审核统计数据
 * 兼容旧API: getAuditStatistics()
 */
export async function getAuditStatistics(): Promise<APIResponse<{
  pending: number
  approved: number
  rejected: number
  highRisk: number
}>> {
  return api.getApiV1AdminAuditStatistics() as any
}

/**
 * 审核内容
 * 兼容旧API: reviewAudit(auditId, params)
 */
export async function reviewAudit(auditId: string, params: {
  approved: boolean
  reason?: string
}): Promise<APIResponse<void>> {
  return api.postApiV1AdminAuditIdReview(auditId, params as any) as any
}

/**
 * 审核申诉
 */
export const reviewAppeal = api.postApiV1AdminAuditIdAppealReview

// ==================== 公告管理相关 API ====================

/**
 * 获取公告列表
 * 兼容旧API: getAnnouncements(params)
 */
export const getAnnouncements = api.getApiV1AdminAnnouncements

/**
 * 创建公告
 * 兼容旧API: createAnnouncement(data)
 */
export async function createAnnouncement(data: {
  title: string
  content: string
  type: 'system' | 'event' | 'maintenance'
  priority: 'low' | 'medium' | 'high'
  effectiveStartTime: string
  effectiveEndTime: string
}): Promise<APIResponse<any>> {
  return api.postApiV1AdminAnnouncements(data as any) as any
}

/**
 * 更新公告
 * 兼容旧API: updateAnnouncement(id, data)
 */
export async function updateAnnouncement(id: string, data: any): Promise<APIResponse<any>> {
  return api.putApiV1AdminAnnouncementsId(id, data as any) as any
}

/**
 * 删除公告
 * 兼容旧API: deleteAnnouncement(id)
 */
export const deleteAnnouncement = api.deleteApiV1AdminAnnouncementsId

/**
 * 批量更新公告状态
 * 兼容旧API: batchUpdateAnnouncementStatus(ids, status)
 */
export async function batchUpdateAnnouncementStatus(ids: string[], status: 'active' | 'inactive'): Promise<APIResponse<void>> {
  return api.putApiV1AdminAnnouncementsBatchStatus({ ids, status } as any) as any
}

/**
 * 批量删除公告
 */
export const batchDeleteAnnouncements = api.deleteApiV1AdminAnnouncementsBatchDelete

// ==================== 配置管理相关 API ====================

/**
 * 获取所有系统配置
 * 兼容旧API: getAllConfigs()
 */
export const getAllConfigs = api.getApiV1AdminConfig

/**
 * 获取单个配置项
 * 兼容旧API: getConfigByKey(key)
 */
export const getConfigByKey = api.getApiV1AdminConfigKey

/**
 * 更新配置项
 * 兼容旧API: updateConfig(key, value)
 */
export const updateConfig = api.putApiV1AdminConfig

/**
 * 批量更新配置项
 * 兼容旧API: batchUpdateConfig(configs)
 */
export const batchUpdateConfig = api.putApiV1AdminConfigBatch

/**
 * 验证配置项
 * 兼容旧API: validateConfig(configs)
 */
export const validateConfig = api.postApiV1AdminConfigValidate

/**
 * 系统配置请求
 * 使用 putApiV1AdminConfig
 */
export const systemConfig = api.putApiV1AdminConfig

// ==================== 配置备份相关 API ====================

/**
 * 获取配置备份列表
 * 兼容旧API: getConfigBackups()
 */
export const getConfigBackups = api.getApiV1AdminConfigBackups

/**
 * 恢复配置备份
 * 兼容旧API: restoreConfigBackup(backupId)
 */
export const restoreConfigBackup = api.postApiV1AdminConfigRestore

// ==================== Banner管理相关 API ====================

/**
 * 获取Banner列表
 * 兼容旧API: getBanners(params)
 */
export const getBanners = api.getApiV1AdminBanners

/**
 * 创建Banner
 * 兼容旧API: createBanner(data)
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
  return api.postApiV1AdminBanners(data as any) as any
}

/**
 * 更新Banner
 * 兼容旧API: updateBanner(id, data)
 */
export async function updateBanner(id: string, data: any): Promise<APIResponse<any>> {
  return api.putApiV1AdminBannersId(id, data as any) as any
}

/**
 * 删除Banner
 * 兼容旧API: deleteBanner(id)
 */
export const deleteBanner = api.deleteApiV1AdminBannersId

/**
 * 批量更新Banner排序
 */
export const batchUpdateBannerSort = api.putApiV1AdminBannersBatchSort

/**
 * 批量更新Banner状态
 */
export const batchUpdateBannerStatus = api.putApiV1AdminBannersBatchStatus

// ==================== 角色管理相关 API ====================

/**
 * 获取角色列表
 */
export const getRoles = api.getApiV1AdminRoles

/**
 * 创建角色
 */
export const createRole = api.postApiV1AdminRoles

/**
 * 获取角色详情
 */
export const getRole = api.getApiV1AdminRolesId

/**
 * 更新角色
 */
export const updateRole = api.putApiV1AdminRolesId

/**
 * 删除角色
 */
export const deleteRole = api.deleteApiV1AdminRolesId

/**
 * 获取角色权限
 */
export const getRolePermissions = api.getApiV1AdminRolesIdPermissions

// ==================== 权限管理相关 API ====================

/**
 * 获取所有权限
 */
export const getPermissions = api.getApiV1AdminPermissions

/**
 * 创建权限
 */
export const createPermission = api.postApiV1AdminPermissions

/**
 * 获取权限详情
 */
export const getPermission = api.getApiV1AdminPermissionsCode

/**
 * 更新权限
 */
export const updatePermission = api.putApiV1AdminPermissionsCode

/**
 * 删除权限
 */
export const deletePermission = api.deleteApiV1AdminPermissionsCode

// ==================== 批量操作相关 API ====================

/**
 * 批量更新状态
 * @deprecated 请使用具体的批量更新API
 * 例如：batchUpdateAnnouncementStatus, batchUpdateBannerStatus 等
 */
export const batchUpdateStatus = (...args: any[]) => {
  throw new Error(
    '[DEPRECATED] batchUpdateStatus 已被移除。\n' +
    '请使用具体的批量更新API：\n' +
    '  - batchUpdateAnnouncementStatus() - 批量更新公告状态\n' +
    '  - batchUpdateBannerStatus() - 批量更新Banner状态\n' +
    '  - 或其他特定模块的批量更新方法'
  )
}

/**
 * 批量删除
 * @deprecated 请使用具体的批量删除API
 * 例如：batchDeleteUsers, batchDeleteAnnouncements 等
 */
export const batchDelete = (...args: any[]) => {
  throw new Error(
    '[DEPRECATED] batchDelete 已被移除。\n' +
    '请使用具体的批量删除API：\n' +
    '  - batchDeleteUsers() - 批量删除用户\n' +
    '  - batchDeleteAnnouncements() - 批量删除公告\n' +
    '  - 或其他特定模块的批量删除方法'
  )
}

/**
 * 审核提现
 */
export const reviewWithdrawRequest = api.postApiV1AdminWithdrawReview

/**
 * 导出原始getApi函数（高级用法）
 * 可以传入自定义axios实例
 */
export { getApi }

/**
 * 默认导出
 */
export default {
  // 仪表盘相关
  getDashboardStats,
  getStats,
  // 审核相关
  getReviewList,
  getPendingReviews,
  getPendingAudits,
  getHighRiskAudits,
  getAuditStatistics,
  reviewAudit,
  reviewContent,
  reviewAppeal,
  // 提现相关
  getWithdrawalList,
  handleWithdrawal,
  reviewWithdraw,
  reviewWithdrawRequest,
  // 用户管理相关
  getUserList,
  updateUser,
  deleteUser,
  updateUserStatus,
  assignRole,
  updateUserRole,
  batchDeleteUsers,
  // 操作日志相关
  getOperationLogs,
  // 配额管理相关
  getUserQuotaDetails,
  updateUserQuota,
  suspendUserQuota,
  activateUserQuota,
  updateQuota,
  // 公告管理相关
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  batchUpdateAnnouncementStatus,
  batchDeleteAnnouncements,
  // 配置管理相关
  getAllConfigs,
  getConfigByKey,
  updateConfig,
  batchUpdateConfig,
  validateConfig,
  systemConfig,
  // 配置备份相关
  getConfigBackups,
  restoreConfigBackup,
  // Banner管理相关
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  batchUpdateBannerSort,
  batchUpdateBannerStatus,
  // 角色管理相关
  getRoles,
  createRole,
  getRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  // 权限管理相关
  getPermissions,
  createPermission,
  getPermission,
  updatePermission,
  deletePermission,
  // 批量操作相关
  batchUpdateStatus,
  batchDelete,
  // 工具函数
  getApi,
}

// 导出为默认对象，以支持 import { adminAPI } from './api'
const adminAPIExport = {
  // 仪表盘
  getDashboardStats,
  getStats,
  // 审核相关
  getPendingAudits,
  getReviewList,
  getPendingReviews,
  getHighRiskAudits,
  getAuditStatistics,
  reviewAudit,
  reviewContent,
  reviewAppeal,
  // 用户管理
  getUserList,
  updateUser,
  deleteUser,
  updateUserStatus,
  assignRole,
  updateUserRole,
  batchDeleteUsers,
  // 操作日志
  getOperationLogs,
  // 配额管理
  getUserQuotaDetails,
  updateUserQuota,
  suspendUserQuota,
  activateUserQuota,
  // 公告管理
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  batchUpdateAnnouncementStatus,
  batchDeleteAnnouncements,
  // 配置管理
  getAllConfigs,
  getConfigByKey,
  updateConfig,
  batchUpdateConfig,
  validateConfig,
  systemConfig,
  // 配置备份
  getConfigBackups,
  restoreConfigBackup,
  // Banner管理
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  batchUpdateBannerSort,
  batchUpdateBannerStatus,
  // 角色管理
  getRoles,
  createRole,
  getRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  // 权限管理
  getPermissions,
  createPermission,
  getPermission,
  updatePermission,
  deletePermission,
  // 提现审核
  reviewWithdrawRequest,
  // 工具函数
  getApi,
}

export const adminAPI = adminAPIExport
