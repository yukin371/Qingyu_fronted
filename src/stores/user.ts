/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginRequest, RegisterRequest } from '@/types/user'
import { login, logout, register } from '@/api/auth'
import { getUserProfile } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isWriter = computed(() => userInfo.value?.role === 'writer' || userInfo.value?.role === 'admin')
  const isAdmin = computed(() => userInfo.value?.role === 'admin')

  /**
   * 用户登录
   */
  async function handleLogin(loginData: LoginRequest) {
    try {
      isLoading.value = true
      const response = await login(loginData)

      token.value = response.token
      userInfo.value = response.user

      // 保存token到localStorage
      localStorage.setItem('token', response.token)

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
    } finally {
      // 无论API调用是否成功，都清除本地状态
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
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
      const response = await getUserProfile()
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

  return {
    // 状态
    token,
    userInfo,
    isLoading,

    // 计算属性
    isLoggedIn,
    isWriter,
    isAdmin,

    // 方法
    handleLogin,
    handleRegister,
    handleLogout,
    fetchUserInfo,
    updateUserInfo,
  }
})
