/**
 * CreatePostView视图测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CreatePostView from '../CreatePostView.vue'

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

// Mock EditPen icon
vi.mock('@element-plus/icons-vue', () => ({
  EditPen: {
    template: '<span>EditPen</span>',
  },
}))

describe('CreatePostView', () => {
  describe('rendering', () => {
    it('should render view correctly', () => {
      // Act
      const wrapper = mount(CreatePostView)

      // Assert
      expect(wrapper.find('.create-post-view').exists()).toBe(true)
    })

    it('should render container', () => {
      // Act
      const wrapper = mount(CreatePostView)

      // Assert
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should show development in progress message', () => {
      // Act
      const wrapper = mount(CreatePostView)

      // Assert
      expect(wrapper.text()).toContain('发布动态页开发中')
    })
  })

  describe('structure', () => {
    it('should have correct CSS classes', () => {
      // Act
      const wrapper = mount(CreatePostView)

      // Assert
      expect(wrapper.find('.create-post-view').exists()).toBe(true)
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })
})
