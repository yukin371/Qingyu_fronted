<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>用户管理</h3>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            添加用户
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="输入用户名搜索"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input
              v-model="searchForm.email"
              placeholder="输入邮箱搜索"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>

          <el-form-item label="角色">
            <el-select
              v-model="searchForm.role"
              placeholder="选择角色"
              clearable
              @clear="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="管理员" value="admin" />
              <el-option label="作者" value="author" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </el-form-item>

          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="选择状态"
              clearable
              @clear="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="正常" value="active" />
              <el-option label="未激活" value="inactive" />
              <el-option label="已封禁" value="banned" />
              <el-option label="已删除" value="deleted" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户列表 -->
      <el-table
        v-loading="userStore.loading"
        :data="userStore.userList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="user_id" label="用户ID" width="220" />

        <el-table-column prop="username" label="用户名" width="150" />

        <el-table-column prop="email" label="邮箱" width="200" />

        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="邮箱验证" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.email_verified" type="success" size="small">
              已验证
            </el-tag>
            <el-tag v-else type="info" size="small">未验证</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="warning"
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="userStore.totalUsers"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 查看/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="120px"
        :disabled="dialogMode === 'view'"
      >
        <el-form-item label="用户ID" v-if="dialogMode !== 'add'">
          <el-input v-model="userForm.user_id" disabled />
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            :disabled="dialogMode !== 'add'"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="userForm.email"
            :disabled="dialogMode !== 'add'"
            placeholder="请输入邮箱"
          />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="作者" value="author" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="未激活" value="inactive" />
            <el-option label="已封禁" value="banned" />
          </el-select>
        </el-form-item>

        <el-form-item label="邮箱验证">
          <el-switch v-model="userForm.email_verified" />
        </el-form-item>

        <el-form-item label="手机验证">
          <el-switch v-model="userForm.phone_verified" />
        </el-form-item>

        <el-form-item label="个人简介">
          <el-input
            v-model="userForm.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
          />
        </el-form-item>

        <el-form-item label="头像URL">
          <el-input v-model="userForm.avatar" placeholder="请输入头像URL" />
        </el-form-item>

        <el-form-item v-if="dialogMode === 'view'" label="创建时间">
          <span>{{ formatDate(userForm.created_at) }}</span>
        </el-form-item>

        <el-form-item v-if="dialogMode === 'view'" label="更新时间">
          <span>{{ formatDate(userForm.updated_at) }}</span>
        </el-form-item>

        <el-form-item v-if="dialogMode === 'view'" label="最后登录">
          <span>{{ formatDate(userForm.last_login_at) }}</span>
        </el-form-item>

        <el-form-item v-if="dialogMode === 'view'" label="登录IP">
          <span>{{ userForm.last_login_ip || '-' }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">
            {{ dialogMode === 'view' ? '关闭' : '取消' }}
          </el-button>
          <el-button
            v-if="dialogMode !== 'view'"
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 状态
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const dialogMode = ref('view') // view / edit / add
const dialogTitle = ref('')
const submitting = ref(false)

// 表单引用
const userFormRef = ref(null)

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  role: '',
  status: ''
})

// 用户表单
const userForm = reactive({
  user_id: '',
  username: '',
  email: '',
  nickname: '',
  phone: '',
  role: 'user',
  status: 'active',
  email_verified: false,
  phone_verified: false,
  bio: '',
  avatar: '',
  created_at: '',
  updated_at: '',
  last_login_at: '',
  last_login_ip: ''
})

// 用户表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在3-50个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 初始化
onMounted(() => {
  loadUserList()
})

// 加载用户列表
const loadUserList = async () => {
  try {
    await userStore.fetchUserList({
      page: currentPage.value,
      page_size: pageSize.value,
      ...searchForm
    })
  } catch (error) {
    message.error('加载用户列表失败')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadUserList()
}

// 重置搜索
const handleReset = () => {
  searchForm.username = ''
  searchForm.email = ''
  searchForm.role = ''
  searchForm.status = ''
  currentPage.value = 1
  loadUserList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pageSize.value = size
  loadUserList()
}

// 页码改变
const handlePageChange = (page) => {
  currentPage.value = page
  loadUserList()
}

// 添加用户
const handleAdd = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '添加用户'
  resetUserForm()
  dialogVisible.value = true
}

// 查看用户
const handleView = async (row) => {
  dialogMode.value = 'view'
  dialogTitle.value = '查看用户'

  try {
    const userData = await userStore.fetchUser(row.user_id)
    Object.assign(userForm, userData)
    dialogVisible.value = true
  } catch (error) {
    message.error('获取用户信息失败')
  }
}

// 编辑用户
const handleEdit = async (row) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑用户'

  try {
    const userData = await userStore.fetchUser(row.user_id)
    Object.assign(userForm, userData)
    dialogVisible.value = true
  } catch (error) {
    message.error('获取用户信息失败')
  }
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await messageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await userStore.deleteUser(row.user_id)
    message.success('删除成功')
    loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      message.error(error.message || '删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  const valid = await userFormRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    if (dialogMode.value === 'add') {
      // 添加用户（暂未实现后端接口）
      message.warning('添加用户功能暂未实现')
    } else if (dialogMode.value === 'edit') {
      // 更新用户
      const updateData = {
        nickname: userForm.nickname,
        phone: userForm.phone,
        role: userForm.role,
        status: userForm.status,
        email_verified: userForm.email_verified,
        phone_verified: userForm.phone_verified,
        bio: userForm.bio,
        avatar: userForm.avatar
      }

      await userStore.updateUser(userForm.user_id, updateData)
      message.success('更新成功')
      dialogVisible.value = false
      loadUserList()
    }
  } catch (error) {
    message.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  resetUserForm()
  userFormRef.value?.clearValidate()
}

// 重置用户表单
const resetUserForm = () => {
  userForm.user_id = ''
  userForm.username = ''
  userForm.email = ''
  userForm.nickname = ''
  userForm.phone = ''
  userForm.role = 'user'
  userForm.status = 'active'
  userForm.email_verified = false
  userForm.phone_verified = false
  userForm.bio = ''
  userForm.avatar = ''
  userForm.created_at = ''
  userForm.updated_at = ''
  userForm.last_login_at = ''
  userForm.last_login_ip = ''
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
.user-management {
  padding: 20px;
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

.search-bar {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .user-management {
    padding: 10px;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>

