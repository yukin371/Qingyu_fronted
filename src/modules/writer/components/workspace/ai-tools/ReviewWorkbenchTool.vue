<template>
  <section class="tool-panel">
    <header class="tool-panel__header">
      <div class="tool-panel__header-copy">
        <p class="tool-panel__eyebrow">审校</p>
        <h3 class="tool-panel__title">章节审校与移动端预览</h3>
        <p class="tool-panel__lede">
          校对结果先进入人工确认，接受后才挂到正文 diff，手机预览用于检查移动端阅读节奏。
        </p>
      </div>
      <div class="tool-panel__actions">
        <button
          type="button"
          class="tool-panel__secondary"
          :disabled="loading || !content.trim()"
          @click="handleProofread"
        >
          {{ loading && mode === 'proofread' ? '处理中…' : '文本校对' }}
        </button>
        <button
          type="button"
          class="tool-panel__primary"
          :disabled="loading || !content.trim()"
          @click="handleAudit"
        >
          {{ loading && mode === 'audit' ? '处理中…' : '敏感词检查' }}
        </button>
      </div>
    </header>

    <label class="field field--stacked">
      <span>检测内容</span>
      <textarea
        v-model="content"
        rows="7"
        placeholder="输入需要检测的内容。后续可直接抓取当前章节正文。"
        @input="markIssuesStale"
      />
    </label>

    <div
      class="tool-panel__status"
      :class="{
        'tool-panel__status--running': loading,
        'tool-panel__status--success': hasResult && staleIssueCount === 0 && !loading,
        'tool-panel__status--warning':
          !loading && (staleIssueCount > 0 || (!!props.actionTrigger && !hasResult)),
      }"
    >
      <strong>{{ statusTitle }}</strong>
      <span>{{ statusDescription }}</span>
    </div>

    <div class="review-tabs" role="tablist" aria-label="审校结果视图">
      <button
        type="button"
        class="review-tab"
        :class="{ active: activeView === 'issues' }"
        @click="activeView = 'issues'"
      >
        问题
      </button>
      <button
        type="button"
        class="review-tab"
        :class="{ active: activeView === 'preview' }"
        @click="activeView = 'preview'"
      >
        预览
      </button>
    </div>

    <div v-if="activeView === 'issues'">
      <div v-if="!hasResult && !errorText" class="tool-panel__empty">
        <strong>审校结果会显示在这里</strong>
        <p>可执行文本校对或风险检查。</p>
      </div>

      <article v-if="mode === 'proofread' && issues.length" class="result-card">
        <div class="result-card__header">
          <div>
            <strong>校对结果</strong>
            <p class="result-card__caption">聚焦错别字、病句、标点和移动端阅读体验。</p>
          </div>
          <span class="pill">评分 {{ scoreText }}</span>
        </div>
        <div class="result-card__meta-row">
          <span class="result-chip">开放 {{ openIssues.length }}</span>
          <span class="result-chip result-chip--warn">必须改 {{ errorIssueCount }}</span>
          <span class="result-chip result-chip--soft">已处理 {{ handledIssueCount }}</span>
        </div>
        <ul class="review-issues">
          <li
            v-for="issue in issues"
            :key="issue.id || issue.message"
            class="review-issue"
            :class="[`review-issue--${issue.status || 'open'}`]"
          >
            <div class="review-issue__header">
              <strong>
                {{ issueTypeText(issue.type) }}
                <span v-if="issue.severity" class="severity-pill">
                  {{ severityText(issue.severity) }}
                </span>
              </strong>
              <span class="issue-status">{{ issueStatusText(issue.status) }}</span>
            </div>
            <span>{{ issue.message || '未提供说明' }}</span>
            <small v-if="issue.originalText">原文：{{ issue.originalText }}</small>
            <small v-if="issueSuggestionText(issue)">建议：{{ issueSuggestionText(issue) }}</small>
            <small v-if="issueLocationHint(issue)" class="review-issue__hint">
              {{ issueLocationHint(issue) }}
            </small>
            <div class="review-issue__actions">
              <button
                type="button"
                class="result-card__action"
                :disabled="!canApplyIssue(issue)"
                @click="handleAcceptIssue(issue)"
              >
                接受
              </button>
              <button
                type="button"
                class="result-card__action result-card__action--ghost"
                :disabled="!canFocusIssue(issue)"
                @click="handleFocusIssue(issue)"
              >
                定位
              </button>
              <button
                type="button"
                class="result-card__action result-card__action--ghost"
                :disabled="issue.status === 'ignored' || issue.status === 'accepted'"
                @click="handleIgnoreIssue(issue)"
              >
                忽略
              </button>
            </div>
          </li>
        </ul>
      </article>

      <article v-if="mode === 'audit' && auditWords.length" class="result-card">
        <div class="result-card__header">
          <div>
            <strong>风险词结果</strong>
            <p class="result-card__caption">标出敏感词与疑似风险表达，便于二次人工复核。</p>
          </div>
          <span class="pill pill--warn">命中 {{ auditWords.length }}</span>
        </div>
        <div class="result-card__meta-row">
          <span class="result-chip result-chip--warn">{{ auditSummaryText }}</span>
        </div>
        <ul class="review-issues">
          <li v-for="word in auditWords" :key="String(word.id || word.word || word.context)">
            <strong>{{ String(word.word || '敏感项') }}</strong>
            <span>{{ String(word.suggestion || word.reason || '建议进一步人工复核') }}</span>
          </li>
        </ul>
      </article>
    </div>

    <article v-else class="result-card mobile-preview-card">
      <div class="result-card__header">
        <div>
          <strong>手机阅读预览</strong>
          <p class="result-card__caption">用移动端阅读参数检查段落长度、首屏节奏和问题高亮。</p>
        </div>
        <span class="pill">{{ previewDeviceLabel }}</span>
      </div>

      <div class="preview-controls">
        <label class="field">
          <span>主题</span>
          <select v-model="previewTheme">
            <option value="light">日间</option>
            <option value="sepia">护眼</option>
            <option value="night">夜间</option>
          </select>
        </label>
        <label class="field">
          <span>字号</span>
          <select v-model.number="previewFontSize">
            <option :value="15">小</option>
            <option :value="17">标准</option>
            <option :value="19">大</option>
          </select>
        </label>
        <label class="field">
          <span>行高</span>
          <select v-model.number="previewLineHeight">
            <option :value="1.6">紧凑</option>
            <option :value="1.85">标准</option>
            <option :value="2.05">舒展</option>
          </select>
        </label>
      </div>

      <label class="preview-toggle">
        <input v-model="showPreviewHighlights" type="checkbox" />
        <span>显示审校标记</span>
      </label>

      <div class="phone-preview" :class="`phone-preview--${previewTheme}`">
        <div class="phone-preview__bar">
          <span>{{ chapterTitle || '当前章节' }}</span>
          <span>Aa</span>
        </div>
        <div
          class="phone-preview__content"
          :style="{ fontSize: `${previewFontSize}px`, lineHeight: String(previewLineHeight) }"
          v-html="previewHtml"
        />
      </div>

      <div v-if="previewWarnings.length" class="preview-warnings">
        <strong>阅读风险</strong>
        <ul>
          <li v-for="warning in previewWarnings" :key="warning.id || warning.message">
            {{ warning.message || '建议人工复核移动端阅读体验' }}
          </li>
        </ul>
      </div>
    </article>

    <p v-if="errorText" class="tool-error">{{ errorText }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  auditSensitiveWords,
  proofreadContent,
  type MobilePreviewWarning,
  type ReviewIssue,
} from '@/modules/ai/api/workbench'
import type {
  WriterAIActionTrigger,
  WriterAIApplyPayload,
  WriterProofreadIssueHighlight,
  WriterResultCandidate,
} from '@/modules/writer/types/workflow'
import { saveProofreadQualityGateRecord } from '@/modules/writer/services/proofreadQualityGate.service'

