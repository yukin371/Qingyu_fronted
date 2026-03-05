<template>
  <div class="character-graph-view">
    <div class="graph-header">
      <div class="header-left">
        <QyIcon name="Share" :size="18" />
        <span class="header-title">人物关系图</span>
        <el-tag size="small" type="info">角色 {{ characters.length }}</el-tag>
        <el-tag size="small" effect="plain">关系 {{ relations.length }}</el-tag>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="handleRefresh" :icon="Refresh">刷新数据</el-button>
      </div>
    </div>

    <div class="graph-body" v-loading="writerStore.characters.loading">
      <div class="graph-stage">
        <div class="canvas-hint">拖拽空白平移画布，滚轮缩放，拖拽节点可调整布局</div>

        <RelationshipGraph
          v-if="graphNodes.length > 0"
          :nodes="graphNodes"
          :links="graphLinks"
          :active-node-id="selectedCharacter?.id"
          @node-click="handleNodeClick"
        />
        <div v-if="graphNodes.length > 0" class="relation-legend">
          <span class="legend-item is-friend">朋友</span>
          <span class="legend-item is-family">家庭</span>
          <span class="legend-item is-ally">盟友</span>
          <span class="legend-item is-enemy">敌人</span>
          <span class="legend-item is-romance">恋人</span>
          <span class="legend-item is-other">其他</span>
        </div>

        <el-empty
          v-else
          description="暂无角色关系数据（Mock 模式会自动注入示例网络）"
          :image-size="90"
        />
      </div>

      <aside class="detail-panel" v-if="selectedCharacter">
        <div class="detail-header">
          <el-avatar :size="52" :src="selectedCharacter.avatarUrl">
            {{ getAvatarText(selectedCharacter.name) }}
          </el-avatar>
          <div class="detail-title-wrap">
            <h3>{{ selectedCharacter.name }}</h3>
            <p v-if="selectedCharacter.alias?.length">{{ selectedCharacter.alias.join(' / ') }}</p>
          </div>
        </div>

        <div class="detail-section">
          <h4>角色简介</h4>
          <p>{{ selectedCharacter.summary || '暂无简介' }}</p>
        </div>

        <div class="detail-section" v-if="selectedCharacter.traits?.length">
          <h4>特征标签</h4>
          <div class="tags-wrap">
            <el-tag v-for="trait in selectedCharacter.traits" :key="trait" size="small" effect="plain">{{ trait }}</el-tag>
          </div>
        </div>

        <div class="detail-section">
          <h4>关联关系</h4>
          <div v-if="selectedRelations.length" class="relation-list">
            <div class="relation-item" v-for="rel in selectedRelations" :key="rel.id">
              <span class="relation-target">{{ getCounterpartName(rel) }}</span>
              <el-tag size="small" :type="getRelationTagType(rel.type)">{{ rel.type }}</el-tag>
              <el-progress :percentage="rel.strength" :show-text="false" :stroke-width="5" />
            </div>
          </div>
          <el-empty v-else description="暂无关联关系" :image-size="56" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useWriterStore } from '../stores/writerStore'
import type { Character, CharacterRelation, RelationType } from '@/types/writer'
import { QyIcon } from '@/design-system/components'
import RelationshipGraph from '../components/RelationshipGraph.vue'

const writerStore = useWriterStore()
const selectedCharacter = ref<Character | null>(null)

const characters = computed<Character[]>(() => writerStore.characters.list || [])
const relations = computed<CharacterRelation[]>(() => writerStore.characters.relations || [])

const graphNodes = computed(() =>
  characters.value.map((character) => {
    const linkedCount = relations.value.filter(
      rel => rel.fromId === character.id || rel.toId === character.id
    ).length

    return {
      id: character.id,
      name: character.name || '未命名角色',
      subtitle: character.alias?.[0] || character.summary || '未补充角色设定',
      relationCount: linkedCount,
      importance: Math.min(6, Math.max(2, linkedCount + 2))
    }
  })
)

