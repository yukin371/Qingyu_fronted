/**
 * 写作发布 API
 */
import request from '@/utils/request-adapter'

// 发布状态
export type PublishStatus = 'draft' | 'pending_review' | 'scheduled' | 'published' | 'rejected' | 'unpublished'

// 发布类型
export type PublishType = 'free' | 'paid' | 'vip' | 'limited'

// 发布平台
export type PublishPlatform = 'web' | 'mobile' | 'all'

// 章节发布配置
export interface ChapterPublishConfig {
  chapter_id: string
  is_free?: boolean
  price?: number
  vip_only?: boolean
  publish_at?: string // 定时发布时间
}

// 发布计划
export interface PublishPlan {
  id: string
  book_id: string
  name: string
  description?: string
  type: PublishType
  status: PublishStatus
  platforms: PublishPlatform[]
  schedule: {
    type: 'immediate' | 'scheduled' | 'manual'
    publish_at?: string
    interval_days?: number
    chapters_per_release?: number
  }
  pricing: {
    is_free: boolean
    price?: number
    vip_discount?: number
  }
  created_at: string
  updated_at: string
}

// 发布记录
export interface PublishRecord {
  id: string
  book_id: string
  chapter_id: string
  chapter_title: string
  chapter_number: number
  status: PublishStatus
  published_at?: string
  created_at: string
}

// 发布统计
export interface PublishStats {
  total_chapters: number
  published_chapters: number
  draft_chapters: number
  pending_review_chapters: number
  scheduled_chapters: number
  total_words: number
  published_words: number
}

/**
 * 获取书籍发布计划
 */
export function getPublishPlan(bookId: string) {
  return request<PublishPlan>({
    url: `/api/v1/writer/publish/books/${bookId}/plan`,
    method: 'get'
  })
}

/**
 * 创建发布计划
 */
export function createPublishPlan(bookId: string, data: {
  name: string
  description?: string
  type: PublishType
  platforms: PublishPlatform[]
  schedule: PublishPlan['schedule']
  pricing: PublishPlan['pricing']
}) {
  return request<PublishPlan>({
    url: `/api/v1/writer/publish/books/${bookId}/plan`,
    method: 'post',
    data
  })
}

/**
 * 更新发布计划
 */
export function updatePublishPlan(planId: string, data: Partial<PublishPlan>) {
  return request<PublishPlan>({
    url: `/api/v1/writer/publish/plans/${planId}`,
    method: 'put',
    data
  })
}

/**
 * 删除发布计划
 */
export function deletePublishPlan(planId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/plans/${planId}`,
    method: 'delete'
  })
}

/**
 * 发布章节
 */
export function publishChapter(chapterId: string, config: ChapterPublishConfig) {
  return request<PublishRecord>({
    url: `/api/v1/writer/publish/chapters/${chapterId}`,
    method: 'post',
    data: config
  })
}

/**
 * 批量发布章节
 */
export function batchPublishChapters(data: {
  chapter_ids: string[]
  config: ChapterPublishConfig
}) {
  return request<PublishRecord[]>({
    url: '/api/v1/writer/publish/chapters/batch',
    method: 'post',
    data
  })
}

/**
 * 取消发布章节
 */
export function unpublishChapter(chapterId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/chapters/${chapterId}`,
    method: 'delete'
  })
}

/**
 * 定时发布章节
 */
export function scheduleChapter(chapterId: string, publishAt: string) {
  return request<PublishRecord>({
    url: `/api/v1/writer/publish/chapters/${chapterId}/schedule`,
    method: 'post',
    data: { publish_at: publishAt }
  })
}

/**
 * 获取发布记录
 */
export function getPublishRecords(bookId: string, params?: {
  page?: number
  page_size?: number
  status?: PublishStatus
}) {
  return request<{
    items: PublishRecord[]
    total: number
  }>({
    url: `/api/v1/writer/publish/books/${bookId}/records`,
    method: 'get',
    params
  })
}

/**
 * 获取发布统计
 */
export function getPublishStats(bookId: string) {
  return request<PublishStats>({
    url: `/api/v1/writer/publish/books/${bookId}/stats`,
    method: 'get'
  })
}

/**
 * 提交审核
 */
export function submitForReview(bookId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/books/${bookId}/review`,
    method: 'post'
  })
}

/**
 * 获取审核状态
 */
export function getReviewStatus(bookId: string) {
  return request<{
    status: PublishStatus
    reviewer?: string
    review_comment?: string
    reviewed_at?: string
  }>({
    url: `/api/v1/writer/publish/books/${bookId}/review/status`,
    method: 'get'
  })
}

/**
 * 设置章节付费
 */
export function setChapterPricing(chapterId: string, data: {
  is_free: boolean
  price?: number
  vip_only?: boolean
}) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/chapters/${chapterId}/pricing`,
    method: 'put',
    data
  })
}

/**
 * 获取章节发布状态
 */
export function getChapterPublishStatus(chapterId: string) {
  return request<{
    status: PublishStatus
    published_at?: string
    is_free: boolean
    price?: number
    vip_only: boolean
  }>({
    url: `/api/v1/writer/publish/chapters/${chapterId}/status`,
    method: 'get'
  })
}

/**
 * 更新发布平台
 */
export function updatePublishPlatforms(planId: string, platforms: PublishPlatform[]) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/plans/${planId}/platforms`,
    method: 'put',
    data: { platforms }
  })
}

/**
 * 暂停发布计划
 */
export function pausePublishPlan(planId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/plans/${planId}/pause`,
    method: 'post'
  })
}

/**
 * 恢复发布计划
 */
export function resumePublishPlan(planId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/plans/${planId}/resume`,
    method: 'post'
  })
}

// 发布类型选项
export const publishTypeOptions = [
  { label: '免费发布', value: 'free' as PublishType, description: '所有读者均可免费阅读' },
  { label: '付费阅读', value: 'paid' as PublishType, description: '读者需要付费才能阅读' },
  { label: 'VIP专享', value: 'vip' as PublishType, description: '仅VIP会员可阅读' },
  { label: '限时免费', value: 'limited' as PublishType, description: '限时免费，之后转为付费' }
]

// 发布平台选项
export const publishPlatformOptions = [
  { label: '网页端', value: 'web' as PublishPlatform },
  { label: '移动端', value: 'mobile' as PublishPlatform },
  { label: '全平台', value: 'all' as PublishPlatform }
]

// 发布状态映射
export const publishStatusMap: Record<PublishStatus, { label: string; type: 'info' | 'success' | 'warning' | 'danger' }> = {
  draft: { label: '草稿', type: 'info' },
  pending_review: { label: '审核中', type: 'warning' },
  scheduled: { label: '定时发布', type: 'info' },
  published: { label: '已发布', type: 'success' },
  rejected: { label: '审核驳回', type: 'danger' },
  unpublished: { label: '已下架', type: 'info' }
}
