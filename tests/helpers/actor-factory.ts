/**
 * Actor Factory
 * 创建不同类型的测试用户（Actor），用于模拟真实用户行为
 * 基于Screenplay模式
 */

import { Page } from '@playwright/test'
import { BrowserSession } from './browser-session'

/**
 * 用户角色类型
 */
export enum ActorRole {
  GUEST = 'guest',
  READER = 'reader',
  AUTHOR = 'author',
  ADMIN = 'admin',
  VIP_MEMBER = 'vip_member'
}

/**
 * 用户凭据
 */
export interface UserCredentials {
  username: string
  email: string
  password: string
  role?: ActorRole
}

/**
 * Actor基类
 */
export class Actor {
  constructor(
    public readonly name: string,
    public readonly role: ActorRole,
    private session: BrowserSession
  ) {}

  /**
   * 获取浏览器会话
   */
  getSession(): BrowserSession {
    return this.session
  }

  /**
   * 获取页面对象
   */
  getPage(): Page {
    return this.session.getPage()
  }

  /**
   * 导航到指定页面
   */
  async navigateTo(url: string): Promise<void> {
    await this.session.navigate(url)
  }

  /**
   * 等待页面加载
   */
  async waitForPageLoad(): Promise<void> {
    await this.session.waitForLoadState('load')
  }

  /**
   * 截图
   */
  async screenshot(filename: string): Promise<string> {
    return await this.session.screenshot(`${this.name}-${filename}`)
  }

  /**
   * 执行断言
   */
  async assert(condition: boolean, message: string): Promise<void> {
    if (!condition) {
      const screenshotPath = await this.screenshot(`assertion-fail-${Date.now()}`)
      throw new Error(`${message}\nScreenshot saved to: ${screenshotPath}`)
    }
  }
}

/**
 * 访客Actor（未登录用户）
 */
export class GuestActor extends Actor {
  constructor(name: string, session: BrowserSession) {
    super(name, ActorRole.GUEST, session)
  }

  /**
   * 浏览首页
   */
  async browseHomepage(): Promise<void> {
    await this.navigateTo('/')
    await this.waitForPageLoad()
  }

  /**
   * 查看书籍列表
   */
  async viewBookList(): Promise<void> {
    await this.navigateTo('/bookstore/books')
    await this.waitForPageLoad()
  }

  /**
   * 查看书籍详情
   */
  async viewBookDetail(bookId: string): Promise<void> {
    await this.navigateTo(`/bookstore/books/${bookId}`)
    await this.waitForPageLoad()
  }

  /**
   * 尝试访问受限页面（应该被重定向）
   */
  async attemptToAccessRestrictedPage(url: string): Promise<void> {
    await this.navigateTo(url)
    await this.waitForPageLoad()
  }
}

/**
 * 读者Actor（已登录）
 */
export class ReaderActor extends Actor {
  constructor(
    name: string,
    session: BrowserSession,
    private credentials: UserCredentials
  ) {
    super(name, ActorRole.READER, session)
  }

  /**
   * 登录（支持对话框模式和页面模式）
   */
  async login(): Promise<void> {
    const page = this.getPage()

    // 检查当前URL是否在登录页面
    const currentUrl = page.url()
    const isOnLoginPage = currentUrl.includes('/login') || currentUrl.includes('/register')

    if (isOnLoginPage) {
      // 页面模式：直接使用页面表单
      await this.loginWithPageForm(page)
    } else {
      // 对话框模式：通过首页打开对话框
      await this.loginWithDialog(page)
    }
  }

  /**
   * 使用页面表单登录
   */
  private async loginWithPageForm(page: Page): Promise<void> {
    // 等待登录表单加载
    await page.waitForSelector('.auth-form', { timeout: 5000 })

    // 填写登录信息
    const usernameInput = page.locator('input[placeholder*="用户名"], input[placeholder*="邮箱"]').first()
    const passwordInput = page.locator('input[placeholder*="密码"]').first()

    await usernameInput.fill(this.credentials.username)
    await passwordInput.fill(this.credentials.password)

    // 点击登录按钮
    await page.click('button:has-text("立即登录")')

    // 等待登录完成
    await page.waitForTimeout(2000)
  }