const graphLinks = computed(() =>
  relations.value
    .filter(rel => rel.fromId && rel.toId)
    .map(rel => ({
      source: rel.fromId,
      target: rel.toId,
      type: rel.type || '其他',
      strength: Number(rel.strength || 50)
    }))
)

const selectedRelations = computed(() => {
  if (!selectedCharacter.value) return []
  return relations.value.filter(
    rel => rel.fromId === selectedCharacter.value!.id || rel.toId === selectedCharacter.value!.id
  )
})

onMounted(async () => {
  await handleRefresh()
})

watch(
  () => writerStore.currentProjectId,
  async (projectId) => {
    if (!projectId) return
    await handleRefresh()
  },
  { immediate: true }
)

const handleRefresh = async () => {
  if (!writerStore.currentProjectId) return

  await Promise.all([
    writerStore.loadCharacters(),
    writerStore.loadCharacterRelations()
  ])

  if (!selectedCharacter.value && characters.value.length > 0) {
    selectedCharacter.value = characters.value[0]
  }
}

const handleNodeClick = (nodeId: string) => {
  const character = characters.value.find(item => item.id === nodeId)
  if (character) {
    selectedCharacter.value = character
    writerStore.setCurrentCharacter(character)
  }
}

const getAvatarText = (name?: string) => {
  const safeName = (name || '').trim()
  return safeName ? safeName.charAt(0) : '角'
}

const getCounterpartName = (relation: CharacterRelation): string => {
  if (!selectedCharacter.value) return '未知角色'
  const counterpartId = relation.fromId === selectedCharacter.value.id ? relation.toId : relation.fromId
  return characters.value.find(item => item.id === counterpartId)?.name || '未知角色'
}

const getRelationTagType = (type: RelationType): 'success' | 'info' | 'warning' | 'danger' => {
  const typeMap: Record<RelationType, 'success' | 'info' | 'warning' | 'danger'> = {
    '朋友': 'success',
    '家庭': 'info',
    '恋人': 'danger',
    '盟友': 'success',
    '敌人': 'warning',
    '其他': 'info'
  }

  return typeMap[type] || 'info'
}
</script>

<style scoped lang="scss">
.character-graph-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7fbff;
}

.graph-header {
  height: 54px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dce6f5;
  background: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.graph-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
}

.graph-stage {
  position: relative;
  min-height: 0;
  padding: 12px;
}

.canvas-hint {
  position: absolute;
  top: 18px;
  left: 20px;
  z-index: 3;
  font-size: 12px;
  color: #334155;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #d6e0f0;
  border-radius: 999px;
  padding: 5px 10px;
}

.relation-legend {
  position: absolute;
  left: 20px;
  bottom: 18px;
  z-index: 3;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-width: calc(100% - 40px);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid;
  background: rgba(255, 255, 255, 0.92);
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
}

.is-friend {
  color: #16a34a;
  border-color: #86efac;
}

.is-family {
  color: #2563eb;
  border-color: #93c5fd;
}

.is-ally {
  color: #0284c7;
  border-color: #7dd3fc;
}

.is-enemy {
  color: #d97706;
  border-color: #fdba74;
}

.is-romance {
  color: #dc2626;
  border-color: #fda4af;
}

.is-other {
  color: #475569;
  border-color: #cbd5e1;
}

.detail-panel {
  border-left: 1px solid #dce6f5;
  background: #fff;
  padding: 14px;
  overflow: auto;
}

.detail-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.detail-title-wrap h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.detail-title-wrap p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.detail-section {
  margin-bottom: 14px;
}

.detail-section h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #334155;
}

.detail-section p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #475569;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.relation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.relation-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
}

.relation-target {
  display: inline-block;
  margin-bottom: 6px;
  margin-right: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

@media (max-width: 1080px) {
  .graph-body {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail-panel {
    border-left: none;
    border-top: 1px solid #dce6f5;
    max-height: 42%;
  }
}
</style>
