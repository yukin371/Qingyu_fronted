/**
 * List 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import List from '@/design-system/base/List/List.vue'
import ListItem from '@/design-system/base/List/ListItem.vue'

describe('List 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染列表数据', () => {
      const data = ['项目 1', '项目 2', '项目 3']
      const { getByText } = render(List, {
        props: { data },
      })

      data.forEach(item => {
        expect(getByText(item)).toBeInTheDocument()
      })
    })

    it('应该正确渲染带边框的列表', () => {
      const { container } = render(List, {
        props: {
          data: ['项目 1'],
          border: true,
        },
      })

      const listContainer = container.querySelector('.bg-white')
      expect(listContainer).toHaveClass('border', 'border-slate-200')
    })

    it('应该正确渲染不带分割线的列表', () => {
      const { container } = render(List, {
        props: {
          data: ['项目 1', '项目 2'],
          split: false,
        },
      })

      const listElement = container.querySelector('ul')
      expect(listElement).not.toHaveClass('divide-y', 'divide-slate-100')
    })
  })

  describe('加载状态', () => {
    it('应该显示加载状态', () => {
      const { getByText } = render(List, {
        props: { loading: true },
      })

      expect(getByText('加载中...')).toBeInTheDocument()
    })

    it('应该显示自定义加载内容', () => {
      const { getByText } = render(List, {
        props: { loading: true },
        slots: {
          loading: '<div class="custom-loading">自定义加载中</div>',
        },
      })

      expect(getByText('自定义加载中')).toBeInTheDocument()
    })

    it('加载状态下不应显示列表内容', () => {
      const { queryByText } = render(List, {
        props: {
          data: ['项目 1'],
          loading: true,
        },
      })

      expect(queryByText('项目 1')).not.toBeInTheDocument()
    })
  })

  describe('空状态', () => {
    it('应该显示空状态', () => {
      const { getByText } = render(List, {
        props: { data: [] },
      })

      expect(getByText('暂无数据')).toBeInTheDocument()
    })

    it('应该显示自定义空状态内容', () => {
      const { getByText } = render(List, {
        props: { data: [] },
        slots: {
          empty: '<div class="custom-empty">暂无数据，请稍后再试</div>',
        },
      })

      expect(getByText('暂无数据，请稍后再试')).toBeInTheDocument()
    })
  })

  describe('点击事件', () => {
    it('应该触发 itemClick 事件', async () => {
      const data = ['项目 1', '项目 2', '项目 3']
      const { getByText, emitted } = render(List, {
        props: { data },
      })

      await fireEvent.click(getByText('项目 1'))

      expect(emitted('itemClick')).toBeTruthy()
      expect(emitted('itemClick')[0]).toEqual(['项目 1', 0])
    })

    it('应该传递正确的索引', async () => {
      const data = ['项目 1', '项目 2', '项目 3']
      const { getByText, emitted } = render(List, {
        props: { data },
      })

      await fireEvent.click(getByText('项目 2'))

      expect(emitted('itemClick')[0]).toEqual(['项目 2', 1])
    })
  })

  describe('自定义渲染', () => {
    it('应该支持自定义列表项渲染', () => {
      const users = [
        { name: '张三', email: 'zhangsan@example.com' },
        { name: '李四', email: 'lisi@example.com' },
      ]

      const { getByText } = render(List, {
        props: { data: users },
        slots: {
          item: `
            <template #item="{ item }">
              <div>
                <p class="name">{{ item.name }}</p>
                <p class="email">{{ item.email }}</p>
              </div>
            </template>
          `,
        },
      })

      expect(getByText('张三')).toBeInTheDocument()
      expect(getByText('zhangsan@example.com')).toBeInTheDocument()
      expect(getByText('李四')).toBeInTheDocument()
      expect(getByText('lisi@example.com')).toBeInTheDocument()
    })
  })

  describe('自定义类名', () => {
    it('应该支持自定义类名', () => {
      const { container } = render(List, {
        props: {
          data: ['项目 1'],
          class: 'custom-list-class',
        },
      })

      const listContainer = container.querySelector('.bg-white')
      expect(listContainer).toHaveClass('custom-list-class')
    })
  })
})

describe('ListItem 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染内容', () => {
      const { getByText } = render(ListItem, {
        slots: {
          default: '列表项内容',
        },
      })

      expect(getByText('列表项内容')).toBeInTheDocument()
    })

    it('应该有正确的样式类', () => {
      const { container } = render(ListItem, {
        slots: {
          default: '列表项内容',
        },
      })

      const listItem = container.querySelector('li')
      expect(listItem).toHaveClass('px-4', 'py-3')
      expect(listItem).toHaveClass('hover:bg-slate-50', 'cursor-pointer')
    })
  })

  describe('禁用状态', () => {
    it('应该应用禁用样式', () => {
      const { container } = render(ListItem, {
        props: { disabled: true },
        slots: {
          default: '禁用项',
        },
      })

      const listItem = container.querySelector('li')
      expect(listItem).toHaveClass('cursor-not-allowed', 'opacity-50')
      expect(listItem).not.toHaveClass('hover:bg-slate-50', 'cursor-pointer')
    })
  })

  describe('自定义类名', () => {
    it('应该支持自定义类名', () => {
      const { container } = render(ListItem, {
        props: {
          class: 'custom-item-class',
        },
        slots: {
          default: '列表项内容',
        },
      })

      const listItem = container.querySelector('li')
      expect(listItem).toHaveClass('custom-item-class')
    })
  })
})

describe('List 和 ListItem 组合', () => {
  it('应该正确渲染组合的列表', () => {
    const { getByText, container } = render({
      components: { List, ListItem },
      template: `
        <List>
          <ListItem>项目 1</ListItem>
          <ListItem>项目 2</ListItem>
          <ListItem>项目 3</ListItem>
        </List>
      `,
    })

    expect(getByText('项目 1')).toBeInTheDocument()
    expect(getByText('项目 2')).toBeInTheDocument()
    expect(getByText('项目 3')).toBeInTheDocument()

    const listItems = container.querySelectorAll('li')
    expect(listItems).toHaveLength(3)
  })

  it('应该正确渲染带禁用项的组合列表', () => {
    const { container } = render({
      components: { List, ListItem },
      template: `
        <List :border="true">
          <ListItem>项目 1</ListItem>
          <ListItem :disabled="true">禁用项目 2</ListItem>
          <ListItem>项目 3</ListItem>
        </List>
      `,
    })

    const listItems = container.querySelectorAll('li')
    expect(listItems).toHaveLength(3)

    // 第二个列表项应该是禁用状态
    expect(listItems[1]).toHaveClass('cursor-not-allowed', 'opacity-50')
  })
})
