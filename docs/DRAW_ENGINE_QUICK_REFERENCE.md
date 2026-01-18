# 青羽绘制工具快速参考

## 📁 文件位置

```
src/core/draw-engine/
├── types.ts              # 类型定义
├── draw-engine.ts        # 核心引擎
├── export-service.ts     # 导出服务
└── README.md             # 完整文档

src/shared/components/draw/
└── DrawCanvas.vue        # Vue 组件
```

## 🚀 快速开始

### 基础使用

```vue
<template>
  <DrawCanvas :config="drawConfig" />
</template>

<script setup>
import DrawCanvas from '@/shared/components/draw/DrawCanvas.vue'

const drawConfig = {
  canvasId: 'main',
  type: 'mindmap',
  theme: 'default',
  enableHistory: true
}
</script>
```

### 导入类型

```typescript
import type { DrawNode, DrawEdge, DrawEngineConfig } from '@/core/draw-engine/types'
import DrawEngine from '@/core/draw-engine/draw-engine'
import DrawExportService from '@/core/draw-engine/export-service'
```

## 📊 图形类型

| 类型 | 用途 | 示例 |
|------|------|------|
| `mindmap` | 思维导图 | 大纲、头脑风暴 |
| `tree` | 树形图 | 故事树、组织结构 |
| `graph` | 关系图 | 角色关系、人物关系图 |
| `timeline` | 时间线 | 情节时间线、年表 |
| `flowchart` | 流程图 | 情节流程、决策流程 |
| `diagram` | 通用图表 | 其他图表 |

## 🎨 主题

```typescript
// 使用预设主题
config.theme = 'light'   // 浅色
config.theme = 'dark'    // 深色
config.theme = 'default' // 默认

// 自定义主题
const customTheme: DrawTheme = {
  name: 'custom',
  nodeColor: '#ffffff',
  nodeBorderColor: '#409eff',
  nodeTextColor: '#303133',
  edgeColor: '#909399',
  backgroundColor: '#f9fafb',
  gridColor: '#e5e7eb',
  hoverColor: '#ecf5ff',
  selectedColor: '#409eff'
}
```

## 🛠️ 核心 API

### 节点操作

```typescript
// 创建
const node = engine.createNode('标题', x, y, metadata)

// 更新
engine.updateNode(nodeId, { label: '新标题', color: '#fff' })

// 删除
engine.deleteNode(nodeId)

// 查询
const node = engine.getNode(nodeId)
const all = engine.getAllNodes()
```

### 连接操作

```typescript
// 创建
const edge = engine.createEdge(fromNodeId, toNodeId, '标签')

// 更新
engine.updateEdge(edgeId, { color: '#409eff', lineWidth: 2 })

// 删除
engine.deleteEdge(edgeId)

// 查询
const edge = engine.getEdge(edgeId)
const all = engine.getAllEdges()
```

### 选择操作

```typescript
engine.selectNode(nodeId)
engine.selectEdge(edgeId)

const selected = engine.getSelectedNode()
const selected = engine.getSelectedEdge()
```

### 缩放和平移

```typescript
engine.zoom(1.2)              // 放大 20%
engine.zoom(0.8)              // 缩小 20%
engine.pan(10, 20)            // 平移 10, 20
engine.fitToScreen(800, 600)  // 适应屏幕
```

### 导出

```typescript
// JSON
const json = engine.exportAsJSON()

// Markdown（含 Mermaid）
const md = engine.exportAsMarkdown()

// SVG
const svg = engine.exportAsSVG(800, 600)

// 导出文件
DrawExportService.downloadFile(json, 'diagram.json', 'application/json')
```

### 撤销/重做

```typescript
engine.undo()
engine.redo()
engine.canUndo()  // boolean
engine.canRedo()  // boolean
```

## 🎯 事件监听

```typescript
engine.on('nodeCreate', (event) => {
  console.log('节点创建:', event.node)
})

engine.on('nodeUpdate', (event) => {
  console.log('节点更新:', event.node)
})

engine.on('nodeDelete', (event) => {
  console.log('节点删除:', event.node)
})

engine.on('edgeCreate', (event) => {
  console.log('连接创建:', event.edge)
})

// 移除监听
engine.off('nodeCreate', listener)
```

## 📤 导出服务

```typescript
import DrawExportService from '@/core/draw-engine/export-service'

// JSON
const json = await DrawExportService.exportJSON(nodes, edges, title)

// Markdown
const md = await DrawExportService.exportMarkdown(nodes, edges, title, desc)

// CSV
const { nodesCsv, edgesCsv } = await DrawExportService.exportCSV(nodes, edges)

// PlantUML
const puml = DrawExportService.generatePlantUML(nodes, edges)

// GraphViz DOT
const dot = DrawExportService.generateGraphVizDOT(nodes, edges)

// 下载文件
DrawExportService.downloadFile(content, 'filename.json', 'application/json')
```

## 🔧 配置选项

