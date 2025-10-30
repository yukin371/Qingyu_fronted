/**
 * 书城 - 首页相关API
 */

import request from '@/utils/request'
import type { HomepageData } from '@/types/bookstore'

/**
 * 获取书城首页数据
 * GET /api/v1/bookstore/homepage
 */
export function getHomepage() {
  return request.get<HomepageData>('/bookstore/homepage')
}

