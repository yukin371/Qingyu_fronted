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
                        <el-icon><Picture /></el-icon>
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
                        <el-icon><Picture /></el-icon>
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
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Edit, Picture, Upload } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { userAPI } from '@/modules/user/api'

const router = useRouter()
const userStore = useUserStore()

// 状态
const activeTab = ref('basic')
const isEditing = ref(false)
const loading = ref(false)
const shelfLoading = ref(false)
const historyLoading = ref(false)

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

// 头像上传相关
const uploadAction = '' // 使用自定义上传逻辑

// 上传前校验
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = rawFile.type.startsWith('image/')
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
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
      ElMessage.success('头像上传成功')
    }
  } catch (error: any) {
    console.error('上传头像失败:', error)
    ElMessage.error(error.message || '上传头像失败')
  } finally {
    loading.value = false
  }
}

// 上传成功回调（备用）
const handleAvatarSuccess: UploadProps['onSuccess'] = () => {
  ElMessage.success('头像上传成功')
}

// 上传失败回调
const handleAvatarError: UploadProps['onError'] = () => {
  ElMessage.error('头像上传失败')
}

// 初始化
onMounted(async () => {
  await loadProfile()
})

// 加载用户信息
const loadProfile = async () => {
  loading.value = true
  try {
    await userStore.fetchProfile()
    profileForm.nickname = userStore.profile?.nickname || ''
    profileForm.bio = userStore.profile?.bio || ''
  } catch (error: any) {
    console.error('加载用户信息失败:', error)
    ElMessage.error(error.message || '加载用户信息失败')
  } finally {
    loading.value = false
  }
}

// 数据加载功能（TODO: 后续实现）
// const loadShelf = async () => {
//   shelfLoading.value = true
//   try {
//     // TODO: 调用书架API
//     // const res = await bookshelfAPI.getBooks()
//     // shelfBooks.value = res.data
//     shelfBooks.value = []
//   } catch (error: any) {
//     console.error('加载书架失败:', error)
//     ElMessage.error('加载书架失败')
//   } finally {
//     shelfLoading.value = false
//   }
// }

// const loadHistory = async () => {
//   historyLoading.value = true
//   try {
//     // TODO: 调用阅读历史API
//     // const res = await readingAPI.getHistory()
//     // readingHistory.value = res.data
//     readingHistory.value = []
//   } catch (error: any) {
//     console.error('加载阅读历史失败:', error)
//     ElMessage.error('加载阅读历史失败')
//   } finally {
//     historyLoading.value = false
//   }
// }

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
    ElMessage.success('保存成功')
    isEditing.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 跳转到书籍详情
const goToBook = (bookId: string) => {
  router.push(`/bookstore/books/${bookId}`)
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
</style>
