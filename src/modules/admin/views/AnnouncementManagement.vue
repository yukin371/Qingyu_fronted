<template>
  <div class="announcement-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">公告管理</h2>
        <p class="page-subtitle">管理系统公告通知，支持定向推送</p>
      </div>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建公告
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item total">
        <div class="stat-icon">
          <el-icon :size="20"><Bell /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总公告数</span>
        </div>
      </div>
      <div class="stat-item active">
        <div class="stat-icon">
          <el-icon :size="20"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.active }}</span>
          <span class="stat-label">已发布</span>
        </div>
      </div>
      <div class="stat-item views">
        <div class="stat-icon">
          <el-icon :size="20"><View /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalViews.toLocaleString() }}</span>
          <span class="stat-label">总查看次数</span>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-card">
      <div class="filter-group">
        <span class="filter-label">公告类型</span>
        <el-select popper-class="admin-select-popper" v-model="filters.type" placeholder="全部类型" clearable @change="handleFilterChange">
          <el-option label="全部" value="" />
          <el-option label="信息" value="info" />
          <el-option label="警告" value="warning" />
          <el-option label="通知" value="notice" />
        </el-select>
      </div>

      <div class="filter-group">
        <span class="filter-label">目标用户</span>
        <el-select popper-class="admin-select-popper" v-model="filters.targetUsers" placeholder="全部用户" clearable @change="handleFilterChange">
          <el-option label="全部" value="" />
          <el-option label="所有用户" value="all" />
          <el-option label="读者" value="reader" />
          <el-option label="作者" value="author" />
          <el-option label="管理员" value="admin" />
        </el-select>
      </div>

      <div class="filter-group">
        <span class="filter-label">状态</span>
        <el-select popper-class="admin-select-popper" v-model="filters.status" placeholder="全部状态" clearable @change="handleFilterChange">
          <el-option label="全部" value="" />
          <el-option label="已启用" value="active" />
          <el-option label="已禁用" value="inactive" />
        </el-select>
      </div>

      <div class="filter-actions">
        <el-button @click="loadAnnouncements">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 公告列表 -->
    <div class="announcement-card">
      <el-table
        v-loading="loading"
        :data="announcements"
        style="width: 100%"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
      >
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="title">{{ row.title }}</span>
              <span class="content-preview">{{ row.content?.substring(0, 50) }}...</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <span class="type-tag" :class="row.type">
              <el-icon v-if="row.type === 'info'" :size="14"><InfoFilled /></el-icon>
              <el-icon v-else-if="row.type === 'warning'" :size="14"><WarningFilled /></el-icon>
              <el-icon v-else :size="14"><Bell /></el-icon>
              {{ getTypeLabel(row.type) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="目标用户" width="100">
          <template #default="{ row }">
            <span class="target-tag">{{ getTargetLabel(row.targetUsers) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <span class="priority-badge" :class="getPriorityClass(row.priority)">
              {{ row.priority }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="handleStatusChange(row)"
              active-color="#10b981"
            />
          </template>
        </el-table-column>

        <el-table-column prop="viewCount" label="查看次数" width="100">
          <template #default="{ row }">
            <span class="view-count">{{ row.viewCount?.toLocaleString() || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="发布时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
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
          @current-change="loadAnnouncements"
        />
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingAnnouncement ? '编辑公告' : '新建公告'"
      width="700px"
    >
      <el-form :model="announcementForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" />
        </el-form-item>

        <el-form-item label="内容" required>
          <el-input
            v-model="announcementForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="类型" required>
          <el-select popper-class="admin-select-popper" v-model="announcementForm.type" style="width: 200px">
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="通知" value="notice" />
          </el-select>
        </el-form-item>

        <el-form-item label="目标用户" required>
          <el-select popper-class="admin-select-popper" v-model="announcementForm.targetUsers" style="width: 200px">
            <el-option label="所有用户" value="all" />
            <el-option label="读者" value="reader" />
            <el-option label="作者" value="author" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-input-number v-model="announcementForm.priority" :min="0" :max="100" style="width: 150px" />
          <span class="form-hint">数字越大优先级越高</span>
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="announcementForm.isActive" />
        </el-form-item>

        <el-form-item label="生效时间">
          <el-date-picker
            v-model="announcementForm.startTime"
            type="datetime"
            placeholder="开始时间"
            style="width: 200px"
          />
          <span class="form-hint">至</span>
          <el-date-picker
            v-model="announcementForm.endTime"
            type="datetime"
            placeholder="结束时间"
            style="width: 200px"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  Plus, Bell, CircleCheck, View, Refresh, InfoFilled, WarningFilled, Edit, Delete
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'

// 检查是否为测试模式
const isTestMode = computed(() => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('test') === 'true'
})

// 筛选器
const filters = reactive({
  type: '',
  targetUsers: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 统计数据
const stats = reactive({
  total: 12,
  active: 8,
  totalViews: 25680
})

// 数据
const loading = ref(false)
const announcements = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const editingAnnouncement = ref<any | null>(null)
const submitting = ref(false)

const announcementForm = reactive({
  title: '',
  content: '',
  type: 'info',
  targetUsers: 'all',
  priority: 0,
  isActive: true,
  startTime: null as any,
  endTime: null as any
})

// 生成模拟公告数据
const createMockAnnouncements = () => {
  const types = ['info', 'warning', 'notice', 'info', 'notice']
  const targets = ['all', 'reader', 'author', 'admin', 'all']
  const titles = [
    { title: '系统维护公告', content: '系统将于本周六凌晨2:00-4:00进行例行维护，届时将暂停服务，请提前做好相关准备。给您带来的不便敬请谅解。' },
    { title: '新功能上线通知', content: '我们新增了书籍推荐功能，系统将根据您的阅读历史为您推荐感兴趣的书籍。' },
    { title: '版权保护提醒', content: '请各位作者注意保护自己的作品版权，如发现侵权行为请及时举报。' },
    { title: '春节放假通知', content: '春节期间平台将安排值班人员，审核工作可能会有延迟，敬请谅解。' },
    { title: '作家福利计划', content: '凡是在本平台发布作品满3万字的作者，均可申请加入作家福利计划，享受更多权益。' },
    { title: '阅读活动开启', content: '春节阅读活动正式开启，完成任务即可获得丰厚奖励，活动时间截至2月底。' },
    { title: '平台规则更新', content: '为营造良好的阅读环境，我们对平台规则进行了部分调整，请查阅详情。' },
    { title: '签约作者招募', content: '本平台现招募签约作者，提供保底稿费和推广资源，详情请查看作家后台。' },
    { title: '提现规则调整', content: '自即日起，提现最低金额调整为50元，到账时间缩短至1-3个工作日。' },
    { title: '新书上架通知', content: '本周有多部热门新作上架，包括玄幻、都市、仙侠等多种类型，欢迎阅读。' },
    { title: '会员权益升级', content: 'VIP会员现可享受更多专属权益，包括提前阅读、无广告、专属客服等。' },
    { title: '评论规范公告', content: '请文明评论，禁止发布违法违规内容，违规者将被封禁账号。' }
  ]

  return titles.map((item, i) => ({
    id: `ann_${i + 1}`,
    title: item.title,
    content: item.content,
    type: types[i % types.length],
    targetUsers: targets[i % targets.length],
    priority: Math.floor(Math.random() * 100),
    isActive: i < 8,
    viewCount: Math.floor(Math.random() * 5000) + 500,
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    startTime: null,
    endTime: null
  }))
}

const mockAnnouncementsPool = createMockAnnouncements()

// 加载公告列表
const loadAnnouncements = async () => {
  loading.value = true
  try {
    if (isTestMode.value) {
      let filtered = [...mockAnnouncementsPool]

      if (filters.type) {
        filtered = filtered.filter(a => a.type === filters.type)
      }

      if (filters.targetUsers) {
        filtered = filtered.filter(a => a.targetUsers === filters.targetUsers)
      }

      if (filters.status) {
        filtered = filtered.filter(a =>
          filters.status === 'active' ? a.isActive : !a.isActive
        )
      }

      total.value = filtered.length

      const start = (pagination.page - 1) * pagination.pageSize
      announcements.value = filtered.slice(start, start + pagination.pageSize)

      // 更新统计
      stats.total = mockAnnouncementsPool.length
      stats.active = mockAnnouncementsPool.filter(a => a.isActive).length
      stats.totalViews = mockAnnouncementsPool.reduce((sum, a) => sum + (a.viewCount || 0), 0)
    } else {
      announcements.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载公告列表失败:', error)
    message.error('加载公告列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadAnnouncements()
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    info: '信息',
    warning: '警告',
    notice: '通知'
  }
  return labels[type] || type
}

const getTargetLabel = (target: string): string => {
  const labels: Record<string, string> = {
    all: '所有用户',
    reader: '读者',
    author: '作者',
    admin: '管理员'
  }
  return labels[target] || target
}

const getPriorityClass = (priority: number): string => {
  if (priority >= 80) return 'high'
  if (priority >= 50) return 'medium'
  return 'low'
}

const handleCreate = () => {
  editingAnnouncement.value = null
  Object.assign(announcementForm, {
    title: '',
    content: '',
    type: 'info',
    targetUsers: 'all',
    priority: 0,
    isActive: true,
    startTime: null,
    endTime: null
  })
  dialogVisible.value = true
}

const handleEdit = (announcement: any) => {
  editingAnnouncement.value = announcement
  Object.assign(announcementForm, {
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    targetUsers: announcement.targetUsers,
    priority: announcement.priority,
    isActive: announcement.isActive,
    startTime: announcement.startTime,
    endTime: announcement.endTime
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!announcementForm.title || !announcementForm.content) {
    message.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    if (isTestMode.value) {
      if (editingAnnouncement.value) {
        const announcement = mockAnnouncementsPool.find(a => a.id === editingAnnouncement.value.id)
        if (announcement) {
          Object.assign(announcement, announcementForm)
        }
        message.success('更新成功')
      } else {
        mockAnnouncementsPool.unshift({
          id: `ann_${Date.now()}`,
          ...announcementForm,
          viewCount: 0,
          createdAt: new Date().toISOString()
        })
        message.success('创建成功')
      }
    }
    dialogVisible.value = false
    loadAnnouncements()
  } catch (error) {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = async (announcement: any) => {
  try {
    if (isTestMode.value) {
      const a = mockAnnouncementsPool.find(item => item.id === announcement.id)
      if (a) a.isActive = announcement.isActive
    }
    message.success(announcement.isActive ? '已启用' : '已禁用')
    loadAnnouncements()
  } catch (error) {
    message.error('状态更新失败')
    announcement.isActive = !announcement.isActive
  }
}

const handleDelete = async (announcement: any) => {
  try {
    await messageBox.confirm('确定要删除此公告吗？', '确认', {
      type: 'warning'
    })

    if (isTestMode.value) {
      const index = mockAnnouncementsPool.findIndex(a => a.id === announcement.id)
      if (index > -1) mockAnnouncementsPool.splice(index, 1)
    }

    message.success('删除成功')
    loadAnnouncements()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('删除失败')
    }
  }
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped lang="scss">
.announcement-management {
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
    .stat-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .stat-value { color: #3b82f6; }
  }

  &.active {
    .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .stat-value { color: #10b981; }
  }

  &.views {
    .stat-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .stat-value { color: #8b5cf6; }
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
  margin-left: auto;
}

// 公告列表卡片
.announcement-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.title-cell {
  display: flex;
  flex-direction: column;

  .title {
    font-weight: 500;
    color: #374151;
  }

  .content-preview {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 300px;
  }
}

.type-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.info {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }

  &.warning {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.notice {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
}

.target-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;

  &.high {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.medium {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.low {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }
}

.view-count {
  font-weight: 500;
  color: #374151;
}

.action-btns {
  display: flex;
  gap: 8px;
}

// 分页
.pagination-card {
  display: flex;
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
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px 10px;
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

.form-hint {
  margin: 0 12px;
  font-size: 12px;
  color: #9ca3af;
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

      > .el-select {
        width: 100%;
      }
    }

    .filter-actions {
      margin-left: 0;
    }
  }
}
</style>