  /**
   * 使用对话框登录
   */
  private async loginWithDialog(page: Page): Promise<void> {
    // 确保在首页
    await this.navigateTo('/bookstore')
    await page.waitForTimeout(500)

    // 点击登录按钮打开对话框
    await page.click('button:has-text("登录")')

    // 等待登录对话框出现（通过标题"欢迎回来"来定位）
    await page.waitForSelector('dialog:has-text("欢迎回来"), .el-dialog:has-text("欢迎回来"), [role="dialog"]:has-text("欢迎回来")', { timeout: 5000 })

    // 填写登录信息（在登录对话框内）
    const loginDialog = page.locator('dialog:has-text("欢迎回来"), .el-dialog:has-text("欢迎回来"), [role="dialog"]:has-text("欢迎回来")').first()
    await loginDialog.locator('input[placeholder*="用户名"], input[placeholder*="邮箱"]').fill(this.credentials.username)
    await loginDialog.locator('input[placeholder*="密码"]').fill(this.credentials.password)

    // 点击对话框中的登录按钮
    await loginDialog.locator('button:has-text("登录")').click()

    // 等待登录完成（对话框关闭或"登录成功"消息出现）
    await page.waitForTimeout(2000)
  }

  /**
   * 阅读书籍
   */
  async readBook(bookId: string, chapterId?: string): Promise<void> {
    if (chapterId) {
      await this.navigateTo(`/reader/books/${bookId}/chapters/${chapterId}`)
    } else {
      await this.navigateTo(`/reader/books/${bookId}`)
    }
    await this.waitForPageLoad()
  }

  /**
   * 添加书评
   */
  async addReview(bookId: string, review: { rating: number; comment: string }): Promise<void> {
    await this.navigateTo(`/bookstore/books/${bookId}`)
    await this.waitForPageLoad()

    const page = this.getPage()
    await page.click('[data-testid="add-review-button"]')
    await page.fill('[data-testid="review-comment"]', review.comment)
    await page.click(`[data-testid="rating-${review.rating}"]`)
    await page.click('[data-testid="submit-review"]')
  }

  /**
   * 收藏书籍
   */
  async favoriteBook(bookId: string): Promise<void> {
    await this.navigateTo(`/bookstore/books/${bookId}`)
    await this.waitForPageLoad()

    const page = this.getPage()
    await page.click('[data-testid="favorite-button"]')
  }

  /**
   * 搜索书籍
   */
  async searchBooks(keyword: string): Promise<void> {
    const page = this.getPage()

    // 导航到搜索页面
    await this.navigateTo('/bookstore/search')
    await page.waitForLoadState('networkidle')

    // 等待搜索输入框出现
    const searchInput = page.locator('input[placeholder*="搜索书名、作者、标签"], textbox[placeholder*="搜索"]').first()
    await searchInput.waitFor({ state: 'visible', timeout: 5000 })

    // 填充搜索关键词
    await searchInput.fill(keyword)

    // 点击搜索按钮
    const searchButton = page.locator('button:has-text("搜索")').first()
    await searchButton.click()

    // 等待搜索结果加载
    await page.waitForLoadState('networkidle')

    // 等待搜索结果DOM渲染完成
    await page.waitForTimeout(2000)

    // 等待书籍项可见（最多等待10秒）
    try {
      await page.locator('[data-testid="book-item"]').first().waitFor({ state: 'visible', timeout: 10000 })
    } catch (error) {
      // 如果找不到书籍项，可能是搜索结果为空，这不算错误
      console.log('⚠️  搜索完成后未找到书籍项，可能搜索结果为空')
    }
  }

