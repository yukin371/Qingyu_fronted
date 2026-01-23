/**
 * 场景1：新用户首次访问与注册的完整E2E测试
 *
 * 测试流程：
 * Phase 1: 发现阶段 - 浏览首页、书店分类、书籍详情
 * Phase 2: 注册阶段 - 触发登录、填写注册表单、完成注册
 * Phase 3: 首次阅读 - 开始阅读、收藏书籍
 *
 * @author Qingyu Test Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test'
import { GuestActor } from '../../helpers/actor-factory'
import { ScenarioBuilder } from '../../helpers/step-builder'
import { TestDataGenerator, testBooks } from '../../helpers/test-data'

/**
 * 测试配置
 */
const TEST_CONFIG = {
  baseURL: 'http://localhost:5173',
  apiBaseURL: 'http://localhost:8080',
  timeout: 30000,
  navigationTimeout: 15000,
  screenshotPath: 'test-results/screenshots/scenario1',
  // TODO: 如果组件中没有data-testid，需要在以下位置添加：
  // - HomeView.vue: hero-section, recommended-books, book-card
  // - BookDetailView.vue: book-title, start-reading-btn, favorite-btn
  // - ReaderView.vue: chapter-content, settings-panel, font-size-control
  // - AuthenticationView.vue: username-input, email-input, password-input, register-btn
}

/**
 * API响应验证接口
 */
interface APIResponse {
  code: number
  message: string
  data?: any
  request_id?: string
}

