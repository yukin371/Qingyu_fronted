/**
 * Writer模块集成测试
 * 测试完整的工作流程
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  writerHandlers,
  handleWriterApiRequest,
  resetWriterMocks,
  mockFactory
} from '../../mocks/handlers/writer'

/**
 * Mock请求选项接口
 */
interface MockRequestOptions {
  method?: string
  body?: string
  headers?: Record<string, string>
}

/**
 * 模拟fetch请求
 */
async function mockFetch(url: string, options?: MockRequestOptions): Promise<Response> {
  const method = options?.method || 'GET'
  const body = options?.body ? JSON.parse(options.body) : undefined

  const response = handleWriterApiRequest(url, method, body)

  if (!response) {
    return new Response(JSON.stringify({ code: 404, message: 'Not Found', data: null }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify(response), {
    status: response.code === 200 ? 200 : response.code,
    headers: { 'Content-Type': 'application/json' }
  })
}

describe('Writer模块集成测试', () => {
  const projectId = 'test-project-001'
  let originalFetch: typeof fetch

  beforeEach(() => {
    resetWriterMocks()
    originalFetch = window.fetch
    window.fetch = vi.fn(mockFetch as typeof fetch)
  })

  afterEach(() => {
    window.fetch = originalFetch
    vi.restoreAllMocks()
  })

  describe('文档工作流', () => {
    it('应该能够完成完整的文档创建流程', async () => {
      // 步骤1: 获取文档树
      const treeResponse = await fetch(`/api/v1/writer/projects/${projectId}/documents/tree`)
      const treeData = await treeResponse.json()

      expect(treeData.code).toBe(200)
      expect(treeData.data).toBeDefined()
      expect(treeData.data.id).toBeDefined()
      expect(treeData.data.children).toBeDefined()

      // 步骤2: 创建新文档
      const createResponse = await fetch(`/api/v1/writer/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '新章节',
          type: 'chapter'
        })
      })
      const createData = await createResponse.json()

      expect(createData.code).toBe(200)
      expect(createData.data.title).toBe('新章节')
      expect(createData.data.type).toBe('chapter')

      const documentId = createData.data.id

      // 步骤3: 更新文档内容
      const updateResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/documents/${documentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: '这是章节内容...',
            wordCount: 100
          })
        }
      )
      const updateData = await updateResponse.json()

      expect(updateData.code).toBe(200)
      expect(updateData.data.wordCount).toBe(100)

      // 步骤4: 获取文档详情
      const detailResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/documents/${documentId}`
      )
      const detailData = await detailResponse.json()

      expect(detailData.code).toBe(200)
      expect(detailData.data.id).toBe(documentId)
    })

    it('应该能够处理文档树的层级结构', async () => {
      const treeResponse = await fetch(`/api/v1/writer/projects/${projectId}/documents/tree`)
      const treeData = await treeResponse.json()

      // 验证树结构
      expect(treeData.data.type).toBe('volume')
      expect(treeData.data.level).toBe(0)

      // 验证子节点
      if (treeData.data.children && treeData.data.children.length > 0) {
        const firstChild = treeData.data.children[0]
        expect(firstChild.parentId).toBe(treeData.data.id)
        expect(firstChild.level).toBeGreaterThan(0)
      }
    })
  })

  describe('世界观关联工作流', () => {
    it('应该能够创建角色并关联到文档', async () => {
      // 步骤1: 创建角色
      const createCharResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/characters`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '主角',
            summary: '故事的主要角色'
          })
        }
      )
      const charData = await createCharResponse.json()

      expect(charData.code).toBe(200)
      expect(charData.data.name).toBe('主角')

      const characterId = charData.data.id

      // 步骤2: 获取角色关系
      const relationsResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/characters/${characterId}/relations`
      )
      const relationsData = await relationsResponse.json()

      expect(relationsData.code).toBe(200)
      expect(Array.isArray(relationsData.data)).toBe(true)

      // 步骤3: 创建地点
      const createLocationResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/locations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '神秘森林',
            description: '故事发生的主要地点'
          })
        }
      )
      const locationData = await createLocationResponse.json()

      expect(locationData.code).toBe(200)
      expect(locationData.data.name).toBe('神秘森林')

      // 步骤4: 创建时间线
      const createTimelineResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/timelines`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '主线时间',
            description: '故事主线的时间线'
          })
        }
      )
      const timelineData = await createTimelineResponse.json()

      expect(timelineData.code).toBe(200)
      expect(timelineData.data.name).toBe('主线时间')

      const timelineId = timelineData.data.id

      // 步骤5: 获取时间线事件
      const eventsResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/timelines/${timelineId}/events`
      )
      const eventsData = await eventsResponse.json()

      expect(eventsData.code).toBe(200)
      expect(Array.isArray(eventsData.data)).toBe(true)
    })

    it('应该能够管理完整的角色列表', async () => {
      // 获取角色列表
      const listResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/characters`
      )
      const listData = await listResponse.json()

      expect(listData.code).toBe(200)
      expect(listData.data.items).toBeDefined()
      expect(listData.data.total).toBeGreaterThanOrEqual(0)

      // 创建多个角色
      const characters = ['角色A', '角色B', '角色C']
      for (const name of characters) {
        const createResponse = await fetch(
          `/api/v1/writer/projects/${projectId}/characters`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
          }
        )
        const data = await createResponse.json()
        expect(data.code).toBe(200)
      }
    })
  })

  describe('导出下载工作流', () => {
    it('应该能够创建导出任务并查询状态', async () => {
      // 步骤1: 创建导出任务
      const createExportResponse = await fetch('/api/v1/writer/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'document',
          resourceId: 'doc-001',
          format: 'docx'
        })
      })
      const exportData = await createExportResponse.json()

      expect(exportData.code).toBe(200)
      expect(exportData.data.id).toBeDefined()
      expect(exportData.data.format).toBe('docx')

      const taskId = exportData.data.id

      // 步骤2: 查询导出状态
      const statusResponse = await fetch(`/api/v1/writer/exports/${taskId}`)
      const statusData = await statusResponse.json()

      expect(statusData.code).toBe(200)
      expect(statusData.data.status).toBeDefined()
      expect(statusData.data.progress).toBeDefined()

      // 步骤3: 获取导出列表
      const listResponse = await fetch('/api/v1/writer/exports')
      const listData = await listResponse.json()

      expect(listData.code).toBe(200)
      expect(listData.data.items).toBeDefined()
      expect(Array.isArray(listData.data.items)).toBe(true)
    })
  })

  describe('发布工作流', () => {
    it('应该能够完成文档发布流程', async () => {
      const documentId = 'doc-to-publish'

      // 步骤1: 发布文档
      const publishResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/documents/${documentId}/publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      )
      const publishData = await publishResponse.json()

      expect(publishData.code).toBe(200)
      expect(publishData.data.status).toBe('published')

      // 步骤2: 查看发布历史
      const historyResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/publish/history`
      )
      const historyData = await historyResponse.json()

      expect(historyData.code).toBe(200)
      expect(Array.isArray(historyData.data)).toBe(true)
    })

    it('应该能够批量发布多个文档', async () => {
      const documentIds = ['doc-1', 'doc-2', 'doc-3']

      const publishResponse = await fetch(
        `/api/v1/writer/projects/${projectId}/publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentIds })
        }
      )
      const publishData = await publishResponse.json()

      expect(publishData.code).toBe(200)
      expect(publishData.data.status).toBe('published')
      expect(publishData.data.documentIds).toEqual(documentIds)
    })
  })

  describe('Handler单元测试', () => {
    it('文档Handler应该正确处理各种请求', () => {
      // 测试获取文档树
      const treeResponse = writerHandlers.documents.getTree(projectId)
      expect(treeResponse.code).toBe(200)
      expect(treeResponse.data).toBeDefined()

      // 测试获取文档列表
      const listResponse = writerHandlers.documents.getList(projectId)
      expect(listResponse.code).toBe(200)
      expect(listResponse.data.items).toBeDefined()

      // 测试创建文档
      const createResponse = writerHandlers.documents.create(projectId, {
        title: '测试文档',
        type: 'chapter'
      })
      expect(createResponse.code).toBe(200)
      expect(createResponse.data.title).toBe('测试文档')

      // 测试更新文档
      const docId = createResponse.data.id
      const updateResponse = writerHandlers.documents.update(projectId, docId, {
        title: '更新后的标题'
      })
      expect(updateResponse.code).toBe(200)
      expect(updateResponse.data.title).toBe('更新后的标题')

      // 测试删除文档
      const deleteResponse = writerHandlers.documents.delete(projectId, docId)
      expect(deleteResponse.code).toBe(200)
      expect(deleteResponse.data.deleted).toBe(true)
    })

    it('角色Handler应该正确处理各种请求', () => {
      // 测试获取角色列表
      const listResponse = writerHandlers.characters.getList(projectId)
      expect(listResponse.code).toBe(200)

      // 测试创建角色
      const createResponse = writerHandlers.characters.create(projectId, {
        name: '测试角色'
      })
      expect(createResponse.code).toBe(200)
      expect(createResponse.data.name).toBe('测试角色')

      // 测试获取角色关系
      const charId = createResponse.data.id
      const relationsResponse = writerHandlers.characters.getRelations(projectId, charId)
      expect(relationsResponse.code).toBe(200)
      expect(Array.isArray(relationsResponse.data)).toBe(true)
    })

    it('时间线Handler应该正确处理各种请求', () => {
      // 测试获取时间线列表
      const listResponse = writerHandlers.timelines.getList(projectId)
      expect(listResponse.code).toBe(200)

      // 测试创建时间线
      const createResponse = writerHandlers.timelines.create(projectId, {
        name: '测试时间线'
      })
      expect(createResponse.code).toBe(200)

      // 测试获取时间线事件
      const timelineId = createResponse.data.id
      const eventsResponse = writerHandlers.timelines.getEvents(projectId, timelineId)
      expect(eventsResponse.code).toBe(200)
      expect(Array.isArray(eventsResponse.data)).toBe(true)
    })
  })

  describe('Mock工厂测试', () => {
    it('应该能够生成一致的Mock数据', () => {
      const doc = mockFactory.createDocument({ projectId })
      expect(doc.projectId).toBe(projectId)
      expect(doc.id).toBeDefined()
      expect(doc.title).toBeDefined()

      const char = mockFactory.createCharacter({ projectId })
      expect(char.projectId).toBe(projectId)
      expect(char.name).toBeDefined()

      const location = mockFactory.createLocation({ projectId })
      expect(location.projectId).toBe(projectId)
      expect(location.name).toBeDefined()

      const timeline = mockFactory.createTimeline({ projectId })
      expect(timeline.projectId).toBe(projectId)
      expect(timeline.name).toBeDefined()
    })

    it('应该能够批量生成Mock数据', () => {
      const docs = mockFactory.createBatch(mockFactory.createDocument.bind(mockFactory), 5, { projectId })
      expect(docs.length).toBe(5)
      docs.forEach(doc => {
        expect(doc.projectId).toBe(projectId)
      })
    })

    it('reset应该清除所有状态', () => {
      mockFactory.createDocument({ projectId })
      mockFactory.createCharacter({ projectId })

      const entitiesBefore = mockFactory.getEntities('documents')
      expect(entitiesBefore.length).toBeGreaterThan(0)

      resetWriterMocks()

      const entitiesAfter = mockFactory.getEntities('documents')
      expect(entitiesAfter.length).toBe(0)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理404错误', async () => {
      const response = await fetch('/api/v1/writer/unknown-endpoint')
      expect(response.status).toBe(404)
    })

    it('应该正确处理缺少项目ID的请求', () => {
      const response = handleWriterApiRequest(
        '/api/v1/writer/documents',
        'GET'
      )
      expect(response).toBeNull()
    })
  })
})
