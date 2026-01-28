/**
 * TopicPostsView视图测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TopicPostsView from '../TopicPostsView.vue'

// Mock Element Plus组件
vi.mock('element-plus', () => ({
  ElEmpty: {
    template: '<div class="el-empty"><slot name="image" /><div class="description"><slot /></slot></div>',
    props: ['description'],
  },
  ElIcon: {
    template: '<div class="el-icon"><slot /></div>',
    props: ['size', 'color'],
  },
}))

// Mock PriceTag icon
vi.mock('@element-plus/icons-vue', () => ({
  PriceTag: {
    template: '<span>PriceTag</span>',
  },
}))

describe('TopicPostsView', () => {
  describe('rendering', () => {
    it('should render view correctly', () => {
      // Act
      const wrapper = mount(TopicPostsView)

      // Assert
      expect(wrapper.find('.topic-posts-view').exists()).toBe(true)
    })

    it('should render container', () => {
      // Act
      const wrapper = mount(TopicPostsView)

      // Assert
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should show development in progress message', () => {
      // Act
      const wrapper = mount(TopicPostsView)

      // Assert
      expect(wrapper.text()).toContain('话题动态页开发中')
    })
  })

  describe('structure', () => {
    it('should have correct CSS classes', () => {
      // Act
      const wrapper = mount(TopicPostsView)

      // Assert
      expect(wrapper.find('.topic-posts-view').exists()).toBe(true)
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })
})
