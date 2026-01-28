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
 * @description 获取管理员仪表盘的统计数据
 * @endpoint GET /admin/dashboard/stats
 * @category admin
 * @tags 管理员
 * @response {DashboardStats} 200 - 成功返回仪表盘统计数据
 * @security BearerAuth
 */
export async function getDashboardStats(): Promise<APIResponse<DashboardStats>> {
  return httpService.get<APIResponse<DashboardStats>>('/admin/dashboard/stats')
}

/**
 * 获取待审核内容列表
 * @description 获取待审核的内容列表
 * @endpoint GET /admin/reviews
 * @category admin
 * @tags 管理员
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} status - 状态筛选
 * @param {string} type - 类型筛选
 * @response {Object} 200 - 成功返回待审核列表
 * @response {ReviewItem[]} items - 待审核项列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 获取待审核内容列表的别名函数
 * @endpoint GET /admin/reviews
 * @category admin
 * @tags 管理员
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} status - 状态筛选
 * @param {string} type - 类型筛选
 * @response {Object} 200 - 成功返回待审核列表
 * @response {ReviewItem[]} items - 待审核项列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 审核内容并决定通过或拒绝
 * @endpoint POST /admin/reviews/:id
 * @category admin
 * @tags 管理员
 * @param {string} id - 审核项ID
 * @param {Object} params - 审核参数
 * @param {string} params.status - 审核状态（approved/rejected）
 * @param {string} params.reason - 拒绝原因（可选）
 * @response {void} 200 - 审核成功
 * @security BearerAuth
 */
export async function reviewContent(id: string, params: {
  status: 'approved' | 'rejected'
  reason?: string
}): Promise<APIResponse<void>> {
  return httpService.post<APIResponse<void>>(`/admin/reviews/${id}`, params)
}

/**
 * 获取提现申请列表
 * @description 获取用户的提现申请列表
 * @endpoint GET /admin/withdrawals
 * @category admin
 * @tags 管理员
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} status - 状态筛选
 * @response {Object} 200 - 成功返回提现申请列表
 * @response {WithdrawalRequest[]} items - 提现申请列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 处理用户的提现申请
 * @endpoint POST /admin/withdrawals/:id
 * @category admin
 * @tags 管理员
 * @param {string} id - 提现申请ID
 * @param {Object} params - 处理参数
 * @param {string} params.status - 处理状态（approved/rejected）
 * @param {string} params.reason - 拒绝原因（可选）
 * @response {void} 200 - 处理成功
 * @security BearerAuth
 */
export async function handleWithdrawal(id: string, params: {
  status: 'approved' | 'rejected'
  reason?: string
}): Promise<APIResponse<void>> {
  return httpService.post<APIResponse<void>>(`/admin/withdrawals/${id}`, params)
}

/**
 * 审核提现申请（别名）
 * @description 审核提现申请的别名函数
 * @endpoint POST /admin/withdrawals/:id
 * @category admin
 * @tags 管理员
 * @param {string} id - 提现申请ID
 * @param {Object} params - 审核参数
 * @param {string} params.status - 审核状态（approved/rejected）
 * @param {string} params.reason - 拒绝原因（可选）
 * @response {void} 200 - 审核成功
 * @security BearerAuth
 */
export async function reviewWithdraw(id: string, params: {
  status: 'approved' | 'rejected'
  reason?: string
}): Promise<APIResponse<void>> {
  return handleWithdrawal(id, params)
}

/**
 * 获取用户管理列表
 * @description 获取用户管理列表,支持搜索和筛选
 * @endpoint GET /admin/users
 * @category admin
 * @tags 管理员
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} keyword - 搜索关键词
 * @param {string} role - 角色筛选
 * @param {string} status - 状态筛选
 * @response {Object} 200 - 成功返回用户列表
 * @response {UserManagementItem[]} items - 用户列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 更新指定用户的信息
 * @endpoint PUT /admin/users/:id
 * @category admin
 * @tags 管理员
 * @param {string} id - 用户ID
 * @param {Partial<UserManagementItem>} params - 用户信息
 * @response {void} 200 - 更新成功
 * @security BearerAuth
 */
export async function updateUser(id: string, params: Partial<UserManagementItem>): Promise<APIResponse<void>> {
  return httpService.put<APIResponse<void>>(`/admin/users/${id}`, params)
}

