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

  /** 当前文档版本号（用于乐观锁） */
  const currentVersion = ref<number>(0)

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
    console.log('[resetEditor] ========== 重置编辑器状态 ==========')
    console.log('[resetEditor] 重置前 currentVersion:', currentVersion.value)

    content.value = ''
    isDirty.value = false
    lastSavedAt.value = null
    currentChapterId.value = null
    currentVersion.value = 0  // 重置版本号

    console.log('[resetEditor] 重置后 currentVersion:', currentVersion.value)
    console.log('[resetEditor] ===================')
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
   * 将 Markdown 文本转换为 tiptap JSON 格式
   */
  function markdownToTipTapJson(markdown: string): string {
    if (!markdown || typeof markdown !== 'string') {
      return JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [] }] })
    }

    const lines = markdown.split('\n')
    const content: any[] = []

    let inList = false

    for (const line of lines) {
      const trimmed = line.trim()

      // 处理标题
      if (trimmed.startsWith('# ')) {
        inList = false
        const text = trimmed.substring(2)
        content.push({
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text }]
        })
      } else if (trimmed.startsWith('## ')) {
        inList = false
        const text = trimmed.substring(3)
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text }]
        })
      } else if (trimmed.startsWith('### ')) {
        inList = false
        const text = trimmed.substring(4)
        content.push({
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text }]
        })
      }
      // 处理水平线
      else if (trimmed.startsWith('---')) {
        inList = false
        content.push({
          type: 'horizontalRule'
        })
      }
      // 处理列表项
      else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const text = trimmed.substring(2)
        if (!inList) {
          content.push({
            type: 'bulletList',
            content: [{
              type: 'listItem',
              content: [{
                type: 'paragraph',
                content: [{ type: 'text', text }]
              }]
            }]
          })
          inList = true
        } else {
          // 继续添加到当前列表
          const lastList = content[content.length - 1]
          if (lastList && lastList.type === 'bulletList') {
            lastList.content.push({
              type: 'listItem',
              content: [{
                type: 'paragraph',
                content: [{ type: 'text', text }]
              }]
            })
          }
        }
      }
      // 处理空行
      else if (trimmed === '') {
        inList = false
        content.push({
          type: 'paragraph',
          content: []
        })
      }
      // 处理普通段落
      else {
        inList = false
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: line }]
        })
      }
    }

    return JSON.stringify({ type: 'doc', content })
  }

  /**
   * 加载文档（TipTap JSON主模式，支持Markdown向后兼容）
   */
  async function loadDocument(documentId: string) {
    console.log('[loadDocument] ========== 开始加载文档 ==========')
    console.log('[loadDocument] 文档ID:', documentId)
    console.log('[loadDocument] 当前currentVersion:', currentVersion.value)

    setCurrentChapter(documentId)
    setSaving(true)
    try {
      const writerApi = await import('@/modules/writer/api/wrapper')
      const resp = await writerApi.getDocumentContents(documentId)
      console.log('[loadDocument] ===== API响应详情 =====')
      console.log('[loadDocument] 完整响应:', resp)
      console.log('[loadDocument] 响应类型:', typeof resp)
      console.log('[loadDocument] 是否有data字段:', 'data' in (resp as any))

      const payload = (resp as any)?.data || resp || {}
      console.log('[loadDocument] payload:', payload)

      const contents = Array.isArray(payload.contents) ? payload.contents : []
      console.log('[loadDocument] 内容数量:', contents.length)
      console.log('[loadDocument] contents详情:', contents)
      console.log('[loadDocument] ===================')

      // 如果有段落内容，检查第一个段落的 contentType
      if (contents.length > 0) {
        const firstContent = contents[0] as ParagraphContent
        const apiContentType = firstContent.contentType || 'tiptap_json'
        const rawContent = firstContent.content || ''

        console.log('[loadDocument] ===== 内容格式检测 =====')
        console.log('[loadDocument] API返回的contentType:', apiContentType)
        console.log('[loadDocument] rawContent长度:', rawContent.length)
        console.log('[loadDocument] rawContent预览:', rawContent.substring(0, 200) + '...')

        // 智能检测：优先检测content是否为有效JSON，而不是依赖contentType
        let tipTapJson = ''
        let actualContentType = 'tiptap_json'

        try {
          // 尝试解析为JSON
          const parsed = JSON.parse(rawContent)
          console.log('[loadDocument] ✅ content是有效JSON')
          console.log('[loadDocument] JSON类型:', parsed.type)

          if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
            // 确认是TipTap JSON格式
            console.log('[loadDocument] 确认为TipTap JSON格式')
            console.log('[loadDocument] parsed.content.length:', parsed.content.length)
            console.log('[loadDocument] parsed.content[0]:', parsed.content[0])

            // 检查是否是嵌套结构（损坏数据：TipTap JSON被当作markdown包装）
            // 不限制content.length，只检查第一个元素
            let isNested = false
            if (parsed.content.length > 0) {
              const firstNode = parsed.content[0]
              if (firstNode.type === 'paragraph' &&
                  Array.isArray(firstNode.content) &&
                  firstNode.content.length > 0 &&
                  firstNode.content[0].type === 'text') {
                const textContent = firstNode.content[0].text || ''
                // 尝试解析text字段，看是否是嵌套的JSON
                try {
                  const innerParsed = JSON.parse(textContent)
                  if (innerParsed.type === 'doc' && Array.isArray(innerParsed.content)) {
                    console.log('[loadDocument] 🔍 检测到嵌套TipTap JSON，提取内层')
                    tipTapJson = textContent  // 使用内层JSON
                    actualContentType = 'tiptap_json'
                    isNested = true
                  }
                } catch {
                  // text字段不是JSON，使用原始内容
                }
              }
            }

            if (!isNested) {
              console.log('[loadDocument] 直接使用TipTap JSON')
              tipTapJson = rawContent
              actualContentType = 'tiptap_json'
            }
          } else {
            console.log('[loadDocument] JSON格式不是TipTap，按markdown处理')
            throw new Error('Not TipTap JSON')
          }
        } catch {
          // 不是JSON，根据contentType处理
          console.log('[loadDocument] ❌ content不是JSON，使用contentType标记:', apiContentType)

          if (apiContentType === 'markdown' || apiContentType === 'tiptap') {
            // markdown格式，需要转换
            console.log('[loadDocument] 检测到markdown格式，开始转换')
            const fullMarkdown = contents
              .map((item: ParagraphContent) => item.content || '')
              .join('\n\n')
            console.log('[loadDocument] 合并后的markdown:', fullMarkdown.substring(0, 200) + '...')
            tipTapJson = markdownToTipTapJson(fullMarkdown)
            actualContentType = 'markdown'
          } else {
            // 其他格式，直接使用
            console.log('[loadDocument] 直接使用rawContent')
            tipTapJson = rawContent
            actualContentType = apiContentType
          }
        }

        console.log('[loadDocument] 最终使用的格式:', actualContentType)
        console.log('[loadDocument] TipTap JSON预览:', tipTapJson.substring(0, 200) + '...')
        console.log('[loadDocument] ===================')

        // 设置编辑器内容
        setContent(tipTapJson, false)
        editorContent.value = tipTapJson
        console.log('[loadDocument] editorContent已设置:', editorContent.value.substring(0, 200) + '...')

        // 保存当前版本号（用于乐观锁）
        const loadedVersion = Number(firstContent.version || 1)
        currentVersion.value = loadedVersion
        console.log('[loadDocument] ===== 版本号信息 =====')
        console.log('[loadDocument] API返回的version:', firstContent.version)
        console.log('[loadDocument] 解析后的version:', loadedVersion)
        console.log('[loadDocument] 保存到currentVersion:', currentVersion.value)
        console.log('[loadDocument] ===================')

        markSaved()

        // 仍然保存到 paragraphs map 中（用于其他功能）
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
      } else {
        console.log('[loadDocument] ========== 没有找到内容 ==========')
        console.log('[loadDocument] contents数组长度:', contents.length)
        console.log('[loadDocument] 这是新章节或空章节')

        // 没有内容，设置为空
        const emptyContent = JSON.stringify({ type: 'doc', content: [] })
        setContent(emptyContent, false)
        editorContent.value = emptyContent

        // 新章节，版本号设为0
        currentVersion.value = 0
        console.log('[loadDocument] 新章节，设置currentVersion = 0')

        markSaved()
        console.log('[loadDocument] ===================')
      }
    } catch (error) {
      console.error('[loadDocument] 主API失败，尝试fallback:', error)
      const writerApi = await import('@/modules/writer/api/wrapper')
      const fallback = await writerApi.getDocumentContent(documentId)
      console.log('[loadDocument] Fallback API响应:', fallback)
      const payload = (fallback as any)?.data || fallback || {}
      const text = String(payload.content || '')
      console.log('[loadDocument] Fallback内容:', text.substring(0, 200) + '...')

      // 尝试解析是否为 JSON
      try {
        const parsed = JSON.parse(text)
        console.log('[loadDocument] Fallback: JSON解析成功，直接使用')
        setContent(text, false)
        editorContent.value = text
        // Fallback模式下，无法获取version，设置为0（下次保存时后端会处理）
        currentVersion.value = 0
        console.log('[loadDocument] Fallback: 设置currentVersion = 0')
      } catch {
        // 不是 JSON，可能是纯文本或 Markdown
        console.log('[loadDocument] Fallback: 不是JSON，转换为TipTap')
        const tipTapJson = markdownToTipTapJson(text)
        setContent(tipTapJson, false)
        editorContent.value = tipTapJson
        currentVersion.value = 0
        console.log('[loadDocument] Fallback: 设置currentVersion = 0')
      }
      markSaved()
    } finally {
      setSaving(false)
    }
  }

  /**
   * 保存文档内容（TipTap JSON主模式）
   */
  async function saveParagraphs(contents: ParagraphContent[]) {
    console.log('[saveParagraphs] ========== 开始保存 ==========')
    console.log('[saveParagraphs] 当前currentVersion:', currentVersion.value)
    console.log('[saveParagraphs] 当前章节ID:', currentChapterId.value)

    if (!currentChapterId.value) return
    setSaving(true)
    try {
      const writerApi = await import('@/modules/writer/api/wrapper')

      // 提取第一个段落的TipTap JSON内容
      const firstContent = contents[0]
      if (!firstContent) {
        throw new Error('没有内容可保存')
      }

      const tipTapJson = firstContent.content || ''
      console.log('[saveParagraphs] TipTap JSON长度:', tipTapJson.length)
      console.log('[saveParagraphs] TipTap JSON预览:', tipTapJson.substring(0, 200) + '...')

      // 使用当前版本号进行乐观锁控制
      const versionToSave = currentVersion.value || 0
      console.log('[saveParagraphs] ===== 版本号信息 =====')
      console.log('[saveParagraphs] currentVersion.value:', currentVersion.value)
      console.log('[saveParagraphs] versionToSave:', versionToSave)
      console.log('[saveParagraphs] ===================')

      // 直接保存TipTap JSON，包含contentType字段
      const saveRequest = {
        content: tipTapJson,
        contentType: 'tiptap_json',
        version: versionToSave,
      }
      console.log('[saveParagraphs] 发送保存请求:', {
        documentId: currentChapterId.value,
        contentType: saveRequest.contentType,
        version: saveRequest.version,
        contentLength: saveRequest.content.length,
      })

      await writerApi.updateDocumentContent(currentChapterId.value, saveRequest)

      console.log('[saveParagraphs] ✅ 保存成功！')

      // 更新本地状态（已经是TipTap JSON，无需转换）
      setContent(tipTapJson, false)
      editorContent.value = tipTapJson

      // 保存成功后，版本号+1
      const oldVersion = currentVersion.value
      currentVersion.value = versionToSave + 1
      console.log('[saveParagraphs] ===== 版本号更新 =====')
      console.log('[saveParagraphs] 旧版本号:', oldVersion)
      console.log('[saveParagraphs] 新版本号:', currentVersion.value)
      console.log('[saveParagraphs] ===================')

      markSaved()
      console.log('[saveParagraphs] ========== 保存完成 ==========')
    } catch (error) {
      console.error('[saveParagraphs] ❌ 保存失败！')
      console.error('[saveParagraphs] 错误详情:', error)
      console.error('[saveParagraphs] 当前currentVersion:', currentVersion.value)
      console.error('[saveParagraphs] 请求的version:', versionToSave)
      throw error
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

  /**
   * 将 TipTap JSON 转换为 Markdown 文本
   * 用于导出功能
   */
  function tiptapToMarkdown(doc: unknown): string {
    if (!doc || typeof doc !== 'object') return ''

    const nodes = Array.isArray((doc as { content?: unknown[] })?.content)
      ? ((doc as { content: unknown[] }).content as Array<Record<string, unknown>>)
      : []

    const markdown: string[] = []

    for (const node of nodes) {
      if (!node?.type) continue

      const text = flattenText(node)

      switch (node.type) {
        case 'heading':
          const level = (node.attrs as { level?: number })?.level || 1
          const headingPrefix = '#'.repeat(level)
          markdown.push(`${headingPrefix} ${text}`)
          markdown.push('')  // 标题后加空行
          break
        case 'blockquote':
          markdown.push(`> ${text}`)
          markdown.push('')  // 引用后加空行
          break
        case 'codeBlock':
          markdown.push('```')
          markdown.push(text)
          markdown.push('```')
          markdown.push('')  // 代码块后加空行
          break
        case 'bulletList':
          markdown.push(`* ${text}`)
          break
        case 'orderedList':
          markdown.push(`1. ${text}`)
          break
        case 'paragraph':
          if (text.trim()) {
            markdown.push(text)
          }
          markdown.push('')  // 段落后加空行
          break
        case 'horizontalRule':
          markdown.push('---')
          markdown.push('')  // 分隔线后加空行
          break
        default:
          if (text.trim()) {
            markdown.push(text)
            markdown.push('')  // 其他内容后加空行
          }
      }
    }

    return markdown.join('\n')
  }

  /**
   * 提取节点中的所有文本（递归）
   */
  function flattenText(node: unknown): string {
    if (!node || typeof node !== 'object') return ''
    const typed = node as { type?: string; text?: string; content?: unknown[] }
    if (typed.type === 'text') return typed.text || ''
    if (!Array.isArray(typed.content)) return ''
    return typed.content.map(flattenText).join('')
  }

  /**
   * 导出为 Markdown
   */
  async function exportToMarkdown(): Promise<string> {
    try {
      const doc = JSON.parse(editorContent.value)
      return tiptapToMarkdown(doc)
    } catch (error) {
      console.error('[exportToMarkdown] 解析TipTap JSON失败:', error)
      return ''
    }
  }

  /**
   * 导出为纯文本
   */
  async function exportToPlainText(): Promise<string> {
    try {
      const doc = JSON.parse(editorContent.value)
      return flattenText(doc)
    } catch (error) {
      console.error('[exportToPlainText] 解析TipTap JSON失败:', error)
      return ''
    }
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
    currentVersion,

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
    exportToMarkdown,
    exportToPlainText,
  }
})
