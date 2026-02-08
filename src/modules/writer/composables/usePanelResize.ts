/**
 * usePanelResize - 面板调整大小组合式函数
 *
 * 提供面板拖拽调整大小的功能：
 * - 拖拽开始/结束逻辑
 * - 宽度计算和约束
 * - panelStore集成
 * - 事件监听器管理
 *
 * @features
 * - 支持左/右面板拖拽
 * - 宽度约束（200-600px，可自定义）
 * - localStorage持久化（通过panelStore）
 * - collapsible功能支持
 */

import { ref, computed, watch, onUnmounted, getCurrentInstance } from 'vue'
import { usePanelStore } from '../stores/panelStore'

export interface DragStartEvent {
  position: 'left' | 'right'
  startX: number
  startY: number
}

export interface UsePanelResizeOptions {
  /** 面板ID */
  panelId: 'left' | 'right'
  /** 默认宽度 */
  defaultWidth: number
  /** 最小宽度（默认200px） */
  minWidth?: number
  /** 最大宽度（默认600px） */
  maxWidth?: number
  /** 是否可折叠 */
  collapsible?: boolean
}

export function usePanelResize(options: UsePanelResizeOptions) {
  // 检查是否在组件上下文中
  const isInComponent = !!getCurrentInstance()
  const {
    panelId,
    defaultWidth,
    minWidth = 200,
    maxWidth = 600,
    collapsible = false
  } = options

  // panelStore集成
  const panelStore = usePanelStore()

  // 获取保存的宽度（如果存在）
  const savedWidth = computed(() => {
    return panelId === 'left' ? panelStore.leftWidth : panelStore.rightWidth
  })

  // 检查是否有保存的宽度（通过检查localStorage）
  const hasSavedWidth = computed(() => {
    try {
      const saved = localStorage.getItem('qingyu_editor_panel_layout')
      if (saved) {
        const data = JSON.parse(saved)
        const width = panelId === 'left' ? data.leftWidth : data.rightWidth
        return width !== undefined && width !== null
      }
    } catch (error) {
      // 忽略错误
    }
    return false
  })

  // 当前面板宽度（本地状态，用于拖拽过程中避免频繁更新store）
  // 如果没有保存的宽度，使用defaultWidth；否则使用保存的宽度
  const localWidth = ref(hasSavedWidth.value ? savedWidth.value : defaultWidth)

  // 监听store变化，同步到本地
  watch(
    savedWidth,
    (newWidth) => {
      if (!isDragging.value) {
        localWidth.value = newWidth
      }
    }
  )

  // 对于可折叠的右侧面板，监听折叠状态
  const isCollapsed = computed(() => {
    return collapsible && panelId === 'right' && panelStore.rightCollapsed
  })

  // 当前面板宽度
  const currentWidth = computed(() => {
    if (isCollapsed.value) {
      return 0
    }
    return localWidth.value
  })

  // 拖拽状态
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartWidth = ref(0)

  /**
   * 开始拖拽
   */
  const startDrag = (event: DragStartEvent) => {
    isDragging.value = true
    dragStartX.value = event.startX
    dragStartWidth.value = currentWidth.value

    // 添加全局事件监听器
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  /**
   * 处理鼠标移动
   */
  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value) return

    // 计算鼠标移动距离
    const deltaX = event.clientX - dragStartX.value

    // 根据面板位置计算新宽度
    let newWidth: number
    if (panelId === 'left') {
      // 左侧面板：向右拖拽增加宽度
      newWidth = dragStartWidth.value + deltaX
    } else {
      // 右侧面板：向左拖拽增加宽度
      newWidth = dragStartWidth.value - deltaX
    }

    // 应用宽度约束
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))

    // 更新本地宽度（拖拽过程中不更新store，避免频繁保存localStorage）
    localWidth.value = newWidth
  }

  /**
   * 处理鼠标松开
   */
  const handleMouseUp = () => {
    if (!isDragging.value) return
    stopDrag()
  }

  /**
   * 停止拖拽
   */
  const stopDrag = () => {
    if (!isDragging.value) return

    // 在停止拖拽前，将最终宽度保存到store（触发localStorage保存）
    const finalWidth = localWidth.value
    if (panelId === 'left') {
      panelStore.setLeftWidth(finalWidth)
    } else {
      panelStore.setRightWidth(finalWidth)
    }

    isDragging.value = false

    // 移除事件监听器
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  /**
   * 拖拽处理函数（供组件调用）
   */
  const onDrag = (event: MouseEvent) => {
    handleMouseMove(event)
  }

  /**
   * 切换折叠状态（仅右侧面板）
   */
  const toggleCollapse = () => {
    if (collapsible && panelId === 'right') {
      panelStore.toggleRightCollapsed()
    }
  }

  /**
   * 清理函数
   */
  const cleanup = () => {
    if (isDragging.value) {
      stopDrag()
    }
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  // 组件卸载时清理（仅在组件上下文中）
  if (isInComponent) {
    onUnmounted(() => {
      cleanup()
    })
  }

  return {
    // 状态
    currentWidth,
    isDragging,
    isCollapsed,

    // 方法
    startDrag,
    onDrag,
    stopDrag,
    toggleCollapse,
    cleanup
  }
}
