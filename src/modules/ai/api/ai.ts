/**
 * AI Writing Assistant API
 * 提供对话、续写、润色、扩写、改写等AI功能
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'
import { aiDirectApi, isDirectModeEnabled } from './ai-direct'

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
  history?: ChatMessage[]
): Promise<{ reply: string; usage?: any }> => {
  console.log('[AI API] chatWithAI called, isDirectModeEnabled:', isDirectModeEnabled())
  if (isDirectModeEnabled()) {
    console.log('[AI API] 使用直连模式')
    return aiDirectApi.chat(message, history)
  }

  console.log('[AI API] 使用httpService模式')
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
  instructions?: string
): Promise<AIGenerateResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.continue(currentText)
  }

  const trimmedInstructions = (instructions || '').trim()
  const prompt = trimmedInstructions
    ? `${currentText}\n\n续写要求：${trimmedInstructions}`
    : currentText

  const response = await httpService.post('/api/v1/ai/generate', {
    projectId,
    currentText,
    prompt,
    continueLength: length,
    type: 'continue'
  })

  return response || {}
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
  instructions?: string
): Promise<AIGenerateResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.polish(text)
  }

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
  targetLength?: number
): Promise<AIGenerateResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.expand(text)
  }

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
  instructions?: string
): Promise<AIGenerateResponse> => {
  if (isDirectModeEnabled()) {
    return aiDirectApi.writing.rewrite(text)
  }

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
 * @description 获取AI服务的健康检查状态
 * @endpoint GET /api/v1/ai/health
 * @category ai
 * @tags AI系统
 * @response {Object} 200 - 成功返回健康状态
 */
export const getAIHealth = async (): Promise<any> => {
  const response = await httpService.get('/api/v1/ai/health')
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
  const response = await httpService.get('/api/v1/ai/providers')
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
  const response = await httpService.get('/api/v1/ai/models')
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
  return httpService.get<APIResponse<QuotaInfo>>('/ai/quota')
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
  return httpService.get<APIResponse<QuotaInfo[]>>('/ai/quota/all')
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
  return httpService.get<APIResponse<QuotaStatistics>>('/ai/quota/statistics')
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
  return httpService.get<PaginatedResponse<QuotaTransaction>>('/ai/quota/transactions', { params })
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
  return httpService.get<APIResponse<ChatSession[]>>('/ai/chat/sessions')
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
  return httpService.get<APIResponse<ChatMessage[]>>(`/ai/chat/sessions/${sessionId}`)
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
  return httpService.delete<APIResponse<void>>(`/ai/chat/sessions/${sessionId}`)
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
  return httpService.post<APIResponse<ChatSession>>('/ai/chat/sessions', { title })
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

