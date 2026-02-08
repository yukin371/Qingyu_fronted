<template>
  <div
    ref="panelRef"
    class="side-panel transition-all duration-200 ease-in-out"
    :class="[
      'side-panel--' + position,
      { 'collapsed': isCollapsed }
    ]"
    :style="panelStyle"
    :data-testid="`side-panel-${position}`"
    role="complementary"
    :aria-label="`${position} panel`"
  >
    <!-- 折叠按钮 (仅在collapsible为true时显示) -->
    <button
      v-if="collapsible"
      class="collapse-button"
      :class="{ 'collapsed': isCollapsed }"
      :aria-label="isCollapsed ? `展开${position}面板` : `折叠${position}面板`"
      :aria-expanded="!isCollapsed"
      @click="handleCollapseToggle"
    >
      <span class="collapse-icon">{{ isCollapsed ? '»' : '«' }}</span>
    </button>

    <!-- 头部插槽 -->
    <div v-if="$slots.header && !isCollapsed" class="side-panel__header">
      <slot name="header"></slot>
    </div>

    <!-- 内容区域 -->
    <div class="side-panel__content" :class="{ 'hidden': isCollapsed }">
      <slot></slot>
    </div>

    <!-- 拖拽手柄 (仅在resizable为true时显示) -->
    <DragHandle
      v-if="resizable && !isCollapsed"
      :position="dragHandlePosition"
      @drag-start="handleDragStart"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * SidePanel 通用侧边面板组件
 * 
 * 用于编辑器的左右侧边面板，支持：
 * - 可调整宽度（resizable）
 * - 可折叠（collapsible）
 * - 集成panelStore状态管理
 * - VSCode风格样式
 * 
 * @features
 * - 支持 position: 'left' | 'right'
 * - 可自定义 width（默认280/320）
 * - 可调整大小（resizable，默认true）
 * - 可折叠（collapsible，默认false）
 * - 集成 panelStore 状态管理
 * - VSCode 主题样式
 * - 无障碍支持
 */

import { ref, computed, watch, onMounted } from 'vue'
import { QyIcon } from '@/design-system/components'
import DragHandle from './DragHandle.vue'
import { usePanelStore } from '../stores/panelStore'

// ============================================
// Props 定义
// ============================================

interface Props {
  /** 面板位置 */
  position?: 'left' | 'right'
  /** 面板宽度 */
  width?: number
  /** 是否可调整大小 */
  resizable?: boolean
  /** 是否可折叠 */
  collapsible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'left',
  width: 0,
  resizable: true,
  collapsible: false
})

// ============================================
// Emits 定义
// ============================================

interface ResizeStartEvent {
  position: 'left' | 'right'
  startX: number
  startY: number
  currentWidth: number
}

const emit = defineEmits<{
  'resize-start': [event: ResizeStartEvent]
  'collapse': []
  'expand': []
}>()

// ============================================
// Store 集成
// ============================================

const panelStore = usePanelStore()

// ============================================
// 响应式状态
// ============================================

const panelRef = ref<HTMLElement | null>(null)
const isCollapsed = ref(false)

// ============================================
// 计算属性
// ============================================

/**
 * 当前面板宽度
 */
const currentWidth = computed(() => {
  // 如果传入了有效的width prop（大于0），使用prop值
  if (props.width && props.width > 0) {
    return props.width
  }

  // 否则从store获取
  return props.position === 'left'
    ? panelStore.leftWidth
    : panelStore.rightWidth
})

/**
 * 面板样式
 */
const panelStyle = computed(() => {
  // 折叠时的宽度
  if (isCollapsed.value) {
    return {
      width: 'var(--panel-collapsed-width, 0px)',
      minWidth: 'var(--panel-collapsed-width, 0px)',
      maxWidth: 'var(--panel-collapsed-width, 0px)'
    }
  }
  
  // 正常状态的宽度
  return {
    width: `${currentWidth.value}px`,
    minWidth: 'var(--panel-min-width, 200px)',
    maxWidth: 'var(--panel-max-width, 600px)',
    backgroundColor: 'var(--color-bg-secondary, #252526)',
    borderLeft: props.position === 'right' 
      ? '1px solid var(--color-border, #3c3c3c)' 
      : 'none',
    borderRight: props.position === 'left' 
      ? '1px solid var(--color-border, #3c3c3c)' 
      : 'none'
  }
})

/**
 * 拖拽手柄位置
 * 左面板的手柄在右侧，右面板的手柄在左侧
 */
const dragHandlePosition = computed(() => {
  return props.position // DragHandle组件会根据position自动调整位置
})

// ============================================
// 方法
// ============================================

/**
 * 切换折叠状态
 */
const handleCollapseToggle = () => {
  isCollapsed.value = !isCollapsed.value

  // 如果是右侧面板，同步更新store
  if (props.position === 'right') {
    panelStore.toggleRightCollapsed()
  }

  // 触发事件
  if (isCollapsed.value) {
    emit('collapse')
  } else {
    emit('expand')
  }
}

/**
 * 处理拖拽开始事件
 */
const handleDragStart = (event: { position: 'left' | 'right'; startX: number; startY: number }) => {
  const resizeEvent: ResizeStartEvent = {
    position: event.position,
    startX: event.startX,
    startY: event.startY,
    currentWidth: currentWidth.value
  }

  emit('resize-start', resizeEvent)
}

