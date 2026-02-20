<template>
  <div class="review-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">内容审核</h2>
        <p class="page-subtitle">按作者跟进审核用户提交的书籍、章节、评论等内容</p>
      </div>
      <el-button @click="loadReviews">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item pending">
        <div class="stat-icon">
          <el-icon :size="20"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">待审核</span>
        </div>
      </div>
      <div class="stat-item approved">
        <div class="stat-icon">
          <el-icon :size="20"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.approved }}</span>
          <span class="stat-label">已通过</span>
        </div>
      </div>
      <div class="stat-item rejected">
        <div class="stat-icon">
          <el-icon :size="20"><CircleClose /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.rejected }}</span>
          <span class="stat-label">已拒绝</span>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-card">
      <div class="filters-main">
        <div class="filter-group filter-block">
          <span class="filter-label">内容类型</span>
          <el-select
            v-model="filters.contentType"
            placeholder="全部类型"
            clearable
            popper-class="admin-select-popper"
            @change="handleFilterChange"
          >
            <el-option label="全部" value="" />
            <el-option label="书籍" value="book" />
            <el-option label="章节" value="chapter" />
            <el-option label="文档" value="document" />
            <el-option label="评论" value="comment" />
          </el-select>
        </div>

        <div class="filter-group filter-block">
          <span class="filter-label">关键词</span>
          <el-input
            v-model="filters.keyword"
            placeholder="搜索标题或内容"
            clearable
            @clear="handleFilterChange"
            @keyup.enter="handleFilterChange"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-group filter-block">
          <span class="filter-label">作者</span>
          <el-select
            v-model="filters.author"
            placeholder="全部作者"
            clearable
            popper-class="admin-select-popper"
            @change="handleFilterChange"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="author in authorOptions"
              :key="author"
              :label="author"
              :value="author"
            />
          </el-select>
        </div>
      </div>

      <div class="filters-actions">
        <el-button type="primary" @click="handleFilterChange">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 待审核列表 -->
    <div v-loading="loading" class="review-list">
      <el-empty v-if="reviews.length === 0 && !loading" description="暂无待审核内容">
        <template #image>
          <el-icon :size="64" color="#d1d5db"><DocumentChecked /></el-icon>
        </template>
      </el-empty>

      <ReviewCard
        v-for="item in reviews"
        :key="item.reviewId"
        :item="item"
        @approve="handleApprove"
        @reject="handleReject"
        @view="handleView"
      />
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-card">
      <div class="pagination-total">共 {{ total }} 条</div>
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="total"
        layout="prev, pager, next"
        @update:current-page="pagination.page = $event"
        @current-change="loadReviews"
      />
    </div>

    <!-- 审核详情对话框 -->
    <el-dialog v-model="dialogVisible" :title="`审核详情 - ${currentItem?.title || '无标题'}`" width="800px">
      <div v-if="currentItem" class="review-detail">
        <div class="detail-header">
          <div class="detail-type" :class="currentItem.contentType">
            {{ getTypeName(currentItem.contentType) }}
          </div>
          <div class="detail-time">{{ currentItem.submittedAt }}</div>
        </div>

        <div class="detail-info">
          <div class="info-item">
            <span class="info-label">提交者</span>
            <span class="info-value">{{ currentItem.submittedBy }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">内容ID</span>
            <span class="info-value code">{{ currentItem.contentId }}</span>
          </div>
        </div>

        <div v-if="currentItem.content" class="content-preview">
          <h4>内容预览</h4>
          <div class="content-text">{{ currentItem.content }}</div>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="danger" @click="handleReject(currentItem!)">
          <el-icon><CloseBold /></el-icon>
          拒绝
        </el-button>
        <el-button type="success" @click="handleApprove(currentItem!)">
          <el-icon><Select /></el-icon>
          批准
        </el-button>
      </template>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="5"
            placeholder="请输入拒绝原因，将通知提交者"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { Refresh, Clock, CircleCheck, CircleClose, Search, DocumentChecked, CloseBold, Select } from '@element-plus/icons-vue'
import ReviewCard from '@admin/components/ReviewCard.vue'
import * as adminAPI from '@/modules/admin/api'
import type { PendingReview } from '@/types/shared'

// 统计数据
const stats = reactive({
  pending: 23,
  approved: 156,
  rejected: 12
})

const isTestMode = new URLSearchParams(window.location.search).get('test') === 'true'

// 筛选器
const filters = reactive({
  contentType: '',
  keyword: '',
  author: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 数据
const loading = ref(false)
const reviews = ref<any[]>([])
const total = ref(0)
const mockReviewsPool = ref<any[]>([])
const authorOptions = computed<string[]>(() => {
  const source = mockReviewsPool.value.length > 0 ? mockReviewsPool.value : createMockReviewsPool()
  const set = new Set<string>()
  source.forEach((item) => {
    const name = String(item.submittedBy || item.submitterName || '').trim()
    if (name) set.add(name)
  })
  return Array.from(set)
})

// 对话框
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentItem = ref<PendingReview | null>(null)
const submitting = ref(false)

// 拒绝表单
const rejectForm = reactive({
  reason: ''
})

type ReviewContentType = 'book' | 'chapter' | 'document' | 'comment'

function createMockReviewsPool(): any[] {
  const books = ['云岚纪事', '北境灯塔', '潮汐备忘录', '群星修补计划', '旧城电台']
  const typeSequence: ReviewContentType[] = ['chapter', 'comment', 'book', 'document']
  const titleByType: Record<ReviewContentType, string[]> = {
    chapter: ['第12章 夜巡', '第28章 逆风信号', '第7章 雨巷回声', '第34章 终点站'],
    comment: ['书评：节奏稍慢但设定很强', '评论：主角弧线清晰', '长评：后半段更精彩', '读者反馈：建议补充背景'],
    book: ['新书《风暴前夜》提交审核', '作品《雪线之下》修订版', '《第七码头》封面与简介更新', '《碎片图书馆》上架申请'],
    document: ['作者公告草稿', '活动说明文档', '章节大纲修订', '读者问答汇总']
  }
  const authors = ['林澈', '周岚', '顾野', '安若', '沈青', '夏川', '陆临']
  const statusPlan: Array<'pending' | 'approved' | 'rejected'> = [
    ...Array(23).fill('pending'),
    ...Array(34).fill('approved'),
    ...Array(11).fill('rejected')
  ]
  const now = Date.now()

  return statusPlan.map((status, index) => {
    const contentType = typeSequence[index % typeSequence.length]
    const bookName = books[index % books.length]
    const author = authors[index % authors.length]
    const createdAt = new Date(now - index * 75 * 60 * 1000).toISOString()
    const reviewedAt =
      status === 'pending'
        ? undefined
        : new Date(new Date(createdAt).getTime() + (20 + (index % 40)) * 60 * 1000).toISOString()

    return {
      id: `rvw_${(index + 1).toString().padStart(4, '0')}`,
      reviewId: `rvw_${(index + 1).toString().padStart(4, '0')}`,
      targetId: `${contentType}_${1000 + index}`,
      contentId: `${contentType}_${1000 + index}`,
      title: titleByType[contentType][index % titleByType[contentType].length],
      content: `来自《${bookName}》的${contentType === 'comment' ? '读者内容' : '提交内容'}，用于模拟审核列表展示与筛选行为。第 ${index + 1} 条记录。`,
      submitterId: `user_${2000 + (index % 50)}`,
      submittedBy: author,
      submitterName: author,
      projectName: bookName,
      type: contentType,
      contentType,
      status,
      createdAt,
      submittedAt: createdAt,
      reviewedAt
    }
  })
}

function applyMockFilters(source: any[]): any[] {
  let filtered = source.filter((item) => item.status === 'pending')

  if (filters.contentType) {
    filtered = filtered.filter((item) => item.contentType === filters.contentType)
  }

  const keyword = filters.keyword.trim().toLowerCase()
  if (keyword) {
    filtered = filtered.filter((item) => {
      const title = String(item.title || '').toLowerCase()
      const content = String(item.content || '').toLowerCase()
      const submitter = String(item.submittedBy || '').toLowerCase()
      const projectName = String(item.projectName || '').toLowerCase()
      return (
        title.includes(keyword) ||
        content.includes(keyword) ||
        submitter.includes(keyword) ||
        projectName.includes(keyword)
      )
    })
  }

  if (filters.author) {
    filtered = filtered.filter((item) => {
      const submitter = String(item.submittedBy || item.submitterName || '')
      return submitter === filters.author
    })
  }

  return filtered
}

function syncStatsWithMockPool(): void {
  const source = mockReviewsPool.value
  stats.pending = source.filter((item) => item.status === 'pending').length
  stats.approved = source.filter((item) => item.status === 'approved').length
  stats.rejected = source.filter((item) => item.status === 'rejected').length
}

function loadMockReviews(): void {
  if (mockReviewsPool.value.length === 0) {
    mockReviewsPool.value = createMockReviewsPool()
  }

  syncStatsWithMockPool()
  const filtered = applyMockFilters(mockReviewsPool.value)
  total.value = filtered.length

  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  reviews.value = filtered.slice(start, end)
}

// 获取类型名称
const getTypeName = (type?: string): string => {
  if (!type) return '-'
  const typeMap: Record<string, string> = {
    book: '书籍',
    chapter: '章节',
    document: '文档',
    comment: '评论'
  }
  return typeMap[type] || type
}

// 加载审核列表
const loadReviews = async () => {
  loading.value = true
  try {
    if (isTestMode) {
      loadMockReviews()
      return
    }

    const params: any = {
      page: pagination.page,
      page_size: pagination.pageSize
    }

    if (filters.contentType) {
      params.content_type = filters.contentType
    }
    if (filters.author) {
      params.submitter_name = filters.author
    }

    const response = await adminAPI.getPendingReviews(params)

    if (response.data) {
      if (Array.isArray(response.data)) {
        const list = filters.author
          ? response.data.filter((item: any) => String(item.submittedBy || item.submitterName || '') === filters.author)
          : response.data
        reviews.value = list
        total.value = list.length
        stats.pending = total.value
      } else if (response.data.items) {
        const list = filters.author
          ? response.data.items.filter((item: any) => String(item.submittedBy || item.submitterName || '') === filters.author)
          : response.data.items
        reviews.value = list
        total.value = filters.author ? list.length : (response.data.total || 0)
        stats.pending = total.value
      }
    }
  } catch (error) {
    console.error('加载审核列表失败:', error)
    if (!isTestMode) {
      loadMockReviews()
      message.warning('接口不可用，已切换为模拟审核数据')
    } else {
      message.error('加载审核列表失败')
    }
  } finally {
    loading.value = false
  }
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadReviews()
}

// 查看详情
const handleView = (item: PendingReview) => {
  currentItem.value = item
  dialogVisible.value = true
}

// 批准
const handleApprove = async (item: PendingReview) => {
  try {
    await messageBox.confirm('确认批准该内容吗？批准后将自动发布。', '确认批准', {
      confirmButtonText: '确认批准',
      cancelButtonText: '取消',
      type: 'confirm',
      center: true,
      closeOnClickModal: false,
      closeOnPressEscape: true
    })

    if (isTestMode) {
      const target = mockReviewsPool.value.find(
        (row) =>
          (row.contentId || row.targetId) === (item.contentId || item.targetId) &&
          row.status === 'pending'
      )
      if (target) {
        target.status = 'approved'
        target.reviewedAt = new Date().toISOString()
      }
      message.success('批准成功，内容已发布（模拟）')
      dialogVisible.value = false
      loadReviews()
      return
    }

    await adminAPI.reviewContent(item.contentId || item.targetId, {
      status: 'approved'
    })

    message.success('批准成功，内容已发布')
    dialogVisible.value = false
    loadReviews()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批准失败:', error)
      message.error('批准失败')
    }
  }
}

// 拒绝
const handleReject = (item: PendingReview) => {
  currentItem.value = item
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    message.warning('请输入拒绝原因')
    return
  }

  if (!currentItem.value) return

  submitting.value = true
  try {
    if (isTestMode) {
      const target = mockReviewsPool.value.find(
        (row) =>
          (row.contentId || row.targetId) === (currentItem.value?.contentId || currentItem.value?.targetId) &&
          row.status === 'pending'
      )
      if (target) {
        target.status = 'rejected'
        target.reason = rejectForm.reason
        target.reviewedAt = new Date().toISOString()
      }
      message.success('已拒绝该内容（模拟）')
      rejectDialogVisible.value = false
      dialogVisible.value = false
      loadReviews()
      return
    }

    await adminAPI.reviewContent(currentItem.value.contentId || currentItem.value.targetId, {
      status: 'rejected',
      reason: rejectForm.reason
    })

    message.success('已拒绝该内容')
    rejectDialogVisible.value = false
    dialogVisible.value = false
    loadReviews()
  } catch (error) {
    console.error('拒绝失败:', error)
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadReviews()
})
</script>

<style scoped lang="scss">
.review-management {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  .header-info {
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
}

// 统计卡片
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  border: 1px solid #e5e7eb;

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .stat-label {
    font-size: 13px;
    color: #6b7280;
  }

  &.pending {
    .stat-icon { background: rgba(245, 87, 108, 0.1); color: #f5576c; }
    .stat-value { color: #f5576c; }
  }

  &.approved {
    .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .stat-value { color: #10b981; }
  }

  &.rejected {
    .stat-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .stat-value { color: #ef4444; }
  }
}

// 筛选器
.filters-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.filters-main {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  .filter-label {
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
  }

  > .el-select {
    width: 200px;
  }

  > .el-input {
    width: 240px;
  }

  :deep(.el-select__wrapper),
  :deep(.el-input__wrapper) {
    display: flex;
    align-items: center;
    height: 36px;
    min-height: 36px;
    box-sizing: border-box;
  }

  :deep(.el-select__wrapper) {
    position: relative;
    padding: 0 30px 0 12px;
  }

  :deep(.el-select__selection) {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    flex: 1;
  }

  :deep(.el-select__placeholder) {
    flex: 0 0 auto;
    width: auto !important;
    max-width: none !important;
    overflow: visible;
    text-overflow: clip;
  }

  :deep(.el-select__selected-item) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: none;
  }

  /* 保证下拉箭头始终在右侧，避免与文案重叠 */
  :deep(.el-select__suffix) {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
  }

  :deep(.el-select__caret) {
    margin-left: 0;
  }
}

.filter-block {
  flex: 1;
  padding: 10px 12px;
  background: #f8fafc;
}

.filter-block + .filter-block {
  border-left: 1px solid #e2e8f0;
}

.filters-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

// 审核列表
.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

// 分页
.pagination-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;

  .pagination-total {
    font-size: 14px;
    color: #64748b;
    white-space: nowrap;
  }

  :deep(.el-pagination) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px 10px;
    font-size: 14px;
    color: #475569;
  }

  :deep(.el-pagination__total),
  :deep(.el-pagination__sizes),
  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.el-pager),
  :deep(.el-pagination__jump) {
    margin: 0 !important;
    display: inline-flex;
    align-items: center;
  }

  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.el-pager li) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #334155;
    transition: all 0.2s ease;
  }

  :deep(.btn-prev:hover),
  :deep(.btn-next:hover),
  :deep(.el-pager li:hover) {
    border-color: #93c5fd;
    color: #2563eb;
    background: #eff6ff;
  }

  :deep(.el-pager li.is-active) {
    border-color: #3b82f6;
    background: #3b82f6;
    color: #fff;
  }
}

