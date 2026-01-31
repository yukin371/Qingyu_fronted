<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h3>个人中心</h3>
          <el-button v-if="!isEditing && activeTab === 'basic'" type="primary" :icon="Edit" @click="startEdit">
            编辑资料
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <div v-loading="loading" class="profile-content">
            <template v-if="!loading && userStore.profile">
              <!-- 头像区域 -->
              <div class="avatar-section">
                <div class="avatar-wrapper">
                  <el-avatar :size="120" :src="userStore.avatar">
                    {{ userStore.displayName.charAt(0) }}
                  </el-avatar>
                  <el-upload
                    class="avatar-uploader"
                    :action="uploadAction"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                    :on-success="handleAvatarSuccess"
                    :on-error="handleAvatarError"
                    accept="image/*"
                  >
                    <el-button type="primary" size="small" :icon="Upload" circle class="upload-btn">
                    </el-button>
                  </el-upload>
                </div>
                <div class="avatar-hint">点击上传头像（支持JPG、PNG，不超过2MB）</div>
              </div>

              <!-- 信息表单 -->
              <el-form :model="profileForm" label-width="100px" class="profile-form" :disabled="!isEditing">
                <el-form-item label="用户名">
                  <el-input v-model="userStore.username" disabled />
                </el-form-item>

                <el-form-item label="昵称">
                  <el-input v-model="profileForm.nickname" placeholder="请输入昵称" maxlength="50" />
                </el-form-item>

                <el-form-item label="邮箱">
                  <el-input v-model="userStore.email" disabled />
                </el-form-item>

                <el-form-item label="简介">
                  <el-input v-model="profileForm.bio" type="textarea" :rows="3" maxlength="200" show-word-limit />
                </el-form-item>

                <el-form-item v-if="isEditing">
                  <el-button type="primary" @click="saveProfile" :loading="loading">保存</el-button>
                  <el-button @click="cancelEdit">取消</el-button>
                </el-form-item>
              </el-form>
            </template>

            <!-- 骨架屏 -->
            <el-skeleton v-else :rows="6" animated />
          </div>
        </el-tab-pane>

        <!-- 我的书架 -->
        <el-tab-pane label="我的书架" name="shelf">
          <div v-loading="shelfLoading" class="shelf-content">
            <template v-if="!shelfLoading && shelfBooks.length > 0">
              <div class="books-grid">
                <div v-for="book in shelfBooks" :key="book.id" class="book-card" @click="goToBook(book.id)">
                  <el-image :src="book.coverUrl || '/placeholder-book.png'" fit="cover" class="book-cover">
                    <template #error>
                      <div class="image-slot">
                        <QyIcon name="Picture"  />
                      </div>
                    </template>
                  </el-image>
                  <div class="book-info">
                    <h4>{{ book.title }}</h4>
                    <p>{{ book.author }}</p>
                  </div>
                </div>
              </div>
            </template>
            <el-empty v-else-if="!shelfLoading" description="书架是空的" />
            <el-skeleton v-else :rows="5" animated />
          </div>
        </el-tab-pane>

        <!-- 阅读历史 -->
        <el-tab-pane label="阅读历史" name="history">
          <div v-loading="historyLoading" class="history-content">
            <template v-if="!historyLoading && readingHistory.length > 0">
              <div class="history-list">
                <div v-for="item in readingHistory" :key="item.id" class="history-item">
                  <el-image :src="item.book?.coverUrl || '/placeholder-book.png'" fit="cover" class="history-cover">
                    <template #error>
                      <div class="image-slot">
                        <QyIcon name="Picture"  />
                      </div>
                    </template>
                  </el-image>
                  <div class="history-info">
                    <h4>{{ item.book?.title }}</h4>
                    <p>阅读到：{{ item.chapterTitle }}</p>
                    <el-progress :percentage="item.progress || 0" />
                  </div>
                </div>
              </div>
            </template>
            <el-empty v-else-if="!historyLoading" description="暂无阅读历史" />
            <el-skeleton v-else :rows="5" animated />
          </div>
        </el-tab-pane>

        <!-- 阅读统计 -->
        <el-tab-pane label="阅读统计" name="statistics">
          <div v-loading="statsLoading" class="statistics-content">
            <template v-if="!statsLoading">
              <!-- 快捷入口 -->
              <div class="stats-shortcuts">
                <el-card shadow="hover" class="stat-card" @click="goToReadingStatistics">
                  <div class="stat-card-content">
                    <el-icon :size="40" color="#409eff"><TrendCharts /></el-icon>
                    <h4>阅读统计</h4>
                    <p>查看详细阅读数据</p>
                    <el-button type="primary" link data-testid="reading-statistics">查看详情</el-button>
                  </div>
                </el-card>
              </div>

              <!-- 简要统计 -->
              <div class="stats-summary">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">{{ readingStats.totalBooks || 0 }}</div>
                      <div class="stat-label">阅读书籍</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">{{ readingStats.totalChapters || 0 }}</div>
                      <div class="stat-label">阅读章节数</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">{{ readingStats.totalWords || 0 }}</div>
                      <div class="stat-label">阅读字数(万)</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="stat-item">
                      <div class="stat-value">{{ readingStats.totalDays || 0 }}</div>
                      <div class="stat-label">阅读天数</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </template>
            <el-skeleton v-else :rows="6" animated />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import type { UploadProps } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { userAPI } from '@/modules/user/api'
