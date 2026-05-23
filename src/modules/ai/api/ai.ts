/**
 * AI Writing Assistant API
 * 提供对话、续写、润色、扩写、改写等AI功能
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'
import { aiDirectApi, isDirectModeEnabled } from './ai-direct'
import { getAIRequest, postAIRequest, putAIRequest } from './request'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
}

export interface AIGenerateRequest {
  projectId?: string
  currentText?: string
  prompt?: string
  continueLength?: number
  type?: 'continue' | 'rewrite' | 'polish' | 'expand'
}

export interface AIGenerateResponse {
  generated_text?: string
  rewritten_text?: string
  polished_text?: string
  expanded_text?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AISummaryResponse {
  summary: string
  keyPoints: string[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AIProofreadIssue {
  id?: string
  type?: string
  severity?: string
  message?: string
  suggestions?: string[]
  suggestionDetails?: Array<{
    text: string
    reason?: string
    confidence?: number
  }>
  position?: {
    start: number
    end: number
    line?: number
    column?: number
    length?: number
  }
  originalText?: string
  category?: string
  rule?: string
}

export interface AIProofreadResponse {
  reviewId?: string
  contentHash?: string
  score?: number
  issues: AIProofreadIssue[]
  statistics?: {
    totalIssues?: number
    errorCount?: number
    warningCount?: number
    suggestionCount?: number
    issuesByType?: Record<string, number>
    characterCount?: number
  }
  previewWarnings?: Array<Record<string, unknown>>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AIRewriteRequest {
  projectId?: string
  originalText: string
  rewriteMode: 'polish' | 'expand' | 'simplify' | 'formal'
  instructions?: string
}

export interface AIPolishRequest {
  projectId?: string
  originalText: string
  instructions?: string
}

export interface AIExpandRequest {
  projectId?: string
  originalText: string
  instructions?: string
  targetLength?: number
}

function asFiniteNumber(value: unknown): number | undefined {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function codePointOffsetToStringIndex(value: string, offset: number): number | undefined {
  if (!Number.isInteger(offset) || offset < 0) {
    return undefined
  }

  const codePoints = Array.from(value)
  if (offset > codePoints.length) {
    return undefined
  }

  return codePoints.slice(0, offset).join('').length
}

function findClosestOriginalTextPosition(
  content: string,
  originalText: string,
  preferredStart?: number,
): number | undefined {
  if (!originalText) {
    return undefined
  }

  const positions: number[] = []
  let cursor = content.indexOf(originalText)
  while (cursor >= 0) {
    positions.push(cursor)
    cursor = content.indexOf(originalText, cursor + Math.max(originalText.length, 1))
  }
  if (positions.length === 0) {
    return undefined
  }
  if (typeof preferredStart !== 'number') {
    return positions[0]
  }

  return positions.reduce((best, current) =>
    Math.abs(current - preferredStart) < Math.abs(best - preferredStart) ? current : best,
  )
}

function normalizeProofreadPosition(
  content: string,
  record: Record<string, any>,
  originalText: string,
): AIProofreadIssue['position'] | undefined {
  const position = record.position && typeof record.position === 'object' ? record.position : record
  const rawStart = asFiniteNumber(position.start ?? position.from)
  const rawEnd = asFiniteNumber(position.end ?? position.to)
  if (rawStart === undefined || rawEnd === undefined || rawStart < 0 || rawEnd <= rawStart) {
    return undefined
  }

  const toPosition = (start: number, end: number) => ({
    start,
    end,
    line: asFiniteNumber(position.line),
    column: asFiniteNumber(position.column),
    length: end - start,
  })
  const isValidStringRange = (start: number, end: number) =>
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 0 &&
    end > start &&
    end <= content.length

  if (isValidStringRange(rawStart, rawEnd)) {
    const currentText = content.slice(rawStart, rawEnd)
    if (!originalText || currentText === originalText) {
      return toPosition(rawStart, rawEnd)
    }
  }

  const codePointStart = codePointOffsetToStringIndex(content, rawStart)
  const codePointEnd = codePointOffsetToStringIndex(content, rawEnd)
  if (
    codePointStart !== undefined &&
    codePointEnd !== undefined &&
    isValidStringRange(codePointStart, codePointEnd)
  ) {
    const currentText = content.slice(codePointStart, codePointEnd)
    if (!originalText || currentText === originalText) {
      return toPosition(codePointStart, codePointEnd)
    }
  }

  const matchedStart = findClosestOriginalTextPosition(
    content,
    originalText,
    codePointStart ?? rawStart,
  )
  if (matchedStart !== undefined) {
    return toPosition(matchedStart, matchedStart + originalText.length)
  }

  return undefined
}

function normalizeProofreadIssueType(value: unknown) {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
  const typeMap: Record<string, string> = {
    spelling: 'typo',
    typo: 'typo',
    grammar: 'grammar',
    punctuation: 'punctuation',
    style: 'style',
    readability: 'readability',
    continuity: 'continuity',
  }
  return typeMap[raw] || String(value || 'style').trim() || 'style'
}

function normalizeProofreadSeverity(value: unknown) {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
  if (['error', 'high', 'critical', '严重'].includes(raw)) return 'error'
  if (['warning', 'medium', 'warn', '中等'].includes(raw)) return 'warning'
  return 'suggestion'
}

function normalizeProofreadSuggestionDetails(rawSuggestions: unknown) {
  if (!Array.isArray(rawSuggestions)) {
    return []
  }

  return rawSuggestions
    .map((suggestion) => {
      if (suggestion && typeof suggestion === 'object') {
        const record = suggestion as Record<string, unknown>
        const textValue = String(record.text || record.value || record.suggestion || '').trim()
        if (!textValue) return null
        return {
          text: textValue,
          reason: String(record.reason || record.explanation || '').trim() || undefined,
          confidence: Number.isFinite(Number(record.confidence))
            ? Number(record.confidence)
            : undefined,
        }
      }

      const textValue = String(suggestion || '').trim()
      return textValue ? { text: textValue } : null
    })
    .filter((item): item is { text: string; reason?: string; confidence?: number } => !!item)
}

function normalizeAIProofreadResponse(text: string, response: unknown): AIProofreadResponse {
  const data = response as Record<string, any>
  const issuesSource = data?.issues || data?.data?.issues
  const fallbackMessage = String(
    data?.proofread_result ||
      data?.data?.proofread_result ||
      data?.rewritten_text ||
      data?.data?.rewritten_text ||
      '',
  ).trim()
  const normalizedIssues: AIProofreadIssue[] = Array.isArray(issuesSource)
    ? issuesSource.reduce<AIProofreadIssue[]>((acc, item, index) => {
        if (!item || typeof item !== 'object') {
          return acc
        }
        const record = item as Record<string, any>
        const message = String(record.message || record.description || record.issue || '').trim()
        if (!message) {
          return acc
        }
        const suggestionDetails = normalizeProofreadSuggestionDetails(
          record.suggestionDetails || record.suggestion_details || record.suggestions,
        )
        const originalText = String(
          record.originalText || record.original_text || record.original || '',
        ).trim()
        const position = normalizeProofreadPosition(text, record, originalText)
        const positionedOriginalText = position ? text.slice(position.start, position.end) : ''
        acc.push({
          id: String(record.id || `proofread-${index + 1}`),
          type: normalizeProofreadIssueType(record.type || record.category),
          severity: normalizeProofreadSeverity(record.severity || record.level),
          message,
          suggestions: suggestionDetails.map((suggestion) => suggestion.text),
          suggestionDetails,
          position,
          originalText: originalText || positionedOriginalText || undefined,
          category: String(record.category || '').trim() || undefined,
          rule: String(record.rule || '').trim() || undefined,
        })
        return acc
      }, [])
    : []
  const statistics = data?.statistics || data?.data?.statistics
  const previewWarnings =
    data?.previewWarnings ||
    data?.preview_warnings ||
    data?.data?.previewWarnings ||
    data?.data?.preview_warnings ||
    []
  return {
    reviewId:
      String(
        data?.reviewId || data?.review_id || data?.data?.reviewId || data?.data?.review_id || '',
      ).trim() || undefined,
    contentHash:
      String(
        data?.contentHash ||
          data?.content_hash ||
          data?.data?.contentHash ||
          data?.data?.content_hash ||
          '',
      ).trim() || undefined,
    score:
      typeof data?.score === 'number'
        ? data.score
        : typeof data?.data?.score === 'number'
          ? data.data.score
          : undefined,
    issues:
      normalizedIssues.length > 0
        ? normalizedIssues
        : fallbackMessage
          ? [
              {
                id: 'proofread-fallback',
                type: '审校',
                severity: 'info',
                message: fallbackMessage,
                suggestions: [],
              },
            ]
          : [],
    statistics,
    previewWarnings: Array.isArray(previewWarnings) ? previewWarnings : [],
    usage: data?.usage,
  }
}

/**
 * AI配额信息
 */
