<template>
  <Transition name="tool-overlay">
    <div v-if="visible" class="tool-overlay" @click.self="handleClose">
      <div class="tool-overlay__container">
        <!-- 顶部横条 -->
        <header class="tool-overlay__header">
          <div class="header-title">
            <QyIcon :name="currentToolIcon" :size="20" />
            <span>{{ currentToolName }}</span>
          </div>
          <div class="header-actions">
            <QyGhostButton size="small" @click="handleClose">
              <QyIcon name="Close" :size="16" />
              关闭 (Esc)
            </QyGhostButton>
          </div>
        </header>

        <!-- 主体区域：侧边栏 + 内容 -->
        <div class="tool-overlay__body">
          <!-- 侧边栏切换器 -->
          <ToolSidebar
            :active-tool="activeTool"
            @tool-change="handleToolChange"
          />

          <!-- 工具内容区 -->
          <div class="tool-overlay__content">
            <KeepAlive>
              <component
                :is="toolComponentMap[activeTool]"
                :project-id="projectId"
                :chapter-id="chapterId"
                :chapter-title="chapterTitle"
                :chapters="chapters"
                @status-change="(chips: string[]) => emit('status-change', chips)"
                @open-graph="(chapterId: string) => emit('open-graph', chapterId)"
                @jump-to-chapter="(chapterId: string) => emit('jump-to-chapter', chapterId)"
              />
            </KeepAlive>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import QyGhostButton from '@/design-system/components/basic/QyGhostButton/QyGhostButton.vue'
import ToolSidebar from './tool-overlay/ToolSidebar.vue'
import CharacterGraphView from '@/modules/writer/views/CharacterGraphView.vue'
import TimelineOutlineView from '@/modules/writer/views/TimelineOutlineView.vue'
import StoryBranchView from '@/modules/writer/views/StoryBranchView.vue'
import StructureStageView from '@/modules/writer/components/workspace/structure/StructureStageView.vue'
import { useToolOverlay, type ToolType } from '@/modules/writer/composables/useToolOverlay'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'

// =======================
// Props 定义
// =======================
interface Props {
  /** 是否显示覆盖层 */
  visible: boolean
  /** 当前激活的工具 */
  activeTool: ToolType
  /** 当前项目 ID */
  projectId: string
  /** 当前章节 ID */
  chapterId: string
  /** 当前章节标题 */
  chapterTitle: string
  /** 章节列表 */
  chapters: SidebarChapterSummary[]
}

const props = defineProps<Props>()

// =======================
// Emits 定义
// =======================
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'tool-change', toolId: ToolType): void
  (e: 'status-change', chips: string[]): void
  (e: 'open-graph', chapterId: string): void
  (e: 'jump-to-chapter', chapterId: string): void
}>()

// =======================
// 工具信息
// =======================
const { getToolName, getToolIcon } = useToolOverlay()

const currentToolName = computed(() => getToolName(props.activeTool))
const currentToolIcon = computed(() => getToolIcon(props.activeTool))

// =======================
// 工具组件映射
// =======================
const toolComponentMap: Record<ToolType, unknown> = {
  relations: markRaw(CharacterGraphView),
  timeline: markRaw(TimelineOutlineView),
  branches: markRaw(StoryBranchView),
  structure: markRaw(StructureStageView),
}

// =======================
// 事件处理
// =======================
const handleClose = () => {
  emit('close')
}

const handleToolChange = (toolId: ToolType) => {
  emit('tool-change', toolId)
}
</script>

<style scoped lang="scss">
.tool-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  &__container {
    width: 100%;
    height: 100%;
    max-width: 1600px;
    background: var(--editor-bg-surface);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  }

  &__header {
    height: 52px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: var(--editor-bg-elevated);
    border-bottom: 1px solid var(--editor-border);

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--editor-text-primary);
      font-size: 15px;
      font-weight: 600;
    }
  }

  &__body {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }

  &__content {
    flex: 1;
    min-width: 0;
    overflow: auto;
    background: var(--editor-bg-surface);
  }
}

// 过渡动画
.tool-overlay-enter-active,
.tool-overlay-leave-active {
  transition: opacity 0.2s ease;

  .tool-overlay__container {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
}

.tool-overlay-enter-from,
.tool-overlay-leave-to {
  opacity: 0;

  .tool-overlay__container {
    transform: scale(0.95);
    opacity: 0;
  }
}
</style>
