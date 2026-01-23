<script setup lang="tsx">
/**
 * Tree 组件
 *
 * 树形控件组件，支持展开/收起、勾选、高亮等功能
 */

import { computed, provide, ref, useSlots, watch } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import Icon from '../Icon/Icon.vue'
import type { TreeNode, TreeEmits, TreeProps, TreeNodeState, TreeInstance } from './types'

// Tree 上下文 Key
const TREE_CONTEXT_KEY = Symbol('treeContext')

// 使用 CVA 定义树节点变体
const treeNodeVariants = cva(
  // 基础样式
  'select-none transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<TreeProps>(), {
  checkable: false,
  defaultExpandAll: false,
  highlightCurrent: false,
  expandOnClickNode: false,
  size: 'md',
  defaultCheckedKeys: () => [],
  defaultExpandedKeys: () => [],
})

// 组件 Emits
const emit = defineEmits<TreeEmits>()

// 插槽
const slots = useSlots()

// 当前节点
const currentNode = ref<TreeNodeState | null>(null)

// 展开的节点 keys
const expandedKeys = ref<Set<string | number>>(new Set(props.defaultExpandedKeys || []))

// 选中的节点 keys
const checkedKeys = ref<Set<string | number>>(new Set(props.defaultCheckedKeys || []))

// 半选状态的节点 keys
const indeterminateKeys = ref<Set<string | number>>(new Set())

// 扁平化的所有节点状态
const nodeStates = ref<TreeNodeState[]>([])

// 初始化节点状态
const initializeNodeStates = (nodes: TreeNode[], level: number = 0, parent: TreeNodeState | null = null): TreeNodeState[] => {
  const states: TreeNodeState[] = []
  
  nodes.forEach((node) => {
    const nodeId = node.id || node.label
    const isExpanded = props.defaultExpandAll || (node.defaultExpand && !props.defaultExpandAll)
    
    // 如果有默认展开的 keys，使用默认值
    if (!props.defaultExpandAll && props.defaultExpandedKeys?.includes(nodeId)) {
      expandedKeys.value.add(nodeId)
    } else if (isExpanded) {
      expandedKeys.value.add(nodeId)
    }
    
    // 初始化选中状态
    if (props.defaultCheckedKeys?.includes(nodeId)) {
      checkedKeys.value.add(nodeId)
    }
    
    const nodeState: TreeNodeState = {
      node,
      expanded: ref(expandedKeys.value.has(nodeId)),
      checked: ref(checkedKeys.value.has(nodeId)),
      indeterminate: ref(false),
      level,
      parent,
      children: [],
    }
    
    states.push(nodeState)
    
    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      nodeState.children = initializeNodeStates(node.children, level + 1, nodeState)
    }
  })
  
  return states
}

// 初始化
nodeStates.value = initializeNodeStates(props.data)

// 计算样式类名
const treeClasses = computed(() =>
  cn(
    'tree',
    props.class
  )
)

// 节点样式类名
const getNodeClasses = computed(() => (nodeState: TreeNodeState) => {
  const isCurrent = props.highlightCurrent && currentNode.value === nodeState
  return cn(
    treeNodeVariants({ size: props.size }),
    'tree-node flex items-center py-1 px-2 rounded-md cursor-pointer',
    'hover:bg-slate-100 dark:hover:bg-slate-800',
    {
      'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': isCurrent,
      'opacity-50 cursor-not-allowed pointer-events-none': nodeState.node.disabled,
    }
  )
})

// 节点内容样式类名
const getNodeContentClasses = computed(() => (nodeState: TreeNodeState) => {
  const sizeClasses = {
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-2.5',
  }
  return cn('flex items-center flex-1 min-w-0', sizeClasses[props.size])
})

