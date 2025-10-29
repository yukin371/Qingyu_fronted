/**
 * 用户信息相关API
 * 获取个人信息、更新个人信息、修改密码
 */

import request from '@/utils/request'
import type { UserInfo, UpdateProfileRequest } from '@/types/user'

/**
 * 获取当前用户信息
 * GET /api/v1/users/profile
 */
export function getUserProfile() {
  return request.get<UserInfo>('/users/profile')
}

/**
 * 更新当前用户信息
 * PUT /api/v1/users/profile
 */
export function updateUserProfile(data: UpdateProfileRequest) {
  return request.put<UserInfo>('/users/profile', data)
}

/**
 * 修改密码
 * PUT /api/v1/users/password
 */
export function changePassword(oldPassword: string, newPassword: string) {
  return request.put<void>('/users/password', {
    oldPassword,
    newPassword,
  })
}
