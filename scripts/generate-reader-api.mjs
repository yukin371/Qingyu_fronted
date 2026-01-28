#!/usr/bin/env node
/**
 * Orval API 生成脚本 v3
 *
 * 直接调用 Orval 的 generate 函数
 */

import { generate } from 'orval'

async function main() {
  try {
    console.log('🚀 开始生成 Reader 模块 API...')
    console.log('📄 配置文件: orval.config.ts')
    console.log('🎯 目标项目: reader')

    // 调用 Orval 的 generate 函数
    await generate('orval.config.ts', process.cwd(), {
      project: 'reader'
    })

    console.log('✅ Reader 模块 API 生成成功！')
  } catch (error) {
    console.error('❌ 生成失败:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
