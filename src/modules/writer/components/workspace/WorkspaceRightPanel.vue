<template>
  <div
    class="workspace-right-panel-shell"
    :class="{ 'is-collapsed': collapsed, 'is-immersive-hidden': isImmersiveMode }"
  >
    <!-- 面板内容区 -->
    <div class="workspace-right-panel-body">
      <div class="workspace-right-panel-content">
        <div v-show="activeTab === 'chat'" class="workspace-right-panel-pane">
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
        <div v-show="activeTab === 'harness'" class="workspace-right-panel-pane">
          <div class="workspace-right-panel-harness-banner">
            <span class="workspace-right-panel-harness-banner__eyebrow">Story Harness</span>
            <strong>当前章节分析台</strong>
            <p>从侧边按钮进入，随时回切对话协作，不再占用顶部模式栏。</p>
          </div>
          <StoryHarnessPanel
            v-if="harnessData"
            :project-id="harnessData.projectId"
            :chapter-id="harnessData.chapterId"
            :chapter-title="harnessData.chapterTitle"
            :content="harnessData.content"
            :chapter-count="harnessData.chapterCount"
            :scope-label="harnessData.scopeLabel"
            :entity-stats="harnessData.entityStats"
            :active-characters="harnessData.activeCharacters"
            :active-relations="harnessData.activeRelations"
            :change-requests="harnessData.changeRequests"
            :handle-change-request-decision="harnessData.handleChangeRequestDecision"
            :handle-trigger-index="harnessData.handleTriggerIndex"
            :is-triggering-index="harnessData.isTriggeringIndex"
            @trigger-ai-action="(payload) => $emit('trigger-ai-action', payload)"
          />
        </div>
      </div>
    </div>

    <!-- Activity Bar（右侧竖排图标） -->
    <nav class="workspace-activity-bar" aria-label="右侧工具栏">
      <button
        class="workspace-activity-bar__item"
        :class="{ active: activeTab === 'chat' && !collapsed }"
        title="AI 助手"
        type="button"
        @click="handleChatActivityClick"
      >
        <QyIcon name="MagicStick" :size="18" />
      </button>
      <button
        class="workspace-activity-bar__item workspace-activity-bar__item--harness"
        :class="{ active: activeTab === 'harness' && !collapsed }"
        title="Story Harness"
        type="button"
        @click="handleHarnessActivityClick"
      >
        <span class="workspace-activity-bar__glyph">
          <QyIcon name="DataAnalysis" :size="16" />
          <span class="workspace-activity-bar__mini-label">H</span>
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import AIWorkbench from '@/modules/writer/components/workspace/AIWorkbench.vue'
import StoryHarnessPanel from '@/modules/writer/components/v3/story-harness/StoryHarnessPanel.vue'
import type {
  WriterAIActionTrigger,
  WriterAIApplyFeedback,
  WriterAIApplyPayload,
  WriterDraftProposal,
  WriterDraftProposalStatus,
  WriterResultCandidate,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import type {
  StoryHarnessChangeRequestDecision,
  StoryHarnessCharacterSummary,
  StoryHarnessChangeRequestPreview,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import type { WriterWorkflowActionRequest } from '@/modules/writer/types/workflow'

// =======================
// Types
// =======================
export type RightDockTool = 'ai' | 'harness'

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
  harnessData?: {
    projectId: string
    chapterId: string
    chapterTitle: string
    content: string
    chapterCount: number
    scopeLabel?: string
    entityStats?: {
      characters: number
      locations: number
      items: number
      concepts: number
    }
    activeCharacters?: StoryHarnessCharacterSummary[]
    activeRelations?: StoryHarnessRelationSummary[]
    changeRequests?: StoryHarnessChangeRequestPreview[]
    handleChangeRequestDecision?: (
      requestId: string,
      decision: StoryHarnessChangeRequestDecision,
    ) => Promise<boolean>
    handleTriggerIndex?: () => Promise<void>
    isTriggeringIndex?: boolean
  }
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'ai-apply', payload: WriterAIApplyPayload): void
  (e: 'proposal-draft', payload: WriterResultCandidate): void
  (
    e: 'proposal-status-change',
    payload: { proposalId: string; status: WriterDraftProposalStatus },
  ): void
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
}>()

