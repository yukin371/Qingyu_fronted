<template>
  <section class="ai-workbench">
    <header class="ai-workbench__header">
      <span class="ai-workbench__title">AI 助手</span>
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

    <section
      v-if="hasWorkflowRail"
      class="workflow-rail"
      data-testid="workflow-state-rail"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        v-if="visibleApplyFeedback"
        class="apply-feedback workflow-feedback-strip"
        :class="`apply-feedback--${visibleApplyFeedback.status}`"
        data-testid="workflow-feedback-strip"
      >
        <div class="apply-feedback__content">
          <strong>{{ visibleApplyFeedback.title }}</strong>
          <p>{{ visibleApplyFeedback.detail }}</p>
        </div>
        <span class="apply-feedback__mode">
          {{
            visibleApplyFeedback.mode
              ? `模式 ${applyModeText(visibleApplyFeedback.mode)}`
              : '已更新正文'
          }}
        </span>
      </div>

      <div
        v-if="visibleProposalLifecycleFeedback"
        class="proposal-feedback workflow-feedback-strip"
        :class="`proposal-feedback--${visibleProposalLifecycleFeedback.status}`"
        data-testid="proposal-feedback-strip"
      >
        <div class="apply-feedback__content">
          <strong>{{ visibleProposalLifecycleFeedback.title }}</strong>
          <p>{{ visibleProposalLifecycleFeedback.detail }}</p>
        </div>
        <span class="apply-feedback__mode">
          {{ visibleProposalLifecycleFeedback.source }}
        </span>
      </div>

      <section
        v-if="primaryDraftProposal"
        class="proposal-card workflow-proposal-card"
        :class="{ 'proposal-card--condensed': shouldCondensePrimaryProposal }"
        data-testid="proposal-card"
      >
        <div class="proposal-card__content">
          <div class="workflow-card__meta proposal-card__meta" data-testid="proposal-card-meta">
            <span class="workflow-chip workflow-chip--status">
              {{ proposalStatusText(primaryDraftProposal.status) }}
            </span>
            <span class="workflow-chip">{{ proposalKindText(primaryDraftProposal.kind) }}</span>
            <span class="workflow-chip">{{ proposalSourceText(primaryDraftProposal.source) }}</span>
          </div>
          <div class="proposal-card__header">
            <div>
              <strong>{{ primaryDraftProposal.title }}</strong>
              <p v-if="!shouldCondensePrimaryProposal" data-testid="proposal-card-summary">
                {{ primaryDraftProposal.summary }}
              </p>
            </div>
          </div>
        </div>
        <div class="proposal-card__actions">
          <button
            v-if="primaryDraftProposal.status === 'draft'"
            type="button"
            class="proposal-card__action"
            :aria-label="`将 ${primaryDraftProposal.title} 定为当前${proposalKindText(primaryDraftProposal.kind)}`"
            @click="
              emit('proposalStatusChange', {
                proposalId: primaryDraftProposal.id,
                status: 'selected',
              })
            "
          >
            {{ proposalSelectActionText(primaryDraftProposal.kind) }}
          </button>
          <button
            v-if="primaryDraftProposal.status !== 'discarded'"
            type="button"
            class="proposal-card__action proposal-card__action--ghost"
            :aria-label="proposalDismissAriaLabelText(primaryDraftProposal)"
            @click="
              emit('proposalStatusChange', {
                proposalId: primaryDraftProposal.id,
                status: 'discarded',
              })
            "
          >
            {{ proposalDismissActionText(primaryDraftProposal.status) }}
          </button>
        </div>
      </section>

      <section
        v-if="latestResultCandidate"
        class="workflow-result-card workflow-result-candidate"
        :class="{
          'workflow-result-card--secondary': !!primaryDraftProposal,
          'workflow-result-card--condensed': shouldCondenseResultCandidate,
        }"
        data-testid="workflow-result-card"
      >
        <div class="workflow-result-card__content">
          <div class="workflow-card__meta" data-testid="workflow-result-meta">
            <span class="workflow-chip workflow-chip--accent">候选</span>
            <span class="workflow-chip">{{ resultSourceText(latestResultCandidate.source) }}</span>
            <span class="workflow-chip">{{ resultKindText(latestResultCandidate) }}</span>
          </div>
          <div>
            <strong>{{ latestResultCandidate.title }}</strong>
            <p v-if="!shouldCondenseResultCandidate" data-testid="workflow-result-summary">
              {{ latestResultCandidate.summary }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="workflow-result-card__action workflow-result-action"
          data-testid="workflow-result-action"
          :aria-label="`将 ${latestResultCandidate.title} 存为${resultKindText(latestResultCandidate)}提案`"
          @click="handlePromoteToProposal"
        >
          {{ resultPromoteActionText(latestResultCandidate) }}
        </button>
      </section>

      <section
        v-if="visibleDiffPreview"
        class="workflow-diff-card"
        data-testid="workflow-diff-card"
      >
        <div class="workflow-card__meta">
          <span class="workflow-chip workflow-chip--accent">变更预览</span>
          <span class="workflow-chip">{{ diffModeText }}</span>
        </div>
        <div class="workflow-diff-card__grid">
          <div class="workflow-diff-card__column">
            <span class="workflow-diff-card__label">修改前</span>
            <p class="workflow-diff-card__text">{{ visibleDiffPreview.before }}</p>
          </div>
          <div class="workflow-diff-card__column workflow-diff-card__column--after">
            <span class="workflow-diff-card__label">修改后</span>
            <p class="workflow-diff-card__text">{{ visibleDiffPreview.after }}</p>
          </div>
        </div>
      </section>
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
        :source-text="sourceText"
        :action-trigger="actionTrigger"
        :workflow-context="workflowContext"
        @apply-generated-text="
          (payload: WriterAIApplyPayload) => emit('applyGeneratedText', payload)
        "
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

const primaryDraftProposal = computed<WriterDraftProposal | null>(() => {
  const selectedProposal = props.draftProposals.find((proposal) => proposal.status === 'selected')
  if (selectedProposal) {
    return selectedProposal
  }

  return props.draftProposals.find((proposal) => proposal.status === 'draft') || null
})

const shouldCondensePrimaryProposal = computed(
  () => !!primaryDraftProposal.value && !!latestResultCandidate.value,
)

const shouldCondenseResultCandidate = computed(
  () => !!latestResultCandidate.value && !!primaryDraftProposal.value,
)

const shouldShowApplyFeedback = computed(
  () =>
    !!props.aiApplyFeedback &&
    !(primaryDraftProposal.value?.status === 'selected' && !!latestResultCandidate.value),
)

const visibleApplyFeedback = computed(() =>
  shouldShowApplyFeedback.value ? props.aiApplyFeedback : null,
)

const hasWorkflowRail = computed(
  () =>
    !!shouldShowApplyFeedback.value ||
    !!shouldShowProposalLifecycleFeedback.value ||
    !!latestResultCandidate.value ||
    !!primaryDraftProposal.value,
)

const proposalLifecycleFeedback = computed<{
  status: 'selected' | 'discarded'
  title: string
  detail: string
  source: string
} | null>(() => {
  if (props.draftProposals.length === 0) {
    return null
  }

  const latestProposal = [...props.draftProposals].sort(
    (left, right) => right.updatedAt - left.updatedAt,
  )[0]
  if (!latestProposal) {
    return null
  }

  const latestStatus = latestProposal.status
  if (latestStatus !== 'selected' && latestStatus !== 'discarded') {
    return null
  }

  return {
    status: latestStatus,
    title:
      latestStatus === 'selected'
        ? `${proposalKindText(latestProposal.kind)}提案已保留`
        : `${proposalKindText(latestProposal.kind)}提案已移出`,
    detail:
      latestStatus === 'selected'
        ? `当前保留：${latestProposal.title}`
        : `已从 rail 中移除：${latestProposal.title}`,
    source: proposalSourceText(latestProposal.source),
  }
})

const shouldShowProposalLifecycleFeedback = computed(() => {
  if (!proposalLifecycleFeedback.value) {
    return false
  }

  if (props.aiApplyFeedback || latestResultCandidate.value) {
    return false
  }

  return proposalLifecycleFeedback.value.status === 'discarded'
})

const visibleProposalLifecycleFeedback = computed(() =>
  shouldShowProposalLifecycleFeedback.value ? proposalLifecycleFeedback.value : null,
)

const visibleDiffPreview = computed(() => {
  const candidate = latestResultCandidate.value
  if (!candidate) return null
  if (!['rewrite', 'direct_edit', 'expand', 'polish', 'continue'].includes(candidate.action)) {
    return null
  }

  const before = (candidate.sourceText || props.sourceText || '').trim()
  const after = (candidate.generatedText || '').trim()
  if (!before || !after || before === after) return null

  return {
    before: shortenPreview(before),
    after: shortenPreview(after),
  }
})

const diffModeText = computed(() => {
  const mode = props.actionTrigger?.applyMode
  if (mode === 'replace_document') return '整章改写'
  if (mode === 'insert_after_selection') return '插入选区后'
  if (mode === 'replace_selection') return '替换选区'
  if (mode === 'append_paragraph') return '追加段落'
  return '正文改写'
})

watch(
  [() => props.projectId, () => props.chapterId, () => props.actionTrigger?.id],
  (
    [projectId, chapterId, actionTriggerId],
    [prevProjectId, prevChapterId, prevActionTriggerId],
  ) => {
    if (
      projectId !== prevProjectId ||
      chapterId !== prevChapterId ||
      actionTriggerId !== prevActionTriggerId
    ) {
      latestResultCandidate.value = null
    }

    if (actionTriggerId !== prevActionTriggerId && actionDrivenTab.value) {
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
  if (status === 'selected') return '保留'
  if (status === 'discarded') return '丢弃'
  return '草稿'
}

function proposalSelectActionText(kind: WriterDraftProposalKind) {
  return kind === 'chapter-direction' ? '定为方向' : '定为正文'
}

function proposalDismissActionText(status: WriterDraftProposalStatus) {
  return status === 'selected' ? '移出' : '丢弃'
}

function proposalDismissAriaLabelText(proposal: WriterDraftProposal) {
  const action = proposal.status === 'selected' ? '移出提案' : '丢弃提案'
  return `${action} ${proposal.title}`
}

function proposalKindText(kind: WriterDraftProposalKind) {
  return kind === 'chapter-direction' ? '方向' : '正文'
}

function proposalSourceText(source: WriterDraftProposalSource) {
  if (source === 'summary-workbench') return '总结'
  if (source === 'review-workbench') return '审校'
  if (source === 'rewrite-workbench') return '改写'
  return '对话'
}

function resultSourceText(source: WriterResultCandidate['source']) {
  if (source === 'summary') return '总结'
  if (source === 'review') return '审校'
  if (source === 'rewrite') return '改写'
  return '对话'
}

function resultKindText(candidate: WriterResultCandidate) {
  const tab = resolveWriterWorkflowTab(candidate.action)
  if (tab === 'summary') return '方向'
  return '正文'
}

function resultPromoteActionText(candidate: WriterResultCandidate) {
  return resultKindText(candidate) === '方向' ? '存为方向' : '存为正文'
}

function shortenPreview(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  return normalized.length > 180 ? `${normalized.slice(0, 180)}…` : normalized
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
  justify-content: flex-start;
}

.ai-workbench__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--editor-text-primary, #0f172a);
  letter-spacing: 0.01em;
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

.workflow-rail {
  padding: 10px 12px;
  border-bottom: 1px solid var(--editor-border, rgba(0, 0, 0, 0.06));
  background: rgba(248, 250, 252, 0.86);
  display: grid;
  gap: 8px;
}

.workflow-result-card__action,
.proposal-card__action {
  border: none;
  border-radius: 999px;
  padding: 5px 10px;
  background: var(--editor-accent-soft, #ecfeff);
  color: var(--editor-accent, #0891b2);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.workflow-result-card__content,
.proposal-card__content {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.workflow-result-card,
.proposal-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 10px;
  border: 1px solid var(--editor-border, rgba(0, 0, 0, 0.08));
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.76);

  strong {
    display: block;
    font-size: 12px;
    color: var(--editor-text-primary, #0f172a);
  }
  p {
    margin: 4px 0 0;
    font-size: 11px;
    line-height: 1.5;
    color: var(--editor-text-muted, #64748b);
  }
}

.workflow-result-card--secondary {
  background: rgba(250, 252, 255, 0.7);
}

.workflow-result-card--condensed {
  padding-block: 8px;
}

.workflow-result-card--condensed .workflow-result-card__content {
  gap: 4px;
}

.proposal-card {
  display: block;
}

.proposal-card--condensed {
  padding-block: 8px;
}

.proposal-card--condensed .proposal-card__content {
  gap: 4px;
}

.proposal-card--condensed .proposal-card__actions {
  margin-top: 6px;
}

.workflow-card__meta,
.proposal-card__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.workflow-card__meta {
  font-size: 10px;
  color: var(--editor-text-muted, #64748b);
}

.workflow-chip {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: var(--editor-text-muted, #64748b);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.workflow-chip--status,
.workflow-chip--accent {
  background: var(--editor-accent-soft, #ecfeff);
  color: var(--editor-accent, #0891b2);
}

.proposal-card__meta {
  margin: 0;
}

.proposal-card__actions {
  margin-top: 8px;
  justify-content: flex-start;
}

.proposal-card__action--ghost {
  background: rgba(15, 23, 42, 0.06);
  color: var(--editor-text-muted, #64748b);
}

.workflow-diff-card {
  padding: 10px;
  border: 1px solid var(--editor-border, rgba(0, 0, 0, 0.08));
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.78);
  display: grid;
  gap: 8px;
}

.workflow-diff-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.workflow-diff-card__column {
  min-width: 0;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(248, 250, 252, 0.9);
  padding: 8px;
}

.workflow-diff-card__column--after {
  background: rgba(236, 253, 245, 0.9);
  border-color: rgba(34, 197, 94, 0.2);
}

.workflow-diff-card__label {
  display: block;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--editor-text-muted, #64748b);
}

.workflow-diff-card__text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--editor-text-primary, #0f172a);
  white-space: pre-wrap;
}

.ai-workbench__panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 16px 18px 18px;
}

.apply-feedback {
  min-height: 34px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.2);
  background: rgba(255, 251, 245, 0.94);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.apply-feedback__content {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.apply-feedback strong {
  display: inline;
  color: #241f19;
  font-size: 11px;
  line-height: 1.2;
}

.apply-feedback p {
  margin: 0;
  color: #6e6358;
  font-size: 11px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.apply-feedback--success {
  border-color: rgba(53, 132, 103, 0.2);
  background: linear-gradient(145deg, rgba(236, 250, 244, 0.96), rgba(249, 255, 252, 0.94));
}

.apply-feedback--fallback {
  border-color: rgba(143, 63, 47, 0.2);
  background: linear-gradient(145deg, rgba(255, 241, 232, 0.96), rgba(255, 250, 245, 0.94));
}

.proposal-feedback--selected {
  border-color: rgba(22, 163, 74, 0.18);
  background: linear-gradient(145deg, rgba(240, 253, 244, 0.96), rgba(248, 255, 250, 0.94));
}

.proposal-feedback--discarded {
  border-color: rgba(100, 116, 139, 0.18);
  background: linear-gradient(145deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.92));
}

.apply-feedback__mode {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.2);
  background: rgba(255, 255, 255, 0.72);
  color: #5f4e40;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
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
  .ai-workbench__tabs {
    flex-wrap: wrap;
    gap: 6px;
  }

  .ai-workbench__tab {
    flex: 1 1 calc(50% - 6px);
  }

  .workflow-rail {
    gap: 6px;
  }

  .apply-feedback,
  .workflow-result-card,
  .proposal-card,
  .workflow-diff-card {
    border-radius: 12px;
    flex-direction: column;
    align-items: flex-start;
  }

  .workflow-diff-card__grid {
    grid-template-columns: 1fr;
  }

  .apply-feedback__content {
    display: block;
  }

  .apply-feedback__mode,
  .workflow-result-card__action {
    align-self: flex-start;
  }
}
</style>
