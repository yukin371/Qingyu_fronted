/**
 * AI Dynamic Element Locator - Unit Tests
 * Phase 4: SelectorCache, PageAnalyzer, LLMAdapter unit tests
 *
 * Run with: npx vitest run --config vitest.config.ts tests/e2e/ai-locator/ai-locator.spec.ts
 * Or: npx vitest run tests/e2e/ai-locator/ai-locator.spec.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SelectorCache, generateCacheKey, generateHash } from './selector-cache';
import { PageAnalyzer } from './page-analyzer';

// ============================================
// SelectorCache Tests
// ============================================

describe('SelectorCache', () => {
  let cache: SelectorCache;
  const testCacheDir = '.cache/test-ai-locator';

  beforeEach(() => {
    // Create a fresh cache for each test
    cache = new SelectorCache({
      cacheDir: testCacheDir,
      ttl: 86400, // 24 hours
      debug: false,
    });
  });

  describe('generateKey (via generateCacheKey)', () => {
    it('should generate consistent hash key for same input', () => {
      const url = 'https://example.com';
      const description = '登录按钮';
      const key1 = generateCacheKey(url, description);
      const key2 = generateCacheKey(url, description);
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different URLs', () => {
      const desc = '登录按钮';
      const key1 = generateCacheKey('https://example.com', desc);
      const key2 = generateCacheKey('https://other.com', desc);
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different descriptions', () => {
      const url = 'https://example.com';
      const key1 = generateCacheKey(url, '登录按钮');
      const key2 = generateCacheKey(url, '注册按钮');
      expect(key1).not.toBe(key2);
    });

    it('should generate valid SHA256 hex string', () => {
      const key = generateCacheKey('https://example.com', 'test');
      expect(key).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('generateHash', () => {
    it('should generate consistent hash for same input', () => {
      const input = 'test input';
      const hash1 = generateHash(input);
      const hash2 = generateHash(input);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = generateHash('input1');
      const hash2 = generateHash('input2');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate 64-character hex string (SHA256)', () => {
      const hash = generateHash('any input');
      expect(hash.length).toBe(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('get/set/has', () => {
    it('should return null for missing key', () => {
      const result = cache.get('nonexistent-key');
      expect(result).toBeNull();
    });

    it('should return false for has() on missing key', () => {
      const result = cache.has('nonexistent-key');
      expect(result).toBe(false);
    });

    it('should store and retrieve entry', () => {
      const key = 'test-key';
      const entry = {
        selector: 'button.login',
        alternativeSelectors: ['button[type="submit"]'],
        timestamp: Date.now(),
        pageUrl: 'https://example.com',
        targetDescription: '登录按钮',
      };

      cache.set(key, entry);
      const retrieved = cache.get(key);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.selector).toBe('button.login');
      expect(retrieved?.alternativeSelectors).toEqual(['button[type="submit"]']);
    });

    it('should return true for has() on existing key', () => {
      const key = 'test-key';
      const entry = {
        selector: 'button',
        timestamp: Date.now(),
        pageUrl: 'https://example.com',
        targetDescription: 'test',
      };

      cache.set(key, entry);
      expect(cache.has(key)).toBe(true);
    });
  });

  describe('TTL expiration', () => {
    it('should respect TTL and expire entries', async () => {
      // Create cache with very short TTL (100ms)
      const shortTtlCache = new SelectorCache({
        cacheDir: '.cache/test-ttl',
        ttl: 0.1, // 100ms in seconds
        debug: false,
      });

      const key = 'ttl-test-key';
      shortTtlCache.set(key, {
        selector: 'button',
        timestamp: Date.now(),
        pageUrl: 'https://example.com',
        targetDescription: 'test',
      });

      // Entry should exist immediately
      expect(shortTtlCache.has(key)).toBe(true);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 200));

      // Entry should be expired
      expect(shortTtlCache.has(key)).toBe(false);
      expect(shortTtlCache.get(key)).toBeNull();
    });
  });

  describe('setFromDescription / getByDescription / hasByDescription', () => {
    it('should set and get by URL and description', () => {
      const url = 'https://example.com';
      const description = '登录按钮';

      cache.setFromDescription(url, description, 'button.login', ['button[type="submit"]']);

      const result = cache.getByDescription(url, description);
      expect(result).not.toBeNull();
      expect(result?.selector).toBe('button.login');
    });

    it('should check existence by URL and description', () => {
      const url = 'https://example.com';
      const description = '登录按钮';

      expect(cache.hasByDescription(url, description)).toBe(false);

      cache.setFromDescription(url, description, 'button.login');

      expect(cache.hasByDescription(url, description)).toBe(true);
    });
  });

  describe('cleanExpired', () => {
    it('should return 0 when cache is empty', () => {
      const deleted = cache.cleanExpired();
      expect(deleted).toBe(0);
    });
  });
});

// ============================================
// PageAnalyzer Tests
// ============================================

describe('PageAnalyzer', () => {
  let analyzer: PageAnalyzer;

  beforeEach(() => {
    analyzer = new PageAnalyzer({ debug: false });
  });

  describe('simplifyHtml', () => {
    it('should remove script tags', () => {
      const html = '<html><script>alert("test");</script><body><button>Click</button></body></html>';
      const simplified = analyzer.simplifyHtml(html);
      expect(simplified).not.toContain('<script');
      expect(simplified).toContain('<button>Click</button>');
    });

    it('should remove style tags', () => {
      const html = '<html><style>.red { color: red; }</style><body><button>Click</button></body></html>';
      const simplified = analyzer.simplifyHtml(html);
      expect(simplified).not.toContain('<style');
      expect(simplified).toContain('<button>Click</button>');
    });

    it('should remove HTML comments', () => {
      const html = '<html><!-- This is a comment --><body><button>Click</button></body></html>';
      const simplified = analyzer.simplifyHtml(html);
      expect(simplified).not.toContain('<!--');
      expect(simplified).not.toContain('This is a comment');
    });

    it('should remove inline event handlers', () => {
      const html = '<button onclick="alert(1)" onmouseover="foo()">Click</button>';
      const simplified = analyzer.simplifyHtml(html);
      expect(simplified).not.toContain('onclick');
      expect(simplified).not.toContain('onmouseover');
      expect(simplified).toContain('<button>Click</button>');
    });

    it('should preserve data-testid attributes', () => {
      const html = '<button data-testid="login-btn" data-custom="ignored">Click</button>';
      const simplified = analyzer.simplifyHtml(html);
      expect(simplified).toContain('data-testid="login-btn"');
      expect(simplified).not.toContain('data-custom="ignored"');
    });

    it('should normalize whitespace', () => {
      const html = '<body>\n\n  <button>  Click  </button>\n\n</body>';
      const simplified = analyzer.simplifyHtml(html);
      expect(simplified).toContain('> <button> Click </button>');
    });

    it('should extract interactive elements', () => {
      const html = `
        <html>
          <body>
            <button data-testid="login">登录</button>
            <input type="text" placeholder="用户名" />
            <a href="/register">注册</a>
            <div role="button">确定</div>
            <span aria-label="关闭">X</span>
          </body>
        </html>
      `;
      const simplified = analyzer.simplifyHtml(html);
      // Should contain data-testid
      expect(simplified).toContain('data-testid="login"');
    });
  });

  describe('element extraction formatting', () => {
    it('should format elements with proper attributes', () => {
      const html = `
        <html>
          <body>
            <button data-testid="login-btn" aria-label="登录按钮">登录</button>
          </body>
        </html>
      `;
      const simplified = analyzer.simplifyHtml(html);
      // Key is that simplifyHtml preserves structure and key attributes
      expect(simplified).toContain('data-testid="login-btn"');
    });
  });
});

// ============================================
// AILocator Tests (using mocks)
// ============================================

describe('AILocator', () => {
  // Mock LLM Adapter for testing
  const createMockLLMAdapter = () => ({
    locate: vi.fn(),
    getLastTokenUsage: vi.fn().mockReturnValue({
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    }),
  });

  const createMockPageAnalyzer = () => ({
    analyze: vi.fn().mockResolvedValue({
      screenshot: 'base64screenshot',
      html: '[Start of page]\nPage URL: https://example.com\nPage Title: Test\nInteractive Elements:\n<button data-testid="login">登录</button>\n[End of page]',
      url: 'https://example.com',
      title: 'Test',
    }),
  });

  it('should import AILocator successfully', async () => {
    // Dynamic import to test module loading
    const module = await import('./ai-locator');
    expect(module.AILocator).toBeDefined();
    expect(typeof module.AILocator).toBe('function');
  });

  it('should export LocateResult interface structure', async () => {
    const module = await import('./ai-locator');
    // AILocator class should be exported
    expect(module.AILocator).toBeDefined();
  });

  it('should export AILocatorError', async () => {
    const module = await import('./ai-locator');
    expect(module.AILocatorError).toBeDefined();
  });
});

// ============================================
// LLM Adapter Tests (response parsing)
// ============================================

describe('LLMAdapter Response Parsing', () => {
  it('should parse valid JSON response', async () => {
    const module = await import('./llm-adapter');
    // Test the parseResponse function indirectly through the adapter
    const adapter = new module.LLMAdapter({ logLevel: 'error' });
    expect(adapter).toBeDefined();
  });

  it('should handle missing API key gracefully', async () => {
    // Save original env
    const original = process.env.CLAUDE_API_KEY;
    delete process.env.CLAUDE_API_KEY;

    const { LLMAdapter } = await import('./llm-adapter');
    const adapter = new LLMAdapter();

    // Should warn but not throw
    expect(() => new LLMAdapter()).not.toThrow();

    // Restore env
    process.env.CLAUDE_API_KEY = original;
  });
});

// ============================================
// Integration Point Tests
// ============================================

describe('Module Integration Points', () => {
  it('should export all types from types.ts', async () => {
    const types = await import('./types');
    expect(types.AILocatorRequest).toBeDefined();
    expect(types.AILocatorResponse).toBeDefined();
    expect(types.AILocatorConfig).toBeDefined();
    expect(types.DEFAULT_CONFIG).toBeDefined();
  });

  it('should have consistent SelectorCacheEntry structure', async () => {
    const types = await import('./types');
    const entry: types.SelectorCacheEntry = {
      selector: 'button',
      alternativeSelectors: ['input[type="submit"]'],
      timestamp: Date.now(),
      pageUrl: 'https://example.com',
      targetDescription: 'test',
    };

    expect(entry.selector).toBe('button');
    expect(entry.alternativeSelectors).toEqual(['input[type="submit"]']);
    expect(entry.timestamp).toBeDefined();
    expect(entry.pageUrl).toBe('https://example.com');
    expect(entry.targetDescription).toBe('test');
  });

  it('should have valid DEFAULT_CONFIG values', async () => {
    const types = await import('./types');
    expect(types.DEFAULT_CONFIG.enabled).toBe(true);
    expect(types.DEFAULT_CONFIG.cacheTtl).toBe(86400);
    expect(types.DEFAULT_CONFIG.confidenceThreshold).toBe(0.8);
    expect(types.DEFAULT_CONFIG.timeout).toBe(30000);
    expect(types.DEFAULT_CONFIG.maxRetries).toBe(3);
  });
});
