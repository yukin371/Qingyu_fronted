<template>
  <div class="admin-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">管理仪表板</h2>
      <p class="page-subtitle">系统运营数据概览与快捷操作入口</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card" @click="goToUsers">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <el-icon :size="24"><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalUsers) }}</div>
          <div class="stat-label">用户总数</div>
          <div class="stat-trend positive">
            <el-icon><ArrowUp /></el-icon>
            {{ stats.userTrend }}%
          </div>
        </div>
      </div>

      <div class="stat-card highlight" @click="goToReviews">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <el-icon :size="24"><DocumentChecked /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pendingReviews }}</div>
          <div class="stat-label">待审核</div>
          <div class="stat-badge">需处理</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <el-icon :size="24"><Wallet /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(stats.todayIncome) }}</div>
          <div class="stat-label">今日收入</div>
          <div class="stat-trend positive">
            <el-icon><ArrowUp /></el-icon>
            {{ stats.incomeTrend }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
          <el-icon :size="24"><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.activeUsers) }}</div>
          <div class="stat-label">活跃用户</div>
          <div class="stat-trend negative">
            <el-icon><ArrowDown /></el-icon>
            {{ Math.abs(stats.activeTrend) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
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

    <!-- 图表区 -->
    <div class="section-title">
      <h3>数据统计</h3>
      <span class="section-desc">平台运营数据趋势</span>
    </div>
    <div class="charts-section">
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">用户增长趋势</span>
          <el-radio-group v-model="userGrowthPeriod" size="small">
            <el-radio-button label="week">周</el-radio-button>
            <el-radio-button label="month">月</el-radio-button>
            <el-radio-button label="year">年</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="userChartRef" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">交易金额趋势</span>
          <el-radio-group v-model="transactionPeriod" size="small">
            <el-radio-button label="week">周</el-radio-button>
            <el-radio-button label="month">月</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="transactionChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="section-title">
      <h3>最近活动</h3>
      <el-button text type="primary" @click="loadActivities">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
    <div class="recent-activities">
      <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
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
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import {
  User, UserFilled, DocumentChecked, Wallet, TrendCharts,
  ArrowUp, ArrowDown, Refresh, Grid, Document, Picture
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()

// 统计数据
const stats = ref({
  totalUsers: 12586,
  userTrend: 12.5,
  pendingReviews: 23,
  todayIncome: 15680.5,
  incomeTrend: 8.3,
  activeUsers: 3562,
  activeTrend: -2.1
})

// 图表周期选择
const userGrowthPeriod = ref('month')
const transactionPeriod = ref('week')

// 图表引用
const userChartRef = ref<HTMLElement>()
const transactionChartRef = ref<HTMLElement>()

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

// 格式化货币
const formatCurrency = (num: number) => {
  return '¥' + num.toLocaleString()
}

// 最近活动
const recentActivities = ref([
  { id: 1, time: '2025-10-21 14:30', type: 'primary', content: '用户 张三 注册成功' },
  { id: 2, time: '2025-10-21 14:25', type: 'success', content: '管理员 审核通过了书籍《测试书籍》' },
  { id: 3, time: '2025-10-21 14:20', type: 'warning', content: '用户 李四 申请提现 ¥500' },
  { id: 4, time: '2025-10-21 14:15', type: 'info', content: '系统自动清理了过期缓存' }
])

// 初始化用户增长图表
const initUserChart = () => {
  if (!userChartRef.value) return
  const chart = echarts.init(userChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增用户', '活跃用户'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        areaStyle: { color: 'rgba(102, 126, 234, 0.2)' },
        lineStyle: { color: '#667eea' },
        itemStyle: { color: '#667eea' }
      },
      {
        name: '活跃用户',
        type: 'line',
        smooth: true,
        data: [220, 182, 191, 234, 290, 330, 310],
        areaStyle: { color: 'rgba(79, 172, 254, 0.2)' },
        lineStyle: { color: '#4facfe' },
        itemStyle: { color: '#4facfe' }
      }
    ]
  })
  window.addEventListener('resize', () => chart.resize())
}

// 初始化交易图表
const initTransactionChart = () => {
  if (!transactionChartRef.value) return
  const chart = echarts.init(transactionChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['充值', '消费', '提现'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: { type: 'value' },
    series: [
      { name: '充值', type: 'bar', data: [2500, 3200, 2800, 3500, 3000, 4200, 3800], itemStyle: { color: '#67c23a' } },
      { name: '消费', type: 'bar', data: [1800, 2200, 1900, 2400, 2100, 2800, 2500], itemStyle: { color: '#409eff' } },
      { name: '提现', type: 'bar', data: [500, 800, 600, 900, 700, 1200, 1000], itemStyle: { color: '#e6a23c' } }
    ]
  })
  window.addEventListener('resize', () => chart.resize())
}

// 加载活动
const loadActivities = () => {
  message.success('数据已刷新')
}

// 路由跳转
const goToReviews = () => router.push('/admin/reviews')
const goToWithdrawals = () => router.push('/admin/withdrawals')
const goToUsers = () => router.push('/admin/users')
const goToLogs = () => router.push('/admin/logs')
const goToCategories = () => router.push('/admin/categories')
const goToBanners = () => router.push('/admin/banners')

// 监听周期变化
watch([userGrowthPeriod, transactionPeriod], () => {
  console.log('Period changed')
})

onMounted(async () => {
  await nextTick()
  initUserChart()
  initTransactionChart()
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

// 统计卡片
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

    .stat-trend {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 13px;
      margin-top: 8px;
      padding: 2px 8px;
      border-radius: 12px;

      &.positive {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }

      &.negative {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }
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

// 快捷操作
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

// 图表区
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

// 最近活动
.recent-activities {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

// 响应式
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
