/**
 * 等待策略工具类
 * 提供智能的、可重试的等待方法，解决页面加载超时问题
 */

import { Page, Locator } from '@playwright/test'

/**
 * 等待配置选项
 */
export interface WaitOptions {
  timeout?: number
  state?: 'attached' | 'detached' | 'visible' | 'hidden'
  retry?: boolean
  retryInterval?: number
}

/**
 * 默认等待配置
 */
const DEFAULT_WAIT_CONFIG = {
  timeout: 30000, // 30秒默认超时
  retryInterval: 1000, // 1秒重试间隔
}

/**
 * 等待策略工具类
 */
export class WaitStrategies {
  /**
   * 智能等待元素 - 使用多种策略组合
   * 优先使用元素可见性，降级到网络空闲
   *
   * @param page - Playwright Page 对象
   * @param selector - 选择器
   * @param options - 等待选项
   */
  static async waitForElement(
    page: Page,
    selector: string,
    options: WaitOptions = {}
  ): Promise<Locator | null> {
    const config = { ...DEFAULT_WAIT_CONFIG, ...options }

    try {
      // 策略1: 直接等待元素可见（最快速）
      const element = page.locator(selector)
      await element.waitFor({
        state: config.state || 'visible',
        timeout: config.timeout
      })
      return element
    } catch (error) {
      console.warn(`[WaitStrategies] 直接等待元素失败: ${selector}, 尝试降级策略`)

      // 策略2: 等待DOM加载完成后再检查元素
      try {
        await page.waitForLoadState('domcontentloaded', { timeout: Math.min(config.timeout, 10000) })
        const element = page.locator(selector)
        if (await element.count() > 0) {
          await element.waitFor({ state: config.state || 'visible', timeout: config.timeout - 5000 })
          return element
        }
      } catch {
        console.warn(`[WaitStrategies] DOM加载后等待元素仍失败: ${selector}`)
      }

      return null
    }
  }

  /**
   * 智能等待页面导航完成
   * 使用 Promise.race 多策略等待，避免 networkidle 挂起
   *
   * @param page - Playwright Page 对象
   * @param options - 等待选项
   */
  static async waitForNavigation(
    page: Page,
    options: WaitOptions = {}
  ): Promise<void> {
    const config = { ...DEFAULT_WAIT_CONFIG, ...options }
    const timeout = config.timeout || 30000

    // 多策略并行等待，任一完成即返回
    await Promise.race([
      // 策略1: 等待 load 事件
      page.waitForLoadState('load', { timeout }),

      // 策略2: 等待 domcontentloaded
      page.waitForLoadState('domcontentloaded', { timeout }),

      // 策略3: 等待网络空闲（有风险，可能挂起）
      // 使用较短的超时时间，如果失败不影响整体
      page.waitForLoadState('networkidle', { timeout: Math.min(timeout, 10000) })
        .catch(() => {
          console.log('[WaitStrategies] networkidle 超时，使用其他策略')
        })
    ])
  }

  /**
   * 等待API响应
   * 用于验证API调用是否成功
   *
   * @param page - Playwright Page 对象
   * @param urlPattern - URL 匹配模式（字符串或正则）
   * @param options - 等待选项
   */
  static async waitForAPIResponse(
    page: Page,
    urlPattern: string | RegExp | ((response: any) => boolean),
    options: WaitOptions = {}
  ): Promise<any> {
    const config = { ...DEFAULT_WAIT_CONFIG, ...options }
    const timeout = config.timeout || 30000

    try {
      const response = await page.waitForResponse(
        urlPattern,
        { timeout }
      )

      // 验证响应状态
      if (response.status() >= 400) {
        throw new Error(`API请求失败: ${response.status()} ${response.url()}`)
      }

      return response
    } catch (error) {
      console.error(`[WaitStrategies] 等待API响应失败:`, error)
      throw error
    }
  }

