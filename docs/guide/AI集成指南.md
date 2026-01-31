# AI功能集成指南

本文档说明如何将AI写作助手集成到EditorView.vue中。

## 已完成的工作

✅ 1. Banner点击跳转修复
✅ 2. 榜单页面完整实现
✅ 3. AI API接口创建 (`src/api/writing/ai.ts`)
✅ 4. AI类型定义 (`src/types/ai.ts`)
✅ 5. Writer Store扩展（AI状态管理）
✅ 6. AIAssistantSidebar.vue 主组件
✅ 7. AIChatPanel.vue 对话面板
✅ 8. AIToolsPanel.vue 工具面板
✅ 9. AIContextMenu.vue 右键菜单

## 待完成：EditorView.vue 集成

### 步骤1: 添加导入

在 `EditorView.vue` 的 `<script setup>` 部分顶部添加：

```typescript
import { useWriterStore } from '@writer/stores/writerStore'
import AIAssistantSidebar from '@writer/components/ai/AIAssistantSidebar.vue'
import AIContextMenu from '@writer/components/ai/AIContextMenu.vue'
import { MagicStick } from '@element-plus/icons-vue'
```

### 步骤2: 添加响应式状态

在 `<script setup>` 中添加：

```typescript
const writerStore = useWriterStore()

// AI相关状态
const showAISidebar = computed(() => writerStore.ai.sidebarVisible)
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  selectedText: ''
})
```

### 步骤3: 添加AI按钮到工具栏

在 EditorToolbar 组件调用处（第49-55行）之前添加AI按钮：

```vue
<!-- AI助手按钮 -->
<el-button
  @click="toggleAISidebar"
  link
  class="ai-button"
  title="AI写作助手 (Ctrl+K)"
>
  <el-icon><MagicStick /></el-icon>
  AI助手
</el-button>
```

### 步骤4: 添加右键菜单事件处理

在 `handleKeydown` 函数附近添加：

```typescript
// 显示右键菜单
const handleContextMenu = (e: MouseEvent) => {
  const textarea = editorTextarea.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  if (start !== end) {
    e.preventDefault()
    const selected = fileContent.value.substring(start, end)
    
    contextMenu.visible = true
    contextMenu.x = e.clientX
    contextMenu.y = e.clientY
    contextMenu.selectedText = selected
    
    writerStore.setSelectedText(selected)
  }
}

// 处理右键菜单操作
const handleContextMenuAction = (action: string, text?: string) => {
  writerStore.toggleAISidebar(true)
  writerStore.setAITool(action === 'chat' ? 'chat' : action)
  
  if (text) {
    writerStore.setSelectedText(text)
  }
}

// 切换AI侧边栏
const toggleAISidebar = () => {
  writerStore.toggleAISidebar()
}

// 插入AI生成的文本
const handleInsertAIText = (text: string) => {
  const textarea = editorTextarea.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  // 如果有选中文本，替换它；否则插入到光标位置
  const before = fileContent.value.substring(0, start)
  const after = fileContent.value.substring(end)
  
  fileContent.value = before + text + after
  
  // 移动光标到插入文本的末尾
  nextTick(() => {
    const newPos = start + text.length
    textarea.selectionStart = newPos
    textarea.selectionEnd = newPos
    textarea.focus()
  })
  
  handleContentChange()
}
```

### 步骤5: 添加快捷键支持

在 `handleKeydown` 函数中添加AI快捷键：

```typescript
const handleKeydown = (e: KeyboardEvent) => {
  // 现有代码...
  
  // AI快捷键
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    writerStore.toggleAISidebar(true)
    writerStore.setAITool('chat')
    return
  }
  
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
    e.preventDefault()
    // 快速续写
    const cursor = editorTextarea.value?.selectionStart || 0
    const text = fileContent.value.substring(Math.max(0, cursor - 500), cursor)
    writerStore.setSelectedText(text)
    writerStore.toggleAISidebar(true)
    writerStore.setAITool('continue')
    return
  }
  
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
    e.preventDefault()
    // 快速润色选中文本
    const textarea = editorTextarea.value
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      if (start !== end) {
        const selected = fileContent.value.substring(start, end)
        writerStore.setSelectedText(selected)
        writerStore.toggleAISidebar(true)
        writerStore.setAITool('polish')
      }
    }
    return
  }
  
  // 现有的其他按键处理...
}
```

