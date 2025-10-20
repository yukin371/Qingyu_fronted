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
          <div class="profile-content">
            <!-- 头像区域 -->
            <div class="avatar-section">
              <el-avatar :size="120" :src="userStore.avatar">
                {{ userStore.displayName.charAt(0) }}
              </el-avatar>
              <div v-if="isEditing" class="avatar-upload">
                <el-button size="small" :icon="Upload">上传头像</el-button>
                <p class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</p>
              </div>
            </div>

            <!-- 信息表单 -->
            <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="100px"
              class="profile-form" :disabled="!isEditing">
              <el-form-item label="用户名">
                <el-input v-model="userStore.username" disabled />
              </el-form-item>

              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="profileForm.nickname" placeholder="请输入昵称" maxlength="50" show-word-limit />
              </el-form-item>

              <el-form-item label="邮箱">
                <el-input v-model="userStore.email" disabled>
                  <template #suffix>
                    <el-tag type="info" size="small">
                      未验证
                    </el-tag>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号" maxlength="20" />
              </el-form-item>

              <el-form-item label="个人简介" prop="bio">
                <el-input v-model="profileForm.bio" type="textarea" placeholder="介绍一下自己吧" :rows="4" maxlength="500"
                  show-word-limit />
              </el-form-item>

              <el-form-item label="角色">
                <el-tag :type="getRoleType(userStore.role)">
                  {{ getRoleText(userStore.role) }}
                </el-tag>
              </el-form-item>

              <el-form-item label="账号状态">
                <el-tag type="success">
                  正常
                </el-tag>
              </el-form-item>

              <el-form-item label="注册时间">
                <span>{{ formatDate(userStore.profile?.registerTime) }}</span>
              </el-form-item>

              <el-form-item label="最后登录">
                <span>{{ formatDate(userStore.profile?.lastLoginTime) }}</span>
              </el-form-item>

              <el-form-item v-if="isEditing">
                <el-button type="primary" :loading="loading" @click="handleSave">
                  保存修改
                </el-button>
                <el-button @click="cancelEdit">取消</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <div class="security-content">
            <el-card shadow="never" class="security-item">
              <h4>修改密码</h4>
              <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
                <el-form-item label="当前密码" prop="old_password">
                  <el-input v-model="passwordForm.old_password" type="password" placeholder="请输入当前密码" show-password />
                </el-form-item>

                <el-form-item label="新密码" prop="new_password">
                  <el-input v-model="passwordForm.new_password" type="password" placeholder="请输入新密码 (至少6位)"
                    show-password />
                </el-form-item>

                <el-form-item label="确认密码" prop="confirm_password">
                  <el-input v-model="passwordForm.confirm_password" type="password" placeholder="请再次输入新密码"
                    show-password />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" :loading="loading" @click="handleChangePassword">
                    修改密码
                  </el-button>
                  <el-button @click="resetPasswordForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 我的书架 -->
        <el-tab-pane label="我的书架" name="shelf">
          <div v-loading="shelfLoading" class="shelf-content">
            <div v-if="shelfBooks.length > 0" class="books-grid">
              <div v-for="book in shelfBooks" :key="book.id" class="book-card" @click="goToBook(book.id)">
                <el-image :src="book.cover" fit="cover" class="book-cover">
                  <template #error>
                    <div class="image-slot">
                      <el-icon>
                        <Picture />
                      </el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="book-info">
                  <h4 class="book-title">{{ book.title }}</h4>
                  <p class="book-author">{{ book.author }}</p>
                  <div class="book-progress" v-if="book.progress">
                    <el-progress :percentage="book.progress" :stroke-width="6" />
                    <span class="progress-text">已读 {{ book.progress }}%</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="书架空空如也，快去添加书籍吧" />
          </div>
        </el-tab-pane>

        <!-- 阅读历史 -->
        <el-tab-pane label="阅读历史" name="history">
          <div v-loading="historyLoading" class="history-content">
            <div v-if="readingHistory.length > 0" class="history-list">
              <div v-for="item in readingHistory" :key="item.id" class="history-item" @click="continueReading(item)">
                <el-image :src="item.bookCover" fit="cover" class="history-cover">
                  <template #error>
                    <div class="image-slot">
                      <el-icon>
                        <Picture />
                      </el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="history-info">
                  <h4>{{ item.bookTitle }}</h4>
                  <p class="chapter-info">{{ item.chapterTitle }}</p>
                  <p class="read-time">{{ formatDate(item.lastReadAt) }}</p>
                </div>
                <el-button type="primary" text>继续阅读</el-button>
              </div>
            </div>
            <el-empty v-else description="暂无阅读记录" />
          </div>
        </el-tab-pane>

        <!-- 阅读统计 -->
        <el-tab-pane label="阅读统计" name="stats">
          <div v-loading="statsLoading" class="stats-content">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon" color="#409eff">
                      <Reading />
                    </el-icon>
                    <div class="stat-info">
                      <p class="stat-value">{{ readingStats.totalBooks }}</p>
                      <p class="stat-label">阅读书籍</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon" color="#67c23a">
                      <Clock />
                    </el-icon>
                    <div class="stat-info">
                      <p class="stat-value">{{ formatReadingTime(readingStats.totalMinutes) }}</p>
                      <p class="stat-label">阅读时长</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon" color="#e6a23c">
                      <Document />
                    </el-icon>
                    <div class="stat-info">
                      <p class="stat-value">{{ readingStats.totalChapters }}</p>
                      <p class="stat-label">阅读章节</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon" color="#f56c6c">
                      <Star />
                    </el-icon>
                    <div class="stat-info">
                      <p class="stat-value">{{ readingStats.favoriteBooks }}</p>
                      <p class="stat-label">收藏书籍</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit, Upload, Picture, Reading, Clock, Document, Star
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useReaderStore } from '@/stores/reader'
import type { FormInstance } from 'element-plus'
import type { BookBrief } from '@/types/models'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const readerStore = useReaderStore()

