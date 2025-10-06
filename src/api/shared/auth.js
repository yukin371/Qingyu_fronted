import request from '@/utils/request'

/**
 * 共享认证服务API
 */

// 用户注册
export const register = (data) => {
  return request({
    url: '/shared/auth/register',
    method: 'post',
    data
  })
}

// 用户登录
export const login = (data) => {
  return request({
    url: '/shared/auth/login',
    method: 'post',
    data
  })
}

// 用户登出
export const logout = () => {
  return request({
    url: '/shared/auth/logout',
    method: 'post'
  })
}

// 刷新Token
export const refreshToken = () => {
  return request({
    url: '/shared/auth/refresh',
    method: 'post'
  })
}

// 获取用户权限
export const getUserPermissions = () => {
  return request({
    url: '/shared/auth/permissions',
    method: 'get'
  })
}

// 获取用户角色
export const getUserRoles = () => {
  return request({
    url: '/shared/auth/roles',
    method: 'get'
  })
}

