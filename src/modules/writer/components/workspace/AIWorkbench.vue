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

    <div class="ai-workbench__panel">
      <RewriteWorkbenchTool
        v-if="activeTab === 'rewrite'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
        @apply="(payload) => emit('applyGeneratedText', payload)"
      />

      <SummaryWorkbenchTool
        v-else-if="activeTab === 'summary'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
      />

      <ReviewWorkbenchTool
        v-else-if="activeTab === 'review'"
        :project-id="projectId"
        :chapter-id="chapterId"
        :chapter-title="chapterTitle"
        :seed-text="sourceText"
        :action-trigger="actionTrigger"
      />

      <AIPanel
        v-else
        :session-id="projectId"
        :action-trigger="actionTrigger"
        @send="(msg: string) => emit('send', msg)"
        @apply-generated-text="(payload: AIApplyPayload) => emit('applyGeneratedText', payload)"
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
import type { AIApplyFeedback } from '@/modules/writer/components/workspace/WorkspaceRightPanel.vue'

type WorkbenchTab = 'rewrite' | 'summary' | 'review' | 'chat'

interface AIActionTrigger {
  id: number
  action: string
  text: string
  instructions?: string
  applyMode?:
    | 'replace_selection'
    | 'insert_after_selection'
    | 'append_paragraph'
    | 'replace_document'
}

interface AIApplyPayload {
  action: string
  sourceText: string
  generatedText: string
  applyMode?:
    | 'replace_selection'
    | 'insert_after_selection'
    | 'append_paragraph'
    | 'replace_document'
}

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  sourceText: string
  actionTrigger: AIActionTrigger | null
  aiApplyFeedback: AIApplyFeedback | null
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'applyGeneratedText', payload: AIApplyPayload): void
}>()

const activeTab = ref<WorkbenchTab>('chat')

const tabs: Array<{ id: WorkbenchTab; label: string; description: string }> = [
  { id: 'rewrite', label: '改写', description: '续写 / 润色 / 扩写' },
  { id: 'summary', label: '总结', description: '摘要 / 章节提炼' },
  { id: 'review', label: '审校', description: '校对 / 风险检查' },
  { id: 'chat', label: '对话', description: '开放式协作' },
]

const actionDrivenTab = computed<WorkbenchTab | null>(() => {
  const action = props.actionTrigger?.action
  if (!action) return null
  if (['continue', 'polish', 'expand', 'rewrite'].includes(action)) return 'rewrite'
  if (['summary', 'summarize', 'summarize_chapter'].includes(action)) return 'summary'
  if (['proofread', 'review', 'audit'].includes(action)) return 'review'
  if (['chat', 'add_to_chat'].includes(action)) return 'chat'
  return null
})

watch(
  () => props.actionTrigger?.id,
  () => {
    if (actionDrivenTab.value) {
      activeTab.value = actionDrivenTab.value
    }
  },
)

function applyModeText(mode: NonNullable<AIActionTrigger['applyMode']>) {
  if (mode === 'replace_selection') return '替换选区'
  if (mode === 'insert_after_selection') return '插入后方'
  if (mode === 'replace_document') return '替换全文'
  return '追加段落'
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
