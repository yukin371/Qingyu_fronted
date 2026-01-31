/**
 * 认证服务API模块
 *
 * 对接后端 /api/v1/user/auth 路由
 * 后端路由文档:
 *   - Qingyu_backend/router/user/user_router.go 第67-68行
 *
 * 注意：路由已从 /api/v1/shared/auth 迁移到 /api/v1/user/auth
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
 * 获取认证API路径
 * 注意：实际后端路由是 /api/v1/user/auth/*
 * 参见: Qingyu_backend/router/user/user_router.go 第67-68行
 */
function getAuthPath(endpoint: string): string {
  return `/user/auth/${endpoint}`  // /api/v1/user/auth/register, /api/v1/user/auth/login
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
 * 认证服务API接口
 *
 * 后端路由说明：
 * - 认证路由: /api/v1/user/auth/* (统一认证入口)
 * - 用户路由: /api/v1/user/* (用户信息管理)
 * - 简化路径（向后兼容）: /api/v1/login, /api/v1/register
 *
 * 前端baseURL配置为: http://localhost:8080/api/v1
 */
export const sharedAuthAPI = {
  /**
   * 用户注册
   * POST /api/v1/user/auth/register
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    return httpService.post<LoginResponse>(getAuthPath('register'), data)
  },

  /**
   * 用户登录
   * POST /api/v1/user/auth/login
   */
  async login(data: LoginCredentials): Promise<LoginResponse> {
    return httpService.post<LoginResponse>(getAuthPath('login'), data)
  },

  /**
   * 用户登出
   * POST /api/v1/user/auth/logout
   */
  async logout(): Promise<void> {
    return httpService.post<void>(getAuthPath('logout'))
  },

  /**
   * 刷新Token
   * POST /api/v1/user/auth/refresh
   */
  async refreshToken(): Promise<TokenRefreshResponse> {
    return httpService.post<TokenRefreshResponse>(getAuthPath('refresh'))
  },

  /**
   * 获取用户权限
   * GET /api/v1/user/auth/permissions
   */
  async getUserPermissions(): Promise<UserPermission[]> {
    return httpService.get<UserPermission[]>(getAuthPath('permissions'))
  },

  /**
   * 获取用户角色
   * GET /api/v1/user/auth/roles
   */
  async getUserRoles(): UserRole[] {
    return httpService.get<UserRole[]>(getAuthPath('roles'))
  },

  // ==================== 用户信息管理 ====================

  /**
   * 获取用户信息
   * GET /api/v1/user/profile
   */
  async getUserInfo(): Promise<{ user: UserInfo; permissions?: UserPermission[]; roles?: UserRole[] }> {
    const user = await httpService.get<UserInfo>('/user/profile')
    return { user }
  },

  /**
   * 更新用户信息
   * PUT /api/v1/user/profile
   */
  async updateUserInfo(data: Partial<UserInfo>): Promise<{ user: UserInfo }> {
    const user = await httpService.put<UserInfo>('/user/profile', data)
    return { user }
  },

  /**
   * 修改密码
   * PUT /api/v1/user/password
   */
  async changePassword(data: PasswordChangeData): Promise<void> {
    return httpService.put<void>('/user/password', data)
  },

  // ==================== 用户名/邮箱检查 ====================

  /**
   * 检查用户名是否可用
   * 注意：此接口后端可能未实现，返回模拟数据
   */
  async checkUsername(_username: string): Promise<CheckAvailabilityResponse> {
    // 后端暂时没有此接口，返回模拟响应
    return { available: true, message: '用户名可用' }
  },

  /**
   * 检查邮箱是否可用
   * 注意：此接口后端可能未实现，返回模拟数据
   */
  async checkEmail(_email: string): Promise<CheckAvailabilityResponse> {
    // 后端暂时没有此接口，返回模拟响应
    return { available: true, message: '邮箱可用' }
  },

  // ==================== 邮箱验证与密码重置 ====================

  /**
   * 发送验证码
   * 注意：此接口后端可能未实现
   */
  async sendVerificationCode(_email: string): Promise<void> {
    // 后端暂时没有此接口，返回空响应
    return Promise.resolve()
  },

  /**
   * 验证邮箱
   * 注意：此接口后端可能未实现
   */
  async verifyEmail(_data: { email: string; code: string }): Promise<void> {
    // 后端暂时没有此接口，返回空响应
    return Promise.resolve()
  },

  /**
   * 重置密码
   * 注意：此接口后端可能未实现
   */
  async resetPassword(_data: { email: string; code: string; new_password: string }): Promise<void> {
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
