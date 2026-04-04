/**
 * 评论API契约测试
 * @description 验证 commentsAPI 与后端 /api/v1/social/comments 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  commentsAPI,
  Comment,
  CreateCommentParams,
  GetCommentListParams,
  UpdateCommentParams,
  ReplyCommentParams
} from '@/modules/reader/api/manual/comments'
import { httpService } from '@/core/services/http.service'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('commentsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟评论数据
  const mockComment: Comment = {
    id: 'comment-123',
    bookId: 'book-456',
    chapterId: 'chapter-789',
    userId: 'user-001',
    userName: '测试用户',
    userAvatar: 'https://example.com/avatar.jpg',
    content: '这是一条测试评论',
    rating: 5,
    likesCount: 10,
    repliesCount: 2,
    isLiked: false,
    parentId: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  // 模拟回复评论数据
  const mockReplyComment: Comment = {
    ...mockComment,
    id: 'reply-123',
    content: '这是一条回复',
    parentId: 'comment-123',
    likesCount: 0,
    repliesCount: 0
  }

  // 模拟API响应
  const createMockAPIResponse = <T>(data: T) => data

  // 模拟分页响应
  const createMockPaginatedResponse = <T>(items: T[], total: number = items.length) => ({
    comments: items,
    total,
    page: 1,
    pageSize: 10
  })

  describe('createComment', () => {
    // CM-001: 创建评论-成功
    it('应该发送正确的POST请求创建评论', async () => {
      const mockResponse = createMockAPIResponse(mockComment)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const params: CreateCommentParams = {
        book_id: 'book-456',
        content: '这是一条测试评论',
        rating: 5
      }
      const result = await commentsAPI.createComment(params)

      expect(httpService.post).toHaveBeenCalledWith('/social/comments', params)
      expect(result).toEqual(mockResponse)
    })

    // CM-001: 创建评论-带章节ID
    it('应该正确发送带章节ID的评论', async () => {
      const mockResponse = createMockAPIResponse(mockComment)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const params: CreateCommentParams = {
        book_id: 'book-456',
        chapter_id: 'chapter-789',
        content: '这是章节评论',
        rating: 4
      }
      const result = await commentsAPI.createComment(params)

      expect(httpService.post).toHaveBeenCalledWith('/social/comments', params)
      expect(result).toEqual(mockResponse)
    })

    // CM-001: 创建评论-无评分
    it('应该正确发送无评分的评论', async () => {
      const mockResponse = createMockAPIResponse({ ...mockComment, rating: undefined })
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const params: CreateCommentParams = {
        book_id: 'book-456',
        content: '这是无评分评论'
      }
      const result = await commentsAPI.createComment(params)

      expect(httpService.post).toHaveBeenCalledWith('/social/comments', params)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getCommentList', () => {
    // CM-002: 获取评论列表-成功
    it('应该发送正确的GET请求获取评论列表', async () => {
      const mockResponse = createMockPaginatedResponse([mockComment])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: GetCommentListParams = { book_id: 'book-456' }
      const result = await commentsAPI.getCommentList(params)

      expect(httpService.get).toHaveBeenCalledWith('/social/comments', { params })
      expect(result).toEqual(mockResponse)
    })

    // CM-002: 获取评论列表-分页参数
    it('应该正确传递分页参数', async () => {
      const mockResponse = createMockPaginatedResponse([mockComment], 50)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: GetCommentListParams = {
        book_id: 'book-456',
        page: 2,
        page_size: 20,
        sortBy: 'likes'
      }
      const result = await commentsAPI.getCommentList(params)

      expect(httpService.get).toHaveBeenCalledWith('/social/comments', { params })
      expect(result.total).toBe(50)
    })

    // CM-002: 获取评论列表-按时间排序
    it('应该正确传递时间排序参数', async () => {
      const mockResponse = createMockPaginatedResponse([mockComment])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: GetCommentListParams = {
        book_id: 'book-456',
        sortBy: 'time'
      }
      await commentsAPI.getCommentList(params)

      expect(httpService.get).toHaveBeenCalledWith('/social/comments', { params })
    })

    // CM-002: 获取评论列表-章节评论
    it('应该正确获取章节评论列表', async () => {
      const mockResponse = createMockPaginatedResponse([mockComment])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: GetCommentListParams = {
        book_id: 'book-456',
        chapter_id: 'chapter-789'
      }
      await commentsAPI.getCommentList(params)

      expect(httpService.get).toHaveBeenCalledWith('/social/comments', { params })
    })

    // CM-002: 获取评论列表-空列表
    it('应该正确处理空评论列表响应', async () => {
      const mockResponse = createMockPaginatedResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await commentsAPI.getCommentList({ book_id: 'book-456' })

      expect(result.comments).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('getCommentById', () => {
    // CM-002: 获取评论详情-成功
    it('应该发送正确的GET请求获取评论详情', async () => {
      const mockResponse = createMockAPIResponse(mockComment)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const commentId = 'comment-123'
      const result = await commentsAPI.getCommentById(commentId)

      expect(httpService.get).toHaveBeenCalledWith(`/social/comments/${commentId}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateComment', () => {
    // CM-002: 更新评论-成功
    it('应该发送正确的PUT请求更新评论', async () => {
      const updatedComment = { ...mockComment, content: '更新后的内容' }
      const mockResponse = createMockAPIResponse(updatedComment)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const commentId = 'comment-123'
      const params: UpdateCommentParams = {
        content: '更新后的内容'
      }
      const result = await commentsAPI.updateComment(commentId, params)

      expect(httpService.put).toHaveBeenCalledWith(`/social/comments/${commentId}`, params)
      expect(result).toEqual(mockResponse)
    })

    // CM-002: 更新评论-仅更新评分
    it('应该正确更新评论评分', async () => {
      const updatedComment = { ...mockComment, rating: 4 }
      const mockResponse = createMockAPIResponse(updatedComment)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const commentId = 'comment-123'
      const params: UpdateCommentParams = {
        rating: 4
      }
      const result = await commentsAPI.updateComment(commentId, params)

      expect(httpService.put).toHaveBeenCalledWith(`/social/comments/${commentId}`, params)
      expect(result).toEqual(mockResponse)
    })

    // CM-002: 更新评论-同时更新内容和评分
    it('应该正确同时更新内容和评分', async () => {
      const updatedComment = { ...mockComment, content: '新内容', rating: 3 }
      const mockResponse = createMockAPIResponse(updatedComment)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const commentId = 'comment-123'
      const params: UpdateCommentParams = {
        content: '新内容',
        rating: 3
      }
      const result = await commentsAPI.updateComment(commentId, params)

      expect(httpService.put).toHaveBeenCalledWith(`/social/comments/${commentId}`, params)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteComment', () => {
    // CM-002: 删除评论-成功
    it('应该发送正确的DELETE请求删除评论', async () => {
      vi.mocked(httpService.delete).mockResolvedValue(undefined)

      const commentId = 'comment-123'
      const result = await commentsAPI.deleteComment(commentId)

      expect(httpService.delete).toHaveBeenCalledWith(`/social/comments/${commentId}`)
      expect(result).toBeUndefined()
    })
  })

  describe('replyComment', () => {
    // CM-003: 回复评论-成功
    it('应该发送正确的POST请求回复评论', async () => {
      const mockResponse = createMockAPIResponse(mockReplyComment)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const commentId = 'comment-123'
      const params: ReplyCommentParams = {
        content: '这是一条回复'
      }
      const result = await commentsAPI.replyComment(commentId, params)

      expect(httpService.post).toHaveBeenCalledWith(
        `/social/comments/${commentId}/reply`,
        params
      )
      expect(result).toEqual(mockResponse)
    })

    // CM-003: 回复评论-验证父子关系
    it('应该正确创建带有父评论ID的回复', async () => {
      const mockResponse = createMockAPIResponse(mockReplyComment)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const parentId = 'comment-123'
      const params: ReplyCommentParams = {
        content: '回复内容'
      }
      const result = await commentsAPI.replyComment(parentId, params)

      expect(httpService.post).toHaveBeenCalledWith(
        `/social/comments/${parentId}/reply`,
        params
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('likeComment', () => {
    // CM-004: 点赞评论-成功
    it('应该发送正确的POST请求点赞评论', async () => {
      vi.mocked(httpService.post).mockResolvedValue(undefined)

      const commentId = 'comment-123'
      const result = await commentsAPI.likeComment(commentId)

      expect(httpService.post).toHaveBeenCalledWith(`/social/comments/${commentId}/like`)
      expect(result).toBeUndefined()
    })
  })

  describe('unlikeComment', () => {
    // CM-004: 取消点赞-成功
    it('应该发送正确的DELETE请求取消点赞', async () => {
      vi.mocked(httpService.delete).mockResolvedValue(undefined)

      const commentId = 'comment-123'
      const result = await commentsAPI.unlikeComment(commentId)

      expect(httpService.delete).toHaveBeenCalledWith(`/social/comments/${commentId}/like`)
      expect(result).toBeUndefined()
    })
  })

  describe('错误处理', () => {
    // CM-001: 创建评论-未登录
    it('应该正确处理创建评论时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        commentsAPI.createComment({ book_id: 'book-1', content: '评论' })
      ).rejects.toEqual(mockError)
    })

    // CM-001: 创建评论-参数错误
    it('应该正确处理创建评论时的参数错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '评论内容不能为空'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        commentsAPI.createComment({ book_id: 'book-1', content: '' })
      ).rejects.toEqual(mockError)
    })

    // CM-002: 获取评论详情-不存在
    it('应该正确处理获取不存在的评论错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '评论不存在'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(commentsAPI.getCommentById('nonexistent')).rejects.toEqual(mockError)
    })

    // CM-002: 更新评论-无权限
    it('应该正确处理更新评论时的无权限错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权修改此评论'
          }
        }
      }
      vi.mocked(httpService.put).mockRejectedValue(mockError)

      await expect(
        commentsAPI.updateComment('comment-1', { content: '新内容' })
      ).rejects.toEqual(mockError)
    })

    // CM-002: 删除评论-无权限
    it('应该正确处理删除评论时的无权限错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权删除此评论'
          }
        }
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(commentsAPI.deleteComment('comment-1')).rejects.toEqual(mockError)
    })

    // CM-003: 回复评论-评论不存在
    it('应该正确处理回复不存在的评论错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '父评论不存在'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        commentsAPI.replyComment('nonexistent', { content: '回复' })
      ).rejects.toEqual(mockError)
    })

    // CM-004: 点赞评论-已点赞
    it('应该正确处理重复点赞错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 409,
            message: '已经点赞过该评论'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(commentsAPI.likeComment('comment-1')).rejects.toEqual(mockError)
    })

    // CM-004: 取消点赞-未点赞
    it('应该正确处理取消未点赞评论的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '尚未点赞该评论'
          }
        }
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(commentsAPI.unlikeComment('comment-1')).rejects.toEqual(mockError)
    })

    // CM-002: 获取评论列表-服务器错误
    it('应该正确处理获取评论列表时的服务器错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 500,
            message: '服务器内部错误'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(commentsAPI.getCommentList({ book_id: 'book-1' })).rejects.toEqual(mockError)
    })
  })
})
