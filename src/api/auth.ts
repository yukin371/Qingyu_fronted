/**
 * 认证API模块 (v1.3)
 * 基于 doc/api/frontend/认证API参考.md
 */

import request from '@/utils/request'
import type { APIResponse } from '@/types/api'
import type { User } from '@/types/models'
import type {
  LoginCredentials,
  RegisterData,
  LoginResponse,
  TokenRefreshResponse,
  UserPermission,
  UserRole,
  AvailabilityResponse
} from '@/types/auth'

// 导入用户相关类型
export type { UserUpdateData, PasswordChangeData } from './user'

/**
 * 用户认证API接口 (v1.3)
 * 注意：响应拦截器返回完整的 APIResponse 对象 {code, message, data, timestamp, request_id}
 */
export const authAPI = {
  /**
   * 用户注册
   */
  async register(userData: RegisterData): Promise<APIResponse<LoginResponse>> {
    return request.post<APIResponse<LoginResponse>>('/register', userData)
  },

  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<APIResponse<LoginResponse>> {
    return request.post<APIResponse<LoginResponse>>('/login', credentials)
  },

  /**
   * 用户登出 (v1.3)
   */
  async logout(): Promise<APIResponse<null>> {
    return request.post<APIResponse<null>>('/shared/auth/logout')
  },

  /**
   * 刷新Token (v1.3)
   */
  async refreshToken(): Promise<APIResponse<TokenRefreshResponse>> {
    return request.post<APIResponse<TokenRefreshResponse>>('/shared/auth/refresh')
  },

  /**
   * 获取用户权限 (v1.3新增)
   */
  async getPermissions(): Promise<APIResponse<UserPermission[]>> {
    return request.get<APIResponse<UserPermission[]>>('/shared/auth/permissions')
  },

  /**
   * 获取用户角色 (v1.3新增)
   */
  async getRoles(): Promise<APIResponse<UserRole[]>> {
    return request.get<APIResponse<UserRole[]>>('/shared/auth/roles')
  },

  /**
   * 获取当前用户信息
   */
  async getUserInfo(): Promise<APIResponse<{
    user: User
    permissions?: string[]
    roles?: string[]
  }>> {
    return request.get<APIResponse<{
      user: User
      permissions?: string[]
      roles?: string[]
    }>>('/users/profile')
  },

  /**
   * 更新用户信息
   */
  async updateUserInfo(userInfo: any): Promise<APIResponse<{
    user: User
  }>> {
    return request.put<APIResponse<{
      user: User
    }>>('/users/profile', userInfo)
  },

  /**
   * 修改密码
   */
  async changePassword(passwordData: any): Promise<APIResponse<any>> {
    return request.put<APIResponse<any>>('/users/password', passwordData)
  },

  // 以下功能保留接口供后续扩展

  /**
   * 发送验证码
   */
  async sendVerificationCode(email: string): Promise<APIResponse<{ message: string }>> {
    return request.post<APIResponse<{ message: string }>>('/auth/send-code', { email })
  },

  /**
   * 验证邮箱
   */
  async verifyEmail(verificationData: { email: string; code: string }): Promise<APIResponse<any>> {
    return request.post<APIResponse<any>>('/auth/verify-email', verificationData)
  },

  /**
   * 重置密码
   */
  async resetPassword(resetData: { email: string; code: string; new_password: string }): Promise<APIResponse<any>> {
    return request.post<APIResponse<any>>('/auth/reset-password', resetData)
  },

  /**
   * 检查用户名是否可用
   */
  async checkUsername(username: string): Promise<APIResponse<AvailabilityResponse>> {
    return request.get<APIResponse<AvailabilityResponse>>('/auth/check-username', {
      params: { username }
    })
  },

  /**
   * 检查邮箱是否可用
   */
  async checkEmail(email: string): Promise<APIResponse<AvailabilityResponse>> {
    return request.get<APIResponse<AvailabilityResponse>>('/auth/check-email', {
      params: { email }
    })
  }
}

export default authAPI


