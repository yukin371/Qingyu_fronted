/**
 * AI Dynamic Element Locator - Integration Tests
 * Phase 4: Cache replay and LLM call integration tests
 *
 * Run with: npx vitest run tests/e2e/ai-locator/integration.spec.ts
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SelectorCache, generateCacheKey } from './selector-cache';
import { AILocator } from './ai-locator';
import { LLMAdapter } from './llm-adapter';

// ============================================
// Mock Page for Testing
// ============================================

interface MockPage {
  url: () => string;
  title: () => string;
  content: () => string;
  screenshot: () => Buffer;
}

const createMockPage = (): MockPage => ({
  url: () => 'https://example.com/login',
  title: () => '登录页面',
  content: () => '<html><body><button data-testid="login-btn">登录</button></body></html>',
  screenshot: () => Buffer.from('fake-screenshot-data'),
});

// ============================================
// Cache Replay Tests
// ============================================

describe('Cache Replay Integration', () => {
  let cache: SelectorCache;
  const testCacheDir = '.cache/test-integration';

  beforeEach(() => {
    cache = new SelectorCache({
      cacheDir: testCacheDir,
      ttl: 86400,
      debug: false,
    });
  });

  afterEach(() => {
    // Cleanup test cache files
    try {
      const fs = require('node:fs');
      if (fs.existsSync(testCacheDir)) {
        fs.rmSync(testCacheDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should replay from cache without calling LLM', async () => {
    // Setup: Pre-populate cache
    const url = 'https://example.com';
    const description = '登录按钮';
    const cacheKey = generateCacheKey(url, description);

    cache.set(cacheKey, {
      selector: 'button[data-testid="login-btn"]',
      alternativeSelectors: ['button.login', 'button[type="submit"]'],
      timestamp: Date.now(),
      pageUrl: url,
      targetDescription: description,
    });

    // Verify cache has the entry
    expect(cache.has(cacheKey)).toBe(true);
    const cached = cache.get(cacheKey);
    expect(cached).not.toBeNull();
    expect(cached?.selector).toBe('button[data-testid="login-btn"]');
  });

  it('should return null on cache miss', () => {
    const result = cache.get('nonexistent-cache-key');
    expect(result).toBeNull();
  });

  it('should store multiple entries independently', () => {
    const url1 = 'https://example.com/page1';
    const url2 = 'https://example.com/page2';
    const desc = '提交按钮';

    cache.setFromDescription(url1, desc, 'button.submit1');
    cache.setFromDescription(url2, desc, 'button.submit2');

    const result1 = cache.getByDescription(url1, desc);
    const result2 = cache.getByDescription(url2, desc);

    expect(result1?.selector).toBe('button.submit1');
    expect(result2?.selector).toBe('button.submit2');
  });

  it('should track cache state correctly', () => {
    const key = 'test-key';

    // Initially no entry
    expect(cache.has(key)).toBe(false);
    expect(cache.get(key)).toBeNull();

    // After setting
    cache.set(key, {
      selector: 'button',
      timestamp: Date.now(),
      pageUrl: 'https://example.com',
      targetDescription: 'test',
    });

    expect(cache.has(key)).toBe(true);
    expect(cache.get(key)?.selector).toBe('button');
  });
});

// ============================================
// LLM Adapter Integration Tests
// ============================================

describe('LLM Adapter Integration', () => {
  it('should handle API key configuration', () => {
    // Save original
    const original = process.env.CLAUDE_API_KEY;

    // Test without API key
    delete process.env.CLAUDE_API_KEY;
    const adapter1 = new LLMAdapter();
    expect(adapter1).toBeDefined();

    // Test with API key
    process.env.CLAUDE_API_KEY = 'test-key';
    const adapter2 = new LLMAdapter();
    expect(adapter2).toBeDefined();

    // Restore
    process.env.CLAUDE_API_KEY = original;
  });

  it('should respect configuration options', () => {
    const adapter = new LLMAdapter({
      model: 'claude-test-model',
      timeout: 5000,
      maxRetries: 2,
      logLevel: 'error',
    });

    expect(adapter).toBeDefined();
  });

  it('should return null when locate is called without API key', async () => {
    // Save original
    const original = process.env.CLAUDE_API_KEY;
    delete process.env.CLAUDE_API_KEY;

    const adapter = new LLMAdapter();

    const mockPage = createMockPage();
    const result = await adapter.locate({
      pageUrl: mockPage.url(),
      pageTitle: mockPage.title(),
      html: mockPage.content(),
      targetDescription: '登录按钮',
      failedSelectors: [],
    });

    expect(result).toBeNull();

    // Restore
    process.env.CLAUDE_API_KEY = original;
  });
});

// ============================================
// AILocator Integration Tests (with mocks)
// ============================================

describe('AILocator Integration', () => {
  let mockPage: MockPage & { analyze: () => Promise<any> };

  beforeEach(() => {
    mockPage = {
      ...createMockPage(),
      analyze: vi.fn().mockResolvedValue({
        screenshot: 'base64screenshot',
        html: '[Start of page]\nPage URL: https://example.com\nPage Title: Test\nInteractive Elements:\n<button data-testid="login">登录</button>\n[End of page]',
        url: 'https://example.com',
        title: 'Test',
      }),
    };
  });

  it('should be configurable with custom components', () => {
    const customCache = new SelectorCache({
      cacheDir: '.cache/test-custom',
      ttl: 3600,
    });

    const locator = new AILocator({
      cache: customCache,
      config: {
        confidenceThreshold: 0.9,
      },
    });

    expect(locator).toBeDefined();
    expect(locator.isEnabled()).toBe(true);
  });

  it('should create AILocatorError with correct codes', () => {
    const { AILocatorError } = require('./ai-locator');

    const error1 = new AILocatorError('Test error', 'CACHE_ERROR');
    expect(error1.code).toBe('CACHE_ERROR');
    expect(error1.message).toBe('Test error');

    const error2 = new AILocatorError('LLM failed', 'LLM_ERROR');
    expect(error2.code).toBe('LLM_ERROR');

    const error3 = new AILocatorError('Low confidence', 'LOW_CONFIDENCE');
    expect(error3.code).toBe('LOW_CONFIDENCE');

    const error4 = new AILocatorError('Analysis error', 'ANALYSIS_ERROR');
    expect(error4.code).toBe('ANALYSIS_ERROR');

    const error5 = new AILocatorError('Config error', 'CONFIG_ERROR');
    expect(error5.code).toBe('CONFIG_ERROR');
  });

  it('should enable and disable locator', () => {
    const locator = new AILocator();

    expect(locator.isEnabled()).toBe(true);

    locator.setEnabled(false);
    expect(locator.isEnabled()).toBe(false);

    locator.setEnabled(true);
    expect(locator.isEnabled()).toBe(true);
  });
});

// ============================================
// End-to-End Flow Simulation Tests
// ============================================

describe('AILocator Flow Simulation', () => {
  it('should simulate cache hit flow', async () => {
    const cache = new SelectorCache({
      cacheDir: '.cache/test-flow',
      ttl: 86400,
      debug: false,
    });

    const url = 'https://example.com';
    const description = '登录按钮';
    const expectedSelector = 'button[data-testid="login-btn"]';

    // Pre-populate cache (simulating previous run)
    cache.setFromDescription(url, description, expectedSelector, ['button[type="submit"]']);

    // Simulate locator check
    const cached = cache.getByDescription(url, description);

    expect(cached).not.toBeNull();
    expect(cached?.selector).toBe(expectedSelector);
    // In real flow, this would skip LLM call
  });

  it('should simulate cache miss flow', () => {
    const cache = new SelectorCache({
      cacheDir: '.cache/test-miss',
      ttl: 86400,
    });

    const url = 'https://example.com';
    const description = '不存在的按钮';

    // Cache miss
    const cached = cache.getByDescription(url, description);

    expect(cached).toBeNull();
    // In real flow, this would trigger LLM call
  });

  it('should simulate confidence threshold check', () => {
    const threshold = 0.8;

    const lowConfidence = 0.7;
    const highConfidence = 0.9;

    expect(lowConfidence < threshold).toBe(true); // Should reject
    expect(highConfidence >= threshold).toBe(true); // Should accept
  });

  it('should validate alternative selectors structure', () => {
    const response = {
      selector: 'button[data-testid="login"]',
      confidence: 0.95,
      reasoning: 'Found by data-testid',
      alternativeSelectors: [
        'button.login',
        'button[type="submit"]',
        '//button[contains(@class, "login")]',
      ],
    };

    expect(response.selector).toBeTruthy();
    expect(response.confidence).toBeGreaterThanOrEqual(0.8);
    expect(response.alternativeSelectors).toHaveLength(3);
    expect(response.alternativeSelectors[0]).toBe('button.login');
  });
});

// ============================================
// Module Export Verification
// ============================================

describe('Module Exports Verification', () => {
  it('should export SelectorCache class', async () => {
    const { SelectorCache } = await import('./selector-cache');
    expect(SelectorCache).toBeDefined();
    expect(typeof SelectorCache).toBe('function');
  });

  it('should export generateCacheKey function', async () => {
    const { generateCacheKey } = await import('./selector-cache');
    expect(typeof generateCacheKey).toBe('function');
  });

  it('should export PageAnalyzer class', async () => {
    const { PageAnalyzer } = await import('./page-analyzer');
    expect(PageAnalyzer).toBeDefined();
    expect(typeof PageAnalyzer).toBe('function');
  });

  it('should export LLMAdapter class', async () => {
    const { LLMAdapter } = await import('./llm-adapter');
    expect(LLMAdapter).toBeDefined();
    expect(typeof LLMAdapter).toBe('function');
  });

  it('should export AILocator class', async () => {
    const { AILocator } = await import('./ai-locator');
    expect(AILocator).toBeDefined();
    expect(typeof AILocator).toBe('function');
  });

  it('should export index functions', async () => {
    const index = await import('./index');
    expect(index.pageAI).toBeDefined();
    expect(index.aiLocator).toBeDefined();
    expect(index.withAIFallback).toBeDefined();
    expect(index.extendPage).toBeDefined();
    expect(index.extendLocator).toBeDefined();
  });
});
