/**
 * AI Dynamic Element Locator - Selector Cache
 * Phase 1: SHA256-based caching with file persistence
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { SelectorCacheEntry } from './types';

/**
 * Generate SHA256 hash from input string
 * @param input - String to hash
 * @returns Hex-encoded SHA256 hash
 */
export function generateHash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Generate cache key from URL and element description
 * @param url - Page URL
 * @param description - Element description
 * @returns SHA256 hash key
 */
export function generateCacheKey(url: string, description: string): string {
  const input = `${url}#${description}`;
  return generateHash(input);
}

/**
 * SelectorCache class for caching generated selectors
 * Uses SHA256 hashing and file-based persistence
 */
export class SelectorCache {
  private cacheDir: string;
  private ttl: number;
  private debug: boolean;

  constructor(options?: { cacheDir?: string; ttl?: number; debug?: boolean }) {
    this.cacheDir = options?.cacheDir || '.cache/ai-locator';
    this.ttl = options?.ttl || 86400; // Default 24 hours
    this.debug = options?.debug ?? true;
    this.ensureCacheDir();
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
      this.log('debug', `Created cache directory: ${this.cacheDir}`);
    }
  }

  /**
   * Get absolute path for a cache key
   */
  private getCacheFilePath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
  }

  /**
   * Check if cache entry exists and is valid
   * @param key - Cache key
   * @returns True if entry exists and is not expired
   */
  has(key: string): boolean {
    const filePath = this.getCacheFilePath(key);

    if (!existsSync(filePath)) {
      this.log('debug', `Cache MISS (key not found): ${key.substring(0, 16)}...`);
      return false;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const entry: SelectorCacheEntry = JSON.parse(content);
      const age = Date.now() - entry.timestamp;
      const isExpired = age > this.ttl * 1000;

      if (isExpired) {
        this.log('debug', `Cache MISS (expired): ${key.substring(0, 16)}... (age: ${Math.floor(age / 1000)}s)`);
        return false;
      }

      this.log('debug', `Cache HIT: ${key.substring(0, 16)}... (age: ${Math.floor(age / 1000)}s)`);
      return true;
    } catch (error) {
      this.log('warn', `Cache error reading ${key}: ${error}`);
      return false;
    }
  }

  /**
   * Get cached selector entry
   * @param key - Cache key
   * @returns Cached entry or null if not found/expired
   */
  get(key: string): SelectorCacheEntry | null {
    const filePath = this.getCacheFilePath(key);

    if (!existsSync(filePath)) {
      this.log('debug', `Cache GET miss: ${key.substring(0, 16)}...`);
      return null;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      const entry: SelectorCacheEntry = JSON.parse(content);
      const age = Date.now() - entry.timestamp;
      const isExpired = age > this.ttl * 1000;

      if (isExpired) {
        this.log('debug', `Cache GET expired: ${key.substring(0, 16)}...`);
        return null;
      }

      this.log('debug', `Cache GET hit: ${key.substring(0, 16)}...`);
      return entry;
    } catch (error) {
      this.log('warn', `Cache GET error: ${error}`);
      return null;
    }
  }

  /**
   * Store selector in cache
   * @param key - Cache key
   * @param entry - Selector cache entry to store
   */
  set(key: string, entry: SelectorCacheEntry): void {
    const filePath = this.getCacheFilePath(key);

    try {
      // Ensure directory exists
      this.ensureCacheDir();

      // Add timestamp if not present
      const entryWithTimestamp: SelectorCacheEntry = {
        ...entry,
        timestamp: entry.timestamp || Date.now(),
      };

      writeFileSync(filePath, JSON.stringify(entryWithTimestamp, null, 2), 'utf-8');
      this.log('debug', `Cache SET: ${key.substring(0, 16)}...`);
    } catch (error) {
      this.log('error', `Cache SET error: ${error}`);
    }
  }

  /**
   * Set cache with URL and description directly
   * @param url - Page URL
   * @param description - Element description
   * @param selector - Generated selector
   * @param alternativeSelectors - Alternative selectors
   */
  setFromDescription(
    url: string,
    description: string,
    selector: string,
    alternativeSelectors?: string[]
  ): void {
    const key = generateCacheKey(url, description);
    const entry: SelectorCacheEntry = {
      selector,
      alternativeSelectors,
      timestamp: Date.now(),
      pageUrl: url,
      targetDescription: description,
    };
    this.set(key, entry);
  }

  /**
   * Get cached selector by URL and description
   * @param url - Page URL
   * @param description - Element description
   * @returns Cached entry or null
   */
  getByDescription(url: string, description: string): SelectorCacheEntry | null {
    const key = generateCacheKey(url, description);
    return this.get(key);
  }

  /**
   * Check if entry exists by URL and description
   * @param url - Page URL
   * @param description - Element description
   * @returns True if valid cache entry exists
   */
  hasByDescription(url: string, description: string): boolean {
    const key = generateCacheKey(url, description);
    return this.has(key);
  }

  /**
   * Delete expired entries from cache
   * @returns Number of entries deleted
   */
  cleanExpired(): number {
    const { readdirSync, unlinkSync } = require('node:fs');
    let deleted = 0;

    try {
      const files = readdirSync(this.cacheDir);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const filePath = join(this.cacheDir, file);
          const content = readFileSync(filePath, 'utf-8');
          const entry: SelectorCacheEntry = JSON.parse(content);
          const age = Date.now() - entry.timestamp;

          if (age > this.ttl * 1000) {
            unlinkSync(filePath);
            deleted++;
          }
        } catch {
          // Skip invalid files
        }
      }

      if (deleted > 0) {
        this.log('debug', `Cleaned ${deleted} expired cache entries`);
      }
    } catch (error) {
      this.log('warn', `Cache clean error: ${error}`);
    }

    return deleted;
  }

  /**
   * Log message based on debug setting
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    if (!this.debug && level === 'debug') return;

    const prefix = '[AI-Locator-Cache]';
    const timestamp = new Date().toISOString();

    switch (level) {
      case 'debug':
        console.debug(`${prefix} [${timestamp}] ${message}`);
        break;
      case 'info':
        console.info(`${prefix} [${timestamp}] ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} [${timestamp}] ${message}`);
        break;
      case 'error':
        console.error(`${prefix} [${timestamp}] ${message}`);
        break;
    }
  }
}

// Export singleton instance for convenience
export const defaultCache = new SelectorCache();
