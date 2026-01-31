# Phase 1 集成和测试计划

**开始时间**: 2025-10-31  
**目标**: 将绘制工具集成到三个主要视图，实现后端API，完成集成测试

---

## 📋 任务分解

### Task 1: OutlineView 集成 🎯

**目标**: 在大纲视图添加思维导图视图切换

#### 1.1 前端集成 (预计 2-3 小时)

**文件**: `Qingyu_fronted/src/modules/writer/views/OutlineView.vue`

```diff
变更点：
- 添加视图切换按钮（树形/思维导图）
- 引入 DrawCanvas 组件
- 实现数据转换逻辑
- 添加节点变更同步
- 集成导出功能
```

**实现步骤**:
1. 在 OutlineView 头部添加视图切换按钮
2. 创建 `outlineData` 计算属性，将树结构转换为图形数据
3. 添加 `DrawCanvas` 组件和思维导图视图容器
4. 实现 `handleOutlineNodeChanged` 同步更新
5. 实现导出功能

**关键代码**:
```vue
<template>
  <div class="outline-view">
    <!-- 现有的树形视图 -->
    <div v-show="viewMode === 'tree'" class="tree-view">
      <!-- 现有代码 -->
    </div>

    <!-- 新增思维导图视图 -->
    <div v-show="viewMode === 'mindmap'" class="mindmap-view">
      <DrawCanvas
        :config="{
          canvasId: 'outline-mindmap',
          type: 'mindmap',
          theme: 'default',
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
```

#### 1.2 单元测试 (预计 1-2 小时)

**文件**: `Qingyu_fronted/src/modules/writer/views/__tests__/OutlineView.spec.ts`

- [ ] 测试视图切换功能
- [ ] 测试数据转换逻辑
- [ ] 测试节点变更同步
- [ ] 测试导出功能
- [ ] 性能测试（大纲超过 100 个节点）

#### 1.3 集成测试 (预计 1 小时)

- [ ] 手动测试大纲编辑
- [ ] 测试切换视图的稳定性
- [ ] 测试数据一致性
- [ ] 测试导出结果

**完成标准**:
- ✅ 思维导图视图正常显示
- ✅ 节点编辑同步到树形视图
- ✅ 导出为 Markdown 正确
- ✅ 没有控制台错误
- ✅ 性能良好（500+ 节点 < 1000ms）

---

### Task 2: EncyclopediaView 集成

**目标**: 在百科视图添加角色关系图和地点关系图

#### 2.1 前端集成 (预计 2-3 小时)

**文件**: `Qingyu_fronted/src/modules/writer/views/EncyclopediaView.vue`

**实现步骤**:
1. 添加关系图标签页
2. 创建 `characterGraphData` 计算属性
3. 创建 `locationGraphData` 计算属性
4. 集成 DrawCanvas 组件
5. 实现关系颜色映射

**布局策略**:
```typescript
// 角色圆形分布
const angle = (index / characters.length) * 2 * Math.PI
const radius = 200
const x = 400 + radius * Math.cos(angle)
const y = 300 + radius * Math.sin(angle)
```

#### 2.2 单元测试 (预计 1-2 小时)

- [ ] 测试数据转换
- [ ] 测试关系类型颜色映射
- [ ] 测试圆形分布布局
- [ ] 测试导出功能

#### 2.3 集成测试 (预计 1 小时)

- [ ] 手动验证关系图显示
- [ ] 验证关系线强度显示
- [ ] 验证导出数据正确性

**完成标准**:
- ✅ 关系图正确显示所有角色
- ✅ 关系线颜色和强度正确映射
- ✅ 支持导出为多种格式
- ✅ 性能良好

---

### Task 3: CharacterGraphView 集成

**目标**: 用可视化关系图替换卡片布局

#### 3.1 前端集成 (预计 2-3 小时)

**文件**: `Qingyu_fronted/src/modules/writer/views/CharacterGraphView.vue`

**变更**:
- 保留现有的卡片视图作为备用
- 添加可视化图谱视图
- 实现视图切换
- 支持节点编辑

#### 3.2 单元测试 (预计 1-2 小时)

- [ ] 测试视图切换
- [ ] 测试节点拖拽
- [ ] 测试连接创建
- [ ] 测试节点编辑

#### 3.3 集成测试 (预计 1 小时)

- [ ] 完整的交互测试
- [ ] 性能测试
- [ ] 导出测试

**完成标准**:
- ✅ 可视化图谱显示所有角色
- ✅ 支持节点拖拽和编辑
- ✅ 关系线正确显示
- ✅ 导出功能正常

---

### Task 4: 后端 API 实现

**目标**: 实现 Graph 数据的 CRUD 和导出 API

#### 4.1 数据模型 (预计 1 小时)

**文件**: `Qingyu_backend/models/writer/graph.go`

```go
type Graph struct {
    ID          string       `bson:"_id,omitempty" json:"id"`
    ProjectID   string       `bson:"project_id" json:"projectId"`
    Type        string       `bson:"type" json:"type"`
    Title       string       `bson:"title" json:"title"`
    Description string       `bson:"description" json:"description"`
    Nodes       []GraphNode  `bson:"nodes" json:"nodes"`
    Edges       []GraphEdge  `bson:"edges" json:"edges"`
    Metadata    interface{}  `bson:"metadata" json:"metadata"`
    CreatedAt   time.Time    `bson:"created_at" json:"createdAt"`
    UpdatedAt   time.Time    `bson:"updated_at" json:"updatedAt"`
}
```

