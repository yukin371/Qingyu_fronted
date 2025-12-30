<template>
  <teleport to="body">
    <transition name="ai-scale-fade">
      <div v-if="visible" ref="menuRef" class="ai-context-menu" :style="menuStyle" @click.stop @keydown="handleKeydown">
        <!-- 1. 顶部输入框 (Cursor 风格核心) -->
        <div class="ai-input-wrapper">
          <div class="input-icon">
            <el-icon class="is-loading" v-if="loading">
              <Loading />
            </el-icon>
            <el-icon v-else>
              <MagicStick />
            </el-icon>
          </div>
          <input ref="inputRef" v-model="customPrompt" type="text" class="ai-custom-input"
            :placeholder="placeholderText" @keydown.enter.prevent="handleCustomSubmit"
            @keydown.up.prevent="navigate('up')" @keydown.down.prevent="navigate('down')" />
          <div class="input-suffix">
            <span class="key-badge">↵</span>
          </div>
        </div>

        <!-- 2. 预设菜单列表 -->
        <div class="menu-list" role="menu">
          <!-- 上下文提示 -->
          <div class="context-hint" v-if="selectedText">
            已选中 {{ selectedText.length }} 个字符
          </div>

          <template v-for="(group, gIndex) in menuGroups" :key="gIndex">
            <div class="menu-group">
              <div v-for="(item, iIndex) in group" :key="item.action" class="menu-item"
                :class="{ 'is-active': isItemActive(item.action) }" @click="handleMenuClick(item.action)"
                @mouseenter="hoverIndex = getItemGlobalIndex(gIndex, iIndex)">
                <div class="item-left">
                  <el-icon>
                    <component :is="item.icon" />
                  </el-icon>
                  <span class="item-label">{{ item.label }}</span>
                </div>
                <span class="shortcut" v-if="item.shortcut">{{ item.shortcut }}</span>
              </div>
            </div>
            <div class="menu-divider" v-if="gIndex < menuGroups.length - 1"></div>
          </template>
        </div>

        <!-- 3. 底部提示 -->
        <div class="menu-footer">
          <span>AI 写作助手</span>
          <span class="provider">Powered by Qingyu</span>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  MagicStick, Brush, Plus, RefreshRight, Edit, ChatLineSquare, Loading,
  VideoPause, Star
} from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  x: number
  y: number
  selectedText?: string
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'action', action: string, text?: string): void // action: 'chat' | 'polish' | 'custom' ...
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Refs
const menuRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()

// State
const customPrompt = ref('')
const activeIndex = ref(-1) // -1 表示焦点在输入框，>=0 表示在菜单项上
const hoverIndex = ref(-1)  // 鼠标悬停索引

// 菜单配置
const menuGroups = [
  [
    { label: '润色优化', action: 'polish', icon: Brush, shortcut: 'Ctrl+Shift+P' },
    { label: '智能扩写', action: 'expand', icon: Plus, shortcut: '' },
    { label: '改写/重写', action: 'rewrite', icon: RefreshRight, shortcut: '' },
  ],
  [
    { label: '从此续写', action: 'continue', icon: Edit, shortcut: 'Ctrl+Shift+K' },
    { label: '询问 AI', action: 'chat', icon: ChatLineSquare, shortcut: 'Ctrl+K' },
  ]
]

// 扁平化菜单项用于键盘导航计算
const flatMenuItems = computed(() => menuGroups.flat())

// 计算样式
const menuStyle = ref({ top: '0px', left: '0px', opacity: '0' })

const placeholderText = computed(() => {
  return props.selectedText
    ? '输入指令以修改选中内容...'
    : '输入指令以生成内容...'
})

// =======================
// 逻辑处理
// =======================

// 1. 提交自定义指令
const handleCustomSubmit = () => {
  if (customPrompt.value.trim()) {
    // 发送 'custom' 动作，将输入内容作为 text 参数传递
    emit('action', 'chat', customPrompt.value) // 这里为了复用后端逻辑，通常映射为 chat 或专门的 instruct
    closeMenu()
  } else if (activeIndex.value >= 0) {
    // 如果没有输入文字但选中了菜单项，执行菜单项
    const item = flatMenuItems.value[activeIndex.value]
    handleMenuClick(item.action)
  }
}

// 2. 点击菜单项
const handleMenuClick = (action: string) => {
  emit('action', action, props.selectedText)
  closeMenu()
}

// 3. 键盘导航
const navigate = (direction: 'up' | 'down') => {
  const maxIndex = flatMenuItems.value.length - 1

  if (direction === 'down') {
    if (activeIndex.value < maxIndex) {
      activeIndex.value++
    } else {
      activeIndex.value = -1 // 回到输入框
    }
  } else {
    if (activeIndex.value > -1) {
      activeIndex.value--
    } else {
      activeIndex.value = maxIndex // 循环到底部
    }
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeMenu()
  }
}

