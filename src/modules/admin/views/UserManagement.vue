<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">用户管理</h2>
        <p class="page-subtitle">管理系统用户，查看和编辑用户信息</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
        <el-button type="success" @click="handleBatchAdd">
          <el-icon><UserFilled /></el-icon>
          批量添加
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item total">
        <div class="stat-icon">
          <el-icon :size="20"><User /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总用户数</span>
        </div>
      </div>
      <div class="stat-item active">
        <div class="stat-icon">
          <el-icon :size="20"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.active }}</span>
          <span class="stat-label">活跃用户</span>
        </div>
      </div>
      <div class="stat-item author">
        <div class="stat-icon">
          <el-icon :size="20"><EditPen /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.authors }}</span>
          <span class="stat-label">作者</span>
        </div>
      </div>
      <div class="stat-item new">
        <div class="stat-icon">
          <el-icon :size="20"><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.newToday }}</span>
          <span class="stat-label">今日新增</span>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-card">
      <div class="filter-group">
        <span class="filter-label">关键词</span>
        <el-input
          v-model="filters.keyword"
          placeholder="用户名/邮箱/手机号"
          clearable
          class="keyword-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="filter-group">
        <span class="filter-label">角色</span>
        <el-select
          popper-class="admin-select-popper"
          v-model="filters.role"
          placeholder="全部角色"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="管理员" value="admin" />
          <el-option label="作者" value="author" />
          <el-option label="读者" value="reader" />
        </el-select>
      </div>

      <div class="filter-group">
        <span class="filter-label">状态</span>
        <el-select
          popper-class="admin-select-popper"
          v-model="filters.status"
          placeholder="全部状态"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="正常" value="active" />
          <el-option label="未激活" value="inactive" />
          <el-option label="已封禁" value="banned" />
        </el-select>
      </div>

      <div class="filter-actions">
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedUsers.length > 0" class="batch-actions-card">
      <div class="batch-info">
        <el-icon color="#3b82f6"><InfoFilled /></el-icon>
        <span
          >已选择 <strong>{{ selectedUsers.length }}</strong> 个用户</span
        >
      </div>
      <div class="batch-btns">
        <el-button type="success" size="small" @click="handleBatchActivate">
          <el-icon><CircleCheck /></el-icon>
          批量激活
        </el-button>
        <el-button type="warning" size="small" @click="handleBatchBan">
          <el-icon><Lock /></el-icon>
          批量封禁
        </el-button>
        <el-button type="danger" size="small" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button size="small" @click="clearSelection"> 取消选择 </el-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-card">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="users"
        style="width: 100%"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />

        <el-table-column prop="userId" label="用户ID" width="140">
          <template #default="{ row }">
            <span class="id-text">{{ row.userId }}</span>
          </template>
        </el-table-column>

        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <div class="user-meta">
                <span class="username">{{ row.username }}</span>
                <span class="email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <span class="role-tag" :class="row.role">
              {{ getRoleText(row.role) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="row.status">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="邮箱验证" width="90">
          <template #default="{ row }">
            <el-icon v-if="row.emailVerified" color="#10b981" :size="18">
              <CircleCheckFilled />
            </el-icon>
            <el-icon v-else color="#9ca3af" :size="18">
              <WarningFilled />
            </el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button size="small" @click="handleView(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button type="warning" size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                v-if="row.status !== 'banned'"
                type="info"
                size="small"
                @click="handleBan(row)"
              >
                <el-icon><Lock /></el-icon>
                封禁
              </el-button>
              <el-button v-else type="success" size="small" @click="handleUnban(row)">
                <el-icon><Unlock /></el-icon>
                解封
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-card">
        <div class="pagination-total">共 {{ total }} 条</div>
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="total"
          layout="prev, pager, next"
          @update:current-page="pagination.page = $event"
          @current-change="loadUsers"
        />
      </div>
    </div>

    <!-- 查看/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      class="admin-modal-card"
      append-to-body
      align-center
      @close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
        :disabled="dialogMode === 'view'"
      >
        <div v-if="dialogMode !== 'add'" class="user-avatar-section">
          <el-avatar :size="80" :src="userForm.avatar">
            {{ userForm.username?.charAt(0)?.toUpperCase() }}
          </el-avatar>
        </div>

        <el-form-item label="用户ID" v-if="dialogMode !== 'add'">
          <el-input v-model="userForm.userId" disabled />
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
          <el-input
            v-model="userForm.nickname"
            :disabled="dialogMode !== 'add'"
            placeholder="新增时可设置昵称，编辑模式暂不支持修改"
          />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select
            popper-class="admin-select-popper"
            v-model="userForm.role"
            placeholder="请选择角色"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="作者" value="author" />
            <el-option label="读者" value="reader" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select
            popper-class="admin-select-popper"
            v-model="userForm.status"
            placeholder="请选择状态"
          >
            <el-option label="正常" value="active" />
            <el-option label="未激活" value="inactive" />
            <el-option label="已封禁" value="banned" />
          </el-select>
        </el-form-item>

        <el-form-item label="邮箱验证">
          <el-switch v-model="userForm.emailVerified" disabled />
          <span class="form-hint">当前由注册/验证流程控制，管理端暂不支持修改</span>
        </el-form-item>

        <el-form-item label="个人简介">
          <el-input
            v-model="userForm.bio"
            type="textarea"
            :rows="3"
            :disabled="dialogMode !== 'add'"
            placeholder="新增时可设置简介，编辑模式暂不支持修改"
          />
        </el-form-item>

        <el-alert
          v-if="dialogMode === 'edit'"
          type="info"
          :closable="false"
          title="当前后端仅支持修改用户角色和状态"
          description="用户名、邮箱、昵称、邮箱验证和个人简介暂不提供管理员编辑接口。"
          show-icon
        />

        <el-form-item v-if="dialogMode === 'view'" label="注册时间">
          <span>{{ formatDate(userForm.createdAt) }}</span>
        </el-form-item>

        <el-form-item v-if="dialogMode === 'view'" label="最后登录">
          <span>{{ formatDate(userForm.lastLoginAt) || '-' }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
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
      </template>
    </el-dialog>

    <!-- 批量添加对话框 -->
    <el-dialog
      v-model="batchAddDialogVisible"
      title="批量添加用户"
      width="500px"
      class="admin-modal-card"
      append-to-body
      align-center
    >
      <el-form :model="batchAddForm" label-width="100px">
        <el-form-item label="添加数量" required>
          <el-input-number v-model="batchAddForm.count" :min="1" :max="100" />
          <span class="form-hint">一次最多添加100个用户</span>
        </el-form-item>
        <el-form-item label="用户名前缀">
          <el-input v-model="batchAddForm.prefix" placeholder="批量用户名前缀" />
        </el-form-item>
        <el-form-item label="默认角色">
          <el-select popper-class="admin-select-popper" v-model="batchAddForm.role">
            <el-option label="管理员" value="admin" />
            <el-option label="作者" value="author" />
            <el-option label="读者" value="reader" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认状态">
          <el-select popper-class="admin-select-popper" v-model="batchAddForm.status">
            <el-option label="正常" value="active" />
            <el-option label="未激活" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="batchAddDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchAdd">
          <el-icon><UserFilled /></el-icon>
          确认添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  Plus,
  User,
  CircleCheck,
  EditPen,
  TrendCharts,
  Search,
  Refresh,
  View,
  Edit,
  Lock,
  Unlock,
  CircleCheckFilled,
  WarningFilled,
  UserFilled,
  InfoFilled,
  Delete,
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import type { FormInstance } from 'element-plus'
import { ElTable } from 'element-plus'
import {
  assignRole,
  batchCreateUsers,
  batchDeleteUsers,
  batchUpdateUserStatus,
  createUser,
  deleteUser as deleteUserAPI,
  getUserCountsByStatus,
  getUserList,
  updateUserStatus,
} from '../api'

const filters = reactive({
  keyword: '',
  role: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
})

const stats = reactive({
  total: 0,
  active: 0,
  authors: 0,
  newToday: 0,
})

const loading = ref(false)
const users = ref<any[]>([])
const total = ref(0)

const tableRef = ref<InstanceType<typeof ElTable> | null>(null)
const selectedUsers = ref<any[]>([])
const batchAddDialogVisible = ref(false)
const batchAddForm = reactive({
  count: 10,
  role: 'reader',
  status: 'active',
  prefix: 'batch_user',
})

const dialogVisible = ref(false)
const dialogMode = ref<'view' | 'edit' | 'add'>('view')
const dialogTitle = ref('')
const submitting = ref(false)
const userFormRef = ref<FormInstance | null>(null)

const userForm = reactive({
  userId: '',
  username: '',
  email: '',
  nickname: '',
  role: 'reader',
  status: 'active',
  emailVerified: false,
  bio: '',
  avatar: '',
  createdAt: '',
  lastLoginAt: '',
})

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在3-50个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const loadStats = async () => {
  try {
    const [statusCounts, authorResponse] = await Promise.all([
      getUserCountsByStatus(),
      getUserList({ page: 1, pageSize: 1, role: 'author' }),
    ])
    stats.active = Number(statusCounts.active || 0)
    stats.authors = Number(authorResponse.total || 0)
    stats.newToday = 0
  } catch (error) {
    console.error('加载用户统计失败:', error)
    stats.active = 0
    stats.authors = 0
    stats.newToday = 0
  }
}

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
    })

    users.value = response.users.map((item: any) => ({
      userId: item.id,
      username: item.username,
      email: item.email || '',
      nickname: item.nickname || item.username,
      role: item.roles && item.roles.length > 0 ? item.roles[0] : 'reader',
      status: item.status,
      emailVerified: item.emailVerified || false,
      avatar: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`,
      bio: item.bio || '',
      createdAt: item.createdAt || new Date().toISOString(),
      lastLoginAt: item.lastLoginAt || '',
    }))
    total.value = response.total
    stats.total = response.total
    await loadStats()
  } catch (error) {
    console.error('加载用户列表失败:', error)
    users.value = []
    total.value = 0
    stats.total = 0
    stats.active = 0
    stats.authors = 0
    stats.newToday = 0
    message.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  void loadUsers()
}

const handleFilterChange = () => {
  pagination.page = 1
  void loadUsers()
}

const handleReset = () => {
  filters.keyword = ''
  filters.role = ''
  filters.status = ''
  pagination.page = 1
  void loadUsers()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '添加用户'
  resetUserForm()
  dialogVisible.value = true
}

const handleBatchAdd = () => {
  batchAddForm.count = 10
  batchAddForm.role = 'reader'
  batchAddForm.status = 'active'
  batchAddForm.prefix = 'batch_user'
  batchAddDialogVisible.value = true
}

const confirmBatchAdd = async () => {
  if (batchAddForm.count < 1 || batchAddForm.count > 100) {
    message.warning('批量添加数量应在1-100之间')
    return
  }

  try {
    await batchCreateUsers({
      count: batchAddForm.count,
      prefix: batchAddForm.prefix || undefined,
      role: batchAddForm.role,
      status: batchAddForm.status,
    })
    message.success(`成功批量添加 ${batchAddForm.count} 个用户`)
    batchAddDialogVisible.value = false
    void loadUsers()
  } catch (error) {
    console.error('批量添加失败:', error)
    message.error('批量添加失败')
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const handleBatchActivate = async () => {
  try {
    await messageBox.confirm(
      `确定要激活选中的 ${selectedUsers.value.length} 个用户吗？`,
      '批量激活',
      { type: 'info' },
    )

    await batchUpdateUserStatus({
      userIds: selectedUsers.value.map((user) => user.userId),
      status: 'active',
    })

    message.success('批量激活成功')
    clearSelection()
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('操作失败')
    }
  }
}

const handleBatchBan = async () => {
  try {
    await messageBox.confirm(
      `确定要封禁选中的 ${selectedUsers.value.length} 个用户吗？`,
      '批量封禁',
      { type: 'warning' },
    )

    await batchUpdateUserStatus({
      userIds: selectedUsers.value.map((user) => user.userId),
      status: 'banned',
    })

    message.success('批量封禁成功')
    clearSelection()
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('操作失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await messageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复！`,
      '批量删除',
      { type: 'error', confirmButtonText: '确认删除' },
    )

    await batchDeleteUsers({
      userIds: selectedUsers.value.map((user) => user.userId),
    })

    message.success('批量删除成功')
    clearSelection()
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('操作失败')
    }
  }
}