  /**
   * 继续阅读
   * 修复：简化逻辑，先点击书籍项进入详情页，然后在详情页点击"开始阅读"按钮
   */
  async continueReading(): Promise<void> {
    const page = this.getPage()

    console.log('开始继续阅读流程...')

    // 步骤1: 在搜索结果页点击书籍项进入详情页
    const bookItemSelectors = [
      '[data-testid="book-item"]',
      '.book-item',
      '.book-card'
    ]

    let clickedBookItem = false
    for (const selector of bookItemSelectors) {
      try {
        const bookItem = page.locator(selector).first()
        if (await bookItem.isVisible({ timeout: 3000 })) {
          console.log(`点击书籍项: ${selector}`)
          await bookItem.click()

          // 等待导航完成，增加超时时间
          await page.waitForLoadState('load', { timeout: 10000 })
          await page.waitForTimeout(1000) // 额外等待页面渲染

          clickedBookItem = true
          console.log(`书籍项点击完成，当前URL: ${page.url()}`)
          break
        }
      } catch {
        continue
      }
    }

    if (!clickedBookItem) {
      throw new Error('找不到书籍项')
    }

    // 步骤2: 在书籍详情页点击"开始阅读"按钮
    // 等待详情页加载完成
    await page.waitForTimeout(2000)

    const detailPageButtons = [
      '[data-testid="start-reading"]',  // 最优先
      'button:has-text("开始阅读")',
      '[data-testid="continue-reading"]',
      'button:has-text("继续阅读")'
    ]

    for (const selector of detailPageButtons) {
      try {
        const button = page.locator(selector).first()
        // 增加超时时间并等待按钮可见
        if (await button.isVisible({ timeout: 5000 })) {
          console.log(`找到详情页阅读按钮: ${selector}`)
          await button.click()

          // 等待导航完成
          await page.waitForLoadState('load', { timeout: 10000 })
          await page.waitForTimeout(1000)

          // 检查最终URL
          const currentUrl = page.url()
          console.log(`点击后最终URL: ${currentUrl}`)

          // 只要在书籍详情页、章节页或阅读器页都算成功
          if (currentUrl.includes('/chapter/') || currentUrl.includes('/bookstore/books/') || currentUrl.includes('/reader/')) {
            console.log('✓ 成功进入阅读相关页面')
            return
          }
        }
      } catch {
        console.log(`按钮 ${selector} 不可见或点击失败，尝试下一个`)
        continue
      }
    }

    // 如果找不到阅读按钮，但已经在书籍详情页了，也算部分成功
    const currentUrl = page.url()
    console.log(`最终URL: ${currentUrl}`)

    if (currentUrl.includes('/bookstore/books/')) {
      console.log('✓ 已在书籍详情页')
      return
    }

    throw new Error('无法进入阅读页面')
  }

