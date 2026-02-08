<template>
  <div
    class="editor-layout"
    :class="layoutClasses"
    role="application"
    :aria-label="`编辑器，${layoutModeLabel}`"
  >
    <!-- 顶部导航栏 -->
    <MiniNavbar />

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
      <!-- 左侧面板 -->
      <ResizablePanel
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
          :class="{ 'panel-visible': layout.leftPanel.visible }"
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

      <!-- 中间编辑器 -->
      <div
        class="editor-layout__main"
        :class="{ 'panel-visible': layout.activeTab === 'editor' }"
      >
        <slot name="editor">
          <!-- 默认内容 -->
          <EditorPanel />
        </slot>
      </div>

      <!-- 右侧AI助手 -->
      <ResizablePanel
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
          :class="{ 'panel-visible': layout.rightPanel.visible }"
        >
          <slot name="right-panel">
            <!-- 默认内容 -->
            <AIPanel />
          </slot>
        </SidePanel>
      </ResizablePanel>
    </div>

    <!-- 屏幕阅读器实时通知 -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ ariaAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import MiniNavbar from './MiniNavbar.vue'
import ResizablePanel from './ResizablePanel.vue'
import SidePanel from './SidePanel.vue'
import EditorPanel from './EditorPanel.vue'
import AIPanel from './AIPanel.vue'
import ProjectTree from '../ProjectTree.vue'
import ChapterTree from '../DocumentTree.vue'
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'

// ==================== 插槽类型定义 ====================
defineSlots<{
  'left-panel'?: () => unknown
  'editor'?: () => unknown
  'right-panel'?: () => unknown
}>()

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

// 移动端tab配置
const mobileTabs = [
  { key: 'left' as const, label: '目录', icon: 'List' },
  { key: 'editor' as const, label: '编辑', icon: 'Edit' },
  { key: 'right' as const, label: 'AI', icon: 'MagicStick' },
]

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
  'panel-collapsed': layout.value.leftPanel.state === 'collapsed',
  'panel-expanded': layout.value.leftPanel.state === 'expanded',
}))

const rightPanelClasses = computed(() => ({
  'panel-overlay': layout.value.rightPanel.state === 'overlay',
  'panel-collapsed': layout.value.rightPanel.state === 'collapsed',
  'panel-expanded': layout.value.rightPanel.state === 'expanded',
}))

const leftPanelStyle = computed(() => ({
  width: layout.value.leftPanel.state === 'collapsed' ? '0px' : undefined,
}))

const rightPanelStyle = computed(() => ({
  width: layout.value.rightPanel.state === 'collapsed' ? '0px' : undefined,
}))

const layoutModeLabel = computed(() => {
  const labels = {
    mobile: '移动模式',
    tablet: '平板模式',
    desktop: '桌面模式',
  }
  return labels[layout.value.mode]
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

function handleContentTouchMove(_event: TouchEvent) {
  // 仅在移动端处理
  if (layout.value.mode !== 'mobile') return
}

function handleContentTouchEnd(_event: TouchEvent) {
  if (layout.value.mode !== 'mobile') return

  const touch = _event.changedTouches[0]
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);

  &__content {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
  }
}

// ==================== 移动端布局 ====================
.layout-mode-mobile {
  .editor-layout__content {
    flex-direction: column;
  }

  .mobile-tabs {
    display: flex;
    background: var(--qy-editor-bg-secondary);
    border-bottom: 1px solid var(--qy-editor-border-color);
    padding: 0 8px;

    .mobile-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 8px;
      background: transparent;
      border: none;
      color: var(--qy-editor-text-secondary);
      cursor: pointer;
      transition: all 0.2s var(--qy-editor-ease-standard);

      &.active {
        color: var(--qy-editor-primary);
        border-bottom: 2px solid var(--qy-editor-primary);
      }

      &:hover:not(.active) {
        background: var(--qy-editor-hover-bg);
      }
    }
  }

  // 面板覆盖模式
  .panel-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    background: var(--qy-editor-bg-primary);
    transform: translateX(100%);
    transition: transform 0.3s var(--qy-editor-ease-decelerate);

    &.panel-visible {
      transform: translateX(0);
    }
  }

  // 只显示激活的面板
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
}

// ==================== 平板端布局 ====================
.layout-mode-tablet {
  .left-panel,
  .right-panel {
    transition: width 0.3s var(--qy-editor-ease-standard);
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

// ==================== 桌面端布局 ====================
.layout-mode-desktop {
  .editor-layout__content {
    // 完整3栏布局
  }
}

// ==================== 面板状态 ====================
.panel-overlay {
  // 移动端覆盖模式
}

.panel-collapsed {
  // 折叠状态
}

.panel-expanded {
  // 展开状态
}

// ==================== 屏幕阅读器专用 ====================
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
