<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    @click="handleClick"
  >
    <span class="qy-button__glow" aria-hidden="true"></span>

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
    primary: 'text-white bg-[linear-gradient(120deg,#2563eb_0%,#3b82f6_35%,#6366f1_100%)] shadow-[0_10px_28px_-12px_rgba(37,99,235,0.65)] border border-blue-400/30 hover:shadow-[0_16px_36px_-14px_rgba(59,130,246,0.75)]',
    secondary: 'text-slate-700 bg-white/78 backdrop-blur-xl border border-white/80 shadow-[0_8px_22px_-14px_rgba(15,23,42,0.35)] hover:bg-white hover:border-blue-100',
    danger: 'text-white bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)] border border-red-400/35 shadow-[0_10px_24px_-12px_rgba(220,38,38,0.7)] hover:shadow-[0_16px_32px_-14px_rgba(220,38,38,0.8)]',
    ghost: 'text-slate-700 bg-white/0 border border-transparent hover:bg-slate-100/80 hover:text-slate-900'
  }
  return variants[props.variant]
})

// Compute size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3.5 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-[1.1rem]'
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
    'qy-button relative overflow-hidden font-semibold tracking-[0.01em] inline-flex items-center justify-center gap-1.5 transition-all duration-300 select-none',
    // Disabled state
    (props.disabled || props.loading) && 'opacity-60 cursor-not-allowed saturate-75',
    // Active state (not disabled)
    !(props.disabled || props.loading) && 'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
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

.qy-button__glow {
  position: absolute;
  inset: -35%;
  background: radial-gradient(circle at 18% 20%, rgba(255, 255, 255, 0.28), transparent 55%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.qy-button:hover .qy-button__glow {
  opacity: 1;
}
</style>
