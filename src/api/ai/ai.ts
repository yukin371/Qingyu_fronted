/**
 * AI Writing Assistant API
 * 提供对话、续写、润色、扩写、改写等AI功能
 */

import { httpService } from '@/core/services/http.service'

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
 * @param message 用户消息
 * @param history 对话历史（可选）
 * @returns AI回复
 */
export const chatWithAI = async (
  message: string,
  history?: ChatMessage[]
): Promise<{ reply: string; usage?: any }> => {
  const response = await httpService.post('/api/v1/ai/chat', {
    message,
    history: history || []
  })

  return {
    reply: response?.reply || response?.message || '',
    usage: response?.usage
  }
}

/**
 * 续写接口
 * @param projectId 项目ID
 * @param currentText 当前文本
 * @param length 续写长度
 * @returns 生成的文本
 */
export const continueWriting = async (
  projectId: string,
  currentText: string,
  length: number = 200
): Promise<AIGenerateResponse> => {
  const response = await httpService.post('/api/v1/ai/generate', {
    projectId,
    currentText,
    prompt: currentText,
    continueLength: length,
    type: 'continue'
  })

  return response || {}
}

/**
 * 润色接口
 * @param projectId 项目ID
 * @param text 原始文本
 * @param instructions 润色指示（可选）
 * @returns 润色后的文本
 */
export const polishText = async (
  projectId: string,
  text: string,
  instructions?: string
): Promise<AIGenerateResponse> => {
  const response = await httpService.post('/api/v1/ai/polish', {
    projectId,
    originalText: text,
    rewriteMode: 'polish',
    instructions: instructions || '提升文学性和表达力'
  })

  return response || {}
}

/**
 * 扩写接口
 * @param projectId 项目ID
 * @param text 原始文本
 * @param instructions 扩写指示（可选）
 * @param targetLength 目标长度（可选）
 * @returns 扩写后的文本
 */
export const expandText = async (
  projectId: string,
  text: string,
  instructions?: string,
  targetLength?: number
): Promise<AIGenerateResponse> => {
  const response = await httpService.post('/api/v1/ai/expand', {
    projectId,
    originalText: text,
    rewriteMode: 'expand',
    instructions: instructions || '扩展为更详细的描述',
    targetLength
  })

  return response || {}
}

/**
 * 改写接口
 * @param projectId 项目ID
 * @param text 原始文本
 * @param mode 改写模式
 * @param instructions 改写指示（可选）
 * @returns 改写后的文本
 */
export const rewriteText = async (
  projectId: string,
  text: string,
  mode: 'polish' | 'simplify' | 'formal' | 'casual',
  instructions?: string
): Promise<AIGenerateResponse> => {
  const response = await httpService.post('/api/v1/ai/rewrite', {
    projectId,
    originalText: text,
    rewriteMode: mode,
    instructions
  })

  return response || {}
}

/**
 * 获取AI服务健康状态
 * @returns 健康状态
 */
export const getAIHealth = async (): Promise<any> => {
  const response = await httpService.get('/api/v1/ai/health')
  return response || {}
}

/**
 * 获取AI提供商列表
 * @returns 提供商列表
 */
export const getAIProviders = async (): Promise<any> => {
  const response = await httpService.get('/api/v1/ai/providers')
  return response || {}
}

/**
 * 获取AI模型列表
 * @returns 模型列表
 */
export const getAIModels = async (): Promise<any> => {
  const response = await httpService.get('/api/v1/ai/models')
  return response || {}
}

/**
 * ==================== AI配额管理 ====================
 * 对接后端: /api/v1/ai/quota/*
 */

/**
 * 获取配额信息
 * GET /api/v1/ai/quota
 */
export const getQuotaInfo = async (): Promise<APIResponse<QuotaInfo>> => {
  return httpService.get<APIResponse<QuotaInfo>>('/ai/quota')
}

/**
 * 获取所有配额（管理员）
 * GET /api/v1/ai/quota/all
 */
export const getAllQuotas = async (): Promise<APIResponse<QuotaInfo[]>> => {
  return httpService.get<APIResponse<QuotaInfo[]>>('/ai/quota/all')
}

/**
 * 获取配额统计（管理员）
 * GET /api/v1/ai/quota/statistics
 */
export const getQuotaStatistics = async (): Promise<APIResponse<QuotaStatistics>> => {
  return httpService.get<APIResponse<QuotaStatistics>>('/ai/quota/statistics')
}

/**
 * 获取交易历史
 * GET /api/v1/ai/quota/transactions
 */
export const getTransactionHistory = async (params?: {
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<QuotaTransaction>> => {
  return httpService.get<PaginatedResponse<QuotaTransaction>>('/ai/quota/transactions', { params })
}

/**
 * ==================== AI会话管理 ====================
 * 对接后端: /api/v1/ai/chat/sessions/*
 */

/**
 * 获取会话列表
 * GET /api/v1/ai/chat/sessions
 */
export const getChatSessions = async (): Promise<APIResponse<ChatSession[]>> => {
  return httpService.get<APIResponse<ChatSession[]>>('/ai/chat/sessions')
}

/**
 * 获取会话历史
 * GET /api/v1/ai/chat/sessions/:sessionId
 */
export const getSessionHistory = async (sessionId: string): Promise<APIResponse<ChatMessage[]>> => {
  return httpService.get<APIResponse<ChatMessage[]>>(`/ai/chat/sessions/${sessionId}`)
}

/**
 * 删除会话
 * DELETE /api/v1/ai/chat/sessions/:sessionId
 */
export const deleteSession = async (sessionId: string): Promise<APIResponse<void>> => {
  return httpService.delete<APIResponse<void>>(`/ai/chat/sessions/${sessionId}`)
}

/**
 * 创建新会话
 * POST /api/v1/ai/chat/sessions
 */
export const createSession = async (title?: string): Promise<APIResponse<ChatSession>> => {
  return httpService.post<APIResponse<ChatSession>>('/ai/chat/sessions', { title })
}

/**
 * 更新会话标题
 * PUT /api/v1/ai/chat/sessions/:sessionId
 */
export const updateSession = async (
  sessionId: string,
  title: string
): Promise<APIResponse<ChatSession>> => {
  return httpService.put<APIResponse<ChatSession>>(`/ai/chat/sessions/${sessionId}`, { title })
}

export default {
  // 写作辅助
  chatWithAI,
  continueWriting,
  polishText,
  expandText,
  rewriteText,
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
  updateSession
}


