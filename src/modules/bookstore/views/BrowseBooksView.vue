<template>
  <div class="browse-books-view" data-testid="browse-books-view">
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
          :categories="metaStore.categories"
          :years="metaStore.years"
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
        <!-- 加载中（首次加载） -->
        <div v-if="browseStore.loading && browseStore.books.length === 0" class="loading-state">
          <BookGridSkeleton :count="12" />
        </div>

        <!-- 错误状态 -->
        <div v-else-if="browseStore.error" class="error-state">
          <Empty
            :image-type="'error'"
            :description="browseStore.error.message || '加载失败，请稍后重试'"
          >
            <Button @click="fetchBooks" type="primary">重试</Button>
          </Empty>
        </div>

        <!-- 有数据 -->
        <div v-else-if="browseStore.books.length > 0">
          <BookGrid :books="browseStore.books" />

          <!-- 统一使用无限滚动加载 -->
          <div class="load-more-section">
            <div ref="loadMoreTrigger" class="load-trigger"></div>

            <!-- 加载中的状态 -->
            <div v-if="browseStore.loading" class="loading-state">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <!-- 没有更多了 -->
            <div v-else-if="!browseStore.pagination.hasMore" class="no-more">
              - 没有更多了 -
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <Empty
          v-else
          :image-type="emptyStateType"
          :description="emptyStateDescription"
        >
          <Button
            v-if="browseStore.hasActiveFilters"
            @click="handleResetFilters"
            type="primary"
          >
            清空筛选
          </Button>
        </Empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useBrowseStore } from '../stores/browse.store'
import { useMetaStore } from '../stores/meta.store'
import SearchBar from '../components/BrowseBooks/SearchBar.vue'
import FilterBar from '../components/BrowseBooks/FilterBar.vue'
import TagFilter from '../components/BrowseBooks/TagFilter.vue'
import BookGrid from '../components/BookGrid.vue'
import BookGridSkeleton from '../components/BrowseBooks/BookGridSkeleton.vue'
import { Button } from '@/design-system/base/Button'
import { Icon } from '@/design-system/base/Icon'
import { Empty } from '@/design-system/base/Empty'

const browseStore = useBrowseStore()
const metaStore = useMetaStore()

// 状态筛选选项
const statuses = ref([
  { value: 'serializing', label: '连载中' },
  { value: 'completed', label: '已完结' }
])

// 可用标签（从 metaStore 获取，或使用默认值）
const availableTags = computed(() => {
  if (metaStore.tags.length > 0) {
    return metaStore.tags.map((t: string | { name: string }) =>
      typeof t === 'string' ? t : t.name
    )
  }
  return ['热血', '穿越', '系统', '爽文']
})

// 空状态配置
const emptyStateConfig = computed(() => {
  const { q, categoryId, tags } = browseStore.filters

  if (q) {
    return {
      type: 'search',
      description: `没有找到与"${q}"相关的书籍，试试其他关键词`
    }
  }

  if (categoryId || tags.length > 0) {
    return {
      type: 'filter',
      description: '没有符合条件的书籍，试试调整筛选条件'
    }
  }

  return {
    type: 'empty',
    description: '书架正在补充中，敬请期待~'
  }
})

const emptyStateType = computed(() => emptyStateConfig.value.type)
const emptyStateDescription = computed(() => emptyStateConfig.value.description)

// 获取书籍数据
const fetchBooks = async () => {
  await browseStore.fetchBooks()
}

// 搜索处理
const handleSearch = () => {
  browseStore.filters.page = 1
  browseStore.syncFiltersToURL()
  fetchBooks()
}

// 筛选变化处理
const handleFilterChange = () => {
  browseStore.filters.page = 1
  browseStore.syncFiltersToURL()
  fetchBooks()
}

// 重置筛选
const handleResetFilters = () => {
  browseStore.resetFilters()
  browseStore.syncFiltersToURL()
  fetchBooks()
}

// 无限滚动加载更多
const loadMore = async () => {
  if (browseStore.loading || !browseStore.pagination.hasMore) return
  browseStore.filters.page++
  await browseStore.fetchBooks(true)
  browseStore.syncFiltersToURL()
}

// 无限滚动触发器（所有设备）
const loadMoreTrigger = ref<HTMLElement | null>(null)

useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting &&
        !browseStore.loading &&
        browseStore.pagination.hasMore &&
        browseStore.books.length > 0) {
      loadMore()
    }
  },
  { threshold: 0.1 }
)

// 初始化
onMounted(async () => {
  // 从URL初始化筛选条件
  browseStore.syncFiltersFromURL()

  // 加载静态数据（分类、年份、标签）
  await Promise.all([
    metaStore.getCategories(),
    metaStore.getYears(),
    metaStore.getTags()
  ])

  // 获取书籍列表
  fetchBooks()
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

.loading-state {
  padding: 20px 0;
}

.error-state {
  padding: 60px 20px;
}

/* 无限滚动区域 */
.load-more-section {
  margin-top: 32px;
  text-align: center;
  padding: 20px 0;
}

.load-trigger {
  height: 1px;
}

/* 加载动画 */
.loading-state {
  padding: 20px 0;
}

.loading-dots {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  span {
    width: 8px;
    height: 8px;
    background: #409eff;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
  letter-spacing: 1px;
}

@media (max-width: 640px) {
  .browse-books-view {
    padding: 20px 16px 40px;
  }

  .page-header {
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .search-section,
  .filter-section {
    margin-bottom: 16px;
  }

  .flex-between {
    flex-wrap: wrap;
    gap: 12px;
  }

  .ml-4 {
    margin-left: 0;
    margin-top: 8px;
  }

  .load-more-section {
    margin-top: 24px;
  }
}
</style>
