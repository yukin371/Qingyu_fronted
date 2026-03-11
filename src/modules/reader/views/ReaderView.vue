<template>
  <div class="reader-page">
    <!-- 页面过渡动画 -->
    <transition name="reader-fade" mode="out-in">
      <div v-show="true" class="reader-view" :class="themeClass" key="reader" data-testid="reader-view">
        <el-container v-loading="loading" data-testid="reader-container">
        <!-- 顶部导航栏 -->
        <el-header class="reader-header" :class="{ 'is-hidden': isFullscreen }" data-testid="reader-header">
          <div class="reader-nav-bar">
            <QyButton class="nav-btn" variant="secondary" :disabled="!hasPreviousChapter" @click="previousChapter">上一章</QyButton>
            <div class="nav-center">
              <QyButton class="nav-btn" variant="secondary" @click="goBackToBookDetail">返回目录</QyButton>
              <QyButton class="nav-btn" variant="secondary" @click="goHome">返回首页</QyButton>
              <QyButton class="nav-btn" variant="secondary" @click="toggleSettings" data-testid="reader-settings-btn">阅读设置</QyButton>
            </div>
            <QyButton class="nav-btn" variant="secondary" :disabled="!hasNextChapter" @click="nextChapter">下一章</QyButton>
          </div>
        </el-header>

        <!-- 阅读内容区 -->
        <main class="reader-main" ref="readerContainerRef" @click="toggleHeaderFooter" @scroll="handleContentScroll" data-testid="reader-main">
          <QyCard class="reader-container" variant="glass" shadow="always" padding="lg" :style="containerStyle" data-testid="reader-content">
            <!-- 章节标题 -->
            <h1 v-if="currentChapter" class="chapter-title" data-testid="chapter-title">
              {{ currentChapter.title }}
            </h1>

            <!-- 章节内容 -->
            <div v-if="currentChapter" class="chapter-content" data-testid="chapter-content">
              <article
                v-for="(paragraph, index) in displayParagraphs"
                :key="paragraph.id || index"
                class="paragraph-wrapper"
                :class="{ 'is-highlighted': highlightedParagraphIndex === index }"
                :data-testid="`paragraph-${index}`"
                @click.stop="handleParagraphClick(index)"
              >
                <p class="paragraph-text">{{ paragraph.content }}</p>
                <CommentBadge
                  v-if="getParagraphCommentCount(index) > 0"
                  :comment-count="getParagraphCommentCount(index)"
                  @click="handleCommentBadgeClick(index)"
                />
              </article>
            </div>

            <!-- 空状态 -->
            <QyEmpty v-else description="加载中..." data-testid="reader-loading-state" />

            <!-- 章节结束推荐区 -->
            <div v-if="showChapterEndRecommendation" class="chapter-end-recommendation" data-testid="chapter-end-recommendation">
              <QyDivider>本章完</QyDivider>

              <div class="recommendation-card">
                <h3>📚 阅读完成！</h3>
                <p class="read-time">本次阅读时长: {{ formatReadingTime }}</p>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                  <QyButton variant="primary" size="lg" class="action-btn" @click="addToBookshelf" data-testid="collect-book-btn">
                    {{ isInBookshelf ? '已收藏本书' : '收藏本书' }}
                  </QyButton>
                </div>

                <!-- 自动加入书架提示 -->
                <div v-if="!isInBookshelf" class="add-to-bookshelf-tip">
                  <QyAlert
                    title="已自动添加到书架"
                    type="success"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <p>本书已添加到您的书架，方便继续阅读</p>
                    </template>
                  </QyAlert>
                </div>

                <!-- 相关推荐 -->
                <div v-if="recommendedBooks.length > 0" class="recommended-books">
                  <h4>你可能还喜欢</h4>
                  <div class="book-list">
                    <div
                      v-for="book in recommendedBooks"
                      :key="book.id"
                      class="book-item"
                      @click="goToBook(book.id)"
                    >
                      <el-image :src="book.cover" fit="cover" class="book-cover" />
                      <div class="book-info">
                        <div class="book-title">{{ book.title }}</div>
                        <div class="book-author">{{ book.author }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </QyCard>
        </main>

        <!-- 底部导航栏 -->
        <footer class="reader-footer" :class="{ 'is-hidden': isFullscreen }" data-testid="reader-footer">
          <div class="footer-progress" data-testid="reader-progress-bar">
            <span class="progress-text">{{ progressText }}</span>
            <el-slider v-model="readProgress" :show-tooltip="false" @change="handleProgressChange" />
          </div>
          <div class="footer-nav">
            <QyButton class="footer-nav-btn" variant="secondary" :disabled="!hasPreviousChapter" @click="previousChapter" data-testid="previous-chapter-btn">
              上一章
            </QyButton>
            <QyButton class="footer-nav-btn" variant="secondary" @click="goBackToBookDetail">
              返回目录
            </QyButton>
            <QyButton class="footer-nav-btn" variant="secondary" @click="goHome">
              返回首页
            </QyButton>
            <QyButton class="footer-nav-btn" variant="secondary" :disabled="!hasNextChapter" @click="nextChapter" data-testid="next-chapter-nav-btn">
              下一章
            </QyButton>
          </div>
        </footer>
        </el-container>
      </div>
    </transition>

    <!-- 目录抽屉 -->
    <QyDrawer v-model="catalogVisible" title="目录" direction="rtl" size="400px">
      <QyScrollbar>
        <div v-for="chapter in chapterList" :key="chapter.id" class="catalog-item"
          :class="{ 'is-active': chapter.id === chapterId, 'is-read': chapter.isRead }"
          :data-testid="`catalog-chapter-${chapter.id}`"
          @click="jumpToChapter(chapter.id)">
          <span class="chapter-num">{{ chapter.chapterNum }}</span>
          <span class="chapter-name">{{ chapter.title }}</span>
          <el-icon v-if="!chapter.isFree" class="lock-icon">
            <QyIcon name="Lock"  />
          </el-icon>
        </div>
      </QyScrollbar>
    </QyDrawer>

    <!-- 设置浮层卡片 -->
    <div v-if="settingsVisible" class="settings-overlay" data-testid="settings-overlay" @click.self="settingsVisible = false">
      <section class="settings-modal" data-testid="settings-modal">
        <div class="settings-modal-header">
          <h3>阅读设置</h3>
          <QyButton variant="secondary" size="sm" @click="settingsVisible = false">关闭</QyButton>
        </div>

        <div class="settings-panel">
        <!-- 字体大小 -->
        <div class="setting-item" data-testid="font-size-setting">
          <label>字体大小</label>
          <div class="setting-control">
            <QyButton @click="decreaseFontSize" circle data-testid="decrease-font-btn">-</QyButton>
            <span class="font-size-value">{{ settings.fontSize }}px</span>
            <QyButton @click="increaseFontSize" circle data-testid="increase-font-btn">+</QyButton>
          </div>
        </div>

        <!-- 行距 -->
        <div class="setting-item" data-testid="line-height-setting">
          <div class="setting-title-row">
            <label>行距</label>
            <span class="setting-value">{{ settings.lineHeight.toFixed(1) }}</span>
          </div>
          <div class="setting-slider-wrap">
            <el-slider
              :model-value="settings.lineHeight"
              :min="lineHeightMin"
              :max="lineHeightMax"
              :step="lineHeightStep"
              :show-tooltip="false"
              :marks="lineHeightMarks"
              @update:model-value="setLineHeight"
            />
          </div>
        </div>

        <!-- 页面宽度 -->
        <div class="setting-item" data-testid="page-width-setting">
          <div class="setting-title-row">
            <label>页面宽度</label>
            <span class="setting-value">{{ settings.pageWidth }}px</span>
          </div>
          <div class="setting-slider-wrap">
            <el-slider
              :model-value="settings.pageWidth"
              :min="pageWidthMin"
              :max="pageWidthMax"
              :step="pageWidthStep"
              :show-tooltip="false"
              :marks="pageWidthMarks"
              @update:model-value="setPageWidth"
            />
          </div>
        </div>

        <!-- 主题选择 -->
        <div class="setting-item" data-testid="theme-setting">
          <label>阅读主题</label>
          <div class="theme-selector">
            <div v-for="theme in themes" :key="theme.value" class="theme-option"
              :class="{ 'is-active': settings.theme === theme.value }"
              :style="{ backgroundColor: theme.bg, color: theme.color }" :data-testid="`theme-${theme.value}`" @click="changeTheme(theme.value)">
              {{ theme.label }}
            </div>
          </div>
        </div>

        <!-- 字体选择 -->
        <div class="setting-item" data-testid="font-family-setting">
          <label>字体</label>
          <QySelect v-model="settings.fontFamily" placeholder="选择字体" data-testid="font-family-select">
            <el-option label="系统默认" value="system-ui, -apple-system, sans-serif" />
            <el-option label="宋体" value="SimSun, serif" />
            <el-option label="黑体" value="SimHei, sans-serif" />
            <el-option label="楷体" value="KaiTi, serif" />
          </QySelect>
        </div>

        <!-- 翻页模式 -->
        <div class="setting-item" data-testid="page-mode-setting">
          <label>翻页模式</label>
          <QyRadio v-model="settings.pageMode" value="scroll" data-testid="page-mode-scroll">滚动</QyRadio>
          <QyRadio v-model="settings.pageMode" value="page" data-testid="page-mode-page">翻页</QyRadio>
        </div>

        <!-- 重置按钮 -->
        <div class="setting-item">
          <QyButton @click="resetSettings" style="width: 100%" data-testid="reset-settings-btn">
            重置设置
          </QyButton>
        </div>
        </div>
      </section>
      </div>

    <!-- 段落评论抽屉 -->
    <CommentDrawer
      v-model="commentDrawerVisible"
      :paragraph-index="highlightedParagraphIndex ?? 0"
      :comments="commentStore.currentComments"
      :loading="commentStore.isLoading"
      @like="commentStore.toggleLike"
      @submit="handleCommentSubmit"
    />

    <QyButton
      v-if="showBackTop"
      class="back-to-top-btn"
      variant="secondary"
      @click="scrollToTop"
      data-testid="reader-back-to-top-btn"
    >
      ↑
    </QyButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, unref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReaderStore } from '@/stores/reader'
