#!/usr/bin/env node
/**
 * Orval API 生成脚本 - Phase 4 版本
 *
 * 生成 Writer、Social、AI 模块的 API
 */

import { generate } from 'orval'

const modules = ['writer', 'social', 'ai']

async function main() {
  const results = []

  for (const moduleName of modules) {
    try {
      console.log(`\n🚀 开始生成 ${moduleName.toUpperCase()} 模块 API...`)

      await generate('orval.config.ts', process.cwd(), {
        project: moduleName
      })

      console.log(`✅ ${moduleName.toUpperCase()} 模块 API 生成成功！`)
      results.push({ module: moduleName, success: true })
    } catch (error) {
      console.error(`❌ ${moduleName.toUpperCase()} 模块 API 生成失败:`, error.message)
      results.push({ module: moduleName, success: false, error: error.message })
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 生成结果汇总:')
  results.forEach(r => {
    console.log(`  ${r.success ? '✅' : '❌'} ${r.module.toUpperCase()}: ${r.success ? '成功' : r.error}`)
  })

  const failedCount = results.filter(r => !r.success).length
  if (failedCount > 0) {
    process.exit(1)
  }
}

main()
