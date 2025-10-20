import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证token
    const authStore = useAuthStore()
    if (authStore.token && config.headers) {
      config.headers.set('Authorization', `Bearer ${authStore.token}`)
    }

    // 添加请求时间戳，防止缓存
    if ((config.method || 'get').toLowerCase() === 'get') {
      config.params = {
        ...(config.params as Record<string, unknown>),
        _t: Date.now()
      }
    }

    return config
  },
  (error: unknown) => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    const { data } = response

    // 统一处理响应格式
    if (data && typeof data === 'object' && 'code' in data) {
      // 2xx状态码都视为成功
      if (data.code >= 200 && data.code < 300) {
        return data.data ?? data
      } else {
        // 业务错误
        const errorMessage = data.message || '请求失败'
        ElMessage.error(errorMessage)
        return Promise.reject(new Error(errorMessage))
      }
    }

    // 直接返回数据
    return data
  },
  (error: AxiosError<any>) => {
    console.error('API请求错误:', error)

    // 处理HTTP状态码错误
    if (error.response) {
      const { status, data } = error.response
      let errorMessage = '请求失败'

      switch (status) {
        case 400:
          errorMessage = (data as any)?.message || '请求参数错误'
          break
        case 401: {
          errorMessage = '未授权，请重新登录'
          // 清除token并跳转到登录页
          const authStore = useAuthStore()
          authStore.logout()
          break
        }
        case 403:
          errorMessage = '权限不足'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        case 502:
          errorMessage = '网关错误'
          break
        case 503:
          errorMessage = '服务不可用'
          break
        default:
          errorMessage = (data as any)?.message || `请求失败 (${status})`
      }

      ElMessage.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    } else if (error.request) {
      // 网络错误
      const errorMessage = '网络连接失败，请检查网络设置'
      ElMessage.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    } else {
      // 其他错误
      const errorMessage = (error as any).message || '未知错误'
      ElMessage.error(errorMessage)
      return Promise.reject(error)
    }
  }
)

export default request


