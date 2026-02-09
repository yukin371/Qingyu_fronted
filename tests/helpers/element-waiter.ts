/**
 * 元素等待工具
 * 提供针对特定页面元素的等待方法
 */

import { Page, Locator } from '@playwright/test'
import { WaitStrategies } from './wait-strategies'

/**
 * 元素等待器类
 */
export class ElementWaiter {
  constructor(private page: Page) {}

  /**
   * 等待书籍卡片加载
   * @param minCount 最小卡片数量
   */
  async waitForBookCards(minCount: number = 1): Promise<void> {
    try {
      await this.page.waitForSelector('[data-testid^="book-card-"]', {
        state: 'visible',
        timeout: 15000
      })

      const cards = this.page.locator('[data-testid^="book-card-"]')
      const count = await cards.count()

      if (count < minCount) {
        throw new Error(`期望至少 ${minCount} 个书籍卡片，实际找到 ${count} 个`)
      }
    } catch (error) {
      // 如果没有data-testid，尝试使用通用选择器
      console.log('[ElementWaiter] 尝试降级选择器...')
      await this.page.waitForSelector('.book-card, .book-item', {
        state: 'visible',
        timeout: 10000
      }).catch(() => {
        throw new Error(`等待书籍卡片失败，至少需要 ${minCount} 个卡片`)
      })
    }
  }

  /**
   * 等待书籍详情加载
   */
  async waitForBookDetail(): Promise<void> {
    const selectors = [
      '[data-testid="book-detail"]',
      '[data-testid="book-title"]',
      '.book-detail',
      '.book-info'
    ]

    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, {
          state: 'visible',
          timeout: 10000
        })
        return
      } catch {
        continue
      }
    }

    throw new Error('等待书籍详情加载失败')
  }

  /**
   * 等待文本内容出现
   * @param testId 测试ID属性值
   */
  async waitForTextContent(testId: string): Promise<void> {
    const selector = `[data-testid="${testId}"]`
    await WaitStrategies.waitForElement(this.page, selector, {
      state: 'visible',
      timeout: 10000
    })
  }

  /**
   * 等待章节内容加载
   */
  async waitForChapterContent(): Promise<void> {
    const selectors = [
      '[data-testid="chapter-content"]',
      '[data-testid="chapter-title"]',
      '.chapter-content',
      '.reader-content'
    ]

    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, {
          state: 'visible',
          timeout: 15000
        })
        return
      } catch {
        continue
      }
    }

    throw new Error('等待章节内容加载失败')
  }

  /**
   * 安全点击元素
   * @param testId 测试ID属性值（不含data-testid前缀）
   */
  async safeClick(testId: string): Promise<void> {
    const selector = `[data-testid="${testId}"]`

    try {
      await WaitStrategies.waitAndClick(this.page, selector, {
        timeout: 10000
      })
    } catch (error) {
      // 尝试通过文本查找
      console.log(`[ElementWaiter] 尝试通过文本查找按钮: ${testId}`)
      await this.page.click(`button:has-text("${testId}"), a:has-text("${testId}")`, {
        timeout: 5000
      }).catch(() => {
        throw new Error(`点击元素失败: ${testId}`)
      })
    }
  }

  /**
   * 等待并获取元素
   * @param selector 选择器
   */
  async waitForElement(selector: string): Promise<Locator> {
    const element = await WaitStrategies.waitForElement(this.page, selector, {
      state: 'visible',
      timeout: 15000
    })

    if (!element) {
      throw new Error(`元素未找到或不可见: ${selector}`)
    }

    return element
  }

  /**
   * 等待页面稳定
   * @param selectors 需要等待的关键元素列表
   */
  async waitForPageStable(selectors: string[] = []): Promise<void> {
    await WaitStrategies.waitForPageStable(this.page, selectors, {
      timeout: 30000
    })
  }

  /**
   * 等待API响应
   * @param urlPattern URL匹配模式
   */
  async waitForAPIResponse(urlPattern: string | RegExp): Promise<any> {
    return await WaitStrategies.waitForAPIResponse(this.page, urlPattern, {
      timeout: 30000
    })
  }
}

/**
 * 创建元素等待器实例
 * @param page Playwright Page对象
 */
export function createWaiter(page: Page): ElementWaiter {
  return new ElementWaiter(page)
}
