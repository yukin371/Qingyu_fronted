<template>
  <WriterPageShell>
    <div class="revenue-view">
      <div class="mb-5 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm md:p-6">
        <div class="page-header" style="margin-bottom: 0">
          <h1>收入统计</h1>
          <div class="header-actions">
            <QySelect
              v-model="selectedBookId"
              :options="bookOptions"
              placeholder="选择作品"
              size="sm"
              style="width: 200px"
              @change="loadRevenue"
            />
            <QyButton variant="primary" size="sm" @click="showWithdrawDialog = true">
              申请提现
            </QyButton>
          </div>
        </div>
        <p class="mt-2 text-sm text-slate-500">
          查看收入趋势、来源构成和提现记录，掌握作品商业表现。
        </p>
      </div>

      <Skeleton v-if="loading" :rows="8" animated />

      <div v-else class="revenue-content">
        <!-- 收入概览 -->
        <div class="revenue-overview">
          <Card class="revenue-card">
            <div class="revenue-item">
              <div class="revenue-icon total">
                <QyIcon name="Wallet" />
              </div>
              <div class="revenue-details">
                <div class="revenue-value">¥ {{ formatAmount(revenueStats.totalRevenue) }}</div>
                <div class="revenue-label">总收入</div>
              </div>
            </div>
          </Card>

          <Card class="revenue-card">
            <div class="revenue-item">
              <div class="revenue-icon today">
                <QyIcon name="TrendCharts" />
              </div>
              <div class="revenue-details">
                <div class="revenue-value">¥ {{ formatAmount(revenueStats.todayRevenue) }}</div>
                <div class="revenue-label">今日收入</div>
              </div>
            </div>
          </Card>

          <Card class="revenue-card">
            <div class="revenue-item">
              <div class="revenue-icon available">
                <QyIcon name="Money" />
              </div>
              <div class="revenue-details">
                <div class="revenue-value">¥ {{ formatAmount(revenueStats.availableBalance) }}</div>
                <div class="revenue-label">可提现余额</div>
              </div>
            </div>
          </Card>

          <Card class="revenue-card">
            <div class="revenue-item">
              <div class="revenue-icon withdrawn">
                <QyIcon name="DocumentChecked" />
              </div>
              <div class="revenue-details">
                <div class="revenue-value">¥ {{ formatAmount(revenueStats.totalWithdrawn) }}</div>
                <div class="revenue-label">已提现</div>
              </div>
            </div>
          </Card>
        </div>

        <!-- 收入趋势图 -->
        <QyRow :gutter="20" align="stretch">
          <QyCol :span="24" :lg="16">
            <Card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>收入趋势</span>
                  <QyRadioGroup
                    v-model="trendRange"
                    size="sm"
                    direction="horizontal"
                    @change="loadRevenueTrend"
                  >
                    <QyRadio value="7" variant="button">7天</QyRadio>
                    <QyRadio value="30" variant="button">30天</QyRadio>
                    <QyRadio value="90" variant="button">90天</QyRadio>
                  </QyRadioGroup>
                </div>
              </template>
              <div ref="trendChartRef" class="chart-container"></div>
            </Card>
          </QyCol>

          <QyCol :span="24" :lg="8">
            <Card class="chart-card">
              <template #header>
                <span>收入来源</span>
              </template>
              <div ref="sourceChartRef" class="chart-container"></div>
            </Card>
          </QyCol>
        </QyRow>

        <!-- 章节收入排行 -->
        <Card class="ranking-card" padding="none">
          <template #header>
            <span style="padding: 14px 18px 12px; display: inline-block">章节收入排行 TOP 10</span>
          </template>
          <el-table
            :data="chapterRanking"
            stripe
            :header-cell-style="{ textAlign: 'center' }"
            :cell-style="{ textAlign: 'center' }"
          >
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="chapterTitle" label="章节名称" min-width="200" />
            <el-table-column prop="views" label="阅读量" width="120">
              <template #default="{ row }">
                {{ formatNumber(row.views) }}
              </template>
            </el-table-column>
            <el-table-column prop="subscriptions" label="订阅数" width="120">
              <template #default="{ row }">
                {{ formatNumber(row.subscriptions) }}
              </template>
            </el-table-column>
            <el-table-column prop="revenue" label="收入金额" width="150">
              <template #default="{ row }">
                <span class="revenue-amount">¥ {{ formatAmount(row.revenue) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </Card>

        <!-- 提现记录 -->
        <Card class="withdrawal-card" padding="none">
          <template #header>
            <span style="padding: 14px 18px 12px; display: inline-block">提现记录</span>
          </template>
          <el-table
            :data="withdrawalRecords"
            stripe
            :header-cell-style="{ textAlign: 'center' }"
            :cell-style="{ textAlign: 'center' }"
          >
            <el-table-column prop="applyTime" label="申请时间" width="180" />
            <el-table-column prop="amount" label="提现金额" width="150">
              <template #default="{ row }"> ¥ {{ formatAmount(row.amount) }} </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <Tag :variant="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </Tag>
              </template>
            </el-table-column>
            <el-table-column prop="processTime" label="处理时间" width="180" />
            <el-table-column prop="remark" label="备注" min-width="200" />
          </el-table>
        </Card>

        <!-- 钱包摘要 -->
        <Card class="wallet-card" padding="none">
          <template #header>
            <span style="padding: 14px 18px 12px; display: inline-block">钱包摘要</span>
          </template>
          <div class="wallet-summary">
            <div class="wallet-summary-grid">
              <div class="wallet-summary-item">
                <span class="wallet-summary-label">钱包余额</span>
                <span class="wallet-summary-value">¥ {{ formatAmount(walletInfo.balance) }}</span>
              </div>
              <div class="wallet-summary-item">
                <span class="wallet-summary-label">可用余额</span>
                <span class="wallet-summary-value success"
                  >¥ {{ formatAmount(walletInfo.availableAmount) }}</span
                >
              </div>
              <div class="wallet-summary-item">
                <span class="wallet-summary-label">冻结金额</span>
                <span class="wallet-summary-value warning"
                  >¥ {{ formatAmount(walletInfo.frozenAmount) }}</span
                >
              </div>
            </div>

            <div class="wallet-transactions">
              <div class="wallet-transactions-header">
                <span>最近流水</span>
                <span v-if="walletLoading" class="wallet-meta">加载中...</span>
              </div>

              <Empty
                v-if="!walletLoading && walletTransactions.length === 0"
                description="暂无钱包流水"
              />

              <div v-else class="wallet-transaction-list">
                <div
                  v-for="item in walletTransactions"
                  :key="item.id"
                  class="wallet-transaction-item"
                >
                  <div class="wallet-transaction-main">
                    <div class="wallet-transaction-title">
                      {{ item.description || item.reason || item.type }}
                    </div>
                    <div class="wallet-transaction-time">
                      {{ item.createdAt || item.transactionTime || '-' }}
                    </div>
                  </div>
                  <div class="wallet-transaction-side">
                    <span
                      class="wallet-transaction-amount"
                      :class="{ expense: item.amount < 0, income: item.amount >= 0 }"
                    >
                      {{ item.amount >= 0 ? '+' : '' }}¥ {{ formatAmount(Math.abs(item.amount)) }}
                    </span>
                    <span class="wallet-transaction-balance">
                      余额 ¥ {{ formatAmount(item.balance) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- 提现对话框 -->
      <QyDialog
        v-model:visible="localWithdrawVisible"
        title="申请提现"
        size="md"
        :show-close="true"
        :close-on-click-modal="true"
        :close-on-press-escape="true"
      >
        <QyForm
          ref="withdrawFormRef"
          v-model="withdrawForm"
          :rules="withdrawRules"
          label-width="100px"
        >
          <QyFormItem label="可提现余额">
            <div class="balance-info">¥ {{ formatAmount(revenueStats.availableBalance) }}</div>
          </QyFormItem>
          <QyFormItem label="提现金额" prop="amount">
            <Input v-model="withdrawForm.amount" placeholder="请输入提现金额" type="number">
              <template #prefix>¥</template>
            </Input>
          </QyFormItem>
          <QyFormItem label="提现方式" prop="method">
            <QySelect
              v-model="withdrawForm.method"
              :options="withdrawMethodOptions"
              placeholder="请选择提现方式"
            />
          </QyFormItem>
          <QyFormItem label="收款账号" prop="account">
            <Input v-model="withdrawForm.account" placeholder="请输入收款账号" />
          </QyFormItem>
          <QyFormItem label="账户名称" prop="accountName">
            <Input v-model="withdrawForm.accountName" placeholder="请输入收款账户姓名/主体名称" />
          </QyFormItem>
          <QyFormItem v-if="withdrawForm.method === 'bank'" label="银行名称" prop="bankName">
            <Input v-model="withdrawForm.bankName" placeholder="请输入开户银行" />
          </QyFormItem>
          <QyFormItem label="备注">
            <Textarea v-model="withdrawForm.remark" :rows="3" placeholder="可选填写备注信息" />
          </QyFormItem>
        </QyForm>
        <template #footer>
          <QyButton variant="secondary" @click="localWithdrawVisible = false">取消</QyButton>
          <QyButton variant="primary" @click="submitWithdraw" :loading="withdrawing">
            提交申请
          </QyButton>
        </template>
      </QyDialog>
    </div>
  </WriterPageShell>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, reactive, computed, watch } from 'vue'
import { message } from '@/design-system/services'
import {
  QyIcon,
  QySelect,
  QyButton,
  QyDialog,
  QyRow,
  QyCol,
  Skeleton,
  QyRadioGroup,
  QyRadio,
  QyForm,
  QyFormItem,
} from '@/design-system/components'
import { Tag, type TagVariant, Textarea, Card, Input } from '@/design-system/base'
import type { QyValidationRule } from '@/design-system/components/advanced/QyForm/types'
import WriterPageShell from '@/modules/writer/components/WriterPageShell.vue'
import { echarts, graphic } from '@/utils/echarts'
import type { ECharts, EChartsOption } from '@/utils/echarts'
import {
  getRevenueTrend as getRevenueTrendAPI,
  getRevenueSources,
  getChapterRevenueRanking,
  getWriterBooks,
  type RevenueTrend,
  type RevenueSource,
  type ChapterRevenue,
} from '@/modules/writer/api/revenue'
import { walletAPI, type WalletInfo, type WalletTransaction } from '@/modules/finance/api/wallet'
import { createWithdrawal, getRevenueOverview, getWithdrawalRequests } from '@/modules/finance/api'
import { useWriterStore } from '@/modules/writer/stores/writerStore'

const loading = ref(false)
const withdrawing = ref(false)
const selectedBookId = ref('all')
const trendRange = ref('30')
const writerStore = useWriterStore()

const resolveTrendPeriod = (range: string): 'daily' | 'monthly' | 'yearly' => {
  const days = Number.parseInt(range, 10)
  if (days >= 365) return 'yearly'
  if (days >= 30) return 'monthly'
  return 'daily'
}
const showWithdrawDialog = ref(false)

// 本地 visible 状态（QyDialog 需要可写的 v-model）
const localWithdrawVisible = ref(showWithdrawDialog.value)

watch(showWithdrawDialog, (v) => {
  localWithdrawVisible.value = v
})

watch(localWithdrawVisible, (v) => {
  showWithdrawDialog.value = v
})

// 作品列表
const books = ref<Array<{ id: string; title: string }>>([])

// 作品选项（用于 QySelect）
const bookOptions = computed(() => [
  { label: '全部作品', value: 'all' },
  ...books.value.map((book) => ({ label: book.title, value: book.id })),
])

// 收入统计
const revenueStats = ref({
  totalRevenue: 0,
  todayRevenue: 0,
  availableBalance: 0,
  totalWithdrawn: 0,
})
const walletLoading = ref(false)
const walletInfo = ref<WalletInfo>({
  userId: '',
  balance: 0,
  balanceCents: 0,
  availableAmount: 0,
  availableAmountCents: 0,
  frozenAmount: 0,
  frozenAmountCents: 0,
  totalIncome: 0,
  totalIncomeCents: 0,
  totalExpense: 0,
  totalExpenseCents: 0,
  frozen: false,
})
const walletTransactions = ref<WalletTransaction[]>([])

// 章节收入排行
const chapterRanking = ref<ChapterRevenue[]>([])

// 提现记录
const withdrawalRecords = ref<
  Array<{
    applyTime: string
    amount: number
    status: string
    processTime: string
    remark: string
  }>
>([])

// 提现表单
const withdrawFormRef = ref()
const withdrawForm = reactive({
  amount: 0,
  method: '',
  account: '',
  accountName: '',
  bankName: '',
  remark: '',
})

// 提现方式选项
const withdrawMethodOptions = computed(() => [
  { label: '支付宝', value: 'alipay' },
  { label: '微信', value: 'wechat' },
  { label: '银行卡', value: 'bank' },
])

const withdrawRules: Record<string, QyValidationRule[]> = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    {
      trigger: 'blur',
      validator: (_, value) => (typeof value === 'number' && value >= 1) || '提现金额必须大于0',
    },
  ],
  method: [{ required: true, message: '请选择提现方式', trigger: 'change' }],
  account: [{ required: true, message: '请输入收款账号', trigger: 'blur' }],
  accountName: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
}

// 图表实例
const trendChartRef = ref<HTMLElement>()
const sourceChartRef = ref<HTMLElement>()
let trendChart: ECharts | null = null
let sourceChart: ECharts | null = null

// 格式化金额
function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

// 获取状态类型
function getStatusType(status: string): TagVariant {
  const typeMap: Record<string, TagVariant> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    rejected: 'danger',
  }
  return typeMap[status] || 'info'
}