// =======================
// Tab 状态
// =======================
const activeTab = ref<'chat' | 'harness'>('chat')

function handleChatActivityClick() {
  activeTab.value = 'chat'
  if (props.collapsed) {
    emit('toggle')
  }
}

function handleHarnessActivityClick() {
  activeTab.value = 'harness'
  if (props.collapsed) {
    emit('toggle')
  }
}
</script>

<style scoped lang="scss">
.workspace-right-panel-shell {
  --panel-shell-bg:
    radial-gradient(circle at top, rgba(34, 211, 238, 0.18), transparent 32%),
    linear-gradient(180deg, rgba(247, 250, 252, 0.98), rgba(238, 244, 250, 0.96));
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: row;
  width: 100%;
  min-width: 0;
  position: relative;
  background: var(--panel-shell-bg);
  border-left: 1px solid var(--editor-border, #e2e8f0);
  box-shadow:
    inset 1px 0 0 rgba(255, 255, 255, 0.75),
    -14px 0 28px rgba(15, 23, 42, 0.04);
}

.workspace-right-panel-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 252, 255, 0.92));
  backdrop-filter: blur(16px);
  transition:
    opacity 200ms ease-out,
    width 200ms ease-out;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.workspace-right-panel-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.workspace-right-panel-pane {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.workspace-right-panel-harness-banner {
  display: grid;
  gap: 4px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  background:
    radial-gradient(circle at top left, rgba(250, 204, 21, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.9));

  strong {
    font-size: 14px;
    line-height: 1.2;
    color: #1f2937;
  }

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.45;
    color: #6b7280;
  }
}

.workspace-right-panel-harness-banner__eyebrow {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  min-height: 22px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(251, 191, 36, 0.14);
  color: #b45309;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

// Activity Bar
.workspace-activity-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  width: 48px;
  min-width: 48px;
  background:
    linear-gradient(180deg, rgba(240, 249, 255, 0.98), rgba(224, 242, 254, 0.95));
  border-left: 1px solid var(--editor-border, #e2e8f0);
  gap: 6px;
  box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.85);

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: rgba(255, 255, 255, 0.42);
    color: var(--editor-actbar-icon, #475569);
    cursor: pointer;
    transition:
      background 160ms ease-out,
      color 160ms ease-out,
      transform 160ms ease-out,
      border-color 160ms ease-out,
      box-shadow 160ms ease-out;

    &:hover {
      background: rgba(255, 255, 255, 0.92);
      color: var(--editor-text-primary, #0f172a);
      border-color: rgba(148, 163, 184, 0.24);
    }

    &.active {
      transform: translateX(-1px);
      background:
        linear-gradient(180deg, rgba(14, 165, 233, 0.16), rgba(34, 211, 238, 0.12)),
        rgba(255, 255, 255, 0.96);
      color: #0284c7;
      border-color: rgba(14, 165, 233, 0.18);
      box-shadow: 0 8px 18px rgba(14, 165, 233, 0.18);
    }
  }

  &__item--harness {
    position: relative;
  }

  &__glyph {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__mini-label {
    position: absolute;
    right: -6px;
    bottom: -5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 13px;
    height: 13px;
    padding: 0 3px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(251, 191, 36, 0.98), rgba(245, 158, 11, 0.96));
    color: #fff7ed;
    font-size: 8px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.02em;
    box-shadow:
      0 4px 10px rgba(180, 83, 9, 0.24),
      0 0 0 1.5px rgba(255, 255, 255, 0.92);
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
