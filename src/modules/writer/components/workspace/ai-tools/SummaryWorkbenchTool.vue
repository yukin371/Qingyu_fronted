<template>
  <section class="tool-panel">
    <header class="tool-panel__header">
      <div class="tool-panel__header-copy">
        <p class="tool-panel__eyebrow">总结</p>
        <h3 class="tool-panel__title">摘要与方向提炼</h3>
        <p class="tool-panel__lede">
          统一输出片段摘要或章节方向提案，只生成候选，不直接覆盖正文。
        </p>
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
      <p>可总结片段，也可直接总结当前章节。</p>
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
import type {
  WriterAIActionTrigger,
  WriterResultCandidate,
} from '@/modules/writer/types/workflow'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  seedText: string
  actionTrigger: WriterAIActionTrigger | null
}>()

const emit = defineEmits<{
  (e: 'resultCandidate', payload: WriterResultCandidate): void
}>()

const content = ref('')
const summary = ref('')
const keyPoints = ref<string[]>([])
const loading = ref(false)
const errorText = ref('')
const mode = ref<'selection' | 'chapter'>('selection')
const statusTitle = computed(() => {
  if (loading.value) return '处理中'
  if (summary.value.trim()) return '已就绪'
  if (props.actionTrigger) return '已同步'
  return '等待执行'
})
const statusDescription = computed(() => {
  if (loading.value) return mode.value === 'chapter' ? '正在提炼章节摘要。' : '正在提炼片段摘要。'
  if (summary.value.trim()) {
    return keyPoints.value.length > 0 ? `已生成摘要与 ${keyPoints.value.length} 条要点。` : '已生成摘要结果。'
  }
  if (props.actionTrigger) return '已注入章节/片段上下文，可直接执行。'
  return '可先输入片段，或直接总结章节。'
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

function buildGeneratedText(nextSummary: string, nextKeyPoints: string[]) {
  if (nextKeyPoints.length === 0) {
    return nextSummary
  }

  return `${nextSummary}\n\n核心要点：\n${nextKeyPoints.map((point) => `- ${point}`).join('\n')}`
}

function emitResultCandidate(nextSummary: string, nextKeyPoints: string[]) {
  const generatedText = buildGeneratedText(nextSummary, nextKeyPoints)
  const isChapterMode = mode.value === 'chapter'
  const sourceText = isChapterMode
    ? props.chapterTitle || props.chapterId || props.seedText || content.value
    : content.value

  emit('resultCandidate', {
    source: 'summary',
    action: isChapterMode ? 'summarize_chapter' : 'summary',
    title: isChapterMode ? '章节方向提案' : '片段摘要结果',
    summary: nextSummary.slice(0, 72) || '已生成新的摘要结果。',
    generatedText,
    sourceText,
  })
}

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
    emitResultCandidate(result.summary, result.keyPoints)
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
    emitResultCandidate(result.summary, result.keyPoints)
  } catch (error) {
    console.error('[SummaryWorkbenchTool] chapter summarize failed:', error)
    if (props.seedText.trim()) {
      try {
        const fallbackResult = await summarizeSelection({
          content: props.seedText,
          projectId: props.projectId || undefined,
          chapterId: props.chapterId || undefined,
          summaryType: 'detailed',
        })
        summary.value = fallbackResult.summary
        keyPoints.value = fallbackResult.keyPoints
        emitResultCandidate(fallbackResult.summary, fallbackResult.keyPoints)
        errorText.value = ''
        return
      } catch (fallbackError) {
        console.error('[SummaryWorkbenchTool] chapter summarize fallback failed:', fallbackError)
      }
    }
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
