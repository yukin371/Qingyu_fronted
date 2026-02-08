<template>
  <div class="editor-layout">
    <!-- 顶部导航栏 -->
    <MiniNavbar />

    <!-- 主内容区域 -->
    <div class="editor-layout__content">
      <!-- 左侧面板 -->
      <ResizablePanel
        panel-id="left"
        :default-width="280"
        :min-width="200"
        :max-width="600"
        position="left"
      >
        <SidePanel position="left">
          <ProjectTree
            :project-id="projectId"
            :chapters="chapters"
            :current-chapter-id="currentChapterId"
          />
          <ChapterTree
            :tree-data="treeData"
            :project-id="projectId"
          />
        </SidePanel>
      </ResizablePanel>

      <!-- 中间编辑器 -->
      <EditorPanel />

      <!-- 右侧AI助手 -->
      <ResizablePanel
        panel-id="right"
        :default-width="320"
        :min-width="200"
        :max-width="600"
        position="right"
        :collapsible="true"
      >
        <SidePanel position="right" :collapsible="true">
          <AIPanel />
        </SidePanel>
      </ResizablePanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MiniNavbar from './MiniNavbar.vue'
import ResizablePanel from './ResizablePanel.vue'
import SidePanel from './SidePanel.vue'
import EditorPanel from './EditorPanel.vue'
import AIPanel from './AIPanel.vue'
import ProjectTree from '../ProjectTree.vue'
import ChapterTree from '../DocumentTree.vue'

// TODO: 从路由或store获取实际的项目ID和章节数据
const projectId = ref('')
const chapters = ref([])
const currentChapterId = ref('')

// TODO: 从store获取文档树数据
const treeData = ref([])

onMounted(() => {
  console.log('[EditorLayout] Mounted')
})
</script>

<style scoped lang="scss">
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);

  &__content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
}
</style>
