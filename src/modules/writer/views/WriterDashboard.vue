<template>
  <div class="writer-dashboard">
    <!-- 1. 顶部欢迎区 -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="title">创作工作台</h1>
        <p class="subtitle">
          欢迎回来，<span class="username">{{ userName }}</span
          >！继续你的创作之旅
        </p>
      </div>
      <div class="header-actions">
        <!-- 可选：放置日期筛选或设置按钮 -->
      </div>
    </div>
    <!-- 2. 核心数据概览 (Stats) -->
    <div class="stats-grid">
      <div v-for="(item, index) in statCards" :key="index" class="stats-grid-item">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{ backgroundColor: item.bgColor }">
            <el-icon :size="24" :color="item.iconColor">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(item.value) }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </el-card>
      </div>
    </div>

    <div class="main-content-grid">
      <!-- 左侧主要区域 -->
      <div class="left-pane">
        <!-- 3. 快捷操作 -->
        <el-card class="section-card quick-actions" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title"> <QyIcon name="Lightning" /> 快捷操作 </span>
            </div>
          </template>
          <div class="action-grid">
            <div class="action-item" @click="createProject">
              <div class="icon-box primary"><QyIcon name="Plus" /></div>
              <span>新建作品</span>
            </div>
            <div class="action-item" @click="quickWrite">
              <div class="icon-box success"><QyIcon name="EditPen" /></div>
              <span>快速写作</span>
            </div>
            <div class="action-item" @click="goToPublish">
              <div class="icon-box warning"><QyIcon name="Upload" /></div>
              <span>发布管理</span>
            </div>
            <div class="action-item" @click="goToStatistics">
              <div class="icon-box info"><QyIcon name="DataAnalysis" /></div>
              <span>数据报表</span>
            </div>
          </div>
        </el-card>

        <!-- 4. 最近编辑的项目 -->
        <el-card class="section-card recent-projects" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title"> <QyIcon name="Timer" /> 最近编辑 </span>
              <el-button link type="primary" @click="goToAllProjects">
                全部项目 <QyIcon name="ArrowRight" />
              </el-button>
            </div>
          </template>

          <div v-if="loadingProjects" class="loading-skeleton">
            <el-skeleton :rows="3" animated />
          </div>

          <el-empty
            v-else-if="recentProjects.length === 0"
            description="暂无最近编辑的项目"
            :image-size="80"
          />

          <div v-else class="project-list">
            <div
              v-for="project in recentProjects"
              :key="project.id"
              class="project-list-item"
              @click="openProject(project.id)"
            >
              <div class="item-cover" :style="getCoverStyle(project.title)">
                <el-image
                  v-if="project.coverImage"
                  :src="project.coverImage"
                  fit="cover"
                  class="cover-img"
                />
                <span v-else class="cover-text">{{ project.title.charAt(0) }}</span>
              </div>

              <div class="item-content">
                <div class="item-header">
                  <h4 class="item-title">{{ project.title }}</h4>
                  <el-tag size="small" :type="getStatusType(project.status)" effect="plain" round>
                    {{ getStatusText(project.status) }}
                  </el-tag>
                </div>
                <div class="item-meta">
                  <span><QyIcon name="Document" /> {{ formatNumber(project.totalWords) }} 字</span>
                  <el-divider direction="vertical" />
                  <span><QyIcon name="Clock" /> {{ formatTime(project.lastUpdateTime) }}</span>
                </div>
              </div>

              <el-button link class="enter-btn" icon="ArrowRight" />
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧辅助区域 -->
      <div class="right-pane">
        <!-- 5. 今日目标 -->
        <el-card class="section-card writing-goal" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title"> <QyIcon name="Trophy" /> 今日目标 </span>
              <el-button link size="small" @click="editGoal">设置</el-button>
            </div>
          </template>

          <div class="goal-content">
            <el-progress
              type="dashboard"
              :percentage="goalPercentage"
              :color="goalColors"
              :width="140"
            >
              <template #default="{ percentage }">
                <span class="progress-value">{{ percentage }}%</span>
                <span class="progress-label">完成度</span>
              </template>
            </el-progress>

            <div class="goal-stats">
              <div class="stat-row">
                <span class="label">今日新增</span>
                <span class="val highlight">{{ stats.todayWords }}</span>
              </div>
              <div class="stat-row">
                <span class="label">目标字数</span>
                <span class="val">{{ writingGoal }}</span>
              </div>
            </div>
          </div>

          <div class="goal-message" v-if="goalPercentage >= 100">🎉 太棒了！今日目标已达成！</div>
        </el-card>

        <!-- 6. 每日灵感 (新增) -->
        <el-card class="section-card daily-quote" shadow="hover">
          <div class="quote-content">
            <el-icon class="quote-icon">
              <QyIcon name="ChatDotRound" />
            </el-icon>
            <p class="quote-text">“写作就是把原本不存在的事物变成存在。”</p>
            <p class="quote-author">—— 佚名</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Reading, EditPen, Clock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { ProjectSummary } from '@/modules/writer/api/project'
