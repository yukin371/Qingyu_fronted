<template>
  <div class="reading-history-view">
    <div class="page-header">
      <h1>阅读历史</h1>
      <div class="header-actions">
        <el-button @click="clearAll" type="danger" plain :disabled="histories.length === 0">
          清空历史
        </el-button>
      </div>
    </div>

    <div class="history-content">
      <el-skeleton v-if="loading" :rows="5" animated />

      <el-empty v-else-if="histories.length === 0" description="暂无阅读历史">
        <el-button type="primary" @click="$router.push('/bookstore/books')">
          去书库看看
        </el-button>
      </el-empty>

      <div v-else class="history-timeline">
        <el-timeline>
          <el-timeline-item
            v-for="group in groupedHistories"
            :key="group.date"
            :timestamp="group.dateLabel"
            placement="top"
          >
            <div class="history-group">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="history-item"
              >
                <div class="item-cover" @click="goToBook(item.bookId)">
                  <el-image
                    :src="item.bookCover"
                    fit="cover"
                    lazy
                  >
                    <template #error>
                      <div class="image-slot">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>

                <div class="item-info">
                  <div class="item-title" @click="goToBook(item.bookId)">
                    {{ item.bookTitle }}
                  </div>
                  <div class="item-chapter" @click="continueReading(item)">
                    {{ item.chapterTitle }}
                  </div>
                  <div class="item-meta">
                    <el-progress
                      :percentage="item.progress || 0"
                      :show-text="false"
                      :stroke-width="4"
                    />
                    <span class="progress-text">{{ item.progress }}%</span>
                    <span class="read-time">阅读 {{ formatDuration(item.duration) }}</span>
                    <span class="timestamp">{{ formatTime(item.readAt) }}</span>
                  </div>
                </div>

                <div class="item-actions">
                  <el-button type="primary" @click="continueReading(item)">
                    继续阅读
                  </el-button>
                  <el-button @click="removeHistory(item.id)" text>
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>

        <!-- 分页 -->
        <div v-if="total > pageSize" class="pagination">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Close } from '@element-plus/icons-vue'
import { getReadingHistory, deleteHistory, clearHistory } from '@/modules/reader/api'
import type { ReadingHistory } from '@/types/models'

const router = useRouter()

const loading = ref(false)
const histories = ref<ReadingHistory[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 按日期分组
const groupedHistories = computed(() => {
  const groups: Record<string, ReadingHistory[]> = {}

  histories.value.forEach(item => {
    const date = new Date(item.readAt).toLocaleDateString('zh-CN')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })

  return Object.entries(groups).map(([date, items]) => ({
    date,
    dateLabel: formatDateLabel(date),
    items
  }))
})

// 格式化日期标签
function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return dateStr
  }
}

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 格式化阅读时长
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }
}

// 加载历史记录
async function loadHistory(): Promise<void> {
  loading.value = true
  try {
    const response = await getReadingHistory({
      page: currentPage.value,
      size: pageSize.value
    })

    const data = response.data || response
    histories.value = Array.isArray(data) ? data : (data.data || [])
    total.value = data.total || (response as any).total || 0
  } catch (error: any) {
    console.error('加载历史记录失败:', error)
    ElMessage.error(error.message || '加载历史记录失败')
  } finally {
    loading.value = false
  }
}

// 跳转到书籍详情
function goToBook(bookId: string): void {
  router.push(`/bookstore/books/${bookId}`)
}

// 继续阅读
function continueReading(item: ReadingHistory): void {
  router.push(`/reader/${item.chapterId}`)
}

// 删除单条历史
async function removeHistory(id: string): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除这条阅读记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteHistory(id)
    histories.value = histories.value.filter(h => h.id !== id)
    total.value = Math.max(0, total.value - 1)
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 清空所有历史
async function clearAll(): Promise<void> {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有阅读历史吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await clearHistory()
    histories.value = []
    total.value = 0
    ElMessage.success('已清空阅读历史')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('清空失败:', error)
      ElMessage.error(error.message || '清空失败')
    }
  }
}

// 分页处理
function handlePageChange(page: number): void {
  currentPage.value = page
  loadHistory()
}

function handleSizeChange(size: number): void {
  pageSize.value = size
  currentPage.value = 1
  loadHistory()
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.reading-history-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }

  .history-content {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    min-height: 400px;
  }

  .history-timeline {
    .history-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .history-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background: #ecf5ff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .item-cover {
        width: 80px;
        height: 106px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
        cursor: pointer;

        .el-image {
          width: 100%;
          height: 100%;
        }

        .image-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #dcdfe6;
          color: #909399;
          font-size: 32px;
        }
      }

      .item-info {
        flex: 1;
        min-width: 0;

        .item-title {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          cursor: pointer;
          transition: color 0.3s;

          &:hover {
            color: #409EFF;
          }
        }

        .item-chapter {
          margin: 0 0 12px;
          font-size: 14px;
          color: #606266;
          cursor: pointer;
          transition: color 0.3s;

          &:hover {
            color: #409EFF;
          }
        }

        .item-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #909399;

          .el-progress {
            width: 120px;
          }

          .progress-text {
            min-width: 40px;
          }
        }
      }

      .item-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }
}

@media (max-width: 768px) {
  .reading-history-view {
    padding: 16px;

    .history-item {
      flex-direction: column;
      align-items: flex-start !important;

      .item-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
}
</style>

