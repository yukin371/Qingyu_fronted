/**
 * HTTP Request Alias
 * 导出 httpService 作为 http，提供简洁的API调用方式
 */

import { httpService } from './services/http.service'

/**
 * HTTP请求方法别名
 * 提供与httpService相同的功能，但使用更简洁的命名
 */
export const http = httpService

export default http
