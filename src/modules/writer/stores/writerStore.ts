import { defineStore } from 'pinia'
import type {
  Project,
  Document,
  DocumentTreeNode
} from '../api'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getDocuments,
  getDocumentTree,
  getDocumentById,
  getDocumentContent,
  createDocument,
  updateDocument,
  updateDocumentContent,
  deleteDocument,
  moveDocument,
  autosaveDocument,
  getSaveStatus,
  type ProjectCreateData,
  type ProjectUpdateData,
  type DocumentCreateData,
  type DocumentUpdateData
} from '../api'

/**
 * 自动保存任务
 */
interface AutosaveTask {
  documentId: string
  content: string
  version: number
  timestamp: number
}

/**
 * Writer Store状态
 */
export interface WriterState {
  // 项目管理
  projects: Project[]
  currentProject: Project | null
  projectsLoading: boolean

  // 文档管理
  documents: Document[]
  documentTree: DocumentTreeNode[]
  currentDocument: Document | null
  documentsLoading: boolean
  documentTreeLoading: boolean

  // 编辑器状态
  editorContent: string
  editorVersion: number
  isDirty: boolean
  lastSaved: Date | null

  // 自动保存
  autosaveEnabled: boolean
  autosaveInterval: number
  autosaveQueue: AutosaveTask[]
  isSaving: boolean

  // 统计缓存
  statisticsCache: Record<string, any>

  // 错误信息
  error: string | null
}

