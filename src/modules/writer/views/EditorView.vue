<template>
  <div class="editor-page" data-testid="editor-page">
    <EditorLayout
      v-model:activeTool="activeTool"
      @toolChange="handleToolChange"
    >
      <!-- 左侧面板：章节树 -->
      <template #left-panel>
        <ChapterTree
          :chapters="chapters"
          :selected-id="selectedChapterId"
          :loading="chapterStore.loading"
          @select="handleChapterSelect"
          @create="handleChapterCreate"
          @rename="handleChapterRename"
          @delete="handleChapterDelete"
        />
      </template>

      <!-- 中央编辑器：Markdown编辑器 -->
      <template #editor>
        <MarkdownEditor
          ref="markdownEditorRef"
          v-model="editorStore.content"
          :title="currentChapterTitle"
          :placeholder="editorPlaceholder"
          @save="handleEditorSave"
          @word-count-change="handleWordCountChange"
        />
      </template>

      <!-- 右侧面板：AI助手 -->
      <template #right-panel>
        <AIPanel
          :session-id="aiSessionId"
          :collapsed="isAIPanelCollapsed"
          @update:collapsed="handleAIPanelToggle"
        />
      </template>
    </EditorLayout>
  </div>
</template>

<script setup lang="ts">
/**
 * EditorView.vue - 编辑器主视图
 *
 * 整合 EditorLayout 布局组件，实现三栏布局框架：
 * - 左侧：章节树
 * - 中央：Markdown编辑器（占位）
 * - 右侧：AI助手面板
 *
 * @see docs/plans/2026-02-15-editor-refactor-design-v1.md
 */
