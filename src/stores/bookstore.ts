/**
 * 书城状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Book, BookDetail, Category, Banner, HomepageData } from '@/types/bookstore'
import {
  getHomepage,
  getBookDetail,
  getCategoryTree,
  getBanners,
} from '@/api/bookstore'

export const useBookstoreStore = defineStore('bookstore', () => {
  // 状态
  const homepageData = ref<HomepageData | null>(null)
  const currentBook = ref<BookDetail | null>(null)
  const categories = ref<Category[]>([])
  const banners = ref<Banner[]>([])
  const isLoading = ref(false)

  /**
   * 获取首页数据
   */
  async function fetchHomepage() {
    try {
      isLoading.value = true
      const data = await getHomepage()
      homepageData.value = data

      if (data.banners) {
        banners.value = data.banners
      }
      if (data.categories) {
        categories.value = data.categories
      }

      return data
    } catch (error) {
      console.error('获取首页数据失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取书籍详情
   */
  async function fetchBookDetail(bookId: string) {
    try {
      isLoading.value = true
      const data = await getBookDetail(bookId)
      currentBook.value = data
      return data
    } catch (error) {
      console.error('获取书籍详情失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取分类树
   */
  async function fetchCategoryTree() {
    try {
      const data = await getCategoryTree()
      categories.value = data
      return data
    } catch (error) {
      console.error('获取分类树失败:', error)
      throw error
    }
  }

  /**
   * 获取Banner列表
   */
  async function fetchBanners() {
    try {
      const data = await getBanners()
      banners.value = data
      return data
    } catch (error) {
      console.error('获取Banner失败:', error)
      throw error
    }
  }

  /**
   * 清除当前书籍
   */
  function clearCurrentBook() {
    currentBook.value = null
  }

  return {
    // 状态
    homepageData,
    currentBook,
    categories,
    banners,
    isLoading,

    // 方法
    fetchHomepage,
    fetchBookDetail,
    fetchCategoryTree,
    fetchBanners,
    clearCurrentBook,
  }
})
