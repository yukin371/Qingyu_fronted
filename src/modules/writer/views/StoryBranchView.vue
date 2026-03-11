<template>
  <section class="story-branch-view">
    <header class="story-branch-view__header">
      <div>
        <h2 class="story-branch-view__title">分支系统</h2>
        <p class="story-branch-view__subtitle">以大纲树组织主线、支线与节点状态，持续跟踪推进进度。</p>
      </div>
      <el-button size="small" @click="refreshOutline">
        <QyIcon name="Refresh" :size="14" />
        刷新
      </el-button>
    </header>

    <div class="story-branch-view__stats">
      <SystemStatCard label="节点总数" :value="allNodes.length" hint="来自大纲树" tone="info" />
      <SystemStatCard label="主线节点" :value="rootNodes.length" hint="顶层分支" tone="success" />
      <SystemStatCard label="进行中节点" :value="activeNodes" hint="writing/reviewing" tone="warning" />
    </div>

    <div class="story-branch-view__body">
      <aside class="story-branch-tree">
        <div class="story-branch-tree__title">分支目录</div>
        <el-scrollbar class="story-branch-tree__content">
          <div v-if="rootNodes.length" class="branch-tree-root">
            <div
              v-for="node in rootNodes"
              :key="node.id"
              class="branch-node"
            >
              <button
                type="button"
                class="branch-node__row"
                :class="{ active: selectedNodeId === node.id }"
                @click="selectNode(node)"
              >
                <QyGhostButton
                  class="branch-node__toggle"
                  :disabled="!hasChildren(node)"
                  @click.stop="toggleNode(node.id)"
                >
                  <QyIcon :name="isExpanded(node.id) ? 'CaretBottom' : 'CaretRight'" :size="12" />
                </QyGhostButton>
                <span class="branch-node__title">{{ node.title }}</span>
                <el-tag size="small" :type="statusTagType(node.status)">{{ statusText(node.status) }}</el-tag>
              </button>

              <div v-if="hasChildren(node) && isExpanded(node.id)" class="branch-node__children">
                <div
                  v-for="child in node.children || []"
                  :key="child.id"
                  class="branch-node__child"
                >
                  <button
                    type="button"
                    class="branch-node__child-row"
                    :class="{ active: selectedNodeId === child.id }"
                    @click="selectNode(child)"
                  >
                    <span class="branch-node__child-title">{{ child.title }}</span>
                    <el-tag size="small" :type="statusTagType(child.status)">{{ statusText(child.status) }}</el-tag>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无大纲节点" :image-size="78" />
        </el-scrollbar>
      </aside>

      <section class="story-branch-detail">
        <div class="story-branch-detail__title">节点详情</div>
        <div v-if="selectedNode" class="story-branch-detail__content">
          <h3>{{ selectedNode.title }}</h3>
          <p>{{ selectedNode.description || '暂无描述' }}</p>
          <div class="story-branch-detail__meta">
            <span>层级：L{{ selectedNode.level || 1 }}</span>
            <span>字数：{{ selectedNode.wordCount || 0 }}</span>
            <span>状态：{{ statusText(selectedNode.status) }}</span>
          </div>
          <div class="story-branch-detail__lane">
            <div class="story-branch-detail__lane-track">
              <div class="story-branch-detail__lane-progress" :style="{ width: `${progressPercent}%` }" />
            </div>
            <div class="story-branch-detail__lane-text">分支推进度 {{ progressPercent }}%</div>
          </div>
        </div>
        <el-empty v-else description="选择左侧节点查看详情" :image-size="90" />
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElButton, ElEmpty, ElScrollbar, ElTag } from 'element-plus'
import { QyGhostButton, QyIcon } from '@/design-system/components'
import type { OutlineNode } from '@/types/writer'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import SystemStatCard from '@/modules/writer/components/system-design/SystemStatCard.vue'

type OutlineStatus = OutlineNode['status']

const props = withDefaults(
  defineProps<{
    projectId?: string
  }>(),
  {
    projectId: '',
  },
)

const writerStore = useWriterStore()
const expandedNodeIds = ref<Set<string>>(new Set())
const selectedNodeId = ref('')

