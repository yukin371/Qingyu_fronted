/**
 * 共享认证服务API模块
 *
 * 对接后端 /api/v1/shared/auth 路由
 * 后端路由文档:
 *   - Qingyu_backend/router/shared/shared_router.go
 */

import { httpService } from '@/core/services/http.service'
import type {
  LoginCredentials,
  RegisterData,
  LoginResponse,
  TokenRefreshResponse,
  UserPermission,
  UserRole,
  UserInfo
} from '@/types/auth'

/**
 * 认证路由配置
 * 支持两种模式:
 * 1. shared模式: 使用完整的shared认证服务 (/api/v1/shared/auth/*)
 * 2. user模式: 使用user服务提供的简化认证接口 (/api/v1/register, /api/v1/login)
 */
const AUTH_CONFIG = {
  useSharedRoutes: true,  // 是否使用shared路由
}

/**
 * 获取认证API路径
 */
function getAuthPath(endpoint: string): string {
  if (AUTH_CONFIG.useSharedRoutes) {
    return `/shared/auth/${endpoint}`  // /api/v1/shared/auth/register
  } else {
    return endpoint  // /register, /login
  }
}

/**
 * 修改密码请求数据
 */
export interface PasswordChangeData {
  old_password: string
  new_password: string
}

/**
 * 用户可用性检查响应
 */
export interface CheckAvailabilityResponse {
  available: boolean
  message?: string
}

/**
 * 共享认证服务API接口
 *
 * 后端路由说明：
 * - 用户路由: /api/v1/register, /api/v1/login, /api/v1/users/*
 * - 共享服务路由: /api/v1/shared/auth/*
 *
 * 前端baseURL配置为: http://localhost:8080/api/v1
 */
