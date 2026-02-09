<script setup lang="ts">
/**
 * Dialog 对话框组件
 *
 * 可自定义的对话框组件，支持多种尺寸和交互方式
 */

import { computed, watch, nextTick, ref, onMounted, onUnmounted } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { DialogProps, DialogEmits } from './types'
import { Icon } from '../../base/Icon'

// 使用 CVA 定义对话框变体
const dialogVariants = cva(
  // 基础样式
  'fixed z-50 bg-white dark:bg-neutral-800 rounded-lg shadow-xl flex flex-col max-h-[90vh]',
  {
    variants: {
      size: {
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
        full: 'w-full h-full max-w-full m-0 rounded-none',
      },
      center: {
        true: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        false: 'top-20 left-1/2 -translate-x-1/2',
      },
    },
    defaultVariants: {
      size: 'md',
      center: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<DialogProps>(), {
  visible: false,
  title: '',
  size: 'md',
  center: false,
  modal: true,
  showClose: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  lockScroll: true,
  teleportTo: 'body',
})

// 组件 Emits
const emit = defineEmits<DialogEmits>()

// 内部状态
const isVisible = ref(false)
const isAnimating = ref(false)
const dialogContent = ref<HTMLElement | null>(null)
const isInitialized = ref(false) // 标记是否已完成初始化

// 计算对话框容器样式类名
const dialogClasses = computed(() =>
  cn(
    dialogVariants({
      size: props.size,
      center: props.center,
    }),
    props.class,
    'transition-all duration-300 ease-in-out'
  )
)

// 计算遮罩层样式类名
const modalClasses = computed(() =>
  cn(
    'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
    props.modalClass
  )
)

// 计算动画状态类名
const animationClasses = computed(() => {
  if (!isVisible.value) {
    return 'opacity-0 scale-95'
  }
  return 'opacity-100 scale-100'
})

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    open()
  } else {
    close()
  }
})

// 监听内部状态变化同步到父组件
watch(isVisible, (newVal, oldVal) => {
  // 只在初始化完成后且状态真正改变时才同步到父组件
  if (isInitialized.value && newVal !== oldVal) {
    emit('update:visible', newVal)
  }
})

// 监听 closeOnPressEscape 变化，动态添加/移除键盘监听
watch(() => props.closeOnPressEscape, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

// 初始化时处理 visible 状态
onMounted(async () => {
  if (props.visible) {
    await open()
  }

  // 标记初始化完成
  isInitialized.value = true

  // 添加键盘监听
  if (props.closeOnPressEscape) {
    document.addEventListener('keydown', handleKeydown)
  }
})

// 打开对话框
const open = async () => {
  if (isVisible.value) return

  emit('open')
  isVisible.value = true
  isAnimating.value = true

  // 禁用 body 滚动
  if (props.lockScroll) {
    document.body.style.overflow = 'hidden'
  }

  // 等待 DOM 更新
  await nextTick()

  // 触发打开动画
  requestAnimationFrame(() => {
    isAnimating.value = false
    emit('opened')
  })
}

// 关闭对话框
const close = async () => {
  if (!isVisible.value) return

  // 执行关闭前回调
  if (props.beforeClose) {
    try {
      const canClose = await props.beforeClose()
      if (!canClose) {
        return
      }
    } catch (error) {
      console.error('Dialog beforeClose error:', error)
      return
    }
  }

  emit('close')
  isAnimating.value = true

  // 等待动画结束
  setTimeout(() => {
    isVisible.value = false
    isAnimating.value = false

    // 恢复 body 滚动
    if (props.lockScroll) {
      document.body.style.overflow = ''
    }

    emit('closed')
  }, 300)
}

// 点击遮罩层关闭
const handleModalClick = () => {
  if (props.closeOnClickModal && props.modal) {
    close()
  }
}

// 点击对话框内容，阻止事件冒泡
const handleContentClick = (e: MouseEvent) => {
  e.stopPropagation()
}

// 点击关闭按钮
const handleCloseClick = () => {
  close()
}

// 键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnPressEscape) {
    close()
  }
}

// 组件卸载时移除键盘监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)

  // 恢复 body 滚动
  if (props.lockScroll && isVisible.value) {
    document.body.style.overflow = ''
  }
})

// 暴露方法给父组件
defineExpose({
  open,
  close,
})
</script>

<template>
  <Teleport :to="teleportTo">
    <!-- 遮罩层 -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible && modal"
        :class="modalClasses"
        @click="handleModalClick"
        aria-hidden="true"
      />
    </Transition>

    <!-- 对话框 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isVisible"
        ref="dialogContent"
        :class="dialogClasses"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'dialog-title' : undefined"
        @click="handleContentClick"
      >
        <!-- 头部 -->
        <div
          v-if="$slots.header || title || $slots.footer || showClose"
          class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700"
        >
          <div class="flex items-center gap-3">
            <slot name="header">
              <slot name="title">
                <h3
                  v-if="title"
                  id="dialog-title"
                  class="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  {{ title }}
                </h3>
              </slot>
            </slot>
          </div>
          <button
            v-if="showClose"
            type="button"
            class="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            @click="handleCloseClick"
            aria-label="关闭对话框"
          >
            <Icon name="x-mark" size="sm" />
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-auto px-6 py-4">
          <slot>
            <p class="text-neutral-600 dark:text-neutral-400">
              对话框内容
            </p>
          </slot>
        </div>

        <!-- 底部 -->
        <div
          v-if="$slots.footer"
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 对话框动画 */
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}

.dialog-enter-to,
.dialog-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* 居中对话框的特殊处理 */
.center {
  transform: translate(-50%, -50%);
}

.center.dialog-enter-from,
.center.dialog-leave-to {
  transform: translate(-50%, -50%) scale(0.95);
}

/* 非居中对话框的定位 */
:not(.center) {
  top: 5rem;
  transform: translateX(-50%);
}

:not(.center).dialog-enter-from,
:not(.center).dialog-leave-to {
  transform: translateX(-50%) scale(0.95);
}
</style>
