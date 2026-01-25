<template>
  <Container maxWidth="md" padding>
    <Section title="转账" spacing="lg">
      <!-- 转账表单 -->
      <el-card shadow="hover" class="transfer-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">向其他用户转账</span>
            <el-button text type="primary" @click="showHistory = !showHistory">
              {{ showHistory ? '隐藏' : '查看' }}转账记录
            </el-button>
          </div>
        </template>

        <el-form
          ref="transferFormRef"
          :model="transferForm"
          :rules="transferRules"
          label-width="120px"
          @submit.prevent="handleTransfer"
        >
          <!-- 可用余额 -->
          <el-form-item label="可用余额">
            <div class="balance-display">
              <span class="balance-amount">¥{{ formatAmount(walletInfo.balance) }}</span>
              <el-button text type="primary" @click="loadWalletInfo">刷新</el-button>
            </div>
          </el-form-item>

          <!-- 收款人 -->
          <el-form-item label="收款人" prop="targetUser">
            <el-autocomplete
              v-model="transferForm.targetUser"
              :fetch-suggestions="searchUsers"
              placeholder="输入用户名或用户ID"
              :trigger-on-focus="false"
              style="width: 100%"
              @select="handleUserSelect"
            >
              <template #default="{ item }">
                <div class="user-suggestion">
                  <div class="user-name">{{ item.value }}</div>
                  <div class="user-info" v-if="item.nickname">{{ item.nickname }}</div>
                </div>
              </template>
            </el-autocomplete>
            <div class="form-hint">支持输入用户名或用户ID</div>
          </el-form-item>

          <!-- 转账金额 -->
          <el-form-item label="转账金额" prop="amount">
            <el-input
              v-model.number="transferForm.amount"
              type="number"
              placeholder="请输入转账金额"
              :min="0.01"
              :step="0.01"
            >
              <template #prefix>¥</template>
            </el-input>
            <div class="quick-amounts">
              <el-button
                v-for="amount in quickAmounts"
                :key="amount"
                size="small"
                @click="setAmount(amount)"
              >
                ¥{{ amount }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 转账备注 -->
          <el-form-item label="转账备注" prop="reason">
            <el-input
              v-model="transferForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入转账备注（可选）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <!-- 转账按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="transferring"
              @click="handleTransfer"
              style="width: 100%"
            >
              确认转账
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 转账记录 -->
      <el-card v-if="showHistory" shadow="hover" class="history-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">转账记录</span>
            <el-button text type="primary" @click="loadTransferHistory">刷新</el-button>
          </div>
        </template>

        <el-table
          :data="transferHistory"
          v-loading="loadingHistory"
          stripe
          empty-text="暂无转账记录"
        >
          <el-table-column prop="created_at" label="时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>

          <el-table-column prop="related_user" label="收款人" width="150">
            <template #default="{ row }">
              {{ row.related_user || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-out">-¥{{ formatAmount(Math.abs(row.amount)) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="description" label="备注" min-width="200" />

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @current-change="loadTransferHistory"
            @size-change="loadTransferHistory"
          />
        </div>
      </el-card>

      <!-- 转账确认对话框 -->
      <el-dialog
        v-model="showConfirmDialog"
        title="确认转账"
        width="480px"
        :close-on-click-modal="false"
      >
        <div class="confirm-content">
          <el-icon class="confirm-icon" :size="48" color="#409eff"><QyIcon name="WarningFilled"  /></el-icon>
          <div class="confirm-details">
            <div class="confirm-item">
              <span class="confirm-label">收款人：</span>
              <span class="confirm-value">{{ transferForm.targetUser }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">转账金额：</span>
              <span class="confirm-value amount-highlight">¥{{ formatAmount(transferForm.amount) }}</span>
            </div>
            <div class="confirm-item" v-if="transferForm.reason">
              <span class="confirm-label">转账备注：</span>
              <span class="confirm-value">{{ transferForm.reason }}</span>
            </div>
            <div class="confirm-warning">
              <el-icon color="#faad14"><Warning /></el-icon>
              <span>转账操作不可撤销，请确认收款人信息正确</span>
            </div>
          </div>
        </div>

        <template #footer>
          <el-button @click="showConfirmDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmTransfer" :loading="transferring">
            确认转账
          </el-button>
        </template>
      </el-dialog>

      <!-- 转账结果对话框 -->
      <el-dialog
        v-model="showResultDialog"
        :title="transferResult.success ? '转账成功' : '转账失败'"
        width="420px"
      >
        <el-result
          :icon="transferResult.success ? 'success' : 'error'"
          :title="transferResult.success ? '转账成功' : '转账失败'"
        >
          <template #sub-title>
            <div>{{ transferResult.message }}</div>
            <div v-if="transferResult.transactionId" class="result-transaction-id">
              交易ID: {{ transferResult.transactionId }}
            </div>
          </template>
        </el-result>

        <template #footer>
          <el-button type="primary" @click="showResultDialog = false">关闭</el-button>
        </template>
      </el-dialog>
    </Section>

    <LoadingOverlay :visible="pageLoading" text="加载中..." />
  </Container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { QyIcon } from '@/design-system/components'
import { Container, Section, LoadingOverlay } from '@/shared/components/design-system'
import { walletAPI } from '@/modules/shared/api'
import type { WalletInfo, Transaction } from '@/types/shared'

// 加载状态
const pageLoading = ref(false)
const transferring = ref(false)
const loadingHistory = ref(false)

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
  updated_at: ''
})

// 转账表单
const transferFormRef = ref<FormInstance>()
const transferForm = reactive({
  targetUser: '',
  amount: 0,
  reason: ''
})

const transferRules: FormRules = {
  targetUser: [
    { required: true, message: '请输入收款人', trigger: 'blur' },
    { min: 2, max: 50, message: '收款人长度应在2-50个字符之间', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入转账金额', trigger: 'blur' },
    {
      type: 'number',
      min: 0.01,
      message: '转账金额不能小于0.01元',
      trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        if (value > walletInfo.value.balance) {
          callback(new Error('转账金额不能超过可用余额'))
        } else if (value > 10000) {
          callback(new Error('单笔转账金额不能超过10000元'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 快捷金额
const quickAmounts = [10, 50, 100, 200, 500]

// 转账记录
const showHistory = ref(false)
const transferHistory = ref<Transaction[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 确认对话框
const showConfirmDialog = ref(false)

// 结果对话框
const showResultDialog = ref(false)
const transferResult = ref({
  success: false,
  message: '',
  transactionId: ''
})

// 格式化函数
function formatAmount(amount: number): string {
  return amount ? amount.toFixed(2) : '0.00'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('zh-CN')
}

function getStatusType(status: string): string {
  const typeMap: Record<string, string> = {
    success: 'success',
    pending: 'warning',
    failed: 'danger'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    success: '成功',
    pending: '处理中',
    failed: '失败'
  }
  return textMap[status] || status
}

// 设置金额
function setAmount(amount: number) {
  transferForm.amount = amount
}

// 搜索用户（模拟）
async function searchUsers(queryString: string, cb: any) {
  // 这里应该调用API搜索用户
  // 暂时返回模拟数据
  const results = queryString
    ? [
        { value: queryString, nickname: '' }
      ]
    : []
  cb(results)
}

// 选择用户
function handleUserSelect(item: any) {
  transferForm.targetUser = item.value
}

// 加载钱包信息
async function loadWalletInfo() {
  try {
    const response = await walletAPI.getWallet()
    if (response.code === 200 && response.data) {
      walletInfo.value = response.data
    }
  } catch (error: any) {
    console.error('加载钱包信息失败:', error)
  }
}

// 加载转账记录
async function loadTransferHistory() {
  loadingHistory.value = true
  try {
    const response = await walletAPI.getTransactions({
      page: currentPage.value,
      pageSize: pageSize.value,
      type: 'transfer_out'
    })

    if (response.code === 200) {
      transferHistory.value = response.data?.data || []
      total.value = response.data?.total || 0
    }
  } catch (error: any) {
    console.error('加载转账记录失败:', error)
  } finally {
    loadingHistory.value = false
  }
}

// 处理转账
async function handleTransfer() {
  if (!transferFormRef.value) return

  try {
    await transferFormRef.value.validate()
  } catch {
    return
  }

  showConfirmDialog.value = true
}

// 确认转账
async function confirmTransfer() {
  transferring.value = true
  try {
    const response = await walletAPI.transfer({
      targetUserId: transferForm.targetUser,
      amount: transferForm.amount,
      reason: transferForm.reason || '用户转账'
    })

    if (response.code === 200) {
      transferResult.value = {
        success: true,
        message: '转账成功',
        transactionId: response.data?.id || ''
      }

      // 刷新钱包信息和转账记录
      await Promise.all([
        loadWalletInfo(),
        loadTransferHistory()
      ])

      // 重置表单
      transferFormRef.value?.resetFields()
    } else {
      transferResult.value = {
        success: false,
        message: response.message || '转账失败'
      }
    }
  } catch (error: any) {
    transferResult.value = {
      success: false,
      message: error.message || '转账失败，请稍后重试'
    }
  } finally {
    transferring.value = false
    showConfirmDialog.value = false
    showResultDialog.value = true
  }
}

// 初始化
onMounted(async () => {
  pageLoading.value = true
  try {
    await loadWalletInfo()
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped lang="scss">
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

.transfer-card {
  margin-bottom: 1.5rem;
}

.balance-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.balance-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2196f3;
}

.form-hint {
  font-size: 0.75rem;
  color: #9e9e9e;
  margin-top: 0.25rem;
}

.user-suggestion {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #212121;
}

.user-info {
  font-size: 0.75rem;
  color: #757575;
}

.quick-amounts {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.history-card {
  margin-top: 1.5rem;
}

.amount-out {
  color: #f44336;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
}

.confirm-icon {
  flex-shrink: 0;
}

.confirm-details {
  flex: 1;
  width: 100%;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.confirm-label {
  color: #757575;
}

.confirm-value {
  color: #212121;
  font-weight: 500;
}

.amount-highlight {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2196f3;
}

.confirm-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  color: #faad14;
  font-size: 0.875rem;
}

.result-transaction-id {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
  color: #616161;
}
</style>
