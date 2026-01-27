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
      bg: 'bg-primary-500',
      text: 'text-white',
      dot: 'bg-primary-500'
    },
    blue: {
      bg: 'bg-secondary-500',
      text: 'text-white',
      dot: 'bg-secondary-500'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-white',
      dot: 'bg-green-500'
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-white',
      dot: 'bg-red-500'
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-white',
      dot: 'bg-yellow-500'
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
    'text-xs font-medium',
    'min-w-[20px] h-5',
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
    'text-sm font-medium',
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
    dotSizeClasses.value,
    colorClasses.value.dot
  ].join(' ')
})
</script>
