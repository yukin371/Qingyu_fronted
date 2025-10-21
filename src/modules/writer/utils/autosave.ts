/**
 * 编辑器自动保存工具
 * 支持版本冲突检测、自动保存、草稿恢复
 */

export interface SavedDraft {
  documentId: string
  title: string
  content: string
  timestamp: number
  version: number
  wordCount: number
}

export interface AutoSaveOptions {
  interval?: number // 自动保存间隔(毫秒)
  debounceDelay?: number // 防抖延迟(毫秒)
  onSave?: (draft: SavedDraft) => Promise<void> // 保存回调
  onConflict?: (localVersion: number, serverVersion: number) => void // 冲突回调
}

export class AutoSaveManager {
  private saveTimer: number | null = null
  private debounceTimer: number | null = null
  private currentVersion: number = 0
  private lastSavedContent: string = ''
  private options: Required<AutoSaveOptions>

  constructor(options: AutoSaveOptions = {}) {
    this.options = {
      interval: options.interval || 30000, // 默认30秒
      debounceDelay: options.debounceDelay || 1500, // 默认1.5秒
      onSave: options.onSave || this.defaultSaveHandler,
      onConflict: options.onConflict || this.defaultConflictHandler
    }
  }

  /**
   * 开始自动保存
   */
  start(documentId: string, initialContent: string = '', initialVersion: number = 0) {
    this.stop()
    this.lastSavedContent = initialContent
    this.currentVersion = initialVersion

    // 启动定时保存
    this.saveTimer = window.setInterval(() => {
      this.triggerSave(documentId)
    }, this.options.interval)
  }

  /**
   * 停止自动保存
   */
  stop() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer)
      this.saveTimer = null
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  /**
   * 内容变化时调用(防抖保存)
   */
  onContentChange(documentId: string, content: string, title: string = '未命名文档') {
    // 清除之前的防抖定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // 设置新的防抖定时器
    this.debounceTimer = window.setTimeout(() => {
      this.saveNow(documentId, content, title)
    }, this.options.debounceDelay)
  }

  /**
   * 立即保存
   */
  async saveNow(documentId: string, content: string, title: string = '未命名文档'): Promise<boolean> {
    // 内容没有变化,不需要保存
    if (content === this.lastSavedContent) {
      return true
    }

    const draft: SavedDraft = {
      documentId,
      title,
      content,
      timestamp: Date.now(),
      version: this.currentVersion + 1,
      wordCount: this.countWords(content)
    }

    try {
      await this.options.onSave(draft)
      this.lastSavedContent = content
      this.currentVersion = draft.version
      return true
    } catch (error) {
      console.error('自动保存失败:', error)
      return false
    }
  }

  /**
   * 触发保存(由定时器调用)
   */
  private async triggerSave(documentId: string) {
    // 这里需要从外部获取当前编辑内容,所以实际使用时需要配合状态管理
    console.log('Auto-save triggered for document:', documentId)
  }

  /**
   * 检查版本冲突
   */
  checkVersionConflict(serverVersion: number): boolean {
    if (serverVersion > this.currentVersion) {
      this.options.onConflict(this.currentVersion, serverVersion)
      return true
    }
    return false
  }

  /**
   * 获取当前版本号
   */
  getCurrentVersion(): number {
    return this.currentVersion
  }

  /**
   * 设置版本号
   */
  setVersion(version: number) {
    this.currentVersion = version
  }

  /**
   * 字数统计
   */
  private countWords(text: string): number {
    if (!text) return 0
    return text.replace(/[\s\n\r]/g, '').length
  }

  /**
   * 默认保存处理器(保存到localStorage)
   */
  private async defaultSaveHandler(draft: SavedDraft): Promise<void> {
    const key = `draft_${draft.documentId}`
    localStorage.setItem(key, JSON.stringify(draft))
    localStorage.setItem('draft_latest', draft.documentId)
  }

  /**
   * 默认冲突处理器
   */
  private defaultConflictHandler(localVersion: number, serverVersion: number) {
    console.warn('版本冲突:', {
      local: localVersion,
      server: serverVersion
    })
  }
}

/**
 * 从localStorage恢复草稿
 */
export function restoreDraft(documentId: string): SavedDraft | null {
  const key = `draft_${documentId}`
  const stored = localStorage.getItem(key)
  if (!stored) return null

  try {
    return JSON.parse(stored) as SavedDraft
  } catch {
    return null
  }
}

/**
 * 获取最近编辑的草稿
 */
export function getLatestDraft(): SavedDraft | null {
  const latestId = localStorage.getItem('draft_latest')
  if (!latestId) return null
  return restoreDraft(latestId)
}

/**
 * 清除草稿
 */
export function clearDraft(documentId: string) {
  const key = `draft_${documentId}`
  localStorage.removeItem(key)
}

/**
 * 获取所有草稿列表
 */
export function getAllDrafts(): SavedDraft[] {
  const drafts: SavedDraft[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('draft_') && key !== 'draft_latest') {
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          drafts.push(JSON.parse(stored))
        }
      } catch {
        // 忽略解析错误
      }
    }
  }

  // 按时间戳排序
  return drafts.sort((a, b) => b.timestamp - a.timestamp)
}
