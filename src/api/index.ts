/**
 * API统一导出
 *
 * 使用方式1（推荐）：
 * import { bookstore, reading, writing, user } from '@/api'
 * bookstore.getHomepage()
 *
 * 使用方式2：
 * import { getHomepage } from '@/api/bookstore'
 */

export * as shared from './shared'
export * as bookstore from './bookstore'
export * as reading from './reading'
export * as writing from './writing'
export * as user from './user'
export * as recommendation from './recommendation'

// 向后兼容：也允许直接从模块导入
export * from './shared'
export * from './bookstore'
export * from './reading'
export * from './writing'
export * from './user'
export * from './recommendation'

