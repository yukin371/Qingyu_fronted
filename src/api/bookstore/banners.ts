/**
 * 书城 - Banner相关API
 */

import request from '@/utils/request'
import type { Banner } from '@/types/bookstore'

/**
 * 获取Banner列表
 * GET /api/v1/bookstore/banners
 */
export function getBanners() {
  return request.get<Banner[]>('/bookstore/banners')
}

/**
 * 增加Banner点击量
 * POST /api/v1/bookstore/banners/:id/click
 */
export function incrementBannerClick(bannerId: string) {
  return request.post<void>(`/bookstore/banners/${bannerId}/click`)
}

