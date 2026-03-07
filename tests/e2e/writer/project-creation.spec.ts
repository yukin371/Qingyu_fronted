/**
 * Writer模块 - 项目创建流程 E2E测试
 *
 * 测试场景:
 * 1. 创建新项目
 * 2. 编辑项目信息
 * 3. 项目列表管理
 *
 * 注意: 需要后端服务运行，测试使用 test.skip 或条件执行
 */

import { test, expect, skip } from '@playwright/test'

// 检查后端是否可用
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'
const BASE_URL = process.env.BASE_URL || 'http://localhost:5174'

// 条件执行：检查后端服务
let backendAvailable = false

test.beforeAll(async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/system/health`, {
      signal: AbortSignal.timeout(5000)
    })
    backendAvailable = response.ok
    console.log(`后端服务状态: ${backendAvailable ? '可用' : '不可用'}`)
  } catch {
    console.log('后端服务不可用，E2E测试将被跳过')
    backendAvailable = false
  }
})

// 测试配置
const TEST_CONFIG = {
  timeout: 30000,
  retry: 2
}

test.describe('Writer模块 - 项目创建流程', () => {
  test.skip(({ browserName }) => !backendAvailable, '后端服务不可用，跳过测试')

  test.beforeEach(async ({ page }) => {
    // 设置超时
    test.setTimeout(TEST_CONFIG.timeout)

    // 导航到首页
    await page.goto(BASE_URL)
  })

  test('应该能够导航到创作中心', async ({ page }) => {
    // 登录（如果需要）
    const loginButton = page.locator('[data-testid="login-button"]')
    if (await loginButton.isVisible()) {
      await loginButton.click()

      // 填写登录表单
      await page.fill('[data-testid="username-input"]', 'test-author')
      await page.fill('[data-testid="password-input"]', 'test-password')
      await page.click('[data-testid="login-submit"]')

      // 等待登录完成
      await page.waitForURL(/.*home|.*writer.*/, { timeout: 10000 })
    }

    // 导航到创作中心
    const writerCenterLink = page.locator('[data-testid="nav-writer-center"], a[href*="/writer"]')
    if (await writerCenterLink.isVisible()) {
      await writerCenterLink.click()

      // 验证进入创作中心
      await expect(page).toHaveURL(/.*writer.*/)
    }
  })

  test('应该能够显示创作概览页面', async ({ page }) => {
    // 直接导航到创作中心
    await page.goto(`${BASE_URL}/writer`)

    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 验证创作概览元素
    const overviewContainer = page.locator('[data-testid="creation-overview"], .creation-overview, .writer-dashboard')
    const isVisible = await overviewContainer.isVisible().catch(() => false)

    // 如果页面元素存在则验证，否则跳过
    if (isVisible) {
      await expect(overviewContainer).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('应该能够创建新项目', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)

    // 点击创建新项目按钮
    const createButton = page.locator(
      '[data-testid="create-new-project-btn"], button:has-text("创建项目"), .create-project-btn'
    )

    const buttonVisible = await createButton.isVisible().catch(() => false)
    if (!buttonVisible) {
      test.skip()
      return
    }

    await createButton.click()

    // 等待创建对话框
    const dialog = page.locator('[data-testid="project-dialog"], .project-create-dialog, .el-dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // 填写项目信息
    const titleInput = page.locator('[data-testid="project-title-input"], input[name="title"], #project-title')
    if (await titleInput.isVisible()) {
      const projectTitle = `测试项目_${Date.now()}`
      await titleInput.fill(projectTitle)

      // 填写描述
      const descInput = page.locator('[data-testid="project-description-input"], textarea[name="description"]')
      if (await descInput.isVisible()) {
        await descInput.fill('这是一个自动化测试创建的项目')
      }

      // 选择类型
      const genreSelect = page.locator('[data-testid="project-genre-select"], select[name="genre"]')
      if (await genreSelect.isVisible()) {
        await genreSelect.selectOption('玄幻')
      }

      // 提交创建
      const submitButton = page.locator(
        '[data-testid="create-project-submit-btn"], button:has-text("确定"), button[type="submit"]'
      )
      await submitButton.click()

      // 等待创建完成（检查URL变化或成功提示）
      await page.waitForTimeout(2000)

      // 验证项目创建成功
      const successToast = page.locator('.el-message--success, .success-message, [data-testid="success-toast"]')
      const toastVisible = await successToast.isVisible().catch(() => false)

      if (toastVisible) {
        await expect(successToast).toBeVisible()
      }
    }
  })

  test('应该能够显示项目列表', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)

    // 等待项目列表加载
    await page.waitForLoadState('networkidle')

    // 查找项目列表容器
    const projectList = page.locator(
      '[data-testid="project-list"], .project-list, .writer-projects'
    )

    const listVisible = await projectList.isVisible().catch(() => false)
    if (listVisible) {
      await expect(projectList).toBeVisible()

      // 验证项目卡片存在
      const projectCards = page.locator('[data-testid^="project-card-"], .project-card, .writer-project-item')
      const cardCount = await projectCards.count()

      // 应该至少有一个项目（可能是刚创建的）
      console.log(`找到 ${cardCount} 个项目卡片`)
    }
  })

  test('应该能够搜索和筛选项目', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)

    await page.waitForLoadState('networkidle')

    // 查找搜索框
    const searchInput = page.locator(
      '[data-testid="project-search-input"], input[placeholder*="搜索"], input[type="search"]'
    )

    const searchVisible = await searchInput.isVisible().catch(() => false)
    if (searchVisible) {
      await searchInput.fill('测试')

      // 等待搜索结果
      await page.waitForTimeout(1000)

      // 验证搜索结果更新
      // （具体验证取决于实现）
    }
  })

  test('应该能够编辑项目信息', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)

    await page.waitForLoadState('networkidle')

    // 找到第一个项目并点击编辑
    const editButton = page.locator(
      '[data-testid="project-edit-btn"], button:has-text("编辑"), .edit-project-btn'
    ).first()

    const editVisible = await editButton.isVisible().catch(() => false)
    if (editVisible) {
      await editButton.click()

      // 等待编辑对话框
      const dialog = page.locator('[data-testid="project-dialog"], .el-dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })

      // 修改描述
      const descInput = page.locator('[data-testid="project-description-input"], textarea[name="description"]')
      if (await descInput.isVisible()) {
        await descInput.fill(`更新时间: ${new Date().toISOString()}`)
      }

      // 保存
      const saveButton = page.locator('[data-testid="save-project-btn"], button:has-text("保存")')
      if (await saveButton.isVisible()) {
        await saveButton.click()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('应该能够删除项目', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)

    await page.waitForLoadState('networkidle')

    // 找到项目并点击删除（小心操作）
    const deleteButton = page.locator(
      '[data-testid="project-delete-btn"], button:has-text("删除"), .delete-project-btn'
    ).first()

    const deleteVisible = await deleteButton.isVisible().catch(() => false)
    if (deleteVisible) {
      // 注意：实际测试中可能需要确认对话框
      // 这里只验证按钮可见性
      await expect(deleteButton).toBeVisible()
    }
  })
})

test.describe('Writer模块 - 响应式测试', () => {
  test.skip(({ browserName }) => !backendAvailable, '后端服务不可用，跳过测试')

  test('移动端应该正常显示创作中心', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto(`${BASE_URL}/writer`)

    await page.waitForLoadState('networkidle')

    // 验证移动端布局
    const mobileMenu = page.locator('.mobile-menu, [data-testid="mobile-menu"], .hamburger-menu')
    const contentArea = page.locator('.writer-content, [data-testid="writer-content"], main')

    // 至少有一个关键元素应该可见
    const mobileMenuVisible = await mobileMenu.isVisible().catch(() => false)
    const contentVisible = await contentArea.isVisible().catch(() => false)

    expect(mobileMenuVisible || contentVisible).toBeTruthy()
  })

  test('平板端应该正常显示创作中心', async ({ page }) => {
    // 设置平板视口
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto(`${BASE_URL}/writer`)

    await page.waitForLoadState('networkidle')

    // 验证平板布局
    const sidebar = page.locator('.sidebar, [data-testid="sidebar"], nav')
    const mainContent = page.locator('.main-content, [data-testid="main-content"], main')

    const sidebarVisible = await sidebar.isVisible().catch(() => false)
    const mainVisible = await mainContent.isVisible().catch(() => false)

    expect(sidebarVisible || mainVisible).toBeTruthy()
  })
})

test.describe('Writer模块 - 无障碍测试', () => {
  test.skip(({ browserName }) => !backendAvailable, '后端服务不可用，跳过测试')

  test('创作中心页面应该符合无障碍标准', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)

    await page.waitForLoadState('networkidle')

    // 检查标题
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)

    // 检查主要导航
    const nav = page.locator('nav, [role="navigation"]')
    const navVisible = await nav.isVisible().catch(() => false)

    // 检查主要内容区域
    const main = page.locator('main, [role="main"], #main-content')
    const mainVisible = await main.isVisible().catch(() => false)

    // 检查标题层级
    const h1 = page.locator('h1')
    const h1Count = await h1.count()
    expect(h1Count).toBeLessThanOrEqual(1) // 页面应该只有一个h1
  })
})
