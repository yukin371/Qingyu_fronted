import type { ReviewIssue, MobilePreviewWarning } from '@/modules/ai/api/workbench'

const STORAGE_KEY = 'qingyu:writer:proofread-quality-gates'
let memoryRecords: Record<string, ProofreadQualityGateRecord> = {}

export interface ProofreadQualityGateRecord {
  projectId: string
  chapterId: string
  contentHash?: string
  score?: number
  totalIssues: number
  errorCount: number
  warningCount: number
  suggestionCount: number
  previewWarningCount: number
  updatedAt: number
}

export interface ProofreadQualityGateStatus {
  record: ProofreadQualityGateRecord | null
  level: 'pass' | 'warning' | 'missing'
  message: string
  reason?: 'missing' | 'stale' | 'blocking_issues' | 'soft_issues' | 'pass'
}

function readRecords(): Record<string, ProofreadQualityGateRecord> {
  if (!globalThis.localStorage) {
    return memoryRecords
  }

  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY)
    if (!raw) return memoryRecords
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, ProofreadQualityGateRecord>)
      : {}
  } catch {
    return memoryRecords
  }
}

function writeRecords(records: Record<string, ProofreadQualityGateRecord>) {
  memoryRecords = records
  if (!globalThis.localStorage) {
    return
  }

  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function buildKey(projectId: string, chapterId: string) {
  return `${projectId || 'unknown-project'}:${chapterId || 'unknown-chapter'}`
}

function rotateRight(value: number, bits: number) {
  return (value >>> bits) | (value << (32 - bits))
}

function toUtf8Bytes(input: string): number[] {
  if (typeof TextEncoder !== 'undefined') {
    return Array.from(new TextEncoder().encode(input))
  }

  const encoded = unescape(encodeURIComponent(input))
  return Array.from(encoded, (char) => char.charCodeAt(0))
}

export function calculateProofreadContentHash(content: string): string {
  const bytes = toUtf8Bytes(content)
  const bitLength = bytes.length * 8
  const words: number[] = []

  bytes.push(0x80)
  while (bytes.length % 64 !== 56) {
    bytes.push(0)
  }

  const high = Math.floor(bitLength / 0x100000000)
  const low = bitLength >>> 0
  bytes.push((high >>> 24) & 0xff, (high >>> 16) & 0xff, (high >>> 8) & 0xff, high & 0xff)
  bytes.push((low >>> 24) & 0xff, (low >>> 16) & 0xff, (low >>> 8) & 0xff, low & 0xff)

  for (let index = 0; index < bytes.length; index += 4) {
    words.push(
      ((bytes[index] << 24) |
        (bytes[index + 1] << 16) |
        (bytes[index + 2] << 8) |
        bytes[index + 3]) >>>
        0,
    )
  }

  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]

  for (let chunk = 0; chunk < words.length; chunk += 16) {
    const schedule = words.slice(chunk, chunk + 16)
    for (let index = 16; index < 64; index += 1) {
      const s0 =
        rotateRight(schedule[index - 15], 7) ^
        rotateRight(schedule[index - 15], 18) ^
        (schedule[index - 15] >>> 3)
      const s1 =
        rotateRight(schedule[index - 2], 17) ^
        rotateRight(schedule[index - 2], 19) ^
        (schedule[index - 2] >>> 10)
      schedule[index] = (schedule[index - 16] + s0 + schedule[index - 7] + s1) >>> 0
    }

    let [a, b, c, d, e, f, g, h] = hash
    for (let index = 0; index < 64; index += 1) {
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25)
      const choice = (e & f) ^ (~e & g)
      const temp1 = (h + s1 + choice + constants[index] + schedule[index]) >>> 0
      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22)
      const majority = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (s0 + majority) >>> 0
      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    hash[0] = (hash[0] + a) >>> 0
    hash[1] = (hash[1] + b) >>> 0
    hash[2] = (hash[2] + c) >>> 0
    hash[3] = (hash[3] + d) >>> 0
    hash[4] = (hash[4] + e) >>> 0
    hash[5] = (hash[5] + f) >>> 0
    hash[6] = (hash[6] + g) >>> 0
    hash[7] = (hash[7] + h) >>> 0
  }

  return `sha256:${hash.map((item) => item.toString(16).padStart(8, '0')).join('')}`
}

export function saveProofreadQualityGateRecord(payload: {
  projectId?: string
  chapterId?: string
  contentHash?: string
  score?: number
  issues: ReviewIssue[]
  previewWarnings: MobilePreviewWarning[]
}) {
  if (!payload.projectId || !payload.chapterId) {
    return
  }

  const openIssues = payload.issues.filter((issue) => (issue.status || 'open') !== 'ignored')
  const record: ProofreadQualityGateRecord = {
    projectId: payload.projectId,
    chapterId: payload.chapterId,
    contentHash: payload.contentHash,
    score: payload.score,
    totalIssues: openIssues.length,
    errorCount: openIssues.filter((issue) => issue.severity === 'error').length,
    warningCount: openIssues.filter((issue) => issue.severity === 'warning').length,
    suggestionCount: openIssues.filter((issue) => issue.severity === 'suggestion').length,
    previewWarningCount: payload.previewWarnings.length,
    updatedAt: Date.now(),
  }

  const records = readRecords()
  records[buildKey(payload.projectId, payload.chapterId)] = record
  writeRecords(records)
}

export function getProofreadQualityGateStatus(
  projectId: string,
  chapterId: string,
  currentContentHash?: string,
): ProofreadQualityGateStatus {
  const record = readRecords()[buildKey(projectId, chapterId)] || null
  if (!record) {
    return {
      record: null,
      level: 'missing',
      message: '该章节尚未完成发布前审校。',
      reason: 'missing',
    }
  }

  if (record.contentHash && currentContentHash && record.contentHash !== currentContentHash) {
    return {
      record,
      level: 'warning',
      message: '章节正文在最近一次审校后发生变化。',
      reason: 'stale',
    }
  }

  if (record.errorCount > 0) {
    return {
      record,
      level: 'warning',
      message: `最近一次审校仍有 ${record.errorCount} 条必须改问题。`,
      reason: 'blocking_issues',
    }
  }

  if (record.warningCount > 0 || record.previewWarningCount > 0) {
    return {
      record,
      level: 'warning',
      message: `最近一次审校有 ${record.warningCount} 条建议改问题、${record.previewWarningCount} 条移动端阅读风险。`,
      reason: 'soft_issues',
    }
  }

  return {
    record,
    level: 'pass',
    message: '最近一次审校未发现必须处理的问题。',
    reason: 'pass',
  }
}

export function clearProofreadQualityGateRecordsForTests() {
  if (globalThis.localStorage) {
    globalThis.localStorage.removeItem(STORAGE_KEY)
  }
  memoryRecords = {}
}
