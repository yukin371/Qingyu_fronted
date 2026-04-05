<template>
  <div class="encyclopedia-view" :class="{ 'encyclopedia-view--embedded': embedded }">
    <!-- 工具栏 -->
    <div v-if="!embedded" class="encyclopedia-header">
      <div class="header-left">
        <el-icon class="header-icon"><Collection /></el-icon>
        <span class="header-title">设定百科</span>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索..."
          size="small"
          style="width: 200px;"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="encyclopedia-content" :class="{ 'has-detail': !!(selectedItem && selectedType) }">
      <!-- 中间列表区 -->
      <div class="list-panel">
        <div class="list-stats">
          <SystemStatCard label="角色" :value="characters.length" hint="设定人物总数" tone="info" />
          <SystemStatCard label="地点" :value="locations.length" hint="世界空间节点" tone="success" />
          <SystemStatCard label="概念" :value="concepts.length" hint="世界观与设定概念" tone="warning" />
          <SystemStatCard label="当前筛选" :value="activeCategoryLabel" :hint="searchHint" tone="warning" />
        </div>
        <!-- 角色列表 -->
        <div v-show="activeCategory === 'characters'" class="list-container">
          <div class="list-header">
            <h3>角色列表</h3>
            <el-button type="primary" size="small" @click="handleAddCharacter">
              <el-icon><Plus /></el-icon>
              添加角色
            </el-button>
          </div>
          <el-scrollbar class="list-content">
            <div class="items-grid">
              <div
                v-for="character in filteredCharacters"
                :key="character.id"
                class="item-card"
                :class="{ 'is-selected': selectedItem?.id === character.id }"
                @click="handleSelectItem(character, 'character')"
              >
                <QyAvatar size="xl" :src="character.avatarUrl" :text="character.name" />
                <div class="item-info">
                  <div class="item-name">{{ character.name }}</div>
                  <div v-if="character.summary" class="item-desc">{{ character.summary }}</div>
                </div>
              </div>
            </div>
            <el-empty v-if="filteredCharacters.length === 0" description="暂无角色" />
          </el-scrollbar>
        </div>

        <!-- 地点列表 -->
        <div v-show="activeCategory === 'locations'" class="list-container">
          <div class="list-header">
            <h3>地点列表</h3>
            <el-button type="primary" size="small" @click="handleAddLocation">
              <el-icon><Plus /></el-icon>
              添加地点
            </el-button>
          </div>
          <el-scrollbar class="list-content">
            <div class="items-grid">
              <div
                v-for="location in filteredLocations"
                :key="location.id"
                class="item-card"
                :class="{ 'is-selected': selectedItem?.id === location.id }"
                @click="handleSelectItem(location, 'location')"
              >
                <QyAvatar size="xl" :src="location.imageUrl" shape="square" :text="location.name" />
                <div class="item-info">
                  <div class="item-name">{{ location.name }}</div>
                  <div v-if="location.description" class="item-desc">{{ location.description }}</div>
                </div>
              </div>
            </div>
            <el-empty v-if="filteredLocations.length === 0" description="暂无地点" />
          </el-scrollbar>
        </div>

        <div v-show="activeCategory === 'concepts'" class="list-container">
          <div class="list-header">
            <h3>概念列表</h3>
            <el-button type="primary" size="small" @click="handleAddConcept">
              <el-icon><Plus /></el-icon>
              添加概念
            </el-button>
          </div>
          <el-scrollbar class="list-content">
            <div class="items-grid">
              <div
                v-for="concept in filteredConcepts"
                :key="concept.id"
                class="item-card"
                :class="{ 'is-selected': selectedItem?.id === concept.id }"
                @click="handleSelectItem(concept, 'concept')"
              >
                <QyAvatar size="xl" shape="square" :text="concept.name" />
                <div class="item-info">
                  <div class="item-name">{{ concept.name }}</div>
                  <div v-if="concept.category" class="item-desc" style="color: #722ED1;">{{ concept.category }}</div>
                  <div v-if="concept.summary" class="item-desc">{{ concept.summary }}</div>
                </div>
              </div>
            </div>
            <el-empty v-if="filteredConcepts.length === 0" description="暂无概念" />
          </el-scrollbar>
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <transition name="slide-left">
        <div v-if="selectedItem && selectedType" class="detail-panel">
          <!-- 角色详情 -->
          <div v-if="selectedType === 'character'" class="detail-content">
            <div class="detail-header">
              <div class="header-info">
                <QyAvatar size="xl" :src="(selectedItem as Character).avatarUrl" :text="(selectedItem as Character).name" />
                <div class="header-text">
                  <h2>{{ (selectedItem as Character).name }}</h2>
                  <p v-if="(selectedItem as Character).alias">{{ (selectedItem as Character).alias?.join('、') }}</p>
                </div>
              </div>
              <div class="header-actions">
                <el-button text @click="handleEditItem">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button text @click="handleDeleteItem">
                  <el-icon><Close /></el-icon>
                  删除
                </el-button>
                <el-button text @click="selectedItem = null">
                  <el-icon><Close /></el-icon>
                  关闭
                </el-button>
              </div>
            </div>

            <el-scrollbar class="detail-body">
              <div class="detail-section">
                <h4>简介</h4>
                <p>{{ (selectedItem as Character).summary || '暂无简介' }}</p>
              </div>

              <div v-if="(selectedItem as Character).traits && (selectedItem as Character).traits!.length > 0" class="detail-section">
                <h4>性格特征</h4>
                <div class="tags-container">
                  <el-tag v-for="trait in (selectedItem as Character).traits" :key="trait">
                    {{ trait }}
                  </el-tag>
                </div>
              </div>

              <div v-if="(selectedItem as Character).background" class="detail-section">
                <h4>背景故事</h4>
                <p>{{ (selectedItem as Character).background }}</p>
              </div>

              <div class="detail-section">
                <h4>AI 设定</h4>
                <el-descriptions :column="1" border size="small">
                  <el-descriptions-item label="性格提示">
                    {{ (selectedItem as Character).personalityPrompt || '未设置' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="语言模式">
                    {{ (selectedItem as Character).speechPattern || '未设置' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="当前状态">
                    {{ (selectedItem as Character).currentState || '未设置' }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="detail-section">
                <h4>故事线追溯</h4>
                <EntityTracePanel
                  :entity-id="(selectedItem as Character).id"
                  :entity-name="(selectedItem as Character).name"
                  entity-type="character"
                  :outline-tree="writerStore.outline.tree"
                  :relations="writerStore.characters.relations"
                  :all-characters="characters"
                />
              </div>
            </el-scrollbar>
          </div>

          <!-- 地点详情 -->
          <div v-if="selectedType === 'location'" class="detail-content">
            <div class="detail-header">
              <div class="header-info">
                <QyAvatar size="xl" :src="(selectedItem as Location).imageUrl" shape="square" :text="(selectedItem as Location).name" />
                <div class="header-text">
                  <h2>{{ (selectedItem as Location).name }}</h2>
                </div>
              </div>
              <div class="header-actions">
                <el-button text @click="handleEditItem">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button text @click="handleDeleteItem">
                  <el-icon><Close /></el-icon>
                  删除
                </el-button>
                <el-button text @click="selectedItem = null">
                  <el-icon><Close /></el-icon>
                  关闭
                </el-button>
              </div>
            </div>

            <el-scrollbar class="detail-body">
              <div class="detail-section">
                <h4>描述</h4>
                <p>{{ (selectedItem as Location).description || '暂无描述' }}</p>
              </div>

              <div class="detail-section">
                <h4>地点信息</h4>
                <el-descriptions :column="1" border size="small">
                  <el-descriptions-item label="气候" v-if="(selectedItem as Location).climate">
                    {{ (selectedItem as Location).climate }}
                  </el-descriptions-item>
                  <el-descriptions-item label="文化" v-if="(selectedItem as Location).culture">
                    {{ (selectedItem as Location).culture }}
                  </el-descriptions-item>
                  <el-descriptions-item label="地理" v-if="(selectedItem as Location).geography">
                    {{ (selectedItem as Location).geography }}
                  </el-descriptions-item>
                  <el-descriptions-item label="氛围" v-if="(selectedItem as Location).atmosphere">
                    {{ (selectedItem as Location).atmosphere }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="detail-section">
                <h4>故事线追溯</h4>
                <EntityTracePanel
                  :entity-id="(selectedItem as Location).id"
                  :entity-name="(selectedItem as Location).name"
                  entity-type="location"
                  :outline-tree="writerStore.outline.tree"
                  :relations="writerStore.characters.relations"
                  :all-characters="characters"
                />
              </div>
            </el-scrollbar>
          </div>

          <div v-if="selectedType === 'concept'" class="detail-content">
            <div class="detail-header">
              <div class="header-info">
                <QyAvatar size="xl" shape="square" :text="(selectedItem as Concept).name" />
                <div class="header-text">
                  <h2>{{ (selectedItem as Concept).name }}</h2>
                  <p v-if="(selectedItem as Concept).alias?.length">{{ (selectedItem as Concept).alias?.join('、') }}</p>
                </div>
              </div>
              <div class="header-actions">
                <el-button text @click="handleEditItem">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button text @click="handleDeleteItem">
                  <el-icon><Close /></el-icon>
                  删除
                </el-button>
                <el-button text @click="selectedItem = null">
                  <el-icon><Close /></el-icon>
                  关闭
                </el-button>
              </div>
            </div>

            <el-scrollbar class="detail-body">
              <div class="detail-section">
                <h4>简介</h4>
                <p>{{ (selectedItem as Concept).summary || '暂无简介' }}</p>
              </div>

              <div class="detail-section">
                <h4>分类</h4>
                <p>{{ (selectedItem as Concept).category || '未分类' }}</p>
              </div>

              <div class="detail-section">
                <h4>详细描述</h4>
                <p>{{ (selectedItem as Concept).description || '暂无详细描述' }}</p>
              </div>

              <div class="detail-section">
                <h4>故事线追溯</h4>
                <EntityTracePanel
                  :entity-id="(selectedItem as Concept).id"
                  :entity-name="(selectedItem as Concept).name"
                  entity-type="concept"
                  :outline-tree="writerStore.outline.tree"
                  :relations="writerStore.characters.relations"
                  :all-characters="characters"
                />
              </div>
            </el-scrollbar>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Plus, Edit, Close, Collection } from '@element-plus/icons-vue'
import { useWriterStore } from '../stores/writerStore'
import type { Character, Location } from '@/types/writer'
import type { Concept } from '../types/entity'
import QyAvatar from '@/design-system/components/basic/QyAvatar/QyAvatar.vue'
import SystemStatCard from '@/modules/writer/components/system-design/SystemStatCard.vue'
import EntityTracePanel from '../components/encyclopedia/EntityTracePanel.vue'
import { message, messageBox } from '@/design-system/services'
import { characterApi } from '../api/character'
import { locationApi } from '../api/location'
import { conceptApi } from '../api/concept'
const writerStore = useWriterStore()
type EncyclopediaCategory = 'characters' | 'locations' | 'concepts'

interface Props {
  embedded?: boolean
  projectId?: string
  activeCategory?: EncyclopediaCategory
}

const props = withDefaults(defineProps<Props>(), {
  embedded: false,
  projectId: '',
  activeCategory: 'characters',
})

const emit = defineEmits<{
  'update:activeCategory': [value: EncyclopediaCategory]
}>()

const activeCategory = computed<EncyclopediaCategory>({
  get: () => props.activeCategory,
  set: (value) => emit('update:activeCategory', value),
})
const searchKeyword = ref('')
const selectedItem = ref<Character | Location | Concept | null>(null)
const selectedType = ref<'character' | 'location' | 'concept' | null>(null)
const concepts = ref<Concept[]>([])

const characters = computed<Character[]>(() => writerStore.characters.list ?? [])
const locations = computed<Location[]>(() => writerStore.locations.list ?? [])

const filteredCharacters = computed(() => {
  if (!searchKeyword.value) return characters.value
  return characters.value.filter(c =>
    c.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const filteredLocations = computed(() => {
  if (!searchKeyword.value) return locations.value
  return locations.value.filter(l =>
    l.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const filteredConcepts = computed(() => {
  if (!searchKeyword.value) return concepts.value
  const keyword = searchKeyword.value.toLowerCase()
  return concepts.value.filter(concept =>
    concept.name.toLowerCase().includes(keyword)
    || (concept.alias || []).some(alias => alias.toLowerCase().includes(keyword))
    || (concept.summary || '').toLowerCase().includes(keyword)
    || (concept.category || '').toLowerCase().includes(keyword)
  )
})

const activeCategoryLabel = computed(() => {
  if (activeCategory.value === 'locations') return '地点'
  if (activeCategory.value === 'concepts') return '概念'
  return '角色'
})
const searchHint = computed(() => (searchKeyword.value ? `关键词：${searchKeyword.value}` : '未启用关键词'))

const handleSelectItem = (item: Character | Location | Concept, type: 'character' | 'location' | 'concept') => {
  selectedItem.value = item
  selectedType.value = type
}

async function refreshSelectedCharacter(characterId: string) {
  await writerStore.loadCharacters(effectiveProjectId.value)
  selectedItem.value = characters.value.find(item => item.id === characterId) || null
  selectedType.value = selectedItem.value ? 'character' : null
}

async function refreshSelectedLocation(locationId: string) {
  await writerStore.loadLocations(effectiveProjectId.value)
  selectedItem.value = locations.value.find(item => item.id === locationId) || null
  selectedType.value = selectedItem.value ? 'location' : null
}

const handleAddCharacter = async () => {
  if (!effectiveProjectId.value) return

  try {
    const nameResult = await messageBox.prompt('请输入角色名称', '添加角色')
    const name = String(nameResult.value || '').trim()
    if (!name) return
    const summaryResult = await messageBox.prompt('请输入角色简介（可选）', '添加角色')
    const summary = String(summaryResult.value || '').trim()
    const created = await characterApi.create(effectiveProjectId.value, {
      projectId: effectiveProjectId.value,
      name,
      summary,
    }) as any
    const payload = created?.data || created
    await refreshSelectedCharacter(payload?.id || '')
    message.success(`已添加角色「${payload?.name || name}」`)
  } catch {
    return
  }
}

const handleAddLocation = async () => {
  if (!effectiveProjectId.value) return

  try {
    const nameResult = await messageBox.prompt('请输入地点名称', '添加地点')
    const name = String(nameResult.value || '').trim()
    if (!name) return
    const summaryResult = await messageBox.prompt('请输入地点描述（可选）', '添加地点')
    const description = String(summaryResult.value || '').trim()
    const created = await locationApi.create(effectiveProjectId.value, {
      projectId: effectiveProjectId.value,
      name,
      description,
    }) as any
    const payload = created?.data || created
    await refreshSelectedLocation(payload?.id || '')
    message.success(`已添加地点「${payload?.name || name}」`)
  } catch {
    return
  }
}

const handleAddConcept = async () => {
  if (!effectiveProjectId.value) return

  try {
    const nameResult = await messageBox.prompt('请输入概念名称', '添加概念')
    const name = String(nameResult.value || '').trim()
    if (!name) return
    const summaryResult = await messageBox.prompt('请输入概念简介（可选）', '添加概念')
    const summary = String(summaryResult.value || '').trim()
    const created = await conceptApi.create(effectiveProjectId.value, {
      projectId: effectiveProjectId.value,
      name,
      summary,
    }) as any
    const payload = created?.data || created
    await refreshSelectedConcept(payload?.id || '')
    message.success(`已添加概念「${payload?.name || name}」`)
  } catch {
    return
  }
}

async function refreshSelectedConcept(conceptId: string) {
  const res = await conceptApi.list(effectiveProjectId.value) as any
  concepts.value = res?.data || res || []
  selectedItem.value = concepts.value.find(item => item.id === conceptId) || null
  selectedType.value = selectedItem.value ? 'concept' : null
}

const handleEditItem = async () => {
  if (!selectedItem.value || !effectiveProjectId.value || !selectedType.value) return

  try {
    if (selectedType.value === 'character') {
      const character = selectedItem.value as Character
      const name = window.prompt('请输入角色名称', character.name)?.trim() || ''
      if (!name) return
      const summary = window.prompt('请输入角色简介（可选）', character.summary || '')?.trim() || ''
      await characterApi.update(character.id, effectiveProjectId.value, {
        name,
        summary,
        alias: character.alias,
        traits: character.traits,
        background: character.background,
        personalityPrompt: character.personalityPrompt,
        speechPattern: character.speechPattern,
        currentState: character.currentState,
      })
      await refreshSelectedCharacter(character.id)
      message.success(`已更新角色「${name}」`)
      return
    }

    if (selectedType.value === 'location') {
      const location = selectedItem.value as Location
      const name = window.prompt('请输入地点名称', location.name)?.trim() || ''
      if (!name) return
      const description = window.prompt('请输入地点描述（可选）', location.description || '')?.trim() || ''
      await locationApi.update(location.id, effectiveProjectId.value, {
        projectId: effectiveProjectId.value,
        name,
        description,
        climate: location.climate,
        culture: location.culture,
        geography: location.geography,
        atmosphere: location.atmosphere,
        imageUrl: location.imageUrl,
      })
      await refreshSelectedLocation(location.id)
      message.success(`已更新地点「${name}」`)
      return
    }

    const concept = selectedItem.value as Concept
    const name = window.prompt('请输入概念名称', concept.name)?.trim() || ''
    if (!name) return
    const summary = window.prompt('请输入概念简介（可选）', concept.summary || '')?.trim() || ''
    const category = window.prompt('请输入概念分类（可选）', concept.category || '')?.trim() || ''
    const description = window.prompt('请输入详细描述（可选）', concept.description || '')?.trim() || ''
    await conceptApi.update(concept.id, effectiveProjectId.value, {
      name,
      summary,
      category: category || undefined,
      description: description || undefined,
      alias: concept.alias,
    })
    await refreshSelectedConcept(concept.id)
    message.success(`已更新概念「${name}」`)
  } catch {
    return
  }
}

const handleDeleteItem = async () => {
  if (!selectedItem.value || !effectiveProjectId.value || !selectedType.value) return
  try {
    if (selectedType.value === 'character') {
      const character = selectedItem.value as Character
      await messageBox.confirm(`确定删除角色“${character.name}”吗？`, '删除角色', { type: 'warning' })
      await characterApi.delete(character.id, effectiveProjectId.value)
      await writerStore.loadCharacters(effectiveProjectId.value)
      message.success(`已删除角色「${character.name}」`)
    } else if (selectedType.value === 'location') {
      const location = selectedItem.value as Location
      await messageBox.confirm(`确定删除地点“${location.name}”吗？`, '删除地点', { type: 'warning' })
      await locationApi.delete(location.id, effectiveProjectId.value)
      await writerStore.loadLocations(effectiveProjectId.value)
      message.success(`已删除地点「${location.name}」`)
    } else {
      const concept = selectedItem.value as Concept
      await messageBox.confirm(`确定删除概念”${concept.name}”吗？`, '删除概念', { type: 'warning' })
      await conceptApi.delete(concept.id, effectiveProjectId.value)
      const res = await conceptApi.list(effectiveProjectId.value) as any
      concepts.value = res?.data || res || []
      message.success(`已删除概念「${concept.name}」`)
    }

    selectedItem.value = null
    selectedType.value = null
  } catch {
    return
  }
}

const effectiveProjectId = computed(() => props.projectId || writerStore.currentProjectId || '')

async function loadWorldData(projectId: string) {
  if (!projectId) return
  const [, , conceptRes] = await Promise.all([
    writerStore.loadCharacters(projectId),
    writerStore.loadLocations(projectId),
    conceptApi.list(projectId),
  ])
  const conceptData = conceptRes as any
  concepts.value = conceptData?.data || conceptData || []
}

watch(
  () => effectiveProjectId.value,
  (projectId) => {
    if (!projectId) return
    loadWorldData(projectId)
  },
  { immediate: true }
)

watch(
  () => activeCategory.value,
  () => {
    selectedItem.value = null
    selectedType.value = null
  },
)

</script>

<style scoped lang="scss">
.encyclopedia-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
}

.encyclopedia-view--embedded {
  background: #ffffff;
}

.encyclopedia-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;

  .header-icon {
    font-size: 24px;
    color: #e6a23c;
  }

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.encyclopedia-content {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;
}

.encyclopedia-content.has-detail {
  grid-template-columns: minmax(0, 1fr) 400px;
}

.list-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-stats {
  padding: 12px 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fbff;
}

.list-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.list-content {
  flex: 1;
  padding: 16px;
}

.items-grid {
  display: grid;
  gap: 12px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &.is-selected {
    border-color: #409eff;
    background: #ecf5ff;
  }
}

.item-info {
  flex: 1;
  min-width: 0;

  .item-name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .item-desc {
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.detail-panel {
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.detail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;

  .header-info {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;

    .header-text {
      flex: 1;

      h2 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}

.detail-body {
  flex: 1;
  padding: 16px;
}

.detail-section {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .encyclopedia-content.has-detail {
    grid-template-columns: minmax(0, 1fr) 360px;
  }

  .detail-panel {
    width: 360px;
  }

  .list-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .encyclopedia-content,
  .encyclopedia-content.has-detail {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    width: 100%;
  }

  .list-stats {
    grid-template-columns: 1fr;
  }
}

/* 深色/暖纸/专注模式 — 统一使用 CSS 变量 */
[data-editor-theme="dark"],
[data-editor-theme="sepia"],
[data-editor-theme="focus"] {
  .encyclopedia-view {
    background: var(--editor-bg-surface, #0d0d0d);
  }

  .encyclopedia-header {
    background: var(--editor-bg-base, #1a1a1a);
    border-bottom-color: var(--editor-border, #2d2d2d);
  }

  .header-title {
    color: var(--editor-text-primary, #e5e5e5);
  }

  .list-header,
  .detail-panel {
    background: var(--editor-bg-base, #1a1a1a);
    border-color: var(--editor-border, #2d2d2d);
  }

  .list-container {
    background: var(--editor-bg-surface, #0d0d0d);
  }

  .list-header h3 {
    color: var(--editor-text-primary, #e5e5e5);
  }

  .item-card {
    background: var(--editor-bg-base, #1a1a1a);
    border-color: var(--editor-border, #2d2d2d);

    &:hover {
      border-color: var(--editor-accent, #409eff);
    }

    &.is-selected {
      background: var(--editor-accent-soft, #1a3a52);
    }
  }

  .item-info .item-name {
    color: var(--editor-text-primary, #e5e5e5);
  }

  .detail-header {
    border-bottom-color: var(--editor-border, #2d2d2d);

    .header-text h2 {
      color: var(--editor-text-primary, #e5e5e5);
    }
  }

  .detail-section {
    h4 {
      color: var(--editor-text-primary, #e5e5e5);
    }

    p {
      color: var(--editor-text-secondary, #c0c4cc);
    }
  }
}
</style>
