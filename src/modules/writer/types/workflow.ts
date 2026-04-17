import type {
  StoryHarnessCharacterSummary,
  StoryHarnessChangeRequestPreview,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'

export type AIApplyMode =
  | 'replace_selection'
  | 'insert_after_selection'
  | 'append_paragraph'
  | 'replace_document'

export type WriterWorkflowSource =
  | 'selection'
  | 'story_harness'
  | 'ai_result'
  | 'workspace'

export type WriterWorkbenchTab = 'rewrite' | 'summary' | 'review' | 'chat'

export interface WriterWorkflowActionRequest {
  source?: WriterWorkflowSource
  action: string
  text: string
  title?: string
  instructions?: string
  from?: number
  to?: number
  applyMode?: AIApplyMode
}

export interface WriterAIActionTrigger extends WriterWorkflowActionRequest {
  id: number
  context?: WriterWorkflowContext | null
}

export interface WriterAIApplyPayload {
  action: string
  sourceText: string
  generatedText: string
  applyMode?: AIApplyMode
}

export interface WriterAIApplyFeedback {
  status: 'idle' | 'success' | 'fallback'
  title: string
  detail: string
  mode?: AIApplyMode
  updatedAt: number
}

export interface WriterWorkflowContext {
  signature: string
  projectId: string
  chapterId: string
  chapterTitle: string
  scopeLabel?: string
  activeCharacters: Array<
    Pick<StoryHarnessCharacterSummary, 'id' | 'name' | 'currentState'>
  >
  activeRelations: Array<
    Pick<StoryHarnessRelationSummary, 'id' | 'fromName' | 'toName' | 'type'>
  >
  pendingChangeRequests: Array<
    Pick<StoryHarnessChangeRequestPreview, 'id' | 'title' | 'summary' | 'type'>
  >
  pendingChangeRequestCount: number
}

export type WriterResultCandidateSource =
  | 'chat'
  | 'rewrite'
  | 'summary'
  | 'review'

export interface WriterResultCandidate {
  source: WriterResultCandidateSource
  action: string
  title: string
  summary: string
  generatedText: string
  sourceText: string
}

export interface WriterRevisionSeed {
  id: number
  text: string
  instructions?: string
  applyMode?: AIApplyMode
}

export type WriterDraftProposalKind = 'text-draft' | 'chapter-direction'
export type WriterDraftProposalStatus = 'draft' | 'selected' | 'discarded'
export type WriterDraftProposalSource =
  | 'ai-chat'
  | 'rewrite-workbench'
  | 'summary-workbench'
  | 'review-workbench'

export interface WriterDraftProposal {
  id: string
  projectId: string
  chapterId?: string
  source: WriterDraftProposalSource
  kind: WriterDraftProposalKind
  title: string
  summary: string
  content: Record<string, unknown>
  status: WriterDraftProposalStatus
  createdAt: number
  updatedAt: number
}

export function buildWriterWorkflowContextSignature(
  context: Omit<WriterWorkflowContext, 'signature'>,
): string {
  return JSON.stringify({
    projectId: context.projectId,
    chapterId: context.chapterId,
    chapterTitle: context.chapterTitle,
    scopeLabel: context.scopeLabel || '',
    characters: context.activeCharacters.map((character) => ({
      id: character.id,
      state: character.currentState || '',
    })),
    relations: context.activeRelations.map((relation) => relation.id),
    pendingChangeRequests: context.pendingChangeRequests.map((item) => item.id),
  })
}

export function buildWriterWorkflowContextPrompt(
  context: WriterWorkflowContext | null | undefined,
): string {
  if (!context) {
    return ''
  }

  const lines = [
    '当前工作流上下文：',
    context.chapterTitle
      ? `章节：${context.chapterTitle}`
      : context.chapterId
        ? `章节ID：${context.chapterId}`
        : '',
    context.scopeLabel ? `场景作用域：${context.scopeLabel}` : '',
  ]

  if (context.activeCharacters.length > 0) {
    const characterSummary = context.activeCharacters
      .slice(0, 3)
      .map((character) =>
        character.currentState?.trim()
          ? `${character.name}（${character.currentState}）`
          : character.name,
      )
      .join('；')
    lines.push(`活跃角色：${characterSummary}`)
  }

  if (context.activeRelations.length > 0) {
    const relationSummary = context.activeRelations
      .slice(0, 2)
      .map((relation) => `${relation.fromName}-${relation.type}-${relation.toName}`)
      .join('；')
    lines.push(`当前关系：${relationSummary}`)
  }

  if (context.pendingChangeRequestCount > 0) {
    const pendingSummary = context.pendingChangeRequests
      .slice(0, 3)
      .map((item) => item.title)
      .join('；')
    lines.push(
      `待处理建议：${context.pendingChangeRequestCount} 条${
        pendingSummary ? `（${pendingSummary}）` : ''
      }`,
    )
  }

  return lines.filter(Boolean).join('\n')
}

export function resolveWriterWorkflowTab(
  action: string | null | undefined,
): WriterWorkbenchTab | null {
  if (!action) {
    return null
  }

  if (['continue', 'polish', 'expand', 'rewrite'].includes(action)) {
    return 'rewrite'
  }

  if (['summary', 'summarize', 'summarize_chapter'].includes(action)) {
    return 'summary'
  }

  if (['proofread', 'review', 'audit'].includes(action)) {
    return 'review'
  }

  if (['chat', 'add_to_chat'].includes(action)) {
    return 'chat'
  }

  return null
}

export function buildWriterAIActionTrigger(
  payload: WriterWorkflowActionRequest,
  context?: WriterWorkflowContext | null,
): WriterAIActionTrigger {
  return {
    ...payload,
    id: Date.now(),
    source: payload.source ?? 'workspace',
    context: context ?? null,
  }
}