const effectiveProjectId = computed(() => props.projectId || writerStore.currentProjectId || '')
const rootNodes = computed<OutlineNode[]>(() => writerStore.outline.tree || [])
const allNodes = computed<OutlineNode[]>(() => {
  const list: OutlineNode[] = []
  const walk = (nodes: OutlineNode[]) => {
    for (const node of nodes) {
      list.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(rootNodes.value)
  return list
})

const selectedNode = computed(() => allNodes.value.find((node) => node.id === selectedNodeId.value) || null)
const activeNodes = computed(() =>
  allNodes.value.filter((node) => node.status === 'writing' || node.status === 'reviewing').length,
)

const progressPercent = computed(() => {
  if (!selectedNode.value) return 0
  const status = selectedNode.value.status
  if (status === 'completed') return 100
  if (status === 'reviewing') return 80
  if (status === 'writing') return 56
  return 24
})

const hasChildren = (node: OutlineNode) => Array.isArray(node.children) && node.children.length > 0
const isExpanded = (id: string) => expandedNodeIds.value.has(id)

const toggleNode = (id: string) => {
  if (expandedNodeIds.value.has(id)) {
    expandedNodeIds.value.delete(id)
  } else {
    expandedNodeIds.value.add(id)
  }
}

const selectNode = (node: OutlineNode) => {
  selectedNodeId.value = node.id
  writerStore.setCurrentOutlineNode(node)
}

const statusText = (status?: OutlineStatus) => {
  if (status === 'writing') return '写作中'
  if (status === 'reviewing') return '审核中'
  if (status === 'completed') return '已完成'
  return '草稿'
}

const statusTagType = (status?: OutlineStatus): 'info' | 'success' | 'warning' => {
  if (status === 'completed') return 'success'
  if (status === 'writing' || status === 'reviewing') return 'warning'
  return 'info'
}

const refreshOutline = async () => {
  if (!effectiveProjectId.value) return
  await writerStore.loadOutlineTree(effectiveProjectId.value)
  for (const node of rootNodes.value) {
    expandedNodeIds.value.add(node.id)
  }
  if (!selectedNodeId.value && rootNodes.value.length > 0) {
    selectNode(rootNodes.value[0])
  }
}

watch(
  () => effectiveProjectId.value,
  async (projectId) => {
    if (!projectId) return
    await refreshOutline()
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.story-branch-view {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f7f9ff 0%, #eef2ff 100%);
}

.story-branch-view__header {
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  border-bottom: 1px solid #d7dff0;
}

.story-branch-view__title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #1f3254;
}

.story-branch-view__subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  color: #68799a;
}

.story-branch-view__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 16px;
}

.story-branch-view__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 12px;
  padding: 0 16px 16px;
}

.story-branch-tree,
.story-branch-detail {
  border: 1px solid #d6dff2;
  border-radius: 14px;
  background: #fff;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.story-branch-tree__title,
.story-branch-detail__title {
  padding: 12px 14px;
  border-bottom: 1px solid #e1e8f6;
  font-size: 12px;
  color: #607291;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.story-branch-tree__content {
  flex: 1;
  min-height: 0;
  padding: 10px;
}

.branch-node__row,
.branch-node__child-row {
  width: 100%;
  border: 1px solid #dbe4f5;
  border-radius: 10px;
  background: #f8faff;
  padding: 8px 10px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.branch-node__row.active,
.branch-node__child-row.active {
  border-color: #668ce2;
  background: #ecf3ff;
}

.branch-node__toggle {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  flex: 0 0 20px;
}

.branch-node__title,
.branch-node__child-title {
  flex: 1;
  min-width: 0;
  text-align: left;
  font-size: 13px;
  color: #24365d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.branch-node__children {
  margin-left: 28px;
}

.story-branch-detail__content {
  padding: 16px;
}

.story-branch-detail__content h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #203258;
}

.story-branch-detail__content p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: #5f7292;
}

.story-branch-detail__meta {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: #6f81a1;
  font-size: 12px;
}

.story-branch-detail__lane {
  margin-top: 16px;
}

.story-branch-detail__lane-track {
  height: 10px;
  border-radius: 999px;
  background: #e9effc;
  overflow: hidden;
}

.story-branch-detail__lane-progress {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #4d79da 0%, #76a0f2 100%);
  transition: width 0.2s ease;
}

.story-branch-detail__lane-text {
  margin-top: 8px;
  font-size: 12px;
  color: #5f7291;
}

@media (max-width: 1100px) {
  .story-branch-view__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .story-branch-view__body {
    grid-template-columns: 1fr;
  }
}
</style>
