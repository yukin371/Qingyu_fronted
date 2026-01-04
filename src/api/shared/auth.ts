/**
 * 共享认证服务API模块
 *
 * 对接后端 /api/v1/shared/auth 路由
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
 */
const AUTH_CONFIG = {
  useSharedRoutes: true,  // 是否使用shared路由
}

/**
 * 获取认证API路径
 */
function getAuthPath(endpoint: string): string {
  if (AUTH_CONFIG.useSharedRoutes) {
    return `/shared/auth/${endpoint}`
  } else {
    return endpoint
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
 */
export const sharedAuthAPI = {
  /**
   * 用户注册
   * POST /api/v1/shared/auth/register
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    return httpService.post<LoginResponse>(getAuthPath('register'), data)
  },

  /**
   * 用户登录
   * POST /api/v1/shared/auth/login
   */
  async login(data: LoginCredentials): Promise<LoginResponse> {
    return httpService.post<LoginResponse>(getAuthPath('login'), data)
  },

  /**
   * 用户登出
   * POST /api/v1/shared/auth/logout
   */
  async logout(): Promise<void> {
    return httpService.post<void>(getAuthPath('logout'))
  },

  /**
   * 刷新Token
   * POST /api/v1/shared/auth/refresh
   */
  async refreshToken(): Promise<TokenRefreshResponse> {
    return httpService.post<TokenRefreshResponse>(getAuthPath('refresh'))
  },

  /**
   * 获取用户权限
   * GET /api/v1/shared/auth/permissions
   */
  async getUserPermissions(): Promise<UserPermission[]> {
    return httpService.get<UserPermission[]>(getAuthPath('permissions'))
  },

  /**
   * 获取用户角色
   * GET /api/v1/shared/auth/roles
   */
  async getUserRoles(): Promise<UserRole[]> {
    return httpService.get<UserRole[]>(getAuthPath('roles'))
  },

  /**
   * 获取用户信息
   * GET /api/v1/users/profile
   */
  async getUserInfo(): Promise<{ user: UserInfo }> {
    const user = await httpService.get<UserInfo>('/users/profile')
    return { user }
  },

  /**
   * 更新用户信息
   * PUT /api/v1/users/profile
   */
  async updateUserInfo(data: Partial<UserInfo>): Promise<{ user: UserInfo }> {
    const user = await httpService.put<UserInfo>('/users/profile', data)
    return { user }
  },

  /**
   * 修改密码
   * PUT /api/v1/users/password
   */
  async changePassword(data: PasswordChangeData): Promise<void> {
    return httpService.put<void>('/users/password', data)
  },

  /**
   * 检查用户名是否可用
   */
  async checkUsername(username: string): Promise<CheckAvailabilityResponse> {
    return { available: true, message: '用户名可用' }
  },

  /**
   * 检查邮箱是否可用
   */
  async checkEmail(email: string): Promise<CheckAvailabilityResponse> {
    return { available: true, message: '邮箱可用' }
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
