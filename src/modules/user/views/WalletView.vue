<template>
  <Container maxWidth="lg" padding>
    <Section title="我的钱包" spacing="lg">
      <template #extra>
        <div class="header-actions">
          <el-button type="primary" @click="showRechargeDialog = true">
            <QyIcon name="Plus"  />
            充值
          </el-button>
          <el-button @click="goToTransfer">
            <QyIcon name="Sort"  />
            转账
          </el-button>
          <el-button @click="showWithdrawDialog = true">
            <QyIcon name="Minus"  />
            提现
          </el-button>
        </div>
      </template>

      <!-- 钱包余额 -->
      <Grid :cols="{ md: 3, sm: 1 }" gap="lg" class="wallet-stats">
        <el-card shadow="hover" class="stat-card balance-card">
          <div class="stat-content">
            <div class="stat-icon balance-icon">
              <el-icon :size="32"><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">账户余额</div>
              <div class="stat-value primary">¥{{ formatAmount(walletInfo.balance) }}</div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon income-icon">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">累计收入</div>
              <div class="stat-value success">¥{{ formatAmount(walletInfo.totalIncome || 0) }}</div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon expense-icon">
              <el-icon :size="32"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">累计消费</div>
              <div class="stat-value danger">¥{{ formatAmount(walletInfo.totalExpense || 0) }}</div>
            </div>
          </div>
        </el-card>
      </Grid>

      <!-- 交易记录 -->
      <el-card shadow="hover" class="transaction-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">交易记录</span>
            <el-select
              v-model="transactionType"
              placeholder="交易类型"
              style="width: 120px"
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="充值" value="recharge" />
              <el-option label="消费" value="consume" />
              <el-option label="收入" value="income" />
              <el-option label="提现" value="withdraw" />
            </el-select>
          </div>
        </template>

        <el-table
          :data="transactions"
          v-loading="loading"
          stripe
          empty-text="暂无交易记录"
        >
          <el-table-column prop="created_at" label="时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeColor(row.type)">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" min-width="200" />
          <el-table-column prop="amount" label="金额" width="150" align="right">
            <template #default="{ row }">
              <span :class="row.amount > 0 ? 'amount-income' : 'amount-outcome'">
                {{ row.amount > 0 ? '+' : '' }}¥{{ formatAmount(Math.abs(row.amount)) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="balance_after" label="余额" width="150" align="right">
            <template #default="{ row }">
              ¥{{ formatAmount(row.balance_after || 0) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="loadTransactions"
            @size-change="loadTransactions"
          />
        </div>
      </el-card>
    </Section>

    <!-- 充值对话框 -->
    <el-dialog
      v-model="showRechargeDialog"
      title="账户充值"
      width="520px"
      :close-on-click-modal="false"
    >
      <FormSection label="选择金额" required>
        <div class="amount-grid">
          <div
            v-for="amount in rechargeAmounts"
            :key="amount"
            class="amount-item"
            :class="{ active: rechargeAmount === amount && !customAmount }"
            @click="selectRechargeAmount(amount)"
          >
            <div class="amount-value">¥{{ amount }}</div>
          </div>
        </div>
      </FormSection>

      <FormSection
        label="自定义金额"
        hint="最低充值金额为10元"
      >
        <el-input
          v-model.number="customAmount"
          placeholder="请输入充值金额"
          type="number"
          :min="10"
          @input="rechargeAmount = 0"
        >
          <template #prefix>¥</template>
        </el-input>
      </FormSection>

      <FormSection label="支付方式" required>
        <el-radio-group v-model="paymentMethod" class="payment-methods">
          <el-radio label="alipay" border>
            <div class="payment-option">
              <el-icon :size="20"><CreditCard /></el-icon>
              <span>支付宝</span>
            </div>
          </el-radio>
          <el-radio label="wechat" border>
            <div class="payment-option">
              <el-icon :size="20"><ChatDotSquare /></el-icon>
              <span>微信支付</span>
            </div>
          </el-radio>
        </el-radio-group>
      </FormSection>

      <template #footer>
        <el-button @click="showRechargeDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRecharge" :loading="recharging">
          确认充值
        </el-button>
      </template>
    </el-dialog>

    <!-- 提现对话框 -->
    <el-dialog
      v-model="showWithdrawDialog"
      title="申请提现"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form :model="withdrawForm" :rules="withdrawRules" ref="withdrawFormRef">
        <FormSection label="可提现余额">
          <div class="available-balance">¥{{ formatAmount(walletInfo.balance) }}</div>
        </FormSection>

        <FormSection
          label="提现金额"
          required
          hint="单笔提现最低10元，最高10000元"
        >
          <el-form-item prop="amount">
            <el-input
              v-model.number="withdrawForm.amount"
              placeholder="请输入提现金额"
              type="number"
              :min="10"
              :max="10000"
            >
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
        </FormSection>

        <FormSection
          label="提现账号"
          required
          hint="请填写您的支付宝账号或银行卡号"
        >
          <el-form-item prop="account">
            <el-input
              v-model="withdrawForm.account"
              placeholder="请输入提现账号"
            />
          </el-form-item>
        </FormSection>
      </el-form>

      <template #footer>
        <el-button @click="showWithdrawDialog = false">取消</el-button>
        <el-button type="primary" @click="submitWithdraw" :loading="withdrawing">
          确认提现
        </el-button>
      </template>
    </el-dialog>

    <LoadingOverlay :visible="pageLoading" text="加载中..." />
  </Container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, FormInstance, FormRules } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { Container, Section, Grid, FormSection, LoadingOverlay } from '@/shared/components/design-system'
import { walletAPI } from '@/modules/shared/api'
import type { WalletInfo, Transaction } from '@/types/shared'

const router = useRouter()

// 加载状态
const loading = ref(false)
const pageLoading = ref(false)
const recharging = ref(false)
const withdrawing = ref(false)

// 对话框状态
const showRechargeDialog = ref(false)
const showWithdrawDialog = ref(false)

// 钱包信息
const walletInfo = ref<WalletInfo>({
  user_id: '',
  balance: 0,
  total_recharge: 0,
  total_consume: 0,
  total_income: 0,
  total_withdraw: 0,
  status: 'active',
  created_at: '',
  updated_at: '',
  totalIncome: 0,
  totalExpense: 0
})

// 交易记录
const transactions = ref<Transaction[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const transactionType = ref('')

// 充值相关
const rechargeAmounts = [10, 50, 100, 200, 500, 1000]
const rechargeAmount = ref(0)
const customAmount = ref(0)
const paymentMethod = ref('alipay')

// 提现相关
const withdrawFormRef = ref<FormInstance>()
const withdrawForm = reactive({
  amount: 0,
  account: ''
})

const withdrawRules: FormRules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    {
      type: 'number',
      min: 10,
      max: 10000,
      message: '提现金额应在10-10000元之间',
      trigger: 'blur'
    }
  ],
  account: [
    { required: true, message: '请输入提现账号', trigger: 'blur' },
    { min: 5, max: 50, message: '账号长度应在5-50个字符之间', trigger: 'blur' }
  ]
}

// 格式化金额
function formatAmount(amount: number): string {
  return amount ? amount.toFixed(2) : '0.00'
}

// 格式化日期
function formatDate(date: string): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取交易类型颜色
function getTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    recharge: 'success',
    consume: 'danger',
    income: 'success',
    withdraw: 'warning',
    transfer: 'info'
  }
  return colorMap[type] || 'info'
}

