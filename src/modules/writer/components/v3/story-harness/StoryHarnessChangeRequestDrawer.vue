<template>
  <QyDrawer
    v-model="drawerVisible"
    title="Change Request 队列"
    direction="rtl"
    size="480px"
    :destroy-on-close="false"
    class="story-harness-change-request-drawer"
  >
    <div class="flex h-full min-h-0 flex-col gap-4">
      <section class="grid grid-cols-2 gap-3">
        <QyCard variant="glass" padding="sm" shadow="never" class="rounded-3xl border border-slate-200/70">
          <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">待处理建议</p>
          <p class="mt-2 text-2xl font-semibold text-slate-950">{{ harnessStore.pendingChangeRequestCount }}</p>
          <p class="mt-1 text-xs leading-5 text-slate-500">当前正文命中的本地预览，不自动落库。</p>
        </QyCard>
        <QyCard variant="glass" padding="sm" shadow="never" class="rounded-3xl border border-slate-200/70">
          <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">优先处理</p>
          <p class="mt-2 text-2xl font-semibold text-slate-950">{{ focusRequestCount }}</p>
          <p class="mt-1 text-xs leading-5 text-slate-500">作者显式指令和强状态变动会优先浮到前面。</p>
        </QyCard>
      </section>

      <section class="grid grid-cols-3 gap-3">
        <QyCard variant="glass" padding="sm" shadow="never" class="rounded-3xl border border-emerald-200/70 bg-emerald-50/70">
          <p class="text-[11px] uppercase tracking-[0.14em] text-emerald-600">已合并</p>
          <p class="mt-2 text-xl font-semibold text-emerald-950">{{ harnessStore.acceptedChangeRequestCount }}</p>
        </QyCard>
        <QyCard variant="glass" padding="sm" shadow="never" class="rounded-3xl border border-amber-200/70 bg-amber-50/70">
          <p class="text-[11px] uppercase tracking-[0.14em] text-amber-600">稍后处理</p>
          <p class="mt-2 text-xl font-semibold text-amber-950">{{ harnessStore.deferredChangeRequestCount }}</p>
        </QyCard>
        <QyCard variant="glass" padding="sm" shadow="never" class="rounded-3xl border border-slate-200/70 bg-slate-50/80">
          <p class="text-[11px] uppercase tracking-[0.14em] text-slate-500">已忽略</p>
          <p class="mt-2 text-xl font-semibold text-slate-900">{{ harnessStore.ignoredChangeRequestCount }}</p>
        </QyCard>
      </section>

      <section class="flex flex-wrap items-center gap-2">
        <QyTag size="sm" type="success" effect="light">保存后批次 {{ savedBatchCount }}</QyTag>
        <QyTag size="sm" type="info" effect="light">即时预览 {{ livePreviewCount }}</QyTag>
        <p v-if="savedBatchReceipt" class="text-xs leading-5 text-slate-500">最近保存 {{ savedBatchReceiptLabel }}</p>
        <p class="text-xs leading-5 text-slate-500">保存后批次会压住同签名的即时预览，避免队列里出现双份噪音。</p>
      </section>

      <section class="flex flex-wrap items-center gap-2">
        <QyButton
          size="sm"
          :variant="activeFilter === 'pending' ? 'primary' : 'secondary'"
          data-testid="story-harness-filter-pending"
          @click="activeFilter = 'pending'"
        >
          待处理 {{ pendingChangeRequests.length }}
        </QyButton>
        <QyButton
          size="sm"
          :variant="activeFilter === 'resolved' ? 'primary' : 'secondary'"
          data-testid="story-harness-filter-resolved"
          @click="activeFilter = 'resolved'"
        >
          已处理 {{ resolvedChangeRequests.length }}
        </QyButton>
        <QyButton
          size="sm"
          :variant="activeFilter === 'all' ? 'primary' : 'secondary'"
          data-testid="story-harness-filter-all"
          @click="activeFilter = 'all'"
        >
          全部 {{ changeRequests.length }}
        </QyButton>
      </section>

      <QyCard
        v-if="recentActivities.length"
        variant="glass"
        padding="sm"
        shadow="never"
        class="rounded-3xl border border-sky-200/70 bg-sky-50/80"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[11px] uppercase tracking-[0.14em] text-sky-600">最近处理</p>
            <p class="mt-2 text-sm font-medium text-slate-950">{{ latestActivityLabel }}</p>
            <p class="mt-1 text-xs leading-5 text-slate-500">先保留为本地决策轨迹，后续再接正式建议批次与持久化。</p>
          </div>
          <QyTag size="sm" type="primary" effect="light">{{ recentActivities.length }} 条</QyTag>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <QyTag
            v-for="activity in recentActivities"
            :key="`${activity.changeRequestId}-${activity.timestamp}`"
            size="sm"
            :type="decisionTagTypeMap[activity.decision]"
            effect="plain"
          >
            {{ formatActivityTag(activity) }}
          </QyTag>
        </div>
      </QyCard>

      <section class="min-h-0 flex-1">
        <div v-if="changeRequests.length" class="flex h-full min-h-0 flex-col gap-4 overflow-auto pr-1">
          <div v-if="visiblePendingChangeRequests.length" class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h4 class="text-sm font-semibold text-slate-950">待处理队列</h4>
              <QyTag size="sm" type="warning" effect="light">{{ visiblePendingChangeRequests.length }} 条</QyTag>
            </div>
            <QyCard
              v-for="changeRequest in visiblePendingChangeRequests"
              :key="changeRequest.id"
              variant="glass"
              padding="sm"
              shadow="never"
              class="rounded-3xl border border-slate-200/70 bg-white/90"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <QyTag
                      size="sm"
                      :type="changeRequest.source === 'save_batch' ? 'success' : 'info'"
                      effect="light"
                    >
                      {{ sourceLabelMap[changeRequest.source] }}
                    </QyTag>
                    <QyTag
                      size="sm"
                      :type="changeRequest.type === 'state' ? 'warning' : changeRequest.type === 'relation' ? 'success' : 'info'"
                      effect="light"
                    >
                      {{ typeLabelMap[changeRequest.type] }}
                    </QyTag>
                    <QyTag
                      size="sm"
                      :type="changeRequest.severity === 'focus' ? 'warning' : 'info'"
                      effect="plain"
                    >
                      {{ changeRequest.severity === 'focus' ? '优先处理' : '轻提示' }}
                    </QyTag>
                  </div>
                  <p class="mt-3 text-base font-semibold text-slate-950">{{ changeRequest.title }}</p>
                  <p class="mt-2 text-sm leading-6 text-slate-600">{{ changeRequest.summary }}</p>
                </div>
              </div>

              <div class="mt-4 rounded-2xl bg-slate-50 px-3 py-3">
                <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">为何出现</p>
                <p class="mt-2 text-sm leading-6 text-slate-700">{{ changeRequest.reason }}</p>
              </div>

              <div
                v-if="changeRequest.evidence"
                class="mt-3 rounded-2xl bg-slate-950 px-3 py-3 text-sm leading-6 text-slate-100"
              >
                {{ changeRequest.evidence }}
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <QyButton
                  variant="primary"
                  size="sm"
                  :data-testid="`story-harness-accept-${changeRequest.id}`"
                  @click="handleDecision(changeRequest.id, 'accepted')"
                >
                  合并
                </QyButton>
                <QyButton
                  variant="secondary"
                  size="sm"
                  :data-testid="`story-harness-defer-${changeRequest.id}`"
                  @click="handleDecision(changeRequest.id, 'deferred')"
                >
                  稍后处理
                </QyButton>
                <QyButton
                  variant="ghost"
                  size="sm"
                  :data-testid="`story-harness-ignore-${changeRequest.id}`"
                  @click="handleDecision(changeRequest.id, 'ignored')"
                >
                  忽略
                </QyButton>
              </div>
            </QyCard>
          </div>

          <div v-if="visibleResolvedChangeRequests.length" class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h4 class="text-sm font-semibold text-slate-950">已处理记录</h4>
              <QyTag size="sm" type="success" effect="light">{{ visibleResolvedChangeRequests.length }} 条</QyTag>
            </div>
            <QyCard
              v-for="changeRequest in visibleResolvedChangeRequests"
              :key="changeRequest.id"
              variant="glass"
              padding="sm"
              shadow="never"
              class="rounded-3xl border border-slate-200/70 bg-slate-50/80"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <QyTag
                      size="sm"
                      :type="changeRequest.source === 'save_batch' ? 'success' : 'info'"
                      effect="light"
                    >
                      {{ sourceLabelMap[changeRequest.source] }}
                    </QyTag>
                    <QyTag
                      size="sm"
                      :type="changeRequest.type === 'state' ? 'warning' : changeRequest.type === 'relation' ? 'success' : 'info'"
                      effect="light"
                    >
                      {{ typeLabelMap[changeRequest.type] }}
                    </QyTag>
                    <QyTag
                      size="sm"
                      :type="decisionTagTypeMap[getDecision(changeRequest.id)]"
                      effect="plain"
                    >
                      {{ decisionLabelMap[getDecision(changeRequest.id)] }}
                    </QyTag>
                  </div>
                  <p class="mt-3 text-base font-semibold text-slate-900">{{ changeRequest.title }}</p>
                  <p class="mt-2 text-sm leading-6 text-slate-600">{{ changeRequest.summary }}</p>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <QyButton
                  variant="secondary"
                  size="sm"
                  :data-testid="`story-harness-reset-${changeRequest.id}`"
                  @click="handleDecision(changeRequest.id, 'pending')"
                >
                  恢复待处理
                </QyButton>
              </div>
            </QyCard>
          </div>

          <QyCard
            v-if="visiblePendingChangeRequests.length === 0 && visibleResolvedChangeRequests.length === 0"
            variant="glass"
            padding="sm"
            shadow="never"
            class="rounded-3xl border border-dashed border-slate-200 bg-white/80"
          >
            <p class="text-sm leading-6 text-slate-700">{{ emptyStateTitle }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ emptyStateDescription }}</p>
          </QyCard>
        </div>

        <QyCard
          v-else
          variant="glass"
          padding="sm"
          shadow="never"
          class="rounded-3xl border border-dashed border-slate-200 bg-white/80"
        >
          <p class="text-sm leading-6 text-slate-700">{{ queueEmptyStateTitle }}</p>
          <p class="mt-2 text-sm leading-6 text-slate-500">{{ queueEmptyStateDescription }}</p>
        </QyCard>
      </section>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs leading-5 text-slate-500">当前抽屉已消费正式建议与即时预览，后续再补证据链与全项目视图。</p>
        <QyButton variant="secondary" size="sm" @click="drawerVisible = false">关闭</QyButton>
      </div>
    </template>
  </QyDrawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { QyButton, QyCard, QyDrawer, QyTag } from '@/design-system/components'
