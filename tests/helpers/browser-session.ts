/**
 * BrowserSession Manager
 * 管理浏览器会话、页面对象和测试上下文
 */

import { Page, BrowserContext, Browser } from '@playwright/test'

export interface BrowserSessionConfig {
  baseURL?: string
  viewport?: { width: number; height: number }
  timeout?: number
  userAgent?: string
  locale?: string
  timezone?: string
}

export class BrowserSession {
  private page: Page
  private context: BrowserContext
  private browser: Browser
  private config: BrowserSessionConfig
  private screenshots: string[] = []

  constructor(page: Page, context: BrowserContext, browser: Browser, config: BrowserSessionConfig = {}) {
    this.page = page
    this.context = context
    this.browser = browser
    this.config = {
      baseURL: 'http://localhost:5173',
      viewport: { width: 1920, height: 1080 },
      timeout: 30000,
      ...config
    }
  }

  /**
   * 获取当前页面对象
   */
  getPage(): Page {
    return this.page
  }

  /**
   * 获取上下文对象
   */
  getContext(): BrowserContext {
    return this.context
  }

  /**
   * 获取浏览器对象
   */
  getBrowser(): Browser {
    return this.browser
  }

  /**
   * 导航到指定URL
   */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { timeout: this.config.timeout })
  }

  /**
   * 刷新页面
   */
  async reload(): Promise<void> {
    await this.page.reload({ timeout: this.config.timeout })
  }

  /**
   * 返回上一页
   */
  async goBack(): Promise<void> {
    await this.page.goBack()
  }

  /**
   * 前进到下一页
   */
  async goForward(): Promise<void> {
    await this.page.goForward()
  }

  /**
   * 等待页面加载完成
   */
  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
    await this.page.waitForLoadState(state, { timeout: this.config.timeout })
  }

  /**
   * 等待选择器出现
   */
  async waitForSelector(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, { timeout: timeout || this.config.timeout })
  }

  /**
   * 截图（用于调试）
   */
  async screenshot(filename: string): Promise<string> {
    const path = `test-screenshots/${filename}-${Date.now()}.png`
    await this.page.screenshot({ path })
    this.screenshots.push(path)
    return path
  }

  /**
   * 获取所有截图路径
   */
  getScreenshots(): string[] {
    return this.screenshots
  }

  /**
   * 执行JavaScript代码
   */
  async evaluate<R = any>(fn: () => R): Promise<R> {
    return await this.page.evaluate(fn)
  }

  /**
   * 设置认证Token（LocalStorage）
   */
  async setAuthToken(token: string): Promise<void> {
    await this.context.addInitScript(() => {
      window.localStorage.setItem = (key, value) => {
        const original = window.localStorage.setItem
        original.call(window.localStorage, key, value)
        window.dispatchEvent(new Event('storage'))
      }
    })
    await this.page.evaluate((t) => {
      window.localStorage.setItem('auth_token', t)
    }, token)
  }

  /**
   * 设置Cookie
   */
  async setCookie(name: string, value: string, domain?: string): Promise<void> {
    await this.context.addCookies([{
      name,
      value,
      domain: domain || 'localhost',
      path: '/'
    }])
  }

  /**
   * 清除所有Cookie和LocalStorage
   */
  async clearStorage(): Promise<void> {
    await this.context.clearCookies()
    await this.page.evaluate(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })
  }

  /**
   * 模拟网络条件
   */
  async simulateNetwork(condition: 'offline' | 'slow3g' | 'fast3g'): Promise<void> {
    if (condition === 'offline') {
      await this.context.setOffline(true)
    } else {
      await this.context.setOffline(false)
      const profiles: Record<string, any> = {
        slow3g: {
          downloadThroughput: (500 * 1024) / 8,
          uploadThroughput: (500 * 1024) / 8,
          latency: 400
        },
        fast3g: {
          downloadThroughput: (1.6 * 1024 * 1024) / 8,
          uploadThroughput: (750 * 1024) / 8,
          latency: 100
        }
      }
      await this.page.route('**', (route) => {
        const profile = profiles[condition]
        setTimeout(() => route.continue(), profile.latency)
      })
    }
  }

  /**
   * 等待网络空闲
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: this.config.timeout })
  }

  /**
   * 获取控制台日志
   */
  getConsoleLogs(): string[] {
    const logs: string[] = []
    this.page.on('console', msg => {
      logs.push(msg.text())
    })
    return logs
  }

  /**
   * 关闭会话
   */
  async close(): Promise<void> {
    await this.page.close()
    await this.context.close()
  }

  /**
   * 创建新页面
   */
  async newPage(): Promise<Page> {
    return await this.context.newPage()
  }
}

/**
 * 创建BrowserSession实例的工厂函数
 */
export async function createBrowserSession(
  page: Page,
  context: BrowserContext,
  browser: Browser,
  config?: BrowserSessionConfig
): Promise<BrowserSession> {
  return new BrowserSession(page, context, browser, config)
}
