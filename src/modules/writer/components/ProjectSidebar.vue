<template>
  <div class="sidebar-container chapter-list" data-testid="chapter-list" :class="{ 'collapsed': isCollapsed }">
    <!-- 1. 顶部区域：项目选择与统计 -->
    <div class="sidebar-header" v-if="!isCollapsed">
      <div class="project-selector">
        <el-select v-model="internalProjectId" placeholder="选择书籍" size="default" filterable class="full-width">
          <template #prefix><QyIcon name="Reading"  /></template>
          <el-option v-for="p in projects" :key="p.id" :label="p.title" :value="p.id">
            <span class="option-label">{{ p.title }}</span>
            <span class="option-meta">{{ formatCount(p.wordCount) }}</span>
          </el-option>
        </el-select>
      </div>

      <!-- 项目极简统计 -->
      <div class="project-stats" v-if="currentProject">
        <div class="stat-item" title="总字数">
          <QyIcon name="EditPen"  />
          <span>{{ formatCount(currentProject.wordCount) }}</span>
        </div>
        <el-divider direction="vertical" />
        <div class="stat-item" title="章节数">
          <QyIcon name="DocumentCopy"  />
          <span>{{ currentProject.chapterCount }} 章</span>
        </div>
        <el-divider direction="vertical" />
        <div class="stat-item highlight" title="最近更新">
          <span>{{ fromNow(currentProject.updatedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 2. 工具栏：搜索与新建 -->
    <div class="sidebar-toolbar" v-if="!isCollapsed">
      <el-input v-model="searchKeyword" placeholder="搜索章节..." size="small" clearable class="search-input">
        <template #prefix><QyIcon name="Search"  /></template>
      </el-input>
    </div>

    <div class="quick-create-row" v-if="!isCollapsed">
      <button
        class="quick-create-btn"
        data-testid="add-document-button"
        @click="$emit('add-chapter')"
      >
        + 章节
      </button>
      <button
        class="quick-create-btn quick-create-btn--secondary"
        @click="$emit('add-volume')"
      >
        + 目录
      </button>
    </div>

    <!-- 3. 章节列表区域 -->
    <div class="sidebar-section-header" v-if="!isCollapsed">
      <span>章节列表</span>
      <span class="section-count">{{ displayChapters.length }}</span>
    </div>

    <div class="sidebar-list" v-if="!isCollapsed">
      <div v-for="chapter in displayChapters" :key="chapter.id" class="chapter-item" :class="{
        'is-active': chapter.id === modelChapterId,
        'is-draft': chapter.status === 'draft'
      }" @click="handleSelectChapter(chapter)">
        <!-- 状态指示点 -->
        <div class="status-indicator" :class="chapter.status"></div>

        <div class="item-content">
          <div class="item-title">
            <span class="chapter-index" v-if="chapter.chapterNum">
              {{ chapter.chapterNum }}.
            </span>
            <!-- 搜索高亮处理 -->
            <span v-html="highlightText(chapter.title, searchKeyword)"></span>
          </div>

          <div class="item-meta">
            <span>{{ formatCount(chapter.wordCount) }}字</span>
            <span class="dot">·</span>
            <span>{{ fromNow(chapter.updatedAt) }}</span>
          </div>
        </div>

        <!-- 悬浮操作菜单 -->
        <div class="item-actions" @click.stop>
          <el-dropdown trigger="click" @command="(cmd: 'edit' | 'delete') => handleAction(cmd, chapter)">
            <div class=" action-btn">
              <QyIcon name="MoreFilled"  />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">
                  <QyIcon name="Edit"  /> 重命名/设置
                </el-dropdown-item>
                <el-dropdown-item command="delete" class="danger-item">
                  <QyIcon name="Delete"  /> 删除章节
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="displayChapters.length === 0" :image-size="60" description="暂无章节" class="list-empty" />
    </div>

    <!-- 4. 折叠/展开 触发条 -->
    <div class="collapse-trigger" @click="isCollapsed = !isCollapsed">
      <QyIcon :name="isCollapsed ? 'Expand' : 'Fold'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
const isCollapsed = ref(false)
const searchKeyword = ref('')

// 双向绑定代理
const internalProjectId = computed({
  get: () => props.projectId || '',
  set: (val) => emit('update:projectId', val)
})

const modelChapterId = computed({
  get: () => props.chapterId || '',
  set: (val) => emit('update:chapterId', val)
})

// 当前项目
const currentProject = computed(() =>
  props.projects.find(p => p.id === internalProjectId.value)
)

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

  // 3. 排序 (按章节号)
  return list.sort((a, b) => a.chapterNum - b.chapterNum)
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

  &.collapsed {
    width: 0;
    border-right: none;
    overflow: hidden;

    .collapse-trigger {
      right: -24px;
      opacity: 0.8;
      background: #cbd5e1;

      &:hover {
        right: -32px;
        width: 32px;
      }
    }
  }
}

// 1. 头部
.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;

  .full-width {
    width: 100%;
  }

  .option-label {
    float: left;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .option-meta {
    float: right;
    color: #64748b;
    font-size: 12px;
  }

  .project-stats {
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin-top: 10px;
    padding: 8px 0;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #64748b;
      cursor: help;

      &.highlight {
        color: #2563eb;
      }
    }
  }
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

.quick-create-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px 12px 10px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.quick-create-btn {
  height: 30px;
  border: 1px solid #93c5fd;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover {
    background: #dbeafe;
    border-color: #60a5fa;
  }
}

.quick-create-btn--secondary {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #334155;

  &:hover {
    border-color: #94a3b8;
    background: #f1f5f9;
  }
}

// 3. 列表区域
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
    padding: 10px 10px 10px 16px;
    margin-bottom: 6px;
    cursor: pointer;
    transition: all 0.16s ease;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #cbd5e1;
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

    // 状态指示点
    .status-indicator {
      position: absolute;
      left: 6px;
      top: 16px;
      width: 5px;
      height: 5px;
      border-radius: 50%;

      &.published {
        background-color: #22c55e;
      }

      &.draft {
        background-color: #94a3b8;
      }
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
    }

    // 操作菜单
    .item-actions {
      opacity: 0;
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
  }
}

.sidebar-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  font-weight: 700;

  .section-count {
    min-width: 24px;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

// 4. 折叠触发器 (仿 VS Code 风格)
.collapse-trigger {
  position: absolute;
  top: 50%;
  right: 0;
  width: 16px;
  height: 40px;
  transform: translateY(-50%);
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-right: none;
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: #64748b;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;

  &:hover {
    width: 20px;
    background-color: #eff6ff;
    color: #2563eb;
  }
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
