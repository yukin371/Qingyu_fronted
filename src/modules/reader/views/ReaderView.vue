<template>
  <div class="reader-view" :class="themeClass">
    <el-container v-loading="loading">
      <!-- 顶部导航栏 -->
      <el-header class="reader-header" :class="{ 'is-hidden': isFullscreen }">
        <div class="header-left">
          <el-button text @click="goBack" :icon="ArrowLeft">返回</el-button>
          <span class="book-title">{{ bookTitle }}</span>
        </div>
        <div class="header-right">
          <el-button text @click="toggleAIAssistant" :icon="MagicStick" class="ai-button">AI助手</el-button>
          <el-button text @click="toggleCatalog" :icon="List">目录</el-button>
          <el-button text @click="toggleSettings" :icon="Setting">设置</el-button>
        </div>
      </el-header>

      <!-- 阅读内容区 -->
      <el-main class="reader-main" ref="readerContainerRef" @click="toggleHeaderFooter">
        <div class="reader-container" :style="containerStyle">
          <!-- 章节标题 -->
          <h1 v-if="currentChapter" class="chapter-title">
            {{ currentChapter.title }}
          </h1>

          <!-- 章节内容 -->
          <div v-if="currentChapter" class="chapter-content" data-testid="chapter-content" v-html="formattedContent"></div>

          <!-- 空状态 -->
          <el-empty v-else description="加载中..." />
        </div>

        <!-- 评论区 -->
        <div v-if="currentChapter" class="comments-section-wrapper" data-testid="comments-section">
          <el-divider />
          <div class="comments-container">
            <h3>本章评论</h3>
            <!-- 简化的评论区，用于E2E测试定位 -->
            <el-empty v-if="!comments || comments.length === 0" description="暂无评论" />
            <div v-else class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <div class="comment-user">{{ comment.userName || '匿名' }}</div>
                <div class="comment-content">{{ comment.content }}</div>
                <div class="comment-time" data-testid="comment-time">{{ comment.createdAt || '刚刚' }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-main>

      <!-- 底部导航栏 -->
      <el-footer class="reader-footer" :class="{ 'is-hidden': isFullscreen }">
        <div class="footer-progress">
          <span class="progress-text">{{ progressText }}</span>
          <el-slider v-model="readProgress" :show-tooltip="false" @change="handleProgressChange" />
        </div>
        <div class="footer-nav">
          <el-button @click="previousChapter" :disabled="!hasPreviousChapter" :icon="ArrowLeftBold">
            上一章
          </el-button>
          <el-button @click="nextChapter" :disabled="!hasNextChapter" :icon="ArrowRightBold">
            下一章
          </el-button>
        </div>
      </el-footer>
    </el-container>

    <!-- 目录抽屉 -->
    <el-drawer v-model="catalogVisible" title="目录" direction="rtl" size="400px">
      <el-scrollbar>
        <div v-for="chapter in chapterList" :key="chapter.id" class="catalog-item"
          :class="{ 'is-active': chapter.id === chapterId, 'is-read': chapter.isRead }"
          @click="jumpToChapter(chapter.id)">
          <span class="chapter-num">{{ chapter.chapterNum }}</span>
          <span class="chapter-name">{{ chapter.title }}</span>
          <el-icon v-if="!chapter.isFree" class="lock-icon">
            <QyIcon name="Lock"  />
          </el-icon>
        </div>
      </el-scrollbar>
    </el-drawer>

    <!-- AI助手 -->
    <AIReadingAssistant
      :visible="aiAssistantVisible"
      @update:visible="aiAssistantVisible = $event"
      :chapter-content="currentChapter?.content"
      :book-title="bookTitle"
      :chapter-title="currentChapter?.title"
      @close="aiAssistantVisible = false"
    />

    <!-- 设置抽屉 -->
    <el-drawer v-model="settingsVisible" title="阅读设置" direction="rtl" size="400px">
      <div class="settings-panel">
        <!-- 字体大小 -->
        <div class="setting-item">
          <label>字体大小</label>
          <div class="setting-control">
            <el-button @click="decreaseFontSize" :icon="Minus" circle />
            <span class="font-size-value">{{ settings.fontSize }}px</span>
            <el-button @click="increaseFontSize" :icon="Plus" circle />
          </div>
        </div>

        <!-- 行距 -->
        <div class="setting-item">
          <label>行距</label>
          <el-slider v-model="settings.lineHeight" :min="1.5" :max="2.5" :step="0.1" :show-tooltip="true" />
        </div>

        <!-- 页面宽度 -->
        <div class="setting-item">
          <label>页面宽度</label>
          <el-slider v-model="settings.pageWidth" :min="600" :max="1000" :step="50" :show-tooltip="true" />
        </div>

        <!-- 主题选择 -->
        <div class="setting-item">
          <label>阅读主题</label>
          <div class="theme-selector">
            <div v-for="theme in themes" :key="theme.value" class="theme-option"
              :class="{ 'is-active': settings.theme === theme.value }"
              :style="{ backgroundColor: theme.bg, color: theme.color }" @click="changeTheme(theme.value)">
              {{ theme.label }}
            </div>
          </div>
        </div>

        <!-- 字体选择 -->
        <div class="setting-item">
          <label>字体</label>
          <el-select v-model="settings.fontFamily" placeholder="选择字体">
            <el-option label="系统默认" value="system-ui, -apple-system, sans-serif" />
            <el-option label="宋体" value="SimSun, serif" />
            <el-option label="黑体" value="SimHei, sans-serif" />
            <el-option label="楷体" value="KaiTi, serif" />
          </el-select>
        </div>

        <!-- 翻页模式 -->
        <div class="setting-item">
          <label>翻页模式</label>
          <el-radio-group v-model="settings.pageMode">
            <el-radio label="scroll">滚动</el-radio>
            <el-radio label="page">翻页</el-radio>
          </el-radio-group>
        </div>

        <!-- 自动保存 -->
        <div class="setting-item">
          <label>自动保存进度</label>
          <el-switch v-model="settings.autoSave" />
        </div>

        <!-- 重置按钮 -->
        <div class="setting-item">
          <el-button @click="resetSettings" style="width: 100%">
            重置设置
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReaderStore } from '@/stores/reader'
import { useTouch } from '@/composables/useTouch'
import { useResponsive } from '@/composables/useResponsive'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import AIReadingAssistant from '../components/AIReadingAssistant.vue'
import { sanitizeHtml } from '@/utils/sanitize'

