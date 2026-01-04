<template>
  <div class="revenue-view">
    <div class="page-header">
      <h1>收入统计</h1>
      <div class="header-actions">
        <el-select
          v-model="selectedBookId"
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

    <el-skeleton v-if="loading" :rows="8" animated />

    <div v-else class="revenue-content">
      <!-- 收入概览 -->
      <div class="revenue-overview">
        <el-card class="revenue-card">
          <div class="revenue-item">
            <div class="revenue-icon total">
              <el-icon><Wallet /></el-icon>
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
              <el-icon><TrendCharts /></el-icon>
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
              <el-icon><Money /></el-icon>
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
              <el-icon><DocumentChecked /></el-icon>
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Wallet, TrendCharts, Money, DocumentChecked } from '@element-plus/icons-vue'
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
} from '@/api/writer/revenue'
import { walletAPI } from '@/api/shared'

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

// 加载收入数据
async function loadRevenue(): Promise<void> {
  loading.value = true
  try {
    const bookId = selectedBookId.value === 'all' ? undefined : selectedBookId.value

    // 加载收入统计
    try {
      const statsResponse: any = await getRevenueStats({ bookId })
      if (statsResponse.data) {
        revenueStats.value = statsResponse.data
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
      const rankingResponse: any = await getChapterRevenueRanking({
        bookId,
        page: 1,
        size: 10
      })
      if (rankingResponse.data?.list) {
        chapterRanking.value = rankingResponse.data.list
      }
    } catch (error) {
      console.warn('加载章节排行失败，使用模拟数据:', error)
      // 使用模拟数据
      chapterRanking.value = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        chapterTitle: `第${i + 1}章 章节标题`,
        chapterNumber: i + 1,
        views: Math.floor(Math.random() * 10000 + 1000),
        subscriptions: Math.floor(Math.random() * 1000 + 100),
        revenue: Math.random() * 500 + 100
      }))
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

    await nextTick()
    initCharts()
    loadRevenueTrend()
    loadRevenueSources()
  } catch (error: any) {
    console.error('加载收入数据失败:', error)
    ElMessage.error(error.message || '加载收入数据失败')
  } finally {
    loading.value = false
  }
}

// 加载收入趋势
async function loadRevenueTrend(): Promise<void> {
  try {
    const days = parseInt(trendRange.value)
    const bookId = selectedBookId.value === 'all' ? undefined : selectedBookId.value

    const response: any = await getRevenueTrendAPI({ bookId, days })

    if (response.data && Array.isArray(response.data)) {
      const dates = response.data.map((item: any) => {
        const d = new Date(item.date)
        return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      })
      const revenues = response.data.map((item: any) => item.revenue)
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

  updateTrendChart(dates, revenues)
}

// 加载收入来源
async function loadRevenueSources(): Promise<void> {
  try {
    const bookId = selectedBookId.value === 'all' ? undefined : selectedBookId.value
    const response: any = await getRevenueSources({ bookId })

    if (response.data && Array.isArray(response.data)) {
      const sourceData = response.data.map((item: any) => ({
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
  trendChart = echarts.init(trendChartRef.value)
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
  sourceChart = echarts.init(sourceChartRef.value)

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
      ElMessage.error('提现金额不能超过可提现余额')
      return
    }

    withdrawing.value = true
    await walletAPI.requestWithdraw({
      amount: withdrawForm.amount,
      account: withdrawForm.account,
      method: withdrawForm.method,
      remark: withdrawForm.remark
    })

    ElMessage.success('提现申请已提交，请等待审核')
    showWithdrawDialog.value = false
    withdrawFormRef.value.resetFields()
    loadRevenue()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '提交失败')
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
  padding: 24px;

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

  .revenue-content {
    .revenue-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 24px;

      .revenue-card {
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
      margin-bottom: 20px;

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
      margin-bottom: 20px;

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
    padding: 16px;

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

