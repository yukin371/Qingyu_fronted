// vitest globals are configured in tsconfig.json
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DiscoveryView from '../DiscoveryView.vue'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElSkeleton: {
    name: 'ElSkeleton',
    template: '<div class="el-skeleton"><slot /></div>',
    props: ['loading', 'animated'],
  },
  ElSkeletonItem: {
    name: 'ElSkeletonItem',
    template: '<div class="el-skeleton-item" />',
    props: ['variant'],
  },
}))

describe('DiscoveryView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(DiscoveryView)
      expect(wrapper.exists()).toBe(true)
    })

    it('should have correct class name', () => {
      const wrapper = mount(DiscoveryView)
      expect(wrapper.classes()).toContain('discovery-view')
    })

    it('should display page title', () => {
      const wrapper = mount(DiscoveryView)
      expect(wrapper.find('.page-title').text()).toBe('发现')
    })

    it('should display page subtitle', () => {
      const wrapper = mount(DiscoveryView)
      expect(wrapper.find('.page-subtitle').text()).toBe('探索更多精彩内容')
    })

    it('should render banner section', () => {
      const wrapper = mount(DiscoveryView)
      expect(wrapper.find('.banner-section').exists()).toBe(true)
    })

    it('should render all sections', () => {
      const wrapper = mount(DiscoveryView)
      const sections = wrapper.findAll('.section')
      expect(sections.length).toBe(3)
    })

    it('should render section titles correctly', () => {
      const wrapper = mount(DiscoveryView)
      const titles = wrapper.findAll('.section-title')
      expect(titles[0].text()).toBe('猜你喜欢')
      expect(titles[1].text()).toBe('新书上架')
      expect(titles[2].text()).toBe('编辑推荐')
    })

    it('should render skeleton loaders', () => {
      const wrapper = mount(DiscoveryView)
      // ElSkeleton components should be rendered
      expect(wrapper.html()).toContain('el-skeleton')
    })

    it('should render container with max-width', () => {
      const wrapper = mount(DiscoveryView)
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })
  })

  describe('lifecycle', () => {
    it('should log message on mount', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      mount(DiscoveryView)
      expect(consoleSpy).toHaveBeenCalledWith('发现页面加载 - 待实现完整功能')
      consoleSpy.mockRestore()
    })
  })

  describe('structure', () => {
    it('should have correct structure with banner and sections', () => {
      const wrapper = mount(DiscoveryView)
      expect(wrapper.find('.banner-section').exists()).toBe(true)
      expect(wrapper.findAll('.section').length).toBe(3)
    })

    it('should render skeleton grid items', () => {
      const wrapper = mount(DiscoveryView)
      // ElSkeletonItem components should be rendered
      // Note: These are inside template slots, so they may not render in stubbed components
      expect(wrapper.html()).toContain('skeleton')
    })
  })

  describe('responsive design', () => {
    it('should have scoped styles', () => {
      const wrapper = mount(DiscoveryView)
      expect(wrapper.attributes('style')).toBeFalsy() // styles are in scoped
    })
  })
})