const route = useRoute()
const router = useRouter()
const readerStore = useReaderStore()
const { isMobile } = useResponsive()

const chapterId = ref(route.params.chapterId as string)
const loading = ref(false)
const catalogVisible = ref(false)
const settingsVisible = ref(false)
const aiAssistantVisible = ref(false)
const isFullscreen = ref(false)
const readProgress = ref(0)
const readingTimer = ref<number | null>(null)
const startTime = ref(Date.now())
const readerContainerRef = ref()

// 评论区数据
const comments = ref<any[]>([])

// 主题配置
const themes = [
  { label: '默认', value: 'light', bg: '#ffffff', color: '#303133' },
  { label: '护眼', value: 'sepia', bg: '#f4ecd8', color: '#5c4a2f' },
  { label: '夜间', value: 'night', bg: '#1e1e1e', color: '#c9c9c9' },
  { label: '暗黑', value: 'dark', bg: '#000000', color: '#888888' }
]

// 计算属性
const currentChapter = computed(() => readerStore.currentChapter)
const chapterList = computed(() => readerStore.chapterList)
const settings = computed(() => readerStore.settings)

const bookTitle = computed(() => {
  return currentChapter.value?.title || '正在加载...'
})

const hasPreviousChapter = computed(() => {
  return !!currentChapter.value?.prevChapterId
})

const hasNextChapter = computed(() => {
  return !!currentChapter.value?.nextChapterId
})

const progressText = computed(() => {
  if (!currentChapter.value) return '0%'
  return `${readProgress.value}%`
})

const themeClass = computed(() => {
  return `theme-${settings.value.theme}`
})

