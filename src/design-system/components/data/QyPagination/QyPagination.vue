<template>
  <div :class="containerClasses">
    <!-- 总条目数 -->
    <div v-if="showTotal" :class="textClasses">
      共 {{ total }} 条
    </div>

    <!-- 上一页按钮 -->
    <button
      :class="buttonClasses({ disabled: currentPage === 1 || disabled })"
      :disabled="currentPage === 1 || disabled"
      @click="handlePrev"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- 页码按钮 -->
    <template v-for="page in pagers" :key="page">
      <button
        v-if="page !== '...'"
        :class="buttonClasses({ active: page === currentPage, disabled })"
        :disabled="disabled"
        @click="handlePageClick(page)"
      >
        {{ page }}
      </button>
      <span v-else :class="textClasses">...</span>
    </template>

    <!-- 下一页按钮 -->
    <button
      :class="buttonClasses({ disabled: currentPage === totalPages || disabled })"
      :disabled="currentPage === totalPages || disabled"
      @click="handleNext"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- 每页数量选择器 -->
    <div v-if="pageSizes && pageSizes.length > 0" class="flex items-center gap-2" :class="textClasses">
      <span>每页</span>
      <select
        :class="selectClasses"
        :value="pageSize"
        :disabled="disabled"
        @change="handleSizeChange"
      >
        <option
          v-for="size in normalizedPageSizes"
          :key="typeof size === 'number' ? size : size.value"
          :value="typeof size === 'number' ? size : size.value"
        >
          {{ typeof size === 'number' ? size : size.label }}
        </option>
      </select>
      <span>条</span>
    </div>

    <!-- 快速跳转 -->
    <div v-if="showQuickJumper" class="flex items-center gap-2" :class="textClasses">
      <span>前往</span>
      <input
        type="number"
        :value="jumpInput"
        :class="selectClasses"
        :disabled="disabled"
        @input="jumpInput = ($event.target as HTMLInputElement).value"
        @keyup.enter="handleJump"
        class="w-16 text-center"
      />
      <span>页</span>
      <button
        :class="buttonClasses"
        :disabled="disabled"
        @click="handleJump"
      >
        跳转
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  paginationVariants,
  paginationButtonVariants,
  paginationTextVariants,
  paginationSelectVariants
} from './variants'
import type { QyPaginationProps, QyPaginationEmits, PageSizeOption } from './types'

// Props
const props = withDefaults(defineProps<QyPaginationProps>(), {
  modelValue: 1,
  total: 0,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  pageCount: 7,
  background: false,
  disabled: false,
  showQuickJumper: false,
  layout: () => ['prev', 'pager', 'next'],
  showTotal: false,
  small: false
})

// Emits
const emit = defineEmits<QyPaginationEmits>()

// 当前页码
const currentPage = computed({
  get: () => props.modelValue || 1,
  set: (val) => emit('update:modelValue', val)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize)
})

// 快速跳转输入值
const jumpInput = ref('')

// 监听当前页码变化
watch(currentPage, (val) => {
  jumpInput.value = String(val)
})

// 标准化每页数量选项
const normalizedPageSizes = computed(() => {
  return props.pageSizes.map(size =>
    typeof size === 'number' ? { label: `${size} 条/页`, value: size } : size
  )
})

// 容器类名
const containerClasses = computed(() => {
  return paginationVariants({
    size: props.small ? 'small' : 'medium',
    background: props.background
  })
})

// 按钮类名
const buttonClasses = computed(() => {
  return (options: { active?: boolean; disabled?: boolean }) =>
    paginationButtonVariants({
      active: options.active || false,
      disabled: options.disabled || false,
      size: props.small ? 'small' : 'medium'
    })
})

// 文字类名
const textClasses = computed(() => {
  return paginationTextVariants({
    size: props.small ? 'small' : 'medium'
  })
})

// 选择器类名
const selectClasses = computed(() => {
  return paginationSelectVariants({
    size: props.small ? 'small' : 'medium'
  })
})

// 计算显示的页码
const pagers = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const pageCount = props.pageCount

  if (total <= pageCount) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const result: (number | string)[] = []
  const half = Math.floor(pageCount / 2)

  // 总是显示第一页
  result.push(1)

  // 左边省略号
  if (current > half + 2) {
    result.push('...')
  }

  // 中间页码
  const start = Math.max(2, current - half)
  const end = Math.min(total - 1, current + half)

  for (let i = start; i <= end; i++) {
    result.push(i)
  }

  // 右边省略号
  if (current < total - half - 1) {
    result.push('...')
  }

  // 总是显示最后一页
  result.push(total)

  return result
})

// 处理上一页
const handlePrev = () => {
  if (currentPage.value > 1) {
    currentPage.value = currentPage.value - 1
    emit('change', currentPage.value, props.pageSize)
  }
}

// 处理下一页
const handleNext = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value = currentPage.value + 1
    emit('change', currentPage.value, props.pageSize)
  }
}

// 处理页码点击
const handlePageClick = (page: number) => {
  currentPage.value = page
  emit('change', page, props.pageSize)
}

// 处理每页数量变化
const handleSizeChange = (e: Event) => {
  const newSize = Number((e.target as HTMLSelectElement).value)
  emit('update:pageSize', newSize)
  // 重置到第一页
  currentPage.value = 1
  emit('change', 1, newSize)
}

// 处理快速跳转
const handleJump = () => {
  const page = parseInt(jumpInput.value)
  if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('change', page, props.pageSize)
  }
}
</script>
