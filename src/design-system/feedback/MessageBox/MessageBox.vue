<script setup lang="ts">
/**
 * MessageBox 组件
 *
 * 消息确认对话框组件
 */

import { ref, computed, watch, nextTick } from 'vue'
import QyDialog from '../Dialog/Dialog.vue'
import QyButton from '../../components/basic/QyButton/QyButton.vue'
import type { MessageBoxProps, MessageBoxState, MessageBoxAction } from './types'

// 组件 Props
const props = defineProps<MessageBoxProps>()

// 组件 Emits
const emit = defineEmits<{
  action: [action: MessageBoxAction]
}>()

// 内部状态
const visible = ref(false)
const inputValue = ref('')
const showInput = computed(() => props.type === 'prompt')

// 图标映射
const iconMap: Record<string, string> = {
  alert: '<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>',
  confirm: '<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>',
  success: '<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>',
}

// 图标颜色映射
const iconColorMap: Record<string, string> = {
  alert: 'text-amber-500',
  confirm: 'text-blue-500',
  success: 'text-emerald-500',
}

// 计算图标
const iconHtml = computed(() => iconMap[props.type] || iconMap.confirm)

// 计算图标颜色
const iconColor = computed(() => iconColorMap[props.type] || iconColorMap.confirm)

// 计算确认按钮文本
const confirmButtonText = computed(() => {
  if (props.confirmButtonText) return props.confirmButtonText
  const defaults: Record<string, string> = {
    alert: '确定',
    confirm: '确定',
    prompt: '确定',
  }
  return defaults[props.type] || '确定'
})

// 计算取消按钮文本
const cancelButtonText = computed(() => {
  if (props.cancelButtonText) return props.cancelButtonText
  const defaults: Record<string, string> = {
    alert: '',
    confirm: '取消',
    prompt: '取消',
  }
  return defaults[props.type] || ''
})

// 是否显示取消按钮
const showCancelButton = computed(() => {
  return props.showCancelButton !== false && props.type !== 'alert'
})

// 处理确认按钮点击
const handleConfirm = () => {
  if (showInput.value && props.beforeClose) {
    const result = props.beforeClose(inputValue.value, 'confirm')
    if (result === false) return
  }
  emit('action', 'confirm')
}

// 处理取消按钮点击
const handleCancel = () => {
  if (props.beforeClose) {
    const result = props.beforeClose(inputValue.value, 'cancel')
    if (result === false) return
  }
  emit('action', 'cancel')
}

// 处理关闭
const handleClose = () => {
  emit('action', 'cancel')
}

// 初始化输入值
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) {
    inputValue.value = newVal
  }
}, { immediate: true })

// 打开对话框
const open = () => {
  visible.value = true
  if (props.inputPlaceholder) {
    inputValue.value = props.inputPlaceholder
  }
}

// 关闭对话框
const close = () => {
  visible.value = false
}

// 监听 visible 变化，自动聚焦输入框
watch(visible, async (newVal) => {
  if (newVal && showInput.value) {
    await nextTick()
    const input = document.querySelector('.qy-message-box__input') as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  }
})

// 暴露方法
defineExpose({
  open,
  close,
})
</script>

<template>
  <QyDialog
    :visible="visible"
    :title="title || (type === 'alert' ? '提示' : type === 'confirm' ? '确认' : '输入')"
    size="md"
    :center="center"
    :show-close="showClose"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    @close="handleClose"
  >
    <!-- 内容区域 -->
    <div class="qy-message-box">
      <!-- 容器 -->
      <div class="flex items-start gap-4">
        <!-- 图标 -->
        <div
          v-if="showIcon"
          :class="['flex-shrink-0', iconColor]"
          v-html="iconHtml"
        />

        <!-- 内容 -->
        <div class="flex-1 min-w-0">
          <!-- 消息 -->
          <p
            v-if="message"
            class="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed"
          >
            {{ message }}
          </p>

          <!-- 输入框 -->
          <input
            v-if="showInput"
            v-model="inputValue"
            type="text"
            class="qy-message-box__input mt-3 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100 text-sm"
            :placeholder="inputPlaceholder"
            @keyup.enter="handleConfirm"
          />
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <QyButton
          v-if="showCancelButton"
          variant="ghost"
          @click="handleCancel"
        >
          {{ cancelButtonText }}
        </QyButton>
        <QyButton
          :variant="type === 'alert' ? 'primary' : 'primary'"
          @click="handleConfirm"
        >
          {{ confirmButtonText }}
        </QyButton>
      </div>
    </template>
  </QyDialog>
</template>

<style scoped>
.qy-message-box {
  &__input:focus {
    outline: none;
    border-color: rgb(59 130 246);
    box-shadow: 0 0 0 2px rgb(59 130 246 / 0.2);
  }
}
</style>
