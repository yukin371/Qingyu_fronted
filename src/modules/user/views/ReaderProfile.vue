<template>
  <div class="reader-profile">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="!userProfile" class="error-container">
      <el-empty description="用户不存在" />
    </div>

    <div v-else class="profile-container">
      <!-- 用户信息卡片 -->
      <UserCard
        :user="userProfile"
        :stats="userStats"
        :is-following="isFollowing"
        :show-message="true"
        :show-follow="!isCurrentUser"
        @follow="handleFollow"
        @unfollow="handleUnfollow"
        @message="handleMessage"
      />

      <!-- 标签页 -->
      <el-card class="content-card" shadow="never">
        <el-tabs v-model="activeTab">
          <!-- 书架 -->
          <el-tab-pane label="书架" name="bookshelf">
            <div v-if="loadingBookshelf" class="tab-loading">
              <el-skeleton :rows="5" animated />
            </div>

            <div v-else-if="bookshelfList.length === 0" class="empty-content">
              <el-empty description="书架空空如也" />
            </div>

            <div v-else class="bookshelf-grid">
              <div
                v-for="item in bookshelfList"
                :key="item.book_id"
                class="book-card"
                @click="goToBook(item.book_id)"
              >
                <el-image
                  :src="item.book?.cover || '/default-book-cover.jpg'"
                  fit="cover"
                  class="book-cover"
                  lazy
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="book-info">
                  <h4 class="book-title">{{ item.book?.title || '未知书籍' }}</h4>
                  <div class="reading-progress">
                    <el-progress
                      :percentage="calculateProgress(item)"
                      :stroke-width="6"
                      :show-text="false"
                    />
                    <span class="progress-text">
                      已读 {{ item.current_chapter || 0 }}/{{ item.book?.total_chapters || 0 }} 章
                    </span>
                  </div>
                  <div class="book-meta">
                    <span class="last-read">
                      <el-icon><Clock /></el-icon>
                      {{ formatTime(item.last_read_at) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="bookshelfList.length > 0" class="pagination">
              <el-pagination
                v-model:current-page="bookshelfPagination.page"
                v-model:page-size="bookshelfPagination.size"
                :total="bookshelfPagination.total"
                layout="prev, pager, next"
                @current-change="loadBookshelf"
              />
            </div>
          </el-tab-pane>

          <!-- 阅读统计 -->
          <el-tab-pane label="阅读统计" name="stats">
            <div class="stats-content">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-card class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon" style="background-color: #409eff20;">
                        <el-icon :size="32" color="#409eff"><Reading /></el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ readingStats.totalBooks || 0 }}</div>
                        <div class="stat-label">收藏书籍</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>

                <el-col :span="12">
                  <el-card class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon" style="background-color: #67c23a20;">
                        <el-icon :size="32" color="#67c23a"><Clock /></el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ readingStats.totalReadingTime || 0 }}h</div>
                        <div class="stat-label">阅读时长</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>

                <el-col :span="12">
                  <el-card class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon" style="background-color: #e6a23c20;">
                        <el-icon :size="32" color="#e6a23c"><Document /></el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ readingStats.totalChapters || 0 }}</div>
                        <div class="stat-label">已读章节</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>

                <el-col :span="12">
                  <el-card class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon" style="background-color: #f5622120;">
                        <el-icon :size="32" color="#f56221"><Star /></el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ readingStats.totalComments || 0 }}</div>
                        <div class="stat-label">发表评论</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <!-- 最近阅读 -->
              <el-card class="recent-reading-card" style="margin-top: 20px;">
                <template #header>
                  <div class="card-header">
                    <h3>最近阅读</h3>
                  </div>
                </template>

                <div v-if="recentReadings.length === 0" class="empty-content">
                  <el-empty description="暂无阅读记录" :image-size="80" />
                </div>

                <div v-else class="recent-list">
                  <div
                    v-for="item in recentReadings"
                    :key="item.id"
                    class="recent-item"
                    @click="goToReader(item.book_id, item.chapter_id)"
                  >
                    <el-image
                      :src="item.book?.cover"
                      fit="cover"
                      class="recent-cover"
                    >
                      <template #error>
                        <div class="image-slot-small">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                    <div class="recent-info">
                      <div class="recent-title">{{ item.book?.title }}</div>
                      <div class="recent-chapter">读到：{{ item.chapter?.title }}</div>
                      <div class="recent-time">{{ formatTime(item.read_at) }}</div>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <!-- 动态 -->
          <el-tab-pane label="动态" name="activities">
            <div class="empty-content">
              <el-empty description="暂无动态" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, Clock, Reading, Document, Star } from '@element-plus/icons-vue'
import UserCard from '@/shared/components/common/UserCard.vue'
import { useAuthStore } from '@/stores/auth'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userId = computed(() => route.params.userId as string)

// 是否为当前用户
const isCurrentUser = computed(() => userId.value === authStore.user?.id)

