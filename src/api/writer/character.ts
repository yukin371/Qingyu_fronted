import httpService from '@/core/services/http.service'
import type {
  Character,
  CharacterRelation,
  CharacterGraph,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  SaveRelationRequest,
} from '../types/character'

// 基础路径定义 (用于复用)
const BASE_PROJECT_URL = '/projects'
const BASE_CHAR_URL = '/characters'

export const characterApi = {
  // ==========================================
  // 角色管理 (Character CRUD)
  // ==========================================

  /**
   * 创建角色
   * POST /api/v1/projects/{projectId}/characters
   */
  create(projectId: string, data: CreateCharacterRequest) {
    return httpService.post<Character>(`${BASE_PROJECT_URL}/${projectId}/characters`, data)
  },

  /**
   * 获取角色详情
   * GET /api/v1/characters/{characterId}?projectId=...
   */
  getDetail(characterId: string, projectId: string) {
    return httpService.get<Character>(
      `${BASE_CHAR_URL}/${characterId}`,
      { projectId } // 作为 query 参数传递
    )
  },

  /**
   * 获取项目角色列表
   * GET /api/v1/projects/{projectId}/characters
   */
  list(projectId: string) {
    return httpService.get<Character[]>(`${BASE_PROJECT_URL}/${projectId}/characters`)
  },

  /**
   * 更新角色
   * PUT /api/v1/characters/{characterId}?projectId=...
   */
  update(characterId: string, projectId: string, data: UpdateCharacterRequest) {
    return httpService.put<Character>(
      `${BASE_CHAR_URL}/${characterId}`,
      data,
      { params: { projectId } } // PUT 请求中，params 需要放在 config 对象里
    )
  },

  /**
   * 删除角色
   * DELETE /api/v1/characters/{characterId}?projectId=...
   */
  delete(characterId: string, projectId: string) {
    return httpService.delete<void>(
      `${BASE_CHAR_URL}/${characterId}`,
      { projectId } // delete 的第二个参数是 params
    )
  },

  // ==========================================
  // 关系管理 (Relation Management)
  // ==========================================

  /**
   * 创建角色关系
   * POST /api/v1/characters/relations?projectId=...
   */
  createRelation(projectId: string, data: SaveRelationRequest) {
    return httpService.post<CharacterRelation>(
      `${BASE_CHAR_URL}/relations`,
      data,
      { params: { projectId } } // projectId 是 query 参数
    )
  },

  /**
   * 获取角色关系列表
   * GET /api/v1/projects/{projectId}/characters/relations
   * 可选参数: characterId (筛选特定角色的关系)
   */
  listRelations(projectId: string, characterId?: string) {
    const params: any = {}
    if (characterId) params.characterId = characterId

    return httpService.get<CharacterRelation[]>(
      `${BASE_PROJECT_URL}/${projectId}/characters/relations`,
      params
    )
  },

  /**
   * 删除角色关系
   * DELETE /api/v1/characters/relations/{relationId}?projectId=...
   */
  deleteRelation(relationId: string, projectId: string) {
    return httpService.delete<void>(`${BASE_CHAR_URL}/relations/${relationId}`, { projectId })
  },

  /**
   * 获取角色关系图谱 (用于可视化)
   * GET /api/v1/projects/{projectId}/characters/graph
   */
  getGraph(projectId: string) {
    return httpService.get<CharacterGraph>(`${BASE_PROJECT_URL}/${projectId}/characters/graph`)
  },
}
