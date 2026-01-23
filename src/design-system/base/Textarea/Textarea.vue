<script setup lang="ts">
/**
 * Textarea 组件
 *
 * 多行文本输入组件，支持字数统计、各种状态和尺寸
 */

import { computed, ref } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { TextareaProps } from './types'

// 使用 CVA 定义 textarea 变体
const textareaVariants = cva(
  // 基础样式
  'flex w-full rounded-md border transition-colors duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-slate-500',
  {
    variants: {
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
      },
      state: {
        default: 'border-slate-300 bg-white focus-visible:ring-primary-500 focus-visible:border-primary-500 dark:border-slate-600 dark:bg-slate-800',
        error: 'border-danger-DEFAULT bg-danger-50 focus-visible:ring-danger-DEFAULT focus-visible:border-danger-DEFAULT dark:bg-danger-950/20',
        success: 'border-success-DEFAULT bg-success-50 focus-visible:ring-success-DEFAULT focus-visible:border-success-DEFAULT dark:bg-success-950/20',
        warning: 'border-warning-DEFAULT bg-warning-50 focus-visible:ring-warning-DEFAULT focus-visible:border-warning-DEFAULT dark:bg-warning-950/20',
      },
      resize: {
        none: 'resize-none',
        both: 'resize',
        horizontal: 'resize-x',
        vertical: 'resize-y',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
      resize: 'vertical',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<TextareaProps>(), {
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
const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  change: [event: Event]
}>()

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
const textareaClasses = computed(() =>
  cn(
    textareaVariants({
      size: props.size,
      state: computedState.value,
      resize: props.resize,
    }),
    props.class
  )
)

// 计算是否显示字数统计
const shouldShowCount = computed(() => props.showCount && props.maxlength !== undefined)

// 计算当前字符数
const currentLength = computed(() => internalValue.value.length)

// 计算剩余字符数
const remainingChars = computed(() => {
  if (props.maxlength === undefined) return 0
  return props.maxlength - currentLength.value
})

// 计算字数统计类名
const countClasses = computed(() => {
  if (remainingChars.value < 0) {
    return 'text-danger-DEFAULT'
  }
  if (remainingChars.value <= props.maxlength! * 0.1) {
    return 'text-warning-DEFAULT'
  }
  return 'text-slate-500 dark:text-slate-400'
})

// 处理输入
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('input', event)
  internalValue.value = target.value
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

// 处理失焦
const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}
</script>

<template>
  <div class="relative w-full">
    <!-- Textarea -->
    <textarea
      :id="id"
      ref="textareaRef"
      v-model="internalValue"
      :name="name"
      :rows="rows"
      :maxlength="maxlength"
      :minlength="minlength"
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
      class="mt-1.5 flex justify-end text-xs"
    >
      <span :class="countClasses">
        {{ currentLength }}{{ maxlength ? ` / ${maxlength}` : '' }}
      </span>
    </div>
  </div>
</template>
