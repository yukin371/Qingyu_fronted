/**
 * Playwright全局清理
 * 在所有测试运行后执行
 * 功能：清理测试环境、停止自动启动的后端服务
 */

import { FullConfig } from '@playwright/test'

// 配置选项
const USE_EXISTING_BACKEND = process.env.USE_EXISTING_BACKEND !== 'false'
const AUTO_START_BACKEND = process.env.AUTO_START_BACKEND === 'true'

async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Starting Playwright tests teardown...')
  console.log('='.repeat(60))

  try {
    // 只有在自动启动模式下才停止后端服务
    if (!USE_EXISTING_BACKEND || AUTO_START_BACKEND) {
      console.log('\n🛑 停止自动启动的后端服务...')

      const { stopGlobalBackendService } = await import('../helpers/backend-service')
      await stopGlobalBackendService()

      console.log('✓ 后端服务已停止')
    } else {
      console.log('\n✓ 使用现有后端服务，无需停止')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ E2E tests teardown completed')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n⚠️  Teardown completed with errors:')
    console.error(error)
    // 不抛出错误，允许测试正常结束
  }
}

export default globalTeardown
