<template>
  <span :class="tagClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QyTagProps } from './types'

// Props
const props = withDefaults(defineProps<QyTagProps>(), {
  variant: 'default',
  size: 'md',
  closable: false,
  disabled: false
})

// Emits
const emit = defineEmits<{
  close: []
}>()

// Tag classes
const tagClasses = computed(() => {
  const base = 'inline-flex items-center gap-1 font-medium transition-all duration-200'

  // Size classes
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  // Variant classes
  const variants = {
    default: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
    info: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
  }

  // Disabled state
  const disabled = props.disabled ? 'opacity-50 cursor-not-allowed' : ''

  return [
    base,
    sizes[props.size],
    variants[props.variant],
    disabled
  ].filter(Boolean).join(' ')
})

// Handle close
const handleClose = () => {
  if (!props.disabled) {
    emit('close')
  }
}
</script>

<style scoped>
/* Add smooth transitions for interactive states */
span {
  cursor: default;
}

span:not(.opacity-50) {
  cursor: pointer;
}
</style>
