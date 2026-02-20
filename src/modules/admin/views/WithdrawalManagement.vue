<template>
  <div class="withdrawal-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">提现审核</h2>
        <p class="page-subtitle">审核用户提现申请，处理资金转账</p>
      </div>
      <el-button @click="loadWithdrawals">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item pending">
        <div class="stat-icon">
          <el-icon :size="20"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">待审核</span>
        </div>
      </div>
      <div class="stat-item approved">
        <div class="stat-icon">
          <el-icon :size="20"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ todayApprovedCount }}</span>
          <span class="stat-label">今日已审核</span>
        </div>
      </div>
      <div class="stat-item amount">
        <div class="stat-icon">
          <el-icon :size="20"><Money /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">¥{{ totalAmount.toLocaleString() }}</span>
          <span class="stat-label">待处理金额</span>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-card">
      <div class="filter-group">
        <span class="filter-label">审核状态</span>
        <el-select popper-class="admin-select-popper" v-model="filters.status" placeholder="全部状态" clearable @change="handleFilterChange">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已批准" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
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
    </div>

    <!-- 提现列表 -->
    <div class="withdrawal-card">
      <el-table
        v-loading="loading"
        :data="withdrawals"
        style="width: 100%"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
      >
        <el-table-column prop="withdrawId" label="提现ID" width="140">
          <template #default="{ row }">
            <span class="id-text">{{ row.withdrawId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="提现金额" width="140">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="提现账户" min-width="200">
          <template #default="{ row }">
            <div class="account-info">
              <el-icon v-if="row.account.includes('支付宝')" :size="16" color="#1677ff"><Wallet /></el-icon>
              <el-icon v-else-if="row.account.includes('银行卡')" :size="16" color="#52c41a"><CreditCard /></el-icon>
              <el-icon v-else :size="16" color="#8c8c8c"><Wallet /></el-icon>
              <span>{{ row.account }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="row.status">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="reviewedAt" label="审核时间" width="170">
          <template #default="{ row }">
            <span v-if="row.reviewedAt">{{ formatDate(row.reviewedAt) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <template v-if="row.status === 'pending'">
                <el-button type="success" size="small" @click="handleApprove(row)">
                  <el-icon><Select /></el-icon>
                  批准
                </el-button>
                <el-button type="danger" size="small" @click="handleReject(row)">
                  <el-icon><CloseBold /></el-icon>
                  拒绝
                </el-button>
              </template>
              <template v-else>
                <el-button size="small" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
              </template>
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
          @current-change="loadWithdrawals"
        />
      </div>
    </div>

    <!-- 审核详情对话框 -->
    <el-dialog v-model="dialogVisible" title="提现详情" width="600px">
      <div v-if="currentItem" class="withdrawal-detail">
        <div class="detail-amount">
          <span class="amount-label">提现金额</span>
          <span class="amount-value">¥{{ currentItem.amount.toFixed(2) }}</span>
        </div>

        <div class="detail-info">
          <div class="info-row">
            <span class="info-label">提现ID</span>
            <span class="info-value">{{ currentItem.withdrawId }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">提现账户</span>
            <span class="info-value">{{ currentItem.account }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">当前状态</span>
            <span class="status-tag" :class="currentItem.status">
              {{ getStatusText(currentItem.status) }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">申请时间</span>
            <span class="info-value">{{ formatDate(currentItem.createdAt) }}</span>
          </div>
          <div v-if="currentItem.reviewedAt" class="info-row">
            <span class="info-label">审核时间</span>
            <span class="info-value">{{ formatDate(currentItem.reviewedAt) }}</span>
          </div>
          <div v-if="currentItem.reason" class="info-row">
            <span class="info-label">拒绝原因</span>
            <span class="info-value reason">{{ currentItem.reason }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentItem?.status === 'pending'"
          type="danger"
          @click="handleReject(currentItem)"
        >
          <el-icon><CloseBold /></el-icon>
          拒绝
        </el-button>
        <el-button
          v-if="currentItem?.status === 'pending'"
          type="success"
          @click="handleApprove(currentItem)"
        >
          <el-icon><Select /></el-icon>
          批准
        </el-button>
      </template>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="5"
            placeholder="请输入拒绝原因，将通知申请用户"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { Refresh, Clock, CircleCheck, Money, Wallet, CreditCard, Select, CloseBold, View } from '@element-plus/icons-vue'
import * as adminAPI from '@/modules/admin/api'
import type { WithdrawRecord } from '@/types/shared'
import { formatDate } from '@/utils/format'

// 筛选器
const filters = reactive({
  status: '',
  dateRange: null as any
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 数据
const loading = ref(false)
const withdrawals = ref<WithdrawRecord[]>([])
const total = ref(0)

// 统计
const pendingCount = computed(() => {
  return withdrawals.value.filter((w) => w.status === 'pending').length
})

const todayApprovedCount = ref(12)

const totalAmount = computed(() => {
  return withdrawals.value
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0)
})

// 对话框
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentItem = ref<WithdrawRecord | null>(null)
const submitting = ref(false)

// 拒绝表单
const rejectForm = reactive({
  reason: ''
})

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

// 加载提现列表
const loadWithdrawals = async () => {
  loading.value = true
  try {
    // 模拟数据
    const mockData: WithdrawRecord[] = [
      {
        withdrawId: 'WD20251021001',
        amount: 500,
        account: '支付宝: user@example.com',
        status: 'pending',
        createdAt: '2025-10-21T10:00:00Z'
      },
      {
        withdrawId: 'WD20251021002',
        amount: 1000,
        account: '银行卡: 6222****1234',
        status: 'pending',
        createdAt: '2025-10-21T09:30:00Z'
      },
      {
        withdrawId: 'WD20251020003',
        amount: 300,
        account: '支付宝: test@example.com',
        status: 'approved',
        createdAt: '2025-10-20T15:00:00Z',
        reviewedAt: '2025-10-20T16:00:00Z'
      }
    ]

    withdrawals.value = mockData
    total.value = mockData.length
  } catch (error) {
    console.error('加载提现列表失败:', error)
    message.error('加载提现列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadWithdrawals()
}

// 查看详情
const handleView = (item: WithdrawRecord) => {
  currentItem.value = item
  dialogVisible.value = true
}

// 批准
const handleApprove = async (item: WithdrawRecord) => {
  try {
    await messageBox.confirm(`确认批准提现 ¥${item.amount.toFixed(2)} 吗？`, '确认批准', {
      confirmButtonText: '确认批准',
      cancelButtonText: '取消',
      type: 'success'
    })

    await adminAPI.reviewWithdraw(item.withdrawId || item.id, {
      status: 'approved'
    })

    message.success('批准成功，请及时处理转账')
    dialogVisible.value = false
    loadWithdrawals()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批准失败:', error)
      message.error('批准失败')
    }
  }
}

// 拒绝
const handleReject = (item: WithdrawRecord) => {
  currentItem.value = item
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    message.warning('请输入拒绝原因')
    return
  }

  if (!currentItem.value) return

  submitting.value = true
  try {
    await adminAPI.reviewWithdraw(currentItem.value.withdrawId, {
      status: 'rejected',
      reason: rejectForm.reason
    })

    message.success('已拒绝该提现申请')
    rejectDialogVisible.value = false
    dialogVisible.value = false
    loadWithdrawals()
  } catch (error) {
    console.error('拒绝失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadWithdrawals()
})
</script>

<style scoped lang="scss">
.withdrawal-management {
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

  &.pending {
    .stat-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .stat-value { color: #f59e0b; }
  }

  &.approved {
    .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .stat-value { color: #10b981; }
  }

  &.amount {
    .stat-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .stat-value { color: #ef4444; }
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

// 提现列表卡片
.withdrawal-card {
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

.amount {
  color: #ef4444;
  font-weight: 600;
  font-size: 15px;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  &.approved {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  &.rejected {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
}

.text-muted {
  color: #9ca3af;
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

// 详情对话框
.withdrawal-detail {
  .detail-amount {
    text-align: center;
    padding: 24px;
    background: linear-gradient(135deg, #fef2f2 0%, #fff 100%);
    border-radius: 12px;
    margin-bottom: 20px;

    .amount-label {
      display: block;
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .amount-value {
      font-size: 32px;
      font-weight: 700;
      color: #ef4444;
    }
  }

  .detail-info {
    .info-row {
      display: flex;
      align-items: flex-start;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        width: 80px;
        font-size: 14px;
        color: #9ca3af;
        flex-shrink: 0;
      }

      .info-value {
        font-size: 14px;
        color: #374151;

        &.reason {
          color: #ef4444;
        }
      }
    }
  }
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

      > .el-select, > .el-date-editor {
        width: 100%;
      }
    }
  }
}
</style>
