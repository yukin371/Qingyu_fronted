/**
 * Playwright全局设置
 * 在所有测试运行前执行
 */

import { FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright tests setup...')

  // 可以在这里设置测试环境
  // 例如：启动mock服务器、准备测试数据等

  console.log('✅ Playwright tests setup completed')
}

export default globalSetup