export const sharedAuthAPI = {
  /**
   * 用户注册
   * @description 创建新用户账号，注册成功后自动登录
   * @endpoint POST /api/v1/shared/auth/register
   * @category auth
   * @tags 认证相关
   * @param {RegisterData} data - 注册数据（用户名、邮箱、密码等）
   * @response {LoginResponse} 201 - 注册成功，返回用户信息和Token
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    return httpService.post<LoginResponse>(getAuthPath('register'), data)
  },

  /**
   * 用户登录
   * @description 使用用户名或邮箱登录系统
   * @endpoint POST /api/v1/shared/auth/login
   * @category auth
   * @tags 认证相关
   * @param {LoginCredentials} data - 登录凭证（用户名/邮箱 + 密码）
   * @response {LoginResponse} 200 - 登录成功，返回用户信息和Token
   */
  async login(data: LoginCredentials): Promise<LoginResponse> {
    return httpService.post<LoginResponse>(getAuthPath('login'), data)
  },

  /**
   * 用户登出
   * @description 退出当前登录状态，使Token失效
   * @endpoint POST /api/v1/shared/auth/logout
   * @category auth
   * @tags 认证相关
   * @response {void} 200 - 登出成功
   * @security BearerAuth
   */
  async logout(): Promise<void> {
    return httpService.post<void>(getAuthPath('logout'))
  },

  /**
   * 刷新Token
   * @description 使用刷新Token获取新的访问Token
   * @endpoint POST /api/v1/shared/auth/refresh
   * @category auth
   * @tags 认证相关
   * @response {TokenRefreshResponse} 200 - 成功返回新的Token
   * @security BearerAuth
   */
  async refreshToken(): Promise<TokenRefreshResponse> {
    return httpService.post<TokenRefreshResponse>(getAuthPath('refresh'))
  },

  /**
   * 获取用户权限
   * @description 获取当前登录用户的权限列表
   * @endpoint GET /api/v1/shared/auth/permissions
   * @category auth
   * @tags 认证相关
   * @response {UserPermission[]} 200 - 成功返回权限列表
   * @security BearerAuth
   */
  async getUserPermissions(): Promise<UserPermission[]> {
    return httpService.get<UserPermission[]>(getAuthPath('permissions'))
  },

  /**
   * 获取用户角色
   * @description 获取当前登录用户的角色列表
   * @endpoint GET /api/v1/shared/auth/roles
   * @category auth
   * @tags 认证相关
   * @response {UserRole[]} 200 - 成功返回角色列表
   * @security BearerAuth
   */
  async getUserRoles(): Promise<UserRole[]> {
    return httpService.get<UserRole[]>(getAuthPath('roles'))
  },

  // ==================== 用户信息管理 ====================

  /**
   * 获取用户信息
   * @description 获取当前登录用户的详细信息
   * @endpoint GET /api/v1/users/profile
   * @category auth
   * @tags 认证相关
   * @response {UserInfoResponse} 200 - 成功返回用户信息
   * @security BearerAuth
   */
  async getUserInfo(): Promise<{ user: UserInfo; permissions?: UserPermission[]; roles?: UserRole[] }> {
    const user = await httpService.get<UserInfo>('/user/profile')
    return { user }
  },

  /**
   * 更新用户信息
   * @description 更新当前登录用户的资料信息
   * @endpoint PUT /api/v1/users/profile
   * @category auth
   * @tags 认证相关
   * @param {Partial<UserInfo>} data - 用户信息更新数据
   * @response {UserInfoResponse} 200 - 成功返回更新后的用户信息
   * @security BearerAuth
   */
  async updateUserInfo(data: Partial<UserInfo>): Promise<{ user: UserInfo }> {
    const user = await httpService.put<UserInfo>('/users/profile', data)
    return { user }
  },

  /**
   * 修改密码
   * @description 修改当前登录用户的密码
   * @endpoint PUT /api/v1/users/password
   * @category auth
   * @tags 认证相关
   * @param {PasswordChangeData} data - 密码修改数据（旧密码和新密码）
   * @response {void} 200 - 密码修改成功
   * @security BearerAuth
   */
  async changePassword(data: PasswordChangeData): Promise<void> {
    return httpService.put<void>('/users/password', data)
  },

  // ==================== 用户名/邮箱检查 ====================

  /**
   * 检查用户名是否可用
   * @description 检查用户名是否已被注册（注意：后端暂时未实现，返回模拟数据）
   * @endpoint GET /api/v1/shared/auth/check-username
   * @category auth
   * @tags 认证相关
   * @param {string} username - 待检查的用户名
   * @response {CheckAvailabilityResponse} 200 - 返回用户名可用性
   */
  async checkUsername(username: string): Promise<CheckAvailabilityResponse> {
    // 后端暂时没有此接口，返回模拟响应
    return { available: true, message: '用户名可用' }
  },

  /**
   * 检查邮箱是否可用
   * @description 检查邮箱是否已被注册（注意：后端暂时未实现，返回模拟数据）
   * @endpoint GET /api/v1/shared/auth/check-email
   * @category auth
   * @tags 认证相关
   * @param {string} email - 待检查的邮箱
   * @response {CheckAvailabilityResponse} 200 - 返回邮箱可用性
   */
  async checkEmail(email: string): Promise<CheckAvailabilityResponse> {
    // 后端暂时没有此接口，返回模拟响应
    return { available: true, message: '邮箱可用' }
  },

  // ==================== 邮箱验证与密码重置 ====================

  /**
   * 发送验证码
   * @description 向指定邮箱发送验证码（注意：后端暂时未实现）
   * @endpoint POST /api/v1/shared/auth/send-verification-code
   * @category auth
   * @tags 认证相关
   * @param {string} email - 接收验证码的邮箱地址
   * @response {void} 200 - 验证码发送成功
   */
  async sendVerificationCode(email: string): Promise<void> {
    // 后端暂时没有此接口，返回空响应
    return Promise.resolve()
  },

  /**
   * 验证邮箱
   * @description 使用验证码验证邮箱地址（注意：后端暂时未实现）
   * @endpoint POST /api/v1/shared/auth/verify-email
   * @category auth
   * @tags 认证相关
   * @param {string} data.email - 邮箱地址
   * @param {string} data.code - 验证码
   * @response {void} 200 - 邮箱验证成功
   */
  async verifyEmail(data: { email: string; code: string }): Promise<void> {
    // 后端暂时没有此接口，返回空响应
    return Promise.resolve()
  },

  /**
   * 重置密码
   * @description 通过验证码重置用户密码（注意：后端暂时未实现）
   * @endpoint POST /api/v1/shared/auth/reset-password
   * @category auth
   * @tags 认证相关
   * @param {string} data.email - 邮箱地址
   * @param {string} data.code - 验证码
   * @param {string} data.new_password - 新密码
   * @response {void} 200 - 密码重置成功
   */
  async resetPassword(data: { email: string; code: string; new_password: string }): Promise<void> {
    // 后端暂时没有此接口，返回空响应
    return Promise.resolve()
  }
}

// 向后兼容：导出旧的函数名
export const register = (data: RegisterData) => sharedAuthAPI.register(data)
export const login = (data: LoginCredentials) => sharedAuthAPI.login(data)
export const logout = () => sharedAuthAPI.logout()
export const refreshToken = () => sharedAuthAPI.refreshToken()
export const getUserPermissions = () => sharedAuthAPI.getUserPermissions()
export const getUserRoles = () => sharedAuthAPI.getUserRoles()

export default sharedAuthAPI
