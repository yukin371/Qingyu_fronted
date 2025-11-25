import type { BaseEntity, ID, ISODate } from './core'

// =======================
// Enums
// =======================

export enum DocumentType {
  VOLUME = 'volume', // 卷
  CHAPTER = 'chapter', // 章
  SECTION = 'section', // 节
  SCENE = 'scene', // 场景
}

// 对应后端 Status string: planned | writing | completed
export enum DocumentStatus {
  PLANNED = 'planned',
  WRITING = 'writing',
  COMPLETED = 'completed',
}

export enum ContentType {
  MARKDOWN = 'markdown',
  RICHTEXT = 'richtext',
}

// =======================
// Entities
// =======================

/**
 * 文档元数据（用于目录树）
 * 不包含 content
 */
export interface Document extends BaseEntity {
  projectId: ID
  parentId?: ID // 空字符串或 undefined 表示根节点
  title: string
  type: DocumentType
  level: number // 0-2
  order: number
  status: DocumentStatus | string

  // 统计
  wordCount: number

  // 关联信息 IDs
  characterIds?: ID[]
  locationIds?: ID[]
  timelineIds?: ID[]

  // 写作辅助
  plotThreads?: string[]
  keyPoints?: string[]
  writingHints?: string[]

  tags?: string[]
  notes?: string

  // 前端辅助字段（非后端返回，可选）
  children?: Document[] // 用于构建树形结构
}

/**
 * 文档内容（用于编辑器）
 * 对应后端 DocumentContent
 */
export interface DocumentContent {
  id: ID
  documentId: ID
  content: string
  contentType: ContentType
  wordCount: number
  charCount: number
  gridfsId?: string // 大文件 ID
  version: number
  lastSavedAt: ISODate
  lastEditedBy: string
  updatedAt: ISODate
  createdAt: ISODate
}

// =======================
// DTOs
// =======================

export interface CreateDocumentRequest {
  projectId: ID
  parentId?: ID
  title: string
  type: DocumentType
  order?: number // 如果不传，后端通常会自动追加到最后
}

export interface UpdateDocumentMetaRequest {
  title?: string
  status?: DocumentStatus
  characterIds?: ID[]
  locationIds?: ID[]
  timelineIds?: ID[]
  tags?: string[]
  notes?: string
  plotThreads?: string[]
}

export interface SaveContentRequest {
  content: string
  wordCount?: number // 可选，有些后端会自动计算
  force?: boolean // 用于解决版本冲突
}
