<template>
  <div class="timeline-bar" :class="{ 'is-collapsed': !isExpanded }">
    <!-- 控制栏 -->
    <div class="timeline-header">
      <div class="header-left">
        <el-icon class="timeline-icon"><Clock /></el-icon>
        <span class="timeline-title">时间线</span>
        <el-tag v-if="events.length > 0" size="small" type="info">
          {{ events.length }} 个事件
        </el-tag>
      </div>
      <div class="header-actions">
        <el-button
          text
          size="small"
          :icon="Plus"
          @click="handleAddEvent"
          title="添加事件"
        >
          添加
        </el-button>
        <el-button
          text
          size="small"
          :icon="isExpanded ? ArrowDown : ArrowUp"
          @click="toggleExpand"
          title="展开/收起"
        />
      </div>
    </div>

    <!-- 时间线内容 -->
    <div v-show="isExpanded" class="timeline-content">
      <el-scrollbar>
        <div class="timeline-track">
          <div
            v-for="event in sortedEvents"
            :key="event.id"
            class="timeline-event"
            :class="`event-type-${event.eventType}`"
            @click="handleEventClick(event)"
          >
            <div class="event-marker" :style="{ backgroundColor: getEventColor(event.eventType) }">
              <el-icon>
                <component :is="getEventIcon(event.eventType)" />
              </el-icon>
            </div>
            <div class="event-content">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-time" v-if="event.storyTime">
                {{ formatStoryTime(event.storyTime) }}
              </div>
            </div>
            <div class="event-importance">
              <el-rate
                v-model="event.importance"
                disabled
                :max="10"
                size="small"
                show-score
                text-color="#ff9900"
              />
            </div>
          </div>

          <el-empty
            v-if="events.length === 0"
            description="暂无时间线事件"
            :image-size="80"
          />
        </div>
      </el-scrollbar>
    </div>

    <!-- 添加事件对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加时间线事件"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="eventForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="事件标题" prop="title">
          <el-input v-model="eventForm.title" placeholder="请输入事件标题" />
        </el-form-item>
        <el-form-item label="事件类型" prop="eventType">
          <el-select v-model="eventForm.eventType" placeholder="选择事件类型">
            <el-option label="情节事件" value="plot" />
            <el-option label="角色事件" value="character" />
            <el-option label="世界事件" value="world" />
            <el-option label="背景事件" value="background" />
            <el-option label="里程碑" value="milestone" />
          </el-select>
        </el-form-item>
        <el-form-item label="重要性" prop="importance">
          <el-slider v-model="eventForm.importance" :min="1" :max="10" show-stops />
        </el-form-item>
        <el-form-item label="事件描述">
          <el-input
            v-model="eventForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入事件描述"
          />
        </el-form-item>
        <el-form-item label="事件时间">
          <el-input
            v-model="eventForm.storyTime"
            placeholder="例如：第三天早晨"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWriterStore } from '../stores/writerStore'
import type { TimelineEvent, EventType } from '@/types/writer'
import {
  Clock,
  Plus,
  ArrowDown,
  ArrowUp,
  Stamp,
  User,
  LocationInformation,
  Document,
  TrophyBase
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Props {
  timelineId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  eventClick: [event: TimelineEvent]
  eventAdded: [event: TimelineEvent]
}>()

const writerStore = useWriterStore()
const isExpanded = ref(true)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref()

const eventForm = ref({
  title: '',
  description: '',
  eventType: 'plot' as EventType,
  importance: 5,
  storyTime: ''
})

const formRules = {
  title: [
    { required: true, message: '请输入事件标题', trigger: 'blur' }
  ],
  eventType: [
    { required: true, message: '请选择事件类型', trigger: 'change' }
  ]
}

const events = computed(() => writerStore.timeline.events)

const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    // 按重要性排序
    return b.importance - a.importance
  })
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  writerStore.toggleTimelineBar(isExpanded.value)
}

const handleAddEvent = () => {
  dialogVisible.value = true
  resetForm()
}

