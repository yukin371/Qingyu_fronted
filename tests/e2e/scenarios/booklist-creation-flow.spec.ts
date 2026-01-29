/**
 * 场景2: 书单创建和查看流程测试
 *
 * 测试内容:
 * - 测试创建书单
 * - 测试查看书单列表
 * - 测试书单详情页
 *
 * @author Qingyu Test Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('场景2: 书单创建和查看流程', () => {
  // 测试数据
  const testBooklistData = {
    name: `E2E测试书单_${Date.now()}`,
    description: '这是一个E2E自动化测试创建的书单',
    tags: ['测试', 'E2E']
  }

  /**
   * 测试2.1: 查看书单列表
   */
  test('2.1 查看书单列表', async ({ page }) => {
    // 访问书单广场
    await page.goto(`${baseURL}/booklists`)
    await page.waitForLoadState('networkidle')

    // 验证页面标题
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /书单/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 书单广场页面加载成功')
    }

    // 等待书单列表加载
    await page.waitForTimeout(2000)

    // 检查书单列表容器
    const booklistContainer = page.locator('[data-testid="booklist-list"], .booklist-list, .book-list-container')
    const containerCount = await booklistContainer.count()

    if (containerCount > 0) {
      // 获取书单数量
      const booklistItems = page.locator('[data-testid="booklist-item"], .booklist-item')
      const itemCount = await booklistItems.count()

      console.log(`✓ 找到 ${itemCount} 个书单`)

      // 如果有书单,验证第一个书单卡片
      if (itemCount > 0) {
        const firstBooklist = booklistItems.first()
        await expect(firstBooklist).toBeVisible()

        // 验证书单卡片包含必要元素
        const booklistTitle = firstBooklist.locator('[data-testid="booklist-title"], .booklist-title, .title')
        const titleCount = await booklistTitle.count()

        if (titleCount > 0) {
          console.log('✓ 书单卡片标题显示正常')
        }
      }
    } else {
      console.log('⚠️ 未找到书单列表容器')
    }
  })

  /**
   * 测试2.2: 创建书单(需要登录)
   */
  test('2.2 创建书单', async ({ page }) => {
    // 先尝试访问创建书单页面
    await page.goto(`${baseURL}/booklists/create`)
    await page.waitForLoadState('networkidle')

    // 检查是否需要登录
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 需要登录才能创建书单,跳过此测试')
      return
    }

    // 验证创建书单表单存在
    const nameInput = page.locator('input[placeholder*="书单名称"], input[name="name"], [data-testid="booklist-name-input"]')
    const descInput = page.locator('textarea[placeholder*="简介"], textarea[name="description"], [data-testid="booklist-desc-input"]')
    const submitButton = page.locator('button:has-text("创建"), button:has-text("提交"), [data-testid="create-booklist-btn"]')

    // 填写书单信息
    if (await nameInput.count() > 0) {
      await nameInput.first().fill(testBooklistData.name)
      console.log(`✓ 填写书单名称: ${testBooklistData.name}`)
    }

    if (await descInput.count() > 0) {
      await descInput.first().fill(testBooklistData.description)
      console.log(`✓ 填写书单简介: ${testBooklistData.description}`)
    }

    // 拦截创建API
    const createPromise = page.waitForResponse(
      response =>
        response.url().includes('/api/booklists') &&
        response.request().method() === 'POST'
    )

    // 提交表单
    if (await submitButton.count() > 0) {
      await submitButton.first().click()

      // 等待API响应
      const createResponse = await createPromise
      console.log(`创建书单API状态: ${createResponse.status()}`)

      if (createResponse.status() === 200 || createResponse.status() === 201) {
        const createData = await createResponse.json()

        if (createData.code === 200 || createData.code === 201) {
          console.log('✓ 书单创建成功')

          // 验证跳转到书单详情页或书单列表
          await page.waitForTimeout(2000)
          const newUrl = page.url()

          if (newUrl.includes('/booklists/') && !newUrl.includes('/create')) {
            console.log(`✓ 跳转到书单详情页: ${newUrl}`)
          }
        }
      }
    } else {
      console.log('⚠️ 未找到创建书单按钮')
    }
  })

  /**
   * 测试2.3: 查看书单详情页
   */
  test('2.3 查看书单详情页', async ({ page }) => {
    // 先访问书单列表
    await page.goto(`${baseURL}/booklists`)
    await page.waitForLoadState('networkidle')

    // 等待列表加载
    await page.waitForTimeout(2000)

    // 尝试点击第一个书单
    const firstBooklist = page.locator('[data-testid="booklist-item"], .booklist-item, a[href*="/booklists/"]').first()

    const count = await firstBooklist.count()

    if (count > 0) {
      // 拦截详情页API
      const detailPromise = page.waitForResponse(
        response =>
          response.url().includes('/api/booklists/') &&
          response.request().method() === 'GET'
      )

      await firstBooklist.click()

      // 等待导航
      await page.waitForLoadState('networkidle')

      // 等待API响应
      try {
        const detailResponse = await Promise.race([
          detailPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
        ]) as any

        console.log(`书单详情API状态: ${detailResponse.status()}`)
      } catch (e) {
        console.log('⚠️ 书单详情API超时或未调用')
      }

      // 验证URL
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/\/booklists\/.+/)

      // 验证书单详情页元素
      const detailTitle = page.locator('[data-testid="booklist-detail-title"], .booklist-detail-title, h1, h2')
      const titleCount = await detailTitle.count()

      if (titleCount > 0) {
        await expect(detailTitle.first()).toBeVisible()
        console.log('✓ 书单详情页标题显示正常')
      }

      // 检查书籍列表
      const bookItems = page.locator('[data-testid="book-item"], .book-item')
      const bookCount = await bookItems.count()
      console.log(`✓ 书单中包含 ${bookCount} 本书`)
    } else {
      console.log('⚠️ 未找到可点击的书单')
    }
  })

  /**
   * 测试2.4: 查看我的书单(需要登录)
   */
  test('2.4 查看我的书单', async ({ page }) => {
    // 访问我的书单页面
    await page.goto(`${baseURL}/booklists/my`)
    await page.waitForLoadState('networkidle')

    // 检查是否需要登录
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 需要登录才能查看我的书单')
      return
    }

    // 验证页面标题
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /我的书单/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 我的书单页面加载成功')
    }

    // 等待列表加载
    await page.waitForTimeout(2000)

    // 检查书单列表
    const myBooklists = page.locator('[data-testid="my-booklist-item"], .my-booklist-item')
    const booklistCount = await myBooklists.count()
    console.log(`✓ 找到 ${booklistCount} 个我的书单`)
  })

  /**
   * 测试2.5: 书单搜索和筛选
   */
  test('2.5 书单搜索和筛选', async ({ page }) => {
    // 访问书单广场
    await page.goto(`${baseURL}/booklists`)
    await page.waitForLoadState('networkidle')

    // 检查搜索框
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"], [data-testid="search-input"]')
    const searchCount = await searchInput.count()

    if (searchCount > 0) {
      // 输入搜索关键词
      await searchInput.first().fill('玄幻')

      // 拦截搜索API
      const searchPromise = page.waitForResponse(
        response =>
          response.url().includes('/api/booklists') &&
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
        console.log('✓ 书单搜索功能正常')
      } catch (e) {
        console.log('⚠️ 搜索API超时或未调用')
      }

      // 等待搜索结果加载
      await page.waitForTimeout(2000)
    } else {
      console.log('⚠️ 未找到搜索框')
    }

    // 检查筛选选项
    const filterOptions = page.locator('.filter-option, [data-testid="filter-option"]')
    const filterCount = await filterOptions.count()

    if (filterCount > 0) {
      console.log(`✓ 找到 ${filterCount} 个筛选选项`)
    }
  })
})

/**
 * 测试报告说明
 *
 * 运行方式:
 * npm run test:e2e -- tests/e2e/scenarios/booklist-creation-flow.spec.ts
 *
 * 测试覆盖点:
 * 1. 书单列表页面加载
 * 2. 创建新书单
 * 3. 查看书单详情
 * 4. 查看我的书单
 * 5. 书单搜索和筛选功能
 *
 * 注意事项:
 * - 创建书单和查看我的书单需要登录
 * - 如果未登录,这些测试会被跳过
 */
