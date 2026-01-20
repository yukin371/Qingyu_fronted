/**
 * Playwright全局清理
 * 在所有测试运行后执行
 */

import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Playwright tests teardown...')

  // 可以在这里清理测试环境
  // 例如：关闭服务器、清理测试数据等

  console.log('✅ Playwright tests teardown completed')
}

export default globalTeardown
