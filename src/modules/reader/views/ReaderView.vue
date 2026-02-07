<template>
  <div class="reader-page">
    <!-- 页面过渡动画 -->
    <transition name="reader-fade" mode="out-in">
      <div class="reader-view" :class="themeClass" key="reader">
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
        <el-main class="reader-main" ref="readerContainerRef" @click="toggleHeaderFooter" @scroll="handleContentScroll">
          <div class="reader-container" :style="containerStyle">
            <!-- 章节标题 -->
            <h1 v-if="currentChapter" class="chapter-title">
              {{ currentChapter.title }}
            </h1>

            <!-- 章节内容 -->
            <div v-if="currentChapter" class="chapter-content">
              <div
                v-for="(paragraph, index) in parsedParagraphs"
                :key="index"
                class="paragraph-wrapper"
                :class="{ 'is-highlighted': highlightedParagraphIndex === index }"
                @click="handleParagraphClick(index)"
              >
                <p class="paragraph-text">{{ paragraph }}</p>
                <CommentBadge
                  v-if="getParagraphCommentCount(index) > 0"
                  :comment-count="getParagraphCommentCount(index)"
                  @click.stop="handleParagraphClick(index)"
                />
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty v-else description="加载中..." />

            <!-- 章节结束推荐区 -->
            <div v-if="showChapterEndRecommendation" class="chapter-end-recommendation">
              <el-divider>本章完</el-divider>

              <div class="recommendation-card">
                <h3>📚 阅读完成！</h3>
                <p class="read-time">本次阅读时长: {{ formatReadingTime }}</p>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                  <el-button
                    v-if="hasNextChapter"
                    type="primary"
                    size="large"
                    @click="nextChapterAndAddToBookshelf"
                  >
                    <el-icon><ArrowRightBold /></el-icon>
                    继续阅读下一章
                  </el-button>

                  <el-button
                    v-else
                    type="success"
                    size="large"
                    @click="goBackToBookDetail"
                  >
                    <el-icon><FolderOpened /></el-icon>
                    返回作品详情
                  </el-button>
                </div>

                <!-- 自动加入书架提示 -->
                <div v-if="!isInBookshelf" class="add-to-bookshelf-tip">
                  <el-alert
                    title="已自动添加到书架"
                    type="success"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <p>本书已添加到您的书架，方便继续阅读</p>
                    </template>
                  </el-alert>
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
      </div>
    </transition>

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

    <!-- 段落评论抽屉 -->
    <CommentDrawer
      v-model="commentDrawerVisible"
      :paragraph-index="highlightedParagraphIndex ?? 0"
      :comments="commentStore.currentComments"
      :loading="commentStore.isLoading"
      @like="commentStore.toggleLike"
      @submit="handleCommentSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReaderStore } from '@/stores/reader'
import { useCommentStore } from '@/stores/comment'
import { useTouch } from '@/composables/useTouch'
import { useResponsive } from '@/composables/useResponsive'
import { sanitizeHtml } from '@/utils/sanitize'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, ArrowLeftBold, ArrowRightBold, List, Setting,
  Minus, Plus, Lock, MagicStick, FolderOpened
} from '@element-plus/icons-vue'
import AIReadingAssistant from '../components/AIReadingAssistant.vue'
import CommentBadge from '../components/comments/CommentBadge.vue'
import CommentDrawer from '../components/comments/CommentDrawer.vue'

const route = useRoute()
const router = useRouter()
const readerStore = useReaderStore()
const commentStore = useCommentStore()
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

// 阅读流程优化相关状态
const showChapterEndRecommendation = ref(false)
const isInBookshelf = ref(false)
const readingDuration = ref(0)
const readingDurationTimer = ref<number | null>(null)
const hasAddedToBookshelfThisSession = ref(false)
const recommendedBooks = ref<any[]>([])

// 段落评论相关状态
const highlightedParagraphIndex = ref<number | null>(null)
const commentDrawerVisible = ref(false)
const parsedParagraphs = computed(() => {
  if (!currentChapter.value?.content) return []
  return currentChapter.value.content
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
})