export interface QuotaInfo {
  userId: string
  quotaId: string
  quotaType: 'free' | 'paid' | 'trial'
  totalQuota: number
  usedQuota: number
  remainingQuota: number
  resetDate: string
  isActive: boolean
}

/**
 * 配额统计
 */
export interface QuotaStatistics {
  totalUsers: number
  activeUsers: number
  totalQuotaAllocated: number
  totalQuotaUsed: number
  averageQuotaPerUser: number
  topUsers: Array<{
    userId: string
    username: string
    quotaUsed: number
  }>
}

/**
 * 配额交易记录
 */
export interface QuotaTransaction {
  id: string
  userId: string
  type: 'allocate' | 'consume' | 'expire'
  amount: number
  balanceBefore: number
  balanceAfter: number
  reason?: string
  createdAt: string
}

/**
 * AI聊天会话
 */
export interface ChatSession {
  id: string
  userId: string
  title?: string
  messageCount: number
  createdAt: string
  updatedAt: string
  lastMessageAt?: string
}

/**
 * AI对话接口
 * @description 与AI进行对话交互
 * @endpoint POST /api/v1/ai/chat
 * @category ai
 * @tags AI辅助
 * @param {string} message - 用户消息
 * @param {ChatMessage[]} history - 对话历史（可选）
 * @response {Object} 200 - 成功返回AI回复
 * @response {string} reply - AI回复内容
 * @response {Object} usage - Token使用情况
 * @security BearerAuth
 */