import { useCommentStore } from '@/stores/comment'
import { useTouch } from '@/composables/useTouch'
import { useResponsive } from '@/composables/useResponsive'
import { message } from '@/design-system/services'
import { QyButton, QyCard, QyEmpty, QyDivider, QyDrawer, QyScrollbar, QySelect, QyRadio, QyAlert, QyIcon } from '@/design-system/components'
import CommentBadge from '../components/comments/CommentBadge.vue'
import CommentDrawer from '../components/comments/CommentDrawer.vue'
import {
  YUNLAN_TOTAL_CHAPTERS,
  createYunlanReaderChapters
} from '@/modules/bookstore/yunlanDemo.mock'
import { getPublishedBookDetail } from '@/modules/workflow/publishedBridge'

interface ReaderSettings {
  fontSize: number
  lineHeight: number
  theme: string
  fontFamily: string
  pageWidth: number
  pageMode: string
  autoSave?: boolean
}

interface ReaderParagraph {
  id: string
  paragraphOrder: number
  content: string
  format?: string
  wordCount?: number
}

interface ParagraphRef {
  paragraphId: string
  chapterId: string
  paragraphIndex: number
}

const route = useRoute()
const router = useRouter()
const readerStore = useReaderStore()
const commentStore = useCommentStore()
const { isMobile } = useResponsive()