// 主题配置（与reader-variables.scss中的CSS变量保持一致）
const themes = [
  { label: '默认', value: 'light', bg: '#ffffff', color: '#2c3e50' },  // --reader-light-text
  { label: '护眼', value: 'sepia', bg: '#f4ecd8', color: '#5c4a2f' },  // --reader-sepia-*
  { label: '夜间', value: 'night', bg: '#1a1a1a', color: '#c9c9c9' }, // --reader-night-*
  { label: '暗黑', value: 'dark', bg: '#121212', color: '#e0e0e0' }   // --reader-dark-*
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

// 下一章并自动添加到书架
const nextChapterAndAddToBookshelf = async () => {
  // 自动添加到书架（如果还没添加）
  await addToBookshelf()

  // 进入下一章
  showChapterEndRecommendation.value = false
  await nextChapter()
}

// 返回书籍详情
const goBackToBookDetail = () => {
  if (currentChapter.value?.bookId) {
    router.push(`/bookstore/books/${currentChapter.value.bookId}`)
  } else {
    router.back()
  }
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
    ElMessage.success({
      message: '已添加到书架',
      duration: 2000,
      showClose: false
    })
  } catch (error) {
    console.error('添加到书架失败:', error)
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
  } catch (error) {
    console.error('检查书架状态失败:', error)
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
  } catch (error) {
    console.error('加载推荐书籍失败:', error)
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
const getParagraphCommentCount = (paragraphIndex: number): number => {
  if (!currentChapter.value) return 0
  const paragraphId = `${currentChapter.value.id}-${paragraphIndex}`
  return commentStore.summaries.get(paragraphId)?.commentCount || 0
}

// 处理段落点击
const handleParagraphClick = async (index: number) => {
  highlightedParagraphIndex.value = index
  await openCommentDrawer(index)
}

// 打开评论抽屉
const openCommentDrawer = async (paragraphIndex: number) => {
  if (!currentChapter.value) return

  const paragraphId = `${currentChapter.value.id}-${paragraphIndex}`
  commentStore.selectParagraph(paragraphId)
  await commentStore.loadParagraphComments(paragraphId)
  commentDrawerVisible.value = true
}

// 关闭评论抽屉
const closeCommentDrawer = () => {
  commentDrawerVisible.value = false
  commentStore.clearSelection()
  highlightedParagraphIndex.value = null
}

// 处理评论提交
const handleCommentSubmit = async (data: { content: string; emoji?: string }) => {
  if (highlightedParagraphIndex.value === null || !currentChapter.value) return

  await commentStore.addComment({
    paragraphId: `${currentChapter.value.id}-${highlightedParagraphIndex.value}`,
    chapterId: currentChapter.value.id,
    paragraphIndex: highlightedParagraphIndex.value,
    content: data.content,
    emoji: data.emoji
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
  } catch (error: any) {
    ElMessage.error(error.message || '加载章节失败')
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
    // 静默失败，避免影响阅读体验
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

  // 检查书架状态
  await checkBookshelfStatus()

  // 加载推荐书籍
  await loadRecommendedBooks()

  // 加载段落评论摘要
  if (currentChapter.value) {
    await commentStore.loadChapterSummaries(currentChapter.value.id)
  }

  // 启动阅读时长计时器
  startReadingTimer()

  // 监听滚动（使用新的处理函数）
  window.addEventListener('scroll', handleContentScroll)

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
      }
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
  margin-top: 60px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;

  .recommendation-card {
    h3 {
      font-size: 28px;
      margin: 0 0 16px 0;
      text-align: center;
    }

    .read-time {
      text-align: center;
      font-size: 16px;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 32px;

      .el-button {
        min-width: 200px;
        height: 50px;
        font-size: 18px;
        border-radius: 25px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .add-to-bookshelf-tip {
      margin-bottom: 32px;

      :deep(.el-alert) {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);

        .el-alert__title {
          color: white;
        }

        .el-alert__description {
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }

    .recommended-books {
      h4 {
        font-size: 18px;
        margin: 0 0 16px 0;
        text-align: center;
      }

      .book-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;

        .book-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
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
              color: white;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .book-author {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.7);
            }
          }
        }
      }
    }
  }
}
</style>
