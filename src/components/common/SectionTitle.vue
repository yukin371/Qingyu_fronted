<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center space-x-3">
      <el-icon v-if="icon" :size="24" class="text-blue-600">
        <component :is="iconComponent" />
      </el-icon>
      <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
    </div>
    <slot name="action">
      <router-link
        v-if="moreLink"
        :to="moreLink"
        class="text-sm text-blue-600 hover:text-blue-700 flex items-center"
      >
        {{ moreText }}
        <el-icon class="ml-1"><ArrowRight /></el-icon>
      </router-link>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import * as Icons from '@element-plus/icons-vue'

interface Props {
  title: string
  icon?: string
  moreLink?: string
  moreText?: string
}

const props = withDefaults(defineProps<Props>(), {
  moreText: '查看更多',
})

// 动态导入图标组件
const iconComponent = computed(() => {
  if (!props.icon) return null
  return (Icons as any)[props.icon]
})
</script>