const handleView = (row: any) => {
  dialogMode.value = 'view'
  dialogTitle.value = '查看用户'
  Object.assign(userForm, row)
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑用户'
  Object.assign(userForm, row)
  dialogVisible.value = true
}

const handleBan = async (row: any) => {
  try {
    await messageBox.confirm(`确定要封禁用户 "${row.nickname || row.username}" 吗？`, '确认封禁', {
      type: 'warning',
    })

    await updateUserStatus(row.userId, { status: 'banned' })
    message.success('封禁成功')
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('封禁失败:', error)
      message.error('封禁失败')
    }
  }
}

const handleUnban = async (row: any) => {
  try {
    await messageBox.confirm(`确定要解封用户 "${row.nickname || row.username}" 吗？`, '确认解封', {
      type: 'info',
    })

    await updateUserStatus(row.userId, { status: 'active' })
    message.success('解封成功')
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('解封失败:', error)
      message.error('解封失败')
    }
  }
}

const handleDelete = async (row: any) => {
  try {
    await messageBox.confirm(
      `确定要删除用户 "${row.nickname || row.username}" 吗？此操作不可恢复！`,
      '确认删除',
      { type: 'error', confirmButtonText: '确认删除' },
    )

    await deleteUserAPI(row.userId)
    message.success('删除成功')
    void loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  const valid = await userFormRef.value?.validate()
  if (!valid) return

  submitting.value = true
  try {
    if (dialogMode.value === 'add') {
      await createUser({
        username: userForm.username,
        email: userForm.email,
        nickname: userForm.nickname || undefined,
        role: userForm.role,
        status: userForm.status,
        bio: userForm.bio || undefined,
      })
    } else if (dialogMode.value === 'edit') {
      await updateUserStatus(userForm.userId, { status: userForm.status })
      await assignRole(userForm.userId, { role: userForm.role })
    }

    message.success(dialogMode.value === 'add' ? '添加成功' : '更新成功')
    dialogVisible.value = false
    void loadUsers()
  } catch (error) {
    console.error('操作失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  resetUserForm()
  userFormRef.value?.clearValidate()
}

const resetUserForm = () => {
  userForm.userId = ''
  userForm.username = ''
  userForm.email = ''
  userForm.nickname = ''
  userForm.role = 'reader'
  userForm.status = 'active'
  userForm.emailVerified = false
  userForm.bio = ''
  userForm.avatar = ''
  userForm.createdAt = ''
  userForm.lastLoginAt = ''
}

const getRoleText = (role: string): string => {
  const texts: Record<string, string> = {
    admin: '管理员',
    author: '作者',
    reader: '读者',
  }
  return texts[role] || role
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    active: '正常',
    inactive: '未激活',
    banned: '已封禁',
  }
  return texts[status] || status
}

onMounted(() => {
  void loadUsers()
})
</script>

<style scoped lang="scss">
.user-management {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  .header-info {
    .page-title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .page-subtitle {
      margin: 8px 0 0;
      color: #6b7280;
      font-size: 14px;
    }
  }
}

// 统计卡片
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  border: 1px solid #e5e7eb;

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .stat-label {
    font-size: 13px;
    color: #6b7280;
  }

  &.total {
    .stat-icon {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    .stat-value {
      color: #3b82f6;
    }
  }

  &.active {
    .stat-icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .stat-value {
      color: #10b981;
    }
  }

  &.author {
    .stat-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    .stat-value {
      color: #f59e0b;
    }
  }

  &.new {
    .stat-icon {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }
    .stat-value {
      color: #8b5cf6;
    }
  }
}

// 筛选器
.filters-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;

  > .keyword-input {
    width: 300px;
  }

  :deep(.keyword-input .el-input__wrapper) {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
  }

  :deep(.keyword-input .el-input__inner) {
    height: 100%;
    line-height: 36px;
  }

  :deep(.keyword-input .el-input__prefix),
  :deep(.keyword-input .el-input__prefix-inner) {
    height: 100%;
    display: inline-flex;
    align-items: center;
  }

  .filter-label {
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
  }

  > .el-select {
    width: 130px;
  }

  :deep(.el-select__wrapper) {
    display: flex;
    align-items: center;
    height: 36px;
    min-height: 36px;
    position: relative;
    padding: 0 30px 0 12px;
    box-sizing: border-box;
  }

  :deep(.el-select__selection) {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    min-width: 0;
  }

  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :deep(.el-select__placeholder) {
    flex: 0 0 auto;
    width: auto !important;
    max-width: none !important;
    overflow: visible;
    text-overflow: clip;
  }

  :deep(.el-select__suffix) {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.el-select__caret) {
    margin-left: 0;
  }
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

// 批量操作栏
.batch-actions-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #bfdbfe;

  .batch-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #3b82f6;

    strong {
      color: #2563eb;
    }
  }

  .batch-btns {
    display: flex;
    gap: 8px;
  }
}

