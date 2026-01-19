/**
 * AI管理模块API
 * 管理员专用：提供商管理、模型管理、健康检查
 */

import { httpService } from '@/core/services/http.service'
import type {
  AIProvider,
  AIModel,
  AIHealthStatus,
  AISystemStats,
  AIUsageStats,
  AIActivity,
  AIProvidersResponse,
  AIModelsResponse,
  CreateProviderRequest,
  UpdateProviderRequest,
  TestProviderRequest,
  UpdateModelRequest,
  ProviderHealth
} from '../types/ai-admin.types'

// ============ API基础路径 ============
const BASE_URL = '/api/v1/admin/ai'

// ============ 提供商管理 API ============

/**
 * 获取所有AI提供商列表
 */
export async function getProviders(): Promise<AIProvidersResponse> {
  return httpService.get(`${BASE_URL}/providers`)
}

/**
 * 获取单个提供商详情
 */
export async function getProvider(providerId: string): Promise<AIProvider> {
  return httpService.get(`${BASE_URL}/providers/${providerId}`)
}

/**
 * 创建新的AI提供商
 */
export async function createProvider(data: CreateProviderRequest): Promise<AIProvider> {
  return httpService.post(`${BASE_URL}/providers`, data)
}

/**
 * 更新提供商信息
 */
export async function updateProvider(
  providerId: string,
  data: UpdateProviderRequest
): Promise<AIProvider> {
  return httpService.put(`${BASE_URL}/providers/${providerId}`, data)
}

/**
 * 删除提供商
 */
export async function deleteProvider(providerId: string): Promise<void> {
  return httpService.delete(`${BASE_URL}/providers/${providerId}`)
}

/**
 * 测试提供商连接
 */
export async function testProvider(
  providerId: string,
  testModel?: string
): Promise<{ success: boolean; message: string; responseTime: number }> {
  const data: TestProviderRequest = { providerId, testModel }
  return httpService.post(`${BASE_URL}/providers/${providerId}/test`, data)
}

/**
 * 启用/禁用提供商
 */
export async function toggleProviderStatus(
  providerId: string,
  status: 'active' | 'inactive'
): Promise<AIProvider> {
  return httpService.patch(`${BASE_URL}/providers/${providerId}/status`, { status })
}

// ============ 模型管理 API ============

/**
 * 获取所有AI模型列表
 */
export async function getModels(provider?: string): Promise<AIModelsResponse> {
  const params = provider ? { provider } : {}
  return httpService.get(`${BASE_URL}/models`, { params })
}

/**
 * 获取单个模型详情
 */
export async function getModel(modelId: string): Promise<AIModel> {
  return httpService.get(`${BASE_URL}/models/${modelId}`)
}

/**
 * 更新模型信息
 */
export async function updateModel(
  modelId: string,
  data: UpdateModelRequest
): Promise<AIModel> {
  return httpService.put(`${BASE_URL}/models/${modelId}`, data)
}

/**
 * 启用/禁用模型
 */
export async function toggleModelStatus(
  modelId: string,
  status: 'active' | 'inactive'
): Promise<AIModel> {
  return httpService.patch(`${BASE_URL}/models/${modelId}/status`, { status })
}

/**
 * 获取指定提供商的模型列表
 */
export async function getProviderModels(providerId: string): Promise<AIModel[]> {
  return httpService.get(`${BASE_URL}/providers/${providerId}/models`)
}

// ============ 系统统计 API ============

/**
 * 获取AI系统统计数据
 */
export async function getSystemStats(): Promise<AISystemStats> {
  return httpService.get(`${BASE_URL}/stats`)
}

/**
 * 获取AI使用统计数据
 */
export async function getUsageStats(params?: {
  startDate?: string
  endDate?: string
  provider?: string
  model?: string
}): Promise<AIUsageStats[]> {
  return httpService.get(`${BASE_URL}/stats/usage`, { params })
}

// ============ 健康检查 API ============

/**
 * 获取AI系统健康状态
 */
export async function getHealthStatus(): Promise<AIHealthStatus> {
  return httpService.get(`${BASE_URL}/health`)
}

/**
 * 触发健康检查
 */
export async function triggerHealthCheck(): Promise<AIHealthStatus> {
  return httpService.post(`${BASE_URL}/health/check`, {})
}

/**
 * 获取指定提供商的健康状态
 */
export async function getProviderHealth(providerId: string): Promise<ProviderHealth> {
  return httpService.get(`${BASE_URL}/providers/${providerId}/health`)
}

// ============ 活动日志 API ============

/**
 * 获取AI系统活动记录
 */
export async function getActivities(params?: {
  type?: string
  provider?: string
  limit?: number
  offset?: number
}): Promise<{ activities: AIActivity[]; total: number }> {
  return httpService.get(`${BASE_URL}/activities`, { params })
}

// ============ 设置 API ============

/**
 * 获取AI系统设置
 */
export async function getSettings(): Promise<Record<string, any>> {
  return httpService.get(`${BASE_URL}/settings`)
}

/**
 * 更新AI系统设置
 */
export async function updateSettings(settings: Record<string, any>): Promise<void> {
  return httpService.put(`${BASE_URL}/settings`, settings)
}

// 导出所有API
export const aiAdminAPI = {
  // 提供商
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  testProvider,
  toggleProviderStatus,
  getProviderModels,

  // 模型
  getModels,
  getModel,
  updateModel,
  toggleModelStatus,

  // 统计
  getSystemStats,
  getUsageStats,

  // 健康检查
  getHealthStatus,
  triggerHealthCheck,
  getProviderHealth,

  // 活动
  getActivities,

  // 设置
  getSettings,
  updateSettings
}
