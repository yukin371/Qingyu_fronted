/**
 * 导出功能API契约测试
 * @description 验证 exportApi 与后端 /api/v1/writer/exports 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  exportApi,
  createExportTask,
  exportChapter,
  exportSelection,
  getExportTaskStatus,
  cancelExportTask,
  getExportHistory,
  getAllExportHistory,
  downloadExportFile,
  deleteExportTask,
  getExportTemplates,
  saveExportTemplate,
  batchExport
} from '@/modules/writer/api/export'
import { request } from '@/utils/request-adapter'
import type {
  ExportTask,
  ExportDocumentRequest,
  ExportProjectRequest,
  ExportTaskListResponse,
  ExportFormat,
  ExportTaskStatus,
  ExportType
} from '@/modules/writer/types/export'

// Mock request adapter
vi.mock('@/utils/request-adapter')

describe('exportApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟导出任务数据
  const createMockExportTask = (overrides?: Partial<ExportTask>): ExportTask => ({
    id: 'task-123',
    type: 'document' as ExportType,
    resourceId: 'doc-456',
    resourceTitle: '测试文档',
    format: 'docx' as ExportFormat,
    status: 'completed' as ExportTaskStatus,
    progress: 100,
    fileSize: 10240,
    fileUrl: 'https://example.com/download/task-123.docx',
    expiresAt: '2024-12-31T23:59:59Z',
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:01:00Z',
    completedAt: '2024-01-01T00:01:00Z',
    ...overrides
  })

  describe('exportDocument (E-001)', () => {
    it('应该发送正确的POST请求导出文档', async () => {
      const mockTask = createMockExportTask()
      vi.mocked(request).mockResolvedValue(mockTask)

      const documentId = 'doc-456'
      const projectId = 'proj-789'
      const options: ExportDocumentRequest = {
        format: 'docx' as ExportFormat,
        includeMeta: true
      }
      const result = await exportApi.exportDocument(documentId, projectId, options)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/documents/${documentId}/export`,
        method: 'post',
        params: { projectId },
        data: options
      })
      expect(result).toEqual(mockTask)
    })

    it('应该正确传递导出选项', async () => {
      const mockTask = createMockExportTask({ status: 'pending' as ExportTaskStatus, progress: 0 })
      vi.mocked(request).mockResolvedValue(mockTask)

      const documentId = 'doc-456'
      const projectId = 'proj-789'
      const options: ExportDocumentRequest = {
        format: 'txt' as ExportFormat,
        includeMeta: false,
        options: {
          toc: true,
          pageNumbers: true,
          includeNotes: true,
          fontSize: 14,
          lineSpacing: 1.5
        }
      }
      await exportApi.exportDocument(documentId, projectId, options)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/documents/${documentId}/export`,
        method: 'post',
        params: { projectId },
        data: options
      })
    })

    it('应该正确处理导出失败的情况', async () => {
      const mockError = new Error('导出失败：文档不存在')
      vi.mocked(request).mockRejectedValue(mockError)

      const documentId = 'nonexistent'
      const projectId = 'proj-789'
      const options: ExportDocumentRequest = {
        format: 'docx' as ExportFormat
      }

      await expect(exportApi.exportDocument(documentId, projectId, options)).rejects.toThrow('导出失败：文档不存在')
    })
  })

  describe('exportProject (E-002)', () => {
    it('应该发送正确的POST请求导出项目', async () => {
      const mockTask = createMockExportTask({
        type: 'project' as ExportType,
        resourceId: 'proj-789',
        resourceTitle: '测试项目'
      })
      vi.mocked(request).mockResolvedValue(mockTask)

      const projectId = 'proj-789'
      const options: ExportProjectRequest = {
        includeDocuments: true,
        includeCharacters: true,
        includeLocations: true,
        documentFormats: 'md' as ExportFormat
      }
      const result = await exportApi.exportProject(projectId, options)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/projects/${projectId}/export`,
        method: 'post',
        data: options
      })
      expect(result).toEqual(mockTask)
    })

    it('应该正确传递项目导出选项', async () => {
      const mockTask = createMockExportTask()
      vi.mocked(request).mockResolvedValue(mockTask)

      const projectId = 'proj-789'
      const options: ExportProjectRequest = {
        includeDocuments: true,
        includeCharacters: false,
        includeLocations: false,
        includeTimeline: true,
        documentFormats: 'zip' as ExportFormat,
        options: {
          excludeChapters: ['chapter-1', 'chapter-2']
        }
      }
      await exportApi.exportProject(projectId, options)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/projects/${projectId}/export`,
        method: 'post',
        data: options
      })
    })

    it('应该正确处理项目导出失败的情况', async () => {
      const mockError = new Error('项目不存在')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(
        exportApi.exportProject('nonexistent', { includeDocuments: true })
      ).rejects.toThrow('项目不存在')
    })
  })

  describe('getTask (E-003)', () => {
    it('应该发送正确的GET请求获取导出任务状态', async () => {
      const mockTask = createMockExportTask({
        status: 'processing' as ExportTaskStatus,
        progress: 50
      })
      vi.mocked(request).mockResolvedValue(mockTask)

      const taskId = 'task-123'
      const result = await exportApi.getTask(taskId)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/exports/${taskId}`,
        method: 'get'
      })
      expect(result).toEqual(mockTask)
      expect(result.status).toBe('processing')
      expect(result.progress).toBe(50)
    })

    it('应该正确返回已完成任务', async () => {
      const mockTask = createMockExportTask({
        status: 'completed' as ExportTaskStatus,
        progress: 100,
        fileUrl: 'https://example.com/download/file.docx'
      })
      vi.mocked(request).mockResolvedValue(mockTask)

      const result = await exportApi.getTask('task-123')

      expect(result.status).toBe('completed')
      expect(result.fileUrl).toBe('https://example.com/download/file.docx')
    })

    it('应该正确返回失败任务', async () => {
      const mockTask = createMockExportTask({
        status: 'failed' as ExportTaskStatus,
        errorMsg: '导出过程中发生错误'
      })
      vi.mocked(request).mockResolvedValue(mockTask)

      const result = await exportApi.getTask('task-123')

      expect(result.status).toBe('failed')
      expect(result.errorMsg).toBe('导出过程中发生错误')
    })

    it('应该正确处理任务不存在的情况', async () => {
      const mockError = new Error('任务不存在')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.getTask('nonexistent')).rejects.toThrow('任务不存在')
    })
  })

  describe('listTasks (E-004)', () => {
    it('应该发送正确的GET请求获取任务列表', async () => {
      const mockResponse: ExportTaskListResponse = {
        items: [createMockExportTask()],
        total: 1,
        page: 1,
        pageSize: 20
      }
      vi.mocked(request).mockResolvedValue(mockResponse)

      const projectId = 'proj-789'
      const result = await exportApi.listTasks(projectId)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/projects/${projectId}/exports`,
        method: 'get',
        params: { page: 1, pageSize: 20 }
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确传递分页参数', async () => {
      const mockResponse: ExportTaskListResponse = {
        items: [],
        total: 0,
        page: 2,
        pageSize: 10
      }
      vi.mocked(request).mockResolvedValue(mockResponse)

      const projectId = 'proj-789'
      await exportApi.listTasks(projectId, 2, 10)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/projects/${projectId}/exports`,
        method: 'get',
        params: { page: 2, pageSize: 10 }
      })
    })

    it('应该正确处理空任务列表', async () => {
      const mockResponse: ExportTaskListResponse = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20
      }
      vi.mocked(request).mockResolvedValue(mockResponse)

      const result = await exportApi.listTasks('proj-789')

      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('downloadFile (E-005)', () => {
    it('应该发送正确的GET请求下载文件', async () => {
      const mockBlob = new Blob(['test content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      vi.mocked(request).mockResolvedValue(mockBlob)

      const taskId = 'task-123'
      const result = await exportApi.downloadFile(taskId)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/exports/${taskId}/download`,
        method: 'get',
        responseType: 'blob'
      })
      expect(result).toBeInstanceOf(Blob)
    })

    it('应该正确处理下载失败的情况', async () => {
      const mockError = new Error('文件已过期')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.downloadFile('task-123')).rejects.toThrow('文件已过期')
    })

    it('应该正确处理文件不存在的情况', async () => {
      const mockError = new Error('文件不存在')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.downloadFile('nonexistent')).rejects.toThrow('文件不存在')
    })
  })

  describe('cancelTask (E-006)', () => {
    it('应该发送正确的POST请求取消任务', async () => {
      const mockResponse = { success: true }
      vi.mocked(request).mockResolvedValue(mockResponse)

      const taskId = 'task-123'
      const result = await exportApi.cancelTask(taskId)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/exports/${taskId}/cancel`,
        method: 'post'
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理取消失败的情况', async () => {
      const mockError = new Error('任务已完成，无法取消')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.cancelTask('task-123')).rejects.toThrow('任务已完成，无法取消')
    })

    it('应该正确处理任务不存在的情况', async () => {
      const mockError = new Error('任务不存在')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.cancelTask('nonexistent')).rejects.toThrow('任务不存在')
    })
  })

  describe('deleteTask (E-007)', () => {
    it('应该发送正确的DELETE请求删除任务', async () => {
      const mockResponse = { success: true }
      vi.mocked(request).mockResolvedValue(mockResponse)

      const taskId = 'task-123'
      const result = await exportApi.deleteTask(taskId)

      expect(request).toHaveBeenCalledWith({
        url: `/api/v1/writer/exports/${taskId}`,
        method: 'delete'
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理删除失败的情况', async () => {
      const mockError = new Error('删除失败')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.deleteTask('task-123')).rejects.toThrow('删除失败')
    })

    it('应该正确处理任务不存在的情况', async () => {
      const mockError = new Error('任务不存在')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.deleteTask('nonexistent')).rejects.toThrow('任务不存在')
    })
  })

  describe('后端不支持的功能', () => {
    it('exportSelection 应该返回错误：后端不支持导出选中内容', async () => {
      await expect(exportSelection({ text: 'test' })).rejects.toThrow('后端不支持导出选中内容')
    })

    it('getAllExportHistory 应该返回错误：后端不支持全局导出历史查询', async () => {
      await expect(getAllExportHistory({ page: 1 })).rejects.toThrow('后端不支持全局导出历史查询')
    })

    it('getExportTemplates 应该返回错误：后端不支持导出模板管理', async () => {
      await expect(getExportTemplates()).rejects.toThrow('后端不支持导出模板管理')
    })

    it('saveExportTemplate 应该返回错误：后端不支持导出模板管理', async () => {
      await expect(saveExportTemplate({ name: 'test' })).rejects.toThrow('后端不支持导出模板管理')
    })

    it('batchExport 应该返回错误：后端不支持批量导出', async () => {
      await expect(batchExport({ documentIds: ['1', '2'] })).rejects.toThrow('后端不支持批量导出')
    })
  })

  describe('废弃方法（向后兼容）', () => {
    it('createExportTask 应该调用 exportApi.exportProject', async () => {
      const mockTask = createMockExportTask()
      vi.mocked(request).mockResolvedValue(mockTask)

      const result = await createExportTask('book-123', { format: 'docx' })

      expect(request).toHaveBeenCalledWith({
        url: '/api/v1/writer/projects/book-123/export',
        method: 'post',
        data: { format: 'docx' }
      })
      expect(result).toEqual(mockTask)
    })

    it('exportChapter 应该调用 exportApi.exportDocument', async () => {
      const mockTask = createMockExportTask()
      vi.mocked(request).mockResolvedValue(mockTask)

      await exportChapter('chapter-123', 'txt')

      expect(request).toHaveBeenCalledWith({
        url: '/api/v1/writer/documents/chapter-123/export',
        method: 'post',
        params: { projectId: '' },
        data: { format: 'txt' }
      })
    })

    it('getExportTaskStatus 应该调用 exportApi.getTask', async () => {
      const mockTask = createMockExportTask()
      vi.mocked(request).mockResolvedValue(mockTask)

      const result = await getExportTaskStatus('task-123')

      expect(request).toHaveBeenCalledWith({
        url: '/api/v1/writer/exports/task-123',
        method: 'get'
      })
      expect(result).toEqual(mockTask)
    })

    it('cancelExportTask 应该调用 exportApi.cancelTask', async () => {
      const mockResponse = { success: true }
      vi.mocked(request).mockResolvedValue(mockResponse)

      await cancelExportTask('task-123')

      expect(request).toHaveBeenCalledWith({
        url: '/api/v1/writer/exports/task-123/cancel',
        method: 'post'
      })
    })

    it('getExportHistory 应该调用 exportApi.listTasks', async () => {
      const mockResponse: ExportTaskListResponse = {
        items: [createMockExportTask()],
        total: 1,
        page: 1,
        pageSize: 20
      }
      vi.mocked(request).mockResolvedValue(mockResponse)

      await getExportHistory('book-123', { page: 2, page_size: 10 })

      expect(request).toHaveBeenCalledWith({
        url: '/api/v1/writer/projects/book-123/exports',
        method: 'get',
        params: { page: 2, pageSize: 10 }
      })
    })

    it('downloadExportFile 应该调用 exportApi.downloadFile', async () => {
      const mockBlob = new Blob(['test'])
      vi.mocked(request).mockResolvedValue(mockBlob)

      await downloadExportFile('task-123')

      expect(request).toHaveBeenCalledWith({
        url: '/api/v1/writer/exports/task-123/download',
        method: 'get',
        responseType: 'blob'
      })
    })

    it('deleteExportTask 应该调用 exportApi.deleteTask', async () => {
      const mockResponse = { success: true }
      vi.mocked(request).mockResolvedValue(mockResponse)

      await deleteExportTask('task-123')

      expect(request).toHaveBeenCalledWith({
        url: '/api/v1/writer/exports/task-123',
        method: 'delete'
      })
    })
  })

  describe('错误处理', () => {
    it('应该正确处理401未授权错误', async () => {
      const mockError = new Error('请先登录')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.getTask('task-123')).rejects.toThrow('请先登录')
    })

    it('应该正确处理403权限不足错误', async () => {
      const mockError = new Error('无权访问此任务')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.getTask('task-123')).rejects.toThrow('无权访问此任务')
    })

    it('应该正确处理404资源不存在错误', async () => {
      const mockError = new Error('任务不存在')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.getTask('nonexistent')).rejects.toThrow('任务不存在')
    })

    it('应该正确处理500服务器错误', async () => {
      const mockError = new Error('服务器内部错误')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(
        exportApi.exportDocument('doc-123', 'proj-456', { format: 'docx' })
      ).rejects.toThrow('服务器内部错误')
    })

    it('应该正确处理网络错误', async () => {
      const mockError = new Error('Network Error')
      vi.mocked(request).mockRejectedValue(mockError)

      await expect(exportApi.getTask('task-123')).rejects.toThrow('Network Error')
    })
  })
})
