<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Left Icon -->
    <span
      v-if="icon && iconPosition === 'left' && !loading"
      class="qy-button__icon qy-button__icon--left"
      v-html="icon"
    ></span>

    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin mr-2"
      :class="spinnerSize"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- Button Content -->
    <slot />

    <!-- Right Icon -->
    <span
      v-if="icon && iconPosition === 'right' && !loading"
      class="qy-button__icon qy-button__icon--right"
      v-html="icon"
    ></span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QyButtonProps, QyButtonEmits } from './types'

// Props
const props = withDefaults(defineProps<QyButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconPosition: 'left'
})

// Emits
const emit = defineEmits<QyButtonEmits>()

// Compute variant classes
const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30',
    secondary: 'bg-white/60 backdrop-blur-xl border border-white/50 text-slate-700 hover:bg-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-cyan-600 hover:bg-cyan-50'
  }
  return variants[props.variant]
})

// Compute size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  }
  return sizes[props.size]
})

// Compute spinner size
const spinnerSize = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  return sizes[props.size]
})

// Compute all button classes
const buttonClasses = computed(() => {
  const classes = [
    // Base styles
    'font-medium inline-flex items-center justify-center transition-all duration-300',
    // Disabled state
    (props.disabled || props.loading) && 'opacity-50 cursor-not-allowed',
    // Active state (not disabled)
    !(props.disabled || props.loading) && 'hover:-translate-y-1 active:translate-y-0',
    // Variant styles
    variantClasses.value,
    // Size styles
    sizeClasses.value
  ]

  return classes.filter(Boolean).join(' ')
})

// Handle click event
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.qy-button__icon {
  display: inline-flex;
  align-items: center;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}

.qy-button__icon--left {
  margin-right: 0.5em;
}

.qy-button__icon--right {
  margin-left: 0.5em;
}

.qy-button__icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