const chapterId = ref(route.params.chapterId as string)
const isDemoMode = computed(() => route.query.demo === 'yunlan')
const publishedBookId = computed(() => String(route.query.bookId || (readerStore as any).currentBookId || ''))
const isPublishedMode = computed(() => route.query.source === 'published' && !!publishedBookId.value)
const loading = ref(false)
const catalogVisible = ref(false)
const settingsVisible = ref(false)
const isFullscreen = ref(false)
const readProgress = ref(0)
const readingTimer = ref<number | null>(null)
const startTime = ref(Date.now())
const readerContainerRef = ref()

// 阅读流程优化相关状态
const showChapterEndRecommendation = ref(false)
const isInBookshelf = ref(false)
const readingDuration = ref(0)
const readingDurationTimer = ref<number | null>(null)
const hasAddedToBookshelfThisSession = ref(false)
const recommendedBooks = ref<any[]>([])
const demoChapterList = ref(createYunlanReaderChapters())
const demoCurrentChapter = ref<any | null>(null)
const publishedChapterList = ref<any[]>([])
const publishedCurrentChapter = ref<any | null>(null)

// 段落评论相关状态
const highlightedParagraphIndex = ref<number | null>(null)
const commentDrawerVisible = ref(false)
const splitContentToParagraphs = (content?: string): ReaderParagraph[] => {
  if (!content) return []

  const normalized = content.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  return normalized
    .split(/\n\s*\n/)
    .map((paragraph, index) => ({
      id: `fallback-paragraph-${index + 1}`,
      paragraphOrder: index + 1,
      content: paragraph.trim(),
      format: 'markdown',
      wordCount: paragraph.trim().length
    }))
    .filter((paragraph) => paragraph.content.length > 0)
}