export const useWriterStore = defineStore('writer', {
  state: (): WriterState => ({
    // 项目管理
    projects: [],
    currentProject: null,
    projectsLoading: false,

    // 文档管理
    documents: [],
    documentTree: [],
    currentDocument: null,
    documentsLoading: false,
    documentTreeLoading: false,

    // 编辑器状态
    editorContent: '',
    editorVersion: 0,
    isDirty: false,
    lastSaved: null,

    // 自动保存
    autosaveEnabled: true,
    autosaveInterval: 30000, // 30秒
    autosaveQueue: [],
    isSaving: false,

    // 统计缓存
    statisticsCache: {},

    // 错误信息
    error: null
  }),

  getters: {
    /**
     * 获取当前项目ID
     */
    currentProjectId: (state): string | null => {
      return state.currentProject?.projectId || null
    },

    /**
     * 获取当前文档ID
     */
    currentDocumentId: (state): string | null => {
      return state.currentDocument?.documentId || null
    },

    /**
     * 是否有未保存的更改
     */
    hasUnsavedChanges: (state): boolean => {
      return state.isDirty
    },

    /**
     * 获取项目总数
     */
    projectCount: (state): number => {
      return state.projects.length
    },

    /**
     * 获取文档总数
     */
    documentCount: (state): number => {
      return state.documents.length
    }
  },

  actions: {
    // ==================== 项目管理 ====================

    /**
     * 加载项目列表
     */
    async loadProjects(params?: any): Promise<void> {
      this.projectsLoading = true
      this.error = null

      try {
        const response = await getProjects(params)
        if (response.code === 200) {
          this.projects = response.data.projects || response.data
        } else {
          this.error = response.message || '加载项目列表失败'
        }
      } catch (error: any) {
        console.error('加载项目列表失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.projectsLoading = false
      }
    },

    /**
     * 加载项目详情
     */
    async loadProject(projectId: string): Promise<void> {
      this.projectsLoading = true
      this.error = null

      try {
        const response = await getProjectById(projectId)
        if (response.code === 200) {
          this.currentProject = response.data
        } else {
          this.error = response.message || '加载项目失败'
        }
      } catch (error: any) {
        console.error('加载项目失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.projectsLoading = false
      }
    },

    /**
     * 创建项目
     */
    async createNewProject(data: ProjectCreateData): Promise<Project | null> {
      this.projectsLoading = true
      this.error = null

      try {
        const response = await createProject(data)
        if (response.code === 200) {
          this.projects.unshift(response.data)
          return response.data
        } else {
          this.error = response.message || '创建项目失败'
          return null
        }
      } catch (error: any) {
        console.error('创建项目失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.projectsLoading = false
      }
    },

    /**
     * 更新项目
     */
    async updateCurrentProject(data: ProjectUpdateData): Promise<void> {
      if (!this.currentProject) {
        throw new Error('没有选中的项目')
      }

      try {
        const response = await updateProject(this.currentProject.projectId, data)
        if (response.code === 200) {
          this.currentProject = { ...this.currentProject, ...response.data }
          // 更新项目列表中的项目
          const index = this.projects.findIndex(p => p.projectId === this.currentProject!.projectId)
          if (index !== -1) {
            this.projects[index] = this.currentProject
          }
        } else {
          this.error = response.message || '更新项目失败'
        }
      } catch (error: any) {
        console.error('更新项目失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      }
    },

    /**
     * 删除项目
     */
    async deleteProjectById(projectId: string): Promise<void> {
      try {
        const response = await deleteProject(projectId)
        if (response.code === 200) {
          this.projects = this.projects.filter(p => p.projectId !== projectId)
          if (this.currentProject?.projectId === projectId) {
            this.currentProject = null
          }
        } else {
          this.error = response.message || '删除项目失败'
        }
      } catch (error: any) {
        console.error('删除项目失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      }
    },

    // ==================== 文档管理 ====================

    /**
     * 加载文档列表
     */
    async loadDocuments(projectId: string, params?: any): Promise<void> {
      this.documentsLoading = true
      this.error = null

      try {
        const response = await getDocuments(projectId, params)
        if (response.code === 200) {
          this.documents = response.data.documents || response.data
        } else {
          this.error = response.message || '加载文档列表失败'
        }
      } catch (error: any) {
        console.error('加载文档列表失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.documentsLoading = false
      }
    },

    /**
     * 加载文档树
     */
    async loadDocumentTree(projectId: string): Promise<void> {
      this.documentTreeLoading = true
      this.error = null

      try {
        const response = await getDocumentTree(projectId)
        if (response.code === 200) {
          this.documentTree = response.data
        } else {
          this.error = response.message || '加载文档树失败'
        }
      } catch (error: any) {
        console.error('加载文档树失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.documentTreeLoading = false
      }
    },

    /**
     * 加载文档详情
     */
    async loadDocument(documentId: string): Promise<void> {
      this.documentsLoading = true
      this.error = null

      try {
        const response = await getDocumentById(documentId)
        if (response.code === 200) {
          this.currentDocument = response.data
          this.editorVersion = response.data.version || 0
        } else {
          this.error = response.message || '加载文档失败'
        }
      } catch (error: any) {
        console.error('加载文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.documentsLoading = false
      }
    },

    /**
     * 加载文档内容
     */
    async loadDocumentContent(documentId: string): Promise<void> {
      this.documentsLoading = true
      this.error = null

      try {
        const response = await getDocumentContent(documentId)
        if (response.code === 200) {
          this.editorContent = response.data.content || ''
          this.isDirty = false
        } else {
          this.error = response.message || '加载文档内容失败'
        }
      } catch (error: any) {
        console.error('加载文档内容失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.documentsLoading = false
      }
    },

    /**
     * 创建文档
     */
    async createNewDocument(projectId: string, data: DocumentCreateData): Promise<Document | null> {
      this.documentsLoading = true
      this.error = null

      try {
        const response = await createDocument(projectId, data)
        if (response.code === 200) {
          this.documents.push(response.data)
          // 重新加载文档树
          await this.loadDocumentTree(projectId)
          return response.data
        } else {
          this.error = response.message || '创建文档失败'
          return null
        }
      } catch (error: any) {
        console.error('创建文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.documentsLoading = false
      }
    },

    /**
     * 更新文档
     */
    async updateDocumentById(documentId: string, data: DocumentUpdateData): Promise<void> {
      try {
        const response = await updateDocument(documentId, data)
        if (response.code === 200) {
          if (this.currentDocument?.documentId === documentId) {
            this.currentDocument = { ...this.currentDocument, ...response.data }
          }
          // 更新文档列表中的文档
          const index = this.documents.findIndex(d => d.documentId === documentId)
          if (index !== -1) {
            this.documents[index] = { ...this.documents[index], ...response.data }
          }
        } else {
          this.error = response.message || '更新文档失败'
        }
      } catch (error: any) {
        console.error('更新文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      }
    },

    /**
     * 保存文档内容
     */
    async saveDocumentContent(documentId: string, content: string): Promise<void> {
      this.isSaving = true

      try {
        const response = await updateDocumentContent(documentId, content)
        if (response.code === 200) {
          this.editorContent = content
          this.isDirty = false
          this.lastSaved = new Date()
          this.editorVersion = response.data.version || this.editorVersion + 1
        } else {
          this.error = response.message || '保存文档失败'
          throw new Error(this.error)
        }
      } catch (error: any) {
        console.error('保存文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.isSaving = false
      }
    },

    /**
     * 自动保存文档
     */
    async autosave(documentId: string, content: string): Promise<void> {
      if (!this.autosaveEnabled || this.isSaving) {
        return
      }

      try {
        const response = await autosaveDocument(documentId, content, this.editorVersion)
        if (response.code === 200) {
          this.lastSaved = new Date()
          this.isDirty = false

          // 检查版本冲突
          if (response.data.version && response.data.version !== this.editorVersion) {
            console.warn('检测到版本冲突')
            // 可以触发版本冲突处理逻辑
          }
        }
      } catch (error: any) {
        console.error('自动保存失败:', error)
      }
    },

    /**
     * 删除文档
     */
    async deleteDocumentById(documentId: string): Promise<void> {
      try {
        const response = await deleteDocument(documentId)
        if (response.code === 200) {
          this.documents = this.documents.filter(d => d.documentId !== documentId)
          if (this.currentDocument?.documentId === documentId) {
            this.currentDocument = null
            this.editorContent = ''
            this.isDirty = false
          }
          // 重新加载文档树
          if (this.currentProject) {
            await this.loadDocumentTree(this.currentProject.projectId)
          }
        } else {
          this.error = response.message || '删除文档失败'
        }
      } catch (error: any) {
        console.error('删除文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      }
    },

    /**
     * 移动文档
     */
    async moveDocumentTo(documentId: string, newParentId?: string, newOrder?: number): Promise<void> {
      try {
        const response = await moveDocument(documentId, {
          newParentId,
          newOrder: newOrder || 0
        })
        if (response.code === 200) {
          // 重新加载文档树
          if (this.currentProject) {
            await this.loadDocumentTree(this.currentProject.projectId)
          }
        } else {
          this.error = response.message || '移动文档失败'
        }
      } catch (error: any) {
        console.error('移动文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      }
    },

    // ==================== 编辑器状态 ====================

    /**
     * 更新编辑器内容
     */
    updateEditorContent(content: string): void {
      this.editorContent = content
      this.isDirty = true
    },

    /**
     * 标记为已保存
     */
    markAsSaved(): void {
      this.isDirty = false
      this.lastSaved = new Date()
    },

    /**
     * 设置自动保存
     */
    setAutosave(enabled: boolean, interval?: number): void {
      this.autosaveEnabled = enabled
      if (interval !== undefined) {
        this.autosaveInterval = interval
      }
    },

    // ==================== 统计缓存 ====================

    /**
     * 缓存统计数据
     */
    cacheStatistics(key: string, data: any): void {
      this.statisticsCache[key] = {
        data,
        timestamp: Date.now()
      }
    },

    /**
     * 获取缓存的统计数据
     */
    getCachedStatistics(key: string, maxAge: number = 300000): any | null {
      const cached = this.statisticsCache[key]
      if (cached && Date.now() - cached.timestamp < maxAge) {
        return cached.data
      }
      return null
    },

    // ==================== 辅助方法 ====================

    /**
     * 清除错误信息
     */
    clearError(): void {
      this.error = null
    },

    /**
     * 重置状态
     */
    resetState(): void {
      this.projects = []
      this.currentProject = null
      this.projectsLoading = false
      this.documents = []
      this.documentTree = []
      this.currentDocument = null
      this.documentsLoading = false
      this.documentTreeLoading = false
      this.editorContent = ''
      this.editorVersion = 0
      this.isDirty = false
      this.lastSaved = null
      this.autosaveEnabled = true
      this.autosaveInterval = 30000
      this.autosaveQueue = []
      this.isSaving = false
      this.statisticsCache = {}
      this.error = null
    }
  }
})

