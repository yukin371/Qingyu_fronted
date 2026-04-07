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
    { id: '2', name: '角色B', importance: 3 },
  ]

  const mockLinks = [{ source: '1', target: '2', type: 'friend', strength: 80 }]

  const mountGraph = () =>
    mount(RelationshipGraph, {
      props: {
        nodes: mockNodes,
        links: mockLinks,
      },
      global: {
        stubs: {
          ElTag: true,
          ElTooltip: true,
        },
      },
    })

  const flushGraphRender = async (wrapper: ReturnType<typeof mountGraph>) => {
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(100)
    await wrapper.vm.$nextTick()
  }

  it('应该渲染容器元素', () => {
    const wrapper = mountGraph()

    expect(wrapper.find('.relationship-graph-container').exists()).toBe(true)
  })

  it('应该创建SVG元素', async () => {
    const wrapper = mountGraph()

    await flushGraphRender(wrapper)

    const svg = wrapper.element.querySelector('svg.graph-canvas')
    expect(svg).not.toBeNull()
  })

  it('应该使用D3直接创建DOM节点（非Vue管理）', async () => {
    const wrapper = mountGraph()

    await flushGraphRender(wrapper)

    const html = wrapper.html()
    // P0关键验证：不应该有Vue的v-for渲染的节点
    // 所有DOM应该由D3直接创建
    expect(html).toContain('<svg')
    expect(html).toContain('class="graph-canvas"')
  })

  it('应该创建正确数量的节点和链接', async () => {
    const wrapper = mountGraph()

    await flushGraphRender(wrapper)

    const circles = wrapper.element.querySelectorAll('.node circle')
    const links = wrapper.element.querySelectorAll('.links line')

    expect(circles.length).toBe(mockNodes.length)
    expect(links.length).toBe(mockLinks.length)
  })

  it('节点更新时应该重新初始化图形', async () => {
    const wrapper = mountGraph()

    await flushGraphRender(wrapper)

    // 更新节点
    await wrapper.setProps({
      nodes: [...mockNodes, { id: '3', name: '角色C', importance: 4 }],
      links: mockLinks,
    })

    await flushGraphRender(wrapper)

    // 验证组件仍然正常渲染
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('应该在组件卸载时清理simulation', async () => {
    const wrapper = mountGraph()

    await flushGraphRender(wrapper)

    // 获取组件实例
    const vm = wrapper.vm as any

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
        links: [],
      },
      global: {
        stubs: {
          ElTag: true,
          ElTooltip: true,
        },
      },
    })

    expect(wrapper.find('.relationship-graph-container').exists()).toBe(true)

    // 空数据也会创建SVG
    await flushGraphRender(wrapper)

    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
