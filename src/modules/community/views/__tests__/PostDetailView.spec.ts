/**
 * PostDetailView视图测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PostDetailView from '../PostDetailView.vue'

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

// Mock设计系统组件
vi.mock('@/design-system/components', () => ({
  QyIcon: {
    template: '<i class="qy-icon" />',
    props: ['name'],
  },
}))

describe('PostDetailView', () => {
  describe('rendering', () => {
    it('should render view correctly', () => {
      // Act
      const wrapper = mount(PostDetailView)

      // Assert
      expect(wrapper.find('.post-detail-view').exists()).toBe(true)
    })

    it('should render container', () => {
      // Act
      const wrapper = mount(PostDetailView)

      // Assert
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should show development in progress message', () => {
      // Act
      const wrapper = mount(PostDetailView)

      // Assert
      expect(wrapper.text()).toContain('动态详情页开发中')
    })
  })

  describe('structure', () => {
    it('should have correct CSS classes', () => {
      // Act
      const wrapper = mount(PostDetailView)

      // Assert
      expect(wrapper.find('.post-detail-view').exists()).toBe(true)
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })
})
