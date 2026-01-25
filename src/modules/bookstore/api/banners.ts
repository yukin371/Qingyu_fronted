/**
 * 书城 - Banner相关API
 */

import { httpService } from '@/core/services/http.service'
import type { Banner } from '../types'

/**
 * 获取轮播图列表
 * @description 获取首页轮播图列表，用于展示推荐内容
 * @endpoint GET /api/v1/bookstore/banners
 * @category banners
 * @tags 轮播图
 * @response {Banner[]} 200 - 成功返回轮播图列表
 */
export function getBanners() {
  return httpService.get<Banner[]>('/bookstore/banners')
}

/**
 * 增加轮播图点击量
 * @description 记录轮播图被点击的次数，用于统计和优化推荐
 * @endpoint POST /api/v1/bookstore/banners/:id/click
 * @category banners
 * @tags 轮播图
 * @param {string} bannerId - 轮播图ID
 * @response {void} 200 - 点击记录成功
 */
export function incrementBannerClick(bannerId: string) {
  return httpService.post<void>(`/bookstore/banners/${bannerId}/click`)
}

