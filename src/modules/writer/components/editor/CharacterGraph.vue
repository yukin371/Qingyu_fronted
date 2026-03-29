<template>
  <div class="character-graph" :class="{ 'is-fullscreen': fullscreen }">
    <!-- 顶部工具栏 -->
    <div class="graph-header">
      <div class="header-left">
        <span class="header-icon">*</span>
        <span class="header-title">角色关系图谱</span>
        <el-tag v-if="nodes.length" size="small" type="info" class="node-count">
          {{ nodes.length }} 位角色
        </el-tag>
      </div>

      <!-- 视图切换器 -->
      <div v-if="showViewSwitcher" class="view-switcher">
        <button
          class="view-btn"
          :class="{ active: viewMode === 'project' }"
          @click="setViewMode('project')"
        >
          全局视图
        </button>
        <button
          class="view-btn"
          :class="{ active: viewMode === 'chapter' }"
          @click="setViewMode('chapter')"
        >
          当前章节
        </button>
      </div>

      <div class="header-actions">
        <el-tooltip content="刷新图谱" placement="bottom">
          <button class="action-btn" @click="handleRefresh">
            <span class="btn-icon">R</span>
          </button>
        </el-tooltip>
        <el-tooltip :content="fullscreen ? '退出全屏' : '全屏模式'" placement="bottom">
          <button class="action-btn" @click="toggleFullscreen">
            <span class="btn-icon">{{ fullscreen ? '-' : '+' }}</span>
          </button>
        </el-tooltip>
        <el-tooltip content="添加角色" placement="bottom">
          <button class="action-btn primary" @click="handleAddCharacter">
            <span class="btn-icon">+</span>
          </button>
        </el-tooltip>
      </div>
    </div>

    <!-- 章节上下文提示（仅章节视图显示） -->
    <div v-if="viewMode === 'chapter' && chapterTitle" class="chapter-context">
      <span class="context-icon">📖</span>
      <span class="context-text">
        正在查看：{{ chapterTitle }}
      </span>
      <button class="context-btn" @click="setViewMode('project')">
        切换到全局
      </button>
    </div>

    <!-- 图谱画布 -->
    <div ref="canvasRef" class="graph-canvas">
      <!-- 背景纹理 -->
      <div class="canvas-bg"></div>
      
      <!-- SVG 图谱层 -->
      <svg ref="svgRef" class="graph-svg">
        <defs>
          <!-- 关系线渐变 -->
          <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.3" />
            <stop offset="50%" stop-color="var(--color-primary)" stop-opacity="0.8" />
            <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.3" />
          </linearGradient>
          
          <!-- 发光滤镜 -->
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <!-- 节点光晕 -->
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0.8" />
            <stop offset="70%" stop-color="var(--color-accent)" stop-opacity="0.2" />
            <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0" />
          </radialGradient>
        </defs>
        
        <!-- 关系连线层 -->
        <g class="links-layer">
          <g v-for="link in visibleLinks" :key="`${link.source}-${link.target}`" class="link-group">
            <!-- 关系线 -->
            <path
              :d="getLinkPath(link)"
              class="link-path"
              :class="[`link-${link.type}`, { 'link-strong': link.strength > 70 }]"
              :style="{ '--link-strength': link.strength / 100 }"
              @mouseenter="handleLinkHover(link, true)"
              @mouseleave="handleLinkHover(link, false)"
            />
            <!-- 关系标签 -->
            <text
              v-if="showLinkLabels"
              :x="getLinkMidpoint(link).x"
              :y="getLinkMidpoint(link).y - 8"
              class="link-label"
            >
              {{ link.type }}
            </text>
          </g>
        </g>
        
        <!-- 节点层 -->
        <g class="nodes-layer">
          <g
            v-for="node in nodes"
            :key="node.id"
            class="node-group"
            :class="{ 
              'node-selected': selectedNodeId === node.id,
              'node-hovered': hoveredNodeId === node.id
            }"
            :transform="getNodeTransform(node)"
            @mouseenter="handleNodeHover(node, true)"
            @mouseleave="handleNodeHover(node, false)"
            @click="handleNodeClick(node)"
            @dblclick="handleNodeDoubleClick(node)"
          >
            <!-- 外围光晕 -->
            <circle
              :r="getNodeRadius(node) + 12"
              fill="url(#nodeGlow)"
              class="node-aura"
            />
            
            <!-- 节点主体 -->
            <circle
              :r="getNodeRadius(node)"
              :fill="getNodeColor(node)"
              class="node-circle"
              filter="url(#glow)"
            />
            
            <!-- 内圈 -->
            <circle
              :r="getNodeRadius(node) * 0.4"
              fill="rgba(255,255,255,0.9)"
              class="node-inner"
            />
            
            <!-- 角色头像占位 -->
            <text
              v-if="node.avatar"
              :y="getNodeRadius(node) * 0.15"
              text-anchor="middle"
              class="node-avatar-text"
            >
              {{ node.name.charAt(0) }}
            </text>
            
            <!-- 角色名称 -->
            <text
              :y="getNodeRadius(node) + 20"
              text-anchor="middle"
              class="node-label"
            >
              {{ node.name }}
            </text>
            
            <!-- 关系数量标签 -->
            <g
              v-if="getNodeRelationCount(node.id) > 0"
              :transform="`translate(${getNodeRadius(node) * 0.6}, ${-getNodeRadius(node) * 0.6})`"
            >
              <circle r="10" fill="var(--color-accent)" class="relation-badge-bg" />
              <text text-anchor="middle" dy="4" class="relation-badge-text">
                {{ getNodeRelationCount(node.id) }}
              </text>
            </g>
          </g>
        </g>
      </svg>

      <!-- 缩放控制 -->
      <div class="zoom-controls">
        <button class="zoom-btn" @click="handleZoomIn">+</button>
        <span class="zoom-level">{{ Math.round(transform.k * 100) }}%</span>
        <button class="zoom-btn" @click="handleZoomOut">-</button>
        <button class="zoom-btn" @click="handleZoomReset">H</button>
      </div>

      <!-- 悬停信息卡片 -->
      <transition name="fade">
        <div
          v-if="hoveredInfo"
          class="hover-card"
          :style="{ left: hoveredInfo.x + 'px', top: hoveredInfo.y + 'px' }"
        >
          <h4>{{ hoveredInfo.name }}</h4>
          <p v-if="hoveredInfo.importance">重要度: {{ hoveredInfo.importance }}</p>
          <p>关系数: {{ hoveredInfo.relationCount }}</p>
        </div>
      </transition>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="graph-footer">
      <div class="footer-left">
        <span class="stat-item">
          <span class="stat-icon">=</span>
          {{ links.length }} 条关系
        </span>
        <span class="stat-item" v-if="strongLinksCount">
          <span class="stat-icon">*</span>
          {{ strongLinksCount }} 条强关系
        </span>
      </div>
      <div class="footer-right">
        <span class="hint">双击节点查看详情 | 拖拽移动节点</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'