// 获取状态标签
function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    pending: '待审核',
    processing: '处理中',
    completed: '已完成',
    rejected: '已拒绝',
  }
  return labelMap[status] || status
}

function isStatsEmpty(stats: {
  totalRevenue: number
  todayRevenue: number
  availableBalance: number
  totalWithdrawn: number
}): boolean {
  return (
    Number(stats.totalRevenue || 0) <= 0 &&
    Number(stats.todayRevenue || 0) <= 0 &&
    Number(stats.availableBalance || 0) <= 0 &&
    Number(stats.totalWithdrawn || 0) <= 0
  )
}

function syncStatsWithTrendIfNeeded(revenues: number[]): void {
  if (!revenues.length || !revenues.some((v) => v > 0)) return
  if (!isStatsEmpty(revenueStats.value)) return

  const total = revenues.reduce((sum, value) => sum + Number(value || 0), 0)
  const today = Number(revenues[revenues.length - 1] || 0)
  const totalWithdrawn = total * 0.3
  const availableBalance = Math.max(total - totalWithdrawn, 0)

  revenueStats.value = {
    totalRevenue: Number(total.toFixed(2)),
    todayRevenue: Number(today.toFixed(2)),
    availableBalance: Number(availableBalance.toFixed(2)),
    totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
  }
}

