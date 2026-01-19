/**
 * 书城 - Banner相关API
 */

import { httpService } from '@/core/services/http.service'
import type { Banner } from '../types'

/**
 * 获取Banner列表
 * GET /api/v1/bookstore/banners
 */
export function getBanners() {
  return httpService.get<Banner[]>('/bookstore/banners')
}

/**
 * 增加Banner点击量
 * POST /api/v1/bookstore/banners/:id/click
 */
export function incrementBannerClick(bannerId: string) {
  return httpService.post<void>(`/bookstore/banners/${bannerId}/click`)
}

