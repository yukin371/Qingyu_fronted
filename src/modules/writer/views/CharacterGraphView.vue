<template>
  <div class="character-graph-view">
    <!-- 主内容区 -->
    <div class="graph-content">
      <!-- 图谱区域 -->
      <div class="graph-canvas" ref="graphCanvasRef" v-loading="writerStore.characters.loading">
        <section v-if="!isGlobalGraph" class="asset-binding-strip" data-testid="asset-binding-strip">
          <article class="asset-binding-card">
            <div class="asset-binding-card__header">
              <div>
                <h4>已绑定资产</h4>
              </div>
              <div class="asset-binding-card__actions">
                <el-button text size="small" @click="showBoundAssetsPanel = !showBoundAssetsPanel">
                  {{ showBoundAssetsPanel ? '收起' : '展开' }}
                </el-button>
                <el-button
                  text
                  size="small"
                  :disabled="scopeBindableCharacters.length === 0"
                  @click="handleBindExistingCharactersToScope"
                >
                  绑定角色卡 {{ scopeBindableCharacters.length }}
                </el-button>
              </div>
            </div>
            <div class="asset-binding-card__summary">
              <span>{{ currentScopeType === 'volume' ? '卷级出场池' : '当前章节可见角色池' }}</span>
              <span>已绑定 {{ boundScopeAssetRefs.length }}</span>
              <span>可补绑 {{ scopeBindableCharacters.length }}</span>
            </div>
            <div v-if="showBoundAssetsPanel && boundScopeAssetRefs.length > 0" class="asset-binding-chip-list">
              <div
                v-for="asset in boundScopeAssetRefs"
                :key="asset.id"
                class="asset-binding-chip"
                :class="`is-${asset.assetType}`"
              >
                <div class="asset-binding-chip__meta">
                  <span class="asset-binding-chip__type">{{ formatAssetType(asset.assetType) }}</span>
                  <strong>{{ asset.assetName }}</strong>
                  <span v-if="asset.scopeType === 'chapter' && currentScopeType === 'chapter'" class="asset-binding-chip__source">
                    {{ formatAssetSource(asset.source) }}
                  </span>
                  <span v-else-if="asset.scopeType === 'volume' && currentScopeType === 'chapter'" class="asset-binding-chip__source">
                    卷级继承
                  </span>
                </div>
                <el-button
                  v-if="asset.scopeType === currentScopeType"
                  text
                  size="small"
                  @click="handleRemoveBoundAsset(asset)"
                >
                  移除
                </el-button>
              </div>
            </div>
            <div v-else-if="showBoundAssetsPanel" class="asset-binding-empty">
              当前{{ currentScopeType === 'volume' ? '卷' : '章节' }}还没有确认过资产，可先从正文候选中绑定。
            </div>
          </article>

          <article class="asset-binding-card">
            <div class="asset-binding-card__header">
              <div>
                <h4>{{ currentScopeType === 'volume' ? '卷候选资产' : '章节候选资产' }}</h4>
              </div>
              <div class="asset-binding-card__actions">
                <el-button text size="small" @click="showCandidatePanel = !showCandidatePanel">
                  {{ showCandidatePanel ? '收起' : '展开' }}
                </el-button>
                <el-tag size="small" :type="currentScopeType === 'volume' ? 'warning' : 'success'">
                  {{ scopeAssetCandidates.length }}
                </el-tag>
                <el-button
                  text
                  size="small"
                  :disabled="bindableScopeAssetCandidates.length === 0 || bindingAllCandidates"
                  @click="handleBindAllAssetCandidates"
                >
                  {{ bindingAllCandidates ? '绑定中...' : `全部绑定已建档 ${bindableScopeAssetCandidates.length}` }}
                </el-button>
              </div>
            </div>
            <div class="asset-binding-card__summary">
              <span>{{ currentScopeType === 'volume' ? '由章节确认资产自动汇总' : '从当前正文自动识别' }}</span>
              <span>可绑定 {{ bindableScopeAssetCandidates.length }}</span>
              <span>待建档 {{ unresolvedScopeAssetCandidates.length }}</span>
            </div>
            <div v-if="showCandidatePanel && scopeAssetCandidates.length > 0" class="asset-binding-chip-list">
              <div
                v-for="candidate in scopeAssetCandidates"
                :key="candidate.key"
                class="asset-binding-chip"
                :class="`is-${candidate.assetType}`"
              >
                <div class="asset-binding-chip__meta">
                  <span class="asset-binding-chip__type">{{ formatAssetType(candidate.assetType) }}</span>
                  <strong>{{ candidate.assetName }}</strong>
                  <span class="asset-binding-chip__source">{{ formatAssetSource(candidate.source) }}</span>
                  <span v-if="candidate.unresolved" class="asset-binding-chip__status is-unresolved">待建档</span>
                  <span v-else class="asset-binding-chip__status">已匹配</span>
                  <span v-if="candidate.evidence" class="asset-binding-chip__evidence">命中：{{ candidate.evidence }}</span>
                </div>
                <el-button
                  text
                  size="small"
                  :disabled="bindingAllCandidates"
                  @click="candidate.unresolved ? handleCreateAndBindCandidate(candidate) : handleBindAssetCandidate(candidate)"
                >
                  {{ candidate.unresolved ? '建档并绑定' : '绑定' }}
                </el-button>
              </div>
            </div>
            <div v-else-if="showCandidatePanel" class="asset-binding-empty">
              {{ currentScopeType === 'volume'
                ? '先在本卷章节里确认角色/地点资产，这里才会出现可提升的卷级候选。'
                : chapterCandidateHint }}
            </div>
          </article>
        </section>

        <!-- 角色关系图谱画布 -->
        <div class="graph-visualization">
          <!-- 全局图谱（无数据 - 创建引导） -->
          <div v-if="shouldShowGlobalCreationGuide" class="graph-creation-guide">
            <div class="guide-content">
              <el-icon class="guide-icon"><Connection /></el-icon>
              <h3>全局关系图谱</h3>
              <p>尚未创建关系图谱，请选择创建方式</p>

              <div class="guide-actions">
                <el-button type="primary" @click="handleCreateGlobalGraph('empty')">
                  从零开始
                </el-button>
                <el-button @click="showInheritDialog">
                  继承其他图谱
                </el-button>
                <el-button @click="handleImportFromCharacters">
                  从角色卡引入
                </el-button>
                <el-button @click="openCreateCharacterDialog">
                  新建角色
                </el-button>
              </div>
            </div>
          </div>

          <!-- 全局图谱（有数据） -->
          <div v-else-if="!currentChapterId" class="global-graph-container">
            <div class="global-graph-header">
              <span class="graph-title">全局关系图谱</span>
              <el-tag size="small" :type="isGlobalGraphCreatedEmpty ? 'warning' : 'info'">
                {{ isGlobalGraphCreatedEmpty ? '空图谱' : `${characters.length} 个角色` }}
              </el-tag>
            </div>
            <div v-if="isGlobalGraphCreatedEmpty" class="graph-empty-panel" data-testid="global-empty-graph-state">
              <el-icon class="empty-icon"><Connection /></el-icon>
              <h4>空白全局图谱已创建</h4>
              <p>当前还没有角色关系。你可以先从角色卡引入，再继续补充关系。</p>
              <div class="empty-actions">
                <el-button type="primary" @click="handleImportFromCharacters">从角色卡引入</el-button>
                <el-button @click="openCreateCharacterDialog">新建角色</el-button>
              </div>
            </div>
            <RelationshipGraph
              v-else
              :nodes="graphNodes"
              :links="graphLinks"
              @create-link="handleGraphCreateLink"
              @node-click="handleNodeClick"
              @delete-node="handleDeleteNode"
              @add-node="handleAddNodeAt"
            />
          </div>

          <!-- 卷/章节图谱（已创建） -->
          <template v-else-if="currentChapterId && hasCurrentScopeGraph">
            <div class="chapter-graph-header" data-testid="chapter-graph-header">
              <span class="chapter-name">
                {{ currentScopeType === 'volume' ? `${currentScopeTitle} · 卷图谱` : getChapterInfo(currentChapterId)?.chapter }}
              </span>
              <el-tag size="small" :type="currentChapterGraphTagType">
                {{ currentChapterGraphTag }}
              </el-tag>
            </div>
            <div v-if="isCurrentChapterGraphEmpty" class="graph-empty-panel" data-testid="chapter-empty-graph-state">
              <el-icon class="empty-icon"><Document /></el-icon>
              <h4>{{ currentScopeType === 'volume' ? '卷级空图谱已创建' : '章节空图谱已创建' }}</h4>
              <p v-if="currentScopeGraph?.parentGraphId === 'global'">
                当前{{ currentScopeType === 'volume' ? '卷' : '章节' }}图谱已接入全局继承链，但继承源里还没有可展示的关系。
              </p>
              <p v-else>
                当前{{ currentScopeType === 'volume' ? '卷' : '章节' }}图谱已创建，但还没有角色或关系。你可以继续继承全局，或先补充角色关系。
              </p>
              <div class="empty-actions">
                <el-button
                  v-if="currentScopeGraph?.parentGraphId !== 'global'"
                  :disabled="globalRelations.length === 0"
                  @click="currentScopeType === 'volume' ? handleCreateVolumeGraph('inherit') : handleCreateChapterGraph('inherit')"
                >
                  继承全局
                </el-button>
                <el-button type="primary" @click="handleImportFromCharacters">
                  从角色卡引入
                </el-button>
                <el-button
                  :disabled="scopeBindableCharacters.length === 0"
                  @click="handleBindExistingCharactersToScope"
                >
                  绑定角色卡
                </el-button>
              </div>
            </div>
            <RelationshipGraph
              v-else
              :nodes="graphNodes"
              :links="graphLinks"
              @create-link="handleGraphCreateLink"
              @node-click="handleNodeClick"
              @delete-node="handleDeleteNode"
              @add-node="handleAddNodeAt"
            />
          </template>

          <!-- 卷/章节图谱（未创建 - 创建引导） -->
          <div v-else-if="currentChapterId" class="graph-creation-guide">
            <div class="guide-content">
              <el-icon class="guide-icon"><Document /></el-icon>
              <h3>{{ currentScopeTitle || (currentScopeType === 'volume' ? '该卷' : '该章节') }}</h3>
              <p>该{{ currentScopeType === 'volume' ? '卷' : '章节' }}尚未创建专属关系图谱</p>

              <div class="guide-actions">
                <el-button
                  type="primary"
                  @click="currentScopeType === 'volume' ? handleCreateVolumeGraph('empty') : handleCreateChapterGraph('empty')"
                >
                  从零开始
                </el-button>
                <el-button @click="currentScopeType === 'volume' ? handleCreateVolumeGraph('inherit') : handleCreateChapterGraph('inherit')">
                  继承全局
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详情侧边栏 -->
      <transition name="slide-left">
        <div v-if="selectedCharacter" class="detail-sidebar">
          <div class="sidebar-header">
            <h3>{{ selectedCharacter.name }}</h3>
            <el-button text @click="selectedCharacter = null">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <el-scrollbar class="sidebar-content">
            <!-- 基本信息 -->
            <div class="info-section">
              <h4>基本信息</h4>
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="名称">
                  {{ selectedCharacter.name }}
                </el-descriptions-item>
                <el-descriptions-item label="别名" v-if="selectedCharacter.alias">
                  {{ selectedCharacter.alias.join('、') }}
                </el-descriptions-item>
                <el-descriptions-item label="简介" v-if="selectedCharacter.summary">
                  {{ selectedCharacter.summary }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 性格特征 -->
            <div
              v-if="selectedCharacter.traits && selectedCharacter.traits.length > 0"
              class="info-section"
            >
              <h4>性格特征</h4>
              <div class="traits-list">
                <el-tag v-for="trait in selectedCharacter.traits" :key="trait" size="small">
                  {{ trait }}
                </el-tag>
              </div>
            </div>

            <!-- 背景故事 -->
            <div v-if="selectedCharacter.background" class="info-section">
              <h4>背景故事</h4>
              <p class="background-text">{{ selectedCharacter.background }}</p>
            </div>

            <!-- AI 设定 -->
            <div class="info-section">
              <h4>AI 设定</h4>
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="性格提示" v-if="selectedCharacter.personalityPrompt">
                  {{ selectedCharacter.personalityPrompt }}
                </el-descriptions-item>
                <el-descriptions-item label="语言模式" v-if="selectedCharacter.speechPattern">
                  {{ selectedCharacter.speechPattern }}
                </el-descriptions-item>
                <el-descriptions-item label="当前状态" v-if="selectedCharacter.currentState">
                  {{ selectedCharacter.currentState }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 关系列表 -->
            <div class="info-section">
              <h4>角色关系</h4>
              <div class="relations-list">
                <div
                  v-for="relation in getCharacterRelations(selectedCharacter.id)"
                  :key="relation.id"
                  class="relation-item"
                >
                  <div class="relation-info">
                    <span class="relation-target">
                      {{
                        getCharacterName(
                          relation.fromId === selectedCharacter.id
                            ? relation.toId
                            : relation.fromId,
                        )
                      }}
                    </span>
                    <el-tag size="small" :type="getRelationTagType(relation.type)">
                      {{ relation.type }}
                    </el-tag>
                  </div>
                  <el-progress
                    :percentage="relation.strength"
                    :stroke-width="6"
                    :show-text="false"
                  />
                </div>
                <el-empty
                  v-if="getCharacterRelations(selectedCharacter.id).length === 0"
                  description="暂无关系"
                  :image-size="60"
                />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="sidebar-actions">
              <el-button type="primary" @click="handleEditCharacter(selectedCharacter)">
                编辑角色
              </el-button>
              <el-button @click="handleManageRelations(selectedCharacter)"> 管理关系 </el-button>
            </div>
          </el-scrollbar>
        </div>
      </transition>
    </div>

    <!-- 角色编辑卡片 -->
    <transition name="fade-slide">
      <div v-if="dialogVisible" class="character-edit-card-container">
        <QyCard class="character-edit-card" shadow="always" padding="lg">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon class="header-icon">
                  <QyIcon name="User" />
                </el-icon>
                <h3 class="header-title">{{ isEdit ? '编辑角色' : '添加角色' }}</h3>
              </div>
              <el-button text @click="dialogVisible = false">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="characterForm"
            :rules="formRules"
            label-width="100px"
            class="character-form"
          >
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="characterForm.name" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item label="别名">
              <div class="tags-container">
                <el-tag
                  v-for="(alias, index) in characterForm.alias"
                  :key="index"
                  closable
                  @close="characterForm.alias.splice(index, 1)"
                >
                  {{ alias }}
                </el-tag>
                <el-input
                  v-if="showAliasInput"
                  ref="aliasInputRef"
                  v-model="newAlias"
                  size="small"
                  @blur="handleAliasInputConfirm"
                  @keyup.enter="handleAliasInputConfirm"
                />
                <el-button v-else size="small" @click="showAliasInput = true">
                  + 添加别名
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="角色简介">
              <el-input
                v-model="characterForm.summary"
                type="textarea"
                :rows="2"
                placeholder="请输入角色简介"
              />
            </el-form-item>
            <el-form-item label="性格特征">
              <div class="tags-container">
                <el-tag
                  v-for="(trait, index) in characterForm.traits"
                  :key="index"
                  closable
                  @close="characterForm.traits.splice(index, 1)"
                >
                  {{ trait }}
                </el-tag>
                <el-input
                  v-if="showTraitInput"
                  ref="traitInputRef"
                  v-model="newTrait"
                  size="small"
                  @blur="handleTraitInputConfirm"
                  @keyup.enter="handleTraitInputConfirm"
                />
                <el-button v-else size="small" @click="showTraitInput = true">
                  + 添加特征
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="背景故事">
              <el-input
                v-model="characterForm.background"
                type="textarea"
                :rows="4"
                placeholder="请输入角色背景故事"
              />
            </el-form-item>
            <el-form-item label="性格提示">
              <el-input
                v-model="characterForm.personalityPrompt"
                type="textarea"
                :rows="2"
                placeholder="为 AI 提供角色性格提示"
              />
            </el-form-item>
            <el-form-item label="语言模式">
              <el-input v-model="characterForm.speechPattern" placeholder="角色说话方式" />
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="card-footer">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                确定
              </el-button>
            </div>
          </template>
        </QyCard>
      </div>
    </transition>

    <!-- 关系管理对话框 -->
    <transition name="fade-slide">
      <div v-if="relationDialogVisible" class="relation-dialog-container">
        <QyCard class="relation-dialog-card" shadow="always" padding="lg">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon class="header-icon">
                  <QyIcon name="Connection" />
                </el-icon>
                <h3 class="header-title">管理角色关系</h3>
              </div>
              <el-button text @click="relationDialogVisible = false">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </template>

          <div class="relation-dialog-content">
            <!-- 现有关系列表 -->
            <div class="existing-relations">
              <h4>当前角色关系</h4>
              <div v-if="selectedCharacter" class="relations-list-dialog">
                <div
                  v-for="relation in getCharacterRelations(selectedCharacter.id)"
                  :key="relation.id"
                  class="relation-item-dialog"
                >
                  <div class="relation-main">
                    <span class="relation-target">
                      {{
                        getCharacterName(
                          relation.fromId === selectedCharacter.id
                            ? relation.toId
                            : relation.fromId,
                        )
                      }}
                    </span>
                    <el-tag size="small" :type="getRelationTagType(relation.type)">
                      {{ relation.type }}
                    </el-tag>
                    <div class="relation-strength">
                      <el-progress
                        :percentage="relation.strength"
                        :stroke-width="4"
                        :show-text="false"
                      />
                      <span class="strength-value">{{ relation.strength }}</span>
                    </div>
                  </div>
                  <el-button
                    type="danger"
                    text
                    size="small"
                    @click="handleDeleteRelation(relation)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-empty
                  v-if="getCharacterRelations(selectedCharacter.id).length === 0"
                  description="暂无关系"
                  :image-size="60"
                />
              </div>
            </div>

            <el-divider />

            <!-- 创建新关系表单 -->
            <div class="create-relation-form">
              <h4>添加新关系</h4>
              <el-form
                ref="relationFormRef"
                :model="relationForm"
                :rules="relationFormRules"
                label-width="80px"
              >
                <el-form-item label="目标角色" prop="toId">
                  <el-select
                    v-model="relationForm.toId"
                    placeholder="选择目标角色"
                    filterable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="char in availableTargetCharacters"
                      :key="char.id"
                      :label="char.name"
                      :value="char.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="关系类型" prop="type">
                  <el-select
                    v-model="relationForm.type"
                    placeholder="选择关系类型"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="option in RELATION_TYPE_OPTIONS"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="关系强度" prop="strength">
                  <div class="strength-slider">
                    <el-slider v-model="relationForm.strength" :min="0" :max="100" :step="5" />
                    <span class="strength-display">{{ relationForm.strength }}</span>
                  </div>
                </el-form-item>
                <el-form-item label="备注">
                  <el-input
                    v-model="relationForm.notes"
                    type="textarea"
                    :rows="2"
                    placeholder="关系描述（可选）"
                  />
                </el-form-item>
              </el-form>
            </div>
          </div>

          <template #footer>
            <div class="card-footer">
              <el-button @click="relationDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleCreateRelation" :loading="relationSubmitting">
                创建关系
              </el-button>
            </div>
          </template>
        </QyCard>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Close, Delete, Connection, Document } from '@element-plus/icons-vue'
import { useProjectStore } from '../stores/projectStore'
import { useWriterStore } from '../stores/writerStore'
import { useEditorStore } from '../stores/editorStore'
import type { Character, CharacterRelation, RelationType } from '@/types/writer'
import type {
  ChapterGraph,
  ChapterRelation,
  CreateCharacterRequest,
  VolumeGraph,
  VolumeRelation,
} from '../types/character'
import { RELATION_TYPE_OPTIONS } from '../types/character'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import { QyIcon } from '@/design-system/components'
import QyCard from '@/design-system/components/basic/QyCard/QyCard.vue'
import { extractPlainTextFromEditorContent } from '@/modules/writer/utils/editorContent'
import RelationshipGraph, {
  type GraphNode,
  type GraphLink,
} from '../components/RelationshipGraph.vue'
import {
  appendChapterRelationDraft,
  appendVolumeRelationDraft,
  createChapterGraphDraft,
  createVolumeGraphDraft,
  deleteChapterRelationDraft,
  deleteChapterRelationsByNode,
  deleteVolumeRelationDraft,
  deleteVolumeRelationsByNode,
  loadCharacterGraphDraftState,
  setGlobalGraphInitialized,
  type CharacterGraphDraftState,
} from '../utils/characterGraphDrafts'
import {
  extractWriterAssetCandidates,
  loadWriterAssetRefState,
  removeScopeAssetRef,
  upsertScopeAssetRef,
  type WriterAssetCandidate,
  type WriterAssetRef,
  type WriterAssetRefState,
} from '../utils/writerAssetRefs'
import { locationApi } from '../api/location'
import { loadWriterItems, upsertWriterItem } from '../utils/writerItems'
import { message, messageBox } from '@/design-system/services'
import { ElMessage } from 'element-plus'
const writerStore = useWriterStore()
const projectStore = useProjectStore()
const editorStore = useEditorStore()
type VisibleRelation = (CharacterRelation | ChapterRelation | VolumeRelation) & { isInherited?: boolean }
type GraphScopeType = 'global' | 'volume' | 'chapter'

// Props
interface Props {
  chapterId?: string
  chapters?: SidebarChapterSummary[]
}

const props = withDefaults(defineProps<Props>(), {
  chapterId: '',
  chapters: () => [],
})
const emit = defineEmits<{
  (e: 'status-change', chips: string[]): void
}>()

const selectedCharacter = ref<Character | null>(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()
const showAliasInput = ref(false)
const showTraitInput = ref(false)
const newAlias = ref('')
const newTrait = ref('')

// 关系管理对话框状态
const relationDialogVisible = ref(false)
const relationSubmitting = ref(false)
const relationFormRef = ref()
const relationForm = ref({
  fromId: '',
  toId: '',
  type: '' as RelationType,
  strength: 50,
  notes: '',
})

const characterForm = ref({
  name: '',
  alias: [] as string[],
  summary: '',
  traits: [] as string[],
  background: '',
  personalityPrompt: '',
  speechPattern: '',
  currentState: '',
})

const formRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
}

// 关系表单验证规则
const relationFormRules = {
  toId: [{ required: true, message: '请选择目标角色', trigger: 'change' }],
  type: [{ required: true, message: '请选择关系类型', trigger: 'change' }],
  strength: [{ type: 'number', min: 0, max: 100, message: '强度范围为 0-100', trigger: 'blur' }],
}

const graphDraftState = ref<CharacterGraphDraftState>({
  globalGraphInitialized: false,
  chapterGraphs: [],
  chapterRelations: {},
  volumeGraphs: [],
  volumeRelations: {},
})
const assetRefState = ref<WriterAssetRefState>({
  chapterRefs: {},
  volumeRefs: {},
})
const bindingAllCandidates = ref(false)
const showBoundAssetsPanel = ref(false)
const showCandidatePanel = ref(false)

const activeProjectId = computed(() => projectStore.currentProjectId || '')

function reloadGraphDraftState() {
  graphDraftState.value = loadCharacterGraphDraftState(activeProjectId.value)
}

function reloadAssetRefState() {
  assetRefState.value = loadWriterAssetRefState(activeProjectId.value)
}

// 当前选中的图谱ID
const currentGraphId = ref<string | null>(null)
const currentChapterId = ref<string | null>(null)
const currentScopeType = computed<GraphScopeType>(() => {
  if (!currentChapterId.value) return 'global'
  const matched = props.chapters.find((item) => item.id === currentChapterId.value)
  return matched?.nodeType === 'directory' ? 'volume' : 'chapter'
})
const currentScopeTitle = computed(() => {
  if (!currentChapterId.value) return '全局关系图谱'
  return props.chapters.find((item) => item.id === currentChapterId.value)?.title || currentChapterId.value
})
const currentScopeSummary = computed(() => {
  if (!currentChapterId.value) return null
  return props.chapters.find((item) => item.id === currentChapterId.value) || null
})
const currentScopeVolumeId = computed(() => {
  if (!currentChapterId.value) return ''
  if (currentScopeType.value === 'volume') return currentChapterId.value
  return currentScopeSummary.value?.parentId || ''
})
const currentVolumeChapterIds = computed(() => {
  const volumeId = currentScopeVolumeId.value
  if (!volumeId) return []
  return props.chapters
    .filter((item) => item.nodeType !== 'directory' && item.parentId === volumeId)
    .map((item) => item.id)
})
const currentEditorPlainText = computed(() =>
  extractPlainTextFromEditorContent(editorStore.editorContent || editorStore.content || ''),
)
const writerItems = computed(() => loadWriterItems(activeProjectId.value))

// 监听外部 chapterId 变化，同步内部状态
watch(
  () => props.chapterId,
  (newChapterId) => {
    if (newChapterId) {
      currentChapterId.value = newChapterId
      currentGraphId.value = hasScopeGraph(newChapterId, currentScopeType.value) ? newChapterId : null
    } else {
      currentChapterId.value = null
      currentGraphId.value = null
    }
  },
  { immediate: true },
)

// 判断是否为全局图谱模式（没有选中章节时为全局图谱）
const isGlobalGraph = computed(() => {
  return !currentChapterId.value
})

const globalRelations = computed<CharacterRelation[]>(() => writerStore.characters.relations || [])
const currentVolumeGraph = computed<VolumeGraph | null>(() => {
  if (currentScopeType.value !== 'volume' || !currentChapterId.value) return null
  return graphDraftState.value.volumeGraphs.find((graph) => graph.volumeId === currentChapterId.value) || null
})
const currentChapterGraph = computed<ChapterGraph | null>(() => {
  if (currentScopeType.value !== 'chapter' || !currentChapterId.value) return null
  return graphDraftState.value.chapterGraphs.find((graph) => graph.chapterId === currentChapterId.value) || null
})
const currentScopeGraph = computed<ChapterGraph | VolumeGraph | null>(() => {
  if (currentScopeType.value === 'volume') return currentVolumeGraph.value
  if (currentScopeType.value === 'chapter') return currentChapterGraph.value
  return null
})
const volumeDraftRelations = computed<VolumeRelation[]>(() => {
  if (currentScopeType.value !== 'volume' || !currentChapterId.value) return []
  return graphDraftState.value.volumeRelations[currentChapterId.value] || []
})
const chapterDraftRelations = computed<ChapterRelation[]>(() => {
  if (currentScopeType.value !== 'chapter' || !currentChapterId.value) return []
  return graphDraftState.value.chapterRelations[currentChapterId.value] || []
})

const hasCurrentScopeGraph = computed(() => Boolean(currentScopeGraph.value))
const shouldShowGlobalCreationGuide = computed(
  () => !currentChapterId.value && !graphDraftState.value.globalGraphInitialized && globalRelations.value.length === 0,
)
const chapterBoundAssetRefs = computed<WriterAssetRef[]>(() => {
  if (!currentChapterId.value || currentScopeType.value !== 'chapter') return []
  return assetRefState.value.chapterRefs[currentChapterId.value] || []
})
const volumeBoundAssetRefs = computed<WriterAssetRef[]>(() => {
  const volumeId = currentScopeVolumeId.value
  if (!volumeId) return []
  return assetRefState.value.volumeRefs[volumeId] || []
})
const inheritedVolumeAssetRefs = computed<WriterAssetRef[]>(() => {
  if (currentScopeType.value !== 'chapter') return []
  return volumeBoundAssetRefs.value
})
const localScopeBoundCharacterIds = computed(() => new Set(
  (currentScopeType.value === 'volume' ? volumeBoundAssetRefs.value : chapterBoundAssetRefs.value)
    .filter((asset) => asset.assetType === 'character' && asset.assetId)
    .map((asset) => asset.assetId as string),
))
const boundScopeAssetRefs = computed<WriterAssetRef[]>(() => {
  if (currentScopeType.value === 'volume') {
    return volumeBoundAssetRefs.value
  }

  const seen = new Set<string>()
  return [...chapterBoundAssetRefs.value, ...inheritedVolumeAssetRefs.value].filter((item) => {
    const key = `${item.assetType}:${item.assetId || item.assetName}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})
const chapterDetectedAssetCandidates = computed<WriterAssetCandidate[]>(() => {
  if (currentScopeType.value !== 'chapter') return []
  if (!currentChapterId.value || editorStore.currentChapterId !== currentChapterId.value) return []
  return extractWriterAssetCandidates({
    text: currentEditorPlainText.value,
    characters: writerStore.characters.list || [],
    locations: writerStore.locations.list || [],
    items: writerItems.value,
  }).filter((candidate) => {
    return !boundScopeAssetRefs.value.some(
      (asset) => asset.assetType === candidate.assetType && (asset.assetId || asset.assetName) === (candidate.assetId || candidate.assetName),
    )
  })
})
const volumeRollupAssetCandidates = computed<WriterAssetCandidate[]>(() => {
  if (currentScopeType.value !== 'volume') return []

  const boundKeys = new Set(
    volumeBoundAssetRefs.value.map((item) => `${item.assetType}:${item.assetId || item.assetName}`),
  )
  const summary = new Map<string, WriterAssetCandidate>()

  for (const chapterId of currentVolumeChapterIds.value) {
    for (const asset of assetRefState.value.chapterRefs[chapterId] || []) {
      const key = `${asset.assetType}:${asset.assetId || asset.assetName}`
      if (boundKeys.has(key) || summary.has(key)) continue
      summary.set(key, {
        key,
        assetType: asset.assetType,
        assetId: asset.assetId,
        assetName: asset.assetName,
        source: 'chapter_rollup',
        evidence: asset.evidence,
        unresolved: asset.unresolved,
      })
    }
  }

  return Array.from(summary.values()).sort((a, b) => a.assetName.localeCompare(b.assetName, 'zh-CN'))
})
const scopeAssetCandidates = computed<WriterAssetCandidate[]>(() => {
  return currentScopeType.value === 'volume' ? volumeRollupAssetCandidates.value : chapterDetectedAssetCandidates.value
})
const bindableScopeAssetCandidates = computed<WriterAssetCandidate[]>(() => (
  scopeAssetCandidates.value.filter((candidate) => !candidate.unresolved)
))
const unresolvedScopeAssetCandidates = computed<WriterAssetCandidate[]>(() => (
  scopeAssetCandidates.value.filter((candidate) => candidate.unresolved)
))
const scopeBindableCharacters = computed(() => {
  if (!currentChapterId.value) return []
  return characters.value.filter((character) => !localScopeBoundCharacterIds.value.has(character.id))
})
const chapterCandidateHint = computed(() => {
  if (!currentChapterId.value) return '当前没有可识别的候选资产。'
  if (editorStore.currentChapterId !== currentChapterId.value) {
    return '切回该章节正文后，会基于当前内容自动识别候选角色和地点。'
  }
  return '当前正文里还没有识别到可绑定的角色或地点，可继续输入 @角色 / #地点 / %物品。'
})

const currentChapterGraphTag = computed(() => {
  if (!currentScopeGraph.value) return '未创建'
  const draftRelations = currentScopeType.value === 'volume' ? volumeDraftRelations.value : chapterDraftRelations.value
  if (draftRelations.length > 0) return currentScopeType.value === 'volume' ? '卷已扩展' : '章节已扩展'
  if (currentScopeGraph.value.parentGraphId === 'global') return '继承全局'
  return '空图谱'
})

const currentChapterGraphTagType = computed<'info' | 'success' | 'warning'>(() => {
  if (!currentScopeGraph.value) return 'warning'
  const draftRelations = currentScopeType.value === 'volume' ? volumeDraftRelations.value : chapterDraftRelations.value
  if (draftRelations.length > 0) return 'success'
  if (currentScopeGraph.value.parentGraphId === 'global') return 'info'
  return 'warning'
})

const getChapterInfo = (chapterId: string) => {
  return {
    volume: '',
    chapter: currentChapterGraph.value?.chapterTitle || chapterId || '未选择章节',
  }
}

function hasChapterGraph(chapterId: string) {
  return graphDraftState.value.chapterGraphs.some((graph) => graph.chapterId === chapterId)
}

function hasVolumeGraph(volumeId: string) {
  return graphDraftState.value.volumeGraphs.some((graph) => graph.volumeId === volumeId)
}

function hasScopeGraph(scopeId: string, scopeType: GraphScopeType) {
  if (scopeType === 'volume') return hasVolumeGraph(scopeId)
  if (scopeType === 'chapter') return hasChapterGraph(scopeId)
  return graphDraftState.value.globalGraphInitialized
}

const handleCreateVolumeGraph = (mode: 'empty' | 'inherit') => {
  const volumeId = currentChapterId.value
  const projectId = activeProjectId.value
  if (!volumeId || !projectId) return

  graphDraftState.value = createVolumeGraphDraft({
    projectId,
    volumeId,
    volumeTitle: currentScopeTitle.value,
    parentGraphId: mode === 'inherit' ? 'global' : undefined,
  })
  currentGraphId.value = volumeId
  ElMessage.success(mode === 'empty' ? '已创建卷级空白图谱' : '已创建继承全局的卷级图谱')
}

const handleCreateChapterGraph = (mode: 'empty' | 'inherit') => {
  const chapterId = currentChapterId.value
  const projectId = activeProjectId.value
  if (!chapterId || !projectId) return

  graphDraftState.value = createChapterGraphDraft({
    projectId,
    chapterId,
    chapterTitle: getChapterInfo(chapterId)?.chapter || chapterId,
    parentGraphId: mode === 'inherit' ? 'global' : undefined,
  })
  currentGraphId.value = chapterId
  ElMessage.success(mode === 'empty' ? '已创建章节空白图谱' : '已创建继承全局的章节图谱')
}

const handleCreateGlobalGraph = (mode: 'empty' | 'inherit') => {
  const projectId = activeProjectId.value
  if (!projectId) return

  graphDraftState.value = setGlobalGraphInitialized(projectId, true)
  ElMessage.success(mode === 'empty' ? '已创建空白全局关系图谱' : '已启用全局关系图谱')
}

const showInheritDialog = () => {
  if (!currentChapterId.value || currentScopeType.value === 'global') {
    ElMessage.info('全局图谱没有可继承来源，请先创建章节图谱后再扩展继承链。')
    return
  }

  if (currentScopeType.value === 'volume') {
    handleCreateVolumeGraph('inherit')
    return
  }

  handleCreateChapterGraph('inherit')
}

const handleImportFromCharacters = async () => {
  const projectId = activeProjectId.value
  if (!projectId) {
    ElMessage.warning('请先选择项目')
    return
  }

  try {
    await writerStore.loadCharacters(projectId)
    await writerStore.loadCharacterRelations(projectId)
    const charList = writerStore.characters.list || []

    if (charList.length === 0) {
      ElMessage.warning('当前项目没有角色卡，请先创建角色')
      return
    }

    graphDraftState.value = setGlobalGraphInitialized(projectId, true)

    if (currentChapterId.value && currentScopeType.value === 'chapter' && !hasChapterGraph(currentChapterId.value)) {
      graphDraftState.value = createChapterGraphDraft({
        projectId,
        chapterId: currentChapterId.value,
        chapterTitle: getChapterInfo(currentChapterId.value)?.chapter || currentChapterId.value,
        parentGraphId: globalRelations.value.length > 0 ? 'global' : undefined,
      })
    }

    if (currentChapterId.value && currentScopeType.value === 'volume' && !hasVolumeGraph(currentChapterId.value)) {
      graphDraftState.value = createVolumeGraphDraft({
        projectId,
        volumeId: currentChapterId.value,
        volumeTitle: currentScopeTitle.value,
        parentGraphId: globalRelations.value.length > 0 ? 'global' : undefined,
      })
    }

    const importedCount = globalRelations.value.length
    ElMessage.success(
      importedCount > 0
        ? `已载入 ${charList.length} 个角色与 ${importedCount} 条现有关系`
        : `已载入 ${charList.length} 个角色节点，可继续在图谱中创建关系`,
    )
  } catch (error) {
    ElMessage.error('引入失败：' + (error as Error).message)
  }
}

const characters = computed(() => {
  return writerStore.characters.list || []
})

const relations = computed<VisibleRelation[]>(() => {
  if (isGlobalGraph.value) {
    return globalRelations.value
  }

  if (!currentChapterId.value || !currentScopeGraph.value) {
    return []
  }

  const localRelations = currentScopeType.value === 'volume' ? volumeDraftRelations.value : chapterDraftRelations.value
  const inherited = currentScopeGraph.value.parentGraphId === 'global'
    ? globalRelations.value.map((relation) => ({ ...relation, isInherited: true }))
    : []
  const local = localRelations.map((relation) => ({ ...relation, isInherited: false }))

  return [...inherited, ...local]
})

const isGlobalGraphCreatedEmpty = computed(
  () =>
    !currentChapterId.value &&
    graphDraftState.value.globalGraphInitialized &&
    graphNodes.value.length === 0 &&
    graphLinks.value.length === 0,
)

const isCurrentChapterGraphEmpty = computed(
  () => hasCurrentScopeGraph.value && graphNodes.value.length === 0 && graphLinks.value.length === 0,
)

const strongRelationsCount = computed(
  () => (relations.value || []).filter((relation) => relation.strength >= 70).length,
)
const graphStatusChips = computed(() => {
  const chips = [
    `角色 ${characters.value?.length || 0}`,
    `关系 ${relations.value?.length || 0}`,
    `强关系 ${strongRelationsCount.value}`,
  ]
  if (!isGlobalGraph.value) {
    chips.push(`绑定 ${boundScopeAssetRefs.value.length}`)
    chips.push(`候选 ${scopeAssetCandidates.value.length}`)
  }
  return chips
})

// 转换角色数据为图谱节点
const graphNodes = computed<GraphNode[]>(() => {
  if (isGlobalGraph.value) {
    return characters.value.map((character) => ({
      id: character.id,
      name: character.name,
      importance: character.traits?.length || 0,
      }))
  }

  const chapterCharIds = new Set([
    ...(currentScopeType.value === 'volume' ? volumeDraftRelations.value : chapterDraftRelations.value).map(
      (relation) => relation.fromId,
    ),
    ...(currentScopeType.value === 'volume' ? volumeDraftRelations.value : chapterDraftRelations.value).map(
      (relation) => relation.toId,
    ),
  ])
  const inheritedCharIds =
    currentScopeGraph.value?.parentGraphId === 'global'
      ? new Set(globalRelations.value.flatMap((relation) => [relation.fromId, relation.toId]))
      : new Set<string>()
  const localBoundCharIds = new Set(
    (currentScopeType.value === 'volume' ? volumeBoundAssetRefs.value : chapterBoundAssetRefs.value)
      .filter((asset) => asset.assetType === 'character' && asset.assetId)
      .map((asset) => asset.assetId as string),
  )
  const inheritedBoundCharIds = new Set(
    inheritedVolumeAssetRefs.value
      .filter((asset) => asset.assetType === 'character' && asset.assetId)
      .map((asset) => asset.assetId as string),
  )
  const visibleCharIds = new Set([...chapterCharIds, ...inheritedCharIds, ...localBoundCharIds, ...inheritedBoundCharIds])

  return characters.value
    .filter((character) => visibleCharIds.has(character.id))
    .map((character) => ({
      id: character.id,
      name: character.name,
      importance: character.traits?.length || 0,
      isInherited:
        !chapterCharIds.has(character.id) &&
        !localBoundCharIds.has(character.id) &&
        (inheritedCharIds.has(character.id) || inheritedBoundCharIds.has(character.id)),
    }))
})

// 转换关系数据为图谱链接
const graphLinks = computed<GraphLink[]>(() => {
  return relations.value.map((relation: any) => ({
    id: relation.id,
    source: relation.fromId,
    target: relation.toId,
    type: typeof relation.type === 'string' ? relation.type : relation.type,
    strength: relation.strength,
    isInherited: relation.isInherited || false,
  }))
})

onMounted(async () => {
  await handleRefresh()
  reloadGraphDraftState()
  reloadAssetRefState()
})

async function handleRefresh() {
  const projectId = activeProjectId.value
  if (projectId) {
    await writerStore.loadCharacters(projectId)
    await writerStore.loadCharacterRelations(projectId)
    await writerStore.loadLocations(projectId)
    if (writerStore.characters.relations.length > 0) {
      graphDraftState.value = setGlobalGraphInitialized(projectId, true)
    } else {
      reloadGraphDraftState()
    }
  }
}

watch(
  () => activeProjectId.value,
  async (projectId, previousProjectId) => {
    reloadGraphDraftState()
    reloadAssetRefState()

    if (!projectId || projectId === previousProjectId) return
    await handleRefresh()
  },
  { immediate: true },
)

watch(
  graphStatusChips,
  (chips) => {
    emit('status-change', chips)
  },
  { immediate: true },
)

const formatAssetType = (type: WriterAssetCandidate['assetType']) => {
  if (type === 'character') return '角色'
  if (type === 'location') return '地点'
  return '物品'
}

const formatAssetSource = (source: WriterAssetCandidate['source']) => {
  if (source === 'mention') return '关键词'
  if (source === 'alias') return '别名命中'
  if (source === 'name') return '正文命中'
  if (source === 'chapter_rollup') return '章节汇总'
  return '手动'
}

const ensureScopeGraphForBinding = () => {
  const projectId = activeProjectId.value
  const scopeId = currentChapterId.value
  if (!projectId || !scopeId || currentScopeGraph.value) return

  if (currentScopeType.value === 'volume') {
    graphDraftState.value = createVolumeGraphDraft({
      projectId,
      volumeId: scopeId,
      volumeTitle: currentScopeTitle.value,
    })
    currentGraphId.value = scopeId
    return
  }

  graphDraftState.value = createChapterGraphDraft({
    projectId,
    chapterId: scopeId,
    chapterTitle: getChapterInfo(scopeId)?.chapter || scopeId,
  })
  currentGraphId.value = scopeId
}

const bindAssetCandidate = (candidate: WriterAssetCandidate) => {
  const projectId = activeProjectId.value
  const scopeId = currentChapterId.value
  if (!projectId || !scopeId) return false
  if (candidate.unresolved) {
    ElMessage.warning('该资产还未建档，暂时无法绑定到图谱')
    return false
  }

  ensureScopeGraphForBinding()

  assetRefState.value = upsertScopeAssetRef({
    projectId,
    scopeType: currentScopeType.value === 'volume' ? 'volume' : 'chapter',
    scopeId,
    assetType: candidate.assetType,
    assetId: candidate.assetId,
    assetName: candidate.assetName,
    source: candidate.source,
    evidence: candidate.evidence,
    unresolved: candidate.unresolved,
  })
  showBoundAssetsPanel.value = true
  return true
}

const handleBindAssetCandidate = (candidate: WriterAssetCandidate) => {
  if (!bindAssetCandidate(candidate)) return
  ElMessage.success(`已绑定${formatAssetType(candidate.assetType)}：${candidate.assetName}`)
}

const handleBindExistingCharactersToScope = () => {
  const projectId = activeProjectId.value
  const scopeId = currentChapterId.value
  if (!projectId || !scopeId) return
  const bindableCharacters = [...scopeBindableCharacters.value]
  if (bindableCharacters.length === 0) {
    ElMessage.info('当前没有可继续绑定的角色卡')
    return
  }

  ensureScopeGraphForBinding()

  for (const character of bindableCharacters) {
    assetRefState.value = upsertScopeAssetRef({
      projectId,
      scopeType: currentScopeType.value === 'volume' ? 'volume' : 'chapter',
      scopeId,
      assetType: 'character',
      assetId: character.id,
      assetName: character.name,
      source: 'manual',
    })
  }

  showBoundAssetsPanel.value = true
  ElMessage.success(`已绑定 ${bindableCharacters.length} 个角色到当前图谱`)
}

const handleBindAllAssetCandidates = async () => {
  if (bindingAllCandidates.value || bindableScopeAssetCandidates.value.length === 0) return

  bindingAllCandidates.value = true
  try {
    let boundCount = 0
    for (const candidate of bindableScopeAssetCandidates.value) {
      if (bindAssetCandidate(candidate)) {
        boundCount += 1
      }
    }

    if (boundCount > 0) {
      ElMessage.success(`已批量绑定 ${boundCount} 个候选资产`)
    }
  } finally {
    bindingAllCandidates.value = false
  }
}

const handleCreateAndBindCandidate = async (candidate: WriterAssetCandidate) => {
  const projectId = activeProjectId.value
  const scopeId = currentChapterId.value
  if (!projectId || !scopeId) return

  try {
    const copyLabel =
      candidate.assetType === 'character'
        ? '角色'
        : candidate.assetType === 'location'
          ? '地点'
          : '物品'
    const summaryResult = await messageBox.prompt(
      `为${copyLabel}「${candidate.assetName}」补充一句简介（可选）`,
      `建档并绑定${copyLabel}`,
    )
    const summary = String(summaryResult.value || '').trim()

    let createdAssetId = ''
    let createdAssetName = candidate.assetName

    if (candidate.assetType === 'character') {
      const { createCharacter } = await import('..')
      const createdCharacter = await createCharacter(projectId, {
        projectId,
        name: candidate.assetName,
        summary,
      }) as any
      const characterPayload = createdCharacter?.data || createdCharacter
      createdAssetId = characterPayload?.id || ''
      createdAssetName = characterPayload?.name || candidate.assetName
      await writerStore.loadCharacters(projectId)
    } else if (candidate.assetType === 'location') {
      const createdLocation = await locationApi.create(projectId, {
        projectId,
        name: candidate.assetName,
        description: summary,
      }) as any
      const locationPayload = createdLocation?.data || createdLocation
      createdAssetId = locationPayload?.id || ''
      createdAssetName = locationPayload?.name || candidate.assetName
      await writerStore.loadLocations(projectId)
    } else {
      const nextItems = upsertWriterItem(projectId, {
        name: candidate.assetName,
        summary,
      })
      const createdItem = nextItems.find((item) => item.name === candidate.assetName)
      createdAssetId = createdItem?.id || ''
      createdAssetName = createdItem?.name || candidate.assetName
    }

    if (!createdAssetId && candidate.assetType !== 'item') {
      ElMessage.error(`${copyLabel}建档失败，请重试`)
      return
    }

    ensureScopeGraphForBinding()

    assetRefState.value = upsertScopeAssetRef({
      projectId,
      scopeType: currentScopeType.value === 'volume' ? 'volume' : 'chapter',
      scopeId,
      assetType: candidate.assetType,
      assetId: createdAssetId || undefined,
      assetName: createdAssetName,
      source: 'manual',
      evidence: candidate.evidence,
      unresolved: false,
    })
    showBoundAssetsPanel.value = true
    ElMessage.success(`已建档并绑定${copyLabel}：${createdAssetName}`)
  } catch {
    return
  }
}

const handleRemoveBoundAsset = (asset: WriterAssetRef) => {
  const projectId = activeProjectId.value
  if (!projectId) return
  assetRefState.value = removeScopeAssetRef(projectId, asset.scopeType, asset.scopeId, asset.id)
  ElMessage.success(`已移除${asset.assetName}`)
}

const openCreateCharacterDialog = () => {
  isEdit.value = false
  selectedCharacter.value = null
  dialogVisible.value = true
  characterForm.value = {
    name: '',
    alias: [],
    summary: '',
    traits: [],
    background: '',
    personalityPrompt: '',
    speechPattern: '',
    currentState: '',
  }
  showAliasInput.value = false
  showTraitInput.value = false
  newAlias.value = ''
  newTrait.value = ''
}

const handleEditCharacter = (character: Character) => {
  isEdit.value = true
  selectedCharacter.value = character
  dialogVisible.value = true
  characterForm.value = {
    name: character.name,
    alias: character.alias || [],
    summary: character.summary || '',
    traits: character.traits || [],
    background: character.background || '',
    personalityPrompt: character.personalityPrompt || '',
    speechPattern: character.speechPattern || '',
    currentState: character.currentState || '',
  }
}

const handleAliasInputConfirm = () => {
  if (newAlias.value && !characterForm.value.alias.includes(newAlias.value)) {
    characterForm.value.alias.push(newAlias.value)
  }
  showAliasInput.value = false
  newAlias.value = ''
}

const handleTraitInputConfirm = () => {
  if (newTrait.value && !characterForm.value.traits.includes(newTrait.value)) {
    characterForm.value.traits.push(newTrait.value)
  }
  showTraitInput.value = false
  newTrait.value = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    // 使用 projectStore.currentProjectId，与 handleRefresh 保持一致
    const projectId = projectStore.currentProjectId
    if (!projectId) {
      message.warning('请先选择项目')
      return
    }

    submitting.value = true
    try {
      if (isEdit.value && selectedCharacter.value) {
        const { updateCharacter } = await import('..')
        await updateCharacter(selectedCharacter.value.id, projectId, characterForm.value)
      } else {
        const { createCharacter } = await import('..')
        const createData: CreateCharacterRequest = {
          projectId,
          name: characterForm.value.name,
          alias: characterForm.value.alias,
          summary: characterForm.value.summary,
          traits: characterForm.value.traits,
          background: characterForm.value.background,
          personalityPrompt: characterForm.value.personalityPrompt,
          speechPattern: characterForm.value.speechPattern,
        }
        const createdResult = await createCharacter(projectId, createData)
        const createdCharacter = ((createdResult as any)?.data || createdResult) as unknown as Character
        if (currentChapterId.value) {
          ensureScopeGraphForBinding()
          assetRefState.value = upsertScopeAssetRef({
            projectId,
            scopeType: currentScopeType.value === 'volume' ? 'volume' : 'chapter',
            scopeId: currentChapterId.value,
            assetType: 'character',
            assetId: createdCharacter.id,
            assetName: createdCharacter.name,
            source: 'manual',
          })
        }
      }

      await handleRefresh()
      message.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleManageRelations = (character: Character) => {
  // 设置选中的角色
  selectedCharacter.value = character
  // 打开关系管理对话框
  relationForm.value = {
    fromId: character.id,
    toId: '',
    type: '' as RelationType,
    strength: 50,
    notes: '',
  }
  relationDialogVisible.value = true
}

// 获取可选的目标角色列表（排除自己和已有关系的角色）
const availableTargetCharacters = computed(() => {
  if (!selectedCharacter.value) return []
  const existingRelationIds = new Set(
    getCharacterRelations(selectedCharacter.value.id).map((r) =>
      r.fromId === selectedCharacter.value!.id ? r.toId : r.fromId,
    ),
  )
  return characters.value.filter(
    (c) => c.id !== selectedCharacter.value!.id && !existingRelationIds.has(c.id),
  )
})

// 提交创建关系
const handleCreateRelation = async () => {
  if (!relationFormRef.value) return

  await relationFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    const projectId = activeProjectId.value
    if (!projectId) {
      message.warning('请先选择项目')
      return
    }

    relationSubmitting.value = true
      try {
        if (currentChapterId.value && currentScopeGraph.value) {
          if (currentScopeType.value === 'volume' && currentVolumeGraph.value) {
            graphDraftState.value = appendVolumeRelationDraft({
              projectId,
              volumeId: currentChapterId.value,
              graphId: currentVolumeGraph.value.id,
              fromId: relationForm.value.fromId,
              toId: relationForm.value.toId,
              type: relationForm.value.type,
              strength: relationForm.value.strength,
              notes: relationForm.value.notes,
            })
          } else if (currentChapterGraph.value) {
            graphDraftState.value = appendChapterRelationDraft({
              projectId,
              chapterId: currentChapterId.value,
              graphId: currentChapterGraph.value.id,
              fromId: relationForm.value.fromId,
              toId: relationForm.value.toId,
              type: relationForm.value.type,
              strength: relationForm.value.strength,
              notes: relationForm.value.notes,
            })
          }
        } else {
          await writerStore.createCharacterRelation(projectId, {
            fromId: relationForm.value.fromId,
          toId: relationForm.value.toId,
          type: relationForm.value.type,
          strength: relationForm.value.strength,
          notes: relationForm.value.notes,
        })
        graphDraftState.value = setGlobalGraphInitialized(projectId, true)
        await writerStore.loadCharacterRelations(projectId)
      }

      message.success('关系创建成功')
      relationDialogVisible.value = false
    } catch (error: any) {
      message.error(error.message || '创建失败')
    } finally {
      relationSubmitting.value = false
    }
  })
}

// 删除关系
const handleDeleteRelation = async (relation: VisibleRelation) => {
  const projectId = activeProjectId.value
  if (!projectId) return

  try {
    if ((relation as CharacterRelation & { isInherited?: boolean }).isInherited && currentChapterId.value) {
      message.warning('继承自全局的关系需要在全局图谱中删除')
      return
    }

    if (currentChapterId.value && currentScopeGraph.value) {
      if (currentScopeType.value === 'volume') {
        graphDraftState.value = deleteVolumeRelationDraft(projectId, currentChapterId.value, relation.id)
      } else {
        graphDraftState.value = deleteChapterRelationDraft(projectId, currentChapterId.value, relation.id)
      }
    } else {
      await writerStore.deleteCharacterRelation(relation.id, projectId)
      await writerStore.loadCharacterRelations(projectId)
    }
    message.success('关系已删除')
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

const getCharacterRelations = (characterId: string): VisibleRelation[] => {
  return (relations.value || []).filter((r) => r.fromId === characterId || r.toId === characterId)
}

const getCharacterName = (characterId: string): string => {
  const character = characters.value.find((c) => c.id === characterId)
  return character?.name || '未知'
}

const getRelationTagType = (type: RelationType | string): 'success' | 'info' | 'warning' | 'danger' => {
  const typeMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    朋友: 'success',
    家庭: 'info',
    恋人: 'danger',
    盟友: 'success',
    敌人: 'warning',
    其他: 'info',
  }
  return typeMap[type] || 'info'
}

// 处理图谱连线创建事件
const handleGraphCreateLink = (fromId: string, toId: string) => {
  // 检查是否已存在关系
  const existingRelation = relations.value.find(
    (r) => (r.fromId === fromId && r.toId === toId) || (r.fromId === toId && r.toId === fromId),
  )
  if (existingRelation) {
    message.warning('这两个角色之间已存在关系')
    return
  }

  // 打开关系创建对话框
  const fromCharacter = characters.value.find((c) => c.id === fromId)
  const toCharacter = characters.value.find((c) => c.id === toId)

  if (fromCharacter && toCharacter) {
    selectedCharacter.value = fromCharacter
    relationForm.value = {
      fromId: fromId,
      toId: toId,
      type: '' as RelationType,
      strength: 50,
      notes: '',
    }
    relationDialogVisible.value = true
  }
}

// 处理节点点击事件
const handleNodeClick = (nodeId: string) => {
  const character = characters.value.find((c) => c.id === nodeId)
  if (character) {
    selectedCharacter.value = character
  }
}

// 处理节点删除事件
const handleDeleteNode = (nodeId: string) => {
  if (currentChapterId.value && currentScopeGraph.value && activeProjectId.value) {
    if (currentScopeType.value === 'volume') {
      graphDraftState.value = deleteVolumeRelationsByNode(activeProjectId.value, currentChapterId.value, nodeId)
      ElMessage.success('该角色的卷级特有关联已移除')
      return
    }

    graphDraftState.value = deleteChapterRelationsByNode(activeProjectId.value, currentChapterId.value, nodeId)
    ElMessage.success('该角色的章节特有关联已移除')
    return
  }

  ElMessage.info('全局图谱中的角色节点来自角色卡，请在角色或关系管理中调整')
}

// 在画布指定位置添加节点（右键菜单触发）
const handleAddNodeAt = (x: number, y: number) => {
  void x
  void y
  openCreateCharacterDialog()
}

</script>

<style scoped lang="scss">
.character-graph-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
}

// 主内容区样式
.graph-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

// 图谱画布
.graph-canvas {
  flex: 1;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

// 图谱统计
.graph-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 10px;
}

.asset-binding-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.asset-binding-card {
  border: 1px solid #e6ebf5;
  border-radius: 12px;
  padding: 8px 10px;
  background: rgba(251, 253, 255, 0.96);
  box-shadow: none;
}

.asset-binding-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  h4 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #28324f;
  }
}

.asset-binding-card__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
}

.asset-binding-card__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;

  span {
    font-size: 11px;
    color: #62708f;
    background: #f1f4fa;
    border-radius: 999px;
    padding: 3px 8px;
    line-height: 1.4;
  }
}

.asset-binding-chip-list {
  display: grid;
  gap: 6px;
  margin-top: 8px;
  max-height: 128px;
  overflow: auto;
}

.asset-binding-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-radius: 10px;
  padding: 7px 9px;
  border: 1px solid #e3e8f3;
  background: rgba(255, 255, 255, 0.92);
}

.asset-binding-chip.is-character {
  border-left: 3px solid #3f6fe8;
}

.asset-binding-chip.is-location {
  border-left: 3px solid #11a683;
}

.asset-binding-chip.is-item {
  border-left: 3px solid #cf7a28;
}

.asset-binding-chip__meta {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;

  strong {
    color: #23304d;
    font-size: 13px;
  }
}

.asset-binding-chip__type,
.asset-binding-chip__source {
  font-size: 11px;
  line-height: 1;
  color: #7280a0;
  background: #eff3fb;
  border-radius: 999px;
  padding: 4px 7px;
}

.asset-binding-chip__status {
  font-size: 11px;
  line-height: 1;
  color: #1f6a43;
  background: #e8f7ef;
  border-radius: 999px;
  padding: 4px 7px;
}

.asset-binding-chip__status.is-unresolved {
  color: #9a5a15;
  background: #fff4df;
}

.asset-binding-chip__evidence {
  width: 100%;
  margin: 0;
  font-size: 11px;
  color: #60708f;
}

.asset-binding-empty {
  margin-top: 8px;
  border-radius: 10px;
  padding: 10px;
  border: 1px dashed #d7deed;
  background: #f8faff;
  color: #6c7896;
  font-size: 11px;
  line-height: 1.5;
}

// 图谱可视化区域
.graph-visualization {
  flex: 1;
  min-height: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background: #ffffff;
  position: relative;
}

// 章节图谱头部
.chapter-graph-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;

  .chapter-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
}

// 全局图谱容器
.global-graph-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

// 全局图谱头部
.global-graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 1px solid #e5e7eb;

  .graph-title {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  :deep(.el-tag) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    color: #ffffff;
  }
}

// 创建图谱引导
.graph-creation-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;

  .guide-content {
    text-align: center;
    padding: 40px;

    .guide-icon {
      font-size: 64px;
      color: #c0c4cc;
      margin-bottom: 16px;
    }

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    p {
      margin: 0 0 24px 0;
      font-size: 14px;
      color: #909399;
    }

    .guide-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
  }
}

// 已创建但为空的图谱状态
.graph-empty-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  padding: 40px 32px;
  text-align: center;
  background:
    radial-gradient(circle at top, rgba(102, 126, 234, 0.08), transparent 35%),
    linear-gradient(180deg, #fbfcff 0%, #f6f8fc 100%);
  color: #909399;

  .empty-icon {
    font-size: 52px;
    margin-bottom: 16px;
    color: #8da2ff;
  }

  h4 {
    margin: 0 0 10px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    max-width: 420px;
  }

  .empty-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 22px;
  }
}

.detail-sidebar {
  width: 400px;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.sidebar-content {
  flex: 1;
  padding: 16px;
}

.info-section {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.traits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.background-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.relations-list {
  .relation-item {
    padding: 12px;
    background: #f9fafb;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .relation-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .relation-target {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.sidebar-actions {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;

  .el-button {
    flex: 1;
  }
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
@media (max-width: 768px) {
  .graph-stats {
    grid-template-columns: 1fr;
  }

  .asset-binding-strip {
    grid-template-columns: 1fr;
  }

  .characters-grid {
    grid-template-columns: 1fr;
  }

  .detail-sidebar {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .character-graph-view {
    background: #0d0d0d;
  }

  .graph-header {
    background: #1a1a1a;
    border-bottom-color: #2d2d2d;
  }

  .header-title {
    color: #e5e5e5;
  }

  .detail-sidebar {
    background: #1a1a1a;
    border-left-color: #2d2d2d;
  }

  .sidebar-header {
    border-bottom-color: #2d2d2d;

    h3 {
      color: #e5e5e5;
    }
  }

  .info-section h4 {
    color: #e5e5e5;
  }

  .background-text {
    color: #c0c4cc;
  }

  .relations-list .relation-item {
    background: #0d0d0d;
  }

  .sidebar-actions {
    border-top-color: #2d2d2d;
  }

  .character-edit-card {
    background: #1a1a1a;
    border-color: #2d2d2d;
  }

  .card-header {
    border-bottom-color: #2d2d2d;

    .header-title {
      color: #e5e5e5;
    }
  }

  .card-footer {
    border-top-color: #2d2d2d;
  }

  .character-form {
    :deep(.el-form-item) {
      border-bottom-color: #2d2d2d;
    }

    :deep(.el-form-item__label) {
      color: #e5e5e5;
    }

    :deep(.el-input__wrapper) {
      border-color: #4b5563;
      background-color: #1f2937;
      height: 32px;

      &:hover {
        border-color: #6b7280;
      }

      &.is-focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }

    :deep(.el-textarea__inner) {
      border-color: #4b5563;
      background-color: #1f2937;
      color: #e5e5e5;

      &:hover {
        border-color: #6b7280;
      }

      &:focus {
        border-color: #409eff;
      }
    }

    :deep(.el-input--small .el-input__wrapper) {
      border-color: #4b5563;
      background-color: #1f2937;

      &:hover {
        border-color: #6b7280;
      }

      &.is-focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }

    :deep(.el-form-item__error) {
      color: #f87171;
    }
  }
}

/* 角色编辑卡片样式 */
.character-edit-card-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.character-edit-card {
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-icon {
      font-size: 24px;
      color: #67c23a;
    }

    .header-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.character-form {
  width: 100%;
  margin: 0;

  :deep(.el-form) {
    width: 100%;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 16px;
    width: 100%;
    display: flex;
    align-items: flex-start;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #303133;
    padding-right: 16px;
    min-width: 100px;
    flex-shrink: 0;
  }

  :deep(.el-form-item__content) {
    flex: 1;
    min-width: 0;
  }

  :deep(.el-input),
  :deep(.el-textarea) {
    width: 100%;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    box-shadow: none;
    transition: border-color 0.2s;

    &:hover {
      border-color: #c0c4cc;
    }
  }

  :deep(.el-input__wrapper) {
    background-color: #ffffff;
    height: 32px;

    &.is-focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
    }
  }

  :deep(.el-textarea__inner) {
    padding: 8px 12px;
    background-color: #ffffff;

    &:focus {
      border-color: #409eff;
      outline: none;
    }
  }

  :deep(.el-input--small .el-input__wrapper) {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #ffffff;

    &:hover {
      border-color: #c0c4cc;
    }

    &.is-focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
    }
  }

  :deep(.el-form-item__error) {
    margin-top: 6px;
    font-size: 12px;
    color: #f56c6c;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    width: 100%;

    :deep(.el-input--small) {
      width: auto;
      min-width: 120px;
    }
  }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 动画效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 关系管理对话框样式 */
.relation-dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.relation-dialog-card {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.relation-dialog-content {
  padding: 0 8px;
}

.existing-relations h4,
.create-relation-form h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.relations-list-dialog {
  max-height: 200px;
  overflow-y: auto;
}

.relation-item-dialog {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 8px;
}

.relation-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.relation-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 150px;
}

.strength-value {
  font-size: 12px;
  color: #909399;
  min-width: 24px;
}

.strength-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.strength-display {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
  min-width: 30px;
}
</style>
