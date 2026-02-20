<template>
  <div class="operation-logs">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">操作日志</h2>
        <p class="page-subtitle">查看系统操作记录，支持筛选和导出</p>
      </div>
      <div class="header-actions">
        <el-button @click="exportLogs">
          <el-icon><Download /></el-icon>
          导出日志
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item total">
        <div class="stat-icon">
          <el-icon :size="20"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总记录数</span>
        </div>
      </div>
      <div class="stat-item today">
        <div class="stat-icon">
          <el-icon :size="20"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.today }}</span>
          <span class="stat-label">今日操作</span>
        </div>
      </div>
      <div class="stat-item success">
        <div class="stat-icon">
          <el-icon :size="20"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.success }}</span>
          <span class="stat-label">成功操作</span>
        </div>
      </div>
      <div class="stat-item warning">
        <div class="stat-icon">
          <el-icon :size="20"><Warning /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.warning }}</span>
          <span class="stat-label">警告操作</span>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-card">
      <div class="filter-group">
        <span class="filter-label">操作类型</span>
        <el-select popper-class="admin-select-popper" v-model="filters.operation" placeholder="全部类型" clearable @change="handleFilterChange">
          <el-option label="全部" value="" />
          <el-option label="批准内容" value="approve_content" />
          <el-option label="拒绝内容" value="reject_content" />
          <el-option label="批准提现" value="approve_withdraw" />
          <el-option label="拒绝提现" value="reject_withdraw" />
          <el-option label="更新用户" value="update_user" />
          <el-option label="封禁用户" value="ban_user" />
        </el-select>
      </div>

      <div class="filter-group">
        <span class="filter-label">管理员</span>
        <el-input
          v-model="filters.adminId"
          placeholder="管理员ID或名称"
          clearable
          style="width: 160px"
          @keyup.enter="handleFilterChange"
        />
      </div>

      <div class="filter-group">
        <span class="filter-label">日期范围</span>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleFilterChange"
        />
      </div>

      <div class="filter-actions">
        <el-button type="primary" @click="handleFilterChange">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="log-card">
      <el-table
        v-loading="loading"
        :data="logs"
        style="width: 100%"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
      >
        <el-table-column prop="logId" label="日志ID" width="140">
          <template #default="{ row }">
            <span class="id-text">{{ row.logId }}</span>
          </template>
        </el-table-column>

        <el-table-column label="管理员" width="140">
          <template #default="{ row }">
            <div class="admin-info">
              <el-avatar :size="28" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.adminName}`" />
              <div class="admin-meta">
                <span class="admin-name">{{ row.adminName }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作类型" width="130">
          <template #default="{ row }">
            <span class="operation-tag" :class="getOperationClass(row.operation)">
              <el-icon v-if="row.operation.includes('approve')" :size="14"><CircleCheck /></el-icon>
              <el-icon v-else-if="row.operation.includes('reject')" :size="14"><CircleClose /></el-icon>
              <el-icon v-else-if="row.operation.includes('ban')" :size="14"><Lock /></el-icon>
              <el-icon v-else :size="14"><Edit /></el-icon>
              {{ getOperationText(row.operation) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="details" label="操作详情" min-width="220">
          <template #default="{ row }">
            <span class="detail-text">{{ getDetailText(row.details) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="目标" width="160">
          <template #default="{ row }">
            <div class="target-info">
              <span class="target-type">{{ row.targetType }}</span>
              <span class="target-id">{{ row.targetId || row.target }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="操作时间" width="160">
          <template #default="{ row }">
            <span class="time-text">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>
            </el-button>
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
          @current-change="loadLogs"
        />
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="dialogVisible" title="日志详情" width="600px">
      <div v-if="currentItem" class="log-detail">
        <div class="detail-header">
          <el-icon class="detail-icon" :class="getOperationClass(currentItem.operation)">
            <component :is="getOperationIcon(currentItem.operation)" />
          </el-icon>
          <div class="detail-title">
            <h3>{{ getOperationText(currentItem.operation) }}</h3>
            <span>{{ formatDate(currentItem.createdAt) }}</span>
          </div>
        </div>

        <el-descriptions :column="1" border class="detail-descriptions">
          <el-descriptions-item label="日志ID">
            <span class="mono">{{ currentItem.logId }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="操作管理员">
            <div class="admin-info">
              <el-avatar :size="24" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentItem.adminName}`" />
              <span>{{ currentItem.adminName }} ({{ currentItem.adminId }})</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <span class="operation-tag" :class="getOperationClass(currentItem.operation)">
              {{ getOperationText(currentItem.operation) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="目标类型">
            {{ currentItem.targetType || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="目标ID">
            <span class="mono">{{ currentItem.targetId || currentItem.target || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="操作详情">
            {{ getDetailText(currentItem.details) }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址" v-if="currentItem.ip">
            <span class="mono">{{ currentItem.ip }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from '@/design-system/services'
import {
  Download, Document, Clock, CircleCheck, Warning, Search, Refresh,
  CircleClose, Lock, Edit, View
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'

// 检查是否为测试模式
const isTestMode = computed(() => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('test') === 'true'
})

// 筛选器
const filters = reactive({
  operation: '',
  adminId: '',
  dateRange: null as any
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 统计数据
const stats = reactive({
  total: 1256,
  today: 48,
  success: 1198,
  warning: 58
})

// 数据
const loading = ref(false)
const logs = ref<any[]>([])
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const currentItem = ref<any | null>(null)

// 生成模拟日志数据
const createMockLogs = () => {
  const operations = [
    'approve_content', 'reject_content', 'approve_withdraw', 'reject_withdraw',
    'update_user', 'ban_user', 'approve_book', 'delete_comment'
  ]
  const admins = [
    { id: 'admin_001', name: '管理员A' },
    { id: 'admin_002', name: '管理员B' },
    { id: 'admin_003', name: '管理员C' }
  ]
  const targetTypes = ['book', 'chapter', 'user', 'withdrawal', 'comment']

  const detailTemplates: Record<string, string[]> = {
    approve_content: ['批准章节《{target}》发布', '批准书籍《{target}》上架'],
    reject_content: ['拒绝章节审核：内容违规', '拒绝书籍发布：信息不完整'],
    approve_withdraw: ['批准用户提现申请 ¥{amount}', '处理提现请求成功'],
    reject_withdraw: ['拒绝提现申请：账户异常', '拒绝提现：信息不符'],
    update_user: ['更新用户 {target} 信息', '修改用户角色'],
    ban_user: ['封禁用户 {target}', '因违规封禁用户'],
    approve_book: ['批准书籍《{target}》发布', '审核通过书籍上架申请'],
    delete_comment: ['删除违规评论', '清理垃圾评论']
  }

  return Array.from({ length: 80 }, (_, i) => {
    const operation = operations[i % operations.length]
    const admin = admins[i % admins.length]
    const targetType = targetTypes[i % targetTypes.length]
    const detailsList = detailTemplates[operation] || ['执行操作']
    const detailTemplate = detailsList[i % detailsList.length]

    return {
      logId: `log_${String(i + 1).padStart(6, '0')}`,
      adminId: admin.id,
      adminName: admin.name,
      operation,
      targetType,
      targetId: `${targetType}_${String(i + 1).padStart(4, '0')}`,
      target: `${targetType}_${i + 1}`,
      details: {
        message: detailTemplate
          .replace('{target}', `测试${targetType}`)
          .replace('{amount}', String(Math.floor(Math.random() * 1000) + 100))
      },
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      createdAt: new Date(Date.now() - i * 30 * 60 * 1000).toISOString()
    }
  })
}

const mockLogsPool = createMockLogs()

// 加载日志
const loadLogs = async () => {
  loading.value = true
  try {
    if (isTestMode.value) {
      let filtered = [...mockLogsPool]

      if (filters.operation) {
        filtered = filtered.filter(l => l.operation === filters.operation)
      }

      if (filters.adminId) {
        const kw = filters.adminId.toLowerCase()
        filtered = filtered.filter(l =>
          l.adminId.toLowerCase().includes(kw) ||
          l.adminName.toLowerCase().includes(kw)
        )
      }

      if (filters.dateRange && filters.dateRange.length === 2) {
        const start = new Date(filters.dateRange[0]).getTime()
        const end = new Date(filters.dateRange[1]).getTime()
        filtered = filtered.filter(l => {
          const t = new Date(l.createdAt).getTime()
          return t >= start && t <= end
        })
      }

      total.value = filtered.length

      const startIdx = (pagination.page - 1) * pagination.pageSize
      logs.value = filtered.slice(startIdx, startIdx + pagination.pageSize)

      // 更新统计
      stats.total = mockLogsPool.length
      const today = new Date().toDateString()
      stats.today = mockLogsPool.filter(l => new Date(l.createdAt).toDateString() === today).length
      stats.success = mockLogsPool.filter(l => l.operation.includes('approve')).length
      stats.warning = mockLogsPool.filter(l => l.operation.includes('reject') || l.operation.includes('ban')).length
    } else {
      logs.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载日志失败:', error)
    message.error('加载日志失败')
  } finally {
    loading.value = false
  }
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadLogs()
}

// 重置筛选
const handleReset = () => {
  filters.operation = ''
  filters.adminId = ''
  filters.dateRange = null
  pagination.page = 1
  loadLogs()
}

// 查看详情
const handleView = (item: any) => {
  currentItem.value = item
  dialogVisible.value = true
}

// 导出日志
const exportLogs = () => {
  message.success('日志导出功能开发中')
}

// 获取操作类型样式
const getOperationClass = (operation: string): string => {
  if (operation.includes('approve')) return 'success'
  if (operation.includes('reject') || operation.includes('ban')) return 'danger'
  if (operation.includes('update')) return 'warning'
  return 'info'
}

// 获取操作图标
const getOperationIcon = (operation: string): any => {
  if (operation.includes('approve')) return CircleCheck
  if (operation.includes('reject')) return CircleClose
  if (operation.includes('ban')) return Lock
  return Edit
}

// 获取操作文本
const getOperationText = (operation: string): string => {
  const textMap: Record<string, string> = {
    approve_content: '批准内容',
    reject_content: '拒绝内容',
    approve_withdraw: '批准提现',
    reject_withdraw: '拒绝提现',
    approve_book: '批准书籍',
    update_user: '更新用户',
    ban_user: '封禁用户',
    delete_comment: '删除评论'
  }
  return textMap[operation] || operation
}

// 获取详情文本
const getDetailText = (details: any): string => {
  if (typeof details === 'string') return details
  if (details?.message) return details.message
  return '-'
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped lang="scss">
.operation-logs {
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

  .header-actions {
    display: flex;
    gap: 12px;
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

  &.today {
    .stat-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .stat-value { color: #8b5cf6; }
  }

  &.success {
    .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .stat-value { color: #10b981; }
  }

  &.warning {
    .stat-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .stat-value { color: #f59e0b; }
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
    width: 140px;
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

// 日志列表卡片
.log-card {
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

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;

  .admin-meta {
    display: flex;
    flex-direction: column;
  }

  .admin-name {
    font-weight: 500;
    color: #374151;
    font-size: 14px;
  }
}

.operation-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.success {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  &.danger {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.warning {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.info {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
}

.detail-text {
  color: #6b7280;
  font-size: 13px;
}

.target-info {
  display: flex;
  flex-direction: column;

  .target-type {
    font-size: 12px;
    color: #9ca3af;
    text-transform: capitalize;
  }

  .target-id {
    font-family: monospace;
    font-size: 12px;
    color: #374151;
  }
}

.time-text {
  font-size: 13px;
  color: #6b7280;
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

// 日志详情
.log-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding: 20px;
    background: #f9fafb;
    border-radius: 12px;

    .detail-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;

      &.success {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }

      &.danger {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      &.warning {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }

      &.info {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
    }

    .detail-title {
      h3 {
        margin: 0;
        font-size: 18px;
        color: #374151;
      }

      span {
        font-size: 13px;
        color: #9ca3af;
      }
    }
  }

  .detail-descriptions {
    :deep(.el-descriptions__label) {
      width: 100px;
    }
  }
}

.mono {
  font-family: monospace;
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

      > .el-input, > .el-select, > .el-date-editor {
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
