/**
 * 手动测试分类和状态筛选功能
 * 运行方式: npx playwright test test-category-filter --headed
 */

import { test, expect } from '@playwright/test'

test.describe('分类和状态筛选功能测试', () => {
  test('应该能够导航到搜索页面', async ({ page }) => {
    await page.goto('/bookstore/search')
    await page.waitForLoadState('load')

    expect(page.url()).toContain('/bookstore/search')
  })

  test('应该能够执行搜索并显示筛选器', async ({ page }) => {
    // 导航到搜索页面
    await page.goto('/bookstore/search')

    // 执行搜索
    await page.fill('input[placeholder*="搜索书名、作者、标签"]', '修仙')
    await page.click('button:has-text("搜索")')

    // 等待筛选器出现
    await page.waitForSelector('.el-select', { timeout: 5000 })

    // 验证筛选器存在
    const categorySelect = page.locator('.el-select').filter({ hasText: '分类' })
    await expect(categorySelect).toBeVisible()

    const statusSelect = page.locator('.el-select').filter({ hasText: '状态' })
    await expect(statusSelect).toBeVisible()
  })

  test('应该能够打开分类筛选下拉框', async ({ page }) => {
    // 执行搜索
    await page.goto('/bookstore/search')
    await page.fill('input[placeholder*="搜索书名、作者、标签"]', '修仙')
    await page.click('button:has-text("搜索")')

    // 等待筛选器出现
    await page.waitForSelector('.el-select')

    // 点击分类筛选器
    const categorySelect = page.locator('.el-select').filter({ hasText: '分类' })
    await categorySelect.click()

    // 等待下拉框出现 - 使用.first()因为页面有多个select
    const listbox = page.locator('[role="listbox"]').first()
    await expect(listbox).toBeVisible()

    // 验证至少有一个选项
    const options = listbox.locator('[role="option"]')
    const count = await options.count()
    expect(count).toBeGreaterThan(0)

    console.log(`找到 ${count} 个分类选项`)
  })

  test('应该能够选择分类选项', async ({ page }) => {
    // 执行搜索
    await page.goto('/bookstore/search')
    await page.fill('input[placeholder*="搜索书名、作者、标签"]', '修仙')
    await page.click('button:has-text("搜索")')

    // 等待筛选器出现
    await page.waitForSelector('.el-select')

    // 点击分类筛选器
    const categorySelect = page.locator('.el-select').filter({ hasText: '分类' })
    await categorySelect.click()
    await page.waitForTimeout(300)

    // 等待下拉框出现并选择选项
    const listbox = page.locator('[role="listbox"]').first()
    const option = listbox.locator('[role="option"]:has-text("全部分类")')
    await option.click()

    // 等待网络请求完成
    await page.waitForLoadState('networkidle')

    console.log('成功选择分类选项')
  })

  test('应该能够打开状态筛选下拉框', async ({ page }) => {
    // 执行搜索
    await page.goto('/bookstore/search')
    await page.fill('input[placeholder*="搜索书名、作者、标签"]', '修仙')
    await page.click('button:has-text("搜索")')

    // 等待筛选器出现
    await page.waitForSelector('.el-select')

    // 点击状态筛选器
    const statusSelect = page.locator('.el-select').filter({ hasText: '状态' })
    await statusSelect.click()

    // 等待下拉框出现 - 使用.nth(1)因为状态是第二个select
    const listbox = page.locator('[role="listbox"]').nth(1)
    await expect(listbox).toBeVisible()

    // 验证至少有一个选项
    const options = listbox.locator('[role="option"]')
    const count = await options.count()
    expect(count).toBeGreaterThan(0)

    console.log(`找到 ${count} 个状态选项`)
  })

  test('应该能够选择状态选项', async ({ page }) => {
    // 执行搜索
    await page.goto('/bookstore/search')
    await page.fill('input[placeholder*="搜索书名、作者、标签"]', '修仙')
    await page.click('button:has-text("搜索")')

    // 等待筛选器出现
    await page.waitForSelector('.el-select')

    // 点击状态筛选器
    const statusSelect = page.locator('.el-select').filter({ hasText: '状态' })
    await statusSelect.click()
    await page.waitForTimeout(300)

    // 等待下拉框出现并选择选项
    const listbox = page.locator('[role="listbox"]').nth(1)
    const option = listbox.locator('[role="option"]:has-text("连载中")')
    await option.click()

    // 等待网络请求完成
    await page.waitForLoadState('networkidle')

    console.log('成功选择状态选项')
  })

  test('应该能够处理不存在的分类选项', async ({ page }) => {
    // 执行搜索
    await page.goto('/bookstore/search')
    await page.fill('input[placeholder*="搜索书名、作者、标签"]', '修仙')
    await page.click('button:has-text("搜索")')

    // 等待筛选器出现
    await page.waitForSelector('.el-select')

    // 点击分类筛选器
    const categorySelect = page.locator('.el-select').filter({ hasText: '分类' })
    await categorySelect.click()

    // 等待下拉框出现
    await page.waitForSelector('[role="listbox"]', { timeout: 3000 })

    // 尝试查找不存在的选项
    const option = page.locator('[role="option"]:has-text("不存在的分类")')
    const count = await option.count()

    expect(count).toBe(0)
    console.log('正确处理不存在的分类选项')
  })
})