const resetForm = () => {
  eventForm.value = {
    title: '',
    description: '',
    eventType: 'plot',
    importance: 5,
    storyTime: ''
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    const timelineId = props.timelineId || writerStore.timeline.currentTimeline?.id
    if (!timelineId) {
      ElMessage.warning('请先选择时间线')
      return
    }

    const projectId = writerStore.currentProjectId
    if (!projectId) {
      ElMessage.warning('请先选择项目')
      return
    }

    submitting.value = true
    try {
      const { createTimelineEvent } = await import('../api')
      const newEvent = await createTimelineEvent(timelineId, projectId, {
        timelineId,
        title: eventForm.value.title,
        description: eventForm.value.description,
        eventType: eventForm.value.eventType,
        importance: eventForm.value.importance,
        storyTime: eventForm.value.storyTime
          ? { description: eventForm.value.storyTime }
          : undefined
      })

      // 重新加载事件列表
      await writerStore.loadTimelineEvents(timelineId)

      ElMessage.success('事件添加成功')
      dialogVisible.value = false
      emit('eventAdded', newEvent)
    } catch (error: any) {
      console.error('添加事件失败:', error)
      ElMessage.error(error.message || '添加事件失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleEventClick = (event: TimelineEvent) => {
  emit('eventClick', event)
}

const getEventColor = (type: EventType): string => {
  const colorMap: Record<EventType, string> = {
    plot: '#409eff',
    character: '#67c23a',
    world: '#e6a23c',
    background: '#909399',
    milestone: '#f56c6c'
  }
  return colorMap[type] || '#909399'
}

const getEventIcon = (type: EventType) => {
  const iconMap: Record<EventType, any> = {
    plot: Stamp,
    character: User,
    world: LocationInformation,
    background: Document,
    milestone: TrophyBase
  }
  return iconMap[type] || Stamp
}

const formatStoryTime = (storyTime: any): string => {
  if (!storyTime) return ''
  if (storyTime.description) return storyTime.description

  let timeStr = ''
  if (storyTime.era) timeStr += storyTime.era + ' '
  if (storyTime.year) timeStr += `${storyTime.year}年`
  if (storyTime.month) timeStr += `${storyTime.month}月`
  if (storyTime.day) timeStr += `${storyTime.day}日`
  if (storyTime.season) timeStr += ' ' + storyTime.season

  return timeStr || '未指定时间'
}
</script>

<style scoped lang="scss">
.timeline-bar {
  position: relative;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  transition: height 0.3s ease;

  &.is-collapsed {
    height: 48px;
    overflow: hidden;
  }
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(90deg, #f9fafb 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;

  .timeline-icon {
    font-size: 18px;
    color: #409eff;
  }

  .timeline-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.header-actions {
  display: flex;
  gap: 4px;
}

.timeline-content {
  height: 200px;
  padding: 8px;
}

.timeline-track {
  display: flex;
  gap: 12px;
  padding: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  min-height: 100px;
}

.timeline-event {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  min-width: 180px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #409eff;
  }
}

.event-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.event-content {
  flex: 1;
  text-align: center;

  .event-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .event-time {
    font-size: 12px;
    color: #909399;
  }
}

.event-importance {
  :deep(.el-rate) {
    height: 16px;

    .el-rate__icon {
      font-size: 12px;
      margin-right: 2px;
    }

    .el-rate__text {
      font-size: 12px;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timeline-track {
    flex-direction: column;
  }

  .timeline-event {
    min-width: 100%;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .timeline-bar {
    background: #1a1a1a;
    border-top-color: #2d2d2d;
  }

  .timeline-header {
    background: linear-gradient(90deg, #0d0d0d 0%, #1a1a1a 100%);
    border-bottom-color: #2d2d2d;
  }

  .timeline-event {
    background: #1a1a1a;
    border-color: #2d2d2d;

    &:hover {
      border-color: #409eff;
    }
  }

  .event-content .event-title {
    color: #e5e5e5;
  }
}
</style>



