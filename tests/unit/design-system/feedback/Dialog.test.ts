/**
 * Dialog 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { ref } from 'vue'
import Dialog from '@/design-system/feedback/Dialog/Dialog.vue'
import Button from '@/design-system/base/Button/Button.vue'

describe('Dialog 组件', () => {
  beforeEach(() => {
    // 重置 body 样式
    document.body.style.overflow = ''
  })

  afterEach(() => {
    // 清理所有 Teleport 容器
    const teleports = document.querySelectorAll('[data-v-teleport]')
    teleports.forEach(el => el.remove())
  })

  describe('基础渲染', () => {
    it('应该正确渲染默认状态的 Dialog', () => {
      const { container } = render(Dialog, {
        props: {
          visible: false,
          title: '测试对话框',
        },
      })

      // 默认状态不显示
      expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
    })

    it('visible 为 true 时应该显示对话框', async () => {
      const { container } = render(Dialog, {
        props: {
          visible: true,
          title: '测试对话框',
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })
    })

    it('应该正确显示标题', async () => {
      render(Dialog, {
        props: {
          visible: true,
          title: '对话框标题',
        },
      })

      await waitFor(() => {
        expect(screen.getByText('对话框标题')).toBeInTheDocument()
      })
    })

    it('应该正确渲染默认内容', async () => {
      render(Dialog, {
        props: {
          visible: true,
        },
        slots: {
          default: '这是对话框内容',
        },
      })

      await waitFor(() => {
        expect(screen.getByText('这是对话框内容')).toBeInTheDocument()
      })
    })

    it('应该渲染遮罩层', async () => {
      render(Dialog, {
        props: {
          visible: true,
          modal: true,
        },
      })

      await waitFor(() => {
        const overlay = document.querySelector('.bg-black\\/50')
        expect(overlay).toBeInTheDocument()
      })
    })

    it('modal 为 false 时不应该渲染遮罩层', async () => {
      render(Dialog, {
        props: {
          visible: true,
          modal: false,
        },
      })

      await waitFor(() => {
        const overlay = document.querySelector('.bg-black\\/50')
        expect(overlay).not.toBeInTheDocument()
      })
    })

    it('应该显示关闭按钮', async () => {
      render(Dialog, {
        props: {
          visible: true,
          showClose: true,
        },
      })

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="关闭对话框"]')
        expect(closeButton).toBeInTheDocument()
      })
    })

    it('showClose 为 false 时不应该显示关闭按钮', async () => {
      render(Dialog, {
        props: {
          visible: true,
          showClose: false,
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
        const closeButton = document.querySelector('button[aria-label="关闭对话框"]')
        expect(closeButton).not.toBeInTheDocument()
      })
    })
  })

  describe('显示/隐藏', () => {
    it('点击关闭按钮应该关闭对话框', async () => {
      const visible = ref(true)
      const { emitted } = render(Dialog, {
        props: {
          visible: visible.value,
          title: '测试对话框',
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      const closeButton = document.querySelector('button[aria-label="关闭对话框"]')
      expect(closeButton).toBeInTheDocument()

      await fireEvent.click(closeButton!)

      await waitFor(() => {
        expect(emitted()['update:visible']).toBeTruthy()
        expect(emitted()['update:visible']![0]).toEqual([false])
      })
    })

    it('点击遮罩层应该关闭对话框', async () => {
      const visible = ref(true)
      const { emitted } = render(Dialog, {
        props: {
          visible: visible.value,
          closeOnClickModal: true,
        },
      })

      await waitFor(() => {
        const overlay = document.querySelector('.bg-black\\/50')
        expect(overlay).toBeInTheDocument()
      })

      const overlay = document.querySelector('.bg-black\\/50')
      await fireEvent.click(overlay!)

      await waitFor(() => {
        expect(emitted()['update:visible']).toBeTruthy()
        expect(emitted()['update:visible']![0]).toEqual([false])
      })
    })

    it('closeOnClickModal 为 false 时不应该通过点击遮罩层关闭', async () => {
      const visible = ref(true)
      const { emitted } = render(Dialog, {
        props: {
          visible: visible.value,
          closeOnClickModal: false,
        },
      })

      await waitFor(() => {
        const overlay = document.querySelector('.bg-black\\/50')
        expect(overlay).toBeInTheDocument()
      })

      const overlay = document.querySelector('.bg-black\\/50')
      await fireEvent.click(overlay!)

      await waitFor(() => {
        expect(emitted()['update:visible']).toBeFalsy()
      })
    })

    it('按 ESC 键应该关闭对话框', async () => {
      const visible = ref(true)
      const { emitted } = render(Dialog, {
        props: {
          visible: visible.value,
          closeOnPressEscape: true,
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      await fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(emitted()['update:visible']).toBeTruthy()
        expect(emitted()['update:visible']![0]).toEqual([false])
      })
    })

    it('closeOnPressEscape 为 false 时不应该通过 ESC 键关闭', async () => {
      const visible = ref(true)
      const { emitted } = render(Dialog, {
        props: {
          visible: visible.value,
          closeOnPressEscape: false,
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      await fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(emitted()['update:visible']).toBeFalsy()
      }, { timeout: 100 })
    })

    it('对话框打开时应该禁用 body 滚动', async () => {
      render(Dialog, {
        props: {
          visible: true,
          lockScroll: true,
        },
      })

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden')
      })
    })

    it('对话框关闭时应该恢复 body 滚动', async () => {
      const { rerender } = render(Dialog, {
        props: {
          visible: true,
          lockScroll: true,
        },
      })

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden')
      })

      await rerender({ visible: false })

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('')
      })
    })
  })

  describe('尺寸变体', () => {
    it('应该正确应用 sm 尺寸', async () => {
      render(Dialog, {
        props: {
          visible: true,
          size: 'sm',
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toHaveClass('max-w-sm')
      })
    })

    it('应该正确应用 md 尺寸', async () => {
      render(Dialog, {
        props: {
          visible: true,
          size: 'md',
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toHaveClass('max-w-md')
      })
    })

    it('应该正确应用 lg 尺寸', async () => {
      render(Dialog, {
        props: {
          visible: true,
          size: 'lg',
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toHaveClass('max-w-lg')
      })
    })

    it('应该正确应用 xl 尺寸', async () => {
      render(Dialog, {
        props: {
          visible: true,
          size: 'xl',
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toHaveClass('max-w-xl')
      })
    })

    it('应该正确应用 full 尺寸', async () => {
      render(Dialog, {
        props: {
          visible: true,
          size: 'full',
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toHaveClass('max-w-full')
        expect(dialog).toHaveClass('w-full')
        expect(dialog).toHaveClass('h-full')
        expect(dialog).toHaveClass('m-0')
        expect(dialog).toHaveClass('rounded-none')
      })
    })
  })

  describe('居中显示', () => {
    it('center 为 false 时应该默认在顶部显示', async () => {
      render(Dialog, {
        props: {
          visible: true,
          center: false,
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toHaveClass('top-20')
        expect(dialog).not.toHaveClass('top-1/2')
      })
    })

    it('center 为 true 时应该居中显示', async () => {
      render(Dialog, {
        props: {
          visible: true,
          center: true,
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toHaveClass('top-1/2')
        expect(dialog).toHaveClass('-translate-y-1/2')
      })
    })
  })

  describe('插槽', () => {
    it('应该渲染默认插槽内容', async () => {
      render(Dialog, {
        props: {
          visible: true,
        },
        slots: {
          default: '<p class="custom-content">自定义内容</p>',
        },
      })

      await waitFor(() => {
        expect(screen.getByText('自定义内容')).toBeInTheDocument()
      })
    })

    it('应该渲染 header 插槽内容', async () => {
      render(Dialog, {
        props: {
          visible: true,
        },
        slots: {
          header: '<div class="custom-header">自定义头部</div>',
        },
      })

      await waitFor(() => {
        expect(screen.getByText('自定义头部')).toBeInTheDocument()
      })
    })

    it('header 插槽优先级高于 title prop', async () => {
      render(Dialog, {
        props: {
          visible: true,
          title: '标题',
        },
        slots: {
          header: '<div class="custom-header">自定义头部</div>',
        },
      })

      await waitFor(() => {
        expect(screen.getByText('自定义头部')).toBeInTheDocument()
        expect(screen.queryByText('标题')).not.toBeInTheDocument()
      })
    })

    it('应该渲染 footer 插槽内容', async () => {
      render(Dialog, {
        props: {
          visible: true,
        },
        slots: {
          footer: '<div class="custom-footer">自定义底部</div>',
        },
      })

      await waitFor(() => {
        expect(screen.getByText('自定义底部')).toBeInTheDocument()
      })
    })

    it('应该渲染 title 插槽内容', async () => {
      render(Dialog, {
        props: {
          visible: true,
          title: '默认标题',
        },
        slots: {
          title: '<span class="custom-title">自定义标题</span>',
        },
      })

      await waitFor(() => {
        expect(screen.getByText('自定义标题')).toBeInTheDocument()
        expect(screen.queryByText('默认标题')).not.toBeInTheDocument()
      })
    })
  })

  describe('事件', () => {
    it('打开对话框时应该触发 open 事件', async () => {
      const onOpen = vi.fn()

      render(Dialog, {
        props: {
          visible: true,
          onOpen,
        },
      })

      await waitFor(() => {
        expect(onOpen).toHaveBeenCalled()
      })
    })

    it('关闭对话框时应该触发 close 事件', async () => {
      const onClose = vi.fn()

      render(Dialog, {
        props: {
          visible: true,
          title: '测试对话框',
          onClose,
        },
      })

      // 等待对话框渲染
      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      const closeButton = document.querySelector('button[aria-label="关闭对话框"]')
      expect(closeButton).toBeInTheDocument()

      await fireEvent.click(closeButton!)

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('对话框显示时应该触发 opened 事件', async () => {
      const onOpened = vi.fn()

      render(Dialog, {
        props: {
          visible: true,
          onOpened,
        },
      })

      await waitFor(() => {
        expect(onOpened).toHaveBeenCalled()
      }, { timeout: 500 })
    })

    it('对话框隐藏时应该触发 closed 事件', async () => {
      const onClosed = vi.fn()

      render(Dialog, {
        props: {
          visible: false,
          onClosed,
        },
      })

      // 等待动画时间
      await new Promise(resolve => setTimeout(resolve, 400))

      // 如果 visible 从 true 变为 false，应该触发 closed
      const { rerender } = render(Dialog, {
        props: {
          visible: true,
          onClosed,
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      await rerender({ visible: false })

      await waitFor(() => {
        expect(onClosed).toHaveBeenCalled()
      }, { timeout: 500 })
    })
  })

  describe('beforeClose 回调', () => {
    it('beforeClose 返回 false 应该阻止关闭', async () => {
      const beforeClose = vi.fn().mockResolvedValue(false)
      const { emitted } = render(Dialog, {
        props: {
          visible: true,
          title: '测试对话框',
          beforeClose,
        },
      })

      // 等待对话框渲染
      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      const closeButton = document.querySelector('button[aria-label="关闭对话框"]')
      expect(closeButton).toBeInTheDocument()

      await fireEvent.click(closeButton!)

      await waitFor(() => {
        expect(beforeClose).toHaveBeenCalled()
        expect(emitted()['update:visible']).toBeFalsy()
      })
    })

    it('beforeClose 返回 true 应该允许关闭', async () => {
      const beforeClose = vi.fn().mockResolvedValue(true)
      const { emitted } = render(Dialog, {
        props: {
          visible: true,
          title: '测试对话框',
          beforeClose,
        },
      })

      // 等待对话框渲染
      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      const closeButton = document.querySelector('button[aria-label="关闭对话框"]')
      expect(closeButton).toBeInTheDocument()

      await fireEvent.click(closeButton!)

      await waitFor(() => {
        expect(beforeClose).toHaveBeenCalled()
        expect(emitted()['update:visible']).toBeTruthy()
      })
    })

    it('beforeClose 返回 Promise 应该等待异步操作', async () => {
      let resolveClose: (value: boolean) => void
      const beforeClosePromise = new Promise<boolean>(resolve => {
        resolveClose = resolve
      })
      const beforeClose = vi.fn().mockReturnValue(beforeClosePromise)

      render(Dialog, {
        props: {
          visible: true,
          title: '测试对话框',
          beforeClose,
        },
      })

      // 等待对话框渲染
      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      const closeButton = document.querySelector('button[aria-label="关闭对话框"]')
      expect(closeButton).toBeInTheDocument()

      await fireEvent.click(closeButton!)

      // 等待 beforeClose 被调用
      await waitFor(() => {
        expect(beforeClose).toHaveBeenCalled()
      })

      // 解析 Promise
      resolveClose!(true)

      // 等待关闭
      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).not.toBeInTheDocument()
      }, { timeout: 500 })
    })
  })

  describe('自定义类名', () => {
    it('应该正确应用自定义对话框类名', async () => {
      render(Dialog, {
        props: {
          visible: true,
          class: 'custom-dialog-class',
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toHaveClass('custom-dialog-class')
      })
    })

    it('应该正确应用自定义遮罩层类名', async () => {
      render(Dialog, {
        props: {
          visible: true,
          modalClass: 'custom-modal-class',
        },
      })

      await waitFor(() => {
        const overlay = document.querySelector('.custom-modal-class')
        expect(overlay).toBeInTheDocument()
      })
    })
  })

  describe('可访问性', () => {
    it('应该有正确的 role 属性', async () => {
      render(Dialog, {
        props: {
          visible: true,
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })
    })

    it('应该有 aria-modal 属性', async () => {
      render(Dialog, {
        props: {
          visible: true,
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[aria-modal="true"]')
        expect(dialog).toBeInTheDocument()
      })
    })

    it('有标题时应该有 aria-labelledby 属性', async () => {
      render(Dialog, {
        props: {
          visible: true,
          title: '测试标题',
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title')
      })
    })

    it('关闭按钮应该有正确的 aria-label', async () => {
      render(Dialog, {
        props: {
          visible: true,
          showClose: true,
        },
      })

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="关闭对话框"]')
        expect(closeButton).toBeInTheDocument()
      })
    })
  })

  describe('点击事件冒泡', () => {
    it('点击对话框内容不应该关闭对话框', async () => {
      const { emitted } = render(Dialog, {
        props: {
          visible: true,
        },
        slots: {
          default: '<div class="content">内容区域</div>',
        },
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      const content = document.querySelector('.content')
      await fireEvent.click(content!)

      await waitFor(() => {
        expect(emitted()['update:visible']).toBeFalsy()
      })
    })
  })
})
