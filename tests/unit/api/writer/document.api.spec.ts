/**
 * 文档管理API契约测试
 * @description 验证 documentApi 与后端 /api/v1/writer/documents 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  documentApi,
  getDocuments,
  getDocumentTree,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  moveDocument,
  duplicateDocument,
  type MoveDocumentRequest,
  type ReorderDocumentsRequest,
  type DuplicateDocumentRequest,
} from '@/modules/writer/api/document'
import httpService from '@/core/services/http.service'
import type {
  Document,
  CreateDocumentRequest,
  UpdateDocumentMetaRequest,
  DocumentStatus,
  DocumentType,
} from '@/modules/writer/types/document'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('documentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟文档数据
  const createMockDocument = (overrides?: Partial<Document>): Document => ({
    id: 'doc-123',
    projectId: 'proj-456',
    parentId: undefined,
    title: '测试文档',
    type: 'chapter' as DocumentType,
    level: 1,
    order: 0,
    status: 'writing' as DocumentStatus,
    wordCount: 1000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  })

  // 模拟API响应
  const createMockAPIResponse = <T>(data: T) => ({
    code: 200,
    message: 'success',
    data,
    timestamp: Date.now(),
  })

  describe('create (D-001)', () => {
    it('应该发送正确的POST请求创建文档', async () => {
      const mockDocument = createMockDocument()
      const mockResponse = createMockAPIResponse(mockDocument)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: CreateDocumentRequest = {
        projectId,
        title: '新章节',
        type: 'chapter' as DocumentType,
      }
      const result = await documentApi.create(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/project/${projectId}/documents`,
        data
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确传递父文档ID', async () => {
      const mockDocument = createMockDocument({ parentId: 'parent-doc-1' })
      const mockResponse = createMockAPIResponse(mockDocument)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: CreateDocumentRequest = {
        projectId,
        parentId: 'parent-doc-1',
        title: '子章节',
        type: 'section' as DocumentType,
        order: 1,
      }
      await documentApi.create(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/project/${projectId}/documents`,
        data
      )
    })

    it('应该正确处理创建失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '标题不能为空',
          },
        },
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      const projectId = 'proj-456'
      const data: CreateDocumentRequest = {
        projectId,
        title: '',
        type: 'chapter' as DocumentType,
      }

      await expect(documentApi.create(projectId, data)).rejects.toEqual(mockError)
    })
  })

  describe('list (D-002)', () => {
    it('应该发送正确的GET请求获取文档列表', async () => {
      const mockDocuments = [createMockDocument()]
      const mockResponse = createMockAPIResponse({
        documents: mockDocuments,
        total: 1,
      })
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await documentApi.list(projectId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/project/${projectId}/documents`,
        undefined
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确传递分页参数', async () => {
      const mockResponse = createMockAPIResponse({
        documents: [],
        total: 0,
      })
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      await documentApi.list(projectId, { page: 2, pageSize: 20 })

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/project/${projectId}/documents`,
        { page: 2, pageSize: 20 }
      )
    })

    it('应该正确处理空文档列表', async () => {
      const mockResponse = createMockAPIResponse({
        documents: [],
        total: 0,
      })
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await documentApi.list(projectId)

      expect(result.data.documents).toHaveLength(0)
      expect(result.data.total).toBe(0)
    })
  })

  describe('getTree (D-003)', () => {
    it('应该发送正确的GET请求获取文档树', async () => {
      const mockTree = [createMockDocument({ children: [] })]
      const mockResponse = createMockAPIResponse(mockTree)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await documentApi.getTree(projectId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/project/${projectId}/documents/tree`
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理嵌套的文档树结构', async () => {
      const childDoc = createMockDocument({ id: 'child-1', title: '子文档' })
      const parentDoc = createMockDocument({
        id: 'parent-1',
        title: '父文档',
        children: [childDoc],
      })
      const mockResponse = createMockAPIResponse([parentDoc])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await documentApi.getTree(projectId)

      expect(result.data[0].children).toHaveLength(1)
      expect(result.data[0].children?.[0].title).toBe('子文档')
    })

    it('应该正确处理空文档树', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await documentApi.getTree(projectId)

      expect(result.data).toHaveLength(0)
    })
  })

  describe('getDetail (D-004)', () => {
    it('应该发送正确的GET请求获取文档详情', async () => {
      const mockDocument = createMockDocument()
      const mockResponse = createMockAPIResponse(mockDocument)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const documentId = 'doc-123'
      const result = await documentApi.getDetail(documentId)

      expect(httpService.get).toHaveBeenCalledWith(`/writer/documents/${documentId}`)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确返回文档元数据', async () => {
      const mockDocument = createMockDocument({
        notes: '测试备注',
        tags: ['标签1', '标签2'],
        wordCount: 5000,
      })
      const mockResponse = createMockAPIResponse(mockDocument)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await documentApi.getDetail('doc-123')

      expect(result.data.notes).toBe('测试备注')
      expect(result.data.tags).toEqual(['标签1', '标签2'])
      expect(result.data.wordCount).toBe(5000)
    })

    it('应该正确处理文档不存在的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '文档不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(documentApi.getDetail('nonexistent')).rejects.toEqual(mockError)
    })
  })

  describe('update (D-005)', () => {
    it('应该发送正确的PUT请求更新文档', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const documentId = 'doc-123'
      const data: UpdateDocumentMetaRequest = {
        title: '更新后的标题',
        status: 'completed' as DocumentStatus,
      }
      const result = await documentApi.update(documentId, data)

      expect(httpService.put).toHaveBeenCalledWith(
        `/writer/documents/${documentId}`,
        data
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确更新文档状态', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const documentId = 'doc-123'
      await documentApi.update(documentId, { status: 'completed' as DocumentStatus })

      expect(httpService.put).toHaveBeenCalledWith(`/writer/documents/${documentId}`, {
        status: 'completed',
      })
    })

    it('应该正确更新标签和备注', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const documentId = 'doc-123'
      const data: UpdateDocumentMetaRequest = {
        tags: ['重要', '待审核'],
        notes: '更新备注',
      }
      await documentApi.update(documentId, data)

      expect(httpService.put).toHaveBeenCalledWith(
        `/writer/documents/${documentId}`,
        data
      )
    })

    it('应该正确处理更新失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权限修改此文档',
          },
        },
      }
      vi.mocked(httpService.put).mockRejectedValue(mockError)

      await expect(
        documentApi.update('doc-123', { title: '新标题' })
      ).rejects.toEqual(mockError)
    })
  })

  describe('delete (D-006)', () => {
    it('应该发送正确的DELETE请求删除文档', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const documentId = 'doc-123'
      const result = await documentApi.delete(documentId)

      expect(httpService.delete).toHaveBeenCalledWith(`/writer/documents/${documentId}`)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理删除不存在的文档', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '文档不存在',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(documentApi.delete('nonexistent')).rejects.toEqual(mockError)
    })

    it('应该正确处理无权限删除的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权限删除此文档',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(documentApi.delete('doc-123')).rejects.toEqual(mockError)
    })
  })

  describe('move (D-007)', () => {
    it('应该发送正确的PUT请求移动文档', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const documentId = 'doc-123'
      const data: MoveDocumentRequest = {
        parentId: 'parent-456',
        order: 2,
      }
      const result = await documentApi.move(documentId, data)

      expect(httpService.put).toHaveBeenCalledWith(
        `/writer/documents/${documentId}/move`,
        data
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确移动文档到根目录', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const documentId = 'doc-123'
      const data: MoveDocumentRequest = {
        parentId: undefined,
      }
      await documentApi.move(documentId, data)

      expect(httpService.put).toHaveBeenCalledWith(
        `/writer/documents/${documentId}/move`,
        { parentId: undefined }
      )
    })

    it('应该正确处理移动失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '不能将文档移动到自身或其子文档下',
          },
        },
      }
      vi.mocked(httpService.put).mockRejectedValue(mockError)

      await expect(
        documentApi.move('doc-123', { parentId: 'child-doc' })
      ).rejects.toEqual(mockError)
    })
  })

  describe('reorder (D-008)', () => {
    it('应该发送正确的PUT请求重新排序文档', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: ReorderDocumentsRequest = {
        documentIds: ['doc-1', 'doc-2', 'doc-3'],
        parentId: 'parent-1',
      }
      const result = await documentApi.reorder(projectId, data)

      expect(httpService.put).toHaveBeenCalledWith(
        `/writer/project/${projectId}/documents/reorder`,
        data
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理根目录文档的重新排序', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: ReorderDocumentsRequest = {
        documentIds: ['doc-a', 'doc-b'],
      }
      await documentApi.reorder(projectId, data)

      expect(httpService.put).toHaveBeenCalledWith(
        `/writer/project/${projectId}/documents/reorder`,
        data
      )
    })

    it('应该正确处理重新排序失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '文档ID列表不能为空',
          },
        },
      }
      vi.mocked(httpService.put).mockRejectedValue(mockError)

      await expect(
        documentApi.reorder('proj-456', { documentIds: [] })
      ).rejects.toEqual(mockError)
    })
  })

  describe('duplicate (D-009)', () => {
    it('应该发送正确的POST请求复制文档', async () => {
      const mockResponse = createMockAPIResponse({
        documentId: 'new-doc-123',
        title: '测试文档 (副本)',
        stableRef: 'ref-abc123',
      })
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const documentId = 'doc-123'
      const data: DuplicateDocumentRequest = {
        targetParentId: 'parent-456',
        position: 'inner',
        copyContent: true,
      }
      const result = await documentApi.duplicate(documentId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/documents/${documentId}/duplicate`,
        data
      )
      expect(result).toEqual(mockResponse)
      expect(result.data.documentId).toBe('new-doc-123')
    })

    it('应该正确复制文档到before位置', async () => {
      const mockResponse = createMockAPIResponse({
        documentId: 'new-doc-456',
        title: '测试文档 (副本)',
        stableRef: 'ref-xyz789',
      })
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const documentId = 'doc-123'
      const data: DuplicateDocumentRequest = {
        targetParentId: 'sibling-doc',
        position: 'before',
        copyContent: false,
      }
      await documentApi.duplicate(documentId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/documents/${documentId}/duplicate`,
        data
      )
    })

    it('应该正确复制文档到after位置', async () => {
      const mockResponse = createMockAPIResponse({
        documentId: 'new-doc-789',
        title: '测试文档 (副本)',
        stableRef: 'ref-qwe456',
      })
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const documentId = 'doc-123'
      const data: DuplicateDocumentRequest = {
        targetParentId: 'sibling-doc',
        position: 'after',
        copyContent: true,
      }
      await documentApi.duplicate(documentId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/documents/${documentId}/duplicate`,
        data
      )
    })

    it('应该正确处理复制失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '源文档不存在',
          },
        },
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        documentApi.duplicate('nonexistent', {
          position: 'inner',
          copyContent: true,
        })
      ).rejects.toEqual(mockError)
    })
  })

  describe('命名导出函数', () => {
    it('getDocuments应该调用documentApi.list', async () => {
      const mockResponse = createMockAPIResponse({ documents: [], total: 0 })
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await getDocuments('proj-456', { page: 1 })

      expect(httpService.get).toHaveBeenCalledWith(
        '/writer/project/proj-456/documents',
        { page: 1 }
      )
    })

    it('getDocumentTree应该调用documentApi.getTree', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await getDocumentTree('proj-456')

      expect(httpService.get).toHaveBeenCalledWith(
        '/writer/project/proj-456/documents/tree'
      )
    })

    it('getDocumentById应该调用documentApi.getDetail', async () => {
      const mockDocument = createMockDocument()
      const mockResponse = createMockAPIResponse(mockDocument)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await getDocumentById('doc-123')

      expect(httpService.get).toHaveBeenCalledWith('/writer/documents/doc-123')
    })

    it('createDocument应该调用documentApi.create', async () => {
      const mockDocument = createMockDocument()
      const mockResponse = createMockAPIResponse(mockDocument)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const data: CreateDocumentRequest = {
        projectId: 'proj-456',
        title: '新文档',
        type: 'chapter' as DocumentType,
      }
      await createDocument('proj-456', data)

      expect(httpService.post).toHaveBeenCalledWith(
        '/writer/project/proj-456/documents',
        data
      )
    })

    it('updateDocument应该调用documentApi.update', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      await updateDocument('doc-123', { title: '新标题' })

      expect(httpService.put).toHaveBeenCalledWith('/writer/documents/doc-123', {
        title: '新标题',
      })
    })

    it('deleteDocument应该调用documentApi.delete', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      await deleteDocument('doc-123')

      expect(httpService.delete).toHaveBeenCalledWith('/writer/documents/doc-123')
    })

    it('moveDocument应该调用documentApi.move', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      await moveDocument('doc-123', { parentId: 'parent-456' })

      expect(httpService.put).toHaveBeenCalledWith('/writer/documents/doc-123/move', {
        parentId: 'parent-456',
      })
    })

    it('duplicateDocument应该调用documentApi.duplicate', async () => {
      const mockResponse = createMockAPIResponse({
        documentId: 'new-doc',
        title: '副本',
        stableRef: 'ref-123',
      })
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      await duplicateDocument('doc-123', {
        position: 'inner',
        copyContent: true,
      })

      expect(httpService.post).toHaveBeenCalledWith(
        '/writer/documents/doc-123/duplicate',
        { position: 'inner', copyContent: true }
      )
    })
  })

  describe('错误处理', () => {
    it('应该正确处理401未授权错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(documentApi.getDetail('doc-123')).rejects.toEqual(mockError)
    })

    it('应该正确处理403权限不足错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权访问此项目',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(documentApi.list('proj-456')).rejects.toEqual(mockError)
    })

    it('应该正确处理404资源不存在错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '项目不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(documentApi.getTree('nonexistent')).rejects.toEqual(mockError)
    })

    it('应该正确处理500服务器错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 500,
            message: '服务器内部错误',
          },
        },
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        documentApi.create('proj-456', {
          projectId: 'proj-456',
          title: '测试',
          type: 'chapter' as DocumentType,
        })
      ).rejects.toEqual(mockError)
    })

    it('应该正确处理网络错误', async () => {
      const mockError = new Error('Network Error')
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(documentApi.getDetail('doc-123')).rejects.toThrow('Network Error')
    })
  })
})