import {
  useStoryHarnessStore,
  type StoryHarnessChangeRequestActivity,
  type StoryHarnessChangeRequestDecision,
  type StoryHarnessChangeRequestPreview,
} from '@/modules/writer/stores/v3/storyHarnessStore'

type StoryHarnessQueueFilter = 'pending' | 'resolved' | 'all'

const props = defineProps<{
  modelValue: boolean
  changeRequests: StoryHarnessChangeRequestPreview[]
  handleChangeRequestDecision?: (
    requestId: string,
    decision: StoryHarnessChangeRequestDecision,
  ) => Promise<boolean>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const harnessStore = useStoryHarnessStore()
const activeFilter = ref<StoryHarnessQueueFilter>('pending')
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const focusRequestCount = computed(
  () =>
    props.changeRequests.filter(
      (changeRequest) =>
        changeRequest.severity === 'focus' && harnessStore.getChangeRequestDecision(changeRequest.id) === 'pending',
    ).length,
)
const pendingChangeRequests = computed(() =>
  props.changeRequests.filter(
    (changeRequest) => harnessStore.getChangeRequestDecision(changeRequest.id) === 'pending',
  ),
)
const resolvedChangeRequests = computed(() =>
  props.changeRequests.filter(
    (changeRequest) => harnessStore.getChangeRequestDecision(changeRequest.id) !== 'pending',
  ),
)
const savedBatchCount = computed(
  () => props.changeRequests.filter((changeRequest) => changeRequest.source === 'save_batch').length,
)
const livePreviewCount = computed(
  () => props.changeRequests.filter((changeRequest) => changeRequest.source === 'live').length,
)
const savedBatchReceipt = computed(() => harnessStore.savedBatchReceipt)
const visiblePendingChangeRequests = computed(() =>
  activeFilter.value === 'resolved' ? [] : pendingChangeRequests.value,
)
const visibleResolvedChangeRequests = computed(() =>
  activeFilter.value === 'pending' ? [] : resolvedChangeRequests.value,
)
const changeRequestMap = computed(
  () =>
    new Map(
      props.changeRequests.map((changeRequest) => [changeRequest.id, changeRequest] as const),
    ),
)
const recentActivities = computed(() => harnessStore.recentChangeRequestActivities)
const latestActivityLabel = computed(() => {
  const activity = recentActivities.value[0]
  if (!activity) {
    return ''
  }

  const changeRequest = changeRequestMap.value.get(activity.changeRequestId)
  const title = changeRequest?.title ?? '该建议'
  return `${title} 已标记为${decisionLabelMap[activity.decision]}`
})
const emptyStateTitle = computed(() => {
  if (activeFilter.value === 'pending') {
    return '当前没有待处理建议。'
  }
  if (activeFilter.value === 'resolved') {
    return '当前还没有已处理记录。'
  }
  return '当前建议还没有进入处理队列。'
})
const emptyStateDescription = computed(() => {
  if (activeFilter.value === 'pending') {
    return '可以切到“已处理”查看刚刚合并、忽略或延后的记录。'
  }
  if (activeFilter.value === 'resolved') {
    return '继续处理待处理队列后，这里会沉淀作者刚刚做过的决策。'
  }
  return '继续写正文，或者在正文里直接写 `// @角色 状态变化`，宿主会先把它收进这里。'
})
const savedBatchReceiptLabel = computed(() => {
  if (!savedBatchReceipt.value) {
    return ''
  }

  const time = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(savedBatchReceipt.value.committedAt)

  if (savedBatchReceipt.value.count > 0) {
    return `${time} · ${savedBatchReceipt.value.count} 条`
  }

  return `${time} · 无新增建议`
})
const queueEmptyStateTitle = computed(() => {
  if (savedBatchReceipt.value?.count === 0) {
    return '最近一次保存没有生成正式建议。'
  }

  return '当前还没有建议队列。'
})
const queueEmptyStateDescription = computed(() => {
  if (savedBatchReceipt.value?.count === 0) {
    return '继续写正文后，宿主仍会保留即时预览；只有命中规则的内容才会在下一次保存后冻结成正式批次。'
  }

  return '继续写正文，或者在正文里直接写 `// @角色 状态变化`，宿主会先把它收进这里。'
})

const typeLabelMap: Record<StoryHarnessChangeRequestPreview['type'], string> = {
  scene_scope: 'Scene Scope',
  relation: '关系摘要',
  state: '状态变更',
}

const sourceLabelMap: Record<StoryHarnessChangeRequestPreview['source'], string> = {
  live: '即时预览',
  save_batch: '保存后批次',
}

const decisionLabelMap: Record<StoryHarnessChangeRequestDecision, string> = {
  pending: '待处理',
  accepted: '已合并',
  ignored: '已忽略',
  deferred: '稍后处理',
}

const decisionTagTypeMap: Record<StoryHarnessChangeRequestDecision, 'primary' | 'success' | 'warning' | 'info'> = {
  pending: 'info',
  accepted: 'success',
  ignored: 'info',
  deferred: 'warning',
}

const getDecision = (changeRequestId: string) => harnessStore.getChangeRequestDecision(changeRequestId)
const formatActivityTag = (activity: StoryHarnessChangeRequestActivity) => {
  const changeRequest = changeRequestMap.value.get(activity.changeRequestId)
  const title = changeRequest?.title ?? '建议'
  return `${decisionLabelMap[activity.decision]} · ${title}`
}

const handleDecision = (
  changeRequestId: string,
  decision: StoryHarnessChangeRequestDecision,
) => {
  if (props.handleChangeRequestDecision) {
    void props.handleChangeRequestDecision(changeRequestId, decision)
    return
  }

  harnessStore.setChangeRequestDecision(changeRequestId, decision)
}
</script>