// 审核详情
.review-detail {
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f3f4f6;
  }

  .detail-type {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;

    &.book { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    &.chapter { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    &.document { background: rgba(102, 126, 234, 0.1); color: #667eea; }
    &.comment { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
  }

  .detail-time {
    font-size: 13px;
    color: #9ca3af;
  }

  .detail-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .info-label {
      font-size: 12px;
      color: #9ca3af;
    }

    .info-value {
      font-size: 14px;
      color: #374151;

      &.code {
        font-family: monospace;
        background: #f3f4f6;
        padding: 4px 8px;
        border-radius: 4px;
      }
    }
  }

  .content-preview {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .content-text {
      padding: 16px;
      background: #f9fafb;
      border-radius: 12px;
      line-height: 1.8;
      color: #4b5563;
      max-height: 400px;
      overflow-y: auto;
    }
  }
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }

  .filters-card {
    flex-direction: column;
    align-items: stretch;

    .filters-main {
      flex-direction: column;
    }

    .filter-group {
      flex-direction: column;
      align-items: stretch;

      > .el-select, > .el-input {
        width: 100%;
      }
    }

    .filter-block + .filter-block {
      border-left: none;
      border-top: 1px solid #e2e8f0;
    }
  }

  .pagination-card {
    padding: 18px 14px;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-start;

    .pagination-total {
      width: 100%;
      margin-bottom: 2px;
    }

    :deep(.el-pagination) {
      justify-content: flex-start;
      gap: 8px;
    }
  }
}
</style>
