import { request } from '@/utils/request-adapter'

export interface RewriteToolRequest {
  projectId: string
  chapterId?: string
  originalText: string
  mode: 'polish' | 'expand' | 'shorten'
  instructions?: string
}

export interface RewriteToolResult {
  rewrittenText: string
  raw: Record<string, unknown>
}

export interface SummaryToolRequest {
  content: string
  projectId?: string
  chapterId?: string
  maxLength?: number
  summaryType?: 'brief' | 'detailed' | 'keypoints'
  includeQuotes?: boolean
}

export interface ChapterSummaryRequest {
  projectId: string
  chapterId: string
  outlineLevel?: number
}

export interface SummaryToolResult {
  summary: string
  keyPoints: string[]
  raw: Record<string, unknown>
}

export interface ReviewToolRequest {
  content: string
  projectId?: string
  chapterId?: string
}

export interface ReviewIssue {
  id?: string
  type?: string
  severity?: string
  message?: string
  suggestions?: string[]
}

export interface ReviewToolResult {
  score?: number
  issues: ReviewIssue[]
  raw: Record<string, unknown>
}

export interface SensitiveAuditResult {
  totalMatches?: number
  isSafe?: boolean
  sensitiveWords: Array<Record<string, unknown>>
  raw: Record<string, unknown>
}

export async function rewriteWithWorkbench(
  payload: RewriteToolRequest,
): Promise<RewriteToolResult> {
  const response = await request<Record<string, unknown>>({
    url: '/api/v1/ai/writing/rewrite',
    method: 'post',
    data: {
      projectId: payload.projectId,
      chapterId: payload.chapterId,
      originalText: payload.originalText,
      rewriteMode: payload.mode,
      instructions: payload.instructions,
    },
  })

  return {
    rewrittenText:
      String(
        response.rewritten_text ||
          response.polished_text ||
          response.expanded_text ||
          response.generated_text ||
          '',
      ) || '',
    raw: response,
  }
}

export async function summarizeSelection(
  payload: SummaryToolRequest,
): Promise<SummaryToolResult> {
  const response = await request<Record<string, unknown>>({
    url: '/api/v1/ai/writing/summarize',
    method: 'post',
    data: {
      content: payload.content,
      projectId: payload.projectId,
      chapterId: payload.chapterId,
      maxLength: payload.maxLength,
      summaryType: payload.summaryType || 'detailed',
      includeQuotes: payload.includeQuotes ?? false,
    },
  })

  return {
    summary: String(response.summary || ''),
    keyPoints: Array.isArray(response.keyPoints)
      ? response.keyPoints.map((item) => String(item))
      : [],
    raw: response,
  }
}

export async function summarizeChapter(
  payload: ChapterSummaryRequest,
): Promise<SummaryToolResult> {
  const response = await request<Record<string, unknown>>({
    url: '/api/v1/ai/writing/summarize-chapter',
    method: 'post',
    data: {
      projectId: payload.projectId,
      chapterId: payload.chapterId,
      outlineLevel: payload.outlineLevel ?? 3,
    },
  })

  return {
    summary: String(response.summary || ''),
    keyPoints: Array.isArray(response.keyPoints)
      ? response.keyPoints.map((item) => String(item))
      : [],
    raw: response,
  }
}

export async function proofreadContent(
  payload: ReviewToolRequest,
): Promise<ReviewToolResult> {
  const response = await request<Record<string, unknown>>({
    url: '/api/v1/ai/writing/proofread',
    method: 'post',
    data: {
      content: payload.content,
      projectId: payload.projectId,
      chapterId: payload.chapterId,
      checkTypes: ['spelling', 'grammar', 'punctuation'],
      language: 'zh-CN',
      suggestions: true,
    },
  })

  return {
    score: typeof response.score === 'number' ? response.score : undefined,
    issues: Array.isArray(response.issues) ? (response.issues as ReviewIssue[]) : [],
    raw: response,
  }
}

export async function auditSensitiveWords(
  payload: ReviewToolRequest,
): Promise<SensitiveAuditResult> {
  const response = await request<Record<string, unknown>>({
    url: '/api/v1/ai/audit/sensitive-words',
    method: 'post',
    data: {
      content: payload.content,
      projectId: payload.projectId,
      chapterId: payload.chapterId,
      category: 'all',
    },
  })

  return {
    totalMatches: typeof response.totalMatches === 'number' ? response.totalMatches : undefined,
    isSafe: typeof response.isSafe === 'boolean' ? response.isSafe : undefined,
    sensitiveWords: Array.isArray(response.sensitiveWords)
      ? (response.sensitiveWords as Array<Record<string, unknown>>)
      : [],
    raw: response,
  }
}
