<template>
  <aside class="story-harness-panel" data-testid="story-harness-panel">
    <header class="story-harness-panel__header">
      <div>
        <p class="story-harness-panel__eyebrow">Story Harness</p>
        <h3 class="story-harness-panel__title">V3 写作宿主</h3>
      </div>
      <span class="story-harness-panel__phase">Phase 1</span>
    </header>

    <section class="story-harness-panel__section">
      <div class="story-harness-panel__section-header">
        <h4>Context Lens</h4>
        <span>{{ harnessStore.writingStateLabel }}</span>
      </div>
      <div class="story-harness-card">
        <p class="story-harness-card__label">当前章节</p>
        <p class="story-harness-card__value">{{ chapterTitle || '未命名章节' }}</p>
      </div>
      <div class="story-harness-card">
        <p class="story-harness-card__label">当前状态</p>
        <p class="story-harness-card__value">{{ harnessStore.chapterProgressLabel }}</p>
      </div>
      <div class="story-harness-card">
        <p class="story-harness-card__label">正文长度</p>
        <p class="story-harness-card__value">{{ harnessStore.draftLength }} 字符</p>
      </div>
    </section>

    <section class="story-harness-panel__section">
      <div class="story-harness-panel__section-header">
        <h4>Change Request</h4>
        <span>{{ harnessStore.pendingChangeRequestCount }} 待处理</span>
      </div>
      <div class="story-harness-callout">
        <p>当前先接入宿主与章节会话。</p>
        <p>保存后生成的状态建议、关系建议和证据链会接到这里。</p>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useStoryHarnessStore } from '@/modules/writer/stores/v3/storyHarnessStore'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  content: string
  chapterCount: number
}>()

const harnessStore = useStoryHarnessStore()

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
</script>

<style scoped lang="scss">
.story-harness-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 280px;
  max-width: 320px;
  padding: 16px;
  border-left: 1px solid var(--editor-border, #e2e8f0);
  background:
    linear-gradient(180deg, rgba(240, 249, 255, 0.9) 0%, rgba(248, 250, 252, 0.96) 100%);
}

.story-harness-panel__header,
.story-harness-panel__section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.story-harness-panel__eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0369a1;
}

.story-harness-panel__title,
.story-harness-panel__section h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--editor-text, #0f172a);
}

.story-harness-panel__phase,
.story-harness-panel__section-header span {
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(2, 132, 199, 0.1);
  color: #0369a1;
  font-size: 12px;
  font-weight: 600;
}

.story-harness-panel__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.story-harness-card,
.story-harness-callout {
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
}

.story-harness-card__label {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--editor-text-muted, #64748b);
}

.story-harness-card__value,
.story-harness-callout p {
  margin: 0;
  color: var(--editor-text, #0f172a);
  line-height: 1.5;
}

.story-harness-callout {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 1200px) {
  .story-harness-panel {
    max-width: none;
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--editor-border, #e2e8f0);
  }
}
</style>
