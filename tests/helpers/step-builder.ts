/**
 * Step Builder
 * 构建测试步骤的链式API，提高测试可读性
 */

import { Page, expect } from '@playwright/test'
import { Actor } from './actor-factory'
import { WaitStrategies } from './wait-strategies'

/**
 * 导航后关闭可能存在的 onboarding 弹窗
 */
async function dismissOnboardingAfterNavigation(page: Page): Promise<void> {
  // 等待Vue应用渲染完成
  await page.waitForTimeout(1500)
  try {
    // 方法1: 使用JavaScript直接移除onboarding元素（通过文本内容定位）
    await page.evaluate(() => {
      // 遍历所有元素，查找包含"欢迎来到青羽"文本的元素
      const allElements = document.querySelectorAll('*')
      for (const el of allElements) {
        if (el.textContent && el.textContent.includes('欢迎来到青羽') && el.children.length < 10) {
          // 查找父级容器并移除
          let parent = el.parentElement
          for (let i = 0; i < 5 && parent; i++) {
            if (
              parent.children.length < 10 &&
              parent.className &&
              typeof parent.className === 'string'
            ) {
              // 如果父级有固定定位或绝对定位，很可能是onboarding容器
              const style = window.getComputedStyle(parent)
              if (style.position === 'fixed' || style.position === 'absolute') {
                parent.remove()
                break
              }
            }
            parent = parent.parentElement
          }
          // 如果没找到父级容器，直接移除当前元素
          if (parent === null || parent.parentElement === null) {
            el.remove()
          }
        }
      }

      // 查找并移除遮罩层
      const overlayElements = document.querySelectorAll(
        '[class*="overlay"], [class*="mask"], [class*="tour"]',
      )
      overlayElements.forEach((el) => {
        const style = window.getComputedStyle(el)
        if (
          (style.position === 'fixed' || style.position === 'absolute') &&
          el.children.length < 10
        ) {
          el.remove()
        }
      })
    })

    // 方法2: 按 Escape 键关闭
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // 方法3: 点击跳过按钮
    const skipBtn = page.locator('button:has-text("跳过")').first()
    if (await skipBtn.isVisible({ timeout: 500 })) {
      await skipBtn.click()
      await page.waitForTimeout(300)
      return
    }

    // 方法4: 点击关闭按钮
    const closeBtn = page.locator('.tour-close, button:has-text("关闭")').first()
    if (await closeBtn.isVisible({ timeout: 500 })) {
      await closeBtn.click()
      await page.waitForTimeout(300)
    }
  } catch {
    /* 没有 onboarding 弹窗 */
  }
}

/**
 * 测试步骤接口
 */
export interface TestStep {
  execute(): Promise<void>
  describe(): string
}

/**
 * 链式步骤构建器
 */
export class StepBuilder {
  private steps: TestStep[] = []
  private description: string = ''

  /**
   * 设置步骤描述
   */
  setDescription(description: string): StepBuilder {
    this.description = description
    return this
  }

  /**
   * 添加导航步骤
   */
  addNavigationStep(url: string, page: Page, timeout?: number): StepBuilder {
    this.steps.push({
      execute: async () => {
        await page.goto(url, { timeout: timeout || 60000 })
        // 使用智能等待策略替代 networkidle
        await WaitStrategies.waitForNavigation(page, { timeout: timeout || 30000 })
        // 导航后自动关闭 onboarding 弹窗
        await dismissOnboardingAfterNavigation(page)
      },
      describe: () => `Navigate to ${url}`,
    })
    return this
  }

  /**
   * 添加点击步骤
   */
  addClickStep(selector: string, page: Page, description?: string): StepBuilder {
    this.steps.push({
      execute: async () => {
        await page.click(selector)
      },
      describe: () => description || `Click element ${selector}`,
    })
    return this
  }

  /**
   * 添加填充步骤
   */
  addFillStep(selector: string, value: string, page: Page, description?: string): StepBuilder {
    this.steps.push({
      execute: async () => {
        await page.fill(selector, value)
      },
      describe: () => description || `Fill ${selector} with "${value}"`,
    })
    return this
  }

