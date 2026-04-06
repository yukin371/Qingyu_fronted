<template>
  <section class="ai-workbench">
    <header class="ai-workbench__header">
      <div class="ai-workbench__title-group">
        <span class="ai-workbench__title">AI 助手</span>
        <p v-if="workflowSummary" class="ai-workbench__summary">{{ workflowSummary }}</p>
      </div>
      <span v-if="draftProposals.length" class="ai-workbench__badge">
        草案 {{ draftProposals.length }}
      </span>
    </header>

    <nav class="ai-workbench__tabs" aria-label="AI 工具标签">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="ai-workbench__tab"
        :class="{ active: activeTab === tab.id }"
        :title="tab.description"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div
      v-if="aiApplyFeedback"
      class="apply-feedback"
      :class="`apply-feedback--${aiApplyFeedback.status}`"
    >
      <div>
        <strong>{{ aiApplyFeedback.title }}</strong>
        <p>{{ aiApplyFeedback.detail }}</p>
      </div>
      <span class="apply-feedback__mode">
        {{ aiApplyFeedback.mode ? `模式 ${applyModeText(aiApplyFeedback.mode)}` : '已更新正文' }}
      </span>
    </div>

    <section
      v-if="latestResultCandidate"
      class="workflow-result-card"
      data-testid="workflow-result-card"
    >
      <div>
        <strong>{{ latestResultCandidate.title }}</strong>
        <p>{{ latestResultCandidate.summary }}</p>
      </div>
      <button type="button" class="workflow-result-card__action" @click="handlePromoteToProposal">
        暂存为提案
      </button>
    </section>

    <section
      v-if="primaryDraftProposal"
      class="proposal-card"
      data-testid="proposal-card"
    >
      <div class="proposal-card__header">
        <div>
          <strong>{{ primaryDraftProposal.title }}</strong>
          <p>{{ primaryDraftProposal.summary }}</p>
        </div>
        <span class="proposal-card__status">{{ proposalStatusText(primaryDraftProposal.status) }}</span>
      </div>
      <div class="proposal-card__meta">
        <span>{{ proposalKindText(primaryDraftProposal.kind) }}</span>
        <span>{{ proposalSourceText(primaryDraftProposal.source) }}</span>
      </div>
      <div class="proposal-card__actions">
        <button
          v-if="primaryDraftProposal.status === 'draft'"
          type="button"
          class="proposal-card__action"
          @click="emit('proposalStatusChange', { proposalId: primaryDraftProposal.id, status: 'selected' })"
        >
          保留方向
        </button>
        <button
          v-if="primaryDraftProposal.status !== 'discarded'"
          type="button"
          class="proposal-card__action proposal-card__action--ghost"
          @click="emit('proposalStatusChange', { proposalId: primaryDraftProposal.id, status: 'discarded' })"
        >
          丢弃
        </button>
      </div>
    </section>

    <div class="ai-workbench__panel">
      <RewriteWorkbenchTool
        v-if="activeTab === 'rewrite'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
        :workflow-context="workflowContext"
        @apply="(payload) => emit('applyGeneratedText', payload)"
      />

      <SummaryWorkbenchTool
        v-else-if="activeTab === 'summary'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
        @result-candidate="handleResultCandidate"
      />

      <ReviewWorkbenchTool
        v-else-if="activeTab === 'review'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
        @result-candidate="handleResultCandidate"
      />

      <AIPanel
        v-else
        :session-id="projectId"
        :action-trigger="actionTrigger"
        :workflow-context="workflowContext"
        @apply-generated-text="(payload: WriterAIApplyPayload) => emit('applyGeneratedText', payload)"
        @result-candidate="handleResultCandidate"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AIPanel from '@/modules/writer/components/editor/AIPanel.vue'
