/**
 * 书城 - 首页相关API
 */

import { httpService } from '@/core/services/http.service'
import type { HomepageData } from '../types'

/**
 * 获取书城首页数据
 * GET /api/v1/bookstore/homepage
 */
export function getHomepage() {
  return httpService.get<HomepageData>('/bookstore/homepage')
}

