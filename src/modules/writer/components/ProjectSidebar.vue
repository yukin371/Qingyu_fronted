<template>
  <div class="project-sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="toggleCollapse">
      <el-icon>
        <DArrowLeft v-if="!isCollapsed" />
        <DArrowRight v-else />
      </el-icon>
    </div>

    <!-- 侧边栏内容 -->
    <div v-show="!isCollapsed" class="sidebar-content">
      <!-- 项目选择器 -->
      <div class="project-selector">
        <el-select v-model="currentProjectId" placeholder="选择项目" class="project-select" @change="handleProjectChange">
          <el-option v-for="project in projects" :key="project.id" :label="project.title" :value="project.id">
            <div class="project-option">
              <span class="project-title">{{ project.title }}</span>
              <el-tag size="small" :type="getStatusType(project.status)">
                {{ getStatusText(project.status) }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
      </div>

      <!-- 当前项目信息 -->
      <div v-if="currentProject" class="project-info">
        <div class="info-item">
          <span class="label">总字数:</span>
          <span class="value">{{ formatNumber(currentProject.wordCount) }}</span>
        </div>
        <div class="info-item">
          <span class="label">章节数:</span>
          <span class="value">{{ currentProject.chapterCount }}</span>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="chapter-search">
        <el-input v-model="searchKeyword" placeholder="搜索章节..." clearable size="small">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <!-- 操作按钮 -->
      <div class="sidebar-actions">
        <el-button type="primary" size="small" :icon="Plus" @click="handleAddChapter" style="width: 100%">
          新建章节
        </el-button>
      </div>

      <!-- 章节列表 -->
      <div class="chapters-list">
        <div v-for="chapter in filteredChapters" :key="chapter.id" class="chapter-item"
          :class="{ 'active': chapter.id === currentChapterId }" @click="handleChapterClick(chapter)">
          <div class="chapter-main">
            <div class="chapter-header">
              <span class="chapter-number">第{{ chapter.chapterNum }}章</span>
              <el-dropdown trigger="click" @command="(cmd) => handleChapterAction(cmd, chapter)">
                <el-icon class="chapter-menu">
                  <MoreFilled />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">
                      <el-icon>
                        <Edit />
                      </el-icon>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon>
                        <Delete />
                      </el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="chapter-title">{{ chapter.title }}</div>
            <div class="chapter-meta">
              <span class="word-count">{{ formatNumber(chapter.wordCount) }}字</span>
              <span v-if="chapter.updateTime" class="update-time">
                {{ formatDate(chapter.updateTime) }}
              </span>
            </div>
          </div>
          <div v-if="chapter.isDraft" class="chapter-badge">
            <el-tag size="small" type="info">草稿</el-tag>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="filteredChapters.length === 0" description="暂无章节" :image-size="80" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ProjectSidebar'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DArrowLeft,
  DArrowRight,
  Search,
  Plus,
  MoreFilled,
  Edit,
  Delete
} from '@element-plus/icons-vue'

interface Project {
  id: string
  title: string
  status: 'draft' | 'published' | 'completed'
  wordCount: number
  chapterCount: number
}

interface Chapter {
  id: string
  projectId: string
  chapterNum: number
  title: string
  wordCount: number
  updateTime?: string
  isDraft?: boolean
}

interface Props {
  currentChapterId?: string
  projects?: Project[]
  chapters?: Chapter[]
}

interface Emits {
  'chapter-change': [chapter: Chapter]
  'project-change': [projectId: string]
  'add-chapter': []
  'edit-chapter': [chapter: Chapter]
  'delete-chapter': [chapterId: string]
}

const props = withDefaults(defineProps<Props>(), {
  currentChapterId: '',
  projects: () => [],
  chapters: () => []
})

const emit = defineEmits<Emits>()

// 状态
const isCollapsed = ref(false)
const currentProjectId = ref('')
const searchKeyword = ref('')

// 当前项目
const currentProject = computed(() => {
  return props.projects.find(p => p.id === currentProjectId.value)
})

// 过滤后的章节列表
const filteredChapters = computed(() => {
  let chapters = props.chapters.filter(c => c.projectId === currentProjectId.value)

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    chapters = chapters.filter(c =>
      c.title.toLowerCase().includes(keyword) ||
      c.chapterNum.toString().includes(keyword)
    )
  }

  return chapters.sort((a, b) => a.chapterNum - b.chapterNum)
})

// 切换折叠
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 项目切换
const handleProjectChange = (projectId: string) => {
  emit('project-change', projectId)
}

// 章节点击
const handleChapterClick = (chapter: Chapter) => {
  emit('chapter-change', chapter)
}

// 新建章节
const handleAddChapter = () => {
  if (!currentProjectId.value) {
    ElMessage.warning('请先选择项目')
    return
  }
  emit('add-chapter')
}

// 章节操作
const handleChapterAction = async (command: string, chapter: Chapter) => {
  switch (command) {
    case 'edit':
      emit('edit-chapter', chapter)
      break
    case 'delete':
      try {
        await ElMessageBox.confirm(
          `确定要删除章节"${chapter.title}"吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        emit('delete-chapter', chapter.id)
      } catch {
        // 用户取消
      }
      break
  }
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 格式化日期
const formatDate = (date: string): string => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  return d.toLocaleDateString('zh-CN')
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    draft: 'info',
    published: 'success',
    completed: 'warning'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    published: '连载中',
    completed: '已完结'
  }
  return texts[status] || status
}

// 初始化
onMounted(() => {
  // 如果有项目，默认选择第一个
  if (props.projects.length > 0 && !currentProjectId.value) {
    currentProjectId.value = props.projects[0].id
  }
})
</script>

<style scoped lang="scss">
.project-sidebar {
  position: relative;
  width: 280px;
  height: 100%;
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;

  &.collapsed {
    width: 40px;
  }

  .collapse-btn {
    position: absolute;
    top: 12px;
    right: -12px;
    width: 24px;
    height: 24px;
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s;

    &:hover {
      background-color: #409eff;
      border-color: #409eff;
      color: #fff;
    }
  }

  .sidebar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  // 项目选择器
  .project-selector {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;

    .project-select {
      width: 100%;
    }

    .project-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;

      .project-title {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  // 项目信息
  .project-info {
    padding: 12px 16px;
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;

    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #909399;
      }

      .value {
        color: #303133;
        font-weight: 500;
      }
    }
  }

  // 搜索框
  .chapter-search {
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
  }

  // 操作按钮
  .sidebar-actions {
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
  }

  // 章节列表
  .chapters-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    .chapter-item {
      padding: 12px;
      margin-bottom: 8px;
      background-color: #fff;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
      }

      &.active {
        background-color: #ecf5ff;
        border-color: #409eff;

        .chapter-title {
          color: #409eff;
          font-weight: 600;
        }
      }

      .chapter-main {
        .chapter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;

          .chapter-number {
            font-size: 12px;
            color: #909399;
          }

          .chapter-menu {
            font-size: 16px;
            color: #909399;
            cursor: pointer;
            padding: 4px;

            &:hover {
              color: #409eff;
              background-color: #f5f7fa;
              border-radius: 4px;
            }
          }
        }

        .chapter-title {
          font-size: 14px;
          color: #303133;
          margin-bottom: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.4;
        }

        .chapter-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #909399;

          .word-count {
            font-weight: 500;
          }
        }
      }

      .chapter-badge {
        margin-top: 8px;
      }
    }
  }
}

// 滚动条样式
.chapters-list::-webkit-scrollbar {
  width: 6px;
}

.chapters-list::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;

  &:hover {
    background-color: #c0c4cc;
  }
}
</style>
