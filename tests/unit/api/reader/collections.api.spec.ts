/**
 * 收藏API契约测试
 * @description 验证 collectionsAPI 与后端 /api/v1/social/collections 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  collectionsAPI,
  Collection,
  CollectionFolder,
  CollectionStats
} from '@/modules/reader/api/manual/collections'
import { httpService } from '@/core/services/http.service'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('collectionsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟收藏数据
  const mockCollection: Collection = {
    id: 'collection-123',
    bookId: 'book-456',
    title: '测试书籍',
    author: '测试作者',
    cover: 'https://example.com/cover.jpg',
    description: '这是一本测试书籍',
    tags: ['玄幻', '热血'],
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }

  // 模拟收藏夹数据
  const mockFolder: CollectionFolder = {
    id: 'folder-123',
    name: '我的收藏夹',
    description: '收藏夹描述',
    bookCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }

  // 模拟收藏统计数据
  const mockStats: CollectionStats = {
    totalCollections: 100,
    publicCollections: 50,
    folderCount: 3
  }

  describe('addCollection', () => {
    // CL-001: 添加收藏-基本添加
    it('应该发送正确的POST请求添加收藏', async () => {
      const mockResponse = mockCollection
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const bookId = 'book-456'
      const result = await collectionsAPI.addCollection(bookId)

      expect(httpService.post).toHaveBeenCalledWith('/social/collections', {
        book_id: bookId
      })
      expect(result).toEqual(mockResponse)
    })

    // CL-001: 添加收藏-带附加信息
    it('应该发送正确的POST请求添加收藏（带附加信息）', async () => {
      const mockResponse = mockCollection
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const bookId = 'book-456'
      const data = {
        title: '自定义标题',
        description: '自定义描述',
        tags: ['自定义标签']
      }
      const result = await collectionsAPI.addCollection(bookId, data)

      expect(httpService.post).toHaveBeenCalledWith('/social/collections', {
        book_id: bookId,
        ...data
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getCollections', () => {
    // CL-002: 获取收藏列表-基本获取
    it('应该发送正确的GET请求获取收藏列表', async () => {
      const mockResponse = [mockCollection]
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getCollections()

      expect(httpService.get).toHaveBeenCalledWith('/social/collections', { params: undefined })
      expect(result).toEqual(mockResponse)
    })

    // CL-002: 获取收藏列表-带分页参数
    it('应该正确传递分页参数', async () => {
      const mockResponse = [mockCollection]
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params = { page: 2, pageSize: 10 }
      await collectionsAPI.getCollections(params)

      expect(httpService.get).toHaveBeenCalledWith('/social/collections', { params })
    })

    // CL-002: 获取收藏列表-空列表
    it('应该正确处理空收藏列表响应', async () => {
      const mockResponse: Collection[] = []
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getCollections()

      expect(httpService.get).toHaveBeenCalledWith('/social/collections', { params: undefined })
      expect(result).toHaveLength(0)
    })
  })

  describe('deleteCollection', () => {
    // CL-002: 删除收藏-基本删除
    it('应该发送正确的DELETE请求删除收藏', async () => {
      vi.mocked(httpService.delete).mockResolvedValue(undefined)

      const collectionId = 'collection-123'
      const result = await collectionsAPI.deleteCollection(collectionId)

      expect(httpService.delete).toHaveBeenCalledWith(`/social/collections/${collectionId}`)
      expect(result).toBeUndefined()
    })
  })

  describe('checkCollected', () => {
    // CL-002: 检查收藏状态-已收藏
    it('应该返回已收藏状态', async () => {
      const mockResponse = { is_collected: true }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-456'
      const result = await collectionsAPI.checkCollected(bookId)

      expect(httpService.get).toHaveBeenCalledWith('/social/collections/check', {
        params: { book_id: bookId }
      })
      expect(result.is_collected).toBe(true)
    })

    // CL-002: 检查收藏状态-未收藏
    it('应该返回未收藏状态', async () => {
      const mockResponse = { is_collected: false }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-999'
      const result = await collectionsAPI.checkCollected(bookId)

      expect(httpService.get).toHaveBeenCalledWith('/social/collections/check', {
        params: { book_id: bookId }
      })
      expect(result.is_collected).toBe(false)
    })
  })

  describe('updateCollection', () => {
    it('应该发送正确的PUT请求更新收藏', async () => {
      const mockResponse = { ...mockCollection, description: '更新后的描述' }
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const collectionId = 'collection-123'
      const data = { description: '更新后的描述' }
      const result = await collectionsAPI.updateCollection(collectionId, data)

      expect(httpService.put).toHaveBeenCalledWith(`/social/collections/${collectionId}`, data)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getCollectionsByTag', () => {
    it('应该发送正确的GET请求获取标签收藏', async () => {
      const mockResponse = [mockCollection]
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const tag = '玄幻'
      const result = await collectionsAPI.getCollectionsByTag(tag)

      expect(httpService.get).toHaveBeenCalledWith(`/social/collections/tags/${tag}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getCollectionStats', () => {
    it('应该发送正确的GET请求获取收藏统计', async () => {
      vi.mocked(httpService.get).mockResolvedValue(mockStats)

      const result = await collectionsAPI.getCollectionStats()

      expect(httpService.get).toHaveBeenCalledWith('/social/collections/stats')
      expect(result).toEqual(mockStats)
    })
  })

  describe('shareCollection', () => {
    it('应该发送正确的POST请求分享收藏', async () => {
      const mockResponse = { shareUrl: 'https://example.com/share/abc123' }
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const collectionId = 'collection-123'
      const result = await collectionsAPI.shareCollection(collectionId)

      expect(httpService.post).toHaveBeenCalledWith(`/social/collections/${collectionId}/share`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('unshareCollection', () => {
    it('应该发送正确的DELETE请求取消分享', async () => {
      vi.mocked(httpService.delete).mockResolvedValue(undefined)

      const collectionId = 'collection-123'
      const result = await collectionsAPI.unshareCollection(collectionId)

      expect(httpService.delete).toHaveBeenCalledWith(`/social/collections/${collectionId}/share`)
      expect(result).toBeUndefined()
    })
  })

  describe('createFolder', () => {
    it('应该发送正确的POST请求创建收藏夹', async () => {
      vi.mocked(httpService.post).mockResolvedValue(mockFolder)

      const name = '我的收藏夹'
      const result = await collectionsAPI.createFolder(name)

      expect(httpService.post).toHaveBeenCalledWith('/social/collections/folders', {
        name,
        description: undefined
      })
      expect(result).toEqual(mockFolder)
    })

    it('应该发送正确的POST请求创建收藏夹（带描述）', async () => {
      vi.mocked(httpService.post).mockResolvedValue(mockFolder)

      const name = '我的收藏夹'
      const description = '这是收藏夹描述'
      await collectionsAPI.createFolder(name, description)

      expect(httpService.post).toHaveBeenCalledWith('/social/collections/folders', {
        name,
        description
      })
    })
  })

  describe('getFolders', () => {
    it('应该发送正确的GET请求获取收藏夹列表', async () => {
      const mockResponse = [mockFolder]
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getFolders()

      expect(httpService.get).toHaveBeenCalledWith('/social/collections/folders')
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空收藏夹列表响应', async () => {
      const mockResponse: CollectionFolder[] = []
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getFolders()

      expect(result).toHaveLength(0)
    })
  })

  describe('updateFolder', () => {
    it('应该发送正确的PUT请求更新收藏夹', async () => {
      const mockResponse = { ...mockFolder, name: '更新后的名称' }
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const folderId = 'folder-123'
      const data = { name: '更新后的名称' }
      const result = await collectionsAPI.updateFolder(folderId, data)

      expect(httpService.put).toHaveBeenCalledWith(
        `/social/collections/folders/${folderId}`,
        data
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteFolder', () => {
    it('应该发送正确的DELETE请求删除收藏夹', async () => {
      vi.mocked(httpService.delete).mockResolvedValue(undefined)

      const folderId = 'folder-123'
      const result = await collectionsAPI.deleteFolder(folderId)

      expect(httpService.delete).toHaveBeenCalledWith(`/social/collections/folders/${folderId}`)
      expect(result).toBeUndefined()
    })
  })

  describe('错误处理', () => {
    // CL-001: 添加收藏-重复添加
    it('应该正确处理重复添加收藏的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 409,
            message: '书籍已收藏'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(collectionsAPI.addCollection('book-1')).rejects.toEqual(mockError)
    })

    // CL-001: 添加收藏-未登录
    it('应该正确处理添加收藏时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(collectionsAPI.addCollection('book-1')).rejects.toEqual(mockError)
    })

    // CL-002: 删除收藏-不存在
    it('应该正确处理删除不存在收藏的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '收藏不存在'
          }
        }
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(collectionsAPI.deleteCollection('nonexistent')).rejects.toEqual(mockError)
    })

    // CL-002: 获取收藏列表-未登录
    it('应该正确处理获取收藏列表时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(collectionsAPI.getCollections()).rejects.toEqual(mockError)
    })

    // CL-002: 检查收藏状态-未登录
    it('应该正确处理检查收藏状态时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(collectionsAPI.checkCollected('book-1')).rejects.toEqual(mockError)
    })

    // 创建收藏夹-未登录
    it('应该正确处理创建收藏夹时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(collectionsAPI.createFolder('新收藏夹')).rejects.toEqual(mockError)
    })

    // 删除收藏夹-不存在
    it('应该正确处理删除不存在收藏夹的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '收藏夹不存在'
          }
        }
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(collectionsAPI.deleteFolder('nonexistent')).rejects.toEqual(mockError)
    })
  })
})
