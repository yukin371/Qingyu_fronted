<template>
  <div class="collections-view">
    <!-- 头部 -->
    <div class="collections-header">
      <h2>我的收藏</h2>
      <div v-if="total > 0" class="stats-badge">
        共 {{ total }} 本
      </div>
    </div>

    <!-- 加载状态 -->
    <el-skeleton :loading="loading" :rows="5" animated>
      <div class="collections-content">
        <!-- 空状态 -->
        <el-empty v-if="collections.length === 0 && !loading" description="暂无收藏">
          <template #extra>
            <el-button type="primary" @click="goToBookstore">去书城逛逛</el-button>
          </template>
          <template #image>
            <el-icon :size="100" color="#909399">
              <Star />
            </el-icon>
          </template>
        </el-empty>

        <!-- 收藏列表 -->
        <div v-else class="collections-list">
          <div
            v-for="item in collections"
            :key="item.id"
            class="collection-item"
          >
            <!-- 封面 -->
            <el-image
              :src="item.cover"
              fit="cover"
              class="book-cover"
              @click="goToBook(item.bookId)"
            >
              <template #error>
                <div class="image-slot">
                  <QyIcon name="Picture" />
                </div>
              </template>
            </el-image>

            <!-- 书籍信息 -->
            <div class="book-info" @click="goToBook(item.bookId)">
              <h3 class="book-title">{{ item.title }}</h3>
              <p class="book-author">{{ item.author }}</p>

              <!-- 备注区域 -->
              <div class="note-area" @click.stop>
                <template v-if="editingId === item.id">
                  <el-input
                    ref="noteInputRef"
                    v-model="editingNote"
                    placeholder="添加备注..."
                    size="small"
                    :maxlength="200"
                    show-word-limit
                    @blur="saveNote(item)"
                    @keyup.enter="saveNote(item)"
                    @keyup.escape="cancelEdit"
                  />
                </template>
                <template v-else>
                  <span
                    class="note-text"
                    :class="{ 'note-placeholder': !item.description }"
                    @click="startEdit(item)"
                  >
                    {{ item.description || '点击添加备注' }}
                  </span>
                </template>
              </div>

              <!-- 收藏时间 -->
              <p class="book-meta">收藏于 {{ formatDate(item.createdAt) }}</p>
            </div>

            <!-- 操作按钮 -->
            <div class="book-actions">
              <el-button type="danger" text @click.stop="handleRemove(item)">
                取消收藏
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-if="total > pageSize"
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          style="margin-top: 20px; justify-content: center"
          @current-change="loadCollections"
        />
      </div>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Star } from '@element-plus/icons-vue'
import { QyIcon } from '@/design-system/components'
import { message, messageBox } from '@/design-system/services'
import { collectionsAPI, type Collection } from '@/modules/reader/api/manual/collections'
import { formatDate } from '@/utils/format'

const router = useRouter()

// 列表数据
const collections = ref<Collection[]>([])
const loading = ref(false)
const total = ref(0)

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 编辑状态
const editingId = ref<string | null>(null)
const editingNote = ref('')
const originalNote = ref('')
const noteInputRef = ref()

// 保存中状态
const saving = ref(false)

onMounted(() => {
  loadCollections()
})

/**
 * 加载收藏列表
 */
async function loadCollections(): Promise<void> {
  loading.value = true
  try {
    const response = await collectionsAPI.getCollections({
      page: currentPage.value,
      pageSize: pageSize.value
    })

    // 处理响应数据 - PaginatedResponse 结构: { data: T[], pagination: { total, page, pageSize, ... } }
    collections.value = Array.isArray(response.data) ? response.data : []
    total.value = response.pagination?.total || collections.value.length
  } catch (error: any) {
    console.error('加载收藏列表失败:', error)
    message.error(error.message || '加载收藏列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 开始编辑备注
 */
function startEdit(item: Collection): void {
  if (saving.value) return

  editingId.value = item.id
  editingNote.value = item.description || ''
  originalNote.value = item.description || ''

  // 聚焦输入框
  nextTick(() => {
    noteInputRef.value?.focus()
  })
}

/**
 * 保存备注
 */
async function saveNote(item: Collection): Promise<void> {
  // 如果没有变化，直接取消编辑
  if (editingNote.value === originalNote.value) {
    cancelEdit()
    return
  }

  saving.value = true
  try {
    await collectionsAPI.updateCollection(item.id, {
      description: editingNote.value
    })

    // 更新本地数据
    item.description = editingNote.value
    message.success('备注已保存')
  } catch (error: any) {
    console.error('保存备注失败:', error)
    message.error(error.message || '保存备注失败')
    // 恢复原值
    editingNote.value = originalNote.value
  } finally {
    saving.value = false
    cancelEdit()
  }
}

/**
 * 取消编辑
 */
function cancelEdit(): void {
  editingId.value = null
  editingNote.value = ''
  originalNote.value = ''
}

/**
 * 取消收藏
 */
async function handleRemove(item: Collection): Promise<void> {
  try {
    await messageBox.confirm('确定要取消收藏这本书吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    await collectionsAPI.deleteCollection(item.id)
    message.success('已取消收藏')

    // 从列表中移除
    const index = collections.value.findIndex(c => c.id === item.id)
    if (index > -1) {
      collections.value.splice(index, 1)
      total.value--
    }

    // 如果当前页没有数据了，加载上一页
    if (collections.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
      loadCollections()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      message.error(error.message || '取消收藏失败')
    }
  }
}

/**
 * 跳转到书籍详情
 */
function goToBook(bookId: string): void {
  router.push(`/bookstore/books/${bookId}`)
}

/**
 * 跳转到书城
 */
function goToBookstore(): void {
  router.push('/bookstore')
}
</script>

<style scoped lang="scss">
.collections-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .collections-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      color: #303133;
    }

    .stats-badge {
      padding: 4px 12px;
      background: #f0f9eb;
      border-radius: 12px;
      font-size: 14px;
      color: #67c23a;
    }
  }

  .collections-content {
    min-height: 400px;
  }

  .collections-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .collection-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }

      .book-cover {
        width: 80px;
        height: 106px;
        border-radius: 4px;
        flex-shrink: 0;
        cursor: pointer;
      }

      .book-info {
        flex: 1;
        min-width: 0;
        cursor: pointer;

        .book-title {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          &:hover {
            color: #409eff;
          }
        }

        .book-author {
          margin: 0 0 12px;
          font-size: 14px;
          color: #606266;
        }

        .note-area {
          margin-bottom: 12px;

          .note-text {
            display: inline-block;
            padding: 4px 8px;
            font-size: 14px;
            color: #606266;
            background: #f5f7fa;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: #ecf5ff;
              color: #409eff;
            }

            &.note-placeholder {
              color: #c0c4cc;
              font-style: italic;
            }
          }

          :deep(.el-input) {
            width: 100%;
            max-width: 400px;
          }
        }

        .book-meta {
          margin: 0;
          font-size: 12px;
          color: #909399;
        }
      }

      .book-actions {
        flex-shrink: 0;
      }
    }
  }

  .image-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 24px;
  }
}
</style>
