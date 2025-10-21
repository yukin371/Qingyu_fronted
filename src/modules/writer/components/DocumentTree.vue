<template>
    <div class="document-tree">
        <div class="tree-header">
            <h3>文档结构</h3>
            <el-button size="small" @click="$emit('add')">
                <el-icon>
                    <Plus />
                </el-icon>
                新建
            </el-button>
        </div>

        <el-tree :data="treeData" node-key="documentId" :props="treeProps" :highlight-current="true"
            :expand-on-click-node="false" :default-expanded-keys="expandedKeys" draggable @node-click="handleNodeClick"
            @node-drop="handleNodeDrop" @node-contextmenu="handleContextMenu">
            <template #default="{ node, data }">
                <div class="tree-node">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span class="node-title">{{ data.title }}</span>
                    <span class="node-count" v-if="data.wordCount">{{ formatWordCount(data.wordCount) }}</span>
                </div>
            </template>
        </el-tree>

        <!-- 右键菜单 -->
        <el-dropdown trigger="contextmenu" @command="handleCommand" v-if="contextMenuVisible"
            :style="{ position: 'absolute', top: contextMenuY + 'px', left: contextMenuX + 'px' }">
            <span></span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="add">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        新建子文档
                    </el-dropdown-item>
                    <el-dropdown-item command="rename">
                        <el-icon>
                            <Edit />
                        </el-icon>
                        重命名
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                        <el-icon>
                            <Delete />
                        </el-icon>
                        删除
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Document, Edit, Delete } from '@element-plus/icons-vue'
import type { DocumentTreeNode } from '../api'

interface Props {
    treeData: DocumentTreeNode[]
    currentDocumentId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    nodeClick: [node: DocumentTreeNode]
    nodeDrop: [dragNode: DocumentTreeNode, dropNode: DocumentTreeNode, type: string]
    add: [parentNode?: DocumentTreeNode]
    rename: [node: DocumentTreeNode]
    delete: [node: DocumentTreeNode]
}>()

const treeProps = {
    children: 'children',
    label: 'title'
}

const expandedKeys = computed(() => {
    // 默认展开所有节点
    const keys: string[] = []
    function collectKeys(nodes: DocumentTreeNode[]) {
        nodes.forEach(node => {
            keys.push(node.documentId)
            if (node.children && node.children.length > 0) {
                collectKeys(node.children)
            }
        })
    }
    collectKeys(props.treeData)
    return keys
})

const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuNode = ref<DocumentTreeNode | null>(null)

function handleNodeClick(data: DocumentTreeNode): void {
    emit('nodeClick', data)
}

function handleNodeDrop(
    dragNode: any,
    dropNode: any,
    type: 'before' | 'after' | 'inner'
): void {
    emit('nodeDrop', dragNode.data, dropNode.data, type)
}

function handleContextMenu(event: MouseEvent, data: DocumentTreeNode): void {
    event.preventDefault()
    contextMenuVisible.value = true
    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
    contextMenuNode.value = data
}

function handleCommand(command: string): void {
    if (!contextMenuNode.value) return

    switch (command) {
        case 'add':
            emit('add', contextMenuNode.value)
            break
        case 'rename':
            emit('rename', contextMenuNode.value)
            break
        case 'delete':
            emit('delete', contextMenuNode.value)
            break
    }

    contextMenuVisible.value = false
    contextMenuNode.value = null
}

function formatWordCount(count: number): string {
    if (count >= 10000) {
        return `${(count / 10000).toFixed(1)}万字`
    }
    return `${count}字`
}
</script>

<style scoped lang="scss">
.document-tree {
    height: 100%;
    display: flex;
    flex-direction: column;

    .tree-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-bottom: 1px solid #ebeef5;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            color: #303133;
        }
    }

    .el-tree {
        flex: 1;
        overflow-y: auto;
        padding: 8px;

        .tree-node {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            padding-right: 8px;

            .el-icon {
                color: #409EFF;
            }

            .node-title {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .node-count {
                font-size: 12px;
                color: #909399;
            }
        }
    }
}
</style>
