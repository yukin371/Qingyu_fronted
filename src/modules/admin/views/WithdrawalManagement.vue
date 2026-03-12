<template>
  <div class="withdrawal-management">
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">提现审核</h2>
        <p class="page-subtitle">集中处理钱包提现和作者收益提现申请</p>
      </div>
      <el-button @click="reloadAll">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <div class="stats-row">
      <div class="stat-item pending">
        <div class="stat-icon">
          <el-icon :size="20"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pending_count }}</span>
          <span class="stat-label">待审核</span>
        </div>
      </div>
      <div class="stat-item approved">
        <div class="stat-icon">
          <el-icon :size="20"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.approved_today_count }}</span>
          <span class="stat-label">今日已审核</span>
        </div>
      </div>
      <div class="stat-item amount">
        <div class="stat-icon">
          <el-icon :size="20"><Money /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">¥{{ formatCurrency(stats.pending_amount) }}</span>
          <span class="stat-label">待处理金额</span>
        </div>
      </div>
      <div class="stat-item total">
        <div class="stat-icon">
          <el-icon :size="20"><List /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total_count }}</span>
          <span class="stat-label">总申请数</span>
        </div>
      </div>
    </div>

    <div class="filters-card">
      <div class="filter-group">
        <span class="filter-label">来源</span>
        <el-select
          v-model="filters.source"
          name="withdrawSource"
          placeholder="全部来源"
          clearable
          popper-class="admin-select-popper"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="钱包提现" value="wallet" />
          <el-option label="作者收益" value="author" />
        </el-select>
      </div>

      <div class="filter-group">
        <span class="filter-label">状态</span>
        <el-select
          v-model="filters.status"
          name="withdrawStatus"
          placeholder="全部状态"
          clearable
          popper-class="admin-select-popper"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已批准" value="approved" />
          <el-option label="已拒绝" value="rejected" />
          <el-option label="已处理" value="processed" />
        </el-select>
      </div>

      <div class="filter-group">
        <span class="filter-label">日期范围</span>
        <el-date-picker
          v-model="filters.dateRange"
          name="withdrawDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="handleFilterChange"
        />
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

    <div class="withdrawal-card">
      <el-table
        v-loading="loading"
        :data="withdrawals"
        style="width: 100%"
        :header-cell-style="{ background: '#f9fafb', color: '#374151', fontWeight: '600' }"
      >
        <el-table-column label="申请人" min-width="190">
          <template #default="{ row }">
            <div class="user-meta">
              <span class="display-name">{{
                row.display_name || row.username || row.user_id
              }}</span>
              <span class="sub-line">{{ row.email || row.user_id }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="来源" width="110">
          <template #default="{ row }">
            <span class="source-tag" :class="row.source">
              {{ getSourceText(row.source) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="提现金额" width="120">
          <template #default="{ row }">
            <div class="amount-block">
              <span class="amount-main">¥{{ formatCurrency(row.amount) }}</span>
              <span class="amount-sub">到账 ¥{{ formatCurrency(row.actual_amount) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="收款信息" min-width="230">
          <template #default="{ row }">
            <div class="account-block">
              <span class="account-name">{{ row.account_name || row.account || '-' }}</span>
              <span class="sub-line">
                {{
                  [row.account_type, row.method, row.bank_name].filter(Boolean).join(' / ') || '-'
                }}
              </span>
              <span class="sub-line">{{ row.account || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="row.status">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="审核信息" min-width="180">
          <template #default="{ row }">
            <div class="review-meta">
              <span>{{ row.reviewed_by || '-' }}</span>
              <span class="sub-line">{{
                row.reviewed_at ? formatDate(row.reviewed_at) : '-'
              }}</span>
              <span v-if="row.reject_reason" class="reject-text">{{ row.reject_reason }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button size="small" @click="openDetail(row)">查看</el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="success"
                size="small"
                :loading="submittingId === row.id && submittingAction === 'approve'"
                @click="handleApprove(row)"
              >
                通过
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="danger"
                size="small"
                @click="openRejectDialog(row)"
              >
                拒绝
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && withdrawals.length === 0"
        description="当前筛选条件下没有提现申请"
        class="withdrawal-empty"
      />

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

    <el-dialog
      v-model="detailDialogVisible"
      title="提现申请详情"
      width="720px"
      class="admin-modal-card"
      append-to-body
      align-center
    >
      <div v-if="currentWithdrawal" class="detail-panel">
        <div class="detail-top">
          <span class="source-tag" :class="currentWithdrawal.source">
            {{ getSourceText(currentWithdrawal.source) }}
          </span>
          <span class="status-tag" :class="currentWithdrawal.status">
            {{ getStatusText(currentWithdrawal.status) }}
          </span>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">申请人</span>
            <span class="detail-value">
              {{
                currentWithdrawal.display_name ||
                currentWithdrawal.username ||
                currentWithdrawal.user_id
              }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">用户ID</span>
            <span class="detail-value code">{{ currentWithdrawal.user_id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">提现金额</span>
            <span class="detail-value">¥{{ formatCurrency(currentWithdrawal.amount) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">实际到账</span>
            <span class="detail-value">¥{{ formatCurrency(currentWithdrawal.actual_amount) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">手续费</span>
            <span class="detail-value">¥{{ formatCurrency(currentWithdrawal.fee) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">申请时间</span>
            <span class="detail-value">{{ formatDate(currentWithdrawal.created_at) }}</span>
          </div>
          <div class="detail-item detail-item-full">
            <span class="detail-label">收款信息</span>
            <span class="detail-value">
              {{ currentWithdrawal.account_name || '-' }} /
              {{ currentWithdrawal.account_type || currentWithdrawal.method || '-' }} /
              {{ currentWithdrawal.account || '-' }}
            </span>
          </div>
          <div v-if="currentWithdrawal.bank_name" class="detail-item detail-item-full">
            <span class="detail-label">银行</span>
            <span class="detail-value">{{ currentWithdrawal.bank_name }}</span>
          </div>
          <div class="detail-item detail-item-full">
            <span class="detail-label">审核信息</span>
            <span class="detail-value">
              {{ currentWithdrawal.reviewed_by || '-' }}
              <template v-if="currentWithdrawal.reviewed_at">
                / {{ formatDate(currentWithdrawal.reviewed_at) }}
              </template>
            </span>
          </div>
          <div v-if="currentWithdrawal.reject_reason" class="detail-item detail-item-full">
            <span class="detail-label">拒绝原因</span>
            <span class="detail-value reject-text">{{ currentWithdrawal.reject_reason }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentWithdrawal?.status === 'pending'"
          type="danger"
          @click="openRejectDialog(currentWithdrawal)"
        >
          拒绝
        </el-button>
        <el-button
          v-if="currentWithdrawal?.status === 'pending'"
          type="success"
          :loading="submittingId === currentWithdrawal?.id && submittingAction === 'approve'"
          @click="handleApprove(currentWithdrawal)"
        >
          通过
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝提现申请"
      width="520px"
      class="admin-modal-card"
      append-to-body
      align-center
    >
      <el-form :model="rejectForm" label-width="84px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reason"
            id="withdraw-reject-reason"
            name="withdrawRejectReason"
            type="textarea"
            :rows="5"
            maxlength="200"
            show-word-limit
            placeholder="请输入拒绝原因，系统将记录到提现申请"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          :loading="submittingId === currentWithdrawal?.id && submittingAction === 'reject'"
          @click="confirmReject"
        >
          确认拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { formatDate } from '@/utils/format'
import { Refresh, Clock, CircleCheck, Money, List, Search } from '@element-plus/icons-vue'
import {
  getWithdrawalList,
  getWithdrawalStats,
  handleWithdrawal,
  type AdminWithdrawalItem,
  type AdminWithdrawalStats,
} from '../api'

type DateRange = [string, string] | []

const filters = reactive({
  source: '',
  status: '',
  dateRange: [] as DateRange,
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
})

const loading = ref(false)
const withdrawals = ref<AdminWithdrawalItem[]>([])
const total = ref(0)
const stats = reactive<AdminWithdrawalStats>({
  total_count: 0,
  pending_count: 0,
  approved_count: 0,
  rejected_count: 0,
  approved_today_count: 0,
  pending_amount: 0,
  approved_amount: 0,
})

const detailDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentWithdrawal = ref<AdminWithdrawalItem | null>(null)
const rejectForm = reactive({
  reason: '',
})
const submittingId = ref('')
const submittingAction = ref<'approve' | 'reject' | ''>('')

const getQueryParams = () => {
  const [startDate, endDate] = filters.dateRange
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    source: filters.source || undefined,
    status: filters.status || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  }
}

const loadStats = async () => {
  try {
    const [startDate, endDate] = filters.dateRange
    const response = await getWithdrawalStats({
      source: filters.source || undefined,
      status: filters.status || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    })
    Object.assign(stats, response)
  } catch (error) {
    console.error('加载提现统计失败:', error)
    Object.assign(stats, {
      total_count: 0,
      pending_count: 0,
      approved_count: 0,
      rejected_count: 0,
      approved_today_count: 0,
      pending_amount: 0,
      approved_amount: 0,
    })
  }
}

const loadWithdrawals = async () => {
  loading.value = true
  try {
    const response = await getWithdrawalList(getQueryParams())
    withdrawals.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('加载提现列表失败:', error)
    withdrawals.value = []
    total.value = 0
    message.error('加载提现列表失败')
  } finally {
    loading.value = false
  }
}

const reloadAll = async () => {
  await Promise.all([loadStats(), loadWithdrawals()])
}

const handleSearch = () => {
  pagination.page = 1
  void reloadAll()
}

const handleFilterChange = () => {
  pagination.page = 1
  void reloadAll()
}

const handleReset = () => {
  filters.source = ''
  filters.status = ''
  filters.dateRange = []
  pagination.page = 1
  void reloadAll()
}

const openDetail = (row: AdminWithdrawalItem) => {
  currentWithdrawal.value = row
  detailDialogVisible.value = true
}

const openRejectDialog = (row: AdminWithdrawalItem) => {
  currentWithdrawal.value = row
  rejectForm.reason = row.reject_reason || ''
  rejectDialogVisible.value = true
}

const handleApprove = async (row: AdminWithdrawalItem) => {
  try {
    await messageBox.confirm('确认通过该提现申请吗？', '审核提现', {
      type: 'warning',
      confirmButtonText: '确认通过',
    })

    submittingId.value = row.id
    submittingAction.value = 'approve'
    await handleWithdrawal({
      withdraw_id: row.id,
      approved: true,
    })
    message.success('提现申请已通过')
    detailDialogVisible.value = false
    await reloadAll()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('通过提现失败:', error)
      message.error('通过提现失败')
    }
  } finally {
    submittingId.value = ''
    submittingAction.value = ''
  }
}

const confirmReject = async () => {
  if (!currentWithdrawal.value) return
  if (!rejectForm.reason.trim()) {
    message.warning('请输入拒绝原因')
    return
  }

  try {
    submittingId.value = currentWithdrawal.value.id
    submittingAction.value = 'reject'
    await handleWithdrawal({
      withdraw_id: currentWithdrawal.value.id,
      approved: false,
      reason: rejectForm.reason.trim(),
    })
    message.success('提现申请已拒绝')
    rejectDialogVisible.value = false
    detailDialogVisible.value = false
    await reloadAll()
  } catch (error) {
    console.error('拒绝提现失败:', error)
    message.error('拒绝提现失败')
  } finally {
    submittingId.value = ''
    submittingAction.value = ''
  }
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
    processed: '已处理',
    failed: '失败',
  }
  return map[status] || status
}

const getSourceText = (source: string) => {
  const map: Record<string, string> = {
    wallet: '钱包提现',
    author: '作者收益',
  }
  return map[source] || source
}

const formatCurrency = (value?: number) => Number(value ?? 0).toFixed(2)

onMounted(() => {
  void reloadAll()
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
    .stat-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    .stat-value {
      color: #f59e0b;
    }
  }

  &.approved {
    .stat-icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .stat-value {
      color: #10b981;
    }
  }

  &.amount {
    .stat-icon {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    .stat-value {
      color: #3b82f6;
    }
  }

  &.total {
    .stat-icon {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
    }
    .stat-value {
      color: #6366f1;
    }
  }
}

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

  :deep(.el-date-editor) {
    width: 280px;
  }
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.withdrawal-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.withdrawal-empty {
  padding: 48px 0 12px;
}

.user-meta,
.account-block,
.review-meta,
.amount-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.display-name,
.account-name,
.amount-main {
  font-weight: 600;
  color: #1f2937;
}

.sub-line,
.amount-sub {
  font-size: 12px;
  color: #94a3b8;
}

.reject-text {
  color: #dc2626;
  font-size: 12px;
}

.source-tag,
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.source-tag.wallet {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.source-tag.author {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.status-tag.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-tag.approved,
.status-tag.processed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-tag.rejected,
.status-tag.failed {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.action-btns {
  display: flex;
  gap: 8px;
}

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
}

.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.detail-item-full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  color: #94a3b8;
}

.detail-value {
  color: #1f2937;
  line-height: 1.6;
}

.detail-value.code {
  font-family: monospace;
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }

  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;

    > .el-select,
    :deep(.el-date-editor) {
      width: 100%;
    }
  }

  .filter-actions {
    margin-left: 0;
    justify-content: flex-end;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
