import request from '@/utils/request'

/**
 * 内容审核API
 */

export interface AuditCheckResult {
  passed: boolean
  violations?: Array<{
    type: string
    content: string
    position: number
    suggestion?: string
  }>
  score?: number
}

export interface AuditResult {
  auditId: string
  targetId: string
  targetType: 'document' | 'chapter' | 'comment'
  status: 'pending' | 'passed' | 'rejected'
  violations?: Array<{
    type: string
    content: string
    severity: 'low' | 'medium' | 'high'
  }>
  reviewedAt?: string
  reason?: string
}

export interface ViolationRecord {
  violationId: string
  targetId: string
  targetType: string
  type: string
  content: string
  severity: string
  status: 'pending' | 'resolved' | 'appealed'
  createdAt: string
}

export interface AppealData {
  reason: string
  evidence?: string
}

/**
 * 实时检测内容
 */
export async function checkContent(content: string) {
  return request.post<AuditCheckResult>('/audit/check', { content })
}

/**
 * 全文审核
 */
export async function auditDocument(documentId: string, content: string) {
  return request.post<AuditResult>(`/documents/${documentId}/audit`, { content })
}

/**
 * 获取审核结果
 */
export async function getAuditResult(documentId: string, targetType = 'document') {
  return request.get<AuditResult>(`/documents/${documentId}/audit-result`, {
    params: { targetType }
  })
}

/**
 * 提交申诉
 */
export async function submitAppeal(auditId: string, data: AppealData) {
  return request.post(`/audit/${auditId}/appeal`, data)
}

/**
 * 获取违规记录
 */
export async function getViolations(userId: string) {
  return request.get<ViolationRecord[]>(`/users/${userId}/violations`)
}

/**
 * 获取违规统计
 */
export async function getViolationSummary(userId: string) {
  return request.get(`/users/${userId}/violation-summary`)
}

