import { defineStore } from 'pinia'
import { userAPI } from '@/api/user'
import storage from '@/utils/storage'

/**
 * 用户管理Store
 * 处理用户相关状态和操作
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    profile: null,

    // 加载状态
    loading: false,

    // 错误信息
    error: null,

    // 用户列表（管理员用）
    userList: [],
    totalUsers: 0,
    currentPage: 1,
    pageSize: 10
  }),

  getters: {
    /**
     * 获取用户ID
     */
    userId: (state) => state.profile?.user_id || '',

    /**
     * 获取用户名
     */
    username: (state) => state.profile?.username || '',

    /**
     * 获取用户昵称（优先使用昵称，否则使用用户名）
     */
    displayName: (state) => {
      return state.profile?.nickname || state.profile?.username || '未登录用户'
    },

    /**
     * 获取用户头像
     */
    avatar: (state) => {
      return state.profile?.avatar || '/default-avatar.png'
    },

    /**
     * 获取用户邮箱
     */
    email: (state) => state.profile?.email || '',

    /**
     * 获取用户角色
     */
    role: (state) => state.profile?.role || 'user',

    /**
     * 获取用户状态
     */
    status: (state) => state.profile?.status || '',

    /**
     * 是否为管理员
     */
    isAdmin: (state) => {
      return state.profile?.role === 'admin'
    },

    /**
     * 是否为作者
     */
    isAuthor: (state) => {
      return state.profile?.role === 'author' || state.profile?.role === 'admin'
    },

    /**
     * 邮箱是否已验证
     */
    isEmailVerified: (state) => {
      return state.profile?.email_verified || false
    },

    /**
     * 手机是否已验证
     */
    isPhoneVerified: (state) => {
      return state.profile?.phone_verified || false
    },

    /**
     * 是否有用户信息
     */
    hasProfile: (state) => {
      return !!state.profile
    }
  },

  actions: {
    /**
     * 获取当前用户信息
     */
    async fetchProfile() {
      this.loading = true
      this.error = null

      try {
        const response = await userAPI.getProfile()
        this.profile = response

        // 更新本地存储
        storage.setUserInfo(response)

        return response
      } catch (error) {
        this.error = error.message
        console.error('获取用户信息失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新用户信息
     * @param {Object} userInfo - 要更新的用户信息
     */
    async updateProfile(userInfo) {
      this.loading = true
      this.error = null

      try {
        await userAPI.updateProfile(userInfo)

        // 更新成功后重新获取用户信息
        await this.fetchProfile()

        return true
      } catch (error) {
        this.error = error.message
        console.error('更新用户信息失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 修改密码
     * @param {Object} passwordData - 密码数据
     * @param {string} passwordData.old_password - 旧密码
     * @param {string} passwordData.new_password - 新密码
     */
    async changePassword(passwordData) {
      this.loading = true
      this.error = null

      try {
        await userAPI.changePassword(passwordData)
        return true
      } catch (error) {
        this.error = error.message
        console.error('修改密码失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 初始化用户信息（从本地存储）
     */
    initProfile() {
      const userInfo = storage.getUserInfo()
      if (userInfo) {
        this.profile = userInfo
      }
    },

    /**
     * 清除用户信息
     */
    clearProfile() {
      this.profile = null
      this.error = null
      storage.removeUserInfo()
    },

    // ==================== 管理员功能 ====================

    /**
     * 获取用户列表（管理员）
     * @param {Object} params - 查询参数
     */
    async fetchUserList(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await userAPI.getUserList({
          page: params.page || this.currentPage,
          page_size: params.page_size || this.pageSize,
          ...params
        })

        // 处理响应数据
        if (Array.isArray(response)) {
          // 如果响应是数组，说明没有分页信息
          this.userList = response
          this.totalUsers = response.length
        } else if (response.data && Array.isArray(response.data)) {
          // 如果响应包含data字段
          this.userList = response.data
          this.totalUsers = response.total || response.data.length
          this.currentPage = response.page || 1
          this.pageSize = response.page_size || 10
        } else {
          this.userList = []
          this.totalUsers = 0
        }

        return response
      } catch (error) {
        this.error = error.message
        console.error('获取用户列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取指定用户信息（管理员）
     * @param {string} userId - 用户ID
     */
    async fetchUser(userId) {
      this.loading = true
      this.error = null

      try {
        const response = await userAPI.getUser(userId)
        return response
      } catch (error) {
        this.error = error.message
        console.error('获取用户信息失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新用户信息（管理员）
     * @param {string} userId - 用户ID
     * @param {Object} userData - 用户数据
     */
    async updateUser(userId, userData) {
      this.loading = true
      this.error = null

      try {
        await userAPI.updateUser(userId, userData)

        // 更新成功后刷新用户列表
        await this.fetchUserList()

        return true
      } catch (error) {
        this.error = error.message
        console.error('更新用户失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除用户（管理员）
     * @param {string} userId - 用户ID
     */
    async deleteUser(userId) {
      this.loading = true
      this.error = null

      try {
        await userAPI.deleteUser(userId)

        // 删除成功后刷新用户列表
        await this.fetchUserList()

        return true
      } catch (error) {
        this.error = error.message
        console.error('删除用户失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 批量操作用户（管理员）
     * @param {Object} data - 批量操作数据
     */
    async batchOperation(data) {
      this.loading = true
      this.error = null

      try {
        await userAPI.batchOperation(data)

        // 操作成功后刷新用户列表
        await this.fetchUserList()

        return true
      } catch (error) {
        this.error = error.message
        console.error('批量操作失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 导出用户数据（管理员）
     * @param {Object} params - 导出参数
     */
    async exportUsers(params) {
      this.loading = true
      this.error = null

      try {
        const blob = await userAPI.exportUsers(params)

        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `users_${Date.now()}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        return true
      } catch (error) {
        this.error = error.message
        console.error('导出用户数据失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 清除错误信息
     */
    clearError() {
      this.error = null
    }
  }
})

