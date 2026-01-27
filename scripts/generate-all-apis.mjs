#!/usr/bin/env node
/**
 * 临时 API 生成脚本
 * 使用编程方式调用 Orval，绕过 CLI 的 Commander.js 兼容性问题
 */

import { generate } from 'orval'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, '..')

async function main() {
  console.log('============================================================')
  console.log('📦 使用编程方式生成 API（绕过 CLI 问题）')
  console.log('============================================================\n')

  try {
    await generate(
      resolve(root, 'orval.config.ts'),
      root,
      {
        output: false,
      }
    )

    console.log('\n✅ 所有模块 API 生成成功！')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ API 生成失败:')
    console.error(error)
    process.exit(1)
  }
}

main()
