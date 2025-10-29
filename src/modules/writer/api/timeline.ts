import request from '@/utils/request'
import type {
  Timeline,
  TimelineEvent,
  TimelineVisualization,
  CreateTimelineRequest,
  CreateTimelineEventRequest,
  UpdateTimelineEventRequest
} from '@/types/writer'

// 时间线管理 API

/**
 * 创建时间线
 */
export function createTimeline(projectId: string, data: CreateTimelineRequest) {
  return request<Timeline>({
    url: `/api/v1/projects/${projectId}/timelines`,
    method: 'post',
    data
  })
}

/**
 * 获取时间线详情
 */
export function getTimeline(timelineId: string, projectId: string) {
  return request<Timeline>({
    url: `/api/v1/timelines/${timelineId}`,
    method: 'get',
    params: { projectId }
  })
}

/**
 * 获取项目时间线列表
 */
export function listTimelines(projectId: string) {
  return request<Timeline[]>({
    url: `/api/v1/projects/${projectId}/timelines`,
    method: 'get'
  })
}

/**
 * 删除时间线
 */
export function deleteTimeline(timelineId: string, projectId: string) {
  return request<void>({
    url: `/api/v1/timelines/${timelineId}`,
    method: 'delete',
    params: { projectId }
  })
}

// 时间线事件管理

/**
 * 创建时间线事件
 */
export function createTimelineEvent(
  timelineId: string,
  projectId: string,
  data: CreateTimelineEventRequest
) {
  return request<TimelineEvent>({
    url: `/api/v1/timelines/${timelineId}/events`,
    method: 'post',
    params: { projectId },
    data
  })
}

/**
 * 获取时间线事件详情
 */
export function getTimelineEvent(eventId: string, projectId: string) {
  return request<TimelineEvent>({
    url: `/api/v1/timeline-events/${eventId}`,
    method: 'get',
    params: { projectId }
  })
}

/**
 * 获取时间线事件列表
 */
export function listTimelineEvents(timelineId: string) {
  return request<TimelineEvent[]>({
    url: `/api/v1/timelines/${timelineId}/events`,
    method: 'get'
  })
}

/**
 * 更新时间线事件
 */
export function updateTimelineEvent(
  eventId: string,
  projectId: string,
  data: UpdateTimelineEventRequest
) {
  return request<TimelineEvent>({
    url: `/api/v1/timeline-events/${eventId}`,
    method: 'put',
    params: { projectId },
    data
  })
}

/**
 * 删除时间线事件
 */
export function deleteTimelineEvent(eventId: string, projectId: string) {
  return request<void>({
    url: `/api/v1/timeline-events/${eventId}`,
    method: 'delete',
    params: { projectId }
  })
}

/**
 * 获取时间线可视化数据
 */
export function getTimelineVisualization(timelineId: string) {
  return request<TimelineVisualization>({
    url: `/api/v1/timelines/${timelineId}/visualization`,
    method: 'get'
  })
}