// 切换展开状态
const toggleExpand = (nodeState: TreeNodeState) => {
  if (nodeState.node.disabled) return
  
  const nodeId = nodeState.node.id || nodeState.node.label
  const newExpanded = !nodeState.expanded.value
  nodeState.expanded.value = newExpanded
  
  if (newExpanded) {
    expandedKeys.value.add(nodeId)
  } else {
    expandedKeys.value.delete(nodeId)
  }
  
  emit('nodeExpand', nodeState.node, newExpanded, nodeState)
  emit('update:expandedKeys', Array.from(expandedKeys.value))
}

// 切换选中状态
const toggleCheck = (nodeState: TreeNodeState) => {
  if (nodeState.node.disabled || !props.checkable) return
  
  const nodeId = nodeState.node.id || nodeState.node.label
  const newChecked = !nodeState.checked.value
  
  // 更新自身及所有子节点
  updateNodeCheckState(nodeState, newChecked)
  
  // 更新父节点状态
  updateParentCheckState(nodeState)
  
  emit('checkChange', nodeState.node, newChecked, nodeState)
  emit('update:checkedKeys', Array.from(checkedKeys.value))
}

// 更新节点及其子节点的选中状态
const updateNodeCheckState = (nodeState: TreeNodeState, checked: boolean) => {
  const nodeId = nodeState.node.id || nodeState.node.label
  nodeState.checked.value = checked
  nodeState.indeterminate.value = false
  
  if (checked) {
    checkedKeys.value.add(nodeId)
  } else {
    checkedKeys.value.delete(nodeId)
  }
  
  // 递归更新子节点
  nodeState.children.forEach((child) => {
    updateNodeCheckState(child, checked)
  })
}

// 更新父节点的选中状态
const updateParentCheckState = (nodeState: TreeNodeState) => {
  if (!nodeState.parent) return
  
  const allChildrenChecked = nodeState.parent.children.every((child) => child.checked.value)
  const someChildrenChecked = nodeState.parent.children.some((child) => child.checked.value || child.indeterminate.value)
  
  const parentId = nodeState.parent.node.id || nodeState.parent.node.label
  
  if (allChildrenChecked) {
    nodeState.parent.checked.value = true
    nodeState.parent.indeterminate.value = false
    checkedKeys.value.add(parentId)
    indeterminateKeys.value.delete(parentId)
  } else if (someChildrenChecked) {
    nodeState.parent.checked.value = false
    nodeState.parent.indeterminate.value = true
    checkedKeys.value.delete(parentId)
    indeterminateKeys.value.add(parentId)
  } else {
    nodeState.parent.checked.value = false
    nodeState.parent.indeterminate.value = false
    checkedKeys.value.delete(parentId)
    indeterminateKeys.value.delete(parentId)
  }
  
  // 递归更新上级父节点
  updateParentCheckState(nodeState.parent)
}

// 节点点击
const handleNodeClick = (nodeState: TreeNodeState, event: MouseEvent) => {
  if (nodeState.node.disabled) return
  
  currentNode.value = nodeState
  emit('nodeClick', nodeState.node, nodeState)
  
  if (props.expandOnClickNode) {
    toggleExpand(nodeState)
  }
}

// 展开/收起图标点击
const handleExpandClick = (nodeState: TreeNodeState, event: MouseEvent) => {
  event.stopPropagation()
  toggleExpand(nodeState)
}

// 复选框点击
const handleCheckClick = (nodeState: TreeNodeState, event: MouseEvent) => {
  event.stopPropagation()
  toggleCheck(nodeState)
}

