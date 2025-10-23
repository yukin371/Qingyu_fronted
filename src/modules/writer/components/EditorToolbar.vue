<template>
  <div class="editor-toolbar" v-if="!isSimpleMode">
    <div class="toolbar-group">
      <el-tooltip content="标题 (Ctrl+H)">
        <el-button text @click="insertHeading">
          <el-icon><Discount /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="粗体 (Ctrl+B)">
        <el-button text @click="insertBold">
          <strong>B</strong>
        </el-button>
      </el-tooltip>

      <el-tooltip content="斜体 (Ctrl+I)">
        <el-button text @click="insertItalic">
          <em>I</em>
        </el-button>
      </el-tooltip>

      <el-tooltip content="删除线">
        <el-button text @click="insertStrikethrough">
          <s>S</s>
        </el-button>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip content="无序列表">
        <el-button text @click="insertList('unordered')">
          <el-icon><List /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="有序列表">
        <el-button text @click="insertList('ordered')">
          <el-icon><DocumentCopy /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="引用">
        <el-button text @click="insertQuote">
          <el-icon><ChatDotSquare /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip content="代码块">
        <el-button text @click="insertCodeBlock">
          <el-icon><Document /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="行内代码">
        <el-button text @click="insertInlineCode">
          <el-icon><Memo /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="分隔线">
        <el-button text @click="insertDivider">
          <el-icon><Minus /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip content="链接 (Ctrl+K)">
        <el-button text @click="insertLink">
          <el-icon><Link /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="图片">
        <el-button text @click="insertImage">
          <el-icon><Picture /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="表格">
        <el-button text @click="insertTable">
          <el-icon><Grid /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip :content="showPreview ? '隐藏预览' : '显示预览'">
        <el-button text @click="togglePreview">
          <el-icon><View /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Discount, List, DocumentCopy, ChatDotSquare, Document,
  Memo, Minus, Link, Picture, Grid, View
} from '@element-plus/icons-vue'

interface Props {
  isSimpleMode?: boolean
  showPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSimpleMode: false,
  showPreview: true
})

const emit = defineEmits<{
  insert: [text: string]
  togglePreview: []
}>()

// 插入标题
const insertHeading = () => {
  emit('insert', '## ')
}

// 插入粗体
const insertBold = () => {
  emit('insert', '**粗体文本**')
}

// 插入斜体
const insertItalic = () => {
  emit('insert', '*斜体文本*')
}

// 插入删除线
const insertStrikethrough = () => {
  emit('insert', '~~删除线文本~~')
}

// 插入列表
const insertList = (type: 'ordered' | 'unordered') => {
  if (type === 'ordered') {
    emit('insert', '1. 列表项\n2. 列表项\n3. 列表项')
  } else {
    emit('insert', '- 列表项\n- 列表项\n- 列表项')
  }
}

// 插入引用
const insertQuote = () => {
  emit('insert', '> 引用文本')
}

// 插入代码块
const insertCodeBlock = () => {
  emit('insert', '```javascript\n代码内容\n```')
}

// 插入行内代码
const insertInlineCode = () => {
  emit('insert', '`代码`')
}

// 插入分隔线
const insertDivider = () => {
  emit('insert', '\n---\n')
}

// 插入链接
const insertLink = () => {
  emit('insert', '[链接文本](https://example.com)')
}

// 插入图片
const insertImage = () => {
  emit('insert', '![图片描述](https://example.com/image.jpg)')
}

// 插入表格
const insertTable = () => {
  const table = `
| 列1 | 列2 | 列3 |
| --- | --- | --- |
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |
`.trim()
  emit('insert', table)
}

// 切换预览
const togglePreview = () => {
  emit('togglePreview')
}
</script>

<style scoped lang="scss">
.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  gap: 8px;
  flex-wrap: wrap;

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .el-button {
    padding: 6px 8px;
    font-size: 16px;

    strong, em, s {
      font-size: 14px;
      font-weight: 600;
    }

    &:hover {
      background-color: #e5e7eb;
    }
  }

  .el-divider {
    height: 20px;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .editor-toolbar {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
}
</style>

