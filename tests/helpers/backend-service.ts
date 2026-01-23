/**
 * Backend Service Manager
 * 管理后端服务的启动、停止和健康检查
 */

import { ChildProcess, spawn } from 'child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export interface BackendServiceConfig {
  // 后端项目路径（相对于主仓库根目录）
  backendPath: string
  // 后端服务端口
  port: number
  // 启动超时时间（毫秒）
  startupTimeout: number
  // 健康检查路径
  healthCheckPath: string
  // 环境变量
  env?: Record<string, string>
}

export interface HealthCheckResult {
  healthy: boolean
  status: number
  message: string
}

/**
 * 后端服务管理器
 */
export class BackendService {
  private process: ChildProcess | null = null
  private config: BackendServiceConfig
  private startupPromise: Promise<void> | null = null
  private logs: string[] = []

  constructor(config: BackendServiceConfig) {
    this.config = {
      startupTimeout: 60000, // 默认60秒启动超时
      healthCheckPath: '/api/v1/health',
      ...config
    }
  }

  /**
   * 启动后端服务
   */
  async start(): Promise<void> {
    if (this.startupPromise) {
      return this.startupPromise
    }

    if (this.process && this.process.pid) {
      console.log('✓ 后端服务已在运行 (PID:', this.process.pid, ')')
      return
    }

    console.log('🚀 正在启动后端服务...')
    this.startupPromise = this._start()

    try {
      await this.startupPromise
      console.log('✓ 后端服务启动成功')
    } catch (error) {
      this.startupPromise = null
      throw error
    }
  }

  /**
   * 内部启动逻辑
   */
  private async _start(): Promise<void> {
    const { backendPath, port, env } = this.config

    // 构建后端项目路径
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const projectRoot = join(__dirname, '../../..')
    const backendDir = join(projectRoot, backendPath)

    console.log(`  后端路径: ${backendDir}`)
    console.log(`  服务端口: ${port}`)

    // 启动后端进程
    this.process = spawn('go', ['run', 'cmd/server/main.go'], {
      cwd: backendDir,
      env: {
        ...process.env,
        ...env,
        SERVER_PORT: port.toString(),
        // E2E测试环境标识
        E2E_TEST: 'true'
      },
      shell: true,
      stdio: 'pipe'
    })

    // 收集日志
    this.process.stdout?.on('data', (data) => {
      const message = data.toString().trim()
      this.logs.push(message)
      if (message) {
        console.log(`  [后端] ${message}`)
      }
    })

    this.process.stderr?.on('data', (data) => {
      const message = data.toString().trim()
      this.logs.push(message)
      if (message) {
        console.error(`  [后端错误] ${message}`)
      }
    })

    // 监听进程退出
    this.process.on('exit', (code, signal) => {
      console.log(`  后端进程退出: code=${code}, signal=${signal}`)
      this.process = null
      this.startupPromise = null
    })

    // 等待服务启动（健康检查）
    const startTime = Date.now()
    while (Date.now() - startTime < this.config.startupTimeout) {
      await this.sleep(2000) // 每2秒检查一次

      const health = await this.checkHealth()
      if (health.healthy) {
        console.log(`  健康检查通过: ${health.message}`)
        return
      }

      if (!this.process || this.process.killed) {
        throw new Error('后端进程意外终止')
      }
    }

    throw new Error(`后端服务启动超时 (${this.config.startupTimeout}ms)`)
  }

  /**
   * 停止后端服务
   */
  async stop(): Promise<void> {
    if (!this.process) {
      console.log('⚠ 后端服务未运行')
      return
    }

    console.log('🛑 正在停止后端服务...')

    const pid = this.process.pid
    this.process.kill('SIGTERM')

    // 等待进程优雅退出
    await this.sleep(5000)

    // 如果还没退出，强制终止
    if (this.process && !this.process.killed) {
      console.log('  强制终止后端进程')
      this.process.kill('SIGKILL')
    }

    this.process = null
    this.startupPromise = null
    console.log(`✓ 后端服务已停止 (PID: ${pid})`)
  }

  /**
   * 检查服务健康状态
   */
  async checkHealth(): Promise<HealthCheckResult> {
    const url = this.getHealthCheckURL()

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5秒超时
      })

      const healthy = response.ok || response.status === 200

      return {
        healthy,
        status: response.status,
        message: healthy ? 'OK' : `Status: ${response.status}`
      }
    } catch (error) {
      return {
        healthy: false,
        status: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 等待服务就绪
   */
  async waitForReady(): Promise<void> {
    const maxAttempts = 30 // 最多尝试30次
    let attempts = 0

    while (attempts < maxAttempts) {
      const health = await this.checkHealth()
      if (health.healthy) {
        return
      }

      await this.sleep(2000)
      attempts++
    }

    throw new Error('后端服务未能在预期时间内就绪')
  }

  /**
   * 检查服务是否运行
   */
  isRunning(): boolean {
    return this.process !== null && this.process.pid !== undefined
  }

  /**
   * 获取后端服务URL
   */
  getURL(): string {
    return `http://localhost:${this.config.port}`
  }

  /**
   * 获取健康检查URL
   */
  getHealthCheckURL(): string {
    return `${this.getURL()}${this.config.healthCheckPath}`
  }

  /**
   * 获取服务端口
   */
  getPort(): number {
    return this.config.port
  }

  /**
   * 获取进程ID
   */
  getPID(): number | undefined {
    return this.process?.pid
  }

  /**
   * 获取日志
   */
  getLogs(): string[] {
    return [...this.logs]
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 创建后端服务实例的工厂函数
 */
export async function createBackendService(
  config?: Partial<BackendServiceConfig>
): Promise<BackendService> {
  const defaultConfig: BackendServiceConfig = {
    backendPath: 'Qingyu_backend',
    port: 8080,
    startupTimeout: 60000,
    healthCheckPath: '/api/v1/health',
    env: {
      // 测试环境配置
      GO_ENV: 'test',
      DB_NAME: 'qingyu_test',
      LOG_LEVEL: 'debug'
    }
  }

  const service = new BackendService({
    ...defaultConfig,
    ...config
  })

  // 启动服务
  await service.start()

  return service
}

/**
 * 全局后端服务实例（用于跨测试共享）
 */
let globalBackendService: BackendService | null = null

/**
 * 获取或创建全局后端服务
 */
export async function getGlobalBackendService(): Promise<BackendService> {
  if (!globalBackendService) {
    globalBackendService = await createBackendService()
  }
  return globalBackendService
}

/**
 * 停止全局后端服务
 */
export async function stopGlobalBackendService(): Promise<void> {
  if (globalBackendService) {
    await globalBackendService.stop()
    globalBackendService = null
  }
}
