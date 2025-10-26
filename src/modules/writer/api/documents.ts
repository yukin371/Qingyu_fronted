import request from '@/utils/request'
import type { APIResponse } from '@/types/api'

/**
 * 文档管理API
 */

export interface DocumentCreateData {
  title: string
  content?: string
  parentId?: string
  order?: number
}

export interface DocumentUpdateData {
  title?: string
  content?: string
  status?: 'draft' | 'published' | 'archived'
  parentId?: string
  order?: number
}

export interface DocumentMoveData {
  newParentId?: string
  newOrder: number
}

export interface Document {
  documentId: string
  projectId: string
  title: string
  content?: string
  status: string
  parentId?: string
  order: number
  wordCount?: number
  version: number
  createdAt: string
  updatedAt: string
}

export interface DocumentTreeNode {
  documentId: string
  title: string
  parentId?: string
  order: number
  wordCount?: number
  children?: DocumentTreeNode[]
}

/**
 * 创建文档
 */
export async function createDocument(projectId: string, data: DocumentCreateData): Promise<APIResponse<Document>> {
  return request.post<APIResponse<Document>>(`/projects/${projectId}/documents`, data)
}

/**
 * 获取文档列表
 */
export async function getDocuments(projectId: string, params?: { page?: number; pageSize?: number }): Promise<APIResponse<Document[]>> {
  return request.get<APIResponse<Document[]>>(`/projects/${projectId}/documents`, { params })
}

/**
 * 获取文档树
 */
export async function getDocumentTree(projectId: string): Promise<APIResponse<DocumentTreeNode[]>> {
  return request.get<APIResponse<DocumentTreeNode[]>>(`/projects/${projectId}/documents/tree`)
}

/**
 * 获取文档详情
 */
export async function getDocumentById(id: string): Promise<APIResponse<Document>> {
  return request.get<APIResponse<Document>>(`/documents/${id}`)
}

/**
 * 获取文档内容
 */
export async function getDocumentContent(id: string): Promise<APIResponse<{content: string}>> {
  return request.get<APIResponse<{content: string}>>(`/documents/${id}/content`)
}

/**
 * 更新文档
 */
export async function updateDocument(id: string, data: DocumentUpdateData): Promise<APIResponse<Document>> {
  return request.put<APIResponse<Document>>(`/documents/${id}`, data)
}

/**
 * 更新文档内容
 */
export async function updateDocumentContent(id: string, content: string): Promise<APIResponse<null>> {
  return request.put<APIResponse<null>>(`/documents/${id}/content`, { content })
}

/**
 * 删除文档
 */
export async function deleteDocument(id: string): Promise<APIResponse<null>> {
  return request.delete<APIResponse<null>>(`/documents/${id}`)
}

/**
 * 移动文档
 */
export async function moveDocument(id: string, data: DocumentMoveData): Promise<APIResponse<null>> {
  return request.put<APIResponse<null>>(`/documents/${id}/move`, data)
}

/**
 * 重新排序文档
 */
export async function reorderDocuments(projectId: string, orders: Array<{ documentId: string; order: number }>): Promise<APIResponse<null>> {
  return request.put<APIResponse<null>>(`/projects/${projectId}/documents/reorder`, { orders })
}

/**
 * 自动保存文档
 */
export async function autosaveDocument(id: string, content: string, version: number): Promise<APIResponse<null>> {
  return request.post<APIResponse<null>>(`/documents/${id}/autosave`, { content, version })
}

/**
 * 获取保存状态
 */
export async function getSaveStatus(id: string): Promise<APIResponse<{isSaved: boolean; lastSaved: string}>> {
  return request.get<APIResponse<{isSaved: boolean; lastSaved: string}>>(`/documents/${id}/save-status`)
}

/**
 * 计算字数
 */
export async function calculateWordCount(id: string, content: string, filterMarkdown = true): Promise<APIResponse<{wordCount: number}>> {
  return request.post<APIResponse<{wordCount: number}>>(`/documents/${id}/word-count`, { content, filterMarkdown })
}