### 步骤6: 添加右键菜单绑定

在 textarea 元素上添加 `@contextmenu` 事件：

```vue
<textarea
  ref="editorTextarea"
  v-model="fileContent"
  class="editor-textarea"
  placeholder="开始写作..."
  @keydown.tab.prevent="handleTab"
  @keydown="handleKeydown"
  @input="handleContentChange"
  @scroll="handleEditorScroll"
  @contextmenu="handleContextMenu"
></textarea>
```

### 步骤7: 添加AI组件到模板

在 `</div>` (editor-container 闭合标签) 之前添加：

```vue
<!-- AI助手侧边栏 -->
<AIAssistantSidebar
  v-if="showAISidebar"
  :project-id="currentProjectId"
  :editor="editorTextarea"
  @close="writerStore.toggleAISidebar(false)"
  @insert="handleInsertAIText"
/>

<!-- AI右键菜单 -->
<AIContextMenu
  v-model:visible="contextMenu.visible"
  :x="contextMenu.x"
  :y="contextMenu.y"
  :selected-text="contextMenu.selectedText"
  @action="handleContextMenuAction"
/>
```

### 步骤8: 添加样式

在 `<style>` 部分添加：

```scss
.ai-button {
  color: #667eea;
  
  &:hover {
    color: #764ba2;
    background: rgba(102, 126, 234, 0.1);
  }
}

// 当AI侧边栏显示时，调整编辑器宽度
.editor-container {
  position: relative;
  transition: margin-right 0.3s ease;
  
  &:has(.ai-assistant-sidebar) {
    margin-right: 400px;
    
    @media (max-width: 1200px) {
      margin-right: 350px;
    }
    
    @media (max-width: 768px) {
      margin-right: 0;
    }
  }
}
```

## 测试清单

完成集成后，测试以下功能：

- [ ] 点击AI按钮打开侧边栏
- [ ] Ctrl+K 打开对话模式
- [ ] Ctrl+Shift+K 快速续写
- [ ] Ctrl+Shift+P 润色选中文本
- [ ] 右键菜单在选中文本时显示
- [ ] 右键菜单操作正确打开相应工具
- [ ] 插入生成文本到编辑器
- [ ] 复制生成文本
- [ ] 对话历史正常保存
- [ ] Token使用统计显示

## 注意事项

1. **项目ID**: 确保 `currentProjectId` 可用，AI API需要此参数
2. **权限**: AI功能需要用户登录且有相应权限
3. **错误处理**: 所有AI操作已在store中处理，无需额外错误处理
4. **性能**: AI侧边栏使用懒加载，不影响编辑器性能

## 数据库测试数据

为了测试完整流程，需要在数据库中准备：

1. **测试书籍**: 至少10本，包含标题、作者、封面、分类
2. **Banner数据**: 至少3-5个轮播图，关联到书籍
3. **榜单数据**: 各类榜单（实时/周/月/新人）至少各10本书
4. **章节数据**: 每本书至少5章节

可以使用后端的 `cmd/create_banners` 等工具创建测试数据。

## 完成情况

- ✅ Banner点击跳转
- ✅ 榜单页面（4个Tab）
- ✅ AI API接口
- ✅ AI组件（侧边栏、对话、工具）
- ⏳ EditorView集成（需要手动完成上述步骤）

## 后续优化建议

1. **AI响应流式输出**: 实现打字机效果
2. **历史记录持久化**: 保存到localStorage
3. **快捷指令**: 预设常用AI指令模板
4. **多模型切换**: 支持切换不同AI模型
5. **智能建议**: 根据上下文主动提供建议

---

**最后更新**: 2025-10-26
**状态**: AI组件开发完成，等待集成到EditorView


