/**
 * 系统配置管理 API
 */

import axios from 'axios'

const API_BASE = '/api/v1/admin/config'

/**
 * 配置项接口
 */
export interface ConfigItem {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'object'
  description: string
  editable: boolean
  sensitive: boolean
}

/**
 * 配置组接口
 */
export interface ConfigGroup {
  name: string
  description: string
  items: ConfigItem[]
}

/**
 * 更新配置请求
 */
export interface UpdateConfigRequest {
  key: string
  value: any
}

/**
 * 批量更新配置请求
 */
export interface BatchUpdateConfigRequest {
  updates: UpdateConfigRequest[]
}

/**
 * 验证配置请求
 */
export interface ValidateConfigRequest {
  yaml_content: string
}

/**
 * 获取所有配置
 */
export const getAllConfigs = async (): Promise<ConfigGroup[]> => {
  const response = await axios.get(`${API_BASE}`)
  return response.data.data.groups
}

/**
 * 根据Key获取配置
 */
export const getConfigByKey = async (key: string): Promise<ConfigItem> => {
  const response = await axios.get(`${API_BASE}/${key}`)
  return response.data.data
}

/**
 * 更新配置
 */
export const updateConfig = async (request: UpdateConfigRequest): Promise<void> => {
  await axios.put(API_BASE, request)
}

/**
 * 批量更新配置
 */
export const batchUpdateConfig = async (request: BatchUpdateConfigRequest): Promise<void> => {
  await axios.put(`${API_BASE}/batch`, request)
}

/**
 * 验证配置
 */
export const validateConfig = async (request: ValidateConfigRequest): Promise<void> => {
  await axios.post(`${API_BASE}/validate`, request)
}

/**
 * 获取配置备份列表
 */
export const getConfigBackups = async (): Promise<string[]> => {
  const response = await axios.get(`${API_BASE}/backups`)
  return response.data.data.backups
}

/**
 * 恢复配置备份
 */
export const restoreConfigBackup = async (): Promise<void> => {
  await axios.post(`${API_BASE}/restore`)
}

