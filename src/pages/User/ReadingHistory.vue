<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- 统计卡片 -->
      <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6 text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">
            {{ stats.totalBooks }}
          </div>
          <div class="text-sm text-gray-600">阅读书籍数</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6 text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ stats.totalChapters }}
          </div>
          <div class="text-sm text-gray-600">阅读章节数</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6 text-center">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {{ formatDuration(stats.todayDuration) }}
          </div>
          <div class="text-sm text-gray-600">今日阅读</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6 text-center">
          <div class="text-3xl font-bold text-orange-600 mb-2">
            {{ formatDuration(stats.totalDuration) }}
          </div>
          <div class="text-sm text-gray-600">累计阅读</div>
        </div>
      </div>

      <!-- 阅读历史列表 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">阅读历史</h2>
          <el-button
            v-if="historyList.length > 0"
            type="danger"
            text
            :icon="Delete"
            @click="handleClearAll"
          >
            清空历史
          </el-button>
        </div>

        <div v-if="historyList.length > 0" class="space-y-4">
          <div
            v-for="item in historyList"
            :key="item.id"
            class="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <!-- 封面 -->
            <div
              class="flex-shrink-0 w-20 h-28 overflow-hidden rounded cursor-pointer"
              @click="handleBookClick(item.bookId)"
            >
              <img
                v-if="item.book"
                :src="item.book.coverUrl"
                :alt="item.book.title"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <!-- 信息 -->
            <div class="flex-1 min-w-0">
              <h3
                class="text-lg font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                @click="handleBookClick(item.bookId)"
              >
                {{ item.book?.title }}
              </h3>
              <p class="text-sm text-gray-600 mb-2">
                作者：{{ item.book?.author }}
              </p>
              <div class="flex items-center text-sm text-gray-500 space-x-4">
                <span>
                  读到：{{ item.chapter?.title }}
                </span>
                <span>
                  进度：{{ item.progress }}%
                </span>
                <span>
                  时长：{{ formatDuration(item.readDuration) }}
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-1">
                最后阅读：{{ formatLastRead(item.lastReadAt) }}
              </p>
            </div>

            <!-- 操作 -->
            <div class="flex-shrink-0 flex flex-col space-y-2">
              <el-button
                type="primary"
                size="small"
                @click="handleContinueRead(item.chapterId)"
              >
                继续阅读
              </el-button>
              <el-button
                size="small"
                :icon="Delete"
                @click="handleDelete(item.id)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-else-if="!isLoading"
          description="暂无阅读记录"
          :image-size="120"
        >
          <el-button type="primary" @click="$router.push('/bookstore')">
            去书城逛逛
          </el-button>
        </el-empty>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center items-center py-20">
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        </div>

        <!-- 分页 -->
        <div v-if="total > pageSize" class="flex justify-center mt-6">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @current-change="loadHistory"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Loading } from '@element-plus/icons-vue'
import {
  getReadingHistory,
  getReadingStats,
  deleteReadingHistory,
  clearReadingHistory,
} from '@/api/reader'
import type { ReadingHistory, ReadingStats } from '@/types/reader'
import Header from '@/components/Layout/Header.vue'

const router = useRouter()

const historyList = ref<ReadingHistory[]>([])
const stats = ref<ReadingStats | null>(null)
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 初始化
onMounted(() => {
  loadStats()
  loadHistory()
})

// 加载统计
async function loadStats() {
  try {
    const data = await getReadingStats()
    stats.value = data
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 加载历史
async function loadHistory() {
  try {
    isLoading.value = true
    const response = await getReadingHistory({
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    historyList.value = response.list
    total.value = response.total
  } catch (error: any) {
    console.error('加载阅读历史失败:', error)
    ElMessage.error(error.message || '加载失败')
  } finally {
    isLoading.value = false
  }
}

// 继续阅读
function handleContinueRead(chapterId: string) {
  router.push(`/reader/${chapterId}`)
}

// 查看书籍详情
function handleBookClick(bookId: string) {
  router.push(`/book/${bookId}`)
}

// 删除记录
async function handleDelete(historyId: string) {
  try {
    await ElMessageBox.confirm('确定删除此阅读记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteReadingHistory(historyId)
    ElMessage.success('删除成功')
    loadHistory()
    loadStats()
  } catch (error) {
    // 用户取消
  }
}

// 清空所有记录
async function handleClearAll() {
  try {
    await ElMessageBox.confirm(
      '确定清空所有阅读记录吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await clearReadingHistory()
    ElMessage.success('已清空')
    loadHistory()
    loadStats()
  } catch (error) {
    // 用户取消
  }
}

// 每页数量变化
function handleSizeChange() {
  currentPage.value = 1
  loadHistory()
}

// 格式化时长（秒 -> 时分秒）
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分钟`
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}小时${minutes}分钟`
}

// 格式化最后阅读时间
function formatLastRead(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}
</script>





