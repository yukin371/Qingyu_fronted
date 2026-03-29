import { onMounted, onUnmounted, ref } from 'vue'
import { useShortcutConfig } from './useShortcutConfig'

/**
 * 工作区快捷键管理
 * 集成 useShortcutConfig 提供统一的快捷键管理
 */
export function useWorkspaceShortcuts() {
  const shortcutsEnabled = ref(true)

  const { registerHandler, loadShortcuts } = useShortcutConfig()

  // 注册 ESC 关闭覆盖层
  const unregisterEsc = registerHandler('workspace.closeOverlay', (_event: KeyboardEvent) => {
    const overlay = document.querySelector('.fullscreen-overlay')
    if (overlay && overlay instanceof HTMLElement) {
      overlay.dispatchEvent(new CustomEvent('close-overlay'))
    }
  })

  onMounted(() => {
    loadShortcuts()
  })

  onUnmounted(() => {
    unregisterEsc()
  })

  return {
    shortcutsEnabled,
  }
}
