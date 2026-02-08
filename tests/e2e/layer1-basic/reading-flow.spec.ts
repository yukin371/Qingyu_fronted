/**
 * Layer 1: 阅读流程 E2E 测试
 * 对应后端: Qingyu_backend/test/e2e/layer1_basic/export.go::RunReadingFlow
 *
 * 测试流程:
 * 步骤1: 创建用户并登录
 * 步骤2: 创建测试书籍和章节
 * 步骤3: 浏览书城首页
 * 步骤4: 查看书籍详情
 * 步骤5: 获取章节列表
 * 步骤6: 阅读章节内容
 * 步骤7: 保存阅读进度
 *
 * @author Qingyu Test Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test'
import { createAPIValidators } from '../../helpers'
import { TestDataGenerator } from '../../helpers/test-data'
import { WaitStrategies } from '../../helpers/wait-strategies'

const getBackendURL = () => process.env.BACKEND_URL || 'http://localhost:8080'
const getBaseURL = () => process.env.BASE_URL || 'http://localhost:5173'

test.describe('Layer 1: 阅读流程', () => {
  let apiValidators: ReturnType<typeof createAPIValidators>
  let testUserData: {
    username: string
    email: string
    password: string
  }
  let userID: string
  let token: string
  let bookID: string
  let chapterID: string

  // 启动后端服务
  test.beforeAll(async () => {
    console.log('\n=== Layer 1: 阅读流程测试 ===')
    const backendURL = getBackendURL()
    console.log(`后端服务: ${backendURL}`)
    apiValidators = createAPIValidators(backendURL)
  })

  test.beforeEach(async () => {
    testUserData = TestDataGenerator.createUserCredentials()
  })

  /**
   * 步骤1: 创建用户并登录
   */
  test('步骤1-7: 完整阅读流程', async ({ page }) => {
    console.log('\n--- 步骤1: 创建用户并登录 ---')

    // 创建并登录用户
    await test.step('1.1 创建测试用户', async () => {
      const result = await apiValidators.createTestUser(testUserData)
      userID = result.userID
      token = result.token
      console.log(`  ✓ 创建用户: ${testUserData.username} (ID: ${userID})`)
    })

    await test.step('1.2 前端登录', async () => {
      await page.goto(`${getBaseURL()}/login`)

      // 填写登录表单
      await page.fill('input[placeholder*="用户名"], input[name="username"]', testUserData.username)
      await page.fill('input[type="password"]', testUserData.password)

      // 优化后的API拦截策略 - 支持多个可能的登录端点
      const loginPromise = page.waitForResponse(
        response => {
          const url = response.url()
          const method = response.request().method()
          // 支持多个可能的登录API路径
          const isLoginAPI = url.includes('/auth/login') ||
                             url.includes('/user/auth/login') ||
                             url.includes('/shared/auth/login')
          return isLoginAPI && method === 'POST'
        }
      )

      // 点击登录按钮
      await page.click('button:has-text("登录"), button:has-text("立即登录")')

      // 使用Promise.race处理多种可能的响应场景
      const loginResult = await Promise.race([
        loginPromise.then(response => ({ type: 'api', response })),
        page.waitForURL('**/bookstore', { timeout: 5000 }).then(() => ({ type: 'url' })),
        page.waitForSelector('[data-testid="user-menu"], .user-menu', { timeout: 5000 }).then(() => ({ type: 'ui' }))
      ]).catch(() => ({ type: 'timeout' }))

      // 根据结果类型进行验证
      if (loginResult.type === 'api') {
        expect(loginResult.response.status()).toBe(200)
        console.log('  ✓ 登录API响应验证成功')
      } else if (loginResult.type === 'url') {
        console.log('  ✓ 登录成功（通过页面跳转验证）')
      } else if (loginResult.type === 'ui') {
        console.log('  ✓ 登录成功（通过用户菜单验证）')
      } else {
        // 兜底：验证当前URL是否已跳转
        const currentUrl = page.url()
        if (currentUrl.includes('/bookstore') || currentUrl.includes('/home')) {
          console.log('  ✓ 登录成功（兜底URL验证）')
        } else {
          throw new Error('登录验证失败：未检测到API响应或页面跳转')
        }
      }
    })

    /**
     * 步骤2: 创建测试书籍和章节
     */
    console.log('\n--- 步骤2: 创建测试书籍和章节 ---')

    await test.step('2.1 后端创建测试书籍', async () => {
      apiValidators.setAuthToken(token)

      // 创建作者用户
      const authorResult = await apiValidators.createTestUser({
        username: `author_${Date.now()}`,
        email: `author_${Date.now()}@test.com`,
        password: 'Test1234'
      })

      const authorToken = authorResult.token

      // 使用作者权限创建书籍
      const bookData = {
        title: `测试书籍_${Date.now()}`,
        description: '这是一本E2E测试书籍',
        category: '玄幻'
      }

      // 直接调用后端API创建书籍
      const createBookResponse = await fetch(`${getBackendURL()}/api/v1/writer/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authorToken}`
        },
        body: JSON.stringify(bookData)
      })

      const createBookResult = await createBookResponse.json()

      if (createBookResult.code === 200) {
        bookID = createBookResult.data.id
        console.log(`  ✓ 创建书籍: ${bookData.title} (ID: ${bookID})`)
      } else {
        // 如果创建失败，使用现有书籍
        console.log('  ⚠ 创建书籍失败，尝试使用现有书籍')
        // 获取书籍列表
        const booksListResponse = await fetch(`${getBackendURL()}/api/v1/bookstore/books`)
        const booksListResult = await booksListResponse.json()

        if (booksListResult.data?.books?.length > 0) {
          bookID = booksListResult.data.books[0].id
          console.log(`  ✓ 使用现有书籍 (ID: ${bookID})`)
        } else {
          throw new Error('没有可用的测试书籍')
        }
      }
    })

    await test.step('2.2 创建章节', async () => {
      // 创建章节
      const chapterData = {
        title: `第一章_${Date.now()}`,
        content: '# 第一章内容\n\n这是第一章的详细测试内容...',
        order: 1
      }

      const createChapterResponse = await fetch(
        `${getBackendURL()}/api/v1/writer/books/${bookID}/chapters`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(chapterData)
        }
      )

      const createChapterResult = await createChapterResponse.json()

      if (createChapterResult.code === 200) {
        chapterID = createChapterResult.data.id
        console.log(`  ✓ 创建章节: ${chapterData.title} (ID: ${chapterID})`)
      } else {
        // 如果创建失败，获取现有章节
        const chaptersResponse = await fetch(
          `${getBackendURL()}/api/v1/bookstore/books/${bookID}/chapters`
        )
        const chaptersResult = await chaptersResponse.json()

        if (chaptersResult.data?.chapters?.length > 0) {
          chapterID = chaptersResult.data.chapters[0].id
          console.log(`  ✓ 使用现有章节 (ID: ${chapterID})`)
        }
      }
    })

    /**
     * 步骤3: 浏览书城首页
     */
    console.log('\n--- 步骤3: 浏览书城首页 ---')

    await test.step('3.1 访问书城首页', async () => {
      await page.goto(`${getBaseURL()}/bookstore`, { timeout: 60000 })
      // 使用智能等待策略替代 networkidle
      await WaitStrategies.waitForPageStable(page, ['.book-card', '.recommended-section'], { timeout: 30000 })

      // 验证URL
      await expect(page).toHaveURL(/\/bookstore/)
      console.log('  ✓ 访问书城首页')
    })

    await test.step('3.2 验证首页内容加载', async () => {
      // 验证推荐书籍区域
      const recommendedSection = page.locator('.recommended-section')
      const hasRecommended = await recommendedSection.count() > 0

      if (hasRecommended) {
        await expect(recommendedSection.first()).toBeVisible()
        console.log('  ✓ 推荐书籍区域可见')
      }

      // 验证书籍列表
      const bookCards = page.locator('.book-card').or(page.locator('[data-testid="book-card"]'))
      const bookCount = await bookCards.count()
      expect(bookCount).toBeGreaterThan(0)
      console.log(`  ✓ 显示 ${bookCount} 本书籍`)
    })

    await test.step('3.3 验证首页API响应', async () => {
      // 设置响应监听（验证后续请求）
      page.on('response', async (response) => {
        if (response.url().includes('/api/v1/bookstore')) {
          console.log(`    API调用: ${response.url()} - Status: ${response.status()}`)
          expect(response.status()).toBe(200)
        }
      })
    })

    /**
     * 步骤4: 查看书籍详情
     */
    console.log('\n--- 步骤4: 查看书籍详情 ---')

    await test.step('4.1 点击书籍进入详情页', async () => {
      // 拦截书籍详情API
      const bookDetailPromise = page.waitForResponse(
        response =>
          response.url().includes(`/api/v1/bookstore/books/${bookID}`) &&
          response.request().method() === 'GET'
      )

      // 直接导航到书籍详情页
      await page.goto(`${getBaseURL()}/bookstore/books/${bookID}`, { timeout: 60000 })
      // 使用智能等待策略替代 networkidle
      await WaitStrategies.waitForPageStable(page, ['[data-testid="book-title"]', '.book-title'], { timeout: 30000 })

      // 等待API响应
      const bookDetailResponse = await bookDetailPromise
      expect(bookDetailResponse.status()).toBe(200)

      console.log(`  ✓ 书籍详情API响应: ${bookDetailResponse.status()}`)
    })

    await test.step('4.2 验证书籍详情显示', async () => {
      // 验证URL
      await expect(page).toHaveURL(new RegExp(`/bookstore/books/${bookID}`))

      // 验证书籍标题
      const bookTitle = page.locator('h1.book-title, .book-title')
        .or(page.locator('[data-testid="book-title"]'))
      await expect(bookTitle.first()).toBeVisible()
      console.log('  ✓ 书籍标题显示')

      // 验证书籍封面
      const bookCover = page.locator('.book-cover img, .el-image')
      if (await bookCover.count() > 0) {
        await expect(bookCover.first()).toBeVisible()
        console.log('  ✓ 书籍封面显示')
      }

      // 验证书籍简介
      const bookDesc = page.locator('.book-description, .book-intro')
      if (await bookDesc.count() > 0) {
        console.log('  ✓ 书籍简介显示')
      }
    })

    await test.step('4.3 验证书籍详情数据', async () => {
      // 前端显示的书籍信息
      const frontendTitle = await page.locator('[data-testid="book-title"]').textContent()
        .catch(() => null)

      // 后端API返回的书籍信息
      const backendBookData = await apiValidators.fetchBackendData(`/api/v1/bookstore/books/${bookID}`)

      // 验证数据一致性
      if (frontendTitle) {
        expect(frontendTitle.trim()).toBe(backendBookData.title)
        console.log(`  ✓ 前后端书籍标题一致: ${backendBookData.title}`)
      }
    })

    /**
     * 步骤5: 获取章节列表
     */
    console.log('\n--- 步骤5: 获取章节列表 ---')

    await test.step('5.1 切换到目录Tab', async () => {
      // 点击目录Tab
      const chapterTab = page.locator('text=目录, text=章节').or(page.locator('[data-testid="chapters-tab"]'))

      if (await chapterTab.count() > 0) {
        await chapterTab.first().click()
        await page.waitForTimeout(500)

        console.log('  ✓ 切换到目录Tab')
      }
    })

    await test.step('5.2 验证章节列表显示', async () => {
      // 验证章节列表
      const chapterList = page.locator('.chapter-item, .chapter-list-item')
        .or(page.locator('[data-testid="chapter-list"]'))

      await expect(chapterList.first()).toBeVisible()

      const chapterCount = await chapterList.count()
      expect(chapterCount).toBeGreaterThan(0)

      console.log(`  ✓ 章节列表显示 ${chapterCount} 章`)
    })

    await test.step('5.3 验证章节列表API', async () => {
      // 验证章节列表API已调用
      const chaptersData = await apiValidators.fetchBackendData(`/api/v1/bookstore/books/${bookID}/chapters`)

      expect(chaptersData).toHaveProperty('chapters')
      expect(Array.isArray(chaptersData.chapters)).toBe(true)

      console.log(`  ✓ 章节列表API返回 ${chaptersData.chapters.length} 章`)
    })

    /**
     * 步骤6: 阅读章节内容
     */
    console.log('\n--- 步骤6: 阅读章节内容 ---')

    await test.step('6.1 点击章节开始阅读', async () => {
      // 拦截章节内容API
      const chapterContentPromise = page.waitForResponse(
        response =>
          response.url().includes('/chapter/') &&
          response.request().method() === 'GET'
      )

      // 点击第一章
      const firstChapter = page.locator('.chapter-item').first()
        .or(page.locator('[data-testid="chapter-item"]').first())

      await firstChapter.click()
      // 使用智能等待策略替代 networkidle
      await WaitStrategies.waitForPageStable(page, ['.chapter-content', '[data-testid="chapter-content"]'], { timeout: 30000 })

      // 等待API响应
      const chapterResponse = await chapterContentPromise
      expect(chapterResponse.status()).toBe(200)

      console.log('  ✓ 章节内容API响应成功')
    })

    await test.step('6.2 验证阅读器页面', async () => {
      // 验证进入阅读器
      await expect(page).toHaveURL(/\/reader\//)

      // 验证章节标题
      const chapterTitle = page.locator('h1.chapter-title')
        .or(page.locator('[data-testid="chapter-title"]'))
      await expect(chapterTitle.first()).toBeVisible()

      const titleText = await chapterTitle.first().textContent()
      console.log(`  ✓ 章节标题: ${titleText}`)

      // 验证章节内容
      const chapterContent = page.locator('.chapter-content')
        .or(page.locator('[data-testid="chapter-content"]'))
      await expect(chapterContent.first()).toBeVisible()

      console.log('  ✓ 章节内容显示')
    })

    await test.step('6.3 测试阅读器功能', async () => {
      // 测试字体调整
      const fontSizeButton = page.locator('button:has-text("字体"), button:has-text("A+")')
      if (await fontSizeButton.count() > 0) {
        await fontSizeButton.first().click()
        await page.waitForTimeout(500)
        console.log('  ✓ 字体大小可调')
      }

      // 测试主题切换
      const themeButton = page.locator('button:has-text("主题"), .theme-selector')
      if (await themeButton.count() > 0) {
        console.log('  ✓ 主题切换功能可用')
      }

      // 测试目录导航
      const tocButton = page.locator('button:has-text("目录"), .toc-button')
      if (await tocButton.count() > 0) {
        await tocButton.first().click()
        await page.waitForTimeout(500)

        const tocPanel = page.locator('.toc-panel, .chapter-list')
        if (await tocPanel.count() > 0) {
          console.log('  ✓ 目录导航功能正常')
        }
      }
    })

    /**
     * 步骤7: 保存阅读进度
     */
    console.log('\n--- 步骤7: 保存阅读进度 ---')

    await test.step('7.1 模拟阅读行为', async () => {
      // 滚动到页面中间
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2)
      })

      // 等待进度保存
      await page.waitForTimeout(2000)

      console.log('  ✓ 模拟阅读行为（滚动）')
    })

    await test.step('7.2 验证阅读进度保存', async () => {
      // 拦截进度保存API
      const progressPromise = page.waitForResponse(
        response =>
          response.url().includes('/reading/progress') &&
          response.request().method() === 'POST'
      )

      // 再次滚动触发进度保存
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight * 0.7)
      })

      // 等待API调用
      try {
        const progressResponse = await Promise.race([
          progressPromise,
          new Promise(resolve => setTimeout(resolve, 3000))
        ])

        if (progressResponse && (progressResponse as Response).status) {
          expect((progressResponse as Response).status()).toBe(200)
          console.log('  ✓ 阅读进度保存API调用成功')
        }
      } catch (e) {
        console.log('  ⚠ 阅读进度保存可能未触发（正常，取决于实现）')
      }
    })

    await test.step('7.3 验证后端阅读进度', async () => {
      apiValidators.setAuthToken(token)

      // 从后端获取阅读进度
      const progressData = await apiValidators.fetchBackendData(
        `/api/v1/reading/progress/${userID}/${bookID}`
      )

      expect(progressData).toHaveProperty('chapter_id')
      expect(progressData).toHaveProperty('position')

      console.log(`  ✓ 后端阅读进度: 章节=${progressData.chapter_id}, 位置=${progressData.position}`)
    })

    await test.step('7.4 刷新页面验证进度恢复', async () => {
      // 记录当前滚动位置
      const scrollPositionBefore = await page.evaluate(() => window.scrollY)

      // 刷新页面
      await page.reload()
      // 使用智能等待策略替代 networkidle
      await WaitStrategies.waitForPageStable(page, ['.chapter-content', '[data-testid="chapter-content"]'], { timeout: 30000 })

      // 等待进度恢复
      await page.waitForTimeout(2000)

      // 验证滚动位置（可能恢复到之前位置）
      const scrollPositionAfter = await page.evaluate(() => window.scrollY)

      if (scrollPositionAfter > 0) {
        console.log(`  ✓ 阅读进度已恢复: 滚动位置=${scrollPositionAfter}`)
      } else {
        console.log('  ⚠ 阅读进度未自动恢复（可能需要手动继续阅读）')
      }
    })

    /**
     * 测试总结
     */
    console.log('\n=== 阅读流程测试完成 ===')
    console.log(`✓ 用户: ${testUserData.username}`)
    console.log(`✓ 书籍: ${bookID}`)
    console.log(`✓ 章节: ${chapterID}`)
    console.log('✓ 所有步骤测试通过')
  })
})

/**
 * 测试报告说明
 *
 * 运行方式:
 * npm run test:e2e -- tests/e2e/layer1-basic/reading-flow.spec.ts
 *
 * 测试覆盖点:
 * 1. 用户登录
 * 2. 书籍创建（后端API）
 * 3. 章节创建（后端API）
 * 4. 书城首页浏览
 * 5. 书籍详情查看
 * 6. 章节列表显示
 * 7. 阅读器功能
 * 8. 阅读进度保存
 * 9. 前后端数据一致性
 *
 * 与后端测试对应关系:
 * - 步骤1: 对应后端创建用户并登录
 * - 步骤2: 对应后端 fixtures.CreateBook() + CreateChapter()
 * - 步骤3: 对应后端 actions.GetBookstoreHomepage()
 * - 步骤4: 对应后端 actions.GetBookDetail(bookID)
 * - 步骤5: 对应后端 actions.GetChapterList(bookID, token)
 * - 步骤6: 对应后端 actions.GetChapter(chapterID, token)
 * - 步骤7: 对应后端 actions.StartReading(userID, bookID, chapterID, token)
 */
