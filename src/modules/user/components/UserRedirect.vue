<template>
  <div class="user-redirect">
    <el-loading></el-loading>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  // 等待下一个 tick 确保 store 已完全初始化
  await nextTick()

  console.log('[UserRedirect] isLoggedIn:', authStore.isLoggedIn)

  // 根据登录状态重定向
  const target = authStore.isLoggedIn ? '/account/profile' : '/auth'
  console.log('[UserRedirect] Redirecting to:', target)

  router.replace(target)
})
</script>

<style scoped>
.user-redirect {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
