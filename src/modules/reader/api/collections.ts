/**
 * 收藏相关 API
 * 对接后端 /api/v1/social/collections 路由
 * 后端路由文档: Qingyu_backend/router/social/social_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 收藏项
 */
export interface Collection {
  id: string
  bookId: string
  title: string
  author: string
  cover?: string
  description?: string
  tags?: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 收藏夹
 */
export interface CollectionFolder {
  id: string
  name: string
  description?: string
  bookCount: number
  createdAt: string
  updatedAt: string
}

/**
 * 收藏统计
 */
export interface CollectionStats {
  totalCollections: number
  publicCollections: number
  folderCount: number
}

/**
 * 收藏 API 接口 (v2.0)
 * 对接后端: /api/v1/social/collections
 */
export const collectionsAPI = {
  /**
   * 添加收藏
   * POST /api/v1/social/collections
   */
  async addCollection(
    bookId: string,
    data?: { title?: string; description?: string; tags?: string[] }
  ): Promise<APIResponse<Collection>> {
    return httpService.post<APIResponse<Collection>>('/social/collections', {
      book_id: bookId,
      ...data
    })
  },

  /**
   * 获取收藏列表
   * GET /api/v1/social/collections
   */
  async getCollections(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<Collection>> {
    return httpService.get<PaginatedResponse<Collection>>('/social/collections', { params })
  },

  /**
   * 更新收藏
   * PUT /api/v1/social/collections/:id
   */
  async updateCollection(
    id: string,
    data: Partial<Collection>
  ): Promise<APIResponse<Collection>> {
    return httpService.put<APIResponse<Collection>>(`/social/collections/${id}`, data)
  },

  /**
   * 删除收藏
   * DELETE /api/v1/social/collections/:id
   */
  async deleteCollection(id: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/social/collections/${id}`)
  },

  /**
   * 检查是否已收藏
   * GET /api/v1/social/collections/check/:book_id
   */
  async checkCollected(bookId: string): Promise<APIResponse<{ collected: boolean }>> {
    return httpService.get<APIResponse<{ collected: boolean }>>(
      `/social/collections/check/${bookId}`
    )
  },

  /**
   * 根据标签获取收藏
   * GET /api/v1/social/collections/tags/:tag
   */
  async getCollectionsByTag(tag: string): Promise<APIResponse<Collection[]>> {
    return httpService.get<APIResponse<Collection[]>>(`/social/collections/tags/${tag}`)
  },

  /**
   * 获取收藏统计
   * GET /api/v1/social/collections/stats
   */
  async getCollectionStats(): Promise<APIResponse<CollectionStats>> {
    return httpService.get<APIResponse<CollectionStats>>('/social/collections/stats')
  },

  /**
   * 分享收藏
   * POST /api/v1/social/collections/:id/share
   */
  async shareCollection(id: string): Promise<APIResponse<{ shareUrl: string }>> {
    return httpService.post<APIResponse<{ shareUrl: string }>>(
      `/social/collections/${id}/share`
    )
  },

  /**
   * 取消分享收藏
   * DELETE /api/v1/social/collections/:id/share
   */
  async unshareCollection(id: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/social/collections/${id}/share`)
  },

  /**
   * 创建收藏夹
   * POST /api/v1/social/collections/folders
   */
  async createFolder(
    name: string,
    description?: string
  ): Promise<APIResponse<CollectionFolder>> {
    return httpService.post<APIResponse<CollectionFolder>>('/social/collections/folders', {
      name,
      description
    })
  },

  /**
   * 获取收藏夹列表
   * GET /api/v1/social/collections/folders
   */
  async getFolders(): Promise<APIResponse<CollectionFolder[]>> {
    return httpService.get<APIResponse<CollectionFolder[]>>('/social/collections/folders')
  },

  /**
   * 更新收藏夹
   * PUT /api/v1/social/collections/folders/:id
   */
  async updateFolder(
    id: string,
    data: Partial<CollectionFolder>
  ): Promise<APIResponse<CollectionFolder>> {
    return httpService.put<APIResponse<CollectionFolder>>(
      `/social/collections/folders/${id}`,
      data
    )
  },

  /**
   * 删除收藏夹
   * DELETE /api/v1/social/collections/folders/:id
   */
  async deleteFolder(id: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/social/collections/folders/${id}`)
  }
}

// 向后兼容：导出旧的函数名
export const addCollection = (bookId: string, data?: any) =>
  collectionsAPI.addCollection(bookId, data)
export const getCollections = (params?: any) => collectionsAPI.getCollections(params)
export const updateCollection = (id: string, data: any) =>
  collectionsAPI.updateCollection(id, data)
export const deleteCollection = (id: string) => collectionsAPI.deleteCollection(id)
export const checkCollected = (bookId: string) => collectionsAPI.checkCollected(bookId)
export const getCollectionsByTag = (tag: string) => collectionsAPI.getCollectionsByTag(tag)
export const getCollectionStats = () => collectionsAPI.getCollectionStats()
export const shareCollection = (id: string) => collectionsAPI.shareCollection(id)
export const unshareCollection = (id: string) => collectionsAPI.unshareCollection(id)
export const createFolder = (name: string, description?: string) =>
  collectionsAPI.createFolder(name, description)
export const getFolders = () => collectionsAPI.getFolders()
export const updateFolder = (id: string, data: any) => collectionsAPI.updateFolder(id, data)
export const deleteFolder = (id: string) => collectionsAPI.deleteFolder(id)

export default collectionsAPI
