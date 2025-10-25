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
 * 注意：响应拦截器已解包APIResponse，函数直接返回数据
 */
export const authAPI = {
  /**
   * 用户注册
   */
  async register(userData: RegisterData): Promise<LoginResponse> {
    return request.post('/register', userData)
  },

  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return request.post('/login', credentials)
  },

  /**
   * 用户登出 (v1.3)
   */
  async logout(): Promise<null> {
    return request.post('/shared/auth/logout')
  },

  /**
   * 刷新Token (v1.3)
   */
  async refreshToken(): Promise<TokenRefreshResponse> {
    return request.post('/shared/auth/refresh')
  },

  /**
   * 获取用户权限 (v1.3新增)
   */
  async getPermissions(): Promise<UserPermission[]> {
    return request.get('/shared/auth/permissions')
  },

  /**
   * 获取用户角色 (v1.3新增)
   */
  async getRoles(): Promise<UserRole[]> {
    return request.get('/shared/auth/roles')
  },

  /**
   * 获取当前用户信息
   */
  async getUserInfo(): Promise<{
    user: User
    permissions?: string[]
    roles?: string[]
  }> {
    return request.get('/users/profile')
  },

  /**
   * 更新用户信息
   */
  async updateUserInfo(userInfo: any): Promise<{
    user: User
  }> {
    return request.put('/users/profile', userInfo)
  },

  /**
   * 修改密码
   */
  async changePassword(passwordData: any): Promise<any> {
    return request.put('/users/password', passwordData)
  },

  // 以下功能保留接口供后续扩展

  /**
   * 发送验证码
   */
  async sendVerificationCode(email: string): Promise<{ message: string }> {
    return request.post('/auth/send-code', { email })
  },

  /**
   * 验证邮箱
   */
  async verifyEmail(verificationData: { email: string; code: string }): Promise<any> {
    return request.post('/auth/verify-email', verificationData)
  },

  /**
   * 重置密码
   */
  async resetPassword(resetData: { email: string; code: string; new_password: string }): Promise<any> {
    return request.post('/auth/reset-password', resetData)
  },

  /**
   * 检查用户名是否可用
   */
  async checkUsername(username: string): Promise<AvailabilityResponse> {
    return request.get('/auth/check-username', {
      params: { username }
    })
  },

  /**
   * 检查邮箱是否可用
   */
  async checkEmail(email: string): Promise<AvailabilityResponse> {
    return request.get('/auth/check-email', {
      params: { email }
    })
  }
}

export default authAPI


