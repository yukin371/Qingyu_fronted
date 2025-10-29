<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div v-if="!isLoading && bookDetail" class="container mx-auto px-4 py-8">
      <!-- 书籍信息卡片 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- 封面 -->
          <div class="flex-shrink-0">
            <img
              :src="bookDetail.coverUrl"
              :alt="bookDetail.title"
              class="w-48 h-64 object-cover rounded-lg shadow-md"
            />
          </div>

          <!-- 信息 -->
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              {{ bookDetail.title }}
            </h1>

            <div class="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <span>作者：{{ bookDetail.author }}</span>
              <span>|</span>
              <span>分类：{{ bookDetail.categoryName }}</span>
              <span>|</span>
              <el-tag :type="getStatusType(bookDetail.status)" size="small">
                {{ getStatusText(bookDetail.status) }}
              </el-tag>
              <el-tag v-if="bookDetail.isPaid" type="warning" size="small">
                付费作品
              </el-tag>
            </div>

            <!-- 统计信息 -->
            <div class="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <span class="flex items-center">
                <el-icon class="mr-1"><View /></el-icon>
                {{ formatCount(bookDetail.viewCount) }} 阅读
              </span>
              <span class="flex items-center">
                <el-icon class="mr-1"><Star /></el-icon>
                {{ formatCount(bookDetail.collectCount) }} 收藏
              </span>
              <span class="flex items-center">
                <el-icon class="mr-1"><ChatLineRound /></el-icon>
                {{ formatCount(bookDetail.commentCount) }} 评论
              </span>
              <span v-if="bookDetail.wordCount" class="flex items-center">
                <el-icon class="mr-1"><Document /></el-icon>
                {{ formatCount(bookDetail.wordCount) }} 字
              </span>
            </div>

            <!-- 评分 -->
            <div v-if="bookDetail.rating" class="mb-4">
              <el-rate
                v-model="bookDetail.rating"
                disabled
                show-score
                text-color="#ff9900"
              />
            </div>

            <!-- 简介 -->
            <div class="text-gray-700 mb-6">
              <h3 class="font-semibold mb-2">作品简介</h3>
              <p class="leading-relaxed">{{ bookDetail.description }}</p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center space-x-4">
              <el-button
                type="primary"
                size="large"
                :icon="Reading"
                @click="handleStartReading"
              >
                开始阅读
              </el-button>
              <el-button size="large" :icon="Star">
                加入书架
              </el-button>
              <el-button size="large" :icon="Share">
                分享
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签 -->
      <div v-if="bookDetail.tags && bookDetail.tags.length" class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 class="font-semibold mb-3">作品标签</h3>
        <div class="flex flex-wrap gap-2">
          <el-tag
            v-for="tag in bookDetail.tags"
            :key="tag"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 章节列表 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold">章节目录</h3>
          <span class="text-sm text-gray-500">
            共 {{ bookDetail.chapterCount }} 章
          </span>
        </div>

        <div v-if="bookDetail.chapters && bookDetail.chapters.length" class="space-y-2">
          <div
            v-for="chapter in bookDetail.chapters"
            :key="chapter.id"
            class="flex items-center justify-between p-3 rounded hover:bg-gray-50 cursor-pointer transition-colors"
            @click="handleReadChapter(chapter.id)"
          >
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-900">
                第{{ chapter.chapterNumber }}章 {{ chapter.title }}
              </span>
            </div>
            <div class="flex items-center space-x-4 text-xs text-gray-500">
              <span>{{ formatCount(chapter.wordCount) }} 字</span>
              <span v-if="!chapter.isFree" class="text-orange-600">
                {{ chapter.price }} 币
              </span>
              <span v-else class="text-green-600">免费</span>
            </div>
          </div>
        </div>

        <el-empty v-else description="暂无章节" :image-size="80" />
      </div>

      <!-- 相似推荐 -->
      <div v-if="relatedBooks.length" class="mb-6">
        <SectionTitle title="相似推荐" icon="Star" />
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <BookCard
            v-for="book in relatedBooks"
            :key="book.id"
            :book="book"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
    </div>

    <!-- Error -->
    <el-empty
      v-if="!isLoading && !bookDetail"
      description="书籍不存在或已下架"
      class="py-20"
    >
      <el-button type="primary" @click="$router.push('/bookstore')">
        返回书城
      </el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  View,
  Star,
  ChatLineRound,
  Document,
  Reading,
  Share,
  Loading,
} from '@element-plus/icons-vue'
import { useBookstoreStore } from '@/stores/bookstore'
import { getSimilarRecommendations } from '@/api/recommendation'
import { incrementBookView } from '@/api/bookstore'
import type { Book } from '@/types/bookstore'
import Header from '@/components/Layout/Header.vue'
import SectionTitle from '@/components/Common/SectionTitle.vue'
import BookCard from '@/components/Book/BookCard.vue'

const route = useRoute()
const router = useRouter()
const bookstoreStore = useBookstoreStore()

const relatedBooks = ref<Book[]>([])

const bookDetail = computed(() => bookstoreStore.currentBook)
const isLoading = computed(() => bookstoreStore.isLoading)

// 加载书籍详情
onMounted(async () => {
  const bookId = route.params.id as string
  if (!bookId) {
    ElMessage.error('书籍ID无效')
    router.push('/bookstore')
    return
  }

  try {
    await bookstoreStore.fetchBookDetail(bookId)

    // 记录浏览量
    incrementBookView(bookId).catch(() => {})

    // 加载相似推荐
    loadRelatedBooks(bookId)
  } catch (error: any) {
    console.error('加载书籍详情失败:', error)
    ElMessage.error(error.message || '加载失败')
  }
})

// 加载相似书籍
async function loadRelatedBooks(bookId: string) {
  try {
    const books = await getSimilarRecommendations({
      itemId: bookId,
      itemType: 'book',
      limit: 5,
    })
    relatedBooks.value = books
  } catch (error) {
    console.error('加载相似推荐失败:', error)
  }
}

// 开始阅读（第一章或上次阅读位置）
function handleStartReading() {
  if (!bookDetail.value?.chapters?.length) {
    ElMessage.warning('暂无章节')
    return
  }

  const firstChapter = bookDetail.value.chapters[0]
  router.push(`/reader/${firstChapter.id}`)
}

// 阅读指定章节
function handleReadChapter(chapterId: string) {
  router.push(`/reader/${chapterId}`)
}

// 获取状态类型
function getStatusType(status: string) {
  const typeMap: Record<string, any> = {
    ongoing: 'success',
    completed: 'info',
    hiatus: 'warning',
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    ongoing: '连载中',
    completed: '已完结',
    hiatus: '已停更',
  }
  return textMap[status] || status
}

// 格式化数字
function formatCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }
  return count.toString()
}
</script>




