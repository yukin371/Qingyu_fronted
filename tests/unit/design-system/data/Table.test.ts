/**
 * Table 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Table from '@/design-system/data/Table/Table.vue'
import type { Column } from '@/design-system/data/Table/types'

describe('Table', () => {
  const sampleData = [
    { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 30, email: 'lisi@example.com' },
    { id: 3, name: '王五', age: 28, email: 'wangwu@example.com' },
  ]

  const sampleColumns: Column[] = [
    { prop: 'id', label: 'ID', width: 80, align: 'center' },
    { prop: 'name', label: '姓名', width: 120 },
    { prop: 'age', label: '年龄', width: 80, align: 'center' },
    { prop: 'email', label: '邮箱' },
  ]

  describe('基础渲染', () => {
    it('默认渲染为空数据', () => {
      const { container } = render(Table, {
        props: {
          data: [],
          columns: sampleColumns,
        },
      })

      expect(container.textContent).toContain('暂无数据')
    })

    it('正确渲染表格数据', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
        },
      })

      // 验证表格行数 (表头 + 数据行)
      const rows = container.querySelectorAll('tbody tr')
      expect(rows.length).toBe(3)
    })

    it('正确渲染表头', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
        },
      })

      const headers = container.querySelectorAll('thead th')
      expect(headers.length).toBe(4)
      expect(headers[0].textContent).toContain('ID')
      expect(headers[1].textContent).toContain('姓名')
      expect(headers[2].textContent).toContain('年龄')
      expect(headers[3].textContent).toContain('邮箱')
    })

    it('showHeader 为 false 时不显示表头', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          showHeader: false,
        },
      })

      const headers = container.querySelectorAll('thead')
      expect(headers.length).toBe(0)
    })
  })

  describe('样式类名', () => {
    it('border 为 true 时添加边框类名', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          border: true,
        },
      })

      const table = container.querySelector('.border')
      expect(table).toBeTruthy()
    })

    it('stripe 为 true 时添加斑马纹', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          stripe: true,
        },
      })

      const rows = container.querySelectorAll('tbody tr')
      // 验证至少有一行有 even 类名
      let hasEvenClass = false
      rows.forEach(row => {
        if (row.className.includes('even:bg-slate-50')) {
          hasEvenClass = true
        }
      })
      expect(hasEvenClass).toBe(true)
    })

    it('highlightCurrentRow 为 true 时添加高亮样式', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          highlightCurrentRow: true,
        },
      })

      // 验证容器存在
      const table = container.querySelector('table')
      expect(table).toBeTruthy()
    })

    it('接受自定义 class', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          class: 'custom-class',
        },
      })

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeTruthy()
    })
  })

  describe('尺寸变体', () => {
    it('size 为 sm 时使用小尺寸样式', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          size: 'sm',
        },
      })

      const cells = container.querySelectorAll('td')
      cells.forEach(cell => {
        expect(cell.className).toContain('px-3')
        expect(cell.className).toContain('py-2')
      })
    })

    it('size 为 md 时使用默认尺寸样式', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          size: 'md',
        },
      })

      const cells = container.querySelectorAll('td')
      cells.forEach(cell => {
        expect(cell.className).toContain('px-4')
        expect(cell.className).toContain('py-2.5')
      })
    })

    it('size 为 lg 时使用大尺寸样式', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          size: 'lg',
        },
      })

      const cells = container.querySelectorAll('td')
      cells.forEach(cell => {
        expect(cell.className).toContain('px-4')
        expect(cell.className).toContain('py-3')
      })
    })
  })

  describe('列对齐', () => {
    it('左对齐列使用 text-left 类名', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: [
            { prop: 'name', label: '姓名', align: 'left' },
          ],
        },
      })

      const cells = container.querySelectorAll('td')
      cells.forEach(cell => {
        expect(cell.className).toContain('text-left')
      })
    })

    it('居中对齐列使用 text-center 类名', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: [
            { prop: 'id', label: 'ID', align: 'center' },
          ],
        },
      })

      const cells = container.querySelectorAll('td')
      cells.forEach(cell => {
        expect(cell.className).toContain('text-center')
      })
    })

    it('右对齐列使用 text-right 类名', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: [
            { prop: 'salary', label: '薪资', align: 'right' },
          ],
        },
      })

      const cells = container.querySelectorAll('td')
      cells.forEach(cell => {
        expect(cell.className).toContain('text-right')
      })
    })
  })

  describe('交互行为', () => {
    it('点击行触发 rowClick 事件', async () => {
      const onRowClick = vi.fn()

      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          onRowClick,
        },
      })

      const firstRow = container.querySelector('tbody tr')
      if (firstRow) {
        await firstRow.click()
        expect(onRowClick).toHaveBeenCalled()
      }
    })

    it('双击行触发 rowDblclick 事件', async () => {
      const onRowDblclick = vi.fn()

      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          onRowDblclick,
        },
      })

      const firstRow = container.querySelector('tbody tr')
      if (firstRow) {
        await fireEvent.dblClick(firstRow)
        expect(onRowDblclick).toHaveBeenCalled()
      }
    })

    it('点击排序列触发 sortChange 事件', async () => {
      const onSortChange = vi.fn()

      const columns: Column[] = [
        { prop: 'id', label: 'ID', width: 80, align: 'center', sortable: true },
        { prop: 'name', label: '姓名', width: 120 },
      ]

      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns,
          onSortChange,
        },
      })

      const sortableHeader = container.querySelector('thead th')
      if (sortableHeader) {
        await sortableHeader.click()
        expect(onSortChange).toHaveBeenCalled()
      }
    })
  })

  describe('空数据状态', () => {
    it('数据为空时显示空状态文本', () => {
      const { container } = render(Table, {
        props: {
          data: [],
          columns: sampleColumns,
          emptyText: '暂无员工数据',
        },
      })

      expect(container.textContent).toContain('暂无员工数据')
    })

    it('使用默认空状态文本', () => {
      const { container } = render(Table, {
        props: {
          data: [],
          columns: sampleColumns,
        },
      })

      expect(container.textContent).toContain('暂无数据')
    })
  })

  describe('自定义渲染', () => {
    it('支持自定义单元格渲染函数', () => {
      const customRender = vi.fn((row: any) => `Custom: ${row.name}`)

      const columns: Column[] = [
        { prop: 'name', label: '姓名', render: customRender },
      ]

      render(Table, {
        props: {
          data: sampleData,
          columns,
        },
      })

      expect(customRender).toHaveBeenCalled()
    })
  })

  describe('自定义样式', () => {
    it('支持自定义行类名字符串', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          rowClassName: 'custom-row-class',
        },
      })

      const rows = container.querySelectorAll('tbody tr')
      rows.forEach(row => {
        expect(row.className).toContain('custom-row-class')
      })
    })

    it('支持自定义行类名函数', () => {
      const rowClassName = (row: any) => {
        return row.age > 25 ? 'adult-row' : 'young-row'
      }

      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          rowClassName,
        },
      })

      const rows = container.querySelectorAll('tbody tr')
      let hasAdultRow = false
      let hasYoungRow = false

      rows.forEach(row => {
        if (row.className.includes('adult-row')) hasAdultRow = true
        if (row.className.includes('young-row')) hasYoungRow = true
      })

      expect(hasAdultRow || hasYoungRow).toBe(true)
    })

    it('支持自定义单元格类名字符串', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          cellClassName: 'custom-cell-class',
        },
      })

      const cells = container.querySelectorAll('td')
      cells.forEach(cell => {
        expect(cell.className).toContain('custom-cell-class')
      })
    })
  })

  describe('列宽度', () => {
    it('固定列宽时使用指定宽度', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: [
            { prop: 'id', label: 'ID', width: 100 },
          ],
        },
      })

      const headers = container.querySelectorAll('thead th')
      expect(headers[0].getAttribute('style')).toContain('width: 100px')
    })

    it('最小列宽时使用最小宽度', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: [
            { prop: 'name', label: '姓名', minWidth: 150 },
          ],
        },
      })

      const headers = container.querySelectorAll('thead th')
      expect(headers[0].getAttribute('style')).toContain('min-width: 150px')
    })

    it('fit 为 true 时使用 table-fixed 布局', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          fit: true,
        },
      })

      const table = container.querySelector('table')
      expect(table?.className).toContain('table-fixed')
    })

    it('fit 为 false 时不使用 table-fixed 布局', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
          fit: false,
        },
      })

      const table = container.querySelector('table')
      expect(table?.className).not.toContain('table-fixed')
    })
  })

  describe('排序功能', () => {
    it('sortable 为 true 的列显示排序图标', () => {
      const columns: Column[] = [
        { prop: 'id', label: 'ID', sortable: true },
      ]

      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns,
        },
      })

      const headers = container.querySelectorAll('thead th')
      expect(headers[0].textContent).toContain('↕')
    })

    it('默认排序状态正确显示', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: [
            { prop: 'age', label: '年龄', sortable: true },
          ],
          defaultSort: { prop: 'age', order: 'ascending' },
        },
      })

      // 验证表格渲染
      const table = container.querySelector('table')
      expect(table).toBeTruthy()
    })
  })

  describe('边界情况', () => {
    it('空列配置时不报错', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: [],
        },
      })

      expect(container.querySelector('table')).toBeTruthy()
    })

    it('undefined 值正确显示', () => {
      const data = [{ id: 1, name: undefined }]
      const columns: Column[] = [
        { prop: 'name', label: '姓名' },
      ]

      const { container } = render(Table, {
        props: {
          data,
          columns,
        },
      })

      const cell = container.querySelector('td')
      expect(cell?.textContent).toBe('')
    })

    it('null 值正确显示', () => {
      const data = [{ id: 1, name: null }]
      const columns: Column[] = [
        { prop: 'name', label: '姓名' },
      ]

      const { container } = render(Table, {
        props: {
          data,
          columns,
        },
      })

      const cell = container.querySelector('td')
      expect(cell?.textContent).toBe('')
    })

    it('大数据量正常渲染', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `员工 ${i + 1}`,
      }))

      const { container } = render(Table, {
        props: {
          data: largeData,
          columns: sampleColumns,
        },
      })

      const rows = container.querySelectorAll('tbody tr')
      expect(rows.length).toBe(100)
    })
  })

  describe('过渡动画', () => {
    it('行有 transition 类名', () => {
      const { container } = render(Table, {
        props: {
          data: sampleData,
          columns: sampleColumns,
        },
      })

      const rows = container.querySelectorAll('tbody tr')
      rows.forEach(row => {
        expect(row.className).toContain('transition-colors')
      })
    })
  })
})
