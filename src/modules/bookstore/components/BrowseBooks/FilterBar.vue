<template>
  <div class="filter-bar" data-testid="filter-bar">
    <div class="filter-scroll-wrapper">
      <!-- 分类筛选 -->
      <Select
        :model-value="categoryId"
        @update:model-value="$emit('update:categoryId', $event)"
        :options="categoryOptions"
        placeholder="分类"
        clearable
        class="filter-select"
      />

      <!-- 年份筛选 -->
      <Select
        :model-value="year"
        @update:model-value="$emit('update:year', $event)"
        :options="yearOptions"
        placeholder="年份"
        clearable
        class="filter-select"
      />

      <!-- 状态筛选 -->
      <Select
        :model-value="status"
        @update:model-value="$emit('update:status', $event)"
        :options="statusOptions"
        placeholder="状态"
        clearable
        class="filter-select"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Select } from '@/design-system/form/Select'
import type { Category } from '@/types/models'
import type { SelectOption } from '@/design-system/form/Select/types'

interface Props {
  categoryId: string
  year: string
  status: string
  categories: Category[]
  years: string[]
  statuses: Array<{ value: string; label: string }>
}

const props = defineProps<Props>()

defineEmits<{
  'update:categoryId': [value: string]
  'update:year': [value: string]
  'update:status': [value: string]
}>()

// 转换分类数据为 Select options
const categoryOptions = computed<SelectOption[]>(() => [
  { value: '', label: '全部分类' },
  ...props.categories.map((cat: any) => ({ value: cat.id || cat._id, label: cat.name }))
])

// 转换年份数据为 Select options
const yearOptions = computed<SelectOption[]>(() => [
  { value: '', label: '全部年份' },
  ...props.years.map(yr => ({ value: yr, label: yr }))
])

// 转换状态数据为 Select options
const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: '全部状态' },
  ...props.statuses.map(st => ({ value: st.value, label: st.label }))
])
</script>

<style scoped lang="scss">
.filter-bar {
  width: 100%;
  margin-bottom: 16px;
}

.filter-scroll-wrapper {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-select {
  flex-shrink: 0;
  min-width: 100px;

  :deep(.select-trigger) {
    height: 40px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #fff;
  }
}

@media (max-width: 640px) {
  .filter-select {
    min-width: 85px;

    :deep(.select-trigger) {
      height: 36px;
      font-size: 13px;
    }
  }
}
</style>
