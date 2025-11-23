import request from '@/utils/request'

// ==========================================
// 类型定义 (Type Definitions)
// ==========================================

// 项目状态枚举 (对应后端逻辑)
export type ProjectStatus = 'draft' | 'writing' | 'completed' | 'published'

// 项目核心数据接口
export interface Project {
  id: string // 对应后端的 ProjectID (Mongo ID 或 UUID)
  title: string // 标题
  description?: string // 简介
  cover?: string // 封面图片 URL
  status: ProjectStatus // 状态
  category?: string // 分类 (如: 玄幻, 都市)
  wordCount: number // 字数统计
  ownerId: string // 作者 ID
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
  // 根据实际后端返回的结构可能还有其他字段
}

// 创建项目请求参数 (对应 project.CreateProjectRequest)
export interface CreateProjectParams {
  title: string
  description?: string
  category?: string
  cover?: string
  // 其他创建时需要的字段
}

// 更新项目请求参数 (对应 project.UpdateProjectRequest)
export interface UpdateProjectParams {
  title?: string
  description?: string
  status?: ProjectStatus
  category?: string
  cover?: string
}

// 获取列表的查询参数 (对应 ListProjects 中的 Query 参数)
export interface ProjectQueryParams {
  page?: number // 默认为 1
  pageSize?: number // 默认为 10
  status?: string // 筛选状态
  category?: string // 筛选分类
}

// 列表响应结构 (对应 project.ListProjectsResponse)
export interface ProjectListResponse {
  list: Project[] // 项目列表
  total: number // 总数
  page: number
  pageSize: number
}

// ==========================================
// API 方法 (API Methods)
// ==========================================

/**
 * 创建新项目
 * POST /api/v1/projects
 */
export function createProject(data: CreateProjectParams) {
  return request<Project>({
    url: '/api/v1/projects',
    method: 'post',
    data,
  })
}

/**
 * 获取项目详情
 * GET /api/v1/projects/{id}
 */
export function getProject(id: string) {
  return request<Project>({
    url: `/api/v1/projects/${id}`,
    method: 'get',
  })
}

/**
 * 获取项目列表 (支持分页和筛选)
 * GET /api/v1/projects
 */
export function getProjects(params?: ProjectQueryParams) {
  return request<ProjectListResponse>({
    url: '/api/v1/projects',
    method: 'get',
    params,
  })
}

/**
 * 更新项目信息
 * PUT /api/v1/projects/{id}
 */
export function updateProject(id: string, data: UpdateProjectParams) {
  return request<void>({
    url: `/api/v1/projects/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除项目
 * DELETE /api/v1/projects/{id}
 */
export function deleteProject(id: string) {
  return request<void>({
    url: `/api/v1/projects/${id}`,
    method: 'delete',
  })
}

/**
 * 强制更新项目统计信息 (字数等)
 * PUT /api/v1/projects/{id}/statistics
 */
export function updateProjectStatistics(id: string) {
  return request<void>({
    url: `/api/v1/projects/${id}/statistics`,
    method: 'put',
  })
}