export const chatWithAI = async (
  message: string,
  history?: ChatMessage[],
): Promise<{ reply: string; usage?: any }> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.chat(message, history)
  }

  const response = await postAIRequest<{ reply?: string; message?: string; usage?: any }>(
    '/api/v1/ai/chat',
    {
      message,
      history: history || [],
    },
  )

  const data = response as unknown as { reply?: string; message?: string; usage?: any }
  return {
    reply: data?.reply || data?.message || '',
    usage: data?.usage,
  }
}

/**
 * 续写接口
 * @description 基于当前文本续写内容
 * @endpoint POST /api/v1/ai/generate
 * @category ai
 * @tags AI辅助
 * @param {string} projectId - 项目ID
 * @param {string} currentText - 当前文本
 * @param {number} length - 续写长度（默认200）
 * @response {AIGenerateResponse} 200 - 成功返回生成文本
 * @security BearerAuth
 */
export const continueWriting = async (
  projectId: string,
  currentText: string,
  length: number = 200,
  instructions?: string,
): Promise<AIGenerateResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.continue(projectId, currentText, length, instructions)
  }

  const trimmedInstructions = (instructions || '').trim()
  const prompt = trimmedInstructions
    ? `${currentText}\n\n续写要求：${trimmedInstructions}`
    : currentText

  const response = await postAIRequest<AIGenerateResponse>('/api/v1/ai/generate', {
    projectId,
    currentText,
    prompt,
    continueLength: length,
    type: 'continue',
  })

  return (response as unknown as AIGenerateResponse) || {}
}

/**
 * 润色接口
 * @description 对文本进行润色优化
 * @endpoint POST /api/v1/ai/polish
 * @category ai
 * @tags AI辅助
 * @param {string} projectId - 项目ID
 * @param {string} text - 原始文本
 * @param {string} instructions - 润色指示（可选）
 * @response {AIGenerateResponse} 200 - 成功返回润色后的文本
 * @security BearerAuth
 */
export const polishText = async (
  projectId: string,
  text: string,
  instructions?: string,
): Promise<AIGenerateResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.polish(text, instructions)
  }

  const response = await postAIRequest<AIGenerateResponse>('/api/v1/ai/polish', {
    projectId,
    originalText: text,
    rewriteMode: 'polish',
    instructions: instructions || '提升文学性和表达力',
  })

  return (response as unknown as AIGenerateResponse) || {}
}

