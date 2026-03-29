/**
 * AI Dynamic Element Locator - LLM Adapter
 * Phase 1: Claude API adapter with vision + text support
 */

import type { AILocatorRequest, AILocatorResponse, AILocatorConfig, DEFAULT_CONFIG } from './types';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    source?: {
      type: 'base64' | 'url';
      media_type: string;
      data: string;
    };
  }>;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: 'text';
    text: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * System prompt for element locator
 */
const SYSTEM_PROMPT = `You are an expert UI element locator for Playwright tests. Your task is to analyze page screenshots and HTML to find the best CSS selector or XPath for a target element.

## Analysis Rules:
1. First look at the screenshot to understand the visual layout
2. Then analyze the HTML structure to find semantic elements
3. Prefer stable selectors: data-testid > role > aria-label > text content
4. Avoid absolute XPath; use relative paths with meaningful constraints
5. Consider element hierarchy and spatial relationships

## Selector Priority (highest to lowest):
1. [data-testid="..."] - Most stable, designed for testing
2. [role="..."][aria-label="..."] - Semantic and accessible
3. [aria-label="..."] - Accessible labels
4. tag[data-*] or tag[attribute] - Element with specific attributes
5. text="..." or :has-text("...") - Text content
6. nth-child or nth-of-type - Position-based (last resort)

## Output Format:
Return a JSON object with:
- selector: The best CSS selector or XPath
- confidence: A number from 0.0 to 1.0 indicating reliability
- reasoning: Brief explanation of why this selector was chosen
- alternativeSelectors: Array of fallback selectors (optional)

## Important:
- Only return selectors with confidence >= 0.8
- If no reliable selector can be found, set confidence < 0.8 and explain why
- Use relative XPath (//...) not absolute (/html/...)
- For buttons/links, prefer semantic selectors over positional`;

/**
 * Build user prompt for element location
 */
function buildUserPrompt(request: AILocatorRequest): string {
  const failedSelectorsText = request.failedSelectors.length > 0
    ? `Already failed selectors (DO NOT use these):\n${request.failedSelectors.map(s => `- ${s}`).join('\n')}`
    : 'No previously failed selectors.';

  return `## Target Element:
${request.targetDescription}

## Page Context:
- URL: ${request.pageUrl}
- Title: ${request.pageTitle}

## Page HTML:
${request.html}

## Failed Selectors:
${failedSelectorsText}

## Task:
Find the best selector for the target element. Consider:
1. Element's role and semantic meaning
2. Spatial relationships ("below", "after", "inside")
3. Visual hierarchy and layout
4. Stability across page changes

Return your response as a JSON object with selector, confidence (0.0-1.0), reasoning, and alternativeSelectors.`;
}

/**
 * Parse JSON response from Claude
 */
function parseResponse(text: string): AILocatorResponse | null {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error('[AI-Locator-LLM] No JSON found in response');
    return null;
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      selector: parsed.selector || '',
      confidence: parseFloat(parsed.confidence) || 0,
      reasoning: parsed.reasoning || '',
      alternativeSelectors: parsed.alternativeSelectors || [],
    };
  } catch (error) {
    console.error('[AI-Locator-LLM] JSON parse error:', error);
    return null;
  }
}

/**
 * LLMAdapter class for Claude API communication
 */
export class LLMAdapter {
  private apiKey: string;
  private model: string;
  private timeout: number;
  private maxRetries: number;
  private debug: boolean;
  private lastTokenUsage: TokenUsage | null = null;

  constructor(config?: Partial<AILocatorConfig>) {
    this.apiKey = process.env.CLAUDE_API_KEY || '';
    this.model = config?.model || process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
    this.timeout = config?.timeout || 30000;
    this.maxRetries = config?.maxRetries || 3;
    this.debug = config?.logLevel === 'debug';

    if (!this.apiKey) {
      console.warn('[AI-Locator-LLM] CLAUDE_API_KEY not set - LLM calls will fail');
    }
  }

  /**
   * Get last token usage statistics
   */
  getLastTokenUsage(): TokenUsage | null {
    return this.lastTokenUsage;
  }

  /**
   * Call Claude API with vision + text input
   * @param request - Element locator request
   * @returns AI locator response or null on failure
   */
  async locate(request: AILocatorRequest): Promise<AILocatorResponse | null> {
    if (!this.apiKey) {
      console.error('[AI-Locator-LLM] API key not configured');
      return null;
    }

    this.log('debug', `Calling Claude API (model: ${this.model})...`);
    this.log('debug', `Target: ${request.targetDescription}`);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(request);
        this.lastTokenUsage = response.usage;
        this.logTokenUsage(response.usage);
        return response.result;
      } catch (error) {
        lastError = error as Error;
        this.log('warn', `Attempt ${attempt} failed: ${lastError.message}`);

        if (attempt < this.maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await this.sleep(delay);
        }
      }
    }

    this.log('error', `All ${this.maxRetries} attempts failed. Last error: ${lastError?.message}`);
    return null;
  }

  /**
   * Make single API request to Claude
   */
  private async makeRequest(request: AILocatorRequest): Promise<{ result: AILocatorResponse | null; usage: TokenUsage }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const messages: ClaudeMessage[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: buildUserPrompt(request),
            },
          ],
        },
      ];

      // Add screenshot if available
      if (request.screenshot) {
        (messages[0].content as Array<{ type: string; source?: { type: string; media_type: string; data: string }; text?: string }>).unshift({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: request.screenshot,
          },
        });
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data: ClaudeResponse = await response.json();

      if (!data.content || !data.content[0] || data.content[0].type !== 'text') {
        throw new Error('Invalid API response format');
      }

      const result = parseResponse(data.content[0].text);

      return {
        result,
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Log token usage statistics
   */
  private logTokenUsage(usage: TokenUsage): void {
    console.info(
      `[AI-Locator-LLM] Token usage: ` +
      `input=${usage.inputTokens}, ` +
      `output=${usage.outputTokens}, ` +
      `total=${usage.totalTokens}`
    );
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log message
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    if (!this.debug && level === 'debug') return;

    const prefix = '[AI-Locator-LLM]';
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
export const defaultLLMAdapter = new LLMAdapter();
