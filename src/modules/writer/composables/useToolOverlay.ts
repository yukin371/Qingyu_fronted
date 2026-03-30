/**
 * 工具面板状态管理
 *
 * 提供统一的工具面板状态管理，支持：
 * - 打开/关闭工具面板
 * - 切换工具
 * - 记住上次使用的工具
 * - 快捷键映射
 */

import { readonly, ref } from 'vue'

const LAST_TOOL_KEY = 'qingyu_last_tool'
const DEFAULT_TOOL = 'relations'

export type ToolType = 'relations' | 'timeline' | 'branches' | 'structure'

// 快捷键到工具的映射（默认配置）
const DEFAULT_TOOL_SHORTCUTS: Record<string, ToolType> = {
  '1': 'relations',
  '2': 'timeline',
  '3': 'branches',
  '4': 'structure',
}

// 单例状态
const visible = ref(false)
const activeTool = ref<ToolType>(getLastTool())

function getLastTool(): ToolType {
  const saved = localStorage.getItem(LAST_TOOL_KEY)
  if (saved && ['relations', 'timeline', 'branches', 'structure'].includes(saved)) {
    return saved as ToolType
  }
  return DEFAULT_TOOL as ToolType
}

function setLastTool(toolId: string) {
  localStorage.setItem(LAST_TOOL_KEY, toolId)
}

export function useToolOverlay() {
  /**
   * 打开工具面板
   * @param tool 可选，指定打开的工具类型，默认为上次使用的工具
   */
  function open(tool?: ToolType) {
    if (tool) {
      activeTool.value = tool
      setLastTool(tool)
    } else {
      // 确保 activeTool 是有效的
      activeTool.value = getLastTool()
    }
    visible.value = true
  }

  /**
   * 关闭工具面板
   */
  function close() {
    visible.value = false
  }

  /**
   * 切换工具面板可见状态
   */
  function toggle() {
    if (visible.value) {
      close()
    } else {
      open()
    }
  }

  /**
   * 切换到指定工具
   * 如果面板未打开，会自动打开
   */
  function switchTool(toolId: ToolType) {
    activeTool.value = toolId
    setLastTool(toolId)
    if (!visible.value) {
      visible.value = true
    }
  }

  /**
   * 获取当前工具的名称
   */
  const toolNames: Record<ToolType, string> = {
    relations: '关系图谱',
    timeline: '时间线',
    branches: '故事分支',
    structure: '结构舞台',
  }

  /**
   * 获取当前工具的图标
   */
  const toolIcons: Record<ToolType, string> = {
    relations: 'Share',
    timeline: 'Clock',
    branches: 'Connection',
    structure: 'Grid',
  }

  function getToolName(toolId: ToolType): string {
    return toolNames[toolId] || toolId
  }

  function getToolIcon(toolId: ToolType): string {
    return toolIcons[toolId] || 'Tools'
  }

  /**
   * 根据键盘事件获取对应的工具 ID
   * @param event 键盘事件
   * @returns 对应的工具 ID，如果没有匹配返回 null
   */
  function getToolFromKeyboardEvent(event: KeyboardEvent): ToolType | null {
    // Ctrl+1/2/3/4 切换工具
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
      const tool = DEFAULT_TOOL_SHORTCUTS[event.key]
      return tool || null
    }
    return null
  }

  /**
   * 处理工具切换键盘事件
   * @param event 键盘事件
   * @returns 是否处理了该事件
   */
  function handleKeyboardEvent(event: KeyboardEvent): boolean {
    // Ctrl+G: 打开/关闭工具面板
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'g') {
      event.preventDefault()
      toggle()
      return true
    }

    // Ctrl+1/2/3/4: 切换工具
    const tool = getToolFromKeyboardEvent(event)
    if (tool && visible.value) {
      event.preventDefault()
      switchTool(tool)
      return true
    }

    // Escape: 关闭工具面板
    if (event.key === 'Escape' && visible.value) {
      event.preventDefault()
      close()
      return true
    }

    return false
  }

  return {
    // 只读状态
    visible: readonly(visible),
    activeTool: readonly(activeTool),
    // 方法
    open,
    close,
    toggle,
    switchTool,
    // 工具信息
    getToolName,
    getToolIcon,
    toolNames,
    toolIcons,
    // 键盘事件处理
    getToolFromKeyboardEvent,
    handleKeyboardEvent,
  }
}
