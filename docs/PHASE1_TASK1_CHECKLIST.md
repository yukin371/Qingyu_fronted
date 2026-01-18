# Task 1: OutlineView 集成 - 实施清单

**任务**: 在大纲视图添加思维导图视图  
**预计工期**: 4-6 小时  
**优先级**: 🔴 高  
**状态**: 🔄 进行中

---

## 📋 前端集成检查清单

### Phase 1.1: 代码集成 (2-3 小时)

#### 1.1.1 导入和声明
- [ ] 在 `OutlineView.vue` 中导入 `DrawCanvas` 组件
- [ ] 导入 `DrawExportService` 类
- [ ] 导入必要的 TypeScript 类型 (`DrawNode`, `DrawEdge`)
- [ ] 导入新的 icon 图标 (`Share` icon for mindmap button)

```typescript
import DrawCanvas from '@/shared/components/draw/DrawCanvas.vue'
import DrawExportService from '@/core/draw-engine/export-service'
import type { DrawNode, DrawEdge } from '@/core/draw-engine/types'
```

#### 1.1.2 UI 布局
- [ ] 添加视图切换按钮组（树形/思维导图）
- [ ] 添加思维导图视图容器 (`v-show="viewMode === 'mindmap'"`)
- [ ] 保留现有的树形视图代码
- [ ] 确保样式和布局一致

**关键代码**:
```vue
<el-button-group>
  <el-button
    :type="viewMode === 'tree' ? 'primary' : ''"
    @click="viewMode = 'tree'"
  >树形</el-button>
  <el-button
    :type="viewMode === 'mindmap' ? 'primary' : ''"
    @click="viewMode = 'mindmap'"
  >思维导图</el-button>
</el-button-group>
```

#### 1.1.3 组件集成
- [ ] 在思维导图视图中添加 `DrawCanvas` 组件
- [ ] 配置 `DrawCanvas` props (config, initialData)
- [ ] 绑定事件处理器 (@node-changed, @export)

```vue
<DrawCanvas
  :config="mindmapConfig"
  :initial-data="outlineData"
  @node-changed="handleOutlineNodeChanged"
  @export="handleExportOutline"
/>
```

#### 1.1.4 数据转换
- [ ] 创建 `mindmapConfig` 对象配置
- [ ] 创建 `outlineData` 计算属性
- [ ] 实现树形结构转换为图形数据的逻辑
- [ ] 处理节点位置计算（树形布局）
- [ ] 生成节点和连接数据

**关键逻辑**:
```typescript
const outlineData = computed(() => {
  // 1. 提取大纲树数据
  // 2. 遍历节点，创建 DrawNode 对象
  // 3. 创建 DrawEdge 连接
  // 4. 计算节点位置
  // 5. 返回 { nodes, edges }
})
```

#### 1.1.5 事件处理器
- [ ] 实现 `handleOutlineNodeChanged()` - 同步思维导图更改
- [ ] 实现 `handleMindmapNodeSelected()` - 处理节点选中
- [ ] 实现 `handleExportOutline()` - 导出功能
- [ ] 实现 `generateOutlineMarkdown()` - Markdown 生成

**关键处理器**:
```typescript
// 当思维导图节点被修改时同步
const handleOutlineNodeChanged = async (node: DrawNode) => {
  // 1. 获取项目ID
  // 2. 调用 API 更新节点
  // 3. 重新加载大纲树
}

// 导出大纲为 Markdown
const handleExportOutline = async (data: any) => {
  // 1. 生成 Markdown 内容
  // 2. 使用 DrawExportService 下载
}
```

#### 1.1.6 样式和响应式
- [ ] 添加思维导图视图容器样式
- [ ] 处理不同屏幕尺寸的响应式调整
- [ ] 确保工具栏在各屏幕下正常显示

---

### Phase 1.2: 单元测试 (1-2 小时)

**文件**: `src/modules/writer/views/__tests__/OutlineView.spec.ts`

