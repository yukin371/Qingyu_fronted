import request from '@/utils/request'

/**
 * 版本管理API
 */

export interface Version {
  versionId: string
  documentId: string
  content: string
  wordCount: number
  comment?: string
  createdAt: string
  createdBy: string
}

export interface VersionDiff {
  additions: number
  deletions: number
  changes: Array<{
    type: 'add' | 'delete' | 'modify'
    position: number
    content: string
  }>
}

/**
 * 获取版本历史
 */
export async function getVersions(documentId: string, params?: { page?: number; pageSize?: number }) {
  return request.get<Version[]>(`/documents/${documentId}/versions`, { params })
}

/**
 * 获取特定版本
 */
export async function getVersion(documentId: string, versionId: string) {
  return request.get<Version>(`/documents/${documentId}/versions/${versionId}`)
}

/**
 * 比较版本
 */
export async function compareVersions(documentId: string, fromVersion: string, toVersion: string) {
  return request.get<VersionDiff>(`/documents/${documentId}/versions/compare`, {
    params: { fromVersion, toVersion }
  })
}

/**
 * 恢复版本
 */
export async function restoreVersion(documentId: string, versionId: string) {
  return request.post(`/documents/${documentId}/versions/${versionId}/restore`)
}

