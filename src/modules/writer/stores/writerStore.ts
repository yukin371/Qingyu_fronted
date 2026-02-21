import { defineStore } from 'pinia'
import type { Project, Document, DocumentTreeNode } from '..'
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
  type ProjectCreateData,
  type ProjectUpdateData,
} from '..'
import type {
  Character,
  CharacterRelation,
  Location,
  LocationRelation,
  Timeline,
  TimelineEvent,
  OutlineNode,
} from '@/types/writer'
import type { ChatMessage, AIToolType, AIConfig, AIHistory } from '@/types/ai'
import { chatWithAI, continueWriting, polishText, expandText, rewriteText } from '@/modules/ai/api'
import { syncService, type SyncStatus } from '@/utils/syncService'

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

  // AI助手状态
  ai: {
    chatHistory: ChatMessage[]
    isProcessing: boolean
    lastResult: string
    sidebarVisible: boolean
    currentTool: AIToolType
    config: AIConfig
    history: AIHistory[]
    error: string | null
    selectedText: string
    agentContext: {
      characters: Character[]
      locations: Location[]
      events: TimelineEvent[]
    }
  }

  // 角色管理
  characters: {
    list: Character[]
    relations: CharacterRelation[]
    currentCharacter: Character | null
    loading: boolean
  }

  // 地点管理
  locations: {
    list: Location[]
    relations: LocationRelation[]
    tree: any[]
    currentLocation: Location | null
    loading: boolean
  }

  // 时间线管理
  timeline: {
    list: Timeline[]
    currentTimeline: Timeline | null
    events: TimelineEvent[]
    loading: boolean
    showBar: boolean
  }

  // 大纲管理
  outline: {
    nodes: OutlineNode[]
    tree: OutlineNode[]
    currentNode: OutlineNode | null
    loading: boolean
  }

  // 统计缓存
  statisticsCache: Record<string, any>

  // 同步状态
  sync: SyncStatus

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

    // AI助手状态
    ai: {
      chatHistory: [],
      isProcessing: false,
      lastResult: '',
      sidebarVisible: false,
      currentTool: 'chat',
      config: {
        continueLength: 200,
        polishStyle: 'literary',
        expandLevel: 'moderate',
        rewriteMode: 'meaning',
      },
      history: [],
      error: null,
      selectedText: '',
      agentContext: {
        characters: [],
        locations: [],
        events: [],
      },
    },

    // 角色管理
    characters: {
      list: [],
      relations: [],
      currentCharacter: null,
      loading: false,
    },

    // 地点管理
    locations: {
      list: [],
      relations: [],
      tree: [],
      currentLocation: null,
      loading: false,
    },

    // 时间线管理
    timeline: {
      list: [],
      currentTimeline: null,
      events: [],
      loading: false,
      showBar: false,
    },

    // 大纲管理
    outline: {
      nodes: [],
      tree: [],
      currentNode: null,
      loading: false,
    },

    // 统计缓存
    statisticsCache: {},

    // 同步状态
    sync: syncService.getStatus(),

    // 错误信息
    error: null,
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
     * 获取项目列表（兼容旧代码）
     */
    projectList: (state): Project[] => {
      return state.projects
    },

    /**
     * 获取加载状态（兼容旧代码）
     */
    loading: (state): boolean => {
      return state.projectsLoading
    },

    /**
     * 获取文档总数
     */
    documentCount: (state): number => {
      return state.documents.length
    },
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
        // httpService 响应拦截器会自动解包返回 data
        const response = await getProjects(params) as any
        // response 是 ProjectListResponse 类型，直接包含 projects 数组
        // 后端返回 id 字段，前端需要 projectId 字段
        if (response && response.projects) {
          this.projects = Array.isArray(response.projects)
            ? response.projects.map((p: any) => ({ ...p, projectId: p.id || p.projectId }))
            : []
        } else {
          this.projects = []
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
     * 获取项目列表（兼容旧代码的别名方法）
     */
    async fetchProjects(params?: any): Promise<Project[]> {
      await this.loadProjects(params)
      return this.projects
    },

    /**
     * 加载项目详情
     */
    async loadProject(projectId: string): Promise<void> {
      this.projectsLoading = true
      this.error = null

      try {
        // httpService 响应拦截器会自动解包返回 data
        const response = await getProjectById(projectId) as any
        // response 是 ProjectDetailResponse 类型
        // 后端返回 id 字段，前端需要 projectId 字段
        if (response && response.id) {
          this.currentProject = { ...response, projectId: response.id }
        } else {
          this.error = '加载项目失败'
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
        // httpService 响应拦截器会自动解包返回 data
        const response = await createProject(data) as any
        // response 是 ProjectDetailResponse 类型
        // 后端返回 id 字段，前端需要 projectId 字段
        if (response && response.id) {
          const projectWithId = { ...response, projectId: response.id } as Project
          this.projects.unshift(projectWithId)
          return projectWithId
        } else {
          this.error = '创建项目失败'
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
        // httpService 响应拦截器会自动解包返回 data
        const response = await updateProject(this.currentProject.projectId!, data) as any
        // response 是 ProjectDetailResponse 类型
        // 后端返回 id 字段，前端需要 projectId 字段
        if (response && response.id) {
          this.currentProject = { ...this.currentProject, ...response, projectId: response.id }
          // 更新项目列表中的项目
          const index = this.projects.findIndex(
            (p) => p.projectId === this.currentProject!.projectId
          )
          if (index !== -1) {
            this.projects[index] = this.currentProject
          }
        } else {
          this.error = '更新项目失败'
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
        await deleteProject(projectId)
        // deleteProject 返回 void，直接执行删除操作
        this.projects = this.projects.filter((p) => p.projectId !== projectId)
        if (this.currentProject?.projectId === projectId) {
          this.currentProject = null
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
        // httpService 响应拦截器会自动解包返回 data
        const response = await getDocuments(projectId, params) as any
        // response 是 { documents: Document[]; total: number } 类型
        if (response && response.documents) {
          this.documents = Array.isArray(response.documents) ? response.documents : []
        } else {
          this.documents = []
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
        // httpService 响应拦截器会自动解包返回 data
        const response = await getDocumentTree(projectId) as any
        // response 返回树形结构
        this.documentTree = response || []
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
        // httpService 响应拦截器会自动解包返回 data
        const response = await getDocumentById(documentId) as any
        // response 是 Document 类型
        if (response && response.id) {
          this.currentDocument = response
          this.editorVersion = response.version || 0
        } else {
          this.error = '加载文档失败'
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
        // httpService 响应拦截器会自动解包返回 data
        const response = await getDocumentContent(documentId) as any
        // response 是 DocumentContentResponse 类型
        if (response && response.content) {
          this.editorContent = response.content || ''
          this.isDirty = false
        } else {
          this.error = '加载文档内容失败'
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
    async createNewDocument(projectId: string, data: any): Promise<Document | null> {
      this.documentsLoading = true
      this.error = null

      try {
        // httpService 响应拦截器会自动解包返回 data
        const response = await createDocument(projectId, data) as any
        // response 是 CreateDocumentResponse 类型
        if (response && response.id) {
          const newDoc = response as Document
          this.documents.push(newDoc)
          // 重新加载文档树
          await this.loadDocumentTree(projectId)
          return newDoc
        } else {
          this.error = '创建文档失败'
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
    async updateDocumentById(documentId: string, data: any): Promise<void> {
      try {
        await updateDocument(documentId, data)
        // updateDocument 返回 void，直接更新本地状态
        if (this.currentDocument?.documentId === documentId) {
          this.currentDocument = { ...this.currentDocument, ...data }
        }
        // 更新文档列表中的文档
        const index = this.documents.findIndex((d) => d.documentId === documentId)
        if (index !== -1) {
          this.documents[index] = { ...this.documents[index], ...data }
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
        // API 期望一个对象作为 body 参数
        await (updateDocumentContent as any)(documentId, { content })
        // updateDocumentContent 返回 void，直接更新本地状态
        this.editorContent = content
        this.isDirty = false
        this.lastSaved = new Date()
        this.editorVersion = this.editorVersion + 1
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
        // httpService 响应拦截器会自动解包返回 data
        const response = await (autosaveDocument as any)(documentId, { content, version: this.editorVersion })
        // response 是 AutoSaveResponse 类型
        if (response && response.version !== undefined) {
          this.lastSaved = new Date()
          this.isDirty = false

          // 检查版本冲突
          const newVersion = response.version
          if (newVersion && newVersion !== this.editorVersion) {
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
        await deleteDocument(documentId)
        // deleteDocument 返回 void，直接更新本地状态
        this.documents = this.documents.filter((d) => d.documentId !== documentId)
        if (this.currentDocument?.documentId === documentId) {
          this.currentDocument = null
          this.editorContent = ''
          this.isDirty = false
        }
        // 重新加载文档树
        if (this.currentProject) {
          await this.loadDocumentTree(this.currentProject.projectId!)
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
    async moveDocumentTo(
      documentId: string,
      newParentId?: string,
      newOrder?: number
    ): Promise<void> {
      try {
        const response = await moveDocument(documentId, {
          newParentId,
          newOrder: newOrder || 0,
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
        timestamp: Date.now(),
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

    // ==================== AI助手功能 ====================

    /**
     * 切换AI侧边栏显示/隐藏
     */
    toggleAISidebar(visible?: boolean): void {
      if (visible !== undefined) {
        this.ai.sidebarVisible = visible
      } else {
        this.ai.sidebarVisible = !this.ai.sidebarVisible
      }
    },

    /**
     * 切换AI工具
     */
    setAITool(tool: AIToolType): void {
      this.ai.currentTool = tool
    },

    /**
     * 设置选中的文本
     */
    setSelectedText(text: string): void {
      this.ai.selectedText = text
    },

    /**
     * 发送聊天消息
     */
    async sendChatMessage(message: string): Promise<void> {
      if (!message.trim()) return

      this.ai.isProcessing = true
      this.ai.error = null

      // 添加用户消息到历史
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
      }
      this.ai.chatHistory.push(userMessage)

      try {
        const response = await chatWithAI(message, this.ai.chatHistory.slice(0, -1))

        // 添加AI回复到历史
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.reply,
          timestamp: Date.now(),
        }
        this.ai.chatHistory.push(aiMessage)
        this.ai.lastResult = response.reply

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: 'chat',
          input: message,
          output: response.reply,
          timestamp: Date.now(),
          projectId: this.currentProjectId || undefined,
          usage: response.usage,
        })
      } catch (error: any) {
        console.error('AI对话失败:', error)
        this.ai.error = error.message || '对话失败，请重试'
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * 清空聊天历史
     */
    clearChatHistory(): void {
      this.ai.chatHistory = []
      this.ai.lastResult = ''
    },

    /**
     * AI续写
     */
    async aiContinueWriting(text: string, length: number = 200): Promise<string> {
      if (!this.currentProjectId) {
        throw new Error('请先选择一个项目')
      }

      this.ai.isProcessing = true
      this.ai.error = null

      try {
        const response = await continueWriting(this.currentProjectId, text, length)
        const result = response.generated_text || ''
        this.ai.lastResult = result

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: 'continue',
          input: text,
          output: result,
          timestamp: Date.now(),
          projectId: this.currentProjectId,
          usage: response.usage,
        })

        return result
      } catch (error: any) {
        console.error('AI续写失败:', error)
        this.ai.error = error.message || '续写失败，请重试'
        throw error
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * AI润色
     */
    async aiPolishText(text: string, instructions?: string): Promise<string> {
      if (!this.currentProjectId) {
        throw new Error('请先选择一个项目')
      }

      this.ai.isProcessing = true
      this.ai.error = null

      try {
        const response = await polishText(this.currentProjectId, text, instructions)
        const result = response.polished_text || response.rewritten_text || ''
        this.ai.lastResult = result

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: 'polish',
          input: text,
          output: result,
          timestamp: Date.now(),
          projectId: this.currentProjectId,
          usage: response.usage,
        })

        return result
      } catch (error: any) {
        console.error('AI润色失败:', error)
        this.ai.error = error.message || '润色失败，请重试'
        throw error
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * AI扩写
     */
    async aiExpandText(
      text: string,
      instructions?: string,
      targetLength?: number
    ): Promise<string> {
      if (!this.currentProjectId) {
        throw new Error('请先选择一个项目')
      }

      this.ai.isProcessing = true
      this.ai.error = null

      try {
        const response = await expandText(this.currentProjectId, text, instructions, targetLength)
        const result = response.expanded_text || response.rewritten_text || ''
        this.ai.lastResult = result

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: 'expand',
          input: text,
          output: result,
          timestamp: Date.now(),
          projectId: this.currentProjectId,
          usage: response.usage,
        })

        return result
      } catch (error: any) {
        console.error('AI扩写失败:', error)
        this.ai.error = error.message || '扩写失败，请重试'
        throw error
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * AI改写
     */
    async aiRewriteText(
      text: string,
      mode: 'polish' | 'simplify' | 'formal' | 'casual',
      instructions?: string
    ): Promise<string> {
      if (!this.currentProjectId) {
        throw new Error('请先选择一个项目')
      }

      this.ai.isProcessing = true
      this.ai.error = null

      try {
        const response = await rewriteText(this.currentProjectId, text, mode, instructions)
        const result = response.rewritten_text || response.polished_text || ''
        this.ai.lastResult = result

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: 'rewrite',
          input: text,
          output: result,
          timestamp: Date.now(),
          projectId: this.currentProjectId,
          usage: response.usage,
        })

        return result
      } catch (error: any) {
        console.error('AI改写失败:', error)
        this.ai.error = error.message || '改写失败，请重试'
        throw error
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * 插入生成的内容到编辑器
     */
    insertGeneratedText(text: string): void {
      // 这个方法将由编辑器组件调用来插入文本
      // 实际插入逻辑在编辑器组件中实现
      this.ai.lastResult = text
    },

    /**
     * 清除AI错误
     */
    clearAIError(): void {
      this.ai.error = null
    },

    // ==================== 辅助方法 ====================

    /**
     * 清除错误信息
     */
    clearError(): void {
      this.error = null
    },

    // ==================== 角色管理 ====================

    /**
     * 加载角色列表
     */
    async loadCharacters(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      if (!pid) return

      this.characters.loading = true
      try {
        const { listCharacters } = await import('..')
        this.characters.list = await listCharacters(pid)
      } catch (error: any) {
        console.error('加载角色列表失败:', error)
        this.error = error.message
      } finally {
        this.characters.loading = false
      }
    },

    /**
     * 加载角色关系
     */
    async loadCharacterRelations(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      if (!pid) return

      try {
        const { listCharacterRelations } = await import('..')
        this.characters.relations = await listCharacterRelations(pid)
      } catch (error: any) {
        console.error('加载角色关系失败:', error)
      }
    },

    /**
     * 设置当前角色
     */
    setCurrentCharacter(character: Character | null): void {
      this.characters.currentCharacter = character
    },

    // ==================== 地点管理 ====================

    /**
     * 加载地点列表
     */
    async loadLocations(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      if (!pid) return

      this.locations.loading = true
      try {
        const { listLocations } = await import('..')
        this.locations.list = await listLocations(pid)
      } catch (error: any) {
        console.error('加载地点列表失败:', error)
        this.error = error.message
      } finally {
        this.locations.loading = false
      }
    },

    /**
     * 加载地点树
     */
    async loadLocationTree(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      if (!pid) return

      try {
        const { getLocationTree } = await import('..')
        this.locations.tree = await getLocationTree(pid)
      } catch (error: any) {
        console.error('加载地点树失败:', error)
      }
    },

    /**
     * 设置当前地点
     */
    setCurrentLocation(location: Location | null): void {
      this.locations.currentLocation = location
    },

    // ==================== 时间线管理 ====================

    /**
     * 加载时间线列表
     */
    async loadTimelines(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      if (!pid) return

      this.timeline.loading = true
      try {
        const { listTimelines } = await import('..')
        this.timeline.list = await listTimelines(pid)
        // 默认选择第一个时间线
        if (this.timeline.list.length > 0 && !this.timeline.currentTimeline) {
          this.timeline.currentTimeline = this.timeline.list[0]
        }
      } catch (error: any) {
        console.error('加载时间线列表失败:', error)
        this.error = error.message
      } finally {
        this.timeline.loading = false
      }
    },

    /**
     * 加载时间线事件
     */
    async loadTimelineEvents(timelineId?: string): Promise<void> {
      const tid = timelineId || this.timeline.currentTimeline?.id
      if (!tid) return

      try {
        const { listTimelineEvents } = await import('..')
        this.timeline.events = await listTimelineEvents(tid)
      } catch (error: any) {
        console.error('加载时间线事件失败:', error)
      }
    },

    /**
     * 切换时间线显示
     */
    toggleTimelineBar(show?: boolean): void {
      this.timeline.showBar = show !== undefined ? show : !this.timeline.showBar
    },

    /**
     * 设置当前时间线
     */
    setCurrentTimeline(timeline: Timeline | null): void {
      this.timeline.currentTimeline = timeline
      if (timeline) {
        this.loadTimelineEvents(timeline.id)
      }
    },

    // ==================== 大纲管理 ====================

    /**
     * 加载大纲树
     */
    async loadOutlineTree(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      if (!pid) return

      this.outline.loading = true
      try {
        const { getOutlineTree } = await import('..')
        this.outline.tree = await getOutlineTree(pid)
      } catch (error: any) {
        console.error('加载大纲树失败:', error)
        this.error = error.message
      } finally {
        this.outline.loading = false
      }
    },

    /**
     * 设置当前大纲节点
     */
    setCurrentOutlineNode(node: OutlineNode | null): void {
      this.outline.currentNode = node
    },

    /**
     * 创建大纲节点
     */
    async createOutlineNode(projectId: string, nodeData: any): Promise<OutlineNode> {
      try {
        // TODO: 调用后端API创建节点
        // const response = await apiClient.post(`/projects/${projectId}/outline`, nodeData)
        // return response.data
        console.log('创建大纲节点:', projectId, nodeData)
        await this.loadOutlineTree(projectId)
        return {} as OutlineNode
      } catch (error: any) {
        console.error('创建大纲节点失败:', error)
        throw error
      }
    },

    /**
     * 更新大纲节点
     */
    async updateOutlineNode(
      nodeId: string,
      projectId: string,
      nodeData: any
    ): Promise<OutlineNode> {
      try {
        // TODO: 调用后端API更新节点
        // const response = await apiClient.put(`/projects/${projectId}/outline/${nodeId}`, nodeData)
        // return response.data
        console.log('更新大纲节点:', nodeId, nodeData)
        await this.loadOutlineTree(projectId)
        return {} as OutlineNode
      } catch (error: any) {
        console.error('更新大纲节点失败:', error)
        throw error
      }
    },

    /**
     * 删除大纲节点
     */
    async deleteOutlineNode(nodeId: string, projectId: string): Promise<void> {
      try {
        // TODO: 调用后端API删除节点
        // await apiClient.delete(`/projects/${projectId}/outline/${nodeId}`)
        console.log('删除大纲节点:', nodeId)
        await this.loadOutlineTree(projectId)
      } catch (error: any) {
        console.error('删除大纲节点失败:', error)
        throw error
      }
    },

    // ==================== AI Agent 上下文 ====================

    /**
     * 更新 AI Agent 上下文
     */
    async updateAgentContext(): Promise<void> {
      if (!this.currentProjectId) return

      try {
        // 加载相关角色
        await this.loadCharacters()
        this.ai.agentContext.characters = this.characters.list.slice(0, 10) // 限制数量

        // 加载相关地点
        await this.loadLocations()
        this.ai.agentContext.locations = this.locations.list.slice(0, 10)

        // 加载时间线事件
        if (this.timeline.currentTimeline) {
          await this.loadTimelineEvents()
          this.ai.agentContext.events = this.timeline.events.slice(0, 20)
        }
      } catch (error: any) {
        console.error('更新AI上下文失败:', error)
      }
    },

    // ==================== 同步管理 ====================

    /**
     * 初始化同步服务
     */
    initSyncService(): void {
      // 注册同步回调 - 网络恢复时刷新项目列表
      syncService.onSync(async () => {
        console.log('[WriterStore] 执行同步回调')
        await this.loadProjects()
      })

      // 监听同步状态变化
      syncService.onStatusChange((status) => {
        this.sync = status
      })

      // 启动健康检查
      syncService.startHealthCheck()

      console.log('[WriterStore] 同步服务已初始化')
    },

    /**
     * 停止同步服务
     */
    stopSyncService(): void {
      syncService.stopHealthCheck()
      console.log('[WriterStore] 同步服务已停止')
    },

    /**
     * 手动触发同步
     */
    async syncNow(): Promise<void> {
      await syncService.syncNow()
    },

    /**
     * 检查是否在线
     */
    isOnline(): boolean {
      return this.sync.isOnline
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
      this.ai = {
        chatHistory: [],
        isProcessing: false,
        lastResult: '',
        sidebarVisible: false,
        currentTool: 'chat',
        config: {
          continueLength: 200,
          polishStyle: 'literary',
          expandLevel: 'moderate',
          rewriteMode: 'meaning',
        },
        history: [],
        error: null,
        selectedText: '',
        agentContext: {
          characters: [],
          locations: [],
          events: [],
        },
      }
      this.characters = {
        list: [],
        relations: [],
        currentCharacter: null,
        loading: false,
      }
      this.locations = {
        list: [],
        relations: [],
        tree: [],
        currentLocation: null,
        loading: false,
      }
      this.timeline = {
        list: [],
        currentTimeline: null,
        events: [],
        loading: false,
        showBar: false,
      }
      this.outline = {
        nodes: [],
        tree: [],
        currentNode: null,
        loading: false,
      }
      this.statisticsCache = {}
      this.sync = syncService.getStatus()
      this.error = null
    },
  },
})
