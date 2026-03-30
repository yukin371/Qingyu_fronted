/**
 * AI Dynamic Element Locator - Playwright Integration
 * Phase 2: Entry point with page.aiLocator() and locator.withAIFallback()
 *
 * This module extends Playwright's Page and Locator with AI-powered element location.
 * Import this module in your test setup to enable the extensions.
 */

import type { Page, Locator } from '@playwright/test';
import { AILocator } from './ai-locator';
import { SelectorCache } from './selector-cache';
import { PageAnalyzer } from './page-analyzer';
import { LLMAdapter } from './llm-adapter';
import type { AILocatorConfig } from './types';

// Re-export all types and classes from Phase 1
export { AILocator } from './ai-locator';
export { SelectorCache, generateCacheKey } from './selector-cache';
export { PageAnalyzer } from './page-analyzer';
export { LLMAdapter, defaultLLMAdapter } from './llm-adapter';
export type { AILocatorRequest, AILocatorResponse, AILocatorConfig, SelectorCacheEntry, PageAnalysisResult } from './types';
export type { AILocatorOptions, LocateResult } from './ai-locator';

// Default AI Locator instance
let defaultAILocator: AILocator | null = null;

/**
 * Get or create the default AILocator instance
 */
function getDefaultAILocator(): AILocator {
  if (!defaultAILocator) {
    defaultAILocator = new AILocator();
  }
  return defaultAILocator;
}

/**
 * Configure the default AILocator instance
 */
function configureAILocator(config: Partial<AILocatorConfig>): void {
  defaultAILocator = new AILocator({ config });
}

/**
 * Reset the default AILocator instance
 */
function resetAILocator(): void {
  defaultAILocator = null;
}

// ============================================
// AI Locator Options Interfaces
// ============================================

export interface PageAILocatorOptions {
  /** Natural language description of the element */
  description: string;
  /** Minimum confidence threshold (default: 0.8) */
  confidenceThreshold?: number;
}

export interface LocatorAIFallbackOptions {
  /** AI description for fallback (uses aria-label, text, or role if not provided) */
  description?: string;
  /** Minimum confidence threshold (default: 0.8) */
  confidenceThreshold?: number;
}

// ============================================
// AI-powered element locator for Page
// ============================================

/**
 * Locate an element on a page using AI
 *
 * @example
 * ```typescript
 * import { pageAI } from '@/tests/e2e/ai-locator';
 *
 * // Find login button using AI
 * const loginBtn = await pageAI.locator(page, {
 *   description: '登录页面右下角的蓝色登录按钮'
 * });
 * await loginBtn.click();
 * ```
 */
export async function pageAI(
  page: Page,
  options: PageAILocatorOptions
): Promise<Locator> {
  const { description, confidenceThreshold = 0.8 } = options;

  // Check if AI locator is enabled
  const enabled = process.env.AI_LOCATOR_ENABLED !== 'false';
  if (!enabled) {
    throw new Error('[AI-Locator] AI Locator is disabled. Set AI_LOCATOR_ENABLED=true to enable.');
  }

  // Get the AI locator instance
  const aiLocator = getDefaultAILocator();

  // Check confidence threshold
  if (confidenceThreshold !== 0.8) {
    // Create a temporary locator with custom config
    const tempLocator = new AILocator({
      config: { confidenceThreshold }
    });
    const result = await tempLocator.locate(page, description);
    return page.locator(result.selector);
  }

  // Use default locator
  const result = await aiLocator.locate(page, description);
  return page.locator(result.selector);
}

/**
 * Shorthand for pageAI.locator()
 */
export async function aiLocator(
  page: Page,
  options: PageAILocatorOptions
): Promise<Locator> {
  return pageAI(page, options);
}

// ============================================
// Locator with AI fallback
// ============================================

/**
 * When the original locator fails, automatically use AI to find the element
 *
 * @example
 * ```typescript
 * import { withAIFallback } from '@/tests/e2e/ai-locator';
 *
 * // Automatically fallback to AI if button not found
 * const btn = await withAIFallback(page.locator('button:has-text("登录")'));
 * await btn.click();
 * ```
 */
export async function withAIFallback(
  locator: Locator,
  options: LocatorAIFallbackOptions = {}
): Promise<Locator> {
  const { description, confidenceThreshold = 0.8 } = options;

  // Check if AI locator is enabled
  const enabled = process.env.AI_LOCATOR_ENABLED !== 'false';
  if (!enabled) {
    throw new Error('[AI-Locator] AI Locator is disabled. Set AI_LOCATOR_ENABLED=true to enable.');
  }

  // Try original locator first
  try {
    // Check if element exists by counting
    const count = await locator.count();
    if (count > 0) {
      // Element found, return original locator
      return locator;
    }
  } catch {
    // Element not found or error occurred, try AI fallback
    console.debug(`[AI-Locator-Fallback] Original locator failed, trying AI fallback...`);
  }

  // Generate description from locator if not provided
  let aiDescription = description;
  if (!aiDescription) {
    // Try to extract meaningful description from the locator
    const locatorString = locator.toString();
    aiDescription = extractDescriptionFromLocator(locatorString);
  }

  if (!aiDescription) {
    throw new Error('[AI-Locator-Fallback] No description provided and could not extract one from locator');
  }

  // Get page from locator
  const page = await locator.page();

  // Use AI locator to find the element
  const aiLocatorInstance = getDefaultAILocator();

  if (confidenceThreshold !== 0.8) {
    // Create temporary locator with custom threshold
    const tempLocator = new AILocator({ config: { confidenceThreshold } });
    const result = await tempLocator.locate(page, aiDescription);
    return page.locator(result.selector);
  }

  const result = await aiLocatorInstance.locate(page, aiDescription);
  return page.locator(result.selector);
}

