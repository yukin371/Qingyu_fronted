<template>
  <div class="admin-dashboard">
    <h2 class="page-title">管理仪表板</h2>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <StatCard
        title="用户总数"
        :value="stats.totalUsers"
        icon="el-icon-user"
        iconBg="#409eff"
        :trend="stats.userTrend"
        @click="goToUsers"
      />
      <StatCard
        title="待审核"
        :value="stats.pendingReviews"
        icon="el-icon-document-checked"
        iconBg="#e6a23c"
        @click="goToReviews"
      />
      <StatCard
        title="今日收入"
        :value="stats.todayIncome"
        icon="el-icon-wallet"
        iconBg="#67c23a"
        format="currency"
        :trend="stats.incomeTrend"
      />
      <StatCard
        title="活跃用户"
        :value="stats.activeUsers"
        icon="el-icon-data-analysis"
        iconBg="#f56c6c"
        :trend="stats.activeTrend"
      />
    </div>

    <!-- 图表区 -->
    <div class="charts-section">
      <div class="chart-row">
        <ChartCard title="用户增长趋势" :option="userGrowthOption" height="350px">
          <template #extra>
            <el-radio-group v-model="userGrowthPeriod" size="small">
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="year">年</el-radio-button>
            </el-radio-group>
          </template>
        </ChartCard>

        <ChartCard title="交易金额趋势" :option="transactionOption" height="350px">
          <template #extra>
            <el-radio-group v-model="transactionPeriod" size="small">
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
            </el-radio-group>
          </template>
        </ChartCard>
      </div>

      <div class="chart-row">
        <ChartCard title="内容发布统计" :option="contentOption" height="350px" />
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <div class="activities-header">
        <h3>最近活动</h3>
        <el-button text :icon="Refresh" @click="loadActivities">刷新</el-button>
      </div>
      <el-timeline>
        <el-timeline-item
          v-for="activity in recentActivities"
          :key="activity.id"
          :timestamp="activity.time"
          :type="activity.type"
        >
          <p>{{ activity.content }}</p>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3>快捷操作</h3>
      <div class="action-buttons">
        <el-button :icon="DocumentChecked" type="primary" @click="goToReviews">
          内容审核
        </el-button>
        <el-button :icon="Wallet" type="success" @click="goToWithdrawals">
          提现审核
        </el-button>
        <el-button :icon="User" @click="goToUsers">用户管理</el-button>
        <el-button :icon="Document" @click="goToLogs">操作日志</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, DocumentChecked, Wallet, User, Document } from '@element-plus/icons-vue'
import StatCard from '@admin/components/StatCard.vue'
import ChartCard from '@admin/components/ChartCard.vue'
import type { EChartsOption } from 'echarts'

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

// 用户增长趋势图表配置
const userGrowthOption = ref<EChartsOption>({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['新增用户', '活跃用户']
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90, 230, 210],
      areaStyle: {
        opacity: 0.3
      }
    },
    {
      name: '活跃用户',
      type: 'line',
      smooth: true,
      data: [220, 182, 191, 234, 290, 330, 310],
      areaStyle: {
        opacity: 0.3
      }
    }
  ]
})

// 交易金额趋势图表配置
const transactionOption = ref<EChartsOption>({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['充值', '消费', '提现']
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '充值',
      type: 'bar',
      data: [2500, 3200, 2800, 3500, 3000, 4200, 3800]
    },
    {
      name: '消费',
      type: 'bar',
      data: [1800, 2200, 1900, 2400, 2100, 2800, 2500]
    },
    {
      name: '提现',
      type: 'bar',
      data: [500, 800, 600, 900, 700, 1200, 1000]
    }
  ]
})

// 内容发布统计图表配置
const contentOption = ref<EChartsOption>({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center'
  },
  series: [
    {
      name: '内容类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      data: [
        { value: 1048, name: '书籍' },
        { value: 735, name: '章节' },
        { value: 580, name: '评论' },
        { value: 484, name: '文档' }
      ]
    }
  ]
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    time: '2025-10-21 14:30',
    type: 'primary',
    content: '用户 张三 注册成功'
  },
  {
    id: 2,
    time: '2025-10-21 14:25',
    type: 'success',
    content: '管理员 审核通过了书籍《测试书籍》'
  },
  {
    id: 3,
    time: '2025-10-21 14:20',
    type: 'warning',
    content: '用户 李四 申请提现 ¥500'
  },
  {
    id: 4,
    time: '2025-10-21 14:15',
    type: 'info',
    content: '系统自动清理了过期缓存'
  }
])

// 加载活动
const loadActivities = () => {
  ElMessage.success('数据已刷新')
}

// 路由跳转
const goToReviews = () => {
  router.push('/admin/reviews')
}

const goToWithdrawals = () => {
  router.push('/admin/withdrawals')
}

const goToUsers = () => {
  router.push('/admin/users')
}

const goToLogs = () => {
  router.push('/admin/logs')
}

// 监听周期变化，更新图表
watch(userGrowthPeriod, (newVal) => {
  // 这里可以根据周期加载不同的数据
  console.log('User growth period changed to:', newVal)
})

watch(transactionPeriod, (newVal) => {
  console.log('Transaction period changed to:', newVal)
})

onMounted(() => {
  // 加载仪表板数据
  console.log('Dashboard mounted')
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.recent-activities {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  .activities-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.quick-actions {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: 1200px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>