// 批量添加表单提示
.form-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.header-actions {
  display: flex;
  gap: 10px;
}

// 用户列表卡片
.user-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.id-text {
  font-family: monospace;
  font-size: 13px;
  color: #6b7280;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .el-avatar {
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    min-height: 40px !important;
    max-width: 40px !important;
    max-height: 40px !important;
    border-radius: 50% !important;
    overflow: hidden !important;
    flex-shrink: 0 !important;
    flex-grow: 0 !important;
    font-size: 16px !important;
    line-height: 40px !important;
  }

  .el-avatar img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
  }

  .user-meta {
    display: flex;
    flex-direction: column;

    .username {
      font-weight: 500;
      color: #374151;
    }

    .email {
      font-size: 12px;
      color: #9ca3af;
    }
  }
}

.role-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.admin {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.author {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.reader {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.active {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  &.inactive {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }

  &.banned {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
}

.action-btns {
  display: flex;
  gap: 8px;
}

// 分页
.pagination-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;

  .pagination-total {
    font-size: 14px;
    color: #64748b;
    white-space: nowrap;
  }

  :deep(.el-pagination) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    gap: 8px;
    font-size: 14px;
    color: #475569;
  }

  :deep(.el-pagination__total),
  :deep(.el-pagination__sizes),
  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.el-pager),
  :deep(.el-pagination__jump) {
    margin: 0 !important;
    display: inline-flex;
    align-items: center;
  }

  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.el-pager li) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
  }

  :deep(.el-pager li.is-active) {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: transparent;
    color: #fff;
    font-weight: 500;
  }

  :deep(.el-pagination__sizes .el-select) {
    width: 100px;
  }
}

// 对话框用户头像
.user-avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }

  .filters-card {
    flex-direction: column;
    align-items: stretch;

    .filter-group {
      flex-direction: column;
      align-items: stretch;

      > .el-input,
      > .el-select,
      > .keyword-input {
        width: 100%;
      }
    }

    .filter-actions {
      margin-left: 0;
      justify-content: flex-end;
    }
  }
}
</style>