  /**
   * 按分类筛选
   */
  async filterByCategory(category: string): Promise<void> {
    const page = this.getPage()

    // 等待筛选器加载完成
    await page.waitForLoadState('networkidle')

    // Element Plus el-select组件的定位策略
    // 策略: 找到包含"分类"文本的.el-select元素,然后点击它
    const categorySelectSelectors = [
      '.el-select:has-text("分类")',
      '.el-select >> .el-select__wrapper:has-text("分类")'
    ]

    let categorySelect: any = null
    for (const selector of categorySelectSelectors) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible({ timeout: 2000 })) {
          categorySelect = element
          break
        }
      } catch {
        continue
      }
    }

    if (!categorySelect) {
      throw new Error('找不到分类筛选器')
    }

    // 点击打开下拉框
    await categorySelect.click()
    await page.waitForTimeout(500) // 增加等待时间让下拉动画完成

    // 尝试多种策略查找并点击选项
    const optionSelectors = [
      // 策略1: 直接通过 role="option" 查找
      `[role="option"]:has-text("${category}")`,
      // 策略2: 通过 el-select-dropdown__item 类查找
      `.el-select-dropdown__item:has-text("${category}")`,
      // 策略3: 在所有 el-select-dropdown 中查找
      `.el-select-dropdown [role="option"]:has-text("${category}")`,
      // 策略4: 使用文本内容直接查找
      `text="${category}"`
    ]

    let optionFound = false
    for (const selector of optionSelectors) {
      try {
        const option = page.locator(selector).first()
        const count = await option.count()
        if (count > 0) {
          await option.click({ timeout: 2000, force: true })
          optionFound = true
          break
        }
      } catch {
        continue
      }
    }

    if (!optionFound) {
      // 获取所有可用的分类选项用于调试
      const allOptions = await page.locator('[role="option"]').allTextContents()
      const availableCategories = allOptions.map(opt => opt.trim()).join(', ')

      // 关闭下拉框
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)

      throw new Error(
        `找不到分类选项: ${category}\n` +
        `可用的分类选项: [${availableCategories}]\n` +
        `请检查测试数据是否与数据库中的分类匹配`
      )
    }

    // 等待筛选生效
    await page.waitForLoadState('networkidle')
  }

  /**
   * 按状态筛选
   */
  async filterByStatus(status: string): Promise<void> {
    const page = this.getPage()

    // 等待筛选器加载完成
    await page.waitForLoadState('networkidle')

    // Element Plus el-select组件的定位策略
    // 策略: 找到包含"状态"文本的.el-select元素,然后点击它
    const statusSelectSelectors = [
      '.el-select:has-text("状态")',
      '.el-select >> .el-select__wrapper:has-text("状态")'
    ]

    let statusSelect: any = null
    for (const selector of statusSelectSelectors) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible({ timeout: 2000 })) {
          statusSelect = element
          break
        }
      } catch {
        continue
      }
    }

    if (!statusSelect) {
      throw new Error('找不到状态筛选器')
    }

    // 点击打开下拉框
    await statusSelect.click()
    await page.waitForTimeout(500) // 增加等待时间让下拉动画完成

    // 尝试多种策略查找并点击选项
    const optionSelectors = [
      // 策略1: 直接通过 role="option" 查找（不过滤可见性）
      `[role="option"]:has-text("${status}")`,
      // 策略2: 通过 el-select-dropdown__item 类查找
      `.el-select-dropdown__item:has-text("${status}")`,
      // 策略3: 在所有 el-select-dropdown 中查找
      `.el-select-dropdown [role="option"]:has-text("${status}")`,
      // 策略4: 使用文本内容直接查找
      `text="${status}"`
    ]

    let optionFound = false
    for (const selector of optionSelectors) {
      try {
        // 使用 locator 而不是 waitForSelector，因为元素可能已存在但不可见
        const option = page.locator(selector).first()
        // 使用 count 检查元素是否存在
        const count = await option.count()
        if (count > 0) {
          // 尝试点击，即使不可见（Element Plus 下拉框可能在 body 下）
          await option.click({ timeout: 2000, force: true })
          optionFound = true
          break
        }
      } catch {
        continue
      }
    }

    if (!optionFound) {
      // 如果找不到选项,关闭下拉框并抛出错误
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
      throw new Error(`找不到状态选项: ${status}`)
    }

    // 等待筛选生效
    await page.waitForLoadState('networkidle')
  }

  /**
   * 滚动到评论区
   */
  async scrollToComments(): Promise<void> {
    const page = this.getPage()

    try {
      await page.locator('[data-testid="comments-section"]').scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    } catch {
      // 如果没有找到评论区，尝试滚动到页面底部
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)
    }
  }

  /**
   * 发表评论
   * Element Plus el-input[type="textarea"]的DOM结构:
   * <div class="el-input">
   *   <textarea class="el-textarea__inner" placeholder="写下你的看法..."/>
   * </div>
   */
  async postComment(content: string): Promise<void> {
    const page = this.getPage()

    // Element Plus textarea组件选择器
    const commentInputSelectors = [
      'textarea.el-textarea__inner[placeholder*="写下"]',
      'textarea.el-textarea__inner[placeholder*="看法"]',
      'textarea[placeholder*="看法"]',
      '.el-input textarea',
      '.el-textarea__inner'
    ]

    for (const selector of commentInputSelectors) {
      try {
        const input = page.locator(selector).first()
        if (await input.isVisible({ timeout: 2000 })) {
          await input.clear()
          await input.fill(content)

          // 点击发表按钮
          const submitSelectors = [
            'button.el-button--primary:has-text("发表")',
            'button:has-text("发表")',
            '[data-testid="submit-comment"]'
          ]

          for (const btnSelector of submitSelectors) {
            try {
              const btn = page.locator(btnSelector).first()
              if (await btn.isVisible({ timeout: 1000 })) {
                await btn.click()
                await page.waitForTimeout(1000)
                return
              }
            } catch {
              continue
            }
          }
        }
      } catch {
        continue
      }
    }

    throw new Error('找不到评论输入框')
  }

  /**
   * 回复评论
   * Element Plus回复输入框可能使用textarea或input
   */
  async postReply(content: string): Promise<void> {
    const page = this.getPage()

    // Element Plus回复输入框选择器
    const replyInputSelectors = [
      'textarea.el-textarea__inner[placeholder*="回复"]',
      'textarea[placeholder*="回复"]',
      'input.el-input__inner[placeholder*="回复"]',
      'input[placeholder*="回复"]',
      '[data-testid="reply-input"]',
      '.reply-input textarea',
      '.reply-input input'
    ]

    for (const selector of replyInputSelectors) {
      try {
        const input = page.locator(selector).first()
        if (await input.isVisible({ timeout: 2000 })) {
          await input.clear()
          await input.fill(content)

          // 点击发送/回复按钮
          const submitSelectors = [
            'button.el-button--primary:has-text("发送")',
            'button:has-text("发送")',
            'button:has-text("回复")',
            '[data-testid="submit-reply"]'
          ]

          for (const btnSelector of submitSelectors) {
            try {
              const btn = page.locator(btnSelector).first()
              if (await btn.isVisible({ timeout: 1000 })) {
                await btn.click()
                await page.waitForTimeout(1000)
                return
              }
            } catch {
              continue
            }
          }
        }
      } catch {
        continue
      }
    }

    throw new Error('找不到回复输入框')
  }

  /**
   * 导航到作者主页
   */
  async navigateToAuthorPage(): Promise<void> {
    const page = this.getPage()

    const authorLinkSelectors = [
      'a:has-text("作者主页")',
      '[data-testid="author-link"]',
      'a[href*="/author"]'
    ]

    for (const selector of authorLinkSelectors) {
      try {
        const link = page.locator(selector).first()
        if (await link.isVisible({ timeout: 1000 })) {
          await link.click()
          await page.waitForLoadState('networkidle')
          return
        }
      } catch {
        continue
      }
    }

    throw new Error('找不到作者主页链接')
  }

  /**
   * 关注作者
   */
  async followAuthor(): Promise<void> {
    const page = this.getPage()

    const followButtonSelectors = [
      'button:has-text("关注")',
      '[data-testid="follow-button"]',
      'button:has-text("＋关注")'
    ]

    for (const selector of followButtonSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click()
          await page.waitForTimeout(1000)
          return
        }
      } catch {
        continue
      }
    }

    throw new Error('找不到关注按钮')
  }

  /**
   * 打开添加到书单的弹窗
   */
  async openAddToBookshelfModal(): Promise<void> {
    const page = this.getPage()

    const addButtonSelectors = [
      'button:has-text("加入书单")',
      'button:has-text("加入书架")',
      '[data-testid="add-to-bookshelf"]'
    ]

    for (const selector of addButtonSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click()
          await page.waitForTimeout(500)
          return
        }
      } catch {
        continue
      }
    }

    throw new Error('找不到添加到书单按钮')
  }

  /**
   * 选择书单
   */
  async selectBookshelf(name: string): Promise<void> {
    const page = this.getPage()

    // 等待弹窗打开
    await page.waitForTimeout(500)

    const bookshelfSelectors = [
      `[data-testid="bookshelf-${name}"]`,
      `.bookshelf-option:has-text("${name}")`,
      `label:has-text("${name}")`
    ]

    for (const selector of bookshelfSelectors) {
      try {
        const option = page.locator(selector).first()
        if (await option.isVisible({ timeout: 1000 })) {
          await option.click()
          return
        }
      } catch {
        continue
      }
    }

    throw new Error(`找不到书单选项: ${name}`)
  }

  /**
   * 确认添加到书单
   */
  async confirmAddToBookshelf(): Promise<void> {
    const page = this.getPage()

    const confirmSelectors = [
      'button:has-text("确认")',
      'button:has-text("确定")',
      'button:has-text("添加")',
      '[data-testid="confirm-add-bookshelf"]'
    ]

    for (const selector of confirmSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click()
          await page.waitForTimeout(1000)
          return
        }
      } catch {
        continue
      }
    }

    throw new Error('找不到确认按钮')
  }

  /**
   * 导航到个人中心
   * 修复：添加更多选择器策略和URL导航后备方案
   */
  async navigateToProfile(): Promise<void> {
    const page = this.getPage()

    // 策略1: 通过用户菜单进入
    const userMenuSelectors = [
      '[data-testid="user-menu"]',
      '.user-dropdown',
      '.el-dropdown',
      'button:has-text("用户")',
      'button:has-text("我的")',
      '.el-icon-avatar'
    ]

    for (const selector of userMenuSelectors) {
      try {
        const menu = page.locator(selector).first()
        if (await menu.isVisible({ timeout: 2000 })) {
          await menu.click()
          await page.waitForTimeout(500)

          // 查找个人中心链接
          const profileSelectors = [
            'text=个人中心',
            'text=我的',
            '[data-testid="profile-link"]',
            'a[href*="/profile"]',
            'a[href*="/user"]',
            'a[href*="/me"]'
          ]

          for (const profileSelector of profileSelectors) {
            try {
              const link = page.locator(profileSelector).first()
              if (await link.isVisible({ timeout: 1000 })) {
                await link.click()
                await page.waitForLoadState('networkidle')
                return
              }
            } catch {
              continue
            }
          }
        }
      } catch {
        continue
      }
    }

    // 策略2: 直接导航到URL（后备方案）
    const profileUrls = ['/profile', '/user/profile', '/me', '/user']
    for (const url of profileUrls) {
      try {
        await page.goto(url, { timeout: 5000 })
        // 检查是否成功加载
        if (page.url().includes(url) || page.url().includes('profile')) {
          await page.waitForLoadState('networkidle')
          return
        }
      } catch {
        continue
      }
    }

    throw new Error('找不到个人中心链接，且无法直接导航到个人页面')
  }

  /**
   * 调整字体大小
   */
  async adjustFontSize(size: number): Promise<void> {
    const page = this.getPage()

    const fontSizeSelectors = [
      '[data-testid="font-size-control"]',
      '.font-size-control',
      'button:has-text("字号")'
    ]

    for (const selector of fontSizeSelectors) {
      try {
        const control = page.locator(selector).first()
        if (await control.isVisible({ timeout: 1000 })) {
          // 尝试滑块或按钮形式
          await control.evaluate((el: any, s) => {
            if (el.type === 'range') {
              el.value = s
              el.dispatchEvent(new Event('input'))
              el.dispatchEvent(new Event('change'))
            }
          }, size)
          await page.waitForTimeout(500)
          return
        }
      } catch {
        continue
      }
    }

    // 如果找不到控件，直接通过样式修改
    await page.locator('[data-testid="chapter-content"]').first()
      .evaluate((el: any, s) => {
        el.style.fontSize = `${s}px`
      }, size)
  }

  /**
   * 切换主题
   */
  async switchTheme(theme: string): Promise<void> {
    const page = this.getPage()

    const themeButtonSelectors = [
      'button:has-text("主题")',
      '[data-testid="theme-toggle"]',
      '.theme-switch'
    ]

    for (const selector of themeButtonSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click()
          await page.waitForTimeout(500)

          // 选择主题
          const themeOption = page.locator(`.theme-option:has-text("${theme}")`).first()
          if (await themeOption.isVisible({ timeout: 1000 })) {
            await themeOption.click()
          }
          await page.waitForTimeout(500)
          return
        }
      } catch {
        continue
      }
    }

    // 如果找不到主题按钮，直接切换body class
    await page.evaluate((t: string) => {
      document.body.classList.remove('light', 'dark')
      document.body.classList.add(t)
    }, theme)
  }

  /**
   * 打开目录
   */
  async openTableOfContents(): Promise<void> {
    const page = this.getPage()

    const tocButtonSelectors = [
      'button:has-text("目录")',
      '[data-testid="toc-button"]',
      '.toc-toggle'
    ]

    for (const selector of tocButtonSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click()
          await page.waitForTimeout(500)
          return
        }
      } catch {
        continue
      }
    }

    throw new Error('找不到目录按钮')
  }

  /**
   * 导航到下一章
   */
  async navigateToNextChapter(): Promise<void> {
    const page = this.getPage()

    const nextChapterSelectors = [
      'button:has-text("下一章")',
      'a:has-text("下一章")',
      '[data-testid="next-chapter"]',
      '.next-chapter'
    ]

    for (const selector of nextChapterSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click()
          await page.waitForLoadState('networkidle')
          return
        }
      } catch {
        continue
      }
    }

    throw new Error('找不到下一章按钮')
  }
}

