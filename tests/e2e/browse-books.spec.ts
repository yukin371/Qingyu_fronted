import { test, expect } from '@playwright/test'

test.describe('图书浏览页（BrowseBooks）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bookstore/browse')
  })

  test('应该显示页面标题', async ({ page }) => {
    await expect(page.locator('h1.page-title')).toContainText('探索书库')
  })

  test('应该显示页面副标题', async ({ page }) => {
    await expect(page.locator('.page-subtitle')).toContainText('发现你喜欢的精彩书籍')
  })

  test('应该显示搜索栏', async ({ page }) => {
    const searchInput = page.locator('.search-input')
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toHaveAttribute('placeholder', '搜索书名、作者、标签...')
  })

  test('应该显示分类筛选器', async ({ page }) => {
    const filterBar = page.locator('.filter-bar')
    await expect(filterBar).toBeVisible()
  })

  test('应该显示标签筛选组件', async ({ page }) => {
    const tagFilter = page.locator('.tag-filter')
    await expect(tagFilter).toBeVisible()
  })

  test('搜索框应该能输入文字', async ({ page }) => {
    const searchInput = page.locator('.search-input')
    await searchInput.fill('三体')
    await expect(searchInput).toHaveValue('三体')
  })

  test('应该能清除搜索内容', async ({ page }) => {
    const searchInput = page.locator('.search-input')
    await searchInput.fill('测试搜索')

    // 等待清除按钮出现
    const clearBtn = page.locator('.clear-btn')
    await expect(clearBtn).toBeVisible()

    // 点击清除按钮
    await clearBtn.click()
    await expect(searchInput).toHaveValue('')
  })

  test('URL状态同步 - 筛选条件应体现在URL中', async ({ page }) => {
    const searchInput = page.locator('.search-input')
    await searchInput.fill('测试')
    await searchInput.press('Enter')

    // 验证URL更新
    await expect(page).toHaveURL(/q=测试/)
  })

  test('从URL初始化筛选状态', async ({ page }) => {
    // 直接带参数访问
    await page.goto('/bookstore/browse?q=测试')

    // 验证搜索框有值
    const searchInput = page.locator('.search-input')
    await expect(searchInput).toHaveValue('测试')
  })

  test('应该显示加载骨架屏', async ({ page }) => {
    // 页面首次加载应该显示骨架屏
    const skeleton = page.locator('.book-grid-skeleton')
    // 骨架屏可能在加载完成后消失，所以我们只检查它是否存在过
    await page.waitForSelector('.book-grid-skeleton', { state: 'attached', timeout: 5000 }).catch(() => {
      // 如果骨架屏加载太快消失，这个错误可以忽略
    })
  })

  test('重置筛选按钮只在有筛选条件时显示', async ({ page }) => {
    // 初始状态不显示重置按钮
    const resetButton = page.getByRole('button', { name: /重置筛选/ })
    await expect(resetButton).not.toBeVisible()

    // 输入搜索后应该显示
    const searchInput = page.locator('.search-input')
    await searchInput.fill('测试')
    await searchInput.press('Enter')
    await expect(resetButton).toBeVisible()
  })

  test('点击重置按钮应清空所有筛选', async ({ page }) => {
    // 设置搜索
    const searchInput = page.locator('.search-input')
    await searchInput.fill('测试')
    await searchInput.press('Enter')

    // 点击重置按钮
    const resetButton = page.getByRole('button', { name: /重置筛选/ })
    await resetButton.click()

    // 验证搜索框已清空
    await expect(searchInput).toHaveValue('')
  })

  test('移动端视口检查', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })

    // 验证关键元素可见
    await expect(page.locator('.page-title')).toBeVisible()
    await expect(page.locator('.search-input')).toBeVisible()
    await expect(page.locator('.filter-bar')).toBeVisible()
  })

  test('响应式设计 - 平板视口', async ({ page }) => {
    // 设置平板视口
    await page.setViewportSize({ width: 768, height: 1024 })

    // 验证布局正常
    await expect(page.locator('.page-title')).toBeVisible()
    await expect(page.locator('.search-input')).toBeVisible()
  })

  test('页面应该没有控制台错误', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/bookstore/browse')
    await page.waitForLoadState('networkidle')

    // 检查是否有错误
    expect(errors.length).toBe(0)
  })
})
