import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { User } from '@/types/models'
import type { LoginCredentials, RegisterData, LoginResponse, UserUpdateData, PasswordChangeData } from './user'

/**
 * Token 刷新响应
 */
export interface TokenRefreshResponse {
  token: string
  refreshToken?: string
}

/**
 * 可用性检查响应
 */
export interface AvailabilityResponse {
  available: boolean
  message?: string
}

/**
 * 用户认证API接口
 * 基于后端 API v1.0 - 更新接口路径以匹配实际后端
 */
export const authAPI = {
  /**
   * 用户注册
   */
  async register(userData: RegisterData): Promise<ApiResponse<LoginResponse>> {
    return request.post('/register', userData)
  },

  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return request.post('/login', credentials)
  },

  /**
   * 用户登出（客户端清除token）
   * 注意：当前后端未实现登出接口，仅清除本地状态
   */
  async logout(): Promise<{ message: string }> {
    // 后端暂无登出接口，仅返回成功响应
    return Promise.resolve({ message: '登出成功' })
  },

  /**
   * 刷新Token
   * 注意：当前后端未实现token刷新，需要重新登录
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<TokenRefreshResponse>> {
    // 后端暂无刷新token接口
    return Promise.reject(new Error('Token刷新功能暂未实现，请重新登录'))
  },

  /**
   * 获取当前用户信息
   */
  async getUserInfo(): Promise<ApiResponse<{
    user: User
    permissions?: string[]
    roles?: string[]
  }>> {
    return request.get('/users/profile')
  },

  /**
   * 更新用户信息
   */
  async updateUserInfo(userInfo: UserUpdateData): Promise<ApiResponse<{
    user: User
  }>> {
    return request.put('/users/profile', userInfo)
  },

  /**
   * 修改密码
   */
  async changePassword(passwordData: PasswordChangeData): Promise<ApiResponse<any>> {
    return request.put('/users/password', passwordData)
  },

  // 以下功能暂未实现，保留接口供后续扩展

  /**
   * 发送验证码（未实现）
   */
  async sendVerificationCode(email: string): Promise<ApiResponse<{ message: string }>> {
    return Promise.reject(new Error('验证码功能暂未实现'))
  },

  /**
   * 验证邮箱（未实现）
   */
  async verifyEmail(verificationData: { email: string; code: string }): Promise<ApiResponse<any>> {
    return Promise.reject(new Error('邮箱验证功能暂未实现'))
  },

  /**
   * 重置密码（未实现）
   */
  async resetPassword(resetData: { email: string; code: string; new_password: string }): Promise<ApiResponse<any>> {
    return Promise.reject(new Error('密码重置功能暂未实现'))
  },

  /**
   * 检查用户名是否可用（未实现）
   */
  async checkUsername(username: string): Promise<ApiResponse<AvailabilityResponse>> {
    return Promise.reject(new Error('用户名检查功能暂未实现'))
  },

  /**
   * 检查邮箱是否可用（未实现）
   */
  async checkEmail(email: string): Promise<ApiResponse<AvailabilityResponse>> {
    return Promise.reject(new Error('邮箱检查功能暂未实现'))
  }
}

export default authAPI


