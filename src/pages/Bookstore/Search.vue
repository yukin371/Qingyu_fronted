<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="container mx-auto px-4 py-8">
      <!-- 搜索框 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <el-input
          v-model="searchKeyword"
          size="large"
          placeholder="搜索书名、作者、关键词..."
          :prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button type="primary" :icon="Search" @click="handleSearch">
              搜索
            </el-button>
          </template>
        </el-input>

        <!-- 高级筛选 -->
        <div class="mt-4">
          <el-button
            text
            :icon="Filter"
            @click="showFilters = !showFilters"
          >
            {{ showFilters ? '收起' : '展开' }}筛选
          </el-button>

          <div v-show="showFilters" class="mt-4 space-y-4">
            <!-- 分类 -->
            <div>
              <label class="block text-sm font-medium mb-2">分类</label>
              <el-select
                v-model="filters.categoryId"
                placeholder="全部分类"
                clearable
                class="w-full"
              >
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </div>

            <!-- 状态 -->
            <div>
              <label class="block text-sm font-medium mb-2">连载状态</label>
              <el-radio-group v-model="filters.status">
                <el-radio-button value="">全部</el-radio-button>
                <el-radio-button value="ongoing">连载中</el-radio-button>
                <el-radio-button value="completed">已完结</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 字数 -->
            <div>
              <label class="block text-sm font-medium mb-2">字数范围</label>
              <div class="flex items-center space-x-2">
                <el-input-number
                  v-model="filters.minWordCount"
                  :min="0"
                  :step="10000"
                  placeholder="最小"
                  controls-position="right"
                />
                <span>至</span>
                <el-input-number
                  v-model="filters.maxWordCount"
                  :min="0"
                  :step="10000"
                  placeholder="最大"
                  controls-position="right"
                />
              </div>
            </div>

            <!-- 排序 -->
            <div>
              <label class="block text-sm font-medium mb-2">排序方式</label>
              <el-select v-model="filters.sortBy" class="w-48">
                <el-option label="最新更新" value="updatedAt" />
                <el-option label="最多阅读" value="viewCount" />
                <el-option label="最多收藏" value="likeCount" />
                <el-option label="最高评分" value="rating" />
              </el-select>
            </div>

            <div class="flex items-center space-x-2">
              <el-button type="primary" @click="handleSearch">应用筛选</el-button>
              <el-button @click="handleReset">重置</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">
            搜索结果 <span class="text-gray-500 text-sm">共 {{ total }} 本</span>
          </h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-6">
          <BookCard
            v-for="book in searchResults"
            :key="book.id"
            :book="book"
          />
        </div>

        <!-- 分页 -->
        <div class="flex justify-center">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[20, 40, 60, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else-if="hasSearched && !isLoading"
        description="没有找到相关书籍"
        :image-size="120"
      >
        <el-button type="primary" @click="handleReset">
          清空筛选条件
        </el-button>
      </el-empty>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Filter, Loading } from '@element-plus/icons-vue'
import { searchBooks } from '@/api/bookstore'
import { getCategoryTree } from '@/api/bookstore'
import type { Book, Category, SearchParams } from '@/types/bookstore'
import Header from '@/components/Layout/Header.vue'
import BookCard from '@/components/Book/BookCard.vue'

const route = useRoute()
const router = useRouter()

const searchKeyword = ref('')
const showFilters = ref(false)
const searchResults = ref<Book[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const filters = reactive<SearchParams>({
  keyword: '',
  categoryId: '',
  status: '',
  minWordCount: undefined,
  maxWordCount: undefined,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 20,
})

// 初始化
onMounted(async () => {
  // 加载分类列表
  try {
    const tree = await getCategoryTree()
    categories.value = tree
  } catch (error) {
    console.error('加载分类失败:', error)
  }

  // 从URL读取搜索参数
  const keyword = route.query.keyword as string
  if (keyword) {
    searchKeyword.value = keyword
    handleSearch()
  }
})

// 执行搜索
async function handleSearch() {
  try {
    isLoading.value = true
    hasSearched.value = true

    filters.keyword = searchKeyword.value
    filters.page = currentPage.value
    filters.pageSize = pageSize.value

    const response = await searchBooks(filters)
    searchResults.value = response.list
    total.value = response.total

    // 更新URL
    router.push({
      query: { keyword: searchKeyword.value },
    })
  } catch (error: any) {
    console.error('搜索失败:', error)
    ElMessage.error(error.message || '搜索失败')
  } finally {
    isLoading.value = false
  }
}

// 重置筛选
function handleReset() {
  searchKeyword.value = ''
  filters.categoryId = ''
  filters.status = ''
  filters.minWordCount = undefined
  filters.maxWordCount = undefined
  filters.sortBy = 'updatedAt'
  currentPage.value = 1
  searchResults.value = []
  hasSearched.value = false
  router.push({ query: {} })
}

// 分页变化
function handlePageChange(page: number) {
  currentPage.value = page
  handleSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 每页数量变化
function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  handleSearch()
}
</script>




