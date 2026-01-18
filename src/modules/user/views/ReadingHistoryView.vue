<template>
  <div class="reading-history-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <el-icon><Clock /></el-icon>
          阅读历史
        </h1>
        <div class="header-actions">
          <el-button @click="clearAllHistory" :icon="Delete" type="danger" plain>
            清空历史
          </el-button>
        </div>
      </div>

      <!-- 筛选和排序 -->
      <el-card shadow="hover" class="filter-card">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8">
            <el-select v-model="filter.sortBy" placeholder="排序方式" @change="loadHistory">
              <el-option label="最近阅读" value="recent" />
              <el-option label="阅读时长" value="duration" />
              <el-option label="阅读进度" value="progress" />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="8">
            <el-select v-model="filter.period" placeholder="时间范围" clearable @change="loadHistory">
              <el-option label="全部" value="" />
              <el-option label="最近7天" value="7d" />
              <el-option label="最近30天" value="30d" />
              <el-option label="最近3个月" value="3m" />
            </el-select>
          </el-col>

          <el-col :xs="24" :sm="8">
            <el-input
              v-model="filter.keyword"
              placeholder="搜索书名或作者"
              clearable
              @change="loadHistory"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
        </el-row>
      </el-card>

      <!-- 历史记录列表 -->
      <div v-loading="loading" class="history-list">
        <template v-if="!loading && historyList.length > 0">
          <el-card
            v-for="item in historyList"
            :key="item.id"
            shadow="hover"
            class="history-item"
          >
            <div class="item-content" @click="continueReading(item)">
              <!-- 书籍封面 -->
              <div class="item-cover">
                <el-image :src="item.book?.cover || '/placeholder-book.png'" fit="cover">
                  <template #error>
                    <div class="image-slot">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>

                <!-- 阅读进度标签 -->
                <div class="progress-badge">
                  {{ item.progress }}%
                </div>
              </div>

              <!-- 书籍信息 -->
              <div class="item-info">
                <h3 class="book-title">{{ item.book?.title }}</h3>
                <p class="book-author">
                  <el-icon><User /></el-icon>
                  {{ item.book?.author }}
                </p>

                <div class="reading-info">
                  <el-tag size="small">
                    阅读到：{{ item.chapterTitle || `第${item.chapterNumber}章` }}
                  </el-tag>
                  <span class="reading-time">
                    <el-icon><Timer /></el-icon>
                    阅读时长：{{ formatDuration(item.readingDuration || 0) }}
                  </span>
                </div>

                <!-- 阅读进度条 -->
                <el-progress
                  :percentage="item.progress || 0"
                  :stroke-width="8"
                  :show-text="false"
                />

                <div class="meta-info">
                  <span class="last-read-time">
                    最后阅读：{{ formatTime(item.lastReadAt) }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="item-actions">
                <el-button type="primary" @click.stop="continueReading(item)">
                  继续阅读
                </el-button>
                <el-button @click.stop="goToBookDetail(item.bookId)">
                  查看详情
                </el-button>
                <el-button
                  type="danger"
                  text
                  :icon="Delete"
                  @click.stop="removeHistory(item.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </el-card>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </template>

        <!-- 空状态 -->
        <el-empty v-else-if="!loading" description="暂无阅读历史">
          <el-button type="primary" @click="goToBookstore">去书城看看</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock,
  Delete,
  Search,
  Picture,
  User,
  Timer
} from '@element-plus/icons-vue'
import { historyAPI } from '@/modules/reader/api'
import type { ReadingHistory } from '@/types/reader'

const router = useRouter()

// 状态
const loading = ref(false)
const historyList = ref<ReadingHistory[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选条件
const filter = reactive({
  sortBy: 'recent',
  period: '',
  keyword: ''
})

// 格式化时间
const formatTime = (time: string | Date) => {
  if (!time) return '-'

  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化阅读时长
const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`

  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (minutes < 60) return `${minutes}分钟`

  const remainingMinutes = minutes % 60
  return `${hours}小时${remainingMinutes}分钟`
}

// 加载阅读历史
const loadHistory = async () => {
  loading.value = true
  try {
    const response = await historyAPI.getReadingHistory({
      page: currentPage.value,
      size: pageSize.value,
      sortBy: filter.sortBy,
      period: filter.period || undefined,
      keyword: filter.keyword || undefined
    })

    if (response.code === 200) {
      historyList.value = response.data?.items || response.data || []
      total.value = response.data?.total || 0
    }
  } catch (error: any) {
    console.error('加载阅读历史失败:', error)
    ElMessage.error(error.message || '加载阅读历史失败')
  } finally {
    loading.value = false
  }
}

// 继续阅读
const continueReading = (item: ReadingHistory) => {
  if (item.chapterId) {
    router.push(`/reader/${item.chapterId}`)
  } else {
    ElMessage.warning('章节信息缺失')
  }
}

// 跳转到书籍详情
const goToBookDetail = (bookId: string) => {
  router.push(`/bookstore/books/${bookId}`)
}

// 删除单条历史
const removeHistory = async (historyId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条阅读记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await historyAPI.deleteHistory(historyId)

    if (response.code === 200) {
      ElMessage.success('删除成功')
      await loadHistory()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除历史失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 清空所有历史
const clearAllHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有阅读历史吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    const response = await historyAPI.clearAllHistory()

    if (response.code === 200) {
      ElMessage.success('已清空所有历史')
      historyList.value = []
      total.value = 0
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('清空历史失败:', error)
      ElMessage.error(error.message || '清空失败')
    }
  }
}

// 去书城
const goToBookstore = () => {
  router.push('/bookstore')
}

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadHistory()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadHistory()
}

// 页面初始化
onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.reading-history-view {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .page-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: #303133;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.filter-card {
  margin-bottom: 24px;

  :deep(.el-select),
  :deep(.el-input) {
    width: 100%;
  }
}

.history-list {
  min-height: 400px;
}

.history-item {
  margin-bottom: 16px;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .item-content {
    display: flex;
    gap: 20px;
  }

  .item-cover {
    position: relative;
    width: 120px;
    height: 160px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .progress-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
  }

  .item-info {
    flex: 1;
    min-width: 0;

    .book-title {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .book-author {
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 4px;
      color: #606266;
      font-size: 14px;
    }

    .reading-info {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;

      .reading-time {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #909399;
      }
    }

    .el-progress {
      margin-bottom: 12px;
    }

    .meta-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #909399;

      .last-read-time {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;

    .el-button {
      min-width: 100px;
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
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

// 响应式
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;

    .header-actions {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }
  }

  .filter-card {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }

  .history-item {
    .item-content {
      flex-direction: column;
    }

    .item-cover {
      width: 100%;
      height: auto;
      aspect-ratio: 3/4;
    }

    .item-actions {
      flex-direction: row;
      flex-wrap: wrap;

      .el-button {
        flex: 1;
        min-width: auto;
      }
    }
  }
}
</style>

