/**
 * AI Direct API Client
 * 直接连接AI服务（演示模式）
 */

import axios, { AxiosInstance } from 'axios'
import type { ChatMessage, AIGenerateResponse } from './ai'

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'
const AI_DIRECT_MODE = import.meta.env.VITE_AI_DIRECT_MODE === 'true'

// 调试日志
console.log('[AI Direct] 配置:', { AI_SERVICE_URL, AI_DIRECT_MODE })

const createDirectClient = (): AxiosInstance => {
  return axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

const directClient = createDirectClient()

export const isDirectModeEnabled = (): boolean => {
  console.log('[AI Direct] isDirectModeEnabled:', AI_DIRECT_MODE)
  return AI_DIRECT_MODE
}

export const aiDirectApi = {
  health: async (): Promise<{ status: string; [key: string]: any }> => {
    const response = await directClient.get('/api/v1/health')
    return response.data
  },

  chat: async (
    message: string,
    history?: ChatMessage[]
  ): Promise<{ reply: string; usage?: any }> => {
    // AI服务期望的格式: { messages: [{ role, content }] }
    const messages = [
      ...(history || []),
      { role: 'user' as const, content: message }
    ]
    const response = await directClient.post('/api/v1/ai/chat', {
      messages,
      model: 'gpt-4'
    })
    return {
      reply: response.data?.message || response.data?.reply || '',
      usage: response.data?.usage
    }
  },

  writing: {
    // 续写: POST /api/v1/ai/writing/continue
    continue: async (text: string, length: number = 200): Promise<AIGenerateResponse> => {
      const response = await directClient.post('/api/v1/ai/writing/continue', {
        project_id: 'demo-project',  // 演示模式使用默认项目ID
        current_text: text,
        continue_length: length
      })
      return {
        generated_text: response.data?.generated_text,
        usage: response.data?.usage
      }
    },

    // 润色: POST /api/v1/ai/writing/polish
    polish: async (text: string): Promise<AIGenerateResponse> => {
      const response = await directClient.post('/api/v1/ai/writing/polish', {
        text
      })
      return {
        polished_text: response.data?.generated_text,
        usage: response.data?.usage
      }
    },

    // 扩写: POST /api/v1/ai/writing/expand
    expand: async (text: string, ratio: number = 1.5): Promise<AIGenerateResponse> => {
      const response = await directClient.post('/api/v1/ai/writing/expand', {
        text,
        expand_ratio: ratio
      })
      return {
        expanded_text: response.data?.generated_text,
        usage: response.data?.usage
      }
    },

    // 改写: 暂无对应API，使用润色代替
    rewrite: async (text: string): Promise<AIGenerateResponse> => {
      const response = await directClient.post('/api/v1/ai/writing/polish', {
        text
      })
      return {
        rewritten_text: response.data?.generated_text,
        usage: response.data?.usage
      }
    }
  }
}

export default aiDirectApi
