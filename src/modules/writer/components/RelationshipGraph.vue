<template>
  <div ref="containerRef" class="relationship-graph-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'

export interface GraphNode {
  id: string
  name: string
  importance?: number
  subtitle?: string
  relationCount?: number
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
  activeNodeId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'node-click': [nodeId: string]
}>()

const containerRef = ref<HTMLElement>()
let simulation: d3.Simulation<any, undefined> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let nodeCard: d3.Selection<SVGRectElement, any, SVGGElement, unknown> | null = null
let nodeAvatar: d3.Selection<SVGCircleElement, any, SVGGElement, unknown> | null = null
let nodeTitle: d3.Selection<SVGTextElement, any, SVGGElement, unknown> | null = null
let relationBadge: d3.Selection<SVGTextElement, any, SVGGElement, unknown> | null = null

const relationColorMap: Record<string, string> = {
  朋友: '#22c55e',
  家庭: '#3b82f6',
  恋人: '#ef4444',
  盟友: '#0ea5e9',
  敌人: '#f59e0b',
  其他: '#64748b'
}

function getRelationColor(type: string): string {
  return relationColorMap[type] || relationColorMap.其他
}

function getNodeWidth(node: GraphNode): number {
  const nameLen = (node.name || '').length
  const subtitleLen = (node.subtitle || '').length
  const base = Math.max(nameLen * 14, subtitleLen * 11)
  return Math.max(132, Math.min(220, base + 64))
}

function getNodeHeight(): number {
  return 66
}

function getNodeRadius(node: GraphNode): number {
  return 18 + (node.importance || 3)
}

function getNodeInitial(name?: string): string {
  const safe = (name || '').trim()
  return safe ? safe.charAt(0) : '角'
}

function updateActiveNodeStyle() {
  if (!nodeCard || !nodeAvatar || !nodeTitle || !relationBadge) return

  nodeCard
    .attr('stroke', (d: GraphNode) => (d.id === props.activeNodeId ? '#3b82f6' : '#d7deea'))
    .attr('stroke-width', (d: GraphNode) => (d.id === props.activeNodeId ? 2.4 : 1.2))
    .attr('fill', (d: GraphNode) => (d.id === props.activeNodeId ? '#edf4ff' : '#ffffff'))

  nodeAvatar
    .attr('fill', (d: GraphNode) => (d.id === props.activeNodeId ? '#2563eb' : '#3b82f6'))

  nodeTitle
    .attr('fill', (d: GraphNode) => (d.id === props.activeNodeId ? '#1d4ed8' : '#0f172a'))

  relationBadge
    .attr('fill', (d: GraphNode) => (d.id === props.activeNodeId ? '#1d4ed8' : '#334155'))
}