#### 1.2.1 基础测试
- [ ] 测试组件正常挂载
- [ ] 测试视图切换功能 (tree ↔ mindmap)
- [ ] 测试初始数据加载

```typescript
describe('OutlineView', () => {
  it('should mount successfully', () => {
    // ...
  })

  it('should toggle between tree and mindmap views', () => {
    // ...
  })

  it('should load outline data on mount', () => {
    // ...
  })
})
```

#### 1.2.2 数据转换测试
- [ ] 测试树形结构到图形数据的转换
- [ ] 验证节点数据完整性
- [ ] 验证连接数据正确性
- [ ] 测试节点位置计算

```typescript
describe('outlineData computation', () => {
  it('should convert tree structure to graph data', () => {
    // Arrange: 创建测试数据
    const testNodes = [...]
    
    // Act: 计算转换
    const result = outlineData.value
    
    // Assert: 验证结果
    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(2)
  })
})
```

#### 1.2.3 事件处理测试
- [ ] 测试节点变更同步
- [ ] 测试节点选中事件
- [ ] 测试导出功能

```typescript
describe('event handlers', () => {
  it('should sync changes from mindmap to tree', async () => {
    // ...
  })

  it('should handle node selection', () => {
    // ...
  })

  it('should export outline as markdown', () => {
    // ...
  })
})
```

#### 1.2.4 性能测试
- [ ] 测试大纲超过 100 个节点的渲染性能
- [ ] 测试视图切换的响应时间
- [ ] 验证内存使用

```typescript
describe('performance', () => {
  it('should handle 100+ nodes efficiently', () => {
    // Arrange: 创建 100+ 节点
    // Act: 渲染
    // Assert: 性能指标
  })
})
```

---

### Phase 1.3: 集成测试 (1-2 小时)

#### 1.3.1 手动功能测试
- [ ] 打开大纲视图
- [ ] 切换到思维导图视图
  - [ ] 验证思维导图正确显示
  - [ ] 验证所有节点可见
  - [ ] 验证连接线正确
- [ ] 切换回树形视图
  - [ ] 验证树形视图正常
  - [ ] 验证数据一致性
- [ ] 在思维导图中编辑节点
  - [ ] 修改节点名称
  - [ ] 验证同步到树形视图
- [ ] 测试导出功能
  - [ ] 导出为 JSON
  - [ ] 导出为 Markdown
  - [ ] 验证文件内容

#### 1.3.2 跨浏览器测试
- [ ] Chrome 最新版本 ✓
- [ ] Firefox 最新版本 ✓
- [ ] Safari (如适用) ✓
- [ ] Edge 最新版本 ✓

#### 1.3.3 响应式测试
- [ ] 桌面 (1920px+)
  - [ ] 思维导图完整显示
  - [ ] 工具栏布局正常
- [ ] 平板 (1024px - 1919px)
  - [ ] 响应式调整正常
  - [ ] 操作易用性
- [ ] 手机 (< 1024px)
  - [ ] 应用可用性
  - [ ] 触摸操作支持

#### 1.3.4 数据一致性测试
- [ ] 创建新节点 → 思维导图/树形都显示
- [ ] 修改节点 → 两个视图同步
- [ ] 删除节点 → 两个视图同步
- [ ] 排序节点 → 两个视图同步

#### 1.3.5 错误处理测试
- [ ] 网络错误时的处理
- [ ] 数据格式错误时的处理
- [ ] 大数据加载的处理
- [ ] 验证错误消息显示

---

## 📊 代码覆盖标准

| 类型 | 目标 | 检查 |
|------|------|------|
| 行覆盖率 | > 85% | [ ] |
| 分支覆盖率 | > 80% | [ ] |
| 函数覆盖率 | > 90% | [ ] |
| 语句覆盖率 | > 85% | [ ] |

---

## 🎯 完成标准

