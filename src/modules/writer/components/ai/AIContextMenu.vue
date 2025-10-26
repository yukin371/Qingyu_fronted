<template>
  <teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="ai-context-menu"
      :style="menuStyle"
      @click.stop
    >
      <div class="menu-header">
        <el-icon><MagicStick /></el-icon>
        <span>AI助手</span>
      </div>

      <div class="menu-items">
        <div
          class="menu-item"
          @click="handleMenuClick('polish')"
        >
          <el-icon><Brush /></el-icon>
          <span>润色选中内容</span>
          <span class="shortcut">Ctrl+Shift+P</span>
        </div>

        <div
          class="menu-item"
          @click="handleMenuClick('expand')"
        >
          <el-icon><Plus /></el-icon>
          <span>扩写选中内容</span>
        </div>

        <div
          class="menu-item"
          @click="handleMenuClick('rewrite')"
        >
          <el-icon><RefreshRight /></el-icon>
          <span>改写选中内容</span>
        </div>

        <div class="menu-divider"></div>

        <div
          class="menu-item"
          @click="handleMenuClick('continue')"
        >
          <el-icon><Edit /></el-icon>
          <span>从此处续写</span>
          <span class="shortcut">Ctrl+Shift+K</span>
        </div>

        <div
          class="menu-item"
          @click="handleMenuClick('chat')"
        >
          <el-icon><ChatLineSquare /></el-icon>
          <span>询问AI</span>
          <span class="shortcut">Ctrl+K</span>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  MagicStick,
  Brush,
  Plus,
  RefreshRight,
  Edit,
  ChatLineSquare
} from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  x: number
  y: number
  selectedText?: string
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'action', action: string, text?: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const menuRef = ref<HTMLElement>()

const menuStyle = computed(() => {
  return {
    left: `${props.x}px`,
    top: `${props.y}px`
  }
})

// 处理菜单项点击
const handleMenuClick = (action: string) => {
  emit('action', action, props.selectedText)
  emit('update:visible', false)
}

// 点击外部关闭菜单
const handleClickOutside = (e: MouseEvent) => {
  if (props.visible && menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('update:visible', false)
  }
}

// 按Esc键关闭菜单
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible) {
    emit('update:visible', false)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})

// 监听可见性变化，调整菜单位置防止超出视口
watch(() => props.visible, (visible) => {
  if (visible) {
    // 延迟一帧，确保菜单已渲染
    requestAnimationFrame(() => {
      if (!menuRef.value) return

      const rect = menuRef.value.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // 调整水平位置
      if (rect.right > viewportWidth) {
        menuRef.value.style.left = `${props.x - rect.width}px`
      }

      // 调整垂直位置
      if (rect.bottom > viewportHeight) {
        menuRef.value.style.top = `${props.y - rect.height}px`
      }
    })
  }
})
</script>

<style scoped lang="scss">
.ai-context-menu {
  position: fixed;
  z-index: 9999;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 200px;
  animation: fadeIn 0.2s ease;
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);

  .el-icon {
    font-size: 16px;
    color: #667eea;
  }
}

.menu-items {
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  color: #374151;

  &:hover {
    background: #f3f4f6;
  }

  .el-icon {
    font-size: 16px;
    color: #667eea;
  }

  span:first-of-type {
    flex: 1;
  }

  .shortcut {
    font-size: 12px;
    color: #9ca3af;
    font-family: monospace;
  }
}

.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .ai-context-menu {
    background: #1a1a1a;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  }

  .menu-header {
    color: #9ca3af;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  }

  .menu-item {
    color: #e5e7eb;

    &:hover {
      background: #2d2d2d;
    }
  }

  .menu-divider {
    background: #2d2d2d;
  }
}
</style>


