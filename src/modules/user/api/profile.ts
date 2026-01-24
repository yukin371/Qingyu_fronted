/**
 * 用户 - 个人资料相关API
 */

import { httpService } from '@/core/services/http.service'
import type { UserInfo, UpdateProfileRequest } from '@/types/user'

/**
 * 获取当前用户信息
 * @description 获取当前登录用户的详细资料信息
 * @endpoint GET /api/v1/users/profile
 * @category user
 * @tags 用户相关
 * @response {UserInfo} 200 - 成功返回用户信息
 * @security BearerAuth
 */
export function getUserProfile() {
  return httpService.get<UserInfo>('/users/profile')
}

/**
 * 更新当前用户信息
 * @description 更新当前登录用户的资料信息
 * @endpoint PUT /api/v1/users/profile
 * @category user
 * @tags 用户相关
 * @param {UpdateProfileRequest} data - 用户信息更新数据
 * @response {UserInfo} 200 - 成功返回更新后的用户信息
 * @security BearerAuth
 */
export function updateUserProfile(data: UpdateProfileRequest) {
  return httpService.put<UserInfo>('/users/profile', data)
}

/**
 * 修改密码
 * @description 修改当前登录用户的密码
 * @endpoint PUT /api/v1/users/password
 * @category user
 * @tags 用户相关
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @response {void} 200 - 密码修改成功
 * @security BearerAuth
 */
export function changePassword(oldPassword: string, newPassword: string) {
  return httpService.put<void>('/users/password', {
    oldPassword,
    newPassword,
  })
}

/**
 * 上传头像
 * @description 上传用户头像图片文件
 * @endpoint POST /api/v1/users/avatar
 * @category user
 * @tags 用户相关
 * @param {File} file - 头像图片文件
 * @response {AvatarUploadResponse} 201 - 成功返回头像URL
 * @security BearerAuth
 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)
  return httpService.post<{ url: string }>('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

