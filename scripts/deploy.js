#!/usr/bin/env node

/**
 * 青羽写作平台 - 部署脚本（跨平台）
 * 使用: node scripts/deploy.js <platform> [environment]
 */

import { execSync, spawn } from 'child_process'
import { readFileSync, copyFileSync, existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logInfo(message) {
  log(`[INFO] ${message}`, 'green')
}

function logWarn(message) {
  log(`[WARN] ${message}`, 'yellow')
}

function logError(message) {
  log(`[ERROR] ${message}`, 'red')
}

// 检查命令是否存在
function commandExists(cmd) {
  try {
    execSync(`${process.platform === 'win32' ? 'where' : 'which'} ${cmd}`, {
      stdio: 'ignore'
    })
    return true
  } catch {
    return false
  }
}

// 构建项目
function buildProject(mode) {
  logInfo(`开始构建项目 (模式: ${mode})...`)

  try {
    execSync('npm ci', { cwd: rootDir, stdio: 'inherit' })
    execSync(`npm run build:${mode}`, { cwd: rootDir, stdio: 'inherit' })
    logInfo('构建完成！')
  } catch (error) {
    logError('构建失败')
    process.exit(1)
  }
}

// 部署到Vercel
function deployVercel() {
  logInfo('部署到 Vercel...')

  if (!commandExists('vercel')) {
    logError('Vercel CLI 未安装，请运行: npm install -g vercel')
    process.exit(1)
  }

  try {
    execSync('vercel --prod', { stdio: 'inherit' })
    logInfo('部署成功！')
  } catch (error) {
    logError('部署失败')
    process.exit(1)
  }
}

// 部署到腾讯云CloudBase
function deployCloudBase(envId) {
  logInfo('部署到腾讯云 CloudBase...')

  if (!commandExists('tcb')) {
    logError('CloudBase CLI 未安装，请运行: npm install -g @cloudbase/cli')
    process.exit(1)
  }

  try {
    const cmd = envId ? `tcb hosting deploy dist -e ${envId}` : 'tcb hosting deploy dist'
    execSync(cmd, { stdio: 'inherit' })
    logInfo('部署成功！')
  } catch (error) {
    logError('部署失败')
    process.exit(1)
  }
}

// 主函数
function main() {
  const [platform, environment = 'production'] = process.argv.slice(2)

  switch (platform) {
    case 'vercel':
      buildProject('prod')
      deployVercel()
      break

    case 'cloudbase':
      buildProject('prod')
      deployCloudBase(environment)
      break

    case 'server':
      logWarn('服务器部署需要手动上传 dist 目录')
      logInfo('构建完成后，使用以下命令上传：')
      log('  rsync -avz --delete dist/ user@server:/var/www/qingyu/dist/', 'blue')
      buildProject('prod')
      break

    case 'build':
      buildProject(environment)
      break

    default:
      logError(`未知平台: ${platform}`)
      log('\n用法: node scripts/deploy.js <platform> [environment]')
      log('\n可用平台:')
      log('  vercel          - 部署到 Vercel')
      log('  cloudbase       - 部署到腾讯云 CloudBase')
      log('  server          - 构建并提示手动部署到服务器')
      log('  build           - 仅构建项目')
      log('\n环境:')
      log('  staging         - 预发布环境')
      log('  production      - 生产环境 (默认)')
      process.exit(1)
  }
}

main()