const displayParagraphs = computed<ReaderParagraph[]>(() => {
  const paragraphs = currentChapter.value?.paragraphs
  if (Array.isArray(paragraphs) && paragraphs.length > 0) {
    return paragraphs
      .filter((paragraph): paragraph is ReaderParagraph => !!paragraph?.content)
      .slice()
      .sort((a, b) => (a.paragraphOrder || 0) - (b.paragraphOrder || 0))
  }

  return splitContentToParagraphs(currentChapter.value?.content)
})

const getParagraphRef = (paragraphIndex: number): ParagraphRef | null => {
  if (!currentChapter.value) return null

  const paragraph = displayParagraphs.value[paragraphIndex]
  if (!paragraph) return null

  return {
    paragraphId: paragraph.id || `${currentChapter.value.id}-${paragraphIndex}`,
    chapterId: currentChapter.value.id,
    paragraphIndex
  }
}

// 主题配置（与reader-variables.scss中的CSS变量保持一致）
const themes = [
  { label: '默认', value: 'light', bg: '#ffffff', color: '#2c3e50' },  // --reader-light-text
  { label: '护眼', value: 'sepia', bg: '#f4ecd8', color: '#5c4a2f' },  // --reader-sepia-*
  { label: '夜间', value: 'night', bg: '#1a1a1a', color: '#c9c9c9' }, // --reader-night-*
  { label: '暗黑', value: 'dark', bg: '#121212', color: '#e0e0e0' }   // --reader-dark-*
]
const lineHeightMin = 1.6
const lineHeightMax = 2.2
const lineHeightStep = 0.1
const lineHeightMarks: Record<number, string> = {
  1.6: '紧凑',
  1.8: '标准',
  2.0: '舒适',
  2.2: '宽松'
}
const pageWidthMin = 680
const pageWidthMax = 980
const pageWidthStep = 20
const pageWidthMarks: Record<number, string> = {
  680: '窄',
  780: '标准',
  880: '宽',
  980: '超宽'
}