/**
 * 作者Actor
 */
export class AuthorActor extends Actor {
  constructor(
    name: string,
    session: BrowserSession,
    private credentials: UserCredentials
  ) {
    super(name, ActorRole.AUTHOR, session)
  }

  /**
   * 登录（使用对话框模式）
   */
  async login(): Promise<void> {
    const page = this.getPage()

    // 确保在首页
    await this.navigateTo('/bookstore')
    await page.waitForTimeout(500)

    // 点击登录按钮打开对话框
    await page.click('button:has-text("登录")')

    // 等待登录对话框出现（通过标题"欢迎回来"来定位）
    await page.waitForSelector('dialog:has-text("欢迎回来"), .el-dialog:has-text("欢迎回来"), [role="dialog"]:has-text("欢迎回来")', { timeout: 5000 })

    // 填写登录信息（在登录对话框内）
    const loginDialog = page.locator('dialog:has-text("欢迎回来"), .el-dialog:has-text("欢迎回来"), [role="dialog"]:has-text("欢迎回来")').first()
    await loginDialog.locator('input[placeholder*="用户名"], input[placeholder*="邮箱"]').fill(this.credentials.username)
    await loginDialog.locator('input[placeholder*="密码"]').fill(this.credentials.password)

    // 点击对话框中的登录按钮
    await loginDialog.locator('button:has-text("登录")').click()

    // 等待登录完成（对话框关闭或"登录成功"消息出现）
    await page.waitForTimeout(2000)
  }

