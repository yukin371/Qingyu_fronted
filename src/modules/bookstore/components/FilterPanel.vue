<template>
  <div class="filter-panel">
    <el-collapse v-model="activeFilters" accordion>
      <!-- 分类筛选 -->
      <el-collapse-item v-if="showCategory" title="分类" name="category">
        <div class="filter-options">
          <el-checkbox-group v-model="selectedCategories" @change="handleFilterChange">
            <el-checkbox v-for="cat in categories" :key="cat.id" :label="cat.id" class="filter-option">
              {{ cat.name }}
              <span v-if="cat.count" class="option-count">({{ cat.count }})</span>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-collapse-item>

      <!-- 状态筛选 -->
      <el-collapse-item v-if="showStatus" title="连载状态" name="status">
        <el-radio-group v-model="selectedStatus" class="filter-options" @change="handleFilterChange">
          <el-radio label="">全部</el-radio>
          <el-radio label="serializing">连载中</el-radio>
          <el-radio label="completed">已完结</el-radio>
        </el-radio-group>
      </el-collapse-item>

      <!-- 字数筛选 -->
      <el-collapse-item v-if="showWordCount" title="字数" name="wordCount">
        <el-radio-group v-model="selectedWordCount" class="filter-options" @change="handleFilterChange">
          <el-radio label="">不限</el-radio>
          <el-radio label="0-300000">30万字以下</el-radio>
          <el-radio label="300000-500000">30-50万字</el-radio>
          <el-radio label="500000-1000000">50-100万字</el-radio>
          <el-radio label="1000000-">100万字以上</el-radio>
        </el-radio-group>
      </el-collapse-item>

      <!-- 更新时间筛选 -->
      <el-collapse-item v-if="showUpdateTime" title="更新时间" name="updateTime">
        <el-radio-group v-model="selectedUpdateTime" class="filter-options" @change="handleFilterChange">
          <el-radio label="">不限</el-radio>
          <el-radio label="1">今天</el-radio>
          <el-radio label="3">3天内</el-radio>
          <el-radio label="7">7天内</el-radio>
          <el-radio label="30">30天内</el-radio>
        </el-radio-group>
      </el-collapse-item>

      <!-- 标签筛选 -->
      <el-collapse-item v-if="showTags && tags.length > 0" title="标签" name="tags">
        <div class="filter-tags">
          <el-check-tag v-for="tag in tags" :key="tag.id" :checked="selectedTags.includes(tag.id)" class="filter-tag"
            @change="handleTagChange(tag.id)">
            {{ tag.name }}
          </el-check-tag>
        </div>
      </el-collapse-item>

      <!-- 评分筛选 -->
      <el-collapse-item v-if="showRating" title="评分" name="rating">
        <el-radio-group v-model="selectedRating" class="filter-options" @change="handleFilterChange">
          <el-radio label="">不限</el-radio>
          <el-radio label="9">9分以上</el-radio>
          <el-radio label="8">8分以上</el-radio>
          <el-radio label="7">7分以上</el-radio>
          <el-radio label="6">6分以上</el-radio>
        </el-radio-group>
      </el-collapse-item>
    </el-collapse>

    <!-- 操作按钮 -->
    <div class="filter-actions">
      <el-button size="small" @click="handleReset">重置筛选</el-button>
      <el-button type="primary" size="small" @click="handleApply">应用筛选</el-button>
    </div>

    <!-- 当前筛选条件 -->
    <div v-if="hasActiveFilters" class="active-filters">
      <div class="active-filter-title">当前筛选:</div>
      <div class="active-filter-tags">
        <el-tag v-for="filter in activeFiltersList" :key="filter.key" closable @close="handleRemoveFilter(filter.key)">
          {{ filter.label }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Category, Tag } from '@/types/models'

export interface FilterValues {
  categories?: string[]
  status?: string
  wordCount?: string
  updateTime?: string
  tags?: string[]
  rating?: string
}

interface Props {
  showCategory?: boolean
  showStatus?: boolean
  showWordCount?: boolean
  showUpdateTime?: boolean
  showTags?: boolean
  showRating?: boolean
  categories?: Category[]
  tags?: Tag[]
  initialFilters?: FilterValues
}

interface Emits {
  (e: 'change', filters: FilterValues): void
  (e: 'apply', filters: FilterValues): void
}

const props = withDefaults(defineProps<Props>(), {
  showCategory: true,
  showStatus: true,
  showWordCount: true,
  showUpdateTime: true,
  showTags: true,
  showRating: true,
  categories: () => [],
  tags: () => [],
  initialFilters: () => ({})
})

const emit = defineEmits<Emits>()

// 展开的筛选项
const activeFilters = ref<string[]>(['category'])