// 计算属性
const currentChapter = computed(() => {
  if (isDemoMode.value) return demoCurrentChapter.value
  if (isPublishedMode.value) return publishedCurrentChapter.value
  return readerStore.currentChapter
})
const chapterList = computed(() => {
  if (isDemoMode.value) return demoChapterList.value
  if (isPublishedMode.value) return publishedChapterList.value
  return readerStore.chapterList
})
const settings = computed((): ReaderSettings => {
  const s = unref(readerStore.settings) as ReaderSettings | undefined
  return {
    fontSize: s?.fontSize ?? 16,
    lineHeight: s?.lineHeight ?? 1.8,
    theme: s?.theme ?? 'light',
    fontFamily: s?.fontFamily ?? 'system-ui',
    pageWidth: s?.pageWidth ?? 800,
    pageMode: s?.pageMode ?? 'scroll',
    autoSave: s?.autoSave ?? true
  }
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
const showBackTop = computed(() => readProgress.value > 15)

const containerStyle = computed(() => {
  return {
    fontSize: `${settings.value.fontSize}px`,
    lineHeight: settings.value.lineHeight,
    maxWidth: `${settings.value.pageWidth}px`,
    fontFamily: settings.value.fontFamily
  }
})

// 阅读时长格式化
const formatReadingTime = computed(() => {
  const minutes = Math.floor(readingDuration.value / 60)
  const seconds = readingDuration.value % 60
  if (minutes > 0) {
    return `${minutes}分${seconds}秒`
  }
  return `${seconds}秒`
})

// 方法
const toggleHeaderFooter = () => {
  isFullscreen.value = !isFullscreen.value
}

const toggleSettings = () => {
  settingsVisible.value = !settingsVisible.value
}

const previousChapter = async () => {
  if (!hasPreviousChapter.value) return
  await saveCurrentProgress()
  if ((isDemoMode.value || isPublishedMode.value) && currentChapter.value?.prevChapterId) {
    chapterId.value = currentChapter.value.prevChapterId
    await loadChapter()
  } else {
    await readerStore.loadPreviousChapter()
  }
  scrollToTop()
}

const nextChapter = async () => {
  if (!hasNextChapter.value) return
  await saveCurrentProgress()
  if ((isDemoMode.value || isPublishedMode.value) && currentChapter.value?.nextChapterId) {
    chapterId.value = currentChapter.value.nextChapterId
    await loadChapter()
  } else {
    await readerStore.loadNextChapter()
  }
  scrollToTop()
}

// ========== 阅读流程优化方法 ==========

// 处理内容滚动，检测章节结束
const handleContentScroll = () => {
  const scrollTop = window.scrollY
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight

  if (scrollHeight > 0) {
    readProgress.value = Math.round((scrollTop / scrollHeight) * 100)

    // 检测是否滚动到底部（进度>=95%）
    if (readProgress.value >= 95 && !showChapterEndRecommendation.value) {
      showChapterEndRecommendation.value = true
    }
  }
}

// 返回书籍详情
const goBackToBookDetail = () => {
  if (isDemoMode.value) {
    router.push('/bookstore/books-demo')
    return
  }
  if (isPublishedMode.value && publishedBookId.value) {
    router.push(`/bookstore/books/${publishedBookId.value}`)
    return
  }
  if (currentChapter.value?.bookId) {
    router.push(`/bookstore/books/${currentChapter.value.bookId}`)
  } else {
    router.back()
  }
}

const goHome = () => {
  router.push('/bookstore')
}

// 跳转到推荐书籍
const goToBook = (bookId: string) => {
  router.push(`/bookstore/books/${bookId}`)
}

// 自动添加到书架
const addToBookshelf = async () => {
  if (hasAddedToBookshelfThisSession.value || isInBookshelf.value) {
    return
  }

  try {
    // TODO: 调用添加到书架API
    // await readerStore.addToBookshelf(currentChapter.value.bookId)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    hasAddedToBookshelfThisSession.value = true
    isInBookshelf.value = true

    // 显示轻提示
    message.success('已添加到书架')
  } catch {
    console.error('添加到书架失败')
  }
}

// 检查是否在书架中
const checkBookshelfStatus = async () => {
  if (!currentChapter.value?.bookId) return

  try {
    // TODO: 调用检查书架API
    // const inBookshelf = await readerStore.checkInBookshelf(currentChapter.value.bookId)
    // isInBookshelf.value = inBookshelf

    // 模拟：不在书架中
    isInBookshelf.value = false
  } catch {
    console.error('检查书架状态失败')
  }
}

// 加载推荐书籍
const loadRecommendedBooks = async () => {
  try {
    // TODO: 调用推荐API
    // const books = await readerStore.getRecommendedBooks(currentChapter.value.bookId)
    // recommendedBooks.value = books

    // 模拟推荐数据
    recommendedBooks.value = [
      {
        id: 'rec1',
        title: '玄幻巅峰',
        author: '天蚕',
        cover: 'https://picsum.photos/seed/rec1/80/120'
      },
      {
        id: 'rec2',
        title: '都市修仙',
        author: '我吃西红柿',
        cover: 'https://picsum.photos/seed/rec2/80/120'
      },
      {
        id: 'rec3',
        title: '科幻世界',
        author: '刘慈欣',
        cover: 'https://picsum.photos/seed/rec3/80/120'
      }
    ]
  } catch {
    console.error('加载推荐书籍失败')
  }
}

// 启动阅读时长计时器
const startReadingTimer = () => {
  readingDuration.value = 0
  readingDurationTimer.value = setInterval(() => {
    readingDuration.value++
  }, 1000) as any
}

// 停止阅读时长计时器
const stopReadingTimer = () => {
  if (readingDurationTimer.value) {
    clearInterval(readingDurationTimer.value)
    readingDurationTimer.value = null
  }
}

// ========== 段落评论相关方法 ==========

// 获取段落评论数量
const getParagraphCommentCount = (paragraphIndex: number | string): number => {
  const paragraphRef = getParagraphRef(Number(paragraphIndex))
  if (!paragraphRef) return 0
  return commentStore.summaries.get(paragraphRef.paragraphId)?.commentCount || 0
}

// 处理段落点击
const handleParagraphClick = (index: number | string) => {
  const numIndex = Number(index)
  if (highlightedParagraphIndex.value === numIndex) {
    highlightedParagraphIndex.value = null
    commentDrawerVisible.value = false
    commentStore.clearSelection()
    return
  }

  highlightedParagraphIndex.value = numIndex
}

const handleCommentBadgeClick = async (index: number | string) => {
  const numIndex = Number(index)
  highlightedParagraphIndex.value = numIndex
  await openCommentDrawer(numIndex)
}

// 打开评论抽屉
const openCommentDrawer = async (paragraphIndex: number) => {
  const paragraphRef = getParagraphRef(paragraphIndex)
  if (!paragraphRef) return

  commentStore.selectParagraph(paragraphRef.paragraphId)
  await commentStore.loadParagraphComments(paragraphRef)
  commentDrawerVisible.value = true
}

// 处理评论提交
const handleCommentSubmit = async (data: { content: string; emoji?: string; replyToCommentId?: string; replyToUsername?: string }) => {
  if (highlightedParagraphIndex.value === null || !currentChapter.value) return

  const paragraphRef = getParagraphRef(highlightedParagraphIndex.value)
  if (!paragraphRef) return

  await commentStore.addComment({
    paragraphId: paragraphRef.paragraphId,
    chapterId: paragraphRef.chapterId,
    bookId: currentChapter.value.bookId,
    paragraphIndex: paragraphRef.paragraphIndex,
    content: data.content,
    emoji: data.emoji,
    replyToCommentId: data.replyToCommentId,
    replyToUsername: data.replyToUsername
  })
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
const setLineHeight = (value: number) => {
  readerStore.updateSettings({ lineHeight: value })
}
const setPageWidth = (value: number) => {
  readerStore.updateSettings({ pageWidth: value })
}

const resetSettings = () => {
  readerStore.resetSettings()
  readerStore.updateSettings({ autoSave: true })
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

const ensureDemoChapterList = () => {
  if (demoChapterList.value.length > 0) return
  demoChapterList.value = createYunlanReaderChapters(YUNLAN_TOTAL_CHAPTERS)
}

const loadDemoChapter = (id: string) => {
  ensureDemoChapterList()
  const target = demoChapterList.value.find(ch => ch.id === id) || demoChapterList.value[0]
  demoCurrentChapter.value = target || null
}

// 加载章节
const loadChapter = async () => {
  loading.value = true
  try {
    if (isDemoMode.value) {
      loadDemoChapter(chapterId.value)
      readProgress.value = 0
      startTime.value = Date.now()
      return
    }
    if (isPublishedMode.value) {
      const detail = getPublishedBookDetail(publishedBookId.value)
      if (!detail) {
        message.error('未找到已发布内容，请先在发布管理中发布章节')
        return
      }

      const mapped = detail.chapters
        .slice()
        .sort((a, b) => a.chapterNum - b.chapterNum)
        .map((chapter, index, list) => ({
          id: chapter.id,
          chapterNum: chapter.chapterNum,
          title: chapter.title,
          content: chapter.content,
          paragraphs: splitContentToParagraphs(chapter.content),
          bookId: detail.book.id,
          bookTitle: detail.book.title,
          isRead: false,
          isFree: chapter.isFree,
          prevChapterId: index > 0 ? list[index - 1].id : '',
          nextChapterId: index < list.length - 1 ? list[index + 1].id : '',
        }))

      publishedChapterList.value = mapped
      const target = mapped.find((chapter) => chapter.id === chapterId.value) || mapped[0] || null
      if (target) {
        publishedCurrentChapter.value = target
        chapterId.value = target.id
      }
      readProgress.value = 0
      startTime.value = Date.now()
      return
    }

    await readerStore.loadChapter(chapterId.value)

    // 重置阅读进度
    readProgress.value = 0
    startTime.value = Date.now()

    // 如果还没有加载章节列表，加载它
    const chapterListValue = Array.isArray(chapterList.value)
      ? chapterList.value
      : (chapterList.value as any).value || []
    if (chapterListValue.length === 0 && currentChapter.value) {
      await readerStore.loadChapterList(currentChapter.value.bookId)
    }
  } catch (error: any) {
    message.error(error.message || '加载章节失败')
  } finally {
    loading.value = false
  }
}

// 保存阅读进度
const saveCurrentProgress = async () => {
  if (!currentChapter.value) return

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
  } catch {
    // 静默失败，避免影响阅读体验
  }
}

// 键盘快捷键
const handleKeyPress = (e: KeyboardEvent) => {
  if (settingsVisible.value) return

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

  // 检查书架状态
  await checkBookshelfStatus()

  // 加载推荐书籍
  await loadRecommendedBooks()

  // 加载段落评论摘要
  if (currentChapter.value) {
    await commentStore.loadChapterSummaries(
      currentChapter.value.id,
      displayParagraphs.value.map((paragraph, index) => ({
        paragraphId: paragraph.id || `${currentChapter.value!.id}-${index}`,
        chapterId: currentChapter.value!.id,
        paragraphIndex: index
      }))
    )
  }

  // 启动阅读时长计时器
  startReadingTimer()

  // 监听滚动（使用新的处理函数）
  window.addEventListener('scroll', handleContentScroll)

  // 监听键盘
  window.addEventListener('keydown', handleKeyPress)

  // 定时保存进度（每30秒）
  readingTimer.value = setInterval(saveCurrentProgress, 30000) as any

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

  // 停止阅读时长计时器
  stopReadingTimer()

  // 清理监听器
  window.removeEventListener('scroll', handleContentScroll)
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

watch(commentDrawerVisible, (visible) => {
  if (visible) return
  highlightedParagraphIndex.value = null
  commentStore.clearSelection()
})
</script>

<style scoped lang="scss">
.reader-view {
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;

  &.theme-light {
    // ✅ TDD Phase 2: 统一使用CSS变量
    background-color: var(--reader-light-bg, #ffffff);
    color: var(--reader-light-text, #303133);
  }

  &.theme-sepia {
    // ✅ TDD Phase 2: 统一使用CSS变量
    background-color: var(--reader-sepia-bg, #f4ecd8);
    color: var(--reader-sepia-text, #5c4a2f);
  }

  &.theme-night {
    // ✅ TDD Phase 2 P0修复：使用CSS变量而非硬编码，避免纯黑
    background-color: var(--reader-night-bg, #1a1a1a);
    color: var(--reader-night-text, #c9c9c9);
  }

  &.theme-dark {
    // ✅ TDD Phase 2 P0修复：使用CSS变量，Material Design推荐#121212
    background-color: var(--reader-dark-bg, #121212);
    color: var(--reader-dark-text, #e0e0e0);
  }
}

.reader-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  min-height: 68px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: #f8fafc;
  transition: transform 0.3s;

  &.is-hidden {
    transform: translateY(-100%);
  }
}

.reader-nav-bar {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
}

.nav-center {
  display: inline-flex;
  gap: 10px;
  justify-content: center;
}

.reader-nav-bar > .nav-btn:first-child {
  justify-self: start;
}

.reader-nav-bar > .nav-btn:last-child {
  justify-self: end;
}

.reader-main {
  padding: 22px 20px 30px;
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
    .paragraph-wrapper {
      position: relative;
      margin-bottom: 1em;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 4px;
      padding: 4px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }

      &.is-highlighted {
        background-color: rgba(255, 235, 59, 0.3);
      }

      .paragraph-text {
        margin: 0;
        text-indent: 2em;
        text-align: justify;
        line-height: inherit;
        padding-right: 56px;
      }

      :deep(.comment-badge) {
        position: absolute;
        top: 6px;
        right: 6px;
        margin-left: 0;
        z-index: 1;
      }
    }
  }
}

.back-to-top-btn {
  position: fixed;
  right: 18px;
  bottom: 92px;
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  padding: 0;
  font-size: 16px;
  line-height: 34px;
  text-align: center;
  opacity: 0.58;
  backdrop-filter: blur(2px);
  transition: opacity 0.2s ease;
  z-index: 1200;

  &:hover {
    opacity: 0.9;
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
    gap: 12px;
    flex-wrap: wrap;
  }
}

:deep(.qy-slider__track) {
  height: 8px !important;
  max-height: 8px !important;
  overflow: hidden !important;
}

:deep(.qy-slider__fill) {
  height: 8px !important;
  max-height: 8px !important;
  border-radius: 9999px !important;
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
  padding: 0 20px 18px;
  max-height: min(70vh, 640px);
  overflow: auto;

  .setting-item {
    margin-bottom: 32px;

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
    }

    .setting-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      gap: 10px;
    }

    .setting-value {
      font-size: 13px;
      font-weight: 700;
      color: #2563eb;
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

    .setting-slider-wrap {
      padding: 0 4px;
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

.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgb(15 23 42 / 30%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1600;
}

.settings-modal {
  width: min(560px, calc(100vw - 32px));
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgb(15 23 42 / 18%);
}

.settings-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 20px 10px;
  border-bottom: 1px solid #eef2f7;
  margin-bottom: 12px;
}

.settings-modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

// 响应式
@media (max-width: 768px) {
  .reader-container {
    .chapter-title {
      font-size: 22px;
    }
  }

  .reader-nav-bar {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .reader-nav-bar > .nav-btn:first-child,
  .reader-nav-bar > .nav-btn:last-child {
    justify-self: stretch;
  }

  .nav-center {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .reader-footer .footer-nav {
    flex-direction: column;

    .footer-nav-btn {
      width: 100%;
    }
  }
}

// ========== 阅读流程优化样式 ==========

// 页面过渡动画
.reader-fade-enter-active,
.reader-fade-leave-active {
  transition: all 0.3s ease;
}

.reader-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.reader-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// 章节结束推荐区
.chapter-end-recommendation {
  margin-top: 32px;
  padding: 22px 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #1f2937;

  .recommendation-card {
    h3 {
      font-size: 18px;
      margin: 0 0 8px 0;
      text-align: center;
      font-weight: 600;
    }

    .read-time {
      text-align: center;
      font-size: 13px;
      margin-bottom: 14px;
      color: #4b5563;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 14px;

      .action-btn {
        min-width: 140px;
        height: 36px;
        font-size: 14px;
      }
    }

    .add-to-bookshelf-tip {
      margin-bottom: 14px;

      :deep(.qy-alert) {
        background: #eef6ff;
        border: 1px solid #dbeafe;

        .qy-alert__title {
          color: #1f2937;
        }

        .qy-alert__description {
          color: #4b5563;
        }
      }
    }

    .recommended-books {
      h4 {
        font-size: 14px;
        margin: 0 0 10px 0;
        text-align: center;
        color: #6b7280;
      }

      .book-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;

        .book-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background: #f9fafb;
          }

          .book-cover {
            width: 60px;
            height: 80px;
            border-radius: 4px;
            flex-shrink: 0;
          }

          .book-info {
            flex: 1;
            min-width: 0;

            .book-title {
              font-size: 14px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .book-author {
              font-size: 12px;
              color: #6b7280;
            }
          }
        }
      }
    }
  }
}
</style>
