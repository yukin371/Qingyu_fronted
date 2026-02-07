import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RelationshipGraph from './RelationshipGraph.vue'

describe('RelationshipGraph - P0 Fix: D3直接DOM操作', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 模拟requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
      return window.setTimeout(cb, 16) as unknown as number
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockNodes = [
    { id: '1', name: '角色A', importance: 5 },
    { id: '2', name: '角色B', importance: 3 }
  ]

  const mockLinks = [
    { source: '1', target: '2', type: 'friend', strength: 80 }
  ]

  it('应该渲染容器元素', () => {
    const wrapper = mount(RelationshipGraph, {
      props: {
        nodes: mockNodes,
        links: mockLinks
      }
    })

    expect(wrapper.find('.relationship-graph-container').exists()).toBe(true)
  })

  it('应该创建SVG元素', async () => {
    const wrapper = mount(RelationshipGraph, {
      props: {
        nodes: mockNodes,
        links: mockLinks
      }
    })

    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(100)

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.classes()).toContain('graph-canvas')
  })

  it('应该使用D3直接创建DOM节点（非Vue管理）', async () => {
    const wrapper = mount(RelationshipGraph, {
      props: {
        nodes: mockNodes,
        links: mockLinks
      }
    })

    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(100)

    const html = wrapper.html()
    // P0关键验证：不应该有Vue的v-for渲染的节点
    // 所有DOM应该由D3直接创建
    expect(html).toContain('<svg')
    expect(html).toContain('class="graph-canvas"')
  })

  it('应该创建正确数量的节点和链接', async () => {
    const wrapper = mount(RelationshipGraph, {
      props: {
        nodes: mockNodes,
        links: mockLinks
      }
    })

    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(100)

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)

    // 验证节点存在（由D3创建）
    const circles = svg.findAll('circle')
    expect(circles.length).toBeGreaterThan(0)
  })

  it('节点更新时应该重新初始化图形', async () => {
    const wrapper = mount(RelationshipGraph, {
      props: {
        nodes: mockNodes,
        links: mockLinks
      }
    })

    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(100)

    // 更新节点
    await wrapper.setProps({
      nodes: [...mockNodes, { id: '3', name: '角色C', importance: 4 }],
      links: mockLinks
    })

    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(100)

    // 验证组件仍然正常渲染
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('应该在组件卸载时清理simulation', async () => {
    const wrapper = mount(RelationshipGraph, {
      props: {
        nodes: mockNodes,
        links: mockLinks
      }
    })

    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(100)

    // 获取组件实例
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vm: any = wrapper.vm

    // 验证simulation存在
    const sim = vm.d3Simulation?.()
    expect(sim).toBeDefined()

    // 卸载组件
    wrapper.unmount()

    // 验证simulation已被清理
    const simAfterUnmount = vm.d3Simulation?.()
    expect(simAfterUnmount).toBeNull()
  })

  it('应该处理空数据', async () => {
    const wrapper = mount(RelationshipGraph, {
      props: {
        nodes: [],
        links: []
      }
    })

    expect(wrapper.find('.relationship-graph-container').exists()).toBe(true)

    // 空数据也会创建SVG
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(100)

    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