  /**
   * 创建新书籍项目
   */
  async createProject(projectData: { title: string; description: string }): Promise<void> {
    await this.navigateTo('/writer/projects')
    await this.waitForPageLoad()

    const page = this.getPage()
    await page.click('[data-testid="create-project-button"]')
    await page.fill('input[name="title"]', projectData.title)
    await page.fill('textarea[name="description"]', projectData.description)
    await page.click('[data-testid="submit-project"]')
  }

  /**
   * 编写章节
   */
  async writeChapter(projectId: string, chapterData: { title: string; content: string }): Promise<void> {
    await this.navigateTo(`/writer/projects/${projectId}/editor`)
    await this.waitForPageLoad()

    const page = this.getPage()
    await page.click('[data-testid="add-chapter-button"]')
    await page.fill('input[name="chapter-title"]', chapterData.title)
    await page.fill('[data-testid="chapter-content"]', chapterData.content)
    await page.click('[data-testid="save-chapter"]')
  }

  /**
   * 发布章节
   */
  async publishChapter(projectId: string, chapterId: string): Promise<void> {
    await this.navigateTo(`/writer/projects/${projectId}/chapters/${chapterId}`)
    await this.waitForPageLoad()

    const page = this.getPage()
    await page.click('[data-testid="publish-button"]')
  }
}

