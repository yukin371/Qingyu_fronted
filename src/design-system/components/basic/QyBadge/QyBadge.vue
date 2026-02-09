<template>
  <!-- Count Badge -->
  <span
    v-if="type === 'count'"
    :class="countBadgeClasses"
  >
    {{ displayValue }}
  </span>

  <!-- Status Badge -->
  <span
    v-else-if="type === 'status'"
    :class="statusBadgeClasses"
  >
    <slot>{{ text }}</slot>
  </span>

  <!-- Dot Badge -->
  <span
    v-else-if="type === 'dot'"
    :class="dotBadgeClasses"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QyBadgeProps } from './types'

// Props
const props = withDefaults(defineProps<QyBadgeProps>(), {
  type: 'count',
  color: 'cyan',
  value: 0,
  max: 99,
  text: '',
  dotSize: 'md'
})

// Define slots
defineSlots<{ default?: () => any }>()

// Color mapping
const colorClasses = computed(() => {
  const colors = {
    cyan: {
      bg: 'bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)]',
      text: 'text-white',
      dot: 'bg-blue-500'
    },
    blue: {
      bg: 'bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_100%)]',
      text: 'text-white',
      dot: 'bg-indigo-500'
    },
    green: {
      bg: 'bg-[linear-gradient(135deg,#22c55e_0%,#16a34a_100%)]',
      text: 'text-white',
      dot: 'bg-green-500'
    },
    red: {
      bg: 'bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)]',
      text: 'text-white',
      dot: 'bg-red-500'
    },
    yellow: {
      bg: 'bg-[linear-gradient(135deg,#f59e0b_0%,#d97706_100%)]',
      text: 'text-white',
      dot: 'bg-yellow-500'
    },
    purple: {
      bg: 'bg-[linear-gradient(135deg,#8b5cf6_0%,#7c3aed_100%)]',
      text: 'text-white',
      dot: 'bg-purple-500'
    }
  }
  return colors[props.color]
})

// Display value for count badge
const displayValue = computed(() => {
  if (props.value > props.max) {
    return `${props.max}+`
  }
  return props.value.toString()
})

// Count badge classes
const countBadgeClasses = computed(() => {
  return [
    'inline-flex items-center justify-center',
    'px-2 py-0.5',
    'rounded-full',
    'text-xs font-semibold',
    'min-w-[20px] h-5',
    'border border-white/40 shadow-[0_8px_16px_-10px_rgba(15,23,42,0.45)]',
    colorClasses.value.bg,
    colorClasses.value.text
  ].join(' ')
})

// Status badge classes
const statusBadgeClasses = computed(() => {
  return [
    'inline-flex items-center',
    'px-3 py-1',
    'rounded-full',
    'text-sm font-semibold',
    'border border-white/45 shadow-[0_10px_22px_-14px_rgba(15,23,42,0.4)]',
    colorClasses.value.bg,
    colorClasses.value.text
  ].join(' ')
})

// Dot size classes
const dotSizeClasses = computed(() => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }
  return sizes[props.dotSize]
})

// Dot badge classes
const dotBadgeClasses = computed(() => {
  return [
    'inline-block',
    'rounded-full',
    'ring-2 ring-white shadow-[0_0_0_1px_rgba(15,23,42,0.08)]',
    dotSizeClasses.value,
    colorClasses.value.dot
  ].join(' ')
})
</script>
