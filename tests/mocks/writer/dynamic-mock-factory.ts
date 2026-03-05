/**
 * 动态Mock工厂
 * 用于生成测试所需的Mock数据
 */

import type {
  Document,
  DocumentType,
  DocumentStatus,
  Character,
  CharacterRelation,
  Location,
  LocationRelation,
  Timeline,
  TimelineEvent,
  ExportTask,
  ExportFormat,
  ExportTaskStatus,
  ExportType,
} from '@/modules/writer/types'

/**
 * Mock配置接口
 */
export interface MockConfig {
  projectId?: string
  documentId?: string
  characterId?: string
  locationId?: string
  timelineId?: string
  eventId?: string
  includeChildren?: boolean
  page?: number
  pageSize?: number
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * 发布计划接口（用于发布相关Mock）
 */
export interface PublishPlan {
  id: string
  projectId: string
  name: string
  description?: string
  status: 'draft' | 'scheduled' | 'published' | 'cancelled'
  scheduledAt?: string
  publishedAt?: string
  documentIds: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 动态Mock工厂类
 */
export class DynamicMockFactory {
  private idCounters: Map<string, number> = new Map()
  private createdEntities: Map<string, unknown[]> = new Map()

  /**
   * 生成唯一ID
   * @param prefix ID前缀
   * @returns 唯一ID字符串
   */
  generateId(prefix: string): string {
    const count = this.idCounters.get(prefix) || 0
    this.idCounters.set(prefix, count + 1)
    return `${prefix}_${count}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * 生成ISO日期字符串
   * @param offsetDays 相对于今天的偏移天数
   * @returns ISO日期字符串
   */
  private generateDate(offsetDays: number = 0): string {
    const date = new Date()
    date.setDate(date.getDate() + offsetDays)
    return date.toISOString()
  }

  /**
   * 创建文档Mock
   * @param config Mock配置
   * @returns Document对象
   */
  createDocument(config: MockConfig = {}): Document {
    const projectId = config.projectId || this.generateId('project')
    const documentId = config.documentId || this.generateId('doc')

    const document: Document = {
      id: documentId,
      documentId: documentId,
      projectId: projectId,
      parentId: undefined,
      title: `测试文档 ${this.idCounters.get('doc') || 1}`,
      type: 'chapter' as DocumentType,
      level: 0,
      order: 0,
      status: 'writing' as DocumentStatus,
      wordCount: Math.floor(Math.random() * 5000) + 100,
      characterIds: [],
      locationIds: [],
      timelineIds: [],
      plotThreads: [],
      keyPoints: [],
      writingHints: [],
      tags: ['测试', 'Mock'],
      notes: '这是一个测试文档',
      children: config.includeChildren ? [] : undefined,
      createdAt: this.generateDate(-7),
      updatedAt: this.generateDate(-1),
    }

    this.trackEntity('documents', document)
    return document
  }

  /**
   * 递归创建文档树
   * @param config Mock配置
   * @param depth 树的深度
   * @returns Document对象（包含children）
   */
  createDocumentTree(config: MockConfig = {}, depth: number = 3): Document {
    const rootDoc = this.createDocument({ ...config, includeChildren: true })
    rootDoc.type = 'volume' as DocumentType
    rootDoc.level = 0
    rootDoc.title = `卷 ${this.idCounters.get('doc') || 1}`

    if (depth > 0) {
      const childCount = Math.min(depth, 3)
      rootDoc.children = []

      for (let i = 0; i < childCount; i++) {
        const childConfig: MockConfig = {
          ...config,
          documentId: undefined,
          includeChildren: true,
        }
        const child = this.createDocumentTreeRecursive(childConfig, rootDoc.id!, depth - 1, i)
        child.parentId = rootDoc.id
        child.type = this.getDocumentTypeByLevel(depth - 1)
        child.level = rootDoc.level + 1
        child.order = i
        rootDoc.children!.push(child)
      }
    }

    return rootDoc
  }

  /**
   * 递归创建文档树辅助方法
   */
  private createDocumentTreeRecursive(
    config: MockConfig,
    parentId: string,
    depth: number,
    order: number
  ): Document {
    const doc = this.createDocument({ ...config, includeChildren: true })
    doc.parentId = parentId
    doc.order = order
    doc.title = `章节 ${order + 1}`

    if (depth > 0) {
      doc.children = []
      const childCount = Math.min(depth, 2)
      for (let i = 0; i < childCount; i++) {
        const child = this.createDocumentTreeRecursive(config, doc.id!, depth - 1, i)
        child.parentId = doc.id
        child.type = this.getDocumentTypeByLevel(depth - 1)
        child.level = doc.level + 1
        child.order = i
        doc.children!.push(child)
      }
    }

    return doc
  }

  /**
   * 根据层级获取文档类型
   */
  private getDocumentTypeByLevel(level: number): DocumentType {
    const types: DocumentType[] = ['scene' as DocumentType, 'section' as DocumentType, 'chapter' as DocumentType, 'volume' as DocumentType]
    return types[Math.min(level, types.length - 1)]
  }

  /**
   * 创建角色Mock
   * @param config Mock配置
   * @returns Character对象
   */
  createCharacter(config: MockConfig = {}): Character {
    const projectId = config.projectId || this.generateId('project')
    const characterId = config.characterId || this.generateId('char')

    const character: Character = {
      id: characterId,
      projectId: projectId,
      name: `角色 ${this.idCounters.get('char') || 1}`,
      alias: ['别名1', '别名2'],
      summary: '这是一个测试角色的简介',
      traits: ['勇敢', '聪明', '善良'],
      background: '角色的背景故事...',
      avatarUrl: 'https://example.com/avatar.png',
      personalityPrompt: '你是一个勇敢的骑士',
      speechPattern: '说话方式描述',
      currentState: '正常',
      createdAt: this.generateDate(-10),
      updatedAt: this.generateDate(-2),
    }

    this.trackEntity('characters', character)
    return character
  }

  /**
   * 创建角色关系Mock
   * @param config Mock配置
   * @returns CharacterRelation对象
   */
  createCharacterRelation(config: MockConfig = {}): CharacterRelation {
    const projectId = config.projectId || this.generateId('project')
    const fromId = config.characterId || this.generateId('char')
    const toId = this.generateId('char')

    const relation: CharacterRelation = {
      id: this.generateId('relation'),
      projectId: projectId,
      fromId: fromId,
      toId: toId,
      type: '朋友',
      strength: Math.floor(Math.random() * 100),
      notes: '这是角色关系的备注',
      createdAt: this.generateDate(-5),
      updatedAt: this.generateDate(-1),
    }

    return relation
  }

  /**
   * 创建地点Mock
   * @param config Mock配置
   * @returns Location对象
   */
  createLocation(config: MockConfig = {}): Location {
    const projectId = config.projectId || this.generateId('project')
    const locationId = config.locationId || this.generateId('loc')

    const location: Location = {
      id: locationId,
      projectId: projectId,
      name: `地点 ${this.idCounters.get('loc') || 1}`,
      description: '这是一个测试地点的描述',
      climate: '温带气候',
      culture: '东方文化',
      geography: '平原地形',
      atmosphere: '宁静祥和',
      parentId: undefined,
      imageUrl: 'https://example.com/location.png',
      children: config.includeChildren ? [] : undefined,
      createdAt: this.generateDate(-8),
      updatedAt: this.generateDate(-3),
    }

    this.trackEntity('locations', location)
    return location
  }

  /**
   * 创建地点关系Mock
   * @param config Mock配置
   * @returns LocationRelation对象
   */
  createLocationRelation(config: MockConfig = {}): LocationRelation {
    const projectId = config.projectId || this.generateId('project')
    const fromId = config.locationId || this.generateId('loc')
    const toId = this.generateId('loc')

    const relation: LocationRelation = {
      id: this.generateId('locrel'),
      projectId: projectId,
      fromId: fromId,
      toId: toId,
      type: 'adjacent',
      distance: '100公里',
      notes: '地点关系备注',
      createdAt: this.generateDate(-5),
      updatedAt: this.generateDate(-1),
    }

    return relation
  }

  /**
   * 创建时间线Mock
   * @param config Mock配置
   * @returns Timeline对象
   */
  createTimeline(config: MockConfig = {}): Timeline {
    const projectId = config.projectId || this.generateId('project')
    const timelineId = config.timelineId || this.generateId('timeline')

    const timeline: Timeline = {
      id: timelineId,
      projectId: projectId,
      name: `时间线 ${this.idCounters.get('timeline') || 1}`,
      description: '这是一个测试时间线',
      startTime: {
        year: 2024,
        month: 1,
        day: 1,
        era: '新历',
      },
      endTime: {
        year: 2024,
        month: 12,
        day: 31,
      },
      createdAt: this.generateDate(-15),
      updatedAt: this.generateDate(-5),
    }

    this.trackEntity('timelines', timeline)
    return timeline
  }

  /**
   * 创建时间线事件Mock
   * @param config Mock配置
   * @returns TimelineEvent对象
   */
  createEvent(config: MockConfig = {}): TimelineEvent {
    const projectId = config.projectId || this.generateId('project')
    const timelineId = config.timelineId || this.generateId('timeline')
    const eventId = config.eventId || this.generateId('event')

    const event: TimelineEvent = {
      id: eventId,
      projectId: projectId,
      timelineId: timelineId,
      title: `事件 ${this.idCounters.get('event') || 1}`,
      description: '这是一个测试事件描述',
      storyTime: {
        year: 2024,
        month: 6,
        day: 15,
        hour: 10,
        minute: 30,
      },
      duration: '一天',
      impact: '改变了故事的走向',
      participants: [],
      locationIds: [],
      chapterIds: [],
      eventType: 'plot',
      importance: Math.floor(Math.random() * 10) + 1,
      createdAt: this.generateDate(-10),
      updatedAt: this.generateDate(-2),
    }

    this.trackEntity('events', event)
    return event
  }

  /**
   * 创建导出任务Mock
   * @param config Mock配置
   * @returns ExportTask对象
   */
  createExportTask(config: MockConfig = {}): ExportTask {
    const documentId = config.documentId || this.generateId('doc')
    const taskId = this.generateId('export')

    const task: ExportTask = {
      id: taskId,
      type: 'document' as ExportType,
      resourceId: documentId,
      resourceTitle: `导出文档 ${this.idCounters.get('export') || 1}`,
      format: 'docx' as ExportFormat,
      status: 'completed' as ExportTaskStatus,
      progress: 100,
      fileSize: Math.floor(Math.random() * 1000000) + 10000,
      fileUrl: 'https://example.com/download/export.docx',
      expiresAt: this.generateDate(7),
      createdBy: 'test-user',
      createdAt: this.generateDate(-1),
      updatedAt: this.generateDate(-1),
      completedAt: this.generateDate(-1),
    }

    this.trackEntity('exportTasks', task)
    return task
  }

  /**
   * 创建发布计划Mock
   * @param config Mock配置
   * @returns PublishPlan对象
   */
  createPublishPlan(config: MockConfig = {}): PublishPlan {
    const projectId = config.projectId || this.generateId('project')
    const planId = this.generateId('plan')

    const plan: PublishPlan = {
      id: planId,
      projectId: projectId,
      name: `发布计划 ${this.idCounters.get('plan') || 1}`,
      description: '这是一个测试发布计划',
      status: 'draft',
      scheduledAt: this.generateDate(7),
      documentIds: [],
      createdAt: this.generateDate(-3),
      updatedAt: this.generateDate(-1),
    }

    this.trackEntity('publishPlans', plan)
    return plan
  }

  /**
   * 分页响应包装器
   * @param items 数据项数组
   * @param page 当前页码
   * @param pageSize 每页数量
   * @returns 分页响应对象
   */
  paginateResponse<T>(items: T[], page: number = 1, pageSize: number = 10): PaginatedResponse<T> {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedItems = items.slice(startIndex, endIndex)

    return {
      items: paginatedItems,
      total: items.length,
      page: page,
      pageSize: pageSize,
      hasMore: endIndex < items.length,
    }
  }

  /**
   * 跟踪已创建的实体
   * @param type 实体类型
   * @param entity 实体对象
   */
  private trackEntity(type: string, entity: unknown): void {
    if (!this.createdEntities.has(type)) {
      this.createdEntities.set(type, [])
    }
    this.createdEntities.get(type)!.push(entity)
  }

  /**
   * 获取已创建的实体
   * @param type 实体类型
   * @returns 实体数组
   */
  getEntities<T>(type: string): T[] {
    return (this.createdEntities.get(type) || []) as T[]
  }

  /**
   * 重置状态（测试隔离）
   * 清除所有计数器和已创建的实体
   */
  reset(): void {
    this.idCounters.clear()
    this.createdEntities.clear()
  }

  /**
   * 创建批量Mock数据
   * @param creator 创建函数
   * @param count 数量
   * @param config 配置
   * @returns Mock数据数组
   */
  createBatch<T>(creator: (config: MockConfig) => T, count: number, config: MockConfig = {}): T[] {
    const items: T[] = []
    for (let i = 0; i < count; i++) {
      items.push(creator(config))
    }
    return items
  }
}

// 导出单例
export const mockFactory = new DynamicMockFactory()
