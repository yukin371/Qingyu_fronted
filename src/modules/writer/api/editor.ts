import httpService from '@/core/services/http.service'
import type {
  AutoSaveRequest,
  AutoSaveResponse,
  SaveStatusResponse,
  DocumentContentResponse,
  UpdateContentRequest,
  WordCountRequest,
  WordCountResult,
  ShortcutConfig,
  UpdateShortcutsRequest,
  ShortcutCategory,
} from '../types/editor'

const BASE_DOC_URL = '/documents'
const BASE_USER_URL = '/user'

export const editorApi = {
  // ==========================================
  // 文档内容与保存
  // ==========================================

  /**
   * 获取文档内容 (编辑器加载用)
   * GET /api/v1/documents/{id}/content
   */
  getContent(documentId: string) {
    return httpService.get<DocumentContentResponse>(`${BASE_DOC_URL}/${documentId}/content`)
  },

  /**
   * 手动更新/保存文档内容
   * PUT /api/v1/documents/{id}/content
   */
  updateContent(documentId: string, data: UpdateContentRequest) {
    return httpService.put<void>(`${BASE_DOC_URL}/${documentId}/content`, data)
  },

  /**
   * 自动保存文档
   * POST /api/v1/documents/{id}/autosave
   * 注意：如果返回 409，表示版本冲突
   */
  autoSave(documentId: string, data: AutoSaveRequest) {
    return httpService.post<AutoSaveResponse>(`${BASE_DOC_URL}/${documentId}/autosave`, data, {
      silent: true, // 自动保存通常静默处理，不需要成功弹窗
      skipErrorHandler: true, // 建议跳过全局错误处理，由编辑器组件自己处理冲突UI
    })
  },

  /**
   * 获取保存状态
   * GET /api/v1/documents/{id}/save-status
   */
  getSaveStatus(documentId: string) {
    return httpService.get<SaveStatusResponse>(`${BASE_DOC_URL}/${documentId}/save-status`)
  },

  // ==========================================
  // 工具
  // ==========================================

  /**
   * 服务端计算字数
   * POST /api/v1/documents/{id}/word-count
   * 虽然前端也可以算，但服务端可能更精准或包含特定逻辑
   */
  calculateWordCount(documentId: string, data: WordCountRequest) {
    return httpService.post<WordCountResult>(`${BASE_DOC_URL}/${documentId}/word-count`, data)
  },

  // ==========================================
  // 用户快捷键配置
  // ==========================================

  /**
   * 获取用户快捷键配置
   * GET /api/v1/user/shortcuts
   */
  getShortcuts() {
    return httpService.get<ShortcutConfig>(`${BASE_USER_URL}/shortcuts`)
  },

  /**
   * 更新用户快捷键配置
   * PUT /api/v1/user/shortcuts
   */
  updateShortcuts(data: UpdateShortcutsRequest) {
    return httpService.put<void>(`${BASE_USER_URL}/shortcuts`, data)
  },

  /**
   * 重置快捷键为默认
   * POST /api/v1/user/shortcuts/reset
   */
  resetShortcuts() {
    return httpService.post<void>(`${BASE_USER_URL}/shortcuts/reset`)
  },

  /**
   * 获取快捷键帮助列表 (用于显示帮助弹窗)
   * GET /api/v1/user/shortcuts/help
   */
  getShortcutHelp() {
    return httpService.get<ShortcutCategory[]>(`${BASE_USER_URL}/shortcuts/help`)
  },
}

// ==========================================
// 命名导出函数 (为了向后兼容 writerStore)
// ==========================================

/**
 * 获取文档内容
 */
export const getDocumentContent = (documentId: string) => {
  return editorApi.getContent(documentId)
}

/**
 * 更新文档内容
 */
export const updateDocumentContent = (documentId: string, content: string) => {
  return editorApi.updateContent(documentId, { content })
}

/**
 * 自动保存文档
 */
export const autosaveDocument = (documentId: string, content: string, version: number) => {
  return editorApi.autoSave(documentId, { content, version })
}

/**
 * 获取保存状态
 */
export const getSaveStatus = (documentId: string) => {
  return editorApi.getSaveStatus(documentId)
}
