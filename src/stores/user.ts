/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UserInfo, LoginRequest, RegisterRequest } from '@/types/user'
import { login, logout, register } from '@/modules/shared/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isWriter = computed(
    () => userInfo.value?.role === 'writer' || userInfo.value?.role === 'admin'
  )
  const isAdmin = computed(() => userInfo.value?.role === 'admin')

  // 用户资料相关计算属性
  const profile = computed(() => userInfo.value)
  const username = computed(() => userInfo.value?.username || '')
  const email = computed(() => userInfo.value?.email || '')
  const displayName = computed(() => userInfo.value?.nickname || userInfo.value?.username || '用户')
  const avatar = computed(() => userInfo.value?.avatar || '')

  /**
   * 用户登录
   */
  async function handleLogin(loginData: LoginRequest) {
    try {
      isLoading.value = true
      const response = await login(loginData)

      // HTTP拦截器已经解包了data字段，response直接是 { user, token }
      const { token: responseToken, user } = response

      if (!responseToken) {
        throw new Error('服务端返回数据异常：缺少 token')
      }

      token.value = responseToken

      // 适配后端返回的用户数据：roles数组 -> role字符串
      const adaptedUser: UserInfo = {
        ...user,
        role: user.roles?.[0] || 'user' // 取第一个角色作为主角色
      }

      userInfo.value = adaptedUser

      // 保存token到localStorage
      localStorage.setItem('token', responseToken)

      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户注册
   */
  async function handleRegister(registerData: RegisterRequest) {
    try {
      isLoading.value = true
      await register(registerData)

      // 注册成功后自动登录
      return await handleLogin({
        username: registerData.username,
        password: registerData.password,
      })
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户登出
   */
  async function handleLogout() {
    try {
      await logout()
    } catch (error) {
      console.error('登出失败:', error)
      // 404错误说明后端没有这个API，忽略即可
    } finally {
      // 无论API调用是否成功，都清除本地状态
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      ElMessage.success('已退出登录')
    }
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    if (!token.value) {
      return
    }

    try {
      isLoading.value = true
      const { userAPI } = await import('@/modules/shared/api/auth')
      const response = await userAPI.getProfile()
      userInfo.value = response
      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果token失效，清除登录状态
      if ((error as any).code === 401) {
        handleLogout()
      }
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新用户信息
   */
  function updateUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
    }
  }

  /**
   * 获取用户详细资料
   */
  async function fetchProfile() {
    return fetchUserInfo()
  }

  /**
   * 更新用户资料
   */
  async function updateProfile(data: any) {
    try {
      isLoading.value = true
      const { userAPI } = await import('@/modules/shared/api/auth')
      const response = await userAPI.updateProfile(data)
      updateUserInfo(response)
      return response
    } catch (error) {
      console.error('更新资料失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    token,
    userInfo,
    isLoading,

    // 计算属性
    isLoggedIn,
    isWriter,
    isAdmin,
    profile,
    username,
    email,
    displayName,
    avatar,

    // 方法
    handleLogin,
    handleRegister,
    handleLogout,
    fetchUserInfo,
    updateUserInfo,
    fetchProfile,
    updateProfile,
  }
})
