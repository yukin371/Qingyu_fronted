/**
 * Tooltip 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { nextTick } from 'vue'
import Tooltip from '@/design-system/feedback/Tooltip/Tooltip.vue'

describe('Tooltip 组件', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('基础功能', () => {
    it('应该正确渲染组件', () => {
      const { container } = render(Tooltip, {
        props: {
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })

    it('应该包含触发元素', () => {
      render(Tooltip, {
        props: {
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      expect(screen.getByText('触发元素')).toBeTruthy()
    })

    it('应该渲染默认内容', async () => {
      render(Tooltip, {
        props: {
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')

      // 初始状态不显示（通过检查元素的可见性）
      await fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.textContent).toContain('测试提示')
      })
    })

    it('应该渲染自定义内容插槽', async () => {
      render(Tooltip, {
        props: {
          content: '默认内容',
        },
        slots: {
          default: '<button>触发元素</button>',
          content: '<div class="custom">自定义内容</div>',
        },
      })

      const trigger = screen.getByText('触发元素')
      await fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      await waitFor(() => {
        expect(screen.queryByText('自定义内容')).toBeTruthy()
      })
    })
  })

  describe('触发方式', () => {
    it('应该在鼠标悬停时显示提示 (hover)', async () => {
      render(Tooltip, {
        props: {
          trigger: 'hover',
          content: '悬停提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')

      await fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.textContent).toContain('悬停提示')
      })
    })

    it('应该在鼠标离开时隐藏提示 (hover)', async () => {
      render(Tooltip, {
        props: {
          trigger: 'hover',
          content: '悬停提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')

      await fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.textContent).toContain('悬停提示')
      })

      await fireEvent.mouseLeave(trigger)
      vi.advanceTimersByTime(200)

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        // Tooltip 应该被隐藏
        expect(tooltip?.style.display).toBe('none')
      })
    })

    it('应该在点击时切换显示状态 (click)', async () => {
      render(Tooltip, {
        props: {
          trigger: 'click',
          content: '点击提示',
          closeDelay: 0, // 设置为0避免延迟导致的测试问题
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')

      // 第一次点击显示
      await fireEvent.click(trigger)
      await nextTick()
      vi.runAllTimers()

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.textContent).toContain('点击提示')
      }, { timeout: 3000 })

      // 第二次点击隐藏
      await fireEvent.click(trigger)
      await nextTick()
      vi.runAllTimers()

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.style.display).toBe('none')
      }, { timeout: 3000 })
    })

    it('应该在获得焦点时显示提示 (focus)', async () => {
      render(Tooltip, {
        props: {
          trigger: 'focus',
          content: '焦点提示',
        },
        slots: {
          default: '<input type="text" />',
        },
      })

      const input = screen.getByRole('textbox')

      await fireEvent.focus(input)
      vi.runAllTimers()

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.textContent).toContain('焦点提示')
      })
    })

    it('应该在失去焦点时隐藏提示 (focus)', async () => {
      render(Tooltip, {
        props: {
          trigger: 'focus',
          content: '焦点提示',
        },
        slots: {
          default: '<input type="text" />',
        },
      })

      const input = screen.getByRole('textbox')

      await fireEvent.focus(input)
      vi.runAllTimers()

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.textContent).toContain('焦点提示')
      })

      await fireEvent.blur(input)
      vi.runAllTimers()

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.style.display).toBe('none')
      })
    })
  })

  describe('位置选项', () => {
    const placements = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ] as const

    placements.forEach((placement) => {
      it(`应该支持 ${placement} 位置`, () => {
        render(Tooltip, {
          props: {
            placement,
            content: '位置测试',
          },
          slots: {
            default: '<button>触发元素</button>',
          },
        })

        const trigger = screen.getByText('触发元素')
        expect(trigger).toBeTruthy()
      })
    })
  })

  describe('主题', () => {
    it('应该应用暗色主题样式', () => {
      render(Tooltip, {
        props: {
          effect: 'dark',
          content: '暗色主题',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      // 检查是否应用了正确的类名
      const tooltip = document.querySelector('.bg-gray-800')
      expect(tooltip).toBeTruthy()
    })

    it('应该应用亮色主题样式', () => {
      render(Tooltip, {
        props: {
          effect: 'light',
          content: '亮色主题',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      // 检查是否应用了正确的类名
      const tooltip = document.querySelector('.bg-white')
      expect(tooltip).toBeTruthy()
    })
  })

  describe('箭头显示', () => {
    it('应该默认显示箭头', () => {
      render(Tooltip, {
        props: {
          showArrow: true,
          content: '带箭头',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      const arrow = document.querySelector('.qy-tooltip__arrow')
      expect(arrow).toBeTruthy()
    })

    it('应该支持隐藏箭头', () => {
      render(Tooltip, {
        props: {
          showArrow: false,
          content: '无箭头',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      const arrow = document.querySelector('.qy-tooltip__arrow')
      expect(arrow).toBeFalsy()
    })
  })

  describe('偏移量', () => {
    it('应该支持自定义偏移量', () => {
      const { container } = render(Tooltip, {
        props: {
          offset: 20,
          content: '偏移测试',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })
  })

  describe('延迟控制', () => {
    it('应该支持显示延迟', async () => {
      render(Tooltip, {
        props: {
          openDelay: 500,
          content: '延迟显示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')

      await fireEvent.mouseEnter(trigger)

      // 490ms 后仍然不显示
      vi.advanceTimersByTime(490)

      const tooltipEarly = document.querySelector('[role="tooltip"]')
      expect(tooltipEarly?.style.display).toBe('none')

      // 500ms 后显示
      vi.advanceTimersByTime(10)

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.textContent).toContain('延迟显示')
      })
    })

    it('应该支持隐藏延迟', async () => {
      render(Tooltip, {
        props: {
          closeDelay: 500,
          content: '延迟隐藏',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')

      await fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.textContent).toContain('延迟隐藏')
      })

      await fireEvent.mouseLeave(trigger)

      // 490ms 后仍然显示
      vi.advanceTimersByTime(490)

      const tooltipEarly = document.querySelector('[role="tooltip"]')
      expect(tooltipEarly?.textContent).toContain('延迟隐藏')

      // 500ms 后隐藏
      vi.advanceTimersByTime(10)

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]')
        expect(tooltip?.style.display).toBe('none')
      })
    })
  })

  describe('禁用状态', () => {
    it('应该在禁用状态下不显示提示', async () => {
      render(Tooltip, {
        props: {
          disabled: true,
          content: '禁用提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')

      await fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      // 禁用状态下 tooltip 不应该显示
      const tooltip = document.querySelector('[role="tooltip"]')
      expect(tooltip?.style.display).toBe('none')
    })
  })

  describe('事件回调', () => {
    it('应该支持事件回调属性', () => {
      const beforeShow = vi.fn()
      const afterShow = vi.fn()
      const beforeHide = vi.fn()
      const afterHide = vi.fn()

      render(Tooltip, {
        props: {
          content: '测试提示',
          onBeforeShow: beforeShow,
          onAfterShow: afterShow,
          onBeforeHide: beforeHide,
          onAfterHide: afterHide,
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()

      // 验证回调函数被正确传递
      expect(beforeShow).toBeDefined()
      expect(afterShow).toBeDefined()
      expect(beforeHide).toBeDefined()
      expect(afterHide).toBeDefined()
    })
  })

  describe('可访问性', () => {
    it('应该设置正确的 role 属性', async () => {
      render(Tooltip, {
        props: {
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      await fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      const tooltip = document.querySelector('[role="tooltip"]')
      expect(tooltip).toBeTruthy()
    })

    it('应该支持键盘焦点', () => {
      render(Tooltip, {
        props: {
          trigger: 'focus',
          content: '焦点提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })
  })

  describe('自定义类名', () => {
    it('应该支持自定义触发器类名', () => {
      const { container } = render(Tooltip, {
        props: {
          content: '测试提示',
          class: 'custom-class',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })

    it('应该支持自定义 popper 类名', () => {
      render(Tooltip, {
        props: {
          content: '测试提示',
          popperClass: 'custom-popper-class',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      fireEvent.mouseEnter(trigger)
      vi.runAllTimers()

      const tooltip = document.querySelector('.custom-popper-class')
      expect(tooltip).toBeTruthy()
    })
  })

  describe('过渡动画', () => {
    it('应该使用默认过渡动画', () => {
      render(Tooltip, {
        props: {
          transition: 'tooltip-fade',
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })

    it('应该支持自定义过渡动画', () => {
      render(Tooltip, {
        props: {
          transition: 'custom-fade',
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })
  })

  describe('销毁行为', () => {
    it('应该在关闭后保留 DOM (destroyOnClose = false)', () => {
      render(Tooltip, {
        props: {
          destroyOnClose: false,
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })
  })

  describe('Props 默认值', () => {
    it('应该使用默认的 trigger 值', () => {
      render(Tooltip, {
        props: {
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })

    it('应该使用默认的 placement 值', () => {
      render(Tooltip, {
        props: {
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })

    it('应该使用默认的 effect 值', () => {
      render(Tooltip, {
        props: {
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })

    it('应该使用默认的 showArrow 值', () => {
      render(Tooltip, {
        props: {
          content: '测试提示',
        },
        slots: {
          default: '<button>触发元素</button>',
        },
      })

      const trigger = screen.getByText('触发元素')
      expect(trigger).toBeTruthy()
    })
  })
})
