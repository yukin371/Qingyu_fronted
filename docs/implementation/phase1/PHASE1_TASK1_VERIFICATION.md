# Phase 1 - Task 1: OutlineView 集成验证指南

## 📋 概述

本文档用于验证 DrawCanvas 组件在 OutlineView 中的集成是否成功。

## ✅ 已完成的集成

### 1. 组件导入和注册
- ✅ 导入 `DrawCanvas` 组件
- ✅ 导入 `DrawNode`, `DrawEdge`, `DrawEngineConfig` 类型
- ✅ 正确配置组件 props 和 events

### 2. 思维导图数据转换
- ✅ 创建 `mindmapNodes` computed，将大纲树转换为 DrawNode 数组
- ✅ 创建 `mindmapEdges` computed，建立节点之间的关系边
- ✅ 配置思维导图画布参数（缩放、网格等）

### 3. 事件处理
- ✅ `handleMindmapNodeAdd`: 添加节点事件
- ✅ `handleMindmapNodeUpdate`: 更新节点事件
- ✅ `handleMindmapNodeDelete`: 删除节点事件
- ✅ `handleMindmapExport`: 导出事件

### 4. Store 方法
- ✅ `writerStore.createOutlineNode()` - 创建大纲节点
- ✅ `writerStore.updateOutlineNode()` - 更新大纲节点
- ✅ `writerStore.deleteOutlineNode()` - 删除大纲节点
- ✅ `writerStore.loadOutlineTree()` - 加载大纲树

## 🔍 手动测试步骤

### 前提条件
1. 前端开发服务器运行在 `http://localhost:5173`
2. 已登录并进入"作者端"
3. 已创建或打开一个项目
4. 进入项目的"大纲"页面

### 测试流程

#### 1️⃣ UI 切换测试
- [ ] 点击"树形"按钮，确认显示树形结构
- [ ] 点击"思维导图"按钮，确认显示思维导图视图
- [ ] 思维导图应该加载 DrawCanvas 组件

#### 2️⃣ 思维导图渲染测试
- [ ] 确认大纲节点正确转换为思维导图节点
- [ ] 验证节点位置合理（按层级水平排列）
- [ ] 验证节点之间有正确的连接线
- [ ] 验证工具栏正确显示（缩放、平移、导出按钮等）

#### 3️⃣ 交互测试
- [ ] 鼠标在画布上移动并缩放 (鼠标滚轮或按钮)
- [ ] 拖拽节点位置
- [ ] 点击节点选中它
- [ ] 右键菜单操作（如果有）

#### 4️⃣ 功能测试
- [ ] 在树形视图添加新节点
- [ ] 切换到思维导图，确认新节点出现
- [ ] 在树形视图编辑节点
- [ ] 切换到思维导图，确认变更同步
- [ ] 在树形视图删除节点
- [ ] 切换到思维导图，确认节点被删除

#### 5️⃣ 导出测试
- [ ] 点击思维导图的导出按钮
- [ ] 选择导出格式 (JSON/Markdown/SVG 等)
- [ ] 确认文件正确导出

## 📊 验证清单

### 代码质量
- [ ] 无编译错误
- [ ] 无控制台错误
- [ ] 无类型检查错误
- [ ] 组件正确加载

### 功能完整性
- [ ] 树形视图功能正常
- [ ] 思维导图视图正常显示
- [ ] 节点操作同步正确
- [ ] 事件处理工作正常

### 用户体验
- [ ] UI 美观，布局合理
- [ ] 响应速度快
- [ ] 交互反馈清晰
- [ ] 无明显性能问题

## 🐛 常见问题排查

### 问题 1: DrawCanvas 未显示
**症状**: 思维导图视图为空
**排查步骤**:
1. 检查浏览器控制台是否有错误
2. 确认 mindmapNodes 和 mindmapEdges 有数据
3. 检查 DrawCanvas 组件是否正确导入
4. 验证 canvas-type="mindmap" 属性

### 问题 2: 节点位置不合理
**症状**: 节点重叠或位置混乱
**排查步骤**:
1. 检查 mindmapNodes 中的 x, y 坐标计算
2. 验证节点大小设置 (width, height)
3. 调整树形布局算法

### 问题 3: 节点关系不正确
**症状**: 连接线错误或缺失
**排查步骤**:
1. 验证 mindmapEdges 的 source 和 target 是否正确
2. 检查节点 ID 是否一致
3. 调试 traverse 函数的递归逻辑

### 问题 4: 编辑后不同步
**症状**: 树形视图改变，但思维导图未更新
**排查步骤**:
1. 检查 computed 是否正确监听 outlineTree
2. 验证 writerStore 方法是否调用 loadOutlineTree()
3. 检查异步操作是否正确完成

## 📝 下一步工作

### 后端 API 实现
- [ ] 创建 `/projects/{projectId}/outline` POST 端点
- [ ] 创建 `/projects/{projectId}/outline/{nodeId}` PUT 端点
- [ ] 创建 `/projects/{projectId}/outline/{nodeId}` DELETE 端点
- [ ] 创建 `/projects/{projectId}/graphs` POST 端点 (图形数据持久化)

### 前端完善
- [ ] 替换占位符的 console.log 为实际 API 调用
- [ ] 添加加载状态指示器
- [ ] 添加错误处理和用户反馈
- [ ] 性能优化（大纲树过大时的处理）

### 集成测试
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 进行 E2E 测试

## 📞 技术支持

如有问题，请检查以下文件：
- `Qingyu_fronted/src/modules/writer/views/OutlineView.vue` - 集成实现
- `Qingyu_fronted/src/shared/components/draw/DrawCanvas.vue` - 绘图组件
- `Qingyu_fronted/src/core/draw-engine/README.md` - API 文档
