<template>
  <div class="sidebar-container chapter-list" data-testid="chapter-list">
    <!-- 1. 顶部区域：单行标题 + 最近项目快速切换 -->
    <div class="sidebar-header">
      <div class="project-bar">
        <div class="project-title" :title="currentProjectTitle">
          {{ currentProjectTitle || '未命名项目' }}
        </div>
        <el-dropdown trigger="click" @command="handleProjectSwitch">
          <button type="button" class="recent-switch-btn" :disabled="recentProjects.length <= 1">
            最近项目
            <QyIcon name="ArrowDown" :size="12" class="recent-switch-caret" />
          </button>
          <template #dropdown>
            <el-dropdown-menu class="project-switch-menu">
              <el-dropdown-item
                v-for="p in recentProjects"
                :key="p.id"
                :command="p.id"
                :disabled="p.id === internalProjectId"
              >
                {{ p.title }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 2. 工具栏：搜索 -->
    <div class="sidebar-toolbar">
      <el-input v-model="searchKeyword" placeholder="搜索章节..." size="small" clearable class="search-input">
          <template #prefix><QyIcon name="Search" :size="14" /></template>
      </el-input>
    </div>

    <!-- 3. VSCode风格目录树 -->
    <div class="explorer-header" @click="isTreeExpanded = !isTreeExpanded">
      <div class="explorer-title">
        <QyIcon
          name="ArrowRight"
          :size="14"
          class="tree-chevron"
          :class="{ expanded: isTreeExpanded }"
        />
        <span>目录</span>
        <span class="section-count">{{ displayChapters.length }}</span>
      </div>
      <div class="explorer-actions" @click.stop>
        <button class="explorer-action-btn" title="新增目录" @click="$emit('add-volume')">+目录</button>
        <button
          class="explorer-action-btn explorer-action-btn--primary"
          title="新增章节"
          data-testid="add-document-button"
          @click="$emit('add-chapter')"
        >
          +章节
        </button>
      </div>
    </div>

    <div v-show="isTreeExpanded" class="sidebar-list">
      <div v-for="chapter in displayChapters" :key="chapter.id" class="chapter-item" :class="{
        'is-active': chapter.id === modelChapterId,
        'is-draft': chapter.status === 'draft',
        'is-directory': chapter.nodeType === 'directory'
      }" @click="handleSelectChapter(chapter)">
        <QyIcon :name="chapter.nodeType === 'directory' ? 'FolderOpened' : 'DocumentCopy'" :size="14" class="item-file-icon" />

        <div class="item-content">
          <div class="item-title">
            <span class="chapter-index" v-if="chapter.nodeType !== 'directory' && chapter.chapterNum">
              {{ chapter.chapterNum }}.
            </span>
            <!-- 搜索高亮处理 -->
            <span v-html="highlightText(getDisplayTitle(chapter), searchKeyword)"></span>
          </div>

          <div class="item-meta" v-if="chapter.nodeType !== 'directory'">
            <span>{{ formatCount(chapter.wordCount) }}字</span>
            <span class="dot">·</span>
            <span>{{ fromNow(chapter.updatedAt) }}</span>
          </div>
          <div class="item-meta item-meta--directory" v-else>
            <span>目录分组</span>
          </div>
        </div>

        <!-- 操作菜单 -->
        <div class="item-actions" @click.stop>
          <el-dropdown trigger="click" @command="(cmd: 'edit' | 'delete') => handleAction(cmd, chapter)">
            <div class=" action-btn">
              <QyIcon name="MoreFilled" :size="14" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">
                  <QyIcon name="Edit" :size="14" /> 重命名/设置
                </el-dropdown-item>
                <el-dropdown-item command="delete" class="danger-item">
                  <QyIcon name="Delete" :size="14" /> 删除章节
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="displayChapters.length === 0" :image-size="60" description="暂无章节" class="list-empty" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QyIcon } from '@/design-system/components'
import { messageBox } from '@/design-system/services'
import { sanitizeText } from '@/utils/sanitize'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 定义类型 (建议从 types/project.ts 引入)
interface ProjectSummary {
  id: string
  title: string
  status: string
  wordCount: number
  chapterCount: number
  updatedAt: string
}

