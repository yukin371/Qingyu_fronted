/**
 * E2E测试辅助函数 - 认证相关
 */

import { Page } from '@playwright/test'

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

  // 填写登录表单
  await page.fill('input[name="username"]', username)
  await page.fill('input[name="password"]', password)

  // 点击登录按钮
  await page.click('button[type="submit"]')

  // 等待登录完成（等待跳转或成功消息）
  await page.waitForURL('**/', { timeout: 5000 })
}

/**
 * 登出操作
 * @param page Playwright Page对象
 */
export async function logout(page: Page): Promise<void> {
  // 点击用户菜单
  await page.click('.user-menu')

  // 点击登出按钮
  await page.click('button:has-text("登出")')

  // 等待跳转到登录页面
  await page.waitForURL('**/login')
}

/**
 * 获取当前登录用户信息
 * @param page Playwright Page对象
 * @returns 用户信息
 */
export async function getCurrentUser(page: Page): Promise<{ username: string } | null> {
  const usernameElement = page.locator('.user-menu .username')
  if (await usernameElement.isVisible()) {
    const username = await usernameElement.textContent()
    return { username: username || '' }
  }
  return null
}