/**
 * 扩写接口
 * @description 对文本进行扩写丰富
 * @endpoint POST /api/v1/ai/expand
 * @category ai
 * @tags AI辅助
 * @param {string} projectId - 项目ID
 * @param {string} text - 原始文本
 * @param {string} instructions - 扩写指示（可选）
 * @param {number} targetLength - 目标长度（可选）
 * @response {AIGenerateResponse} 200 - 成功返回扩写后的文本
 * @security BearerAuth
 */
export const expandText = async (
  projectId: string,
  text: string,
  instructions?: string,
  targetLength?: number,
): Promise<AIGenerateResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.expand(text, instructions, targetLength)
  }

  const response = await postAIRequest<AIGenerateResponse>('/api/v1/ai/expand', {
    projectId,
    originalText: text,
    rewriteMode: 'expand',
    instructions: instructions || '扩展为更详细的描述',
    targetLength,
  })

  return (response as unknown as AIGenerateResponse) || {}
}

/**
 * 改写接口
 * @description 对文本进行改写
 * @endpoint POST /api/v1/ai/rewrite
 * @category ai
 * @tags AI辅助
 * @param {string} projectId - 项目ID
 * @param {string} text - 原始文本
 * @param {string} mode - 改写模式（polish/simplify/formal/casual）
 * @param {string} instructions - 改写指示（可选）
 * @response {AIGenerateResponse} 200 - 成功返回改写后的文本
 * @security BearerAuth
 */
export const rewriteText = async (
  projectId: string,
  text: string,
  mode: 'polish' | 'simplify' | 'formal' | 'casual',
  instructions?: string,
): Promise<AIGenerateResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.rewrite(text, instructions || mode)
  }

  const response = await postAIRequest<AIGenerateResponse>('/api/v1/ai/rewrite', {
    projectId,
    originalText: text,
    rewriteMode: mode,
    instructions,
  })

  return (response as unknown as AIGenerateResponse) || {}
}

export const summarizeText = async (
  text: string,
  options?: {
    projectId?: string
    chapterId?: string
    maxLength?: number
    summaryType?: 'brief' | 'detailed' | 'keypoints'
    includeQuotes?: boolean
  },
): Promise<AISummaryResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.summarize(text, {
      maxLength: options?.maxLength,
      summaryType: options?.summaryType,
      includeQuotes: options?.includeQuotes,
    })
  }

  const response = await postAIRequest<{
    summary?: string
    keyPoints?: unknown[]
    key_points?: unknown[]
    data?: {
      summary?: string
      keyPoints?: unknown[]
      key_points?: unknown[]
    }
    usage?: any
  }>('/api/v1/ai/writing/summarize', {
    content: text,
    text,
    projectId: options?.projectId,
    chapterId: options?.chapterId,
    project_id: options?.projectId,
    chapter_id: options?.chapterId,
    maxLength: options?.maxLength,
    summaryType: options?.summaryType || 'detailed',
    includeQuotes: options?.includeQuotes ?? false,
  })

  const data = response as unknown as Record<string, any>
  const keyPointsSource =
    data?.keyPoints || data?.key_points || data?.data?.keyPoints || data?.data?.key_points
  return {
    summary: String(data?.summary || data?.data?.summary || '').trim(),
    keyPoints: Array.isArray(keyPointsSource)
      ? keyPointsSource.map((item) => String(item).trim()).filter(Boolean)
      : [],
    usage: data?.usage,
  }
}

export const proofreadText = async (
  text: string,
  options?: {
    projectId?: string
    chapterId?: string
    checkTypes?: string[]
    genre?: string
    readerProfile?: string
  },
): Promise<AIProofreadResponse> => {
  if (isDirectModeEnabled()) {
    return normalizeAIProofreadResponse(text, await aiDirectApi.writing.proofread(text))
  }

  const response = await postAIRequest<{
    score?: number
    issues?: unknown[]
    reviewId?: string
    review_id?: string
    contentHash?: string
    content_hash?: string
    statistics?: AIProofreadResponse['statistics']
    previewWarnings?: Array<Record<string, unknown>>
    preview_warnings?: Array<Record<string, unknown>>
    proofread_result?: string
    rewritten_text?: string
    data?: {
      score?: number
      issues?: unknown[]
      reviewId?: string
      review_id?: string
      contentHash?: string
      content_hash?: string
      statistics?: AIProofreadResponse['statistics']
      previewWarnings?: Array<Record<string, unknown>>
      preview_warnings?: Array<Record<string, unknown>>
      proofread_result?: string
      rewritten_text?: string
    }
    usage?: any
  }>('/api/v1/ai/writing/proofread', {
    content: text,
    text,
    projectId: options?.projectId,
    chapterId: options?.chapterId,
    project_id: options?.projectId,
    chapter_id: options?.chapterId,
    checkTypes: options?.checkTypes || [
      'spelling',
      'grammar',
      'punctuation',
      'style',
      'readability',
    ],
    language: 'zh-CN',
    genre: options?.genre,
    readerProfile: options?.readerProfile || '移动端网文读者',
    mode: 'chapter',
    suggestions: true,
  })

  return normalizeAIProofreadResponse(text, response)
}

