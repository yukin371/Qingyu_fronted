# 编辑器布局优化计划

## 当前状态分析

### 现有布局结构 (EditorLayout.vue + EditorPanel.vue)
- **MiniNavbar** - 顶部图标导航
- **左侧面板** - ProjectTree + ChapterTree（可折叠）
- **中间编辑器** - EditorPanel
  - toolbar (面包屑 + 格式按钮 + 操作)
  - chapter-header-card (章节标题 + 元信息)
  - editor-workspace (编辑/预览区)
  - timeline-panel (时间线)
  - statusbar (状态栏)
- **右侧面板** - AIPanel (AI助手)

### 存在问题
1. 缺少demo中展示的**横向鱼骨图大纲导航**
2. 工具栏与demo设计风格不一致
3. 编辑器上方没有类似demo的快速导航结构

---

## 优化目标

参考 `docs/demo/hybrid-fixed-layout.html` 的设计理念：

### 1. 添加横向大纲导航栏
**位置**: 编辑器内容区上方，替代当前的 chapter-header-card

**设计**:
```
[主干线]──[第一卷节点]──[第二卷节点]──[第三卷节点]──[主干线]
              ↑章节           ↑章节
```

**功能**:
- 点击卷节点：切换到该卷的细纲
- 点击章节节点：快速跳转到章节
- 当前章节高亮显示

### 2. 简化工具栏
**保留**:
- 面包屑导航
- 基础格式化按钮（B/I/U/引用等）
- AI助手快捷按钮
- 保存按钮

**移除/精简**:
- 预览按钮（放入菜单）
- 专注模式按钮

### 3. 优化编辑区域
- 保持极简风格
- 增大编辑器内边距
- 优化字体和行高

---

## 实施步骤

### Step 1: 创建FishboneNav组件
- 文件: `src/modules/writer/components/FishboneNav.vue`
- 实现横向大纲导航条
- 支持卷节点和章节节点

### Step 2: 修改EditorPanel.vue
- 将chapter-header-card替换为FishboneNav
- 简化工具栏按钮
- 保持编辑区域简洁

### Step 3: 调整EditorLayout.vue
- 在editor插槽中添加FishboneNav
- 确保与现有左侧面板兼容

### Step 4: 样式优化
- 统一色彩变量
- 优化响应式布局

---

## 验收标准

1. ✅ 横向大纲导航正确显示（卷节点 + 章节分支）
2. ✅ 点击章节节点能触发相应事件
3. ✅ 工具栏简洁明了
4. ✅ 编辑区域保持专注简洁
5. ✅ 响应式布局正常

---

## 技术约束

- 使用Vue3 Composition API
- 保持与现有store的兼容性
- SCSS样式，使用已有变量
- 不破坏现有功能

---

## 新增：角色关系图谱

### 概述
在编辑器页面添加角色关系图谱功能，提供可视化的角色关系展示。

### 设计风格：「文学星图」
采用深色主题配合琥珀金色调，营造如同翻阅古籍的沉浸感：
- **深靛蓝背景** (#0d1117) - 沉浸感
- **琥珀金节点** (#c9a962) - 文学气质
- **贝塞尔曲线连线** - 优雅的关系展示
- **星点背景纹理** - 微弱动态效果

### 组件位置
- 新增文件: `src/modules/writer/components/editor/CharacterGraph.vue`
- 集成入口: `src/modules/writer/views/EditorView.vue`

### 功能特性
1. **力导向图布局** - D3 force-directed graph 自动布局
2. **节点交互** - 点击查看详情，拖拽移动位置
3. **关系分类着色** - 不同关系类型用不同颜色（朋友/盟友绿色、恋人/家庭金色、敌人红色）
4. **缩放控制** - 支持鼠标滚轮缩放和平移
5. **悬停信息卡** - 显示角色名称和关系数量

### Mock数据
```typescript
const mockCharacters = [
  { id: 'c1', name: '林夜', importance: 5 },
  { id: 'c2', name: '艾琳', importance: 4 },
  { id: 'c3', name: '陈风', importance: 3 },
  { id: 'c4', name: '雪见', importance: 3 },
  { id: 'c5', name: '老船长', importance: 2 },
]

const mockCharacterRelations = [
  { source: 'c1', target: 'c2', type: '盟友', strength: 85 },
  { source: 'c1', target: 'c3', type: '朋友', strength: 70 },
  { source: 'c2', target: 'c4', type: '家庭', strength: 90 },
  { source: 'c3', target: 'c5', type: '敌人', strength: 60 },
  { source: 'c1', target: 'c5', type: '敌人', strength: 75 },
  { source: 'c2', target: 'c3', type: '朋友', strength: 55 },
]
```

### 后续优化方向
- 连接真实的角色数据API
- 支持 Shift+拖拽 创建新关系
- 双击节点打开角色详情编辑面板
- 导出图谱为图片功能
