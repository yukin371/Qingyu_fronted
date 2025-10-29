<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="container mx-auto px-4 py-8">
      <!-- 分类信息 -->
      <div v-if="categoryDetail" class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
              {{ categoryDetail.name }}
            </h1>
            <p v-if="categoryDetail.description" class="text-gray-600">
              {{ categoryDetail.description }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-blue-600">
              {{ categoryDetail.bookCount }}
            </div>
            <div class="text-sm text-gray-500">本书籍</div>
          </div>
        </div>

        <!-- 子分类 -->
        <div v-if="categoryDetail.children && categoryDetail.children.length" class="mt-6">
          <h3 class="text-sm font-semibold mb-3">子分类</h3>
          <div class="flex flex-wrap gap-2">
            <el-tag
              v-for="child in categoryDetail.children"
              :key="child.id"
              size="large"
              effect="plain"
              class="cursor-pointer"
              @click="handleCategoryChange(child.id)"
            >
              {{ child.name }} ({{ child.bookCount }})
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 排序和筛选 -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">排序：</span>
            <el-radio-group v-model="sortBy" size="small" @change="handleSortChange">
              <el-radio-button value="updatedAt">最新更新</el-radio-button>
              <el-radio-button value="viewCount">最多阅读</el-radio-button>
              <el-radio-button value="likeCount">最多收藏</el-radio-button>
              <el-radio-button value="rating">最高评分</el-radio-button>
            </el-radio-group>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">状态：</span>
            <el-select v-model="status" placeholder="全部" size="small" @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="连载中" value="ongoing" />
              <el-option label="已完结" value="completed" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 书籍列表 -->
      <div v-if="books.length > 0" class="bg-white rounded-lg shadow-sm p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-6">
          <BookCard
            v-for="book in books"
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

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else-if="!isLoading && books.length === 0"
        description="该分类暂无书籍"
        :image-size="120"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { getCategoryDetail, getBooksByCategory } from '@/api/bookstore'
import type { Book, Category } from '@/types/bookstore'
import Header from '@/components/Layout/Header.vue'
import BookCard from '@/components/Book/BookCard.vue'

const route = useRoute()
const router = useRouter()

const categoryDetail = ref<Category | null>(null)
const books = ref<Book[]>([])
const isLoading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const sortBy = ref('updatedAt')
const status = ref('')

// 监听路由变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadCategoryData(newId as string)
    }
  }
)

// 初始化
onMounted(() => {
  const categoryId = route.params.id as string
  if (categoryId) {
    loadCategoryData(categoryId)
  }
})

// 加载分类数据
async function loadCategoryData(categoryId: string) {
  try {
    isLoading.value = true

    // 加载分类详情
    const detail = await getCategoryDetail(categoryId)
    categoryDetail.value = detail

    // 加载书籍列表
    await loadBooks(categoryId)
  } catch (error: any) {
    console.error('加载分类数据失败:', error)
    ElMessage.error(error.message || '加载失败')
  } finally {
    isLoading.value = false
  }
}

// 加载书籍列表
async function loadBooks(categoryId: string) {
  try {
    const response = await getBooksByCategory(categoryId, {
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      sortOrder: 'desc',
      status: status.value || undefined,
    })

    books.value = response.list
    total.value = response.total
  } catch (error: any) {
    console.error('加载书籍列表失败:', error)
    ElMessage.error(error.message || '加载失败')
  }
}

// 切换分类
function handleCategoryChange(categoryId: string) {
  router.push(`/bookstore/category/${categoryId}`)
}

// 排序变化
function handleSortChange() {
  currentPage.value = 1
  handleSearch()
}

// 执行搜索
function handleSearch() {
  const categoryId = route.params.id as string
  if (categoryId) {
    loadBooks(categoryId)
  }
}

// 分页变化
function handlePageChange() {
  handleSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 每页数量变化
function handleSizeChange() {
  currentPage.value = 1
  handleSearch()
}
</script>