### 功能完成度
- [ ] 思维导图视图正常显示
- [ ] 视图切换正常
- [ ] 数据同步正常
- [ ] 导出功能正常
- [ ] 没有控制台错误或警告

### 质量标准
- [ ] 代码遵循项目规范
- [ ] 有完整的类型定义
- [ ] 有详细的代码注释
- [ ] 通过 ESLint 检查
- [ ] 通过代码审查

### 性能标准
- [ ] 组件加载时间 < 500ms
- [ ] 视图切换时间 < 300ms
- [ ] 500+ 节点处理时间 < 1000ms
- [ ] 内存占用正常

### 文档完整性
- [ ] 代码注释清晰
- [ ] 集成指南完成
- [ ] 使用示例有效
- [ ] 问题排查指南完善

---

## 📝 关键实现细节

### 1. 树形到图形的数据转换

**输入**（树形结构）:
```typescript
[
  {
    id: '1',
    title: '第一章',
    level: 1,
    children: [
      {
        id: '2',
        title: '1.1节',
        level: 2,
        parentId: '1'
      }
    ]
  }
]
```

**输出**（图形数据）:
```typescript
{
  nodes: [
    { id: '1', label: '第一章', x: 400, y: 100, ... },
    { id: '2', label: '1.1节', x: 250, y: 200, ... }
  ],
  edges: [
    { fromNodeId: '1', toNodeId: '2', ... }
  ]
}
```

### 2. 节点颜色映射

根据节点状态设置不同的颜色：
- 草稿 (draft): 蓝色背景 `#f0f9ff`
- 写作中 (writing): 黄色背景 `#fef3c7`
- 已完成 (completed): 绿色背景 `#dcfce7`
- 审阅中 (reviewing): 紫色背景 `#ece7ff`

### 3. 节点位置计算

使用树形布局算法：
```typescript
const x = parentX + (index - Math.floor(count / 2)) * xOffset
const y = parentY + yOffset * level
```

---

## 🔗 相关文件

| 文件 | 说明 | 状态 |
|------|------|------|
| `src/modules/writer/views/OutlineView.vue` | 主要视图文件 | 需修改 |
| `OutlineView_DrawCanvas_Integration.vue` | 集成模板 | 参考 |
| `src/shared/components/draw/DrawCanvas.vue` | 绘制组件 | 已完成 ✓ |
| `src/core/draw-engine/types.ts` | 类型定义 | 已完成 ✓ |
| `src/core/draw-engine/draw-engine.ts` | 引擎实现 | 已完成 ✓ |
| `PHASE1_INTEGRATION_PLAN.md` | 总体计划 | 参考 |

---

## 🚨 常见问题和解决方案

### Q1: 节点位置如何计算？
**A**: 使用树形布局，每一层向下偏移固定距离，同一层的节点水平分布。

### Q2: 如何处理大纲数据的同步？
**A**: 通过 Pinia store 统一管理状态，确保树形视图和思维导图视图数据一致。

### Q3: 性能如何优化？
**A**: 
- 禁用网格显示加快渲染
- 虚拟化大纲树（超过 100 节点）
- 异步加载大纲数据

### Q4: 导出 Markdown 如何生成结构？
**A**: 递归遍历大纲树，根据层级生成相应数量的 `#` 符号。

---

## 📞 沟通计划

| 阶段 | 内容 | 对象 | 时间 |
|------|------|------|------|
| 代码审查 | 集成代码评审 | 技术主管 | 完成后 |
| 测试报告 | 测试结果汇总 | QA | 完成后 |
| 集成反馈 | 收集使用反馈 | 用户 | 上线后 |

---

**进度跟踪**:
- [x] 任务分解
- [ ] 代码集成
- [ ] 单元测试
- [ ] 集成测试
- [ ] 代码审查
- [ ] 问题修复
- [ ] 上线部署

**最后更新**: 2025-10-31  
**预计完成**: 2025-11-01
