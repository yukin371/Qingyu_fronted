import request from '@/utils/request'

/**
 * 项目管理API
 */

export interface ProjectCreateData {
  title: string
  description?: string
  category?: string
  type?: 'novel' | 'essay' | 'others'
  settings?: {
    targetWordCount?: number
    dailyGoal?: number
  }
}

export interface ProjectUpdateData {
  title?: string
  description?: string
  category?: string
  status?: 'draft' | 'writing' | 'completed' | 'published'
  settings?: Record<string, any>
}

export interface ProjectQueryParams {
  page?: number
  pageSize?: number
  status?: string
  category?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface Project {
  projectId: string
  title: string
  description?: string
  category?: string
  type: string
  status: string
  wordCount?: number
  chapterCount?: number
  settings?: Record<string, any>
  createdAt: string
  updatedAt: string
}

/**
 * 创建项目
 */
export async function createProject(data: ProjectCreateData) {
  return request.post('/projects', data)
}

/**
 * 获取项目列表
 */
export async function getProjects(params?: ProjectQueryParams) {
  return request.get('/projects', { params })
}

/**
 * 获取项目详情
 */
export async function getProjectById(id: string) {
  return request.get(`/projects/${id}`)
}

/**
 * 更新项目
 */
export async function updateProject(id: string, data: ProjectUpdateData) {
  return request.put(`/projects/${id}`, data)
}

/**
 * 删除项目
 */
export async function deleteProject(id: string) {
  return request.delete(`/projects/${id}`)
}

/**
 * 更新项目统计
 */
export async function updateProjectStatistics(id: string) {
  return request.put(`/projects/${id}/statistics`)
}

/**
 * 获取项目统计信息
 */
export async function getProjectStatistics(id: string) {
  return request.get(`/projects/${id}/statistics`)
}

