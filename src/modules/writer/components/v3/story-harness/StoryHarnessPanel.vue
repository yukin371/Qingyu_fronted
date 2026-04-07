<template>
  <aside
    class="flex min-h-0 min-w-[280px] max-w-[320px] flex-col gap-4 border-l border-slate-200/80 bg-slate-50/70 p-4 max-[1200px]:max-w-none max-[1200px]:border-l-0 max-[1200px]:border-t"
    data-testid="story-harness-panel"
  >
    <header class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
          Story Harness
        </p>
        <h3 class="text-sm font-semibold text-slate-950">V3 写作宿主</h3>
      </div>
      <Tag variant="primary" size="sm">Phase 1</Tag>
    </header>

    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <h4 class="text-sm font-semibold text-slate-950">Context Lens</h4>
        <Tag size="sm" variant="primary" effect="light">{{ harnessStore.writingStateLabel }}</Tag>
      </div>

      <QyCard variant="glass" padding="sm" shadow="never" class="space-y-3 rounded-3xl border border-white/70 bg-white/85">
        <div class="space-y-1">
          <p class="text-xs text-slate-500">当前作用域</p>
          <p class="text-sm font-medium text-slate-900">
            {{ scopeLabel || chapterTitle || '未声明场景作用域' }}
          </p>
          <p class="text-xs leading-5 text-slate-500">{{ harnessStore.chapterProgressLabel }}</p>
        </div>

        <div class="flex flex-wrap gap-2 text-xs text-slate-600">
          <span class="rounded-full bg-slate-100 px-3 py-1">角色 {{ activeCharacters.length }}</span>
          <span class="rounded-full bg-slate-100 px-3 py-1">关系 {{ activeRelations.length }}</span>
          <span class="rounded-full bg-slate-100 px-3 py-1">待处理 {{ harnessStore.pendingChangeRequestCount }}</span>
        </div>

        <div class="rounded-2xl bg-slate-950 px-3 py-3 text-slate-50">
          <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">写作状态</p>
          <p class="mt-1 text-sm font-medium">{{ chapterTitle || '未命名章节' }}</p>
          <p class="mt-1 text-xs text-slate-300">正文长度 {{ harnessStore.draftLength }} 字符</p>
        </div>
      </QyCard>
    </section>

    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <h4 class="text-sm font-semibold text-slate-950">Change Request</h4>
        <Tag variant="primary" size="sm">{{ harnessStore.pendingChangeRequestCount }} 待处理</Tag>
      </div>

      <QyCard variant="glass" padding="sm" shadow="never" class="space-y-3 rounded-3xl border border-white/70 bg-white/85">
        <template v-if="changeRequests.length || hasSavedBatchReceipt">
          <div
            v-if="hasSavedBatchReceipt"
            class="rounded-2xl bg-slate-50 px-3 py-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">保存回执</p>
                <p class="mt-2 text-sm font-semibold text-slate-950">{{ savedBatchReceiptStatus }}</p>
              </div>
              <span class="text-xs text-slate-500">{{ savedBatchReceiptTimestampLabel }}</span>
            </div>
            <p class="mt-2 text-xs leading-5 text-slate-600">{{ savedBatchReceiptHint }}</p>
          </div>

          <div
            v-if="primaryChangeRequest"
            class="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-900">{{ primaryChangeRequest?.title }}</p>
                <p class="mt-1 text-xs leading-5 text-slate-500">{{ primaryChangeRequest?.summary }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <Tag
                  size="sm"
                  :variant="primaryChangeRequest?.source === 'save_batch' ? 'success' : 'info'"
                  effect="light"
                >
                  {{ primaryChangeRequest?.source === 'save_batch' ? '保存后批次' : '即时预览' }}
                </Tag>
                <Tag size="sm" :variant="primaryChangeRequest?.severity === 'focus' ? 'warning' : 'info'" effect="light">
                  {{ primaryChangeRequest?.severity === 'focus' ? '优先看' : '轻提示' }}
                </Tag>
              </div>
            </div>
            <p class="mt-2 text-xs leading-5 text-slate-600">{{ primaryChangeRequest?.reason }}</p>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <QyButton
              variant="primary"
              size="sm"
              data-testid="story-harness-trigger-index"
              :loading="isTriggeringIndex"
              @click="handleTriggerIndex"
            >
              生成建议
            </QyButton>
            <QyButton
              variant="secondary"
              size="sm"
              data-testid="story-harness-open-change-requests"
              @click="isChangeRequestDrawerVisible = true"
            >
              查看队列
            </QyButton>
          </div>
          <QyButton
            v-if="primaryChangeRequest"
            variant="secondary"
            size="sm"
            class="w-full"
            data-testid="story-harness-send-primary-to-ai"
            @click="sendPrimaryChangeRequestToAI"
          >
            交给 AI
          </QyButton>
        </template>

        <template v-else>
          <p class="text-sm leading-6 text-slate-700">当前还没有正式建议。</p>
          <p class="text-sm leading-6 text-slate-500">保存后会自动刷新，你也可以手动触发一次索引。</p>
          <QyButton
            variant="primary"
            size="sm"
            class="w-full"
            data-testid="story-harness-trigger-index"
            :loading="isTriggeringIndex"
            @click="handleTriggerIndex"
          >
            立即生成建议
          </QyButton>
        </template>
      </QyCard>
    </section>

    <StoryHarnessChangeRequestDrawer
      v-model="isChangeRequestDrawerVisible"
      :change-requests="changeRequests"
      :handle-change-request-decision="handleChangeRequestDecision"
    />
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QyButton, QyCard } from '@/design-system/components'
import { Tag } from '@/design-system/base'
import {
  useStoryHarnessStore,
  type StoryHarnessChangeRequestDecision,
  type StoryHarnessCharacterSummary,
  type StoryHarnessChangeRequestPreview,
  type StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import type { WriterWorkflowActionRequest } from '@/modules/writer/types/workflow'
import StoryHarnessChangeRequestDrawer from './StoryHarnessChangeRequestDrawer.vue'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  content: string
  chapterCount: number
  scopeLabel?: string
  activeCharacters?: StoryHarnessCharacterSummary[]
  activeRelations?: StoryHarnessRelationSummary[]
  changeRequests?: StoryHarnessChangeRequestPreview[]
  handleChangeRequestDecision?: (
    requestId: string,
    decision: StoryHarnessChangeRequestDecision,
  ) => Promise<boolean>
  handleTriggerIndex?: () => Promise<void>
  isTriggeringIndex?: boolean
}>()
const emit = defineEmits<{
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
}>()

