<script setup lang="ts">
/**
 * QyTextarea 多行文本框组件
 *
 * Qingyu 风格的多行文本输入组件，支持字数统计、各种状态和尺寸
 * 与 Element Plus Input[type="textarea"] API 兼容
 */

import { computed, ref } from 'vue'
import { cn } from '../../../utils/cn'
import type { QyTextareaProps, QyTextareaEmits } from './types'

// 组件 Props
const props = withDefaults(defineProps<QyTextareaProps>(), {
  rows: 3,
  rowsMin: 1,
  showCount: false,
  resize: 'vertical',
  disabled: false,
  readonly: false,
  error: false,
  state: 'default',
  autofocus: false,
  required: false,
  size: 'md',
})

// 组件 Emits
const emit = defineEmits<QyTextareaEmits>()

// 内部值
const internalValue = computed({
  get: () => props.modelValue || '',
  set: (value) => emit('update:modelValue', value),
})

// 焦点状态
const isFocused = ref(false)

// 计算实际状态
const computedState = computed(() => {
  if (props.error) return 'error'
  return props.state
})

// 计算样式类名
const textareaClasses = computed(() => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[80px]',
    md: 'px-4 py-3 text-base min-h-[100px]',
    lg: 'px-5 py-4 text-lg min-h-[120px]',
  }
  
  const stateClasses = {
    default: 'border-slate-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
    error: 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20',
    success: 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500/20',
    warning: 'border-yellow-500 bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-500/20',
  }
  
  const resizeClasses = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
  }
  
  return cn(
    'flex w-full rounded-lg border transition-all duration-200',
    'placeholder:text-slate-400 focus:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50',
    sizeClasses[props.size || 'md'],
    stateClasses[computedState.value],
    resizeClasses[props.resize || 'vertical'],
    props.class
  )
})

// 计算是否显示字数统计
const shouldShowCount = computed(() => props.showCount && props.maxlength !== undefined)

// 计算当前字符数
const currentLength = computed(() => internalValue.value.length)

// 计算是否超出限制
const isOverLimit = computed(() => {
  if (!props.maxlength) return false
  return currentLength.value > props.maxlength
})

// 计算剩余字符数
const remainingCount = computed(() => {
  if (!props.maxlength) return 0
  return props.maxlength - currentLength.value
})

// 计算字数统计的颜色
const countColorClass = computed(() => {
  if (isOverLimit.value) return 'text-red-500'
  if (props.maxlength && remainingCount.value <= props.maxlength * 0.1) return 'text-yellow-600'
  return 'text-slate-400'
})

// 处理输入
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('input', event)
  emit('update:modelValue', target.value)
}

// 处理变更
const handleChange = (event: Event) => {
  emit('change', event)
}

// 处理焦点
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

// 暴露方法
defineExpose({
  focus: () => {
    const textarea = document.querySelector(`textarea[name="${props.name}"]`) as HTMLTextAreaElement
    textarea?.focus()
  },
  blur: () => {
    const textarea = document.querySelector(`textarea[name="${props.name}"]`) as HTMLTextAreaElement
    textarea?.blur()
  },
})
</script>

<template>
  <div class="relative w-full">
    <textarea
      :id="id"
      :name="name"
      :value="internalValue"
      :rows="rows"
      :minlength="minlength"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :autofocus="autofocus"
      :autocomplete="autocomplete"
      :required="required"
      :class="textareaClasses"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    
    <!-- 字数统计 -->
    <div
      v-if="shouldShowCount"
      class="absolute bottom-2 right-3 text-xs transition-colors duration-200"
      :class="countColorClass"
    >
      {{ currentLength }}{{ maxlength ? ` / ${maxlength}` : '' }}
    </div>
  </div>
</template>

<style scoped>
/* 自动高度支持（如果需要）</style>
