import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type { BookBrief } from '@/types/models'
import type { BrowseFilters } from '@/types/models'

export const useBrowseStore = defineStore('browse', () => {
  // State
  const books = ref<BookBrief[]>([])
  
  const filters = reactive<BrowseFilters>({
    q: '',
    categoryId: '',
    year: '',
    status: '',
    tags: [],
    sortBy: 'updateTime',
    page: 1,
    pageSize: 24,
    tagMode: 'and'
  })
  
  const pagination = reactive({
    total: 0,
    hasMore: false
  })
  
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Getters
  const hasActiveFilters = computed(() => {
    return !!(
      filters.q ||
      filters.categoryId ||
      filters.year ||
      filters.status ||
      filters.tags.length > 0
    )
  })

  const isMobile = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 640
  })

  // Actions
  const updateFilters = (newFilters: Partial<BrowseFilters>) => {
    Object.assign(filters, newFilters)
    
    // 非page字段变化时重置page
    if (!newFilters.page) {
      filters.page = 1
    }
  }

  const resetFilters = () => {
    filters.q = ''
    filters.categoryId = ''
    filters.year = ''
    filters.status = ''
    filters.tags = []
    filters.sortBy = 'updateTime'
    filters.page = 1
    filters.tagMode = 'and'
    error.value = null
  }

  return {
    // State
    books,
    filters,
    pagination,
    loading,
    error,
    // Getters
    hasActiveFilters,
    isMobile,
    // Actions
    updateFilters,
    resetFilters
  }
})
