<template>
  <div class="timeline-canvas-view" v-loading="writerStore.timeline.loading">
    <div class="timeline-header">
      <div class="title-wrap">
        <QyIcon name="Timer" :size="18" />
        <h2>{{ activeTimelineName }}</h2>
      </div>
      <div class="header-meta">事件 {{ events.length }}</div>
    </div>

    <div class="timeline-canvas">
      <div class="axis-line"></div>
      <div class="event-lane">
        <article
          v-for="(event, idx) in events"
          :key="event.id"
          class="event-card"
          :class="{ 'is-active': selectedEvent?.id === event.id }"
          :style="{ left: `${idx * 220 + 48}px`, top: `${idx % 2 === 0 ? 40 : 190}px` }"
          @click="selectedEvent = event"
        >
          <div class="event-dot"></div>
          <h4>{{ event.title }}</h4>
          <p>{{ event.description || '暂无详情描述' }}</p>
          <span class="event-time">{{ formatEventTime(event) }}</span>
        </article>
      </div>

      <el-empty v-if="events.length === 0" description="当前时间线暂无事件" :image-size="90" />
    </div>

    <aside class="event-detail" v-if="selectedEvent">
      <h3>{{ selectedEvent.title }}</h3>
      <p>{{ selectedEvent.description || '暂无描述' }}</p>
      <el-tag size="small" effect="plain">重要性 {{ selectedEvent.importance || 0 }}</el-tag>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useWriterStore } from '../stores/writerStore'
import { QyIcon } from '@/design-system/components'

const writerStore = useWriterStore()
const selectedEvent = ref<any>(null)

const events = computed(() => writerStore.timeline.events || [])
const activeTimelineName = computed(
  () => writerStore.timeline.currentTimeline?.name || '时间线画布'
)

onMounted(async () => {
  if (!writerStore.currentProjectId) return

  if (!writerStore.timeline.list.length) {
    await writerStore.loadTimelines()
  }

  if (writerStore.timeline.currentTimeline?.id) {
    await writerStore.loadTimelineEvents(writerStore.timeline.currentTimeline.id)
  }

  if (!selectedEvent.value && events.value.length) {
    selectedEvent.value = events.value[0]
  }
})

watch(
  () => writerStore.timeline.currentTimeline?.id,
  async (timelineId) => {
    if (!timelineId) return
    await writerStore.loadTimelineEvents(timelineId)
    selectedEvent.value = events.value[0] || null
  }
)

watch(
  () => writerStore.currentProjectId,
  async (projectId) => {
    if (!projectId) return
    if (!writerStore.timeline.list.length) {
      await writerStore.loadTimelines(projectId)
    }
    if (writerStore.timeline.currentTimeline?.id) {
      await writerStore.loadTimelineEvents(writerStore.timeline.currentTimeline.id)
      selectedEvent.value = events.value[0] || null
    }
  },
  { immediate: true }
)

const formatEventTime = (event: any) => {
  return event.storyTime?.description || '时间未设定'
}
</script>

<style scoped lang="scss">
.timeline-canvas-view {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  grid-template-rows: 56px minmax(0, 1fr);
  background: #f8fbff;
}

.timeline-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #d7deea;
  background: #fff;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;

  h2 {
    margin: 0;
    font-size: 17px;
    color: #0f172a;
  }
}

.header-meta {
  font-size: 13px;
  color: #475569;
}

.timeline-canvas {
  position: relative;
  overflow: auto;
  padding: 24px;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px);
  background-size: 28px 28px;
}

.axis-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 180px;
  border-top: 2px dashed #93c5fd;
}

.event-lane {
  position: relative;
  min-width: 1280px;
  height: 430px;
}

.event-card {
  position: absolute;
  width: 200px;
  border: 1px solid #d7deea;
  border-radius: 12px;
  background: #fff;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  transition: all 0.16s ease;

  &:hover {
    border-color: #60a5fa;
    transform: translateY(-2px);
  }

  &.is-active {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  h4 {
    margin: 0;
    font-size: 13px;
    color: #0f172a;
  }

  p {
    margin: 6px 0;
    font-size: 12px;
    color: #64748b;
    line-height: 1.4;
    min-height: 34px;
  }
}

.event-dot {
  position: absolute;
  left: 50%;
  bottom: -34px;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.event-time {
  font-size: 11px;
  color: #1d4ed8;
  font-weight: 600;
}

.event-detail {
  border-left: 1px solid #d7deea;
  background: #fff;
  padding: 14px;
  overflow: auto;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #0f172a;
  }

  p {
    margin: 10px 0;
    font-size: 13px;
    color: #475569;
    line-height: 1.5;
  }
}

@media (max-width: 1080px) {
  .timeline-canvas-view {
    grid-template-columns: minmax(0, 1fr);
  }

  .event-detail {
    display: none;
  }
}
</style>
