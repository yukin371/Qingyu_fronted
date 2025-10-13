import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Writer 模块状态管理（Pinia v3）
 * 管理项目、文档、编辑状态
 */
export const useWriterStore = defineStore('writer', () => {
  // ==================== State ====================

  // 当前项目
  const currentProject = ref(null)

  // 当前文档
  const currentDocument = ref(null)

  // 项目列表
  const projects = ref([])

  // 文档列表（当前项目的）
  const documents = ref([])

  // 编辑器设置
  const editorSettings = ref({
    fontSize: 16,
    fontFamily: 'Consolas, Monaco, monospace',
    lineHeight: 1.7,
    autoSave: true,
    autoSaveInterval: 1500, // ms
    theme: 'light'
  })

  // ==================== Getters ====================

  const projectList = computed(() => projects.value)

  const documentList = computed(() => documents.value)

  const currentProjectId = computed(() => currentProject.value?.id)

  const currentDocumentId = computed(() => currentDocument.value?.id)

  const hasProject = computed(() => !!currentProject.value)

  const hasDocument = computed(() => !!currentDocument.value)

  // ==================== Actions ====================

  /**
   * 加载项目列表（POC: 从 localStorage）
   */
  const loadProjects = async () => {
    try {
      const stored = localStorage.getItem('writer_projects')
      if (stored) {
        projects.value = JSON.parse(stored)
      } else {
        // 初始化示例项目
        projects.value = [
          {
            id: 'project-1',
            name: '我的第一部小说',
            description: '这是一个示例项目',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        saveProjects()
      }
    } catch (error) {
      console.error('加载项目失败:', error)
      projects.value = []
    }
  }

  /**
   * 保存项目列表到 localStorage
   */
  const saveProjects = () => {
    try {
      localStorage.setItem('writer_projects', JSON.stringify(projects.value))
    } catch (error) {
      console.error('保存项目失败:', error)
    }
  }

  /**
   * 创建新项目
   */
  const createProject = async (projectData) => {
    const newProject = {
      id: `project-${Date.now()}`,
      name: projectData.name || '未命名项目',
      description: projectData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    projects.value.push(newProject)
    saveProjects()

    return newProject
  }

  /**
   * 删除项目
   */
  const deleteProject = async (projectId) => {
    projects.value = projects.value.filter(p => p.id !== projectId)
    saveProjects()

    // 清理相关文档
    const docKey = `writer_documents_${projectId}`
    localStorage.removeItem(docKey)
  }

  /**
   * 设置当前项目
   */
  const setCurrentProject = async (projectId) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      currentProject.value = project
      await loadDocuments(projectId)
    } else {
      console.error('项目不存在:', projectId)
    }
  }

  /**
   * 加载文档列表
   */
  const loadDocuments = async (projectId) => {
    try {
      const key = `writer_documents_${projectId}`
      const stored = localStorage.getItem(key)
      if (stored) {
        documents.value = JSON.parse(stored)
      } else {
        // 初始化示例文档
        documents.value = [
          {
            id: 'doc-1',
            projectId: projectId,
            title: '第一章',
            content: '# 第一章\n\n开始你的故事...',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        saveDocuments(projectId)
      }
    } catch (error) {
      console.error('加载文档失败:', error)
      documents.value = []
    }
  }

  /**
   * 保存文档列表
   */
  const saveDocuments = (projectId) => {
    try {
      const key = `writer_documents_${projectId || currentProjectId.value}`
      localStorage.setItem(key, JSON.stringify(documents.value))
    } catch (error) {
      console.error('保存文档失败:', error)
    }
  }

  /**
   * 创建新文档
   */
  const createDocument = async (documentData) => {
    if (!currentProjectId.value) {
      throw new Error('请先选择一个项目')
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      projectId: currentProjectId.value,
      title: documentData.title || '未命名文档',
      content: documentData.content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    documents.value.push(newDoc)
    saveDocuments(currentProjectId.value)

    return newDoc
  }

  /**
   * 更新文档内容
   */
  const updateDocument = async (documentId, updates) => {
    const doc = documents.value.find(d => d.id === documentId)
    if (doc) {
      Object.assign(doc, updates, {
        updatedAt: new Date().toISOString()
      })
      saveDocuments(currentProjectId.value)

      // 如果是当前文档，同步更新
      if (currentDocument.value?.id === documentId) {
        currentDocument.value = { ...doc }
      }
    }
  }

  /**
   * 删除文档
   */
  const deleteDocument = async (documentId) => {
    documents.value = documents.value.filter(d => d.id !== documentId)
    saveDocuments(currentProjectId.value)

    if (currentDocument.value?.id === documentId) {
      currentDocument.value = null
    }
  }

  /**
   * 设置当前文档
   */
  const setCurrentDocument = async (documentId) => {
    const doc = documents.value.find(d => d.id === documentId)
    if (doc) {
      currentDocument.value = doc
    } else {
      console.error('文档不存在:', documentId)
    }
  }

  /**
   * 保存编辑器设置
   */
  const saveEditorSettings = (settings) => {
    Object.assign(editorSettings.value, settings)
    localStorage.setItem('writer_editor_settings', JSON.stringify(editorSettings.value))
  }

  /**
   * 加载编辑器设置
   */
  const loadEditorSettings = () => {
    try {
      const stored = localStorage.getItem('writer_editor_settings')
      if (stored) {
        Object.assign(editorSettings.value, JSON.parse(stored))
      }
    } catch (error) {
      console.error('加载编辑器设置失败:', error)
    }
  }

  /**
   * 重置状态
   */
  const reset = () => {
    currentProject.value = null
    currentDocument.value = null
    projects.value = []
    documents.value = []
  }

  // ==================== 返回 Store ====================

  return {
    // State
    currentProject,
    currentDocument,
    projects,
    documents,
    editorSettings,

    // Getters
    projectList,
    documentList,
    currentProjectId,
    currentDocumentId,
    hasProject,
    hasDocument,

    // Actions
    loadProjects,
    createProject,
    deleteProject,
    setCurrentProject,
    loadDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    setCurrentDocument,
    saveEditorSettings,
    loadEditorSettings,
    reset
  }
})

