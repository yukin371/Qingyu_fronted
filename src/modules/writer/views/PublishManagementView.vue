<template>
  <WriterPageShell>
    <div class="publish-management-view">
      <el-row :gutter="20" class="content-grid">
        <el-col :span="24">
          <div
            class="publish-hero mb-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-5"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 class="m-0 text-2xl font-semibold text-slate-800">发布管理</h1>
                <p class="mt-2 text-sm text-slate-500">
                  统一处理发布计划、章节发布进度和导出任务。
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >总章节 {{ stats.total_chapters }}</span
                >
                <span
                  class="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                  >已发布 {{ stats.published_chapters }}</span
                >
                <span
                  class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                  >审核中 {{ stats.pending_review_chapters }}</span
                >
              </div>
            </div>
          </div>
        </el-col>

        <!-- 左侧：发布统计 -->
        <el-col :span="5">
          <el-card shadow="never" class="stats-card">
            <template #header>
              <h3>发布统计</h3>
            </template>
            <div v-loading="loadingStats" class="stats-grid">
              <div class="stat-tile">
                <span class="label">总章节</span>
                <span class="value">{{ stats.total_chapters }}</span>
              </div>
              <div class="stat-tile">
                <span class="label">已发布</span>
                <span class="value success">{{ stats.published_chapters }}</span>
              </div>
              <div class="stat-tile">
                <span class="label">草稿</span>
                <span class="value info">{{ stats.draft_chapters }}</span>
              </div>
              <div class="stat-tile">
                <span class="label">审核中</span>
                <span class="value warning">{{ stats.pending_review_chapters }}</span>
              </div>
              <div class="stat-tile">
                <span class="label">定时发布</span>
                <span class="value info">{{ stats.scheduled_chapters }}</span>
              </div>
              <div class="stat-tile">
                <span class="label">总字数</span>
                <span class="value">{{ formatNumber(stats.total_words) }}</span>
              </div>
              <div class="stat-tile">
                <span class="label">已发布字数</span>
                <span class="value success">{{ formatNumber(stats.published_words) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：发布管理 -->
        <el-col :span="19">
          <el-card shadow="never" class="main-card">
            <template #header>
              <div class="card-header">
                <h3>发布管理</h3>
                <div class="header-actions">
                  <el-button @click="showExportDialog = true">
                    <QyIcon name="Download" />
                    导出
                  </el-button>
                  <el-button type="primary" @click="showPublishPlanDialog = true">
                    <QyIcon name="Setting" />
                    发布计划
                  </el-button>
                </div>
              </div>
            </template>

            <div class="internal-tab-nav">
              <button
                v-for="item in internalNavItems"
                :key="item.key"
                type="button"
                class="internal-nav-item"
                :class="{ 'is-active': activeTab === item.key }"
                @click="activeTab = item.key"
              >
                <span class="nav-title">{{ item.label }}</span>
                <span class="nav-meta">{{ item.meta }}</span>
              </button>
            </div>

            <el-tabs v-model="activeTab" class="publish-tabs">
              <!-- 发布计划 -->
              <el-tab-pane label="发布计划" name="plan">
                <PublishSchedule
                  :publish-plan="publishPlan"
                  @create="showPublishPlanDialog = true"
                  @edit="editPublishPlan"
                  @pause="pausePlan"
                  @resume="resumePlan"
                  @submit-review="handleSubmitReview"
                />
              </el-tab-pane>

              <!-- 章节发布 -->
              <el-tab-pane label="章节发布" name="chapters">
                <ChapterManager
                  :publish-records="publishRecords"
                  :loading="loadingRecords"
                  :total="recordTotal"
                  :page="recordPage"
                  :page-size="recordPageSize"
                  :filter-status-value="chapterFilter.status"
                  @refresh="loadPublishRecords"
                  @publish="handlePublishChapter"
                  @schedule="handleScheduleChapter"
                  @unpublish="handleUnpublishChapter"
                  @view-review="handleViewReview"
                  @page-change="loadPublishRecords"
                  @update:page="recordPage = $event"
                  @update:page-size="recordPageSize = $event"
                  @update:filter-status-value="chapterFilter.status = $event"
                />
              </el-tab-pane>

              <!-- 导出历史 -->
              <el-tab-pane label="导出历史" name="export">
                <ExportPanel
                  :export-history="exportHistory"
                  :loading="loadingExport"
                  :total="exportTotal"
                  :page="exportPage"
                  :page-size="exportPageSize"
                  @download="downloadExport"
                  @cancel="cancelExport"
                  @delete="deleteExport"
                  @page-change="loadExportHistory"
                  @update:page="exportPage = $event"
                  @update:page-size="exportPageSize = $event"
                />
              </el-tab-pane>

              <!-- 审核历史 -->
              <el-tab-pane label="审核历史" name="review">
                <ReviewPanel
                  ref="reviewPanelRef"
                  :review-history="reviewHistory"
                  :review-stats="reviewStats"
                  :loading="loadingReview"
                  :total="reviewTotal"
                  :page="reviewPage"
                  :page-size="reviewPageSize"
                  :filter-status-value="reviewFilter.status"
                  :trend-period-value="reviewTrendPeriod"
                  @refresh="loadReviewHistory"
                  @view-detail="viewReviewDetail"
                  @page-change="loadReviewHistory"
                  @update:page="reviewPage = $event"
                  @update:page-size="reviewPageSize = $event"
                  @update:filter-status-value="reviewFilter.status = $event"
                  @update:trend-period-value="reviewTrendPeriod = $event"
                />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>

      <!-- 发布计划对话框 -->
      <PublishPlanDialog
        v-model:visible="showPublishPlanDialog"
        :form="planForm"
        @update:form="Object.assign(planForm, $event)"
        @save="savePublishPlan"
      />

      <!-- 导出对话框 -->
      <ExportDialog
        v-model:visible="showExportDialog"
        :form="exportForm"
        @update:form="Object.assign(exportForm, $event)"
        @export="handleStartExport"
      />

      <!-- 审核详情对话框 -->
      <ReviewDetailDialog
        v-model:visible="reviewDetailDialogVisible"
        :detail="currentReviewDetail"
        @resubmit="resubmitReview"
      />
    </div>
  </WriterPageShell>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { message } from '@/design-system/services'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { QyIcon } from '@/design-system/components'
import WriterPageShell from '@/modules/writer/components/WriterPageShell.vue'
import { getPublishStats, type PublishStats } from '@/modules/writer/api'
import { request as apiRequest } from '@/utils/request-adapter'

// 子组件
import PublishSchedule from '@/modules/writer/components/publish/PublishSchedule.vue'
import ChapterManager from '@/modules/writer/components/publish/ChapterManager.vue'
import ExportPanel from '@/modules/writer/components/publish/ExportPanel.vue'
import ReviewPanel from '@/modules/writer/components/publish/ReviewPanel.vue'
import PublishPlanDialog from '@/modules/writer/components/publish/PublishPlanDialog.vue'
import ExportDialog from '@/modules/writer/components/publish/ExportDialog.vue'
import ReviewDetailDialog from '@/modules/writer/components/publish/ReviewDetailDialog.vue'

// Composables
import { usePublishSchedule } from '@/modules/writer/composables/usePublishSchedule'
import { useChapterManager, type PublishRecord } from '@/modules/writer/composables/useChapterManager'
import { useExport } from '@/modules/writer/composables/useExport'
import type { ReviewRecord } from '@/modules/writer/components/publish/ReviewPanel.vue'

// 本地项目类型
interface LocalProject {
  projectId?: string
  id?: string
  title?: string
  chapterCount?: number
  wordCount?: number
}

// WriterStore 项目列表项类型
interface WriterProjectItem {
  projectId?: string
  id?: string
  title?: string
  chapterCount?: number
  wordCount?: number
}

// WriterStore 类型
interface WriterStoreType {
  projectList?: WriterProjectItem[]
  fetchProjects: () => Promise<void>
  storageMode?: string
}

// 基础状态
const route = useRoute()
const writerStore = useWriterStore()
const bookId = ref('')
const loadingStats = ref(false)
const activeTab = ref('plan')

// 统计数据
const stats = reactive<PublishStats>({
  total_chapters: 0,
  published_chapters: 0,
  draft_chapters: 0,
  pending_review_chapters: 0,
  scheduled_chapters: 0,
  total_words: 0,
  published_words: 0,
})

// 计算属性
const currentLocalProject = computed<LocalProject>(() =>
  (writerStore.projectList || []).find((p) => (p.projectId || p.id) === bookId.value) || {},
)

const isMockProjectContext = computed(() => {
  const typedStore = writerStore as WriterStoreType
  if (typedStore.storageMode === 'offline') return true
  return !!currentLocalProject.value
})

// 使用 Composables
const {
  publishPlan,
  showPublishPlanDialog,
  planForm,
  setCurrentProjectTitle,
  loadPublishPlan,
  editPublishPlan,
  savePublishPlan,
  pausePlan,
  resumePlan,
  submitReview,
} = usePublishSchedule(bookId, isMockProjectContext)

const {
  loadingRecords,
  publishRecords,
  recordPage,
  recordPageSize,
  recordTotal,
  chapterFilter,
  ensureMockRecords,
  persistMockPublication,
  loadPublishRecords,
  publishChapter: doPublishChapter,
  unpublishChapter: doUnpublishChapter,
  scheduleChapter: doScheduleChapter,
  viewReview: doViewReview,
  computeMockStats,
} = useChapterManager(bookId, isMockProjectContext, currentLocalProject)

const {
  loadingExport,
  exportHistory,
  exportPage,
  exportPageSize,
  exportTotal,
  showExportDialog,
  exportForm,
  loadExportHistory,
  startExport,
  downloadExport,
  cancelExport,
  deleteExport,
} = useExport(bookId, isMockProjectContext)

// 审核历史状态
const loadingReview = ref(false)
const reviewHistory = ref<ReviewRecord[]>([])
const reviewPage = ref(1)
const reviewPageSize = ref(20)
const reviewTotal = ref(0)
const reviewFilter = reactive({ status: '' })
const reviewTrendPeriod = ref('7d')
const reviewDetailDialogVisible = ref(false)
const currentReviewDetail = ref<ReviewRecord | null>(null)
const reviewPanelRef = ref<InstanceType<typeof ReviewPanel> | null>(null)

const reviewStats = reactive({
  total: 0,
  approved: 0,
  approvedRate: 0,
  rejected: 0,
  rejectedRate: 0,
  pending: 0,
})

// 内部导航项
const internalNavItems = computed(() => [
  {
    key: 'plan',
    label: '发布计划',
    meta: publishPlan.value
      ? `状态：${publishPlan.value.status === 'active' ? '进行中' : '已暂停'}`
      : '待创建',
  },
  {
    key: 'chapters',
    label: '章节发布',
    meta: `${recordTotal.value || stats.total_chapters} 章`,
  },
  {
    key: 'export',
    label: '导出历史',
    meta: `${exportTotal.value} 条`,
  },
  {
    key: 'review',
    label: '审核历史',
    meta: `待审 ${reviewStats.pending || stats.pending_review_chapters}`,
  },
])

// 加载统计
const loadStats = async () => {
  if (!bookId.value) return
  loadingStats.value = true
  try {
    if (isMockProjectContext.value) {
      Object.assign(stats, computeMockStats(bookId.value))
      return
    }
    const res = await getPublishStats(bookId.value)
    Object.assign(stats, res)
  } catch (error: unknown) {
    console.error('加载统计失败', error)
  } finally {
    loadingStats.value = false
  }
}

// 审核历史方法
const loadReviewStats = async () => {
  try {
    reviewStats.total = 45
    reviewStats.approved = 38
    reviewStats.approvedRate = Math.round((reviewStats.approved / reviewStats.total) * 100)
    reviewStats.rejected = 4
    reviewStats.rejectedRate = Math.round((reviewStats.rejected / reviewStats.total) * 100)
    reviewStats.pending = 3
  } catch (error: unknown) {
    console.error('加载审核统计失败', error)
  }
}

const loadReviewHistory = async () => {
  loadingReview.value = true
  try {
    reviewHistory.value = [
      {
        id: '1',
        chapter_title: '第一章：初入江湖',
        chapter_number: 1,
        status: 'approved',
        submitted_at: new Date(Date.now() - 86400000).toISOString(),
        reviewed_at: new Date(Date.now() - 72000000).toISOString(),
        reviewer_name: '审核员A',
        review_comment: '内容质量良好，符合平台规范',
      },
      {
        id: '2',
        chapter_title: '第二章：意外发现',
        chapter_number: 2,
        status: 'approved',
        submitted_at: new Date(Date.now() - 172800000).toISOString(),
        reviewed_at: new Date(Date.now() - 158400000).toISOString(),
        reviewer_name: '审核员B',
        review_comment: '章节结构合理',
      },
      {
        id: '3',
        chapter_title: '第三章：神秘人物',
        chapter_number: 3,
        status: 'rejected',
        submitted_at: new Date(Date.now() - 259200000).toISOString(),
        reviewed_at: new Date(Date.now() - 244800000).toISOString(),
        reviewer_name: '审核员C',
        review_comment: '部分内容需修改，请重新提交',
      },
      {
        id: '4',
        chapter_title: '第四章：危机四伏',
        chapter_number: 4,
        status: 'pending',
        submitted_at: new Date(Date.now() - 43200000).toISOString(),
        reviewed_at: null,
        reviewer_name: null,
        review_comment: null,
      },
    ]
    reviewTotal.value = 4
  } catch (error: unknown) {
    console.error('加载审核历史失败', error)
    ElMessage.error('加载审核历史失败')
  } finally {
    loadingReview.value = false
  }
}

const viewReviewDetail = (row: ReviewRecord) => {
  currentReviewDetail.value = row
  reviewDetailDialogVisible.value = true
}

const resubmitReview = () => {
  reviewDetailDialogVisible.value = false
  ElMessage.info('重新提交功能开发中')
}

// 事件处理
const handleSubmitReview = () => {
  submitReview(ensureMockRecords, persistMockPublication, loadPublishRecords, loadStats)
}

const handlePublishChapter = (record: PublishRecord) => {
  doPublishChapter(record, loadStats)
}

const handleScheduleChapter = (record: PublishRecord) => {
  doScheduleChapter(record, loadStats)
}

const handleUnpublishChapter = (record: PublishRecord) => {
  doUnpublishChapter(record, loadStats)
}

const handleViewReview = () => {
  doViewReview()
}

const handleStartExport = () => {
  startExport(() => {
    activeTab.value = 'export'
  })
}

// 辅助函数
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// 监听 tab 切换
watch(activeTab, (newTab) => {
  if (newTab === 'review') {
    loadReviewStats()
    loadReviewHistory()
    nextTick(() => {
      reviewPanelRef.value?.initChart()
    })
  }
})

// 初始化
onMounted(() => {
  ;(async () => {
    const routeProjectId =
      (route.params.projectId as string) ||
      (route.params.id as string) ||
      (route.query.projectId as string) ||
      ''

    if (routeProjectId) {
      bookId.value = routeProjectId
    } else {
      try {
        await writerStore.fetchProjects()
        const firstLocalProject = writerStore.projectList?.[0]
        bookId.value = firstLocalProject?.projectId || firstLocalProject?.id || ''
      } catch {
        bookId.value = ''
      }

      if (!bookId.value) {
        try {
          interface ApiProject {
            id?: string
            projectId?: string
          }
          interface ApiResult {
            projects?: ApiProject[]
            list?: ApiProject[]
          }
          const result = (await apiRequest({
            url: '/api/v1/writer/projects',
            method: 'get',
            params: { page: 1, pageSize: 1 },
          })) as ApiResult
          bookId.value =
            result?.projects?.[0]?.id ||
            result?.projects?.[0]?.projectId ||
            result?.list?.[0]?.id ||
            result?.list?.[0]?.projectId ||
            ''
        } catch {
          bookId.value = ''
        }
      }
    }

    if (!bookId.value) {
      message.warning('未找到可用项目，请先在"我的项目"中创建项目')
      return
    }

    // 设置项目标题
    setCurrentProjectTitle(currentLocalProject.value?.title || '作品')

    if (isMockProjectContext.value) {
      persistMockPublication(bookId.value)
    }

    loadStats()
    loadPublishPlan()
    loadPublishRecords()
    loadExportHistory()
  })()
})
</script>

<style scoped lang="scss">
.publish-management-view {
  padding: 0;
}

.content-grid {
  padding: 0 10px;
}

.stats-card {
  border: 1px solid #dbe6f6;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
  }
}

.main-card {
  border: 1px solid #dbe6f6;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.internal-tab-nav {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.internal-nav-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid #dbe6f6;
  border-radius: 12px;
  background: #f8fbff;
  color: #334155;
  transition: all 0.18s ease;
  text-align: left;

  .nav-title {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
  }

  .nav-meta {
    font-size: 12px;
    color: #64748b;
    line-height: 1.2;
  }

  &:hover {
    border-color: #93c5fd;
    background: #eff6ff;
  }

  &.is-active {
    border-color: #60a5fa;
    background: #eff6ff;
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.25);

    .nav-title,
    .nav-meta {
      color: #1d4ed8;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;

  .stat-tile {
    grid-column: span 2;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 10px;
    border-radius: 12px;
    border: 1px solid #dbe6f6;
    background: #fff;
    min-height: 72px;

    .label {
      font-size: 12px;
      color: #64748b;
      line-height: 1.2;
    }

    .value {
      font-size: 22px;
      font-weight: 700;
      line-height: 1;
      color: #0f172a;

      &.success {
        color: var(--el-color-success);
      }

      &.info {
        color: var(--el-color-info);
      }

      &.warning {
        color: var(--el-color-warning);
      }
    }
  }

  > .stat-tile:last-child:nth-child(3n + 1) {
    grid-column: 1 / -1;
  }

  > .stat-tile:nth-last-child(2):nth-child(3n + 1),
  > .stat-tile:last-child:nth-child(3n + 2) {
    grid-column: span 3;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

:deep(.stats-card .el-card__header),
:deep(.main-card .el-card__header) {
  padding: 14px 22px;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

:deep(.stats-card .el-card__body),
:deep(.main-card .el-card__body) {
  padding: 18px 22px;
}

:deep(.publish-tabs .el-tabs__header) {
  display: none;
}

:deep(.publish-tabs .el-tabs__content) {
  padding: 4px 8px 8px;
}
</style>
