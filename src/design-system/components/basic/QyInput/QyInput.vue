<template>
  <div class="relative">
    <!-- Regular Input -->
    <input
      v-if="type !== 'textarea'"
      :type="type === 'search' ? 'search' : 'text'"
      :class="inputClasses"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- Textarea -->
    <textarea
      v-else
      :class="textareaClasses"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="modelValue"
      :rows="rows"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QyInputProps, QyInputEmits } from './types'

// Props
const props = withDefaults(defineProps<QyInputProps>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  modelValue: '',
  rows: 3
})

// Emits
const emit = defineEmits<QyInputEmits>()

// Base input classes
const baseInputClasses = computed(() => {
  return [
    'w-full',
    'px-4 py-3',
    'rounded-xl',
    'bg-white/80',
    'border border-white/50',
    'text-slate-800',
    'placeholder:text-slate-400',
    'transition-all',
    'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' ')
})

// Input specific classes
const inputClasses = computed(() => {
  return baseInputClasses.value
})

// Textarea specific classes
const textareaClasses = computed(() => {
  return [
    baseInputClasses.value,
    'resize-y min-h-[80px]'
  ].join(' ')
})

// Handle input event
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  const value = target.value
  emit('update:modelValue', value)
  emit('input', value)
}

// Handle focus event
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

// Handle blur event
const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>
