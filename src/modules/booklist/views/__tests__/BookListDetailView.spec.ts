/**
 * BookListDetailView视图测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createMockBooklist } from '../../../../tests/fixtures'
import { mockRouter, mockRoute } from '@/tests/utils/api-mock'
import { useBooklistStore } from '../../stores/booklist.store'
import BookListDetailView from '../BookListDetailView.vue'

// Mock设计系统组件
vi.mock('@/design-system/components', () => ({
  QyAvatar: {
    template: '<div class="qy-avatar">{{ name }}</div>',
    props: ['src', 'name', 'size'],
  },
  QyButton: {
    template: '<button class="qy-button" @click="$emit(\'click\')"><slot /></button>',
    props: ['variant'],
    emits: ['click'],
  },
  QyIcon: {
    template: '<i class="qy-icon" />',
    props: ['name', 'size'],
  },
  QyBadge: {
    template: '<span class="qy-badge"><slot /></span>',
    props: ['variant'],
  },
}))

// Mock Element Plus组件
vi.mock('element-plus', () => ({
  ElSkeleton: {
    template: '<div class="el-skeleton"><slot name="template" /></div>',
  },
  ElSkeletonItem: {
    template: '<div class="el-skeleton-item" />',
    props: ['variant', 'style'],
  },
}))

// Mock API
vi.mock('../../api', () => ({
  getBookListDetail: vi.fn(),
  favoriteBookList: vi.fn(),
  unfavoriteBookList: vi.fn(),
}))

import * as booklistApi from '../../api'

describe('BookListDetailView', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    // 创建新的pinia实例
    pinia = createPinia()
    setActivePinia(pinia)

    // 创建mock router
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/booklist/:id',
          name: 'booklist-detail',
          component: BookListDetailView,
        },
      ],
    })

    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render loading state initially', () => {
      // Arrange
      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // Assert
      expect(wrapper.find('.loading-state').exists()).toBe(true)
    })

    it('should render booklist detail when data is loaded', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        id: 'booklist_123',
        title: '测试书单',
        description: '测试描述',
      })
      vi.mocked(booklistApi.getBookListDetail).mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // 等待数据加载
      await new Promise((resolve) => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('测试书单')
      expect(wrapper.text()).toContain('测试描述')
    })

    it('should render booklist tags', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        tags: ['玄幻', '仙侠', '都市'],
      })
      vi.mocked(booklistApi.getBookListDetail).mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // 等待数据加载
      await new Promise((resolve) => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('玄幻')
      expect(wrapper.text()).toContain('仙侠')
      expect(wrapper.text()).toContain('都市')
    })

    it('should render booklist stats', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        bookCount: 10,
        viewCount: 1000,
        likeCount: 50,
      })
      vi.mocked(booklistApi.getBookListDetail).mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // 等待数据加载
      await new Promise((resolve) => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.text()).toContain('10 本书')
      expect(wrapper.text()).toContain('1.0k')
      expect(wrapper.text()).toContain('50')
    })
  })

  describe('interactions', () => {
    it('should handle favorite button click', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        id: 'booklist_123',
        isLiked: false,
      })
      vi.mocked(booklistApi.getBookListDetail).mockResolvedValue(mockBooklist)
      vi.mocked(booklistApi.favoriteBookList).mockResolvedValue({ success: true })

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // 等待数据加载
      await new Promise((resolve) => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Act - 模拟点击收藏按钮
      const favoriteButton = wrapper.findAll('.qy-button').find((btn) => btn.text() === '收藏')
      await favoriteButton?.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(booklistApi.favoriteBookList).toHaveBeenCalledWith('booklist_123')
    })

    it('should handle unfavorite button click', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        id: 'booklist_123',
        isLiked: true,
      })
      vi.mocked(booklistApi.getBookListDetail).mockResolvedValue(mockBooklist)
      vi.mocked(booklistApi.unfavoriteBookList).mockResolvedValue({ success: true })

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // 等待数据加载
      await new Promise((resolve) => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Act - 模拟点击取消收藏按钮
      const unfavoriteButton = wrapper.findAll('.qy-button').find((btn) => btn.text() === '已收藏')
      await unfavoriteButton?.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(booklistApi.unfavoriteBookList).toHaveBeenCalledWith('booklist_123')
    })
  })

  describe('route params', () => {
    it('should fetch booklist detail based on route param id', async () => {
      // Arrange
      const booklistId = 'booklist_123'
      const mockBooklist = createMockBooklist({ id: booklistId })
      vi.mocked(booklistApi.getBookListDetail).mockResolvedValue(mockBooklist)

      mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: booklistId } }),
          },
        },
      })

      // 等待数据加载
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Assert
      expect(booklistApi.getBookListDetail).toHaveBeenCalledWith(booklistId)
    })

    it('should handle invalid booklist id', async () => {
      // Arrange
      const invalidId = 'invalid-id'
      const error = new Error('Booklist not found')
      vi.mocked(booklistApi.getBookListDetail).mockRejectedValue(error)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: invalidId } }),
          },
        },
      })

      // 等待数据加载
      await new Promise((resolve) => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      const store = useBooklistStore()
      expect(store.error).toEqual(error)
    })
  })

  describe('formatting functions', () => {
    it('should format numbers correctly', () => {
      // Arrange
      const mockBooklist = createMockBooklist()
      vi.mocked(booklistApi.getBookListDetail).mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // Act & Assert
      expect(wrapper.vm.formatNumber(1000)).toBe('1.0k')
      expect(wrapper.vm.formatNumber(10000)).toBe('1.0w')
      expect(wrapper.vm.formatNumber(100)).toBe('100')
    })

    it('should format dates correctly', () => {
      // Arrange
      const mockBooklist = createMockBooklist()
      vi.mocked(booklistApi.getBookListDetail).mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // Act & Assert
      const date = new Date('2024-01-01T00:00:00Z')
      const formatted = wrapper.vm.formatDate(date)
      expect(formatted).toBeTruthy()
    })
  })

  describe('creator check', () => {
    it('should show edit button when user is creator', async () => {
      // Arrange
      const currentUserId = 'user_123'
      const mockBooklist = createMockBooklist({
        creatorId: currentUserId,
      })
      vi.mocked(booklistApi.getBookListDetail).mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // 等待数据加载
      await new Promise((resolve) => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.isCreator).toBe(true)
    })

    it('should not show edit button when user is not creator', async () => {
      // Arrange
      const mockBooklist = createMockBooklist({
        creatorId: 'user_456',
      })
      vi.mocked(booklistApi.getBookListDetail).mockResolvedValue(mockBooklist)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // 等待数据加载
      await new Promise((resolve) => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.isCreator).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle fetch error gracefully', async () => {
      // Arrange
      const error = new Error('Network error')
      vi.mocked(booklistApi.getBookListDetail).mockRejectedValue(error)

      const wrapper = mount(BookListDetailView, {
        global: {
          plugins: [pinia, router],
          mocks: {
            $router: mockRouter(),
            $route: mockRoute({ params: { id: 'booklist_123' } }),
          },
        },
      })

      // 等待数据加载
      await new Promise((resolve) => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Assert
      const store = useBooklistStore()
      expect(store.error).toEqual(error)
      expect(store.loading).toBe(false)
    })
  })
})
