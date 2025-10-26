/**
 * User API
 */

import { httpService } from '@/core/services/http.service'
import type {
  UserProfile,
  UpdateProfileParams,
  ChangePasswordParams
} from '../types/user.types'
import type { APIResponse, UploadResponse } from '@/core/types/api.types'

export const userAPI = {
  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    const response = await httpService.get<APIResponse<UserProfile>>('/user/profile')
    return response.data
  },

  /**
   * Update user profile
   */
  async updateUserProfile(data: UpdateProfileParams): Promise<void> {
    return httpService.put('/user/profile', data)
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordParams): Promise<void> {
    return httpService.post('/user/password/change', data)
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await httpService.post<APIResponse<UploadResponse>>('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } as any)
    return response.data
  },

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<any> {
    return httpService.get('/user/statistics')
  }
}

export default userAPI

