<template>
  <div
    class="workspace-right-panel-shell"
    :class="{ 'is-collapsed': collapsed, 'is-immersive-hidden': isImmersiveMode }"
  >
    <!-- 面板内容区 -->
    <div class="workspace-right-panel-body">
      <AIWorkbench
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :source-text="sourceText"
        :action-trigger="aiActionTrigger"
        :ai-apply-feedback="aiApplyFeedback"
        :workflow-context="workflowContext"
        :draft-proposals="draftProposals"
        @apply-generated-text="(payload: WriterAIApplyPayload) => $emit('ai-apply', payload)"
        @proposal-draft="(payload) => $emit('proposal-draft', payload)"
        @proposal-status-change="(payload) => $emit('proposal-status-change', payload)"
      />
    </div>

    <!-- Activity Bar（右侧竖排图标） -->
    <nav class="workspace-activity-bar" aria-label="右侧工具栏">
      <button
        class="workspace-activity-bar__item"
        :class="{ active: !collapsed }"
        title="AI 助手"
        type="button"
        @click="handleActivityClick"
      >
        <QyIcon name="MagicStick" :size="18" />
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import AIWorkbench from '@/modules/writer/components/workspace/AIWorkbench.vue'
import type {
  WriterAIActionTrigger,
  WriterAIApplyFeedback,
  WriterAIApplyPayload,
  WriterDraftProposal,
  WriterDraftProposalStatus,
  WriterResultCandidate,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'

// =======================
// Types
// =======================
export type RightDockTool = 'ai'

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
  aiActionTrigger: WriterAIActionTrigger | null
  aiApplyFeedback: WriterAIApplyFeedback | null
  workflowContext: WriterWorkflowContext
  draftProposals: WriterDraftProposal[]
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'ai-apply', payload: WriterAIApplyPayload): void
  (e: 'proposal-draft', payload: WriterResultCandidate): void
  (
    e: 'proposal-status-change',
    payload: { proposalId: string; status: WriterDraftProposalStatus },
  ): void
}>()

function handleActivityClick() {
  if (!props.collapsed) {
    emit('toggle')
    return
  }

  emit('toggle')
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
