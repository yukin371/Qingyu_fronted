/**
 * 时间线API契约测试
 * @description 验证 timelineApi 与后端 /api/v1/writer/projects/:projectId/timelines 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { timelineApi, listTimelines, listTimelineEvents } from '@/modules/writer/api/timeline'
import httpService from '@/core/services/http.service'
import type {
  Timeline,
  TimelineEvent,
  SaveTimelineRequest,
  SaveTimelineEventRequest,
  EventType,
  StoryTime,
} from '@/modules/writer/types/timeline'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('timelineApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟故事时间数据
  const createMockStoryTime = (overrides?: Partial<StoryTime>): StoryTime => ({
    year: 2024,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    era: '新历',
    season: '春季',
    description: undefined,
    ...overrides,
  })

  // 模拟时间线数据
  const createMockTimeline = (overrides?: Partial<Timeline>): Timeline => ({
    id: 'tl-123',
    projectId: 'proj-456',
    name: '测试时间线',
    description: '时间线描述',
    startTime: createMockStoryTime(),
    endTime: createMockStoryTime({ year: 2025 }),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  })

  // 模拟时间线事件数据
  const createMockTimelineEvent = (
    overrides?: Partial<TimelineEvent>
  ): TimelineEvent => ({
    id: 'event-123',
    projectId: 'proj-456',
    timelineId: 'tl-123',
    title: '测试事件',
    description: '事件描述',
    storyTime: createMockStoryTime(),
    duration: '一天',
    impact: '重大影响',
    participants: ['char-1', 'char-2'],
    locationIds: ['loc-1'],
    chapterIds: ['doc-1'],
    eventType: 'plot' as EventType,
    importance: 8,
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
  // 时间线管理 (Timeline CRUD)
  // ==========================================

  describe('create (T-001)', () => {
    it('应该发送正确的POST请求创建时间线', async () => {
      const mockTimeline = createMockTimeline()
      const mockResponse = createMockAPIResponse(mockTimeline)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: SaveTimelineRequest = {
        projectId,
        name: '新时间线',
        description: '新时间线描述',
      }
      const result = await timelineApi.create(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/timelines`,
        data
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确创建带故事时间的时间线', async () => {
      const mockTimeline = createMockTimeline()
      const mockResponse = createMockAPIResponse(mockTimeline)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const data: SaveTimelineRequest = {
        projectId,
        name: '带时间范围的时间线',
        startTime: {
          era: '上古',
          year: 1000,
        },
        endTime: {
          era: '上古',
          year: 2000,
        },
      }
      await timelineApi.create(projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/timelines`,
        data
      )
    })

    it('应该正确处理创建失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '时间线名称不能为空',
          },
        },
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      const projectId = 'proj-456'
      const data: SaveTimelineRequest = {
        projectId,
        name: '',
      }

      await expect(timelineApi.create(projectId, data)).rejects.toEqual(mockError)
    })
  })

  describe('list (T-002)', () => {
    it('应该发送正确的GET请求获取时间线列表', async () => {
      const mockTimelines = [createMockTimeline()]
      const mockResponse = createMockAPIResponse(mockTimelines)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await timelineApi.list(projectId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/writer/projects/${projectId}/timelines`
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空时间线列表', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const projectId = 'proj-456'
      const result = await timelineApi.list(projectId)

      expect(result.data).toHaveLength(0)
    })

    it('应该正确返回多个时间线', async () => {
      const mockTimelines = [
        createMockTimeline({ id: 'tl-1', name: '时间线1' }),
        createMockTimeline({ id: 'tl-2', name: '时间线2' }),
        createMockTimeline({ id: 'tl-3', name: '时间线3' }),
      ]
      const mockResponse = createMockAPIResponse(mockTimelines)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await timelineApi.list('proj-456')

      expect(result.data).toHaveLength(3)
      expect(result.data[0].name).toBe('时间线1')
      expect(result.data[2].name).toBe('时间线3')
    })
  })

  describe('getDetail (T-003)', () => {
    it('应该发送正确的GET请求获取时间线详情', async () => {
      const mockTimeline = createMockTimeline()
      const mockResponse = createMockAPIResponse(mockTimeline)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const timelineId = 'tl-123'
      const projectId = 'proj-456'
      const result = await timelineApi.getDetail(timelineId, projectId)

      expect(httpService.get).toHaveBeenCalledWith(`/timelines/${timelineId}`, {
        projectId,
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确返回时间线完整信息', async () => {
      const mockTimeline = createMockTimeline({
        startTime: { era: '创世纪', year: 1 },
        endTime: { era: '创世纪', year: 100 },
      })
      const mockResponse = createMockAPIResponse(mockTimeline)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await timelineApi.getDetail('tl-123', 'proj-456')

      expect(result.data.startTime?.era).toBe('创世纪')
      expect(result.data.endTime?.year).toBe(100)
    })

    it('应该正确处理时间线不存在的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '时间线不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(timelineApi.getDetail('nonexistent', 'proj-456')).rejects.toEqual(
        mockError
      )
    })
  })

  describe('delete (T-004)', () => {
    it('应该发送正确的DELETE请求删除时间线', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const timelineId = 'tl-123'
      const projectId = 'proj-456'
      const result = await timelineApi.delete(timelineId, projectId)

      expect(httpService.delete).toHaveBeenCalledWith(`/timelines/${timelineId}`, {
        projectId,
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理删除不存在的时间线', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '时间线不存在',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(timelineApi.delete('nonexistent', 'proj-456')).rejects.toEqual(
        mockError
      )
    })

    it('应该正确处理无权限删除的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权限删除此时间线',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(timelineApi.delete('tl-123', 'proj-456')).rejects.toEqual(mockError)
    })
  })

  // ==========================================
  // 可视化数据 (Visualization)
  // ==========================================

  describe('getVisualization (T-005)', () => {
    it('应该发送正确的GET请求获取时间线可视化数据', async () => {
      const mockVisualization = {
        nodes: [
          { id: 'event-1', title: '事件1', x: 0, y: 0 },
          { id: 'event-2', title: '事件2', x: 100, y: 0 },
        ],
        edges: [
          { from: 'event-1', to: 'event-2', label: '导致' },
        ],
      }
      const mockResponse = createMockAPIResponse(mockVisualization)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const timelineId = 'tl-123'
      const result = await timelineApi.getVisualization(timelineId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/timelines/${timelineId}/visualization`
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空可视化数据', async () => {
      const mockVisualization = {
        nodes: [],
        edges: [],
      }
      const mockResponse = createMockAPIResponse(mockVisualization)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await timelineApi.getVisualization('tl-123')

      expect(result.data.nodes).toHaveLength(0)
      expect(result.data.edges).toHaveLength(0)
    })

    it('应该正确处理可视化数据获取失败', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '时间线不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(timelineApi.getVisualization('nonexistent')).rejects.toEqual(
        mockError
      )
    })
  })

  // ==========================================
  // 事件管理 (Event CRUD)
  // ==========================================

  describe('createEvent (T-006)', () => {
    it('应该发送正确的POST请求创建时间线事件', async () => {
      const mockEvent = createMockTimelineEvent()
      const mockResponse = createMockAPIResponse(mockEvent)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const timelineId = 'tl-123'
      const projectId = 'proj-456'
      const data: SaveTimelineEventRequest = {
        timelineId,
        title: '新事件',
        eventType: 'plot' as EventType,
      }
      const result = await timelineApi.createEvent(timelineId, projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/timelines/${timelineId}/events`,
        data,
        { params: { projectId } }
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确创建带所有字段的事件', async () => {
      const mockEvent = createMockTimelineEvent()
      const mockResponse = createMockAPIResponse(mockEvent)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const timelineId = 'tl-123'
      const projectId = 'proj-456'
      const data: SaveTimelineEventRequest = {
        timelineId,
        title: '完整事件',
        description: '事件描述',
        storyTime: {
          era: '新历',
          year: 2024,
          month: 6,
          day: 15,
        },
        duration: '三天',
        impact: '重大影响',
        participants: ['char-1', 'char-2', 'char-3'],
        locationIds: ['loc-1', 'loc-2'],
        chapterIds: ['doc-1'],
        eventType: 'milestone' as EventType,
        importance: 10,
      }
      await timelineApi.createEvent(timelineId, projectId, data)

      expect(httpService.post).toHaveBeenCalledWith(
        `/timelines/${timelineId}/events`,
        data,
        { params: { projectId } }
      )
    })

    it('应该正确创建不同类型的事件', async () => {
      const eventTypes: EventType[] = [
        'plot',
        'character',
        'world',
        'background',
        'milestone',
      ]

      for (const eventType of eventTypes) {
        vi.clearAllMocks()
        const mockEvent = createMockTimelineEvent({ eventType })
        const mockResponse = createMockAPIResponse(mockEvent)
        vi.mocked(httpService.post).mockResolvedValue(mockResponse)

        await timelineApi.createEvent('tl-123', 'proj-456', {
          timelineId: 'tl-123',
          title: `${eventType}事件`,
          eventType,
        })

        expect(httpService.post).toHaveBeenCalledWith(
          '/timelines/tl-123/events',
          expect.objectContaining({ eventType }),
          { params: { projectId: 'proj-456' } }
        )
      }
    })

    it('应该正确处理创建事件失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '事件标题不能为空',
          },
        },
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        timelineApi.createEvent('tl-123', 'proj-456', {
          timelineId: 'tl-123',
          title: '',
          eventType: 'plot' as EventType,
        })
      ).rejects.toEqual(mockError)
    })
  })

  describe('listEvents (T-007)', () => {
    it('应该发送正确的GET请求获取时间线事件列表', async () => {
      const mockEvents = [createMockTimelineEvent()]
      const mockResponse = createMockAPIResponse(mockEvents)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const timelineId = 'tl-123'
      const result = await timelineApi.listEvents(timelineId)

      expect(httpService.get).toHaveBeenCalledWith(
        `/timelines/${timelineId}/events`
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理空事件列表', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await timelineApi.listEvents('tl-123')

      expect(result.data).toHaveLength(0)
    })

    it('应该正确返回多个事件', async () => {
      const mockEvents = [
        createMockTimelineEvent({ id: 'event-1', title: '事件1', importance: 5 }),
        createMockTimelineEvent({ id: 'event-2', title: '事件2', importance: 8 }),
        createMockTimelineEvent({ id: 'event-3', title: '事件3', importance: 10 }),
      ]
      const mockResponse = createMockAPIResponse(mockEvents)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await timelineApi.listEvents('tl-123')

      expect(result.data).toHaveLength(3)
      expect(result.data[0].title).toBe('事件1')
      expect(result.data[2].importance).toBe(10)
    })
  })

  describe('getEvent (T-008)', () => {
    it('应该发送正确的GET请求获取事件详情', async () => {
      const mockEvent = createMockTimelineEvent()
      const mockResponse = createMockAPIResponse(mockEvent)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const eventId = 'event-123'
      const projectId = 'proj-456'
      const result = await timelineApi.getEvent(eventId, projectId)

      expect(httpService.get).toHaveBeenCalledWith(`/events/${eventId}`, {
        params: { projectId },
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确返回事件完整信息', async () => {
      const mockEvent = createMockTimelineEvent({
        title: '重要事件',
        description: '详细描述',
        storyTime: { description: '那一天的黄昏' },
        participants: ['char-1', 'char-2', 'char-3'],
        importance: 10,
      })
      const mockResponse = createMockAPIResponse(mockEvent)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await timelineApi.getEvent('event-123', 'proj-456')

      expect(result.data.title).toBe('重要事件')
      expect(result.data.storyTime?.description).toBe('那一天的黄昏')
      expect(result.data.participants).toHaveLength(3)
      expect(result.data.importance).toBe(10)
    })

    it('应该正确处理事件不存在的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '事件不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(timelineApi.getEvent('nonexistent', 'proj-456')).rejects.toEqual(
        mockError
      )
    })
  })

  describe('updateEvent (T-009)', () => {
    it('应该发送正确的PUT请求更新事件', async () => {
      const mockEvent = createMockTimelineEvent()
      const mockResponse = createMockAPIResponse(mockEvent)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const eventId = 'event-123'
      const projectId = 'proj-456'
      const data: SaveTimelineEventRequest = {
        timelineId: 'tl-123',
        title: '更新后的事件标题',
        eventType: 'plot' as EventType,
      }
      const result = await timelineApi.updateEvent(eventId, projectId, data)

      expect(httpService.put).toHaveBeenCalledWith(
        `/events/${eventId}`,
        data,
        { params: { projectId } }
      )
      expect(result).toEqual(mockResponse)
    })

    it('应该正确更新事件的重要性', async () => {
      const mockEvent = createMockTimelineEvent({ importance: 10 })
      const mockResponse = createMockAPIResponse(mockEvent)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      await timelineApi.updateEvent('event-123', 'proj-456', {
        timelineId: 'tl-123',
        title: '事件',
        eventType: 'milestone' as EventType,
        importance: 10,
      })

      expect(httpService.put).toHaveBeenCalledWith(
        '/events/event-123',
        expect.objectContaining({ importance: 10 }),
        { params: { projectId: 'proj-456' } }
      )
    })

    it('应该正确更新事件的关联信息', async () => {
      const mockEvent = createMockTimelineEvent()
      const mockResponse = createMockAPIResponse(mockEvent)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const data: SaveTimelineEventRequest = {
        timelineId: 'tl-123',
        title: '事件',
        eventType: 'plot' as EventType,
        participants: ['char-new'],
        locationIds: ['loc-new'],
        chapterIds: ['doc-new'],
      }
      await timelineApi.updateEvent('event-123', 'proj-456', data)

      expect(httpService.put).toHaveBeenCalledWith('/events/event-123', data, {
        params: { projectId: 'proj-456' },
      })
    })

    it('应该正确处理更新失败的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权限修改此事件',
          },
        },
      }
      vi.mocked(httpService.put).mockRejectedValue(mockError)

      await expect(
        timelineApi.updateEvent('event-123', 'proj-456', {
          timelineId: 'tl-123',
          title: '新标题',
          eventType: 'plot' as EventType,
        })
      ).rejects.toEqual(mockError)
    })
  })

  describe('deleteEvent (T-010)', () => {
    it('应该发送正确的DELETE请求删除事件', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const eventId = 'event-123'
      const projectId = 'proj-456'
      const result = await timelineApi.deleteEvent(eventId, projectId)

      expect(httpService.delete).toHaveBeenCalledWith(`/events/${eventId}`, {
        params: { projectId },
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确处理删除不存在的事件', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '事件不存在',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(timelineApi.deleteEvent('nonexistent', 'proj-456')).rejects.toEqual(
        mockError
      )
    })

    it('应该正确处理无权限删除的情况', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权限删除此事件',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(timelineApi.deleteEvent('event-123', 'proj-456')).rejects.toEqual(
        mockError
      )
    })
  })

  // ==========================================
  // 便捷函数导出
  // ==========================================

  describe('命名导出函数', () => {
    it('listTimelines应该调用timelineApi.list', async () => {
      const mockResponse = createMockAPIResponse([createMockTimeline()])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await listTimelines('proj-456')

      expect(httpService.get).toHaveBeenCalledWith(
        '/writer/projects/proj-456/timelines'
      )
    })

    it('listTimelineEvents应该调用timelineApi.listEvents', async () => {
      const mockResponse = createMockAPIResponse([createMockTimelineEvent()])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await listTimelineEvents('tl-123')

      expect(httpService.get).toHaveBeenCalledWith('/timelines/tl-123/events')
    })

    it('listTimelineEvents应该忽略projectId参数', async () => {
      const mockResponse = createMockAPIResponse([createMockTimelineEvent()])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await listTimelineEvents('tl-123', 'proj-456')

      expect(httpService.get).toHaveBeenCalledWith('/timelines/tl-123/events')
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

      await expect(timelineApi.getDetail('tl-123', 'proj-456')).rejects.toEqual(
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

      await expect(timelineApi.list('proj-456')).rejects.toEqual(mockError)
    })

    it('应该正确处理404资源不存在错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '时间线不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(timelineApi.getVisualization('nonexistent')).rejects.toEqual(
        mockError
      )
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
        timelineApi.create('proj-456', {
          projectId: 'proj-456',
          name: '测试时间线',
        })
      ).rejects.toEqual(mockError)
    })

    it('应该正确处理网络错误', async () => {
      const mockError = new Error('Network Error')
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(timelineApi.getDetail('tl-123', 'proj-456')).rejects.toThrow(
        'Network Error'
      )
    })
  })
})