// 状态
const loading = ref(true)
const loadingBookshelf = ref(false)
const userProfile = ref<any>(null)
const userStats = ref<any>(null)
const isFollowing = ref(false)
const activeTab = ref('bookshelf')

// 书架列表
const bookshelfList = ref<any[]>([])
const bookshelfPagination = ref({
  page: 1,
  size: 12,
  total: 0
})

// 阅读统计
const readingStats = ref({
  totalBooks: 0,
  totalReadingTime: 0,
  totalChapters: 0,
  totalComments: 0
})

// 最近阅读
const recentReadings = ref<any[]>([])

// 加载用户信息
const loadUserProfile = async () => {
  loading.value = true
  try {
    const response = await request.get(`/users/${userId.value}/profile`)
    userProfile.value = response.data

    // 模拟统计数据
    userStats.value = {
      followerCount: 128,
      totalBooks: 45
    }

    // 模拟阅读统计
    readingStats.value = {
      totalBooks: 45,
      totalReadingTime: 128,
      totalChapters: 567,
      totalComments: 89
    }
  } catch (error: any) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

// 加载书架
const loadBookshelf = async () => {
  loadingBookshelf.value = true
  try {
    // TODO: 调用书架API
    // const response = await request.get(`/reader/bookshelf/${userId.value}`, {
    //   params: {
    //     page: bookshelfPagination.value.page,
    //     size: bookshelfPagination.value.size
    //   }
    // })
    // bookshelfList.value = response.data.books || []
    // bookshelfPagination.value.total = response.data.total || 0

    // 模拟数据
    bookshelfList.value = []
    bookshelfPagination.value.total = 0
  } catch (error: any) {
    console.error('加载书架失败:', error)
    ElMessage.error('加载书架失败')
  } finally {
    loadingBookshelf.value = false
  }
}

// 加载最近阅读
const loadRecentReadings = async () => {
  try {
    // TODO: 调用阅读历史API
    // const response = await request.get(`/reader/history/${userId.value}`, {
    //   params: { limit: 5 }
    // })
    // recentReadings.value = response.data || []

    // 模拟数据
    recentReadings.value = []
  } catch (error: any) {
    console.error('加载阅读记录失败:', error)
  }
}

// 计算阅读进度
const calculateProgress = (item: any): number => {
  if (!item.book?.total_chapters || item.book.total_chapters === 0) {
    return 0
  }
  return Math.round((item.current_chapter / item.book.total_chapters) * 100)
}

// 格式化时间
const formatTime = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

  return date.toLocaleDateString()
}

// 处理关注
const handleFollow = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/auth')
    return
  }

  try {
    await request.post(`/users/${userId.value}/follow`)
    isFollowing.value = true
    ElMessage.success('关注成功')
    if (userStats.value) {
      userStats.value.followerCount++
    }
  } catch (error: any) {
    console.error('关注失败:', error)
    ElMessage.error('关注失败')
  }
}

// 处理取消关注
const handleUnfollow = async () => {
  try {
    await request.delete(`/users/${userId.value}/follow`)
    isFollowing.value = false
    ElMessage.success('已取消关注')
    if (userStats.value && userStats.value.followerCount > 0) {
      userStats.value.followerCount--
    }
  } catch (error: any) {
    console.error('取消关注失败:', error)
    ElMessage.error('取消关注失败')
  }
}

// 处理私信
const handleMessage = () => {
  ElMessage.info('私信功能开发中')
}

// 前往书籍详情
const goToBook = (bookId: string) => {
  router.push(`/books/${bookId}`)
}

// 前往阅读器
const goToReader = (bookId: string, chapterId: string) => {
  router.push(`/reader/${bookId}/${chapterId}`)
}

// 初始化
onMounted(() => {
  loadUserProfile()
  loadBookshelf()
  loadRecentReadings()
})
</script>

<style scoped lang="scss">
.reader-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  padding: 60px 0;
  text-align: center;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 20px;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.tab-loading,
.empty-content {
  padding: 40px 0;
  text-align: center;
}

.bookshelf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.book-card {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }
}

.book-cover {
  width: 100%;
  height: 280px;
  display: block;

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 48px;
  }
}

.book-info {
  padding: 16px;

  .book-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reading-progress {
    margin-bottom: 12px;

    .progress-text {
      display: block;
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }
  }

  .book-meta {
    .last-read {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #909399;
    }
  }
}

.stats-content {
  .stat-card {
    border-radius: 12px;
    margin-bottom: 20px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.recent-reading-card {
  .card-header {
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .recent-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }

    .recent-cover {
      width: 60px;
      height: 80px;
      border-radius: 6px;
      flex-shrink: 0;

      .image-slot-small {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background-color: #f5f7fa;
        color: #909399;
        font-size: 24px;
      }
    }

    .recent-info {
      flex: 1;
      min-width: 0;

      .recent-title {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .recent-chapter {
        font-size: 13px;
        color: #606266;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .recent-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .reader-profile {
    padding: 16px;
  }

  .bookshelf-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .book-cover {
    height: 200px;
  }

  .stats-content {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }
}
</style>