interface GraphNode {
  id: string
  name: string
  avatar?: string
  importance?: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type: string
  strength: number
}

interface Props {
  nodes: GraphNode[]
  links: GraphLink[]
  loading?: boolean
  showLinkLabels?: boolean
  showViewSwitcher?: boolean
  viewMode?: 'project' | 'chapter'
  chapterTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  nodes: () => [],
  links: () => [],
  loading: false,
  showLinkLabels: true,
  showViewSwitcher: false,
  viewMode: 'project',
  chapterTitle: '',
})

const emit = defineEmits<{
  (e: 'nodeClick', node: GraphNode): void
  (e: 'nodeDoubleClick', node: GraphNode): void
  (e: 'createLink', fromId: string, toId: string): void
  (e: 'refresh'): void
  (e: 'addCharacter'): void
  (e: 'viewModeChange', mode: 'project' | 'chapter'): void
}>()

// Refs
const canvasRef = ref<HTMLElement>()
const svgRef = ref<SVGSVGElement>()
const fullscreen = ref(false)
const selectedNodeId = ref<string | null>(null)
const hoveredNodeId = ref<string | null>(null)
const hoveredInfo = ref<{ x: number; y: number; name: string; importance?: number; relationCount: number } | null>(null)

// D3 相关
let simulation: d3.Simulation<any, undefined> | null = null
let transform = d3.zoomIdentity

