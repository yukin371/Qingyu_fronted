import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import BrowseBooksView from '@/modules/bookstore/views/BrowseBooksView.vue'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/bookstore/browse',
      component: { template: '<div></div>' }
    }
  ]
})

// Mock components
vi.mock('@/modules/bookstore/components/BrowseBooks/SearchBar.vue', () => ({
  default: {
    name: 'SearchBar',
    template: '<div class="search-bar-mock"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
    props: ['modelValue'],
    emits: ['update:modelValue', 'search', 'clear']
  }
}))

vi.mock('@/modules/bookstore/components/BrowseBooks/FilterBar.vue', () => ({
  default: {
    name: 'FilterBar',
    template: '<div class="filter-bar-mock"></div>',
    props: ['categoryId', 'year', 'status', 'categories', 'years', 'statuses'],
    emits: ['update:categoryId', 'update:year', 'update:status']
  }
}))

vi.mock('@/modules/bookstore/components/BrowseBooks/TagFilter.vue', () => ({
  default: {
    name: 'TagFilter',
    template: '<div class="tag-filter-mock"></div>',
    props: ['selectedTags', 'availableTags'],
    emits: ['update:selectedTags']
  }
}))

describe('BrowseBooksView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render page title', () => {
    const wrapper = mount(BrowseBooksView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.find('.page-title').text()).toBe('探索书库')
  })

  it('should render subtitle', () => {
    const wrapper = mount(BrowseBooksView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.find('.page-subtitle').text()).toBe('发现你喜欢的精彩书籍')
  })

  it('should initialize with empty filters', () => {
    const wrapper = mount(BrowseBooksView, {
      global: {
        plugins: [router]
      }
    })
    
    expect(wrapper.vm.browseStore.filters.q).toBe('')
    expect(wrapper.vm.browseStore.filters.categoryId).toBe('')
  })

  it('should show reset button when filters are active', async () => {
    const wrapper = mount(BrowseBooksView, {
      global: {
        plugins: [router]
      }
    })
    
    // 初始状态没有重置按钮
    const buttons = wrapper.findAll('button')
    const resetButton = buttons.find(btn => btn.text().includes('重置'))
    expect(resetButton).toBeUndefined()
    
    // 设置筛选条件
    wrapper.vm.browseStore.updateFilters({ q: '测试' })
    await wrapper.vm.$nextTick()
    
    // 现在应该有重置按钮
    const updatedButtons = wrapper.findAllComponents({ name: 'Button' })
    expect(updatedButtons.length).toBeGreaterThan(0)
  })
})
