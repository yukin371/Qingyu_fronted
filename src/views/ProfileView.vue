<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h3>个人中心</h3>
          <el-button
            v-if="!isEditing"
            type="primary"
            :icon="Edit"
            @click="startEdit"
          >
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
            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
              class="profile-form"
              :disabled="!isEditing"
            >
              <el-form-item label="用户名">
                <el-input v-model="userStore.username" disabled />
              </el-form-item>

              <el-form-item label="昵称" prop="nickname">
                <el-input
                  v-model="profileForm.nickname"
                  placeholder="请输入昵称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="邮箱">
                <el-input v-model="userStore.email" disabled>
                  <template #suffix>
                    <el-tag v-if="userStore.isEmailVerified" type="success" size="small">
                      已验证
                    </el-tag>
                    <el-tag v-else type="warning" size="small">未验证</el-tag>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="profileForm.phone"
                  placeholder="请输入手机号"
                  maxlength="20"
                >
                  <template #suffix>
                    <el-tag v-if="userStore.isPhoneVerified" type="success" size="small">
                      已验证
                    </el-tag>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="个人简介" prop="bio">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  placeholder="介绍一下自己吧"
                  :rows="4"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="角色">
                <el-tag :type="getRoleType(userStore.role)">
                  {{ getRoleText(userStore.role) }}
                </el-tag>
              </el-form-item>

              <el-form-item label="账号状态">
                <el-tag :type="getStatusType(userStore.status)">
                  {{ getStatusText(userStore.status) }}
                </el-tag>
              </el-form-item>

              <el-form-item label="注册时间">
                <span>{{ formatDate(userStore.profile?.created_at) }}</span>
              </el-form-item>

              <el-form-item label="最后登录">
                <span>{{ formatDate(userStore.profile?.last_login_at) }}</span>
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
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="100px"
              >
                <el-form-item label="当前密码" prop="old_password">
                  <el-input
                    v-model="passwordForm.old_password"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="新密码" prop="new_password">
                  <el-input
                    v-model="passwordForm.new_password"
                    type="password"
                    placeholder="请输入新密码 (至少6位)"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="确认密码" prop="confirm_password">
                  <el-input
                    v-model="passwordForm.confirm_password"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                  />
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
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

const userStore = useUserStore()
const authStore = useAuthStore()

// 状态
const activeTab = ref('basic')
const isEditing = ref(false)
const loading = ref(false)

// 表单引用
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

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

// 初始化表单数据
const initProfileForm = () => {
  profileForm.nickname = userStore.profile?.nickname || ''
  profileForm.phone = userStore.profile?.phone || ''
  profileForm.bio = userStore.profile?.bio || ''
  profileForm.avatar = userStore.profile?.avatar || ''
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
  const valid = await profileFormRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    // 只发送有值的字段
    const updateData = {}
    if (profileForm.nickname) updateData.nickname = profileForm.nickname
    if (profileForm.phone) updateData.phone = profileForm.phone
    if (profileForm.bio) updateData.bio = profileForm.bio
    if (profileForm.avatar) updateData.avatar = profileForm.avatar

    await userStore.updateProfile(updateData)
    ElMessage.success('保存成功')
    isEditing.value = false
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
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
  } catch (error) {
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

<style scoped>
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
}
</style>

