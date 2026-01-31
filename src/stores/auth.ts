import { defineStore } from 'pinia'
import { sharedAuthAPI as authAPI } from '@/modules/shared/api/auth'
import storage from '@/utils/storage'
// 移除对router的直接导入以避免循环依赖
// import router from '@/router'
import type { User } from '@/types/models'
import type { LoginCredentials, RegisterData } from '@/types/user'

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  ROLES: 'roles'
}

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
  state: (): AuthState => {
    // 从storage恢复token
    const savedToken = storage.get<string>(STORAGE_KEYS.TOKEN)
    const savedRefreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN)
    const savedUser = storage.get<User>(STORAGE_KEYS.USER)
    const savedRoles = storage.get<string[]>(STORAGE_KEYS.ROLES)

    // 调试输出
    console.log('[authStore] STORAGE_KEYS.ROLES:', STORAGE_KEYS.ROLES)
    console.log('[authStore] savedRoles:', savedRoles)
    console.log('[authStore] savedUser?.roles:', savedUser?.roles)
    console.log('[authStore] localStorage raw:', localStorage.getItem('qingyu_' + STORAGE_KEYS.ROLES))

    return {
      // 用户信息
      user: savedUser,

      // 认证状态
      token: savedToken,
      refreshToken: savedRefreshToken,
      isLoggedIn: !!savedToken,  // 有token就认为是已登录

      // 加载状态
      loading: false,

      // 错误信息
      error: null,

      // 权限列表
      permissions: [],

      // 角色列表 - 从storage恢复或使用user.roles
      roles: savedRoles || savedUser?.roles || []
    }
  },

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
        // 检查是否是测试模式的mock token
        const isMockToken = this.token?.toString().startsWith('mock-') || this.token?.toString().includes('mock')

        if (isMockToken) {
          // 测试模式：直接使用localStorage中的用户数据，不调用API
          console.log('[测试模式] 使用模拟登录状态')
          this.isLoggedIn = true
          // 从storage恢复user数据（如果还没有的话）
          if (!this.user) {
            this.user = storage.get<User>(STORAGE_KEYS.USER)
          }
          // 修复：优先从localStorage恢复roles
          const savedRoles = storage.get<string[]>(STORAGE_KEYS.ROLES)
          if (savedRoles && savedRoles.length > 0) {
            this.roles = savedRoles
            console.log('[initAuth] 从localStorage恢复roles:', savedRoles)
          } else {
            this.roles = this.user?.roles || ['reader']
            console.log('[initAuth] 使用user.roles:', this.roles)
          }
          this.permissions = this.user?.permissions || []
          return
        }

        // 生产模式：确保roles有值
        if (!this.roles || this.roles.length === 0) {
          const savedRoles = storage.get<string[]>(STORAGE_KEYS.ROLES)
          if (savedRoles && savedRoles.length > 0) {
            this.roles = savedRoles
            console.log('[initAuth] 生产模式从localStorage恢复roles:', savedRoles)
          }
        }

        // 生产模式：调用API获取用户信息
        try {
          console.log('[initAuth] 开始调用getUserInfo获取用户信息...')
          await this.getUserInfo()
          this.isLoggedIn = true
          console.log('[initAuth] getUserInfo成功，用户已登录')
        } catch (error) {
          console.error('[initAuth] getUserInfo失败:', error)
          // 修复：不完全清空状态，而是尝试从 localStorage 恢复
          // 如果 localStorage 中有 token 和 roles，保持登录状态
          const hasTokenInStorage = storage.has(STORAGE_KEYS.TOKEN)
          const hasRolesInStorage = storage.has(STORAGE_KEYS.ROLES)

          console.log('[initAuth] localStorage状态 - token:', hasTokenInStorage, 'roles:', hasRolesInStorage)

          if (hasTokenInStorage && hasRolesInStorage) {
            // 从 localStorage 恢复状态，保持登录
            const savedUser = storage.get<User>(STORAGE_KEYS.USER)
            const savedRoles = storage.get<string[]>(STORAGE_KEYS.ROLES)

            this.user = savedUser
            this.roles = savedRoles
            this.isLoggedIn = true
            console.log('[initAuth] 从localStorage恢复状态，保持登录:', savedRoles)
          } else {
            // 只有在完全没有存储数据时才清空
            console.log('[initAuth] localStorage中没有有效数据，清空状态')
            this.clearAuth()
          }
        }
      }
    },

    // 用户登录
    async login(credentials: LoginCredentials): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.login(credentials)
        // 响应拦截器已经提取了data字段，所以response就是LoginResponse
        const data = response

        // 保存认证信息
        this.token = data.token
        this.refreshToken = data.refreshToken
        // 确保user对象包含roles字段
        this.user = data.user ? { ...data.user, roles: data.user?.roles || [] } : null
        this.permissions = data.permissions || []
        // 后端返回roles在user.roles中
        this.roles = this.user?.roles || data.roles || (data.user?.role ? [data.user.role] : [])
        this.isLoggedIn = true

        // 存储到本地
        storage.set(STORAGE_KEYS.TOKEN, this.token)
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken)
        storage.set(STORAGE_KEYS.USER, this.user)
        storage.set(STORAGE_KEYS.ROLES, this.roles)

        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
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
        // 响应拦截器已经提取了data字段，所以response就是LoginResponse
        const data = response

        // 注册成功后自动登录
        if (data.token) {
          this.token = data.token
          this.refreshToken = data.refreshToken
          this.user = data.user
          this.permissions = data.permissions || []
          // 后端返回roles在user.roles中
          this.roles = data.user?.roles || data.roles || (data.user?.role ? [data.user.role] : [])
          this.isLoggedIn = true

          // 存储到本地
          storage.set(STORAGE_KEYS.TOKEN, this.token)
          storage.set(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken)
          storage.set(STORAGE_KEYS.USER, this.user)
          storage.set(STORAGE_KEYS.ROLES, this.roles)
        }

        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
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

        // 跳转到登录页 - 使用window.location避免循环依赖
        window.location.href = '/login'
      }
    },

    // 获取用户信息
    async getUserInfo(): Promise<any> {
      try {
        const response = await authAPI.getUserInfo()
        // http service 响应拦截器已提取 data 字段，response 直接是 { user, permissions?, roles? }
        const data = response as { user: User; permissions?: string[]; roles?: string[] }
        this.user = data.user || data
        this.permissions = data.permissions || []
        // 后端返回roles在user.roles中
        const userData = data.user || data
        this.roles = (userData as User)?.roles || data.roles || []

        // 更新本地存储
        storage.set(STORAGE_KEYS.USER, this.user)

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
        // http service 响应拦截器已提取 data 字段，response 直接是 { user }
        const data = response as { user: User }
        this.user = { ...this.user!, ...data.user }

        // 更新本地存储
        storage.set(STORAGE_KEYS.USER, this.user)

        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
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
      } catch (error: unknown) {
        this.error = (error as Error).message
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
        const response = await authAPI.refreshToken()
        // http service 响应拦截器已提取 data 字段，response 直接是 { token, expiresAt }
        const data = response as { token: string; expiresAt?: string; refreshToken?: string }

        if (data) {
          this.token = data.token
          // refreshToken 可能在响应中，否则保持原值
          if ('refreshToken' in data && data.refreshToken) {
            this.refreshToken = data.refreshToken
          }

          // 更新本地存储
          storage.set(STORAGE_KEYS.TOKEN, this.token)
          storage.set(STORAGE_KEYS.ROLES, this.roles)
          if ('refreshToken' in data && data.refreshToken) {
            storage.set(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken)
          }
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
        // http service 响应拦截器已提取 data 字段，response 直接是 { available, message? }
        return (response as { available?: boolean })?.available || false
      } catch (error) {
        console.error('检查用户名失败:', error)
        return false
      }
    },

    // 检查邮箱是否可用
    async checkEmail(email: string): Promise<boolean> {
      try {
        const response = await authAPI.checkEmail(email)
        // http service 响应拦截器已提取 data 字段，response 直接是 { available, message? }
        return (response as { available?: boolean })?.available || false
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
      } catch (error: unknown) {
        this.error = (error as Error).message
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
          storage.set(STORAGE_KEYS.USER, this.user)
        }

        return response
      } catch (error: unknown) {
        this.error = (error as Error).message
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
      } catch (error: unknown) {
        this.error = (error as Error).message
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
      storage.remove(STORAGE_KEYS.TOKEN)
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      storage.remove(STORAGE_KEYS.USER)
      storage.remove(STORAGE_KEYS.ROLES)
    },

    // 清除错误信息
    clearError(): void {
      this.error = null
    }
  }
})

