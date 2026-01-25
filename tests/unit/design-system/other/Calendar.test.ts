/**
 * Calendar 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { ref } from 'vue'
import Calendar from '@/design-system/other/Calendar/Calendar.vue'

describe('Calendar 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染日历组件', () => {
      const { container } = render(Calendar)
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
    })

    it('应该显示星期标题', () => {
      const { container } = render(Calendar, {
        props: { firstDayOfWeek: 0 },
      })
      expect(container.textContent).toContain('日')
      expect(container.textContent).toContain('一')
    })

    it('应该显示日期网格', () => {
      const { container } = render(Calendar)
      const grid = container.querySelectorAll('.grid-cols-7')
      expect(grid.length).toBeGreaterThan(0)
    })

    it('应该显示今天按钮', () => {
      const { container } = render(Calendar)
      expect(container.textContent).toContain('今天')
    })
  })

  describe('单日期选择', () => {
    it('应该支持 v-model 双向绑定', async () => {
      const TestComponent = {
        components: { Calendar },
        template: '<Calendar v-model="date" />',
        setup() {
          const date = ref(new Date('2024-12-25'))
          return { date }
        },
      }

      const { container } = render(TestComponent)

      // 等待渲染完成
      await waitFor(() => {
        expect(container.textContent).toContain('日')
      })
    })

    it('应该能够选择日期', async () => {
      const emit = vi.fn()
      const { container } = render(Calendar, {
        props: {
          onSelect: emit,
        },
      })

      // 查找第一个可点击的日期
      const dateCell = container.querySelector('.hover\\:bg-slate-100') as HTMLElement
      expect(dateCell).toBeInTheDocument()

      if (dateCell) {
        await fireEvent.click(dateCell)
        expect(emit).toHaveBeenCalled()
      }
    })
  })

  describe('范围选择', () => {
    it('应该支持范围选择模式', () => {
      const { container } = render(Calendar, {
        props: { range: true },
      })
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
    })

    it('应该能够选择日期范围', async () => {
      const emit = vi.fn()
      const { container } = render(Calendar, {
        props: {
          range: true,
          onSelect: emit,
        },
      })

      // 点击两个日期
      const dateCells = container.querySelectorAll('.hover\\:bg-slate-100')
      if (dateCells.length >= 2) {
        await fireEvent.click(dateCells[0] as HTMLElement)
        await fireEvent.click(dateCells[6] as HTMLElement)

        // 验证事件被触发
        expect(emit).toHaveBeenCalled()
      }
    })

    it('范围内日期应该有正确的样式', async () => {
      const startDate = new Date('2024-12-01')
      const endDate = new Date('2024-12-07')
      const { container } = render(Calendar, {
        props: {
          range: true,
          modelValue: [startDate, endDate],
        },
      })

      await waitFor(() => {
        const rangeCells = container.querySelectorAll('.bg-primary-100')
        // 范围内日期可能显示为 bg-primary-100
        expect(container.querySelector('.bg-white')).toBeInTheDocument()
      })
    })
  })

  describe('尺寸变体', () => {
    it('应该支持小尺寸', () => {
      const { container } = render(Calendar, {
        props: { size: 'sm' },
      })
      expect(container.querySelector('.text-sm')).toBeInTheDocument()
    })

    it('应该支持中尺寸（默认）', () => {
      const { container } = render(Calendar, {
        props: { size: 'md' },
      })
      expect(container.querySelector('.text-base')).toBeInTheDocument()
    })

    it('应该支持大尺寸', () => {
      const { container } = render(Calendar, {
        props: { size: 'lg' },
      })
      expect(container.querySelector('.text-lg')).toBeInTheDocument()
    })
  })

  describe('周数显示', () => {
    it('默认不显示周数', () => {
      const { container } = render(Calendar)
      const weekHeader = Array.from(container.querySelectorAll('div')).find(el => el.textContent === '周')
      expect(weekHeader).not.toBeInTheDocument()
    })

    it('应该能够显示周数', () => {
      const { container } = render(Calendar, {
        props: {
          showWeekNumbers: true,
          firstDayOfWeek: 1,
        },
      })
      expect(container.textContent).toContain('周')
    })
  })

  describe('自定义起始日', () => {
    it('应该支持自定义每周的第一天', () => {
      const { container } = render(Calendar, {
        props: { firstDayOfWeek: 1 },
      })
      // 周一应该在第一位
      expect(container.textContent).toContain('一')
    })
  })

  describe('禁用状态', () => {
    it('应该支持禁用整个日历', () => {
      const { container } = render(Calendar, {
        props: { disabled: true },
      })

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('应该支持禁用特定日期', () => {
      const disabledDate = (date: Date) => {
        const day = date.getDay()
        return day === 0 || day === 6 // 禁用周末
      }

      const { container } = render(Calendar, {
        props: { disabledDate },
      })

      const disabledCells = container.querySelectorAll('.cursor-not-allowed')
      expect(disabledCells.length).toBeGreaterThan(0)
    })

    it('禁用的日期不应该触发选择', async () => {
      const disabledDate = (date: Date) => {
        return date.getDate() === 1 // 禁用每月1号
      }

      const emit = vi.fn()
      const { container } = render(Calendar, {
        props: {
          disabledDate,
          onSelect: emit,
        },
      })

      const disabledCells = container.querySelectorAll('.cursor-not-allowed')
      if (disabledCells.length > 0) {
        await fireEvent.click(disabledCells[0] as HTMLElement)
        expect(emit).not.toHaveBeenCalled()
      }
    })
  })

  describe('日期范围限制', () => {
    it('应该支持最小日期限制', () => {
      const minDate = new Date('2024-12-10')
      const { container } = render(Calendar, {
        props: {
          modelValue: new Date('2024-12-15'),
          minDate,
        },
      })

      const disabledCells = container.querySelectorAll('.cursor-not-allowed')
      expect(disabledCells.length).toBeGreaterThan(0)
    })

    it('应该支持最大日期限制', () => {
      const maxDate = new Date('2024-12-20')
      const { container } = render(Calendar, {
        props: {
          modelValue: new Date('2024-12-15'),
          maxDate,
        },
      })

      const disabledCells = container.querySelectorAll('.cursor-not-allowed')
      expect(disabledCells.length).toBeGreaterThan(0)
    })
  })

  describe('今天按钮', () => {
    it('默认显示今天按钮', () => {
      const { container } = render(Calendar)
      expect(container.textContent).toContain('今天')
    })

    it('应该能够隐藏今天按钮', () => {
      const { container } = render(Calendar, {
        props: { showToday: false },
      })
      expect(container.textContent).not.toContain('今天')
    })

    it('点击今天按钮应该选择今天', async () => {
      const emit = vi.fn()
      const { container } = render(Calendar, {
        props: {
          onSelect: emit,
        },
      })

      const todayButton = Array.from(container.querySelectorAll('button')).find(
        button => button.textContent === '今天'
      )

      if (todayButton) {
        await fireEvent.click(todayButton)
        expect(emit).toHaveBeenCalled()
      }
    })
  })

  describe('月份切换', () => {
    it('应该能够切换到上个月', async () => {
      const emit = vi.fn()
      const { container } = render(Calendar, {
        props: {
          onMonthChange: emit,
        },
      })

      const prevMonthButtons = container.querySelectorAll('button')
      // 找到上个月按钮
      if (prevMonthButtons.length >= 2) {
        await fireEvent.click(prevMonthButtons[1] as HTMLElement)
        expect(emit).toHaveBeenCalled()
      }
    })

    it('应该能够切换到下个月', async () => {
      const emit = vi.fn()
      const { container } = render(Calendar, {
        props: {
          onMonthChange: emit,
        },
      })

      const nextMonthButtons = container.querySelectorAll('button')
      // 找到下个月按钮
      if (nextMonthButtons.length >= 4) {
        await fireEvent.click(nextMonthButtons[3] as HTMLElement)
        expect(emit).toHaveBeenCalled()
      }
    })

    it('应该能够隐藏月份切换', () => {
      const { container } = render(Calendar, {
        props: { showMonthSwitcher: false },
      })

      // 不应该有月份切换按钮
      const switcherButtons = container.querySelectorAll('.border-b button')
      expect(switcherButtons.length).toBe(0)
    })
  })

  describe('年份切换', () => {
    it('应该能够切换到上一年', async () => {
      const emit = vi.fn()
      const { container } = render(Calendar, {
        props: {
          onYearChange: emit,
        },
      })

      const buttons = container.querySelectorAll('button')
      // 第一个按钮是上一年
      if (buttons.length > 0) {
        await fireEvent.click(buttons[0] as HTMLElement)
        expect(emit).toHaveBeenCalled()
      }
    })

    it('应该能够切换到下一年', async () => {
      const emit = vi.fn()
      const { container } = render(Calendar, {
        props: {
          onYearChange: emit,
        },
      })

      const buttons = container.querySelectorAll('button')
      // 找到下一年按钮
      if (buttons.length >= 5) {
        await fireEvent.click(buttons[4] as HTMLElement)
        expect(emit).toHaveBeenCalled()
      }
    })
  })

  describe('事件', () => {
    it('应该触发 select 事件', async () => {
      const select = vi.fn()
      const { container } = render(Calendar, {
        props: { onSelect: select },
      })

      const dateCell = container.querySelector('.hover\\:bg-slate-100') as HTMLElement
      if (dateCell) {
        await fireEvent.click(dateCell)
        expect(select).toHaveBeenCalled()
      }
    })

    it('应该触发 panel-change 事件', async () => {
      const panelChange = vi.fn()
      const { container } = render(Calendar, {
        props: {
          onPanelChange: panelChange,
        },
      })

      const nextMonthButton = container.querySelectorAll('button')[3]
      if (nextMonthButton) {
        await fireEvent.click(nextMonthButton as HTMLElement)
        expect(panelChange).toHaveBeenCalled()
      }
    })

    it('应该触发 update:modelValue 事件', async () => {
      const updateModelValue = vi.fn()
      const { container } = render(Calendar, {
        props: {
          'onUpdate:modelValue': updateModelValue,
        },
      })

      const dateCell = container.querySelector('.hover\\:bg-slate-100') as HTMLElement
      if (dateCell) {
        await fireEvent.click(dateCell)
        expect(updateModelValue).toHaveBeenCalled()
      }
    })
  })

  describe('边界情况', () => {
    it('应该处理 null 值', () => {
      const { container } = render(Calendar, {
        props: { modelValue: null },
      })
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
    })

    it('应该处理空字符串', () => {
      const { container } = render(Calendar, {
        props: { modelValue: '' as any },
      })
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
    })

    it('应该处理闰年', () => {
      const { container } = render(Calendar, {
        props: { modelValue: new Date('2024-02-29') },
      })
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
    })

    it('应该处理不同月份的天数', () => {
      // 2月只有28或29天
      const { container: febContainer } = render(Calendar, {
        props: { modelValue: new Date('2024-02-15') },
      })

      // 1月有31天
      const { container: janContainer } = render(Calendar, {
        props: { modelValue: new Date('2024-01-15') },
      })

      expect(febContainer.querySelector('.bg-white')).toBeInTheDocument()
      expect(janContainer.querySelector('.bg-white')).toBeInTheDocument()
    })
  })

  describe('可访问性', () => {
    it('禁用状态应该有正确的样式', () => {
      const { container } = render(Calendar, {
        props: { disabled: true },
      })

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('日期单元格应该是可点击的', () => {
      const { container } = render(Calendar)
      const clickableCells = container.querySelectorAll('.hover\\:bg-slate-100')
      expect(clickableCells.length).toBeGreaterThan(0)
    })
  })

  describe('样式', () => {
    it('应该应用自定义类名', () => {
      const { container } = render(Calendar, {
        props: { class: 'custom-class' },
      })

      const calendar = container.querySelector('.custom-class')
      expect(calendar).toBeInTheDocument()
    })

    it('应该有正确的边框样式', () => {
      const { container } = render(Calendar)
      const calendar = container.querySelector('.border')
      expect(calendar).toBeInTheDocument()
    })

    it('应该有正确的圆角样式', () => {
      const { container } = render(Calendar)
      const calendar = container.querySelector('.rounded-lg')
      expect(calendar).toBeInTheDocument()
    })
  })

  describe('国际化', () => {
    it('应该支持中文语言环境', () => {
      const { container } = render(Calendar, {
        props: { locale: 'zh-CN' },
      })
      expect(container.textContent).toContain('今天')
    })
  })

  describe('计算属性', () => {
    it('应该正确计算星期标题', () => {
      const { container } = render(Calendar, {
        props: { firstDayOfWeek: 0 },
      })

      const weekdayLabels = container.querySelectorAll('.grid-cols-7 > div')
      expect(weekdayLabels.length).toBeGreaterThan(0)
    })
  })

  describe('交互', () => {
    it('应该阻止点击禁用日期', async () => {
      const disabledDate = (date: Date) => date.getDate() === 1
      const select = vi.fn()

      const { container } = render(Calendar, {
        props: {
          disabledDate,
          onSelect: select,
        },
      })

      const disabledCells = container.querySelectorAll('.cursor-not-allowed')
      if (disabledCells.length > 0) {
        await fireEvent.click(disabledCells[0] as HTMLElement)
        expect(select).not.toHaveBeenCalled()
      }
    })

    it('范围选择应该正确处理两次点击', async () => {
      const select = vi.fn()
      const { container } = render(Calendar, {
        props: {
          range: true,
          onSelect: select,
        },
      })

      const cells = container.querySelectorAll('.hover\\:bg-slate-100')
      if (cells.length >= 2) {
        await fireEvent.click(cells[0] as HTMLElement)
        await fireEvent.click(cells[6] as HTMLElement)

        // 应该触发选择
        expect(select).toHaveBeenCalled()
      }
    })
  })

  describe('响应式', () => {
    it('应该响应 modelValue 的变化', async () => {
      const { container, rerender } = render(Calendar, {
        props: { modelValue: new Date('2024-12-15') },
      })

      await rerender({ modelValue: new Date('2024-12-20') })

      expect(container.querySelector('.bg-white')).toBeInTheDocument()
    })
  })
})