// ============================================
// Helper Functions
// ============================================

/**
 * Extract a meaningful description from a locator string
 * This is a best-effort heuristic
 */
function extractDescriptionFromLocator(locatorString: string): string | undefined {
  // Extract text content if present
  const textMatch = locatorString.match(/has-text\(["']([^"']+)["']\)/);
  if (textMatch) {
    return `元素文本为"${textMatch[1]}"的元素`;
  }

  // Extract role if present
  const roleMatch = locatorString.match(/\[role=["']([^"']+)["']\]/);
  if (roleMatch) {
    return `role为${roleMatch[1]}的元素`;
  }

  // Extract aria-label if present
  const ariaMatch = locatorString.match(/\[aria-label=["']([^"']+)["']\]/);
  if (ariaMatch) {
    return `aria-label为"${ariaMatch[1]}"的元素`;
  }

  // Extract data-testid if present
  const testIdMatch = locatorString.match(/\[data-testid=["']([^"']+)["']\]/);
  if (testIdMatch) {
    return `data-testid为${testIdMatch[1]}的元素`;
  }

  // Extract tag name
  const tagMatch = locatorString.match(/^locator\(["']?([a-z]+)["']?\)/i);
  if (tagMatch) {
    return `${tagMatch[1]}元素`;
  }

  return undefined;
}

// ============================================
// Export configuration
// ============================================

export { getDefaultAILocator, configureAILocator, resetAILocator };

/**
 * Default configuration
 */
export const DEFAULT_AI_LOCATOR_CONFIG = {
  enabled: process.env.AI_LOCATOR_ENABLED !== 'false',
  cacheTtl: parseInt(process.env.AI_LOCATOR_CACHE_TTL || '86400', 10),
  confidenceThreshold: parseFloat(process.env.AI_LOCATOR_CONFIDENCE_THRESHOLD || '0.8'),
  logLevel: (process.env.AI_LOCATOR_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'debug',
  model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
  timeout: 30000,
  maxRetries: 3,
} as const;

// ============================================
// Page Extension (Optional - requires explicit opt-in)
// ============================================

/**
 * Extended Page interface with AI locator
 */
export interface ExtendedPage extends Page {
  /**
   * Locate an element using AI
   * @param options - AI locator options
   * @param options.description - Natural language description of the element
   * @param options.confidenceThreshold - Minimum confidence threshold (default: 0.8)
   * @returns Promise<Locator> - Playwright Locator for the element
   */
  aiLocator(options: PageAILocatorOptions): Promise<Locator>;
}

/**
 * Extended Locator interface with AI fallback
 */
export interface ExtendedLocator extends Locator {
  /**
   * When the original locator fails, automatically use AI to find the element
   * @param options - Fallback options
   * @param options.description - AI description for fallback
   * @param options.confidenceThreshold - Minimum confidence threshold (default: 0.8)
   * @returns Promise<Locator> - Original locator or AI fallback locator
   */
  withAIFallback(options?: LocatorAIFallbackOptions): Promise<Locator>;
}

/**
 * Create an extended page with AI locator methods
 * Use this if you want page.aiLocator() instead of aiLocator(page, options)
 *
 * @example
 * ```typescript
 * import { extendPage } from '@/tests/e2e/ai-locator';
 *
 * const customPage = extendPage(page);
 * const loginBtn = await customPage.aiLocator({
 *   description: '登录按钮'
 * });
 * await loginBtn.click();
 * ```
 */
export function extendPage(page: Page): ExtendedPage {
  const extended = page as ExtendedPage;

  extended.aiLocator = async (options: PageAILocatorOptions): Promise<Locator> => {
    return pageAI(page, options);
  };

  return extended;
}

/**
 * Create an extended locator with AI fallback
 * Use this if you want locator.withAIFallback() instead of withAIFallback(locator, options)
 *
 * @example
 * ```typescript
 * import { extendLocator } from '@/tests/e2e/ai-locator';
 *
 * const customLocator = extendLocator(page.locator('button'));
 * const btn = await customLocator.withAIFallback({
 *   description: '登录按钮'
 * });
 * await btn.click();
 * ```
 */
export function extendLocator(locator: Locator): ExtendedLocator {
  const extended = locator as ExtendedLocator;

  extended.withAIFallback = async (options: LocatorAIFallbackOptions = {}): Promise<Locator> => {
    return withAIFallback(locator, options);
  };

  return extended;
}
