<template>
  <div
    class="resizable-panel"
    :class="[
      'resizable-panel--' + position,
      isCollapsed ? 'resizable-panel--collapsed' : '',
      isDragging ? 'resizable-panel--dragging' : ''
    ]"
    :style="panelStyle"
    :data-testid="`resizable-panel-${panelId}`"
  >
    <!-- 折叠按钮（仅collapsible为true时显示） -->
    <button
      v-if="collapsible"
      class="panel-collapse-button"
      :class="{ 'panel-collapse-button--collapsed': isCollapsed }"
      :aria-label="isCollapsed ? `展开${panelId}面板` : `折叠${panelId}面板`"
      @click="handleCollapseClick"
    >
      <QyIcon :name="collapseIcon" />
    </button>

    <!-- 面板内容插槽 -->
    <div class="panel-content" :class="{ 'panel-content--collapsed': isCollapsed }">
      <slot />
    </div>

    <!-- 拖拽手柄 -->
    <DragHandle
      :position="position"
      @drag-start="handleDragStart"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * ResizablePanel 可调整大小面板组件
 *
 * 提供可拖拽调整大小的面板功能：
 * - 集成DragHandle组件
 * - 使用usePanelResize组合式函数
 * - 支持左右面板
 * - 宽度约束（200-600px，可自定义）
 * - collapsible功能支持
 * - panelStore集成
 * - localStorage持久化
 *
 * @features
 * - 拖拽调整宽度
 * - 折叠/展开功能
 * - 宽度约束
 * - 响应式样式
 * - 无障碍支持
 */

import { computed, watch } from 'vue'
import { usePanelResize, type DragStartEvent } from '@/modules/writer/composables/usePanelResize'
import DragHandle from '@/modules/writer/components/DragHandle.vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'

// ============================================
// Props 定义
// ============================================

interface Props {
  /** 面板ID */
  panelId: 'left' | 'right'
  /** 默认宽度 */
  defaultWidth: number
  /** 最小宽度（默认200px） */
  minWidth?: number
  /** 最大宽度（默认600px） */
  maxWidth?: number
  /** 手柄位置 */
  position: 'left' | 'right'
  /** 是否可折叠 */
  collapsible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  minWidth: 200,
  maxWidth: 600,
  collapsible: false
})

// ============================================
// usePanelResize 集成
// ============================================

const {
  currentWidth,
  isDragging,
  isCollapsed,
  startDrag,
  onDrag,
  stopDrag,
  toggleCollapse
} = usePanelResize({
  panelId: props.panelId,
  defaultWidth: props.defaultWidth,
  minWidth: props.minWidth,
  maxWidth: props.maxWidth,
  collapsible: props.collapsible
})

// ============================================
// 计算属性
// ============================================

/**
 * 面板样式
 */
const panelStyle = computed(() => {
  const width = currentWidth.value
  return {
    width: `${width}px`,
    minWidth: `${props.minWidth}px`,
    maxWidth: `${props.maxWidth}px`
  }
})

/**
 * 折叠按钮图标
 */
const collapseIcon = computed(() => {
  if (props.position === 'right') {
    return isCollapsed.value ? 'ChevronLeft' : 'ChevronRight'
  }
  // 左侧面板
  return isCollapsed.value ? 'ChevronRight' : 'ChevronLeft'
})

// ============================================
// 事件处理
// ============================================

/**
 * 处理DragHandle的drag-start事件
 */
const handleDragStart = (event: DragStartEvent) => {
  // 更新事件中的position为当前面板的position
  const updatedEvent: DragStartEvent = {
    ...event,
    position: props.position
  }
  startDrag(updatedEvent)

  // 添加全局鼠标事件监听器
  document.addEventListener('mousemove', handleGlobalMouseMove)
  document.addEventListener('mouseup', handleGlobalMouseUp)
}

/**
 * 处理全局鼠标移动事件
 */
const handleGlobalMouseMove = (event: MouseEvent) => {
  onDrag(event)
}

/**
 * 处理全局鼠标松开事件
 */
const handleGlobalMouseUp = () => {
  stopDrag()

  // 移除全局事件监听器
  document.removeEventListener('mousemove', handleGlobalMouseMove)
  document.removeEventListener('mouseup', handleGlobalMouseUp)
}

/**
 * 处理折叠按钮点击
 */
const handleCollapseClick = () => {
  toggleCollapse()
}

// ============================================
// 监听宽度变化（用于调试）
// ============================================

if (import.meta.env.DEV) {
  watch(currentWidth, (newWidth) => {
    console.log(`[ResizablePanel] ${props.panelId} width changed to: ${newWidth}px`)
  })
}

// ============================================
// 导出（用于测试）
// ============================================

defineExpose({
  isDragging,
  isCollapsed,
  currentWidth
})
</script>

<style scoped lang="scss">
/**
 * ResizablePanel 样式
 *
 * 使用 VSCode 主题 CSS 变量
 */

.resizable-panel {
  /* 布局 */
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;

  /* 过渡动画 - 使用统一变量 */
  transition: width 0.2s ease;
  background: transparent;
  border: none;

  /* 防止内容溢出 */
  overflow: hidden;
}

/* 左侧面板 */
.resizable-panel--left {
  order: 1;
  border: none;
}

/* 右侧面板 */
.resizable-panel--right {
  order: 3;
  border: none;
}

/* 折叠状态 */
.resizable-panel--collapsed {
  width: 0 !important;
  min-width: 0 !important;
  overflow: hidden;
  border: none;
}

/* 拖拽状态 */
.resizable-panel--dragging {
  /* 拖拽时禁用过渡动画，提高性能 */
  transition: none;

  /* 视觉反馈 */
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4);
}

/* 折叠按钮 */
.panel-collapse-button {
  position: absolute;
  top: 8px;
  z-index: 10;

  /* 样式 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;

  /* VSCode 主题变量 */
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  color: #64748b;

  /* 交互样式 - 使用快速过渡 */
  cursor: pointer;
  transition: all 0.2s ease;

  /* 无障碍 */
  outline: none;

  &:hover {
    background-color: #eff6ff;
    border-color: #93c5fd;
    color: #2563eb;
  }

  &:active {
    background-color: #e2e8f0;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.28);
  }

  /* 左侧面板折叠按钮位置 */
  .resizable-panel--left & {
    right: -12px;
  }

  /* 右侧面板折叠按钮位置 */
  .resizable-panel--right & {
    left: -12px;
  }

  /* 折叠状态下的按钮位置 */
  &--collapsed {
    /* 当面板折叠时，按钮移动到可见区域 */
    .resizable-panel--left & {
      right: 8px;
    }

    .resizable-panel--right & {
      left: 8px;
    }
  }
}

/* 面板内容 */
.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 100%;

  /* 过渡动画 - 使用统一变量 */
  transition: opacity 0.2s ease;

  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 5px;
    border: 2px solid #f1f5f9;

    &:hover {
      background-color: #94a3b8;
    }
  }
}

/* 折叠状态下的内容 */
.panel-content--collapsed {
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 图标样式 */
.panel-collapse-button .qy-icon {
  width: 16px;
  height: 16px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .resizable-panel {
    /* 移动端默认折叠 */
    &.resizable-panel--left[data-collapsible="true"] {
      width: 0 !important;
    }
  }

  .panel-collapse-button {
    /* 移动端增大触摸区域 */
    width: 32px;
    height: 32px;
  }
}
</style>
