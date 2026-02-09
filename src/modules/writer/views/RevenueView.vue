<template>
  <WriterPageShell>
    <div class="revenue-view">
      <div class="mb-5 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm md:p-6">
        <div class="page-header" style="margin-bottom: 0;">
          <h1>收入统计</h1>
          <div class="header-actions">
            <el-select
              v-model="selectedBookId"
              class="header-book-select"
              popper-class="writer-book-select-popper"
              placeholder="选择作品"
              style="width: 240px"
              @change="loadRevenue"
            >
              <el-option label="全部作品" value="all" />
              <el-option
                v-for="book in books"
                :key="book.id"
                :label="book.title"
                :value="book.id"
              />
            </el-select>
            <el-button type="primary" @click="showWithdrawDialog = true">
              申请提现
            </el-button>
          </div>
        </div>
        <p class="mt-2 text-sm text-slate-500">查看收入趋势、来源构成和提现记录，掌握作品商业表现。</p>
      </div>

    <el-skeleton v-if="loading" :rows="8" animated />

    <div v-else class="revenue-content">
      <!-- 收入概览 -->
      <div class="revenue-overview">
        <el-card class="revenue-card">
          <div class="revenue-item">
            <div class="revenue-icon total">
              <QyIcon name="Wallet"  />
            </div>
            <div class="revenue-details">
              <div class="revenue-value">¥ {{ formatAmount(revenueStats.totalRevenue) }}</div>
              <div class="revenue-label">总收入</div>
            </div>
          </div>
        </el-card>

        <el-card class="revenue-card">
          <div class="revenue-item">
            <div class="revenue-icon today">
              <QyIcon name="TrendCharts"  />
            </div>
            <div class="revenue-details">
              <div class="revenue-value">¥ {{ formatAmount(revenueStats.todayRevenue) }}</div>
              <div class="revenue-label">今日收入</div>
            </div>
          </div>
        </el-card>

        <el-card class="revenue-card">
          <div class="revenue-item">
            <div class="revenue-icon available">
              <QyIcon name="Money"  />
            </div>
            <div class="revenue-details">
              <div class="revenue-value">¥ {{ formatAmount(revenueStats.availableBalance) }}</div>
              <div class="revenue-label">可提现余额</div>
            </div>
          </div>
        </el-card>

        <el-card class="revenue-card">
          <div class="revenue-item">
            <div class="revenue-icon withdrawn">
              <QyIcon name="DocumentChecked"  />
            </div>
            <div class="revenue-details">
              <div class="revenue-value">¥ {{ formatAmount(revenueStats.totalWithdrawn) }}</div>
              <div class="revenue-label">已提现</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 收入趋势图 -->
      <el-row :gutter="20">
        <el-col :span="24" :lg="16">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>收入趋势</span>
                <el-radio-group v-model="trendRange" size="small" @change="loadRevenueTrend">
                  <el-radio-button label="7">7天</el-radio-button>
                  <el-radio-button label="30">30天</el-radio-button>
                  <el-radio-button label="90">90天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <el-col :span="24" :lg="8">
          <el-card class="chart-card">
            <template #header>
              <span>收入来源</span>
            </template>
            <div ref="sourceChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 章节收入排行 -->
      <el-card class="ranking-card">
        <template #header>
          <span>章节收入排行 TOP 10</span>
        </template>
        <el-table :data="chapterRanking" stripe>
          <el-table-column type="index" label="排名" width="80" />
          <el-table-column prop="chapterTitle" label="章节名称" min-width="200" />
          <el-table-column prop="views" label="阅读量" width="120" align="right">
            <template #default="{ row }">
              {{ formatNumber(row.views) }}
            </template>
          </el-table-column>
          <el-table-column prop="subscriptions" label="订阅数" width="120" align="right">
            <template #default="{ row }">
              {{ formatNumber(row.subscriptions) }}
            </template>
          </el-table-column>
          <el-table-column prop="revenue" label="收入金额" width="150" align="right">
            <template #default="{ row }">
              <span class="revenue-amount">¥ {{ formatAmount(row.revenue) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 提现记录 -->
      <el-card class="withdrawal-card">
        <template #header>
          <span>提现记录</span>
        </template>
        <el-table :data="withdrawalRecords" stripe>
          <el-table-column prop="applyTime" label="申请时间" width="180" />
          <el-table-column prop="amount" label="提现金额" width="150" align="right">
            <template #default="{ row }">
              ¥ {{ formatAmount(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="processTime" label="处理时间" width="180" />
          <el-table-column prop="remark" label="备注" min-width="200" />
        </el-table>
      </el-card>
    </div>

    <!-- 提现对话框 -->
    <el-dialog
      v-model="showWithdrawDialog"
      title="申请提现"
      width="500px"
    >
      <el-form
        ref="withdrawFormRef"
        :model="withdrawForm"
        :rules="withdrawRules"
        label-width="100px"
      >
        <el-form-item label="可提现余额">
          <div class="balance-info">
            ¥ {{ formatAmount(revenueStats.availableBalance) }}
          </div>
        </el-form-item>
        <el-form-item label="提现金额" prop="amount">
          <el-input
            v-model.number="withdrawForm.amount"
            placeholder="请输入提现金额"
            type="number"
          >
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="提现方式" prop="method">
          <el-select v-model="withdrawForm.method" placeholder="请选择提现方式">
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信" value="wechat" />
            <el-option label="银行卡" value="bank" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款账号" prop="account">
          <el-input
            v-model="withdrawForm.account"
            placeholder="请输入收款账号"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="withdrawForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可选填写备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showWithdrawDialog = false">取消</el-button>
        <el-button type="primary" @click="submitWithdraw" :loading="withdrawing">
          提交申请
        </el-button>
      </template>
    </el-dialog>
    </div>
  </WriterPageShell>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import WriterPageShell from '@/modules/writer/components/WriterPageShell.vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getRevenueStats,
  getRevenueTrend as getRevenueTrendAPI,
  getRevenueSources,
  getChapterRevenueRanking,
  type RevenueStats as RevenueStatsType,
  type ChapterRevenue
} from '@/modules/writer/api/revenue'
import { walletAPI } from '@/modules/shared/api'

const loading = ref(false)
const withdrawing = ref(false)
const selectedBookId = ref('all')
const trendRange = ref('30')
const showWithdrawDialog = ref(false)

// 作品列表
const books = ref([
  { id: '1', title: '示例作品1' },
  { id: '2', title: '示例作品2' }
])

// 收入统计
const revenueStats = ref({
  totalRevenue: 0,
  todayRevenue: 0,
  availableBalance: 0,
  totalWithdrawn: 0
})

// 章节收入排行
const chapterRanking = ref([])

// 提现记录
const withdrawalRecords = ref([])

// 提现表单
const withdrawFormRef = ref<FormInstance>()
const withdrawForm = reactive({
  amount: 0,
  method: '',
  account: '',
  remark: ''
})

const withdrawRules: FormRules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '提现金额必须大于0', trigger: 'blur' }
  ],
  method: [
    { required: true, message: '请选择提现方式', trigger: 'change' }
  ],
  account: [
    { required: true, message: '请输入收款账号', trigger: 'blur' }
  ]
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
function getStatusType(status: string): string {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态标签
function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    pending: '待审核',
    processing: '处理中',
    completed: '已完成',
    rejected: '已拒绝'
  }
  return labelMap[status] || status
}

function stableHash(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

function mockChapterRecord(bookId: string, bookTitle: string, chapterNo: number): ChapterRevenue {
  const base = stableHash(`${bookId}-${chapterNo}`)
  const views = 1200 + (base % 9800)
  const subscriptions = 80 + (base % 1200)
  const revenue = Number((subscriptions * (1.1 + (base % 9) * 0.08)).toFixed(2))
  return {
    id: `${bookId}-${chapterNo}`,
    chapterTitle: `${bookTitle} · 第${chapterNo}章`,
    chapterNumber: chapterNo,
    views,
    subscriptions,
    revenue,
    bookId,
    bookTitle
  }
}

function buildMockChapterRanking(targetBookId?: string): ChapterRevenue[] {
  const targetBooks = targetBookId
    ? books.value.filter(b => b.id === targetBookId)
    : books.value

  if (!targetBooks.length) return []

  const pool: ChapterRevenue[] = []
  targetBooks.forEach(book => {
    for (let i = 1; i <= 6; i++) {
      pool.push(mockChapterRecord(book.id, book.title, i))
    }
  })

  return pool
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
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

function normalizeRevenueStatsPayload(raw: any): RevenueStatsType | null {
  const payload = raw?.data?.data ?? raw?.data ?? raw
  if (!payload || typeof payload !== 'object') return null
  if (typeof payload.totalRevenue !== 'number') return null
  return payload as RevenueStatsType
}

function syncStatsWithTrendIfNeeded(revenues: number[]): void {
  if (!revenues.length || !revenues.some(v => v > 0)) return
  if (!isStatsEmpty(revenueStats.value)) return

  const total = revenues.reduce((sum, value) => sum + Number(value || 0), 0)
  const today = Number(revenues[revenues.length - 1] || 0)
  const totalWithdrawn = total * 0.3
  const availableBalance = Math.max(total - totalWithdrawn, 0)

  revenueStats.value = {
    totalRevenue: Number(total.toFixed(2)),
    todayRevenue: Number(today.toFixed(2)),
    availableBalance: Number(availableBalance.toFixed(2)),
    totalWithdrawn: Number(totalWithdrawn.toFixed(2))
  }
}

// 加载收入数据
async function loadRevenue(): Promise<void> {
  loading.value = true
  try {
    const bookId = selectedBookId.value === 'all' ? undefined : selectedBookId.value

    // 加载收入统计
    try {
      // 当前后端接口不接收 bookId 参数，按作者维度返回
      const statsResponse: any = await getRevenueStats()
      const normalized = normalizeRevenueStatsPayload(statsResponse)
      if (normalized) {
        revenueStats.value = {
          totalRevenue: Number(normalized.totalRevenue || 0),
          todayRevenue: Number(normalized.todayRevenue || 0),
          availableBalance: Number(normalized.availableBalance || 0),
          totalWithdrawn: Number(normalized.totalWithdrawn || 0)
        }
      }
    } catch (error) {
      console.warn('加载收入统计失败，使用模拟数据:', error)
      // 使用模拟数据
      revenueStats.value = {
        totalRevenue: 12580.50,
        todayRevenue: 235.80,
        availableBalance: 8650.30,
        totalWithdrawn: 3930.20
      }
    }

    // 加载章节排行
    try {
      // 排行接口要求具体 bookId；全部作品视图使用本地兜底展示
      if (!bookId) {
        chapterRanking.value = buildMockChapterRanking()
      } else {
        const rankingResponse: any = await getChapterRevenueRanking(bookId, 1, 10)
        const rankingData = rankingResponse?.data?.data ?? rankingResponse?.data ?? rankingResponse
        if (rankingData?.items && Array.isArray(rankingData.items)) {
          chapterRanking.value = rankingData.items
        } else if (rankingData?.list && Array.isArray(rankingData.list)) {
          chapterRanking.value = rankingData.list
        } else {
          chapterRanking.value = buildMockChapterRanking(bookId)
        }
      }
    } catch (error) {
      console.warn('加载章节排行失败，使用模拟数据:', error)
      chapterRanking.value = buildMockChapterRanking(bookId)
    }

    // 加载提现记录
    try {
      const withdrawResponse: any = await walletAPI.getWithdrawRequests()
      if (withdrawResponse.data) {
        withdrawalRecords.value = withdrawResponse.data.map((item: any) => ({
          applyTime: item.created_at || item.createdAt,
          amount: item.amount,
          status: item.status,
          processTime: item.processed_at || item.processedAt || '-',
          remark: item.remark || item.note || '-'
        }))
      }
    } catch (error) {
      console.warn('加载提现记录失败，使用模拟数据:', error)
      // 使用模拟数据
      withdrawalRecords.value = [
        {
          applyTime: '2024-01-20 10:30:00',
          amount: 1000,
          status: 'completed',
          processTime: '2024-01-21 14:20:00',
          remark: '提现成功'
        },
        {
          applyTime: '2024-01-15 15:45:00',
          amount: 500,
          status: 'completed',
          processTime: '2024-01-16 09:10:00',
          remark: '提现成功'
        }
      ]
    }

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
    const days = parseInt(trendRange.value)
    const response: any = await getRevenueTrendAPI(days)
    const trendData = response?.data?.data ?? response?.data ?? response

    if (Array.isArray(trendData)) {
      const dates = trendData.map((item: any) => {
        const d = new Date(item.date)
        return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      })
      const revenues = trendData.map((item: any) => Number(item.revenue || 0))
      syncStatsWithTrendIfNeeded(revenues)
      updateTrendChart(dates, revenues)
      return
    }
  } catch (error) {
    console.warn('加载收入趋势失败，使用模拟数据:', error)
  }

  // 使用模拟数据
  const days = parseInt(trendRange.value)
  const dates: string[] = []
  const revenues: number[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
    revenues.push(Math.random() * 500 + 100)
  }

  syncStatsWithTrendIfNeeded(revenues)
  updateTrendChart(dates, revenues)
}

// 加载收入来源
async function loadRevenueSources(): Promise<void> {
  try {
    const response: any = await getRevenueSources()
    const sourceResponse = response?.data?.data ?? response?.data ?? response

    if (Array.isArray(sourceResponse)) {
      const sourceData = sourceResponse.map((item: any) => ({
        value: item.amount,
        name: item.label
      }))
      updateSourceChart(sourceData)
      return
    }
  } catch (error) {
    console.warn('加载收入来源失败，使用模拟数据:', error)
  }

  // 使用模拟数据 - 使用现有的initSourceChart逻辑
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

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].name}<br/>收入: ¥${params[0].value.toFixed(2)}`
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        data: revenues,
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.5)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
          ])
        },
        itemStyle: {
          color: '#67C23A'
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }

  trendChart.setOption(option)
}

// 收入来源图
function initSourceChart(): void {
  if (!sourceChartRef.value) return
  sourceChart = echarts.getInstanceByDom(sourceChartRef.value) || echarts.init(sourceChartRef.value)

  // 默认数据
  const defaultData = [
    { value: 8580, name: '订阅收入', itemStyle: { color: '#409EFF' } },
    { value: 2850, name: '打赏收入', itemStyle: { color: '#67C23A' } },
    { value: 1150, name: '广告收入', itemStyle: { color: '#E6A23C' } }
  ]

  updateSourceChart(defaultData)
}

function updateSourceChart(data: Array<{ value: number; name: string; itemStyle?: any }>): void {
  if (!sourceChart) return

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
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
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n¥{c}'
        },
        data: data
      }
    ]
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
    await walletAPI.requestWithdraw({
      amount: withdrawForm.amount,
      account: withdrawForm.account,
      method: withdrawForm.method,
      remark: withdrawForm.remark
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
  loadRevenue()
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
      min-height: 42px;
      border-radius: 12px;
      border: 1px solid #dbe6f6;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
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
    transition: background-color 0.18s ease, color 0.18s ease;
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
        :deep(.el-card__body) {
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
              color: #67C23A;
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
      border: 1px solid #e2e8f0;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);

      :deep(.el-card__header) {
        border-bottom: 2px solid #e2e8f0;
        padding: 14px 18px 12px;
      }

      :deep(.el-card__header span) {
        position: relative;
        display: inline-flex;
        align-items: center;
        padding-left: 10px;
        font-size: 15px;
        font-weight: 700;
        color: #1e293b;
      }

      :deep(.el-card__header span::before) {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        width: 4px;
        height: 16px;
        transform: translateY(-50%);
        border-radius: 999px;
        background: #10b981;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart-container {
        height: 300px;
      }
    }

    .ranking-card,
    .withdrawal-card {
      border: 1px solid #e2e8f0;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);

      :deep(.el-card__header) {
        border-bottom: 2px solid #e2e8f0;
        padding: 14px 18px 12px;
      }

      :deep(.el-card__header span) {
        position: relative;
        display: inline-flex;
        align-items: center;
        padding-left: 10px;
        font-size: 15px;
        font-weight: 700;
        color: #1e293b;
      }

      :deep(.el-card__header span::before) {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        width: 4px;
        height: 16px;
        transform: translateY(-50%);
        border-radius: 999px;
        background: #10b981;
      }

      .revenue-amount {
        color: #67C23A;
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
