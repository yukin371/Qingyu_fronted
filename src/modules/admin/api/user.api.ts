/**
 * Admin user.api - 用户管理相关 API
 */

import { api, httpService, unwrapPayload } from './shared'
import type { APIResponse } from '@/types/api'
import type { UserManagementItem } from '@/modules/admin/types/admin.types'

/**
 * 获取用户管理列表
 * 兼容旧API: getUserList(params)
 *
 * 注意：httpService 响应拦截器已自动解包 APIResponse
 * 后端返回: { users: UserManagementItem[], total: number, page: number, size: number }
 */
export async function getUserList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
  role?: string
  status?: string
}): Promise<{ users: UserManagementItem[]; total: number; page: number; size: number }> {
  const response = await api.getApiV1AdminUsers(params as any)
  return unwrapPayload(response)
}

export async function getUserCountsByStatus(): Promise<Record<string, number>> {
  const response = await api.getApiV1AdminUsersCountByStatus()
  return unwrapPayload(response)
}

export async function createUser(data: {
  username: string
  email: string
  password?: string
  nickname?: string
  role: string
  status?: string
  bio?: string
}): Promise<APIResponse<any>> {
  return httpService.post('/admin/users', data) as any
}

export async function batchCreateUsers(data: {
  count: number
  prefix?: string
  role: string
  status?: string
}): Promise<APIResponse<{ users: any[]; count: number }>> {
  return httpService.post('/admin/users/batch-create', data) as any
}

/**
 * 更新用户信息
 * 兼容旧API: updateUser(id, params)
 * 注意：后端暂不支持完整的用户更新，请使用 updateUserStatus 或 assignRole
 */
export async function updateUser(
  id: string,
  params: Partial<UserManagementItem>,
): Promise<APIResponse<void>> {
  // 如果只更新状态，使用状态更新接口
  if (params.status && Object.keys(params).length === 1) {
    return api.putApiV1AdminUsersIdStatus(id, { status: params.status } as any) as any
  }
  // 如果只更新角色，使用角色分配接口
  if (params.roles && Object.keys(params).length === 1) {
    return api.putApiV1AdminUsersIdRole(id, { role: params.roles[0] } as any) as any
  }
  // 其他情况暂不支持，抛出错误
  throw new Error(
    'updateUser: 当前仅支持更新 status 或 roles 单个字段，请使用 updateUserStatus 或 assignRole',
  )
}

/**
 * 删除用户
 * 兼容旧API: deleteUser(id)
 */
export async function deleteUser(id: string): Promise<APIResponse<void>> {
  return api.deleteApiV1AdminUsersId(id) as any
}

/**
 * 更新用户状态
 * 兼容旧API: updateUserStatus(id, params)
 */
export async function updateUserStatus(
  id: string,
  params: { status: string; reason?: string },
): Promise<APIResponse<void>> {
  return api.putApiV1AdminUsersIdStatus(id, params as any) as any
}

/**
 * 分配角色
 * 兼容旧API: assignRole(id, params)
 */
export async function assignRole(
  id: string,
  params: { role: string; reason?: string },
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

export async function batchUpdateUserStatus(params: {
  userIds: string[]
  status: string
}): Promise<APIResponse<void>> {
  return api.postApiV1AdminUsersBatchUpdateStatus(params as any) as any
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
export async function updateUserQuota(
  userId: string,
  params: {
    quotaType?: 'free' | 'paid' | 'trial'
    totalQuota?: number
    resetDate?: string
  },
): Promise<APIResponse<void>> {
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