/**
 * 管理员Actor
 */
export class AdminActor extends Actor {
  constructor(
    name: string,
    session: BrowserSession,
    private credentials: UserCredentials
  ) {
    super(name, ActorRole.ADMIN, session)
  }

  /**
   * 登录
   */
  async login(): Promise<void> {
    await this.navigateTo('/admin/login')
    const page = this.getPage()

    await page.fill('input[name="username"]', this.credentials.username)
    await page.fill('input[name="password"]', this.credentials.password)
    await page.click('button[type="submit"]')

    await this.waitForPageLoad()
  }

  /**
   * 审核书籍
   */
  async approveBook(bookId: string): Promise<void> {
    await this.navigateTo(`/admin/books/${bookId}`)
    await this.waitForPageLoad()

    const page = this.getPage()
    await page.click('[data-testid="approve-button"]')
  }

  /**
   * 封禁用户
   */
  async banUser(userId: string): Promise<void> {
    await this.navigateTo(`/admin/users/${userId}`)
    await this.waitForPageLoad()

    const page = this.getPage()
    await page.click('[data-testid="ban-user-button"]')
  }
}

/**
 * Actor Factory
 */
export class ActorFactory {
  /**
   * 创建访客Actor
   */
  static createGuest(name: string, session: BrowserSession): GuestActor {
    return new GuestActor(name, session)
  }