// 渲染节点
const renderNode = (nodeState: TreeNodeState) => {
  const hasChildren = nodeState.node.children && nodeState.node.children.length > 0
  const indent = nodeState.level * 16
  
  return (
    <div class="tree-node-wrapper" key={nodeState.node.id || nodeState.node.label}>
      {/* 节点内容 */}
      <div
        class={getNodeClasses.value(nodeState)}
        style={{ paddingLeft: `${indent}px` }}
        onClick={(e) => handleNodeClick(nodeState, e)}
      >
        {/* 展开/收起图标 */}
        <span
          class={[
            'expand-icon flex-shrink-0 cursor-pointer transition-transform duration-200',
            nodeState.expanded.value && 'rotate-90',
          ].join(' ')}
          onClick={(e) => handleExpandClick(nodeState, e)}
        >
          {hasChildren && (
            <Icon name="chevron-right" size="sm" class="text-slate-400" />
          )}
          {!hasChildren && <span class="w-4 inline-block" />}
        </span>
        
        {/* 复选框 */}
        {props.checkable && (
          <span
            class={['checkbox-wrapper flex-shrink-0 cursor-pointer', nodeState.node.disabled && 'opacity-50'].join(' ')}
            onClick={(e) => handleCheckClick(nodeState, e)}
          >
            <span
              class={[
                'checkbox',
                'relative flex-shrink-0 rounded border-2 transition-all duration-200',
                'w-4 h-4 flex items-center justify-center',
                nodeState.checked.value
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700',
                nodeState.indeterminate.value && 'bg-primary-500 border-primary-500',
              ].join(' ')}
            >
              {nodeState.checked.value && (
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {nodeState.indeterminate.value && !nodeState.checked.value && (
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
          </span>
        )}
        
        {/* 节点内容 */}
        <div class={getNodeContentClasses.value(nodeState)}>
          {/* 自定义插槽内容 */}
          {slots.default ? (
            slots.default({ node: nodeState.node, data: nodeState.node })
          ) : (
            <span class="node-label truncate">{nodeState.node.label}</span>
          )}
        </div>
      </div>
      
      {/* 子节点 */}
      {hasChildren && nodeState.expanded.value && (
        <div class="tree-children">
          {nodeState.children.map((child) => renderNode(child))}
        </div>
      )}
    </div>
  )
}

// 组件实例方法
const getCheckedNodes = (): TreeNode[] => {
  return nodeStates.value
    .filter((ns) => ns.checked.value)
    .map((ns) => ns.node)
}

const getCheckedKeys = (): Array<string | number> => {
  return Array.from(checkedKeys.value)
}

const setCheckedKeys = (keys: Array<string | number>) => {
  const newSet = new Set(keys)
  
  nodeStates.value.forEach((nodeState) => {
    const nodeId = nodeState.node.id || nodeState.node.label
    const checked = newSet.has(nodeId)
    updateNodeCheckState(nodeState, checked)
    
    // 更新父节点
    updateParentCheckState(nodeState)
  })
  
  emit('update:checkedKeys', keys)
}

const getExpandedKeys = (): Array<string | number> => {
  return Array.from(expandedKeys.value)
}

const setExpandedKeys = (keys: Array<string | number>) => {
  const newSet = new Set(keys)
  
  nodeStates.value.forEach((nodeState) => {
    const nodeId = nodeState.node.id || nodeState.node.label
    nodeState.expanded.value = newSet.has(nodeId)
    
    if (newSet.has(nodeId)) {
      expandedKeys.value.add(nodeId)
    } else {
      expandedKeys.value.delete(nodeId)
    }
  })
  
  emit('update:expandedKeys', keys)
}

// 暴露实例方法
defineExpose<TreeInstance>({
  getCheckedNodes,
  getCheckedKeys,
  setCheckedKeys,
  getExpandedKeys,
  setExpandedKeys,
})

// 提供上下文
provide(TREE_CONTEXT_KEY, {
  props,
  currentNode,
  expandedKeys,
  checkedKeys,
  indeterminateKeys,
  toggleExpand,
  toggleCheck,
})

// 监听数据变化
watch(() => props.data, () => {
  nodeStates.value = initializeNodeStates(props.data)
}, { deep: true })
</script>

<template>
  <div :class="treeClasses">
    {nodeStates.map((nodeState) => renderNode(nodeState))}
  </div>
</template>