// 4. 判断激活状态
const isItemActive = (action: string) => {
  const index = flatMenuItems.value.findIndex(i => i.action === action)
  // 键盘选中 或 鼠标悬停
  return index === activeIndex.value || index === hoverIndex.value
}

// 辅助：获取全局索引
const getItemGlobalIndex = (gIndex: number, iIndex: number) => {
  let count = 0
  for (let i = 0; i < gIndex; i++) {
    count += menuGroups[i].length
  }
  return count + iIndex
}

// =======================
// 定位与生命周期
// =======================

const closeMenu = () => {
  emit('update:visible', false)
  emit('close')
  customPrompt.value = ''
  activeIndex.value = -1
}

const handleClickOutside = (e: MouseEvent) => {
  if (props.visible && menuRef.value && !menuRef.value.contains(e.target as Node)) {
    closeMenu()
  }
}

// 智能定位逻辑
const updatePosition = async () => {
  if (!menuRef.value) return

  await nextTick()
  const el = menuRef.value
  const { width, height } = el.getBoundingClientRect()
  const { innerWidth, innerHeight } = window

  let x = props.x
  let y = props.y + 10 // 默认向下偏移一点，避免遮挡光标

  // 1. 水平防溢出
  if (x + width > innerWidth - 20) {
    x = innerWidth - width - 20
  }

  // 2. 垂直防溢出 (如果下方不够，就翻转到上方)
  if (y + height > innerHeight - 20) {
    y = props.y - height - 10
  }

  menuStyle.value = {
    top: `${y}px`,
    left: `${x}px`,
    opacity: '1'
  }

  // 自动聚焦输入框
  inputRef.value?.focus()
}

watch(() => props.visible, (val) => {
  if (val) {
    // 重置状态
    customPrompt.value = ''
    activeIndex.value = -1
    hoverIndex.value = -1
    // 计算位置
    updatePosition()
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
// 变量定义，方便适配暗黑模式
$bg-color: var(--el-bg-color-overlay, #ffffff);
$border-color: var(--el-border-color-light, #e4e7ed);
$text-primary: var(--el-text-color-primary, #303133);
$text-secondary: var(--el-text-color-secondary, #909399);
$hover-bg: var(--el-fill-color, #f5f7fa);
$accent-color: var(--el-color-primary, #409eff);
$shadow: var(--el-box-shadow-light, 0 4px 12px rgba(0, 0, 0, 0.1));

.ai-context-menu {
  position: fixed;
  z-index: 9999;
  width: 320px;
  background: $bg-color;
  border: 1px solid $border-color;
  border-radius: 12px;
  box-shadow: $shadow;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  // 毛玻璃效果 (仅现代浏览器)
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

// 1. 顶部输入区域
.ai-input-wrapper {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid $border-color;
  gap: 10px;
  background: rgba(255, 255, 255, 0.5);

  .input-icon {
    display: flex;
    align-items: center;
    color: $accent-color;
    font-size: 18px;
    animation: pulse 2s infinite;
  }

  .ai-custom-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: $text-primary;
    line-height: 1.5;

    &::placeholder {
      color: $text-secondary;
      opacity: 0.7;
    }
  }

  .key-badge {
    font-size: 12px;
    color: $text-secondary;
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
  }
}

// 2. 菜单列表
.menu-list {
  padding: 6px;
  max-height: 300px;
  overflow-y: auto;

  .context-hint {
    font-size: 12px;
    color: $text-secondary;
    padding: 4px 10px;
    margin-bottom: 4px;
  }

  .menu-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.1s;
    color: $text-primary;

    // 激活状态（鼠标悬停或键盘选中）
    &.is-active,
    &:hover {
      background-color: $accent-color;
      color: white;

      .shortcut {
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .item-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }

    .shortcut {
      font-size: 12px;
      color: $text-secondary;
      font-family: monospace;
    }
  }

  .menu-divider {
    height: 1px;
    background: $border-color;
    margin: 6px 0;
  }
}

// 3. 底部
.menu-footer {
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid $border-color;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: $text-secondary;
}

// 动画
.ai-scale-fade-enter-active,
.ai-scale-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.ai-scale-fade-enter-from,
.ai-scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  .ai-context-menu {
    background: rgba(30, 30, 30, 0.95);
    border-color: #333;

    .ai-input-wrapper {
      background: rgba(0, 0, 0, 0.2);
      border-bottom-color: #333;
    }

    .ai-custom-input {
      color: #eee;
    }

    .menu-item {
      color: #ddd;

      &.is-active,
      &:hover {
        background-color: $accent-color;
        color: white;
      }
    }

    .menu-footer {
      background: rgba(0, 0, 0, 0.3);
      border-top-color: #333;
    }

    .menu-list .menu-divider {
      background: #333;
    }

    .key-badge {
      background: rgba(255, 255, 255, 0.1);
      color: #aaa;
    }
  }
}
</style>
