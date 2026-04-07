<script setup lang="ts">
/**
 * Input 组件
 *
 * Apple 风格的输入框组件
 */

import { computed, ref } from 'vue'
import { cn } from '../../utils/cn'
import type { InputProps } from './types'

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  clearable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

const sizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

const baseClasses = `
  w-full rounded-xl border border-slate-200/80 bg-white/80
  font-medium text-slate-900 placeholder:text-slate-400
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400
  disabled:opacity-50 disabled:cursor-not-allowed
  dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-100
  dark:placeholder:text-slate-500 dark:focus:ring-sky-400/30 dark:focus:border-sky-500
`

const classes = computed(() =>
  cn(
    baseClasses.trim(),
    sizeClasses[props.size || 'md'],
    props.class
  )
)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleFocus = (e: FocusEvent) => {
  isFocused.value = true
  emit('focus', e)
}

const handleBlur = (e: FocusEvent) => {
  isFocused.value = false
  emit('blur', e)
}

const clear = () => {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}

const focus = () => {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="relative inline-flex items-center w-full">
    <input
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :class="classes"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- Clear button -->
    <button
      v-if="clearable && modelValue"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      aria-label="清空"
      @click="clear"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>
