<template>
  <div class="statistics-view">
    <div class="page-header">
      <h1>作品数据统计</h1>
      <el-select
        v-model="selectedBookId"
        placeholder="选择作品"
        style="width: 240px"
        @change="loadStatistics"
      >
        <el-option
          v-for="book in books"
          :key="book.id"
          :label="book.title"
          :value="book.id"
        />
      </el-select>
    </div>

    <el-skeleton v-if="loading" :rows="8" animated />

    <div v-else-if="!selectedBookId" class="empty-state">
      <el-empty description="请选择一部作品查看统计数据" />
    </div>

    <div v-else class="statistics-content">
      <!-- 统计概览 -->
      <div class="stats-overview">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total-views">
              <QyIcon name="View"  />
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ formatNumber(stats.totalViews) }}</div>
              <div class="stat-label">总阅读量</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon subscribers">
              <QyIcon name="Star"  />
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ formatNumber(stats.subscribers) }}</div>
              <div class="stat-label">订阅人数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon favorites">
              <QyIcon name="Collection"  />
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ formatNumber(stats.favorites) }}</div>
              <div class="stat-label">收藏数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon comments">
              <QyIcon name="ChatDotRound"  />
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ formatNumber(stats.comments) }}</div>
              <div class="stat-label">评论数</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 图表区域 -->
      <el-row :gutter="20">
        <!-- 阅读量趋势图 -->
        <el-col :span="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>阅读量趋势</span>
                <el-radio-group v-model="viewsTrendRange" size="small" @change="loadDailyStats">
                  <el-radio-button label="7">7天</el-radio-button>
                  <el-radio-button label="30">30天</el-radio-button>
                  <el-radio-button label="90">90天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="viewsChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 订阅增长图 -->
        <el-col :span="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <span>订阅增长</span>
            </template>
            <div ref="subscribersChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 章节热度分布 -->
        <el-col :span="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <span>章节阅读热度 TOP 10</span>
            </template>
            <div ref="chaptersChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 读者活跃度 -->
        <el-col :span="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <span>读者活跃度分布</span>
            </template>
            <div ref="readerActivityChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 阅读热力图 -->
      <el-card class="chart-card heatmap-card">
        <template #header>
          <span>阅读时段热力图</span>
        </template>
        <div ref="heatmapChartRef" class="heatmap-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import {
  getBookStats,
  getDailyStats,
  getSubscribersTrend,
  getChapterStats,
  getReaderActivity,
  getReadingHeatmap,
  type BookStats as BookStatsType,
  type DailyStats as DailyStatsType,
  type ChapterStats as ChapterStatsType
} from '@/modules/writer/api/statistics'
import { getWriterBooks } from '@/modules/writer/api/revenue'

const loading = ref(false)
const selectedBookId = ref('')
const viewsTrendRange = ref('30')

// 作品列表
const books = ref<Array<{ id: string; title: string }>>([])

// 加载作品列表
async function loadBooks(): Promise<void> {
  try {
    const response: any = await getWriterBooks({ page: 1, size: 100 })
    if (response.data?.list) {
      books.value = response.data.list
      // 自动选择第一本书
      if (books.value.length > 0 && !selectedBookId.value) {
        selectedBookId.value = books.value[0].id
        loadStatistics()
      }
    }
  } catch (error) {
    console.warn('加载作品列表失败，使用模拟数据:', error)
    // 使用模拟数据
    books.value = [
      { id: '1', title: '示例作品1' },
      { id: '2', title: '示例作品2' }
    ]
    selectedBookId.value = books.value[0].id
    loadStatistics()
  }
}

// 统计数据
const stats = ref({
  totalViews: 0,
  subscribers: 0,
  favorites: 0,
  comments: 0
})

// 图表实例
const viewsChartRef = ref<HTMLElement>()
const subscribersChartRef = ref<HTMLElement>()
const chaptersChartRef = ref<HTMLElement>()
const readerActivityChartRef = ref<HTMLElement>()
const heatmapChartRef = ref<HTMLElement>()

let viewsChart: ECharts | null = null
let subscribersChart: ECharts | null = null
let chaptersChart: ECharts | null = null
let readerActivityChart: ECharts | null = null
let heatmapChart: ECharts | null = null

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

