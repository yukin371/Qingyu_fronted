# 青羽通用绘制工具集成指南

## 项目概述

本指南详细说明如何在青羽写作平台的各个模块中集成和使用通用绘制工具（Draw Engine）。

## 文件结构

```
src/
├── core/
│   └── draw-engine/
│       ├── types.ts                 # 类型定义
│       ├── draw-engine.ts           # 核心引擎类
│       ├── export-service.ts        # 导出/导入服务
│       └── README.md                # 详细 API 文档
└── shared/
    └── components/
        └── draw/
            └── DrawCanvas.vue       # Vue 画布组件
```

## 核心特性

### 支持的图形类型

| 类型 | 用途 | 示例 |
|------|------|------|
| **mindmap** | 思维导图 | 大纲规划、内容组织 |
| **tree** | 树形图 | 故事树、分支情节 |
| **graph** | 关系图 | 角色关系、世界设定 |
| **timeline** | 时间线 | 情节时间线、年表 |
| **flowchart** | 流程图 | 情节流程、故事线 |
| **diagram** | 通用图表 | 其他自定义图表 |

### 支持的导出格式

- ✅ JSON - 完整的图形数据
- ✅ Markdown - 可在文档中使用的格式
- ✅ SVG - 矢量图形
- ✅ CSV - 表格数据
- ✅ Mermaid - 在线图表语法
- ✅ PlantUML - UML 图表
- ✅ GraphViz DOT - 图论格式

## 集成指南

### 1. OutlineView（大纲视图）集成

在大纲视图中添加思维导图显示和编辑功能：

```vue
<template>
  <div class="outline-view">
    <!-- 视图切换按钮 -->
    <div class="header-actions">
      <el-button-group>
        <el-button
          :type="viewMode === 'tree' ? 'primary' : ''"
          @click="viewMode = 'tree'"
        >
          树形视图
        </el-button>
        <el-button
          :type="viewMode === 'mindmap' ? 'primary' : ''"
          @click="viewMode = 'mindmap'"
        >
          思维导图
        </el-button>
      </el-button-group>
    </div>

    <!-- 思维导图视图 -->
    <div v-show="viewMode === 'mindmap'" class="mindmap-view">
      <DrawCanvas
        :config="{
          canvasId: 'outline-mindmap',
          type: 'mindmap',
          theme: 'default',
          enableGrid: true,
          enableHistory: true,
          directions: 'TB'
        }"
        :initial-data="outlineData"
        @node-changed="handleOutlineNodeChanged"
        @export="handleExportOutline"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DrawCanvas from '@/shared/components/draw/DrawCanvas.vue'
import type { DrawNode, DrawEdge } from '@/core/draw-engine/types'

const viewMode = ref<'tree' | 'mindmap'>('tree')

const outlineData = computed(() => {
  const tree = writerStore.outline.tree
  const nodes: DrawNode[] = tree.map(node => ({
    id: node.id,
    type: 'node',
    label: node.title,
    description: node.description,
    x: 0,
    y: 0,
    width: 120,
    height: 60,
    metadata: {
      status: node.status,
      wordCount: node.wordCount
    }
  }))

  // 根据树结构生成连接
  const edges: DrawEdge[] = []
  tree.forEach(node => {
    if (node.parentId) {
      edges.push({
        id: `edge-${node.parentId}-${node.id}`,
        type: 'curve',
        fromNodeId: node.parentId,
        toNodeId: node.id,
        label: '',
        color: '#409eff'
      })
    }
  })

  return { nodes, edges }
})

const handleOutlineNodeChanged = (node: DrawNode) => {
  // 同步到 store
  if (writerStore.outline.tree) {
    const treeNode = writerStore.outline.tree.find(n => n.id === node.id)
    if (treeNode) {
      treeNode.title = node.label
      treeNode.description = node.description
    }
  }
}

const handleExportOutline = async ({ type, data }: any) => {
  if (type === 'markdown') {
    // 保存为 Markdown 文档
    await saveOutlineAsMarkdown(data)
  }
}
</script>
```

### 2. EncyclopediaView（百科视图）集成

在百科视图中展示角色关系图和地点关系图：

