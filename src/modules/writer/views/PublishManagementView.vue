<template>
  <WriterPageShell>
    <div class="publish-management-view">
      <QyRow :gutter="20" align="stretch" class="content-grid">
        <QyCol :span="24">
          <div
            class="publish-hero mb-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-5"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 class="m-0 text-2xl font-semibold text-slate-800">发布管理</h1>
                <p class="mt-2 text-sm text-slate-500">
                  统一处理发布计划、章节发布进度和发布统计。
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
            <div class="stats-source-note" :class="{ 'is-warning': hasPublishStatsWarning }">
              <Tag
                size="sm"
                :variant="hasPublishStatsWarning ? 'warning' : 'success'"
                effect="plain"
                :round="true"
              >
                {{ publishStatsSourceTag }}
              </Tag>
              <span>{{ publishStatsNotice }}</span>
            </div>
          </div>
        </QyCol>

        <!-- 左侧：发布统计 -->
        <QyCol :span="5">
          <Card shadow="never" class="stats-card" padding="none">
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
          </Card>
        </QyCol>

        <!-- 右侧：发布管理 -->
        <QyCol :span="19">
          <Card shadow="never" class="main-card" padding="none">
            <template #header>
              <div class="card-header">
                <h3>发布管理</h3>
                <div class="header-actions">
                  <QyButton @click="showExportDialog = true">
                    <QyIcon name="Download" />
                    导出
                  </QyButton>
                  <QyButton variant="primary" @click="showPublishPlanDialog = true">
                    <QyIcon name="Setting" />
                    发布计划
                  </QyButton>
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

              <!-- 发布统计 -->
              <el-tab-pane label="发布统计" name="stats">
                <PublishStatsPanel :chapters="[]" :stats="stats" />
              </el-tab-pane>
            </el-tabs>
          </Card>
        </QyCol>
      </QyRow>

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

      <ReviewDetailDialog
        v-model:visible="reviewDetailDialogVisible"
        :detail="currentReviewDetail"
        @resubmit="handleResubmitReview"
      />
    </div>
  </WriterPageShell>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from '@/design-system/services'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { QyIcon, QyRow, QyCol, QyButton } from '@/design-system/components'
import { Card, Tag } from '@/design-system/base'
import WriterPageShell from '@/modules/writer/components/WriterPageShell.vue'
import {
  getPublicationDetail,
  getPublishRecords,
  getPublishStats,
  publishChapter as submitChapterForReview,
  type PublishStats,
} from '@/modules/writer/api'
import { request as apiRequest } from '@/utils/request-adapter'

// 子组件
import PublishSchedule from '@/modules/writer/components/publish/PublishSchedule.vue'
import ChapterManager from '@/modules/writer/components/publish/ChapterManager.vue'
import PublishStatsPanel from '@/modules/writer/components/publish/PublishStats.vue'
import PublishPlanDialog from '@/modules/writer/components/publish/PublishPlanDialog.vue'
import ExportDialog from '@/modules/writer/components/publish/ExportDialog.vue'
import ReviewDetailDialog, {
  type ReviewDetail,
} from '@/modules/writer/components/publish/ReviewDetailDialog.vue'

// Composables
import { usePublishSchedule } from '@/modules/writer/composables/usePublishSchedule'
import {
  useChapterManager,
  type PublishRecord,
} from '@/modules/writer/composables/useChapterManager'
import { useExport } from '@/modules/writer/composables/useExport'
import { DocumentType } from '@/modules/writer/types/document'

// 本地项目类型
interface LocalProject {
  projectId?: string
  id?: string
  title?: string
  chapterCount?: number
  wordCount?: number
}

type PublishStatsFieldKey = 'total_chapters' | 'draft_chapters' | 'total_words' | 'published_words'

type PublishStatsSource = 'idle' | 'mock' | 'api' | 'api+estimated' | 'api-error'

const emptyPublishStats: PublishStats = {
  total_chapters: 0,
  published_chapters: 0,
  draft_chapters: 0,
  pending_review_chapters: 0,
  scheduled_chapters: 0,
  total_words: 0,
  published_words: 0,
}

