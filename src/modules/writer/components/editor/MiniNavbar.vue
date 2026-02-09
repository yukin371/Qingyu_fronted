<template>
  <nav
    class="mini-navbar"
    role="navigation"
    aria-label="编辑器工具栏"
  >
    <button
      class="mini-navbar__back"
      aria-label="返回创作中心"
      title="返回创作中心"
      @click="goBackToCenter"
    >
      <QyIcon name="ArrowLeft" />
      <span>返回创作中心</span>
    </button>

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
import { useRouter } from 'vue-router'
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
  (e: 'update:modelValue', _value: string): void
  /** 工具切换事件 */
  (e: 'toolChange', _toolId: string): void
}

// Props定义
const props = withDefaults(defineProps<Props>(), {
  tools: undefined,
  modelValue: undefined
})

// Emits定义
const emit = defineEmits<Emits>()
const router = useRouter()

// ==================== 插槽类型定义 ====================
defineSlots<{
  default?: () => unknown
}>()

/**
 * 默认工具列表
 */
const defaultTools: EditorTool[] = [
  { id: 'outline', label: '大纲', icon: 'Menu', shortcut: 'Alt+1' },
  { id: 'writing', label: '写作', icon: 'Edit', shortcut: 'Alt+2' },
  { id: 'immersive', label: '沉浸模式', icon: 'FullScreen', shortcut: 'Alt+3' },
  { id: 'book', label: '章节', icon: 'Document', shortcut: 'Alt+4' },
  { id: 'settings', label: '设置', icon: 'Setting', shortcut: 'Alt+5' },
  { id: 'ai-assistant', label: 'AI辅助', icon: 'MagicStick', shortcut: 'Alt+6' },
  { id: 'materials', label: '创作推演', icon: 'DataAnalysis', shortcut: 'Alt+7' },
  { id: 'chat', label: '聊天', icon: 'ChatDotRound', shortcut: 'Alt+8' }
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

const goBackToCenter = () => {
  router.push('/writer/dashboard')
}
</script>

<style scoped lang="scss">
.mini-navbar {
  height: 52px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 10px;
  overflow-x: auto;
  scrollbar-width: thin;
  gap: 8px;
}

.mini-navbar__back {
  height: 34px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  border-radius: 10px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.16s ease;
}

.mini-navbar__back:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.mini-navbar__tools {
  display: flex;
  gap: 6px;
  min-width: max-content;
}

.mini-navbar__tool {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid #dbe3ef;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.16s ease;
  color: #475569;
  font-size: 12px;
  font-family: inherit;
  white-space: nowrap;
  line-height: 1;
}

.mini-navbar__tool:hover:not(.is-disabled) {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1e3a8a;
}

.mini-navbar__tool.is-active {
  border-color: #60a5fa;
  background: #e0ecff;
  color: #1d4ed8;
  box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.16);
}

.mini-navbar__tool:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

.mini-navbar__tool.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mini-navbar__tool.is-disabled:hover {
  background: #fff;
  color: #475569;
}

.mini-navbar__tool .tool-label {
  font-size: 12px;
  font-weight: 600;
}

.mini-navbar__tool .tool-shortcut {
  display: none;
}

@media (max-width: 768px) {
  .mini-navbar {
    padding: 0 8px;
    gap: 8px;
  }

  .mini-navbar__back {
    height: 30px;
    padding: 0 8px;
    border-radius: 8px;
    font-size: 12px;
  }

  .mini-navbar__tool {
    padding: 6px 8px;
    gap: 4px;
    border-radius: 8px;
  }

  .mini-navbar__tool .tool-label {
    display: none;
  }

  .mini-navbar__tool .tool-shortcut {
    display: none;
  }
}
</style>
