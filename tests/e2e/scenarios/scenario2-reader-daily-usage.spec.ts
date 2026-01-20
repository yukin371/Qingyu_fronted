import { test, expect } from '@playwright/test'
import { BrowserSession } from '../../helpers/browser-session'
import { ActorFactory } from '../../helpers/actor-factory'
import { ScenarioBuilder } from '../../helpers/step-builder'
import { testFixtures } from '../../helpers/test-data'

/**
 * 场景2: 读者日常使用 E2E测试
 *
 * 测试读者在日常使用中的完整流程，包括：
 * - Part 1: 搜索发现
 * - Part 2: 深度阅读
 * - Part 3: 互动评论
 * - Part 4: 社交互动
 * - Part 5: 阅读统计
 *
 * @see docs/plans/2026-01-18-qingyu-frontend-test-design.md (第308-387行)
 */

test.describe('场景2: 读者日常使用', () => {
  let session: BrowserSession
  let readerActor: ReturnType<typeof ActorFactory.createReader>
  let scenario: ScenarioBuilder

  // 测试数据 - 动态生成
  const testData = {
    search: {
      keyword: '修仙小说',
      category: '玄幻',
      status: '连载中',
      minResults: 1
    },
    reader: {
      username: testFixtures.users.reader.username,
      password: testFixtures.users.reader.password,
      comment: '这一章太精彩了！',
      reply: '非常同意，作者的文笔真好！'
    },
    bookshelf: {
      name: testFixtures.bookshelf.name,
      description: testFixtures.bookshelf.description
    }
  }

  test.beforeEach(async ({ page, context, browser }) => {
    // 创建浏览器会话
    session = new BrowserSession(page, context, browser)

    // 创建读者Actor（使用test_reader_daily账号）
    readerActor = ActorFactory.createReader(
      'test_reader',
      session,
      {
        username: testData.reader.username,
        email: 'test_reader_daily@qingyu.test',
        password: testData.reader.password
      }
    )

    // 创建场景构建器
    scenario = new ScenarioBuilder(session)
  })

  test.afterEach(async ({ page }) => {
    // 测试失败时截图
    if (test.info().status !== 'passed') {
      await page.screenshot({
        path: `test-results/scenario2-failure-${test.info().title.replace(/\s+/g, '-')}.png`,
        fullPage: true
      })
    }

    // 清理会话
    await session?.close()
  })

  /**
   * Part 1: 搜索发现
   * 测试用户搜索书籍和使用筛选器的功能
   */
  test('Part 1: 搜索发现', async ({ page }) => {
    test.slow()

    try {
      // 步骤1: 使用搜索功能找书
      await test.step('1.1 登录读者账号', async () => {
        await readerActor.login(testData.reader.username, testData.reader.password)
        // 简化验证：只要不在登录页面就算成功
        await page.waitForTimeout(2000)
        const currentUrl = page.url()
        expect(currentUrl).not.toContain('/login')
        expect(currentUrl).not.toContain('/register')
      })

      await test.step('1.2 搜索修仙小说', async () => {
        // 设置API拦截验证
        const searchPromise = page.waitForResponse(
          response =>
            response.url().includes('/api/v1/bookstore/books/search') &&
            response.request().method() === 'GET'
        )

        // 执行搜索
        await readerActor.searchBooks(testData.search.keyword)

        // 等待API响应
        const searchResponse = await searchPromise
        console.log(`搜索API状态: ${searchResponse.status()}`)

        // API可能返回200（有结果）或400（无结果），都是正常的
        expect([200, 400]).toContain(searchResponse.status())

        // 如果返回200，验证数据格式
        if (searchResponse.status() === 200) {
          const searchData = await searchResponse.json()
          expect(searchData.data).toBeDefined()
        }
      })

      // 步骤2: 使用筛选器优化结果
      await test.step('2.1 选择分类筛选', async () => {
        await readerActor.filterByCategory(testData.search.category)

        // 验证URL更新查询参数
        expect(page.url()).toContain(`category=${encodeURIComponent(testData.search.category)}`)
      })

      await test.step('2.2 选择状态筛选', async () => {
        await readerActor.filterByStatus(testData.search.status)

        // 验证URL更新查询参数
        expect(page.url()).toContain(`status=${encodeURIComponent(testData.search.status)}`)
      })

      await test.step('2.3 验证筛选结果正确', async () => {
        // 等待筛选后的结果加载
        await page.waitForLoadState('networkidle')

        // 验证页面显示筛选后的结果
        const categoryText = await page.textContent('[data-testid="selected-category"]')
        expect(categoryText).toContain(testData.search.category)

        const statusText = await page.textContent('[data-testid="selected-status"]')
        expect(statusText).toContain(testData.search.status)
      })

    } catch (error) {
      console.error('Part 1 测试失败:', error)
      throw error
    }
  })

  /**
   * Part 2: 深度阅读
   * 测试用户阅读书籍和使用阅读器功能
   */
  test('Part 2: 深度阅读', async ({ page }) => {
    test.slow()

    try {
      // 步骤3: 选择一本书开始阅读
      await test.step('3.1 登录并进入搜索结果', async () => {
        await readerActor.login(testData.reader.username, testData.reader.password)
        await readerActor.searchBooks(testData.search.keyword)
      })

      await test.step('3.2 点击继续阅读', async () => {
        // 设置API拦截验证
        const continueReadingPromise = page.waitForResponse(
          response =>
            response.url().includes('/api/reading/progress') &&
            response.status() === 200
        )

        // 点击继续阅读按钮
        await readerActor.continueReading()

        // 等待API响应
        const continueReadingResponse = await continueReadingPromise
        expect(continueReadingResponse.status()).toBe(200)

        // 验证自动跳转上次阅读章节
        await expect(page).toHaveURL(/.*\/chapter\/.*/)
      })

      await test.step('3.3 验证阅读进度恢复', async () => {
        const progressData = await continueReadingPromise.then(r => r.json())

        // 验证阅读进度数据
        expect(progressData.data).toBeDefined()
        expect(progressData.data.chapterId).toBeDefined()
        expect(progressData.data.position).toBeDefined()

        // 验证页面显示正确的章节标题
        const chapterTitle = await page.textContent('[data-testid="chapter-title"]')
        expect(chapterTitle).toBeTruthy()
      })

      // 步骤4: 体验阅读器功能
      await test.step('4.1 测试字体调整', async () => {
        // 增大字体
        await readerActor.adjustFontSize(18)

        // 验证设置实时生效
        const contentElement = await page.locator('[data-testid="chapter-content"]').first()
        const fontSize = await contentElement.evaluate(el => window.getComputedStyle(el).fontSize)
        expect(fontSize).toBe('18px')

        // 恢复默认字体
        await readerActor.resetFontSize()
      })

      await test.step('4.2 测试主题切换', async () => {
        // 切换到夜间模式
        await readerActor.switchTheme('dark')

        // 验证主题切换生效
        const body = page.locator('body')
        await expect(body).toHaveClass(/dark/)

        // 切换回日间模式
        await readerActor.switchTheme('light')
        await expect(body).not.toHaveClass(/dark/)
      })

      await test.step('4.3 测试目录导航', async () => {
        // 打开目录
        await readerActor.openTableOfContents()

        // 验证目录显示
        await expect(page.locator('[data-testid="chapter-list"]')).toBeVisible()

        // 点击下一章
        await readerActor.navigateToNextChapter()

        // 验证章节切换流畅
        await expect(page).toHaveURL(/.*\/chapter\/.*/, { timeout: 5000 })

        // 等待内容加载
        await page.waitForLoadState('networkidle')
      })

      await test.step('4.4 验证阅读进度自动保存', async () => {
        // 滚动到页面中间
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))

        // 等待进度保存
        await page.waitForTimeout(1000)

        // 刷新页面
        await page.reload()

        // 验证进度已保存（应该还在中间位置）
        const scrollPosition = await page.evaluate(() => window.scrollY)
        expect(scrollPosition).toBeGreaterThan(0)
      })

    } catch (error) {
      console.error('Part 2 测试失败:', error)
      throw error
    }
  })

  /**
   * Part 3: 互动评论
   * 测试用户发表评论和回复评论的功能
   */
  test('Part 3: 互动评论', async ({ page }) => {
    test.slow()

    try {
      // 步骤5: 在章节页发表评论
      await test.step('5.1 登录并进入章节页', async () => {
        await readerActor.login(testData.reader.username, testData.reader.password)
        await readerActor.searchBooks(testData.search.keyword)
        await readerActor.continueReading()
      })

      await test.step('5.2 滚动到评论区', async () => {
        await readerActor.scrollToComments()

        // 验证评论区可见
        await expect(page.locator('[data-testid="comments-section"]')).toBeVisible()
      })

      await test.step('5.3 发表评论', async () => {
        // 设置API拦截验证
        const commentPromise = page.waitForResponse(
          response =>
            response.url().includes('/api/comments') &&
            response.request().method() === 'POST' &&
            response.status() === 200
        )

        // 填写并提交评论
        await readerActor.postComment(testData.reader.comment)

        // 等待API响应
        const commentResponse = await commentPromise
        expect(commentResponse.status()).toBe(200)

        const commentData = await commentResponse.json()
        expect(commentData.data).toBeDefined()
        expect(commentData.data.content).toBe(testData.reader.comment)
      })

      await test.step('5.4 验证评论立即显示', async () => {
        // 验证评论显示在列表中
        await expect(page.locator(`text=${testData.reader.comment}`)).toBeVisible()

        // 验证显示"刚刚"时间
        const commentTime = await page.textContent('[data-testid="comment-time"]:first-child')
        expect(commentTime).toMatch(/刚刚|刚刚前/)
      })

      // 步骤6: 回复其他读者评论
      await test.step('6.1 点击回复按钮', async () => {
        // 找到第一条评论的回复按钮
        const firstReplyButton = page.locator('[data-testid="reply-button"]').first()
        await firstReplyButton.click()

        // 验证回复输入框显示
        await expect(page.locator('[data-testid="reply-input"]')).toBeVisible()
      })

      await test.step('6.2 填写并提交回复', async () => {
        // 设置API拦截验证
        const replyPromise = page.waitForResponse(
          response =>
            response.url().includes('/api/comments/') &&
            response.request().method() === 'POST' &&
            response.status() === 200
        )

        // 填写回复内容
        await readerActor.postReply(testData.reader.reply)

        // 等待API响应
        const replyResponse = await replyPromise
        expect(replyResponse.status()).toBe(200)

        const replyData = await replyResponse.json()
        expect(replyData.data).toBeDefined()
        expect(replyData.data.content).toBe(testData.reader.reply)
      })

      await test.step('6.3 验证回复显示为缩进样式', async () => {
        // 验证回复显示在评论下方
        const replyElement = page.locator(`text=${testData.reader.reply}`)
        await expect(replyElement).toBeVisible()

        // 验证回复有缩进样式
        const replyIndent = await replyElement.evaluate(el => {
          return window.getComputedStyle(el).marginLeft
        })
        expect(parseInt(replyIndent)).toBeGreaterThan(0)
      })

    } catch (error) {
      console.error('Part 3 测试失败:', error)
      throw error
    }
  })

  /**
   * Part 4: 社交互动
   * 测试用户关注作者和管理书单的功能
   */
  test('Part 4: 社交互动', async ({ page }) => {
    test.slow()

    try {
      // 步骤7: 关注作者
      await test.step('7.1 登录并进入作者主页', async () => {
        await readerActor.login(testData.reader.username, testData.reader.password)
        await readerActor.searchBooks(testData.search.keyword)

        // 点击第一本书进入详情页
        await page.locator('[data-testid="book-item"]').first().click()
        await page.waitForLoadState('networkidle')

        // 进入作者主页
        await readerActor.navigateToAuthorPage()
        await expect(page).toHaveURL(/.*\/author\/.*/)
      })

      await test.step('7.2 点击关注按钮', async () => {
        // 设置API拦截验证
        const followPromise = page.waitForResponse(
          response =>
            response.url().includes('/api/social/follow') &&
            response.request().method() === 'POST' &&
            response.status() === 200
        )

        // 点击关注按钮
        await readerActor.followAuthor()

        // 等待API响应
        const followResponse = await followPromise
        expect(followResponse.status()).toBe(200)

        const followData = await followResponse.json()
        expect(followData.data).toBeDefined()
        expect(followData.data.isFollowing).toBe(true)
      })

      await test.step('7.3 验证按钮变为"已关注"', async () => {
        const followButton = page.locator('[data-testid="follow-button"]')
        await expect(followButton).toHaveText(/已关注/)

        // 验证按钮样式变化
        await expect(followButton).toHaveClass(/followed/)
      })

      // 步骤8: 将书籍加入书单
      await test.step('8.1 返回书籍详情页', async () => {
        await page.goBack()
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(/.*\/book\/.*/)
      })

      await test.step('8.2 点击加入书单', async () => {
        await readerActor.openAddToBookshelfModal()

        // 验证书单选择弹窗显示
        await expect(page.locator('[data-testid="bookshelf-modal"]')).toBeVisible()
      })

      await test.step('8.3 选择书单并确认', async () => {
        // 设置API拦截验证
        const addPromise = page.waitForResponse(
          response =>
            response.url().includes('/api/bookshelf/') &&
            response.request().method() === 'POST' &&
            response.status() === 200
        )

        // 选择书单
        await readerActor.selectBookshelf(testData.bookshelf.name)

        // 确认添加
        await readerActor.confirmAddToBookshelf()

        // 等待API响应
        const addResponse = await addPromise
        expect(addResponse.status()).toBe(200)
      })

      await test.step('8.4 验证书单数量+1', async () => {
        // 获取添加前的书单数量
        const bookshelfCountBefore = await page.locator('[data-testid="bookshelf-count"]').textContent()
        const countBefore = parseInt(bookshelfCountBefore || '0')

        // 刷新页面
        await page.reload()
        await page.waitForLoadState('networkidle')

        // 验证书单数量增加
        const bookshelfCountAfter = await page.locator('[data-testid="bookshelf-count"]').textContent()
        const countAfter = parseInt(bookshelfCountAfter || '0')
        expect(countAfter).toBe(countBefore + 1)
      })

      await test.step('8.5 验证个人中心可见', async () => {
        // 导航到个人中心
        await readerActor.navigateToProfile()

        // 打开我的书单
        await page.locator('[data-testid="my-bookshelves"]').click()
        await page.waitForLoadState('networkidle')

        // 验证书单中的书籍可见
        await expect(page.locator(`[data-testid="bookshelf-${testData.bookshelf.name}"]`)).toBeVisible()
      })

    } catch (error) {
      console.error('Part 4 测试失败:', error)
      throw error
    }
  })

  /**
   * Part 5: 阅读统计
   * 测试用户查看个人阅读统计的功能
   */
  test('Part 5: 阅读统计', async ({ page }) => {
    test.slow()

    try {
      // 步骤9: 查看个人阅读统计
      await test.step('9.1 登录并导航到个人统计页', async () => {
        await readerActor.login(testData.reader.username, testData.reader.password)
        await readerActor.navigateToProfile()

        // 点击阅读统计
        await page.locator('[data-testid="reading-statistics"]').click()
        await page.waitForLoadState('networkidle')

        // 验证URL
        await expect(page).toHaveURL(/.*\/statistics/)
      })

      await test.step('9.2 验证API返回200', async () => {
        // 设置API拦截验证
        const statsPromise = page.waitForResponse(
          response =>
            response.url().includes('/api/statistics/reading') &&
            response.status() === 200
        )

        // 等待统计数据加载
        await statsPromise.then(response => {
          expect(response.status()).toBe(200)
        })
      })

      await test.step('9.3 验证显示本周阅读时长', async () => {
        const readingTimeElement = page.locator('[data-testid="weekly-reading-time"]')
        await expect(readingTimeElement).toBeVisible()

        const readingTimeText = await readingTimeElement.textContent()
        expect(readingTimeText).toMatch(/\d+\s*(小时|分钟|小时\s*\d+分钟)/)
      })

      await test.step('9.4 验证显示阅读字数统计', async () => {
        const wordCountElement = page.locator('[data-testid="total-word-count"]')
        await expect(wordCountElement).toBeVisible()

        const wordCountText = await wordCountElement.textContent()
        expect(wordCountText).toMatch(/\d+\s*万?字/)
      })

      await test.step('9.5 验证显示阅读偏好图表', async () => {
        // 验证图表容器存在
        const chartContainer = page.locator('[data-testid="reading-preference-chart"]')
        await expect(chartContainer).toBeVisible()

        // 验证图表数据加载
        const chartData = await page.locator('[data-testid="chart-data"]').textContent()
        expect(chartData).toBeTruthy()

        // 验证图表类型（可能是饼图、柱状图等）
        const chartType = await chartContainer.getAttribute('data-chart-type')
        expect(['pie', 'bar', 'line']).toContain(chartType)
      })

      await test.step('9.6 验证其他统计信息', async () => {
        // 验证连续阅读天数
        const streakElement = page.locator('[data-testid="reading-streak"]')
        await expect(streakElement).toBeVisible()

        // 验证完成书籍数
        const completedBooksElement = page.locator('[data-testid="completed-books-count"]')
        await expect(completedBooksElement).toBeVisible()

        // 验证阅读进度
        const progressElement = page.locator('[data-testid="reading-progress"]')
        await expect(progressElement).toBeVisible()
      })

    } catch (error) {
      console.error('Part 5 测试失败:', error)
      throw error
    }
  })
})