/**
 * 获取AI服务健康状态
 * @description 获取AI服务的健康检查状态
 * @endpoint GET /api/v1/ai/health
 * @category ai
 * @tags AI系统
 * @response {Object} 200 - 成功返回健康状态
 */
export const getAIHealth = async (): Promise<any> => {
  const response = await getAIRequest('/api/v1/ai/health')
  return response || {}
}

/**
 * 获取AI提供商列表
 * @description 获取可用的AI服务提供商列表
 * @endpoint GET /api/v1/ai/providers
 * @category ai
 * @tags AI系统
 * @response {Object} 200 - 成功返回提供商列表
 */
export const getAIProviders = async (): Promise<any> => {
  const response = await getAIRequest('/api/v1/ai/providers')
  return response || {}
}

/**
 * 获取AI模型列表
 * @description 获取可用的AI模型列表
 * @endpoint GET /api/v1/ai/models
 * @category ai
 * @tags AI系统
 * @response {Object} 200 - 成功返回模型列表
 */
export const getAIModels = async (): Promise<any> => {
  const response = await getAIRequest('/api/v1/ai/models')
  return response || {}
}

/**
 * ==================== AI配额管理 ====================
 * 对接后端: /api/v1/ai/quota/*
 */

/**
 * 获取配额信息
 * @description 获取当前用户的AI配额信息
 * @endpoint GET /ai/quota
 * @category ai
 * @tags AI配额
 * @response {QuotaInfo} 200 - 成功返回配额信息
 * @security BearerAuth
 */
export const getQuotaInfo = async (): Promise<APIResponse<QuotaInfo>> => {
  const response = await httpService.get<APIResponse<QuotaInfo>>('/ai/quota')
  return response as unknown as APIResponse<QuotaInfo>
}

/**
 * 获取所有配额（管理员）
 * @description 获取所有用户的AI配额信息
 * @endpoint GET /ai/quota/all
 * @category ai
 * @tags AI配额
 * @response {QuotaInfo[]} 200 - 成功返回所有配额信息
 * @security BearerAuth
 */
export const getAllQuotas = async (): Promise<APIResponse<QuotaInfo[]>> => {
  const response = await httpService.get<APIResponse<QuotaInfo[]>>('/ai/quota/all')
  return response as unknown as APIResponse<QuotaInfo[]>
}

/**
 * 获取配额统计（管理员）
 * @description 获取AI配额的统计数据
 * @endpoint GET /ai/quota/statistics
 * @category ai
 * @tags AI配额
 * @response {QuotaStatistics} 200 - 成功返回配额统计
 * @security BearerAuth
 */
export const getQuotaStatistics = async (): Promise<APIResponse<QuotaStatistics>> => {
  const response = await httpService.get<APIResponse<QuotaStatistics>>('/ai/quota/statistics')
  return response as unknown as APIResponse<QuotaStatistics>
}

/**
 * 获取交易历史
 * @description 获取AI配额的交易历史记录
 * @endpoint GET /ai/quota/transactions
 * @category ai
 * @tags AI配额
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @response {PaginatedResponse} 200 - 成功返回交易历史
 * @security BearerAuth
 */
