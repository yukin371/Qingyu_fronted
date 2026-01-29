/**
 * API 请求适配器
 * 为新的 API 模块提供简化的请求封装
 */
import { httpService } from '@/core/services/http.service'
import type { RequestConfig } from '@/core/services/http.service'
import type { APIResponse } from '@/core/types/api.types'
import type { AxiosError } from 'axios'

// 通用请求方法
interface RequestOption extends RequestConfig {
  url: string
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch'
  data?: any
  params?: any
}

// 请求函数
export function request<T = any>(options: RequestOption) {
  const { url, method = 'get', data, params, ...config } = options

  // 构建 httpService 参数
  const httpOptions: RequestConfig = {
    ...config,
    method,
    url
  }

  if (method === 'get') {
    httpOptions.params = data || params
  } else {
    httpOptions.data = data
  }

  // 返回处理后的数据
  return new Promise<T>((resolve, reject) => {
    httpService
      .request<APIResponse<T>>({
        ...httpOptions,
        returnFullResponse: false
      } as any)
      .then((res: any) => {
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
export function get<T = any>(url: string, params?: any) {
  return request<T>({ url, method: 'get', params })
}

// 简化的 POST 请求
export function post<T = any>(url: string, data?: any) {
  return request<T>({ url, method: 'post', data })
}

// 简化的 PUT 请求
export function put<T = any>(url: string, data?: any) {
  return request<T>({ url, method: 'put', data })
}

// 简化的 DELETE 请求
export function del<T = any>(url: string, params?: any) {
  return request<T>({ url, method: 'delete', params })
}

export default {
  request,
  get,
  post,
  put,
  delete: del
}