const publishStatsFieldLabels: Record<PublishStatsFieldKey, string> = {
  total_chapters: '总章节',
  draft_chapters: '草稿章节',
  total_words: '总字数',
  published_words: '已发布字数',
}

// 基础状态
const route = useRoute()
const writerStore = useWriterStore()
const documentStore = useDocumentStore()
const bookId = ref('')
const loadingStats = ref(false)
const activeTab = ref('plan')
const statsMeta = reactive<{
  source: PublishStatsSource
  estimatedFields: PublishStatsFieldKey[]
  errorMessage: string
}>({
  source: 'idle',
  estimatedFields: [],
  errorMessage: '',
})

// 统计数据
const stats = reactive<PublishStats>({ ...emptyPublishStats })
const reviewDetailDialogVisible = ref(false)
const currentReviewDetail = ref<ReviewDetail | null>(null)
const currentReviewRecord = ref<PublishRecord | null>(null)

// 计算属性
const currentLocalProject = computed<LocalProject>(
  () => (writerStore.projectList || []).find((p) => (p.projectId || p.id) === bookId.value) || {},
)

const isMockProjectContext = computed(() => String(route.query.test || '').toLowerCase() === 'true')
const hasPublishStatsWarning = computed(
  () => statsMeta.source === 'api+estimated' || statsMeta.source === 'api-error',
)
const estimatedFieldLabels = computed(() =>
  statsMeta.estimatedFields.map((field) => publishStatsFieldLabels[field]),
)
const publishStatsSourceTag = computed(() => {
  if (statsMeta.source === 'mock') return 'Mock 数据'
  if (statsMeta.source === 'api+estimated') return '部分估算'
  if (statsMeta.source === 'api-error') return '接口异常'
  if (statsMeta.source === 'api') return '接口数据'
  return '待加载'
})
const publishStatsNotice = computed(() => {
  if (statsMeta.source === 'mock') {
    return '当前处于 test=true 模式，统计数据使用 Mock 发布上下文。'
  }
  if (statsMeta.source === 'api+estimated') {
    return `部分统计缺少后端字段，已根据本地章节树估算：${estimatedFieldLabels.value.join('、')}。`
  }
  if (statsMeta.source === 'api-error') {
    return statsMeta.errorMessage || '发布统计接口加载失败，当前显示为空值。'
  }
  if (statsMeta.source === 'api') {
    return '发布统计已直接使用后端接口返回。'
  }
  return '正在加载发布统计。'
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

const { showExportDialog, exportForm, startExport } = useExport(bookId, isMockProjectContext)

const chapterDocs = computed(() =>
  (documentStore.flatDocs || []).filter((doc) => doc.type === DocumentType.CHAPTER),
)

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
    key: 'stats',
    label: '发布统计',
    meta: `已发布 ${stats.published_chapters} 章`,
  },
])

// 加载统计
const resetStatsMeta = () => {
  statsMeta.source = 'idle'
  statsMeta.estimatedFields = []
  statsMeta.errorMessage = ''
}

const toStatNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const loadStats = async () => {
  if (!bookId.value) return
  loadingStats.value = true
  resetStatsMeta()
  try {
    if (isMockProjectContext.value) {
      Object.assign(stats, computeMockStats(bookId.value))
      statsMeta.source = 'mock'
      return
    }
    const res = await getPublishStats(bookId.value)
    const fallbackTotalChapters =
      chapterDocs.value.length || Number(currentLocalProject.value?.chapterCount || 0)
    const fallbackTotalWords =
      chapterDocs.value.reduce((sum, doc) => sum + Number(doc.wordCount || 0), 0) ||
      Number(currentLocalProject.value?.wordCount || 0)
    const estimatedFields: PublishStatsFieldKey[] = []

    const publishedChapters = toStatNumber(res.published_chapters) ?? 0
    const pendingReviewChapters = toStatNumber(res.pending_review_chapters) ?? 0
    const scheduledChapters = toStatNumber(res.scheduled_chapters) ?? 0

    const totalChaptersRaw = toStatNumber(res.total_chapters)
    const totalChapters = totalChaptersRaw ?? fallbackTotalChapters
    if (totalChaptersRaw === null) estimatedFields.push('total_chapters')

    const totalWordsRaw = toStatNumber(res.total_words)
    const totalWords = totalWordsRaw ?? fallbackTotalWords
    if (totalWordsRaw === null) estimatedFields.push('total_words')

    const publishedWordsRaw = toStatNumber(res.published_words)
    const publishedWords =
      publishedWordsRaw ?? Math.floor(totalWords * (publishedChapters / Math.max(totalChapters, 1)))
    if (publishedWordsRaw === null) estimatedFields.push('published_words')

    const draftChaptersRaw = toStatNumber(res.draft_chapters)
    const draftChapters =
      draftChaptersRaw ??
      Math.max(0, totalChapters - publishedChapters - pendingReviewChapters - scheduledChapters)
    if (draftChaptersRaw === null) estimatedFields.push('draft_chapters')

    Object.assign(stats, {
      ...res,
      total_chapters: totalChapters,
      published_chapters: publishedChapters,
      draft_chapters: draftChapters,
      pending_review_chapters: pendingReviewChapters,
      scheduled_chapters: scheduledChapters,
      total_words: totalWords,
      published_words: publishedWords,
    } satisfies PublishStats)
    statsMeta.source = estimatedFields.length > 0 ? 'api+estimated' : 'api'
    statsMeta.estimatedFields = estimatedFields
  } catch (error: unknown) {
    console.error('加载统计失败', error)
    Object.assign(stats, { ...emptyPublishStats })
    statsMeta.source = 'api-error'
    statsMeta.errorMessage =
      error instanceof Error && error.message
        ? `发布统计接口加载失败：${error.message}`
        : '发布统计接口加载失败，当前显示为空值。'
  } finally {
    loadingStats.value = false
  }
}

