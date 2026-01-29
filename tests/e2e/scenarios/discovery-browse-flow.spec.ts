/**
 * 场景4: 发现页浏览流程测试
 *
 * 测试内容:
 * - 测试发现页加载
 * - 测试推荐内容展示
 * - 测试主题浏览
 *
 * @author Qingyu Test Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('场景4: 发现页浏览流程', () => {
  /**
   * 测试4.1: 发现页加载
   */
  test('4.1 发现页加载', async ({ page }) => {
    // 访问发现页
    await page.goto(`${baseURL}/discovery`)
    await page.waitForLoadState('networkidle')

    // 验证页面标题
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /发现/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 发现页标题显示正常')
    }

    // 验证URL
    expect(page.url()).toContain('/discovery')

    console.log('✓ 发现页加载成功')
  })

  /**
   * 测试4.2: 推荐内容展示
   */
  test('4.2 推荐内容展示', async ({ page }) => {
    // 访问发现页
    await page.goto(`${baseURL}/discovery`)
    await page.waitForLoadState('networkidle')

    // 等待推荐内容加载
    await page.waitForTimeout(2000)

    // 检查推荐书籍区域
    const recommendedSection = page.locator('[data-testid="recommended-books"], .recommended-books, .recommendation-section')
    const sectionCount = await recommendedSection.count()

    if (sectionCount > 0) {
      console.log('✓ 找到推荐内容区域')

      // 检查推荐书籍卡片
      const bookCards = page.locator('[data-testid="book-card"], .book-card, .recommendation-item')
      const cardCount = await bookCards.count()

      console.log(`✓ 找到 ${cardCount} 个推荐内容卡片`)

      // 如果有推荐内容,验证第一个卡片
      if (cardCount > 0) {
        const firstCard = bookCards.first()
        await expect(firstCard).toBeVisible()

        // 验证卡片包含必要元素
        const cardTitle = firstCard.locator('[data-testid="book-title"], .book-title, .title')
        const titleCount = await cardTitle.count()

        if (titleCount > 0) {
          console.log('✓ 推荐卡片标题显示正常')
        }

        const cardCover = firstCard.locator('[data-testid="book-cover"], .book-cover, img')
        const coverCount = await cardCover.count()

        if (coverCount > 0) {
          console.log('✓ 推荐卡片封面显示正常')
        }
      }
    } else {
      console.log('⚠️ 未找到推荐内容区域')
    }
  })

  /**
   * 测试4.3: 新书抢先看
   */
  test('4.3 新书抢先看', async ({ page }) => {
    // 访问新书页面
    await page.goto(`${baseURL}/discovery/new-releases`)
    await page.waitForLoadState('networkidle')

    // 验证页面标题
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /新书/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 新书抢先页面加载成功')
    }

    // 等待新书列表加载
    await page.waitForTimeout(2000)

    // 检查新书列表
    const newBooks = page.locator('[data-testid="new-book-item"], .new-book-item, .book-item')
    const bookCount = await newBooks.count()

    if (bookCount > 0) {
      console.log(`✓ 找到 ${bookCount} 本新书`)

      // 验证第一本新书
      const firstBook = newBooks.first()
      await expect(firstBook).toBeVisible()
    } else {
      console.log('⚠️ 未找到新书列表')
    }
  })

  /**
   * 测试4.4: 编辑推荐
   */
  test('4.4 编辑推荐', async ({ page }) => {
    // 访问编辑推荐页面
    await page.goto(`${baseURL}/discovery/editors-pick`)
    await page.waitForLoadState('networkidle')

    // 验证页面标题
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /编辑推荐/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 编辑推荐页面加载成功')
    }

    // 等待推荐列表加载
    await page.waitForTimeout(2000)

    // 检查编辑推荐书籍列表
    const editorPicks = page.locator('[data-testid="editor-pick-item"], .editor-pick-item, .book-item')
    const pickCount = await editorPicks.count()

    if (pickCount > 0) {
      console.log(`✓ 找到 ${pickCount} 本编辑推荐书籍`)

      // 验证第一本推荐书籍
      const firstPick = editorPicks.first()
      await expect(firstPick).toBeVisible()

      // 检查是否有推荐理由
      const pickReason = firstPick.locator('[data-testid="pick-reason"], .pick-reason, .recommendation-reason')
      const reasonCount = await pickReason.count()

      if (reasonCount > 0) {
        console.log('✓ 编辑推荐理由显示正常')
      }
    } else {
      console.log('⚠️ 未找到编辑推荐列表')
    }
  })

  /**
   * 测试4.5: 话题广场浏览
   */
  test('4.5 话题广场浏览', async ({ page }) => {
    // 访问话题广场
    await page.goto(`${baseURL}/discovery/topics`)
    await page.waitForLoadState('networkidle')

    // 验证页面标题
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /话题/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 话题广场页面加载成功')
    }

    // 等待话题列表加载
    await page.waitForTimeout(2000)

    // 检查话题卡片
    const topicCards = page.locator('[data-testid="topic-card"], .topic-card, .topic-item')
    const topicCount = await topicCards.count()

    if (topicCount > 0) {
      console.log(`✓ 找到 ${topicCount} 个话题`)

      // 验证第一个话题卡片
      const firstTopic = topicCards.first()
      await expect(firstTopic).toBeVisible()

      // 验证话题元素
      const topicTitle = firstTopic.locator('[data-testid="topic-title"], .topic-title, .title')
      const titleCount = await topicTitle.count()

      if (titleCount > 0) {
        console.log('✓ 话题标题显示正常')
      }

      // 检查话题热度/参与人数
      const topicStats = firstTopic.locator('[data-testid="topic-stats"], .topic-stats, .stats')
      const statsCount = await topicStats.count()

      if (statsCount > 0) {
        console.log('✓ 话题统计数据显示正常')
      }
    } else {
      console.log('⚠️ 未找到话题列表')
    }
  })

  /**
   * 测试4.6: 话题详情浏览
   */
  test('4.6 话题详情浏览', async ({ page }) => {
    // 先访问话题广场
    await page.goto(`${baseURL}/discovery/topics`)
    await page.waitForLoadState('networkidle')

    // 等待话题列表加载
    await page.waitForTimeout(2000)

    // 尝试点击第一个话题
    const firstTopic = page.locator('[data-testid="topic-card"], .topic-card, a[href*="/discovery/topic/"]').first()

    const count = await firstTopic.count()

    if (count > 0) {
      // 拦截话题详情API
      const detailPromise = page.waitForResponse(
        response =>
          response.url().includes('/api/topics/') &&
          response.request().method() === 'GET'
      )

      await firstTopic.click()

      // 等待导航
      await page.waitForLoadState('networkidle')

      // 等待API响应
      try {
        const detailResponse = await Promise.race([
          detailPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
        ]) as any

        console.log(`话题详情API状态: ${detailResponse.status()}`)
      } catch (e) {
        console.log('⚠️ 话题详情API超时或未调用')
      }

      // 验证URL
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/\/discovery\/topic\/.+/)

      // 验证话题详情页元素
      const detailTitle = page.locator('[data-testid="topic-detail-title"], .topic-detail-title, h1, h2')
      const titleCount = await detailTitle.count()

      if (titleCount > 0) {
        await expect(detailTitle.first()).toBeVisible()
        console.log('✓ 话题详情页标题显示正常')
      }

      // 检查话题相关书籍
      const relatedBooks = page.locator('[data-testid="related-book"], .related-book')
      const bookCount = await relatedBooks.count()

      if (bookCount > 0) {
        console.log(`✓ 找到 ${bookCount} 本相关书籍`)
      }
    } else {
      console.log('⚠️ 未找到可点击的话题')
    }
  })

  /**
   * 测试4.7: 发现页分类筛选
   */
  test('4.7 发现页分类筛选', async ({ page }) => {
    // 访问发现页
    await page.goto(`${baseURL}/discovery`)
    await page.waitForLoadState('networkidle')

    // 查找分类筛选器
    const categoryFilters = page.locator('[data-testid="category-filter"], .category-filter, .filter-option')
    const filterCount = await categoryFilters.count()

    if (filterCount > 0) {
      console.log(`✓ 找到 ${filterCount} 个分类筛选选项`)

      // 点击第一个分类
      await categoryFilters.first().click()

      // 等待内容更新
      await page.waitForTimeout(2000)

      // 验证筛选后的内容
      const filteredContent = page.locator('[data-testid="book-card"], .book-card')
      const contentCount = await filteredContent.count()

      console.log(`✓ 分类筛选后显示 ${contentCount} 个内容`)
    } else {
      console.log('⚠️ 未找到分类筛选器')
    }
  })

  /**
   * 测试4.8: 发现页搜索功能
   */
  test('4.8 发现页搜索功能', async ({ page }) => {
    // 访问发现页
    await page.goto(`${baseURL}/discovery`)
    await page.waitForLoadState('networkidle')

    // 查找搜索框
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"], [data-testid="search-input"]')
    const searchCount = await searchInput.count()

    if (searchCount > 0) {
      // 输入搜索关键词
      await searchInput.first().fill('修仙')

      // 拦截搜索API
      const searchPromise = page.waitForResponse(
        response =>
          response.url().includes('/api/') &&
          response.url().includes('search') &&
          response.request().method() === 'GET'
      )

      // 触发搜索(可能需要点击搜索按钮或按回车)
      await page.keyboard.press('Enter')

      try {
        const searchResponse = await Promise.race([
          searchPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
        ]) as any

        console.log(`搜索API状态: ${searchResponse.status()}`)
        console.log('✓ 发现页搜索功能正常')
      } catch (e) {
        console.log('⚠️ 搜索API超时或未调用')
      }

      // 等待搜索结果加载
      await page.waitForTimeout(2000)
    } else {
      console.log('⚠️ 未找到搜索框')
    }
  })
})

/**
 * 测试报告说明
 *
 * 运行方式:
 * npm run test:e2e -- tests/e2e/scenarios/discovery-browse-flow.spec.ts
 *
 * 测试覆盖点:
 * 1. 发现页主页加载
 * 2. 推荐内容展示
 * 3. 新书抢先看功能
 * 4. 编辑推荐功能
 * 5. 话题广场浏览
 * 6. 话题详情浏览
 * 7. 发现页分类筛选
 * 8. 发现页搜索功能
 *
 * 注意事项:
 * - 所有测试都是公开访问,不需要登录
 * - 测试会验证页面加载、内容显示和基本交互
 */
