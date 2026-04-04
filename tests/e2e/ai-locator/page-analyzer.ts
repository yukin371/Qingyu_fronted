/**
 * AI Dynamic Element Locator - Page Analyzer
 * Phase 1: Screenshot and HTML extraction for AI analysis
 */

import type { Page } from '@playwright/test';
import type { PageAnalysisResult } from './types';

/**
 * Extract meaningful element information from HTML
 */
interface ElementInfo {
  tag: string;
  role?: string;
  ariaLabel?: string;
  dataTestid?: string;
  text?: string;
  id?: string;
  class?: string;
}

/**
 * PageAnalyzer class for extracting page content for AI analysis
 */
export class PageAnalyzer {
  private debug: boolean;

  constructor(options?: { debug?: boolean }) {
    this.debug = options?.debug ?? true;
  }

  /**
   * Capture full page screenshot
   * @param page - Playwright page object
   * @returns Base64-encoded screenshot
   */
  async captureScreenshot(page: Page): Promise<string> {
    this.log('debug', 'Capturing page screenshot...');

    const screenshot = await page.screenshot({
      fullPage: true,
    });

    // Convert Buffer to base64 string
    const base64 = screenshot.toString('base64');

    this.log('debug', `Screenshot captured: ${Math.round(base64.length / 1024)}KB`);
    return base64;
  }

  /**
   * Simplify HTML by removing script, style, and comments
   * Preserves structure and semantic attributes
   * @param html - Raw HTML content
   * @returns Simplified HTML
   */
  simplifyHtml(html: string): string {
    this.log('debug', 'Simplifying HTML...');

    // Remove script tags and content
    let simplified = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove style tags and content
    simplified = simplified.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove comments
    simplified = simplified.replace(/<!--[\s\S]*?-->/g, '');

    // Remove inline event handlers (onclick, onload, etc.)
    simplified = simplified.replace(/\s+on\w+="[^"]*"/gi, '');
    simplified = simplified.replace(/\s+on\w+='[^']*'/gi, '');

    // Remove data-* attributes except data-testid
    simplified = simplified.replace(/\s+data-(?!testid)[a-z-]+="[^"]*"/gi, '');
    simplified = simplified.replace(/\s+data-(?!testid)[a-z-]+='[^']*'/gi, '');

    // Normalize whitespace
    simplified = simplified.replace(/\s+/g, ' ').trim();

    this.log('debug', `HTML simplified: ${html.length} -> ${simplified.length} chars`);
    return simplified;
  }

  /**
   * Extract element information for AI analysis
   * @param page - Playwright page object
   * @returns Formatted element information string
   */
  async extractElementInfo(page: Page): Promise<string> {
    this.log('debug', 'Extracting element information...');

    const elements = await page.evaluate((): ElementInfo[] => {
      const result: ElementInfo[] = [];
      const seen = new Set<string>();

      // Focus on interactive and semantic elements
      const selectors = [
        'button',
        'a',
        'input',
        'select',
        'textarea',
        'form',
        '[role="button"]',
        '[role="link"]',
        '[role="textbox"]',
        '[role="checkbox"]',
        '[role="radio"]',
        '[role="combobox"]',
        '[role="menu"]',
        '[role="menuitem"]',
        '[role="tab"]',
        '[role="dialog"]',
        '[role="alert"]',
        '[data-testid]',
        '[aria-label]',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'header', 'nav', 'main', 'footer', 'aside',
        'img', 'svg',
      ];

      for (const selector of selectors) {
        try {
          const nodes = document.querySelectorAll(selector);
          const nodeArray = Array.from(nodes);

          for (const node of nodeArray) {
            if (node.textContent?.trim().length === 0 &&
                !node.getAttribute('aria-label') &&
                !node.getAttribute('data-testid') &&
                node.tagName.toLowerCase() !== 'img' &&
                node.tagName.toLowerCase() !== 'svg') {
              continue;
            }

            const tag = node.tagName.toLowerCase();
            const key = `${tag}-${node.textContent?.substring(0, 50)}`;

            if (seen.has(key)) continue;
            seen.add(key);

            const info: ElementInfo = {
              tag,
              role: node.getAttribute('role') || undefined,
              ariaLabel: node.getAttribute('aria-label') || undefined,
              dataTestid: node.getAttribute('data-testid') || undefined,
              text: node.textContent?.trim().substring(0, 100) || undefined,
              id: node.id || undefined,
              class: node.className.substring(0, 50) || undefined,
            };

            result.push(info);
          }
        } catch {
          // Ignore selector errors
        }
      }

      return result;
    });

    // Format elements for AI analysis
    const formattedElements = elements.map(el => {
      const parts: string[] = [];

      parts.push(`<${el.tag}`);

      if (el.role) parts.push(`role="${el.role}"`);
      if (el.ariaLabel) parts.push(`aria-label="${el.ariaLabel}"`);
      if (el.dataTestid) parts.push(`data-testid="${el.dataTestid}"`);
      if (el.id) parts.push(`id="${el.id}"`);
      if (el.text) parts.push(`text="${el.text}"`);
      if (el.class) parts.push(`class="${el.class}"`);

      return parts.join(' ') + '>';
    });

    const result = formattedElements.join('\n');
    this.log('debug', `Extracted ${elements.length} elements`);
    return result;
  }

  /**
   * Analyze page and return content for AI locator
   * @param page - Playwright page object
   * @returns Page analysis result with screenshot and HTML
   */
  async analyze(page: Page): Promise<PageAnalysisResult> {
    this.log('debug', 'Starting page analysis...');

    const [screenshot, html, url, title] = await Promise.all([
      this.captureScreenshot(page),
      page.content(),
      page.url(),
      page.title(),
    ]);

    const simplifiedHtml = this.simplifyHtml(html);
    const elementInfo = await this.extractElementInfo(page);

    // Format final HTML output
    const formattedHtml = `[Start of page]
Page URL: ${url}
Page Title: ${title}

Interactive Elements:
${elementInfo}

Simplified HTML Structure:
${simplifiedHtml.substring(0, 15000)}${simplifiedHtml.length > 15000 ? '\n... (truncated)' : ''}
[End of page]`;

    this.log('debug', `Page analysis complete: ${formattedHtml.length} chars`);

    return {
      screenshot,
      html: formattedHtml,
      url,
      title,
    };
  }

  /**
   * Analyze page with element context
   * @param page - Playwright page object
   * @param targetDescription - Description of element to find
   * @returns Enhanced analysis result
   */
  async analyzeForTarget(
    page: Page,
    targetDescription: string
  ): Promise<PageAnalysisResult & { targetDescription: string }> {
    const analysis = await this.analyze(page);

    this.log('debug', `Page analyzed for target: "${targetDescription}"`);

    return {
      ...analysis,
      targetDescription,
    };
  }

  /**
   * Log message based on debug setting
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    if (!this.debug && level === 'debug') return;

    const prefix = '[AI-Locator-Analyzer]';
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
export const defaultPageAnalyzer = new PageAnalyzer();
