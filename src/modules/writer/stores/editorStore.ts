import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ParagraphContent } from '@/modules/writer/api/wrapper'
import type { DocumentContent } from '@/modules/writer/types/document'

/**
 * 工具切换类型
 */
export type ActiveTool = 'chapters' | 'writing' | 'immersive' | 'ai' | 'encyclopedia'

/**
 * 编辑器状态接口
 */
export interface EditorState {
  currentProjectId: string | null
  currentChapterId: string | null
  content: string
  isDirty: boolean
  lastSavedAt: number | null
  activeTool: ActiveTool
}

/**
 * 编辑器管理 Store
 * 负责编辑器的核心状态管理
 */
export const useEditorStore = defineStore('writer-editor', () => {
  // ==================== State ====================

  /** 当前项目ID */
  const currentProjectId = ref<string | null>(null)

  /** 当前章节ID */
  const currentChapterId = ref<string | null>(null)

  /** 当前编辑内容 */
  const content = ref('')

  /** 是否有未保存更改 */
  const isDirty = ref(false)

  /** 上次保存时间（时间戳） */
  const lastSavedAt = ref<number | null>(null)

  /** 当前激活的工具/模式 */
  const activeTool = ref<ActiveTool>('writing')

  /** 是否正在保存 */
  const isSaving = ref(false)

  /** 自动保存是否启用 */
  const autosaveEnabled = ref(true)

  /** TipTap 编辑器实例 */
  const tipTapEditor = ref<any>(null)

  /** TipTap JSON 字符串内容 */
  const editorContent = ref<string>('')

  /** 段落内容映射（paragraphId -> 文档内容） */
  const paragraphs = ref<Map<string, DocumentContent>>(new Map())

  /** 段落顺序 */
  const paragraphOrder = ref<string[]>([])

  // ==================== Getters ====================

  /**
   * 是否有内容
   */
  const hasContent = computed(() => content.value.length > 0)

  /**
   * 保存状态文本
   */
  const saveStatusText = computed(() => {
    if (isSaving.value) return '正在保存...'
    if (isDirty.value) return '有未保存的更改'
    if (lastSavedAt.value) {
      const date = new Date(lastSavedAt.value)
      return `上次保存: ${date.toLocaleTimeString()}`
    }
    return ''
  })

  // ==================== Actions ====================

  /**
   * 设置当前激活的工具/模式
   */
  function setActiveTool(tool: ActiveTool) {
    activeTool.value = tool
  }

  /**
   * 设置当前项目
   */
  function setCurrentProject(projectId: string | null) {
    currentProjectId.value = projectId
  }

  /**
   * 设置当前章节
   */
  function setCurrentChapter(chapterId: string | null) {
    currentChapterId.value = chapterId
  }

  /**
   * 设置编辑内容
   * @param newContent 新内容
   * @param markAsDirty 是否标记为脏（默认 true）
   */
  function setContent(newContent: string, markAsDirty = true) {
    content.value = newContent
    if (markAsDirty) {
      isDirty.value = true
    }
  }

  /**
   * 标记为脏（有未保存更改）
   */
  function markDirty() {
    isDirty.value = true
  }

  /**
   * 标记为已保存
   */
  function markSaved() {
    isDirty.value = false
    lastSavedAt.value = Date.now()
  }

  /**
   * 重置编辑器状态
   */
  function resetEditor() {
    content.value = ''
    isDirty.value = false
    lastSavedAt.value = null
    currentChapterId.value = null
  }

  /**
   * 重置全部状态
   */
  function reset() {
    resetEditor()
    currentProjectId.value = null
    activeTool.value = 'writing'
    isSaving.value = false
  }

  /**
   * 切换自动保存
   */
  function toggleAutosave(enabled?: boolean) {
    autosaveEnabled.value = enabled ?? !autosaveEnabled.value
  }

  /**
   * 设置保存状态（供外部保存逻辑调用）
   */
  function setSaving(saving: boolean) {
    isSaving.value = saving
  }

  /**
   * 设置 TipTap 实例
   */
  function setTipTapEditor(editor: any) {
    tipTapEditor.value = editor
  }

  /**
   * 加载文档（优先段落接口，回退全文接口）
   */
  async function loadDocument(documentId: string) {
    setCurrentChapter(documentId)
    setSaving(true)
    try {
      const writerApi = await import('@/modules/writer/api/wrapper')
      const resp = await writerApi.getDocumentContents(documentId)
      const payload = (resp as any)?.data || resp || {}
      const contents = Array.isArray(payload.contents) ? payload.contents : []
      const mapped = new Map<string, DocumentContent>()
      const order: string[] = []

      for (const item of contents as ParagraphContent[]) {
        const pid = item.paragraphId || `p-${item.order}`
        order.push(pid)
        mapped.set(pid, {
          id: pid,
          documentId,
          content: item.content || '',
          version: Number(item.version || 1),
          updatedAt: item.updatedAt || new Date().toISOString(),
        } as DocumentContent)
      }

      paragraphs.value = mapped
      paragraphOrder.value = order
      const mergedText = order
        .map((id) => mapped.get(id)?.content || '')
        .join('\n')
      setContent(mergedText, false)
      editorContent.value = mergedText
      markSaved()
    } catch {
      const writerApi = await import('@/modules/writer/api/wrapper')
      const fallback = await writerApi.getDocumentContent(documentId)
      const payload = (fallback as any)?.data || fallback || {}
      const text = String(payload.content || '')
      setContent(text, false)
      editorContent.value = text
      markSaved()
    } finally {
      setSaving(false)
    }
  }

  /**
   * 保存段落内容
   */
  async function saveParagraphs(contents: ParagraphContent[]) {
    if (!currentChapterId.value) return
    setSaving(true)
    try {
      const writerApi = await import('@/modules/writer/api/wrapper')
      await writerApi.replaceDocumentContents(currentChapterId.value, contents)

      const mapped = new Map<string, DocumentContent>()
      const order: string[] = []
      for (const item of contents) {
        const pid = item.paragraphId || `p-${item.order}`
        order.push(pid)
        mapped.set(pid, {
          id: pid,
          documentId: currentChapterId.value,
          content: item.content || '',
          version: Number(item.version || 1),
          updatedAt: item.updatedAt || new Date().toISOString(),
        } as DocumentContent)
      }
      paragraphs.value = mapped
      paragraphOrder.value = order
      const mergedText = order.map((id) => mapped.get(id)?.content || '').join('\n')
      setContent(mergedText, false)
      editorContent.value = mergedText
      markSaved()
    } finally {
      setSaving(false)
    }
  }

  /**
   * 加载设定数据（角色/地点/物品）
   */
  async function loadSettings(type: 'character' | 'location' | 'item') {
    const worldStore = await import('./worldStore')
    const store = worldStore.useWorldStore()
    const projectId = currentProjectId.value || ''
    if (!projectId) return []
    await store.loadAll(projectId)
    if (type === 'character') return store.characters
    if (type === 'location') return store.locations
    const maybeItems = (store as unknown as { items?: unknown[] }).items
    return Array.isArray(maybeItems) ? maybeItems : []
  }

  return {
    // State
    currentProjectId,
    currentChapterId,
    content,
    isDirty,
    lastSavedAt,
    activeTool,
    isSaving,
    autosaveEnabled,
    tipTapEditor,
    editorContent,
    paragraphs,
    paragraphOrder,

    // Getters
    hasContent,
    saveStatusText,

    // Actions
    setActiveTool,
    setCurrentProject,
    setCurrentChapter,
    setContent,
    markDirty,
    markSaved,
    resetEditor,
    reset,
    toggleAutosave,
    setSaving,
    setTipTapEditor,
    loadDocument,
    saveParagraphs,
    loadSettings,
  }
})
