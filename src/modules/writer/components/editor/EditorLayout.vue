<template>
  <div
    class="editor-layout"
    :class="layoutClasses"
    role="application"
    :aria-label="`编辑器，${layoutModeLabel}`"
  >
    <!-- 顶部导航栏 -->
    <MiniNavbar
      v-model:model-value="activeToolModel"
      @tool-change="handleToolChange"
    />

    <!-- 移动端tab导航 -->
    <div v-if="layout.mode === 'mobile'" class="mobile-tabs" role="tablist">
      <button
        v-for="tab in mobileTabs"
        :key="tab.key"
        class="mobile-tab"
        :class="{ active: layout.activeTab === tab.key }"
        :aria-label="tab.label"
        :aria-selected="layout.activeTab === tab.key"
        role="tab"
        @click="switchTab(tab.key)"
      >
        <QyIcon :name="tab.icon" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 主内容区域 -->
    <div
      class="editor-layout__content"
      :class="contentClasses"
      @touchstart="handleContentTouchStart"
      @touchmove="handleContentTouchMove"
      @touchend="handleContentTouchEnd"
    >
      <!-- 左侧面板 - 添加过渡动画 -->
      <Transition name="panel-slide-left">
        <ResizablePanel
          v-show="leftPanelState !== 'hidden'"
          panel-id="left"
          :default-width="layout.leftPanel.width"
          :min-width="layout.leftPanel.minWidth"
          :max-width="layout.leftPanel.maxWidth"
          position="left"
          :class="leftPanelClasses"
          :style="leftPanelStyle"
        >
          <SidePanel
            position="left"
            :class="{ 'panel-visible': leftPanelVisible }"
          >
            <slot name="left-panel">
              <!-- 默认内容 -->
              <ProjectTree
                :project-id="projectId"
                :chapters="chapters"
                :current-chapter-id="currentChapterId"
              />
              <ChapterTree
                :tree-data="treeData"
                :project-id="projectId"
              />
            </slot>
          </SidePanel>
        </ResizablePanel>
      </Transition>

      <!-- 中间编辑器 -->
      <div
        class="editor-layout__main"
        :class="[
          { 'panel-visible': layout.activeTab === 'editor' },
          { 'immersive-mode': isImmersiveMode }
        ]"
      >
        <slot name="editor" :active-tool="activeTool">
          <!-- 默认内容 -->
          <EditorPanel :active-tool="activeTool" />
        </slot>
      </div>

      <!-- 右侧AI助手 - 添加过渡动画 -->
      <Transition name="panel-slide-right">
        <ResizablePanel
          v-show="rightPanelState !== 'hidden'"
          panel-id="right"
          :default-width="layout.rightPanel.width"
          :min-width="layout.rightPanel.minWidth"
          :max-width="layout.rightPanel.maxWidth"
          position="right"
          :collapsible="true"
          :class="rightPanelClasses"
          :style="rightPanelStyle"
        >
          <SidePanel
            position="right"
            :collapsible="true"
            :class="{ 'panel-visible': rightPanelVisible }"
          >
            <slot name="right-panel">
              <!-- 默认内容 -->
              <AIPanel />
            </slot>
          </SidePanel>
        </ResizablePanel>
      </Transition>
    </div>

    <!-- 屏幕阅读器实时通知 -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ ariaAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import MiniNavbar from './MiniNavbar.vue'
import ResizablePanel from './ResizablePanel.vue'
import SidePanel from './SidePanel.vue'
import EditorPanel from './EditorPanel.vue'
import AIPanel from './AIPanel.vue'
import ProjectTree from '../ProjectTree.vue'
import ChapterTree from '../DocumentTree.vue'
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
import { useEditorStore, type ActiveTool } from '../../stores/editorStore'

// ==================== Props & Emits ====================
interface Props {
  activeTool?: ActiveTool
}

interface Emits {
  (e: 'update:activeTool', value: ActiveTool): void
  (e: 'toolChange', toolId: ActiveTool): void
}