const props = defineProps<{
  projectId: string
  chapterId: string
  chapterTitle: string
  seedText: string
  actionTrigger: WriterAIActionTrigger | null
}>()

const emit = defineEmits<{
  (e: 'resultCandidate', payload: WriterResultCandidate): void
  (e: 'apply', payload: WriterAIApplyPayload): void
  (e: 'proofreadIssuesChange', payload: WriterProofreadIssueHighlight[]): void
  (e: 'proofreadIssueFocus', payload: string): void
}>()

const content = ref('')
const loading = ref(false)
const errorText = ref('')
const mode = ref<'proofread' | 'audit'>('proofread')
const activeView = ref<'issues' | 'preview'>('issues')
const issues = ref<ReviewIssue[]>([])
const score = ref<number | undefined>(undefined)
const previewWarnings = ref<MobilePreviewWarning[]>([])
const auditWords = ref<Array<Record<string, unknown>>>([])
const previewTheme = ref<'light' | 'sepia' | 'night'>('light')
const previewFontSize = ref(17)
const previewLineHeight = ref(1.85)
const showPreviewHighlights = ref(true)
const suppressNextStaleMark = ref(false)

const scoreText = computed(() => (typeof score.value === 'number' ? score.value.toFixed(1) : '--'))
const auditSummaryText = computed(() =>
  auditWords.value.length > 0 ? `待人工复核 ${auditWords.value.length} 项` : '未发现明显风险词',
)
const openIssues = computed(() =>
  issues.value.filter((issue) => (issue.status || 'open') === 'open'),
)
const proofreadHighlights = computed<WriterProofreadIssueHighlight[]>(() =>
  openIssues.value
    .filter((issue) => isIssueOriginalTextMatched(issue))
    .map((issue) => ({
      id: issue.id || `${issue.type || 'issue'}-${issue.position!.start}-${issue.position!.end}`,
      severity:
        issue.severity === 'error' ||
        issue.severity === 'warning' ||
        issue.severity === 'suggestion'
          ? issue.severity
          : 'suggestion',
      position: {
        start: issue.position!.start,
        end: issue.position!.end,
      },
      originalText: issue.originalText,
      status: issue.status || 'open',
    })),
)
const errorIssueCount = computed(
  () => openIssues.value.filter((issue) => issue.severity === 'error').length,
)
const handledIssueCount = computed(
  () =>
    issues.value.filter((issue) => issue.status === 'accepted' || issue.status === 'ignored')
      .length,
)
const staleIssueCount = computed(
  () => issues.value.filter((issue) => issue.status === 'stale').length,
)
const hasResult = computed(
  () => issues.value.length > 0 || auditWords.value.length > 0 || previewWarnings.value.length > 0,
)
const previewDeviceLabel = computed(() =>
  previewFontSize.value >= 19 ? '大字模式' : previewFontSize.value <= 15 ? '小屏模式' : '标准手机',
)
const statusTitle = computed(() => {
  if (loading.value) return '处理中'
  if (staleIssueCount.value > 0) return '结果已过期'
  if (mode.value === 'audit' && auditWords.value.length > 0) return '已就绪'
  if (mode.value === 'proofread' && issues.value.length > 0) return '已就绪'
  if (previewWarnings.value.length > 0) return '已就绪'
  if (props.actionTrigger) return '已同步'
  return '等待执行'
})
const statusDescription = computed(() => {
  if (loading.value) return mode.value === 'audit' ? '正在扫描风险表达。' : '正在执行文本校对。'
  if (staleIssueCount.value > 0) return '正文已变化，请重新审校后再接受建议。'
  if (mode.value === 'audit' && auditWords.value.length > 0) {
    return `已识别 ${auditWords.value.length} 项，建议人工复核。`
  }
  if (mode.value === 'proofread' && issues.value.length > 0) {
    return `开放 ${openIssues.value.length} 条，评分 ${scoreText.value}。`
  }
  if (previewWarnings.value.length > 0) {
    return `发现 ${previewWarnings.value.length} 条移动端阅读风险。`
  }
  if (props.actionTrigger) return '已注入检测内容，可直接执行。'
  return '输入内容后可执行审校。'
})