// 选中的筛选值
const selectedCategories = ref<string[]>(props.initialFilters.categories || [])
const selectedStatus = ref(props.initialFilters.status || '')
const selectedWordCount = ref(props.initialFilters.wordCount || '')
const selectedUpdateTime = ref(props.initialFilters.updateTime || '')
const selectedTags = ref<string[]>(props.initialFilters.tags || [])
const selectedRating = ref(props.initialFilters.rating || '')

// 当前筛选值
const currentFilters = computed((): FilterValues => ({
  categories: selectedCategories.value.length > 0 ? selectedCategories.value : undefined,
  status: selectedStatus.value || undefined,
  wordCount: selectedWordCount.value || undefined,
  updateTime: selectedUpdateTime.value || undefined,
  tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
  rating: selectedRating.value || undefined
}))

// 是否有激活的筛选
const hasActiveFilters = computed(() => {
  return (
    selectedCategories.value.length > 0 ||
    selectedStatus.value ||
    selectedWordCount.value ||
    selectedUpdateTime.value ||
    selectedTags.value.length > 0 ||
    selectedRating.value
  )
})

// 激活的筛选列表(用于显示标签)
const activeFiltersList = computed(() => {
  const filters: { key: string; label: string }[] = []

  if (selectedCategories.value.length > 0) {
    selectedCategories.value.forEach(catId => {
      const cat = props.categories.find(c => c.id === catId)
      if (cat) {
        filters.push({ key: `category_${catId}`, label: cat.name })
      }
    })
  }

  if (selectedStatus.value) {
    const label = selectedStatus.value === 'serializing' ? '连载中' : '已完结'
    filters.push({ key: 'status', label })
  }

  if (selectedWordCount.value) {
    const labels: Record<string, string> = {
      '0-300000': '30万字以下',
      '300000-500000': '30-50万字',
      '500000-1000000': '50-100万字',
      '1000000-': '100万字以上'
    }
    filters.push({ key: 'wordCount', label: labels[selectedWordCount.value] })
  }

  if (selectedUpdateTime.value) {
    filters.push({ key: 'updateTime', label: `${selectedUpdateTime.value}天内更新` })
  }

  if (selectedTags.value.length > 0) {
    selectedTags.value.forEach(tagId => {
      const tag = props.tags.find(t => t.id === tagId)
      if (tag) {
        filters.push({ key: `tag_${tagId}`, label: tag.name })
      }
    })
  }

  if (selectedRating.value) {
    filters.push({ key: 'rating', label: `${selectedRating.value}分以上` })
  }

  return filters
})

// 标签变化
const handleTagChange = (tagId: string) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagId)
  }
  handleFilterChange()
}

// 筛选变化
const handleFilterChange = () => {
  emit('change', currentFilters.value)
}

// 应用筛选
const handleApply = () => {
  emit('apply', currentFilters.value)
}

// 重置筛选
const handleReset = () => {
  selectedCategories.value = []
  selectedStatus.value = ''
  selectedWordCount.value = ''
  selectedUpdateTime.value = ''
  selectedTags.value = []
  selectedRating.value = ''
  handleFilterChange()
}

// 移除单个筛选
const handleRemoveFilter = (key: string) => {
  if (key.startsWith('category_')) {
    const catId = key.replace('category_', '')
    selectedCategories.value = selectedCategories.value.filter(id => id !== catId)
  } else if (key === 'status') {
    selectedStatus.value = ''
  } else if (key === 'wordCount') {
    selectedWordCount.value = ''
  } else if (key === 'updateTime') {
    selectedUpdateTime.value = ''
  } else if (key.startsWith('tag_')) {
    const tagId = key.replace('tag_', '')
    selectedTags.value = selectedTags.value.filter(id => id !== tagId)
  } else if (key === 'rating') {
    selectedRating.value = ''
  }
  handleFilterChange()
}
</script>

<style scoped lang="scss">
.filter-panel {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;

  :deep(.el-collapse) {
    border: none;

    .el-collapse-item__header {
      font-weight: 600;
      font-size: 14px;
      color: #303133;
      border: none;
      height: 40px;
      line-height: 40px;
    }

    .el-collapse-item__wrap {
      border: none;
    }

    .el-collapse-item__content {
      padding-bottom: 12px;
    }
  }

  .filter-options {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .filter-option {
      margin-right: 0;

      .option-count {
        font-size: 12px;
        color: #909399;
      }
    }

    :deep(.el-radio),
    :deep(.el-checkbox) {
      margin-right: 0;
      height: 32px;
      display: flex;
      align-items: center;
    }
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .filter-tag {
      cursor: pointer;
    }
  }

  .filter-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    .el-button {
      flex: 1;
    }
  }

  .active-filters {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    .active-filter-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
    }

    .active-filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}
</style>
