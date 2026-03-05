/**
 * 角色管理API契约测试
 * @description 验证 characterApi 与后端 /api/v1/writer/projects/:projectId/characters 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  characterApi,
  listCharacters,
  listCharacterRelations,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '@/modules/writer/api/character'
import httpService from '@/core/services/http.service'
import type {
  Character,
  CharacterRelation,
  CharacterGraph,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  SaveRelationRequest,
  RelationType,
} from '@/modules/writer/types/character'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('characterApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟角色数据
  const createMockCharacter = (overrides?: Partial<Character>): Character => ({
    id: 'char-123',
    projectId: 'proj-456',
    name: '测试角色',
    alias: ['别名1', '别名2'],
    summary: '角色简介',
    traits: ['勇敢', '聪明'],
    background: '角色背景故事',
    avatarUrl: 'https://example.com/avatar.png',
    personalityPrompt: '性格提示',
    speechPattern: '说话方式',
    currentState: '当前状态',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  })

  // 模拟角色关系数据
  const createMockCharacterRelation = (
    overrides?: Partial<CharacterRelation>
  ): CharacterRelation => ({
    id: 'rel-123',
    projectId: 'proj-456',
    fromId: 'char-1',
    toId: 'char-2',
    type: '朋友' as RelationType,
    strength: 80,
    notes: '关系备注',
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

  // ==========================================
  // 角色管理 (Character CRUD)
  // ==========================================

  describe('create (CH-001)', () => {
    it('应该发送正确的POST请求创建角色', async () => {
      const mockCharacter = createMockCharacter()
      const mockResponse = createMockAPIResponse(mockCharacter)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: CreateCharacterRequest = {
        projectId,
        name: '新角色',
        summary: '新角色简介',
      }
      const result = await characterApi.create(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/characters`,
        data
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确创建带所有字段的角色', async () => {
      const mockCharacter = createMockCharacter()
      const mockResponse = createMockAPIResponse(mockCharacter)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: CreateCharacterRequest = {
        projectId,
        name: '完整角色',
        alias: ['别名A'],
        summary: '完整简介',
        traits: ['特质1'],
        background: '背景故事',
        avatarUrl: 'https://example.com/avatar.png',
        personalityPrompt: '性格提示',
        speechPattern: '说话方式',
      }
      await characterApi.create(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/characters`,
        data
      )
    })

    it('应该正确处理创建失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '角色名称不能为空',
          },
        },
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      const projectId = 'proj-456'
      const data: CreateCharacterRequest = {
        projectId,
        name: '',
      }

      await expect(characterApi.create(projectId, data)).rejects.toEqual(mockError)
    })
  })

  describe('list (CH-002)', () => {
    it('应该发送正确的GET请求获取角色列表', async () => {
      const mockCharacters = [createMockCharacter()]
      const mockResponse = createMockAPIResponse(mockCharacters)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await characterApi.list(projectId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/characters`
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空角色列表', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await characterApi.list(projectId)

      expect(result.data).toHaveLength(0)
    })

    it('应该正确返回多个角色', async () => {
      const mockCharacters = [
        createMockCharacter({ id: 'char-1', name: '角色1' }),
        createMockCharacter({ id: 'char-2', name: '角色2' }),
        createMockCharacter({ id: 'char-3', name: '角色3' }),
      ]
      const mockResponse = createMockAPIResponse(mockCharacters)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await characterApi.list('proj-456')

      expect(result.data).toHaveLength(3)
      expect(result.data[0].name).toBe('角色1')
      expect(result.data[2].name).toBe('角色3')
    })
  })

  describe('getDetail (CH-003)', () => {
    it('应该发送正确的GET请求获取角色详情', async () => {
      const mockCharacter = createMockCharacter()
      const mockResponse = createMockAPIResponse(mockCharacter)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const characterId = 'char-123'
      const projectId = 'proj-456'
      const result = await characterApi.getDetail(characterId, projectId)

      expect(httpService.get).toHaveBeenCalledWith(`/characters/${characterId}`, {
        params: { projectId },
      } as any)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确返回角色完整信息', async () => {
      const mockCharacter = createMockCharacter({
        traits: ['勇敢', '正义', '善良'],
        background: '详细背景故事',
      })
      const mockResponse = createMockAPIResponse(mockCharacter)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await characterApi.getDetail('char-123', 'proj-456')

      expect(result.data.traits).toEqual(['勇敢', '正义', '善良'])
      expect(result.data.background).toBe('详细背景故事')
    })

    it('应该正确处理角色不存在的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '角色不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(characterApi.getDetail('nonexistent', 'proj-456')).rejects.toEqual(
        mockError
      )
    })
  })

  describe('update (CH-004)', () => {
    it('应该发送正确的PUT请求更新角色', async () => {
      const mockCharacter = createMockCharacter()
      const mockResponse = createMockAPIResponse(mockCharacter)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const characterId = 'char-123'
      const projectId = 'proj-456'
      const data: UpdateCharacterRequest = {
        name: '更新后的名称',
        summary: '更新后的简介',
      }
      const result = await characterApi.update(characterId, projectId, data)

      expect(httpService.put).toHaveBeenCalledWith(
        `/characters/${characterId}`,
        data,
        { params: { projectId } }
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确更新角色状态', async () => {
      const mockCharacter = createMockCharacter({ currentState: '更新状态' })
      const mockResponse = createMockAPIResponse(mockCharacter)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      await characterApi.update('char-123', 'proj-456', { currentState: '更新状态' })

      expect(httpService.put).toHaveBeenCalledWith(
        '/characters/char-123',
        { currentState: '更新状态' },
        { params: { projectId: 'proj-456' } }
      )
    })

    it('应该正确处理更新失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权限修改此角色',
          },
        },
      }
      vi.mocked(httpService.put).mockRejectedValue(mockError)

      await expect(
        characterApi.update('char-123', 'proj-456', { name: '新名称' })
      ).rejects.toEqual(mockError)
    })
  })

  describe('delete (CH-005)', () => {
    it('应该发送正确的DELETE请求删除角色', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const characterId = 'char-123'
      const projectId = 'proj-456'
      const result = await characterApi.delete(characterId, projectId)

      expect(httpService.delete).toHaveBeenCalledWith(`/characters/${characterId}`, {
        params: { projectId },
      } as any)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理删除不存在的角色', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '角色不存在',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(characterApi.delete('nonexistent', 'proj-456')).rejects.toEqual(
        mockError
      )
    })

    it('应该正确处理无权限删除的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权限删除此角色',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(characterApi.delete('char-123', 'proj-456')).rejects.toEqual(mockError)
    })
  })

  // ==========================================
  // 关系管理 (Relation Management)
  // ==========================================

  describe('createRelation (CH-007)', () => {
    it('应该发送正确的POST请求创建角色关系', async () => {
      const mockRelation = createMockCharacterRelation()
      const mockResponse = createMockAPIResponse(mockRelation)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: SaveRelationRequest = {
        fromId: 'char-1',
        toId: 'char-2',
        type: '朋友' as RelationType,
        strength: 80,
      }
      const result = await characterApi.createRelation(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        '/characters/relations',
        data,
        { params: { projectId } }
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确创建带备注的关系', async () => {
      const mockRelation = createMockCharacterRelation({
        notes: '他们从小就是朋友',
      })
      const mockResponse = createMockAPIResponse(mockRelation)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: SaveRelationRequest = {
        fromId: 'char-1',
        toId: 'char-2',
        type: '家庭' as RelationType,
        strength: 100,
        notes: '他们从小就是朋友',
      }
      await characterApi.createRelation(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith('/characters/relations', data, {
        params: { projectId },
      })
    })

    it('应该正确处理创建关系失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '角色不存在',
          },
        },
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        characterApi.createRelation('proj-456', {
          fromId: 'nonexistent',
          toId: 'char-2',
          type: '朋友' as RelationType,
        })
      ).rejects.toEqual(mockError)
    })
  })

  describe('listRelations (CH-008)', () => {
    it('应该发送正确的GET请求获取角色关系列表', async () => {
      const mockRelations = [createMockCharacterRelation()]
      const mockResponse = createMockAPIResponse(mockRelations)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await characterApi.listRelations(projectId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/characters/relations`,
        {}
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确筛选特定角色的关系', async () => {
      const mockRelations = [
        createMockCharacterRelation({ fromId: 'char-1', toId: 'char-2' }),
        createMockCharacterRelation({ fromId: 'char-1', toId: 'char-3' }),
      ]
      const mockResponse = createMockAPIResponse(mockRelations)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const characterId = 'char-1'
      await characterApi.listRelations(projectId, characterId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/characters/relations`,
        { characterId }
      )
    })

    it('应该正确处理空关系列表', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await characterApi.listRelations('proj-456')

      expect(result.data).toHaveLength(0)
    })
  })

  describe('deleteRelation (CH-009)', () => {
    it('应该发送正确的DELETE请求删除角色关系', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const relationId = 'rel-123'
      const projectId = 'proj-456'
      const result = await characterApi.deleteRelation(relationId, projectId)

      expect(httpService.delete).toHaveBeenCalledWith(
        `/characters/relations/${relationId}`,
        { params: { projectId } } as any
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理删除不存在的关系', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '关系不存在',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(
        characterApi.deleteRelation('nonexistent', 'proj-456')
      ).rejects.toEqual(mockError)
    })
  })

  // ==========================================
  // 关系图谱 (Character Graph)
  // ==========================================

  describe('getGraph (CH-010)', () => {
    it('应该发送正确的GET请求获取角色关系图谱', async () => {
      const mockGraph: CharacterGraph = {
        characters: [createMockCharacter()],
        relations: [createMockCharacterRelation()],
      }
      const mockResponse = createMockAPIResponse(mockGraph)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await characterApi.getGraph(projectId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/characters/graph`
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确返回复杂的图谱数据', async () => {
      const mockGraph: CharacterGraph = {
        characters: [
          createMockCharacter({ id: 'char-1', name: '角色A' }),
          createMockCharacter({ id: 'char-2', name: '角色B' }),
          createMockCharacter({ id: 'char-3', name: '角色C' }),
        ],
        relations: [
          createMockCharacterRelation({
            id: 'rel-1',
            fromId: 'char-1',
            toId: 'char-2',
            type: '朋友' as RelationType,
          }),
          createMockCharacterRelation({
            id: 'rel-2',
            fromId: 'char-2',
            toId: 'char-3',
            type: '敌人' as RelationType,
          }),
        ],
      }
      const mockResponse = createMockAPIResponse(mockGraph)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await characterApi.getGraph('proj-456')

      expect(result.data.characters).toHaveLength(3)
      expect(result.data.relations).toHaveLength(2)
    })

    it('应该正确处理空图谱', async () => {
      const mockGraph: CharacterGraph = {
        characters: [],
        relations: [],
      }
      const mockResponse = createMockAPIResponse(mockGraph)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await characterApi.getGraph('proj-456')

      expect(result.data.characters).toHaveLength(0)
      expect(result.data.relations).toHaveLength(0)
    })
  })

  // ==========================================
  // 便捷函数导出
  // ==========================================

  describe('命名导出函数', () => {
    it('listCharacters应该调用characterApi.list', async () => {
      const mockResponse = createMockAPIResponse([createMockCharacter()])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await listCharacters('proj-456')

      expect(httpService.get).toHaveBeenCalledWith(
        '/writer/projects/proj-456/characters'
      )
    })

    it('listCharacterRelations应该调用characterApi.listRelations', async () => {
      const mockResponse = createMockAPIResponse([createMockCharacterRelation()])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await listCharacterRelations('proj-456', 'char-1')

      expect(httpService.get).toHaveBeenCalledWith(
        '/writer/projects/proj-456/characters/relations',
        { characterId: 'char-1' }
      )
    })

    it('createCharacter应该调用characterApi.create', async () => {
      const mockResponse = createMockAPIResponse(createMockCharacter())
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const data: CreateCharacterRequest = {
        projectId: 'proj-456',
        name: '新角色',
      }
      await createCharacter('proj-456', data)

      expect(httpService.post).toHaveBeenCalledWith(
        '/writer/projects/proj-456/characters',
        data
      )
    })

    it('updateCharacter应该调用characterApi.update', async () => {
      const mockResponse = createMockAPIResponse(createMockCharacter())
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      await updateCharacter('char-123', 'proj-456', { name: '新名称' })

      expect(httpService.put).toHaveBeenCalledWith(
        '/characters/char-123',
        { name: '新名称' },
        { params: { projectId: 'proj-456' } }
      )
    })

    it('deleteCharacter应该调用characterApi.delete', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      await deleteCharacter('char-123', 'proj-456')

      expect(httpService.delete).toHaveBeenCalledWith('/characters/char-123', {
        params: { projectId: 'proj-456' },
      } as any)
    })
  })

  // ==========================================
  // 错误处理
  // ==========================================

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

      await expect(characterApi.getDetail('char-123', 'proj-456')).rejects.toEqual(
        mockError
      )
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

      await expect(characterApi.list('proj-456')).rejects.toEqual(mockError)
    })

    it('应该正确处理404资源不存在错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '角色不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(characterApi.getGraph('nonexistent')).rejects.toEqual(mockError)
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
        characterApi.create('proj-456', {
          projectId: 'proj-456',
          name: '测试角色',
        })
      ).rejects.toEqual(mockError)
    })

    it('应该正确处理网络错误', async () => {
      const mockError = new Error('Network Error')
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(characterApi.getDetail('char-123', 'proj-456')).rejects.toThrow(
        'Network Error'
      )
    })
  })
})