// 加载统计数据
async function loadStatistics(): Promise<void> {
  if (!selectedBookId.value) return

  loading.value = true
  try {
    // 加载统计概览
    try {
      const response: any = await getBookStats(selectedBookId.value)
      if (response.data) {
        stats.value = response.data
      }
    } catch (error) {
      console.warn('加载统计概览失败，使用模拟数据:', error)
      // 使用模拟数据
      stats.value = {
        totalViews: 125800,
        subscribers: 8650,
        favorites: 4520,
        comments: 2180
      }
    }

    await nextTick()
    initCharts()
    loadDailyStats()
    loadChaptersStats()
    loadReaderActivity()
    loadReadingHeatmap()
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
    message.error(error.message || '加载统计数据失败')
  } finally {
    loading.value = false
  }
}

// 加载每日统计
async function loadDailyStats(): Promise<void> {
  try {
    const days = parseInt(viewsTrendRange.value)

    // 加载阅读量趋势
    try {
      const viewsResponse: any = await getDailyStats(selectedBookId.value, { days })
      if (viewsResponse.data && Array.isArray(viewsResponse.data)) {
        const dates = viewsResponse.data.map((item: any) => {
          const d = new Date(item.date)
          return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
        })
        const views = viewsResponse.data.map((item: any) => item.views)
        updateViewsChart(dates, views)
      } else {
        throw new Error('No data')
      }
    } catch (error) {
      console.warn('加载阅读量趋势失败，使用模拟数据:', error)
      // 使用模拟数据
      const dates: string[] = []
      const views: number[] = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
        views.push(Math.floor(Math.random() * 3000 + 1000))
      }
      updateViewsChart(dates, views)
    }

    // 加载订阅增长
    try {
      const subsResponse: any = await getSubscribersTrend(selectedBookId.value, { days })
      if (subsResponse.data && Array.isArray(subsResponse.data)) {
        const dates = subsResponse.data.map((item: any) => {
          const d = new Date(item.date)
          return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
        })
        const subscribers = subsResponse.data.map((item: any) => item.count || item.subscribers || 0)
        updateSubscribersChart(dates, subscribers)
      } else {
        throw new Error('No data')
      }
    } catch (error) {
      console.warn('加载订阅增长失败，使用模拟数据:', error)
      // 使用模拟数据
      const dates: string[] = []
      const subscribers: number[] = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
        subscribers.push(Math.floor(Math.random() * 100 + 50))
      }
      updateSubscribersChart(dates, subscribers)
    }
  } catch (error) {
    console.error('加载每日统计失败:', error)
  }
}

// 加载章节统计
async function loadChaptersStats(): Promise<void> {
  try {
    const response: any = await getChapterStats(selectedBookId.value, {
      sortBy: 'views',
      limit: 10
    })
    if (response.data && Array.isArray(response.data)) {
      const chapters = response.data.map((item: any) => item.chapterTitle)
      const views = response.data.map((item: any) => item.views)
      updateChaptersChart(chapters, views)
      return
    }
  } catch (error) {
    console.warn('加载章节统计失败，使用模拟数据:', error)
  }

  // 使用模拟数据
  const chapters = Array.from({ length: 10 }, (_, i) => `第${i + 1}章`)
  const views = Array.from({ length: 10 }, () => Math.floor(Math.random() * 5000 + 1000))
  updateChaptersChart(chapters, views)
}

// 加载读者活跃度
async function loadReaderActivity(): Promise<void> {
  try {
    const response: any = await getReaderActivity(selectedBookId.value)
    if (response.data && Array.isArray(response.data)) {
      const data = response.data.map((item: any) => ({
        value: item.count,
        name: item.label
      }))
      updateReaderActivityChart(data)
      return
    }
  } catch (error) {
    console.warn('加载读者活跃度失败，使用模拟数据:', error)
  }

  // 使用模拟数据
  const data = [
    { value: 3580, name: '每日活跃' },
    { value: 2150, name: '每周活跃' },
    { value: 1850, name: '每月活跃' },
    { value: 1070, name: '不活跃' }
  ]
  updateReaderActivityChart(data)
}

