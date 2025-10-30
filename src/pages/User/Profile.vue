<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- 用户信息卡片 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center space-x-6 mb-6">
          <!-- 头像 -->
          <div class="relative">
            <el-avatar :size="100" :src="formData.avatar" :icon="UserFilled" />
            <el-button
              circle
              size="small"
              :icon="Camera"
              class="absolute bottom-0 right-0"
              @click="handleUploadAvatar"
            />
          </div>

          <!-- 基本信息 -->
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              {{ userStore.userInfo?.username }}
            </h2>
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <el-tag :type="getRoleType(userStore.userInfo?.role)">
                {{ getRoleText(userStore.userInfo?.role) }}
              </el-tag>
              <span>加入时间：{{ formatDate(userStore.userInfo?.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div v-if="userStore.userInfo?.stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">
              {{ userStore.userInfo?.stats?.booksCount || 0 }}
            </div>
            <div class="text-sm text-gray-600 mt-1">作品数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">
              {{ formatCount(userStore.userInfo?.stats?.wordsCount || 0) }}
            </div>
            <div class="text-sm text-gray-600 mt-1">总字数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">
              {{ userStore.userInfo?.stats?.followersCount || 0 }}
            </div>
            <div class="text-sm text-gray-600 mt-1">粉丝</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">
              {{ userStore.userInfo?.stats?.collectCount || 0 }}
            </div>
            <div class="text-sm text-gray-600 mt-1">收藏</div>
          </div>
        </div>
      </div>

      <!-- 编辑表单 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-xl font-bold mb-6">个人资料</h3>

        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="用户名">
            <el-input v-model="formData.username" disabled />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input v-model="formData.email" disabled />
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input
              v-model="formData.nickname"
              placeholder="请输入昵称"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="性别">
            <el-radio-group v-model="formData.gender">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
              <el-radio value="other">保密</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="生日">
            <el-date-picker
              v-model="formData.birthday"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item label="所在地">
            <el-input
              v-model="formData.location"
              placeholder="请输入所在地"
              maxlength="50"
            />
          </el-form-item>

          <el-form-item label="个人简介">
            <el-input
              v-model="formData.bio"
              type="textarea"
              :rows="4"
              placeholder="介绍一下自己吧"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="isSaving"
              @click="handleSave"
            >
              保存修改
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 修改密码 -->
        <el-divider />

        <h3 class="text-xl font-bold mb-6">修改密码</h3>

        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="100px"
        >
          <el-form-item label="原密码" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（至少6位）"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="isChangingPassword"
              @click="handleChangePassword"
            >
              修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { UserFilled, Camera } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { updateUserProfile, changePassword } from '@/api/user/profile'
import type { UpdateProfileRequest } from '@/types/user'
import Header from '@/components/Layout/Header.vue'

const userStore = useUserStore()

const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const isSaving = ref(false)
const isChangingPassword = ref(false)

const formData = reactive<UpdateProfileRequest & { username: string; email: string; avatar?: string }>({
  username: '',
  email: '',
  nickname: '',
  avatar: '',
  bio: '',
  gender: 'other',
  birthday: '',
  location: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const rules: FormRules = {
  nickname: [
    { max: 20, message: '昵称最多20个字符', trigger: 'blur' },
  ],
}

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

// 初始化
onMounted(async () => {
  if (!userStore.userInfo) {
    await userStore.fetchUserInfo()
  }

  if (userStore.userInfo) {
    Object.assign(formData, {
      username: userStore.userInfo.username,
      email: userStore.userInfo.email,
      nickname: userStore.userInfo.nickname,
      avatar: userStore.userInfo.avatar,
      bio: userStore.userInfo.bio,
      gender: userStore.userInfo.gender || 'other',
      birthday: userStore.userInfo.birthday,
      location: userStore.userInfo.location,
    })
  }
})

// 上传头像
function handleUploadAvatar() {
  ElMessage.info('头像上传功能开发中...')
  // TODO: 实现头像上传功能
}

// 保存修改
async function handleSave() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    isSaving.value = true

    const { username, email, avatar, ...updateData } = formData
    const response = await updateUserProfile(updateData)

    userStore.updateUserInfo(response)
    ElMessage.success('保存成功')
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    isSaving.value = false
  }
}

// 重置
function handleReset() {
  if (userStore.userInfo) {
    Object.assign(formData, {
      nickname: userStore.userInfo.nickname,
      bio: userStore.userInfo.bio,
      gender: userStore.userInfo.gender || 'other',
      birthday: userStore.userInfo.birthday,
      location: userStore.userInfo.location,
    })
  }
}

// 修改密码
async function handleChangePassword() {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    isChangingPassword.value = true

    await changePassword(passwordForm.oldPassword, passwordForm.newPassword)

    ElMessage.success('密码修改成功，请重新登录')

    // 清空表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordFormRef.value.resetFields()

    // 3秒后登出
    setTimeout(() => {
      userStore.handleLogout()
    }, 3000)
  } catch (error: any) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.message || '修改密码失败')
  } finally {
    isChangingPassword.value = false
  }
}

// 获取角色类型
function getRoleType(role?: string) {
  const typeMap: Record<string, any> = {
    admin: 'danger',
    writer: 'warning',
    user: 'info',
  }
  return typeMap[role || 'user']
}

// 获取角色文本
function getRoleText(role?: string) {
  const textMap: Record<string, string> = {
    admin: '管理员',
    writer: '作者',
    user: '读者',
  }
  return textMap[role || 'user']
}

// 格式化日期
function formatDate(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化数字
function formatCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }
  return count.toString()
}
</script>




