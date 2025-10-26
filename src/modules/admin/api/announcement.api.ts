/**
 * 公告管理 API
 */

import axios from 'axios'

const API_BASE = '/api/v1/admin/announcements'

/**
 * 公告接口
 */
export interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'notice'
  priority: number
  isActive: boolean
  startTime?: string
  endTime?: string
  targetUsers: 'all' | 'reader' | 'writer' | 'admin'
  viewCount: number
  createdBy?: string
  createdAt: string
  updatedAt: string
}

/**
 * 获取公告列表请求
 */
export interface GetAnnouncementsRequest {
  isActive?: boolean
  type?: string
  targetUsers?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: string
}

/**
 * 获取公告列表响应
 */
export interface GetAnnouncementsResponse {
  announcements: Announcement[]
  total: number
}

/**
 * 创建公告请求
 */
export interface CreateAnnouncementRequest {
  title: string
  content: string
  type: 'info' | 'warning' | 'notice'
  priority?: number
  isActive?: boolean
  startTime?: string
  endTime?: string
  targetUsers: 'all' | 'reader' | 'writer' | 'admin'
}

/**
 * 更新公告请求
 */
export interface UpdateAnnouncementRequest {
  title?: string
  content?: string
  type?: 'info' | 'warning' | 'notice'
  priority?: number
  isActive?: boolean
  startTime?: string
  endTime?: string
  targetUsers?: 'all' | 'reader' | 'writer' | 'admin'
}

/**
 * 批量更新状态请求
 */
export interface BatchUpdateAnnouncementStatusRequest {
  announcementIds: string[]
  isActive: boolean
}

/**
 * 批量删除请求
 */
export interface BatchDeleteRequest {
  ids: string[]
}

/**
 * 获取公告列表
 */
export const getAnnouncements = async (params?: GetAnnouncementsRequest): Promise<GetAnnouncementsResponse> => {
  const response = await axios.get(API_BASE, { params })
  return response.data.data
}

/**
 * 获取公告详情
 */
export const getAnnouncementById = async (id: string): Promise<Announcement> => {
  const response = await axios.get(`${API_BASE}/${id}`)
  return response.data.data
}

/**
 * 创建公告
 */
export const createAnnouncement = async (request: CreateAnnouncementRequest): Promise<Announcement> => {
  const response = await axios.post(API_BASE, request)
  return response.data.data
}

/**
 * 更新公告
 */
export const updateAnnouncement = async (id: string, request: UpdateAnnouncementRequest): Promise<void> => {
  await axios.put(`${API_BASE}/${id}`, request)
}

/**
 * 删除公告
 */
export const deleteAnnouncement = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`)
}

/**
 * 批量更新状态
 */
export const batchUpdateStatus = async (request: BatchUpdateAnnouncementStatusRequest): Promise<void> => {
  await axios.put(`${API_BASE}/batch-status`, request)
}

/**
 * 批量删除
 */
export const batchDelete = async (request: BatchDeleteRequest): Promise<void> => {
  await axios.delete(`${API_BASE}/batch-delete`, { data: request })
}

/**
 * 获取当前有效的公告（公开API）
 */
export const getEffectiveAnnouncements = async (targetUsers?: string, limit?: number): Promise<Announcement[]> => {
  const response = await axios.get('/api/v1/announcements/effective', {
    params: { targetUsers, limit }
  })
  return response.data.data
}

/**
 * 增加查看次数
 */
export const incrementViewCount = async (id: string): Promise<void> => {
  await axios.post(`/api/v1/announcements/${id}/view`)
}

