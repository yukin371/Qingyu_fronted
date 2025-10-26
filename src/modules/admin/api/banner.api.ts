/**
 * Banner管理 API
 */

import axios from 'axios'

const API_BASE = '/api/v1/admin/banners'

/**
 * Banner接口
 */
export interface Banner {
  id: string
  title: string
  description: string
  image: string
  target: string
  targetType: 'book' | 'category' | 'url'
  sortOrder: number
  isActive: boolean
  startTime?: string
  endTime?: string
  clickCount: number
  createdAt: string
  updatedAt: string
}

/**
 * 获取Banner列表请求
 */
export interface GetBannersRequest {
  isActive?: boolean
  targetType?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: string
}

/**
 * 获取Banner列表响应
 */
export interface GetBannersResponse {
  banners: Banner[]
  total: number
}

/**
 * 创建Banner请求
 */
export interface CreateBannerRequest {
  title: string
  description?: string
  image: string
  target: string
  targetType: 'book' | 'category' | 'url'
  sortOrder?: number
  isActive?: boolean
  startTime?: string
  endTime?: string
}

/**
 * 更新Banner请求
 */
export interface UpdateBannerRequest {
  title?: string
  description?: string
  image?: string
  target?: string
  targetType?: 'book' | 'category' | 'url'
  sortOrder?: number
  isActive?: boolean
  startTime?: string
  endTime?: string
}

/**
 * 批量更新状态请求
 */
export interface BatchUpdateStatusRequest {
  bannerIds: string[]
  isActive: boolean
}

/**
 * 批量更新排序请求
 */
export interface BatchUpdateSortRequest {
  items: Array<{
    id: string
    sortOrder: number
  }>
}

/**
 * 获取Banner列表
 */
export const getBanners = async (params?: GetBannersRequest): Promise<GetBannersResponse> => {
  const response = await axios.get(API_BASE, { params })
  return response.data.data
}

/**
 * 获取Banner详情
 */
export const getBannerById = async (id: string): Promise<Banner> => {
  const response = await axios.get(`${API_BASE}/${id}`)
  return response.data.data
}

/**
 * 创建Banner
 */
export const createBanner = async (request: CreateBannerRequest): Promise<Banner> => {
  const response = await axios.post(API_BASE, request)
  return response.data.data
}

/**
 * 更新Banner
 */
export const updateBanner = async (id: string, request: UpdateBannerRequest): Promise<void> => {
  await axios.put(`${API_BASE}/${id}`, request)
}

/**
 * 删除Banner
 */
export const deleteBanner = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`)
}

/**
 * 批量更新状态
 */
export const batchUpdateStatus = async (request: BatchUpdateStatusRequest): Promise<void> => {
  await axios.put(`${API_BASE}/batch-status`, request)
}

/**
 * 批量更新排序
 */
export const batchUpdateSort = async (request: BatchUpdateSortRequest): Promise<void> => {
  await axios.put(`${API_BASE}/batch-sort`, request)
}

/**
 * 增加点击次数
 */
export const incrementClickCount = async (id: string): Promise<void> => {
  await axios.post(`/api/v1/banners/${id}/click`)
}