```vue
<template>
  <div class="encyclopedia-view">
    <!-- 角色关系图 -->
    <div v-if="activeTab === 'characterGraph'" class="graph-container">
      <DrawCanvas
        :config="{
          canvasId: 'character-encyclopedia',
          type: 'graph',
          theme: 'default',
          enableGrid: true,
          enableHistory: true
        }"
        :initial-data="characterGraphData"
        @export="handleExportCharacterGraph"
      />
    </div>

    <!-- 地点关系图 -->
    <div v-if="activeTab === 'locationGraph'" class="graph-container">
      <DrawCanvas
        :config="{
          canvasId: 'location-encyclopedia',
          type: 'graph',
          theme: 'default',
          enableGrid: true,
          enableHistory: true
        }"
        :initial-data="locationGraphData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DrawCanvas from '@/shared/components/draw/DrawCanvas.vue'
import type { DrawNode, DrawEdge } from '@/core/draw-engine/types'

const characterGraphData = computed(() => {
  const characters = writerStore.characters.list
  const relations = writerStore.characters.relations

  const nodes: DrawNode[] = characters.map((char, index) => {
    // 根据角色数量计算位置（圆形分布）
    const angle = (index / characters.length) * 2 * Math.PI
    const radius = 200
    const x = 400 + radius * Math.cos(angle)
    const y = 300 + radius * Math.sin(angle)

    return {
      id: char.id,
      type: 'node',
      label: char.name,
      description: char.summary,
      x,
      y,
      width: 100,
      height: 60,
      color: '#ecf5ff',
      borderColor: '#409eff',
      metadata: {
        avatar: char.avatarUrl,
        traits: char.traits
      }
    }
  })

  const edges: DrawEdge[] = relations.map(rel => ({
    id: rel.id,
    type: 'curve',
    fromNodeId: rel.fromId,
    toNodeId: rel.toId,
    label: rel.type,
    color: getRelationColor(rel.type),
    lineWidth: rel.strength / 20 + 1,
    showArrow: true
  }))

  return { nodes, edges }
})

const getRelationColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    '朋友': '#67C23A',
    '家庭': '#409EFF',
    '恋人': '#F56C6C',
    '盟友': '#E6A23C',
    '敌人': '#FF6B81',
    '其他': '#909399'
  }
  return colorMap[type] || '#909399'
}

const handleExportCharacterGraph = async ({ type, data }: any) => {
  if (type === 'markdown') {
    // 导出为 Markdown 关系图谱
    const filename = `character-relations-${new Date().toISOString()}.md`
    downloadFile(data.markdown, filename)
  }
}
</script>
```

### 3. CharacterGraphView（角色图谱）集成

完全替换原有的卡片布局为可视化关系图：

```vue
<template>
  <div class="character-graph-view">
    <!-- 工具栏 -->
    <div class="graph-header">
      <div class="header-left">
        <el-icon class="header-icon"><User /></el-icon>
        <span class="header-title">角色图谱</span>
      </div>
      <div class="header-actions">
        <el-button 
          type="primary" 
          size="small" 
          :icon="Plus" 
          @click="handleAddCharacter"
        >
          添加角色
        </el-button>
      </div>
    </div>

    <!-- 关系图 -->
    <div class="graph-content">
      <DrawCanvas
        :config="{
          canvasId: 'character-graph-main',
          type: 'graph',
          theme: currentTheme,
          enableGrid: true,
          enableHistory: true,
          defaultNodeWidth: 130,
          defaultNodeHeight: 80
        }"
        :initial-data="characterGraphData"
        @node-selected="handleNodeSelected"
        @node-changed="handleNodeChanged"
        @export="handleExportGraph"
      />
    </div>

    <!-- 节点详情面板 -->
    <transition name="slide-left">
      <div v-if="selectedCharacter" class="detail-sidebar">
        <!-- 详情内容 -->
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import DrawCanvas from '@/shared/components/draw/DrawCanvas.vue'
import type { DrawNode, DrawEdge } from '@/core/draw-engine/types'
import DrawExportService from '@/core/draw-engine/export-service'

const characterGraphData = computed(() => {
  // 实现与上面相同
})

const handleNodeChanged = async (node: DrawNode) => {
  // 更新角色信息
  const characterId = node.id
  await updateCharacter(characterId, {
    name: node.label,
    summary: node.description
  })
}

const handleExportGraph = async ({ type, data }: any) => {
  switch (type) {
    case 'json':
      DrawExportService.downloadFile(
        data,
        `character-graph-${Date.now()}.json`,
        'application/json'
      )
      break
    case 'markdown':
      DrawExportService.downloadFile(
        data.markdown,
        `character-graph-${Date.now()}.md`,
        'text/markdown'
      )
      break
    case 'svg':
      DrawExportService.downloadFile(
        data,
        `character-graph-${Date.now()}.svg`,
        'image/svg+xml'
      )
      break
  }
}
</script>
```