/**
 * 删除用户
 * @description 删除指定用户
 * @endpoint DELETE /admin/users/:id
 * @category admin
 * @tags 管理员
 * @param {string} id - 用户ID
 * @response {void} 200 - 删除成功
 * @security BearerAuth
 */
export async function deleteUser(id: string): Promise<APIResponse<void>> {
  return httpService.delete<APIResponse<void>>(`/admin/users/${id}`)
}

/**
 * 获取操作日志
 * @description 获取系统操作日志记录
 * @endpoint GET /admin/logs
 * @category admin
 * @tags 管理员
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} action - 操作类型筛选
 * @param {string} operatorId - 操作员ID筛选
 * @param {number} startTime - 开始时间戳
 * @param {number} endTime - 结束时间戳
 * @response {Object} 200 - 成功返回操作日志
 * @response {OperationLog[]} items - 操作日志列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 获取指定用户的配额详情
 * @endpoint GET /admin/quota/:userId
 * @category admin
 * @tags 管理员-配额管理
 * @param {string} userId - 用户ID
 * @response {Object} 200 - 成功返回用户配额详情
 * @security BearerAuth
 */
export async function getUserQuotaDetails(userId: string): Promise<APIResponse<any>> {
  return httpService.get<APIResponse<any>>(`/admin/quota/${userId}`)
}

/**
 * 更新用户配额
 * @description 更新指定用户的配额信息
 * @endpoint PUT /admin/quota/:userId
 * @category admin
 * @tags 管理员-配额管理
 * @param {string} userId - 用户ID
 * @param {Object} params - 配额参数
 * @param {string} params.quotaType - 配额类型
 * @param {number} params.totalQuota - 总配额
 * @param {string} params.resetDate - 重置日期
 * @response {void} 200 - 更新成功
 * @security BearerAuth
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
 * @description 暂停指定用户的配额
 * @endpoint POST /admin/quota/:userId/suspend
 * @category admin
 * @tags 管理员-配额管理
 * @param {string} userId - 用户ID
 * @param {string} reason - 暂停原因
 * @response {void} 200 - 暂停成功
 * @security BearerAuth
 */
export async function suspendUserQuota(userId: string, reason?: string): Promise<APIResponse<void>> {
  return httpService.post<APIResponse<void>>(`/admin/quota/${userId}/suspend`, { reason })
}

/**
 * 激活用户配额
 * @description 激活指定用户的配额
 * @endpoint POST /admin/quota/:userId/activate
 * @category admin
 * @tags 管理员-配额管理
 * @param {string} userId - 用户ID
 * @response {void} 200 - 激活成功
 * @security BearerAuth
 */
export async function activateUserQuota(userId: string): Promise<APIResponse<void>> {
  return httpService.post<APIResponse<void>>(`/admin/quota/${userId}/activate`)
}

/**
 * 获取配额统计
 * @description 获取系统配额统计数据
 * @endpoint GET /admin/quota/statistics
 * @category admin
 * @tags 管理员-配额管理
 * @response {Object} 200 - 成功返回配额统计
 * @response {number} totalUsers - 总用户数
 * @response {number} activeUsers - 活跃用户数
 * @response {number} totalQuota - 总配额
 * @response {number} usedQuota - 已用配额
 * @security BearerAuth
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
 * 获取待审核内容列表
 * @description 获取系统中待审核的内容列表，支持按内容类型和风险等级筛选
 * @endpoint GET /admin/audit/pending
 * @category admin
 * @tags 管理员-审核管理
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} contentType - 内容类型筛选
 * @param {string} riskLevel - 风险等级筛选
 * @response {Object} 200 - 成功返回待审核内容列表
 * @response {any[]} items - 待审核内容列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * 获取高风险审核列表
 * @description 获取系统标记为高风险的待审核内容列表
 * @endpoint GET /admin/audit/high-risk
 * @category admin
 * @tags 管理员-审核管理
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @response {Object} 200 - 成功返回高风险审核列表
 * @response {any[]} items - 高风险审核列表
 * @response {number} total - 总数量
 * @security BearerAuth
 */
export async function getHighRiskAudits(params?: {
  page?: number
  pageSize?: number
}): Promise<APIResponse<{ items: any[]; total: number }>> {
  return httpService.get<APIResponse<{ items: any[]; total: number }>>('/admin/audit/high-risk', { params })
}

