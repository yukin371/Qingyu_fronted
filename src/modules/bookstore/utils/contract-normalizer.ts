import type { Book as LegacyBook } from '@/types/bookstore'
import type { Book as ModuleBook, BookStatus } from '../types/book'

type AnyRecord = Record<string, any>

const LEGACY_STATUS_MAP: Record<string, BookStatus> = {
  serializing: 'ongoing',
  published: 'ongoing',
  ongoing: 'ongoing',
  completed: 'completed',
  paused: 'paused',
}

export function normalizeBookStatus(status?: string | null): BookStatus | undefined {
  if (!status) return undefined
  return LEGACY_STATUS_MAP[String(status)] || (status as BookStatus)
}

export function pickCategoryIds(input: AnyRecord): string[] {
  if (Array.isArray(input.categoryIds) && input.categoryIds.length > 0) {
    return input.categoryIds.map(String)
  }
  if (Array.isArray(input.category_ids) && input.category_ids.length > 0) {
    return input.category_ids.map(String)
  }
  if (input.categoryId) {
    return [String(input.categoryId)]
  }
  return []
}

export function normalizeBookContract<T extends AnyRecord>(input: T): T {
  const categoryIds = pickCategoryIds(input)
  const publishedAt = input.publishedAt ?? input.publishTime ?? input.published_at
  const updatedAt = input.updatedAt ?? input.updateTime ?? input.updated_at ?? input.lastUpdateAt

  return {
    ...input,
    status: normalizeBookStatus(input.status),
    categoryIds,
    categoryId: input.categoryId ?? categoryIds[0],
    publishedAt,
    publishTime: input.publishTime ?? publishedAt,
    updatedAt,
    updateTime: input.updateTime ?? updatedAt,
  }
}

export function normalizeBookList<T extends AnyRecord>(items: T[] | undefined | null): T[] {
  if (!Array.isArray(items)) return []
  return items.map(item => normalizeBookContract(item))
}

export function normalizeBookDetail<T extends AnyRecord>(item: T | undefined | null): T | null {
  if (!item || typeof item !== 'object') return null
  return normalizeBookContract(item)
}

export type CompatibleBook = LegacyBook & Partial<ModuleBook>
