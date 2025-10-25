<template>
  <div class="search-view">
    <div class="container">
      <!-- 搜索框 -->
      <div class="search-header">
        <el-input v-model="searchKeyword" placeholder="搜索书名、作者、标签..." size="large" clearable
          @keyup.enter="handleSearch">
          <template #prepend>
            <el-icon>
              <Search />
            </el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- 搜索历史和热门搜索 -->
      <div v-if="!hasSearched" class="search-suggestions">
        <el-row :gutter="20">
          <!-- 搜索历史 -->
          <el-col :xs="24" :sm="12">
            <div v-if="searchHistory.length > 0" class="suggestion-section">
              <div class="section-header">
                <h3>搜索历史</h3>
                <el-button text type="danger" @click="clearHistory">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  清空
                </el-button>
              </div>
              <div class="tags-list">
                <el-tag v-for="(item, index) in searchHistory" :key="index"
                  @click="searchKeyword = item; handleSearch()" style="cursor: pointer; margin: 4px;">
                  {{ item }}
                </el-tag>
              </div>
            </div>
          </el-col>

          <!-- 热门搜索 -->
          <el-col :xs="24" :sm="12">
            <div class="suggestion-section">
              <div class="section-header">
                <h3>热门搜索</h3>
              </div>
              <div class="tags-list">
                <el-tag v-for="(item, index) in hotSearches" :key="index" :type="index < 3 ? 'danger' : ''"
                  @click="searchKeyword = item; handleSearch()" style="cursor: pointer; margin: 4px;">
                  {{ index + 1 }}. {{ item }}
                </el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 搜索结果 -->
      <div v-if="hasSearched" class="search-results">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="8" :md="6">
              <el-select v-model="filters.categoryId" placeholder="分类" clearable @change="handleSearch">
                <el-option label="全部分类" value="" />
                <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
              </el-select>
            </el-col>

            <el-col :xs="24" :sm="8" :md="6">
              <el-select v-model="filters.status" placeholder="状态" clearable @change="handleSearch">
                <el-option label="全部状态" value="" />
                <el-option label="连载中" value="serializing" />
                <el-option label="已完结" value="completed" />
              </el-select>
            </el-col>

            <el-col :xs="24" :sm="8" :md="6">
              <el-select v-model="filters.sortBy" placeholder="排序" @change="handleSearch">
                <el-option label="相关度" value="relevance" />
                <el-option label="最新更新" value="updateTime" />
                <el-option label="最高评分" value="rating" />
                <el-option label="最多阅读" value="viewCount" />
              </el-select>
            </el-col>
          </el-row>
        </div>

        <!-- 结果统计 -->
        <div class="result-info">
          <span>找到 <strong>{{ totalResults }}</strong> 个结果</span>
          <span v-if="searchKeyword" class="keyword-highlight">"{{ searchKeyword }}"</span>
        </div>

        <!-- 结果列表 -->
        <div v-loading="loading" class="results-list">
          <div v-for="book in searchResults" :key="book.id" class="result-item" @click="goToDetail(book.id)">
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

            <div class="item-content">
              <h3 class="item-title" v-html="highlightKeyword(book.title)"></h3>
              <p class="item-author">
                <el-icon>
                  <User />
                </el-icon>
                <span v-html="highlightKeyword(book.author)"></span>
                <el-tag size="small" type="info">{{ book.categoryName }}</el-tag>
              </p>

              <div class="item-meta">
                <span class="rating">
                  <el-icon>
                    <Star />
                  </el-icon>
                  {{ book.rating.toFixed(1) }}
                </span>
                <span>{{ formatNumber(book.wordCount) }}字</span>
                <span>{{ formatNumber(book.viewCount) }}阅读</span>
                <el-tag v-if="book.status === 'completed'" size="small" type="success">
                  完结
                </el-tag>
                <el-tag v-else size="small" type="warning">
                  连载
                </el-tag>
              </div>

              <p v-if="book.latestChapter" class="latest-chapter">
                最新: {{ book.latestChapter }}
              </p>
            </div>

            <div class="item-action">
              <el-button type="primary">阅读</el-button>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty v-if="!loading && searchResults.length === 0" description="没有找到相关书籍">
            <el-button @click="clearSearch">清空搜索</el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div v-if="totalResults > 0" class="pagination">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
            :total="totalResults" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
            @current-change="handlePageChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { bookstoreAPI } from '@/api/bookstore'
