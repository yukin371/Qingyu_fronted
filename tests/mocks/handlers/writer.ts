/**
 * Writer模块API Mock Handlers
 * 用于集成测试和E2E测试的API模拟
 */

import { mockFactory, MockConfig } from '../writer/dynamic-mock-factory'
import type { Document, DocumentType, DocumentStatus, Character, Location, Timeline } from '@/modules/writer/types'

/**
 * API响应格式
 */
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/**
 * 文档创建数据接口
 */
interface DocumentCreateData {
  title?: string
  type?: string
  parentId?: string
}

/**
 * 角色创建数据接口
 */
interface CharacterCreateData {
  name?: string
  summary?: string
}

/**
 * 地点创建数据接口
 */
interface LocationCreateData {
  name?: string
  description?: string
}

/**
 * 时间线创建数据接口
 */
interface TimelineCreateData {
  name?: string
  description?: string
}

/**
 * 导出创建数据接口
 */
interface ExportCreateData {
  type: string
  resourceId: string
  format: string
}

/**
 * 发布数据接口
 */
interface PublishData {
  documentIds: string[]
}

/**
 * 创建成功响应
 */
function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    code: 200,
    message: 'success',
    data
  }
}

/**
 * 创建错误响应
 */
function createErrorResponse(message: string, code: number = 500): ApiResponse<null> {
  return {
    code,
    message,
    data: null
  }
}

/**
 * 从URL中提取路径参数
 */
function extractProjectId(url: string): string | null {
  const match = url.match(/\/writer\/projects\/([\w-]+)/)
  return match ? match[1] : null
}

function extractDocumentId(url: string): string | null {
  const match = url.match(/\/documents\/([\w-]+)/)
  return match ? match[1] : null
}

function extractCharacterId(url: string): string | null {
  const match = url.match(/\/characters\/([\w-]+)/)
  return match ? match[1] : null
}

function extractLocationId(url: string): string | null {
  const match = url.match(/\/locations\/([\w-]+)/)
  return match ? match[1] : null
}

function extractTimelineId(url: string): string | null {
  const match = url.match(/\/timelines\/([\w-]+)/)
  return match ? match[1] : null
}

/**
 * Writer API Handler映射
 */
