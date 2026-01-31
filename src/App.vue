<template>
  <router-view />
  <!-- 新手引导组件 -->
  <OnboardingTour />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOnboarding } from '@/composables/useOnboarding'
import OnboardingTour from '@/shared/components/onboarding/OnboardingTour.vue'
import { initializeOnboarding } from '@/config/onboarding.config'

const authStore = useAuthStore()
const onboarding = useOnboarding()

// 应用初始化
onMounted(async () => {
  // 初始化引导系统
  onboarding.loadFromLocalStorage()

  // 注册所有引导配置
  const tours = initializeOnboarding()
  tours.forEach(tour => {
    onboarding.registerTour(tour)
  })

  // 如果有token，初始化认证状态并获取用户信息
  if (authStore.token) {
    try {
      await authStore.initAuth()

      // 首次登录用户显示欢迎引导
      if (!onboarding.hasCompleted('welcome-tour') && !onboarding.hasSkipped('welcome-tour')) {
        // 延迟显示，确保页面已加载
        setTimeout(() => {
          onboarding.startTour('welcome-tour')
        }, 1000)
      }
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
