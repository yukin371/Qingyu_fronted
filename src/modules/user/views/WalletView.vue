<template>
  <div class="wallet-view">
    <div class="page-header">
      <h1>我的钱包</h1>
    </div>

    <div class="wallet-content">
      <!-- 钱包余额 -->
      <el-card class="balance-card">
        <div class="balance-info">
          <div class="balance-label">账户余额</div>
          <div class="balance-amount">¥ {{ formatAmount(walletInfo.balance) }}</div>
          <div class="balance-actions">
            <el-button type="primary" @click="showRechargeDialog = true">
              <el-icon><Plus /></el-icon>
              充值
            </el-button>
            <el-button @click="showWithdrawDialog = true">
              <el-icon><Minus /></el-icon>
              提现
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 交易记录 -->
      <el-card class="transaction-card">
        <template #header>
          <div class="card-header">
            <span>交易记录</span>
            <el-select v-model="transactionType" placeholder="类型" style="width: 120px" @change="loadTransactions">
              <el-option label="全部" value="all" />
              <el-option label="充值" value="recharge" />
              <el-option label="消费" value="consume" />
              <el-option label="收入" value="income" />
              <el-option label="提现" value="withdraw" />
            </el-select>
          </div>
        </template>

        <el-table :data="transactions" v-loading="loading" stripe>
          <el-table-column prop="createdAt" label="时间" width="180" />
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
              <span :class="row.amount > 0 ? 'income' : 'outcome'">
                {{ row.amount > 0 ? '+' : '' }}¥{{ formatAmount(Math.abs(row.amount)) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="balance" label="余额" width="150" align="right">
            <template #default="{ row }">
              ¥{{ formatAmount(row.balance) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="loadTransactions"
          />
        </div>
      </el-card>
    </div>

    <!-- 充值对话框 -->
    <el-dialog v-model="showRechargeDialog" title="充值" width="500px">
      <div class="recharge-dialog">
        <div class="amount-select">
          <div
            v-for="amount in rechargeAmounts"
            :key="amount"
            class="amount-item"
            :class="{ active: rechargeAmount === amount }"
            @click="rechargeAmount = amount"
          >
            ¥{{ amount }}
          </div>
        </div>
        <el-input v-model.number="customAmount" placeholder="或输入自定义金额" type="number">
          <template #prefix>¥</template>
        </el-input>
        <div class="payment-methods">
          <div class="method-label">支付方式：</div>
          <el-radio-group v-model="paymentMethod">
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="wechat">微信支付</el-radio>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="showRechargeDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRecharge" :loading="recharging">
          确认充值
        </el-button>
      </template>
    </el-dialog>

    <!-- 提现对话框 -->
    <el-dialog v-model="showWithdrawDialog" title="提现" width="500px">
      <el-form :model="withdrawForm" label-width="100px">
        <el-form-item label="可提现">
          <div class="balance-info">¥{{ formatAmount(walletInfo.balance) }}</div>
        </el-form-item>
        <el-form-item label="提现金额">
          <el-input v-model.number="withdrawForm.amount" placeholder="请输入提现金额" type="number">
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showWithdrawDialog = false">取消</el-button>
        <el-button type="primary" @click="submitWithdraw" :loading="withdrawing">
          确认提现
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Minus } from '@element-plus/icons-vue'

const loading = ref(false)
const recharging = ref(false)
const withdrawing = ref(false)

const showRechargeDialog = ref(false)
const showWithdrawDialog = ref(false)

const walletInfo = ref({
  balance: 0
})

const transactions = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const transactionType = ref('all')

const rechargeAmounts = [10, 50, 100, 200, 500, 1000]
const rechargeAmount = ref(0)
const customAmount = ref(0)
const paymentMethod = ref('alipay')

const withdrawForm = reactive({
  amount: 0
})

function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

function getTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    recharge: 'success',
    consume: 'danger',
    income: 'success',
    withdraw: 'warning'
  }
  return colorMap[type] || 'info'
}

function getTypeLabel(type: string): string {
  const labelMap: Record<string, string> = {
    recharge: '充值',
    consume: '消费',
    income: '收入',
    withdraw: '提现'
  }
  return labelMap[type] || type
}

async function loadWalletInfo(): Promise<void> {
  try {
    // TODO: 调用API
    walletInfo.value = {
      balance: 1250.50
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载钱包信息失败')
  }
}

async function loadTransactions(): Promise<void> {
  loading.value = true
  try {
    // TODO: 调用API
    transactions.value = [
      {
        createdAt: '2024-01-20 10:30:00',
        type: 'recharge',
        description: '账户充值',
        amount: 100,
        balance: 1250.50
      },
      {
        createdAt: '2024-01-19 15:45:00',
        type: 'consume',
        description: '购买《示例书籍》',
        amount: -10,
        balance: 1150.50
      }
    ]
    total.value = 20
  } catch (error: any) {
    ElMessage.error(error.message || '加载交易记录失败')
  } finally {
    loading.value = false
  }
}

async function submitRecharge(): Promise<void> {
  const amount = customAmount.value || rechargeAmount.value
  if (!amount || amount <= 0) {
    ElMessage.warning('请选择或输入充值金额')
    return
  }

  recharging.value = true
  try {
    // TODO: 调用充值API
    ElMessage.success('充值成功')
    showRechargeDialog.value = false
    loadWalletInfo()
    loadTransactions()
  } catch (error: any) {
    ElMessage.error(error.message || '充值失败')
  } finally {
    recharging.value = false
  }
}

async function submitWithdraw(): Promise<void> {
  if (!withdrawForm.amount || withdrawForm.amount <= 0) {
    ElMessage.warning('请输入提现金额')
    return
  }

  if (withdrawForm.amount > walletInfo.value.balance) {
    ElMessage.error('提现金额不能超过账户余额')
    return
  }

  withdrawing.value = true
  try {
    // TODO: 调用提现API
    ElMessage.success('提现申请已提交')
    showWithdrawDialog.value = false
    loadWalletInfo()
    loadTransactions()
  } catch (error: any) {
    ElMessage.error(error.message || '提现失败')
  } finally {
    withdrawing.value = false
  }
}

onMounted(() => {
  loadWalletInfo()
  loadTransactions()
})
</script>

<style scoped lang="scss">
.wallet-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  .page-header {
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }

  .balance-card {
    margin-bottom: 20px;

    .balance-info {
      text-align: center;
      padding: 20px;

      .balance-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 12px;
      }

      .balance-amount {
        font-size: 48px;
        font-weight: bold;
        color: #67C23A;
        margin-bottom: 24px;
      }

      .balance-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
      }
    }
  }

  .transaction-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .income {
      color: #67C23A;
      font-weight: 500;
    }

    .outcome {
      color: #F56C6C;
      font-weight: 500;
    }

    .pagination {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .recharge-dialog {
    .amount-select {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;

      .amount-item {
        padding: 16px;
        text-align: center;
        border: 2px solid #dcdfe6;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          border-color: #409EFF;
        }

        &.active {
          border-color: #409EFF;
          background: #ecf5ff;
          color: #409EFF;
        }
      }
    }

    .payment-methods {
      margin-top: 20px;

      .method-label {
        margin-bottom: 12px;
        font-weight: 500;
      }
    }
  }

  .balance-info {
    font-size: 20px;
    font-weight: bold;
    color: #67C23A;
  }
}
</style>