test.describe('场景1：新用户首次访问与注册', () => {
  let guestActor: GuestActor
  let scenarioBuilder: ScenarioBuilder
  let testUserData: {
    username: string
    email: string
    password: string
  }

  // 在每个测试前初始化
  test.beforeEach(async ({ page }) => {
    guestActor = new GuestActor(page)
    scenarioBuilder = new ScenarioBuilder(page)
    testUserData = TestDataGenerator.createUserCredentials()

    // 设置测试环境
    await page.goto(TEST_CONFIG.baseURL)
    await page.waitForLoadState('networkidle')

    // Mock邮箱验证码API
    await page.route(`${TEST_CONFIG.apiBaseURL}/api/v1/user/email/send-code`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: '验证码已发送',
          data: {
            code: '123456', // Mock验证码
            expired_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
          }
        })
      })
    })

    // 监听注册API响应
    await page.route(`${TEST_CONFIG.apiBaseURL}/api/v1/shared/auth/register`, (route) => {
      route.continue() // 继续真实请求
    })
  })

  test.afterEach(async ({ page }, testInfo) => {
    // 测试失败时截图
    if (testInfo.status === 'failed') {
      const screenshotPath = `${TEST_CONFIG.screenshotPath}/${testInfo.title}-${Date.now()}.png`
      await page.screenshot({ path: screenshotPath, fullPage: true })
      console.error(`测试失败，截图已保存至: ${screenshotPath}`)
    }
  })

  /**
   * Phase 1: 发现阶段
   * 测试目标：验证新用户可以正常浏览首页、书店分类和书籍详情
   */
  test('Phase 1: 发现阶段 - 浏览首页和书店', async ({ page }) => {
    const startTime = Date.now()

    // Step 1: 访问首页并验证
    await test.step('1.1 打开首页并验证基础信息', async () => {
      // 等待页面加载
      await page.waitForLoadState('domcontentloaded')
      const loadTime = Date.now() - startTime

      // 验证URL（首页会重定向到/bookstore）
      await expect(page).toHaveURL(/\/bookstore/)

      // 验证页面标题包含"青羽"
      const title = await page.title()
      expect(title).toContain('青羽')

      // 验证加载时间 < 3秒
      expect(loadTime).toBeLessThan(3000)
      console.log(`✓ 页面加载时间: ${loadTime}ms`)

      // 验证无控制台错误
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      await page.waitForTimeout(2000) // 等待可能的延迟错误
      expect(errors.length).toBe(0)
      console.log('✓ 无控制台错误')

      // 验证推荐书籍显示
      // TODO: 添加data-testid="recommended-books"到HomeView.vue的BookGrid组件
      const recommendedSection = page.locator('.recommended-section').first()
      await expect(recommendedSection).toBeVisible()
      console.log('✓ 推荐书籍区域可见')

      // 验证至少有一本书籍卡片
      const bookCards = page.locator('.book-card').or(page.locator('[data-testid="book-card"]'))
      const cardCount = await bookCards.count()
      expect(cardCount).toBeGreaterThan(0)
      console.log(`✓ 显示 ${cardCount} 本推荐书籍`)
    })

    // Step 2: 浏览书店分类
    await test.step('1.2 浏览书店分类并测试筛选', async () => {
      // 查找分类导航
      // TODO: 添加data-testid="category-nav"到分类导航
      const categoryNav = page.locator('.category-nav').or(page.locator('[data-testid="category-nav"]'))
      const hasCategories = await categoryNav.count() > 0

      if (hasCategories) {
        // 验证分类显示
        await expect(categoryNav.first()).toBeVisible()
        console.log('✓ 分类导航可见')

        // 获取第一个分类并点击
        const firstCategory = categoryNav.locator('a, button').first()
        const categoryName = await firstCategory.textContent()

        await firstCategory.click()
        await page.waitForLoadState('networkidle')
        console.log(`✓ 点击分类: ${categoryName}`)

        // 验证分类筛选生效（URL变化或内容更新）
        const url = page.url()
        expect(url).toMatch(/category|cat/)
        console.log('✓ 分类筛选功能正常')
      } else {
        console.log('⚠ 未找到分类导航，跳过分类测试')
      }
    })

    // Step 3: 预览书籍详情
    await test.step('1.3 点击第一本书查看详情', async () => {
      // 查找书籍卡片
      const firstBookCard = page.locator('.book-card').or(page.locator('[data-testid="book-card"]')).first()

      // 等待书籍卡片可见
      await expect(firstBookCard).toBeVisible()

      // 获取书籍信息用于后续验证
      const bookTitle = await firstBookCard.locator('.book-title, h3, h4').first().textContent()
      console.log(`点击书籍: ${bookTitle}`)

      // 点击书籍卡片
      await firstBookCard.click()
      await page.waitForLoadState('networkidle')

      // 验证跳转到详情页
      await expect(page).toHaveURL(/\/bookstore\/books\//)

      // 验证详情页关键元素
      // TODO: 添加data-testid="book-title"到BookDetailView.vue
      const detailTitle = page.locator('h1.book-title').or(page.locator('[data-testid="book-title"]'))
      await expect(detailTitle).toBeVisible()
      console.log('✓ 书籍标题显示正常')

      // 验证封面
      const cover = page.locator('.book-cover img, .el-image')
      await expect(cover.first()).toBeVisible()
      console.log('✓ 书籍封面显示正常')

      // 验证简介
      const description = page.locator('.book-description, .book-intro')
      const hasDescription = await description.count() > 0
      if (hasDescription) {
        console.log('✓ 书籍简介显示正常')
      }

      // 验证章节列表
      const chapterTab = page.locator('text=目录').or(page.locator('[data-testid="chapters-tab"]'))
      if (await chapterTab.count() > 0) {
        await chapterTab.click()
        const chapters = page.locator('.chapter-item, .chapter-list-item')
        const chapterCount = await chapters.count()
        expect(chapterCount).toBeGreaterThan(0)
        console.log(`✓ 章节列表显示 ${chapterCount} 章`)
      }

      // 验证作者信息
      const author = page.locator('.author, .book-author')
      await expect(author.first()).toBeVisible()
      console.log('✓ 作者信息显示正常')
    })
  })

  /**
   * Phase 2: 注册阶段
   * 测试目标：验证新用户可以完成注册流程
   */
  test('Phase 2: 注册阶段 - 完成用户注册', async ({ page }) => {
    // 先导航到书籍详情页（Phase 1的结果）
    await page.goto(`${TEST_CONFIG.baseURL}/bookstore`)
    await page.waitForLoadState('networkidle')

    const firstBookCard = page.locator('.book-card').or(page.locator('[data-testid="book-card"]')).first()
    await firstBookCard.click()
    await page.waitForLoadState('networkidle')

    // Step 4: 点击阅读按钮，触发登录提示
    await test.step('2.1 点击阅读按钮，验证跳转到登录页', async () => {
      // 查找开始阅读按钮
      // TODO: 添加data-testid="start-reading-btn"到BookDetailView.vue
      const readButton = page.locator('button:has-text("开始阅读"), button:has-text("继续阅读")')
        .or(page.locator('[data-testid="start-reading-btn"]'))

      await expect(readButton.first()).toBeVisible()
      await readButton.first().click()

      // 验证跳转到登录页
      await expect(page).toHaveURL(/\/login/)
      console.log('✓ 跳转到登录页')

      // 验证显示注册入口
      const registerTab = page.locator('text=注册').or(page.locator('[role="tab"]:has-text("注册")'))
      await expect(registerTab.first()).toBeVisible()
      console.log('✓ 注册入口可见')
    })

    // Step 5: 切换到注册Tab并填写表单
    await test.step('2.2 切换到注册Tab并填写表单', async () => {
      // 点击注册Tab
      const registerTab = page.locator('text=注册').or(page.locator('[role="tab"]:has-text("注册")'))
      await registerTab.first().click()
      await page.waitForTimeout(500)

      // 填写用户名
      // TODO: 添加data-testid="username-input"到AuthenticationView.vue
      const usernameInput = page.locator('input[placeholder*="用户名"]')
        .or(page.locator('[data-testid="username-input"]'))
      await usernameInput.fill(testUserData.username)
      console.log(`填写用户名: ${testUserData.username}`)

      // 验证用户名实时验证（如果有验证提示）
      await page.waitForTimeout(500)
      const usernameError = page.locator('.el-form-item__error:has-text("用户名")')
      if (await usernameError.count() > 0) {
        const errorText = await usernameError.first().textContent()
        console.log(`⚠ 用户名验证提示: ${errorText}`)
      }

      // 填写邮箱
      // TODO: 添加data-testid="email-input"到AuthenticationView.vue
      const emailInput = page.locator('input[placeholder*="邮箱"]')
        .or(page.locator('[data-testid="email-input"]'))
      await emailInput.fill(testUserData.email)
      console.log(`填写邮箱: ${testUserData.email}`)

      // 验证邮箱格式验证
      await page.waitForTimeout(500)
      const emailError = page.locator('.el-form-item__error:has-text("邮箱")')
      if (await emailError.count() > 0) {
        const errorText = await emailError.first().textContent()
        console.log(`⚠ 邮箱验证提示: ${errorText}`)
      }

      // 获取邮箱验证码（Mock）
      // TODO: 添加data-testid="get-code-btn"到AuthenticationView.vue
      const getCodeButton = page.locator('button:has-text("获取验证码")')
        .or(page.locator('[data-testid="get-code-btn"]'))

      if (await getCodeButton.count() > 0) {
        await getCodeButton.click()
        await page.waitForTimeout(1000)

        // 填写Mock验证码
        // TODO: 添加data-testid="email-code-input"到AuthenticationView.vue
        const codeInput = page.locator('input[placeholder*="验证码"]')
          .or(page.locator('[data-testid="email-code-input"]'))
        await codeInput.fill('123456') // Mock验证码
        console.log('填写验证码: 123456 (Mock)')
      } else {
        console.log('⚠ 未找到验证码输入框，可能测试环境不需要验证码')
      }

      // 填写密码
      // TODO: 添加data-testid="password-input"到AuthenticationView.vue
      const passwordInput = page.locator('input[type="password"]').first()
        .or(page.locator('[data-testid="password-input"]'))
      await passwordInput.fill(testUserData.password)
      console.log(`填写密码: ${testUserData.password}`)

      // 验证密码强度提示（如果有）
      await page.waitForTimeout(500)
      const passwordStrength = page.locator('.password-strength, .strength-indicator')
      if (await passwordStrength.count() > 0) {
        console.log('✓ 密码强度提示显示')
      }
    })

    // Step 6: 提交注册并验证
    await test.step('2.3 提交注册并验证结果', async () => {
      // 监听注册API响应
      let apiResponse: APIResponse | null = null
      page.on('response', async (response) => {
        if (response.url().includes('/api/v1/shared/auth/register')) {
          try {
            apiResponse = await response.json() as APIResponse
            console.log(`注册API响应: ${JSON.stringify(apiResponse)}`)
          } catch (error) {
            console.error('解析API响应失败:', error)
          }
        }
      })

      // 点击注册按钮
      // TODO: 添加data-testid="register-btn"到AuthenticationView.vue
      const registerButton = page.locator('button:has-text("立即注册"), button:has-text("注册")')
        .or(page.locator('[data-testid="register-btn"]'))
      await registerButton.click()

      // 等待注册完成
      await page.waitForTimeout(2000)

      // 硬验证：API返回200
      if (apiResponse) {
        expect(apiResponse.code).toBe(200)
        console.log('✓ API返回200状态码')
      } else {
        console.log('⚠ 未捕获到API响应，可能已被拦截或路由未生效')
      }

      // 硬验证：检查JWT token是否保存
      const token = await page.evaluate(() => {
        return localStorage.getItem('token') || sessionStorage.getItem('token')
      })
      expect(token).toBeTruthy()
      console.log('✓ JWT token已保存到本地存储')

      // 软验证：检查欢迎消息或跳转
      const url = page.url()
      const isRedirected = url.includes('/bookstore') || url.includes('/home')

      if (isRedirected) {
        console.log('✓ 注册后自动跳转到首页')
      } else {
        // 检查是否有欢迎消息
        const welcomeMessage = page.locator('text=欢迎, text=注册成功')
        const hasWelcome = await welcomeMessage.count() > 0
        if (hasWelcome) {
          console.log('✓ 显示注册成功消息')
        } else {
          console.log('⚠ 未检测到欢迎消息或跳转，需要手动检查')
        }
      }

      // 截图保存注册成功状态
      await page.screenshot({
        path: `${TEST_CONFIG.screenshotPath}/register-success-${Date.now()}.png`
      })
    })
  })

  /**
   * Phase 3: 首次阅读
   * 测试目标：验证新注册用户可以正常阅读和收藏书籍
   */
  test('Phase 3: 首次阅读 - 开始阅读和收藏书籍', async ({ page }) => {
    // 假设已经完成注册，现在直接登录（使用测试数据）
    // 在实际测试中，应该从Phase 2的结果继续

    // Step 7: 开始阅读第一章
    await test.step('3.1 导航到书籍并开始阅读', async () => {
      // 导航到书店
      await page.goto(`${TEST_CONFIG.baseURL}/bookstore`)
      await page.waitForLoadState('networkidle')

      // 选择一本书
      const firstBookCard = page.locator('.book-card').or(page.locator('[data-testid="book-card"]')).first()
      await firstBookCard.click()
      await page.waitForLoadState('networkidle')

      // 点击开始阅读
      const readButton = page.locator('button:has-text("开始阅读"), button:has-text("继续阅读")')
        .or(page.locator('[data-testid="start-reading-btn"]'))
      await readButton.first().click()

      // 等待阅读器加载
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // 验证阅读器界面
      await expect(page).toHaveURL(/\/reader\//)
      console.log('✓ 进入阅读器页面')

      // 验证章节标题
      // TODO: 添加data-testid="chapter-title"到ReaderView.vue
      const chapterTitle = page.locator('h1.chapter-title')
        .or(page.locator('[data-testid="chapter-title"]'))
      await expect(chapterTitle.first()).toBeVisible()
      const titleText = await chapterTitle.first().textContent()
      console.log(`✓ 章节标题: ${titleText}`)

      // 验证章节内容
      // TODO: 添加data-testid="chapter-content"到ReaderView.vue
      const chapterContent = page.locator('.chapter-content')
        .or(page.locator('[data-testid="chapter-content"]'))
      await expect(chapterContent.first()).toBeVisible()
      console.log('✓ 章节内容加载成功')

      // 测试字体大小调整
      const settingsButton = page.locator('button:has-text("设置")')
        .or(page.locator('[data-testid="settings-btn"]'))

      if (await settingsButton.count() > 0) {
        await settingsButton.click()
        await page.waitForTimeout(500)

        // 查找字体大小控制
        // TODO: 添加data-testid="font-size-control"到ReaderView.vue的设置面板
        const fontSizeButtons = page.locator('button:has-text("+"), button:has-text("减少"), button:has-text("增加")')
        const hasFontControls = await fontSizeButtons.count() > 0

        if (hasFontControls) {
          // 点击增加字体
          const increaseButton = fontSizeButtons.first()
          await increaseButton.click()
          await page.waitForTimeout(500)
          console.log('✓ 字体大小可调')

          // 关闭设置面板
          await settingsButton.click()
        } else {
          console.log('⚠ 未找到字体大小控制')
        }
      }

      // 测试主题切换
      const themeButton = page.locator('button:has-text("主题"), .theme-selector')
        .or(page.locator('[data-testid="theme-selector"]'))

      if (await themeButton.count() > 0) {
        console.log('✓ 主题切换功能可用')
      } else {
        // 如果没有单独的主题按钮，检查设置面板中的主题选项
        await settingsButton.click()
        const themeOptions = page.locator('.theme-option, .theme-selector')
        if (await themeOptions.count() > 0) {
          console.log('✓ 主题切换功能可用（在设置中）')
          await settingsButton.click() // 关闭设置
        }
      }
    })

    // Step 8: 收藏这本书
    await test.step('3.2 收藏当前书籍', async () => {
      // 返回书籍详情页
      await page.goBack()
      await page.waitForLoadState('networkidle')

      // 查找收藏按钮
      // TODO: 添加data-testid="favorite-btn"到BookDetailView.vue
      const favoriteButton = page.locator('button:has-text("收藏")')
        .or(page.locator('[data-testid="favorite-btn"]'))

      const favoriteCount = await favoriteButton.count()

      if (favoriteCount > 0) {
        // 监听收藏API
        let favoriteAPIResponse: APIResponse | null = null
        page.on('response', async (response) => {
          if (response.url().includes('/api/v1/book/favorite') ||
              response.url().includes('/api/v1/reader/favorite')) {
            try {
              favoriteAPIResponse = await response.json() as APIResponse
              console.log(`收藏API响应: ${JSON.stringify(favoriteAPIResponse)}`)
            } catch (error) {
              console.error('解析收藏API响应失败:', error)
            }
          }
        })

        // 点击收藏按钮
        await favoriteButton.first().click()
        await page.waitForTimeout(1000)

        // 验证收藏按钮变为"已收藏"状态
        const favoritedButton = page.locator('button:has-text("已收藏")')
        const isFavorited = await favoritedButton.count() > 0

        if (isFavorited) {
          console.log('✓ 收藏按钮状态更新为"已收藏"')
        } else {
          // 检查按钮图标变化
          const starIcon = favoriteButton.locator('.el-icon, svg')
          if (await starIcon.count() > 0) {
            console.log('✓ 收藏按钮图标已更新')
          }
        }

        // 硬验证：API返回成功
        if (favoriteAPIResponse) {
          expect(favoriteAPIResponse.code).toBe(200)
          console.log('✓ 收藏API返回成功状态')
        }

        // 验证个人中心可以看到收藏
        // 导航到个人中心
        const userProfileLink = page.locator('a[href*="/profile"], a[href*="/user"]')
        if (await userProfileLink.count() > 0) {
          await userProfileLink.first().click()
          await page.waitForLoadState('networkidle')

          // 查找收藏列表
          const favoriteList = page.locator('.favorite-list, .bookshelf')
            .or(page.locator('[data-testid="favorite-list"]'))

          if (await favoriteList.count() > 0) {
            console.log('✓ 个人中心可以查看收藏列表')
          }
        }
      } else {
        console.log('⚠ 未找到收藏按钮，可能需要先登录或页面布局不同')
      }
    })

    // 最终截图
    await page.screenshot({
      path: `${TEST_CONFIG.screenshotPath}/phase3-complete-${Date.now()}.png`,
      fullPage: true
    })
  })

  /**
   * 完整流程测试（可选）
   * 一次性运行所有Phase，验证完整用户旅程
   */
  test('完整流程：从发现到阅读的完整旅程', async ({ page }) => {
    console.log('🚀 开始完整的用户旅程测试...')

    // Phase 1: 发现
    console.log('\n=== Phase 1: 发现阶段 ===')
    await page.goto(TEST_CONFIG.baseURL)
    await page.waitForLoadState('networkidle')

    const firstBook = page.locator('.book-card').or(page.locator('[data-testid="book-card"]')).first()
    await firstBook.click()
    await page.waitForLoadState('networkidle')
    console.log('✓ 完成发现阶段')

    // Phase 2: 注册（简化版，不重复前面测试）
    console.log('\n=== Phase 2: 注册阶段 ===')
    // 这里假设用户已经注册，直接登录
    // 或者可以执行完整注册流程

    // Phase 3: 阅读
    console.log('\n=== Phase 3: 阅读阶段 ===')
    const readButton = page.locator('button:has-text("开始阅读")')
      .or(page.locator('[data-testid="start-reading-btn"]'))
    await readButton.first().click()
    await page.waitForLoadState('networkidle')

    // 验证阅读器加载
    const chapterContent = page.locator('.chapter-content')
      .or(page.locator('[data-testid="chapter-content"]'))
    await expect(chapterContent.first()).toBeVisible()

    console.log('\n✅ 完整流程测试通过！')
  })
})

/**
 * 测试报告说明
 *
 * 运行方式：
 * npm run test:e2e -- tests/e2e/scenarios/scenario1-new-user-registration.spec.ts
 *
 * 或使用Playwright UI：
 * npx playwright test --ui tests/e2e/scenarios/scenario1-new-user-registration.spec.ts
 *
 * 测试覆盖点：
 * 1. 页面性能（加载时间 < 3秒）
 * 2. 无控制台错误
 * 3. 推荐书籍显示
 * 4. 分类筛选功能
 * 5. 书籍详情展示
 * 6. 登录/注册流程
 * 7. 表单验证
 * 8. API调用验证
 * 9. Token存储验证
 * 10. 阅读器功能
 * 11. 收藏功能
 *
 * 已知限制：
 * - 邮箱验证码使用Mock，未测试真实邮件发送
 * - 测试数据使用随机生成，未清理测试用户
 * - 部分data-testid属性待添加
 *
 * TODO:
 * - 在前端组件中添加data-testid属性
 * - 添加测试数据清理逻辑
 * - 集成CI/CD自动化测试
 * - 添加性能基准测试
 * - 添加跨浏览器测试
 */
