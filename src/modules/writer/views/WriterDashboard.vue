<template>
  <div class="writer-dashboard">
    <div class="dashboard-header">
      <h1>创作工作台</h1>
      <p class="welcome-text">欢迎回来，{{ userName }}！继续你的创作之旅</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background-color: #409eff20;">
            <el-icon :size="32" color="#409eff"><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(stats.totalWords) }}</div>
            <div class="stat-label">总字数</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background-color: #67c23a20;">
            <el-icon :size="32" color="#67c23a"><Reading /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.bookCount }}</div>
            <div class="stat-label">作品数量</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background-color: #e6a23c20;">
            <el-icon :size="32" color="#e6a23c"><EditPen /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(stats.todayWords) }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background-color: #f5622120;">
            <el-icon :size="32" color="#f56221"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Star /></el-icon>
          <span>快捷操作</span>
        </div>
      </template>
      <div class="quick-actions">
        <el-button type="primary" size="large" @click="createProject">
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
        <el-button type="success" size="large" @click="quickWrite">
          <el-icon><Edit /></el-icon>
          快速写作
        </el-button>
        <el-button type="warning" size="large" @click="goToPublish">
          <el-icon><Upload /></el-icon>
          发布管理
        </el-button>
        <el-button size="large" @click="goToStatistics">
          <el-icon><DataAnalysis /></el-icon>
          数据统计
        </el-button>
      </div>
    </el-card>

    <!-- 最近项目 -->
    <el-card class="recent-projects-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div>
            <el-icon><Folder /></el-icon>
            <span>最近项目</span>
          </div>
          <el-link type="primary" :underline="false" @click="goToAllProjects">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-link>
        </div>
      </template>

      <div v-if="loadingProjects" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="recentProjects.length === 0" class="empty-container">
        <el-empty description="还没有项目，创建一个开始吧！" />
      </div>

      <div v-else class="project-list">
        <div
          v-for="project in recentProjects"
          :key="project.projectId"
          class="project-item"
          @click="openProject(project.projectId)"
        >
          <div class="project-info">
            <div class="project-title">{{ project.title }}</div>
            <div class="project-meta">
              <el-tag size="small" :type="getStatusType(project.status)">
                {{ getStatusText(project.status) }}
              </el-tag>
              <span class="word-count">{{ formatNumber(project.wordCount || 0) }} 字</span>
              <span class="update-time">{{ formatDateTime(project.updatedAt) }}</span>
            </div>
          </div>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>
      </div>
    </el-card>

    <!-- 写作目标 -->
    <el-card class="writing-goal-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><TrendCharts /></el-icon>
          <span>今日写作目标</span>
        </div>
      </template>
      <div class="goal-progress">
        <el-progress
          :percentage="goalPercentage"
          :color="customColorMethod"
          :stroke-width="20"
        >
          <span class="percentage-label">{{ stats.todayWords }} / {{ writingGoal }} 字</span>
        </el-progress>
        <div class="goal-tips">
          <span v-if="goalPercentage >= 100" class="goal-completed">
            🎉 恭喜！今日目标已完成
          </span>
          <span v-else class="goal-remaining">
            还需 {{ writingGoal - stats.todayWords }} 字完成目标
          </span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document,
  Reading,
  EditPen,
  Clock,
  Star,
  Plus,
  Edit,
  Upload,
  DataAnalysis,
  Folder,
  ArrowRight,
  TrendCharts
} from '@element-plus/icons-vue'
import { getProjects, type Project } from '../api/projects'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 用户名
const userName = computed(() => authStore.user?.nickname || '作者')

// 统计数据
const stats = ref({
  totalWords: 0,
  bookCount: 0,
  todayWords: 0,
  pending: 0
})

// 最近项目
const recentProjects = ref<Project[]>([])
const loadingProjects = ref(true)

// 写作目标
const writingGoal = ref(2000)

// 目标完成百分比
const goalPercentage = computed(() => {
  return Math.min(Math.round((stats.value.todayWords / writingGoal.value) * 100), 100)
})

