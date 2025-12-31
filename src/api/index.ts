/**
 * API 统一导出（已弃用）
 *
 * ⚠️ 警告：此文件已被弃用，所有 API 已迁移至 modules 目录
 *
 * 请使用以下新的导入方式：
 * - Reader API: `import { ... } from '@/modules/reader/api'`
 * - Writer API: `import { ... } from '@/modules/writer/api'`
 * - User API: `import { ... } from '@/modules/user/api'`
 * - Bookstore API: `import { ... } from '@/modules/bookstore/api'`
 * - Shared API: `import { ... } from '@/modules/shared/api'`
 * - Admin API: `import { ... } from '@/modules/admin/api'`
 * - AI API: `import { ... } from '@/modules/ai/api'`
 * - Recommendation API: `import { ... } from '@/modules/recommendation/api'`
 *
 * 此文件仅用于向后兼容，将在未来版本中移除
 */

// ========== 重新导出所有模块 API ==========

// Reader API
export * as reading from '@/modules/reader/api'

// Writer API
export * as writing from '@/modules/writer/api'

// User API
export * as user from '@/modules/user/api'

// Bookstore API
export * as bookstore from '@/modules/bookstore/api'

// Shared API
export * as shared from '@/modules/shared/api'

// Admin API
export * as admin from '@/modules/admin/api'

// AI API
export * as ai from '@/modules/ai/api'

// Recommendation API
export * as recommendation from '@/modules/recommendation/api'

// ========== 向后兼容 ==========

// 允许直接从模块导入
export * from '@/modules/reader/api'
export * from '@/modules/writer/api'
export * from '@/modules/user/api'
export * from '@/modules/bookstore/api'
export * from '@/modules/shared/api'
export * from '@/modules/admin/api'
export * from '@/modules/ai/api'
export * from '@/modules/recommendation/api'