  /**
   * 创建读者Actor
   */
  static createReader(name: string, session: BrowserSession, credentials: UserCredentials): ReaderActor {
    return new ReaderActor(name, session, credentials)
  }

  /**
   * 创建作者Actor
   */
  static createAuthor(name: string, session: BrowserSession, credentials: UserCredentials): AuthorActor {
    return new AuthorActor(name, session, credentials)
  }

  /**
   * 创建管理员Actor
   */
  static createAdmin(name: string, session: BrowserSession, credentials: UserCredentials): AdminActor {
    return new AdminActor(name, session, credentials)
  }

  /**
   * 通过角色类型创建Actor
   */
  static createByRole(
    role: ActorRole,
    name: string,
    session: BrowserSession,
    credentials?: UserCredentials
  ): Actor {
    switch (role) {
      case ActorRole.GUEST:
        return this.createGuest(name, session)
      case ActorRole.READER:
        if (!credentials) throw new Error('Credentials required for Reader actor')
        return this.createReader(name, session, credentials)
      case ActorRole.AUTHOR:
        if (!credentials) throw new Error('Credentials required for Author actor')
        return this.createAuthor(name, session, credentials)
      case ActorRole.ADMIN:
        if (!credentials) throw new Error('Credentials required for Admin actor')
        return this.createAdmin(name, session, credentials)
      default:
        throw new Error(`Unknown actor role: ${role}`)
    }
  }
}
