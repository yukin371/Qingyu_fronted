import { defineStore } from 'pinia'
import { authAPI } from '@/api/auth'
import { storageService } from '@core/services/storage.service'
import { STORAGE_KEYS } from '@core/config/constants'
import router from '@/router'
import type { User } from '@/types/models'
import type { LoginCredentials, RegisterData } from '@/api/user'

/**
 * 认证状态接口
 */
export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoggedIn: boolean
  loading: boolean
  error: string | null
  permissions: string[]
  roles: string[]
}

/**
 * 密码修改数据
 */
export interface PasswordChangeData {
  old_password: string
  new_password: string
}

/**
 * 邮箱验证数据
 */
export interface EmailVerificationData {
  email: string
  code: string
}

/**
 * 密码重置数据
 */
export interface PasswordResetData {
  email: string
  code: string
  new_password: string
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    // 用户信息
    user: null,

    // 认证状态
    token: storageService.get(STORAGE_KEYS.AUTH_TOKEN),
    refreshToken: storageService.get(STORAGE_KEYS.AUTH_TOKEN + '_refresh'),
    isLoggedIn: false,

    // 加载状态
    loading: false,

    // 错误信息
    error: null,

    // 权限列表
    permissions: [],

    // 角色列表
    roles: []
  }),

  getters: {
    // 获取用户头像
    userAvatar: (state): string => {
      return state.user?.avatar || '/default-avatar.png'
    },

    // 获取用户昵称
    userNickname: (state): string => {
      return state.user?.nickname || state.user?.username || '未登录用户'
    },

    // 获取用户邮箱
    userEmail: (state): string => {
      return state.user?.email || ''
    },

    // 检查是否有特定权限
    hasPermission: (state) => (permission: string): boolean => {
      return state.permissions.includes(permission) || state.permissions.includes('*')
    },

    // 检查是否有特定角色
    hasRole: (state) => (role: string): boolean => {
      return state.roles.includes(role)
    },

    // 检查是否为管理员
    isAdmin: (state): boolean => {
      return state.roles.includes('admin') || state.roles.includes('super_admin')
    },

    // 检查是否为VIP用户
    isVip: (state): boolean => {
      return state.user?.isVip || false
    }
  },

  actions: {
    // 初始化认证状态
    async initAuth(): Promise<void> {
      if (this.token) {
        try {
          await this.getUserInfo()
          this.isLoggedIn = true
        } catch (error) {
          console.error('初始化认证失败:', error)
          this.clearAuth()
        }
      }
    },

    // 用户登录
    async login(credentials: LoginCredentials): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.login(credentials)
        const data = response.data

        // 保存认证信息
        this.token = data.token
        this.refreshToken = data.refreshToken
        this.user = data.user
        this.permissions = data.permissions || []
        this.roles = data.roles || []
        this.isLoggedIn = true

        // 存储到本地
        storageService.set(STORAGE_KEYS.AUTH_TOKEN, this.token)
        storageService.set(STORAGE_KEYS.AUTH_TOKEN + '_refresh', this.refreshToken)
        storageService.set(STORAGE_KEYS.USER_INFO, this.user)

        return response
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 用户注册
    async register(userData: RegisterData): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.register(userData)
        const data = response.data

        // 注册成功后自动登录
        if (data.token) {
          this.token = data.token
          this.refreshToken = data.refreshToken
          this.user = data.user
          this.permissions = data.permissions || []
          this.roles = data.roles || []
          this.isLoggedIn = true

          // 存储到本地
          storageService.set(STORAGE_KEYS.AUTH_TOKEN, this.token)
          storageService.set(STORAGE_KEYS.AUTH_TOKEN + '_refresh', this.refreshToken)
          storageService.set(STORAGE_KEYS.USER_INFO, this.user)
        }

        return response
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 用户登出
    async logout(): Promise<void> {
      try {
        // 调用登出接口
        if (this.token) {
          await authAPI.logout()
        }
      } catch (error) {
        console.error('登出接口调用失败:', error)
      } finally {
        // 清除本地状态
        this.clearAuth()

        // 跳转到登录页
        router.push('/login')
      }
    },

    // 获取用户信息
    async getUserInfo(): Promise<any> {
      try {
        const response = await authAPI.getUserInfo()
        const data = response.data
        this.user = data.user || data
        this.permissions = data.permissions || []
        this.roles = data.roles || []

        // 更新本地存储
        storageService.set(STORAGE_KEYS.USER_INFO, this.user)

        return response
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    // 更新用户信息
    async updateUserInfo(userInfo: Partial<User>): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.updateUserInfo(userInfo)
        const data = response.data
        this.user = { ...this.user!, ...data.user }

        // 更新本地存储
        storageService.set(STORAGE_KEYS.USER_INFO, this.user)

        return response
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 修改密码
    async changePassword(passwordData: PasswordChangeData): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.changePassword(passwordData)
        return response
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 刷新Token
    async refreshAuthToken(): Promise<any> {
      if (!this.refreshToken) {
        throw new Error('没有刷新令牌')
      }

      try {
        const response = await authAPI.refreshToken(this.refreshToken)
        const data = response.data

        this.token = data.token
        this.refreshToken = data.refreshToken || this.refreshToken

        // 更新本地存储
        storageService.set(STORAGE_KEYS.AUTH_TOKEN, this.token)
        if (data.refreshToken) {
          storageService.set(STORAGE_KEYS.AUTH_TOKEN + '_refresh', this.refreshToken)
        }

        return response
      } catch (error) {
        console.error('刷新Token失败:', error)
        this.clearAuth()
        throw error
      }
    },

    // 检查用户名是否可用
    async checkUsername(username: string): Promise<boolean> {
      try {
        const response = await authAPI.checkUsername(username)
        return response.data.available
      } catch (error) {
        console.error('检查用户名失败:', error)
        return false
      }
    },

    // 检查邮箱是否可用
    async checkEmail(email: string): Promise<boolean> {
      try {
        const response = await authAPI.checkEmail(email)
        return response.data.available
      } catch (error) {
        console.error('检查邮箱失败:', error)
        return false
      }
    },

    // 发送验证码
    async sendVerificationCode(email: string): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.sendVerificationCode(email)
        return response
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 验证邮箱
    async verifyEmail(verificationData: EmailVerificationData): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.verifyEmail(verificationData)

        // 更新用户信息
        if (this.user) {
          this.user = { ...this.user, isVip: true }
          storageService.set(STORAGE_KEYS.USER_INFO, this.user)
        }

        return response
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 重置密码
    async resetPassword(resetData: PasswordResetData): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.resetPassword(resetData)
        return response
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 清除认证状态
    clearAuth(): void {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isLoggedIn = false
      this.permissions = []
      this.roles = []
      this.error = null

      // 清除本地存储
      storageService.remove(STORAGE_KEYS.AUTH_TOKEN)
      storageService.remove(STORAGE_KEYS.AUTH_TOKEN + '_refresh')
      storageService.remove(STORAGE_KEYS.USER_INFO)
    },

    // 清除错误信息
    clearError(): void {
      this.error = null
    }
  }
})