import RewriteWorkbenchTool from '@/modules/writer/components/workspace/ai-tools/RewriteWorkbenchTool.vue'
import SummaryWorkbenchTool from '@/modules/writer/components/workspace/ai-tools/SummaryWorkbenchTool.vue'
import ReviewWorkbenchTool from '@/modules/writer/components/workspace/ai-tools/ReviewWorkbenchTool.vue'
import type {
  WriterAIActionTrigger,
  WriterAIApplyFeedback,
  WriterAIApplyPayload,
  WriterDraftProposal,
  WriterDraftProposalKind,
  WriterDraftProposalSource,
  WriterDraftProposalStatus,
  WriterResultCandidate,
  WriterWorkbenchTab,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import { resolveWriterWorkflowTab } from '@/modules/writer/types/workflow'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  sourceText: string
  actionTrigger: WriterAIActionTrigger | null
  aiApplyFeedback: WriterAIApplyFeedback | null
  workflowContext: WriterWorkflowContext
  draftProposals: WriterDraftProposal[]
}>()

const emit = defineEmits<{
  (e: 'applyGeneratedText', payload: WriterAIApplyPayload): void
  (e: 'proposalDraft', payload: WriterResultCandidate): void
  (
    e: 'proposalStatusChange',
    payload: { proposalId: string; status: WriterDraftProposalStatus },
  ): void
}>()

const activeTab = ref<WriterWorkbenchTab>('chat')
const latestResultCandidate = ref<WriterResultCandidate | null>(null)

const tabs: Array<{ id: WriterWorkbenchTab; label: string; description: string }> = [
  { id: 'rewrite', label: '改写', description: '续写 / 润色 / 扩写' },
  { id: 'summary', label: '总结', description: '摘要 / 章节提炼' },
  { id: 'review', label: '审校', description: '校对 / 风险检查' },
  { id: 'chat', label: '对话', description: '开放式协作' },
]

const actionDrivenTab = computed<WriterWorkbenchTab | null>(() =>
  resolveWriterWorkflowTab(props.actionTrigger?.action),
)

const workflowSummary = computed(() => {
  const parts = [
    props.workflowContext.chapterTitle || '',
    props.workflowContext.scopeLabel || '',
    props.workflowContext.pendingChangeRequestCount > 0
      ? `待处理 ${props.workflowContext.pendingChangeRequestCount}`
      : '',
  ].filter(Boolean)

  return parts.join(' · ')
})

const primaryDraftProposal = computed<WriterDraftProposal | null>(() => {
  if (props.draftProposals.length === 0) {
    return null
  }

  return (
    props.draftProposals.find((proposal) => proposal.status !== 'discarded') ||
    props.draftProposals[0]
  )
})

watch(
  () => props.actionTrigger?.id,
  () => {
    if (actionDrivenTab.value) {
      activeTab.value = actionDrivenTab.value
    }
  },
)

function applyModeText(mode: NonNullable<WriterAIActionTrigger['applyMode']>) {
  if (mode === 'replace_selection') return '替换选区'
  if (mode === 'insert_after_selection') return '插入后方'
  if (mode === 'replace_document') return '替换全文'
  return '追加段落'
}

function handleResultCandidate(payload: WriterResultCandidate) {
  latestResultCandidate.value = payload
}

function handlePromoteToProposal() {
  if (!latestResultCandidate.value) {
    return
  }

  emit('proposalDraft', latestResultCandidate.value)
  latestResultCandidate.value = null
}

function proposalStatusText(status: WriterDraftProposalStatus) {
  if (status === 'selected') return '已保留'
  if (status === 'discarded') return '已丢弃'
  return '草案'
}

function proposalKindText(kind: WriterDraftProposalKind) {
  return kind === 'chapter-direction' ? '章节方向' : '正文候选'
}

function proposalSourceText(source: WriterDraftProposalSource) {
  if (source === 'summary-workbench') return '来自总结'
  if (source === 'review-workbench') return '来自审校'
  if (source === 'rewrite-workbench') return '来自改写'
  return '来自对话'
}
</script>

<style scoped lang="scss">
.ai-workbench {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: transparent;
  color: #1f2430;
}

.ai-workbench__header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--editor-border, rgba(0, 0, 0, 0.06));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ai-workbench__title-group {
  min-width: 0;
}