import { ref, computed, onMounted, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

// 布局组件
import EditorLayout from '../components/editor/EditorLayout.vue'
import AIPanel from '../components/editor/AIPanel.vue'
import ChapterTree from '../components/editor/ChapterTree.vue'
import MarkdownEditor from '../components/editor/MarkdownEditor.vue'

// Stores
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { useEditorStore } from '@/modules/writer/stores/editorStore'
import { useChapterStore, type ChapterNode } from '@/modules/writer/stores/chapterStore'

// =======================
// 类型定义
// =======================
// 使用 editorStore 中定义的 ActiveTool 类型
type ActiveTool = import('@/modules/writer/stores/editorStore').ActiveTool

// =======================
// 路由和Store
// =======================
const route = useRoute()
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const editorStore = useEditorStore()
const chapterStore = useChapterStore()

// =======================
// 状态
// =======================

// 当前激活的工具
const activeTool = ref<ActiveTool>('writing')

// AI面板折叠状态
const isAIPanelCollapsed = ref(false)

// MarkdownEditor 组件引用（保留供将来使用，如需要调用编辑器方法）
const markdownEditorRef = ref<InstanceType<typeof MarkdownEditor> | null>(null)
void markdownEditorRef // 避免未使用变量的警告

// 当前章节字数
const currentWordCount = ref(0)

// =======================
// Mock 章节内容数据
// =======================

/** Mock 章节内容数据 */
const chapterContents: Record<string, string> = {
  '1': '# 第一章 开端\n\n这是一个关于命运的故事。\n\n故事从那个雨夜开始，当时的他并不知道，自己的人生即将发生翻天覆地的变化。\n\n窗外的雨声淅淅沥沥，他独自坐在昏暗的房间里，手中握着那封来自远方的信。\n\n"你被选中了。"\n\n简短的四个字，却彻底改变了他的命运。',
  '2': '# 第二章 相遇\n\n第二天的清晨，阳光透过云层洒向大地。\n\n他按照信中的指引，来到了那座古老的图书馆。推开沉重的木门，一股陈旧的书香扑面而来。\n\n"你来了。"\n\n一个温和的声音从身后响起。他转过身，看到了她——那个将改变他一生的人。',
  '3': '## 2.1 初次见面\n\n她站在窗边，阳光勾勒出她的轮廓。\n\n"欢迎来到守望者协会，"她微笑着说，"我是你的引导者，名为艾琳。"\n\n他愣了愣，一时不知该如何回应。',
  '4': '# 第三章 转折\n\n（暂无内容）'
}

// =======================
// Mock 数据
// =======================

/** Mock 章节数据 */
const mockChapters: ChapterNode[] = [
  {
    id: '1',
    parentId: null,
    projectId: 'demo',
    title: '第一章 开端',
    order: 1,
    wordCount: 3500,
    status: 'completed'
  },
  {
    id: '2',
    parentId: null,
    projectId: 'demo',
    title: '第二章 相遇',
    order: 2,
    wordCount: 2800,
    status: 'writing'
  },
  {
    id: '3',
    parentId: '2',
    projectId: 'demo',
    title: '2.1 初次见面',
    order: 1,
    wordCount: 1500,
    status: 'draft'
  },
  {
    id: '4',
    parentId: null,
    projectId: 'demo',
    title: '第三章 转折',
    order: 3,
    wordCount: 0,
    status: 'draft'
  }
]

// =======================
// 路由参数
// =======================

const currentProjectId = computed(() => {
  return route.params.projectId as string || route.query.projectId as string || projectStore.currentProjectId || ''
})

const currentChapterId = computed(() => {
  return route.params.chapterId as string || route.query.chapterId as string || documentStore.currentDocMeta?.id || ''
})

// AI会话ID
const aiSessionId = computed(() => {
  return `editor-${currentProjectId.value}-${currentChapterId.value}`
})

// =======================
// 计算属性
// =======================

// 章节列表（从 store 获取）
const chapters = computed(() => chapterStore.chapters)

// 当前选中的章节 ID
const selectedChapterId = computed(() => chapterStore.currentChapterId)

// 当前章节标题
const currentChapterTitle = computed(() => {
  if (!selectedChapterId.value) return ''
  const chapter = chapterStore.currentChapter
  return chapter?.title || ''
})

// 编辑器占位文本
const editorPlaceholder = computed(() => {
  if (!selectedChapterId.value) return '请先选择一个章节...'
  return '开始创作...'
})

// =======================
// 方法
// =======================

/**
 * 处理工具切换
 */
function handleToolChange(toolId: string) {
  console.log('[EditorView] Tool changed:', toolId)

  // 根据工具类型调整布局
  switch (toolId) {
    case 'chapters':
    case 'book':
      // 左侧章节树展开
      break
    case 'writing':
      // 默认写作模式
      isAIPanelCollapsed.value = false
      break
    case 'immersive':
      // 沉浸模式，隐藏两侧面板
      isAIPanelCollapsed.value = true
      break
    case 'ai-assistant':
    case 'chat':
      // AI助手模式，右侧展开
      isAIPanelCollapsed.value = false
      break
  }
}

/**
 * 处理AI面板折叠切换
 */
function handleAIPanelToggle(collapsed: boolean) {
  isAIPanelCollapsed.value = collapsed
}

// =======================
// 章节事件处理
// =======================

/**
 * 处理章节选择
 */
function handleChapterSelect(node: ChapterNode) {
  console.log('[EditorView] Chapter selected:', node)

  // 保存当前章节内容
  saveCurrentChapterContent()

  // 更新 editorStore 和 chapterStore 的当前章节 ID
  editorStore.setCurrentChapter(node.id)
  chapterStore.setCurrentChapter(node.id)

  // 加载新章节内容
  loadChapterContent(node.id)
}

/**
 * 处理章节创建
 */
function handleChapterCreate(parentId: string | null) {
  console.log('[EditorView] Create chapter, parentId:', parentId)
  ElMessage.info('新建章节功能开发中')
}

/**
 * 处理章节重命名
 */
function handleChapterRename(node: ChapterNode) {
  console.log('[EditorView] Rename chapter:', node)
  ElMessage.info('重命名功能开发中')
}

/**
 * 处理章节删除
 */
function handleChapterDelete(node: ChapterNode) {
  console.log('[EditorView] Delete chapter:', node)
  ElMessage.info('删除功能开发中')
}

// =======================
// 编辑器事件处理
// =======================

/**
 * 处理编辑器保存事件
 */
function handleEditorSave(content: string) {
  console.log('[EditorView] Editor save triggered, content length:', content.length)

  // 更新当前章节的字数
  if (selectedChapterId.value) {
    chapterStore.updateChapter(selectedChapterId.value, {
      wordCount: currentWordCount.value
    })
  }

  // 标记保存完成（MarkdownEditor 内部已处理）
}

/**
 * 处理字数变化事件
 */
function handleWordCountChange(count: number) {
  currentWordCount.value = count
}

// =======================
// 章节内容管理
// =======================

/**
 * 保存当前章节内容
 */
function saveCurrentChapterContent() {
  const currentId = selectedChapterId.value
  if (!currentId) return

  // 将当前编辑器内容保存到 mock 数据
  chapterContents[currentId] = editorStore.content

  // 更新章节字数
  chapterStore.updateChapter(currentId, {
    wordCount: currentWordCount.value
  })
}

/**
 * 加载章节内容
 */
function loadChapterContent(chapterId: string) {
  const content = chapterContents[chapterId] || ''
  editorStore.setContent(content, false) // 加载内容不标记为脏
  console.log('[EditorView] Loaded chapter content:', chapterId, 'length:', content.length)
}

// =======================
// Provide（供子组件使用）
// =======================

// 提供当前激活工具状态
provide('activeTool', activeTool)

// 提供项目ID和章节ID
provide('currentProjectId', currentProjectId)
provide('currentChapterId', currentChapterId)

// =======================
// 生命周期
// =======================

onMounted(async () => {
  console.log('[EditorView] Mounted', {
    projectId: currentProjectId.value,
    chapterId: currentChapterId.value
  })

  // 初始化 mock 数据到 chapterStore
  chapterStore.setChapters(mockChapters)

  // 默认选中第一个章节
  if (mockChapters.length > 0) {
    const firstChapter = mockChapters[0]
    chapterStore.setCurrentChapter(firstChapter.id)
    editorStore.setCurrentChapter(firstChapter.id)

    // 加载第一个章节的内容
    loadChapterContent(firstChapter.id)

    console.log('[EditorView] Default chapter selected:', firstChapter.id)
  }

  // 如果有项目ID，加载项目数据
  if (currentProjectId.value) {
    try {
      await projectStore.loadDetail(currentProjectId.value)
      await documentStore.loadTree(currentProjectId.value)

      // 如果有章节ID，设置当前章节（内容由 loadChapterContent 处理）
      if (currentChapterId.value) {
        editorStore.setCurrentChapter(currentChapterId.value)
        chapterStore.setCurrentChapter(currentChapterId.value)
        loadChapterContent(currentChapterId.value)
      }
    } catch (error) {
      console.error('[EditorView] Failed to load data:', error)
    }
  }
})

// 监听路由参数变化
watch(
  () => route.params,
  async (newParams) => {
    const projectId = newParams.projectId as string
    const chapterId = newParams.chapterId as string

    if (projectId && projectId !== currentProjectId.value) {
      await projectStore.loadDetail(projectId)
      await documentStore.loadTree(projectId)
    }

    if (chapterId && chapterId !== currentChapterId.value) {
      // 保存当前章节内容
      saveCurrentChapterContent()

      // 更新章节状态
      editorStore.setCurrentChapter(chapterId)
      chapterStore.setCurrentChapter(chapterId)

      // 加载新章节内容
      loadChapterContent(chapterId)
    }
  }
)

// 监听章节切换，保存内容
watch(
  () => chapterStore.currentChapterId,
  (newId, oldId) => {
    if (oldId && newId !== oldId) {
      // 切换前保存旧章节内容
      saveCurrentChapterContent()
    }
  }
)
</script>

<style scoped lang="scss">
.editor-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
