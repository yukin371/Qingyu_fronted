<template>
  <div class="reader-demo">
    <div class="controls">
      <h2>阅读器演示</h2>
      <div class="control-row">
        <label>字号</label>
        <select v-model="fontSize">
          <option v-for="s in [14, 16, 18, 20, 22, 24]" :key="s" :value="s">{{ s }}px</option>
        </select>

        <label>主题</label>
        <select v-model="theme">
          <option value="light">浅色</option>
          <option value="sepia">米色</option>
          <option value="dark">深色</option>
        </select>

        <button @click="toggleFullscreen">全屏</button>
      </div>
    </div>

    <div class="reader-area" :class="theme" :style="{ fontSize: fontSize + 'px' }" ref="readerRef">
      <div class="reader-header">
        <strong>{{ currentChapter.title }}</strong>
        <div class="chapter-controls">
          <button @click="prevChapter" :disabled="chapterIndex === 0">上一章</button>
          <button @click="nextChapter" :disabled="chapterIndex === chapters.length - 1">下一章</button>
        </div>
      </div>

      <div class="reader-content">
        <p v-for="(line, idx) in currentPageLines" :key="idx">{{ line }}</p>
      </div>

      <div class="reader-footer">
        <div class="pager">
          <button @click="prevPage" :disabled="pageIndex === 0">上一页</button>
          <span>第 {{ pageIndex + 1 }} / {{ pagesCount }} 页</span>
          <button @click="nextPage" :disabled="pageIndex >= pagesCount - 1">下一页</button>
        </div>
        <div class="progress">
          <div class="bar">
            <div class="fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <small>{{ progressPercent.toFixed(0) }}%</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// 简要示例章节（演示用）
const chapters = [
  {
    title: '第一章：开始',
    text: `这是阅读器演示页面的第一章内容。它会自动分页并支持调整字号、切换主题和进入全屏进行演示。可以把任意长文本放在这里以查看分页效果。\n\n` +
      '青羽写作平台的阅读器演示仅用于展示基本交互：上一/下一章、上一/下一页、进度显示、字号和主题切换。'
  },
  {
    title: '第二章：进阶',
    text: `第二章示例文本。为了演示分页，我们会重复一些句子。\n\n` + '这是第二章的示例内容。'.repeat(80)
  }
]

const chapterIndex = ref(0)
const pageIndex = ref(0)
const fontSize = ref(18)
const theme = ref<'light' | 'sepia' | 'dark'>('light')
const readerRef = ref<HTMLElement | null>(null)

const currentChapter = computed(() => chapters[chapterIndex.value])

// 简易按字符分页：charsPerPage 与字号成反比，作为演示足够
const charsPerPage = computed(() => Math.max(200, Math.floor(1200 * (18 / fontSize.value))))

const pages = computed(() => {
  const text = currentChapter.value.text.replace(/\n/g, '\n')
  const size = charsPerPage.value
  const arr: string[] = []
  for (let i = 0; i < text.length; i += size) {
    arr.push(text.slice(i, i + size))
  }
  return arr
})

const pagesCount = computed(() => Math.max(1, pages.value.length))

const currentPageLines = computed(() => {
  // 为了更好的可读性，将当前页按段落分行显示
  const txt = pages.value[pageIndex.value] || ''
  return txt.split('\n').map(s => s.trim()).filter(Boolean)
})

const progressPercent = computed(() => {
  const chapProgress = (pageIndex.value) / pagesCount.value
  const overall = (chapterIndex.value + chapProgress) / chapters.length
  return overall * 100
})

function nextPage() {
  if (pageIndex.value < pagesCount.value - 1) {
    pageIndex.value++
  } else if (chapterIndex.value < chapters.length - 1) {
    chapterIndex.value++
    pageIndex.value = 0
  }
}

function prevPage() {
  if (pageIndex.value > 0) {
    pageIndex.value--
  } else if (chapterIndex.value > 0) {
    chapterIndex.value--
    pageIndex.value = Math.max(0, pagesCount.value - 1)
  }
}

function nextChapter() {
  if (chapterIndex.value < chapters.length - 1) {
    chapterIndex.value++
    pageIndex.value = 0
  }
}

function prevChapter() {
  if (chapterIndex.value > 0) {
    chapterIndex.value--
    pageIndex.value = 0
  }
}

function toggleFullscreen() {
  const el = document.documentElement as any
  if (!document.fullscreenElement) {
    el.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

// 当章节或字号变化时重置或调整分页索引
watch([chapterIndex, fontSize], () => {
  pageIndex.value = 0
})

onMounted(() => {
  // 保证至少有一页
  if (pageIndex.value >= pagesCount.value) pageIndex.value = 0
})
</script>

<style scoped>
.reader-demo {
  padding: 16px;
}

.controls {
  margin-bottom: 12px;
}

.control-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.reader-area {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  height: 65vh;
  display: flex;
  flex-direction: column;
}

.reader-area.light {
  background: #ffffff;
  color: #111827
}

.reader-area.sepia {
  background: #f4ecd8;
  color: #2b2b2b
}

.reader-area.dark {
  background: #0b1220;
  color: #e6eef8
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px
}

.reader-content {
  flex: 1;
  overflow: auto;
  padding-right: 8px
}

.reader-content p {
  text-indent: 2em;
  margin: 8px 0;
  line-height: 1.8
}

.reader-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px
}

.pager button {
  margin: 0 6px
}

.progress {
  display: flex;
  align-items: center;
  gap: 8px
}

.bar {
  width: 200px;
  height: 8px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden
}

.fill {
  height: 100%;
  background: #3b82f6
}
</style>
