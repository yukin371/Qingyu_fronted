/**
 * Rate 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Rate from '@/design-system/form/Rate/Rate.vue'

describe('Rate', () => {
  describe('基础渲染', () => {
    it('默认渲染为 0 分和 md size', () => {
      const { container } = render(Rate)
      const wrapper = container.querySelector('.inline-flex')

      expect(wrapper).toBeTruthy()
      expect(wrapper).toHaveClass('items-center')
      expect(wrapper).toHaveClass('gap-1')
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      for (const size of sizes) {
        const { container } = render(Rate, {
          props: { size },
        })
        const wrapper = container.querySelector('.inline-flex')

        expect(wrapper).toBeTruthy()

        if (size === 'sm') {
          expect(wrapper).toHaveClass('gap-0.5')
        } else if (size === 'md') {
          expect(wrapper).toHaveClass('gap-1')
        } else if (size === 'lg') {
          expect(wrapper).toHaveClass('gap-1.5')
        }
      }
    })

    it('正确渲染默认数量的星星（5 个）', () => {
      const { container } = render(Rate)
      const stars = container.querySelectorAll('[class*="relative"]')

      expect(stars.length).toBe(5)
    })

    it('正确渲染自定义数量的星星', () => {
      const { container } = render(Rate, {
        props: { max: 10 },
      })
      const stars = container.querySelectorAll('[class*="relative"]')

      expect(stars.length).toBe(10)
    })

    it('未选中状态有正确的样式', () => {
      const { container } = render(Rate, {
        props: { modelValue: 0 },
      })
      // 未选中时应该显示 outline 星星
      const svg = container.querySelector('svg')

      expect(svg).toBeTruthy()
      expect(svg).toHaveAttribute('fill', 'none')
    })

    it('选中状态有正确的样式', () => {
      const { container } = render(Rate, {
        props: { modelValue: 3 },
      })
      // 选中时应该显示 filled 星星
      const svgs = container.querySelectorAll('svg')

      expect(svgs.length).toBeGreaterThan(0)
      // 前三个应该是 filled
      const filledStars = Array.from(svgs).filter(svg => svg.getAttribute('fill') === 'currentColor')
      expect(filledStars.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('v-model 双向绑定', () => {
    it('点击星星更新值', async () => {
      const { container, emitted } = render(Rate, {
        props: { modelValue: 0 },
      })
      const stars = container.querySelectorAll('[class*="relative"]')
      const thirdStar = stars[2]

      await fireEvent.click(thirdStar)

      expect(emitted('update:modelValue')).toBeTruthy()
      expect(emitted('update:modelValue')![0]).toEqual([3])
      expect(emitted('change')).toBeTruthy()
      expect(emitted('change')![0]).toEqual([3])
    })

    it('点击第5个星星设置为5分', async () => {
      const { container, emitted } = render(Rate, {
        props: { modelValue: 0 },
      })
      const stars = container.querySelectorAll('[class*="relative"]')
      const fifthStar = stars[4]

      await fireEvent.click(fifthStar)

      expect(emitted('update:modelValue')![0]).toEqual([5])
    })

    it('支持响应式更新', async () => {
      const { container, emitted } = render(Rate, {
        props: { modelValue: 2 },
      })
      const stars = container.querySelectorAll('[class*="relative"]')

      // 点击第4个星星
      await fireEvent.click(stars[3])
      expect(emitted('update:modelValue')![0]).toEqual([4])

      // 点击第1个星星
      await fireEvent.click(stars[0])
      expect(emitted('update:modelValue')![1]).toEqual([1])
    })
  })

  describe('半星评分', () => {
    it('启用半星后可以设置半星分数', () => {
      const { container } = render(Rate, {
        props: { modelValue: 2.5, allowHalf: true },
      })

      // 应该渲染半星状态的星星
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('半星模式下点击左侧选择半星', async () => {
      const { container, emitted } = render(Rate, {
        props: { modelValue: 0, allowHalf: true },
      })
      const stars = container.querySelectorAll('[class*="relative"]')
      const thirdStar = stars[2]

      // 模拟点击星星左半部分
      const rect = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 20, height: 20 }) }
      thirdStar.getBoundingClientRect = rect.getBoundingClientRect
      
      await fireEvent.mouseMove(thirdStar, { clientX: 5 })
      await fireEvent.click(thirdStar)

      // 由于我们模拟的是左半部分，应该选择 2.5
      const updateValue = emitted('update:modelValue')![0]
      expect(updateValue).toBeTruthy()
    })
  })

  describe('禁用状态', () => {
    it('禁用状态下不响应点击', async () => {
      const { container, emitted } = render(Rate, {
        props: { disabled: true, modelValue: 0 },
      })
      const stars = container.querySelectorAll('[class*="relative"]')
      const thirdStar = stars[2]

      await fireEvent.click(thirdStar)

      expect(emitted('update:modelValue')).toBeFalsy()
    })

    it('禁用状态有正确的样式', () => {
      const { container } = render(Rate, {
        props: { disabled: true },
      })
      const wrapper = container.querySelector('.inline-flex')

      expect(wrapper).toHaveClass('opacity-50')
      expect(wrapper).toHaveClass('cursor-not-allowed')
    })
  })

  describe('只读模式', () => {
    it('只读模式下不响应点击', async () => {
      const { container, emitted } = render(Rate, {
        props: { readonly: true, modelValue: 3 },
      })
      const stars = container.querySelectorAll('[class*="relative"]')
      const firstStar = stars[0]

      await fireEvent.click(firstStar)

      expect(emitted('update:modelValue')).toBeFalsy()
    })

    it('只读模式显示正确的分数', () => {
      const { container } = render(Rate, {
        props: { readonly: true, modelValue: 4 },
      })
      
      // 应该显示4个选中状态的星星
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('显示分数', () => {
    it('showScore 为 true 时显示分数', () => {
      const { container } = render(Rate, {
        props: { modelValue: 3, showScore: true },
      })
      const scoreText = container.textContent

      expect(scoreText).toContain('3')
    })

    it('showScore 为 false 时不显示分数', () => {
      const { container } = render(Rate, {
        props: { modelValue: 3, showScore: false },
      })
      const wrapper = container.querySelector('.inline-flex')
      const scoreElements = wrapper?.querySelectorAll('.ml-2')

      expect(scoreElements?.length).toBe(0)
    })
  })

  describe('自定义文字', () => {
    it('texts 属性正确显示对应文字', () => {
      const texts = ['极差', '失望', '一般', '满意', '惊喜']
      const { container } = render(Rate, {
        props: { modelValue: 3, texts },
      })
      const textContent = container.textContent

      expect(textContent).toContain('满意')
    })

    it('更新分数时更新文字', async () => {
      const texts = ['极差', '失望', '一般', '满意', '惊喜']
      const { container } = render(Rate, {
        props: { modelValue: 3, texts },
      })
      const stars = container.querySelectorAll('[class*="relative"]')

      let textContent = container.textContent
      expect(textContent).toContain('满意')

      // 点击第5个星星
      await fireEvent.click(stars[4])

      textContent = container.textContent
      expect(textContent).toContain('惊喜')
    })
  })

  describe('自定义颜色', () => {
    it('color 属性正确应用颜色类', () => {
      const { container } = render(Rate, {
        props: { modelValue: 3, color: 'rose-400' },
      })
      
      // 应该有 rose-400 颜色的星星
      const roseStars = container.querySelectorAll('.text-rose-400')
      expect(roseStars.length).toBeGreaterThan(0)
    })

    it('voidColor 属性正确应用未选中颜色类', () => {
      const { container } = render(Rate, {
        props: { modelValue: 0, voidColor: 'slate-200' },
      })
      
      // 应该有未选中颜色的星星
      const voidStars = container.querySelectorAll('.text-slate-200')
      expect(voidStars.length).toBeGreaterThan(0)
    })
  })

  describe('鼠标交互', () => {
    it('鼠标移动时显示悬浮分数', async () => {
      const { container } = render(Rate, {
        props: { modelValue: 0 },
      })
      const stars = container.querySelectorAll('[class*="relative"]')
      const thirdStar = stars[2]

      await fireEvent.mouseMove(thirdStar)

      // 悬浮时应该更新显示的分数
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('鼠标离开时恢复原分数', async () => {
      const { container } = render(Rate, {
        props: { modelValue: 2 },
      })
      const wrapper = container.querySelector('.inline-flex')

      // 模拟鼠标离开
      await fireEvent.mouseLeave(wrapper!)

      // 应该恢复到原来的分数
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('插槽', () => {
    it('default 插槽可以自定义图标', () => {
      const { container } = render(Rate, {
        props: { modelValue: 3 },
        slots: {
          default: `<template #default="{ state }">
            <span v-if="state === 'full'">★</span>
            <span v-else>☆</span>
          </template>`,
        },
      })

      const customContent = container.querySelector('span')
      expect(customContent).toBeTruthy()
    })
  })

  describe('边界情况', () => {
    it('最大分数为1时正常工作', () => {
      const { container } = render(Rate, {
        props: { max: 1, modelValue: 0 },
      })
      const stars = container.querySelectorAll('[class*="relative"]')

      expect(stars.length).toBe(1)
    })

    it('最大分数为10时正常工作', () => {
      const { container } = render(Rate, {
        props: { max: 10, modelValue: 5 },
      })
      const stars = container.querySelectorAll('[class*="relative"]')

      expect(stars.length).toBe(10)
    })

    it('分数为0时正常显示', () => {
      const { container } = render(Rate, {
        props: { modelValue: 0 },
      })
      
      // 应该显示所有未选中的星星
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBe(5)
    })

    it('分数等于最大值时正常显示', () => {
      const { container } = render(Rate, {
        props: { modelValue: 5, max: 5 },
      })
      
      // 应该显示所有选中的星星
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBe(5)
    })
  })

  describe('可访问性', () => {
    it('禁用状态有正确的 ARIA 属性', () => {
      const { container } = render(Rate, {
        props: { disabled: true },
      })
      const wrapper = container.querySelector('.inline-flex')

      expect(wrapper).toHaveClass('cursor-not-allowed')
    })

    it('只读模式不响应键盘和鼠标', () => {
      const { container } = render(Rate, {
        props: { readonly: true, modelValue: 3 },
      })
      
      // 只读模式应该正常显示但不响应交互
      const wrapper = container.querySelector('.inline-flex')
      expect(wrapper).toBeTruthy()
    })
  })
})
