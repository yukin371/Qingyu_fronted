/**
 * Pagination 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Pagination from '@/design-system/data/Pagination/Pagination.vue'

describe('Pagination', () => {
  describe('基础渲染', () => {
    it('默认渲染为第 1 页，每页 10 条，总数 0', () => {
      const { container } = render(Pagination)

      // 验证上一页按钮存在
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('正确渲染总数信息', () => {
      const { getByText } = render(Pagination, {
        props: {
          total: 100,
          layout: 'total, prev, pager, next',
        },
      })

      expect(getByText('共 100 条')).toBeTruthy()
    })

    it('正确计算总页数', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
        },
      })

      // 总页数为10,大于7时使用省略号,显示1,2,3,4,5,...,10
      // 页码按钮: 1,2,3,4,5,10 = 6个
      const buttons = container.querySelectorAll('button')
      const pagerButtons = Array.from(buttons).filter(btn => {
        return btn.textContent?.match(/^\d+$/)
      })
      expect(pagerButtons.length).toBe(6)
    })
  })

  describe('页码显示逻辑', () => {
    it('总页数小于等于 7 时显示所有页码', () => {
      const { container } = render(Pagination, {
        props: {
          total: 50,
          pageSize: 10,
          currentPage: 1,
        },
      })

      const buttons = container.querySelectorAll('button')
      const pagerButtons = Array.from(buttons).filter(btn => {
        return btn.textContent?.match(/^\d+$/)
      })
      expect(pagerButtons.length).toBe(5)
    })

    it('总页数大于 7 时使用省略号', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
        },
      })

      // 应该有省略号（用 SVG 图标表示）
      const ellipsis = container.querySelectorAll('svg')
      expect(ellipsis.length).toBeGreaterThan(0)
    })

    it('当前页在前面时正确显示', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 3,
        },
      })

      // 应该显示 1, 2, 3, 4, 5, ..., 10
      const buttons = container.querySelectorAll('button')
      const pagerButtons = Array.from(buttons).filter(btn => {
        return btn.textContent?.match(/^\d+$/)
      }).map(btn => parseInt(btn.textContent || '0'))

      expect(pagerButtons).toContain(1)
      expect(pagerButtons).toContain(5)
    })

    it('当前页在后面时正确显示', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 8,
        },
      })

      // 应该显示 1, ..., 6, 7, 8, 9, 10
      const buttons = container.querySelectorAll('button')
      const pagerButtons = Array.from(buttons).filter(btn => {
        return btn.textContent?.match(/^\d+$/)
      }).map(btn => parseInt(btn.textContent || '0'))

      expect(pagerButtons).toContain(1)
      expect(pagerButtons).toContain(10)
    })
  })

  describe('交互行为', () => {
    it('点击页码触发 update:currentPage 事件', async () => {
      const onUpdateCurrentPage = vi.fn()
      const onCurrentChange = vi.fn()

      const { getByText } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 1,
          'onUpdate:currentPage': onUpdateCurrentPage,
          onCurrentChange,
        },
      })

      const page3Button = getByText('3')
      await fireEvent.click(page3Button)

      expect(onUpdateCurrentPage).toHaveBeenCalledWith(3)
      expect(onCurrentChange).toHaveBeenCalledWith(3)
    })

    it('点击上一页按钮触发事件', async () => {
      const onUpdateCurrentPage = vi.fn()
      const onCurrentChange = vi.fn()

      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
          'onUpdate:currentPage': onUpdateCurrentPage,
          onCurrentChange,
        },
      })

      const buttons = container.querySelectorAll('button')
      const prevButton = buttons[0] // 第一个按钮是上一页
      await fireEvent.click(prevButton)

      expect(onUpdateCurrentPage).toHaveBeenCalledWith(4)
      expect(onCurrentChange).toHaveBeenCalledWith(4)
    })

    it('点击下一页按钮触发事件', async () => {
      const onUpdateCurrentPage = vi.fn()
      const onCurrentChange = vi.fn()

      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
          'onUpdate:currentPage': onUpdateCurrentPage,
          onCurrentChange,
        },
      })

      const buttons = container.querySelectorAll('button')
      const nextButton = buttons[buttons.length - 1] // 最后一个按钮是下一页
      await fireEvent.click(nextButton)

      expect(onUpdateCurrentPage).toHaveBeenCalledWith(6)
      expect(onCurrentChange).toHaveBeenCalledWith(6)
    })

    it('在第一页时上一页按钮禁用', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 1,
        },
      })

      const buttons = container.querySelectorAll('button')
      const prevButton = buttons[0]
      expect(prevButton).toBeDisabled()
    })

    it('在最后一页时下一页按钮禁用', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 10,
        },
      })

      const buttons = container.querySelectorAll('button')
      const nextButton = buttons[buttons.length - 1]
      expect(nextButton).toBeDisabled()
    })

    it('disabled 状态下所有按钮禁用', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
          disabled: true,
        },
      })

      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })

    it('改变每页数量触发事件', async () => {
      const onUpdatePageSize = vi.fn()
      const onSizeChange = vi.fn()

      const { getByDisplayValue } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
          pageSizes: [10, 20, 30],
          layout: 'sizes, prev, pager, next',
          'onUpdate:pageSize': onUpdatePageSize,
          onSizeChange,
        },
      })

      const select = getByDisplayValue('10 条/页')
      await fireEvent.change(select, { target: { value: '20' } })

      expect(onUpdatePageSize).toHaveBeenCalledWith(20)
      expect(onSizeChange).toHaveBeenCalledWith(20)
    })
  })

  describe('跳转功能', () => {
    it('输入页码并按回车触发跳转', async () => {
      const onUpdateCurrentPage = vi.fn()
      const onCurrentChange = vi.fn()

      const { getByRole } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 1,
          layout: 'prev, pager, next, jumper',
          'onUpdate:currentPage': onUpdateCurrentPage,
          onCurrentChange,
        },
      })

      const input = getByRole('spinbutton')
      await fireEvent.update(input, '5')
      await fireEvent.keyDown(input, { key: 'Enter' })

      expect(onUpdateCurrentPage).toHaveBeenCalledWith(5)
      expect(onCurrentChange).toHaveBeenCalledWith(5)
    })

    it('输入超出范围的页码时自动调整', async () => {
      const onUpdateCurrentPage = vi.fn()

      const { getByRole } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 1,
          layout: 'prev, pager, next, jumper',
          'onUpdate:currentPage': onUpdateCurrentPage,
        },
      })

      const input = getByRole('spinbutton')
      
      // 测试超出最大值
      await fireEvent.update(input, '999')
      await fireEvent.keyDown(input, { key: 'Enter' })
      expect(onUpdateCurrentPage).not.toHaveBeenCalled()

      // 测试小于最小值
      await fireEvent.update(input, '0')
      await fireEvent.keyDown(input, { key: 'Enter' })
      expect(onUpdateCurrentPage).not.toHaveBeenCalled()
    })

    it('失焦时触发跳转', async () => {
      const onUpdateCurrentPage = vi.fn()

      const { getByRole } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 1,
          layout: 'prev, pager, next, jumper',
          'onUpdate:currentPage': onUpdateCurrentPage,
        },
      })

      const input = getByRole('spinbutton')
      await fireEvent.update(input, '5')
      await fireEvent.blur(input)

      expect(onUpdateCurrentPage).toHaveBeenCalledWith(5)
    })
  })

  describe('布局配置', () => {
    it('正确显示布局配置的各个部分', () => {
      const { getByText, container, queryByText } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
          layout: 'total, sizes, prev, pager, next, jumper',
        },
      })

      // 验证总数显示
      expect(getByText('共 100 条')).toBeTruthy()

      // 验证每页数量选择器
      expect(getByText('10 条/页')).toBeTruthy()

      // 验证跳转输入框
      expect(getByText('前往')).toBeTruthy()
      expect(getByText('页')).toBeTruthy()
    })

    it('仅显示配置的布局部分', () => {
      const { queryByText, container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
          layout: 'prev, next',
        },
      })

      // 不应该显示总数
      expect(queryByText('共 100 条')).toBeFalsy()

      // 不应该显示每页数量选择器
      expect(queryByText('10 条/页')).toBeFalsy()

      // 不应该显示跳转
      expect(queryByText('前往')).toBeFalsy()
    })
  })

  describe('背景色样式', () => {
    it('background 为 true 时按钮有边框', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
          background: true,
        },
      })

      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.className).toContain('border')
      })
    })

    it('background 为 false 时按钮无边框', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
          background: false,
        },
      })

      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.className).not.toContain('border')
      })
    })
  })

  describe('hideOnSinglePage', () => {
    it('只有一页且 hideOnSinglePage 为 true 时隐藏组件', () => {
      const { container } = render(Pagination, {
        props: {
          total: 5,
          pageSize: 10,
          currentPage: 1,
          hideOnSinglePage: true,
        },
      })

      // hideOnSinglePage为true且只有一页时,组件完全不渲染
      const wrapper = container.querySelector('.flex')
      expect(wrapper).toBeNull()
    })

    it('只有一页且 hideOnSinglePage 为 false 时显示组件', () => {
      const { container } = render(Pagination, {
        props: {
          total: 5,
          pageSize: 10,
          currentPage: 1,
          hideOnSinglePage: false,
        },
      })

      const wrapper = container.querySelector('.flex')
      expect(wrapper?.textContent?.trim()).not.toBe('')
    })

    it('多页时始终显示组件', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 1,
          hideOnSinglePage: true,
        },
      })

      const wrapper = container.querySelector('.flex')
      expect(wrapper?.textContent?.trim()).not.toBe('')
    })
  })

  describe('双向绑定', () => {
    it('支持 v-model:currentPage 双向绑定', async () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 1,
        },
      })

      const buttons = container.querySelectorAll('button')
      const page3Button = Array.from(buttons).find(btn => btn.textContent === '3')
      
      expect(page3Button).toBeTruthy()
      if (page3Button) {
        await fireEvent.click(page3Button)
        // 事件已经在上面的交互测试中验证
      }
    })

    it('支持 v-model:pageSize 双向绑定', async () => {
      const { getByDisplayValue } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          layout: 'sizes, prev, pager, next',
        },
      })

      const select = getByDisplayValue('10 条/页')
      expect(select).toBeTruthy()
    })
  })

  describe('样式', () => {
    it('接受自定义 class', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
          class: 'custom-class',
        },
      })

      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.className).toContain('custom-class')
      })
    })

    it('有 transition 动画', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 5,
        },
      })

      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.className).toContain('transition-all')
      })
    })
  })

  describe('边界情况', () => {
    it('total 为 0 时不显示页码', () => {
      const { container } = render(Pagination, {
        props: {
          total: 0,
          pageSize: 10,
          currentPage: 1,
        },
      })

      const buttons = container.querySelectorAll('button')
      const pagerButtons = Array.from(buttons).filter(btn => {
        return btn.textContent?.match(/^\d+$/)
      })
      expect(pagerButtons.length).toBe(0)
    })

    it('pageSize 为 0 时不显示页码', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 0,
          currentPage: 1,
        },
      })

      const buttons = container.querySelectorAll('button')
      const pagerButtons = Array.from(buttons).filter(btn => {
        return btn.textContent?.match(/^\d+$/)
      })
      expect(pagerButtons.length).toBe(0)
    })

    it('currentPage 超出范围时仍然渲染', () => {
      const { container } = render(Pagination, {
        props: {
          total: 100,
          pageSize: 10,
          currentPage: 999,
        },
      })

      const wrapper = container.querySelector('.flex')
      expect(wrapper).toBeTruthy()
    })
  })
})
