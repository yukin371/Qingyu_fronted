/**
 * 审核历史相关的逻辑
 */
import { ref, reactive } from 'vue'

export interface ReviewStats {
  total: number
  approved: number
  approvedRate: number
  rejected: number
  rejectedRate: number
  pending: number
}

export interface ReviewRecord {
  id: string
  chapter_title: string
  chapter_number: number
  status: string
  submitted_at: string
  reviewed_at: string | null
  reviewer_name: string | null
  review_comment: string | null
}

export function useReviewHistory() {
  const loadingReview = ref(false)
  const reviewHistory = ref<ReviewRecord[]>([])
  const reviewPage = ref(1)
  const reviewPageSize = ref(20)
  const reviewTotal = ref(0)
  const reviewFilter = reactive({ status: '' })
  const reviewTrendPeriod = ref('7d')
  const reviewDetailDialogVisible = ref(false)
  const currentReviewDetail = ref<ReviewRecord | null>(null)

  const reviewStats = reactive<ReviewStats>({
    total: 0,
    approved: 0,
    approvedRate: 0,
    rejected: 0,
    rejectedRate: 0,
    pending: 0,
  })

  // 加载审核统计
  const loadReviewStats = async () => {
    try {
      // TODO: 调用审核统计 API
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

  // 加载审核历史
  const loadReviewHistory = async () => {
    loadingReview.value = true
    try {
      // TODO: 调用审核历史 API
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
    } finally {
      loadingReview.value = false
    }
  }

  // 查看审核详情
  const viewReviewDetail = (row: ReviewRecord) => {
    currentReviewDetail.value = row
    reviewDetailDialogVisible.value = true
  }

  // 关闭审核详情
  const closeReviewDetail = () => {
    reviewDetailDialogVisible.value = false
  }

  // 重新提交审核
  const resubmitReview = () => {
    reviewDetailDialogVisible.value = false
    // TODO: 实现重新提交审核逻辑
  }

  return {
    loadingReview,
    reviewHistory,
    reviewPage,
    reviewPageSize,
    reviewTotal,
    reviewFilter,
    reviewTrendPeriod,
    reviewDetailDialogVisible,
    currentReviewDetail,
    reviewStats,
    loadReviewStats,
    loadReviewHistory,
    viewReviewDetail,
    closeReviewDetail,
    resubmitReview,
  }
}
