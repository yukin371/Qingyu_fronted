<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h2 class="page-title">管理仪表板</h2>
      <p class="page-subtitle">系统运营数据概览与快捷操作入口</p>
    </div>

    <div class="stat-cards">
      <div class="stat-card" @click="goToUsers">
        <div class="stat-icon primary">
          <el-icon :size="24"><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalUsers) }}</div>
          <div class="stat-label">用户总数</div>
          <div class="stat-meta">今日新增 {{ formatNumber(stats.newUsersToday) }}</div>
        </div>
      </div>

      <div class="stat-card highlight" @click="goToReviews">
        <div class="stat-icon danger">
          <el-icon :size="24"><DocumentChecked /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.pendingReviews) }}</div>
          <div class="stat-label">待审核</div>
          <div class="stat-badge">需处理</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon info">
          <el-icon :size="24"><Wallet /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(stats.totalRevenue) }}</div>
          <div class="stat-label">累计收入</div>
          <div class="stat-meta">当前后端未提供日收入趋势</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon warning">
          <el-icon :size="24"><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.activeUsers) }}</div>
          <div class="stat-label">活跃用户</div>
          <div class="stat-meta">作者数 {{ formatNumber(stats.authorsCount) }}</div>
        </div>
      </div>
    </div>

    <div class="section-title">
      <h3>快捷操作</h3>
      <span class="section-desc">常用管理功能入口</span>
    </div>
    <div class="quick-actions">
      <div class="action-card" @click="goToReviews">
        <div class="action-icon audit">
          <el-icon :size="28"><DocumentChecked /></el-icon>
        </div>
        <div class="action-info">
          <div class="action-title">内容审核</div>
          <div class="action-desc">审核书籍、章节等内容</div>
        </div>
        <div class="action-badge" v-if="stats.pendingReviews > 0">
          {{ stats.pendingReviews }}
        </div>
      </div>

      <div class="action-card" @click="goToWithdrawals">
        <div class="action-icon withdrawal">
          <el-icon :size="28"><Wallet /></el-icon>
        </div>
        <div class="action-info">
          <div class="action-title">提现审核</div>
          <div class="action-desc">处理用户提现申请</div>
        </div>
      </div>

      <div class="action-card" @click="goToUsers">
        <div class="action-icon users">
          <el-icon :size="28"><UserFilled /></el-icon>
        </div>
        <div class="action-info">
          <div class="action-title">用户管理</div>
          <div class="action-desc">管理平台用户信息</div>
        </div>
      </div>

      <div class="action-card" @click="goToCategories">
        <div class="action-icon category">
          <el-icon :size="28"><Grid /></el-icon>
        </div>
        <div class="action-info">
          <div class="action-title">分类管理</div>
          <div class="action-desc">维护书城分类结构</div>
        </div>
      </div>

      <div class="action-card" @click="goToLogs">
        <div class="action-icon logs">
          <el-icon :size="28"><Document /></el-icon>
        </div>
        <div class="action-info">
          <div class="action-title">操作日志</div>
          <div class="action-desc">查看系统操作记录</div>
        </div>
      </div>

      <div class="action-card" @click="goToBanners">
        <div class="action-icon banner">
          <el-icon :size="28"><Picture /></el-icon>
        </div>
        <div class="action-info">
          <div class="action-title">Banner管理</div>
          <div class="action-desc">管理首页轮播图</div>
        </div>
      </div>
    </div>

    <div class="section-title">
      <h3>数据概览</h3>
      <span class="section-desc">当前以真实接口返回的聚合数据为准</span>
    </div>
    <div class="charts-section">
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">用户规模概览</span>
          <el-radio-group v-model="userOverviewMode" size="small">
            <el-radio-button value="overview">概览</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="userChartRef" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">审核状态分布</span>
          <el-radio-group v-model="auditOverviewMode" size="small">
            <el-radio-button value="overview">概览</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="auditChartRef" class="chart-container"></div>
      </div>
    </div>

    <div class="section-title">
      <h3>最近活动</h3>
      <el-button text type="primary" :loading="activitiesLoading" @click="loadActivities">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
    <div class="recent-activities">
      <div v-if="recentActivities.length === 0" class="empty-state">
        <el-empty description="暂无操作日志" />
      </div>
      <div v-else v-for="activity in recentActivities" :key="activity.id" class="activity-item">
        <div class="activity-dot" :class="activity.type"></div>
        <div class="activity-content">
          <div class="activity-text">{{ activity.content }}</div>
          <div class="activity-time">{{ activity.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import {
  User,
  UserFilled,
  DocumentChecked,
  Wallet,
  TrendCharts,
  Refresh,
  Grid,
  Document,
  Picture,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getAuditStatistics, getDashboardStats, getOperationLogs } from '../api'
import type { OperationLog } from '../types/admin.types'

type DashboardMetrics = {
  totalUsers: number
  newUsersToday: number
  pendingReviews: number
  totalRevenue: number
  activeUsers: number
  authorsCount: number
  approved: number
  rejected: number
  highRisk: number
}

type ActivityItem = {
  id: string
  time: string
  type: 'primary' | 'success' | 'warning' | 'info'
  content: string
}

const router = useRouter()

const stats = ref<DashboardMetrics>({
  totalUsers: 0,
  newUsersToday: 0,
  pendingReviews: 0,
  totalRevenue: 0,
  activeUsers: 0,
  authorsCount: 0,
  approved: 0,
  rejected: 0,
  highRisk: 0,
})

const userOverviewMode = ref('overview')
const auditOverviewMode = ref('overview')
const activitiesLoading = ref(false)
const recentActivities = ref<ActivityItem[]>([])

const userChartRef = ref<HTMLElement>()
const auditChartRef = ref<HTMLElement>()

let userChart: echarts.ECharts | null = null
let auditChart: echarts.ECharts | null = null

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toLocaleString()
}

const formatCurrency = (num: number) => `¥${num.toLocaleString()}`

const formatDateTime = (value?: string | number) => {
  if (!value) return '未知时间'
  const date = typeof value === 'number' ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  return date.toLocaleString('zh-CN', { hour12: false })
}

const normalizeActivityType = (log: OperationLog): ActivityItem['type'] => {
  if (log.result === 'failure') return 'warning'
  if (/(approve|create|publish|enable)/i.test(log.action)) return 'success'
  if (/(delete|ban|reject|disable)/i.test(log.action)) return 'warning'
  return 'primary'
}

const formatActivityText = (log: OperationLog) => {
  const operator = log.operatorName || log.operatorId || '管理员'
  const action = log.action || '执行操作'
  const target = log.target || log.targetId || '系统资源'
  return `${operator} ${action} ${target}`.trim()
}

const initUserChart = () => {
  if (!userChartRef.value) return
  userChart?.dispose()
  userChart = echarts.init(userChartRef.value)
  userChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['总用户', '活跃用户', '作者数', '今日新增'],
      axisTick: { alignWithLabel: true },
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: [
          stats.value.totalUsers,
          stats.value.activeUsers,
          stats.value.authorsCount,
          stats.value.newUsersToday,
        ],
        itemStyle: {
          color: (params: { dataIndex: number }) =>
            ['#667eea', '#4facfe', '#fa709a', '#67c23a'][params.dataIndex] ?? '#667eea',
        },
        barMaxWidth: 56,
      },
    ],
  })
}