const props = withDefaults(defineProps<Props>(), {
  activeTool: 'writing'
})

const emit = defineEmits<Emits>()

// ==================== 插槽类型定义 ====================
defineSlots<{
  'left-panel'?: () => unknown
  'editor'?: () => unknown
  'right-panel'?: () => unknown
}>()

// 使用 editorStore
const editorStore = useEditorStore()

// 内部 activeTool 状态（用于本地管理）
const internalActiveTool = ref<ActiveTool>(props.activeTool)

// 计算 activeTool（优先使用 props，否则使用内部状态，最后使用 store）
const activeTool = computed<ActiveTool>({
  get: () => props.activeTool || internalActiveTool.value || editorStore.activeTool,
  set: (value: ActiveTool) => {
    internalActiveTool.value = value
    editorStore.setActiveTool(value)
    emit('update:activeTool', value)
  }
})

// MiniNavbar v-model 绑定（string 类型，需要转换）
// MiniNavbar 使用的工具 ID: 'chapters' | 'writing' | 'immersive' | 'ai-assistant'
const activeToolModel = computed<string>({
  get: () => {
    const tool = activeTool.value
    // 'ai' -> 'ai-assistant' 转换
    return tool === 'ai' ? 'ai-assistant' : tool
  },
  set: (value: string) => {
    // 'ai-assistant' -> 'ai' 转换
    const tool: ActiveTool = value === 'ai-assistant' ? 'ai' : value as ActiveTool
    activeTool.value = tool
  }
})

// 监听 store 中 activeTool 的变化
watch(
  () => editorStore.activeTool,
  (newTool) => {
    if (newTool !== internalActiveTool.value) {
      internalActiveTool.value = newTool
    }
  }
)

// ==================== 面板可见性计算 ====================
// 根据 activeTool 计算左侧面板是否可见
// chapters: 展开 | writing: 折叠 | immersive: 隐藏 | ai: 隐藏
const leftPanelVisible = computed(() => {
  const tool = activeTool.value
  return tool === 'chapters'
})

// 根据 activeTool 计算右侧面板是否可见
// chapters: 隐藏 | writing: 折叠 | immersive: 隐藏 | ai-assistant: 展开显示
const rightPanelVisible = computed(() => {
  const tool = activeTool.value
  return tool === 'ai-assistant' || tool === 'ai'
})

// 左侧面板状态：'expanded' | 'collapsed' | 'hidden'
const leftPanelState = computed(() => {
  const tool = activeTool.value
  if (tool === 'chapters') return 'expanded'
  if (tool === 'writing') return 'collapsed'
  return 'hidden'
})

// 右侧面板状态：'expanded' | 'collapsed' | 'hidden'
const rightPanelState = computed(() => {
  const tool = activeTool.value
  if (tool === 'ai-assistant' || tool === 'ai') return 'expanded'
  if (tool === 'writing') return 'collapsed'
  return 'hidden'
})

// 是否为沉浸模式
const isImmersiveMode = computed(() => activeTool.value === 'immersive')

// TODO: 从路由或store获取实际的项目ID和章节数据
const projectId = ref('')
const chapters = ref([])
const currentChapterId = ref('')

// TODO: 从store获取文档树数据
const treeData = ref([])

// 响应式布局
const {
  layout,
  switchTab,
  handleTouchGesture: handleGesture,
} = useResponsiveLayout()

// 移动端tab配置 - 根据面板可见性动态调整
const showRightPanel = computed(() => rightPanelVisible.value)

const mobileTabs = computed(() => {
  type TabKey = 'left' | 'editor' | 'right'
  const base: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: 'left', label: '目录', icon: 'List' },
    { key: 'editor', label: '编辑', icon: 'Edit' },
  ]
  if (showRightPanel.value) {
    base.push({ key: 'right', label: 'AI', icon: 'MagicStick' })
  }
  return base
})

