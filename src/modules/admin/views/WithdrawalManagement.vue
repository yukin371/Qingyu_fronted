<template>
  <div class="withdrawal-management">
    <div class="page-header">
      <h2 class="page-title">提现审核</h2>
      <div class="header-stats">
        <el-tag type="warning">待审核: {{ pendingCount }}</el-tag>
        <el-tag type="success">今日已审核: {{ todayApprovedCount }}</el-tag>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <el-select v-model="filters.status" placeholder="状态" clearable @change="handleFilterChange">
        <el-option label="全部" value="" />
        <el-option label="待审核" value="pending" />
        <el-option label="已批准" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>

      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleFilterChange"
      />

      <el-button :icon="Refresh" @click="loadWithdrawals">刷新</el-button>
    </div>

    <!-- 提现列表 -->
    <div class="withdrawal-list">
      <el-table
        v-loading="loading"
        :data="withdrawals"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="withdrawId" label="提现ID" width="150" />
        <el-table-column prop="amount" label="提现金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="提现账户" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="reviewedAt" label="审核时间" width="180">
          <template #default="{ row }">
            {{ row.reviewedAt ? formatDate(row.reviewedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              批准
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status !== 'pending'"
              size="small"
              @click="handleView(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @update:current-page="pagination.page = $event"
          @update:page-size="pagination.pageSize = $event"
          @current-change="loadWithdrawals"
          @size-change="loadWithdrawals"
        />
      </div>
    </div>

    <!-- 审核详情对话框 -->
    <el-dialog v-model="dialogVisible" title="提现详情" width="600px">
      <div v-if="currentItem" class="withdrawal-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="提现ID">
            {{ currentItem.withdrawId }}
          </el-descriptions-item>
          <el-descriptions-item label="提现金额">
            <span class="amount">¥{{ currentItem.amount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="提现账户">
            {{ currentItem.account }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentItem.status)">
              {{ getStatusText(currentItem.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ formatDate(currentItem.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentItem.reviewedAt" label="审核时间">
            {{ formatDate(currentItem.reviewedAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentItem.reason" label="原因">
            {{ currentItem.reason }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentItem?.status === 'pending'"
          type="danger"
          @click="handleReject(currentItem)"
        >
          拒绝
        </el-button>
        <el-button
          v-if="currentItem?.status === 'pending'"
          type="success"
          @click="handleApprove(currentItem)"
        >
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
            placeholder="请输入拒绝原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="confirmReject">
          确认拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import * as adminAPI from '@/api/shared/admin'
import type { WithdrawRecord } from '@/api/shared/types'
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

const todayApprovedCount = ref(0)

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

// 获取状态类型
const getStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || ''
}

// 加载提现列表
const loadWithdrawals = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的API，暂时使用模拟数据
    const mockData: WithdrawRecord[] = [
      {
        withdrawId: 'wd_001',
        amount: 500,
        account: '支付宝:user1@example.com',
        status: 'pending',
        createdAt: '2025-10-21T10:00:00Z'
      },
      {
        withdrawId: 'wd_002',
        amount: 1000,
        account: '支付宝:user2@example.com',
        status: 'pending',
        createdAt: '2025-10-21T09:30:00Z'
      },
      {
        withdrawId: 'wd_003',
        amount: 300,
        account: '银行卡:6222***1234',
        status: 'approved',
        createdAt: '2025-10-20T15:00:00Z',
        reviewedAt: '2025-10-20T16:00:00Z'
      }
    ]

    withdrawals.value = mockData
    total.value = mockData.length
  } catch (error) {
    console.error('加载提现列表失败:', error)
    ElMessage.error('加载提现列表失败')
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
    await ElMessageBox.confirm(`确认批准提现 ¥${item.amount} 吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success'
    })

    await adminAPI.reviewWithdraw(item.withdrawId, {
      status: 'approved'
    })

    ElMessage.success('批准成功')
    dialogVisible.value = false
    loadWithdrawals()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批准失败:', error)
      ElMessage.error('批准失败')
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
    ElMessage.warning('请输入拒绝原因')
    return
  }

  if (!currentItem.value) return

  submitting.value = true
  try {
    await adminAPI.reviewWithdraw(currentItem.value.withdrawId, {
      status: 'rejected',
      reason: rejectForm.reason
    })

    ElMessage.success('已拒绝')
    rejectDialogVisible.value = false
    dialogVisible.value = false
    loadWithdrawals()
  } catch (error) {
    console.error('拒绝失败:', error)
    ElMessage.error('操作失败')
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-stats {
  display: flex;
  gap: 12px;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.withdrawal-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.amount {
  color: #f56c6c;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.withdrawal-detail {
  .amount {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .header-stats {
    flex-direction: column;
  }
}
</style>

