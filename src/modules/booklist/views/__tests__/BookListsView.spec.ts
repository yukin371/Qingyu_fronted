import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ElDialog, ElSkeleton, ElSkeletonItem } from 'element-plus'
import BookListsView from '../BookListsView.vue'
import { useBooklistStore } from '../../stores/booklist.store'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElDialog: { name: 'ElDialog', template: '<div><slot /></div>' },
  ElSkeleton: { name: 'ElSkeleton', template: '<div><slot /></div>' },
  ElSkeletonItem: { name: 'ElSkeletonItem', template: '<div />' }
}))

// Mock design system components
vi.mock('@/design-system/components', () => ({
  QyButton: { name: 'QyButton', template: '<button><slot /></button>' },
  QyIcon: { name: 'QyIcon', template: '<i />' },
  QyBadge: { name: 'QyBadge', template: '<span><slot /></span>' },
  QyEmpty: { name: 'QyEmpty', template: '<div><slot /></div>' }
}))

describe('BookListsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(BookListsView, {
      global: {
        stubs: {
          BooklistCard: true,
          BooklistForm: true
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays page title', () => {
    const wrapper = mount(BookListsView, {
      global: {
        stubs: {
          BooklistCard: true,
          BooklistForm: true
        }
      }
    })
    expect(wrapper.text()).toContain('书单广场')
    expect(wrapper.text()).toContain('发现精彩书单，分享阅读乐趣')
  })

  it('displays create button', () => {
    const wrapper = mount(BookListsView, {
      global: {
        stubs: {
          BooklistCard: true,
          BooklistForm: true
        }
      }
    })
    expect(wrapper.text()).toContain('创建书单')
  })

  it('displays sort options', () => {
    const wrapper = mount(BookListsView, {
      global: {
        stubs: {
          BooklistCard: true,
          BooklistForm: true
        }
      }
    })
    expect(wrapper.text()).toContain('最新')
    expect(wrapper.text()).toContain('最热')
    expect(wrapper.text()).toContain('最多书籍')
  })

  it('displays empty state when no booklists', () => {
    const wrapper = mount(BookListsView, {
      global: {
        stubs: {
          BooklistCard: true,
          BooklistForm: true
        }
      }
    })
    const store = useBooklistStore()
    store.booklists = []
    store.loading = false
    expect(wrapper.text()).toContain('暂无书单')
  })
})
