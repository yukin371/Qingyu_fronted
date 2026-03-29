/**
 * AI Dynamic Element Locator - Core Locator
 * Phase 1: Main AI locator with cache integration
 */

import type { Page } from '@playwright/test';
import type {
  AILocatorRequest,
  AILocatorResponse,
  AILocatorConfig,
  PageAnalysisResult,
} from './types';
import { SelectorCache, generateCacheKey } from './selector-cache';
import { PageAnalyzer } from './page-analyzer';
import { LLMAdapter } from './llm-adapter';

/**
 * AILocator configuration options
 */
export interface AILocatorOptions {
  /** Cache instance (uses default if not provided) */
  cache?: SelectorCache;
  /** Page analyzer instance (uses default if not provided) */
  pageAnalyzer?: PageAnalyzer;
  /** LLM adapter instance (uses default if not provided) */
  llmAdapter?: LLMAdapter;
  /** Configuration options */
  config?: Partial<AILocatorConfig>;
}

/**
 * Result from AI locator operation
 */
export interface LocateResult {
  /** Primary selector */
  selector: string;
  /** Confidence score */
  confidence: number;
  /** Reasoning for the selector */
  reasoning: string;
  /** Alternative selectors */
  alternatives: string[];
  /** Whether result came from cache */
  fromCache: boolean;
}

/**
 * AILocatorError class for specific errors
 */
export class AILocatorError extends Error {
  constructor(
    message: string,
    public code: 'CACHE_ERROR' | 'ANALYSIS_ERROR' | 'LLM_ERROR' | 'LOW_CONFIDENCE' | 'CONFIG_ERROR'
  ) {
    super(message);
    this.name = 'AILocatorError';
  }
}

/**
 * AILocator class - Main AI-powered element locator
 */
export class AILocator {
  private cache: SelectorCache;
  private pageAnalyzer: PageAnalyzer;
  private llmAdapter: LLMAdapter;
  private config: AILocatorConfig;
  private debug: boolean;

  constructor(options?: AILocatorOptions) {
    // Default configuration
    this.config = {
      enabled: true,
      cacheTtl: 86400,
      confidenceThreshold: 0.8,
      logLevel: 'debug',
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
      timeout: 30000,
      maxRetries: 3,
      ...options?.config,
    };

    // Initialize components
    this.cache = options?.cache || new SelectorCache({ ttl: this.config.cacheTtl });
    this.pageAnalyzer = options?.pageAnalyzer || new PageAnalyzer({ debug: this.config.logLevel === 'debug' });
    this.llmAdapter = options?.llmAdapter || new LLMAdapter({
      model: this.config.model,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
      logLevel: this.config.logLevel,
    });

    this.debug = this.config.logLevel === 'debug';
  }

  /**
   * Check if AI locator is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Enable or disable AI locator
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.log('debug', `AI Locator ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Locate element using AI with cache support
   * @param page - Playwright page object
   * @param targetDescription - Natural language description of element
   * @param failedSelectors - List of selectors that have already failed
   * @returns Locate result with selector and metadata
   */
  async locate(
    page: Page,
    targetDescription: string,
    failedSelectors: string[] = []
  ): Promise<LocateResult> {
    if (!this.config.enabled) {
      throw new AILocatorError('AI Locator is disabled', 'CONFIG_ERROR');
    }

    this.log('debug', `Locating element: "${targetDescription}"`);

    try {
      // Step 1: Analyze page
      const analysis = await this.pageAnalyzer.analyze(page);

      // Step 2: Check cache
      const cacheKey = generateCacheKey(analysis.url, targetDescription);
      const cachedEntry = this.cache.get(cacheKey);

      if (cachedEntry) {
        this.log('debug', `Cache hit for: "${targetDescription}"`);
        return {
          selector: cachedEntry.selector,
          confidence: 1.0, // Cached entries are treated as high confidence
          reasoning: `Cached selector (age: ${Math.floor((Date.now() - cachedEntry.timestamp) / 1000)}s)`,
          alternatives: cachedEntry.alternativeSelectors || [],
          fromCache: true,
        };
      }

      // Step 3: Call LLM
      this.log('debug', `Cache miss, calling LLM for: "${targetDescription}"`);

      const llmResponse = await this.callLLM(analysis, targetDescription, failedSelectors);

      if (!llmResponse) {
        throw new AILocatorError('LLM call failed', 'LLM_ERROR');
      }

      // Step 4: Check confidence threshold
      if (llmResponse.confidence < this.config.confidenceThreshold) {
        this.log('warn', `Low confidence (${llmResponse.confidence}) below threshold (${this.config.confidenceThreshold})`);
        throw new AILocatorError(
          `Low confidence: ${llmResponse.confidence}. Need human intervention.`,
          'LOW_CONFIDENCE'
        );
      }

      // Step 5: Cache the result
      this.cache.set(cacheKey, {
        selector: llmResponse.selector,
        alternativeSelectors: llmResponse.alternativeSelectors,
        timestamp: Date.now(),
        pageUrl: analysis.url,
        targetDescription,
      });

      // Step 6: Log token usage
      const tokenUsage = this.llmAdapter.getLastTokenUsage();
      if (tokenUsage) {
        this.logTokenUsage(tokenUsage);
      }

      return {
        selector: llmResponse.selector,
        confidence: llmResponse.confidence,
        reasoning: llmResponse.reasoning,
        alternatives: llmResponse.alternativeSelectors || [],
        fromCache: false,
      };
    } catch (error) {
      if (error instanceof AILocatorError) {
        throw error;
      }

      this.log('error', `Unexpected error: ${error}`);
      throw new AILocatorError(`Locator failed: ${error}`, 'ANALYSIS_ERROR');
    }
  }

  /**
   * Locate element with automatic page analysis
   * This is a convenience method that handles all steps
   */
  async locateElement(
    page: Page,
    description: string,
    failedSelectors?: string[]
  ): Promise<string> {
    const result = await this.locate(page, description, failedSelectors);
    return result.selector;
  }

  /**
   * Build LLM request from page analysis
   */
  private buildLLMRequest(
    analysis: PageAnalysisResult,
    targetDescription: string,
    failedSelectors: string[]
  ): AILocatorRequest {
    return {
      pageUrl: analysis.url,
      pageTitle: analysis.title,
      screenshot: analysis.screenshot,
      html: analysis.html,
      targetDescription,
      failedSelectors,
    };
  }

  /**
   * Call LLM with retry and error handling
   */
  private async callLLM(
    analysis: PageAnalysisResult,
    targetDescription: string,
    failedSelectors: string[]
  ): Promise<AILocatorResponse | null> {
    const request = this.buildLLMRequest(analysis, targetDescription, failedSelectors);

    try {
      return await this.llmAdapter.locate(request);
    } catch (error) {
      this.log('error', `LLM call error: ${error}`);
      return null;
    }
  }

  /**
   * Log token usage
   */
  private logTokenUsage(usage: { inputTokens: number; outputTokens: number; totalTokens: number }): void {
    console.info(
      `[AI-Locator] Tokens: input=${usage.inputTokens}, output=${usage.outputTokens}, total=${usage.totalTokens}`
    );
  }

  /**
   * Log message
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    if (!this.debug && level === 'debug') return;

    const prefix = '[AI-Locator]';
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

// Export singleton instance
export const defaultAILocator = new AILocator();
