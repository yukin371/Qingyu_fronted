<template>
  <div
    ref="cardRef"
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Aurora 光晕效果 -->
    <div class="qy-card__aurora" aria-hidden="true"></div>

    <!-- Header Slot -->
    <div v-if="$slots.header" :class="headerClasses">
      <slot name="header" />
    </div>

    <!-- Default Slot -->
    <div class="qy-card__body relative z-[1]">
      <slot />
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils/cn'
import type { QyCardProps, QyCardEmits, QyCardSlots } from './types'

/**
 * QyCard CVA variants configuration
 */
const cardVariants = cva(
  // 基础样式
  [
    'relative overflow-hidden',
    'bg-white rounded-2xl',
    'transition-all duration-300'
  ],
  {
    variants: {
      /**
       * 阴影效果
       * - always: 始终显示阴影
       * - hover: 悬停时显示阴影
       * - never: 从不显示阴影
       */
      shadow: {
        always: 'shadow-lg shadow-slate-200/50',
        hover: 'hover:shadow-lg hover:shadow-slate-200/50',
        never: ''
      },
      /**
       * 视觉样式变体
       * - default: 默认样式（白色背景）
       * - glass: 玻璃拟态效果
       * - outlined: 轮廓样式
       * - elevated: 提升效果
       */
      variant: {
        default: [
          'bg-white',
          'border-0'
        ],
        glass: [
          'bg-white/70 backdrop-blur-xl',
          'border border-white/50'
        ],
        outlined: [
          'bg-white',
          'border-2 border-slate-200'
        ],
        elevated: [
          'bg-white',
          'shadow-xl shadow-slate-300/50',
          'border-0'
        ]
      },
      /**
       * 内边距变体
       * - none: 无内边距
       * - sm: 小内边距
       * - md: 中等内边距
       * - lg: 大内边距
       */
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
    },
    // 默认变体
    defaultVariants: {
      shadow: 'hover',
      variant: 'default',
      padding: 'md'
    },
    // 组合变体（特殊情况的样式覆盖）
    compoundVariants: [
      // glass + always 组合时增加阴影
      {
        variant: 'glass',
        shadow: 'always',
        class: 'shadow-xl shadow-slate-300/30'
      },
      // elevated + hover 组合时增强悬停效果
      {
        variant: 'elevated',
        shadow: 'hover',
        class: 'hover:shadow-2xl hover:shadow-slate-400/40 hover:-translate-y-1'
      }
    ]
  }
)

/**
 * 卡片头部样式变体
 */
const cardHeaderVariants = cva(
  [
    'border-b border-slate-100',
    'pb-4 mb-4'
  ],
  {
    variants: {
      padding: {
        none: 'px-0 pt-0',
        sm: 'px-4 pt-4',
        md: 'px-6 pt-6',
        lg: 'px-8 pt-8'
      }
    },
    defaultVariants: {
      padding: 'md'
    }
  }
)

/**
 * 卡片底部样式变体
 */
const cardFooterVariants = cva(
  [
    'border-t border-slate-100',
    'pt-4 mt-4'
  ],
  {
    variants: {
      padding: {
        none: 'px-0 pb-0',
        sm: 'px-4 pb-4',
        md: 'px-6 pb-6',
        lg: 'px-8 pb-8'
      }
    },
    defaultVariants: {
      padding: 'md'
    }
  }
)

// 类型导出
export type CardVariants = VariantProps<typeof cardVariants>

// Props
const props = withDefaults(defineProps<QyCardProps>(), {
  shadow: 'hover',
  variant: 'default',
  padding: 'md',
  hoverable: false
})

// Emits
const emit = defineEmits<QyCardEmits>()

// Slots
defineSlots<QyCardSlots>()

// 卡片引用
const cardRef = ref<HTMLElement>()

// 计算卡片类名
const cardClasses = computed(() => {
  return cn(
    cardVariants({
      shadow: props.shadow,
      variant: props.variant,
      padding: props.padding
    }),
    {
      // 悬停交互样式
      'cursor-pointer hover:-translate-y-1': props.hoverable
    },
    props.class
  )
})

// 计算头部类名
const headerClasses = computed(() => {
  return cn(
    cardHeaderVariants({
      padding: props.padding
    }),
    'relative z-[1]'
  )
})

// 计算底部类名
const footerClasses = computed(() => {
  return cn(
    cardFooterVariants({
      padding: props.padding
    }),
    'relative z-[1]'
  )
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (props.hoverable) {
    emit('click', event)
  }
}

// 暴露方法给父组件
defineExpose({
  focus: () => cardRef.value?.focus(),
  blur: () => cardRef.value?.blur()
})
</script>

<style scoped>
.qy-card__aurora {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 10% 0%, rgba(37, 99, 235, 0.12), transparent 36%),
    radial-gradient(circle at 90% 10%, rgba(99, 102, 241, 0.1), transparent 34%);
}

.qy-card__body {
  position: relative;
  z-index: 1;
}
</style>
