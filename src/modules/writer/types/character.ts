import type { BaseEntity, ID } from './core'

// ==========================================
// 枚举定义
// ==========================================

/**
 * 关系类型枚举
 * 对应后端 RelationType 常量
 */
export enum RelationType {
  FRIEND = '朋友',
  FAMILY = '家庭',
  ENEMY = '敌人',
  ROMANCE = '恋人',
  ALLY = '盟友',
  OTHER = '其他',
}

// 辅助数组：用于前端下拉选择框 (Select Options)
export const RELATION_TYPE_OPTIONS = [
  { label: '朋友', value: RelationType.FRIEND },
  { label: '家庭', value: RelationType.FAMILY },
  { label: '敌人', value: RelationType.ENEMY },
  { label: '恋人', value: RelationType.ROMANCE },
  { label: '盟友', value: RelationType.ALLY },
  { label: '其他', value: RelationType.OTHER },
]

// ==========================================
// 实体定义
// ==========================================

/**
 * 角色卡片
 * 对应后端 Character struct
 */
export interface Character extends BaseEntity {
  projectId: ID
  name: string
  alias?: string[] // omitempty implies optional
  summary?: string
  traits?: string[] // 性格标签
  background?: string
  avatarUrl?: string

  // AI 相关字段
  personalityPrompt?: string
  speechPattern?: string
  currentState?: string
}

/**
 * 角色关系（边表）
 * 对应后端 CharacterRelation struct
 */
export interface CharacterRelation extends BaseEntity {
  projectId: ID
  fromId: ID
  toId: ID
  type: RelationType | string // 允许字符串以兼容未知类型
  strength: number // 0-100 强度
  notes?: string
}

// ==========================================
// 请求参数定义 (DTOs)
// ==========================================

/**
 * 创建角色请求
 */
export interface CreateCharacterRequest {
  projectId: ID
  name: string
  alias?: string[]
  summary?: string
  traits?: string[]
  background?: string
  avatarUrl?: string
  personalityPrompt?: string
  speechPattern?: string
}

/**
 * 更新角色请求
 */
export interface UpdateCharacterRequest {
  name?: string
  alias?: string[]
  summary?: string
  traits?: string[]
  background?: string
  avatarUrl?: string
  personalityPrompt?: string
  speechPattern?: string
  currentState?: string
}

/**
 * 创建/更新关系请求
 */
export interface SaveRelationRequest {
  fromId: ID
  toId: ID
  type: RelationType
  strength?: number
  notes?: string
}

/**
 * 角色关系图谱数据结构
 */
export interface CharacterGraph {
  characters: Character[] // 节点
  relations: CharacterRelation[] // 边
}