import { booksAPI } from '@/api/reading/books'
import { ElMessage } from 'element-plus'
import { Search, Delete, Picture, User, Star } from '@element-plus/icons-vue'
import type { BookBrief, Category, SearchFilter } from '@/types/models'

const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const searchResults = ref<BookBrief[]>([])
const totalResults = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const categories = ref<Category[]>([])

// 搜索历史（从localStorage读取）
const searchHistory = ref<string[]>([])

// 热门搜索（模拟数据，实际应从API获取）
const hotSearches = ref([
  '斗罗大陆',
  '遮天',
  '完美世界',
  '凡人修仙传',
  '诛仙',
  '斗破苍穹',
  '盘龙',
  '神墓'
])

const filters = reactive<Partial<SearchFilter>>({
  categoryId: '',
  status: '' as any,
  sortBy: 'relevance' as any
})

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 高亮关键词
const highlightKeyword = (text: string): string => {
  if (!searchKeyword.value) return text
  const regex = new RegExp(`(${searchKeyword.value})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 加载分类
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

// 加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('search_history')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史
const saveSearchHistory = (keyword: string) => {
  if (!keyword.trim()) return

  // 去重并添加到开头
  const history = searchHistory.value.filter(item => item !== keyword)
  history.unshift(keyword)

  // 只保留最近10条
  searchHistory.value = history.slice(0, 10)

  // 保存到localStorage
  localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('search_history')
  ElMessage.success('已清空搜索历史')
}

// 执行搜索
const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  hasSearched.value = true

  try {
    // 保存搜索历史
    saveSearchHistory(keyword)

    const response = await bookstoreAPI.searchBooks(keyword, {
      ...filters,
      page: currentPage.value,
      size: pageSize.value
    })

    if (response.code === 200) {
      searchResults.value = response.data.books || []
      totalResults.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '搜索失败')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  hasSearched.value = false
  searchResults.value = []
  totalResults.value = 0
  currentPage.value = 1
  filters.categoryId = ''
  filters.status = '' as any
  filters.sortBy = 'relevance' as any
}

// 跳转到详情
const goToDetail = (id: string) => {
  router.push(`/books/${id}`)
}

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  handleSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  handleSearch()
}

onMounted(() => {
  loadCategories()
  loadSearchHistory()

  // 如果URL带有搜索参数，自动搜索
  const keyword = route.query.q as string
  if (keyword) {
    searchKeyword.value = keyword
    handleSearch()
  }
})
</script>

<style scoped lang="scss">
.search-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-header {
  background: white;
  padding: 40px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-suggestions {
  .suggestion-section {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
      }
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

.search-results {
  .filter-bar {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 16px;

    .el-select {
      width: 100%;
    }
  }

  .result-info {
    padding: 16px 0;
    font-size: 14px;
    color: #606266;

    strong {
      color: #409eff;
      font-size: 18px;
    }

    .keyword-highlight {
      margin-left: 8px;
      color: #f56c6c;
      font-weight: 500;
    }
  }

  .results-list {
    min-height: 400px;

    .result-item {
      display: flex;
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .item-cover {
        width: 120px;
        height: 160px;
        flex-shrink: 0;
        border-radius: 4px;
        overflow: hidden;

        .el-image {
          width: 100%;
          height: 100%;
        }
      }

      .item-content {
        flex: 1;
        padding: 0 20px;
        min-width: 0;

        .item-title {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 12px 0;
          color: #303133;

          :deep(.highlight) {
            color: #f56c6c;
            background-color: #fff1f0;
            padding: 2px 4px;
            border-radius: 2px;
          }
        }

        .item-author {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #606266;
          margin: 0 0 12px 0;

          :deep(.highlight) {
            color: #f56c6c;
            background-color: #fff1f0;
            padding: 2px 4px;
            border-radius: 2px;
          }
        }

        .item-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #909399;
          margin-bottom: 8px;
          flex-wrap: wrap;

          .rating {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #f56c6c;
          }
        }

        .latest-chapter {
          font-size: 13px;
          color: #909399;
          margin: 0;
        }
      }

      .item-action {
        display: flex;
        align-items: center;
        padding-left: 20px;
      }
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
  .search-header {
    padding: 20px;
  }

  .search-results .results-list .result-item {
    flex-direction: column;

    .item-cover {
      width: 100%;
      height: auto;
      aspect-ratio: 3/4;
      margin-bottom: 16px;
    }

    .item-content {
      padding: 0;
    }

    .item-action {
      padding: 16px 0 0 0;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
