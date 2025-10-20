import request from '@/utils/request'
import type { ApiResponse, PaginationParams } from '@/types/api'
import type { User, UserBrief } from '@/types/models'

/**
 * 注册数据
 */
export interface RegisterData {
  username: string
  email: string
  password: string
  nickname?: string
}

/**
 * 登录凭证
 */
export interface LoginCredentials {
  username: string
  password: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  refreshToken?: string
  user: User
  permissions?: string[]
  roles?: string[]
}

/**
 * 用户更新数据
 */
export interface UserUpdateData {
  nickname?: string
  bio?: string
  avatar?: string
  phone?: string
  gender?: 'male' | 'female' | 'unknown'
  birthday?: string
}

/**
 * 密码修改数据
 */
export interface PasswordChangeData {
  old_password: string
  new_password: string
}

/**
 * 用户列表查询参数
 */
export interface UserListParams extends PaginationParams {
  username?: string
  email?: string
  role?: 'reader' | 'author' | 'admin'
  status?: 'active' | 'inactive' | 'banned' | 'deleted'
}

/**
 * 管理员用户更新数据
 */
export interface AdminUserUpdateData extends UserUpdateData {
  role?: 'reader' | 'author' | 'admin'
  status?: 'active' | 'inactive' | 'banned' | 'deleted'
  email_verified?: boolean
  phone_verified?: boolean
}

/**
 * 批量操作数据
 */
export interface BatchOperationData {
  user_ids: string[]
  action: 'activate' | 'deactivate' | 'ban' | 'delete'
}

/**
 * 用户管理API接口
 * 基于后端 API v1.0
 */
export const userAPI = {
  // ==================== 公开接口 ====================

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

  // ==================== 用户接口（需要认证）====================

  /**
   * 获取当前用户信息
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return request.get('/users/profile')
  },

  /**
   * 更新当前用户信息
   */
  async updateProfile(userInfo: UserUpdateData): Promise<ApiResponse<User>> {
    return request.put('/users/profile', userInfo)
  },

  /**
   * 修改密码
   */
  async changePassword(passwordData: PasswordChangeData): Promise<ApiResponse<any>> {
    return request.put('/users/password', passwordData)
  },

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('avatar', file)
    return request.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // ==================== 管理员接口 ====================

  /**
   * 获取用户列表（管理员）
   */
  async getUserList(params: UserListParams): Promise<ApiResponse<{
    users: User[]
    total: number
    page: number
    page_size: number
  }>> {
    return request.get('/admin/users', { params })
  },

  /**
   * 获取指定用户信息（管理员）
   */
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return request.get(`/admin/users/${userId}`)
  },

  /**
   * 更新用户信息（管理员）
   */
  async updateUser(userId: string, userData: AdminUserUpdateData): Promise<ApiResponse<User>> {
    return request.put(`/admin/users/${userId}`, userData)
  },

  /**
   * 删除用户（管理员）
   */
  async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return request.delete(`/admin/users/${userId}`)
  },

  // ==================== 辅助方法 ====================

  /**
   * 批量操作用户（管理员）
   */
  async batchOperation(data: BatchOperationData): Promise<ApiResponse<{
    success_count: number
    failed_count: number
  }>> {
    return request.post('/admin/users/batch', data)
  },

  /**
   * 导出用户数据（管理员）
   */
  async exportUsers(params: UserListParams): Promise<Blob> {
    return request.get('/admin/users/export', {
      params,
      responseType: 'blob'
    })
  }
}

export default userAPI

