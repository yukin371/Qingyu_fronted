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
      <QyBadge type="text" color="primary" size="sm" value="Phase 1" />
    </header>

    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <h4 class="text-sm font-semibold text-slate-950">Context Lens</h4>
        <QyTag size="sm" type="primary" effect="light">{{ harnessStore.writingStateLabel }}</QyTag>
      </div>

      <QyCard variant="glass" padding="sm" shadow="never" class="space-y-3 rounded-3xl border border-white/70 bg-white/85">
        <div class="space-y-1">
          <p class="text-xs text-slate-500">当前作用域</p>
          <p class="text-sm font-medium text-slate-900">
            {{ scopeLabel || chapterTitle || '未声明场景作用域' }}
          </p>
          <p class="text-xs leading-5 text-slate-500">{{ harnessStore.chapterProgressLabel }}</p>
        </div>

        <div class="grid grid-cols-3 gap-2 text-sm text-slate-700">
          <div class="rounded-2xl bg-slate-50 px-3 py-2">
            <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">角色</p>
            <p class="mt-1 font-medium text-slate-900">{{ activeCharacters.length }}</p>
          </div>
          <div class="rounded-2xl bg-slate-50 px-3 py-2">
            <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">关系</p>
            <p class="mt-1 font-medium text-slate-900">{{ activeRelations.length }}</p>
          </div>
          <div class="rounded-2xl bg-slate-50 px-3 py-2">
            <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">待处理</p>
            <p class="mt-1 font-medium text-slate-900">{{ harnessStore.pendingChangeRequestCount }}</p>
          </div>
        </div>

        <div class="rounded-2xl bg-slate-950 px-3 py-3 text-slate-50">
          <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">写作状态</p>
          <p class="mt-1 text-sm font-medium">{{ chapterTitle || '未命名章节' }}</p>
          <p class="mt-1 text-xs text-slate-300">正文长度 {{ harnessStore.draftLength }} 字符</p>
        </div>
      </QyCard>

      <QyCard variant="glass" padding="sm" shadow="never" class="space-y-3 rounded-3xl border border-white/70 bg-white/85">
        <div class="flex items-center justify-between gap-3">
          <h4 class="text-sm font-semibold text-slate-950">当前焦点</h4>
          <QyTag size="sm" type="info" effect="light">摘要模式</QyTag>
        </div>

        <div class="space-y-2">
          <p class="text-xs text-slate-500">角色</p>
          <div v-if="activeCharacters.length" class="flex flex-wrap gap-2">
            <QyTag
              v-for="character in characterPreview"
              :key="character.id"
              size="sm"
              type="primary"
              effect="plain"
            >
              {{ character.name }}
            </QyTag>
            <QyTag
              v-if="remainingCharacterCount > 0"
              size="sm"
              type="info"
              effect="plain"
            >
              +{{ remainingCharacterCount }}
            </QyTag>
          </div>
          <p v-else class="text-xs leading-5 text-slate-500">
            当前还没有稳定的出场名单，宿主保持静默，只保留轻提示。
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-xs text-slate-500">关系</p>
          <div v-if="strongestRelation" class="rounded-2xl bg-slate-50 px-3 py-3">
            <p class="text-sm font-medium text-slate-900">
              {{ strongestRelation.fromName }} · {{ strongestRelation.type }} · {{ strongestRelation.toName }}
            </p>
            <p class="mt-1 text-xs leading-5 text-slate-500">
              强度 {{ strongestRelation.strength }}
              <span v-if="remainingRelationCount > 0">，另有 {{ remainingRelationCount }} 条关系处于当前作用域。</span>
            </p>
          </div>
          <p v-else class="text-xs leading-5 text-slate-500">
            当前还没有可聚合的关系线，后续只在必要时提示关系波动。
          </p>
        </div>
      </QyCard>
    </section>

    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <h4 class="text-sm font-semibold text-slate-950">Change Request</h4>
        <QyBadge type="text" color="primary" size="sm" :value="`${harnessStore.pendingChangeRequestCount} 待处理`" />
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

          <div v-if="changeRequests.length" class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-white/80 px-3 py-3">
              <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">保存后批次</p>
              <p class="mt-2 text-xl font-semibold text-slate-950">{{ savedBatchChangeRequestCount }}</p>
              <p class="mt-1 text-xs leading-5 text-slate-500">正式建议。</p>
            </div>
            <div class="rounded-2xl bg-white/80 px-3 py-3">
              <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">即时预览</p>
              <p class="mt-2 text-xl font-semibold text-slate-950">{{ liveChangeRequestCount }}</p>
              <p class="mt-1 text-xs leading-5 text-slate-500">实时命中。</p>
            </div>
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
                <QyTag
                  size="sm"
                  :type="primaryChangeRequest?.source === 'save_batch' ? 'success' : 'info'"
                  effect="light"
                >
                  {{ primaryChangeRequest?.source === 'save_batch' ? '保存后批次' : '即时预览' }}
                </QyTag>
                <QyTag size="sm" :type="primaryChangeRequest?.severity === 'focus' ? 'warning' : 'info'" effect="light">
                  {{ primaryChangeRequest?.severity === 'focus' ? '优先看' : '轻提示' }}
                </QyTag>
              </div>
            </div>
            <p class="mt-2 text-xs leading-5 text-slate-600">{{ primaryChangeRequest?.reason }}</p>
            <p class="mt-2 text-xs leading-5 text-slate-500">{{ changeRequestSourceSummary }}</p>
          </div>

          <QyButton
            v-if="changeRequests.length"
            variant="secondary"
            size="sm"
            class="w-full"
            data-testid="story-harness-open-change-requests"
            @click="isChangeRequestDrawerVisible = true"
          >
            查看建议队列
          </QyButton>
        </template>

        <template v-else>
          <p class="text-sm leading-6 text-slate-700">当前还没有本地规则命中的建议。</p>
          <p class="text-sm leading-6 text-slate-500">
            保存后生成的状态建议、关系建议和证据链会继续汇到这里。
          </p>
        </template>
      </QyCard>
    </section>

    <StoryHarnessChangeRequestDrawer
      v-model="isChangeRequestDrawerVisible"
      :change-requests="changeRequests"
    />
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QyBadge, QyButton, QyCard, QyTag } from '@/design-system/components'
import {
  useStoryHarnessStore,
  type StoryHarnessCharacterSummary,
  type StoryHarnessChangeRequestPreview,
  type StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
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
}>()