function initGraph() {
  if (!containerRef.value) return

  if (svg) svg.remove()
  if (simulation) simulation.stop()

  const width = containerRef.value.clientWidth || 860
  const height = Math.max(containerRef.value.clientHeight || 620, 460)

  svg = d3
    .select(containerRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'graph-canvas')
    .attr('viewBox', [0, 0, width, height])

  const defs = svg.append('defs')

  defs
    .append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -4 8 8')
    .attr('refX', 16)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-4L8,0L0,4')
    .attr('fill', '#94a3b8')

  const rootG = svg.append('g')

  const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.45, 2.2]).on('zoom', (event) => {
    rootG.attr('transform', event.transform)
  })

  svg.call(zoom as any)

  const nodes = props.nodes.map((n) => ({ ...n }))
  const links = props.links.map((l) => ({ ...l }))

  const link = rootG
    .append('g')
    .attr('class', 'links')
    .selectAll('path')
    .data(links)
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', (d: GraphLink) => getRelationColor(d.type))
    .attr('stroke-opacity', 0.72)
    .attr('stroke-width', (d: GraphLink) => 1.6 + Math.sqrt(Math.max(d.strength, 1)) / 6)
    .attr('marker-end', 'url(#arrowhead)')

  const linkLabelBg = rootG
    .append('g')
    .attr('class', 'link-label-bg')
    .selectAll('rect')
    .data(links)
    .join('rect')
    .attr('rx', 7)
    .attr('ry', 7)
    .attr('height', 18)
    .attr('width', (d: GraphLink) => Math.max(28, d.type.length * 14))
    .attr('fill', '#ffffff')
    .attr('stroke', (d: GraphLink) => getRelationColor(d.type))
    .attr('stroke-width', 1)
    .attr('opacity', 0.95)

  const linkLabel = rootG
    .append('g')
    .attr('class', 'link-label')
    .selectAll('text')
    .data(links)
    .join('text')
    .text((d: GraphLink) => d.type)
    .attr('font-size', '11px')
    .attr('font-weight', 700)
    .attr('fill', (d: GraphLink) => getRelationColor(d.type))
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')

  const node = rootG
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .style('cursor', 'pointer')

  nodeCard = node
    .append('rect')
    .attr('x', (d: GraphNode) => -getNodeWidth(d) / 2)
    .attr('y', -getNodeHeight() / 2)
    .attr('width', (d: GraphNode) => getNodeWidth(d))
    .attr('height', getNodeHeight())
    .attr('rx', 14)
    .attr('ry', 14)
    .attr('fill', '#ffffff')
    .attr('stroke', '#d7deea')
    .attr('stroke-width', 1.2)

  nodeAvatar = node
    .append('circle')
    .attr('cx', (d: GraphNode) => -getNodeWidth(d) / 2 + 24)
    .attr('cy', -2)
    .attr('r', (d: GraphNode) => Math.min(getNodeRadius(d), 16))
    .attr('fill', '#3b82f6')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 1.5)

  node
    .append('text')
    .text((d: GraphNode) => getNodeInitial(d.name))
    .attr('x', (d: GraphNode) => -getNodeWidth(d) / 2 + 24)
    .attr('y', 2)
    .attr('font-size', '12px')
    .attr('font-weight', 700)
    .attr('fill', '#ffffff')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('pointer-events', 'none')

  nodeTitle = node
    .append('text')
    .text((d: GraphNode) => d.name)
    .attr('x', (d: GraphNode) => -getNodeWidth(d) / 2 + 46)
    .attr('y', -9)
    .attr('font-size', '13px')
    .attr('font-weight', 700)
    .attr('fill', '#0f172a')

  node
    .append('text')
    .text((d: GraphNode) => d.subtitle || '未补充角色标签')
    .attr('x', (d: GraphNode) => -getNodeWidth(d) / 2 + 46)
    .attr('y', 12)
    .attr('font-size', '11px')
    .attr('fill', '#64748b')

  relationBadge = node
    .append('text')
    .text((d: GraphNode) => `关系 ${d.relationCount || 0}`)
    .attr('x', (d: GraphNode) => getNodeWidth(d) / 2 - 12)
    .attr('y', -9)
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('fill', '#334155')
    .attr('text-anchor', 'end')

  node
    .on('click', (_event: MouseEvent, d: GraphNode) => {
      emit('node-click', d.id)
    })

  const drag = d3.drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded)
  node.call(drag as any)

  simulation = d3
    .forceSimulation(nodes as any)
    .force(
      'link',
      d3
        .forceLink(links as any)
        .id((d: any) => d.id)
        .distance((d: any) => 130 - Math.min(40, (d.strength || 0) / 2))
    )
    .force('charge', d3.forceManyBody().strength(-980))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius((d: GraphNode) => getNodeWidth(d) / 2 + 12))

  simulation.on('tick', () => {
    link.attr('d', (d: any) => {
      const sx = d.source.x
      const sy = d.source.y
      const tx = d.target.x
      const ty = d.target.y
      const dx = tx - sx
      const dy = ty - sy
      const dr = Math.sqrt(dx * dx + dy * dy) * 0.7
      return `M${sx},${sy}A${dr},${dr} 0 0,1 ${tx},${ty}`
    })

    linkLabelBg
      .attr('x', (d: any) => (d.source.x + d.target.x) / 2 - Math.max(28, d.type.length * 14) / 2)
      .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 9)

    linkLabel
      .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
      .attr('y', (d: any) => (d.source.y + d.target.y) / 2)

    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })

  function dragStarted(event: any, d: any) {
    if (!event.active) simulation!.alphaTarget(0.28).restart()
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

  updateActiveNodeStyle()
}

defineExpose({
  d3Simulation: () => simulation
})

function handleWindowResize() {
  initGraph()
}

onMounted(() => {
  setTimeout(() => {
    initGraph()
  }, 100)
  window.addEventListener('resize', handleWindowResize)
})

watch(
  () => [props.nodes, props.links],
  () => {
    initGraph()
  },
  { deep: true }
)

watch(
  () => props.activeNodeId,
  () => {
    updateActiveNodeStyle()
  }
)

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
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
  min-height: 420px;
  border-radius: 14px;
  overflow: hidden;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.16) 1px, transparent 1px),
    radial-gradient(circle at 50% 38%, #f8fbff 0%, #eef4ff 58%, #e7f0ff 100%);
  background-size: 32px 32px, 32px 32px, cover;

  :deep(svg) {
    display: block;
  }

  :deep(.node:hover rect) {
    stroke: #60a5fa;
    stroke-width: 2;
    filter: drop-shadow(0 8px 16px rgba(59, 130, 246, 0.18));
  }
}
</style>
