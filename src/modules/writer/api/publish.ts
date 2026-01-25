/**
 * 写作发布 API
 * @description 对接后端 /api/v1/writer/publish 路由，提供章节发布、审核、付费等功能
 * @endpoint /api/v1/writer/publish
 * @category writer
 * @tags 发布管理
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
 * @description 获取指定书籍的发布计划详情
 * @endpoint GET /api/v1/writer/publish/books/:bookId/plan
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @response {PublishPlan} 200 - 成功返回发布计划
 * @security BearerAuth
 */
export function getPublishPlan(bookId: string) {
  return request<PublishPlan>({
    url: `/api/v1/writer/publish/books/${bookId}/plan`,
    method: 'get'
  })
}

/**
 * 创建发布计划
 * @description 为指定书籍创建新的发布计划
 * @endpoint POST /api/v1/writer/publish/books/:bookId/plan
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @param {Object} data - 发布计划数据
 * @param {string} data.name - 计划名称
 * @param {string} [data.description] - 计划描述
 * @param {PublishType} data.type - 发布类型（free: 免费, paid: 付费, vip: VIP专享, limited: 限时免费）
 * @param {PublishPlatform[]} data.platforms - 发布平台（web: 网页, mobile: 移动, all: 全平台）
 * @param {Object} data.schedule - 发布调度配置
 * @param {Object} data.pricing - 付费配置
 * @response {PublishPlan} 201 - 成功创建发布计划
 * @security BearerAuth
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
 * @description 更新已有的发布计划
 * @endpoint PUT /api/v1/writer/publish/plans/:planId
 * @category writer
 * @tags 发布管理
 * @param {string} planId - 发布计划ID
 * @param {Partial<PublishPlan>} data - 要更新的计划字段
 * @response {PublishPlan} 200 - 成功更新发布计划
 * @security BearerAuth
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
 * @description 删除指定的发布计划
 * @endpoint DELETE /api/v1/writer/publish/plans/:planId
 * @category writer
 * @tags 发布管理
 * @param {string} planId - 发布计划ID
 * @response {{success: boolean}} 204 - 成功删除发布计划
 * @security BearerAuth
 */
export function deletePublishPlan(planId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/plans/${planId}`,
    method: 'delete'
  })
}

/**
 * 发布章节
 * @description 立即发布指定章节
 * @endpoint POST /api/v1/writer/publish/chapters/:chapterId
 * @category writer
 * @tags 发布管理
 * @param {string} chapterId - 章节ID
 * @param {ChapterPublishConfig} config - 发布配置（是否免费、价格、VIP专享等）
 * @response {PublishRecord} 201 - 成功发布章节
 * @security BearerAuth
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
 * @description 批量发布多个章节
 * @endpoint POST /api/v1/writer/publish/chapters/batch
 * @category writer
 * @tags 发布管理
 * @param {Object} data - 批量发布数据
 * @param {string[]} data.chapter_ids - 章节ID数组
 * @param {ChapterPublishConfig} data.config - 发布配置
 * @response {PublishRecord[]} 201 - 成功批量发布，返回发布记录列表
 * @security BearerAuth
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
 * @description 取消已发布的章节，将其下架
 * @endpoint DELETE /api/v1/writer/publish/chapters/:chapterId
 * @category writer
 * @tags 发布管理
 * @param {string} chapterId - 章节ID
 * @response {{success: boolean}} 204 - 成功取消发布
 * @security BearerAuth
 */
export function unpublishChapter(chapterId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/chapters/${chapterId}`,
    method: 'delete'
  })
}

/**
 * 定时发布章节
 * @description 设置章节在指定时间自动发布
 * @endpoint POST /api/v1/writer/publish/chapters/:chapterId/schedule
 * @category writer
 * @tags 发布管理
 * @param {string} chapterId - 章节ID
 * @param {string} publishAt - 发布时间（ISO8601格式）
 * @response {PublishRecord} 201 - 成功设置定时发布
 * @security BearerAuth
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
 * @description 获取指定书籍的发布记录列表，支持分页和状态筛选
 * @endpoint GET /api/v1/writer/publish/books/:bookId/records
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.page_size] - 每页数量
 * @param {PublishStatus} [params.status] - 发布状态筛选
 * @response {{items: PublishRecord[], total: number}} 200 - 成功返回发布记录
 * @security BearerAuth
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
 * @description 获取指定书籍的发布统计数据
 * @endpoint GET /api/v1/writer/publish/books/:bookId/stats
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @response {PublishStats} 200 - 成功返回发布统计
 * @security BearerAuth
 */
export function getPublishStats(bookId: string) {
  return request<PublishStats>({
    url: `/api/v1/writer/publish/books/${bookId}/stats`,
    method: 'get'
  })
}

/**
 * 提交审核
 * @description 将书籍提交审核
 * @endpoint POST /api/v1/writer/publish/books/:bookId/review
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @response {{success: boolean}} 200 - 成功提交审核
 * @security BearerAuth
 */
export function submitForReview(bookId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/books/${bookId}/review`,
    method: 'post'
  })
}

/**
 * 获取审核状态
 * @description 获取书籍的审核状态和审核意见
 * @endpoint GET /api/v1/writer/publish/books/:bookId/review/status
 * @category writer
 * @tags 发布管理
 * @param {string} bookId - 书籍ID
 * @response {{status: PublishStatus, reviewer?: string, review_comment?: string, reviewed_at?: string}} 200 - 成功返回审核状态
 * @security BearerAuth
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
 * @description 设置章节的付费方式和价格
 * @endpoint PUT /api/v1/writer/publish/chapters/:chapterId/pricing
 * @category writer
 * @tags 发布管理
 * @param {string} chapterId - 章节ID
 * @param {Object} data - 付费配置
 * @param {boolean} data.is_free - 是否免费
 * @param {number} [data.price] - 价格（分）
 * @param {boolean} [data.vip_only] - 是否VIP专享
 * @response {{success: boolean}} 200 - 成功设置付费
 * @security BearerAuth
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
 * @description 获取章节的发布状态和付费信息
 * @endpoint GET /api/v1/writer/publish/chapters/:chapterId/status
 * @category writer
 * @tags 发布管理
 * @param {string} chapterId - 章节ID
 * @response {{status: PublishStatus, published_at?: string, is_free: boolean, price?: number, vip_only: boolean}} 200 - 成功返回章节状态
 * @security BearerAuth
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
 * @description 更新发布计划的发布平台
 * @endpoint PUT /api/v1/writer/publish/plans/:planId/platforms
 * @category writer
 * @tags 发布管理
 * @param {string} planId - 发布计划ID
 * @param {PublishPlatform[]} platforms - 发布平台列表
 * @response {{success: boolean}} 200 - 成功更新发布平台
 * @security BearerAuth
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
 * @description 暂停正在执行的发布计划
 * @endpoint POST /api/v1/writer/publish/plans/:planId/pause
 * @category writer
 * @tags 发布管理
 * @param {string} planId - 发布计划ID
 * @response {{success: boolean}} 200 - 成功暂停发布计划
 * @security BearerAuth
 */
export function pausePublishPlan(planId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/publish/plans/${planId}/pause`,
    method: 'post'
  })
}

/**
 * 恢复发布计划
 * @description 恢复已暂停的发布计划
 * @endpoint POST /api/v1/writer/publish/plans/:planId/resume
 * @category writer
 * @tags 发布管理
 * @param {string} planId - 发布计划ID
 * @response {{success: boolean}} 200 - 成功恢复发布计划
 * @security BearerAuth
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