#### 4.2 Repository 层 (预计 2 小时)

**文件**: `Qingyu_backend/repository/interfaces/writer/graph_repository.go`
      `Qingyu_backend/repository/mongodb/writer/graph_repository.go`

**方法**:
- `CreateGraph()`
- `GetGraph()`
- `UpdateGraph()`
- `DeleteGraph()`
- `ListGraphsByProject()`
- `ExportGraph()`

#### 4.3 Service 层 (预计 2 小时)

**文件**: `Qingyu_backend/service/interfaces/graph_service.go`
      `Qingyu_backend/service/writer/graph_service.go`

**方法**:
- `CreateGraph()`
- `GetGraph()`
- `UpdateGraph()`
- `DeleteGraph()`
- `ExportGraphAsMarkdown()`
- `ExportGraphAsJSON()`

#### 4.4 API 层 (预计 2 小时)

**文件**: `Qingyu_backend/api/v1/writer/graph_api.go`

**端点**:
```
POST   /api/v1/writer/projects/{projectId}/graphs
GET    /api/v1/writer/projects/{projectId}/graphs/{graphId}
PUT    /api/v1/writer/projects/{projectId}/graphs/{graphId}
DELETE /api/v1/writer/projects/{projectId}/graphs/{graphId}
GET    /api/v1/writer/projects/{projectId}/graphs/{graphId}/export?format=markdown
```

#### 4.5 路由注册 (预计 30 分钟)

**文件**: `Qingyu_backend/router/writer/graph_router.go`

---

### Task 5: 集成测试和文档

#### 5.1 集成测试 (预计 3-4 小时)

**文件**: `Qingyu_fronted/src/modules/writer/__tests__/integration/graph.integration.spec.ts`

- [ ] 完整的流程测试（创建、编辑、导出）
- [ ] 多视图同步测试
- [ ] 导出格式验证
- [ ] 性能基准测试

#### 5.2 E2E 测试 (预计 2 小时)

- [ ] 用户操作流程测试
- [ ] 数据持久化测试
- [ ] 错误处理测试

#### 5.3 文档更新 (预计 2 小时)

- [ ] 更新集成指南
- [ ] 添加使用示例
- [ ] 创建 API 文档
- [ ] 编写故障排除指南

---

## 📅 时间表

| 任务 | 开始 | 结束 | 工期 | 状态 |
|------|------|------|------|------|
| Task 1: OutlineView 集成 | 第1天 | 第1天 | 4-6h | 🔄 |
| Task 2: EncyclopediaView 集成 | 第1-2天 | 第2天 | 4-6h | ⏳ |
| Task 3: CharacterGraphView 集成 | 第2天 | 第2-3天 | 4-6h | ⏳ |
| Task 4: 后端 API 实现 | 第3天 | 第3-4天 | 9-10h | ⏳ |
| Task 5: 集成测试和文档 | 第4-5天 | 第5天 | 7-8h | ⏳ |

**总计**: ~30-40 小时

---

## 🔍 质量检查清单

### 代码质量
- [ ] 遵循项目代码规范
- [ ] 有完整的类型定义
- [ ] 有详细的注释
- [ ] 无 ESLint/TSLint 错误
- [ ] 代码审查通过

### 功能性
- [ ] 所有功能按需求实现
- [ ] 没有已知的 bug
- [ ] 性能达到要求
- [ ] 浏览器兼容性 ✓

### 测试覆盖
- [ ] 单元测试 > 80%
- [ ] 集成测试全覆盖
- [ ] E2E 测试关键流程
- [ ] 性能测试通过

### 文档完整性
- [ ] API 文档完整
- [ ] 集成指南清晰
- [ ] 示例代码有效
- [ ] 故障排除指南完善

---

## 🎯 成功标准

Phase 1 完成的条件：

1. ✅ **所有集成完成**
   - OutlineView 显示思维导图
   - EncyclopediaView 显示关系图
   - CharacterGraphView 显示可视化图谱

2. ✅ **后端 API 完整**
   - 5 个 API 端点正常工作
   - 数据持久化到数据库
   - 导出功能正常

3. ✅ **测试全覆盖**
   - 单元测试通过率 > 95%
   - 集成测试全部通过
   - E2E 测试无失败

4. ✅ **文档完善**
   - API 文档完整
   - 集成指南可用
   - 使用示例清晰

5. ✅ **性能达标**
   - 页面加载 < 1s
   - 大规模数据处理 < 500ms
   - 内存使用正常

---

## 📝 备注

### 可能的挑战

1. **数据同步复杂性**
   - 多视图间数据同步
   - 撤销/重做的状态管理
   
   *解决方案*: 使用 Pinia store 统一管理状态

2. **性能优化**
   - 大规模角色关系图（500+ 节点）
   - 复杂的布局计算
   
   *解决方案*: 虚拟化渲染、缓存、异步加载

3. **后端数据库设计**
   - Graph 数据结构的索引
   - 查询性能优化
   
   *解决方案*: 合理的索引策略、分页

### 依赖关系

- Task 1 独立进行
- Task 2, 3 可并行进行
- Task 4 可同时进行
- Task 5 依赖前面所有任务

### 风险管理

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 性能问题 | 中 | 高 | 早期性能测试、优化 |
| 数据一致性 | 中 | 高 | 完整的测试覆盖 |
| API 集成困难 | 低 | 中 | 清晰的接口设计 |

---

**下一步**: 开始 Task 1 的实现

**责任人**: 开发团队
**审核人**: 技术主管
