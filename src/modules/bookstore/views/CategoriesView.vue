<template>
  <div class="categories-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <el-icon><Grid /></el-icon>
          图书分类
        </h1>
        <p class="page-subtitle">探索不同类型的精彩作品</p>
      </div>

      <!-- 分类树状导航 -->
      <div class="category-tree-section" v-loading="treeLoading">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>分类导航</span>
              <el-button text @click="expandAll = !expandAll">
                {{ expandAll ? '收起全部' : '展开全部' }}
              </el-button>
            </div>
          </template>

          <CategoryTree
            :categories="categoryTree"
            :selected-id="selectedCategoryId"
            :expand-all="expandAll"
            @select="handleCategorySelect"
          />
        </el-card>
      </div>

      <!-- 当前分类信息 -->
      <div v-if="currentCategory" class="current-category">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/bookstore' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentCategory.name }}</el-breadcrumb-item>
        </el-breadcrumb>

        <div class="category-info">
          <h2>{{ currentCategory.name }}</h2>
          <p v-if="currentCategory.description">{{ currentCategory.description }}</p>
          <div class="category-stats">
            <el-tag>{{ bookTotal }} 本书籍</el-tag>
          </div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <el-card shadow="hover" class="filter-card">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8" :md="6">
            <el-select v-model="filters.status" placeholder="连载状态" clearable @change="handleFilterChange">
              <el-option label="全部" value="" />
              <el-option label="连载中" value="serializing" />
              <el-option label="已完结" value="completed" />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="8" :md="6">
            <el-select v-model="filters.sortBy" placeholder="排序方式" @change="handleFilterChange">
              <el-option label="最新更新" value="updateTime" />
              <el-option label="最高评分" value="rating" />
              <el-option label="最多阅读" value="viewCount" />
              <el-option label="最多收藏" value="favoriteCount" />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="8" :md="6">
            <el-select v-model="filters.wordCountRange" placeholder="字数范围" clearable @change="handleFilterChange">
              <el-option label="全部" value="" />
              <el-option label="10万以下" value="0-100000" />
              <el-option label="10-50万" value="100000-500000" />
              <el-option label="50-100万" value="500000-1000000" />
              <el-option label="100万以上" value="1000000-" />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="8" :md="6">
            <el-button type="primary" @click="resetFilters">重置筛选</el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 书籍列表 -->
      <div class="books-section" v-loading="booksLoading">
        <template v-if="!booksLoading && books.length > 0">
          <BookGrid
            :books="books"
            :loading="booksLoading"
            @book-click="handleBookClick"
          />

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[12, 24, 36, 48]"
              :total="bookTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </template>

        <el-empty v-else-if="!booksLoading" description="暂无相关书籍">
          <el-button type="primary" @click="resetFilters">重置筛选</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Grid } from '@element-plus/icons-vue'
import { booksAPI } from '@/api/reading/books'
import * as bookstoreAPI from '@/api/bookstore'
import BookGrid from '@bookstore/components/BookGrid.vue'
import CategoryTree from '@bookstore/components/CategoryTree.vue'
import type { Category, BookBrief, BookFilter } from '@/types/models'

const route = useRoute()
const router = useRouter()

// 状态
const treeLoading = ref(false)
const booksLoading = ref(false)
const expandAll = ref(false)

// 分类相关
const categoryTree = ref<Category[]>([])
const selectedCategoryId = ref<string>('')
const currentCategory = ref<Category | null>(null)

// 书籍列表
const books = ref<BookBrief[]>([])
const bookTotal = ref(0)
const currentPage = ref(1)
const pageSize = ref(24)

// 筛选条件
const filters = reactive<Partial<BookFilter>>({
  status: '',
  sortBy: 'updateTime',
  wordCountRange: ''
})

// 加载分类树
const loadCategoryTree = async () => {
  treeLoading.value = true
  try {
    const response = await booksAPI.getCategoryTree()
    if (response.code === 200) {
      categoryTree.value = response.data || []
    }
  } catch (error: any) {
    console.error('加载分类树失败:', error)
    ElMessage.error(error.message || '加载分类失败')
  } finally {
    treeLoading.value = false
  }
}

// 查找分类
const findCategory = (categories: Category[], id: string): Category | null => {
  for (const cat of categories) {
    if (cat.id === id || cat._id === id) {
      return cat
    }
    if (cat.children && cat.children.length > 0) {
      const found = findCategory(cat.children, id)
      if (found) return found
    }
  }
  return null
}

// 加载书籍列表
const loadBooks = async () => {
  if (!selectedCategoryId.value) return

  booksLoading.value = true
  try {
    const params = {
      categoryId: selectedCategoryId.value,
      page: currentPage.value,
      size: pageSize.value,
      ...filters
    }

    const response = await bookstoreAPI.getBooksByCategory(selectedCategoryId.value, params)

    if (response.code === 200) {
      books.value = response.data?.books || response.data || []
      bookTotal.value = response.data?.total || 0
    }
  } catch (error: any) {
    console.error('加载书籍列表失败:', error)
    ElMessage.error(error.message || '加载书籍失败')
  } finally {
    booksLoading.value = false
  }
}

// 分类选择
const handleCategorySelect = (category: Category) => {
  selectedCategoryId.value = category.id || category._id || ''
  currentCategory.value = category
  currentPage.value = 1

  // 更新URL
  router.push({
    path: '/bookstore/categories',
    query: { id: selectedCategoryId.value }
  })

  loadBooks()
}

// 筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadBooks()
}

// 重置筛选
const resetFilters = () => {
  filters.status = ''
  filters.sortBy = 'updateTime'
  filters.wordCountRange = ''
  currentPage.value = 1
  loadBooks()
}

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadBooks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadBooks()
}

// 书籍点击
const handleBookClick = (book: BookBrief) => {
  const bookId = book.id || book._id
  router.push(`/books/${bookId}`)
}

// 监听路由变化
watch(() => route.query.id, (newId) => {
  if (newId && typeof newId === 'string') {
    selectedCategoryId.value = newId
    currentCategory.value = findCategory(categoryTree.value, newId)
    loadBooks()
  }
})

// 页面初始化
onMounted(async () => {
  await loadCategoryTree()

  // 从URL获取分类ID
  const categoryId = route.query.id as string
  if (categoryId) {
    selectedCategoryId.value = categoryId
    currentCategory.value = findCategory(categoryTree.value, categoryId)
    await loadBooks()
  } else if (categoryTree.value.length > 0) {
    // 默认选择第一个分类
    const firstCategory = categoryTree.value[0]
    handleCategorySelect(firstCategory)
  }
})
</script>

<style scoped lang="scss">
.categories-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;

  .page-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .page-subtitle {
    margin: 0;
    font-size: 16px;
    opacity: 0.9;
  }
}

.category-tree-section {
  margin-bottom: 24px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.current-category {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .category-info {
    margin-top: 16px;

    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #303133;
    }

    p {
      margin: 0 0 12px 0;
      color: #606266;
      line-height: 1.6;
    }

    .category-stats {
      display: flex;
      gap: 12px;
    }
  }
}

.filter-card {
  margin-bottom: 24px;

  :deep(.el-select) {
    width: 100%;
  }
}

.books-section {
  min-height: 400px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

// 响应式
@media (max-width: 768px) {
  .page-header {
    padding: 30px 16px;

    .page-title {
      font-size: 24px;
    }

    .page-subtitle {
      font-size: 14px;
    }
  }

  .filter-card {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }
}
</style>
