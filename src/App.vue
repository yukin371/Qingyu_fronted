<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 应用初始化
onMounted(async () => {
  // 如果有token，尝试获取用户信息
  if (userStore.token) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
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
