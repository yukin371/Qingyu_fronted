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
    'rounded-2xl',
    'bg-white/72 backdrop-blur-md',
    'border border-white/80',
    'text-slate-800 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.35)]',
    'placeholder:text-slate-400/95',
    'transition-all duration-300',
    'focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-500/15 focus:bg-white',
    'hover:border-blue-100',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/80 disabled:border-slate-200'
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
