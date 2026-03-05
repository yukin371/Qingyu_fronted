<template>
  <div class="timeline-sidebar">
    <div class="sidebar-header">
      <h3>时间线</h3>
      <el-tag v-if="timelines.length" size="small" type="info">{{ timelines.length }}</el-tag>
    </div>

    <el-scrollbar class="sidebar-content">
      <button
        v-for="timeline in timelines"
        :key="timeline.id"
        type="button"
        class="timeline-item"
        :class="{ 'is-active': currentTimeline?.id === timeline.id }"
        @click="selectTimeline(timeline.id)"
      >
        <div class="timeline-title">{{ timeline.name }}</div>
        <div class="timeline-desc">{{ timeline.description || '暂无说明' }}</div>
      </button>

      <el-empty v-if="timelines.length === 0" description="暂无时间线" :image-size="80" />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useWriterStore } from '../stores/writerStore'

const writerStore = useWriterStore()

const timelines = computed(() => writerStore.timeline.list || [])
const currentTimeline = computed(() => writerStore.timeline.currentTimeline)

onMounted(async () => {
  if (!writerStore.currentProjectId) return
  await writerStore.loadTimelines()
})

watch(
  () => writerStore.currentProjectId,
  async (projectId) => {
    if (!projectId) return
    await writerStore.loadTimelines(projectId)
  },
  { immediate: true }
)

const selectTimeline = async (timelineId: string) => {
  const timeline = timelines.value.find(item => item.id === timelineId)
  if (!timeline) return
  writerStore.setCurrentTimeline(timeline)
  await writerStore.loadTimelineEvents(timelineId)
}
</script>

<style scoped lang="scss">
.timeline-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #dbe3ef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
  }
}

.sidebar-content {
  flex: 1;
  padding: 10px;
}

.timeline-item {
  width: 100%;
  text-align: left;
  border: 1px solid #d7deea;
  border-radius: 10px;
  background: #fff;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }

  &.is-active {
    border-color: #60a5fa;
    background: #eff6ff;
  }
}

.timeline-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.timeline-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}
</style>