/**
 * 更新面板宽度
 */
const updateWidth = (newWidth: number) => {
  if (props.position === 'left') {
    panelStore.setLeftWidth(newWidth)
  } else {
    panelStore.setRightWidth(newWidth)
  }
}

// ============================================
// 监听器
// ============================================

// 监听store中的折叠状态变化（仅右侧面板）
if (props.position === 'right') {
  watch(() => panelStore.rightCollapsed, (newValue) => {
    isCollapsed.value = newValue
  }, { immediate: true })
}

// ============================================
// 生命周期
// ============================================

onMounted(() => {
  // 初始化折叠状态
  if (props.position === 'right') {
    isCollapsed.value = panelStore.rightCollapsed
  }
})

// ============================================
// 暴露方法给父组件
// ============================================

defineExpose({
  updateWidth,
  collapse: () => {
    isCollapsed.value = true
    if (props.position === 'right') {
      panelStore.toggleRightCollapsed()
    }
  },
  expand: () => {
    isCollapsed.value = false
    if (props.position === 'right') {
      panelStore.toggleRightCollapsed()
    }
  }
})
</script>

<style scoped lang="scss">
/**
 * SidePanel 样式
 * 
 * 使用 VSCode 主题 CSS 变量
 * 参见: src/design-system/themes/vscode-dark.scss
 */

.side-panel {
  /* 基础样式 */
  position: relative;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  /* VSCode 主题变量 */
  background-color: var(--color-bg-secondary, #252526);
  
  /* 过渡动画 */
  transition: width var(--transition-normal, 200ms) ease-in-out,
              min-width var(--transition-normal, 200ms) ease-in-out,
              max-width var(--transition-normal, 200ms) ease-in-out;
  
  /* 防止内容溢出 */
  overflow-x: hidden;
  overflow-y: auto;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: var(--scrollbar-width, 8px);
    height: var(--scrollbar-height, 8px);
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-scrollbar-bg, #1e1e1e);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-scrollbar-thumb, #424242);
    border-radius: var(--radius-sm, 2px);
    
    &:hover {
      background: var(--color-scrollbar-thumb-hover, #4f4f4f);
    }
  }
}

/* 不同位置的面板样式 */
.side-panel--left {
  order: 0;
  border-right: 1px solid var(--color-border, #3c3c3c);
}

.side-panel--right {
  order: 2;
  border-left: 1px solid var(--color-border, #3c3c3c);
}

/* 折叠状态 */
.side-panel.collapsed {
  width: var(--panel-collapsed-width, 0px) !important;
  min-width: var(--panel-collapsed-width, 0px) !important;
  max-width: var(--panel-collapsed-width, 0px) !important;
  border: none;
  overflow: hidden;
}

/* 折叠按钮 */
.collapse-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 32px;
  padding: 0;
  border: none;
  background: var(--color-bg-tertiary, #2d2d2d);
  color: var(--color-text-secondary, #858585);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm, 2px);
  transition: all var(--transition-fast, 100ms) ease-out;
  z-index: 10;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
  
  /* 不同位置的按钮位置 */
  .side-panel--left & {
    right: -20px;
    border-radius: 0 var(--radius-sm, 2px) var(--radius-sm, 2px) 0;
    border: 1px solid var(--color-border, #3c3c3c);
    border-left: none;
  }
  
  .side-panel--right & {
    left: -20px;
    border-radius: var(--radius-sm, 2px) 0 0 var(--radius-sm, 2px);
    border: 1px solid var(--color-border, #3c3c3c);
    border-right: none;
  }
  
  &:hover {
    background: var(--color-bg-hover, #2a2d2e);
    color: var(--color-text-primary, #cccccc);
    width: 24px;
    
    .side-panel--left & {
      right: -24px;
    }
    
    .side-panel--right & {
      left: -24px;
    }
  }
  
  &:active {
    background: var(--color-bg-active, #37373d);
  }
  
  &:focus-visible {
    outline: 2px solid var(--color-border-focus, #007fd4);
    outline-offset: 2px;
  }
}

/* 折叠状态下的按钮 */
.collapse-button.collapsed {
  width: 24px;
  
  .side-panel--left & {
    right: -24px;
  }
  
  .side-panel--right & {
    left: -24px;
  }
}

/* 面板头部 */
.side-panel__header {
  flex-shrink: 0;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border-bottom: 1px solid var(--color-border, #3c3c3c);
  background: var(--color-bg-tertiary, #2d2d2d);
  
  /* 滚动条优化 */
  &::-webkit-scrollbar {
    height: 4px;
  }
}

/* 面板内容区域 */
.side-panel__content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-md, 16px);
  
  /* 确保内容不会被折叠按钮遮挡 */
  &.hidden {
    display: none;
  }
  
  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: var(--scrollbar-width, 8px);
    height: var(--scrollbar-height, 8px);
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-scrollbar-bg, #1e1e1e);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-scrollbar-thumb, #424242);
    border-radius: var(--radius-sm, 2px);
    
    &:hover {
      background: var(--color-scrollbar-thumb-hover, #4f4f4f);
    }
  }
}

/* 过渡动画类 */
.transition-all {
  transition-property: width, min-width, max-width, padding, margin;
  transition-timing-function: ease-in-out;
}

.duration-200 {
  transition-duration: 200ms;
}

.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
