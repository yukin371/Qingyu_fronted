import { defineStore } from 'pinia'
import { authAPI } from '@/api/auth'
import storage from '@/utils/storage'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 用户信息
    user: null,
    
    // 认证状态
    token: storage.getToken(),
    refreshToken: storage.getRefreshToken(),
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
    userAvatar: (state) => {
      return state.user?.avatar || '/default-avatar.png'
    },

    // 获取用户昵称
    userNickname: (state) => {
      return state.user?.nickname || state.user?.username || '未登录用户'
    },

    // 获取用户邮箱
    userEmail: (state) => {
      return state.user?.email || ''
    },

    // 检查是否有特定权限
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission) || state.permissions.includes('*')
    },

    // 检查是否有特定角色
    hasRole: (state) => (role) => {
      return state.roles.includes(role)
    },

    // 检查是否为管理员
    isAdmin: (state) => {
      return state.roles.includes('admin') || state.roles.includes('super_admin')
    },

    // 检查是否为VIP用户
    isVip: (state) => {
      return state.user?.userType === 'vip' || state.roles.includes('vip')
    }
  },

  actions: {
    // 初始化认证状态
    async initAuth() {
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
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.login(credentials)
        
        // 保存认证信息
        this.token = response.token
        this.refreshToken = response.refreshToken
        this.user = response.user
        this.permissions = response.permissions || []
        this.roles = response.roles || []
        this.isLoggedIn = true

        // 存储到本地
        storage.setToken(this.token)
        storage.setRefreshToken(this.refreshToken)
        storage.setUserInfo(this.user)

        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 用户注册
    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.register(userData)
        
        // 注册成功后自动登录
        if (response.token) {
          this.token = response.token
          this.refreshToken = response.refreshToken
          this.user = response.user
          this.permissions = response.permissions || []
          this.roles = response.roles || []
          this.isLoggedIn = true

          // 存储到本地
          storage.setToken(this.token)
          storage.setRefreshToken(this.refreshToken)
          storage.setUserInfo(this.user)
        }

        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 用户登出
    async logout() {
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
    async getUserInfo() {
      try {
        const response = await authAPI.getUserInfo()
        this.user = response.user || response
        this.permissions = response.permissions || []
        this.roles = response.roles || []
        
        // 更新本地存储
        storage.setUserInfo(this.user)
        
        return response
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    // 更新用户信息
    async updateUserInfo(userInfo) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.updateUserInfo(userInfo)
        this.user = { ...this.user, ...response.user }
        
        // 更新本地存储
        storage.setUserInfo(this.user)
        
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 修改密码
    async changePassword(passwordData) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.changePassword(passwordData)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 刷新Token
    async refreshAuthToken() {
      if (!this.refreshToken) {
        throw new Error('没有刷新令牌')
      }

      try {
        const response = await authAPI.refreshToken(this.refreshToken)
        
        this.token = response.token
        this.refreshToken = response.refreshToken || this.refreshToken
        
        // 更新本地存储
        storage.setToken(this.token)
        if (response.refreshToken) {
          storage.setRefreshToken(this.refreshToken)
        }
        
        return response
      } catch (error) {
        console.error('刷新Token失败:', error)
        this.clearAuth()
        throw error
      }
    },

    // 检查用户名是否可用
    async checkUsername(username) {
      try {
        const response = await authAPI.checkUsername(username)
        return response.available
      } catch (error) {
        console.error('检查用户名失败:', error)
        return false
      }
    },

    // 检查邮箱是否可用
    async checkEmail(email) {
      try {
        const response = await authAPI.checkEmail(email)
        return response.available
      } catch (error) {
        console.error('检查邮箱失败:', error)
        return false
      }
    },

    // 发送验证码
    async sendVerificationCode(email) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.sendVerificationCode(email)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 验证邮箱
    async verifyEmail(verificationData) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.verifyEmail(verificationData)
        
        // 更新用户信息
        if (this.user) {
          this.user.emailVerified = true
          storage.setUserInfo(this.user)
        }
        
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 重置密码
    async resetPassword(resetData) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.resetPassword(resetData)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 清除认证状态
    clearAuth() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isLoggedIn = false
      this.permissions = []
      this.roles = []
      this.error = null

      // 清除本地存储
      storage.removeToken()
      storage.removeRefreshToken()
      storage.removeUserInfo()
    },

    // 清除错误信息
    clearError() {
      this.error = null
    }
  }
})