interface ChapterSummary {
  id: string
  projectId: string
  chapterNum: number
  title: string
  wordCount: number
  updatedAt: string
  status: 'draft' | 'published'
  nodeType?: 'directory' | 'chapter'
  sortOrder?: number
}

interface Props {
  projects: ProjectSummary[]
  chapters: ChapterSummary[]
  projectId?: string  // v-model:projectId
  chapterId?: string  // v-model:chapterId
}

const props = withDefaults(defineProps<Props>(), {
  projects: () => [],
  chapters: () => []
})

const emit = defineEmits<{
  'update:projectId': [id: string]
  'update:chapterId': [id: string]
  'add-chapter': []
  'add-volume': []
  'edit-chapter': [chapter: ChapterSummary]
  'delete-chapter': [id: string]
}>()

// 状态
const searchKeyword = ref('')
const isTreeExpanded = ref(true)

// 双向绑定代理
const internalProjectId = computed({
  get: () => props.projectId || '',
  set: (val) => emit('update:projectId', val)
})

const modelChapterId = computed({
  get: () => props.chapterId || '',
  set: (val) => emit('update:chapterId', val)
})

const currentProjectTitle = computed(() =>
  props.projects.find(p => p.id === internalProjectId.value)?.title || ''
)

const recentProjects = computed(() => {
  return [...props.projects].sort((a, b) => {
    const ta = new Date(a.updatedAt).getTime() || 0
    const tb = new Date(b.updatedAt).getTime() || 0
    return tb - ta
  })
})

const handleProjectSwitch = (projectId: string | number) => {
  internalProjectId.value = String(projectId)
}

// 章节列表逻辑
const displayChapters = computed(() => {
  // 1. 筛选项目
  let list = props.chapters.filter(c => c.projectId === internalProjectId.value)

  // 2. 搜索过滤
  if (searchKeyword.value.trim()) {
    const k = searchKeyword.value.toLowerCase()
    list = list.filter(c =>
      c.title.toLowerCase().includes(k) ||
      c.chapterNum.toString().includes(k)
    )
  }

  // 3. 排序：优先 sortOrder，再回退 chapterNum
  return list.sort((a, b) => (a.sortOrder || a.chapterNum) - (b.sortOrder || b.chapterNum))
})

// 操作处理
const handleSelectChapter = (chapter: ChapterSummary) => {
  modelChapterId.value = chapter.id
}

const handleAction = async (cmd: 'edit' | 'delete', chapter: ChapterSummary) => {
  if (cmd === 'edit') {
    emit('edit-chapter', chapter)
  } else if (cmd === 'delete') {
    try {
      await messageBox.confirm(
        `确定删除章节 "第${chapter.chapterNum}章 ${chapter.title}" 吗？`,
        '危险操作',
        { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
      )
      emit('delete-chapter', chapter.id)
    } catch {
      // 用户取消删除操作，无需处理
    }
  }
}

// 工具函数
const formatCount = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  return n
}

const fromNow = (date: string) => dayjs(date).fromNow()

const stripDirectoryPrefix = (title: string) =>
  title.replace(/^目录[一二三四五六七八九十百千万0-9]+\s*/u, '').trim()

const getDisplayTitle = (chapter: ChapterSummary) =>
  chapter.nodeType === 'directory' ? stripDirectoryPrefix(chapter.title) : chapter.title

const highlightText = (text: string, keyword: string) => {
  if (!keyword) return sanitizeText(text)
  // 先转义HTML特殊字符，防止XSS攻击
  const escapedText = sanitizeText(text)
  const escapedKeyword = sanitizeText(keyword)
  const reg = new RegExp(`(${escapedKeyword})`, 'gi')
  return escapedText.replace(reg, '<span class="text-highlight">$1</span>')
}

