import request from '@/utils/request'
import type {
  Character,
  CharacterRelation,
  CharacterGraph,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CreateCharacterRelationRequest
} from '@/types/writer'

// 角色管理 API

/**
 * 创建角色
 */
export function createCharacter(projectId: string, data: CreateCharacterRequest) {
  return request<Character>({
    url: `/api/v1/projects/${projectId}/characters`,
    method: 'post',
    data
  })
}

/**
 * 获取角色详情
 */
export function getCharacter(characterId: string, projectId: string) {
  return request<Character>({
    url: `/api/v1/characters/${characterId}`,
    method: 'get',
    params: { projectId }
  })
}

/**
 * 获取项目角色列表
 */
export function listCharacters(projectId: string) {
  return request<Character[]>({
    url: `/api/v1/projects/${projectId}/characters`,
    method: 'get'
  })
}

/**
 * 更新角色
 */
export function updateCharacter(
  characterId: string,
  projectId: string,
  data: UpdateCharacterRequest
) {
  return request<Character>({
    url: `/api/v1/characters/${characterId}`,
    method: 'put',
    params: { projectId },
    data
  })
}

/**
 * 删除角色
 */
export function deleteCharacter(characterId: string, projectId: string) {
  return request<void>({
    url: `/api/v1/characters/${characterId}`,
    method: 'delete',
    params: { projectId }
  })
}

// 角色关系管理

/**
 * 创建角色关系
 */
export function createCharacterRelation(
  projectId: string,
  data: CreateCharacterRelationRequest
) {
  return request<CharacterRelation>({
    url: '/api/v1/characters/relations',
    method: 'post',
    params: { projectId },
    data
  })
}

/**
 * 获取角色关系列表
 */
export function listCharacterRelations(projectId: string, characterId?: string) {
  return request<CharacterRelation[]>({
    url: `/api/v1/projects/${projectId}/characters/relations`,
    method: 'get',
    params: characterId ? { characterId } : undefined
  })
}

/**
 * 删除角色关系
 */
export function deleteCharacterRelation(relationId: string, projectId: string) {
  return request<void>({
    url: `/api/v1/characters/relations/${relationId}`,
    method: 'delete',
    params: { projectId }
  })
}

/**
 * 获取角色关系图
 */
export function getCharacterGraph(projectId: string) {
  return request<CharacterGraph>({
    url: `/api/v1/projects/${projectId}/characters/graph`,
    method: 'get'
  })
}