import * as bookshelfAPI from '@/modules/reader/api'

const router = useRouter()
const userStore = useUserStore()

// 状态
const activeTab = ref('basic')
const isEditing = ref(false)
const loading = ref(false)
const shelfLoading = ref(false)
const historyLoading = ref(false)
const statsLoading = ref(false)

// 表单数据
const profileForm = reactive({
  nickname: '',
  bio: ''
})

// 书架数据
interface ShelfBook {
  id: string
  title: string
  author: string
  coverUrl: string
}
const shelfBooks = ref<ShelfBook[]>([])

// 阅读历史
interface HistoryItem {
  id: string
  book?: {
    title: string
    coverUrl: string
  }
  chapterTitle: string
  progress: number
}
const readingHistory = ref<HistoryItem[]>([])

// 阅读统计
interface ReadingStats {
  totalBooks: number
  totalChapters: number
  totalWords: number
  totalDays: number
}
const readingStats = ref<ReadingStats>({
  totalBooks: 0,
  totalChapters: 0,
  totalWords: 0,
  totalDays: 0
})

// 头像上传相关
const uploadAction = '' // 使用自定义上传逻辑

// 上传前校验
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = rawFile.type.startsWith('image/')
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isImage) {
    message.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }

  // 使用自定义上传
  handleAvatarUpload(rawFile)
  return false // 阻止默认上传
}

// 自定义上传处理
const handleAvatarUpload = async (file: File) => {
  loading.value = true
  try {
    const response = await userAPI.uploadAvatar(file)
    if (response && response.url) {
      // 更新store中的头像
      await userStore.fetchProfile()
      message.success('头像上传成功')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '上传头像失败')
  } finally {
    loading.value = false
  }
}

// 上传成功回调（备用）
const handleAvatarSuccess: UploadProps['onSuccess'] = () => {
  message.success('头像上传成功')
}

// 上传失败回调
const handleAvatarError: UploadProps['onError'] = () => {
  message.error('头像上传失败')
}

// 初始化
onMounted(async () => {
  await loadProfile()
})

// 监听标签页切换，加载相应数据
watch(activeTab, async (newTab) => {
  if (newTab === 'shelf' && shelfBooks.value.length === 0) {
    await loadShelf()
  } else if (newTab === 'history' && readingHistory.value.length === 0) {
    await loadHistory()
  } else if (newTab === 'statistics') {
    await loadStatistics()
  }
})

// 加载用户信息
const loadProfile = async () => {
  loading.value = true
  try {
    await userStore.fetchProfile()
    profileForm.nickname = userStore.profile?.nickname || ''
    profileForm.bio = userStore.profile?.bio || ''
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户信息失败')
  } finally {
    loading.value = false
  }
}