// 事件处理
const handleSubmitReview = () => {
  submitReview(
    ensureMockRecords,
    persistMockPublication,
    loadPublishRecords,
    loadStats,
    submitProjectReview,
  )
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

const mapReviewDetailStatus = (status: PublishRecord['status']): ReviewDetail['status'] => {
  if (status === 'published') return 'approved'
  if (status === 'rejected') return 'rejected'
  return 'pending'
}

const createFallbackReviewDetail = (record: PublishRecord): ReviewDetail => ({
  id: record.id,
  chapter_title: record.chapter_title,
  chapter_number: record.chapter_number,
  status: mapReviewDetailStatus(record.status),
  submitted_at: record.created_at,
  reviewed_at: record.status === 'published' ? record.published_at || null : null,
  reviewer_name: null,
  review_comment:
    record.status === 'pending_review' || record.status === 'scheduled'
      ? '章节已进入待审核队列，等待平台审核。'
      : record.status === 'published'
        ? '章节已通过审核并发布。'
        : '当前暂无更多审核详情。',
})

const handleViewReview = async (record: PublishRecord) => {
  currentReviewRecord.value = record
  currentReviewDetail.value = createFallbackReviewDetail(record)
  reviewDetailDialogVisible.value = true

  try {
    const detail = await getPublicationDetail(record.id)
    currentReviewDetail.value = {
      id: detail.id || record.id,
      chapter_title: detail.chapter_title || record.chapter_title,
      chapter_number: detail.chapter_number || record.chapter_number,
      status: mapReviewDetailStatus(detail.status),
      submitted_at: detail.created_at || record.created_at,
      reviewed_at: detail.reviewed_at,
      reviewer_name: detail.reviewer_name,
      review_comment: detail.review_comment || createFallbackReviewDetail(record).review_comment,
    }
  } catch (error: unknown) {
    console.warn('加载审核详情失败，使用兜底详情', error)
  }

  doViewReview()
}

const handleStartExport = () => {
  startExport(() => {
    activeTab.value = 'stats'
  })
}

// 辅助函数
const formatNumber = (num: number): string => {
  if (num >= 100000000) {
    const val = num / 100000000
    return val % 1 === 0 ? `${val}亿` : `${val.toFixed(1)}亿`
  }
  if (num >= 10000) {
    const val = num / 10000
    return val % 1 === 0 ? `${val}万` : `${val.toFixed(1)}万`
  }
  return num.toLocaleString()
}

const submitProjectReview = async () => {
  const docs = [...chapterDocs.value].sort((left, right) => (left.order || 0) - (right.order || 0))
  if (docs.length === 0) {
    message.warning('当前项目暂无可提交审核的章节')
    return
  }

  const { items } = await getPublishRecords(bookId.value, { page: 1, page_size: 1000 })
  const existingMap = new Map(items.map((item) => [item.chapter_id, item]))
  const candidates = docs.filter((doc) => {
    const record = existingMap.get(doc.id)
    return !record || record.status === 'draft' || record.status === 'rejected'
  })

  if (candidates.length === 0) {
    message.info('当前没有需要提交审核的章节')
    return
  }

  const results = await Promise.allSettled(
    candidates.map((doc, index) =>
      submitChapterForReview(doc.id, {
        chapter_id: doc.id,
        chapter_title: doc.title,
        chapter_number: Number(doc.order || index + 1),
        project_id: bookId.value,
      } as Parameters<typeof submitChapterForReview>[1] & { project_id: string }),
    ),
  )

  const successCount = results.filter((result) => result.status === 'fulfilled').length
  const failCount = results.length - successCount

  if (successCount > 0) {
    message.success(
      failCount > 0
        ? `已提交 ${successCount} 章审核，${failCount} 章失败`
        : `已提交 ${successCount} 章进入审核`,
    )
    await Promise.all([loadPublishRecords(), loadStats()])
    return
  }

  const firstError = results.find((result) => result.status === 'rejected')
  if (firstError && firstError.status === 'rejected') {
    throw firstError.reason instanceof Error ? firstError.reason : new Error('提交审核失败')
  }
}

const handleResubmitReview = async () => {
  const record = currentReviewRecord.value
  if (!record) return

  await submitChapterForReview(record.chapter_id, {
    chapter_id: record.chapter_id,
    chapter_title: record.chapter_title,
    chapter_number: record.chapter_number,
    project_id: bookId.value,
  } as Parameters<typeof submitChapterForReview>[1] & { project_id: string })

  reviewDetailDialogVisible.value = false
  message.success('已重新提交审核')
  await Promise.all([loadPublishRecords(), loadStats()])
}

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
    } else {
      await documentStore.loadTree(bookId.value).catch(() => undefined)
    }

    loadStats()
    loadPublishPlan()
    loadPublishRecords()
  })()
})
</script>

<style scoped lang="scss">
.publish-management-view {
  padding: 0;
}

.stats-source-note {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.18);
  background: rgba(240, 253, 244, 0.9);
  padding: 10px 12px;
  font-size: 13px;
  color: #334155;

  &.is-warning {
    border-color: rgba(245, 158, 11, 0.28);
    background: rgba(255, 251, 235, 0.94);
  }
}

.content-grid {
  padding: 0 10px;
}

.stats-card {
  height: 100%;
  display: flex;
  flex-direction: column;
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
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #dbe6f6;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.internal-tab-nav {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  .stat-tile {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #dbe6f6;
    background: #fff;

    .label {
      font-size: 11px;
      color: #64748b;
      line-height: 1.2;
    }

    .value {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.3;
      color: #0f172a;
      word-break: break-all;

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

:deep(.stats-card .qy-card__header),
:deep(.main-card .qy-card__header) {
  padding: 14px 22px;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

:deep(.stats-card .qy-card__body),
:deep(.main-card .qy-card__body) {
  padding: 18px 22px;
}

:deep(.publish-tabs .el-tabs__header) {
  display: none;
}

:deep(.publish-tabs .el-tabs__content) {
  padding: 4px 8px 8px;
}
</style>