## 后端 API 规范

### 创建图形

```http
POST /api/v1/writer/projects/{projectId}/graphs
Content-Type: application/json

{
  "type": "mindmap|tree|graph|timeline|flowchart|diagram",
  "title": "图形标题",
  "description": "图形描述",
  "nodes": [
    {
      "id": "node-1",
      "type": "node|group|text",
      "label": "节点标题",
      "description": "节点描述",
      "x": 100,
      "y": 100,
      "width": 120,
      "height": 60,
      "color": "#ffffff",
      "metadata": {}
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "type": "line|curve|polyline|arrow",
      "fromNodeId": "node-1",
      "toNodeId": "node-2",
      "label": "关系标签",
      "style": "solid|dashed|dotted",
      "color": "#409eff",
      "lineWidth": 2,
      "showArrow": true
    }
  ]
}

Response:
{
  "id": "graph-123",
  "projectId": "project-456",
  "type": "mindmap",
  "title": "图形标题",
  "createdAt": "2025-10-31T12:00:00Z",
  "updatedAt": "2025-10-31T12:00:00Z"
}
```

### 更新图形

```http
PUT /api/v1/writer/projects/{projectId}/graphs/{graphId}
Content-Type: application/json

{
  "title": "更新后的标题",
  "nodes": [...],
  "edges": [...]
}
```

### 获取图形

```http
GET /api/v1/writer/projects/{projectId}/graphs/{graphId}

Response:
{
  "id": "graph-123",
  "type": "mindmap",
  "title": "图形标题",
  "nodes": [...],
  "edges": [...]
}
```

### 导出图形

```http
GET /api/v1/writer/projects/{projectId}/graphs/{graphId}/export?format=markdown

Query Parameters:
- format: json|markdown|svg|mermaid|plantuml|dot

Response:
导出内容（根据格式返回）
```

## 数据模型（Go 后端）

```go
// 图形模型
type Graph struct {
    ID          string       `bson:"_id,omitempty" json:"id"`
    ProjectID   string       `bson:"project_id" json:"projectId"`
    Type        string       `bson:"type" json:"type"` // mindmap, tree, graph, etc.
    Title       string       `bson:"title" json:"title"`
    Description string       `bson:"description" json:"description"`
    Nodes       []GraphNode  `bson:"nodes" json:"nodes"`
    Edges       []GraphEdge  `bson:"edges" json:"edges"`
    Metadata    interface{}  `bson:"metadata" json:"metadata"`
    CreatedAt   time.Time    `bson:"created_at" json:"createdAt"`
    UpdatedAt   time.Time    `bson:"updated_at" json:"updatedAt"`
}

// 节点模型
type GraphNode struct {
    ID          string                 `bson:"id" json:"id"`
    Type        string                 `bson:"type" json:"type"` // node, group, text
    Label       string                 `bson:"label" json:"label"`
    Description string                 `bson:"description" json:"description"`
    X           float64                `bson:"x" json:"x"`
    Y           float64                `bson:"y" json:"y"`
    Width       float64                `bson:"width" json:"width"`
    Height      float64                `bson:"height" json:"height"`
    Color       string                 `bson:"color" json:"color"`
    BorderColor string                 `bson:"border_color" json:"borderColor"`
    FontSize    int                    `bson:"font_size" json:"fontSize"`
    Icon        string                 `bson:"icon" json:"icon"`
    Metadata    map[string]interface{} `bson:"metadata" json:"metadata"`
}

// 连接模型
type GraphEdge struct {
    ID         string `bson:"id" json:"id"`
    Type       string `bson:"type" json:"type"` // line, curve, polyline, arrow
    FromNodeID string `bson:"from_node_id" json:"fromNodeId"`
    ToNodeID   string `bson:"to_node_id" json:"toNodeId"`
    Label      string `bson:"label" json:"label"`
    Style      string `bson:"style" json:"style"` // solid, dashed, dotted
    Color      string `bson:"color" json:"color"`
    LineWidth  int    `bson:"line_width" json:"lineWidth"`
    ShowArrow  bool   `bson:"show_arrow" json:"showArrow"`
    ArrowType  string `bson:"arrow_type" json:"arrowType"`
    Metadata   map[string]interface{} `bson:"metadata" json:"metadata"`
}
```

