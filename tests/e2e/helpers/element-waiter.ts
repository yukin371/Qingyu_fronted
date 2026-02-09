/**
 * 元素等待辅助工具
 * 提供稳定的元素定位和智能等待功能
 */

import { Page, Locator } from '@playwright/test'

export class ElementWaiter {
  constructor(private page: Page) {}

  /**
   * 等待元素既存在又可见（最稳定的等待方式）
   * @param testId - data-testid 属性值
   * @param options - 可选配置
   * @returns 元素定位器
   */
  async waitForElementVisible(
    testId: string,
    options: {
      timeout?: number
      state?: 'visible' | 'attached' | 'hidden' | 'detached'
    } = {}
  ): Promise<Locator> {
    const { timeout = 10000, state = 'visible' } = options

    try {
      await this.page.waitForSelector(`[data-testid="${testId}"]`, {
        timeout,
        state
      })
      return this.page.locator(`[data-testid="${testId}"]`)
    } catch (error) {
      // 如果 data-testid 失败，尝试使用 aria-label
      throw new Error(`元素 [data-testid="${testId}"] 在 ${timeout}ms 后仍未 ${state}`)
    }
  }

  /**
   * 等待书籍卡片加载完成（处理骨架屏）
   * @param minCount - 最少期望的书籍数量
   */
  async waitForBookCards(minCount: number = 1): Promise<Locator[]> {
    // 先等待骨架屏消失
    await this.page.waitForSelector('[data-testid="book-grid-loading"]', {
      state: 'hidden',
      timeout: 5000
    }).catch(() => {
      // 骨架屏可能一开始就不存在
    })

    // 等待真实内容出现
    await this.page.waitForSelector('[data-testid="book-grid"]', {
      timeout: 10000
    })

    // 等待至少 minCount 个书籍卡片
    await this.page.waitForFunction(
      (count: number) => {
        const cards = document.querySelectorAll('[data-testid^="book-card-"]')
        return cards.length >= count
      },
      minCount,
      { timeout: 10000 }
    )

    return this.page.locator('[data-testid^="book-card-"]').all()
  }

  /**
   * 等待章节内容加载完成
   */
  async waitForChapterContent(): Promise<Locator> {
    return this.waitForElementVisible('chapter-content', {
      timeout: 15000 // 章节内容可能加载较慢
    })
  }

  /**
   * 等待书籍详情加载完成
   */
  async waitForBookDetail(): Promise<void> {
    // 等待加载状态消失
    await this.page.waitForSelector('[data-testid="book-detail-loading"]', {
      state: 'hidden',
      timeout: 10000
    }).catch(() => {
      // 可能一开始就没有加载状态
    })

    // 等待详情内容出现
    await this.waitForElementVisible('book-detail')
  }

  /**
   * 等待移动端和桌面端的元素
   * 根据屏幕尺寸智能选择等待策略
   */
  async waitForResponsiveElement(
    testId: string,
    options: { timeout?: number } = {}
  ): Promise<Locator> {
    const viewport = this.page.viewportSize()
    const isMobile = viewport && viewport.width < 768

    // 移动端可能需要更长的等待时间
    const timeout = options.timeout ?? (isMobile ? 15000 : 10000)

    return this.waitForElementVisible(testId, { timeout })
  }

  /**
   * 安全点击元素（等待可见后再点击）
   */
  async safeClick(testId: string): Promise<void> {
    const element = await this.waitForElementVisible(testId)
    await element.click()
  }

  /**
   * 安全填写表单（等待可见后再填写）
   */
  async safeFill(testId: string, value: string): Promise<void> {
    const element = await this.waitForElementVisible(testId)
    await element.fill(value)
  }

  /**
   * 等待并获取文本内容
   */
  async waitForTextContent(testId: string): Promise<string> {
    const element = await this.waitForElementVisible(testId)
    return await element.textContent() || ''
  }

  /**
   * 等待并验证文本内容
   */
  async waitForText(
    testId: string,
    expectedText: string,
    options: { timeout?: number; exact?: boolean } = {}
  ): Promise<void> {
    const { timeout = 10000, exact = false } = options
    const locator = this.page.locator(`[data-testid="${testId}"]`)

    await locator.waitFor({ state: 'visible', timeout })

    if (exact) {
      await locator.expectToHaveText(expectedText, { timeout })
    } else {
      await locator.expectToContainText(expectedText, { timeout })
    }
  }

  /**
   * 等待元素数量达到预期
   */
  async waitForElementCount(
    testId: string,
    count: number,
    options: { timeout?: number } = {}
  ): Promise<void> {
    const { timeout = 10000 } = options

    await this.page.waitForFunction(
      ({ selector, expectedCount }) => {
        const elements = document.querySelectorAll(selector)
        return elements.length >= expectedCount
      },
      { selector: `[data-testid^="${testId}"]`, expectedCount: count },
      { timeout }
    )
  }

  /**
   * 等待图片加载完成
   */
  async waitForImageLoaded(testId: string): Promise<void> {
    await this.page.waitForFunction(
      (selector: string) => {
        const img = document.querySelector(selector) as HTMLImageElement
        return img && img.complete && img.naturalHeight !== 0
      },
      `[data-testid="${testId}"] img`,
      { timeout: 10000 }
    )
  }

  /**
   * 等待动画完成
   */
  async waitForAnimation(testId: string): Promise<void> {
    await this.page.waitForFunction(
      (selector: string) => {
        const element = document.querySelector(selector)
        if (!element) return true
        const styles = window.getComputedStyle(element)
        return styles.animationName === 'none' || styles.animationPlayState === 'idle'
      },
      `[data-testid="${testId}"]`,
      { timeout: 5000 }
    )
  }

  /**
   * 批量等待多个元素
   */
  async waitForMultipleElements(
    testIds: string[],
    options: { timeout?: number } = {}
  ): Promise<Map<string, Locator>> {
    const { timeout = 10000 } = options
    const result = new Map<string, Locator>()

    const promises = testIds.map(async (testId) => {
      const locator = await this.waitForElementVisible(testId, { timeout })
      result.set(testId, locator)
    })

    await Promise.all(promises)
    return result
  }
}

/**
 * 创建 ElementWaiter 实例
 */
export function createWaiter(page: Page): ElementWaiter {
  return new ElementWaiter(page)
}