// 加载阅读热力图
async function loadReadingHeatmap(): Promise<void> {
  try {
    const response: any = await getReadingHeatmap(selectedBookId.value, { days: 7 })
    if (response.data && Array.isArray(response.data)) {
      const heatmapData = response.data.map((item: any) => [
        item.hour,
        item.day,
        item.value
      ])
      updateHeatmapChart(heatmapData)
      return
    }
  } catch (error) {
    console.warn('加载阅读热力图失败，使用模拟数据:', error)
  }

  // 使用模拟数据
  const heatmapData: number[][] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 7; day++) {
      heatmapData.push([hour, day, Math.floor(Math.random() * 500)])
    }
  }
  updateHeatmapChart(heatmapData)
}

// 初始化所有图表
function initCharts(): void {
  initViewsChart()
  initSubscribersChart()
  initChaptersChart()
  initReaderActivityChart()
  initHeatmapChart()
}

// 阅读量趋势图
function initViewsChart(): void {
  if (!viewsChartRef.value) return
  viewsChart = echarts.init(viewsChartRef.value)
}

function updateViewsChart(dates: string[], views: number[]): void {
  if (!viewsChart) return

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '阅读量',
        type: 'line',
        data: views,
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        itemStyle: {
          color: '#409EFF'
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

  viewsChart.setOption(option)
}

// 订阅增长图
function initSubscribersChart(): void {
  if (!subscribersChartRef.value) return
  subscribersChart = echarts.init(subscribersChartRef.value)
}

function updateSubscribersChart(dates: string[], subscribers: number[]): void {
  if (!subscribersChart) return

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增订阅',
        type: 'bar',
        data: subscribers,
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

  subscribersChart.setOption(option)
}

// 章节热度图
function initChaptersChart(): void {
  if (!chaptersChartRef.value) return
  chaptersChart = echarts.init(chaptersChartRef.value)

  // 模拟数据
  const chapters = Array.from({ length: 10 }, (_, i) => `第${i + 1}章`)
  const views = Array.from({ length: 10 }, () => Math.floor(Math.random() * 5000 + 1000))

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: chapters.reverse()
    },
    series: [
      {
        name: '阅读量',
        type: 'bar',
        data: views.reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#E6A23C' },
            { offset: 1, color: '#F56C6C' }
          ])
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

  chaptersChart.setOption(option)
}

// 读者活跃度图
function initReaderActivityChart(): void {
  if (!readerActivityChartRef.value) return
  readerActivityChart = echarts.init(readerActivityChartRef.value)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '读者活跃度',
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
          formatter: '{b}: {d}%'
        },
        data: [
          { value: 1048, name: '活跃用户', itemStyle: { color: '#67C23A' } },
          { value: 735, name: '一般用户', itemStyle: { color: '#409EFF' } },
          { value: 580, name: '沉默用户', itemStyle: { color: '#E6A23C' } },
          { value: 484, name: '流失用户', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }

  readerActivityChart.setOption(option)
}

// 阅读热力图
function initHeatmapChart(): void {
  if (!heatmapChartRef.value) return
  heatmapChart = echarts.init(heatmapChartRef.value)

  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = []

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      data.push([j, i, Math.floor(Math.random() * 100)])
    }
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '70%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#E6F4FF', '#1890FF', '#0050B3']
      }
    },
    series: [
      {
        name: '阅读量',
        type: 'heatmap',
        data: data,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  heatmapChart.setOption(option)
}

// 响应式处理
function handleResize(): void {
  viewsChart?.resize()
  subscribersChart?.resize()
  chaptersChart?.resize()
  readerActivityChart?.resize()
  heatmapChart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadBooks()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  viewsChart?.dispose()
  subscribersChart?.dispose()
  chaptersChart?.dispose()
  readerActivityChart?.dispose()
  heatmapChart?.dispose()
})
</script>

<style scoped lang="scss">
.statistics-view {
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
  }

  .empty-state {
    padding: 60px 0;
  }

  .statistics-content {
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 24px;

      .stat-card {
        .stat-item {
          display: flex;
          align-items: center;
          gap: 16px;

          .stat-icon {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #fff;

            &.total-views {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            &.subscribers {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            &.favorites {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }

            &.comments {
              background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }
          }

          .stat-details {
            flex: 1;

            .stat-value {
              font-size: 28px;
              font-weight: bold;
              color: #303133;
              margin-bottom: 4px;
            }

            .stat-label {
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

      &.heatmap-card .heatmap-container {
        height: 400px;
      }
    }
  }
}

@media (max-width: 768px) {
  .statistics-view {
    padding: 16px;

    .stats-overview {
      grid-template-columns: 1fr;
    }
  }
}
</style>