// 获取交易类型标签
function getTypeLabel(type: string): string {
  const labelMap: Record<string, string> = {
    recharge: '充值',
    consume: '消费',
    income: '收入',
    withdraw: '提现',
    transfer: '转账'
  }
  return labelMap[type] || type
}

// 选择充值金额
function selectRechargeAmount(amount: number) {
  rechargeAmount.value = amount
  customAmount.value = 0
}

// 加载钱包信息
async function loadWalletInfo(): Promise<void> {
  try {
    const response = await walletAPI.getWallet()
    if (response.code === 200 && response.data) {
      walletInfo.value = {
        ...response.data,
        totalIncome: response.data.total_income || 0,
        totalExpense: response.data.total_consume || 0
      }
    }
  } catch (error: any) {
    console.error('加载钱包信息失败:', error)
    message.error(error.message || '加载钱包信息失败')
  }
}

// 加载交易记录
async function loadTransactions(): Promise<void> {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      type: transactionType.value || undefined
    }

    const response = await walletAPI.getTransactions(params)

    if (response.code === 200) {
      transactions.value = response.data || []
      total.value = response.total || 0
    }
  } catch (error: any) {
    console.error('加载交易记录失败:', error)
    message.error(error.message || '加载交易记录失败')
  } finally {
    loading.value = false
  }
}

