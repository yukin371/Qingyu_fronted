<template>
  <section class="tool-panel">
    <header class="tool-panel__header">
      <div>
        <p class="tool-panel__eyebrow">Summary</p>
        <h3>总结工作台</h3>
      </div>
      <div class="tool-panel__actions">
        <button
          type="button"
          class="tool-panel__secondary"
          :disabled="loading || !content.trim()"
          @click="handleSelectionSummary"
        >
          {{ loading && mode === 'selection' ? '处理中…' : '总结片段' }}
        </button>
        <button
          type="button"
          class="tool-panel__primary"
          :disabled="loading || !projectId || !chapterId"
          @click="handleChapterSummary"
        >
          {{ loading && mode === 'chapter' ? '处理中…' : '总结章节' }}
        </button>
      </div>
    </header>

    <label class="field field--stacked">
      <span>内容输入</span>
      <textarea
        v-model="content"
        rows="7"
        placeholder="输入要提炼的文本，或直接使用章节总结。"
      />
    </label>

    <div
      class="tool-panel__status"
      :class="{
        'tool-panel__status--running': loading,
        'tool-panel__status--success': !!summary && !loading,
        'tool-panel__status--warning': !!props.actionTrigger && !summary && !loading,
      }"
    >
      <strong>{{ statusTitle }}</strong>
      <span>{{ statusDescription }}</span>
    </div>

    <div v-if="!summary && !errorText" class="tool-panel__empty">
      <strong>摘要结果会显示在这里</strong>
      <p>片段模式适合快速提炼重点，章节模式会调用当前章节上下文生成更完整的结构化摘要。</p>
    </div>

    <article v-if="summary" class="result-card">
      <div class="result-card__header">
        <div>
          <strong>{{ mode === 'chapter' ? '章节摘要' : '片段摘要' }}</strong>
          <p class="result-card__caption">{{ mode === 'chapter' ? '针对当前章节生成结构化摘要。' : '适合快速提炼当前片段的核心信息。' }}</p>
        </div>
      </div>
      <div class="result-card__meta-row">
        <span class="result-chip">{{ mode === 'chapter' ? '章节模式' : '片段模式' }}</span>
        <span v-if="keyPoints.length" class="result-chip result-chip--soft">要点 {{ keyPoints.length }}</span>
      </div>
      <div class="result-card__body">
        <div class="result-card__section">
          <span class="result-card__section-label">摘要正文</span>
          <p class="summary-text">{{ summary }}</p>
        </div>
        <div v-if="keyPoints.length" class="result-card__section">
          <span class="result-card__section-label">核心要点</span>
          <ul class="summary-points">
            <li v-for="point in keyPoints" :key="point">{{ point }}</li>
          </ul>
        </div>
      </div>
    </article>

    <p v-if="errorText" class="tool-error">{{ errorText }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { summarizeChapter, summarizeSelection } from '@/modules/ai/api/workbench'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  seedText: string
  actionTrigger: {
    id: number
    action: string
    text: string
    instructions?: string
    applyMode?: 'replace_selection' | 'insert_after_selection' | 'append_paragraph' | 'replace_document'
  } | null
}>()

const content = ref('')
const summary = ref('')
const keyPoints = ref<string[]>([])
const loading = ref(false)
const errorText = ref('')
const mode = ref<'selection' | 'chapter'>('selection')
const statusTitle = computed(() => {
  if (loading.value) return mode.value === 'chapter' ? '正在提炼章节摘要' : '正在提炼片段摘要'
  if (summary.value.trim()) return '摘要已生成'
  if (props.actionTrigger) return '已同步章节或片段意图'
  return '等待总结任务'
})
const statusDescription = computed(() => {
  if (loading.value) return '系统会抽取主线信息并整理关键要点。'
  if (summary.value.trim()) return keyPoints.value.length > 0 ? `已整理 ${keyPoints.value.length} 条核心要点。` : '摘要已可用于继续审校或对话。'
  if (props.actionTrigger) return '来自章节动作或选区动作的上下文已注入。'
  return '可以先粘贴片段，也可以直接对当前章节生成摘要。'
})

watch(
  () => props.seedText,
  (value) => {
    if (!content.value.trim() && value.trim()) {
      content.value = value
    }
  },
  { immediate: true },
)

watch(
  () => props.actionTrigger?.id,
  async () => {
    const trigger = props.actionTrigger
    if (!trigger || !['summary', 'summarize', 'summarize_chapter'].includes(trigger.action)) return

    content.value = trigger.text?.trim() || props.seedText || ''

    if (trigger.action === 'summarize_chapter' && props.projectId && props.chapterId) {
      await handleChapterSummary()
      return
    }

    if (content.value.trim()) {
      await handleSelectionSummary()
    }
  },
)

async function handleSelectionSummary() {
  if (!content.value.trim()) return
  loading.value = true
  mode.value = 'selection'
  errorText.value = ''
  try {
    const result = await summarizeSelection({
      content: content.value,
      projectId: props.projectId || undefined,
      chapterId: props.chapterId || undefined,
      summaryType: 'detailed',
    })
    summary.value = result.summary
    keyPoints.value = result.keyPoints
  } catch (error) {
    console.error('[SummaryWorkbenchTool] selection summarize failed:', error)
    errorText.value = '总结失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

async function handleChapterSummary() {
  if (!props.projectId || !props.chapterId) return
  loading.value = true
  mode.value = 'chapter'
  errorText.value = ''
  try {
    const result = await summarizeChapter({
      projectId: props.projectId,
      chapterId: props.chapterId,
      outlineLevel: 3,
    })
    summary.value = result.summary
    keyPoints.value = result.keyPoints
  } catch (error) {
    console.error('[SummaryWorkbenchTool] chapter summarize failed:', error)
    errorText.value = '章节总结失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@use './shared.scss';

.summary-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: #544d47;
}

.summary-points {
  margin: 12px 0 0;
  padding-left: 18px;
  color: #544d47;
  display: grid;
  gap: 8px;
}
</style>
