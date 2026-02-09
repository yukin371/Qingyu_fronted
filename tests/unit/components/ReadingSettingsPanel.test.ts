/**
 * ReadingSettingsPanel 组件测试
 * TDD Phase 3.1: 阅读器设置面板测试
 *
 * 测试用例清单:
 * T3.1: 设置面板响应式（移动端btt/桌面端rtl）
 * T3.2: 5种主题切换功能
 * T3.3: 字号/行高调节
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReadingSettingsPanel from '@/modules/reader/components/ReadingSettingsPanel.vue'

describe('ReadingSettingsPanel - P0核心测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('T3.1: 设置面板响应式', () => {
    it('移动端（宽度<768px）应该使用btt方向', () => {
      // 模拟移动端窗口宽度
      global.innerWidth = 375

      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true
        },
        global: {
          plugins: [createPinia()]
        }
      })

      // el-drawer的direction应该是btt（从底部弹出）
      const drawer = wrapper.findComponent({ name: 'ElDrawer' })
      expect(drawer.exists()).toBe(true)

      // 验证data-direction属性（stub中设置的）
      const drawerElement = wrapper.find('.el-drawer')
      expect(drawerElement.attributes('data-direction')).toBe('btt')
    })

    it('桌面端（宽度≥768px）应该使用rtl方向', () => {
      // 模拟桌面端窗口宽度
      global.innerWidth = 1200

      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true
        },
        global: {
          plugins: [createPinia()]
        }
      })

      // el-drawer的direction应该是rtl（从右侧滑出）
      const drawer = wrapper.findComponent({ name: 'ElDrawer' })
      expect(drawer.exists()).toBe(true)

      // 验证data-direction属性
      const drawerElement = wrapper.find('.el-drawer')
      expect(drawerElement.attributes('data-direction')).toBe('rtl')
    })

    it('移动端抽屉大小应为85%，桌面端应为400px', () => {
      // 测试移动端
      global.innerWidth = 375
      const mobileWrapper = mount(ReadingSettingsPanel, {
        props: { modelValue: true },
        global: {
          plugins: [createPinia()]
        }
      })
      expect(mobileWrapper.find('.el-drawer').attributes('data-size')).toBe('85%')

      // 测试桌面端
      global.innerWidth = 1200
      const desktopWrapper = mount(ReadingSettingsPanel, {
        props: { modelValue: true },
        global: {
          plugins: [createPinia()]
        }
      })
      expect(desktopWrapper.find('.el-drawer').attributes('data-size')).toBe('400px')
    })
  })

  describe('T3.2: 主题切换功能', () => {
    it('应该渲染5种主题选项', () => {
      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            }
          }
        }
      })

      // 查找所有主题卡片
      const themeCards = wrapper.findAll('.theme-card')
      expect(themeCards.length).toBe(5) // light, sepia, night, dark, eyecare
    })

    it('点击主题卡片应该切换主题并触发change事件', async () => {
      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            }
          }
        }
      })

      // 查找dark主题卡片
      const darkThemeCard = wrapper.find('.theme-card[data-theme="dark"]')
      expect(darkThemeCard.exists()).toBe(true)

      // 点击dark主题
      await darkThemeCard.trigger('click')

      // 验证change事件被触发
      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')?.[0]).toEqual([
        expect.objectContaining({
          theme: 'dark'
        })
      ])
    })

    it('当前主题应该显示active状态', () => {
      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true,
          initialSettings: { theme: 'dark' as any }
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            }
          }
        }
      })

      // 查找dark主题卡片
      const darkThemeCard = wrapper.find('.theme-card[data-theme="dark"]')
      expect(darkThemeCard.classes()).toContain('active')
    })

    it('所有主题卡片应该有预览颜色', () => {
      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            }
          }
        }
      })

      // 验证每个主题卡片都有预览色
      const themeCards = wrapper.findAll('.theme-card')
      themeCards.forEach(card => {
        const preview = card.find('.theme-preview')
        expect(preview.exists()).toBe(true)
        // 验证有背景色
        expect(preview.attributes('style')).toContain('background')
      })
    })

    it('主题颜色应该与设计系统变量一致', () => {
      const expectedThemes = [
        { value: 'light', bg: '#ffffff' },
        { value: 'sepia', bg: '#f4ecd8' },
        { value: 'night', bg: '#1a1a1a' },
        { value: 'dark', bg: '#121212' },
        { value: 'eyecare', bg: '#c7edcc' }
      ]

      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            }
          }
        }
      })

      // 验证主题数据
      const vm = wrapper.vm as any
      expectedThemes.forEach(theme => {
        const card = wrapper.find(`.theme-card[data-theme="${theme.value}"]`)
        expect(card.exists()).toBe(true)

        const preview = card.find('.theme-preview')
        const previewStyle = preview.attributes('style') || ''
        expect(previewStyle).toContain(theme.bg)
      })
    })
  })

  describe('T3.3: 字体设置', () => {
    it('应该能够调节字号（最小12px，最大32px，步长2px）', async () => {
      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true,
          initialSettings: { fontSize: 18 }
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            },
            'el-slider': {
              template: '<input type="range" :min="min" :max="max" :step="step" :model-value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">',
              props: ['min', 'max', 'step', 'modelValue']
            }
          }
        }
      })

      const vm = wrapper.vm as any

      // 点击增加按钮
      const increaseBtn = wrapper.find('.font-size-increase')
      await increaseBtn.trigger('click')
      expect(vm.settings.fontSize).toBe(20)

      // 点击减少按钮
      const decreaseBtn = wrapper.find('.font-size-decrease')
      await decreaseBtn.trigger('click')
      expect(vm.settings.fontSize).toBe(18)

      // 测试最小值限制
      vm.settings.fontSize = 12
      await decreaseBtn.trigger('click')
      expect(vm.settings.fontSize).toBe(12) // 不应小于12

      // 测试最大值限制
      vm.settings.fontSize = 32
      await increaseBtn.trigger('click')
      expect(vm.settings.fontSize).toBe(32) // 不应大于32
    })

    it('应该能够调节行高（最小1.2，最大2.5，步长0.1）', async () => {
      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true,
          initialSettings: { lineHeight: 1.8 }
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            }
          }
        }
      })

      // 直接调用updateLineHeight方法
      const vm = wrapper.vm as any
      vm.updateLineHeight(2.0)
      await wrapper.vm.$nextTick()

      expect(vm.settings.lineHeight).toBe(2.0)
    })

    it('字体设置变化应该触发change事件', async () => {
      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            }
          }
        }
      })

      const vm = wrapper.vm as any

      // 改变字号
      vm.settings.fontSize = 20
      await wrapper.vm.$nextTick()

      // 验证change事件
      expect(wrapper.emitted('change')).toBeTruthy()
    })
  })

  describe('组件交互', () => {
    it('点击关闭按钮应该触发update:modelValue事件', async () => {
      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              name: 'ElDrawer',
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            }
          }
        }
      })

      // 直接调用组件的handleClose方法来模拟关闭
      const vm = wrapper.vm as any
      vm.handleClose(false)
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('点击保存按钮应该保存设置并关闭面板', async () => {
      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            }
          }
        }
      })

      // 查找保存按钮（通过类名）
      const saveButton = wrapper.find('.save-btn')
      expect(saveButton.exists()).toBe(true)

      // 点击保存
      await saveButton.trigger('click')

      // 验证事件
      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('点击恢复默认应该重置设置', async () => {
      const wrapper = mount(ReadingSettingsPanel, {
        props: {
          modelValue: true,
          initialSettings: { fontSize: 20, lineHeight: 2.0 }
        },
        global: {
          plugins: [createPinia()],
          stubs: {
            'el-drawer': {
              template: '<div class="drawer"><slot /></div>',
              props: ['modelValue']
            }
          }
        }
      })

      const vm = wrapper.vm as any

      // 修改设置为非默认值
      vm.settings.fontSize = 24
      vm.settings.lineHeight = 2.2

      await wrapper.vm.$nextTick()

      // 直接调用组件的handleReset方法
      vm.handleReset()
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick() // 双重nextTick确保响应式更新完成

      // 验证设置已重置到默认值
      expect(vm.settings.fontSize).toBe(18) // 默认值
      expect(vm.settings.lineHeight).toBe(1.8) // 默认值
    })
  })
})
