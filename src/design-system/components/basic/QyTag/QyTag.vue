<template>
  <span :class="tagClasses">
    <slot />
    <button
      v-if="closable"
      type="button"
      class="qy-tag__close"
      :disabled="disabled"
      aria-label="close"
      @click.stop="handleClose"
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M6 6l8 8m0-8l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
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
  const base = 'inline-flex items-center gap-1.5 font-medium transition-all duration-200 rounded-full border backdrop-blur-sm'

  // Size classes
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-3.5 py-2 text-base'
  }

  // Variant classes
  const variants = {
    default: 'bg-white/80 border-white text-slate-700 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.35)] hover:bg-white',
    primary: 'bg-blue-50/95 border-blue-200/70 text-blue-700 hover:bg-blue-100',
    success: 'bg-emerald-50/95 border-emerald-200/70 text-emerald-700 hover:bg-emerald-100',
    warning: 'bg-amber-50/95 border-amber-200/70 text-amber-700 hover:bg-amber-100',
    danger: 'bg-rose-50/95 border-rose-200/70 text-rose-700 hover:bg-rose-100',
    info: 'bg-indigo-50/95 border-indigo-200/70 text-indigo-700 hover:bg-indigo-100'
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

.qy-tag__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  border: 0;
  background: rgba(15, 23, 42, 0.08);
  color: currentColor;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qy-tag__close:hover {
  background: rgba(15, 23, 42, 0.18);
}

.qy-tag__close:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.qy-tag__close svg {
  width: 0.7rem;
  height: 0.7rem;
}
</style>
