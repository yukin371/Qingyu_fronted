import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  }
})
