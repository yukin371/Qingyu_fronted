/**
 * 发布管理API契约测试
 * @description 验证 publish API 与后端 /api/v1/writer/publish 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getPublishPlan,
  createPublishPlan,
  updatePublishPlan,
  deletePublishPlan,
  publishChapter,
  batchPublishChapters,
  unpublishChapter,
  scheduleChapter,
  getPublishRecords,
  getPublishStats,
  submitForReview,
  getReviewStatus,
  setChapterPricing,
  getChapterPublishStatus,
  updatePublishPlatforms,
  pausePublishPlan,
  resumePublishPlan,
  type PublishPlan,
  type PublishRecord,
  type PublishStats,
  type PublishStatus,
  type PublishType,
  type PublishPlatform,
  type ChapterPublishConfig
} from '@/modules/writer/api/publish'
import httpService from '@/core/services/http.service'
import { request } from '@/utils/request-adapter'

// Mock httpService and request
vi.mock('@/core/services/http.service')
vi.mock('@/utils/request-adapter')

describe('publishApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟发布计划数据
  const createMockPublishPlan = (overrides?: Partial<PublishPlan>): PublishPlan => ({
    id: 'plan-123',
    book_id: 'book-456',
    name: '测试发布计划',
    description: '这是一个测试发布计划',
    type: 'free' as PublishType,
    status: 'active' as PublishStatus,
    platforms: ['all' as PublishPlatform],
    schedule: { type: 'manual' },
    pricing: { is_free: true },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  })

  // 模拟发布记录数据
  const createMockPublishRecord = (overrides?: Partial<PublishRecord>): PublishRecord => ({
    id: 'record-123',
    book_id: 'book-456',
    chapter_id: 'chapter-789',
    chapter_title: '第一章 测试章节',
    chapter_number: 1,
    status: 'published' as PublishStatus,
    published_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides
  })

  // 模拟发布统计数据
  const createMockPublishStats = (overrides?: Partial<PublishStats>): PublishStats => ({
    total_chapters: 100,
    published_chapters: 50,
    draft_chapters: 30,
    pending_review_chapters: 10,
    scheduled_chapters: 10,
    total_words: 200000,
    published_words: 100000,
    ...overrides
  })

  describe('getPublishPlan (P-001)', () => {
    it('应该发送正确的GET请求获取发布计划', async () => {
      const mockStatusResponse = {
        projectId: 'book-456',
        projectTitle: '测试项目',
        isPublished: true,
        publishedAt: '2024-01-01T00:00:00Z'
      }
      vi.mocked(httpService.get).mockResolvedValue(mockStatusResponse)

      const bookId = 'book-456'
      const result = await getPublishPlan(bookId)

      expect(httpService.get).toHaveBeenCalledWith(`/api/v1/writer/projects/${bookId}/publication-status`)
      expect(result.book_id).toBe('book-456')
      expect(result.status).toBe('active')
    })

    it('应该正确处理未发布项目', async () => {
      const mockStatusResponse = {
        projectId: 'book-456',
        projectTitle: '测试项目',
        isPublished: false
      }
      vi.mocked(httpService.get).mockResolvedValue(mockStatusResponse)

      const result = await getPublishPlan('book-456')

      expect(result.status).toBe('paused')
    })

    it('应该正确处理空响应', async () => {
      vi.mocked(httpService.get).mockResolvedValue(null)

      const result = await getPublishPlan('book-456')

      expect(result.book_id).toBe('book-456')
      expect(result.type).toBe('free')
    })
  })

  describe('createPublishPlan (P-002)', () => {
    it('应该发送正确的POST请求创建发布计划', async () => {
      vi.mocked(httpService.post).mockResolvedValue({})
      const mockStatusResponse = {
        projectId: 'book-456',
        projectTitle: '测试项目',
        isPublished: true
      }
      vi.mocked(httpService.get).mockResolvedValue(mockStatusResponse)

      const bookId = 'book-456'
      const data = {
        name: '新发布计划',
        description: '测试描述',
        type: 'free' as PublishType,
        platforms: ['all' as PublishPlatform],
        schedule: { type: 'manual' as const },
        pricing: { is_free: true }
      }
      const result = await createPublishPlan(bookId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/api/v1/writer/projects/${bookId}/publish`,
        expect.objectContaining({
          bookstoreId: 'default-bookstore',
          categoryId: 'general',
          description: data.description,
          publishType: 'serial',
          enableComment: true,
          enableShare: true
        })
      )
      expect(result.book_id).toBe('book-456')
    })

    it('应该正确处理付费发布计划', async () => {
      vi.mocked(httpService.post).mockResolvedValue({})
      const mockStatusResponse = { projectId: 'book-456', isPublished: true }
      vi.mocked(httpService.get).mockResolvedValue(mockStatusResponse)

      const data = {
        name: '付费发布计划',
        type: 'paid' as PublishType,
        platforms: ['web' as PublishPlatform],
        schedule: { type: 'immediate' as const },
        pricing: { is_free: false, price: 100, vip_discount: 0.8 }
      }
      await createPublishPlan('book-456', data)

      expect(httpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          freeChapters: 0
        })
      )
    })

    it('应该正确处理创建失败的情况', async () => {
      const mockError = new Error('创建失败')
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        createPublishPlan('book-456', {
          name: '测试',
          type: 'free',
          platforms: ['all'],
          schedule: { type: 'manual' },
          pricing: { is_free: true }
        })
      ).rejects.toThrow('创建失败')
    })
  })

  describe('deletePublishPlan (P-003)', () => {
    it('应该发送正确的POST请求删除发布计划（unpublish）', async () => {
      vi.mocked(httpService.post).mockResolvedValue({})

      const planId = 'plan-123'
      const result = await deletePublishPlan(planId)

      expect(httpService.post).toHaveBeenCalledWith(`/api/v1/writer/projects/${planId}/unpublish`)
      expect(result).toEqual({ success: true })
    })

    it('应该正确处理删除失败的情况', async () => {
      const mockError = new Error('删除失败')
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(deletePublishPlan('plan-123')).rejects.toThrow('删除失败')
    })
  })

  describe('publishChapter (P-004)', () => {
    it('应该发送正确的POST请求发布章节', async () => {
      const mockRecord = createMockPublishRecord()
      vi.mocked(request).mockResolvedValue(mockRecord)

      const chapterId = 'chapter-789'
      const config: ChapterPublishConfig = {
        chapter_id: chapterId,
        is_free: true,
        project_id: 'proj-456'
      }
      const result = await publishChapter(chapterId, config)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/documents/${chapterId}/publish`,
        method: 'post',
        params: { projectId: 'proj-456' },
        data: expect.objectContaining({
          isFree: true
        })
      })
      expect(result).toEqual(mockRecord)
    })

    it('应该正确处理付费章节发布', async () => {
      const mockRecord = createMockPublishRecord()
      vi.mocked(request).mockResolvedValue(mockRecord)

      const chapterId = 'chapter-789'
      const config: ChapterPublishConfig = {
        chapter_id: chapterId,
        is_free: false,
        price: 100,
        vip_only: true,
        projectId: 'proj-456'
      }
      await publishChapter(chapterId, config)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/documents/${chapterId}/publish`,
        method: 'post',
        params: { projectId: 'proj-456' },
        data: expect.objectContaining({
          isFree: false
        })
      })
    })

    it('应该正确处理发布失败的情况', async () => {
      const mockError = new Error('发布失败')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(
        publishChapter('chapter-789', { chapter_id: 'chapter-789', is_free: true })
      ).rejects.toThrow('发布失败')
    })
  })

  describe('getPublishRecords (P-005)', () => {
    it('应该发送正确的GET请求获取发布记录', async () => {
      const mockResponse = {
        data: [
          {
            id: 'record-1',
            resourceId: 'chapter-1',
            resourceTitle: '第一章',
            status: 'published',
            publishTime: '2024-01-01T00:00:00Z',
            createdAt: '2024-01-01T00:00:00Z',
            metadata: { chapterTitle: '第一章', chapterNumber: 1 }
          }
        ],
        pagination: { total: 1 }
      }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-456'
      const result = await getPublishRecords(bookId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/api/v1/writer/projects/${bookId}/publications`,
        { params: { page: 1, pageSize: 20 } }
      )
      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('应该正确传递分页参数', async () => {
      const mockResponse = { data: [], pagination: { total: 0 } }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await getPublishRecords('book-456', { page: 2, page_size: 10 })

      expect(httpService.get).toHaveBeenCalledWith(
        expect.any(String),
        { params: { page: 2, pageSize: 10 } }
      )
    })

    it('应该正确映射后端状态到前端状态', async () => {
      const mockResponse = {
        data: [
          { id: '1', resourceId: 'c1', status: 'published', resourceTitle: 'T1' },
          { id: '2', resourceId: 'c2', status: 'pending', resourceTitle: 'T2' },
          { id: '3', resourceId: 'c3', status: 'failed', resourceTitle: 'T3' },
          { id: '4', resourceId: 'c4', status: 'unpublished', resourceTitle: 'T4' }
        ],
        pagination: { total: 4 }
      }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await getPublishRecords('book-456')

      expect(result.items[0].status).toBe('published')
      expect(result.items[1].status).toBe('pending_review')
      expect(result.items[2].status).toBe('rejected')
      expect(result.items[3].status).toBe('draft')
    })

    it('应该正确筛选状态', async () => {
      const mockResponse = {
        data: [
          { id: '1', resourceId: 'c1', status: 'published', resourceTitle: 'T1' },
          { id: '2', resourceId: 'c2', status: 'pending', resourceTitle: 'T2' }
        ],
        pagination: { total: 2 }
      }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await getPublishRecords('book-456', { status: 'published' })

      expect(result.items).toHaveLength(1)
      expect(result.items[0].status).toBe('published')
    })

    it('应该正确处理空记录列表', async () => {
      vi.mocked(httpService.get).mockResolvedValue({ data: [], pagination: { total: 0 } })

      const result = await getPublishRecords('book-456')

      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('getPublishStats (P-006)', () => {
    it('应该发送正确的GET请求获取发布统计', async () => {
      const mockStatusResponse = {
        totalChapters: 100,
        publishedChapters: 50,
        pendingChapters: 10
      }
      vi.mocked(httpService.get).mockResolvedValue(mockStatusResponse)

      const bookId = 'book-456'
      const result = await getPublishStats(bookId)

      expect(httpService.get).toHaveBeenCalledWith(`/api/v1/writer/projects/${bookId}/publication-status`)
      expect(result.total_chapters).toBe(100)
      expect(result.published_chapters).toBe(50)
      expect(result.pending_review_chapters).toBe(10)
      expect(result.draft_chapters).toBe(40) // 100 - 50 - 10
    })

    it('应该正确处理空统计数据', async () => {
      vi.mocked(httpService.get).mockResolvedValue(null)

      const result = await getPublishStats('book-456')

      expect(result.total_chapters).toBe(0)
      expect(result.published_chapters).toBe(0)
      expect(result.draft_chapters).toBe(0)
    })
  })

  describe('后端不支持的功能', () => {
    it('unpublishChapter 应该返回错误：后端暂未提供章节下架接口', async () => {
      await expect(unpublishChapter('chapter-123')).rejects.toThrow(
        '后端暂未提供章节下架接口，请使用项目下架或管理端操作'
      )
    })

    it('scheduleChapter 应该返回错误：后端暂未提供独立定时发布接口', async () => {
      await expect(scheduleChapter('chapter-123', '2024-12-31T00:00:00Z')).rejects.toThrow(
        '后端暂未提供独立定时发布接口'
      )
    })

    it('submitForReview 应该返回错误：后端暂未提供提交审核接口', async () => {
      await expect(submitForReview('book-456')).rejects.toThrow(
        '后端暂未提供提交审核接口'
      )
    })
  })

  describe('updatePublishPlan', () => {
    it('应该通过createPublishPlan实现更新', async () => {
      vi.mocked(httpService.post).mockResolvedValue({})
      const mockStatusResponse = { projectId: 'plan-123', isPublished: true }
      vi.mocked(httpService.get).mockResolvedValue(mockStatusResponse)

      const planId = 'plan-123'
      const data = {
        name: '更新后的计划',
        type: 'paid' as PublishType,
        platforms: ['web' as PublishPlatform]
      }
      await updatePublishPlan(planId, data)

      expect(httpService.post).toHaveBeenCalled()
    })
  })

  describe('batchPublishChapters', () => {
    it('应该发送正确的POST请求批量发布章节', async () => {
      const mockRecords = [createMockPublishRecord(), createMockPublishRecord({ id: 'record-456' })]
      vi.mocked(request).mockResolvedValue(mockRecords)

      const data = {
        chapter_ids: ['chapter-1', 'chapter-2'],
        config: { chapter_id: '', is_free: true }
      }
      const result = await batchPublishChapters(data)

      expect(request).toHaveBeenCalledWith({
        url: '/api/v1/writer/publish/chapters/batch',
        method: 'post',
        data
      })
      expect(result).toHaveLength(2)
    })

    it('应该正确处理批量发布失败', async () => {
      const mockError = new Error('批量发布失败')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(
        batchPublishChapters({ chapter_ids: ['1', '2'], config: { chapter_id: '', is_free: true } })
      ).rejects.toThrow('批量发布失败')
    })
  })

  describe('getReviewStatus', () => {
    it('应该发送正确的GET请求获取审核状态', async () => {
      const mockResponse = {
        status: 'pending_review' as PublishStatus,
        reviewer: '审核员A',
        review_comment: '等待审核',
        reviewed_at: '2024-01-01T00:00:00Z'
      }
      vi.mocked(request).mockResolvedValue(mockResponse)

      const bookId = 'book-456'
      const result = await getReviewStatus(bookId)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/publish/books/${bookId}/review/status`,
        method: 'get'
      })
      expect(result.status).toBe('pending_review')
    })
  })

  describe('setChapterPricing', () => {
    it('应该发送正确的PUT请求设置章节付费', async () => {
      vi.mocked(request).mockResolvedValue({ success: true })

      const chapterId = 'chapter-789'
      const data = {
        is_free: false,
        price: 100,
        vip_only: true
      }
      const result = await setChapterPricing(chapterId, data)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/publish/chapters/${chapterId}/pricing`,
        method: 'put',
        data
      })
      expect(result.success).toBe(true)
    })
  })

  describe('getChapterPublishStatus', () => {
    it('应该发送正确的GET请求获取章节发布状态', async () => {
      const mockResponse = {
        status: 'published' as PublishStatus,
        published_at: '2024-01-01T00:00:00Z',
        is_free: true,
        vip_only: false
      }
      vi.mocked(request).mockResolvedValue(mockResponse)

      const chapterId = 'chapter-789'
      const result = await getChapterPublishStatus(chapterId)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/publish/chapters/${chapterId}/status`,
        method: 'get'
      })
      expect(result.status).toBe('published')
      expect(result.is_free).toBe(true)
    })
  })

  describe('updatePublishPlatforms', () => {
    it('应该发送正确的PUT请求更新发布平台', async () => {
      vi.mocked(request).mockResolvedValue({ success: true })

      const planId = 'plan-123'
      const platforms: PublishPlatform[] = ['web', 'mobile']
      const result = await updatePublishPlatforms(planId, platforms)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/publish/plans/${planId}/platforms`,
        method: 'put',
        data: { platforms }
      })
      expect(result.success).toBe(true)
    })
  })

  describe('pausePublishPlan', () => {
    it('应该发送正确的POST请求暂停发布计划', async () => {
      vi.mocked(httpService.post).mockResolvedValue({})

      const planId = 'plan-123'
      const result = await pausePublishPlan(planId)

      expect(httpService.post).toHaveBeenCalledWith(`/api/v1/writer/projects/${planId}/unpublish`)
      expect(result).toEqual({ success: true })
    })
  })

  describe('resumePublishPlan', () => {
    it('应该发送正确的POST请求恢复发布计划', async () => {
      vi.mocked(httpService.post).mockResolvedValue({})

      const planId = 'plan-123'
      const result = await resumePublishPlan(planId)

      expect(httpService.post).toHaveBeenCalledWith(
        `/api/v1/writer/projects/${planId}/publish`,
        expect.objectContaining({
          publishType: 'serial',
          enableComment: true,
          enableShare: true
        })
      )
      expect(result).toEqual({ success: true })
    })
  })

  describe('错误处理', () => {
    it('应该正确处理401未授权错误', async () => {
      const mockError = new Error('请先登录')
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(getPublishPlan('book-456')).rejects.toThrow('请先登录')
    })

    it('应该正确处理403权限不足错误', async () => {
      const mockError = new Error('无权访问此项目')
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(getPublishRecords('book-456')).rejects.toThrow('无权访问此项目')
    })

    it('应该正确处理404资源不存在错误', async () => {
      const mockError = new Error('项目不存在')
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(getPublishStats('nonexistent')).rejects.toThrow('项目不存在')
    })

    it('应该正确处理500服务器错误', async () => {
      const mockError = new Error('服务器内部错误')
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        createPublishPlan('book-456', {
          name: '测试',
          type: 'free',
          platforms: ['all'],
          schedule: { type: 'manual' },
          pricing: { is_free: true }
        })
      ).rejects.toThrow('服务器内部错误')
    })

    it('应该正确处理网络错误', async () => {
      const mockError = new Error('Network Error')
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(getPublishPlan('book-456')).rejects.toThrow('Network Error')
    })
  })
})