const harnessStore = useStoryHarnessStore()
const activeCharacters = computed(() => props.activeCharacters ?? [])
const activeRelations = computed(() => props.activeRelations ?? [])
const changeRequests = computed(() => props.changeRequests ?? [])
const isChangeRequestDrawerVisible = ref(false)
const characterPreview = computed(() => activeCharacters.value.slice(0, 3))
const remainingCharacterCount = computed(() => Math.max(activeCharacters.value.length - characterPreview.value.length, 0))
const strongestRelation = computed(() =>
  [...activeRelations.value].sort((left, right) => right.strength - left.strength)[0] ?? null,
)
const remainingRelationCount = computed(() =>
  strongestRelation.value ? Math.max(activeRelations.value.length - 1, 0) : 0,
)
const savedBatchChangeRequests = computed(() =>
  changeRequests.value.filter((changeRequest) => changeRequest.source === 'save_batch'),
)
const liveChangeRequests = computed(() =>
  changeRequests.value.filter((changeRequest) => changeRequest.source === 'live'),
)
const savedBatchReceipt = computed(() => harnessStore.savedBatchReceipt)
const pendingChangeRequests = computed(() =>
  changeRequests.value.filter(
    (changeRequest) => harnessStore.getChangeRequestDecision(changeRequest.id) === 'pending',
  ),
)
const hasSavedBatchReceipt = computed(() => Boolean(savedBatchReceipt.value))
const savedBatchChangeRequestCount = computed(() => savedBatchChangeRequests.value.length)
const liveChangeRequestCount = computed(() => liveChangeRequests.value.length)
const primaryChangeRequest = computed(
  () =>
    pendingChangeRequests.value.find((changeRequest) => changeRequest.source === 'save_batch') ??
    pendingChangeRequests.value[0] ??
    savedBatchChangeRequests.value[0] ??
    changeRequests.value[0] ??
    null,
)
const changeRequestSourceSummary = computed(() => {
  if (savedBatchChangeRequestCount.value > 0 && liveChangeRequestCount.value > 0) {
    return '当前同时存在保存后正式建议和即时预览，抽屉中会优先展示正式批次。'
  }

  if (savedBatchChangeRequestCount.value > 0) {
    return '当前摘要来自最近一次保存后冻结的正式建议批次。'
  }

  if (liveChangeRequestCount.value > 0) {
    return '当前摘要仍是正文实时命中的即时预览，保存后会再冻结成正式批次。'
  }

  return '当前还没有建议来源。'
})
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