const initAuditChart = () => {
  if (!auditChartRef.value) return
  auditChart?.dispose()
  auditChart = echarts.init(auditChartRef.value)
  const seriesData = [
    { value: stats.value.pendingReviews, name: '待审核' },
    { value: stats.value.approved, name: '已通过' },
    { value: stats.value.rejected, name: '已拒绝' },
    { value: stats.value.highRisk, name: '高风险' },
  ]
  const hasData = seriesData.some(item => item.value > 0)
  auditChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        data: hasData ? seriesData : [{ value: 1, name: '暂无审核数据', itemStyle: { color: '#d1d5db' } }],
        label: { formatter: '{b}' },
      },
    ],
  })
}

const resizeCharts = () => {
  userChart?.resize()
  auditChart?.resize()
}

const loadActivities = async () => {
  activitiesLoading.value = true
  try {
    const response = await getOperationLogs({ page: 1, page_size: 5 })
    const logs = Array.isArray(response.data) ? response.data : []
    recentActivities.value = logs.map(log => ({
      id: log.id,
      time: formatDateTime(log.timestamp),
      type: normalizeActivityType(log),
      content: formatActivityText(log),
    }))
  } catch (error) {
    recentActivities.value = []
    console.error('Failed to load admin activities:', error)
    message.error('获取操作日志失败')
  } finally {
    activitiesLoading.value = false
  }
}

