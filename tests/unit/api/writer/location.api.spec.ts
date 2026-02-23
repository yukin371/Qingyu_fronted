/**
 * 地点管理API契约测试
 * @description 验证 locationApi 与后端 /api/v1/writer/projects/:projectId/locations 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { locationApi, listLocations, getLocationTree } from '@/modules/writer/api/location'
import httpService from '@/core/services/http.service'
import type {
  Location,
  LocationRelation,
  SaveLocationRequest,
  SaveLocationRelationRequest,
  LocationRelationType,
} from '@/modules/writer/types/location'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('locationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟地点数据
  const createMockLocation = (overrides?: Partial<Location>): Location => ({
    id: 'loc-123',
    projectId: 'proj-456',
    name: '测试地点',
    description: '地点描述',
    climate: '温带气候',
    culture: '东方文化',
    geography: '平原',
    atmosphere: '神秘',
    parentId: undefined,
    imageUrl: 'https://example.com/location.png',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  })

  // 模拟地点关系数据
  const createMockLocationRelation = (
    overrides?: Partial<LocationRelation>
  ): LocationRelation => ({
    id: 'rel-123',
    projectId: 'proj-456',
    fromId: 'loc-1',
    toId: 'loc-2',
    type: 'adjacent' as LocationRelationType,
    distance: '一天路程',
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
  // 地点管理 (Location CRUD)
  // ==========================================

  describe('create (L-001)', () => {
    it('应该发送正确的POST请求创建地点', async () => {
      const mockLocation = createMockLocation()
      const mockResponse = createMockAPIResponse(mockLocation)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: SaveLocationRequest = {
        projectId,
        name: '新地点',
        description: '新地点描述',
      }
      const result = await locationApi.create(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/locations`,
        data
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确创建带所有字段的地点', async () => {
      const mockLocation = createMockLocation()
      const mockResponse = createMockAPIResponse(mockLocation)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: SaveLocationRequest = {
        projectId,
        name: '完整地点',
        description: '完整描述',
        climate: '热带',
        culture: '西方文化',
        geography: '山地',
        atmosphere: '紧张',
        parentId: 'parent-loc',
        imageUrl: 'https://example.com/image.png',
      }
      await locationApi.create(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/locations`,
        data
      )
    })

    it('应该正确处理创建失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '地点名称不能为空',
          },
        },
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      const projectId = 'proj-456'
      const data: SaveLocationRequest = {
        projectId,
        name: '',
      }

      await expect(locationApi.create(projectId, data)).rejects.toEqual(mockError)
    })
  })

  describe('list (L-002)', () => {
    it('应该发送正确的GET请求获取地点列表', async () => {
      const mockLocations = [createMockLocation()]
      const mockResponse = createMockAPIResponse(mockLocations)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await locationApi.list(projectId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/locations`
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空地点列表', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await locationApi.list(projectId)

      expect(result.data).toHaveLength(0)
    })

    it('应该正确返回多个地点', async () => {
      const mockLocations = [
        createMockLocation({ id: 'loc-1', name: '地点1' }),
        createMockLocation({ id: 'loc-2', name: '地点2' }),
        createMockLocation({ id: 'loc-3', name: '地点3' }),
      ]
      const mockResponse = createMockAPIResponse(mockLocations)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await locationApi.list('proj-456')

      expect(result.data).toHaveLength(3)
      expect(result.data[0].name).toBe('地点1')
      expect(result.data[2].name).toBe('地点3')
    })
  })

  describe('getTree (L-003)', () => {
    it('应该发送正确的GET请求获取地点树', async () => {
      const mockTree = [createMockLocation({ children: [] })]
      const mockResponse = createMockAPIResponse(mockTree)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await locationApi.getTree(projectId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/locations/tree`
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理嵌套的地点树结构', async () => {
      const childLoc = createMockLocation({
        id: 'child-1',
        name: '子地点',
        parentId: 'parent-1',
      })
      const parentLoc = createMockLocation({
        id: 'parent-1',
        name: '父地点',
        children: [childLoc],
      })
      const mockResponse = createMockAPIResponse([parentLoc])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await locationApi.getTree(projectId)

      expect(result.data[0].children).toHaveLength(1)
      expect(result.data[0].children?.[0].name).toBe('子地点')
    })

    it('应该正确处理多层嵌套', async () => {
      const grandChild = createMockLocation({
        id: 'grandchild-1',
        name: '孙地点',
        parentId: 'child-1',
      })
      const childLoc = createMockLocation({
        id: 'child-1',
        name: '子地点',
        parentId: 'parent-1',
        children: [grandChild],
      })
      const parentLoc = createMockLocation({
        id: 'parent-1',
        name: '父地点',
        children: [childLoc],
      })
      const mockResponse = createMockAPIResponse([parentLoc])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await locationApi.getTree('proj-456')

      expect(result.data[0].children?.[0].children).toHaveLength(1)
      expect(result.data[0].children?.[0].children?.[0].name).toBe('孙地点')
    })

    it('应该正确处理空地点树', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await locationApi.getTree('proj-456')

      expect(result.data).toHaveLength(0)
    })
  })

  describe('getDetail (L-004)', () => {
    it('应该发送正确的GET请求获取地点详情', async () => {
      const mockLocation = createMockLocation()
      const mockResponse = createMockAPIResponse(mockLocation)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const locationId = 'loc-123'
      const projectId = 'proj-456'
      const result = await locationApi.getDetail(locationId, projectId)

      expect(httpService.get).toHaveBeenCalledWith(`/locations/${locationId}`, {
        projectId,
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确返回地点完整信息', async () => {
      const mockLocation = createMockLocation({
        climate: '寒带气候',
        culture: '北方文化',
        geography: '冰川',
        atmosphere: '寒冷',
      })
      const mockResponse = createMockAPIResponse(mockLocation)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await locationApi.getDetail('loc-123', 'proj-456')

      expect(result.data.climate).toBe('寒带气候')
      expect(result.data.culture).toBe('北方文化')
      expect(result.data.geography).toBe('冰川')
      expect(result.data.atmosphere).toBe('寒冷')
    })

    it('应该正确处理地点不存在的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '地点不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(locationApi.getDetail('nonexistent', 'proj-456')).rejects.toEqual(
        mockError
      )
    })
  })

  describe('update (L-005)', () => {
    it('应该发送正确的PUT请求更新地点', async () => {
      const mockLocation = createMockLocation()
      const mockResponse = createMockAPIResponse(mockLocation)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const locationId = 'loc-123'
      const projectId = 'proj-456'
      const data: SaveLocationRequest = {
        projectId,
        name: '更新后的名称',
        description: '更新后的描述',
      }
      const result = await locationApi.update(locationId, projectId, data)

      expect(httpService.put).toHaveBeenCalledWith(
        `/locations/${locationId}`,
        data,
        { params: { projectId } }
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确更新地点气候和文化', async () => {
      const mockLocation = createMockLocation({
        climate: '地中海气候',
        culture: '希腊文化',
      })
      const mockResponse = createMockAPIResponse(mockLocation)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const data: SaveLocationRequest = {
        projectId: 'proj-456',
        name: '雅典',
        climate: '地中海气候',
        culture: '希腊文化',
      }
      await locationApi.update('loc-123', 'proj-456', data)

      expect(httpService.put).toHaveBeenCalledWith('/locations/loc-123', data, {
        params: { projectId: 'proj-456' },
      })
    })

    it('应该正确处理更新失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权限修改此地点',
          },
        },
      }
      vi.mocked(httpService.put).mockRejectedValue(mockError)

      await expect(
        locationApi.update('loc-123', 'proj-456', {
          projectId: 'proj-456',
          name: '新名称',
        })
      ).rejects.toEqual(mockError)
    })
  })

  describe('delete (L-006)', () => {
    it('应该发送正确的DELETE请求删除地点', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const locationId = 'loc-123'
      const projectId = 'proj-456'
      const result = await locationApi.delete(locationId, projectId)

      expect(httpService.delete).toHaveBeenCalledWith(`/locations/${locationId}`, {
        projectId,
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理删除不存在的地点', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '地点不存在',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(locationApi.delete('nonexistent', 'proj-456')).rejects.toEqual(
        mockError
      )
    })

    it('应该正确处理无权限删除的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权限删除此地点',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(locationApi.delete('loc-123', 'proj-456')).rejects.toEqual(mockError)
    })
  })

  // ==========================================
  // 关系管理 (Relation Management)
  // ==========================================

  describe('createRelation (L-007)', () => {
    it('应该发送正确的POST请求创建地点关系', async () => {
      const mockRelation = createMockLocationRelation()
      const mockResponse = createMockAPIResponse(mockRelation)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: SaveLocationRelationRequest = {
        projectId,
        fromId: 'loc-1',
        toId: 'loc-2',
        type: 'adjacent' as LocationRelationType,
      }
      const result = await locationApi.createRelation(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        '/locations/relations',
        data,
        { params: { projectId } }
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确创建带距离描述的关系', async () => {
      const mockRelation = createMockLocationRelation({
        distance: '三天路程',
        notes: '需要穿越山脉',
      })
      const mockResponse = createMockAPIResponse(mockRelation)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: SaveLocationRelationRequest = {
        projectId,
        fromId: 'loc-1',
        toId: 'loc-2',
        type: 'far' as LocationRelationType,
        distance: '三天路程',
        notes: '需要穿越山脉',
      }
      await locationApi.createRelation(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith('/locations/relations', data, {
        params: { projectId },
      })
    })

    it('应该正确创建连通类型的关系', async () => {
      const mockRelation = createMockLocationRelation({
        type: 'connected' as LocationRelationType,
        notes: '通过传送门连接',
      })
      const mockResponse = createMockAPIResponse(mockRelation)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: SaveLocationRelationRequest = {
        projectId,
        fromId: 'loc-1',
        toId: 'loc-2',
        type: 'connected' as LocationRelationType,
        notes: '通过传送门连接',
      }
      await locationApi.createRelation(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith('/locations/relations', data, {
        params: { projectId },
      })
    })

    it('应该正确处理创建关系失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '地点不存在',
          },
        },
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        locationApi.createRelation('proj-456', {
          projectId: 'proj-456',
          fromId: 'nonexistent',
          toId: 'loc-2',
          type: 'adjacent' as LocationRelationType,
        })
      ).rejects.toEqual(mockError)
    })
  })

  describe('listRelations (L-008)', () => {
    it('应该发送正确的GET请求获取地点关系列表', async () => {
      const mockRelations = [createMockLocationRelation()]
      const mockResponse = createMockAPIResponse(mockRelations)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await locationApi.listRelations(projectId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/locations/relations`,
        {}
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确筛选特定地点的关系', async () => {
      const mockRelations = [
        createMockLocationRelation({ fromId: 'loc-1', toId: 'loc-2' }),
        createMockLocationRelation({ fromId: 'loc-1', toId: 'loc-3' }),
      ]
      const mockResponse = createMockAPIResponse(mockRelations)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const locationId = 'loc-1'
      await locationApi.listRelations(projectId, locationId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/locations/relations`,
        { locationId }
      )
    })

    it('应该正确处理空关系列表', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await locationApi.listRelations('proj-456')

      expect(result.data).toHaveLength(0)
    })
  })

  describe('deleteRelation (L-009)', () => {
    it('应该发送正确的DELETE请求删除地点关系', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const relationId = 'rel-123'
      const projectId = 'proj-456'
      const result = await locationApi.deleteRelation(relationId, projectId)

      expect(httpService.delete).toHaveBeenCalledWith(
        `/locations/relations/${relationId}`,
        { projectId }
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
        locationApi.deleteRelation('nonexistent', 'proj-456')
      ).rejects.toEqual(mockError)
    })
  })

  // ==========================================
  // 便捷函数导出
  // ==========================================

  describe('命名导出函数', () => {
    it('listLocations应该调用locationApi.list', async () => {
      const mockResponse = createMockAPIResponse([createMockLocation()])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await listLocations('proj-456')

      expect(httpService.get).toHaveBeenCalledWith(
        '/writer/projects/proj-456/locations'
      )
    })

    it('getLocationTree应该调用locationApi.getTree', async () => {
      const mockResponse = createMockAPIResponse([createMockLocation()])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await getLocationTree('proj-456')

      expect(httpService.get).toHaveBeenCalledWith(
        '/writer/projects/proj-456/locations/tree'
      )
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

      await expect(locationApi.getDetail('loc-123', 'proj-456')).rejects.toEqual(
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

      await expect(locationApi.list('proj-456')).rejects.toEqual(mockError)
    })

    it('应该正确处理404资源不存在错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '地点不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(locationApi.getTree('nonexistent')).rejects.toEqual(mockError)
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
        locationApi.create('proj-456', {
          projectId: 'proj-456',
          name: '测试地点',
        })
      ).rejects.toEqual(mockError)
    })

    it('应该正确处理网络错误', async () => {
      const mockError = new Error('Network Error')
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(locationApi.getDetail('loc-123', 'proj-456')).rejects.toThrow(
        'Network Error'
      )
    })
  })
})
