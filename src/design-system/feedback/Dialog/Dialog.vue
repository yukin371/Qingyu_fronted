<script setup lang="ts">
/**
 * Dialog 对话框组件 (Apple Style)
 *
 * Apple 风格的对话框，毛玻璃遮罩、柔和阴影、弹性动画
 */

import { computed, watch, nextTick, ref, onMounted, onUnmounted } from 'vue'
import { cn } from '../../utils/cn'
import type { DialogProps, DialogEmits } from './types'
import { Icon } from '../../base/Icon'

// 尺寸到 max-width 的映射
const sizeMap: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full w-full h-full m-0 rounded-none',
}

// Props
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

// Emits
const emit = defineEmits<DialogEmits>()

// Internal state
const isVisible = ref(false)
const isAnimating = ref(false)
const dialogContent = ref<HTMLElement | null>(null)
const isInitialized = ref(false)

// Dialog container classes
const dialogClasses = computed(() =>
  cn(
    // Apple 风格卡片: 毛玻璃白底、圆角、深层柔和阴影
    'bg-white/95 backdrop-blur-xl rounded-2xl',
    'shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)]',
    'flex flex-col max-h-[90vh] overflow-hidden',
    // 尺寸
    sizeMap[props.size] || sizeMap.md,
    // 自定义 class
    props.class,
  )
)

// Overlay classes
const overlayClasses = computed(() =>
  cn(
    // 居中容器
    'fixed inset-0 z-[9998] flex items-center justify-center',
    // 遮罩层: 毛玻璃
    props.modal ? 'bg-black/30 backdrop-blur-sm' : '',
    props.modalClass,
  )
)

// Watch external visible -> open/close
watch(() => props.visible, (val) => {
  if (val) {
    open()
  } else {
    close()
  }
})

// Sync internal state back to parent
watch(isVisible, (val, oldVal) => {
  if (isInitialized.value && val !== oldVal) {
    emit('update:visible', val)
  }
})

// Keyboard listener toggle
watch(() => props.closeOnPressEscape, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

// Mount: restore visible state
onMounted(async () => {
  if (props.visible) {
    await open()
  }
  isInitialized.value = true
  if (props.closeOnPressEscape) {
    document.addEventListener('keydown', handleKeydown)
  }
})

// Open
const open = async () => {
  if (isVisible.value) return

  emit('open')
  isVisible.value = true
  isAnimating.value = true

  if (props.lockScroll) {
    document.body.style.overflow = 'hidden'
  }

  await nextTick()
  requestAnimationFrame(() => {
    isAnimating.value = false
    emit('opened')
  })
}

// Close
const close = async () => {
  if (!isVisible.value) return

  if (props.beforeClose) {
    try {
      const canClose = await props.beforeClose()
      if (!canClose) return
    } catch (error) {
      console.error('Dialog beforeClose error:', error)
      return
    }
  }

  emit('close')
  isAnimating.value = true

  setTimeout(() => {
    isVisible.value = false
    isAnimating.value = false

    if (props.lockScroll) {
      document.body.style.overflow = ''
    }

    emit('closed')
  }, 300)
}

// Click overlay to close
const handleOverlayClick = () => {
  if (props.closeOnClickModal) {
    close()
  }
}

// Prevent click propagation from content
const handleContentClick = (e: MouseEvent) => {
  e.stopPropagation()
}

// Close button
const handleCloseClick = () => {
  close()
}

// Keyboard handler
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnPressEscape) {
    close()
  }
}

// Cleanup
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (props.lockScroll && isVisible.value) {
    document.body.style.overflow = ''
  }
})

// Expose
defineExpose({
  open,
  close,
  dialogContent,
})
</script>

<template>
  <Teleport :to="teleportTo">
    <!-- 遮罩 + 居中容器 -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        :class="overlayClasses"
        @click="handleOverlayClick"
      >
        <!-- 对话框卡片 -->
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
            class="relative z-[9999]"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? 'dialog-title' : undefined"
            @click="handleContentClick"
          >
            <!-- Header -->
            <div
              v-if="$slots.header || title || showClose"
              class="flex items-center justify-between px-6 pt-6 pb-2"
            >
              <div class="flex items-center gap-3 min-w-0">
                <slot name="header">
                  <slot name="title">
                    <h3
                      v-if="title"
                      id="dialog-title"
                      class="text-lg font-semibold text-gray-900 truncate"
                    >
                      {{ title }}
                    </h3>
                  </slot>
                </slot>
              </div>
              <button
                v-if="showClose"
                type="button"
                class="flex-shrink-0 ml-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                @click="handleCloseClick"
                aria-label="关闭对话框"
              >
                <Icon name="x-mark" size="sm" />
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 pb-2 flex-1 overflow-auto">
              <slot>
                <p class="text-gray-500">
                  对话框内容
                </p>
              </slot>
            </div>

            <!-- Footer -->
            <div
              v-if="$slots.footer"
              class="flex items-center justify-end gap-3 px-6 py-4"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