  /**
   * 添加等待步骤 - 使用智能等待策略
   */
  addWaitStep(selector: string, page: Page, description?: string, timeout?: number): StepBuilder {
    this.steps.push({
      execute: async () => {
        await WaitStrategies.waitForElement(page, selector, { timeout })
      },
      describe: () => description || `Wait for ${selector}`,
    })
    return this
  }

  /**
   * 添加断言步骤
   */
  addAssertionStep(
    selector: string,
    assertion: 'visible' | 'hidden' | 'enabled' | 'disabled',
    page: Page,
    description?: string,
  ): StepBuilder {
    this.steps.push({
      execute: async () => {
        const element = page.locator(selector)
        switch (assertion) {
          case 'visible':
            await expect(element).toBeVisible()
            break
          case 'hidden':
            await expect(element).toBeHidden()
            break
          case 'enabled':
            await expect(element).toBeEnabled()
            break
          case 'disabled':
            await expect(element).toBeDisabled()
            break
        }
      },
      describe: () => description || `Assert ${selector} is ${assertion}`,
    })
    return this
  }

  /**
   * 添加文本断言步骤
   */
  addTextAssertionStep(
    selector: string,
    expectedText: string,
    page: Page,
    description?: string,
  ): StepBuilder {
    this.steps.push({
      execute: async () => {
        const element = page.locator(selector)
        await expect(element).toContainText(expectedText)
      },
      describe: () => description || `Assert ${selector} contains "${expectedText}"`,
    })
    return this
  }

  /**
   * 添加自定义步骤
   */
  addCustomStep(action: () => Promise<void>, description: string): StepBuilder {
    this.steps.push({
      execute: action,
      describe: () => description,
    })
    return this
  }

  /**
   * 添加截图步骤
   */
  addScreenshotStep(filename: string, page: Page): StepBuilder {
    this.steps.push({
      execute: async () => {
        await page.screenshot({ path: `test-screenshots/${filename}.png` })
      },
      describe: () => `Take screenshot: ${filename}`,
    })
    return this
  }

  /**
   * 添加等待时间步骤
   */
  addWaitForTimeStep(ms: number): StepBuilder {
    this.steps.push({
      execute: async () => {
        await new Promise((resolve) => setTimeout(resolve, ms))
      },
      describe: () => `Wait ${ms}ms`,
    })
    return this
  }

  /**
   * 执行所有步骤
   */
  async execute(): Promise<void> {
    console.log(`\n📋 Test Scenario: ${this.description}`)
    console.log(`Steps: ${this.steps.length}`)

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i]
      console.log(`  ${i + 1}. ${step.describe()}`)

      try {
        await step.execute()
        console.log(`     ✅ Passed`)
      } catch (error) {
        console.log(`     ❌ Failed`)
        throw error
      }
    }

    console.log(`\n✅ Scenario completed successfully\n`)
  }

  /**
   * 获取步骤描述
   */
  getStepsDescription(): string[] {
    return this.steps.map((step) => step.describe())
  }

  /**
   * 清除所有步骤
   */
  clear(): StepBuilder {
    this.steps = []
    this.description = ''
    return this
  }
}

/**
 * 场景构建器 - 用于创建完整的测试场景
 */
export class ScenarioBuilder {
  private builder: StepBuilder

  constructor(description: string) {
    this.builder = new StepBuilder().setDescription(description)
  }

  /**
   * 创建场景
   */
  static create(description: string): ScenarioBuilder {
    return new ScenarioBuilder(description)
  }

  /**
   * 添加步骤
   */
  step(action: (builder: StepBuilder) => StepBuilder): ScenarioBuilder {
    action(this.builder)
    return this
  }

  /**
   * 执行场景
   */
  async build(): Promise<void> {
    await this.builder.execute()
  }

  /**
   * 获取构建器
   */
  getBuilder(): StepBuilder {
    return this.builder
  }
}

/**
 * 预定义的常用步骤
 */
