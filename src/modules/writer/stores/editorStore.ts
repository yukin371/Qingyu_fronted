import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { editorApi } from '../api/editor'
import { useDocumentStore } from './documentStore' // 引用其他 Store
import { debounce } from '@/utils/editor'
import { ElMessage, ElMessageBox } from 'element-plus'

export const useEditorStore = defineStore('writer-editor', () => {
  const documentStore = useDocumentStore()

  // State
  const content = ref('')
  const version = ref(0)
  const isDirty = ref(false) // 是否有未保存修改
  const isSaving = ref(false) // 是否正在保存
  const lastSavedAt = ref<string | null>(null)

  // Settings
  const autosaveEnabled = ref(true)

  // 1. 加载内容
  async function loadContent(documentId: string) {
    // 先重置状态
    content.value = ''
    isDirty.value = false

    try {
      const res = await editorApi.getContent(documentId)
      content.value = res.content
      version.value = res.version
      lastSavedAt.value = res.lastSavedAt
    } catch (e) {
      console.error('Failed to load content', e)
    }
  }

  // 2. 更新内容 (用户输入)
  function setContent(newContent: string) {
    content.value = newContent
    isDirty.value = true

    if (autosaveEnabled.value) {
      debouncedAutoSave()
    }
  }

  // 3. 自动保存逻辑 (防抖)
  const debouncedAutoSave = debounce(async () => {
    if (!isDirty.value || !documentStore.currentDocMeta?.id) return
    await performSave(true)
  }, 5000)

  // 4. 执行保存 (内部方法)
  async function performSave(isAuto: boolean) {
    const docId = documentStore.currentDocMeta?.id
    if (!docId) return

    isSaving.value = true
    try {
      const res = await editorApi.autoSave(docId, {
        documentId: docId,
        content: content.value,
        version: version.value,
      })

      // 更新版本和时间
      version.value = res.version
      lastSavedAt.value = res.lastSavedAt
      isDirty.value = false

      if (!isAuto) ElMessage.success('保存成功')
    } catch (error: any) {
      if (error.response?.status === 409 || error.code === 409) {
        handleConflict()
      } else {
        console.error('Save failed', error)
        // 自动保存失败通常只记录日志或显示不打扰的提示
      }
    } finally {
      isSaving.value = false
    }
  }

  // 5. 冲突处理
  function handleConflict() {
    ElMessageBox.confirm('云端版本比本地新，是否覆盖云端？', '版本冲突', {
      confirmButtonText: '强制覆盖',
      cancelButtonText: '刷新获取最新',
      type: 'warning',
    })
      .then(async () => {
        // 强制保存逻辑：通常需要传一个 force 标记，或者获取最新版本号后再提交
        // 这里简化处理
        await editorApi.updateContent(documentStore.currentDocMeta!.id, {
          documentId: documentStore.currentDocMeta!.id,
          content: content.value,
          version: version.value, // 实际场景这里可能需要特殊处理
        })
        isDirty.value = false
      })
      .catch(() => {
        // 重新加载
        if (documentStore.currentDocMeta?.id) {
          loadContent(documentStore.currentDocMeta.id)
        }
      })
  }

  return {
    content,
    version,
    isDirty,
    isSaving,
    lastSavedAt,
    loadContent,
    setContent,
    save: () => performSave(false), // 手动保存
  }
})
