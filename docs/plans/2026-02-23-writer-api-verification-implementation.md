# Writer模块API验证实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 为Writer模块添加API契约测试，保留test=true测试模式支持

**Architecture:** 混合测试策略 - 单元测试使用vi.mock，集成测试使用MSW，E2E使用Playwright。动态Mock工厂基于请求参数生成响应。

**Tech Stack:** Vitest, MSW, Playwright, TypeScript

---

## Phase 1: 基础设施

### Task 1: 创建动态Mock工厂

**Files:**
- Create: `tests/mocks/writer/dynamic-mock-factory.ts`

**Step 1: 创建动态Mock工厂基础结构**

```typescript
// tests/mocks/writer/dynamic-mock-factory.ts
export interface MockConfig {
  projectId?: string
  documentId?: string
  characterId?: string
  locationId?: string
  timelineId?: string
  includeChildren?: boolean
  page?: number
  pageSize?: number
}

export class DynamicMockFactory {
  private idCounter = 0
  private dataStore: Map<string, any[]> = new Map()

  generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${++this.idCounter}`
  }

  reset(): void {
    this.idCounter = 0
    this.dataStore.clear()
  }

  // 后续添加各个create方法
}

export const mockFactory = new DynamicMockFactory()
```

**Step 2: 添加文档Mock生成方法**

```typescript
createDocument(config: MockConfig = {}): Document {
  const id = config.documentId || this.generateId('doc')
  return {
    id,
    projectId: config.projectId || this.generateId('proj'),
    parentId: null,
    title: `测试文档 ${this.idCounter}`,
    type: 'chapter',
    status: 'writing',
    wordCount: Math.floor(Math.random() * 5000) + 500,
    order: this.idCounter,
    level: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

createDocumentTree(config: MockConfig = {}, depth = 2): Document[] {
  // 递归生成文档树
}
```

**Step 3: 添加角色/地点/时间线Mock生成方法**

**Step 4: 添加分页响应包装器**

**Step 5: Run tests to verify**

Run: `npm run test:vitest:run -- tests/mocks/`
Expected: PASS (or no tests yet)

**Step 6: Commit**

```bash
git add tests/mocks/writer/dynamic-mock-factory.ts
git commit -m "test(writer): 创建动态Mock工厂"
```

---

### Task 2: 创建Mock生成器文件

**Files:**
- Create: `tests/mocks/writer/document.mock.ts`
- Create: `tests/mocks/writer/character.mock.ts`
- Create: `tests/mocks/writer/location.mock.ts`
- Create: `tests/mocks/writer/timeline.mock.ts`
- Create: `tests/mocks/writer/export.mock.ts`
- Create: `tests/mocks/writer/publish.mock.ts`

**Step 1: 创建document.mock.ts**

```typescript
// tests/mocks/writer/document.mock.ts
import { DynamicMockFactory, MockConfig } from './dynamic-mock-factory'

export const createMockDocument = (config?: MockConfig) =>
  mockFactory.createDocument(config)

export const createMockDocumentTree = (config?: MockConfig, depth?: number) =>
  mockFactory.createDocumentTree(config, depth)

export const createMockDocumentList = (count = 5, config?: MockConfig) =>
  Array.from({ length: count }, () => mockFactory.createDocument(config))
```

**Step 2-6: 创建其他Mock文件（类似结构）**

**Step 7: Commit**

```bash
git add tests/mocks/writer/
git commit -m "test(writer): 创建Writer模块Mock生成器"
```

---

## Phase 2: P1 文档管理

### Task 3: 创建文档API单元测试

**Files:**
- Create: `tests/unit/api/writer/document.api.spec.ts`
- Reference: `src/modules/writer/api/manual/document.ts`

**Step 1: 创建测试文件骨架**

```typescript
// tests/unit/api/writer/document.api.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { documentAPI } from '@/modules/writer/api/manual/document'
import { httpService } from '@/core/services/http.service'

vi.mock('@/core/services/http.service')

describe('documentAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  // 测试用例...
})
```

**Step 2: 添加CRUD测试用例**

- D-001: 创建文档 - POST /writer/project/:projectId/documents
- D-002: 获取文档列表 - GET /writer/project/:projectId/documents
- D-003: 获取文档树 - GET /writer/project/:projectId/documents/tree
- D-004: 获取文档详情 - GET /writer/documents/:id
- D-005: 更新文档 - PUT /writer/documents/:id
- D-006: 删除文档 - DELETE /writer/documents/:id

**Step 3: 添加复杂操作测试用例**

- D-007: 移动文档 - PUT /writer/documents/:id/move
- D-008: 重排序 - PUT /writer/project/:projectId/documents/reorder
- D-009: 复制文档 - POST /writer/documents/:id/duplicate

**Step 4: 添加错误处理测试**

- 401 未登录
- 404 文档不存在
- 403 无权限

**Step 5: Run tests**

Run: `npm run test:vitest:run -- tests/unit/api/writer/document.api.spec.ts`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add tests/unit/api/writer/document.api.spec.ts
git commit -m "test(writer): 添加文档管理API契约测试 (P1)"
```

---

## Phase 3: P2 世界观管理

### Task 4: 创建角色API单元测试

**Files:**
- Create: `tests/unit/api/writer/character.api.spec.ts`
- Reference: `src/modules/writer/api/manual/character.ts`

**测试用例:**
- CH-001 ~ CH-006: 角色CRUD
- CH-007 ~ CH-009: 关系管理
- CH-010: 关系图谱
- 错误处理

**Commit:** `test(writer): 添加角色管理API契约测试 (P2)`

---

### Task 5: 创建地点API单元测试

**Files:**
- Create: `tests/unit/api/writer/location.api.spec.ts`
- Reference: `src/modules/writer/api/manual/location.ts`

**测试用例:**
- L-001 ~ L-006: 地点CRUD
- L-007 ~ L-009: 关系管理
- L-010: 地点树
- 错误处理

**Commit:** `test(writer): 添加地点管理API契约测试 (P2)`

---

### Task 6: 创建时间线API单元测试

**Files:**
- Create: `tests/unit/api/writer/timeline.api.spec.ts`
- Reference: `src/modules/writer/api/manual/timeline.ts`

**测试用例:**
- T-001 ~ T-004: 时间线CRUD
- T-005: 可视化数据
- T-006 ~ T-010: 事件管理
- 错误处理

**Commit:** `test(writer): 添加时间线API契约测试 (P2)`

---

## Phase 4: P3 导出功能

### Task 7: 创建导出API单元测试

**Files:**
- Create: `tests/unit/api/writer/export.api.spec.ts`
- Reference: `src/modules/writer/api/manual/export.ts`

**测试用例:**
- E-001: 导出文档
- E-002: 导出项目
- E-003: 获取任务状态
- E-004: 任务列表
- E-005: 下载文件
- E-006: 取消任务
- E-007: 删除任务
- 错误处理 (后端不支持的功能)

**Commit:** `test(writer): 添加导出功能API契约测试 (P3)`

---

## Phase 5: P4 发布管理

### Task 8: 创建发布API单元测试

**Files:**
- Create: `tests/unit/api/writer/publish.api.spec.ts`
- Reference: `src/modules/writer/api/manual/publish.ts`

**测试用例:**
- P-001: 获取发布计划
- P-002: 创建发布计划
- P-003: 删除发布计划
- P-004: 发布章节
- P-005: 发布记录
- P-006: 发布统计
- 错误处理 (后端不支持的功能)

**Commit:** `test(writer): 添加发布管理API契约测试 (P4)`

---

## Phase 6: 集成测试 + E2E

### Task 9: 创建MSW集成测试

**Files:**
- Create: `tests/integration/writer/workflow.integration.spec.ts`

**Step 1: 配置MSW handlers**

```typescript
// tests/mocks/handlers/writer.ts
import { http, HttpResponse } from 'msw'

export const writerHandlers = [
  http.get('/api/v1/writer/projects/:id/documents/tree', () => {
    return HttpResponse.json({
      code: 200,
      data: mockFactory.createDocumentTree()
    })
  }),
  // 更多handlers...
]
```

**Step 2: 创建集成测试**

- 创建文档流程
- 世界观关联流程
- 导出下载流程

**Commit:** `test(writer): 添加MSW集成测试`

---

### Task 10: 创建E2E测试

**Files:**
- Create: `tests/e2e/writer/project-creation.spec.ts`
- Create: `tests/e2e/writer/chapter-writing.spec.ts`
- Create: `tests/e2e/writer/publish-flow.spec.ts`

**Commit:** `test(writer): 添加E2E测试`

---

## Phase 7: 测试模式整合

### Task 11: 更新测试模式拦截器

**Files:**
- Modify: `src/utils/test-mode-api-interceptor.ts`

**Step 1: 添加Writer模块API拦截规则**

```typescript
// 在interceptRules中添加Writer API规则
const writerRules = [
  { pattern: /\/writer\/projects\/[\w-]+\/documents/, handler: mockDocumentAPI },
  { pattern: /\/writer\/projects\/[\w-]+\/characters/, handler: mockCharacterAPI },
  // 更多规则...
]
```

**Commit:** `feat(writer): 添加test=true测试模式支持`

---

### Task 12: 生成验证报告

**Files:**
- Create: `docs/reports/2026-02-23-writer-api-verification-report.md`

**内容:**
- 测试执行摘要
- API契约验证结果
- 覆盖率分析
- 发现的问题

**Commit:** `docs: 添加Writer模块API验证报告`

---

## 验收检查点

| Phase | 检查点 | 状态 |
|-------|--------|------|
| 1 | Mock基础设施可用 | [ ] |
| 2 | 文档管理API契约验证通过 | [ ] |
| 3 | 世界观管理API契约验证通过 | [ ] |
| 4 | 导出功能API契约验证通过 | [ ] |
| 5 | 发布管理API契约验证通过 | [ ] |
| 6 | 完整流程验证通过 | [ ] |
| 7 | test=true模式正常工作 | [ ] |

---

*实施计划由Kore生成 - 青羽项目*
