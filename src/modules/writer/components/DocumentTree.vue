<template>
  <div class="document-tree-container">
    <!-- 顶部工具栏：标题 + 搜索 + 添加 -->
    <div class="tree-toolbar">
      <div class="header-row">
        <span class="title">目录</span>
        <div class="actions">
          <el-tooltip content="展开/折叠全部">
            <el-button link size="small" @click="toggleExpand">
              <el-icon>
                <Sort />
              </el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="新建文档">
            <el-button link type="primary" size="small" @click="emit('add')">
              <el-icon>
                <Plus />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="search-row">
        <el-input v-model="filterText" placeholder="搜索文档..." prefix-icon="Search" size="small" clearable />
      </div>
    </div>

    <!-- 树形控件 -->
    <div class="tree-content" @click.right.prevent>
      <el-tree ref="treeRef" :data="treeData" node-key="id" :props="treeProps" :highlight-current="true"
        :expand-on-click-node="false" :default-expanded-keys="defaultExpandedKeys" :filter-node-method="filterNode"
        :allow-drop="allowDrop" :allow-drag="allowDrag" draggable empty-text="暂无文档，点击右上角新建"
        @node-click="handleNodeClick" @node-drop="handleNodeDrop" @node-contextmenu="handleContextMenu">
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <!-- 图标区分：卷用文件夹，章用文档 -->
            <el-icon class="node-icon" :class="data.type">
              <Folder v-if="data.type === 'volume'" />
              <DocumentIcon v-else />
            </el-icon>

            <span class="node-title" :title="data.title">
              {{ data.title }}
              <span v-if="isModified(data)" class="dirty-dot">*</span>
            </span>

            <!-- 右侧信息：字数或状态 -->
            <span class="node-meta" v-if="data.wordCount">
              {{ formatCount(data.wordCount) }}
            </span>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 自定义右键菜单 (Teleport 到 body 防止被遮挡) -->
    <teleport to="body">
      <div v-show="contextMenu.visible" class="custom-context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" @click.stop>
        <div class="menu-item" @click="handleMenuAction('add')">
          <el-icon>
            <Plus />
          </el-icon> 新建子文档
        </div>
        <div class="menu-item" @click="handleMenuAction('rename')">
          <el-icon>
            <Edit />
          </el-icon> 重命名
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item danger" @click="handleMenuAction('delete')">
          <el-icon>
            <Delete />
          </el-icon> 删除
        </div>
      </div>
    </teleport>

    <!-- 用于点击外部关闭右键菜单的透明遮罩 -->
    <div v-if="contextMenu.visible" class="context-menu-mask" @click="closeContextMenu"
      @contextmenu.prevent="closeContextMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, nextTick } from 'vue'
import { ElTree } from 'element-plus'
import {
  Plus, Document as DocumentIcon, Edit, Delete,
  Folder, Search, Sort
} from '@element-plus/icons-vue'
import type { Document, DocumentType } from '@/modules/writer/types/document'

// 使用标准的 Document 类型
interface Props {
  treeData: Document[]
  currentDocumentId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [doc: Document]
  drop: [dragId: string, dropId: string, type: 'inner' | 'before' | 'after']
  add: [parent?: Document]
  rename: [doc: Document]
  delete: [doc: Document]
}>()

// 树引用
const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')

// 树配置
const treeProps = {
  children: 'children',
  label: 'title'
}

// 默认展开
const defaultExpandedKeys = ref<string[]>([])

// 监听搜索
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

// 过滤节点逻辑
const filterNode = (value: string, data: any): data is Document => {
  if (!value) return true
  return 'title' in data &&
    typeof data.title === 'string' &&
    data.title.toLowerCase().includes(value.toLowerCase())
}

// =======================
// 拖拽逻辑控制
// =======================

// 允许拖拽：所有节点都可拖拽
const allowDrag = (node: any) => true

// 允许放置：
// 1. 'inner': 只能放入 'volume' (卷/文件夹) 类型，不能放入 'chapter' (章)
// 2. 'prev'/'next': 同级排序始终允许
const allowDrop = (draggingNode: any, dropNode: any, type: string) => {
  const dropData = dropNode.data as Document
  if (type === 'inner') {
    return dropData.type === 'volume'
  }
  return true
}

// =======================
// 事件处理
// =======================

const handleNodeClick = (data: Document) => {
  emit('select', data)
}

const handleNodeDrop = (dragNode: any, dropNode: any, type: any) => {
  emit('drop', dragNode.data.id, dropNode.data.id, type)
}

// =======================
// 右键菜单逻辑
// =======================

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  target: null as Document | null
})

const handleContextMenu = (event: MouseEvent, data: Document) => {
  contextMenu.visible = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.target = data
}

const closeContextMenu = () => {
  contextMenu.visible = false
}

const handleMenuAction = (action: 'add' | 'rename' | 'delete') => {
  if (!contextMenu.target) return
  if (action === 'add') {
    emit('add', contextMenu.target)
  } else if (action === 'rename') {
    emit('rename', contextMenu.target)
  } else if (action === 'delete') {
    emit('delete', contextMenu.target)
  }
  closeContextMenu()
}

// =======================
// 辅助功能
// =======================

// 展开/折叠全部
const toggleExpand = () => {
  const nodes = treeRef.value?.store.nodesMap
  if (!nodes) return

  // 取当前第一个节点的状态来反转
  const firstKey = Object.keys(nodes)[0]
  const isExpanded = nodes[firstKey]?.expanded

  for (const key in nodes) {
    nodes[key].expanded = !isExpanded
  }
}

// 判断是否有未保存修改 (需配合 Store 状态，这里仅作演示)
const isModified = (data: Document) => {
  // return data.id === currentEditingId && isDirty
  return false
}

const formatCount = (count: number) => {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  return count > 0 ? count : ''
}
</script>

<style scoped lang="scss">
.document-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);

  .tree-toolbar {
    padding: 12px 12px 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .title {
        font-weight: 600;
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
    }
  }

  .tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    // 隐藏横向滚动条
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;
    }
  }
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding-right: 8px;
  overflow: hidden;

  .node-icon {
    margin-right: 6px;
    font-size: 16px;

    &.volume {
      color: #e6a23c; // 文件夹颜色
    }

    &.chapter,
    &.scene {
      color: var(--el-text-color-secondary);
    }
  }

  .node-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-regular);

    .dirty-dot {
      color: var(--el-color-danger);
      font-weight: bold;
      margin-left: 2px;
    }
  }

  .node-meta {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    margin-left: 8px;
  }
}

// 覆盖 Element Tree 样式
:deep(.el-tree-node__content) {
  height: 32px;
  border-radius: 4px;
  margin: 0 4px;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

:deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);

  .node-title {
    color: var(--el-color-primary);
    font-weight: 500;
  }

  .node-icon {
    color: var(--el-color-primary);
  }
}
</style>

<!-- 全局样式：右键菜单 -->
<style lang="scss">
.custom-context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 140px;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: background 0.2s;
    gap: 8px;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &.danger {
      color: var(--el-color-danger);

      &:hover {
        background: var(--el-color-danger-light-9);
      }
    }
  }

  .menu-divider {
    height: 1px;
    background: var(--el-border-color-lighter);
    margin: 4px 0;
  }
}

.context-menu-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9998;
  background: transparent;
}
</style>