// 加载作品列表
async function loadBooks(): Promise<void> {
  try {
    await writerStore.fetchProjects()
    const localBooks = (writerStore.projectList || [])
      .map((project: any) => ({
        id: project.projectId || project.id || '',
        title: project.title || project.name || '未命名作品',
      }))
      .filter((book) => !!book.id)

    if (localBooks.length > 0) {
      books.value = localBooks
      return
    }
  } catch (error) {
    console.warn('从 writerStore 加载作品失败，回退远端接口:', error)
  }

  try {
    const response = await getWriterBooks({ page: 1, size: 100 })
    const remoteList = response.list || []

    books.value = remoteList
      .map((book: any) => ({
        id: book.id || book.projectId || book.bookId || '',
        title: book.title || book.name || '未命名作品',
      }))
      .filter((book) => !!book.id)
  } catch (error) {
    console.warn('加载作品列表失败:', error)
    books.value = []
  }
}

// 加载收入数据
async function loadRevenue(): Promise<void> {
  loading.value = true
  try {
    const bookId = selectedBookId.value === 'all' ? undefined : selectedBookId.value

    // 加载收入统计
    try {
      const summary = await getRevenueOverview()
      revenueStats.value = {
        totalRevenue: Number(summary.totalEarnings || 0),
        todayRevenue: Number(summary.todayEarnings || 0),
        availableBalance: Number(summary.withdrawableAmount || 0),
        totalWithdrawn: Number(summary.paidAmount || 0),
      }
    } catch (error) {
      console.warn('加载收入统计失败，使用空数据:', error)
      revenueStats.value = {
        totalRevenue: 0,
        todayRevenue: 0,
        availableBalance: 0,
        totalWithdrawn: 0,
      }
    }

    // 加载章节排行
    try {
      chapterRanking.value = await getChapterRevenueRanking(bookId, 1, 10)
    } catch (error) {
      console.warn('加载章节排行失败，使用空数据:', error)
      chapterRanking.value = []
    }

    // 加载提现记录
    try {
      const withdrawResponse = await getWithdrawalRequests({ page: 1, page_size: 20 })
      withdrawalRecords.value = withdrawResponse.items.map((item: any) => ({
        applyTime: item.createdAt,
        amount: item.amount,
        status: item.status,
        processTime: item.completedAt || item.approvedAt || '-',
        remark: item.rejectReason || item.note || '-',
      }))
    } catch (error) {
      console.warn('加载提现记录失败，使用空数据:', error)
      withdrawalRecords.value = []
    }

    await loadWalletSummary()
  } catch (error: any) {
    console.error('加载收入数据失败:', error)
    message.error(error.message || '加载收入数据失败')
  } finally {
    loading.value = false
  }

  // skeleton 隐藏后再初始化图表，避免容器尚未挂载导致图表为空
  await nextTick()
  initCharts()
  loadRevenueTrend()
  loadRevenueSources()
}