const previewHtml = computed(() => {
  const escaped = escapeHtml(content.value || '暂无可预览内容。')
  if (!showPreviewHighlights.value || openIssues.value.length === 0) {
    return escaped
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('')
  }

  return renderHighlightedPreview(content.value, openIssues.value)
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
    if (!trigger || !['proofread', 'review', 'audit'].includes(trigger.action)) return

    content.value = trigger.text?.trim() || props.seedText || ''
    if (!content.value.trim()) return

    if (trigger.action === 'audit') {
      await handleAudit()
      return
    }

    await handleProofread()
  },
)

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderHighlightedPreview(rawText: string, nextIssues: ReviewIssue[]) {
  const ranges = nextIssues
    .filter((issue) => issue.position && canApplyIssue(issue))
    .map((issue) => ({
      start: issue.position!.start,
      end: issue.position!.end,
      severity: issue.severity || 'suggestion',
    }))
    .sort((left, right) => left.start - right.start)

  let cursor = 0
  let html = ''
  for (const range of ranges) {
    if (range.start < cursor) continue
    html += escapeHtml(rawText.slice(cursor, range.start))
    html += `<mark class="preview-mark preview-mark--${escapeHtml(String(range.severity))}">${escapeHtml(
      rawText.slice(range.start, range.end),
    )}</mark>`
    cursor = range.end
  }
  html += escapeHtml(rawText.slice(cursor))

  return html
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function issueTypeText(type?: string) {
  const labels: Record<string, string> = {
    typo: '错别字',
    spelling: '错别字',
    grammar: '病句',
    punctuation: '标点',
    style: '表达',
    readability: '阅读体验',
    continuity: '一致性',
  }
  return labels[String(type || '').toLowerCase()] || type || '问题'
}

function severityText(severity?: string) {
  const labels: Record<string, string> = {
    error: '必须改',
    warning: '建议改',
    suggestion: '可忽略',
    medium: '建议改',
    info: '提示',
  }
  return labels[String(severity || '').toLowerCase()] || severity || '提示'
}

function issueStatusText(status?: ReviewIssue['status']) {
  if (status === 'accepted') return '已接受'
  if (status === 'ignored') return '已忽略'
  if (status === 'stale') return '已过期'
  return '待处理'
}

function issueSuggestionText(issue: ReviewIssue) {
  if (issue.suggestionDetails?.length) {
    return issue.suggestionDetails
      .map((suggestion) =>
        suggestion.reason ? `${suggestion.text}（${suggestion.reason}）` : suggestion.text,
      )
      .join('；')
  }

  return issue.suggestions?.join('；') || ''
}

function firstSuggestionText(issue: ReviewIssue) {
  return issue.suggestionDetails?.[0]?.text || issue.suggestions?.[0] || ''
}

function isOpenIssue(issue: ReviewIssue) {
  return (issue.status || 'open') === 'open'
}

function isIssuePositionInBounds(issue: ReviewIssue) {
  if (!issue.position) return false
  const { start, end } = issue.position
  return start >= 0 && end > start && end <= content.value.length
}

function isIssueOriginalTextMatched(issue: ReviewIssue) {
  if (!issue.originalText || !isIssuePositionInBounds(issue) || !issue.position) return false
  return content.value.slice(issue.position.start, issue.position.end) === issue.originalText
}

function issueLocationHint(issue: ReviewIssue) {
  if (!isOpenIssue(issue)) return ''
  if (!issue.position) return '模型未返回可定位位置，仅可人工参考。'
  if (!isIssuePositionInBounds(issue)) return '定位超出当前正文范围，请重新审校。'
  if (!issue.originalText) return '缺少原文片段，已禁用自动替换。'
  if (!isIssueOriginalTextMatched(issue)) return '原文片段与当前正文不一致，请重新审校。'
  if (!firstSuggestionText(issue)) return '已定位原文，但模型未提供可接受的替换文本。'
  return ''
}

function canApplyIssue(issue: ReviewIssue) {
  if (!isOpenIssue(issue)) return false
  const suggestion = firstSuggestionText(issue)
  return !!suggestion && isIssueOriginalTextMatched(issue)
}

function canFocusIssue(issue: ReviewIssue) {
  return isOpenIssue(issue) && !!issue.id && isIssueOriginalTextMatched(issue)
}

function markIssuesStale() {
  if (suppressNextStaleMark.value) {
    suppressNextStaleMark.value = false
    return
  }

  issues.value = issues.value.map((issue) =>
    (issue.status || 'open') === 'open' ? { ...issue, status: 'stale' } : issue,
  )
  emitProofreadIssuesChange()
}

function emitProofreadIssuesChange() {
  emit('proofreadIssuesChange', proofreadHighlights.value)
}

function buildProofreadGeneratedText(nextIssues: ReviewIssue[], nextScore?: number) {
  const header =
    typeof nextScore === 'number' ? `审校评分：${nextScore.toFixed(1)}` : '审校结果：需要人工复核'
  const issueLines = nextIssues.map((issue, index) => {
    const parts = [
      `${index + 1}. ${issueTypeText(issue.type)}：${issue.message || '未提供说明'}`,
      issueSuggestionText(issue) ? `建议：${issueSuggestionText(issue)}` : '',
    ].filter(Boolean)
    return parts.join('；')
  })

  return [header, ...issueLines].join('\n')
}

function buildAuditGeneratedText(nextAuditWords: Array<Record<string, unknown>>) {
  return nextAuditWords
    .map((word, index) => {
      const label = String(word.word || word.context || `风险项 ${index + 1}`)
      const suggestion = String(word.suggestion || word.reason || '建议进一步人工复核')
      return `${index + 1}. ${label}：${suggestion}`
    })
    .join('\n')
}

function emitProofreadCandidate(nextIssues: ReviewIssue[], nextScore?: number) {
  emit('resultCandidate', {
    source: 'review',
    action: 'proofread',
    title: '审校建议提案',
    summary:
      nextIssues.length > 0
        ? `检测到 ${nextIssues.length} 条语言问题，建议人工复核后处理。`
        : '已生成审校建议提案。',
    generatedText: buildProofreadGeneratedText(nextIssues, nextScore),
    sourceText: content.value,
  })
}

function emitAuditCandidate(nextAuditWords: Array<Record<string, unknown>>) {
  emit('resultCandidate', {
    source: 'review',
    action: 'audit',
    title: '风险复核提案',
    summary:
      nextAuditWords.length > 0
        ? `命中 ${nextAuditWords.length} 项风险表达，建议二次复核。`
        : '已生成风险复核提案。',
    generatedText: buildAuditGeneratedText(nextAuditWords),
    sourceText: content.value,
  })
}

async function handleProofread() {
  if (!content.value.trim()) return
  loading.value = true
  mode.value = 'proofread'
  activeView.value = 'issues'
  errorText.value = ''
  try {
    const result = await proofreadContent({
      content: content.value,
      projectId: props.projectId || undefined,
      chapterId: props.chapterId || undefined,
    })
    issues.value = result.issues
    score.value = result.score
    previewWarnings.value = result.previewWarnings
    emitProofreadIssuesChange()
    saveProofreadQualityGateRecord({
      projectId: props.projectId || undefined,
      chapterId: props.chapterId || undefined,
      contentHash: result.contentHash,
      score: result.score,
      issues: result.issues,
      previewWarnings: result.previewWarnings,
    })
    emitProofreadCandidate(result.issues, result.score)
  } catch (error) {
    console.error('[ReviewWorkbenchTool] proofread failed:', error)
    errorText.value = '文本校对失败，请稍后重试。'
    emit('proofreadIssuesChange', [])
  } finally {
    loading.value = false
  }
}

async function handleAudit() {
  if (!content.value.trim()) return
  loading.value = true
  mode.value = 'audit'
  activeView.value = 'issues'
  errorText.value = ''
  try {
    const result = await auditSensitiveWords({
      content: content.value,
      projectId: props.projectId || undefined,
      chapterId: props.chapterId || undefined,
    })
    auditWords.value = result.sensitiveWords
    emit('proofreadIssuesChange', [])
    emitAuditCandidate(result.sensitiveWords)
  } catch (error) {
    console.error('[ReviewWorkbenchTool] audit failed:', error)
    errorText.value = '敏感词检测失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

function handleAcceptIssue(issue: ReviewIssue) {
  if (!canApplyIssue(issue) || !issue.position) return
  const suggestion = firstSuggestionText(issue)
  const previousContent = content.value
  const nextContent =
    previousContent.slice(0, issue.position.start) +
    suggestion +
    previousContent.slice(issue.position.end)

  suppressNextStaleMark.value = true
  content.value = nextContent
  issues.value = issues.value.map((item) =>
    item === issue ? { ...item, status: 'accepted' } : item,
  )
  emitProofreadIssuesChange()

  emit('apply', {
    action: 'proofread',
    sourceText: previousContent,
    generatedText: nextContent,
    applyMode: 'replace_document',
    targetDocumentId: props.chapterId || undefined,
    targetDocumentTitle: props.chapterTitle || undefined,
  })
}

function handleFocusIssue(issue: ReviewIssue) {
  if (!canFocusIssue(issue) || !issue.id) return
  emit('proofreadIssueFocus', issue.id)
}

function handleIgnoreIssue(issue: ReviewIssue) {
  issues.value = issues.value.map((item) =>
    item === issue ? { ...item, status: 'ignored' } : item,
  )
  emitProofreadIssuesChange()
}
</script>

<style scoped lang="scss">
@use './shared.scss';

.review-tabs {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.review-tab {
  border: 1px solid rgba(117, 93, 67, 0.16);
  border-radius: 12px;
  background: rgba(255, 253, 249, 0.82);
  color: #5f4e40;
  font-size: 12px;
  font-weight: 800;
  padding: 9px 10px;
  cursor: pointer;
}

.review-tab.active {
  background: #1f2430;
  color: #fff;
  border-color: #1f2430;
}

.review-issues {
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
  color: #544d47;
  list-style: none;
}

.review-issue {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(117, 93, 67, 0.12);
  background: rgba(255, 255, 255, 0.72);
}

.review-issue--accepted,
.review-issue--ignored,
.review-issue--stale {
  opacity: 0.68;
}

.review-issue__header,
.review-issue__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.review-issue strong {
  display: block;
  color: #1f2430;
}

.review-issue small {
  color: #7a6d63;
  font-size: 11px;
  line-height: 1.5;
}

.review-issue__hint {
  color: #8f3f2f;
  font-weight: 700;
}

.issue-status {
  font-size: 11px;
  font-weight: 800;
  color: #74685e;
}

.result-card__action--ghost {
  background: rgba(255, 253, 249, 0.72);
  color: #67594b;
}

.result-card__action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pill {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(54, 80, 107, 0.12);
  color: #27425c;
  font-size: 11px;
  font-weight: 800;
}

.pill--warn {
  background: rgba(143, 63, 47, 0.12);
  color: #7b3123;
}

.severity-pill {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(54, 80, 107, 0.1);
  color: #27425c;
  font-size: 10px;
  font-weight: 800;
}

.mobile-preview-card {
  display: grid;
  gap: 12px;
}

.preview-controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.preview-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #514538;
}

.phone-preview {
  width: min(100%, 360px);
  min-height: 540px;
  max-height: 620px;
  margin: 0 auto;
  border-radius: 28px;
  border: 10px solid #1f2430;
  overflow: hidden;
  box-shadow: 0 20px 42px rgba(31, 36, 48, 0.18);
  display: flex;
  flex-direction: column;
}

.phone-preview--light {
  background: #fbf7ef;
  color: #312b25;
}

.phone-preview--sepia {
  background: #f2e4ca;
  color: #3b3024;
}

.phone-preview--night {
  background: #171b22;
  color: #d8d2c7;
}

.phone-preview__bar {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(117, 93, 67, 0.16);
  font-size: 12px;
  font-weight: 800;
}

.phone-preview__content {
  flex: 1;
  overflow: auto;
  padding: 18px 18px 28px;
  word-break: break-word;
}

.phone-preview__content :deep(p) {
  margin: 0 0 1.1em;
  text-indent: 2em;
}

.phone-preview__content :deep(.preview-mark) {
  border-radius: 4px;
  padding: 0 2px;
}

.phone-preview__content :deep(.preview-mark--error) {
  background: rgba(188, 61, 47, 0.24);
}

.phone-preview__content :deep(.preview-mark--warning) {
  background: rgba(205, 143, 46, 0.24);
}

.phone-preview__content :deep(.preview-mark--suggestion) {
  background: rgba(54, 106, 155, 0.2);
}

.preview-warnings {
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(143, 63, 47, 0.14);
  background: rgba(255, 246, 239, 0.78);
}

.preview-warnings strong {
  font-size: 12px;
  color: #7b3123;
}

.preview-warnings ul {
  margin: 0;
  padding-left: 18px;
  color: #665448;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .preview-controls {
    grid-template-columns: 1fr;
  }

  .phone-preview {
    width: 100%;
  }
}
</style>
