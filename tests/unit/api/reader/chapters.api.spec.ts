/**
 * 章节API契约测试
 * @description 验证 chaptersAPI 与后端 /api/v1/reader/books/:bookId/chapters 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chaptersAPI, Chapter } from '@/modules/reader/api/manual/chapters'
import { httpService } from '@/core/services/http.service'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('chaptersAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟API响应
  const createMockAPIResponse = <T>(data: T) => ({
    code: 200,
    message: 'success',
    data,
    timestamp: Date.now()
  })

  // 模拟章节数据
  const mockChapter: Chapter = {
    id: 'chapter-456',
    bookId: 'book-123',
    chapterNumber: 10,
    title: '第十章 命运的转折',
    content: '这是章节内容...',
    wordCount: 3000,
    publishedAt: '2024-01-10T08:00:00Z',
    createdAt: '2024-01-09T10:00:00Z',
    updatedAt: '2024-01-10T07:00:00Z'
  }

  const mockPreviousChapter: Chapter = {
    id: 'chapter-455',
    bookId: 'book-123',
    chapterNumber: 9,
    title: '第九章 暗流涌动'
  }

  const mockNextChapter: Chapter = {
    id: 'chapter-457',
    bookId: 'book-123',
    chapterNumber: 11,
    title: '第十一章 真相大白'
  }

  describe('getBookChapters', () => {
    // C-001: 获取章节列表
    it('应该发送正确的GET请求获取章节列表', async () => {
      const chapters = [mockPreviousChapter, mockChapter, mockNextChapter]
      const mockResponse = createMockAPIResponse(chapters)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await chaptersAPI.getBookChapters(bookId)

      expect(httpService.get).toHaveBeenCalledWith(`/reader/books/${bookId}/chapters?page=1&size=50`)
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(3)
    })

    // C-001: 获取章节列表-自定义分页
    it('应该正确传递分页参数', async () => {
      const mockResponse = createMockAPIResponse([mockChapter])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      await chaptersAPI.getBookChapters(bookId, 2, 20)

      expect(httpService.get).toHaveBeenCalledWith(`/reader/books/${bookId}/chapters?page=2&size=20`)
    })

    // C-001: 获取章节列表-空列表
    it('应该正确处理空章节列表', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'new-book-999'
      const result = await chaptersAPI.getBookChapters(bookId)

      expect(result.data).toHaveLength(0)
    })
  })

  describe('getChapterContent', () => {
    // C-002: 获取章节内容
    it('应该发送正确的GET请求获取章节内容', async () => {
      const contentData = {
        chapter: mockChapter,
        content: '这是完整的章节正文内容...'
      }
      const mockResponse = createMockAPIResponse(contentData)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const chapterId = 'chapter-456'
      const result = await chaptersAPI.getChapterContent(bookId, chapterId)

      expect(httpService.get).toHaveBeenCalledWith(`/reader/books/${bookId}/chapters/${chapterId}`)
      expect(result).toEqual(mockResponse)
      expect(result.data?.chapter.id).toBe(chapterId)
      expect(result.data?.content).toBeDefined()
    })

    // C-002: 获取章节内容-包含元数据
    it('应该返回包含元数据的章节内容', async () => {
      const contentData = {
        chapter: {
          ...mockChapter,
          wordCount: 5000,
          publishedAt: '2024-01-15T00:00:00Z'
        },
        content: '长篇内容...'
      }
      const mockResponse = createMockAPIResponse(contentData)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await chaptersAPI.getChapterContent('book-123', 'chapter-456')

      expect(result.data?.chapter.wordCount).toBe(5000)
      expect(result.data?.chapter.publishedAt).toBe('2024-01-15T00:00:00Z')
    })
  })

  describe('getPreviousChapter', () => {
    // C-003: 上一章导航
    it('应该发送正确的GET请求获取上一章', async () => {
      const mockResponse = createMockAPIResponse(mockPreviousChapter)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const chapterId = 'chapter-456'
      const result = await chaptersAPI.getPreviousChapter(bookId, chapterId)

      expect(httpService.get).toHaveBeenCalledWith(`/reader/books/${bookId}/chapters/${chapterId}/previous`)
      expect(result).toEqual(mockResponse)
      expect(result.data?.chapterNumber).toBe(9)
    })

    // C-003: 上一章导航-已是第一章
    it('应该正确处理已是第一章的情况', async () => {
      const mockResponse = createMockAPIResponse(null)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await chaptersAPI.getPreviousChapter('book-123', 'chapter-1')

      expect(result.data).toBeNull()
    })
  })

  describe('getNextChapter', () => {
    // C-004: 下一章导航
    it('应该发送正确的GET请求获取下一章', async () => {
      const mockResponse = createMockAPIResponse(mockNextChapter)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const chapterId = 'chapter-456'
      const result = await chaptersAPI.getNextChapter(bookId, chapterId)

      expect(httpService.get).toHaveBeenCalledWith(`/reader/books/${bookId}/chapters/${chapterId}/next`)
      expect(result).toEqual(mockResponse)
      expect(result.data?.chapterNumber).toBe(11)
    })

    // C-004: 下一章导航-已是最后一章
    it('应该正确处理已是最后一章的情况', async () => {
      const mockResponse = createMockAPIResponse(null)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await chaptersAPI.getNextChapter('book-123', 'chapter-999')

      expect(result.data).toBeNull()
    })
  })

  describe('其他章节相关API', () => {
    it('应该正确根据ID获取章节信息', async () => {
      const mockResponse = createMockAPIResponse(mockChapter)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const chapterId = 'chapter-456'
      const result = await chaptersAPI.getChapterById(chapterId)

      expect(httpService.get).toHaveBeenCalledWith(`/reader/chapters/${chapterId}/info`)
      expect(result.data?.id).toBe(chapterId)
    })

    it('应该正确根据章节号获取章节', async () => {
      const mockResponse = createMockAPIResponse(mockChapter)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const chapterNum = 10
      const result = await chaptersAPI.getChapterByNumber(bookId, chapterNum)

      expect(httpService.get).toHaveBeenCalledWith(`/reader/books/${bookId}/chapters/by-number/${chapterNum}`)
      expect(result.data?.chapterNumber).toBe(chapterNum)
    })
  })

  describe('错误处理', () => {
    // C-002: 获取章节内容-章节不存在
    it('应该正确处理章节不存在的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '章节不存在'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(chaptersAPI.getChapterContent('book-123', 'nonexistent')).rejects.toEqual(mockError)
    })

    // C-001: 获取章节列表-书籍不存在
    it('应该正确处理书籍不存在的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '书籍不存在'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(chaptersAPI.getBookChapters('nonexistent-book')).rejects.toEqual(mockError)
    })

    // C-003/C-004: 导航-未登录
    it('应该正确处理导航时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(chaptersAPI.getPreviousChapter('book-123', 'chapter-456')).rejects.toEqual(mockError)
      await expect(chaptersAPI.getNextChapter('book-123', 'chapter-456')).rejects.toEqual(mockError)
    })
  })
})