// 计算属性
const visibleLinks = computed(() => props.links)

const strongLinksCount = computed(() => 
  props.links.filter(l => l.strength > 70).length
)

// 节点颜色
function getNodeColor(node: GraphNode): string {
  const colors = [
    '#c9a962', // 琥珀金
    '#7c9885', // 苔绿
    '#9b8aa0', // 淡紫
    '#8b7355', // 驼色
    '#6b8e9f', // 灰蓝
  ]
  const index = props.nodes.findIndex(n => n.id === node.id)
  return colors[index % colors.length]
}

// 节点半径
function getNodeRadius(node: GraphNode): number {
  return 24 + (node.importance || 0) * 3
}

// 节点关系数量
function getNodeRelationCount(nodeId: string): number {
  return props.links.filter(l => {
    const sourceId = typeof l.source === 'string' ? l.source : l.source.id
    const targetId = typeof l.target === 'string' ? l.target : l.target.id
    return sourceId === nodeId || targetId === nodeId
  }).length
}

// 获取节点位置变换
function getNodeTransform(node: GraphNode): string {
  const x = node.x || 0
  const y = node.y || 0
  return `translate(${x}, ${y})`
}

// 获取连线路径
function getLinkPath(link: GraphLink): string {
  const source = typeof link.source === 'object' ? link.source : null
  const target = typeof link.target === 'object' ? link.target : null
  
  if (!source || !target) return ''
  
  const sx = source.x || 0
  const sy = source.y || 0
  const tx = target.x || 0
  const ty = target.y || 0
  
  // 贝塞尔曲线
  const mx = (sx + tx) / 2
  const my = (sy + ty) / 2 - 30 // 向上弯曲
  
  return `M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`
}

// 获取连线中点
function getLinkMidpoint(link: GraphLink): { x: number; y: number } {
  const source = typeof link.source === 'object' ? link.source : null
  const target = typeof link.target === 'object' ? link.target : null
  
  if (!source || !target) return { x: 0, y: 0 }
  
  return {
    x: ((source.x || 0) + (target.x || 0)) / 2,
    y: ((source.y || 0) + (target.y || 0)) / 2 - 15
  }
}

// 事件处理
function handleNodeClick(node: GraphNode) {
  selectedNodeId.value = node.id
  emit('nodeClick', node)
}

function handleNodeDoubleClick(node: GraphNode) {
  emit('nodeDoubleClick', node)
}

function handleNodeHover(node: GraphNode, isHover: boolean) {
  hoveredNodeId.value = isHover ? node.id : null
  
  if (isHover && canvasRef.value) {
    hoveredInfo.value = {
      x: (node.x || 0) + 40,
      y: (node.y || 0) - 20,
      name: node.name,
      importance: node.importance,
      relationCount: getNodeRelationCount(node.id)
    }
  } else {
    hoveredInfo.value = null
  }
}

function handleLinkHover(_link: GraphLink, _isHover: boolean) {
  // 可以添加连线高亮效果
}

// 缩放控制
function handleZoomIn() {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  svg.transition().call(
    d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
    1.3
  )
}

function handleZoomOut() {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  svg.transition().call(
    d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
    0.7
  )
}

function handleZoomReset() {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  svg.transition().call(
    d3.zoom<SVGSVGElement, unknown>().transform as any,
    d3.zoomIdentity
  )
}

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value
}

function handleRefresh() {
  emit('refresh')
}

function handleAddCharacter() {
  emit('addCharacter')
}

