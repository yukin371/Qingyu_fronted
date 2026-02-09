<template>
  <label
    :class="radioClasses"
    :aria-disabled="actualDisabled ? 'true' : undefined"
  >
    <!-- 单选框输入 -->
    <input
      ref="inputRef"
      :checked="isChecked"
      type="radio"
      :class="inputClasses"
      :value="value"
      :disabled="actualDisabled"
      :name="actualName"
      @change="handleChange"
    />

    <!-- 单选框圆点 -->
    <span
      v-if="isChecked"
      :class="dotClasses"
      aria-hidden="true"
    >
      <span class="radio-dot"></span>
    </span>

    <!-- Label -->
    <span v-if="label || $slots.default" :class="labelClasses">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils/cn'
import { RADIO_GROUP_KEY, type QyRadioGroupContext } from './contextKey'
import type { QyRadioProps, QyRadioEmits } from './types'

/**
 * QyRadio CVA variants configuration
 */
const radioVariants = cva(
  [
    'inline-flex items-center gap-2 cursor-pointer',
    'transition-all duration-200',
    'select-none'
  ],
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: ''
      },
      variant: {
        default: '',
        button: '',
        border: ''
      }
    },
    defaultVariants: {
      size: 'md',
      disabled: false,
      variant: 'default'
    }
  }
)

/**
 * 单选框输入框样式变体
 */
const radioInputVariants = cva(
  [
    'relative flex-shrink-0 rounded-full border-2',
    'transition-all duration-200',
    'appearance-none cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
  ],
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
      },
      color: {
        primary: 'border-slate-300 focus-visible:ring-primary-500 checked:border-primary-500 dark:border-slate-600',
        success: 'border-slate-300 focus-visible:ring-success-500 checked:border-success-500 dark:border-slate-600',
        warning: 'border-slate-300 focus-visible:ring-warning-500 checked:border-warning-500 dark:border-slate-600',
        danger: 'border-slate-300 focus-visible:ring-danger-500 checked:border-danger-500 dark:border-slate-600'
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: ''
      },
      variant: {
        default: '',
        button: 'rounded-md',
        border: 'rounded-md'
      }
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
      disabled: false,
      variant: 'default'
    }
  }
)

/**
 * 圆点容器样式
 */
const dotContainerVariants = cva(
  [
    'absolute inset-0',
    'flex items-center justify-center',
    'pointer-events-none'
  ],
  {
    variants: {
      size: {
        sm: 'text-[8px]',
        md: 'text-[10px]',
        lg: 'text-xs'
      },
      color: {
        primary: 'text-primary-500',
        success: 'text-success-500',
        warning: 'text-warning-500',
        danger: 'text-danger-500'
      }
    },
    defaultVariants: {
      size: 'md',
      color: 'primary'
    }
  }
)

/**
 * Label 样式变体
 */
const labelVariants = cva(
  [
    'select-none'
  ],
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      },
      disabled: {
        true: 'opacity-50',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      disabled: false
    }
  }
)

// 类型导出
export type RadioVariants = VariantProps<typeof radioVariants>
export type RadioInputVariants = VariantProps<typeof radioInputVariants>

// Props
const props = withDefaults(defineProps<QyRadioProps>(), {
  disabled: false,
  size: 'md',
  color: 'primary',
  variant: 'default'
})

// Emits
const emit = defineEmits<QyRadioEmits>()

// 注入组上下文
const groupContext = inject<QyRadioGroupContext>(RADIO_GROUP_KEY, undefined)

// 是否在组中
const isInGroup = computed(() => groupContext !== undefined)

// 实际的 disabled、size、name 值（优先使用组的设置）
const actualDisabled = computed(() => 
  isInGroup.value ? groupContext!.disabled.value : props.disabled
)
const actualSize = computed(() => 
  isInGroup.value ? groupContext!.size.value : props.size
)
const actualName = computed(() => 
  isInGroup.value ? groupContext!.name.value : props.name
)

// 计算当前是否选中
const isChecked = computed(() => {
  if (isInGroup.value) {
    return groupContext!.modelValue.value === props.value
  }
  return props.modelValue === props.value
})

// 计算容器类名
const radioClasses = computed(() => {
  return cn(
    radioVariants({
      size: actualSize.value,
      disabled: actualDisabled.value,
      variant: props.variant
    }),
    {
      // 按钮样式
      'px-3 py-1.5 rounded-md border-2 border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-colors':
        props.variant === 'button',
      // 边框样式
      'px-3 py-2 rounded-lg border-2 border-slate-300 hover:border-primary-500 transition-colors':
        props.variant === 'border'
    },
    props.class
  )
})

// 计算输入框类名
const inputClasses = computed(() => {
  return cn(
    radioInputVariants({
      size: actualSize.value,
      color: props.color,
      disabled: actualDisabled.value,
      variant: props.variant
    })
  )
})

// 计算圆点容器类名
const dotClasses = computed(() => {
  return dotContainerVariants({
    size: actualSize.value,
    color: props.color
  })
})

// 计算label类名
const labelClasses = computed(() => {
  return cn(
    labelVariants({
      size: actualSize.value,
      disabled: actualDisabled.value
    })
  )
})

// 输入框引用
const inputRef = ref<HTMLInputElement>()

// 处理变化事件
const handleChange = () => {
  if (actualDisabled.value) return
  
  if (isInGroup.value) {
    // 组模式
    groupContext!.handleChange(props.value)
  } else {
    // 独立模式
    emit('update:modelValue', props.value)
    emit('change', props.value)
  }
}

// 暴露方法给父组件
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<style scoped>
.radio-dot {
  width: 50%;
  height: 50%;
  border-radius: 50%;
  background-color: currentColor;
}

input:checked + span {
  /* 显示圆点 */
}

input:checked {
  background-color: currentColor;
  border-color: currentColor;
}
</style>
