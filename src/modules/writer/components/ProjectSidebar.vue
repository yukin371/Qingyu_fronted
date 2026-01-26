<template>
  <div class="sidebar-container" :class="{ 'collapsed': isCollapsed }">
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

      <el-tooltip content="新建章节">
        <el-button size="small" :icon="Plus" @click="$emit('add-chapter')" />
      </el-tooltip>
    </div>

    <!-- 3. 章节列表区域 -->
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
      <QyIcon name="component" :is="isCollapsed ? 'Expand' : 'Fold'"  />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { QyIcon } from '@/design-system/components'
import { messageBox } from '@/design-system/services'
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
    } catch { }
  }
}

// 工具函数
const formatCount = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  return n
}

const fromNow = (date: string) => dayjs(date).fromNow()

const highlightText = (text: string, keyword: string) => {
  if (!keyword) return text
  const reg = new RegExp(`(${keyword})`, 'gi')
  return text.replace(reg, '<span class="text-highlight">$1</span>')
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
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color); // 适配暗黑
  border-right: 1px solid var(--el-border-color-lighter);
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  position: relative;

  &.collapsed {
    width: 0; // 完全折叠，靠外部按钮或边缘触发打开
    border-right: none;
    overflow: hidden;

    .collapse-trigger {
      right: -24px;
      opacity: 0.8;
      background: var(--el-border-color);

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
  border-bottom: 1px solid var(--el-border-color-lighter);

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
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .project-stats {
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin-top: 10px;
    padding: 6px 0;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      cursor: help;

      &.highlight {
        color: var(--el-color-primary);
      }
    }
  }
}

// 2. 工具栏
.sidebar-toolbar {
  padding: 8px 12px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .search-input {
    flex: 1;
  }
}

// 3. 列表区域
.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-lighter);
    border-radius: 2px;
  }

  .chapter-item {
    position: relative;
    padding: 10px 12px 10px 16px;
    cursor: pointer;
    transition: all 0.2s;
    border-left: 3px solid transparent;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    &:hover {
      background-color: var(--el-fill-color-light);

      .item-actions {
        opacity: 1;
      }
    }

    &.is-active {
      background-color: var(--el-color-primary-light-9);
      border-left-color: var(--el-color-primary);

      .item-title {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }

    // 状态指示点
    .status-indicator {
      position: absolute;
      left: 6px;
      top: 16px;
      width: 6px;
      height: 6px;
      border-radius: 50%;

      &.published {
        background-color: var(--el-color-success);
      }

      &.draft {
        background-color: var(--el-text-color-placeholder);
      }
    }

    .item-content {
      flex: 1;
      overflow: hidden;
    }

    .item-title {
      font-size: 14px;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .chapter-index {
        margin-right: 4px;
        font-family: var(--el-font-family-monospace);
      }
    }

    .item-meta {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
      display: flex;
      align-items: center;

      .dot {
        margin: 0 4px;
      }
    }

    // 操作菜单
    .item-actions {
      opacity: 0; // 默认隐藏，hover显示
      transition: opacity 0.2s;
      margin-left: 8px;

      .action-btn {
        padding: 4px;
        border-radius: 4px;
        color: var(--el-text-color-secondary);

        &:hover {
          background-color: var(--el-fill-color-darker);
          color: var(--el-color-primary);
        }
      }
    }
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
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-right: none;
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: var(--el-text-color-secondary);
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;

  &:hover {
    width: 20px;
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

// 搜索高亮样式 (通过 v-html 插入)
:deep(.text-highlight) {
  color: var(--el-color-primary);
  font-weight: bold;
  background-color: var(--el-color-warning-light-9);
}

.danger-item {
  color: var(--el-color-danger);
}
</style>