function setViewMode(mode: 'project' | 'chapter') {
  emit('viewModeChange', mode)
}

// 初始化力导向图
function initSimulation() {
  if (!canvasRef.value || !svgRef.value) return
  
  const width = canvasRef.value.clientWidth
  const height = canvasRef.value.clientHeight
  
  // 清理旧实例
  if (simulation) {
    simulation.stop()
  }
  
  // 创建新的 simulation
  simulation = d3.forceSimulation(props.nodes as any)
    .force('link', d3.forceLink(props.links)
      .id((d: any) => d.id)
      .distance(150)
      .strength(0.5)
    )
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide<GraphNode>().radius((d: any) => getNodeRadius(d) + 20))
    .on('tick', ticked)
  
  // 创建节点拖拽
  const drag = d3.drag<SVGGElement, GraphNode>()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded)
  
  // 应用拖拽到节点
  d3.select(svgRef.value)
    .select('.nodes-layer')
    .selectAll('.node-group')
    .call(drag as any)
  
  // 创建缩放
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.2, 4])
    .on('zoom', (event) => {
      transform = event.transform
      d3.select(svgRef.value!)
        .select('.nodes-layer')
        .attr('transform', event.transform.toString())
      d3.select(svgRef.value!)
        .select('.links-layer')
        .attr('transform', event.transform.toString())
    })
  
  d3.select(svgRef.value).call(zoom as any)
  
  function ticked() {
    // 更新连线
    d3.select(svgRef.value!)
      .selectAll('.link-path')
      .attr('d', (d: any) => getLinkPath(d))
    
    // 更新节点位置
    d3.select(svgRef.value!)
      .selectAll('.node-group')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  }
  
  function dragStarted(event: any, d: GraphNode) {
    if (!event.active) simulation!.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }
  
  function dragged(event: any, d: GraphNode) {
    d.fx = event.x
    d.fy = event.y
  }
  
  function dragEnded(event: any, d: GraphNode) {
    if (!event.active) simulation!.alphaTarget(0)
    d.fx = null
    d.fy = null
  }
}

// 生命周期
onMounted(() => {
  if (props.nodes.length > 0) {
    initSimulation()
  }
  
  window.addEventListener('resize', initSimulation)
})

onUnmounted(() => {
  if (simulation) {
    simulation.stop()
  }
  window.removeEventListener('resize', initSimulation)
})

// 监听数据变化
watch(() => [props.nodes, props.links], () => {
  initSimulation()
}, { deep: true })
</script>

<style scoped lang="scss">
.character-graph {
  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-primary: #c9a962;
  --color-accent: #e8b54a;
  --color-text: #e6edf3;
  --color-text-muted: #8b949e;
  --color-border: #30363d;
  
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg);
  color: var(--color-text);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  
  &.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    border-radius: 0;
  }
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-icon {
      font-size: 20px;
      color: var(--color-primary);
    }

    .header-title {
      font-size: 16px;
      font-weight: 600;
      font-family: 'Noto Serif SC', Georgia, serif;
    }

    .node-count {
      background: rgba(201, 169, 98, 0.15);
      color: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  .view-switcher {
    display: flex;
    gap: 4px;
    background: rgba(201, 169, 98, 0.1);
    padding: 3px;
    border-radius: 6px;
  }

  .view-btn {
    padding: 4px 12px;
    font-size: 12px;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: var(--color-text);
    }

    &.active {
      background: var(--color-primary);
      color: var(--color-bg);
    }
  }

  .chapter-context {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: rgba(201, 169, 98, 0.1);
    border-bottom: 1px solid rgba(201, 169, 98, 0.2);
    font-size: 12px;

    .context-icon {
      font-size: 14px;
    }

    .context-text {
      color: var(--color-primary);
    }

    .context-btn {
      margin-left: auto;
      font-size: 11px;
      color: var(--color-primary);
      background: transparent;
      border: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    
    .action-btn {
      width: 36px;
      height: 36px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .btn-icon {
        font-size: 18px;
        line-height: 1;
      }
      
      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: rgba(201, 169, 98, 0.1);
      }
      
      &.primary {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: var(--color-bg);
        
        &:hover {
          background: var(--color-accent);
          border-color: var(--color-accent);
        }
      }
    }
  }
}

