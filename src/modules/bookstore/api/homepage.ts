/**
 * 书城 - 首页相关API
 */

import { httpService } from '@/core/services/http.service'
import type { HomepageData } from '../types'

/**
 * 获取书城首页数据
 * @description 获取书城首页的所有数据，包括轮播图、推荐书籍、排行榜等
 * @endpoint GET /api/v1/bookstore/homepage
 * @category homepage
 * @tags 首页
 * @response {HomepageData} 200 - 成功返回首页数据
 */
export function getHomepage() {
  return httpService.get<HomepageData>('/bookstore/homepage')
}