// 自动选择第一个项目
watch(() => props.projects, (newVal) => {
  if (newVal.length > 0 && !internalProjectId.value) {
    internalProjectId.value = newVal[0].id
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.sidebar-container {
  width: 260px;
  height: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  position: relative;
}

// 1. 头部
.sidebar-header {
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;

  .project-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .project-title {
    flex: 1;
    min-width: 0;
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .recent-switch-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 10px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    color: #334155;
    font-size: 12px;
    cursor: pointer;

    &:hover:not(:disabled) {
      border-color: #93c5fd;
      background: #eff6ff;
      color: #1d4ed8;
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  .recent-switch-caret {
    opacity: 0.85;
  }
}

// 下拉弹层采用不透明背景，避免与页面内容视觉重叠
:global(.project-switcher-popper) {
  background: #ffffff !important;
  border: 1px solid #dbe3ef !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.14) !important;
  backdrop-filter: none !important;
  opacity: 1 !important;
}

:global(.project-switcher-popper .el-scrollbar__view),
:global(.project-switcher-popper .el-select-dropdown__list) {
  background: #ffffff !important;
}

:global(.project-switcher-popper .el-select-dropdown__item) {
  min-height: 32px;
  height: auto;
  line-height: 1.4;
  padding-top: 7px;
  padding-bottom: 7px;
  white-space: normal;
  word-break: break-all;
}

:global(.project-switcher-popper .el-select-dropdown__item.is-selected) {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
  font-weight: 600;
}

:global(.project-switch-menu) {
  background: #ffffff !important;
  border: 1px solid #dbe3ef !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.14) !important;
}

// 2. 工具栏
.sidebar-toolbar {
  padding: 10px 12px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;

  .search-input {
    flex: 1;
  }
}

// 3. 目录树
.explorer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-top: 1px solid #eef2f7;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.explorer-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.tree-chevron {
  transition: transform 0.18s ease;

  &.expanded {
    transform: rotate(90deg);
  }
}

.explorer-actions {
  display: inline-flex;
  gap: 6px;
}

.explorer-action-btn {
  height: 24px;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  color: #334155;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    border-color: #94a3b8;
    background: #f1f5f9;
  }
}

.explorer-action-btn--primary {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;

  &:hover {
    border-color: #60a5fa;
    background: #dbeafe;
  }
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 10px;
  background: #f8fafc;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }

  .chapter-item {
    position: relative;
    padding: 10px 10px 10px 12px;
    margin-bottom: 6px;
    cursor: pointer;
    transition: all 0.16s ease;
    border: 1px solid #e2e8f0;
    border-left: 2px solid #cbd5e1;
    border-radius: 10px;
    background: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    box-shadow: none;

    &:hover {
      border-color: #93c5fd;
      border-left-color: #60a5fa;
      background: #f8fbff;

      .item-actions {
        opacity: 1;
      }
    }

    &.is-active {
      background: #eff6ff;
      border-color: #93c5fd;
      border-left-color: #2563eb;
      box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.08);

      .item-title {
        color: #1d4ed8;
        font-weight: 600;
      }
    }

    .item-file-icon {
      margin-right: 8px;
      margin-top: 2px;
      color: #64748b;
      flex-shrink: 0;
    }

    .item-content {
      flex: 1;
      overflow: hidden;
    }

    .item-title {
      font-size: 13px;
      color: #0f172a;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .chapter-index {
        margin-right: 4px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: #64748b;
      }
    }

    .item-meta {
      font-size: 11px;
      color: #64748b;
      display: flex;
      align-items: center;

      .dot {
        margin: 0 4px;
      }

      &.item-meta--directory {
        color: #b45309;
      }
    }

    .item-actions {
      opacity: 0.45;
      transition: opacity 0.2s;
      margin-left: 8px;

      .action-btn {
        padding: 4px;
        border-radius: 8px;
        color: #64748b;

        &:hover {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
      }
    }

    &:hover .item-actions,
    &.is-active .item-actions {
      opacity: 1;
    }

    &.is-directory {
      border-left-color: #f59e0b;
      background: #fffaf0;

      .item-title {
        color: #92400e;
        font-weight: 700;
      }

      .item-file-icon {
        color: #d97706;
      }
    }
  }
}

.section-count {
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

// 搜索高亮样式 (通过 v-html 插入)
:deep(.text-highlight) {
  color: #1d4ed8;
  font-weight: bold;
  background-color: #fef3c7;
}

.danger-item {
  color: #dc2626;
}
</style>
