
/**
 * 用户模块API
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse } from '@/types/api'

export interface UserProfile {
  id: string
  username: string
  email: string
  nickname?: string
  avatar?: string
  bio?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}

export interface UpdateProfileData {
  nickname?: string
  bio?: string
  avatar?: string
}

export interface AvatarUploadResponse {
  url: string
}

/**
 * 用户API
 */
export const userAPI = {
  /**
   * 获取用户信息
   */
  async getProfile(): Promise<UserProfile> {
    return httpService.get<UserProfile>('/user/profile')
  },

  /**
   * 更新用户信息
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    return httpService.put<UserProfile>('/user/profile', data)
  },

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData()
    formData.append('avatar', file)

    return httpService.post<AvatarUploadResponse>('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 获取用户书架
   */
  async getBookshelf(): Promise<any[]> {
    return httpService.get<any[]>('/user/bookshelf')
  },

  /**
   * 获取阅读历史
   */
  async getReadingHistory(): Promise<any[]> {
    return httpService.get<any[]>('/user/reading-history')
  }
}

export default userAPI
