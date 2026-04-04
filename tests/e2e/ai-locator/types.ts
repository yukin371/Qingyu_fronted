/**
 * AI Dynamic Element Locator - Type Definitions
 * Phase 1 Core Types
 */

/**
 * Request format for AI element locator
 */
export interface AILocatorRequest {
  /** Current page URL */
  pageUrl: string;
  /** Current page title */
  pageTitle: string;
  /** Page screenshot in base64 format (optional) */
  screenshot?: string;
  /** Simplified HTML content of the page */
  html: string;
  /** User description of the target element */
  targetDescription: string;
  /** List of selectors that have already failed */
  failedSelectors: string[];
}

/**
 * Response format from AI element locator
 */
export interface AILocatorResponse {
  /** Generated CSS selector or xpath */
  selector: string;
  /** Confidence score between 0 and 1 */
  confidence: number;
  /** Reasoning for the generated selector */
  reasoning: string;
  /** Alternative selectors that could also work */
  alternativeSelectors?: string[];
}

/**
 * Cache entry structure stored in selector cache
 */
export interface SelectorCacheEntry {
  /** The cached selector */
  selector: string;
  /** Alternative selectors */
  alternativeSelectors?: string[];
  /** Timestamp when this entry was created */
  timestamp: number;
  /** Page URL this entry was generated for */
  pageUrl: string;
  /** Target element description */
  targetDescription: string;
}

/**
 * Configuration options for AI Locator
 */
export interface AILocatorConfig {
  /** Enable/disable AI locator (default: true) */
  enabled: boolean;
  /** Cache TTL in seconds (default: 86400 = 24 hours) */
  cacheTtl: number;
  /** Minimum confidence threshold (default: 0.8) */
  confidenceThreshold: number;
  /** Log level: 'debug' | 'info' | 'warn' | 'error' (default: 'debug') */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  /** Claude API model to use */
  model: string;
  /** Claude API timeout in milliseconds (default: 30000) */
  timeout: number;
  /** Maximum retry attempts (default: 3) */
  maxRetries: number;
}

/**
 * Page analysis result containing screenshot and HTML
 */
export interface PageAnalysisResult {
  /** Screenshot in base64 format */
  screenshot: string;
  /** Simplified HTML content */
  html: string;
  /** Page URL */
  url: string;
  /** Page title */
  title: string;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: AILocatorConfig = {
  enabled: true,
  cacheTtl: 86400, // 24 hours
  confidenceThreshold: 0.8,
  logLevel: 'debug',
  model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
  timeout: 30000,
  maxRetries: 3,
};
