/**
 * AI Writing Assistant API
 * 提供对话、续写、润色、扩写、改写等AI功能
 */

import request from '@/utils/request'

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
 * AI对话接口
 * @param message 用户消息
 * @param history 对话历史（可选）
 * @returns AI回复
 */
export const chatWithAI = async (
  message: string,
  history?: ChatMessage[]
): Promise<{ reply: string; usage?: any }> => {
  const response = await request.post('/api/v1/ai/chat', {
    message,
    history: history || []
  })

  return {
    reply: response.data?.reply || response.data?.message || '',
    usage: response.data?.usage
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
  const response = await request.post('/api/v1/ai/generate', {
    projectId,
    currentText,
    prompt: currentText,
    continueLength: length,
    type: 'continue'
  })

  return response.data || {}
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
  const response = await request.post('/api/v1/ai/polish', {
    projectId,
    originalText: text,
    rewriteMode: 'polish',
    instructions: instructions || '提升文学性和表达力'
  })

  return response.data || {}
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
  const response = await request.post('/api/v1/ai/expand', {
    projectId,
    originalText: text,
    rewriteMode: 'expand',
    instructions: instructions || '扩展为更详细的描述',
    targetLength
  })

  return response.data || {}
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
  const response = await request.post('/api/v1/ai/rewrite', {
    projectId,
    originalText: text,
    rewriteMode: mode,
    instructions
  })

  return response.data || {}
}

/**
 * 获取AI服务健康状态
 * @returns 健康状态
 */
export const getAIHealth = async (): Promise<any> => {
  const response = await request.get('/api/v1/ai/health')
  return response.data || {}
}

/**
 * 获取AI提供商列表
 * @returns 提供商列表
 */
export const getAIProviders = async (): Promise<any> => {
  const response = await request.get('/api/v1/ai/providers')
  return response.data || {}
}

/**
 * 获取AI模型列表
 * @returns 模型列表
 */
export const getAIModels = async (): Promise<any> => {
  const response = await request.get('/api/v1/ai/models')
  return response.data || {}
}

export default {
  chatWithAI,
  continueWriting,
  polishText,
  expandText,
  rewriteText,
  getAIHealth,
  getAIProviders,
  getAIModels
}