  /**
   * 重试包装器 - 为操作添加重试机制
   *
   * @param operation - 要执行的操作
   * @param maxRetries - 最大重试次数
   * @param retryDelay - 重试延迟（毫秒）
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.warn(`[WaitStrategies] 操作失败，第 ${attempt}/${maxRetries} 次尝试:`, error)

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }

    throw lastError || new Error('操作失败')
  }

  /**
   * 智能等待页面稳定
   * 综合检查：DOM加载 + 元素可见 + API静默
   *
   * @param page - Playwright Page 对象
   * @param selectors - 需要等待的关键元素选择器列表
   * @param options - 等待选项
   */
  static async waitForPageStable(
    page: Page,
    selectors: string[] = [],
    options: WaitOptions = {}
  ): Promise<void> {
    const config = { ...DEFAULT_WAIT_CONFIG, ...options }

    // 步骤1: 等待导航完成
    await this.waitForNavigation(page, { timeout: config.timeout })

    // 步骤2: 如果提供了关键元素，等待它们可见
    if (selectors.length > 0) {
      const elementPromises = selectors.map(async (selector) => {
        try {
          await this.waitForElement(page, selector, {
            timeout: Math.min(config.timeout || 30000, 10000),
            state: 'visible'
          })
        } catch (error) {
          console.warn(`[WaitStrategies] 等待关键元素失败: ${selector}`)
          // 不抛出错误，允许部分元素不存在
        }
      })

      await Promise.allSettled(elementPromises)
    }

    // 步骤3: 额外等待一小段时间，确保动画完成
    await page.waitForTimeout(500)
  }

  /**
   * 等待并点击 - 智能等待元素可点击后再点击
   *
   * @param page - Playwright Page 对象
   * @param selector - 选择器
   * @param options - 等待选项
   */
  static async waitAndClick(
    page: Page,
    selector: string,
    options: WaitOptions = {}
  ): Promise<void> {
    const element = await this.waitForElement(page, selector, {
      ...options,
      state: 'visible'
    })

    if (!element) {
      throw new Error(`元素不存在或不可见: ${selector}`)
    }

    // 确保元素可点击
    await element.waitFor({ state: 'attached', timeout: 5000 })

    // 滚动到视图中
    await element.scrollIntoViewIfNeeded()

    // 点击
    await element.click({ timeout: options.timeout || 10000 })
  }

  /**
   * 等待并填充 - 智能等待输入框可交互后再填充
   *
   * @param page - Playwright Page 对象
   * @param selector - 选择器
   * @param value - 填充值
   * @param options - 等待选项
   */
  static async waitAndFill(
    page: Page,
    selector: string,
    value: string,
    options: WaitOptions = {}
  ): Promise<void> {
    const element = await this.waitForElement(page, selector, {
      ...options,
      state: 'visible'
    })

    if (!element) {
      throw new Error(`输入框不存在或不可见: ${selector}`)
    }

    // 确保元素可交互
    await element.waitFor({ state: 'attached', timeout: 5000 })

    // 滚动到视图中
    await element.scrollIntoViewIfNeeded()

    // 填充
    await element.fill(value, { timeout: options.timeout || 10000 })
  }

  /**
   * 条件等待 - 等待某个条件成立或超时
   *
   * @param condition - 条件函数
   * @param options - 等待选项
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    options: WaitOptions = {}
  ): Promise<boolean> {
    const config = { ...DEFAULT_WAIT_CONFIG, ...options }
    const startTime = Date.now()
    const timeout = config.timeout || 30000
    const interval = config.retryInterval || 1000

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, interval))
    }

    return false
  }
}

/**
 * 快捷方法 - 等待页面稳定（最常用）
 */
export async function waitForStable(
  page: Page,
  selectors?: string[],
  timeout?: number
): Promise<void> {
  await WaitStrategies.waitForPageStable(page, selectors || [], { timeout })
}

/**
 * 快捷方法 - 智能等待元素
 */
export async function waitFor(
  page: Page,
  selector: string,
  timeout?: number
): Promise<Locator | null> {
  return WaitStrategies.waitForElement(page, selector, { timeout })
}
