<template>
  <nav
    class="mini-navbar"
    role="navigation"
    aria-label="编辑器工具栏"
  >
    <div class="mini-navbar__tools" role="tablist" aria-label="工具列表">
      <button
        v-for="tool in tools"
        :key="tool.id"
        :ref="el => setToolRef(el, tool.id)"
        class="mini-navbar__tool"
        :class="{
          'is-active': activeTool === tool.id,
          'is-disabled': tool.disabled
        }"
        :aria-selected="activeTool === tool.id"
        :aria-label="tool.label"
        :title="`${tool.label} (${tool.shortcut})`"
        :disabled="tool.disabled"
        role="tab"
        :tabindex="activeTool === tool.id ? 0 : -1"
        @click="handleToolClick(tool.id)"
        @keydown="handleKeyDown($event, tool.id)"
      >
        <QyIcon :name="tool.icon" />
        <span class="tool-label">{{ tool.label }}</span>
        <span class="tool-shortcut">{{ tool.shortcut }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
/**
 * MiniNavbar 编辑器工具栏导航组件
 *
 * 提供编辑器工具切换功能：
 * - 工具按钮显示和切换
 * - 激活状态高亮
 * - v-model双向绑定
 * - ARIA无障碍支持
 * - 键盘导航
 *
 * @features
 * - 工具切换（大纲、搜索、替换、AI助手、设置）
 * - 激活状态高亮
 * - ARIA无障碍支持
 * - 键盘导航（Tab、方向键、Enter/Space、Home/End）
 *
 * @example
 * ```vue
 * <MiniNavbar v-model="activeTool" @tool-change="handleToolChange" />
 * ```
 */

import { computed, watch } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'

/**
 * 编辑器工具接口
 */
interface EditorTool {
  /** 工具唯一标识 */
  id: string
  /** 工具显示标签 */
  label: string
  /** 工具图标名称（QyIcon组件的name属性） */
  icon: string
  /** 快捷键提示文本 */
  shortcut: string
  /** 是否禁用该工具 */
  disabled?: boolean
}

/**
 * 组件Props
 */
interface Props {
  /** 自定义工具列表（可选，默认使用内置工具列表） */
  tools?: EditorTool[]
  /** 当前激活的工具ID（v-model绑定） */
  modelValue?: string
}

/**
 * 组件Emits
 */
interface Emits {
  /** 更新激活工具（v-model） */
  (e: 'update:modelValue', value: string): void
  /** 工具切换事件 */
  (e: 'toolChange', toolId: string): void
}

// Props定义
const props = withDefaults(defineProps<Props>(), {
  tools: undefined,
  modelValue: undefined
})

// Emits定义
const emit = defineEmits<Emits>()

// ==================== 插槽类型定义 ====================
defineSlots<{
  default?: () => unknown
}>()

/**
 * 默认工具列表
 */
const defaultTools: EditorTool[] = [
  { id: 'outline', label: '大纲', icon: 'Menu', shortcut: 'Ctrl+Shift+O' },
  { id: 'search', label: '搜索', icon: 'Search', shortcut: 'Ctrl+Shift+F' },
  { id: 'replace', label: '替换', icon: 'Refresh', shortcut: 'Ctrl+H' },
  { id: 'ai-assistant', label: 'AI助手', icon: 'MagicStick', shortcut: 'Ctrl+Shift+A' },
  { id: 'settings', label: '设置', icon: 'Setting', shortcut: 'Ctrl+,' }
]

/**
 * 当前使用的工具列表
 */
const tools = computed(() => props.tools || defaultTools)

/**
 * 当前激活的工具ID
 */
const activeTool = computed(() => props.modelValue)

/**
 * 工具按钮DOM引用映射
 * 用于键盘导航时的焦点管理
 */
const toolRefsMap = new Map<string, HTMLElement>()

/**
 * 设置工具按钮引用
 * @param el DOM元素
 * @param toolId 工具ID
 */
const setToolRef = (el: unknown, toolId: string) => {
  if (el) {
    toolRefsMap.set(toolId, el as HTMLElement)
  }
}

/**
 * 获取工具按钮引用
 * @param toolId 工具ID
 * @returns DOM元素或undefined
 */
const getToolRef = (toolId: string): HTMLElement | undefined => {
  return toolRefsMap.get(toolId)
}

/**
 * 处理工具按钮点击
 * @param toolId 工具ID
 */
const handleToolClick = (toolId: string) => {
  const tool = tools.value.find(t => t.id === toolId)
  if (tool?.disabled) return

  emit('update:modelValue', toolId)
  emit('toolChange', toolId)
}

/**
 * 获取工具在列表中的索引
 * @param toolId 工具ID
 * @returns 索引位置
 */
const getToolIndex = (toolId: string): number => {
  return tools.value.findIndex(t => t.id === toolId)
}

/**
 * 焦点到指定索引的工具按钮
 * @param index 索引位置
 */
const focusTool = (index: number) => {
  const tool = tools.value[index]
  if (tool) {
    const ref = getToolRef(tool.id)
    ref?.focus()
  }
}

/**
 * 处理键盘事件
 * 支持以下键盘操作：
 * - Enter/Space: 激活工具
 * - ArrowRight/ArrowDown: 移动到下一个工具
 * - ArrowLeft/ArrowUp: 移动到上一个工具
 * - Home: 移动到第一个工具
 * - End: 移动到最后一个工具
 *
 * @param event 键盘事件
 * @param toolId 当前工具ID
 */
const handleKeyDown = (event: KeyboardEvent, toolId: string) => {
  const currentIndex = getToolIndex(toolId)
  const toolCount = tools.value.length

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      handleToolClick(toolId)
      break

    case 'ArrowRight':
    case 'ArrowDown': {
      event.preventDefault()
      const nextIndex = (currentIndex + 1) % toolCount
      focusTool(nextIndex)
      break
    }

    case 'ArrowLeft':
    case 'ArrowUp': {
      event.preventDefault()
      const prevIndex = (currentIndex - 1 + toolCount) % toolCount
      focusTool(prevIndex)
      break
    }

    case 'Home':
      event.preventDefault()
      focusTool(0)
      break

    case 'End':
      event.preventDefault()
      focusTool(toolCount - 1)
      break
  }
}

// 监听modelValue变化，确保激活工具可获得焦点
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const ref = getToolRef(newValue)
    ref?.focus()
  }
})
</script>

<style scoped lang="scss">
.mini-navbar {
  height: var(--navbar-height);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 16px;

  &__tools {
    display: flex;
    gap: 4px;
  }

  &__tool {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    background: transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--color-text-secondary);
    font-size: 13px;
    font-family: inherit;
    white-space: nowrap;

    &:hover:not(.is-disabled) {
      background: var(--color-hover);
      color: var(--color-text-primary);
    }

    &.is-active {
      background: var(--color-selected);
      color: var(--color-accent-blue);
      border-bottom: 2px solid var(--color-accent-blue);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;

      &:hover {
        background: transparent;
        color: var(--color-text-secondary);
      }
    }

    .tool-label {
      font-size: 13px;
      font-weight: 500;
    }

    .tool-shortcut {
      font-size: 11px;
      opacity: 0.6;
      margin-left: auto;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .mini-navbar {
    padding: 0 8px;

    &__tool {
      padding: 6px 8px;
      gap: 4px;

      .tool-label {
        display: none; // 移动端隐藏标签，只显示图标
      }

      .tool-shortcut {
        display: none; // 移动端隐藏快捷键
      }
    }
  }
}
</style>