/**
 * 获取审核统计数据
 * @description 获取系统审核相关的统计数据
 * @endpoint GET /admin/audit/statistics
 * @category admin
 * @tags 管理员-审核管理
 * @response {Object} 200 - 成功返回审核统计数据
 * @response {number} pending - 待审核数量
 * @response {number} approved - 已通过数量
 * @response {number} rejected - 已拒绝数量
 * @response {number} highRisk - 高风险数量
 * @security BearerAuth
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
 * @description 对指定的审核项进行审核，决定通过或拒绝
 * @endpoint POST /admin/audit/:auditId/review
 * @category admin
 * @tags 管理员-审核管理
 * @param {string} auditId - 审核项ID
 * @param {Object} params - 审核参数
 * @param {boolean} params.approved - 是否通过审核
 * @param {string} params.reason - 审核意见或拒绝原因（可选）
 * @response {void} 200 - 审核成功
 * @security BearerAuth
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
 * @description 获取系统公告列表，支持分页和状态筛选
 * @endpoint GET /admin/announcements
 * @category admin
 * @tags 管理员-公告管理
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} status - 状态筛选
 * @response {Object} 200 - 成功返回公告列表
 * @response {any[]} items - 公告列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 创建新的系统公告
 * @endpoint POST /admin/announcements
 * @category admin
 * @tags 管理员-公告管理
 * @param {Object} data - 公告数据
 * @param {string} data.title - 公告标题
 * @param {string} data.content - 公告内容
 * @param {string} data.type - 公告类型（system/event/maintenance）
 * @param {string} data.priority - 优先级（low/medium/high）
 * @param {string} data.effectiveStartTime - 生效开始时间
 * @param {string} data.effectiveEndTime - 生效结束时间
 * @response {any} 201 - 创建成功，返回公告详情
 * @security BearerAuth
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
 * @description 更新指定公告的信息
 * @endpoint PUT /admin/announcements/:id
 * @category admin
 * @tags 管理员-公告管理
 * @param {string} id - 公告ID
 * @param {any} data - 公告更新数据
 * @response {any} 200 - 更新成功，返回公告详情
 * @security BearerAuth
 */
export async function updateAnnouncement(id: string, data: any): Promise<APIResponse<any>> {
  return httpService.put<APIResponse<any>>(`/admin/announcements/${id}`, data)
}

/**
 * 删除公告
 * @description 删除指定的公告
 * @endpoint DELETE /admin/announcements/:id
 * @category admin
 * @tags 管理员-公告管理
 * @param {string} id - 公告ID
 * @response {void} 200 - 删除成功
 * @security BearerAuth
 */
export async function deleteAnnouncement(id: string): Promise<APIResponse<void>> {
  return httpService.delete<APIResponse<void>>(`/admin/announcements/${id}`)
}

/**
 * 批量更新公告状态
 * @description 批量更新多个公告的激活状态
 * @endpoint PUT /admin/announcements/batch-status
 * @category admin
 * @tags 管理员-公告管理
 * @param {string[]} ids - 公告ID列表
 * @param {string} status - 目标状态（active/inactive）
 * @response {void} 200 - 更新成功
 * @security BearerAuth
 */
export async function batchUpdateAnnouncementStatus(ids: string[], status: 'active' | 'inactive'): Promise<APIResponse<void>> {
  return httpService.post<APIResponse<void>>('/admin/announcements/batch-status', { ids, status })
}

/**
 * ==================== 配置管理 ====================
 * 对接后端: /api/v1/admin/config/*
 */

/**
 * 获取所有系统配置
 * @description 获取系统中所有配置项的键值对
 * @endpoint GET /admin/config
 * @category admin
 * @tags 管理员-配置管理
 * @response {Record<string, any>} 200 - 成功返回所有配置
 * @security BearerAuth
 */
export async function getAllConfigs(): Promise<APIResponse<Record<string, any>>> {
  return httpService.get<APIResponse<Record<string, any>>>('/admin/config')
}

/**
 * 获取单个配置项
 * @description 根据配置键获取指定的配置值
 * @endpoint GET /admin/config/:key
 * @category admin
 * @tags 管理员-配置管理
 * @param {string} key - 配置键名
 * @response {any} 200 - 成功返回配置值
 * @security BearerAuth
 */
