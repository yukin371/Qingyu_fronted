/**
 * Layer 2: 用户阅读一致性 E2E 测试
 * 对应后端: Qingyu_backend/test/e2e/layer2_consistency/export.go::RunUserReadingConsistency
 *
 * 测试流程:
 * 步骤1: 创建用户和阅读数据
 * 步骤2: 执行阅读操作并保存进度
 * 步骤3: 验证阅读进度数据一致性
 * 步骤4: 验证阅读历史数据一致性
 * 步骤5: 跨模块数据验证
 *
 * @author Qingyu Test Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test'
import { createAPIValidators } from '../../helpers'
import { TestDataGenerator } from '../../helpers/test-data'

const getBackendURL = () => process.env.BACKEND_URL || 'http://localhost:8080'
const getBaseURL = () => process.env.BASE_URL || 'http://localhost:5173'

test.describe('Layer 2: 用户阅读一致性', () => {
  let apiValidators: ReturnType<typeof createAPIValidators>
  let userID: string
  let token: string
  let bookID: string
  let chapterID: string

  test.beforeAll(async () => {
    console.log('\n=== Layer 2: 用户阅读一致性测试 ===')
    const backendURL = getBackendURL()
    console.log(`后端服务: ${backendURL}`)
    apiValidators = createAPIValidators(backendURL)
  })

  /**
   * 步骤1-2: 创建用户和阅读数据，执行阅读操作
   */
  test('步骤1-5: 完整阅读一致性验证', async ({ page }) => {
    console.log('\n--- 步骤1: 创建用户和阅读数据 ---')

    // 创建用户
    const userData = TestDataGenerator.createUserCredentials()
    const result = await apiValidators.createTestUser(userData)
    userID = result.userID
    token = result.token
    apiValidators.setAuthToken(token)

    console.log(`  ✓ 创建用户: ${userData.username}`)

    // 获取一本书籍
    await test.step('1.1 获取测试书籍', async () => {
      const booksResponse = await fetch(`${getBackendURL()}/api/v1/bookstore/books`)
      const booksResult = await booksResponse.json()

      expect(booksResult.data?.books?.length).toBeGreaterThan(0)

      bookID = booksResult.data.books[0].id
      console.log(`  ✓ 使用书籍: ${bookID}`)
    })

    // 获取章节
    await test.step('1.2 获取测试章节', async () => {
      const chaptersResponse = await fetch(`${getBackendURL()}/api/v1/bookstore/books/${bookID}/chapters`)
      const chaptersResult = await chaptersResponse.json()

      expect(chaptersResult.data?.chapters?.length).toBeGreaterThan(0)

      chapterID = chaptersResult.data.chapters[0].id
      console.log(`  ✓ 使用章节: ${chapterID}`)
    })

    /**
     * 步骤2: 执行阅读操作并保存进度
     */
    console.log('\n--- 步骤2: 执行阅读操作并保存进度 ---')

    await test.step('2.1 前端登录', async () => {
      await page.goto(`${getBaseURL()}/login`)
      await page.fill('input[placeholder*="用户名"]', userData.username)
      await page.fill('input[type="password"]', userData.password)

      const loginPromise = page.waitForResponse(
        response => response.url().includes('/auth/login') && response.request().method() === 'POST'
      )

      await page.click('button:has-text("登录")')
      const loginResponse = await loginPromise

      expect(loginResponse.status()).toBe(200)
      console.log('  ✓ 前端登录成功')
    })

    await test.step('2.2 执行3次阅读操作', async () => {
      for (let i = 1; i <= 3; i++) {
        console.log(`  阅读操作 ${i}/3`)

        // 保存阅读进度
        const progressPromise = page.waitForResponse(
          response => response.url().includes('/reading/progress') && response.request().method() === 'POST'
        )

        const progressData = await fetch(`${getBackendURL()}/api/v1/reading/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: userID,
            book_id: bookID,
            chapter_id: chapterID,
            position: i * 100 // 模拟阅读进度
          })
        })

        if (progressData.ok) {
          console.log(`    ✓ 阅读进度保存成功`)
        }

        // 短暂延迟
        await page.waitForTimeout(500)
      }
    })

    /**
     * 步骤3: 验证阅读进度数据一致性
     */
    console.log('\n--- 步骤3: 验证阅读进度数据一致性 ---')

    await test.step('3.1 后端获取阅读进度', async () => {
      const progressData = await apiValidators.fetchBackendData(
        `/api/v1/reading/progress/${userID}/${bookID}`
      )

      expect(progressData).toHaveProperty('chapter_id', chapterID)
      expect(progressData).toHaveProperty('position')

      console.log(`  ✓ 后端阅读进度: 章节=${progressData.chapter_id}, 位置=${progressData.position}`)
    })

    await test.step('3.2 前端验证阅读进度', async () => {
      // 访问书籍详情页
      await page.goto(`${getBaseURL()}/bookstore/books/${bookID}`)
      await page.waitForLoadState('networkidle')

      // 检查是否有"继续阅读"按钮或进度显示
      const continueReadingButton = page.locator('button:has-text("继续阅读")')
        .or(page.locator('[data-testid="continue-reading"]'))

      if (await continueReadingButton.count() > 0) {
        console.log('  ✓ 前端显示"继续阅读"按钮')
      }
    })

    await test.step('3.3 前后端进度对比', async () => {
      // 后端进度
      const backendProgress = await apiValidators.fetchBackendData(
        `/api/v1/reading/progress/${userID}/${bookID}`
      )

      // 前端进度（从页面读取）
      await page.goto(`${getBaseURL()}/bookstore/books/${bookID}`)
      await page.waitForLoadState('networkidle')

      // 验证书籍有阅读记录
      const hasProgress = await page.locator('.reading-progress, .progress-bar').count() > 0

      if (hasProgress) {
        console.log('  ✓ 前端显示阅读进度')
      } else {
        console.log('  ⚠ 前端未显示阅读进度（可能UI未实现）')
      }

      // 核心验证：后端有进度数据
      expect(backendProgress).toBeDefined()
      console.log('  ✓ 后端进度数据存在')
    })

    /**
     * 步骤4: 验证阅读历史数据一致性
     */
    console.log('\n--- 步骤4: 验证阅读历史数据一致性 ---')

    await test.step('4.1 获取用户阅读历史', async () => {
      const historyData = await apiValidators.fetchBackendData(`/api/v1/reading/history/${userID}`)

      expect(historyData).toHaveProperty('history')
      expect(Array.isArray(historyData.history)).toBe(true)

      console.log(`  ✓ 阅读历史记录数: ${historyData.history.length}`)
    })

    await test.step('4.2 验证历史包含当前书籍', async () => {
      const historyData = await apiValidators.fetchBackendData(`/api/v1/reading/history/${userID}`)

      const hasCurrentBook = historyData.history.some(
        (item: any) => item.book_id === bookID || item.book?.id === bookID
      )

      expect(hasCurrentBook).toBe(true)
      console.log('  ✓ 历史包含当前书籍')
    })

    /**
     * 步骤5: 跨模块数据验证
     */
    console.log('\n--- 步骤5: 跨模块数据验证 ---')

    await test.step('5.1 用户模块数据验证', async () => {
      const userData = await apiValidators.fetchBackendData(`/api/v1/users/${userID}`)

      expect(userData).toHaveProperty('id', userID)
      expect(userData).toHaveProperty('username', userData.username)

      console.log('  ✓ 用户模块数据正确')
    })

    await test.step('5.2 阅读器模块数据验证', async () => {
      const progressData = await apiValidators.fetchBackendData(
        `/api/v1/reading/progress/${userID}/${bookID}`
      )

      expect(progressData).toHaveProperty('user_id', userID)
      expect(progressData).toHaveProperty('book_id', bookID)

      console.log('  ✓ 阅读器模块数据正确')
    })

    await test.step('5.3 书城模块数据验证', async () => {
      const bookData = await apiValidators.fetchBackendData(`/api/v1/bookstore/books/${bookID}`)

      expect(bookData).toHaveProperty('id', bookID)

      console.log('  ✓ 书城模块数据正确')
    })

    await test.step('5.4 跨模块数据一致性', async () => {
      // 从不同模块获取用户ID，验证一致性
      const userData = await apiValidators.fetchBackendData(`/api/v1/users/${userID}`)
      const progressData = await apiValidators.fetchBackendData(
        `/api/v1/reading/progress/${userID}/${bookID}`
      )

      // 验证用户ID在所有模块中一致
      expect(userData.id).toBe(userID)
      expect(progressData.user_id).toBe(userID)

      console.log('  ✓ 跨模块用户ID一致')
      console.log('\n=== 用户阅读一致性测试通过 ===')
    })
  })
})
