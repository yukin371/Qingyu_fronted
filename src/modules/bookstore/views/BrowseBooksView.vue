<template>
  <div class="browse-books-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">探索书库</h1>
        <p class="page-subtitle">发现你喜欢的精彩书籍</p>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <SearchBar
          v-model="browseStore.filters.q"
          @search="handleSearch"
          @clear="handleSearch"
          class="mb-6"
        />
      </div>

      <!-- 筛选器 -->
      <div class="filter-section">
        <FilterBar
          v-model:category-id="browseStore.filters.categoryId"
          v-model:year="browseStore.filters.year"
          v-model:status="browseStore.filters.status"
          :categories="categories"
          :years="years"
          :statuses="statuses"
          @update:category-id="handleFilterChange"
          @update:year="handleFilterChange"
          @update:status="handleFilterChange"
          class="mb-4"
        />
      </div>

      <!-- 标签筛选 + 重置按钮 -->
      <div class="flex-between items-center mb-6">
        <TagFilter
          v-model:selected-tags="browseStore.filters.tags"
          :available-tags="availableTags"
          :max-selected="8"
          :recommend-limit="3"
          class="flex-1"
        />
        
        <Button
          v-if="browseStore.hasActiveFilters"
          variant="outline"
          size="sm"
          @click="handleResetFilters"
          class="ml-4"
        >
          <Icon name="x-mark" size="sm" />
          重置筛选
        </Button>
      </div>

      <!-- 书籍列表 -->
      <div class="books-section">
        <div v-if="browseStore.loading" class="loading-state">
          <p>加载中...</p>
        </div>
        
        <div v-else-if="browseStore.error" class="error-state">
          <p>加载失败: {{ browseStore.error.message }}</p>
          <Button @click="fetchBooks">重试</Button>
        </div>
        
        <div v-else-if="browseStore.books.length > 0">
          <p>共 {{ browseStore.pagination.total }} 本书籍</p>
        </div>
        
        <div v-else class="empty-state">
          <p>暂无相关书籍</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBrowseStore } from '../stores/browse.store'
import SearchBar from '../components/BrowseBooks/SearchBar.vue'
import FilterBar from '../components/BrowseBooks/FilterBar.vue'
import TagFilter from '../components/BrowseBooks/TagFilter.vue'
import { Button } from '@/design-system/base/Button'
import { Icon } from '@/design-system/base/Icon'

const browseStore = useBrowseStore()

// Mock数据 - 后续替换为真实API
const categories = ref([
  { _id: '1', name: '玄幻' },
  { _id: '2', name: '都市' }
])

const years = ref(['2024', '2023', '2022'])

const statuses = ref([
  { value: 'serializing', label: '连载中' },
  { value: 'completed', label: '已完结' }
])

const availableTags = ref(['热血', '穿越', '系统', '爽文'])

const handleSearch = () => {
  browseStore.filters.page = 1
  // TODO: 调用fetchBooks
}

const handleFilterChange = () => {
  browseStore.filters.page = 1
  // TODO: 调用fetchBooks
}

const handleResetFilters = () => {
  browseStore.resetFilters()
  // TODO: 调用fetchBooks
}

const fetchBooks = async () => {
  // TODO: 调用真实API
  browseStore.loading = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    // 暂时使用空数组
  } finally {
    browseStore.loading = false
  }
}

onMounted(() => {
  // 从URL初始化筛选条件
  browseStore.syncFiltersFromURL()
  // TODO: 调用fetchBooks
})
</script>

<style scoped lang="scss">
.browse-books-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.search-section,
.filter-section {
  margin-bottom: 24px;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-center {
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-6 {
  margin-bottom: 24px;
}

.flex-1 {
  flex: 1;
}

.ml-4 {
  margin-left: 16px;
}

.books-section {
  min-height: 400px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
}
</style>
