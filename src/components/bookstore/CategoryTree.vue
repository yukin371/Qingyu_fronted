<template>
    <div class="category-tree">
        <el-tree ref="treeRef" :data="treeData" :props="treeProps" :current-node-key="currentCategoryId"
            :default-expanded-keys="defaultExpandedKeys" :highlight-current="true" :expand-on-click-node="false"
            node-key="id" class="category-tree-component" @node-click="handleNodeClick">
            <template #default="{ node, data }">
                <div class="custom-tree-node">
                    <span class="node-label">
                        <el-icon v-if="data.icon" class="node-icon">
                            <component :is="data.icon" />
                        </el-icon>
                        {{ node.label }}
                    </span>
                    <span v-if="showCount && data.count !== undefined" class="node-count">
                        {{ formatCount(data.count) }}
                    </span>
                </div>
            </template>
        </el-tree>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ElTree } from 'element-plus'
import type { Category } from '@/types/models'

interface Props {
    categories: Category[]
    currentCategoryId?: string
    showCount?: boolean // 是否显示分类书籍数量
    defaultExpanded?: boolean // 是否默认展开
}

interface Emits {
    (e: 'category-change', category: Category): void
}

const props = withDefaults(defineProps<Props>(), {
    categories: () => [],
    currentCategoryId: '',
    showCount: true,
    defaultExpanded: false
})

const emit = defineEmits<Emits>()

const treeRef = ref<InstanceType<typeof ElTree>>()

// 树配置
const treeProps = {
    label: 'name',
    children: 'children'
}

// 树数据(转换为树形结构)
const treeData = computed(() => {
    return buildTree(props.categories)
})

// 默认展开的节点
const defaultExpandedKeys = computed(() => {
    if (!props.defaultExpanded) return []
    return treeData.value.map(item => item.id)
})

// 构建树形结构
function buildTree(categories: Category[]): Category[] {
    const map = new Map<string, Category>()
    const roots: Category[] = []

    // 先将所有分类放入map
    categories.forEach(cat => {
        map.set(cat.id, { ...cat, children: [] })
    })

    // 构建树形结构
    categories.forEach(cat => {
        const node = map.get(cat.id)!
        if (cat.parentId && map.has(cat.parentId)) {
            const parent = map.get(cat.parentId)!
            if (!parent.children) {
                parent.children = []
            }
            parent.children.push(node)
        } else {
            roots.push(node)
        }
    })

    return roots
}

// 格式化数量
function formatCount(count: number): string {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万'
    }
    return count.toString()
}

// 节点点击
function handleNodeClick(data: Category) {
    emit('category-change', data)
}

// 监听当前分类变化
watch(
    () => props.currentCategoryId,
    (newId) => {
        if (newId && treeRef.value) {
            treeRef.value.setCurrentKey(newId)
        }
    }
)

// 暴露方法
defineExpose({
    setCurrentKey: (key: string) => {
        treeRef.value?.setCurrentKey(key)
    },
    getCurrentKey: () => {
        return treeRef.value?.getCurrentKey()
    }
})
</script>

<style scoped lang="scss">
.category-tree {
    .category-tree-component {
        background-color: transparent;

        :deep(.el-tree-node__content) {
            height: 40px;
            border-radius: 4px;
            margin: 2px 0;

            &:hover {
                background-color: #f5f7fa;
            }
        }

        :deep(.el-tree-node.is-current > .el-tree-node__content) {
            background-color: #ecf5ff;
            color: #409eff;
            font-weight: 500;
        }
    }

    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;

        .node-label {
            display: flex;
            align-items: center;
            gap: 6px;

            .node-icon {
                font-size: 16px;
            }
        }

        .node-count {
            font-size: 12px;
            color: #909399;
            padding: 2px 8px;
            background-color: #f0f2f5;
            border-radius: 10px;
        }
    }
}
</style>
