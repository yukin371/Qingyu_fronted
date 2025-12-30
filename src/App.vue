<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 应用初始化
onMounted(async () => {
  // 如果有token，初始化认证状态并获取用户信息
  if (authStore.token) {
    try {
      await authStore.initAuth()
    } catch (error) {
      console.error('初始化认证状态失败:', error)
      // 如果token无效，清除认证状态
      authStore.clearAuth()
    }
  }
})
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
