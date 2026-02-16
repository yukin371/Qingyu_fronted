<template>
  <router-view />
  <!-- 新手引导组件 -->
  <AsyncOnboardingTour v-if="shouldRenderOnboarding" />
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOnboarding } from '@/composables/useOnboarding'
import { initializeOnboarding } from '@/config/onboarding.config'

const authStore = useAuthStore()
const onboarding = useOnboarding()
const shouldRenderOnboarding = ref(false)

const AsyncOnboardingTour = defineAsyncComponent({
  loader: () => import('@/shared/components/onboarding/OnboardingTour.vue'),
  suspensible: false
})

function runWhenIdle(task: () => void) {
  const requestIdle = (window as Window & {
    requestIdleCallback?: (callback: () => void) => number
  }).requestIdleCallback

  if (requestIdle) {
    requestIdle(task)
    return
  }
  window.setTimeout(task, 120)
}

// 应用初始化
onMounted(() => {
  runWhenIdle(() => {
    // 延迟挂载新手引导，减少首屏解析和执行压力
    shouldRenderOnboarding.value = true

    onboarding.loadFromLocalStorage()
    const tours = initializeOnboarding()
    tours.forEach(tour => {
      onboarding.registerTour(tour)
    })

    if (!authStore.token) {
      return
    }

    void authStore.initAuth()
      .then(() => {
        if (!onboarding.hasCompleted('welcome-tour') && !onboarding.hasSkipped('welcome-tour')) {
          setTimeout(() => {
            onboarding.startTour('welcome-tour')
          }, 1000)
        }
      })
      .catch((error: unknown) => {
        console.error('初始化认证状态失败:', error)
        authStore.clearAuth()
      })
  })
})
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
