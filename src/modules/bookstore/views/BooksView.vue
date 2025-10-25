<template>
  <div class="books-view">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>书籍列表</h1>
        <p class="subtitle">探索精彩内容</p>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8" :md="6">
            <el-select v-model="filters.categoryId" placeholder="选择分类" clearable @change="handleFilterChange">
              <el-option label="全部分类" value="" />
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="8" :md="6">
            <el-select v-model="filters.status" placeholder="连载状态" clearable @change="handleFilterChange">
              <el-option label="全部状态" value="" />
              <el-option label="连载中" value="serializing" />
              <el-option label="已完结" value="completed" />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="8" :md="6">
            <el-select v-model="filters.sortBy" placeholder="排序方式" @change="handleFilterChange">
              <el-option label="最新更新" value="updateTime" />
              <el-option label="最高评分" value="rating" />
              <el-option label="最多阅读" value="viewCount" />
              <el-option label="字数最多" value="wordCount" />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="8" :md="6">
            <el-radio-group v-model="viewMode" size="default">
              <el-radio-button label="grid">
                <el-icon>
                  <Grid />
                </el-icon>
              </el-radio-button>
              <el-radio-button label="list">
                <el-icon>
                  <List />
                </el-icon>
              </el-radio-button>
            </el-radio-group>
          </el-col>
        </el-row>
      </div>

      <!-- 书籍列表 -->
      <div v-loading="loading" class="books-container">
        <!-- 网格视图 -->
        <el-row v-if="viewMode === 'grid'" :gutter="20">
          <el-col v-for="book in books" :key="book.id" :xs="12" :sm="8" :md="6" :lg="4">
            <div class="book-card" @click="goToDetail(book.id)">
              <div class="book-cover">
                <el-image :src="book.cover" fit="cover">
                  <template #error>
                    <div class="image-slot">
                      <el-icon>
                        <Picture />
                      </el-icon>
                    </div>
                  </template>
                </el-image>
                <el-tag v-if="book.status === 'completed'" class="status-tag" type="success" size="small">
                  完结
                </el-tag>
              </div>
              <div class="book-info">
                <h4 class="book-title" :title="book.title">{{ book.title }}</h4>
                <p class="book-author">{{ book.author }}</p>
                <div class="book-meta">
                  <span class="rating">
                    <el-icon>
                      <Star />
                    </el-icon>
                    {{ book.rating.toFixed(1) }}
                  </span>
                  <span class="words">{{ formatNumber(book.wordCount) }}字</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 列表视图 -->
        <div v-else class="books-list">
          <div v-for="book in books" :key="book.id" class="book-list-item" @click="goToDetail(book.id)">
            <div class="item-cover">
              <el-image :src="book.cover" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="item-info">
              <h3 class="item-title">{{ book.title }}</h3>
              <p class="item-author">{{ book.author }} · {{ book.categoryName }}</p>
              <p class="item-desc">{{ book.title }}</p>
              <div class="item-meta">
                <span class="rating">
                  <el-icon>
                    <Star />
                  </el-icon>
                  {{ book.rating.toFixed(1) }}分
                </span>
                <span>{{ formatNumber(book.wordCount) }}字</span>
                <span>{{ formatNumber(book.viewCount) }}阅读</span>
                <el-tag v-if="book.status === 'completed'" type="success" size="small">
                  完结
                </el-tag>
                <el-tag v-else type="warning" size="small">
                  连载
                </el-tag>
              </div>
            </div>
            <div class="item-action">
              <el-button type="primary">阅读</el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!loading && books.length === 0" description="暂无书籍" />
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[20, 40, 60, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { booksAPI } from '@/api/reading/books'
import { ElMessage } from 'element-plus'
import { Grid, List, Picture, Star } from '@element-plus/icons-vue'
import type { BookBrief, Category } from '@/types/models'

const router = useRouter()

const loading = ref(false)
const books = ref<BookBrief[]>([])
const categories = ref<Category[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const viewMode = ref<'grid' | 'list'>('grid')

const filters = reactive({
  categoryId: '',
  status: '' as '' | 'serializing' | 'completed',
  sortBy: 'updateTime' as 'updateTime' | 'rating' | 'viewCount' | 'wordCount'
})

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 跳转到详情页
const goToDetail = (id: string) => {
  router.push(`/books/${id}`)
}

// 加载书籍列表
const loadBooks = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      category: filters.categoryId,
      status: filters.status,
      sort: filters.sortBy,
      order: 'desc' as 'desc'
    }

    const response = await booksAPI.getBookList(params)

    if (response.code === 200) {
      books.value = response.data.books
      total.value = response.data.total
    } else {
      ElMessage.error(response.message || '加载失败')
    }
  } catch (error) {
    console.error('加载书籍列表失败:', error)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await booksAPI.getAllCategories()
    if (response.code === 200) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadBooks()
}

// 页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadBooks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 每页数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadBooks()
}

onMounted(() => {
  loadCategories()
  loadBooks()
})
</script>

<style scoped lang="scss">
.books-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #303133;
  }

  .subtitle {
    font-size: 16px;
    color: #909399;
  }
}

.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .el-select,
  .el-radio-group {
    width: 100%;
  }
}

.books-container {
  min-height: 400px;
  margin-bottom: 32px;
}

// 网格视图样式
.book-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .book-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 3/4;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .status-tag {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  }

  .book-info {
    padding: 12px;

    .book-title {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #303133;
    }

    .book-author {
      font-size: 12px;
      color: #909399;
      margin: 0 0 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .book-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #606266;

      .rating {
        display: flex;
        align-items: center;
        gap: 2px;
        color: #f56c6c;
      }
    }
  }
}

// 列表视图样式
.books-list {
  .book-list-item {
    display: flex;
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .item-cover {
      width: 100px;
      height: 133px;
      flex-shrink: 0;
      border-radius: 4px;
      overflow: hidden;

      .el-image {
        width: 100%;
        height: 100%;
      }
    }

    .item-info {
      flex: 1;
      padding: 0 16px;
      min-width: 0;

      .item-title {
        font-size: 18px;
        font-weight: bold;
        margin: 0 0 8px 0;
        color: #303133;
      }

      .item-author {
        font-size: 14px;
        color: #909399;
        margin: 0 0 8px 0;
      }

      .item-desc {
        font-size: 14px;
        color: #606266;
        margin: 0 0 12px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .item-meta {
        display: flex;
        gap: 16px;
        font-size: 13px;
        color: #909399;
        flex-wrap: wrap;

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #f56c6c;
        }
      }
    }

    .item-action {
      display: flex;
      align-items: center;
      padding-left: 16px;
    }
  }
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

// 响应式
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }

  .filter-bar {
    .el-col {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .books-list .book-list-item {
    flex-direction: column;

    .item-cover {
      width: 100%;
      height: auto;
      aspect-ratio: 3/4;
      margin-bottom: 12px;
    }

    .item-info {
      padding: 0;
    }

    .item-action {
      padding: 12px 0 0 0;
      justify-content: stretch;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