// 计算属性：布局类名
const layoutClasses = computed(() => ({
  'layout-mode-mobile': layout.value.mode === 'mobile',
  'layout-mode-tablet': layout.value.mode === 'tablet',
  'layout-mode-desktop': layout.value.mode === 'desktop',
}))

const contentClasses = computed(() => ({
  'content-mobile': layout.value.mode === 'mobile',
  'content-tablet': layout.value.mode === 'tablet',
  'content-desktop': layout.value.mode === 'desktop',
}))

const leftPanelClasses = computed(() => ({
  'panel-overlay': layout.value.leftPanel.state === 'overlay',
  'panel-collapsed': leftPanelState.value === 'collapsed',
  'panel-expanded': leftPanelState.value === 'expanded',
  'panel-hidden': leftPanelState.value === 'hidden',
}))

const rightPanelClasses = computed(() => ({
  'panel-overlay': layout.value.rightPanel.state === 'overlay',
  'panel-collapsed': rightPanelState.value === 'collapsed',
  'panel-expanded': rightPanelState.value === 'expanded',
  'panel-hidden': rightPanelState.value === 'hidden',
}))

const leftPanelStyle = computed(() => {
  // 隐藏状态
  if (leftPanelState.value === 'hidden') {
    return { width: '0px', minWidth: '0px', overflow: 'hidden' }
  }
  // 折叠状态
  if (leftPanelState.value === 'collapsed') {
    return { width: '48px', minWidth: '48px' }
  }
  // 展开状态
  return {
    width: layout.value.mode === 'desktop'
      ? `${layout.value.leftPanel.width}px`
      : undefined
  }
})

const rightPanelStyle = computed(() => {
  // 隐藏状态
  if (rightPanelState.value === 'hidden') {
    return { width: '0px', minWidth: '0px', overflow: 'hidden' }
  }
  // 折叠状态
  if (rightPanelState.value === 'collapsed') {
    return { width: '48px', minWidth: '48px' }
  }
  // 展开状态
  return {
    width: layout.value.rightPanel.state === 'collapsed' ? '0px' : undefined
  }
})

const layoutModeLabel = computed(() => {
  const labels = {
    mobile: '移动模式',
    tablet: '平板模式',
    desktop: '桌面模式',
  }
  const modeLabel = labels[layout.value.mode]
  // 添加工具模式信息
  const toolLabels: Record<ActiveTool, string> = {
    chapters: '章节模式',
    writing: '写作模式',
    immersive: '沉浸模式',
    ai: 'AI助手模式',
  }
  return `${modeLabel} - ${toolLabels[activeTool.value]}`
})

// AR通知
const ariaAnnouncement = ref('')

// 触摸手势处理
const touchStartX = ref(0)
const touchStartY = ref(0)

function handleContentTouchStart(event: TouchEvent) {
  if (layout.value.mode !== 'mobile') return
  const touch = event.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
}

function handleContentTouchMove() {
  // 仅在移动端处理
  if (layout.value.mode !== 'mobile') return
}

function handleContentTouchEnd(event: TouchEvent) {
  if (layout.value.mode !== 'mobile') return

  const touch = event.changedTouches[0]
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value

  // 检查是否是水平滑动（距离大于垂直距离）
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    const direction = deltaX > 0 ? 'right' : 'left'
    handleGesture(direction)

    // 更新AR通知
    const tabLabels: Record<string, string> = {
      left: '目录',
      editor: '编辑',
      right: 'AI助手',
    }
    ariaAnnouncement.value = `已切换到${tabLabels[layout.value.activeTab]}`
    setTimeout(() => {
      ariaAnnouncement.value = ''
    }, 1000)
  }
}

