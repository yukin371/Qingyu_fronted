/**
 * Playwright全局设置
 * 在所有测试运行前执行
 * 功能：验证后端服务可用、准备测试环境
 *
 * 环境变量:
 * - USE_EXISTING_BACKEND: 是否使用现有后端服务 (默认: true)
 * - BACKEND_URL: 后端服务URL (默认: http://localhost:8080)
 * - AUTO_START_BACKEND: 是否自动启动后端 (默认: false)
 */

import { FullConfig } from '@playwright/test'
import { createBackendService } from '../helpers/backend-service'

// 后端服务配置
const BACKEND_CONFIG = {
  backendPath: process.env.BACKEND_PATH || '../Qingyu_backend',
  port: parseInt(process.env.BACKEND_PORT || '8080'),
  startupTimeout: parseInt(process.env.BACKEND_STARTUP_TIMEOUT || '90000'), // 90秒
  healthCheckPath: '/api/v1/system/health'
}

// 配置选项
const USE_EXISTING_BACKEND = process.env.USE_EXISTING_BACKEND !== 'false'
const AUTO_START_BACKEND = process.env.AUTO_START_BACKEND === 'true'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright E2E tests setup...')
  console.log('='.repeat(60))

  try {
    const backendURL = process.env.BACKEND_URL || `http://localhost:${BACKEND_CONFIG.port}`

    if (USE_EXISTING_BACKEND) {
      console.log('\n📡 模式: 使用现有后端服务')
      console.log(`  后端URL: ${backendURL}`)

      // 验证后端服务是否可用
      console.log('\n⏳ 验证后端服务连接...')

      const maxAttempts = 10
      let attempts = 0
      let backendHealthy = false

      while (attempts < maxAttempts && !backendHealthy) {
        try {
          const response = await fetch(`${backendURL}${BACKEND_CONFIG.healthCheckPath}`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          })

          if (response.ok || response.status === 200) {
            backendHealthy = true
            console.log(`  ✓ 后端服务可用: ${response.status}`)
          }
        } catch (error) {
          attempts++
          if (attempts < maxAttempts) {
            console.log(`  尝试 ${attempts}/${maxAttempts}: 后端服务未响应，等待中...`)
            await new Promise(resolve => setTimeout(resolve, 3000))
          }
        }
      }

      if (!backendHealthy) {
        if (AUTO_START_BACKEND) {
          console.log('\n⚠️  后端服务未响应，尝试自动启动...')
          console.log('  (设置 AUTO_START_BACKEND=true 来启用此功能)')

          const backendService = await createBackendService({
            ...BACKEND_CONFIG,
            env: {
              GO_ENV: 'test',
              DB_NAME: 'qingyu_e2e_test',
              LOG_LEVEL: 'info'
            }
          })

          console.log(`  后端服务已启动: ${backendService.getURL()}`)
        } else {
          throw new Error(
            `后端服务不可用: ${backendURL}\n` +
            '请确保后端服务已启动，或设置 AUTO_START_BACKEND=true'
          )
        }
      }

    } else {
      console.log('\n📦 模式: 自动启动后端服务')
      console.log(`  后端路径: ${BACKEND_CONFIG.backendPath}`)
      console.log(`  服务端口: ${BACKEND_CONFIG.port}`)

      const backendService = await createBackendService({
        ...BACKEND_CONFIG,
        env: {
          GO_ENV: 'test',
          DB_NAME: 'qingyu_e2e_test',
          LOG_LEVEL: 'info'
        }
      })

      console.log(`  后端URL: ${backendService.getURL()}`)
      console.log(`  后端PID: ${backendService.getPID()}`)
    }

    // 设置环境变量供测试使用
    process.env.BACKEND_URL = backendURL
    process.env.BACKEND_PORT = BACKEND_CONFIG.port.toString()

    console.log('\n' + '='.repeat(60))
    console.log('✅ E2E tests setup completed successfully')
    console.log('='.repeat(60))
    console.log(`\n后端服务: ${backendURL}`)
    console.log('准备开始测试...\n')

  } catch (error) {
    console.error('\n❌ E2E tests setup failed!')
    console.error('Error:', error instanceof Error ? error.message : error)

    // 清理可能已启动的服务
    try {
      const { stopGlobalBackendService } = await import('../helpers/backend-service')
      await stopGlobalBackendService()
    } catch (cleanupError) {
      // 忽略清理错误
    }

    process.exit(1)
  }
}

export default globalSetup
