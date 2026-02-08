/**
 * E2E测试辅助函数 - 认证相关
 *
 * 选择器优先级策略:
 * 1. data-testid (优先)
 * 2. aria-label
 * 3. placeholder
 * 4. 其他属性选择器 (降级)
 */

import { Page, Locator } from '@playwright/test'

/**
 * 登录操作
 * @param page Playwright Page对象
 * @param username 用户名
 * @param password 密码
 */
export async function login(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  // 导航到登录页面
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // 使用优先级选择器策略填写登录表单
  const usernameInput = createLocatorWithFallbacks(page, [
    '[data-testid="login-username-input"]',
    'input[aria-label="用户名"]',
    'input[placeholder*="用户名"]',
    'input[placeholder*="邮箱"]',
    'input[name="username"]',
    'input[type="text"]'
  ])

  const passwordInput = createLocatorWithFallbacks(page, [
    '[data-testid="login-password-input"]',
    'input[aria-label="密码"]',
    'input[placeholder*="密码"]',
    'input[name="password"]',
    'input[type="password"]'
  ])

  const loginButton = createLocatorWithFallbacks(page, [
    '[data-testid="login-btn"]',
    'button[aria-label="登录"]',
    'button[type="submit"]',
    'button:has-text("立即登录")',
    'button:has-text("登录")'
  ])

  // 填写表单
  await usernameInput.first().fill(username)
  await passwordInput.first().fill(password)

  // 在点击前设置API拦截 - 使用更灵活的URL匹配
  const loginPromise = page.waitForResponse(
    response => {
      const url = response.url()
      // 支持多个可能的登录API路径
      return (url.includes('/auth/login') ||
              url.includes('/user/auth/login') ||
              url.includes('/shared/auth/login')) &&
             response.request().method() === 'POST'
    },
    { timeout: 10000 }
  )

  // 点击登录按钮
  await loginButton.first().click()

  // 智能等待登录完成 - 支持多种验证方式
  const loginResult = await Promise.race([
    // 优先级1: API响应验证
    loginPromise.then(response => ({ type: 'api', status: response.status() })),
    // 优先级2: URL跳转验证
    page.waitForURL('**/bookstore', { timeout: 5000 }).then(() => ({ type: 'url', location: 'bookstore' })),
    page.waitForURL('**/', { timeout: 5000 }).then(() => ({ type: 'url', location: 'home' })),
    // 优先级3: UI元素验证
    page.waitForSelector('[data-testid="user-menu"], .user-menu', { timeout: 5000 }).then(() => ({ type: 'ui' }))
  ]).catch(() => ({ type: 'timeout' }))

  // 根据结果类型进行日志记录
  if (loginResult.type === 'api') {
    console.log(`  登录成功: API响应 ${loginResult.status}`)
  } else if (loginResult.type === 'url') {
    console.log(`  登录成功: 跳转到 ${loginResult.location}`)
  } else if (loginResult.type === 'ui') {
    console.log('  登录成功: 用户菜单已显示')
  } else {
    // 兜底检查
    const currentUrl = page.url()
    if (!currentUrl.includes('/login')) {
      console.log('  登录成功: 已离开登录页')
    } else {
      throw new Error('登录验证失败：未检测到登录成功的迹象')
    }
  }
}

/**
 * 登出操作
 * @param page Playwright Page对象
 */
export async function logout(page: Page): Promise<void> {
  // 点击用户菜单
  const userMenu = createLocatorWithFallbacks(page, [
    '[data-testid="user-menu"]',
    '.user-menu',
    '[aria-label="用户菜单"]'
  ])
  await userMenu.first().click()

  // 点击登出按钮
  const logoutButton = createLocatorWithFallbacks(page, [
    '[data-testid="logout-btn"]',
    'button[aria-label="登出"]',
    'button:has-text("登出")',
    'button:has-text("退出登录")'
  ])
  await logoutButton.first().click()

  // 等待跳转到登录页面
  await page.waitForURL('**/login', { timeout: 5000 })
}

/**
 * 获取当前登录用户信息
 * @param page Playwright Page对象
 * @returns 用户信息
 */
export async function getCurrentUser(page: Page): Promise<{ username: string } | null> {
  const usernameElement = createLocatorWithFallbacks(page, [
    '[data-testid="user-username"]',
    '.user-menu .username',
    '.user-name',
    '[aria-label="用户名"]'
  ])

  const count = await usernameElement.count()
  if (count > 0) {
    const firstVisible = await findFirstVisible(usernameElement)
    if (firstVisible) {
      const username = await firstVisible.textContent()
      return { username: username?.trim() || '' }
    }
  }
  return null
}

/**
 * 创建灵活的API拦截验证器
 * @param page Playwright Page对象
 * @param apiPatterns API URL匹配模式数组
 * @param method HTTP方法
 * @returns Promise<Response>
 */
export function createAPIInterceptor(
  page: Page,
  apiPatterns: string[],
  method: string = 'GET'
): Promise<Response> {
  return page.waitForResponse(
    response => {
      const url = response.url()
      const requestMethod = response.request().method()
      return apiPatterns.some(pattern => url.includes(pattern)) &&
             requestMethod === method
    },
    { timeout: 10000 }
  )
}

/**
 * 智能验证登录成功
 * @param page Playwright Page对象
 * @returns 验证结果
 */
export async function verifyLoginSuccess(page: Page): Promise<{
  success: boolean
  method: 'api' | 'url' | 'ui' | 'timeout'
  details?: string
}> {
  try {
    // 方法1: 检查URL变化
    const currentUrl = page.url()
    if (currentUrl.includes('/bookstore') || currentUrl.includes('/home')) {
      return { success: true, method: 'url', details: `跳转到 ${currentUrl}` }
    }

    // 方法2: 检查用户菜单
    const userMenu = createLocatorWithFallbacks(page, [
      '[data-testid="user-menu"]',
      '.user-menu',
      '[aria-label="用户菜单"]'
    ])
    const menuCount = await userMenu.count()
    if (menuCount > 0) {
      const isVisible = await userMenu.first().isVisible().catch(() => false)
      if (isVisible) {
        return { success: true, method: 'ui', details: '用户菜单可见' }
      }
    }

    // 方法3: 检查localStorage中的token
    const hasToken = await page.evaluate(() => {
      return !!localStorage.getItem('token') || !!localStorage.getItem('auth_token')
    })
    if (hasToken) {
      return { success: true, method: 'ui', details: 'Token已存储' }
    }

    return { success: false, method: 'timeout', details: '未找到登录成功的证据' }
  } catch (error) {
    return { success: false, method: 'timeout', details: error.message }
  }
}

/**
 * 创建带有降级策略的选择器
 * @param page Playwright Page对象
 * @param selectors 选择器数组，按优先级排序
 * @returns Locator对象
 */
function createLocatorWithFallbacks(page: Page, selectors: string[]): Locator {
  let locator: Locator | null = null

  for (const selector of selectors) {
    if (!locator) {
      locator = page.locator(selector)
    } else {
      locator = locator.or(page.locator(selector))
    }
  }

  return locator || page.locator(selectors[0])
}

/**
 * 查找第一个可见的元素
 * @param locator Locator对象
 * @returns 第一个可见的Locator，如果没有则返回null
 */
async function findFirstVisible(locator: Locator): Promise<Locator | null> {
  const count = await locator.count()
  for (let i = 0; i < count; i++) {
    const element = locator.nth(i)
    if (await element.isVisible()) {
      return element
    }
  }
  return null
}