function handleToolChange(toolId: string) {
  // MiniNavbar 发出的是 string 类型，需要转换
  const normalizedTool: ActiveTool = toolId === 'ai-assistant' ? 'ai' : toolId as ActiveTool

  // 更新内部状态和发出事件
  activeTool.value = normalizedTool
  emit('toolChange', normalizedTool)

  // 移动端：如果右侧面板不可见且当前在右侧tab，切换到编辑器
  if (!showRightPanel.value && layout.value.activeTab === 'right') {
    switchTab('editor')
  }

  // AR通知
  const toolLabels: Record<ActiveTool, string> = {
    chapters: '章节模式',
    writing: '写作模式',
    immersive: '沉浸模式',
    ai: 'AI助手模式',
  }
  ariaAnnouncement.value = `已切换到${toolLabels[normalizedTool]}`
  setTimeout(() => {
    ariaAnnouncement.value = ''
  }, 1000)
}

onMounted(() => {
  console.log('[EditorLayout] Mounted', {
    mode: layout.value.mode,
    leftPanel: layout.value.leftPanel,
    rightPanel: layout.value.rightPanel,
  })
})
</script>

<style scoped lang="scss">
.editor-layout {
  --editor-navbar-height: 52px;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 100dvh;
  background: #f1f5f9;
  color: #0f172a;
  overflow: hidden;
}

.editor-layout__content {
  display: flex;
  flex: 1;
  height: calc(100dvh - var(--editor-navbar-height));
  min-height: 0;
  overflow: hidden;
  position: relative;
  gap: 10px;
  padding: 0;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.editor-layout__main {
  order: 1;
  flex: 1;
  min-width: 0;
  min-height: 0;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  // 沉浸模式下编辑器占满全宽
  &.immersive-mode {
    flex: 1;
    max-width: 100%;
    border-radius: 0;
    margin: 0;
  }
}

// ==================== 面板过渡动画 ====================
// 左侧面板滑入滑出动画
.panel-slide-left-enter-active,
.panel-slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-left-enter-from,
.panel-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

// 右侧面板滑入滑出动画
.panel-slide-right-enter-active,
.panel-slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-right-enter-from,
.panel-slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

// ==================== 面板状态样式 ====================
.panel-collapsed {
  width: 48px !important;
  min-width: 48px !important;
  overflow: hidden;

  :deep(.side-panel) {
    .panel-header,
    .panel-content {
      opacity: 0;
      pointer-events: none;
    }
  }

  :deep(.panel-toggle) {
    display: flex;
  }
}

.panel-hidden {
  width: 0 !important;
  min-width: 0 !important;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.panel-expanded {
  :deep(.side-panel) {
    .panel-header,
    .panel-content {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.layout-mode-mobile {
  .editor-layout__content {
    flex-direction: column;
    height: auto;
  }

  .mobile-tabs {
    display: flex;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 0 8px;
    gap: 6px;

    .mobile-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 8px;
      background: #f8fafc;
      border: 1px solid #dbe3ef;
      border-radius: 8px;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s ease;

      &.active {
        color: #1d4ed8;
        border-color: #60a5fa;
        background: #eff6ff;
      }

      &:hover:not(.active) {
        background: #eef2ff;
      }
    }
  }

  .panel-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    background: #f8fafc;
    transform: translateX(100%);
    transition: transform 0.3s ease;

    &.panel-visible {
      transform: translateX(0);
    }
  }

  .left-panel,
  .right-panel,
  .editor-layout__main {
    display: none;

    &.panel-visible {
      display: block;
    }
  }

  .editor-layout__main.panel-visible {
    position: relative;
  }

  // 移动端沉浸模式
  .editor-layout__main.immersive-mode {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    border-radius: 0;
  }
}

.layout-mode-tablet {
  .left-panel,
  .right-panel {
    transition: width 0.3s ease, opacity 0.3s ease;
  }

  .panel-collapsed {
    width: 48px !important;

    :deep(.side-panel) {
      .panel-header,
      .panel-content {
        display: none;
      }
    }

    :deep(.panel-toggle) {
      display: flex;
    }
  }
}

.layout-mode-desktop {
  // 桌面端面板切换动画
  .editor-layout__main {
    transition: flex 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
