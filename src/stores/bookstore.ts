/**
 * 书城状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Book, BookDetail, Category, Banner, HomepageData } from '@/modules/bookstore/types'
import { getHomepage } from '@/modules/bookstore/api/homepage'
import { getBookDetail, searchBooks as searchBooksAPI } from '@/modules/bookstore/api'
import { getCategoryTree } from '@/modules/bookstore/api/categories'
import { getBanners } from '@/modules/bookstore/api/banners'

export const useBookstoreStore = defineStore('bookstore', () => {
  // 状态
  const homepageData = ref<HomepageData | null>(null)
  const currentBook = ref<BookDetail | null>(null)
  const categories = ref<Category[]>([])
  const banners = ref<Banner[]>([])
  const isLoading = ref(false)

  // 搜索相关状态
  const books = ref({
    searchResults: [] as Book[],
    searchResultsCount: 0
  })

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
      console.log('[fetchBookDetail] Fetching book detail for ID:', bookId)

      // httpService会自动将snake_case转换为camelCase
      const data = await getBookDetail(bookId)

      console.log('[fetchBookDetail] Received data from API:', data)

      // 数据可能被httpService自动转换，也可能需要手动处理
      // 兼容多种可能的数据结构
      let bookDetail = data

      // 如果data有嵌套的data或book字段，提取出来
      if (data && typeof data === 'object') {
        if ((data as any).data) {
          bookDetail = (data as any).data
        } else if ((data as any).book) {
          bookDetail = (data as any).book
        }
      }

      console.log('[fetchBookDetail] Processed book detail:', bookDetail)
      console.log('[fetchBookDetail] Book title:', bookDetail?.title)
      console.log('[fetchBookDetail] Book cover:', bookDetail?.cover)

      currentBook.value = bookDetail as BookDetail
      return bookDetail
    } catch (error) {
      console.error('[fetchBookDetail] 获取书籍详情失败:', error)
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

  /**
   * 搜索书籍
   */
  async function searchBooks(keyword: string, filters?: any) {
    try {
      isLoading.value = true
      const params: any = {
        keyword,
        page: filters?.page || 1,
        size: filters?.size || 20,
      }
      if (filters?.category) params.category = filters.category
      if (filters?.status) params.status = filters.status
      if (filters?.sort) params.sort = filters.sort

      const response = await searchBooksAPI(params)

      // 处理搜索结果
      let results: Book[] = []
      let total = 0

      if (response) {
        if (Array.isArray(response)) {
          results = response
          total = response.length
        } else if ((response as any).data && Array.isArray((response as any).data)) {
          results = (response as any).data
          total = (response as any).total || results.length
        } else if ((response as any).books && Array.isArray((response as any).books)) {
          results = (response as any).books
          total = (response as any).total || results.length
        }
      }

      books.value.searchResults = results
      books.value.searchResultsCount = total

      return { results, total }
    } catch (error) {
      console.error('[searchBooks] 搜索失败:', error)
      books.value.searchResults = []
      books.value.searchResultsCount = 0
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    homepageData,
    currentBook,
    categories,
    banners,
    isLoading,
    books,

    // 方法
    fetchHomepage,
    fetchBookDetail,
    fetchCategoryTree,
    fetchBanners,
    clearCurrentBook,
    searchBooks,
  }
})
