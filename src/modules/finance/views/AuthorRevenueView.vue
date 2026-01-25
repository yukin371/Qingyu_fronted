<template>
  <div class="author-revenue-container">
    <!-- 收入总览卡片 -->
    <el-row :gutter="20" class="revenue-overview">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #ecf5ff">
              <el-icon :size="24" color="#409eff"><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ overview.total_earnings?.toFixed(2) || '0.00' }}</div>
              <div class="stat-label">总收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f0f9ff">
              <el-icon :size="24" color="#67c23a"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ overview.withdrawable_amount?.toFixed(2) || '0.00' }}</div>
              <div class="stat-label">可提现</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fef0f0">
              <el-icon :size="24" color="#f56c6c"><QyIcon name="Clock"  /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ overview.pending_earnings?.toFixed(2) || '0.00' }}</div>
              <div class="stat-label">待结算</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fdf6ec">
              <el-icon :size="24" color="#e6a23c"><QyIcon name="User"  /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.total_readers || 0 }}</div>
              <div class="stat-label">总读者数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Tab 内容 -->
    <el-card class="revenue-content" style="margin-top: 20px">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 收入明细 -->
        <el-tab-pane label="收入明细" name="earnings">
          <template #label>
            <span>收入明细</span>
          </template>

          <div class="table-header">
            <el-button type="primary" @click="handleRefreshEarnings">
              <QyIcon name="Refresh"  />
              刷新
            </el-button>
          </div>

          <el-table
            :data="earningsData"
            v-loading="earningsLoading"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="book_title" label="书籍名称" width="200" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getEarningTypeColor(row.type)">
                  {{ getEarningTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold">
                  ¥{{ row.amount.toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
            <el-table-column prop="created_at" label="时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="earningsPage"
            :page-size="earningsPageSize"
            :total="earningsTotal"
            layout="total, prev, pager, next, jumper"
            @current-change="loadEarnings"
            style="margin-top: 20px; justify-content: flex-end"
          />
        </el-tab-pane>

        <!-- 收入统计 -->
        <el-tab-pane label="收入统计" name="statistics">
          <div class="statistics-content">
            <div class="chart-container">
              <h4>收入趋势</h4>
              <div ref="chartRef" style="height: 300px"></div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 提现管理 -->
        <el-tab-pane label="提现管理" name="withdrawal">
          <div class="withdrawal-section">
            <div class="withdrawal-actions">
              <el-button type="primary" @click="showWithdrawDialog = true">
                <QyIcon name="Wallet"  />
                申请提现
              </el-button>
              <el-button @click="loadWithdrawals">
                <QyIcon name="Refresh"  />
                刷新
              </el-button>
            </div>

            <el-table
              :data="withdrawalsData"
              v-loading="withdrawalsLoading"
              stripe
              style="width: 100%; margin-top: 16px"
            >
              <el-table-column prop="amount" label="提现金额" width="120">
                <template #default="{ row }">
                  <span style="color: #f56c6c; font-weight: bold">
                    ¥{{ row.amount.toFixed(2) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="actual_amount" label="实际到账" width="120">
                <template #default="{ row }">
                  <span style="color: #67c23a; font-weight: bold">
                    ¥{{ row.actual_amount.toFixed(2) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="fee" label="手续费" width="100">
                <template #default="{ row }">
                  ¥{{ row.fee.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="method" label="提现方式" width="100" />
              <el-table-column prop="account_info" label="账户信息" />
              <el-table-column prop="created_at" label="申请时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button
                    v-if="row.status === 'pending'"
                    type="danger"
                    size="small"
                    @click="handleCancelWithdraw(row.id)"
                  >
                    取消
                  </el-button>
                  <el-button
                    v-else-if="row.reject_reason"
                    type="info"
                    size="small"
                    @click="showRejectReason(row.reject_reason)"
                  >
                    查看原因
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              v-model:current-page="withdrawalsPage"
              :page-size="withdrawalsPageSize"
              :total="withdrawalsTotal"
              layout="total, prev, pager, next, jumper"
              @current-change="loadWithdrawals"
              style="margin-top: 20px; justify-content: flex-end"
            />
          </div>
        </el-tab-pane>

        <!-- 结算记录 -->
        <el-tab-pane label="结算记录" name="settlements">
          <el-table
            :data="settlementsData"
            v-loading="settlementsLoading"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="period" label="结算周期" width="120" />
            <el-table-column prop="total_amount" label="结算金额" width="120">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold">
                  ¥{{ row.total_amount.toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="total_earnings" label="收入笔数" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="结算时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 提现对话框 -->
    <el-dialog
      v-model="showWithdrawDialog"
      title="申请提现"
      width="500px"
    >
      <el-form :model="withdrawForm" :rules="withdrawRules" ref="withdrawFormRef" label-width="100px">
        <el-form-item label="提现金额" prop="amount">
          <el-input-number
            v-model="withdrawForm.amount"
            :min="0.01"
            :max="overview.withdrawable_amount || 0"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
          <div class="form-tip">
            可提现金额：¥{{ overview.withdrawable_amount?.toFixed(2) || '0.00' }}
          </div>
        </el-form-item>
        <el-form-item label="提现方式" prop="method">
          <el-radio-group v-model="withdrawForm.method">
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="wechat">微信</el-radio>
            <el-radio label="bank">银行卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="账户信息" prop="account_info">
          <el-input
            v-model="withdrawForm.account_info"
            type="textarea"
            :rows="3"
            placeholder="请输入支付宝账号/微信号/银行卡号"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showWithdrawDialog = false">取消</el-button>
        <el-button type="primary" @click="handleWithdraw" :loading="withdrawing">
          确认提现
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { QyIcon } from '@/design-system/components'
import * as echarts from 'echarts'
import {
  getRevenueOverview,
  getAuthorEarnings,
  getWithdrawalRequests,
  createWithdrawal,
  getSettlements,
  getRevenueStatistics,
  type WithdrawalRequest
} from '@/modules/finance/api'

const activeTab = ref('earnings')
const overview = ref<any>({})

// 收入明细
const earningsData = ref<any[]>([])
const earningsLoading = ref(false)
const earningsPage = ref(1)
const earningsPageSize = ref(20)
const earningsTotal = ref(0)

// 提现记录
const withdrawalsData = ref<WithdrawalRequest[]>([])
const withdrawalsLoading = ref(false)
const withdrawalsPage = ref(1)
const withdrawalsPageSize = ref(20)
const withdrawalsTotal = ref(0)

// 结算记录
const settlementsData = ref<any[]>([])
const settlementsLoading = ref(false)

// 提现表单
const showWithdrawDialog = ref(false)
const withdrawing = ref(false)
const withdrawForm = ref({
  amount: 0,
  method: 'alipay',
  account_info: ''
})
const withdrawRules = {
  amount: [{ required: true, message: '请输入提现金额', trigger: 'blur' }],
  method: [{ required: true, message: '请选择提现方式', trigger: 'change' }],
  account_info: [{ required: true, message: '请输入账户信息', trigger: 'blur' }]
}
const withdrawFormRef = ref()

const chartRef = ref<HTMLElement>()

// 获取收入总览
const loadOverview = async () => {
  try {
    const res = await getRevenueOverview()
    overview.value = res.data || {}
  } catch (error) {
    console.error('获取收入总览失败', error)
  }
}

// 获取收入明细
const loadEarnings = async (page = earningsPage.value) => {
  earningsLoading.value = true
  try {
    const res = await getAuthorEarnings({
      page,
      page_size: earningsPageSize.value
    })
    earningsData.value = res.data?.items || []
    earningsTotal.value = res.data?.total || 0
    earningsPage.value = page
  } catch (error) {
    ElMessage.error('获取收入明细失败')
  } finally {
    earningsLoading.value = false
  }
}

// 获取提现记录
const loadWithdrawals = async (page = withdrawalsPage.value) => {
  withdrawalsLoading.value = true
  try {
    const res = await getWithdrawalRequests({
      page,
      page_size: withdrawalsPageSize.value
    })
    withdrawalsData.value = res.data?.items || []
    withdrawalsTotal.value = res.data?.total || 0
    withdrawalsPage.value = page
  } catch (error) {
    ElMessage.error('获取提现记录失败')
  } finally {
    withdrawalsLoading.value = false
  }
}

// 获取结算记录
const loadSettlements = async () => {
  settlementsLoading.value = true
  try {
    const res = await getSettlements({ page: 1, page_size: 10 })
    settlementsData.value = res.data?.items || []
  } catch (error) {
    ElMessage.error('获取结算记录失败')
  } finally {
    settlementsLoading.value = false
  }
}

// 刷新收入明细
const handleRefreshEarnings = () => {
  loadEarnings(1)
  loadOverview()
}

// 申请提现
const handleWithdraw = async () => {
  try {
    await withdrawFormRef.value?.validate()
    withdrawing.value = true

    await createWithdrawal({
      amount: withdrawForm.value.amount,
      method: withdrawForm.value.method,
      account_info: withdrawForm.value.account_info
    })

    ElMessage.success('提现申请已提交')
    showWithdrawDialog.value = false
    loadWithdrawals(1)
    loadOverview()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '提现申请失败')
  } finally {
    withdrawing.value = false
  }
}

// 取消提现
const handleCancelWithdraw = async (id: string) => {
  ElMessage.info('取消提现功能待实现')
}

// 查看拒绝原因
const showRejectReason = (reason: string) => {
  ElMessage.info(reason)
}

// 获取收入类型颜色
const getEarningTypeColor = (type: string) => {
  const map: Record<string, string> = {
    subscription: 'success',
    chapter_purchase: 'primary',
    reward: 'warning'
  }
  return map[type] || ''
}

// 获取收入类型文本
const getEarningTypeText = (type: string) => {
  const map: Record<string, string> = {
    subscription: '订阅',
    chapter_purchase: '章节购买',
    reward: '打赏'
  }
  return map[type] || type
}

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    rejected: 'danger',
    paid: 'success'
  }
  return map[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待结算',
    confirmed: '已确认',
    completed: '已完成',
    rejected: '已拒绝',
    paid: '已支付'
  }
  return map[status] || status
}

// 格式化日期时间
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadOverview()
  loadEarnings()
  loadWithdrawals()
  loadSettlements()
})
</script>

<style scoped lang="scss">
.author-revenue-container {
  padding: 20px;
}

.revenue-overview {
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

.revenue-content {
  .table-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
}

.withdrawal-section {
  .withdrawal-actions {
    display: flex;
    gap: 12px;
  }
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.statistics-content {
  .chart-container {
    h4 {
      margin: 0 0 16px;
      font-size: 16px;
    }
  }
}
</style>
