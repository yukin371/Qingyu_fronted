#!/usr/bin/env node
/**
 * Phase 5 API 生成脚本
 * 生成 Finance 和 Notification 模块的 API
 */

import { generate } from 'orval'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, '..')

async function generateModule(moduleName) {
  console.log(`\n🚀 开始生成 ${moduleName.toUpperCase()} 模块 API...`)
  
  try {
    await generate(
      'orval.config.ts',
      root,
      {
        output: false,
      }
    )
    console.log(`✅ ${moduleName.toUpperCase()} 模块 API 生成成功！`)
    return true
  } catch (error) {
    console.error(`❌ ${moduleName.toUpperCase()} 模块 API 生成失败:`)
    console.error(error.message)
    return false
  }
}

async function main() {
  console.log('============================================================')
  console.log('📦 Phase 5: Finance & Notification 模块 API 生成')
  console.log('============================================================')

  const modules = ['finance', 'notification']
  const results = []

  for (const mod of modules) {
    const success = await generateModule(mod)
    results.push({ module: mod, success })
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 生成结果汇总:')
  results.forEach(({ module, success }) => {
    console.log(`  ${success ? '✅' : '❌'} ${module.toUpperCase()}: ${success ? '成功' : '失败'}`)
  })

  const allSuccess = results.every(r => r.success)
  if (allSuccess) {
    console.log('\n🎉 Phase 5 所有模块 API 生成完成！')
    process.exit(0)
  } else {
    console.log('\n⚠️  部分模块生成失败，请检查错误信息')
    process.exit(1)
  }
}

main()
