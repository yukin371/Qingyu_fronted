/**
 * Project Store - 项目状态管理
 * 支持在线模式（API）和离线模式（IndexedDB）
 */

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
import {
  getLocalDocuments,
  getLocalDocument,
  createLocalDocument,
  updateLocalDocument,
  updateLocalDocumentContent,
  deleteLocalDocument,
  getLocalDocumentTree
} from '@/utils/localStorageAPI'
import { useWriterStore } from './writer'
import { ElMessage } from 'element-plus'

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

  // 获取 writer store 的存储模式
  const writerStore = useWriterStore()
  const isOfflineMode = computed(() => writerStore.storageMode === 'offline')

  // 设置当前项目
  const setCurrentProject = (projectId: string) => {
    currentProjectId.value = projectId
  }

  // 获取文档列表
  const fetchDocuments = async (projectId: string, params?: { page?: number; pageSize?: number }) => {
    loading.value = true
    try {
      if (isOfflineMode.value) {
        // 离线模式：使用 IndexedDB
        const localDocs = await getLocalDocuments(projectId)
        documents.value = localDocs as any[]
        console.log('📦 从本地存储加载文档:', localDocs.length, '个')
        return { code: 200, data: localDocs }
      } else {
        // 在线模式：使用 API
        const response = await getDocuments(projectId, params)
        if (response.code === 200) {
          documents.value = response.data || []
        }
        return response
      }
    } catch (error: any) {
      console.error('获取文档列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取文档树
  const fetchDocumentTree = async (projectId: string) => {
    try {
      if (isOfflineMode.value) {
        // 离线模式：使用 IndexedDB
        const localTree = await getLocalDocumentTree(projectId)
        documentTree.value = localTree
        return { code: 200, data: localTree }
      } else {
        // 在线模式：使用 API
        const response = await getDocumentTree(projectId)
        if (response.code === 200) {
          documentTree.value = response.data || []
        }
        return response
      }
    } catch (error: any) {
      console.error('获取文档树失败:', error)
      throw error
    }
  }

  // 创建文档
  const createNewDocument = async (projectId: string, data: DocumentCreateData) => {
    try {
      if (isOfflineMode.value) {
        // 离线模式：使用 IndexedDB
        const doc = await createLocalDocument({
          projectId,
          title: data.title,
          chapterNum: data.chapterNum
        })
        documents.value.push(doc as any)
        ElMessage.success('文档创建成功（本地存储）')
        
        // 刷新文档树
        await fetchDocumentTree(projectId)
        
        return doc as any
      } else {
        // 在线模式：使用 API
        const response = await createDocument(projectId, data)
        if (response.code === 200 && response.data) {
          documents.value.push(response.data)
          ElMessage.success('文档创建成功')
          
          // 刷新文档树
          await fetchDocumentTree(projectId)
          
          return response.data
        }
        return null
      }
    } catch (error: any) {
      console.error('创建文档失败:', error)
      throw error
    }
  }

  // 加载文档详情和内容
  const loadDocument = async (documentId: string) => {
    loading.value = true
    try {
      if (isOfflineMode.value) {
        // 离线模式：使用 IndexedDB
        const doc = await getLocalDocument(documentId)
        if (doc) {
          currentDocument.value = doc as any
          editorContent.value = doc.content || ''
          hasUnsavedChanges.value = false
          console.log('📦 从本地存储加载文档:', doc.title)
          return doc as any
        }
        return null
      } else {
        // 在线模式：使用 API
        const response = await getDocumentById(documentId)
        if (response.code === 200 && response.data) {
          currentDocument.value = response.data

          // 获取文档内容
          const contentResponse = await getDocumentContent(documentId)
          if (contentResponse.code === 200) {
            editorContent.value = contentResponse.data?.content || ''
            hasUnsavedChanges.value = false
          }

          return response.data
        }
        return null
      }
    } catch (error: any) {
      console.error('加载文档失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新文档数据（标题等）
  const updateDocumentData = async (documentId: string, data: DocumentUpdateData) => {
    try {
      if (isOfflineMode.value) {
        // 离线模式：使用 IndexedDB
        const updatedDoc = await updateLocalDocument(documentId, data)
        
        // 更新列表中的文档
        const index = documents.value.findIndex(d => d.documentId === documentId)
        if (index !== -1) {
          documents.value[index] = updatedDoc as any
        }

        // 更新当前文档
        if (currentDocument.value?.documentId === documentId) {
          currentDocument.value = updatedDoc as any
        }

        ElMessage.success('文档更新成功（本地存储）')
        
        // 刷新文档树
        if (currentProjectId.value) {
          await fetchDocumentTree(currentProjectId.value)
        }
        
        return updatedDoc as any
      } else {
        // 在线模式：使用 API
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
          
          // 刷新文档树
          if (currentProjectId.value) {
            await fetchDocumentTree(currentProjectId.value)
          }
          
          return response.data
        }
        return null
      }
    } catch (error: any) {
      console.error('更新文档失败:', error)
      throw error
    }
  }

  // 保存文档内容
  const saveDocumentContent = async (documentId: string, content: string) => {
    isSaving.value = true
    try {
      if (isOfflineMode.value) {
        // 离线模式：使用 IndexedDB
        await updateLocalDocumentContent(documentId, content)
        editorContent.value = content
        lastSaved.value = new Date()
        hasUnsavedChanges.value = false
        ElMessage.success('保存成功（本地存储）')
        return true
      } else {
        // 在线模式：使用 API
        const response = await updateDocumentContent(documentId, content)
        if (response.code === 200) {
          editorContent.value = content
          lastSaved.value = new Date()
          hasUnsavedChanges.value = false
          ElMessage.success('保存成功')
          return true
        }
        return false
      }
    } catch (error: any) {
      console.error('保存文档内容失败:', error)
      ElMessage.error('保存失败')
      throw error
    } finally {
      isSaving.value = false
    }
  }

  // 自动保存
  const autoSave = async (documentId: string, content: string, version: number = 1) => {
    try {
      if (isOfflineMode.value) {
        // 离线模式：使用 IndexedDB
        await updateLocalDocumentContent(documentId, content)
        lastSaved.value = new Date()
        hasUnsavedChanges.value = false
        console.log('📦 自动保存成功（本地存储）')
      } else {
        // 在线模式：使用 API
        await autosaveDocument(documentId, content, version)
        lastSaved.value = new Date()
        hasUnsavedChanges.value = false
        console.log('自动保存成功')
      }
    } catch (error: any) {
      console.error('自动保存失败:', error)
    }
  }

  // 删除文档
  const deleteDocumentById = async (documentId: string) => {
    try {
      if (isOfflineMode.value) {
        // 离线模式：使用 IndexedDB
        await deleteLocalDocument(documentId)
        
        // 从列表中移除
        documents.value = documents.value.filter(d => d.documentId !== documentId)

        // 如果删除的是当前文档，清空
        if (currentDocument.value?.documentId === documentId) {
          currentDocument.value = null
          editorContent.value = ''
          hasUnsavedChanges.value = false
        }

        ElMessage.success('文档删除成功（本地存储）')
        
        // 刷新文档树
        if (currentProjectId.value) {
          await fetchDocumentTree(currentProjectId.value)
        }
        
        return true
      } else {
        // 在线模式：使用 API
        const response = await deleteDocument(documentId)
        if (response.code === 200) {
          // 从列表中移除
          documents.value = documents.value.filter(d => d.documentId !== documentId)

          // 如果删除的是当前文档，清空
          if (currentDocument.value?.documentId === documentId) {
            currentDocument.value = null
            editorContent.value = ''
            hasUnsavedChanges.value = false
          }

          ElMessage.success('文档删除成功')
          
          // 刷新文档树
          if (currentProjectId.value) {
            await fetchDocumentTree(currentProjectId.value)
          }
          
          return true
        }
        return false
      }
    } catch (error: any) {
      console.error('删除文档失败:', error)
      throw error
    }
  }

  // 移动文档（仅在线模式支持）
  const moveDocumentTo = async (documentId: string, data: DocumentMoveData) => {
    if (isOfflineMode.value) {
      ElMessage.warning('离线模式不支持移动文档')
      return false
    }

    try {
      const response = await moveDocument(documentId, data)
      if (response.code === 200) {
        ElMessage.success('文档移动成功')
        
        // 刷新文档树
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

  // 更新编辑器内容（用于v-model双向绑定）
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

  // 清空编辑器相关状态
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

    // 编辑器状态
    editorContent,
    isSaving,
    lastSaved,
    hasUnsavedChanges,

    // 计算属性
    documentList,
    hasDocuments,
    currentDocumentId,
    isOfflineMode,

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
