import { defineStore } from 'pinia'
import { userAPI } from '@/api/user'
import storage from '@/utils/storage'
import type { User } from '@/types/models'
import type { UserListParams, UserUpdateData, BatchOperationData, PasswordChangeData } from '@/api/user'

/**
 * 用户状态接口
 */
export interface UserState {
  profile: User | null
  loading: boolean
  error: string | null
  userList: User[]
  totalUsers: number
  currentPage: number
  pageSize: number
}

/**
 * 用户管理Store
 * 处理用户相关状态和操作
 */
export const useUserStore = defineStore('user', {
  state: (): UserState => ({
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
    userId: (state): string => state.profile?.id || '',

    /**
     * 获取用户名
     */
    username: (state): string => state.profile?.username || '',

    /**
     * 获取用户昵称（优先使用昵称，否则使用用户名）
     */
    displayName: (state): string => {
      return state.profile?.nickname || state.profile?.username || '未登录用户'
    },

    /**
     * 获取用户头像
     */
    avatar: (state): string => {
      return state.profile?.avatar || '/default-avatar.png'
    },

    /**
     * 获取用户邮箱
     */
    email: (state): string => state.profile?.email || '',

    /**
     * 获取用户角色
     */
    role: (state): string => state.profile?.role || 'reader',

    /**
     * 是否为管理员
     */
    isAdmin: (state): boolean => {
      return state.profile?.role === 'admin'
    },

    /**
     * 是否为作者
     */
    isAuthor: (state): boolean => {
      return state.profile?.role === 'author' || state.profile?.role === 'admin'
    },

    /**
     * 是否为VIP用户
     */
    isVip: (state): boolean => {
      return state.profile?.isVip || false
    },

    /**
     * 是否有用户信息
     */
    hasProfile: (state): boolean => {
      return !!state.profile
    }
  },

  actions: {
    /**
     * 获取当前用户信息
     */
    async fetchProfile(): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const profile = await userAPI.getProfile()
        this.profile = profile

        // 更新本地存储
        storage.set('userProfile', profile)

        return profile
      } catch (error: any) {
        this.error = error.message
        console.error('获取用户信息失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新用户信息
     */
    async updateProfile(userInfo: UserUpdateData): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        await userAPI.updateProfile(userInfo)

        // 更新成功后重新获取用户信息
        await this.fetchProfile()

        return true
      } catch (error: any) {
        this.error = error.message
        console.error('更新用户信息失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 修改密码
     */
    async changePassword(passwordData: PasswordChangeData): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        await userAPI.changePassword(passwordData)
        return true
      } catch (error: any) {
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
    initProfile(): void {
      const userInfo = storage.get('userProfile')
      if (userInfo) {
        this.profile = userInfo
      }
    },

    /**
     * 清除用户信息
     */
    clearProfile(): void {
      this.profile = null
      this.error = null
      storage.remove('userProfile')
    },

    // ==================== 管理员功能 ====================

    /**
     * 获取用户列表（管理员）
     */
    async fetchUserList(params: Partial<UserListParams> = {}): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await userAPI.getUserList({
          page: params.page || this.currentPage,
          size: params.size || this.pageSize,
          ...params
        })

        // 处理响应数据
        this.userList = response.data.users || []
        this.totalUsers = response.data.total || 0
        this.currentPage = response.data.page || 1
        this.pageSize = response.data.page_size || 10

        return response
      } catch (error: any) {
        this.error = error.message
        console.error('获取用户列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取指定用户信息（管理员）
     */
    async fetchUser(userId: string): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const response = await userAPI.getUser(userId)
        return response
      } catch (error: any) {
        this.error = error.message
        console.error('获取用户信息失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新用户信息（管理员）
     */
    async updateUser(userId: string, userData: UserUpdateData): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        await userAPI.updateUser(userId, userData)

        // 更新成功后刷新用户列表
        await this.fetchUserList()

        return true
      } catch (error: any) {
        this.error = error.message
        console.error('更新用户失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除用户（管理员）
     */
    async deleteUser(userId: string): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        await userAPI.deleteUser(userId)

        // 删除成功后刷新用户列表
        await this.fetchUserList()

        return true
      } catch (error: any) {
        this.error = error.message
        console.error('删除用户失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 批量操作用户（管理员）
     */
    async batchOperation(data: BatchOperationData): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        await userAPI.batchOperation(data)

        // 操作成功后刷新用户列表
        await this.fetchUserList()

        return true
      } catch (error: any) {
        this.error = error.message
        console.error('批量操作失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 导出用户数据（管理员）
     */
    async exportUsers(params: Partial<UserListParams>): Promise<boolean> {
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
      } catch (error: any) {
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
    clearError(): void {
      this.error = null
    }
  }
})


