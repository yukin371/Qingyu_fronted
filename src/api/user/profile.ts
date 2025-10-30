/**
 * 用户 - 个人资料相关API
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

/**
 * 上传头像
 * POST /api/v1/users/avatar
 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)
  return request.post<{ url: string }>('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

