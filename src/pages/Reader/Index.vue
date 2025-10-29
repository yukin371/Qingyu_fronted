<template>
  <div class="reader-container min-h-screen bg-gray-100">
    <!-- 顶部工具栏 -->
    <div
      class="reader-toolbar bg-white shadow-sm sticky top-0 z-40 transition-transform"
      :class="{ '-translate-y-full': !showToolbar }"
    >
      <div class="container mx-auto px-4 h-14 flex items-center justify-between">
        <!-- 左侧 -->
        <div class="flex items-center space-x-4">
          <el-button
            :icon="ArrowLeft"
            circle
            @click="handleBack"
          />
          <span class="text-sm font-medium text-gray-700 max-w-xs truncate">
            {{ currentChapter?.title }}
          </span>
        </div>

        <!-- 右侧 -->
        <div class="flex items-center space-x-2">
          <el-button :icon="List" circle @click="showChapterList = true" />
          <el-button :icon="Setting" circle @click="showSettings = true" />
        </div>
      </div>
    </div>

    <!-- 阅读内容 -->
    <div
      v-if="!isLoading && chapterContent"
      class="reader-content container mx-auto px-4 py-8 max-w-4xl"
      @click="toggleToolbar"
    >
      <!-- 章节标题 -->
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
        {{ currentChapter?.title }}
      </h1>

      <!-- 章节内容 -->
      <div
        class="reader-text prose prose-lg max-w-none"
        :style="contentStyle"
        v-html="formattedContent"
      />

      <!-- 章节底部信息 -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <div class="flex items-center justify-between text-sm text-gray-500 mb-6">
          <span>字数：{{ chapterContent.wordCount }}</span>
          <span>阅读进度：{{ readingProgress }}%</span>
        </div>

        <!-- 上一章/下一章 -->
        <div class="flex items-center justify-center space-x-4">
          <el-button
            :disabled="!hasPrevChapter"
            :icon="ArrowLeft"
            @click="handlePrevChapter"
          >
            上一章
          </el-button>
          <el-button
            type="primary"
            :disabled="!hasNextChapter"
            @click="handleNextChapter"
          >
            下一章
            <el-icon class="ml-2"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
    </div>

    <!-- 章节列表抽屉 -->
    <el-drawer
      v-model="showChapterList"
      title="章节目录"
      direction="rtl"
      size="400px"
    >
      <div class="space-y-2">
        <div
          v-for="chapter in chapters"
          :key="chapter.id"
          class="p-3 rounded hover:bg-gray-50 cursor-pointer transition-colors"
          :class="{ 'bg-blue-50': chapter.id === currentChapter?.id }"
          @click="handleChapterChange(chapter.id)"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">
              第{{ chapter.chapterNumber }}章 {{ chapter.title }}
            </span>
            <el-icon v-if="chapter.id === currentChapter?.id" class="text-blue-600">
              <Select />
            </el-icon>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 阅读设置抽屉 -->
    <el-drawer
      v-model="showSettings"
      title="阅读设置"
      direction="rtl"
      size="400px"
    >
      <div class="space-y-6">
        <!-- 字体大小 -->
        <div>
          <label class="block text-sm font-medium mb-2">字体大小</label>
          <el-slider
            v-model="settings.fontSize"
            :min="12"
            :max="24"
            :step="1"
            @change="handleSettingsChange"
          />
          <span class="text-xs text-gray-500">{{ settings.fontSize }}px</span>
        </div>

        <!-- 行高 -->
        <div>
          <label class="block text-sm font-medium mb-2">行高</label>
          <el-slider
            v-model="settings.lineHeight"
            :min="1.2"
            :max="2.5"
            :step="0.1"
            @change="handleSettingsChange"
          />
          <span class="text-xs text-gray-500">{{ settings.lineHeight }}</span>
        </div>

        <!-- 主题 -->
        <div>
          <label class="block text-sm font-medium mb-2">阅读主题</label>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="theme in themes"
              :key="theme.value"
              class="p-3 rounded border-2 cursor-pointer transition-colors text-center"
              :class="{
                'border-blue-600': settings.theme === theme.value,
                'border-gray-200': settings.theme !== theme.value,
              }"
              :style="{ backgroundColor: theme.bg, color: theme.color }"
              @click="handleThemeChange(theme.value)"
            >
              {{ theme.label }}
            </div>
          </div>
        </div>

        <!-- 翻页模式 -->
        <div>
          <label class="block text-sm font-medium mb-2">翻页模式</label>
          <el-radio-group v-model="settings.pageMode" @change="handleSettingsChange">
            <el-radio value="scroll">滚动翻页</el-radio>
            <el-radio value="page">分页翻页</el-radio>
          </el-radio-group>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  List,
  Setting,
  Loading,
  Select,
} from '@element-plus/icons-vue'
import { useReaderStore } from '@/stores/reader'
import { getChapterList } from '@/api/reader'
import type { Chapter } from '@/types/reader'

const route = useRoute()
const router = useRouter()
const readerStore = useReaderStore()