const harnessStore = useStoryHarnessStore()
const activeCharacters = computed(() => props.activeCharacters ?? [])
const activeRelations = computed(() => props.activeRelations ?? [])
const changeRequests = computed(() => props.changeRequests ?? [])
const isChangeRequestDrawerVisible = ref(false)
const savedBatchChangeRequests = computed(() =>
  changeRequests.value.filter((changeRequest) => changeRequest.source === 'save_batch'),
)
const savedBatchReceipt = computed(() => harnessStore.savedBatchReceipt)
const pendingChangeRequests = computed(() =>
  changeRequests.value.filter(
    (changeRequest) => harnessStore.getChangeRequestDecision(changeRequest.id) === 'pending',
  ),
)
const hasSavedBatchReceipt = computed(() => Boolean(savedBatchReceipt.value))
const primaryChangeRequest = computed(
  () =>
    pendingChangeRequests.value.find((changeRequest) => changeRequest.source === 'save_batch') ??
    pendingChangeRequests.value[0] ??
    savedBatchChangeRequests.value[0] ??
    changeRequests.value[0] ??
    null,
)
const savedBatchReceiptTimestampLabel = computed(() => {
  if (!savedBatchReceipt.value) {
    return ''
  }

  return `保存于 ${new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(savedBatchReceipt.value.committedAt)}`
})
const savedBatchReceiptStatus = computed(() => {
  if (!savedBatchReceipt.value) {
    return ''
  }

  if (savedBatchReceipt.value.count > 0) {
    return `本章已冻结 ${savedBatchReceipt.value.count} 条正式建议`
  }

  return '本次保存未产出正式建议'
})
const savedBatchReceiptHint = computed(() => {
  if (!savedBatchReceipt.value) {
    return ''
  }

  if (savedBatchReceipt.value.count > 0) {
    return '当前批次已成为正式回顾入口，同签名的即时预览会自动退到后面。'
  }

  return '当前保存没有命中正式建议，宿主会继续保留正文侧的即时预览，不打断作者继续写。'
})

const handleTriggerIndex = () => {
  if (!props.handleTriggerIndex) {
    return
  }

  void props.handleTriggerIndex()
}

const buildChangeRequestContextText = (changeRequest: StoryHarnessChangeRequestPreview): string => {
  const lines = [
    `变更建议：${changeRequest.title}`,
    changeRequest.summary ? `摘要：${changeRequest.summary}` : '',
    changeRequest.reason ? `理由：${changeRequest.reason}` : '',
    changeRequest.evidence ? `证据：${changeRequest.evidence}` : '',
  ].filter(Boolean)

  return lines.join('\n')
}

const sendPrimaryChangeRequestToAI = () => {
  const changeRequest = primaryChangeRequest.value
  if (!changeRequest) {
    return
  }

  emit('trigger-ai-action', {
    source: 'story_harness',
    action: 'add_to_chat',
    title: changeRequest.title,
    text: buildChangeRequestContextText(changeRequest),
    instructions:
      '请基于这条 Change Request 给出可执行的改写建议，优先保持角色状态与关系连续性。',
  })
}

watch(
  () => ({
    projectId: props.projectId,
    chapterId: props.chapterId,
    chapterTitle: props.chapterTitle,
    content: props.content,
    chapterCount: props.chapterCount,
  }),
  (session) => {
    harnessStore.syncSession(session)
  },
  { immediate: true, deep: true },
)

watch(
  () => [props.projectId, props.chapterId] as const,
  ([projectId, chapterId]) => {
    void harnessStore.hydrateSavedBatch(projectId, chapterId)
  },
  { immediate: true },
)

watch(
  () => changeRequests.value.map((changeRequest) => changeRequest.id),
  (changeRequestIds) => {
    harnessStore.syncChangeRequests(changeRequestIds)
  },
  { immediate: true, deep: true },
)
</script>
