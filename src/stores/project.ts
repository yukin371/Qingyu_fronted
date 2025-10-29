import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDocuments,
  getDocumentTree,
  createDocument,
  updateDocument,
  deleteDocument,
  moveDocument,
  getDocumentById,
  getDocumentContent,
  updateDocumentContent,
  autosaveDocument,
  type Document,
  type DocumentTreeNode,
  type DocumentCreateData,
  type DocumentUpdateData,
  type DocumentMoveData
} from '@/modules/writer/api/documents'
import { ElMessage } from 'element-plus'

/**
 * 项目详情状态管理（文档管理）
 */
export const useProjectStore = defineStore('project', () => {
  // 状态
  const documents = ref<Document[]>([])
  const documentTree = ref<DocumentTreeNode[]>([])
  const currentDocument = ref<Document | null>(null)
  const currentProjectId = ref<string>('')
  const loading = ref(false)

  // 编辑器状态
  const editorContent = ref('')
  const isSaving = ref(false)
  const lastSaved = ref<Date | null>(null)
  const hasUnsavedChanges = ref(false)

  // 计算属性
  const documentList = computed(() => documents.value)
  const hasDocuments = computed(() => documents.value.length > 0)
  const currentDocumentId = computed(() => currentDocument.value?.documentId || '')

  // 设置当前项目
  const setCurrentProject = (projectId: string) => {
    currentProjectId.value = projectId
  }

  // 获取文档列表
  const fetchDocuments = async (projectId: string, params?: { page?: number; pageSize?: number }) => {
    loading.value = true
    try {
      const response = await getDocuments(projectId, params)
      if (response.code === 200) {
        documents.value = response.data || []
      }
      return response
    } catch (error: any) {
      console.error('获取文档列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取文档树
  const fetchDocumentTree = async (projectId: string) => {
    loading.value = true
    try {
      const response = await getDocumentTree(projectId)
      if (response.code === 200) {
        documentTree.value = response.data || []
      }
      return response
    } catch (error: any) {
      console.error('获取文档树失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建文档
  const createNewDocument = async (projectId: string, data: DocumentCreateData) => {
    try {
      const response = await createDocument(projectId, data)
      if (response.code === 200 && response.data) {
        documents.value.push(response.data)
        ElMessage.success('文档创建成功')

        // 重新加载文档树
        await fetchDocumentTree(projectId)

        return response.data
      }
      return null
    } catch (error: any) {
      console.error('创建文档失败:', error)
      throw error
    }
  }

  // 加载文档详情
  const loadDocument = async (documentId: string) => {
    loading.value = true
    try {
      const response = await getDocumentById(documentId)
      if (response.code === 200 && response.data) {
        currentDocument.value = response.data

        // 加载文档内容
        const contentResponse = await getDocumentContent(documentId)
        if (contentResponse.code === 200) {
          editorContent.value = contentResponse.data?.content || ''
          hasUnsavedChanges.value = false
        }

        return response.data
      }
      return null
    } catch (error: any) {
      console.error('加载文档失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新文档
  const updateDocumentData = async (documentId: string, data: DocumentUpdateData) => {
    try {
      const response = await updateDocument(documentId, data)
      if (response.code === 200 && response.data) {
        // 更新列表中的文档
        const index = documents.value.findIndex(d => d.documentId === documentId)
        if (index !== -1) {
          documents.value[index] = response.data
        }

        // 更新当前文档
        if (currentDocument.value?.documentId === documentId) {
          currentDocument.value = response.data
        }

        ElMessage.success('文档更新成功')
        return response.data
      }
      return null
    } catch (error: any) {
      console.error('更新文档失败:', error)
      throw error
    }
  }

  // 保存文档内容
  const saveDocumentContent = async (documentId: string, content: string) => {
    isSaving.value = true
    try {
      const response = await updateDocumentContent(documentId, content)
      if (response.code === 200) {
        editorContent.value = content
        lastSaved.value = new Date()
        hasUnsavedChanges.value = false
        ElMessage.success('保存成功')
        return true
      }
      return false
    } catch (error: any) {
      console.error('保存文档内容失败:', error)
      ElMessage.error('保存失败')
      throw error
    } finally {
      isSaving.value = false
    }
  }

  // 自动保存
  const autoSave = async (documentId: string, content: string, version: number) => {
    try {
      await autosaveDocument(documentId, content, version)
      lastSaved.value = new Date()
      console.log('自动保存成功')
    } catch (error: any) {
      console.error('自动保存失败:', error)
    }
  }

  // 删除文档
  const deleteDocumentById = async (documentId: string) => {
    try {
      const response = await deleteDocument(documentId)
      if (response.code === 200) {
        // 从列表中移除
        documents.value = documents.value.filter(d => d.documentId !== documentId)

        // 如果删除的是当前文档，清空当前文档
        if (currentDocument.value?.documentId === documentId) {
          currentDocument.value = null
          editorContent.value = ''
        }

        ElMessage.success('文档删除成功')

        // 重新加载文档树
        if (currentProjectId.value) {
          await fetchDocumentTree(currentProjectId.value)
        }

        return true
      }
      return false
    } catch (error: any) {
      console.error('删除文档失败:', error)
      throw error
    }
  }

  // 移动文档
  const moveDocumentTo = async (documentId: string, data: DocumentMoveData) => {
    try {
      const response = await moveDocument(documentId, data)
      if (response.code === 200) {
        ElMessage.success('文档移动成功')

        // 重新加载文档树
        if (currentProjectId.value) {
          await fetchDocumentTree(currentProjectId.value)
        }

        return true
      }
      return false
    } catch (error: any) {
      console.error('移动文档失败:', error)
      throw error
    }
  }

  // 更新编辑器内容
  const updateEditorContent = (content: string) => {
    editorContent.value = content
    hasUnsavedChanges.value = true
  }

  // 清空状态
  const clearState = () => {
    documents.value = []
    documentTree.value = []
    currentDocument.value = null
    currentProjectId.value = ''
    editorContent.value = ''
    hasUnsavedChanges.value = false
    lastSaved.value = null
  }

  // 清空编辑器
  const clearEditor = () => {
    currentDocument.value = null
    editorContent.value = ''
    hasUnsavedChanges.value = false
    lastSaved.value = null
  }

  return {
    // 状态
    documents,
    documentTree,
    currentDocument,
    currentProjectId,
    loading,
    editorContent,
    isSaving,
    lastSaved,
    hasUnsavedChanges,

    // 计算属性
    documentList,
    hasDocuments,
    currentDocumentId,

    // 方法
    setCurrentProject,
    fetchDocuments,
    fetchDocumentTree,
    createNewDocument,
    loadDocument,
    updateDocumentData,
    saveDocumentContent,
    autoSave,
    deleteDocumentById,
    moveDocumentTo,
    updateEditorContent,
    clearState,
    clearEditor
  }
})

