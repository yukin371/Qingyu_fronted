/**
 * 认证相关API
 * 用户注册、登录、登出、Token刷新
 */

import request from '@/utils/request'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/user'

/**
 * 用户注册
 * POST /api/v1/register
 */
export function register(data: RegisterRequest) {
  return request.post<void>('/register', data)
}

/**
 * 用户登录
 * POST /api/v1/login
 */
export function login(data: LoginRequest) {
  return request.post<LoginResponse>('/login', data)
}

/**
 * 用户登出
 * POST /api/v1/shared/auth/logout
 */
export function logout() {
  return request.post<void>('/shared/auth/logout')
}

/**
 * 刷新Token
 * POST /api/v1/shared/auth/refresh
 */
export function refreshToken() {
  return request.post<{ token: string }>('/shared/auth/refresh')
}