// 数据加载功能
const loadShelf = async () => {
  shelfLoading.value = true
  try {
    const response = await bookshelfAPI.getBookshelf({ page: 1, pageSize: 20 })
    // 处理响应数据
    const data = response.data || response
    const books = data.books || data.data || []

    // 转换为界面需要的格式
    shelfBooks.value = books.map((book: any) => ({
      id: book.id || book.bookId,
      title: book.title,
      author: book.author,
      coverUrl: book.cover || book.coverUrl
    }))
  } catch (error: any) {
    console.error('加载书架失败:', error)
    message.error('加载书架失败')
    shelfBooks.value = []
  } finally {
    shelfLoading.value = false
  }
}

const loadHistory = async () => {
  historyLoading.value = true
  try {
    const response = await bookshelfAPI.getRecentReading(10)
    // 处理响应数据
    const data = response.data || response
    const history = Array.isArray(data) ? data : (data.data || [])

    // 转换为界面需要的格式
    readingHistory.value = history.map((item: any) => ({
      id: item.id || item._id,
      book: {
        title: item.title || item.book?.title,
        coverUrl: item.cover || item.book?.coverUrl
      },
      chapterTitle: item.chapterTitle || item.last_read_chapter || '未知章节',
      progress: (item.progress || 0) * 100 // 转换为百分比
    }))
  } catch (error: any) {
    console.error('加载阅读历史失败:', error)
    message.error('加载阅读历史失败')
    readingHistory.value = []
  } finally {
    historyLoading.value = false
  }
}

// 编辑相关
const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  profileForm.nickname = userStore.profile?.nickname || ''
  profileForm.bio = userStore.profile?.bio || ''
}

const saveProfile = async () => {
  loading.value = true
  try {
    await userStore.updateProfile(profileForm)
    message.success('保存成功')
    isEditing.value = false
  } catch (error: any) {
    message.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 跳转到书籍详情
const goToBook = (bookId: string) => {
  router.push(`/bookstore/books/${bookId}`)
}

// 加载阅读统计
const loadStatistics = async () => {
  statsLoading.value = true
  try {
    // 调用阅读统计API
    // const response = await bookshelfAPI.getReadingStatistics()
    // 临时使用模拟数据
    readingStats.value = {
      totalBooks: 12,
      totalChapters: 256,
      totalWords: 358,
      totalDays: 45
    }
  } catch (error: any) {
    console.error('加载阅读统计失败:', error)
  } finally {
    statsLoading.value = false
  }
}

// 跳转到阅读统计详情页
const goToReadingStatistics = () => {
  router.push('/profile/statistics')
}
</script>

<style scoped lang="scss">
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }
  }
}

.profile-content {
  min-height: 400px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;

  .avatar-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 12px;

    .avatar-uploader {
      position: absolute;
      bottom: 0;
      right: 0;

      .upload-btn {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .avatar-hint {
    font-size: 12px;
    color: #909399;
  }
}

.profile-form {
  max-width: 600px;
  margin: 0 auto;
}

.shelf-content,
.history-content {
  min-height: 300px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.book-card {
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }

  .book-cover {
    width: 100%;
    height: 200px;
    border-radius: 8px;
  }

  .book-info {
    margin-top: 10px;

    h4 {
      margin: 0 0 5px 0;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: #909399;
    }
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;

  .history-cover {
    width: 80px;
    height: 100px;
    flex-shrink: 0;
    border-radius: 4px;
  }

  .history-info {
    flex: 1;

    h4 {
      margin: 0 0 10px 0;
    }

    p {
      margin: 0 0 10px 0;
      color: #606266;
      font-size: 14px;
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

.statistics-content {
  min-height: 300px;
}

.stats-shortcuts {
  margin-bottom: 30px;

  .stat-card {
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-5px);
    }

    .stat-card-content {
      text-align: center;
      padding: 20px;

      h4 {
        margin: 15px 0 10px 0;
        font-size: 18px;
      }

      p {
        margin: 0 0 15px 0;
        color: #909399;
      }
    }
  }
}

.stats-summary {
  margin-top: 30px;

  .stat-item {
    text-align: center;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 10px;
    }

    .stat-label {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