const loadDashboard = async () => {
  try {
    const [dashboardResponse, auditResponse] = await Promise.all([
      getDashboardStats(),
      getAuditStatistics(),
      loadActivities(),
    ])

    const auditData = (auditResponse as any)?.data ?? auditResponse ?? {}
    stats.value = {
      totalUsers: Number((dashboardResponse as any)?.totalUsers ?? 0),
      newUsersToday: Number((dashboardResponse as any)?.newUsersToday ?? 0),
      pendingReviews: Number((dashboardResponse as any)?.pendingAudits ?? auditData.pending ?? 0),
      totalRevenue: Number((dashboardResponse as any)?.totalRevenue ?? 0),
      activeUsers: Number((dashboardResponse as any)?.activeUsers ?? 0),
      authorsCount: Number((dashboardResponse as any)?.authorsCount ?? 0),
      approved: Number(auditData.approved ?? 0),
      rejected: Number(auditData.rejected ?? 0),
      highRisk: Number(auditData.highRisk ?? 0),
    }
  } catch (error) {
    console.error('Failed to load admin dashboard:', error)
    message.error('加载仪表盘失败')
  }
}

const goToReviews = () => router.push('/admin/reviews')
const goToWithdrawals = () => router.push('/admin/withdrawals')
const goToUsers = () => router.push('/admin/users')
const goToLogs = () => router.push('/admin/logs')
const goToCategories = () => router.push('/admin/categories')
const goToBanners = () => router.push('/admin/banners')

watch([stats, userOverviewMode], () => {
  initUserChart()
}, { deep: true })

watch([stats, auditOverviewMode], () => {
  initAuditChart()
}, { deep: true })

onMounted(async () => {
  await loadDashboard()
  await nextTick()
  initUserChart()
  initAuditChart()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  userChart?.dispose()
  auditChart?.dispose()
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;

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

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
  }

  .section-desc {
    margin-left: 12px;
    font-size: 13px;
    color: #9ca3af;
  }
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  &.highlight {
    background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
    border: 2px solid #f5576c;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;

    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.danger {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.info {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.warning {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 4px;
    }

    .stat-meta {
      margin-top: 8px;
      font-size: 13px;
      color: #9ca3af;
    }

    .stat-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 12px;
      background: #f5576c;
      color: #fff;
      font-size: 12px;
      font-weight: 500;
      border-radius: 12px;
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  position: relative;

  &:hover {
    border-color: transparent;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);

    .action-icon {
      transform: scale(1.1);
    }
  }

  .action-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: transform 0.3s ease;

    &.audit { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    &.withdrawal { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    &.users { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    &.category { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    &.logs { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #666; }
    &.banner { background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%); color: #666; }
  }

  .action-info {
    flex: 1;

    .action-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
    }

    .action-desc {
      font-size: 13px;
      color: #9ca3af;
      margin-top: 4px;
    }
  }

  .action-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    min-width: 24px;
    height: 24px;
    background: #f5576c;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
  }
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.chart-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .chart-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
    }
  }

  .chart-container {
    height: 280px;
  }
}

.recent-activities {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.empty-state {
  padding: 12px 0;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }

  .activity-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-top: 6px;
    flex-shrink: 0;

    &.primary { background: #409eff; }
    &.success { background: #67c23a; }
    &.warning { background: #e6a23c; }
    &.info { background: #909399; }
  }

  .activity-content {
    flex: 1;

    .activity-text {
      font-size: 14px;
      color: #374151;
    }

    .activity-time {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 4px;
    }
  }
}

@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