// 进度条颜色
const customColorMethod = (percentage: number) => {
  if (percentage < 30) return '#f56c6c'
  if (percentage < 70) return '#e6a23c'
  return '#67c23a'
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await getProjects({ page: 1, pageSize: 100 })
    const projects = response.data || []

    // 计算统计数据
    stats.value.bookCount = projects.length
    stats.value.totalWords = projects.reduce((sum, p) => sum + (p.wordCount || 0), 0)

    // 模拟今日新增（实际应该从后端获取）
    stats.value.todayWords = 1250
    stats.value.pending = projects.filter(p => p.status === 'draft').length
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载最近项目
const loadRecentProjects = async () => {
  loadingProjects.value = true
  try {
    const response = await getProjects({
      page: 1,
      pageSize: 5,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    })
    recentProjects.value = response.data || []
  } catch (error) {
    console.error('加载最近项目失败:', error)
    ElMessage.error('加载项目失败')
  } finally {
    loadingProjects.value = false
  }
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

// 格式化日期时间
const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

  return date.toLocaleDateString()
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    draft: 'info',
    writing: 'warning',
    completed: 'success',
    published: 'success'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    writing: '写作中',
    completed: '已完成',
    published: '已发布'
  }
  return textMap[status] || status
}

// 创建项目
const createProject = () => {
  router.push('/writer/projects')
  // 触发创建对话框（需要通过事件或状态管理）
}

// 快速写作
const quickWrite = () => {
  if (recentProjects.value.length > 0) {
    openProject(recentProjects.value[0].projectId)
  } else {
    ElMessage.info('请先创建一个项目')
    router.push('/writer/projects')
  }
}

// 前往发布管理
const goToPublish = () => {
  router.push('/writer/publish')
}

// 前往数据统计
const goToStatistics = () => {
  router.push('/writer/statistics')
}

// 查看所有项目
const goToAllProjects = () => {
  router.push('/writer/projects')
}

// 打开项目
const openProject = (projectId: string) => {
  router.push(`/writer/project/${projectId}`)
}

// 初始化
onMounted(() => {
  loadStats()
  loadRecentProjects()
})
</script>

<style scoped lang="scss">
.writer-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #303133;
  }

  .welcome-text {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  cursor: default;

  :deep(.el-card__body) {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
    min-width: 0;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      color: #909399;
    }
  }
}

.quick-actions-card,
.recent-projects-card,
.writing-goal-card {
  margin-bottom: 20px;
  border-radius: 8px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 600;
    color: #303133;

    > div,
    > span {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .el-icon {
      font-size: 18px;
    }
  }
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .el-button {
    flex: 1;
    min-width: 140px;
  }
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

.project-list {
  .project-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f7fa;
      transform: translateX(4px);
    }

    &:not(:last-child) {
      border-bottom: 1px solid #ebeef5;
    }

    .project-info {
      flex: 1;
      min-width: 0;

      .project-title {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .project-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        color: #909399;

        .word-count {
          color: #606266;
        }
      }
    }

    .arrow-icon {
      color: #c0c4cc;
      font-size: 16px;
      transition: transform 0.3s;
    }

    &:hover .arrow-icon {
      transform: translateX(4px);
      color: #409eff;
    }
  }
}

.goal-progress {
  .el-progress {
    margin-bottom: 16px;
  }

  .percentage-label {
    font-size: 13px;
    font-weight: 500;
  }

  .goal-tips {
    text-align: center;
    font-size: 14px;

    .goal-completed {
      color: #67c23a;
      font-weight: 500;
    }

    .goal-remaining {
      color: #606266;
    }
  }
}

@media (max-width: 768px) {
  .writer-dashboard {
    padding: 16px;
  }

  .stats-row {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }

  .stat-card {
    :deep(.el-card__body) {
      padding: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;

      .el-icon {
        font-size: 24px !important;
      }
    }

    .stat-content {
      .stat-value {
        font-size: 20px;
      }
    }
  }

  .quick-actions {
    .el-button {
      flex: 1 1 calc(50% - 6px);
      min-width: 0;
    }
  }
}
</style>

