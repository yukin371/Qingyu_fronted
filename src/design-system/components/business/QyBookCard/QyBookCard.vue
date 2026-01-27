<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Cover Image -->
    <div class="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
      <img
        v-if="cover"
        :src="cover"
        :alt="title"
        class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        v-else
        class="w-full h-48 flex items-center justify-center text-slate-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>

      <!-- Status Badge -->
      <div v-if="status" class="absolute top-3 right-3">
        <span :class="statusBadgeClasses">
          {{ statusText }}
        </span>
      </div>
    </div>

    <!-- Title -->
    <h3 class="text-lg font-bold text-slate-800 mb-1 line-clamp-1">{{ title }}</h3>

    <!-- Author -->
    <p class="text-sm text-slate-600 mb-2">{{ author }}</p>

    <!-- Tags -->
    <div v-if="tags && tags.length > 0" class="flex flex-wrap gap-2 mb-3">
      <span
        v-for="(tag, index) in tags.slice(0, 3)"
        :key="index"
        class="px-2 py-1 bg-primary-100 text-primary-600 rounded-lg text-xs font-medium"
      >
        {{ tag }}
      </span>
      <span v-if="tags.length > 3" class="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
        +{{ tags.length - 3 }}
      </span>
    </div>

    <!-- Rating -->
    <div v-if="rating !== undefined" class="flex items-center gap-1 mb-3">
      <span class="text-amber-500 text-sm">{{ starDisplay }}</span>
      <span v-if="rating > 0" class="text-sm text-slate-600 font-medium">{{ rating.toFixed(1) }}</span>
    </div>

    <!-- Description -->
    <p v-if="description" class="text-sm text-slate-600 mb-3 line-clamp-2">{{ description }}</p>

    <!-- Reading Progress -->
    <div v-if="readProgress !== undefined" class="mb-3">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-slate-500">阅读进度</span>
        <span class="text-xs text-slate-500 font-medium">{{ readProgress }}%</span>
      </div>
      <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
          :style="{ width: readProgress + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BookCardProps, BookCardEmits } from './types'

// Props
const props = withDefaults(defineProps<BookCardProps>(), {
  cover: '',
  description: '',
  rating: 0,
  tags: () => [],
  readProgress: undefined,
  status: undefined
})

// Emits
const emit = defineEmits<BookCardEmits>()

// Compute card classes
const cardClasses = computed(() => {
  return [
    // Base styles - glassmorphism
    'bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-4',
    // Group for hover effects on children
    'group',
    // Transition
    'transition-all duration-500',
    // Hover effects
    'cursor-pointer hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1'
  ].join(' ')
})

// Status badge classes
const statusBadgeClasses = computed(() => {
  const base = 'px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm'
  const statusStyles = {
    reading: 'bg-primary-500/90 text-white',
    completed: 'bg-green-500/90 text-white',
    planned: 'bg-slate-400/90 text-white'
  }
  return `${base} ${statusStyles[props.status || 'planned']}`
})

// Status text
const statusText = computed(() => {
  const statusMap = {
    reading: '阅读中',
    completed: '已完成',
    planned: '计划中'
  }
  return statusMap[props.status || 'planned']
})

// Star display
const starDisplay = computed(() => {
  if (!props.rating || props.rating === 0) return '☆☆☆☆☆'
  
  const fullStars = Math.floor(props.rating)
  const hasHalfStar = props.rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars)
})

// Handle click event
const handleClick = (event: MouseEvent) => {
  if (props.clickAction) {
    props.clickAction()
  }
  emit('click', event)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