const showToolbar = ref(true)
const showChapterList = ref(false)
const showSettings = ref(false)
const chapters = ref<Chapter[]>([])

const currentChapter = computed(() => readerStore.currentChapter)
const chapterContent = computed(() => readerStore.chapterContent)
const isLoading = computed(() => readerStore.isLoading)
const hasNextChapter = computed(() => readerStore.hasNextChapter)
const hasPrevChapter = computed(() => readerStore.hasPrevChapter)
const readingProgress = computed(() => readerStore.readingProgress)
const settings = computed(() => readerStore.settings || getDefaultSettings())

// 主题配置
const themes = [
  { label: '默认', value: 'light', bg: '#ffffff', color: '#000000' },
  { label: '护眼', value: 'sepia', bg: '#f5f1e8', color: '#5c4a35' },
  { label: '夜间', value: 'dark', bg: '#1f1f1f', color: '#cccccc' },
]

// 内容样式
const contentStyle = computed(() => ({
  fontSize: `${settings.value.fontSize}px`,
  lineHeight: settings.value.lineHeight,
  backgroundColor: getThemeColor().bg,
  color: getThemeColor().color,
  padding: '2rem',
  borderRadius: '0.5rem',
}))

// 格式化内容（将换行转为段落）
const formattedContent = computed(() => {
  if (!chapterContent.value?.content) return ''
  return chapterContent.value.content
    .split('\n')
    .filter((p) => p.trim())
    .map((p) => `<p>${p}</p>`)
    .join('')
})

// 加载章节
onMounted(async () => {
  const chapterId = route.params.chapterId as string
  if (!chapterId) {
    ElMessage.error('章节ID无效')
    router.push('/bookstore')
    return
  }

  try {
    // 加载章节内容
    await readerStore.loadChapter(chapterId)

    // 加载阅读设置
    await readerStore.loadSettings().catch(() => {})

    // 加载章节列表
    if (currentChapter.value) {
      loadChapterList(currentChapter.value.bookId)
    }

    // 开始记录阅读进度
    startProgressTracking()
  } catch (error: any) {
    console.error('加载章节失败:', error)
    ElMessage.error(error.message || '加载失败')
  }
})

// 清理
onUnmounted(() => {
  stopProgressTracking()
  readerStore.saveReadingProgress()
})

// 加载章节列表
async function loadChapterList(bookId: string) {
  try {
    const response = await getChapterList({ bookId, pageSize: 1000 })
    chapters.value = response.list
  } catch (error) {
    console.error('加载章节列表失败:', error)
  }
}

// 切换工具栏显示
function toggleToolbar() {
  showToolbar.value = !showToolbar.value
}

// 返回
function handleBack() {
  if (currentChapter.value) {
    router.push(`/book/${currentChapter.value.bookId}`)
  } else {
    router.push('/bookstore')
  }
}

// 上一章
async function handlePrevChapter() {
  try {
    await readerStore.prevChapter()
  } catch (error: any) {
    ElMessage.error(error.message || '没有上一章了')
  }
}

// 下一章
async function handleNextChapter() {
  try {
    await readerStore.nextChapter()
  } catch (error: any) {
    ElMessage.error(error.message || '没有下一章了')
  }
}

// 切换章节
async function handleChapterChange(chapterId: string) {
  showChapterList.value = false
  try {
    await readerStore.loadChapter(chapterId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error: any) {
    ElMessage.error(error.message || '加载章节失败')
  }
}

// 主题变更
async function handleThemeChange(theme: string) {
  await readerStore.updateSettings({ theme })
}

// 设置变更
async function handleSettingsChange() {
  await readerStore.updateSettings(settings.value)
}

// 获取主题颜色
function getThemeColor() {
  const theme = themes.find((t) => t.value === settings.value.theme)
  return theme || themes[0]
}

// 获取默认设置
function getDefaultSettings() {
  return {
    userId: '',
    fontSize: 16,
    fontFamily: 'system-ui',
    lineHeight: 1.8,
    letterSpacing: 0,
    theme: 'light',
    pageMode: 'scroll',
    autoSave: true,
    enableAnimation: true,
    showProgress: true,
    updatedAt: new Date().toISOString(),
  }
}

// 进度跟踪
let progressInterval: any = null

function startProgressTracking() {
  // 每30秒自动保存一次进度
  progressInterval = setInterval(() => {
    updateProgress()
    readerStore.saveReadingProgress()
  }, 30000)

  // 监听滚动更新进度
  window.addEventListener('scroll', updateProgress)
}

function stopProgressTracking() {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  window.removeEventListener('scroll', updateProgress)
}

function updateProgress() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  const progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
  readerStore.updateProgress(progress)
}
</script>

<style scoped>
.reader-text :deep(p) {
  margin-bottom: 1.5em;
  text-indent: 2em;
  text-align: justify;
}

.reader-text :deep(p:first-child) {
  margin-top: 0;
}

.reader-text :deep(p:last-child) {
  margin-bottom: 0;
}
</style>




