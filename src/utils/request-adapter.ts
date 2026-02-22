/**
 * API 请求适配器
 * 为新的 API 模块提供简化的请求封装
 */
import { httpService } from '@/core/services/http.service'
import type { APIResponse } from '@/types/api'
import type { AxiosError } from 'axios'

// 通用请求方法
interface RequestOption {
  url: string
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch'
  data?: unknown
  params?: unknown
  headers?: Record<string, string>
  timeout?: number
}

// 请求函数
export function request<T = unknown>(options: RequestOption) {
  const { url, method = 'get', data, params, ...config } = options

  // 返回处理后的数据
  return new Promise<T>((resolve, reject) => {
    const httpConfig = { ...config, params }

    let promise: Promise<APIResponse<T>>

    switch (method) {
      case 'post':
        promise = httpService.post<APIResponse<T>>(url, data, httpConfig)
        break
      case 'put':
        promise = httpService.put<APIResponse<T>>(url, data, httpConfig)
        break
      case 'delete':
        promise = httpService.delete<APIResponse<T>>(url, httpConfig)
        break
      case 'patch':
        promise = httpService.patch<APIResponse<T>>(url, data, httpConfig)
        break
      case 'get':
      default:
        promise = httpService.get<APIResponse<T>>(url, { ...httpConfig, params: data || params })
        break
    }

    promise
      .then((res: APIResponse<T>) => {
        // 假设后端返回格式为 { code, message, data }
        if (res.code === 200 || res.code === 0) {
          resolve(res.data as T)
        } else {
          reject(new Error(res.message || '请求失败'))
        }
      })
      .catch((error: AxiosError) => {
        reject(error)
      })
  })
}

// 简化的 GET 请求
export function get<T = unknown>(url: string, params?: unknown) {
  return request<T>({ url, method: 'get', params })
}

// 简化的 POST 请求
export function post<T = unknown>(url: string, data?: unknown) {
  return request<T>({ url, method: 'post', data })
}

// 简化的 PUT 请求
export function put<T = unknown>(url: string, data?: unknown) {
  return request<T>({ url, method: 'put', data })
}

// 简化的 DELETE 请求
export function del<T = unknown>(url: string, params?: unknown) {
  return request<T>({ url, method: 'delete', params })
}

export default {
  request,
  get,
  post,
  put,
  delete: del
}
