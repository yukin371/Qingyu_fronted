/**
 * Writer Module Type Definitions
 */

// 角色类型
export interface Character {
  id: string
  projectId: string
  name: string
  alias?: string[]
  avatarUrl?: string
  summary?: string
  age?: number
  gender?: string
  personality?: string
  backstory?: string
  relationships?: CharacterRelationship[]
  createdAt?: Date
  updatedAt?: Date
}

// 角色关系
export interface CharacterRelationship {
  characterId: string
  relationship: string
  description?: string
}

// 地点类型
export interface Location {
  id: string
  projectId: string
  name: string
  type?: string
  description?: string
  coordinates?: {
    x: number
    y: number
  }
  connections?: string[] // 连接的其他地点ID
  imageUrl?: string
  details?: {
    climate?: string
    population?: string
    government?: string
    culture?: string
  }
  createdAt?: Date
  updatedAt?: Date
}

// 物品类型（待开发）
export interface Item {
  id: string
  projectId: string
  name: string
  type?: string
  description?: string
  owner?: string
  effects?: string
  imageUrl?: string
  createdAt?: Date
  updatedAt?: Date
}

// 设定类型
export interface Encyclopedia {
  id: string
  projectId: string
  type: 'character' | 'location' | 'item' | 'other'
  name: string
  content: string
  metadata?: Record<string, any>
  createdAt?: Date
  updatedAt?: Date
}

// 项目类型
export interface Project {
  id: string
  projectId?: string
  title: string
  description?: string
  author?: string
  genre?: string
  status?: 'planning' | 'drafting' | 'editing' | 'published'
  wordCount?: number
  chapterCount?: number
  createdAt?: Date
  updatedAt?: Date
}

// 大纲节点类型
export interface OutlineNode {
  id: string
  projectId: string
  parentId?: string | null
  title: string
  content?: string
  level?: number
  children?: OutlineNode[]
  createdAt?: Date
  updatedAt?: Date
}

// 时间线类型
export interface TimelineEvent {
  id: string
  projectId: string
  title: string
  date?: string | number
  content?: string
  category?: string
  order?: number
  createdAt?: Date
  updatedAt?: Date
}

// 统计数据类型
export interface WriterStats {
  totalWords: number
  bookCount: number
  todayWords: number
  pending: number
  characterCount?: number
  locationCount?: number
  chapterCount?: number
}

// API响应类型
export interface ApiResponse<T> {
  code: number
  message?: string
  data?: T
  total?: number
}

// 本地项目类型
export interface LocalProject {
  projectId?: string
  id?: string
  title: string
  description?: string
  wordCount?: number
  chapterCount?: number
  characters?: Character[]
  locations?: Location[]
  outline?: OutlineNode[]
  timeline?: TimelineEvent[]
  createdAt?: Date
  updatedAt?: Date
}