export const writerHandlers = {
  /**
   * 文档树相关
   */
  documents: {
    // GET /writer/projects/:projectId/documents/tree
    getTree: (projectId: string, config: MockConfig = {}) => {
      return createSuccessResponse(mockFactory.createDocumentTree({ projectId, ...config }))
    },

    // GET /writer/projects/:projectId/documents
    getList: (projectId: string, config: MockConfig = {}) => {
      const docs = mockFactory.createBatch(mockFactory.createDocument.bind(mockFactory), 5, { projectId, ...config })
      return createSuccessResponse({
        items: docs,
        total: docs.length,
        page: 1,
        pageSize: 10
      })
    },

    // GET /writer/projects/:projectId/documents/:documentId
    getDetail: (projectId: string, documentId: string, config: MockConfig = {}) => {
      return createSuccessResponse(mockFactory.createDocument({ projectId, documentId, ...config }))
    },

    // POST /writer/projects/:projectId/documents
    create: (projectId: string, data: DocumentCreateData) => {
      const doc = mockFactory.createDocument({ projectId })
      if (data.title) doc.title = data.title
      if (data.type) doc.type = data.type as DocumentType
      if (data.parentId) doc.parentId = data.parentId
      return createSuccessResponse(doc)
    },

    // PUT /writer/projects/:projectId/documents/:documentId
    update: (projectId: string, documentId: string, data: Partial<Document>) => {
      const doc = mockFactory.createDocument({ projectId, documentId })
      Object.assign(doc, data)
      return createSuccessResponse(doc)
    },

    // DELETE /writer/projects/:projectId/documents/:documentId
    delete: (projectId: string, documentId: string) => {
      return createSuccessResponse({ deleted: true, documentId })
    }
  },

  /**
   * 角色相关
   */
  characters: {
    // GET /writer/projects/:projectId/characters
    getList: (projectId: string, config: MockConfig = {}) => {
      const chars = mockFactory.createBatch(mockFactory.createCharacter.bind(mockFactory), 5, { projectId, ...config })
      return createSuccessResponse({
        items: chars,
        total: chars.length
      })
    },

    // GET /writer/projects/:projectId/characters/:characterId
    getDetail: (projectId: string, characterId: string) => {
      return createSuccessResponse(mockFactory.createCharacter({ projectId, characterId }))
    },

    // POST /writer/projects/:projectId/characters
    create: (projectId: string, data: CharacterCreateData) => {
      const char = mockFactory.createCharacter({ projectId })
      if (data.name) char.name = data.name
      if (data.summary) char.summary = data.summary
      return createSuccessResponse(char)
    },

    // PUT /writer/projects/:projectId/characters/:characterId
    update: (projectId: string, characterId: string, data: Partial<Character>) => {
      const char = mockFactory.createCharacter({ projectId, characterId })
      Object.assign(char, data)
      return createSuccessResponse(char)
    },

    // DELETE /writer/projects/:projectId/characters/:characterId
    delete: (projectId: string, characterId: string) => {
      return createSuccessResponse({ deleted: true, characterId })
    },

    // GET /writer/projects/:projectId/characters/:characterId/relations
    getRelations: (projectId: string, characterId: string) => {
      const relations = [
        mockFactory.createCharacterRelation({ projectId, characterId }),
        mockFactory.createCharacterRelation({ projectId, characterId })
      ]
      return createSuccessResponse(relations)
    }
  },

  /**
   * 地点相关
   */
  locations: {
    // GET /writer/projects/:projectId/locations
    getList: (projectId: string, config: MockConfig = {}) => {
      const locs = mockFactory.createBatch(mockFactory.createLocation.bind(mockFactory), 5, { projectId, ...config })
      return createSuccessResponse({
        items: locs,
        total: locs.length
      })
    },

    // GET /writer/projects/:projectId/locations/:locationId
    getDetail: (projectId: string, locationId: string) => {
      return createSuccessResponse(mockFactory.createLocation({ projectId, locationId }))
    },

    // POST /writer/projects/:projectId/locations
    create: (projectId: string, data: LocationCreateData) => {
      const loc = mockFactory.createLocation({ projectId })
      if (data.name) loc.name = data.name
      if (data.description) loc.description = data.description
      return createSuccessResponse(loc)
    },

    // PUT /writer/projects/:projectId/locations/:locationId
    update: (projectId: string, locationId: string, data: Partial<Location>) => {
      const loc = mockFactory.createLocation({ projectId, locationId })
      Object.assign(loc, data)
      return createSuccessResponse(loc)
    },

    // DELETE /writer/projects/:projectId/locations/:locationId
    delete: (projectId: string, locationId: string) => {
      return createSuccessResponse({ deleted: true, locationId })
    }
  },

  /**
   * 时间线相关
   */
  timelines: {
    // GET /writer/projects/:projectId/timelines
    getList: (projectId: string, config: MockConfig = {}) => {
      const timelines = mockFactory.createBatch(mockFactory.createTimeline.bind(mockFactory), 3, { projectId, ...config })
      return createSuccessResponse({
        items: timelines,
        total: timelines.length
      })
    },

    // GET /writer/projects/:projectId/timelines/:timelineId
    getDetail: (projectId: string, timelineId: string) => {
      return createSuccessResponse(mockFactory.createTimeline({ projectId, timelineId }))
    },

    // POST /writer/projects/:projectId/timelines
    create: (projectId: string, data: TimelineCreateData) => {
      const timeline = mockFactory.createTimeline({ projectId })
      if (data.name) timeline.name = data.name
      if (data.description) timeline.description = data.description
      return createSuccessResponse(timeline)
    },

    // PUT /writer/projects/:projectId/timelines/:timelineId
    update: (projectId: string, timelineId: string, data: Partial<Timeline>) => {
      const timeline = mockFactory.createTimeline({ projectId, timelineId })
      Object.assign(timeline, data)
      return createSuccessResponse(timeline)
    },

    // DELETE /writer/projects/:projectId/timelines/:timelineId
    delete: (projectId: string, timelineId: string) => {
      return createSuccessResponse({ deleted: true, timelineId })
    },

    // GET /writer/projects/:projectId/timelines/:timelineId/events
    getEvents: (projectId: string, timelineId: string) => {
      const events = [
        mockFactory.createEvent({ projectId, timelineId }),
        mockFactory.createEvent({ projectId, timelineId }),
        mockFactory.createEvent({ projectId, timelineId })
      ]
      return createSuccessResponse(events)
    }
  },

  /**
   * 导出相关
   */
  exports: {
    // POST /writer/exports
    create: (data: ExportCreateData) => {
      return createSuccessResponse(mockFactory.createExportTask({ documentId: data.resourceId }))
    },

    // GET /writer/exports/:taskId
    getStatus: (taskId: string) => {
      const task = mockFactory.createExportTask({ documentId: 'doc_1' })
      task.id = taskId
      return createSuccessResponse(task)
    },

    // GET /writer/exports
    getList: () => {
      const tasks = mockFactory.createBatch(mockFactory.createExportTask.bind(mockFactory), 3, {})
      return createSuccessResponse({
        items: tasks,
        total: tasks.length
      })
    }
  },

  /**
   * 发布相关
   */
  publish: {
    // POST /writer/projects/:projectId/publish
    publishProject: (projectId: string, data: PublishData) => {
      const plan = mockFactory.createPublishPlan({ projectId })
      plan.documentIds = data.documentIds
      plan.status = 'published'
      plan.publishedAt = new Date().toISOString()
      return createSuccessResponse(plan)
    },

    // POST /writer/projects/:projectId/documents/:documentId/publish
    publishDocument: (projectId: string, documentId: string) => {
      const doc = mockFactory.createDocument({ projectId, documentId })
      doc.status = 'published' as DocumentStatus
      return createSuccessResponse(doc)
    },

    // GET /writer/projects/:projectId/publish/history
    getHistory: (projectId: string) => {
      const plans = [
        mockFactory.createPublishPlan({ projectId }),
        mockFactory.createPublishPlan({ projectId })
      ]
      return createSuccessResponse(plans)
    }
  }
}