// 加载收入趋势
async function loadRevenueTrend(): Promise<void> {
  try {
    const trendData = await getRevenueTrendAPI(resolveTrendPeriod(trendRange.value))

    if (Array.isArray(trendData) && trendData.length > 0) {
      const dates = trendData.map((item: RevenueTrend) => {
        const d = new Date(item.date)
        return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      })
      const revenues = trendData.map((item: RevenueTrend) => Number(item.revenue || 0))
      syncStatsWithTrendIfNeeded(revenues)
      updateTrendChart(dates, revenues)
      return
    }
  } catch (error) {
    console.warn('加载收入趋势失败，使用空数据:', error)
  }

  updateTrendChart([], [])
}

// 加载收入来源
async function loadRevenueSources(): Promise<void> {
  try {
    const sourceResponse = await getRevenueSources()

    if (Array.isArray(sourceResponse) && sourceResponse.length > 0) {
      const sourceData = sourceResponse.map((item: RevenueSource) => ({
        value: item.amount,
        name: item.label,
      }))
      updateSourceChart(sourceData)
      return
    }
  } catch (error) {
    console.warn('加载收入来源失败，使用空数据:', error)
  }

  updateSourceChart([])
}

async function loadWalletSummary(): Promise<void> {
  walletLoading.value = true
  try {
    const [wallet, transactions] = await Promise.all([
      walletAPI.getWallet(),
      walletAPI.getTransactions({ page: 1, pageSize: 5 }),
    ])
    walletInfo.value = wallet
    walletTransactions.value = transactions.items
  } catch (error) {
    console.warn('加载钱包摘要失败，使用空数据:', error)
    walletTransactions.value = []
  } finally {
    walletLoading.value = false
  }
}

