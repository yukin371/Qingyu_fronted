import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 工作区快捷键管理
 * 提供 ESC 键等全局快捷键功能
 */
export function useWorkspaceShortcuts() {
  const shortcutsEnabled = ref(true)

  const handleKeyDown = (event: KeyboardEvent) => {
    // ESC 键关闭全屏覆盖层
    if (event.key === 'Escape') {
      const overlay = document.querySelector('.fullscreen-overlay')
      if (overlay && overlay instanceof HTMLElement) {
        // 触发自定义事件，让组件处理关闭
        overlay.dispatchEvent(new CustomEvent('close-overlay'))
      }
    }
  }

  onMounted(() => {
    if (shortcutsEnabled.value) {
      document.addEventListener('keydown', handleKeyDown)
    }
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    shortcutsEnabled,
  }
}