/**
 * 根据URL路径匹配并处理请求
 * 用于测试模式的fetch拦截
 */
export function handleWriterApiRequest(url: string, method: string, body?: unknown): ApiResponse<unknown> | null {
  // 检查是否是Writer API
  if (!url.includes('/writer/')) {
    return null
  }

  const projectId = extractProjectId(url)
  const documentId = extractDocumentId(url)
  const characterId = extractCharacterId(url)
  const locationId = extractLocationId(url)
  const timelineId = extractTimelineId(url)

  try {
    // 文档树
    if (url.includes('/documents/tree') && method === 'GET') {
      return writerHandlers.documents.getTree(projectId!)
    }

    // 文档列表
    if (url.includes('/documents') && !documentId && method === 'GET') {
      return writerHandlers.documents.getList(projectId!)
    }

    // 创建文档
    if (url.includes('/documents') && !documentId && method === 'POST') {
      return writerHandlers.documents.create(projectId!, body as any)
    }

    // 文档详情/更新/删除
    if (documentId) {
      if (method === 'GET') {
        return writerHandlers.documents.getDetail(projectId!, documentId)
      }
      if (method === 'PUT') {
        return writerHandlers.documents.update(projectId!, documentId, body as Record<string, unknown>)
      }
      if (method === 'DELETE') {
        return writerHandlers.documents.delete(projectId!, documentId)
      }
    }

    // 角色列表
    if (url.includes('/characters') && !characterId && method === 'GET') {
      return writerHandlers.characters.getList(projectId!)
    }

    // 创建角色
    if (url.includes('/characters') && !characterId && method === 'POST') {
      return writerHandlers.characters.create(projectId!, body as any)
    }

    // 角色详情/更新/删除
    if (characterId) {
      if (method === 'GET') {
        if (url.includes('/relations')) {
          return writerHandlers.characters.getRelations(projectId!, characterId)
        }
        return writerHandlers.characters.getDetail(projectId!, characterId)
      }
      if (method === 'PUT') {
        return writerHandlers.characters.update(projectId!, characterId, body as Record<string, unknown>)
      }
      if (method === 'DELETE') {
        return writerHandlers.characters.delete(projectId!, characterId)
      }
    }

    // 地点列表
    if (url.includes('/locations') && !locationId && method === 'GET') {
      return writerHandlers.locations.getList(projectId!)
    }

    // 创建地点
    if (url.includes('/locations') && !locationId && method === 'POST') {
      return writerHandlers.locations.create(projectId!, body as any)
    }

    // 地点详情/更新/删除
    if (locationId) {
      if (method === 'GET') {
        return writerHandlers.locations.getDetail(projectId!, locationId)
      }
      if (method === 'PUT') {
        return writerHandlers.locations.update(projectId!, locationId, body as Record<string, unknown>)
      }
      if (method === 'DELETE') {
        return writerHandlers.locations.delete(projectId!, locationId)
      }
    }

    // 时间线列表
    if (url.includes('/timelines') && !timelineId && method === 'GET') {
      return writerHandlers.timelines.getList(projectId!)
    }

    // 创建时间线
    if (url.includes('/timelines') && !timelineId && method === 'POST') {
      return writerHandlers.timelines.create(projectId!, body as any)
    }

    // 时间线详情/更新/删除
    if (timelineId) {
      if (method === 'GET') {
        if (url.includes('/events')) {
          return writerHandlers.timelines.getEvents(projectId!, timelineId)
        }
        return writerHandlers.timelines.getDetail(projectId!, timelineId)
      }
      if (method === 'PUT') {
        return writerHandlers.timelines.update(projectId!, timelineId, body as Record<string, unknown>)
      }
      if (method === 'DELETE') {
        return writerHandlers.timelines.delete(projectId!, timelineId)
      }
    }

    // 导出相关
    if (url.includes('/exports')) {
      if (method === 'POST') {
        return writerHandlers.exports.create(body as any)
      }
      if (method === 'GET') {
        return writerHandlers.exports.getList()
      }
    }

    // 发布相关
    if (url.includes('/publish')) {
      if (method === 'POST') {
        if (documentId) {
          return writerHandlers.publish.publishDocument(projectId!, documentId)
        }
        return writerHandlers.publish.publishProject(projectId!, body as any)
      }
      if (method === 'GET' && url.includes('/history')) {
        return writerHandlers.publish.getHistory(projectId!)
      }
    }

    return createErrorResponse('Not Found', 404)
  } catch (error) {
    return createErrorResponse(error instanceof Error ? error.message : 'Internal Server Error', 500)
  }
}

/**
 * 重置mock工厂状态
 */
export function resetWriterMocks(): void {
  mockFactory.reset()
}

export { mockFactory }
