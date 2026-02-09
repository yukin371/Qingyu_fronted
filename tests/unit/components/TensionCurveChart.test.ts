import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TensionCurveChart from '@/modules/writer/components/TensionCurveChart.vue'

describe('TensionCurveChart - P0/P1测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockTensionData = [
    { chapter: 1, tension: 30, label: '开篇' },
    { chapter: 2, tension: 50, label: '冲突' },
    { chapter: 3, tension: 80, label: '高潮' },
    { chapter: 4, tension: 40, label: '结局' }
  ]

  it('应该渲染SVG画布', () => {
    const wrapper = mount(TensionCurveChart, {
      props: {
        data: mockTensionData
      }
    })

    expect(wrapper.find('svg.tension-curve-canvas').exists()).toBe(true)
  })

  it('应该渲染正确数量的数据点', () => {
    const wrapper = mount(TensionCurveChart, {
      props: {
        data: mockTensionData
      }
    })

    const points = wrapper.findAll('.tension-point')
    expect(points.length).toBe(4)
  })

  it('应该使用monotone插值绘制曲线', () => {
    const wrapper = mount(TensionCurveChart, {
      props: {
        data: mockTensionData
      }
    })

    // 验证曲线路径存在
    const curvePath = wrapper.find('.tension-curve-path')
    expect(curvePath.exists()).toBe(true)
    expect(curvePath.attributes('d')).toBeTruthy()
  })

  it('应该显示章节标签', () => {
    const wrapper = mount(TensionCurveChart, {
      props: {
        data: mockTensionData
      }
    })

    const labels = wrapper.findAll('.chapter-label')
    expect(labels.length).toBe(4)
    expect(labels[0].text()).toBe('开篇')
  })

  it('空数据时应该显示占位信息', () => {
    const wrapper = mount(TensionCurveChart, {
      props: {
        data: []
      }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('点击数据点应该触发事件', async () => {
    const wrapper = mount(TensionCurveChart, {
      props: {
        data: mockTensionData
      }
    })

    const point = wrapper.findAll('.tension-point')[0]
    await point.trigger('click')

    expect(wrapper.emitted('pointClick')).toBeTruthy()
  })

  it('应该正确计算Y轴比例', () => {
    const wrapper = mount(TensionCurveChart, {
      props: {
        data: mockTensionData
      }
    })

    // 最高点(80)应该在顶部区域，最低点(30)应该在底部区域
    const points = wrapper.findAll('.tension-point')
    const highestPoint = points[2] // tension: 80
    const lowestPoint = points[0] // tension: 30

    const highestCy = parseFloat(highestPoint.attributes('cy') || '0')
    const lowestCy = parseFloat(lowestPoint.attributes('cy') || '0')

    // SVG坐标系中，较小的cy值表示较高的位置
    // 最高点的cy应该小于最低点的cy
    expect(highestCy).toBeLessThan(lowestCy)

    // 最高点应该在图表上半部分（考虑padding）
    expect(highestCy).toBeLessThan(150)
  })

  it('应该支持自定义尺寸', () => {
    const wrapper = mount(TensionCurveChart, {
      props: {
        data: mockTensionData,
        width: 600,
        height: 400
      }
    })

    const svg = wrapper.find('svg.tension-curve-canvas')
    expect(svg.attributes('width')).toBe('600')
    expect(svg.attributes('height')).toBe('400')
  })
})
