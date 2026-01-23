/**
 * Steps 组件单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { Steps, Step } from '@/design-system/navigation/Steps'

describe('Steps 组件', () => {
  describe('基础功能', () => {
    it('应该正确渲染 Steps 组件', () => {
      const wrapper = mount(Steps, {
        slots: {
          default: [Step, Step, Step],
        },
      })

      expect(wrapper.find('.steps').exists()).toBe(true)
      expect(wrapper.findAll('.step').length).toBe(3)
    })

    it('应该正确设置默认 current 属性', () => {
      const wrapper = mount(Steps, {
        props: { current: 1 },
        slots: {
          default: [
            {
              template: '<Step title="步骤1" />',
            },
            {
              template: '<Step title="步骤2" />',
            },
            {
              template: '<Step title="步骤3" />',
            },
          ],
        },
      })

      expect(wrapper.props('current')).toBe(1)
    })

    it('应该正确渲染水平方向的步骤条', () => {
      const wrapper = mount(Steps, {
        props: { direction: 'horizontal' },
      })

      expect(wrapper.find('.steps-horizontal').exists()).toBe(true)
    })

    it('应该正确渲染垂直方向的步骤条', () => {
      const wrapper = mount(Steps, {
        props: { direction: 'vertical' },
      })

      expect(wrapper.find('.steps-vertical').exists()).toBe(true)
    })

    it('应该支持居中对齐', () => {
      const wrapper = mount(Steps, {
        props: { alignCenter: true, direction: 'horizontal' },
      })

      expect(wrapper.find('.steps-centered').exists()).toBe(true)
    })

    it('应该支持简洁模式', () => {
      const wrapper = mount(Steps, {
        props: { simple: true },
      })

      expect(wrapper.find('.steps-simple').exists()).toBe(true)
    })

    it('应该支持自定义完成状态', () => {
      const wrapper = mount(Steps, {
        props: { finishStatus: 'success' },
      })

      expect(wrapper.props('finishStatus')).toBe('success')
    })

    it('应该支持自定义进行中状态', () => {
      const wrapper = mount(Steps, {
        props: { processStatus: 'finish' },
      })

      expect(wrapper.props('processStatus')).toBe('finish')
    })
  })

  describe('Step 组件', () => {
    it('应该正确渲染 Step 组件', () => {
      const wrapper = mount(Step, {
        props: { title: '测试步骤' },
      })

      expect(wrapper.find('.step').exists()).toBe(true)
      expect(wrapper.text()).toContain('测试步骤')
    })

    it('应该正确渲染步骤图标', () => {
      const wrapper = mount(Step, {
        props: { title: '步骤1' },
      })

      expect(wrapper.find('.step-icon').exists()).toBe(true)
    })

    it('应该正确渲染步骤标题', () => {
      const wrapper = mount(Step, {
        props: { title: '测试标题' },
      })

      expect(wrapper.find('.step-title').exists()).toBe(true)
      expect(wrapper.find('.step-title').text()).toBe('测试标题')
    })

    it('应该正确渲染步骤描述', () => {
      const wrapper = mount(Step, {
        props: {
          title: '测试标题',
          description: '测试描述',
        },
      })

      expect(wrapper.find('.step-description').exists()).toBe(true)
      expect(wrapper.find('.step-description').text()).toBe('测试描述')
    })

    it('应该支持自定义步骤状态', () => {
      const wrapper = mount(Step, {
        props: { title: '测试步骤', status: 'finish' },
      })

      expect(wrapper.props('status')).toBe('finish')
    })

    it('应该正确渲染等待状态', () => {
      const wrapper = mount(Step, {
        props: { title: '等待步骤', status: 'wait' },
      })

      expect(wrapper.find('.step-wait').exists()).toBe(true)
    })

    it('应该正确渲染进行中状态', () => {
      const wrapper = mount(Step, {
        props: { title: '进行中', status: 'process' },
      })

      expect(wrapper.find('.step-process').exists()).toBe(true)
    })

    it('应该正确渲染完成状态', () => {
      const wrapper = mount(Step, {
        props: { title: '已完成', status: 'finish' },
      })

      expect(wrapper.find('.step-finish').exists()).toBe(true)
    })

    it('应该正确渲染错误状态', () => {
      const wrapper = mount(Step, {
        props: { title: '出错了', status: 'error' },
      })

      expect(wrapper.find('.step-error').exists()).toBe(true)
    })

    it('应该正确渲染成功状态', () => {
      const wrapper = mount(Step, {
        props: { title: '成功', status: 'success' },
      })

      expect(wrapper.find('.step-success').exists()).toBe(true)
    })

    it('完成状态应该显示勾选图标', () => {
      const wrapper = mount(Step, {
        props: { title: '已完成', status: 'finish' },
      })

      expect(wrapper.find('.step-icon').html()).toContain('svg')
    })

    it('错误状态应该显示错误图标', () => {
      const wrapper = mount(Step, {
        props: { title: '出错了', status: 'error' },
      })

      expect(wrapper.find('.step-icon').html()).toContain('svg')
    })
  })

  describe('插槽功能', () => {
    it('应该支持 icon 插槽', () => {
      const wrapper = mount(Step, {
        slots: {
          icon: '<span class="custom-icon">ICON</span>',
        },
      })

      expect(wrapper.find('.custom-icon').exists()).toBe(true)
      expect(wrapper.find('.custom-icon').text()).toBe('ICON')
    })

    it('应该支持 title 插槽', () => {
      const wrapper = mount(Step, {
        slots: {
          title: '<span class="custom-title">自定义标题</span>',
        },
      })

      expect(wrapper.find('.custom-title').exists()).toBe(true)
      expect(wrapper.find('.custom-title').text()).toBe('自定义标题')
    })

    it('应该支持 description 插槽', () => {
      const wrapper = mount(Step, {
        slots: {
          description: '<span class="custom-desc">自定义描述</span>',
        },
      })

      expect(wrapper.find('.custom-desc').exists()).toBe(true)
      expect(wrapper.find('.custom-desc').text()).toBe('自定义描述')
    })
  })

  describe('事件功能', () => {
    it('应该触发 change 事件', async () => {
      const wrapper = mount(Steps, {
        props: { current: 0 },
      })

      await wrapper.setProps({ current: 1 })

      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('应该触发 Step 点击事件', async () => {
      const wrapper = mount(Step, {
        props: { title: '测试步骤' },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('无障碍访问', () => {
    it('Steps 应该有 role="list"', () => {
      const wrapper = mount(Steps)

      expect(wrapper.find('[role="list"]').exists()).toBe(true)
    })

    it('Step 应该有 role="listitem"', () => {
      const wrapper = mount(Step)

      expect(wrapper.find('[role="listitem"]').exists()).toBe(true)
    })

    it('当前步骤应该有 aria-current 属性', () => {
      const wrapper = mount(Step, {
        props: { title: '当前步骤', status: 'process' },
      })

      expect(wrapper.find('[aria-current="step"]').exists()).toBe(true)
    })
  })

  describe('样式类名', () => {
    it('应该支持自定义类名', () => {
      const wrapper = mount(Steps, {
        props: { class: 'custom-steps' },
      })

      expect(wrapper.classes()).toContain('custom-steps')
    })

    it('Step 应该支持自定义类名', () => {
      const wrapper = mount(Step, {
        props: { class: 'custom-step' },
      })

      expect(wrapper.classes()).toContain('custom-step')
    })

    it('水平步骤应该有正确的 flex 类名', () => {
      const wrapper = mount(Steps, {
        props: { direction: 'horizontal' },
      })

      expect(wrapper.find('.steps-horizontal').classes()).toContain('flex-row')
    })

    it('垂直步骤应该有正确的 flex 类名', () => {
      const wrapper = mount(Steps, {
        props: { direction: 'vertical' },
      })

      expect(wrapper.find('.steps-vertical').classes()).toContain('flex-col')
    })
  })
})
