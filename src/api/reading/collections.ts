/**
 * 收藏相关API
 *
 * 对接后端 /api/v1/reader/collections 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'

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
 * 添加收藏
 * POST /api/v1/reader/collections
 */
export function addCollection(bookId: string, data?: { title?: string; description?: string; tags?: string[] }) {
  return httpService.post<Collection>('/reader/collections', {
    book_id: bookId,
    ...data
  })
}

/**
 * 获取收藏列表
 * GET /api/v1/reader/collections
 */
export function getCollections(params?: { page?: number; pageSize?: number }) {
  return httpService.get<Collection[]>('/reader/collections', { params })
}

/**
 * 更新收藏
 * PUT /api/v1/reader/collections/:id
 */
export function updateCollection(id: string, data: Partial<Collection>) {
  return httpService.put<Collection>(`/reader/collections/${id}`, data)
}

/**
 * 删除收藏
 * DELETE /api/v1/reader/collections/:id
 */
export function deleteCollection(id: string) {
  return httpService.delete<void>(`/reader/collections/${id}`)
}

/**
 * 检查是否已收藏
 * GET /api/v1/reader/collections/check/:book_id
 */
export function checkCollected(bookId: string) {
  return httpService.get<{ collected: boolean }>(`/reader/collections/check/${bookId}`)
}

/**
 * 根据标签获取收藏
 * GET /api/v1/reader/collections/tags/:tag
 */
export function getCollectionsByTag(tag: string) {
  return httpService.get<Collection[]>(`/reader/collections/tags/${tag}`)
}

/**
 * 获取收藏统计
 * GET /api/v1/reader/collections/stats
 */
export function getCollectionStats() {
  return httpService.get<CollectionStats>('/reader/collections/stats')
}

/**
 * 分享收藏
 * POST /api/v1/reader/collections/:id/share
 */
export function shareCollection(id: string) {
  return httpService.post<{ shareUrl: string }>(`/reader/collections/${id}/share`)
}

/**
 * 取消分享收藏
 * DELETE /api/v1/reader/collections/:id/share
 */
export function unshareCollection(id: string) {
  return httpService.delete<void>(`/reader/collections/${id}/share`)
}

/**
 * 创建收藏夹
 * POST /api/v1/reader/collections/folders
 */
export function createFolder(name: string, description?: string) {
  return httpService.post<CollectionFolder>('/reader/collections/folders', { name, description })
}

/**
 * 获取收藏夹列表
 * GET /api/v1/reader/collections/folders
 */
export function getFolders() {
  return httpService.get<CollectionFolder[]>('/reader/collections/folders')
}

/**
 * 更新收藏夹
 * PUT /api/v1/reader/collections/folders/:id
 */
export function updateFolder(id: string, data: Partial<CollectionFolder>) {
  return httpService.put<CollectionFolder>(`/reader/collections/folders/${id}`, data)
}

/**
 * 删除收藏夹
 * DELETE /api/v1/reader/collections/folders/:id
 */
export function deleteFolder(id: string) {
  return httpService.delete<void>(`/reader/collections/folders/${id}`)
}