const containerStyle = computed(() => {
  return {
    fontSize: `${settings.value.fontSize}px`,
    lineHeight: settings.value.lineHeight,
    maxWidth: `${settings.value.pageWidth}px`,
    fontFamily: settings.value.fontFamily
  }
})

const formattedContent = computed(() => {
  if (!currentChapter.value?.content) return ''
  // 将内容按段落分割并格式化
  const formatted = currentChapter.value.content
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${p}</p>`)
    .join('')
  // 使用DOMPurify清理HTML，防止XSS攻击
  return sanitizeHtml(formatted)
})

// 方法
const goBack = () => {
  router.back()
}

const toggleCatalog = () => {
  catalogVisible.value = !catalogVisible.value
}

const toggleSettings = () => {
  settingsVisible.value = !settingsVisible.value
}

const toggleAIAssistant = () => {
  aiAssistantVisible.value = !aiAssistantVisible.value
}

const toggleHeaderFooter = () => {
  isFullscreen.value = !isFullscreen.value
}

const previousChapter = async () => {
  if (!hasPreviousChapter.value) return
  await saveCurrentProgress()
  await readerStore.loadPreviousChapter()
  scrollToTop()
}

const nextChapter = async () => {
  if (!hasNextChapter.value) return
  await saveCurrentProgress()
  await readerStore.loadNextChapter()
  scrollToTop()
}

const jumpToChapter = async (id: string) => {
  if (id === chapterId.value) return

  await saveCurrentProgress()
  chapterId.value = id
  await loadChapter()
  catalogVisible.value = false
  scrollToTop()
}

const increaseFontSize = () => {
  if (settings.value.fontSize < 24) {
    readerStore.updateSettings({ fontSize: settings.value.fontSize + 1 })
  }
}

const decreaseFontSize = () => {
  if (settings.value.fontSize > 14) {
    readerStore.updateSettings({ fontSize: settings.value.fontSize - 1 })
  }
}

const changeTheme = (theme: string) => {
  readerStore.updateSettings({ theme: theme as any })
}

const resetSettings = () => {
  readerStore.resetSettings()
  message.success('设置已重置')
}

const handleProgressChange = (value: number) => {
  // 根据进度条跳转到对应位置
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo(0, (scrollHeight * value) / 100)
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 加载章节
const loadChapter = async () => {
  loading.value = true
  try {
    await readerStore.loadChapter(chapterId.value)

    // 重置阅读进度
    readProgress.value = 0
    startTime.value = Date.now()

    // 如果还没有加载章节列表，加载它
    if (chapterList.value.length === 0 && currentChapter.value) {
      await readerStore.loadChapterList(currentChapter.value.bookId)
    }
  } catch (error) {
    console.error('加载章节失败:', error)
    message.error('加载章节失败')
  } finally {
    loading.value = false
  }
}

// 保存阅读进度
const saveCurrentProgress = async () => {
  if (!currentChapter.value || !settings.value.autoSave) return

  try {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    )

    await readerStore.saveProgress(
      currentChapter.value.bookId,
      chapterId.value,
      scrollPercent,
      window.scrollY
    )

    // 保存阅读时长
    const duration = Math.floor((Date.now() - startTime.value) / 1000)
    if (duration > 0) {
      await readerStore.updateReadingTime(currentChapter.value.bookId, duration)
    }
  } catch (error) {
    console.error('保存进度失败:', error)
  }
}

// 监听滚动更新进度
const handleScroll = () => {
  const scrollTop = window.scrollY
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight

  if (scrollHeight > 0) {
    readProgress.value = Math.round((scrollTop / scrollHeight) * 100)
  }
}

// 键盘快捷键
const handleKeyPress = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowLeft':
      previousChapter()
      break
    case 'ArrowRight':
      nextChapter()
      break
    case 'ArrowUp':
      window.scrollBy({ top: -100, behavior: 'smooth' })
      break
    case 'ArrowDown':
      window.scrollBy({ top: 100, behavior: 'smooth' })
      break
    case 'Escape':
      isFullscreen.value = false
      break
  }
}

// 生命周期
onMounted(async () => {
  await loadChapter()
  await readerStore.loadSettings()

  // 监听滚动
  window.addEventListener('scroll', handleScroll)

  // 监听键盘
  window.addEventListener('keydown', handleKeyPress)

  // 定时保存进度（每30秒）
  if (settings.value.autoSave) {
    readingTimer.value = setInterval(saveCurrentProgress, 30000) as any
  }

  // 集成触摸手势
  if (isMobile.value && readerContainerRef.value) {
    useTouch(readerContainerRef, {
      onSwipeLeft: () => {
        if (hasNextChapter.value) {
          nextChapter()
        }
      },
      onSwipeRight: () => {
        if (hasPreviousChapter.value) {
          previousChapter()
        }
      },
      onTap: () => {
        // 点击屏幕中间切换全屏
        toggleHeaderFooter()
      },
      threshold: 100
    })
  }
})

onUnmounted(() => {
  // 保存进度
  saveCurrentProgress()

  // 清理监听器
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeyPress)

  // 清理定时器
  if (readingTimer.value) {
    clearInterval(readingTimer.value)
  }

  // 清除当前章节
  readerStore.clearCurrentChapter()
})

// 监听章节ID变化
watch(() => route.params.chapterId, (newId) => {
  if (newId && newId !== chapterId.value) {
    chapterId.value = newId as string
    loadChapter()
  }
})
</script>

<style scoped lang="scss">
.reader-view {
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;

  &.theme-light {
    background-color: #ffffff;
    color: #303133;
  }

  &.theme-sepia {
    background-color: #f4ecd8;
    color: #5c4a2f;
  }

  &.theme-night {
    background-color: #1e1e1e;
    color: #c9c9c9;
  }

  &.theme-dark {
    background-color: #000000;
    color: #888888;
  }
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;

  &.is-hidden {
    transform: translateY(-100%);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .book-title {
      font-size: 16px;
      font-weight: 500;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;

    .ai-button {
      color: #667eea;
      font-weight: 500;

      &:hover {
        color: #764ba2;
        background: rgba(102, 126, 234, 0.1);
      }
    }
  }
}

.reader-main {
  padding: 40px 20px;
  overflow-y: auto;
}

.reader-container {
  margin: 0 auto;
  padding: 0 20px;

  .chapter-title {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 40px;
  }

  .chapter-content {
    :deep(p) {
      margin-bottom: 1em;
      text-indent: 2em;
      text-align: justify;
    }
  }
}

.comments-section-wrapper {
  margin-top: 60px;
  padding: 0 20px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  .comments-container {
    h3 {
      font-size: 20px;
      margin-bottom: 20px;
      color: #303133;
    }

    .comments-list {
      .comment-item {
        padding: 16px;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .comment-user {
          font-weight: bold;
          color: #606266;
          margin-bottom: 8px;
        }

        .comment-content {
          color: #303133;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .comment-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

.reader-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;

  &.is-hidden {
    transform: translateY(100%);
  }

  .footer-progress {
    margin-bottom: 16px;

    .progress-text {
      display: block;
      text-align: center;
      margin-bottom: 8px;
      font-size: 14px;
      color: #909399;
    }
  }

  .footer-nav {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}

// 目录样式
.catalog-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.is-active {
    background-color: #ecf5ff;
    color: #409eff;
  }

  &.is-read {
    color: #909399;
  }

  .chapter-num {
    width: 60px;
    flex-shrink: 0;
    font-size: 14px;
    color: #909399;
  }

  .chapter-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lock-icon {
    margin-left: 8px;
    color: #f56c6c;
  }
}

// 设置面板样式
.settings-panel {
  padding: 0 20px;

  .setting-item {
    margin-bottom: 32px;

    label {
      display: block;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
    }

    .setting-control {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;

      .font-size-value {
        min-width: 50px;
        text-align: center;
        font-weight: bold;
      }
    }
  }

  .theme-selector {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .theme-option {
      padding: 16px;
      text-align: center;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.is-active {
        border-color: #409eff;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .reader-header {
    .book-title {
      max-width: 150px;
    }
  }

  .reader-container {
    .chapter-title {
      font-size: 22px;
    }
  }

  .footer-nav {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