export const getTransactionHistory = async (params?: {
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<QuotaTransaction>> => {
  const response = await httpService.get<PaginatedResponse<QuotaTransaction>>(
    '/ai/quota/transactions',
    { params },
  )
  return response as unknown as PaginatedResponse<QuotaTransaction>
}

/**
 * ==================== AI会话管理 ====================
 * 对接后端: /api/v1/ai/chat/sessions/*
 */

/**
 * 获取会话列表
 * @description 获取AI聊天会话列表
 * @endpoint GET /ai/chat/sessions
 * @category ai
 * @tags AI会话
 * @response {ChatSession[]} 200 - 成功返回会话列表
 * @security BearerAuth
 */
export const getChatSessions = async (): Promise<APIResponse<ChatSession[]>> => {
  const response = await httpService.get<APIResponse<ChatSession[]>>('/ai/chat/sessions')
  return response as unknown as APIResponse<ChatSession[]>
}

/**
 * 获取会话历史
 * @description 获取指定会话的聊天历史
 * @endpoint GET /ai/chat/sessions/:sessionId
 * @category ai
 * @tags AI会话
 * @param {string} sessionId - 会话ID
 * @response {ChatMessage[]} 200 - 成功返回会话历史
 * @security BearerAuth
 */
export const getSessionHistory = async (sessionId: string): Promise<APIResponse<ChatMessage[]>> => {
  const response = await httpService.get<APIResponse<ChatMessage[]>>(
    `/ai/chat/sessions/${sessionId}`,
  )
  return response as unknown as APIResponse<ChatMessage[]>
}

/**
 * 删除会话
 * @description 删除指定的AI聊天会话
 * @endpoint DELETE /ai/chat/sessions/:sessionId
 * @category ai
 * @tags AI会话
 * @param {string} sessionId - 会话ID
 * @response {void} 200 - 删除成功
 * @security BearerAuth
 */
export const deleteSession = async (sessionId: string): Promise<APIResponse<void>> => {
  const response = await httpService.delete<APIResponse<void>>(`/ai/chat/sessions/${sessionId}`)
  return response as unknown as APIResponse<void>
}

/**
 * 创建新会话
 * @description 创建新的AI聊天会话
 * @endpoint POST /ai/chat/sessions
 * @category ai
 * @tags AI会话
 * @param {string} title - 会话标题（可选）
 * @response {ChatSession} 201 - 成功返回创建的会话
 * @security BearerAuth
 */
export const createSession = async (title?: string): Promise<APIResponse<ChatSession>> => {
  const response = await httpService.post<APIResponse<ChatSession>>('/ai/chat/sessions', { title })
  return response as unknown as APIResponse<ChatSession>
}

/**
 * 更新会话标题
 * @description 更新AI聊天会话的标题
 * @endpoint PUT /ai/chat/sessions/:sessionId
 * @category ai
 * @tags AI会话
 * @param {string} sessionId - 会话ID
 * @param {string} title - 新标题
 * @response {ChatSession} 200 - 成功返回更新的会话
 * @security BearerAuth
 */
export const updateSession = async (
  sessionId: string,
  title: string,
): Promise<APIResponse<ChatSession>> => {
  const response = await httpService.put<APIResponse<ChatSession>>(
    `/ai/chat/sessions/${sessionId}`,
    { title },
  )
  return response as unknown as APIResponse<ChatSession>
}

// ============ 故事上下文写作 ============

/** 故事上下文生成 */
export function storyGenerate(data: {
  projectId: string
  documentId: string
  mode: 'continue' | 'rewrite' | 'suggest'
  instruction?: string
  selectedText?: string
}) {
  return postAIRequest('/ai/story/generate', data)
}

/** 上下文预览（调试用） */
export function contextPreview(projectId: string, documentId: string) {
  return getAIRequest('/ai/story/context-preview', {
    params: { projectId, documentId },
  })
}

/** 更新场景状态 */
export function updateSceneState(
  documentId: string,
  data: {
    sceneGoal?: string
    activeConflict?: string
  },
) {
  return putAIRequest(`/ai/story/documents/${documentId}/scene-state`, data)
}

export default {
  // 写作辅助
  chatWithAI,
  continueWriting,
  polishText,
  expandText,
  rewriteText,
  summarizeText,
  proofreadText,
  // 系统信息
  getAIHealth,
  getAIProviders,
  getAIModels,
  // 配额管理
  getQuotaInfo,
  getAllQuotas,
  getQuotaStatistics,
  getTransactionHistory,
  // 会话管理
  getChatSessions,
  getSessionHistory,
  deleteSession,
  createSession,
  updateSession,
  // 故事上下文写作
  storyGenerate,
  contextPreview,
  updateSceneState,
}
