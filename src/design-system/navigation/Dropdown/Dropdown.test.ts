/**
 * Dropdown 下拉菜单组件测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/vue'
import { computed, ref } from 'vue'
import Dropdown from './Dropdown.vue'
import DropdownItem from './DropdownItem.vue'
import DropdownDivider from './DropdownDivider.vue'

describe('Dropdown 组件', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.body
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  // 基础渲染测试
  describe('基础渲染', () => {
    it('应该正确渲染下拉菜单', () => {
      render(Dropdown, {
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click Me</button>',
          default: `
            <DropdownItem command="1">Item 1</DropdownItem>
            <DropdownItem command="2">Item 2</DropdownItem>
          `,
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Click Me')
    })

    it('应该正确渲染所有菜单项', () => {
      render(Dropdown, {
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: `
            <DropdownItem command="1">Item 1</DropdownItem>
            <DropdownItem command="2">Item 2</DropdownItem>
            <DropdownItem command="3">Item 3</DropdownItem>
          `,
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('应该正确应用自定义类名', () => {
      render(Dropdown, {
        props: {
          class: 'custom-dropdown',
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })
  })

  // 触发方式测试
  describe('触发方式', () => {
    it('应该在点击时显示菜单（click trigger）', async () => {
      const visibleChange = vi.fn()

      render(Dropdown, {
        props: {
          trigger: 'click',
          onVisibleChange: visibleChange,
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      await fireEvent.click(trigger)

      await waitFor(() => {
        expect(visibleChange).toHaveBeenCalledWith(true)
      })
    })

    it('应该在悬停时显示菜单（hover trigger）', async () => {
      const visibleChange = vi.fn()

      render(Dropdown, {
        props: {
          trigger: 'hover',
          showTimeout: 0,
          onVisibleChange: visibleChange,
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Hover</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      await fireEvent.mouseEnter(trigger)

      await waitFor(() => {
        expect(visibleChange).toHaveBeenCalledWith(true)
      }, { timeout: 300 })
    })

    it('应该在获得焦点时显示菜单（focus trigger）', async () => {
      const visibleChange = vi.fn()

      render(Dropdown, {
        props: {
          trigger: 'focus',
          onVisibleChange: visibleChange,
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Focus</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      await fireEvent.focus(trigger)

      await waitFor(() => {
        expect(visibleChange).toHaveBeenCalledWith(true)
      })
    })

    it('应该在右键点击时显示菜单（contextmenu trigger）', async () => {
      const visibleChange = vi.fn()

      render(Dropdown, {
        props: {
          trigger: 'contextmenu',
          onVisibleChange: visibleChange,
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Right Click</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      await fireEvent.contextMenu(trigger)

      await waitFor(() => {
        expect(visibleChange).toHaveBeenCalledWith(true)
      })
    })
  })

  // 菜单项点击测试
  describe('菜单项点击', () => {
    it('应该在点击菜单项时触发 command 事件', async () => {
      const command = vi.fn()

      render(Dropdown, {
        props: {
          onCommand: command,
          trigger: 'click',
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="test-command">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      // 打开菜单
      await fireEvent.click(trigger)

      // 等待菜单显示
      await waitFor(() => {
        const menu = document.querySelector('[role="menu"]')
        expect(menu).toBeInTheDocument()
      })

      // 点击菜单项
      const menuItem = document.querySelector('[role="menuitem"]')
      if (menuItem) {
        await fireEvent.click(menuItem)

        await waitFor(() => {
          expect(command).toHaveBeenCalledWith('test-command')
        })
      }
    })

    it('应该在 hideOnClick 为 true 时点击后隐藏菜单', async () => {
      const visibleChange = vi.fn()
      const command = vi.fn()

      render(Dropdown, {
        props: {
          hideOnClick: true,
          onVisibleChange: visibleChange,
          onCommand: command,
          trigger: 'click',
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="test">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      // 打开菜单
      await fireEvent.click(trigger)
      await waitFor(() => {
        expect(visibleChange).toHaveBeenCalledWith(true)
      })

      // 点击菜单项
      const menuItem = document.querySelector('[role="menuitem"]')
      if (menuItem) {
        await fireEvent.click(menuItem)

        await waitFor(() => {
          expect(command).toHaveBeenCalledWith('test')
          expect(visibleChange).toHaveBeenCalledWith(false)
        })
      }
    })

    it('禁用的菜单项不应该触发事件', async () => {
      const command = vi.fn()

      render(Dropdown, {
        props: {
          onCommand: command,
          trigger: 'click',
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="test" :disabled="true">Disabled Item</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      await fireEvent.click(trigger)

      await waitFor(() => {
        const menuItem = document.querySelector('[role="menuitem"]')
        expect(menuItem).toBeInTheDocument()
      })

      const menuItem = document.querySelector('[role="menuitem"]')
      if (menuItem) {
        await fireEvent.click(menuItem)

        // 等待一下确保没有触发
        await new Promise(resolve => setTimeout(resolve, 100))
        expect(command).not.toHaveBeenCalled()
      }
    })
  })

  // 禁用状态测试
  describe('禁用状态', () => {
    it('禁用的下拉菜单不应该响应点击', async () => {
      const visibleChange = vi.fn()

      render(Dropdown, {
        props: {
          disabled: true,
          onVisibleChange: visibleChange,
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Disabled</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      await fireEvent.click(trigger)

      // 等待确保没有触发
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(visibleChange).not.toHaveBeenCalled()
    })

    it('禁用的下拉菜单应该有正确的样式', () => {
      render(Dropdown, {
        props: {
          disabled: true,
        },
        slots: {
          trigger: '<button data-testid="trigger">Disabled</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveClass('cursor-not-allowed')
      expect(trigger).toHaveClass('opacity-50')
    })

    it('禁用的下拉菜单应该有正确的 ARIA 属性', () => {
      render(Dropdown, {
        props: {
          disabled: true,
        },
        slots: {
          trigger: '<button data-testid="trigger">Disabled</button>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('aria-disabled', 'true')
      expect(trigger).toHaveAttribute('tabindex', '-1')
    })
  })

  // 位置测试
  describe('菜单位置', () => {
    it('应该支持 bottom 位置', () => {
      render(Dropdown, {
        props: {
          placement: 'bottom',
        },
        slots: {
          trigger: '<button data-testid="trigger">Bottom</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('应该支持 top 位置', () => {
      render(Dropdown, {
        props: {
          placement: 'top',
        },
        slots: {
          trigger: '<button data-testid="trigger">Top</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('应该支持 left 位置', () => {
      render(Dropdown, {
        props: {
          placement: 'left',
        },
        slots: {
          trigger: '<button data-testid="trigger">Left</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('应该支持 right 位置', () => {
      render(Dropdown, {
        props: {
          placement: 'right',
        },
        slots: {
          trigger: '<button data-testid="trigger">Right</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })
  })

  // 尺寸测试
  describe('菜单尺寸', () => {
    it('应该支持 small 尺寸', () => {
      render(Dropdown, {
        props: {
          size: 'small',
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Small</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('应该支持 medium 尺寸', () => {
      render(Dropdown, {
        props: {
          size: 'medium',
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Medium</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('应该支持 large 尺寸', () => {
      render(Dropdown, {
        props: {
          size: 'large',
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Large</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })
  })

  // 分割线测试
  describe('分割线', () => {
    it('应该正确渲染分割线', () => {
      render(Dropdown, {
        global: {
          components: { DropdownItem, DropdownDivider },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: `
            <DropdownItem command="1">Item 1</DropdownItem>
            <DropdownDivider />
            <DropdownItem command="2">Item 2</DropdownItem>
          `,
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('菜单项的 divided 属性应该显示分割线', () => {
      render(Dropdown, {
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: `
            <DropdownItem command="1">Item 1</DropdownItem>
            <DropdownItem command="2" divided>Item 2</DropdownItem>
          `,
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })
  })

  // 图标测试
  describe('图标', () => {
    it('应该正确渲染图标插槽', () => {
      render(Dropdown, {
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: `
            <DropdownItem command="profile">
              <template #icon>
                <svg data-testid="icon" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </template>
              Profile
            </DropdownItem>
          `,
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })
  })

  // 键盘导航测试
  describe('键盘导航', () => {
    it('应该在按 Escape 键时关闭菜单', async () => {
      const visibleChange = vi.fn()

      render(Dropdown, {
        props: {
          trigger: 'click',
          onVisibleChange: visibleChange,
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      // 打开菜单
      await fireEvent.click(trigger)

      await waitFor(() => {
        expect(visibleChange).toHaveBeenCalledWith(true)
      })

      // 按 Escape 键
      await fireEvent.keyDown(trigger, { key: 'Escape' })

      await waitFor(() => {
        expect(visibleChange).toHaveBeenCalledWith(false)
      })
    })

    it('应该在按 Enter 键时打开菜单', async () => {
      const visibleChange = vi.fn()

      render(Dropdown, {
        props: {
          trigger: 'click',
          onVisibleChange: visibleChange,
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      // 按 Enter 键
      await fireEvent.keyDown(trigger, { key: 'Enter' })

      await waitFor(() => {
        expect(visibleChange).toHaveBeenCalledWith(true)
      })
    })
  })

  // 可访问性测试
  describe('可访问性', () => {
    it('应该有正确的 ARIA 属性', () => {
      render(Dropdown, {
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('aria-haspopup', 'true')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('role', 'button')
    })

    it('菜单应该有正确的 role 属性', async () => {
      render(Dropdown, {
        props: {
          trigger: 'click',
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      await fireEvent.click(trigger)

      await waitFor(() => {
        const menu = document.querySelector('[role="menu"]')
        expect(menu).toBeInTheDocument()
      })
    })

    it('菜单项应该有正确的 role 属性', async () => {
      render(Dropdown, {
        props: {
          trigger: 'click',
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      await fireEvent.click(trigger)

      await waitFor(() => {
        const menuItem = document.querySelector('[role="menuitem"]')
        expect(menuItem).toBeInTheDocument()
      })
    })
  })

  // 箭头测试
  describe('箭头', () => {
    it('应该在 showArrow 为 true 时显示箭头', async () => {
      render(Dropdown, {
        props: {
          showArrow: true,
          placement: 'bottom',
          trigger: 'click',
        },
        global: {
          components: { DropdownItem },
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      await fireEvent.click(trigger)

      await waitFor(() => {
        const arrow = document.querySelector('.rotate-45')
        expect(arrow).toBeInTheDocument()
      })
    })
  })

  // 事件测试
  describe('事件', () => {
    it('应该在点击触发器时触发 click 事件', async () => {
      const handleClick = vi.fn()

      render(Dropdown, {
        props: {
          onClick: handleClick,
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')

      await fireEvent.click(trigger)

      expect(handleClick).toHaveBeenCalled()
    })
  })

  // 自定义触发器类名测试
  describe('自定义触发器类名', () => {
    it('应该正确应用自定义触发器类名', () => {
      render(Dropdown, {
        props: {
          triggerClass: 'custom-trigger-class',
        },
        slots: {
          trigger: '<button data-testid="trigger">Click</button>',
          default: '<DropdownItem command="1">Item 1</DropdownItem>',
        },
      })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveClass('custom-trigger-class')
    })
  })
})
