/**
 * 写作导出 API
 */
import request from '@/api/request'

// 导出格式
export type ExportFormat = 'txt' | 'docx' | 'pdf' | 'markdown' | 'epub' | 'html'

// 导出范围
export type ExportScope = 'chapter' | 'volume' | 'book' | 'selection'

// 导出选项
export interface ExportOptions {
  format: ExportFormat
  scope: ExportScope
  include_metadata?: boolean // 是否包含元数据
  include_comments?: boolean // 是否包含评论
  include_toc?: boolean // 是否包含目录
  page_breaks?: boolean // 是否分页
  toc_title?: string // 目录标题
}

// 导出任务
export interface ExportTask {
  id: string
  book_id: string
  chapter_id?: string
  format: ExportFormat
  scope: ExportScope
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  file_url?: string
  file_size?: number
  error_message?: string
  created_at: string
  completed_at?: string
}

// 导出历史
export interface ExportHistory {
  total: number
  items: ExportTask[]
}

/**
 * 创建导出任务
 */
export function createExportTask(bookId: string, options: ExportOptions) {
  return request<ExportTask>({
    url: `/api/v1/writer/export/books/${bookId}`,
    method: 'post',
    data: options
  })
}

/**
 * 导出章节
 */
export function exportChapter(chapterId: string, format: ExportFormat) {
  return request<ExportTask>({
    url: `/api/v1/writer/export/chapters/${chapterId}`,
    method: 'post',
    data: { format }
  })
}

/**
 * 导出选中文本
 */
export function exportSelection(data: {
  book_id: string
  chapter_id: string
  content: string
  format: ExportFormat
}) {
  return request<ExportTask>({
    url: '/api/v1/writer/export/selection',
    method: 'post',
    data
  })
}

/**
 * 获取导出任务状态
 */
export function getExportTaskStatus(taskId: string) {
  return request<ExportTask>({
    url: `/api/v1/writer/export/tasks/${taskId}`,
    method: 'get'
  })
}

/**
 * 取消导出任务
 */
export function cancelExportTask(taskId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/export/tasks/${taskId}/cancel`,
    method: 'post'
  })
}

/**
 * 获取书籍导出历史
 */
export function getExportHistory(bookId: string, params?: {
  page?: number
  page_size?: number
}) {
  return request<ExportHistory>({
    url: `/api/v1/writer/export/books/${bookId}/history`,
    method: 'get',
    params
  })
}

/**
 * 获取用户所有导出历史
 */
export function getAllExportHistory(params?: {
  page?: number
  page_size?: number
  format?: ExportFormat
  status?: string
}) {
  return request<ExportHistory>({
    url: '/api/v1/writer/export/history',
    method: 'get',
    params
  })
}

/**
 * 下载导出文件
 */
export function downloadExportFile(taskId: string) {
  return request<Blob>({
    url: `/api/v1/writer/export/tasks/${taskId}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 删除导出任务
 */
export function deleteExportTask(taskId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/writer/export/tasks/${taskId}`,
    method: 'delete'
  })
}

/**
 * 获取导出模板列表
 */
export function getExportTemplates() {
  return request<
    {
      id: string
      name: string
      format: ExportFormat
      description: string
      options: Partial<ExportOptions>
    }[]
  >({
    url: '/api/v1/writer/export/templates',
    method: 'get'
  })
}

/**
 * 保存导出模板
 */
export function saveExportTemplate(data: {
  name: string
  format: ExportFormat
  options: ExportOptions
}) {
  return request<{
    id: string
    name: string
  }>({
    url: '/api/v1/writer/export/templates',
    method: 'post',
    data
  })
}

/**
 * 批量导出
 */
export function batchExport(data: {
  book_ids: string[]
  format: ExportFormat
  scope: ExportScope
}) {
  return request<ExportTask[]>({
    url: '/api/v1/writer/export/batch',
    method: 'post',
    data
  })
}

// 导出格式选项
export const exportFormatOptions = [
  { label: 'TXT 文本', value: 'txt' as ExportFormat, icon: 'Document' },
  { label: 'Word 文档', value: 'docx' as ExportFormat, icon: 'Document' },
  { label: 'PDF 文档', value: 'pdf' as ExportFormat, icon: 'Document' },
  { label: 'Markdown', value: 'markdown' as ExportFormat, icon: 'Document' },
  { label: 'EPUB 电子书', value: 'epub' as ExportFormat, icon: 'Reading' },
  { label: 'HTML 网页', value: 'html' as ExportFormat, icon: 'Link' }
]

// 导出范围选项
export const exportScopeOptions = [
  { label: '当前章节', value: 'chapter' as ExportScope },
  { label: '当前分卷', value: 'volume' as ExportScope },
  { label: '整本书', value: 'book' as ExportScope },
  { label: '选中内容', value: 'selection' as ExportScope }
]