.graph-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 400px;
  
  .canvas-bg {
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(ellipse at 30% 20%, rgba(201, 169, 98, 0.03) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, rgba(139, 115, 85, 0.05) 0%, transparent 50%),
      linear-gradient(180deg, var(--color-bg) 0%, #0a0d12 100%);
    
    // 星点效果
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.2), transparent),
        radial-gradient(1px 1px at 50px 160px, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.2), transparent),
        radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.2), transparent);
      background-size: 200px 200px;
      animation: twinkle 8s ease-in-out infinite;
    }
  }
  
  @keyframes twinkle {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
}

.graph-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}

// 关系连线
.link-path {
  fill: none;
  stroke: url(#linkGradient);
  stroke-width: 2;
  opacity: calc(0.3 + var(--link-strength, 0.5) * 0.5);
  transition: all 0.3s ease;
  
  &.link-strong {
    stroke-width: 3;
    opacity: 0.9;
  }
  
  &.link-朋友,
  &.link-盟友 {
    stroke: #7c9885;
  }
  
  &.link-恋人,
  &.link-家庭 {
    stroke: #c9a962;
  }
  
  &.link-敌人 {
    stroke: #a85d5d;
  }
  
  &:hover {
    stroke-width: 4;
    opacity: 1;
  }
}

.link-label {
  font-size: 10px;
  fill: var(--color-text-muted);
  text-anchor: middle;
  pointer-events: none;
}

// 节点
.node-group {
  cursor: pointer;
  transition: transform 0.2s ease;
  
  .node-aura {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .node-circle {
    transition: all 0.3s ease;
  }
  
  &:hover {
    .node-aura {
      opacity: 1;
    }
    
    .node-circle {
      transform: scale(1.1);
    }
  }
  
  &.node-selected {
    .node-circle {
      stroke: var(--color-accent);
      stroke-width: 3;
    }
  }
  
  &.node-hovered {
    .node-aura {
      opacity: 0.8;
    }
  }
}

.node-label {
  font-size: 13px;
  font-weight: 500;
  fill: var(--color-text);
  font-family: 'Noto Serif SC', Georgia, serif;
  pointer-events: none;
}

.node-avatar-text {
  font-size: 16px;
  fill: var(--color-bg);
  font-weight: 600;
}

.relation-badge-bg {
  opacity: 0.9;
}

.relation-badge-text {
  font-size: 10px;
  fill: var(--color-bg);
  font-weight: 600;
}

// 缩放控制
.zoom-controls {
  position: absolute;
  bottom: 60px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px;
  
  .zoom-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--color-text-muted);
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(201, 169, 98, 0.1);
      color: var(--color-primary);
    }
  }
  
  .zoom-level {
    font-size: 11px;
    color: var(--color-text-muted);
    padding: 4px 0;
  }
}

// 悬停卡片
.hover-card {
  position: absolute;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 14px;
  pointer-events: none;
  z-index: 100;
  min-width: 120px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transform: translateY(-50%);
  
  h4 {
    margin: 0 0 6px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-primary);
    font-family: 'Noto Serif SC', Georgia, serif;
  }
  
  p {
    margin: 0;
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

// 加载状态
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(13, 17, 23, 0.8);
  z-index: 200;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  span {
    font-size: 14px;
    color: var(--color-text-muted);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// 底部状态栏
.graph-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  
  .footer-left {
    display: flex;
    gap: 20px;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--color-text-muted);
      
      .stat-icon {
        color: var(--color-primary);
      }
    }
  }
  
  .footer-right {
    .hint {
      font-size: 11px;
      color: var(--color-text-muted);
      opacity: 0.7;
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
