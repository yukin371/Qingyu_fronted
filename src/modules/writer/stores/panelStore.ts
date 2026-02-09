import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'qingyu_editor_panel_layout'

interface PanelState {
  leftWidth: number
  rightWidth: number
  rightCollapsed: boolean
}

export const usePanelStore = defineStore('panel', () => {
  // 从 localStorage 加载或使用默认值
  const loadState = (): PanelState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load panel state:', error)
    }
    return {
      leftWidth: 280,
      rightWidth: 320,
      rightCollapsed: false
    }
  }

  const state = loadState()

  // 响应式状态
  const leftWidth = ref(state.leftWidth)
  const rightWidth = ref(state.rightWidth)
  const rightCollapsed = ref(state.rightCollapsed)

  // 保存到 localStorage
  const saveState = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        leftWidth: leftWidth.value,
        rightWidth: rightWidth.value,
        rightCollapsed: rightCollapsed.value
      }))
    } catch (error) {
      console.warn('Failed to save panel state:', error)
    }
  }

  // Actions
  const setLeftWidth = (width: number) => {
    leftWidth.value = Math.max(200, Math.min(600, width))
    saveState()
  }

  const setRightWidth = (width: number) => {
    rightWidth.value = Math.max(200, Math.min(600, width))
    saveState()
  }

  const toggleRightCollapsed = () => {
    rightCollapsed.value = !rightCollapsed.value
    saveState()
  }

  const resetToDefaults = () => {
    leftWidth.value = 280
    rightWidth.value = 320
    rightCollapsed.value = false
    saveState()
  }

  return {
    leftWidth,
    rightWidth,
    rightCollapsed,
    setLeftWidth,
    setRightWidth,
    toggleRightCollapsed,
    resetToDefaults
  }
})
