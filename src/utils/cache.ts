/**
 * 缓存管理工具
 */

export interface CacheItem<T> {
  data: T
  timestamp: number
  expiresIn: number // 过期时间（ms）
}

export interface CacheOptions {
  expiresIn?: number // 默认过期时间（ms）
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
  prefix?: string // 键名前缀
}

/**
 * 通用缓存管理器
 */
export class CacheManager {
  private memoryCache: Map<string, CacheItem<any>> = new Map()
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.options = {
      expiresIn: options.expiresIn || 5 * 60 * 1000, // 默认5分钟
      storage: options.storage || 'memory',
      prefix: options.prefix || 'cache:'
    }
  }

  /**
   * 获取完整键名
   */
  private getKey(key: string): string {
    return `${this.options.prefix}${key}`
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const fullKey = this.getKey(key)

    if (this.options.storage === 'memory') {
      return this.getFromMemory<T>(fullKey)
    } else {
      return this.getFromStorage<T>(fullKey, this.options.storage)
    }
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, expiresIn?: number): void {
    const fullKey = this.getKey(key)
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresIn || this.options.expiresIn
    }

    if (this.options.storage === 'memory') {
      this.setToMemory(fullKey, item)
    } else {
      this.setToStorage(fullKey, item, this.options.storage)
    }
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    const fullKey = this.getKey(key)

    if (this.options.storage === 'memory') {
      this.memoryCache.delete(fullKey)
    } else {
      this.deleteFromStorage(fullKey, this.options.storage)
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    if (this.options.storage === 'memory') {
      this.memoryCache.clear()
    } else {
      this.clearStorage(this.options.storage)
    }
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * 从内存获取
   */
  private getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key)
    if (!item) return null

    if (this.isExpired(item)) {
      this.memoryCache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * 设置到内存
   */
  private setToMemory<T>(key: string, item: CacheItem<T>): void {
    this.memoryCache.set(key, item)
  }

  /**
   * 从 Storage 获取
   */
  private getFromStorage<T>(
    key: string,
    storage: 'localStorage' | 'sessionStorage'
  ): T | null {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
      const jsonStr = storageObj.getItem(key)
      if (!jsonStr) return null

      const item = JSON.parse(jsonStr) as CacheItem<T>
      if (this.isExpired(item)) {
        storageObj.removeItem(key)
        return null
      }

      return item.data
    } catch (error) {
      console.error('Failed to get cache from storage:', error)
      return null
    }
  }

  /**
   * 设置到 Storage
   */
  private setToStorage<T>(
    key: string,
    item: CacheItem<T>,
    storage: 'localStorage' | 'sessionStorage'
  ): void {
    try {
      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
      storageObj.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error('Failed to set cache to storage:', error)
    }
  }

  /**
   * 从 Storage 删除
   */
  private deleteFromStorage(
    key: string,
    storage: 'localStorage' | 'sessionStorage'
  ): void {
    const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
    storageObj.removeItem(key)
  }

  /**
   * 清空 Storage
   */
  private clearStorage(storage: 'localStorage' | 'sessionStorage'): void {
    const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
    const keys = Object.keys(storageObj)
    keys.forEach((key) => {
      if (key.startsWith(this.options.prefix)) {
        storageObj.removeItem(key)
      }
    })
  }

  /**
   * 检查是否过期
   */
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.expiresIn
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    if (this.options.storage === 'memory') {
      this.memoryCache.forEach((item, key) => {
        if (this.isExpired(item)) {
          this.memoryCache.delete(key)
        }
      })
    } else {
      const storageObj =
        this.options.storage === 'localStorage' ? localStorage : sessionStorage
      const keys = Object.keys(storageObj)
      keys.forEach((key) => {
        if (key.startsWith(this.options.prefix)) {
          try {
            const jsonStr = storageObj.getItem(key)
          if (jsonStr) {
            const item = JSON.parse(jsonStr) as CacheItem<any>
            if (this.isExpired(item)) {
              storageObj.removeItem(key)
            }
          }
        } catch {
          // 忽略解析错误
        }
        }
      })
    }
  }
}

// 创建默认实例
export const apiCache = new CacheManager({
  expiresIn: 5 * 60 * 1000, // 5分钟
  storage: 'memory',
  prefix: 'api:'
})

export const storageCache = new CacheManager({
  expiresIn: 24 * 60 * 60 * 1000, // 24小时
  storage: 'localStorage',
  prefix: 'data:'
})

/**
 * 带缓存的请求包装器
 */
export async function cacheRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  options: {
    cache?: CacheManager
    expiresIn?: number
    forceRefresh?: boolean
  } = {}
): Promise<T> {
  const { cache = apiCache, expiresIn, forceRefresh = false } = options

  // 如果不强制刷新，先尝试从缓存获取
  if (!forceRefresh) {
    const cached = cache.get<T>(key)
    if (cached !== null) {
      return cached
    }
  }

  // 执行请求
  const data = await requestFn()

  // 缓存结果
  cache.set(key, data, expiresIn)

  return data
}

/**
 * 请求去重（防止重复请求）
 */
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map()

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // 如果已有相同的请求在进行中，返回该请求的 Promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>
    }

    // 创建新请求
    const promise = requestFn().finally(() => {
      // 请求完成后删除
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  clear(): void {
    this.pendingRequests.clear()
  }
}

export const requestDeduplicator = new RequestDeduplicator()

/**
 * LRU 缓存（最近最少使用）
 */
export class LRUCache<T> {
  private cache: Map<string, { value: T; timestamp: number }>
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // 更新访问时间（移到最后）
    this.cache.delete(key)
    this.cache.set(key, { ...item, timestamp: Date.now() })

    return item.value
  }

  set(key: string, value: T): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // 如果超过最大容量，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, { value, timestamp: Date.now() })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  get size(): number {
    return this.cache.size
  }
}

// 定期清理过期缓存
setInterval(() => {
  apiCache.cleanup()
  storageCache.cleanup()
}, 60 * 1000) // 每分钟清理一次

