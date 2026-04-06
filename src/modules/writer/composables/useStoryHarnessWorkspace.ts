import { computed, type ComputedRef } from 'vue'
import type { Document } from '@/modules/writer/types/document'
import {
  useStoryHarnessStore,
  type StoryHarnessCharacterSummary,
  type StoryHarnessChangeRequestPreview,
  type StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { buildStoryHarnessSuggestions } from '@/modules/writer/utils/v3/storyHarnessSuggestions'
import type { OutlineNode } from '@/types/writer'

type OutlineScopeNode = OutlineNode & {
  characters?: string[]
  children?: OutlineScopeNode[]
}

export interface UseStoryHarnessWorkspaceOptions {
  projectId: ComputedRef<string>
  displayChapterId: ComputedRef<string>
  displayChapterTitle: ComputedRef<string>
  currentChapterPlainText: ComputedRef<string>
  availableDocMap: ComputedRef<Map<string, Document>>
}

export interface UseStoryHarnessWorkspaceReturn {
  currentScopeLabel: ComputedRef<string>
  activeScopeCharacters: ComputedRef<StoryHarnessCharacterSummary[]>
  activeScopeRelations: ComputedRef<StoryHarnessRelationSummary[]>
  storyHarnessLiveChangeRequests: ComputedRef<StoryHarnessChangeRequestPreview[]>
  storyHarnessChangeRequests: ComputedRef<StoryHarnessChangeRequestPreview[]>
  persistCurrentLiveChangeRequests: () => Promise<void>
}

const buildStoryHarnessChangeRequestSignature = (
  changeRequest: Pick<StoryHarnessChangeRequestPreview, 'type' | 'title' | 'summary'>,
) => `${changeRequest.type}::${changeRequest.title}::${changeRequest.summary}`

const getChangeRequestPriority = (changeRequest: StoryHarnessChangeRequestPreview) => {
  const sourcePriority = changeRequest.source === 'save_batch' ? 0 : 1
  const directivePriority =
    changeRequest.title.includes('正文指令建议') || changeRequest.evidence?.trim().startsWith('// @') ? 0 : 1
  const severityPriority = changeRequest.severity === 'focus' ? 0 : 1
  const typePriority =
    changeRequest.type === 'state' ? 0 : changeRequest.type === 'relation' ? 1 : 2
  const recencyPriority = -(changeRequest.sourceTimestamp ?? 0)

  return [sourcePriority, directivePriority, severityPriority, typePriority, recencyPriority]
}

const sortStoryHarnessChangeRequests = (
  changeRequests: StoryHarnessChangeRequestPreview[],
): StoryHarnessChangeRequestPreview[] =>
  [...changeRequests].sort((left, right) => {
    const leftPriority = getChangeRequestPriority(left)
    const rightPriority = getChangeRequestPriority(right)

    for (let index = 0; index < leftPriority.length; index += 1) {
      const delta = leftPriority[index] - rightPriority[index]
      if (delta !== 0) {
        return delta
      }
    }

    return left.title.localeCompare(right.title, 'zh-CN')
  })

const findOutlineNodeByDocumentId = (
  nodes: OutlineScopeNode[],
  documentId: string,
): OutlineScopeNode | null => {
  for (const node of nodes) {
    if (node.documentId === documentId || node.id === documentId) {
      return node
    }

    if (node.children?.length) {
      const matchedChild = findOutlineNodeByDocumentId(node.children, documentId)
      if (matchedChild) {
        return matchedChild
      }
    }
  }

  return null
}

export function useStoryHarnessWorkspace(
  options: UseStoryHarnessWorkspaceOptions,
): UseStoryHarnessWorkspaceReturn {
  const { projectId, displayChapterId, displayChapterTitle, currentChapterPlainText, availableDocMap } = options
  const writerStore = useWriterStore()
  const storyHarnessStore = useStoryHarnessStore()

  const currentScopeNode = computed<OutlineScopeNode | null>(() => {
    const currentNode = writerStore.outline.currentNode as OutlineScopeNode | null
    const chapterId = displayChapterId.value

    if (currentNode && (!chapterId || currentNode.documentId === chapterId || currentNode.id === chapterId)) {
      return currentNode
    }

    if (!chapterId) {
      return null
    }

    return findOutlineNodeByDocumentId(writerStore.outline.tree as OutlineScopeNode[], chapterId)
  })

  const activeScopeCharacterIds = computed<string[]>(() => {
    const scopedIds = currentScopeNode.value?.characters ?? []
    const documentCharacterIds = availableDocMap.value.get(displayChapterId.value)?.characterIds ?? []
    return Array.from(new Set([...scopedIds, ...documentCharacterIds].filter(Boolean)))
  })

  const activeScopeCharacters = computed<StoryHarnessCharacterSummary[]>(() => {
    const scopedIdSet = new Set(activeScopeCharacterIds.value)
    if (scopedIdSet.size === 0) {
      return []
    }

    return writerStore.characters.list
      .filter((character) => scopedIdSet.has(character.id))
      .map((character) => ({
        id: character.id,
        name: character.name,
        traits: character.traits ?? [],
        currentState: character.currentState,
      }))
  })

  const activeScopeRelations = computed<StoryHarnessRelationSummary[]>(() => {
    const scopedIdSet = new Set(activeScopeCharacterIds.value)
    if (scopedIdSet.size < 2) {
      return []
    }

    const characterNameMap = new Map(writerStore.characters.list.map((character) => [character.id, character.name]))

    return writerStore.characters.relations
      .filter((relation) => scopedIdSet.has(relation.fromId) && scopedIdSet.has(relation.toId))
      .map((relation) => ({
        id: relation.id,
        fromName: characterNameMap.get(relation.fromId) || '未命名角色',
        toName: characterNameMap.get(relation.toId) || '未命名角色',
        type: relation.type,
        strength: relation.strength,
      }))
  })

  const currentScopeLabel = computed(() => {
    if (currentScopeNode.value?.title) {
      return currentScopeNode.value.title
    }

    if (displayChapterTitle.value) {
      return `${displayChapterTitle.value} / 当前章节`
    }

    return '未声明场景作用域'
  })

  const storyHarnessLiveChangeRequests = computed<StoryHarnessChangeRequestPreview[]>(() =>
    buildStoryHarnessSuggestions({
      chapterTitle: displayChapterTitle.value,
      content: currentChapterPlainText.value,
      activeCharacters: activeScopeCharacters.value,
      activeRelations: activeScopeRelations.value,
      allCharacters: writerStore.characters.list.map((character) => ({
        id: character.id,
        name: character.name,
      })),
    }),
  )

  const storyHarnessChangeRequests = computed<StoryHarnessChangeRequestPreview[]>(() => {
    const savedBatchChangeRequests = storyHarnessStore.savedBatchChangeRequests
    const savedBatchSignatureSet = new Set(
      savedBatchChangeRequests.map((changeRequest) =>
        buildStoryHarnessChangeRequestSignature(changeRequest),
      ),
    )

    return sortStoryHarnessChangeRequests([
      ...savedBatchChangeRequests,
      ...storyHarnessLiveChangeRequests.value.filter(
        (changeRequest) =>
          !savedBatchSignatureSet.has(buildStoryHarnessChangeRequestSignature(changeRequest)),
      ),
    ])
  })

  const persistCurrentLiveChangeRequests = async () => {
    await storyHarnessStore.persistSavedBatch(
      projectId.value,
      displayChapterId.value,
      displayChapterTitle.value,
      storyHarnessLiveChangeRequests.value,
    )
  }

  return {
    currentScopeLabel,
    activeScopeCharacters,
    activeScopeRelations,
    storyHarnessLiveChangeRequests,
    storyHarnessChangeRequests,
    persistCurrentLiveChangeRequests,
  }
}