export async function getConfigByKey(key: string): Promise<APIResponse<any>> {
  return httpService.get<APIResponse<any>>(`/admin/config/${key}`)
}

/**
 * 更新配置项
 * @description 更新指定的系统配置项
 * @endpoint PUT /admin/config
 * @category admin
 * @tags 管理员-配置管理
 * @param {string} key - 配置键名
 * @param {any} value - 配置值
 * @response {void} 200 - 更新成功
 * @security BearerAuth
 */
export async function updateConfig(key: string, value: any): Promise<APIResponse<void>> {
  return httpService.put<APIResponse<void>>('/admin/config', { key, value })
}

/**
 * 批量更新配置项
 * @description 批量更新多个系统配置项
 * @endpoint PUT /admin/config/batch
 * @category admin
 * @tags 管理员-配置管理
 * @param {Record<string, any>} configs - 配置键值对对象
 * @response {void} 200 - 更新成功
 * @security BearerAuth
 */
export async function batchUpdateConfig(configs: Record<string, any>): Promise<APIResponse<void>> {
  return httpService.put<APIResponse<void>>('/admin/config/batch', { configs })
}

/**
 * 验证配置项
 * @description 验证配置项的有效性，检查是否符合系统要求
 * @endpoint POST /admin/config/validate
 * @category admin
 * @tags 管理员-配置管理
 * @param {Record<string, any>} configs - 待验证的配置键值对
 * @response {Object} 200 - 验证结果
 * @response {boolean} valid - 是否有效
 * @response {string[]} errors - 错误信息列表（可选）
 * @security BearerAuth
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
 * @description 获取系统中所有配置备份记录
 * @endpoint GET /admin/config/backups
 * @category admin
 * @tags 管理员-配置备份
 * @response {any[]} 200 - 成功返回配置备份列表
 * @security BearerAuth
 */
export async function getConfigBackups(): Promise<APIResponse<any[]>> {
  return httpService.get<APIResponse<any[]>>('/admin/config/backups')
}

/**
 * 恢复配置备份
 * @description 从指定的备份ID恢复系统配置
 * @endpoint POST /admin/config/backups/:backupId/restore
 * @category admin
 * @tags 管理员-配置备份
 * @param {string} backupId - 备份ID
 * @response {void} 200 - 恢复成功
 * @security BearerAuth
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
 * @description 获取系统Banner列表，支持分页、位置和状态筛选
 * @endpoint GET /admin/banners
 * @category admin
 * @tags 管理员-Banner管理
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} position - 位置筛选
 * @param {string} status - 状态筛选
 * @response {Object} 200 - 成功返回Banner列表
 * @response {any[]} items - Banner列表
 * @response {number} total - 总数量
 * @security BearerAuth
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
 * @description 创建新的系统Banner
 * @endpoint POST /admin/banners
 * @category admin
 * @tags 管理员-Banner管理
 * @param {Object} data - Banner数据
 * @param {string} data.title - Banner标题
 * @param {string} data.imageUrl - 图片URL
 * @param {string} data.link - 跳转链接（可选）
 * @param {string} data.position - 展示位置
 * @param {number} data.sortOrder - 排序顺序（可选）
 * @param {string} data.startTime - 开始时间（可选）
 * @param {string} data.endTime - 结束时间（可选）
 * @response {any} 201 - 创建成功，返回Banner详情
 * @security BearerAuth
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
 * @description 更新指定Banner的信息
 * @endpoint PUT /admin/banners/:id
 * @category admin
 * @tags 管理员-Banner管理
 * @param {string} id - Banner ID
 * @param {any} data - Banner更新数据
 * @response {any} 200 - 更新成功，返回Banner详情
 * @security BearerAuth
 */
export async function updateBanner(id: string, data: any): Promise<APIResponse<any>> {
  return httpService.put<APIResponse<any>>(`/admin/banners/${id}`, data)
}

/**
 * 删除Banner
 * @description 删除指定的Banner
 * @endpoint DELETE /admin/banners/:id
 * @category admin
 * @tags 管理员-Banner管理
 * @param {string} id - Banner ID
 * @response {void} 200 - 删除成功
 * @security BearerAuth
 */
export async function deleteBanner(id: string): Promise<APIResponse<void>> {
  return httpService.delete<APIResponse<void>>(`/admin/banners/${id}`)
}

