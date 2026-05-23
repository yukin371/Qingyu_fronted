import { beforeEach, describe, expect, it } from 'vitest'
import {
  calculateProofreadContentHash,
  clearProofreadQualityGateRecordsForTests,
  getProofreadQualityGateStatus,
  saveProofreadQualityGateRecord,
} from '../proofreadQualityGate.service'

describe('proofreadQualityGate.service', () => {
  beforeEach(() => {
    clearProofreadQualityGateRecordsForTests()
  })

  it('returns missing when a chapter has no proofread record', () => {
    const status = getProofreadQualityGateStatus('project-1', 'chapter-1')

    expect(status.level).toBe('missing')
    expect(status.message).toContain('尚未完成')
  })

  it('calculates backend-compatible sha256 content hash', () => {
    expect(calculateProofreadContentHash('')).toBe(
      'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
    expect(calculateProofreadContentHash('abc')).toBe(
      'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('stores warning status when proofread has blocking errors', () => {
    saveProofreadQualityGateRecord({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      contentHash: 'sha256:test',
      score: 72,
      issues: [
        {
          id: 'issue-1',
          severity: 'error',
          message: '疑似错别字',
        },
      ],
      previewWarnings: [],
    })

    const status = getProofreadQualityGateStatus('project-1', 'chapter-1')

    expect(status.level).toBe('warning')
    expect(status.record?.errorCount).toBe(1)
    expect(status.message).toContain('必须改')
  })

  it('returns pass when only ignored issues exist', () => {
    saveProofreadQualityGateRecord({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      score: 100,
      issues: [
        {
          id: 'issue-1',
          severity: 'error',
          message: '已忽略',
          status: 'ignored',
        },
      ],
      previewWarnings: [],
    })

    const status = getProofreadQualityGateStatus('project-1', 'chapter-1')

    expect(status.level).toBe('pass')
    expect(status.record?.totalIssues).toBe(0)
  })

  it('returns warning when current content hash differs from the proofread record', () => {
    saveProofreadQualityGateRecord({
      projectId: 'project-1',
      chapterId: 'chapter-1',
      contentHash: calculateProofreadContentHash('审校时正文'),
      score: 100,
      issues: [],
      previewWarnings: [],
    })

    const status = getProofreadQualityGateStatus(
      'project-1',
      'chapter-1',
      calculateProofreadContentHash('发布前正文'),
    )

    expect(status.level).toBe('warning')
    expect(status.reason).toBe('stale')
    expect(status.message).toContain('发生变化')
  })
})
