import httpService from '@/core/services/http.service'

// ==========================================
// 类型定义 (对应 Go 后端 Models)
// ==========================================

// 基础的文档摘要 (对应 DocumentSummary)
export interface DocumentSummary {
  id: string
  title: string
  type: string
  wordCount: number
  lastEditAt: string // ISO8601 string
  status: string
  sortOrder: number
}

// 占位类型：由于 Character, Location, Timeline 定义在其他文件中
// 暂时定义为 any 或 基础接口，待后续对接具体模块时可引入详细类型
export interface Character {
  id: string
  name: string
  role?: string
  [key: string]: any
}

export interface Location {
  id: string
  name: string
  [key: string]: any
}

export interface TimelineEvent {
  id: string
  title: string
  [key: string]: any
}

// 项目详情响应 (对应 ProjectDetailResponse)
export interface ProjectDetailResponse {
  id: string
  title: string
  description: string
  coverImage: string
  genre: string
  tags: string[]
  status: string // 'serialized', 'completed', etc.
  visibility: string // 'public', 'private'
  totalWords: number
  chapterCount: number
  lastUpdateTime: string
  createdAt: string
  updatedAt: string
  documents: DocumentSummary[]
  characters: Character[]
  locations: Location[]
  timeline: TimelineEvent[]
}

// 项目摘要 (对应 ProjectSummary)
export interface ProjectSummary {
  id: string
  title: string
  coverImage: string
  genre: string
  status: string
  totalWords: number
  chapterCount: number
  lastUpdateTime: string
}

// 项目列表响应 (对应 ProjectListResponse)
export interface ProjectListResponse {
  projects: ProjectSummary[]
  total: number
  page: number
  size: number
}

// ==========================================
// 请求参数类型 (推断自 Go Service)
// ==========================================

// 创建项目请求参数
export interface CreateProjectRequest {
  title: string
  description?: string
  coverImage?: string
  genre?: string
  tags?: string[]
  visibility?: 'public' | 'private'
}

// 更新项目请求参数
export interface UpdateProjectRequest {
  title?: string
  description?: string
  coverImage?: string
  genre?: string
  tags?: string[]
  status?: string
  visibility?: string
}

// 获取列表查询参数
export interface ProjectListParams {
  page?: number
  pageSize?: number
  status?: string
  category?: string
}

// ==========================================
// API 定义
// ==========================================

const BASE_URL = '/projects'

export const projectApi = {
  /**
   * 创建项目
   * POST /api/v1/projects
   */
  create(data: CreateProjectRequest) {
    // 注意：根据 HttpService 逻辑，这里返回的是 Promise<T>，
    // 其中 T 是后端 ApiResponse.data 的内容。
    // 假设后端 CreateProjectResponse 返回的是创建后的项目详情或ID
    return httpService.post<ProjectDetailResponse>(BASE_URL, data)
  },

  /**
   * 获取项目列表
   * GET /api/v1/projects
   */
  list(params?: ProjectListParams) {
    return httpService.get<ProjectListResponse>(BASE_URL, params, {
      // 列表页通常不需要防抖，但如果要做搜索建议可以开启 deduplicate
      deduplicate: true,
    })
  },

  /**
   * 获取项目详情
   * GET /api/v1/projects/:id
   */
  getDetail(id: string) {
    return httpService.get<ProjectDetailResponse>(`${BASE_URL}/${id}`)
  },

  /**
   * 更新项目信息
   * PUT /api/v1/projects/:id
   */
  update(id: string, data: UpdateProjectRequest) {
    return httpService.put<void>(`${BASE_URL}/${id}`, data)
  },

  /**
   * 删除项目
   * DELETE /api/v1/projects/:id
   */
  delete(id: string) {
    return httpService.delete<void>(`${BASE_URL}/${id}`)
  },

  /**
   * 手动触发更新项目统计信息 (字数、章节数)
   * PUT /api/v1/projects/:id/statistics
   */
  refreshStatistics(id: string) {
    return httpService.put<void>(`${BASE_URL}/${id}/statistics`, null, {
      // 统计计算可能耗时较长，静默处理避免打扰用户
      silent: true,
    })
  },
}

// ==========================================
// 便捷导出函数 (向后兼容 writerStore)
// ==========================================

/**
 * 创建项目 - 便捷函数
 */
export const createProject = (data: CreateProjectRequest) => projectApi.create(data)

/**
 * 获取项目列表 - 便捷函数
 */
export const getProjects = (params?: ProjectListParams) => projectApi.list(params)

/**
 * 获取项目详情 - 便捷函数
 */
export const getProjectById = (id: string) => projectApi.getDetail(id)

/**
 * 更新项目 - 便捷函数
 */
export const updateProject = (id: string, data: UpdateProjectRequest) => projectApi.update(id, data)

/**
 * 删除项目 - 便捷函数
 */
export const deleteProject = (id: string) => projectApi.delete(id)

// ==========================================
// 类型别名 (向后兼容)
// ==========================================

/**
 * 项目创建数据类型别名
 */
export type ProjectCreateData = CreateProjectRequest

/**
 * 项目更新数据类型别名
 */
export type ProjectUpdateData = UpdateProjectRequest