export class CommonSteps {
  /**
   * 登录步骤（使用对话框模式）
   */
  static login(page: Page, username: string, password: string): StepBuilder {
    return new StepBuilder().setDescription('Login').addCustomStep(async () => {
      // 确保在首页
      await page.goto('/bookstore')
      await page.waitForTimeout(500)

      // 点击登录按钮
      await page.click('button:has-text("登录")')

      // 等待登录对话框出现（通过标题"欢迎回来"定位）
      await page.waitForSelector(
        'dialog:has-text("欢迎回来"), .el-dialog:has-text("欢迎回来"), [role="dialog"]:has-text("欢迎回来")',
        { timeout: 5000 },
      )

      // 定位登录对话框
      const loginDialog = page
        .locator(
          'dialog:has-text("欢迎回来"), .el-dialog:has-text("欢迎回来"), [role="dialog"]:has-text("欢迎回来")',
        )
        .first()

      // 填写用户名和密码
      await loginDialog
        .locator('input[placeholder*="用户名"], input[placeholder*="邮箱"]')
        .fill(username)
      await loginDialog.locator('input[placeholder*="密码"]').fill(password)

      // 点击登录按钮
      await loginDialog.locator('button:has-text("登录")').click()

      // 等待登录完成
      await page.waitForTimeout(2000)
    }, 'Login with dialog')
  }

  /**
   * 浏览书籍列表步骤
   */
  static browseBooks(page: Page): StepBuilder {
    return new StepBuilder()
      .setDescription('Browse book list')
      .addNavigationStep('/bookstore/books', page)
      .addWaitStep('.book-card, .book-list-item', page, 'Wait for books to load')
      .addAssertionStep('.book-card, .book-list-item', 'visible', page, 'Books should be visible')
  }

  /**
   * 查看书籍详情步骤
   */
  static viewBookDetail(page: Page, bookId: string): StepBuilder {
    return new StepBuilder()
      .setDescription('View book detail')
      .addNavigationStep(`/bookstore/books/${bookId}`, page)
      .addWaitStep('[data-testid="book-detail"]', page, 'Wait for book detail to load')
      .addAssertionStep(
        '[data-testid="book-title"]',
        'visible',
        page,
        'Book title should be visible',
      )
  }

  /**
   * 搜索书籍步骤
   */
  static searchBooks(page: Page, keyword: string): StepBuilder {
    return new StepBuilder()
      .setDescription('Search books')
      .addNavigationStep('/bookstore/books', page)
      .addFillStep('input[data-testid="search-input"]', keyword, page, 'Enter search keyword')
      .addClickStep('button[data-testid="search-button"]', page, 'Click search button')
      .addWaitStep('.search-results', page, 'Wait for search results')
  }

  /**
   * 注册新用户步骤
   */
  static register(
    page: Page,
    userData: { username: string; email: string; password: string },
  ): StepBuilder {
    return new StepBuilder()
      .setDescription('Register new user')
      .addNavigationStep('/register', page)
      .addFillStep('input[name="username"]', userData.username, page)
      .addFillStep('input[name="email"]', userData.email, page)
      .addFillStep('input[name="password"]', userData.password, page)
      .addFillStep('input[name="confirmPassword"]', userData.password, page, 'Confirm password')
      .addClickStep('button[type="submit"]', page, 'Submit registration form')
      .addWaitStep('[data-testid="registration-success"]', page, 'Wait for success message')
  }
}

/**
 * 断言构建器 - 流式API
 */
export class AssertionBuilder {
  private assertions: Array<() => Promise<void>> = []

  /**
   * 断言元素可见
   */
  toBeVisible(selector: string, page: Page): AssertionBuilder {
    this.assertions.push(async () => {
      await expect(page.locator(selector)).toBeVisible()
    })
    return this
  }

  /**
   * 断言元素包含文本
   */
  toContainText(selector: string, text: string, page: Page): AssertionBuilder {
    this.assertions.push(async () => {
      await expect(page.locator(selector)).toContainText(text)
    })
    return this
  }

  /**
   * 断言元素数量
   */
  toHaveCount(selector: string, count: number, page: Page): AssertionBuilder {
    this.assertions.push(async () => {
      await expect(page.locator(selector)).toHaveCount(count)
    })
    return this
  }

  /**
   * 执行所有断言
   */
  async assert(): Promise<void> {
    for (const assertion of this.assertions) {
      await assertion()
    }
  }

  /**
   * 清除断言
   */
  clear(): AssertionBuilder {
    this.assertions = []
    return this
  }
}
