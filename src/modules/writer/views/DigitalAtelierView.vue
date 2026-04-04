<template>
  <DigitalAtelierEditor
    :content="editorStore.content"
    :chapter-title="currentChapterTitle"
    :chapter-label="chapterLabel"
    :word-count="wordCount"
    :show-left-panel="!isImmersiveMode"
    :show-right-panel="!isImmersiveMode"
    @update:content="handleContentUpdate"
    @save="handleSave"
    @ai-assist="handleAIAssist"
    @mode-change="handleModeChange"
    @tool-change="handleToolChange"
  >
    <template #editor>
      <!-- 使用现有的 MarkdownEditor 组件 -->
      <div class="da-embedded-editor">
        <MarkdownEditor
          ref="markdownEditorRef"
          v-model="editorStore.content"
          :title="currentChapterTitle"
          :placeholder="editorPlaceholder"
          @save="handleEditorSave"
          @word-count-change="handleWordCountChange"
        />
      </div>
    </template>
  </DigitalAtelierEditor>
</template>

<script setup lang="ts">
/**
 * DigitalAtelierView.vue - Digital Atelier 主题编辑器视图
 *
 * 将深空科幻主题的 DigitalAtelierEditor 与现有的编辑器功能整合
 */
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

// 组件
import DigitalAtelierEditor from '../components/digital-atelier/DigitalAtelierEditor.vue'
import MarkdownEditor from '../components/editor/MarkdownEditor.vue'

// Stores
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { useEditorStore } from '@/modules/writer/stores/editorStore'
import { useChapterStore, type ChapterNode } from '@/modules/writer/stores/chapterStore'

// ==================== 路由和 Store ====================
const route = useRoute()
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const editorStore = useEditorStore()
const chapterStore = useChapterStore()

// ==================== 状态 ====================
const markdownEditorRef = ref<InstanceType<typeof MarkdownEditor> | null>(null)
const isImmersiveMode = ref(false)
const currentWordCount = ref(0)

// ==================== Mock 数据 ====================
const chapterContents: Record<string, string> = {
  '1': `飞船的观测窗外，卡拉比-丘流形在虚空中缓慢展开，像是一朵由光线编织的永不凋谢的玫瑰。艾琳站在那片静谧前，指尖轻轻触碰着冰冷的纳米玻璃。她能感觉到，那些遥远星系的跳动，正透过金属外壳与她的脉搏共鸣。

"这就是你想要的永恒吗？"索伦的声音从后方传来，带着岁月沉淀后的沙哑。他走进光环中，身影被星云染成了一抹深沉的紫罗兰色。

艾琳没有回头，她知道他在注视着什么。那一刻，整座星桥都陷入了死寂。这种寂静不仅仅是空间的缺乏，而是一种实质性的、几乎可以被触摸到的沉重。

她在控制台上输入了一串古老的代码。那是来自地球时代的遗响，在数字化的洪流中，它听起来像是一个关于家园的谎言。`,
}

const mockChapters: ChapterNode[] = [
  {
    id: '1',
    parentId: null,
    projectId: 'demo',
    title: '星尘的余温',
    order: 1,
    wordCount: 3421,
    status: 'writing',
  },
]

// ==================== 计算属性 ====================
const currentProjectId = computed(() => {
  return (
    (route.params.projectId as string) ||
    (route.query.projectId as string) ||
    projectStore.currentProjectId ||
    ''
  )
})

const currentChapterId = computed(() => {
  return (
    (route.params.chapterId as string) ||
    (route.query.chapterId as string) ||
    documentStore.currentDocMeta?.id ||
    ''
  )
})

const chapters = computed(() => chapterStore.chapters)

const selectedChapterId = computed(() => chapterStore.currentChapterId)

const currentChapterTitle = computed(() => {
  if (!selectedChapterId.value) return '星尘的余温'
  const chapter = chapterStore.currentChapter
  return chapter?.title || '星尘的余温'
})

const chapterLabel = computed(() => {
  if (!selectedChapterId.value) return '第二章'
  const index = chapters.value.findIndex(c => c.id === selectedChapterId.value)
  return index >= 0 ? `第${index + 1}章` : '第二章'
})

const editorPlaceholder = computed(() => {
  if (!selectedChapterId.value) return '请先选择一个章节...'
  return '开始创作...'
})

const wordCount = computed(() => currentWordCount.value)

// ==================== 方法 ====================
function handleContentUpdate(content: string) {
  editorStore.setContent(content)
}

function handleSave() {
  markdownEditorRef.value?.setSaveStatus('saving')

  // 模拟保存
  setTimeout(() => {
    markdownEditorRef.value?.setSaveStatus('saved')
    ElMessage.success('保存成功')
  }, 500)
}

function handleEditorSave(_content: string) {
  if (selectedChapterId.value) {
    chapterStore.updateChapter(selectedChapterId.value, {
      wordCount: currentWordCount.value,
    })
  }
}

function handleWordCountChange(count: number) {
  currentWordCount.value = count
}

function handleAIAssist() {
  ElMessage.info('AI 助手功能开发中')
}

function handleModeChange(mode: string) {
  isImmersiveMode.value = mode === 'immersive'
}

function handleToolChange(_tool: string) {
}

// ==================== Provide ====================
provide('currentProjectId', currentProjectId)
provide('currentChapterId', currentChapterId)

// ==================== 生命周期 ====================
onMounted(async () => {

  // 初始化 mock 数据
  chapterStore.setChapters(mockChapters)

  if (mockChapters.length > 0) {
    const firstChapter = mockChapters[0]
    chapterStore.setCurrentChapter(firstChapter.id)
    editorStore.setCurrentChapter(firstChapter.id)

    // 加载内容
    const content = chapterContents[firstChapter.id] || ''
    editorStore.setContent(content, false)

    // 计算字数
    currentWordCount.value = content.length
  }
})

// 监听路由变化
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
      editorStore.setCurrentChapter(chapterId)
      chapterStore.setCurrentChapter(chapterId)
    }
  }
)
</script>

<style scoped lang="scss">
.da-embedded-editor {
  width: 100%;
  height: 100%;
  min-height: 400px;

  // 覆盖 MarkdownEditor 样式以适应深色主题
  :deep(.markdown-editor) {
    background: transparent;
    height: 100%;

    .editor-header {
      display: none; // 隐藏默认头部，使用 DigitalAtelier 的头部
    }

    .editor-body {
      height: 100%;

      .md-editor-v3 {
        background: transparent;
        height: 100%;

        .md-editor-toolbar-wrapper {
          background: rgba(20, 36, 73, 0.6);
          border-bottom: 1px solid rgba(56, 71, 109, 0.3);
          backdrop-filter: blur(12px);
        }

        .md-editor-content {
          height: calc(100% - 40px);

          .md-editor-input {
            background: transparent;
            color: #dee5ff;
            font-family: 'Newsreader', 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
            font-size: 18px;
            line-height: 1.9;
            padding: 0;
            caret-color: #7de9ff;

            &::placeholder {
              color: rgba(155, 170, 214, 0.5);
            }
          }
        }
      }
    }
  }
}
</style>
