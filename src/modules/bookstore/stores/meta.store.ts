// src/modules/bookstore/stores/meta.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { browseService } from '../services/browse.service'
import type { Category, Tag } from '@/types/models'

export const useMetaStore = defineStore('bookstoreMeta', () => {
  // State
  const categories = ref<Category[]>([])
  const years = ref<string[]>([])
  const tags = ref<Tag[]>([])
  const _categoriesLoaded = ref(false)
  const _yearsLoaded = ref(false)
  const _tagsLoaded = ref(false)

  // Actions
  const getCategories = async (force = false) => {
    if (_categoriesLoaded.value && !force) {
      return categories.value
    }

    try {
      const response = await browseService.getCategories()
      categories.value = response.data || []
      _categoriesLoaded.value = true
      return categories.value
    } catch (error) {
      console.error('获取分类失败:', error)
      categories.value = []
      return categories.value
    }
  }

  const getYears = async (force = false) => {
    if (_yearsLoaded.value && !force) {
      return years.value
    }

    try {
      const response = await browseService.getYears()
      years.value = response.data || []
      _yearsLoaded.value = true
      return years.value
    } catch (error) {
      console.error('获取年份失败:', error)
      years.value = []
      return years.value
    }
  }

  const getTags = async (categoryId?: string, force = false) => {
    // 简化版本，实际可以根据categoryId缓存不同结果
    if (_tagsLoaded.value && !force) {
      return tags.value
    }

    try {
      const response = await browseService.getTags(categoryId)
      tags.value = response.data || []
      _tagsLoaded.value = true
      return tags.value
    } catch (error) {
      console.error('获取标签失败:', error)
      tags.value = []
      return tags.value
    }
  }

  return {
    categories,
    years,
    tags,
    getCategories,
    getYears,
    getTags
  }
})
