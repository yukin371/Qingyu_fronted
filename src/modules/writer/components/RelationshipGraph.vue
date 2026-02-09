<template>
  <div ref="containerRef" class="relationship-graph-container">
    <!-- D3将直接在这里创建DOM -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'

export interface GraphNode {
  id: string
  name: string
  importance?: number
}

export interface GraphLink {
  source: string
  target: string
  type: string
  strength: number
}

interface Props {
  nodes: GraphNode[]
  links: GraphLink[]
}

const props = defineProps<Props>()

const containerRef = ref<HTMLElement>()
let simulation: d3.Simulation<any, undefined> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null

// 暴露给测试使用
defineExpose({
  d3Simulation: () => simulation
})

function initGraph() {
  if (!containerRef.value) return

  // 清理旧的SVG
  if (svg) {
    svg.remove()
  }
  if (simulation) {
    simulation.stop()
  }

  const width = containerRef.value.clientWidth || 800
  const height = 600

  // P0 Fix: D3直接创建SVG和DOM
  svg = d3
    .select(containerRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'graph-canvas')
    .attr('viewBox', [0, 0, width, height])

  // 创建缩放行为
  const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]).on('zoom', (event) => {
    g.attr('transform', event.transform)
  })

  svg.call(zoom as any)

  const g = svg.append('g')

  // 创建箭头标记
  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999')

  // 准备数据
  const nodes = props.nodes.map((n) => ({ ...n }))
  const links = props.links.map((l) => ({ ...l }))

  // 创建链接
  const link = g
    .append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', (d: GraphLink) => Math.sqrt(d.strength / 20))
    .attr('marker-end', 'url(#arrowhead)')

  // 创建节点组
  const node = g
    .append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node')

  // 节点圆形
  node
    .append('circle')
    .attr('r', (d: GraphNode) => 15 + (d.importance || 3) * 2)
    .attr('fill', '#5b8cff')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')

  // 节点标签
  node
    .append('text')
    .text((d: GraphNode) => d.name)
    .attr('x', 0)
    .attr('y', (d: GraphNode) => 20 + (d.importance || 3) * 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#333')
    .style('pointer-events', 'none')

  // 添加拖拽行为
  const drag = d3
    .drag()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded)

  node.call(drag as any)

  // 力导向布局
  simulation = d3
    .forceSimulation(nodes as any)
    .force(
      'link',
      d3
        .forceLink(links as any)
        .id((d: any) => d.id)
        .distance(100)
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius((d: any) => 20 + (d.importance || 3) * 2))

  // P0 Fix: Tick中直接更新DOM，不经过Vue响应式
  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })

  function dragStarted(event: any, d: any) {
    if (!event.active) simulation!.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event: any, d: any) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragEnded(event: any, d: any) {
    if (!event.active) simulation!.alphaTarget(0)
    d.fx = null
    d.fy = null
  }
}

onMounted(() => {
  // 等待DOM渲染完成后初始化
  setTimeout(() => {
    initGraph()
  }, 100)
})

// 监听props变化重新初始化
watch(
  () => [props.nodes, props.links],
  () => {
    initGraph()
  },
  { deep: true }
)

onUnmounted(() => {
  // 清理资源
  if (simulation) {
    simulation.stop()
    simulation = null
  }
  if (svg) {
    svg.remove()
    svg = null
  }
})
</script>

<style scoped lang="scss">
.relationship-graph-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;

  :deep(svg) {
    display: block;
  }

  :deep(.node:hover circle) {
    fill: #409eff;
  }
}
</style>
