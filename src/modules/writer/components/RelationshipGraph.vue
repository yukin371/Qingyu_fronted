<template>
  <div ref="containerRef" class="relationship-graph-container">
    <!-- D3将直接在这里创建DOM -->
    <!-- 连线提示 -->
    <div v-if="isDrawingLine" class="drawing-hint">
      <el-tag type="warning" size="small">
        <el-icon><Connection /></el-icon>
        拖拽到目标角色创建关系，松开取消
      </el-tag>
    </div>
    <!-- 工具提示 -->
    <div class="graph-toolbar">
      <el-tooltip content="按住 Shift 从节点拖拽可创建关系" placement="top">
        <el-tag size="small" type="info">
          <el-icon><QuestionFilled /></el-icon>
          Shift+拖拽连线
        </el-tag>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'
import { Connection, QuestionFilled } from '@element-plus/icons-vue'

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

// 内部节点类型（包含D3计算的位置属性）
interface InternalNode extends GraphNode {
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Props {
  nodes: GraphNode[]
  links: GraphLink[]
}

const props = defineProps<Props>()

// 发射事件
const emit = defineEmits<{
  (e: 'create-link', fromId: string, toId: string): void
  (e: 'node-click', nodeId: string): void
}>()

const containerRef = ref<HTMLElement>()
let simulation: d3.Simulation<any, undefined> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let g: d3.Selection<SVGGElement, unknown, null, undefined> | null = null

// 连线状态
const isDrawingLine = ref(false)
let drawingLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null = null
let sourceNode: GraphNode | null = null
let sourceNodePos: { x: number; y: number } | null = null
let hoveredNodeId: string | null = null

// 暴露给测试使用
defineExpose({
  d3Simulation: () => simulation,
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

  // D3直接创建SVG和DOM
  svg = d3
    .select(containerRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'graph-canvas')
    .attr('viewBox', [0, 0, width, height])

  // 创建缩放行为
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g?.attr('transform', event.transform)
    })

  svg.call(zoom as any)

  g = svg.append('g')

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
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', (d: GraphLink) => Math.sqrt(d.strength / 20))
    .attr('marker-end', 'url(#arrowhead)')

  // 创建临时连线层（用于绘制新连线）
  const tempLineLayer = g.append('g').attr('class', 'temp-line-layer')

  // 创建节点组
  const node = g
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .attr('data-id', (d: GraphNode) => d.id)

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

  // 添加拖拽行为（移动节点）
  const drag = d3
    .drag()
    .filter((event: any) => {
      // Shift 键按下时不触发节点拖拽，而是触发连线
      return !event.shiftKey
    })
    .on('start', dragStarted as any)
    .on('drag', dragged as any)
    .on('end', dragEnded as any)

  node.call(drag as any)

  // 连线拖拽行为
  const lineDrag = d3
    .drag()
    .filter((event: any) => {
      // 只有 Shift 键按下时才触发连线
      return event.shiftKey
    })
    .on('start', lineDragStarted as any)
    .on('drag', lineDragged as any)
    .on('end', lineDragEnded as any)

  node.call(lineDrag as any)

  // 节点点击事件
  node.on('click', (event: MouseEvent, d: any) => {
    if (!event.shiftKey) {
      emit('node-click', d.id)
    }
  })

  // 节点悬停效果
  node.on('mouseenter', function (this: any, _event: MouseEvent, d: any) {
    if (isDrawingLine.value && sourceNode && sourceNode.id !== d.id) {
      hoveredNodeId = d.id
      d3.select(this).select('circle').attr('stroke', '#67c23a').attr('stroke-width', 4)
    }
  })

  node.on('mouseleave', function (this: any) {
    hoveredNodeId = null
    d3.select(this).select('circle').attr('stroke', '#fff').attr('stroke-width', 2)
  })

  // 力导向布局
  simulation = d3
    .forceSimulation(nodes as any)
    .force(
      'link',
      d3
        .forceLink(links as any)
        .id((d: any) => d.id)
        .distance(100),
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3.forceCollide().radius((d: any) => 20 + (d.importance || 3) * 2),
    )

  // Tick中直接更新DOM，不经过Vue响应式
  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)

    // 更新临时连线位置
    if (drawingLine && sourceNodePos) {
      drawingLine.attr('x1', sourceNodePos.x).attr('y1', sourceNodePos.y)
    }
  })

  function dragStarted(event: any, d: InternalNode) {
    if (!event.active) simulation!.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event: any, d: InternalNode) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragEnded(event: any, d: InternalNode) {
    if (!event.active) simulation!.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  // 连线拖拽开始
  function lineDragStarted(event: any, d: InternalNode) {
    isDrawingLine.value = true
    sourceNode = d
    sourceNodePos = { x: d.x || 0, y: d.y || 0 }

    // 创建临时连线
    drawingLine = tempLineLayer
      .append('line')
      .attr('class', 'temp-line')
      .attr('x1', sourceNodePos.x)
      .attr('y1', sourceNodePos.y)
      .attr('x2', event.x)
      .attr('y2', event.y)
      .attr('stroke', '#67c23a')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,5')
      .attr('pointer-events', 'none')

    // 高亮源节点
    node
      .filter((n: any) => n.id === d.id)
      .select('circle')
      .attr('stroke', '#67c23a')
      .attr('stroke-width', 4)
  }

  // 连线拖拽中
  function lineDragged(event: any) {
    if (drawingLine) {
      drawingLine.attr('x2', event.x).attr('y2', event.y)
    }
  }

  // 连线拖拽结束
  function lineDragEnded(_event: any) {
    // 重置源节点高亮
    if (sourceNode) {
      node
        .filter((n: GraphNode) => n.id === sourceNode!.id)
        .select('circle')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
    }

    // 检查是否落在某个节点上
    if (hoveredNodeId && sourceNode && hoveredNodeId !== sourceNode.id) {
      // 发射创建连线事件
      emit('create-link', sourceNode.id, hoveredNodeId)
    }

    // 清理临时连线
    if (drawingLine) {
      drawingLine.remove()
      drawingLine = null
    }

    isDrawingLine.value = false
    sourceNode = null
    sourceNodePos = null
    hoveredNodeId = null
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
  { deep: true },
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
  position: relative;

  :deep(svg) {
    display: block;
  }

  :deep(.node:hover circle) {
    fill: #409eff;
  }

  :deep(.temp-line) {
    animation: dash 0.5s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: -10;
    }
  }
}

.drawing-hint {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;

  .el-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.graph-toolbar {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 10;

  .el-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.9);
  }
}
</style>
