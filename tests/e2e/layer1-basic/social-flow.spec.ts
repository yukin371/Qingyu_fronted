/**
 * Layer 1: 社交流程 E2E 测试
 * 对应后端: Qingyu_backend/test/e2e/layer1_basic/export.go::RunSocialFlow
 *
 * 测试流程:
 * 步骤1-2: 创建用户并登录、创建测试书籍
 * 步骤3: 发表评论
 * 步骤4: 收藏书籍
 * 步骤5: 点赞书籍
 * 步骤6: 查看收藏列表
 * 步骤7: 查看书籍评论
 *
 * @author Qingyu Test Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test'
import { createAPIValidators } from '../../helpers'
import { TestDataGenerator } from '../../helpers/test-data'

const getBackendURL = () => process.env.BACKEND_URL || 'http://localhost:8080'
const getBaseURL = () => process.env.BASE_URL || 'http://localhost:5173'

test.describe('Layer 1: 社交流程', () => {
  let apiValidators: ReturnType<typeof createAPIValidators>
  let testUserData: any
  let token: string
  let bookID: string

  test.beforeAll(async () => {
    console.log('\n=== Layer 1: 社交流程测试 ===')
    const backendURL = getBackendURL()
    console.log(`后端服务: ${backendURL}`)
    apiValidators = createAPIValidators(backendURL)
  })

  test.beforeEach(async () => {
    testUserData = TestDataGenerator.createUserCredentials()
    const result = await apiValidators.createTestUser(testUserData)
    token = result.token
    apiValidators.setAuthToken(token)

    // 获取一本书籍ID
    const booksResponse = await fetch(`${getBackendURL()}/api/v1/bookstore/books`)
    const booksResult = await booksResponse.json()
    if (booksResult.data?.books?.length > 0) {
      bookID = booksResult.data.books[0].id
    }
  })

  /**
   * 步骤3: 发表评论
   */
  test('步骤3: 发表评论', async ({ page }) => {
    console.log('\n--- 步骤3: 发表评论 ---')

    // 登录
    await page.goto(`${getBaseURL()}`)
    await page.evaluate((t) => localStorage.setItem('token', t), token)
    await page.reload()

    // 进入书籍详情
    await page.goto(`${getBaseURL()}/bookstore/books/${bookID}`)
    await page.waitForLoadState('networkidle')

    // 滚动到评论区
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    // 发表评论
    const commentInput = page.locator('textarea[placeholder*="评论"], .comment-input')
      .or(page.locator('[data-testid="comment-input"]'))

    if (await commentInput.count() > 0) {
      const commentText = `E2E测试评论_${Date.now()}`
      await commentInput.fill(commentText)

      // 拦截评论API
      const commentPromise = page.waitForResponse(
        response => response.url().includes('/comments') && response.request().method() === 'POST'
      )

      // 提交评论
      const submitButton = page.locator('button:has-text("发表"), button:has-text("提交")')
        .or(page.locator('[data-testid="submit-comment"]'))
      await submitButton.click()

      const commentResponse = await commentPromise
      expect(commentResponse.status()).toBe(200)

      console.log('  ✓ 评论发表成功')
    }
  })

  /**
   * 步骤4: 收藏书籍
   */
  test('步骤4: 收藏书籍', async ({ page }) => {
    console.log('\n--- 步骤4: 收藏书籍 ---')

    await page.goto(`${getBaseURL()}`)
    await page.evaluate((t) => localStorage.setItem('token', t), token)
    await page.reload()

    await page.goto(`${getBaseURL()}/bookstore/books/${bookID}`)
    await page.waitForLoadState('networkidle')

    // 点击收藏按钮
    const favoriteButton = page.locator('button:has-text("收藏")')
      .or(page.locator('[data-testid="favorite-btn"]'))

    if (await favoriteButton.count() > 0) {
      const favoritePromise = page.waitForResponse(
        response => response.url().includes('/favorite') && response.request().method() === 'POST'
      )

      await favoriteButton.click()
      const favoriteResponse = await favoritePromise

      expect(favoriteResponse.status()).toBe(200)
      console.log('  ✓ 收藏成功')
    }
  })

  /**
   * 步骤5: 点赞书籍
   */
  test('步骤5: 点赞书籍', async ({ page }) => {
    console.log('\n--- 步骤5: 点赞书籍 ---')

    await page.goto(`${getBaseURL()}`)
    await page.evaluate((t) => localStorage.setItem('token', t), token)
    await page.reload()

    await page.goto(`${getBaseURL()}/bookstore/books/${bookID}`)
    await page.waitForLoadState('networkidle')

    // 点击点赞按钮
    const likeButton = page.locator('button:has-text("点赞")')
      .or(page.locator('[data-testid="like-btn"]'))

    if (await likeButton.count() > 0) {
      const likePromise = page.waitForResponse(
        response => response.url().includes('/like') && response.request().method() === 'POST'
      )

      await likeButton.click()
      const likeResponse = await likePromise

      expect(likeResponse.status()).toBe(200)
      console.log('  ✓ 点赞成功')
    }
  })
})