.ai-workbench__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--editor-text-primary, #0f172a);
  letter-spacing: 0.01em;
}

.ai-workbench__summary {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--editor-text-muted, #64748b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-workbench__badge {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 4px 8px;
  background: rgba(15, 23, 42, 0.06);
  color: var(--editor-text-muted, #64748b);
  font-size: 11px;
  font-weight: 700;
}

.ai-workbench__tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--editor-border, rgba(0, 0, 0, 0.06));
}

.ai-workbench__tab {
  flex: 1;
  text-align: center;
  border: 1px solid transparent;
  background: transparent;
  border-radius: var(--editor-radius-md, 6px);
  padding: 5px 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: var(--editor-text-muted, #64748b);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.ai-workbench__tab:hover {
  background: var(--editor-bg-elevated, #f1f5f9);
  color: var(--editor-text-primary, #0f172a);
}

.ai-workbench__tab.active {
  background: var(--editor-accent-soft, #ecfeff);
  border-color: var(--editor-accent, rgba(6, 182, 212, 0.3));
  color: var(--editor-accent, #06b6d4);
  font-weight: 600;
}

.workflow-result-card,
.proposal-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--editor-border, rgba(0, 0, 0, 0.06));
  background: rgba(248, 250, 252, 0.8);
}

.workflow-result-card strong,
.proposal-card strong {
  display: block;
  font-size: 12px;
  color: var(--editor-text-primary, #0f172a);
}

.workflow-result-card p,
.proposal-card p {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--editor-text-muted, #64748b);
}

.workflow-result-card__action,
.proposal-card__action {
  border: none;
  border-radius: 999px;
  padding: 6px 10px;
  background: var(--editor-accent-soft, #ecfeff);
  color: var(--editor-accent, #0891b2);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.proposal-card {
  display: block;
}

.proposal-card__header,
.proposal-card__actions,
.proposal-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.proposal-card__meta {
  margin-top: 8px;
  font-size: 11px;
  color: var(--editor-text-muted, #64748b);
}

.proposal-card__actions {
  margin-top: 10px;
  justify-content: flex-start;
}

.proposal-card__status {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 3px 8px;
  background: rgba(14, 165, 233, 0.1);
  color: #0369a1;
  font-size: 10px;
  font-weight: 700;
}

.proposal-card__action--ghost {
  background: rgba(15, 23, 42, 0.06);
  color: var(--editor-text-muted, #64748b);
}

.ai-workbench__panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 16px 18px 18px;
}

.apply-feedback {
  margin: 14px 18px 0;
  padding: 12px 14px;
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid rgba(117, 93, 67, 0.16);
  background: rgba(255, 251, 245, 0.9);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 14px 24px rgba(82, 49, 22, 0.06);
}

.apply-feedback strong {
  display: block;
  color: #241f19;
  font-size: 13px;
}

.apply-feedback p {
  margin: 4px 0 0;
  color: #6e6358;
  font-size: 12px;
  line-height: 1.5;
}

.apply-feedback--success {
  border-color: rgba(53, 132, 103, 0.2);
  background: linear-gradient(145deg, rgba(236, 250, 244, 0.96), rgba(249, 255, 252, 0.94));
}

.apply-feedback--fallback {
  border-color: rgba(143, 63, 47, 0.2);
  background: linear-gradient(145deg, rgba(255, 241, 232, 0.96), rgba(255, 250, 245, 0.94));
}

.apply-feedback__mode {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.16);
  background: rgba(255, 255, 255, 0.72);
  color: #5f4e40;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 9px;
}

@media (max-width: 1280px) {
  .ai-workbench__tabs {
    gap: 3px;
  }

  .ai-workbench__tab {
    font-size: 11px;
    padding: 4px 6px;
  }
}

@media (max-width: 768px) {
  .ai-workbench__title-row {
    flex-direction: column;
  }

  .ai-workbench__tabs {
    grid-template-columns: 1fr;
  }

  .apply-feedback {
    flex-direction: column;
  }
}
</style>
