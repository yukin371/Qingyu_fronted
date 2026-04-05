<script setup lang="ts">
/**
 * QySelect 下拉选择器
 *
 * Apple 风格设计，解决 Element Plus 下拉栏痛点:
 * - placeholder 可读性差 -> 清晰的灰度对比
 * - 箭头与文字不对齐 -> flex 居中对齐
 * - 点击后出现蓝色矩形框 -> 柔和的 ring 过渡
 */

import { computed, ref, nextTick, onUnmounted, watch } from 'vue'
import { cn } from '../../utils/cn'
import type { SelectProps, SelectEmits, SelectOption } from './types'

const props = withDefaults(defineProps<SelectProps>(), {
  placeholder: '请选择',
  disabled: false,
  clearable: false,
  size: 'md',
})

const emit = defineEmits<SelectEmits>()

// --- 状态 ---
const isOpen = ref(false)
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})

// --- 计算属性 ---

/** 当前选中项 */
const selectedOption = computed(() =>
  props.options.find((o) => o.value === props.modelValue)
)

/** 是否已有选中值 */
const hasValue = computed(
  () => props.modelValue !== undefined && props.modelValue !== ''
)

// --- 尺寸映射 ---
const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

/** 触发器完整类名 */
const triggerClasses = computed(() =>
  cn(
    'flex items-center justify-between w-full rounded-xl border bg-white transition-all duration-200 cursor-pointer select-none outline-none',
    sizeClasses[props.size],
    {
      'border-gray-200 hover:border-gray-300 hover:bg-gray-50':
        !props.disabled && !isOpen.value,
      'ring-2 ring-blue-500/20 border-blue-400 bg-blue-50/30':
        !props.disabled && isOpen.value,
      'opacity-50 cursor-not-allowed pointer-events-none': props.disabled,
    },
    props.class
  )
)

// --- 定位 ---

function updatePosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '1000',
  }
}

// --- 交互 ---

function toggleOpen() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(updatePosition)
  }
}

function selectOption(option: SelectOption) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

function handleClear(e: MouseEvent) {
  e.stopPropagation()
  emit('update:modelValue', '')
  emit('change', '')
}

// --- 外部点击 & 键盘 ---

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (
    triggerRef.value?.contains(target) ||
    dropdownRef.value?.contains(target)
  ) {
    return
  }
  isOpen.value = false
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    isOpen.value = false
  }
}

// --- 生命周期 ---

watch(isOpen, (open) => {
  if (open) {
    nextTick(updatePosition)
    document.addEventListener('mousedown', handleClickOutside, true)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
  } else {
    document.removeEventListener('mousedown', handleClickOutside, true)
    window.removeEventListener('resize', updatePosition)
    window.removeEventListener('scroll', updatePosition, true)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside, true)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
</script>

<template>
  <div
    ref="triggerRef"
    :class="triggerClasses"
    :tabindex="disabled ? -1 : 0"
    role="combobox"
    :aria-expanded="isOpen"
    :aria-disabled="disabled"
    @click="toggleOpen"
    @keydown="handleKeydown"
  >
    <!-- 文本区域 -->
    <span
      class="truncate"
      :class="hasValue ? 'text-gray-800' : 'text-gray-400'"
    >
      {{ selectedOption ? selectedOption.label : placeholder }}
    </span>

    <!-- 右侧图标区域 -->
    <span class="flex items-center gap-1 ml-2 shrink-0">
      <!-- 清除按钮 -->
      <button
        v-if="clearable && hasValue && !disabled"
        type="button"
        class="text-gray-400 hover:text-gray-600 transition-colors"
        @click="handleClear"
        @mousedown.stop
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- 箭头 -->
      <svg
        class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </div>

  <!-- 浮动菜单 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-[opacity,transform] duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-[opacity,transform] duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 bg-white py-1.5 overflow-hidden"
      >
        <!-- 无选项 -->
        <div
          v-if="options.length === 0"
          class="px-4 py-6 text-center text-sm text-gray-400"
        >
          暂无数据
        </div>

        <!-- 选项列表 -->
        <ul v-else class="max-h-60 overflow-y-auto">
          <li
            v-for="option in options"
            :key="option.value"
            class="flex items-center px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100"
            :class="{
              'text-gray-700 hover:bg-gray-50 active:bg-gray-100':
                !option.disabled && option.value !== modelValue,
              'bg-blue-50/60 text-blue-600': option.value === modelValue,
              'opacity-50 cursor-not-allowed': option.disabled,
            }"
            @click="selectOption(option)"
          >
            <span class="flex-1 truncate">{{ option.label }}</span>

            <!-- 选中勾号 -->
            <svg
              v-if="option.value === modelValue"
              class="w-4 h-4 text-blue-500 ml-auto shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </li>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>