```typescript
interface DrawEngineConfig {
  canvasId: string                      // 必需
  type: 'mindmap' | 'tree' | 'graph'... // 必需
  theme?: 'light' | 'dark' | 'default'  // 可选
  enableGrid?: boolean                  // 默认 true
  snapToGrid?: boolean                  // 默认 false
  gridSize?: number                     // 默认 20
  enableHistory?: boolean               // 默认 false
  maxHistorySteps?: number              // 默认 100
  readonly?: boolean                    // 默认 false
  defaultNodeWidth?: number             // 默认 120
  defaultNodeHeight?: number            // 默认 60
  minZoom?: number                      // 默认 0.1
  maxZoom?: number                      // 默认 5
  autoLayout?: boolean                  // 默认 false
  directions?: 'LR' | 'TB' | 'RL' | 'BT' // 布局方向
}
```

## 💾 数据模型

### DrawNode

```typescript
interface DrawNode {
  id: string
  type: 'node' | 'group' | 'text'
  label: string
  description?: string
  x: number
  y: number
  width: number
  height: number
  color?: string
  borderColor?: string
  borderWidth?: number
  fontSize?: number
  icon?: string
  metadata?: Record<string, any>
  collapsed?: boolean
  children?: string[]
}
```

### DrawEdge

```typescript
interface DrawEdge {
  id: string
  type: 'line' | 'curve' | 'polyline' | 'arrow'
  fromNodeId: string
  toNodeId: string
  label?: string
  style?: 'solid' | 'dashed' | 'dotted'
  color?: string
  lineWidth?: number
  showArrow?: boolean
  arrowType?: 'default' | 'triangle' | 'circle'
  metadata?: Record<string, any>
}
```

## 🎯 Vue 组件 Props

```vue
<DrawCanvas
  :config="drawConfig"
  :initialData="{ nodes: [], edges: [] }"
  @node-selected="handleNodeSelected"
  @node-changed="handleNodeChanged"
  @export="handleExport"
/>
```

## 📋 集成到各模块

### OutlineView 中使用思维导图

```vue
<DrawCanvas
  :config="{
    canvasId: 'outline-mindmap',
    type: 'mindmap',
    enableHistory: true
  }"
  :initial-data="outlineData"
  @node-changed="syncToStore"
/>
```

### EncyclopediaView 中显示关系图

```vue
<DrawCanvas
  :config="{
    canvasId: 'encyclopedia-graph',
    type: 'graph',
    enableGrid: true
  }"
  :initial-data="characterGraphData"
/>
```

### CharacterGraphView 中替换卡片视图

```vue
<DrawCanvas
  :config="{
    canvasId: 'character-graph',
    type: 'graph',
    enableHistory: true
  }"
  @export="exportCharacterGraph"
/>
```

## 🔌 后端 API

```
POST   /api/v1/writer/projects/{projectId}/graphs
GET    /api/v1/writer/projects/{projectId}/graphs/{graphId}
PUT    /api/v1/writer/projects/{projectId}/graphs/{graphId}
DELETE /api/v1/writer/projects/{projectId}/graphs/{graphId}
GET    /api/v1/writer/projects/{projectId}/graphs/{graphId}/export?format=markdown
```

## 📚 文档链接

- 完整 API 文档: `src/core/draw-engine/README.md`
- 集成指南: `DRAW_ENGINE_INTEGRATION_GUIDE.md`
- 实现总结: `DRAW_ENGINE_IMPLEMENTATION_SUMMARY.md`

## ⚡ 性能优化

```typescript
// 大规模图形（500+ 节点）
const config: DrawEngineConfig = {
  enableGrid: false,        // 禁用网格
  snapToGrid: false,
  gridSize: 50,             // 增加网格大小
  enableHistory: false,     // 禁用历史
  minZoom: 0.2,
  maxZoom: 3
}
```

## 🐛 调试技巧

```typescript
// 获取所有节点和连接
console.log(engine.getAllNodes())
console.log(engine.getAllEdges())

// 获取当前选中
console.log(engine.getSelectedNode())
console.log(engine.getSelectedEdge())

// 获取画布信息
console.log(engine.getCanvas())

// 导出 JSON 查看数据
console.log(engine.exportAsJSON())
```

## 💡 常用代码片段

### 清空画布

```typescript
engine.clear()
```

### 获取画布标题

```typescript
const canvas = engine.getCanvas()
console.log(canvas.title)
```

### 设置画布标题

```typescript
engine.setCanvasTitle('新标题')
```

### 批量创建节点

```typescript
const nodes = [
  { label: '节点1', x: 100, y: 100 },
  { label: '节点2', x: 300, y: 100 },
  { label: '节点3', x: 200, y: 300 }
]

const nodeIds = nodes.map(n => engine.createNode(n.label, n.x, n.y).id)

// 连接节点
engine.createEdge(nodeIds[0], nodeIds[1])
engine.createEdge(nodeIds[1], nodeIds[2])
```

### 导出为 Markdown

```typescript
const md = engine.exportAsMarkdown()
const filename = `diagram-${new Date().toISOString()}.md`
DrawExportService.downloadFile(md.markdown, filename)
```

---

**更新时间**: 2025-10-31  
**版本**: v1.0.0

