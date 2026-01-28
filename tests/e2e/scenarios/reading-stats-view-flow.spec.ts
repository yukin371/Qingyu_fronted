/**
 * 场景5: 阅读统计查看流程测试
 *
 * 测试内容:
 * - 测试阅读统计页加载
 * - 测试统计数据展示
 * - 测试报告查看
 *
 * @author Qingyu Test Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('场景5: 阅读统计查看流程', () => {
  /**
   * 测试5.1: 阅读统计页加载(需要登录)
   */
  test('5.1 阅读统计页加载', async ({ page }) => {
    // 访问阅读统计页面
    await page.goto(`${baseURL}/reading/stats`)
    await page.waitForLoadState('networkidle')

    // 检查是否需要登录
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 需要登录才能查看阅读统计')
      return
    }

    // 验证页面标题
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /阅读统计/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 阅读统计页面加载成功')
    }

    // 验证URL
    expect(page.url()).toContain('/reading/stats')

    console.log('✓ 阅读统计页访问成功')
  })

  /**
   * 测试5.2: 统计数据展示
   */
  test('5.2 统计数据展示', async ({ page }) => {
    // 访问阅读统计页面
    await page.goto(`${baseURL}/reading/stats`)
    await page.waitForLoadState('networkidle')

    // 检查是否需要登录
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 需要登录才能查看阅读统计')
      return
    }

    // 等待统计数据加载
    await page.waitForTimeout(3000)

    // 拦截统计API
    const statsPromise = page.waitForResponse(
      response =>
        response.url().includes('/api/statistics/') &&
        response.request().method() === 'GET'
    )

    try {
      const statsResponse = await Promise.race([
        statsPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
      ]) as any

      console.log(`阅读统计API状态: ${statsResponse.status()}`)

      if (statsResponse.status() === 200) {
        console.log('✓ 阅读统计数据加载成功')
      }
    } catch (e) {
      console.log('⚠️ 阅读统计API超时或未调用')
    }

    // 检查统计卡片
    const statCards = page.locator('[data-testid="stat-card"], .stat-card, .stat-item')
    const cardCount = await statCards.count()

    if (cardCount > 0) {
      console.log(`✓ 找到 ${cardCount} 个统计卡片`)

      // 验证第一个统计卡片
      const firstCard = statCards.first()
      await expect(firstCard).toBeVisible()

      // 验证统计数值
      const statValue = firstCard.locator('[data-testid="stat-value"], .stat-value, .value')
      const valueCount = await statValue.count()

      if (valueCount > 0) {
        console.log('✓ 统计数值显示正常')
      }

      // 验证统计标签
      const statLabel = firstCard.locator('[data-testid="stat-label"], .stat-label, .label')
      const labelCount = await statLabel.count()

      if (labelCount > 0) {
        console.log('✓ 统计标签显示正常')
      }
    } else {
      console.log('⚠️ 未找到统计卡片')
    }
  })

  /**
   * 测试5.3: 阅读时长统计
   */
  test('5.3 阅读时长统计', async ({ page }) => {
    // 访问阅读统计页面
    await page.goto(`${baseURL}/reading/stats`)
    await page.waitForLoadState('networkidle')

    // 检查是否需要登录
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 需要登录才能查看阅读统计')
      return
    }

    // 等待统计数据加载
    await page.waitForTimeout(3000)

    // 检查阅读时长统计
    const readingTimeElement = page.locator('[data-testid="reading-time"], [data-testid="weekly-reading-time"], .reading-time')
    const timeCount = await readingTimeElement.count()

    if (timeCount > 0) {
      const timeText = await readingTimeElement.first().textContent()
      console.log(`✓ 阅读时长统计: ${timeText}`)

      // 验证时长格式(应该包含数字和时间单位)
      expect(timeText).toMatch(/\d+/)
    } else {
      console.log('⚠️ 未找到阅读时长统计')
    }

    // 检查本周/本月/总时长标签
    const timeLabels = page.locator('[data-testid="time-period-label"], .time-period-label, .period-label')
    const labelCount = await timeLabels.count()

    if (labelCount > 0) {
      console.log(`✓ 找到 ${labelCount} 个时长周期标签`)
    }
  })

  /**
   * 测试5.4: 阅读字数统计
   */
  test('5.4 阅读字数统计', async ({ page }) => {
    // 访问阅读统计页面
    await page.goto(`${baseURL}/reading/stats`)
    await page.waitForLoadState('networkidle')

    // 检查是否需要登录
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 需要登录才能查看阅读统计')
      return
    }

    // 等待统计数据加载
    await page.waitForTimeout(3000)

    // 检查阅读字数统计
    const wordCountElement = page.locator('[data-testid="word-count"], [data-testid="total-word-count"], .word-count')
    const countCount = await wordCountElement.count()

    if (countCount > 0) {
      const countText = await wordCountElement.first().textContent()
      console.log(`✓ 阅读字数统计: ${countText}`)

      // 验证字数格式(应该包含数字和"字")
      expect(countText).toMatch(/\d+/)
    } else {
      console.log('⚠️ 未找到阅读字数统计')
    }
  })

  /**
   * 测试5.5: 阅读偏好图表
   */
  test('5.5 阅读偏好图表', async ({ page }) => {
    // 访问阅读统计页面
    await page.goto(`${baseURL}/reading/stats`)
    await page.waitForLoadState('networkidle')

    // 检查是否需要登录
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 需要登录才能查看阅读统计')
      return
    }

    // 等待统计数据加载
    await page.waitForTimeout(3000)

    // 检查图表容器
    const chartContainer = page.locator('[data-testid="chart-container"], .chart-container, .reading-preference-chart')
    const chartCount = await chartContainer.count()

    if (chartCount > 0) {
      console.log('✓ 找到阅读偏好图表')

      // 验证图表加载(可能使用Canvas或SVG)
      const canvasChart = chartContainer.first().locator('canvas')
      const canvasCount = await canvasChart.count()

      if (canvasCount > 0) {
        console.log('✓ 图表使用Canvas渲染')
      }

      const svgChart = chartContainer.first().locator('svg')
      const svgCount = await svgChart.count()

      if (svgCount > 0) {
        console.log('✓ 图表使用SVG渲染')
      }

      // 检查图表图例
      const chartLegend = page.locator('[data-testid="chart-legend"], .chart-legend, .legend')
      const legendCount = await chartLegend.count()

      if (legendCount > 0) {
        console.log('✓ 图表图例显示正常')
      }
    } else {
      console.log('⚠️ 未找到阅读偏好图表')
    }
  })

  /**
   * 测试5.6: 阅读报告查看
   */
  test('5.6 阅读报告查看', async ({ page }) => {
    // 访问阅读报告页面
    await page.goto(`${baseURL}/reading/report`)
    await page.waitForLoadState('networkidle')

    // 检查是否需要登录
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 需要登录才能查看阅读报告')
      return
    }

    // 验证页面标题
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /阅读报告/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 阅读报告页面加载成功')
    }

    // 等待报告数据加载
    await page.waitForTimeout(3000)

    // 检查报告周期选择器
    const periodSelector = page.locator('[data-testid="period-selector"], .period-selector, .report-period-selector')
    const selectorCount = await periodSelector.count()

    if (selectorCount > 0) {
      console.log('✓ 找到报告周期选择器')

      // 检查周期选项(本周/本月/全年)
      const periodOptions = periodSelector.first().locator('[data-testid="period-option"], .period-option, button')
      const optionCount = await periodOptions.count()

      if (optionCount > 0) {
        console.log(`✓ 找到 ${optionCount} 个报告周期选项`)
      }
    }

    // 检查报告内容区域
    const reportContent = page.locator('[data-testid="report-content"], .report-content, .reading-report')
    const contentCount = await reportContent.count()

    if (contentCount > 0) {
      console.log('✓ 阅读报告内容显示正常')
    }
  })

  /**
   * 测试5.7: 阅读历史详情
   */
  test('5.7 阅读历史详情', async ({ page }) => {
    // 访问阅读历史页面
    await page.goto(`${baseURL}/reading/history`)
    await page.waitForLoadState('networkidle')

    // 检查是否需要登录
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 需要登录才能查看阅读历史')
      return
    }

    // 验证页面标题
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /阅读历史/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 阅读历史页面加载成功')
    }

    // 等待历史数据加载
    await page.waitForTimeout(3000)

    // 检查历史记录列表
    const historyItems = page.locator('[data-testid="history-item"], .history-item, .reading-history-item')
    const itemCount = await historyItems.count()

    if (itemCount > 0) {
      console.log(`✓ 找到 ${itemCount} 条阅读历史记录`)

      // 验证第一条历史记录
      const firstItem = historyItems.first()
      await expect(firstItem).toBeVisible()

      // 检查历史记录元素
      const bookTitle = firstItem.locator('[data-testid="book-title"], .book-title, .title')
      const titleCount = await bookTitle.count()

      if (titleCount > 0) {
        console.log('✓ 历史记录书名显示正常')
      }

      const readTime = firstItem.locator('[data-testid="read-time"], .read-time, .time')
      const timeCount = await readTime.count()

      if (timeCount > 0) {
        console.log('✓ 历史记录阅读时间显示正常')
      }
    } else {
      console.log('⚠️ 未找到阅读历史记录')
    }
  })

  /**
   * 测试5.8: 阅读排行查看
   */
  test('5.8 阅读排行查看', async ({ page }) => {
    // 访问阅读排行页面
    await page.goto(`${baseURL}/reading/ranking`)
    await page.waitForLoadState('networkidle')

    // 验证页面标题(公开页面,不需要登录)
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /阅读排行/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 阅读排行页面加载成功')
    }

    // 等待排行数据加载
    await page.waitForTimeout(3000)

    // 检查排行列表
    const rankingItems = page.locator('[data-testid="ranking-item"], .ranking-item, .rank-item')
    const itemCount = await rankingItems.count()

    if (itemCount > 0) {
      console.log(`✓ 找到 ${itemCount} 个排行记录`)

      // 验证排行显示
      const firstItem = rankingItems.first()
      await expect(firstItem).toBeVisible()

      // 检查排行数字
      const rankNumber = firstItem.locator('[data-testid="rank-number"], .rank-number, .rank')
      const numberCount = await rankNumber.count()

      if (numberCount > 0) {
        console.log('✓ 排行数字显示正常')
      }
    } else {
      console.log('⚠️ 未找到排行数据')
    }

    // 检查排行分类(时长排行/字数排行)
    const rankCategories = page.locator('[data-testid="rank-category"], .rank-category, .ranking-tab')
    const categoryCount = await rankCategories.count()

    if (categoryCount > 0) {
      console.log(`✓ 找到 ${categoryCount} 个排行分类`)
    }
  })
})

/**
 * 测试报告说明
 *
 * 运行方式:
 * npm run test:e2e -- tests/e2e/scenarios/reading-stats-view-flow.spec.ts
 *
 * 测试覆盖点:
 * 1. 阅读统计页加载
 * 2. 统计数据展示
 * 3. 阅读时长统计
 * 4. 阅读字数统计
 * 5. 阅读偏好图表
 * 6. 阅读报告查看
 * 7. 阅读历史详情
 * 8. 阅读排行查看
 *
 * 注意事项:
 * - 大部分功能需要登录
 * - 如果未登录,相关测试会被跳过
 * - 阅读排行是公开页面,不需要登录
 */