import { useProjectStore } from '@/modules/writer/stores/projectStore' // 使用新的 Store
import { QyIcon } from '@/design-system/components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()

// 状态
const loadingProjects = ref(false)
const writingGoal = ref(2000)
const userName = computed(() => authStore.user?.nickname || authStore.user?.username || '作家')

// 统计数据 (模拟 + Store)
const stats = ref({
  totalWords: 0,
  bookCount: 0,
  todayWords: 0, // 需要后端支持今日新增接口
  pending: 0,
})

// 统计卡片配置
const statCards = computed(() => [
  {
    label: '总字数',
    value: stats.value.totalWords,
    icon: Document,
    iconColor: '#409eff',
    bgColor: 'var(--el-color-primary-light-9)',
  },
  {
    label: '作品数',
    value: stats.value.bookCount,
    icon: Reading,
    iconColor: '#67c23a',
    bgColor: 'var(--el-color-success-light-9)',
  },
  {
    label: '今日码字',
    value: stats.value.todayWords,
    icon: EditPen,
    iconColor: '#e6a23c',
    bgColor: 'var(--el-color-warning-light-9)',
  },
  {
    label: '连载中',
    value: stats.value.pending,
    icon: Clock,
    iconColor: '#f56c6c',
    bgColor: 'var(--el-color-danger-light-9)',
  },
])

// 目标进度
const goalPercentage = computed(() => {
  if (writingGoal.value === 0) return 100
  return Math.min(Math.round((stats.value.todayWords / writingGoal.value) * 100), 100)
})

const goalColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 60 },
  { color: '#67c23a', percentage: 100 },
]

// 获取最近项目
const recentProjects = computed(() => (projectStore.projects || []).slice(0, 5)) // 假设 Store 已按时间排序

// 初始化加载
onMounted(async () => {
  loadingProjects.value = true
  try {
    // 并行加载
    await projectStore.loadList({ page: 1, pageSize: 5 })

    // 更新统计 (这部分逻辑最好在后端有个专门的 dashboard API)
    stats.value.bookCount = projectStore.total
    const projects = projectStore.projects || []
    stats.value.totalWords = projects.reduce(
      (acc: number, cur: { totalWords: number }) => acc + (cur.totalWords || 0),
      0,
    )
    stats.value.pending = projects.filter((p: ProjectSummary) => p.status === 'serializing').length
    stats.value.todayWords = 1200 // Mock Data
  } catch (error) {
    console.error('[WriterDashboard] 加载项目列表失败:', error)
  } finally {
    loadingProjects.value = false
  }
})

// 辅助函数
const formatNumber = (n: number) => (n >= 10000 ? (n / 10000).toFixed(1) + 'w' : n)
const formatTime = (t: string) => dayjs(t).fromNow()

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    serializing: 'primary',
    completed: 'success',
    suspended: 'danger',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    serializing: '连载',
    completed: '完结',
    suspended: '断更',
  }
  return map[status] || status
}

const getCoverStyle = (title: string) => {
  const colors = ['#a0cfff', '#b3e19d', '#f3d19e', '#fab6b6']
  const idx = title.length % colors.length
  return { backgroundColor: colors[idx] }
}

