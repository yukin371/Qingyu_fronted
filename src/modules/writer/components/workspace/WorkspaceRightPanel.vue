<template>
  <div
    class="workspace-right-panel-shell"
    :class="{ 'is-collapsed': collapsed, 'is-immersive-hidden': isImmersiveMode }"
  >
    <!-- 面板内容区 -->
    <div class="workspace-right-panel-body">
      <!-- AI 助手 -->
      <AIWorkbench
        v-if="activeDockTool === 'ai'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :source-text="sourceText"
        :action-trigger="aiActionTrigger"
        :ai-apply-feedback="aiApplyFeedback"
        @send="(msg: string) => $emit('ai-send', msg)"
        @apply-generated-text="(payload: AIApplyPayload) => $emit('ai-apply', payload)"
      />
      <!-- 设定百科 -->
      <EncyclopediaView
        v-else-if="activeDockTool === 'encyclopedia'"
        :embedded="true"
        :project-id="projectId"
      />
      <!-- 写作统计（占位） -->
      <div v-else-if="activeDockTool === 'stats'" class="panel-placeholder">
        <QyIcon name="DataAnalysis" :size="32" />
        <span>写作统计</span>
        <p>即将推出</p>
      </div>
    </div>

    <!-- Activity Bar（右侧竖排图标） -->
    <nav class="workspace-activity-bar" aria-label="右侧工具栏">
      <button
        v-for="item in activityItems"
        :key="item.tool"
        class="workspace-activity-bar__item"
        :class="{ active: activeDockTool === item.tool && !collapsed }"
        :title="item.label"
        type="button"
        @click="handleActivityClick(item.tool)"
      >
        <QyIcon :name="item.icon" :size="18" />
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import AIWorkbench from '@/modules/writer/components/workspace/AIWorkbench.vue'
import EncyclopediaView from '@/modules/writer/views/EncyclopediaView.vue'

// =======================
// Types
// =======================
export type RightDockTool = 'ai' | 'encyclopedia' | 'stats'

export interface AIActionTrigger {
  id: number
  action: string
  text: string
  instructions?: string
  applyMode?: 'replace_selection' | 'insert_after_selection' | 'append_paragraph' | 'replace_document'
}

export interface AIApplyPayload {
  action: string
  sourceText: string
  generatedText: string
  applyMode?: 'replace_selection' | 'insert_after_selection' | 'append_paragraph' | 'replace_document'
}

export interface AIApplyFeedback {
  status: 'idle' | 'success' | 'fallback'
  title: string
  detail: string
  mode?: 'replace_selection' | 'insert_after_selection' | 'append_paragraph' | 'replace_document'
  updatedAt: number
}

// =======================
// Props & Emits
// =======================
const props = defineProps<{
  collapsed: boolean
  isImmersiveMode: boolean
  activeRightDockTool?: RightDockTool
  projectId: string
  chapterId: string
  chapterTitle: string
  sourceText: string
  aiActionTrigger: AIActionTrigger | null
  aiApplyFeedback: AIApplyFeedback | null
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'ai-send', message: string): void
  (e: 'ai-apply', payload: AIApplyPayload): void
}>()

// =======================
// Activity Bar
// =======================
const activityItems = [
  { tool: 'ai' as RightDockTool, label: 'AI 助手', icon: 'MagicStick' },
  { tool: 'encyclopedia' as RightDockTool, label: '设定百科', icon: 'Reading' },
  { tool: 'stats' as RightDockTool, label: '写作统计', icon: 'DataAnalysis' },
]

const activeDockTool = ref<RightDockTool>(props.activeRightDockTool ?? 'ai')

function handleActivityClick(tool: RightDockTool) {
  if (activeDockTool.value === tool && !props.collapsed) {
    // 点击已激活图标 → 折叠面板
    emit('toggle')
  } else {
    activeDockTool.value = tool
    if (props.collapsed) {
      emit('toggle')
    }
  }
}
</script>

<style scoped lang="scss">
.workspace-right-panel-shell {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: row;
  width: 100%;
  min-width: 0;
  position: relative;
  background: var(--editor-bg-surface, #f8fafc);
  border-left: 1px solid var(--editor-border, #e2e8f0);
}

.workspace-right-panel-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
  background: var(--editor-bg-base, #ffffff);
  transition: opacity 200ms ease-out, width 200ms ease-out;
}

// Activity Bar
.workspace-activity-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  width: 44px;
  min-width: 44px;
  background: var(--editor-bg-actbar, #f1f5f9);
  border-left: 1px solid var(--editor-border, #e2e8f0);
  gap: 2px;

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--editor-radius-md, 6px);
    border: none;
    background: transparent;
    color: var(--editor-actbar-icon, #64748b);
    cursor: pointer;
    transition: background 120ms ease-out, color 120ms ease-out;

    &:hover {
      background: var(--editor-bg-elevated, #e8edf2);
      color: var(--editor-text-primary, #0f172a);
    }

    &.active {
      background: var(--editor-accent-soft, #ecfeff);
      color: var(--editor-accent, #06b6d4);
    }
  }
}

// 折叠状态：内容区收起，Activity Bar 保持可见
.workspace-right-panel-shell.is-collapsed {
  .workspace-right-panel-body {
    width: 0;
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
  }
}

.workspace-right-panel-shell.is-immersive-hidden {
  display: none;
}

// 占位面板
.panel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--editor-text-ghost, #94a3b8);

  span {
    font-size: 14px;
    font-weight: 500;
    color: var(--editor-text-muted, #64748b);
  }

  p {
    font-size: 12px;
    margin: 0;
  }
}
</style>