// 筛选变化处理
function handleFilterChange() {
  currentPage.value = 1
  loadTransactions()
}

// 提交充值
async function submitRecharge(): Promise<void> {
  const amount = customAmount.value || rechargeAmount.value

  if (!amount || amount < 10) {
    message.warning('请选择或输入充值金额，最低充值10元')
    return
  }

  if (!paymentMethod.value) {
    message.warning('请选择支付方式')
    return
  }

  recharging.value = true
  try {
    const response = await walletAPI.recharge({
      amount,
      method: paymentMethod.value
    })

    if (response.code === 200) {
      message.success('充值成功')
      showRechargeDialog.value = false

      // 重置表单
      rechargeAmount.value = 0
      customAmount.value = 0

      // 刷新数据
      await loadWalletInfo()
      await loadTransactions()
    }
  } catch (error: any) {
    console.error('充值失败:', error)
    message.error(error.message || '充值失败，请稍后重试')
  } finally {
    recharging.value = false
  }
}

// 提交提现
async function submitWithdraw(): Promise<void> {
  if (!withdrawFormRef.value) return

  try {
    await withdrawFormRef.value.validate()
  } catch {
    return
  }

  if (withdrawForm.amount > walletInfo.value.balance) {
    message.error('提现金额不能超过可用余额')
    return
  }

  withdrawing.value = true
  try {
    const response = await walletAPI.requestWithdraw({
      amount: withdrawForm.amount,
      account: withdrawForm.account
    })

    if (response.code === 200) {
      message.success('提现申请已提交，预计1-3个工作日到账')
      showWithdrawDialog.value = false

      // 重置表单
      withdrawForm.amount = 0
      withdrawForm.account = ''
      withdrawFormRef.value?.resetFields()

      // 刷新数据
      await loadWalletInfo()
      await loadTransactions()
    }
  } catch (error: any) {
    console.error('提现失败:', error)
    message.error(error.message || '提现申请失败，请稍后重试')
  } finally {
    withdrawing.value = false
  }
}

// 跳转到转账页面
function goToTransfer() {
  router.push('/user/transfer')
}

// 页面初始化
onMounted(async () => {
  pageLoading.value = true
  try {
    await Promise.all([
      loadWalletInfo(),
      loadTransactions()
    ])
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped lang="scss">
// 页面头部操作
.header-actions {
  display: flex;
  gap: 0.75rem;
}

// 钱包统计卡片
.wallet-stats {
  margin-bottom: 1.5rem;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;

  &.balance-icon {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    color: #fff;
  }

  &.income-icon {
    background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
    color: #fff;
  }

  &.expense-icon {
    background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
    color: #fff;
  }
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #757575;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;

  &.primary {
    color: #2196F3;
  }

  &.success {
    color: #4CAF50;
  }

  &.danger {
    color: #F44336;
  }
}

// 交易记录卡片
.transaction-card {
  margin-top: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #212121;
}

.amount-income {
  color: #4CAF50;
  font-weight: 600;
}

.amount-outcome {
  color: #F44336;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E0E0E0;
}

// 充值对话框
.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.amount-item {
  padding: 1rem;
  text-align: center;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;

  &:hover {
    border-color: #2196F3;
    background: #F5F5F5;
    transform: translateY(-2px);
  }

  &.active {
    border-color: #2196F3;
    background: #E3F2FD;

    .amount-value {
      color: #2196F3;
    }
  }
}

.amount-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212121;
}

// 支付方式
.payment-methods {
  display: flex;
  gap: 1rem;

  :deep(.el-radio) {
    margin-right: 0;
    flex: 1;
  }

  :deep(.el-radio.is-bordered) {
    padding: 12px 16px;
  }
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

// 提现相关
.available-balance {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4CAF50;
}

// 响应式设计
@media (max-width: 768px) {
  .wallet-stats {
    :deep(.qy-grid) {
      grid-template-columns: 1fr;
    }
  }

  .amount-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-methods {
    flex-direction: column;
  }
}
</style>