// 状态
const activeTab = ref('basic')
const isEditing = ref(false)
const loading = ref(false)
const shelfLoading = ref(false)
const historyLoading = ref(false)
const statsLoading = ref(false)

// 表单引用
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 个人信息表单
const profileForm = reactive({
  nickname: '',
  phone: '',
  bio: '',
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

// 书架数据
interface ShelfBook extends BookBrief {
  progress?: number
}
const shelfBooks = ref<ShelfBook[]>([])

// 阅读历史
interface HistoryItem {
  id: string
  bookId: string
  bookTitle: string
  bookCover: string
  chapterId: string
  chapterTitle: string
  lastReadAt: string
}
const readingHistory = ref<HistoryItem[]>([])

// 阅读统计
interface ReadingStats {
  totalBooks: number
  totalMinutes: number
  totalChapters: number
  favoriteBooks: number
}
const readingStats = ref<ReadingStats>({
  totalBooks: 0,
  totalMinutes: 0,
  totalChapters: 0,
  favoriteBooks: 0
})

// 个人信息验证规则
const profileRules = {
  nickname: [
    { max: 50, message: '昵称长度不能超过50个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^[+]?[\d\s-()]+$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  bio: [
    { max: 500, message: '个人简介长度不能超过500个字符', trigger: 'blur' }
  ]
}

// 密码验证规则
const passwordRules = {
  old_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化
onMounted(async () => {
  await loadProfile()
  // 根据当前标签页加载数据
  if (activeTab.value === 'shelf') {
    await loadShelf()
  } else if (activeTab.value === 'history') {
    await loadHistory()
  } else if (activeTab.value === 'stats') {
    await loadStats()
  }
})

// 加载用户信息
const loadProfile = async () => {
  try {
    await userStore.fetchProfile()
    initProfileForm()
  } catch (error) {
    ElMessage.error('加载用户信息失败')
  }
}

// 加载书架
const loadShelf = async () => {
  shelfLoading.value = true
  try {
    // TODO: 实现获取书架的API
    // 临时使用store中的数据
    shelfBooks.value = readerStore.shelf.map(item => ({
      ...item.book,
      progress: 0 // TODO: 从阅读进度获取
    }))
  } catch (error) {
    console.error('加载书架失败:', error)
  } finally {
    shelfLoading.value = false
  }
}

// 加载阅读历史
const loadHistory = async () => {
  historyLoading.value = true
  try {
    // TODO: 实现获取阅读历史的API
    // 临时使用模拟数据
    readingHistory.value = []
  } catch (error) {
    console.error('加载阅读历史失败:', error)
  } finally {
    historyLoading.value = false
  }
}

// 加载阅读统计
const loadStats = async () => {
  statsLoading.value = true
  try {
    // TODO: 实现获取阅读统计的API
    // 临时使用模拟数据
    readingStats.value = {
      totalBooks: 0,
      totalMinutes: 0,
      totalChapters: 0,
      favoriteBooks: 0
    }
  } catch (error) {
    console.error('加载阅读统计失败:', error)
  } finally {
    statsLoading.value = false
  }
}

// 跳转到书籍详情
const goToBook = (bookId: string) => {
  router.push(`/books/${bookId}`)
}

// 继续阅读
const continueReading = (item: HistoryItem) => {
  router.push(`/reader/${item.chapterId}`)
}

// 格式化阅读时长
const formatReadingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  return `${hours}小时`
}

// 初始化表单数据
const initProfileForm = () => {
  const profile = userStore.profile as any
  profileForm.nickname = profile?.nickname || ''
  profileForm.phone = profile?.phone || ''
  profileForm.bio = profile?.bio || ''
  profileForm.avatar = profile?.avatar || ''
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  initProfileForm()
  profileFormRef.value?.clearValidate()
}

// 保存修改
const handleSave = async () => {
  if (!profileFormRef.value) return
  const valid = await profileFormRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    // 只发送有值的字段
    const updateData: any = {}
    if (profileForm.nickname) updateData.nickname = profileForm.nickname
    if (profileForm.phone) updateData.phone = profileForm.phone
    if (profileForm.bio) updateData.bio = profileForm.bio
    if (profileForm.avatar) updateData.avatar = profileForm.avatar

    await userStore.updateProfile(updateData)
    ElMessage.success('保存成功')
    isEditing.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  const valid = await passwordFormRef.value.validate()
  if (!valid) return

  try {
    await ElMessageBox.confirm('确定要修改密码吗？修改后需要重新登录', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    await userStore.changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    })

    ElMessage.success('密码修改成功，请重新登录')
    resetPasswordForm()

    // 退出登录
    setTimeout(() => {
      authStore.logout()
    }, 1500)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '修改密码失败')
    }
  } finally {
    loading.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.old_password = ''
  passwordForm.new_password = ''
  passwordForm.confirm_password = ''
  passwordFormRef.value?.clearValidate()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 获取角色类型
const getRoleType = (role) => {
  const types = {
    admin: 'danger',
    author: 'warning',
    user: 'info'
  }
  return types[role] || 'info'
}

// 获取角色文本
const getRoleText = (role) => {
  const texts = {
    admin: '管理员',
    author: '作者',
    user: '普通用户'
  }
  return texts[role] || role
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    active: 'success',
    inactive: 'info',
    banned: 'danger',
    deleted: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    active: '正常',
    inactive: '未激活',
    banned: '已封禁',
    deleted: '已删除'
  }
  return texts[status] || status
}
</script>

<style scoped lang="scss">
.profile-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.profile-content {
  padding: 20px 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.avatar-upload {
  margin-top: 16px;
  text-align: center;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.profile-form {
  max-width: 600px;
  margin: 0 auto;
}

.security-content {
  padding: 20px 0;
}

.security-item {
  max-width: 600px;
  margin: 0 auto 20px;
}

.security-item h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
}

// 书架样式
.shelf-content {
  padding: 20px 0;
  min-height: 400px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.book-card {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  .book-cover {
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .book-info {
    .book-title {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .book-author {
      font-size: 12px;
      color: #909399;
      margin: 0 0 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .book-progress {
      .progress-text {
        font-size: 12px;
        color: #606266;
        margin-top: 4px;
        display: block;
      }
    }
  }
}

// 阅读历史样式
.history-content {
  padding: 20px 0;
  min-height: 400px;
}

.history-list {
  .history-item {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #ecf5ff;
    }

    .history-cover {
      width: 60px;
      height: 80px;
      border-radius: 4px;
      flex-shrink: 0;
      margin-right: 16px;
    }

    .history-info {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chapter-info {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: #606266;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .read-time {
        margin: 0;
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

// 统计样式
.stats-content {
  padding: 20px 0;
}

.stat-card {
  margin-bottom: 16px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      font-size: 40px;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        margin: 0 0 4px 0;
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }

      .stat-label {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
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

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .profile-form,
  .security-item {
    max-width: 100%;
  }

  :deep(.el-form-item__label) {
    width: 80px !important;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .history-item {
    flex-direction: column;
    text-align: center;

    .history-cover {
      margin: 0 0 12px 0;
    }
  }
}
</style>