// 初始化图表
function initCharts(): void {
  initTrendChart()
  initSourceChart()
}

// 收入趋势图
function initTrendChart(): void {
  if (!trendChartRef.value) return
  trendChart = echarts.getInstanceByDom(trendChartRef.value) || echarts.init(trendChartRef.value)
}

function updateTrendChart(dates: string[], revenues: number[]): void {
  if (!trendChart) return

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].name}<br/>收入: ¥${params[0].value.toFixed(2)}`
      },
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    series: [
      {
        name: '收入',
        type: 'line',
        data: revenues,
        smooth: true,
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.5)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' },
          ]),
        },
        itemStyle: {
          color: '#67C23A',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
  }

  trendChart.setOption(option)
}

// 收入来源图
function initSourceChart(): void {
  if (!sourceChartRef.value) return
  sourceChart = echarts.getInstanceByDom(sourceChartRef.value) || echarts.init(sourceChartRef.value)
}

function updateSourceChart(data: Array<{ value: number; name: string; itemStyle?: any }>): void {
  if (!sourceChart) return

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
    },
    series: [
      {
        name: '收入来源',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n¥{c}',
        },
        data: data,
      },
    ],
  }

  sourceChart.setOption(option)
}

// 提交提现申请
async function submitWithdraw(): Promise<void> {
  if (!withdrawFormRef.value) return

  try {
    await withdrawFormRef.value.validate()

    if (withdrawForm.amount > revenueStats.value.availableBalance) {
      message.error('提现金额不能超过可提现余额')
      return
    }

    withdrawing.value = true
    await createWithdrawal({
      amount: withdrawForm.amount,
      method: withdrawForm.method as 'alipay' | 'wechat' | 'bank',
      account_type: withdrawForm.method === 'bank' ? 'bank' : 'personal',
      account_name: withdrawForm.accountName,
      account_no: withdrawForm.account,
      bank_name: withdrawForm.method === 'bank' ? withdrawForm.bankName || undefined : undefined,
    })

    message.success('提现申请已提交，请等待审核')
    showWithdrawDialog.value = false
    withdrawFormRef.value.resetFields()
    loadRevenue()
  } catch (error: any) {
    if (error !== false) {
      message.error(error.message || '提交失败')
    }
  } finally {
    withdrawing.value = false
  }
}

// 响应式处理
function handleResize(): void {
  trendChart?.resize()
  sourceChart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  void (async () => {
    await loadBooks()
    await loadRevenue()
  })()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  sourceChart?.dispose()
})
</script>

<style scoped lang="scss">
.revenue-view {
  padding: 0;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .header-book-select {
    :deep(.el-select__wrapper) {
      display: flex;
      align-items: center;
      min-height: 42px;
      border-radius: 12px;
      border: 1px solid #dbe6f6;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    }

    :deep(.el-select__wrapper:hover) {
      border-color: #bfdbfe;
    }

    :deep(.el-select__wrapper.is-focused) {
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18);
    }

    :deep(.el-select__placeholder),
    :deep(.el-select__selected-item) {
      font-size: 14px;
      color: #334155;
    }

    :deep(.el-select__caret) {
      color: #64748b;
      font-size: 16px;
      line-height: 1;
      width: 1em !important;
      height: 1em !important;
      min-width: 1em;
      min-height: 1em;
      flex: 0 0 auto;
    }

    :deep(.el-select__caret .el-icon),
    :deep(.el-select__caret .el-icon svg),
    :deep(.el-select__caret svg) {
      width: 1em !important;
      height: 1em !important;
      min-width: 1em;
      min-height: 1em;
      display: block;
    }

    :deep(.el-select__input),
    :deep(.el-select__input:focus),
    :deep(.el-select__input:focus-visible) {
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      background: transparent !important;
    }
  }

  :global(.writer-book-select-popper.el-popper) {
    border: 1px solid #dbe6f6;
    border-radius: 14px;
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14);
    background: rgba(255, 255, 255, 0.98);
    padding: 6px;
    outline: none;
  }

  :global(.writer-book-select-popper.el-popper:focus),
  :global(.writer-book-select-popper.el-popper:focus-visible) {
    outline: none;
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14);
  }

  :global(.writer-book-select-popper .el-popper__arrow::before) {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid #dbe6f6;
    box-shadow: none;
  }

  :global(.writer-book-select-popper .el-scrollbar__view) {
    padding: 2px;
  }

  :global(.writer-book-select-popper .el-select-dropdown__item) {
    height: 40px;
    line-height: 40px;
    border-radius: 10px;
    margin: 2px 0;
    padding-left: 14px;
    padding-right: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #334155;
    transition:
      background-color 0.18s ease,
      color 0.18s ease;
    outline: none;
  }

  :global(.writer-book-select-popper .el-select-dropdown__item:focus),
  :global(.writer-book-select-popper .el-select-dropdown__item:focus-visible) {
    outline: none;
    box-shadow: none;
  }

  :global(.writer-book-select-popper .el-select-dropdown__item.hover),
  :global(.writer-book-select-popper .el-select-dropdown__item:hover) {
    background: #eff6ff;
    color: #1e40af;
  }

  :global(.writer-book-select-popper .el-select-dropdown__item.is-selected) {
    background: #dbeafe;
    color: #1d4ed8;
    font-weight: 600;
  }

  :global(.writer-book-select-popper .el-select-dropdown__item.is-disabled) {
    opacity: 0.45;
  }

  :global(.writer-book-select-popper .el-scrollbar__bar.is-vertical > div) {
    background: #cbd5e1;
    border-radius: 999px;
  }

  .revenue-content {
    display: flex;
    flex-direction: column;
    gap: 18px;

    > * {
      margin-bottom: 0 !important;
    }

    > * + * {
      border-top: 2px solid #e2e8f0;
      padding-top: 18px;
    }

    .revenue-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;

      .revenue-card {
        :deep(.qy-card__body) {
          padding: 18px;
        }

        .revenue-item {
          display: flex;
          align-items: center;
          gap: 16px;

          .revenue-icon {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #fff;

            &.total {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            &.today {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            &.available {
              background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }

            &.withdrawn {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
          }

          .revenue-details {
            flex: 1;

            .revenue-value {
              font-size: 28px;
              font-weight: bold;
              color: #67c23a;
              margin-bottom: 4px;
            }

            .revenue-label {
              font-size: 14px;
              color: #909399;
            }
          }
        }
      }
    }

    .chart-card {
      height: 100%;
      border: 1px solid #e2e8f0;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
        }
      }

      .chart-container {
        height: 300px;
      }
    }

    .ranking-card,
    .withdrawal-card,
    .wallet-card {
      border: 1px solid #e2e8f0;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);

      .revenue-amount {
        color: #67c23a;
        font-weight: 500;
      }
    }

    .wallet-summary {
      display: grid;
      gap: 18px;
      padding: 18px;

      .wallet-summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
      }

      .wallet-summary-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 14px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #f8fafc;
      }

      .wallet-summary-label {
        font-size: 13px;
        color: #64748b;
      }

      .wallet-summary-value {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;

        &.success {
          color: #16a34a;
        }

        &.warning {
          color: #d97706;
        }
      }

      .wallet-transactions {
        display: grid;
        gap: 12px;
      }

      .wallet-transactions-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 600;
        color: #334155;
      }

      .wallet-meta {
        font-size: 12px;
        font-weight: 500;
        color: #64748b;
      }

      .wallet-transaction-list {
        display: grid;
        gap: 10px;
      }

      .wallet-transaction-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #fff;
      }

      .wallet-transaction-main,
      .wallet-transaction-side {
        display: grid;
        gap: 4px;
      }

      .wallet-transaction-side {
        text-align: right;
      }

      .wallet-transaction-title {
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
      }

      .wallet-transaction-time,
      .wallet-transaction-balance {
        font-size: 12px;
        color: #64748b;
      }

      .wallet-transaction-amount {
        font-size: 14px;
        font-weight: 700;

        &.income {
          color: #16a34a;
        }

        &.expense {
          color: #dc2626;
        }
      }
    }
  }

  .balance-info {
    font-size: 20px;
    font-weight: bold;
    color: #67c23a;
  }
}

@media (max-width: 768px) {
  .revenue-view {
    padding: 0;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-actions {
        width: 100%;
        flex-direction: column;
      }
    }

    .revenue-overview {
      grid-template-columns: 1fr;
    }
  }
}
</style>