// 导航动作
const createProject = () => router.push({ name: 'writer-projects', query: { action: 'create' } })
const quickWrite = () => {
  if (recentProjects.value.length > 0) {
    openProject(recentProjects.value[0].id)
  } else {
    createProject()
  }
}
const goToPublish = () => {} // TODO
const goToStatistics = () => {} // TODO
const goToAllProjects = () => router.push({ name: 'writer-projects' })
const openProject = (id: string) =>
  router.push({ name: 'writer-project', params: { projectId: id } })
const editGoal = () => {
  /* 打开 Dialog 修改 goal */
}
</script>

<style scoped lang="scss">
.writer-dashboard {
  --card-radius: 14px;
  padding: clamp(16px, 2vw, 24px);
  max-width: 1320px;
  margin: 0 auto;
  background-color: var(--el-bg-color-page);
}

// 1. 头部
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;

  .title {
    font-size: 28px;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
  }

  .subtitle {
    color: var(--el-text-color-secondary);

    .username {
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
}

// 2. 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--card-radius);
    background: linear-gradient(
      160deg,
      var(--el-bg-color) 0%,
      var(--el-fill-color-extra-light) 100%
    );
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(16, 24, 40, 0.08);
    }

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      padding: 20px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
    }
  }
}

// 通用卡片样式
.section-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--card-radius);
  box-shadow: 0 4px 16px rgba(16, 24, 40, 0.04);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);
  }

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-card__body) {
    padding: 18px 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.main-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(280px, 1fr);
  gap: 20px;
  align-items: start;
}

.left-pane,
.right-pane {
  display: grid;
  gap: 20px;
}

// 3. 快捷操作
.quick-actions {
  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 16px;
    padding: 4px 0;
  }

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 16px;
    border-radius: 10px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-border-color);
      transform: translateY(-2px);
    }

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      font-size: 24px;

      &.primary {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &.success {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.warning {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
      }

      &.info {
        background: var(--el-color-info-light-9);
        color: var(--el-color-info);
      }
    }

    span {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}

// 4. 最近项目列表
.project-list {
  display: grid;
  gap: 10px;

  .project-list-item {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--el-border-color-lighter);

    &:hover {
      background-color: var(--el-fill-color-extra-light);
      border-color: var(--el-border-color);
    }

    .item-cover {
      width: 48px;
      height: 64px;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      color: #fff;
      font-weight: bold;
      font-size: 20px;
      flex-shrink: 0;
    }

    .item-content {
      flex: 1;
      min-width: 0; // 防止溢出

      .item-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;

        .item-title {
          margin: 0;
          font-size: 15px;
          color: var(--el-text-color-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .item-meta {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .enter-btn {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .enter-btn {
      opacity: 1;
    }
  }
}

// 5. 今日目标
.writing-goal {
  :deep(.el-card__body) {
    padding-top: 16px;
  }

  .goal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0;
  }

  .progress-value {
    font-size: 24px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }

  .progress-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .goal-stats {
    width: 100%;
    margin-top: 24px;

    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;

      .label {
        color: var(--el-text-color-regular);
      }

      .val {
        font-weight: 500;
      }

      .highlight {
        color: var(--el-color-primary);
        font-weight: bold;
      }
    }
  }

  .goal-message {
    margin-top: 16px;
    text-align: center;
    font-size: 13px;
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
    padding: 8px;
    border-radius: 4px;
  }
}

// 6. 每日灵感
.daily-quote {
  background: linear-gradient(
    140deg,
    var(--el-color-primary-light-9) 0%,
    var(--el-bg-color) 58%,
    var(--el-color-info-light-9) 100%
  );

  .quote-content {
    position: relative;
    padding: 10px;

    .quote-icon {
      font-size: 24px;
      color: var(--el-color-primary);
      opacity: 0.3;
      position: absolute;
      top: -5px;
      left: -5px;
    }

    .quote-text {
      font-size: 14px;
      line-height: 1.6;
      color: var(--el-text-color-primary);
      font-style: italic;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }

    .quote-author {
      text-align: right;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

// 响应式调整
@media (max-width: 1200px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .quick-actions .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .writer-dashboard {
    padding: 14px;
  }
}
</style>
