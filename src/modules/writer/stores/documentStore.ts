import { defineStore } from 'pinia'
import { ref } from 'vue'
import { documentApi } from '../api/document'
import type { Document, CreateDocumentRequest } from '../types/document'

export const useDocumentStore = defineStore('writer-document', () => {
  // State
  const tree = ref<Document[]>([])
  const flatDocs = ref<Document[]>([]) // 扁平列表，用于搜索
  const currentDocMeta = ref<Document | null>(null) // 仅元数据
  const loading = ref(false)

  // Actions
  async function loadTree(projectId: string) {
    loading.value = true
    try {
      // 假设后端返回的就是 Document[] 树结构
      tree.value = await documentApi.getTree(projectId)
    } finally {
      loading.value = false
    }
  }

  async function selectDocument(doc: Document) {
    currentDocMeta.value = doc
  }

  async function create(projectId: string, data: CreateDocumentRequest) {
    const newDoc = await documentApi.create(projectId, data)
    await loadTree(projectId) // 刷新树
    return newDoc
  }

  async function move(documentId: string, parentId?: string, order?: number) {
    await documentApi.move(documentId, { parentId, order })
    // 如果有 projectId，建议刷新树；或者在前端手动移动节点以优化体验
    // 这里简单起见先刷新
    if (currentDocMeta.value?.projectId) {
      await loadTree(currentDocMeta.value.projectId)
    }
  }

  async function remove(documentId: string) {
    await documentApi.delete(documentId)
    // 刷新逻辑...
    if (currentDocMeta.value?.id === documentId) {
      currentDocMeta.value = null
    }
  }

  return {
    tree,
    currentDocMeta,
    loading,
    loadTree,
    selectDocument,
    create,
    move,
    remove,
  }
})
