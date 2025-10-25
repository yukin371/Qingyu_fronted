/**
 * 共享认证服务API模块 (v1.3)
 * 基于 doc/api/frontend/共享服务API参考.md
 *
 * 注意：此模块为共享服务的认证API，路径以 /shared/auth 开头
 * 与主认证API (src/api/auth.ts) 不同
 */

import request from '@/utils/request'
import type { APIResponse } from '@/types/api'
import type {
  LoginCredentials,
  RegisterData,
  LoginResponse,
  TokenRefreshResponse,
  UserPermission,
  UserRole
} from '@/types/auth'

/**
 * 共享认证服务API接口 (v1.3)
 */
export const sharedAuthAPI = {
  /**
   * 用户注册
   */
  async register(data: RegisterData): Promise<APIResponse<LoginResponse>> {
    return request.post<APIResponse<LoginResponse>>('/shared/auth/register', data)
  },

  /**
   * 用户登录
   */
  async login(data: LoginCredentials): Promise<APIResponse<LoginResponse>> {
    return request.post<APIResponse<LoginResponse>>('/shared/auth/login', data)
  },

  /**
   * 用户登出
   */
  async logout(): Promise<APIResponse<null>> {
    return request.post<APIResponse<null>>('/shared/auth/logout')
  },

  /**
   * 刷新Token
   */
  async refreshToken(): Promise<APIResponse<TokenRefreshResponse>> {
    return request.post<APIResponse<TokenRefreshResponse>>('/shared/auth/refresh')
  },

  /**
   * 获取用户权限
   */
  async getUserPermissions(): Promise<APIResponse<UserPermission[]>> {
    return request.get<APIResponse<UserPermission[]>>('/shared/auth/permissions')
  },

  /**
   * 获取用户角色
   */
  async getUserRoles(): Promise<APIResponse<UserRole[]>> {
    return request.get<APIResponse<UserRole[]>>('/shared/auth/roles')
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