## 使用示例

### 示例1：在 Writer Dashboard 中添加图形统计

```vue
<template>
  <div class="dashboard">
    <div class="stat-cards">
      <!-- 现有卡片 -->
      
      <!-- 新增：图形管理卡片 -->
      <div class="stat-card">
        <div class="card-header">
          <h3>创意工具</h3>
          <el-icon><Tools /></el-icon>
        </div>
        <div class="card-content">
          <div class="stat-item">
            <span>思维导图</span>
            <span class="stat-value">{{ graphStats.mindmaps }}</span>
          </div>
          <div class="stat-item">
            <span>关系图</span>
            <span class="stat-value">{{ graphStats.graphs }}</span>
          </div>
          <div class="stat-item">
            <span>时间线</span>
            <span class="stat-value">{{ graphStats.timelines }}</span>
          </div>
          <el-button @click="navigateToGraphs">查看全部</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const graphStats = reactive({
  mindmaps: 0,
  graphs: 0,
  timelines: 0
})

onMounted(async () => {
  // 加载图形统计
  const stats = await loadGraphStats()
  graphStats.mindmaps = stats.mindmaps
  graphStats.graphs = stats.graphs
  graphStats.timelines = stats.timelines
})
</script>
```

### 示例2：批量导出所有图形

```typescript
async function exportAllGraphs(projectId: string) {
  const graphs = await fetchAllGraphs(projectId)
  
  for (const graph of graphs) {
    // 导出为 Markdown
    const md = await DrawEngine.prototype.exportAsMarkdown
    const filename = `${graph.title}-${graph.id}.md`
    DrawExportService.downloadFile(md, filename)
  }
}
```

## 性能优化建议

### 1. 大规模图形处理

```typescript
// 启用虚拟化渲染
const config: DrawEngineConfig = {
  canvasId: 'large-graph',
  type: 'graph',
  enableGrid: false,        // 禁用网格以提高性能
  snapToGrid: false,
  gridSize: 50,             // 增加网格大小
  enableHistory: false      // 禁用历史记录如果不需要
}
```

### 2. 缓存优化

```typescript
// 使用 IndexedDB 缓存图形数据
import { useStorage } from '@/utils/indexedDB'

const graphCache = useStorage('graphs')

// 从缓存读取
const cachedGraph = await graphCache.get(graphId)

// 保存到缓存
await graphCache.set(graphId, graphData)
```

### 3. 异步加载

```typescript
// 延迟加载大型图形
const largeGraphData = await loadGraphDataAsync(graphId)
```

## 故障排除

### Q: 图形保存失败
A: 检查节点 ID 的唯一性，确保所有节点都有不同的 ID

### Q: 导出的 Markdown 不显示
A: 确保 Mermaid 图表语法正确，检查节点标签中是否有特殊字符

### Q: 性能下降（节点超过 500）
A: 禁用网格、禁用历史记录、增加网格大小

### Q: 连接线重叠不显示
A: 使用曲线类型而不是直线，设置不同的颜色

## 更新日志

### v1.0.0 (2025-10-31)
- ✅ 初始发布
- ✅ 基础绘制功能
- ✅ 导出功能
- ✅ 主题系统
- ✅ Vue 组件集成

## 许可证

MIT License

## 支持

有任何问题或建议，请联系开发团队。

