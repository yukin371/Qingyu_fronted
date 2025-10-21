/**
 * 自动保存工具
 */

/**
 * 自动保存管理器
 */
export class AutosaveManager {
  private timer: NodeJS.Timeout | null = null
  private saveCallback: () => Promise<void>
  private interval: number
  private enabled: boolean = true
  private lastSaveTime: number = 0
  private minSaveInterval: number = 5000 // 最小保存间隔5秒

  constructor(saveCallback: () => Promise<void>, interval: number = 30000) {
    this.saveCallback = saveCallback
    this.interval = interval
  }

  /**
   * 启动自动保存
   */
  start(): void {
    if (this.timer) {
      this.stop()
    }

    this.enabled = true
    this.timer = setInterval(() => {
      this.triggerSave()
    }, this.interval)
  }

  /**
   * 停止自动保存
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.enabled = false
  }

  /**
   * 触发保存
   */
  async triggerSave(): Promise<void> {
    if (!this.enabled) return

    const now = Date.now()
    if (now - this.lastSaveTime < this.minSaveInterval) {
      return
    }

    try {
      await this.saveCallback()
      this.lastSaveTime = now
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }

  /**
   * 立即保存
   */
  async saveNow(): Promise<void> {
    await this.triggerSave()
  }

  /**
   * 设置保存间隔
   */
  setInterval(interval: number): void {
    this.interval = interval
    if (this.timer) {
      this.stop()
      this.start()
    }
  }

  /**
   * 设置最小保存间隔
   */
  setMinSaveInterval(interval: number): void {
    this.minSaveInterval = interval
  }

  /**
   * 启用/禁用自动保存
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (enabled && !this.timer) {
      this.start()
    } else if (!enabled && this.timer) {
      this.stop()
    }
  }

  /**
   * 获取上次保存时间
   */
  getLastSaveTime(): number {
    return this.lastSaveTime
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.enabled
  }
}

/**
 * 创建自动保存管理器
 */
export function createAutosaveManager(
  saveCallback: () => Promise<void>,
  interval: number = 30000
): AutosaveManager {
  return new AutosaveManager(saveCallback, interval)
}

/**
 * 保存状态
 */
export enum SaveStatus {
  Idle = 'idle',
  Saving = 'saving',
  Saved = 'saved',
  Error = 'error',
  Conflict = 'conflict'
}

/**
 * 保存状态管理器
 */
export class SaveStatusManager {
  private status: SaveStatus = SaveStatus.Idle
  private errorMessage: string = ''
  private lastSaveTime: Date | null = null
  private statusChangeCallback?: (status: SaveStatus) => void

  constructor(statusChangeCallback?: (status: SaveStatus) => void) {
    this.statusChangeCallback = statusChangeCallback
  }

  /**
   * 设置状态
   */
  setStatus(status: SaveStatus, errorMessage: string = ''): void {
    this.status = status
    this.errorMessage = errorMessage

    if (status === SaveStatus.Saved) {
      this.lastSaveTime = new Date()
    }

    if (this.statusChangeCallback) {
      this.statusChangeCallback(status)
    }
  }

  /**
   * 获取状态
   */
  getStatus(): SaveStatus {
    return this.status
  }

  /**
   * 获取错误信息
   */
  getErrorMessage(): string {
    return this.errorMessage
  }

  /**
   * 获取上次保存时间
   */
  getLastSaveTime(): Date | null {
    return this.lastSaveTime
  }

  /**
   * 获取状态文本
   */
  getStatusText(): string {
    switch (this.status) {
      case SaveStatus.Idle:
        return '未保存'
      case SaveStatus.Saving:
        return '保存中...'
      case SaveStatus.Saved:
        return this.lastSaveTime
          ? `已保存于 ${this.formatTime(this.lastSaveTime)}`
          : '已保存'
      case SaveStatus.Error:
        return `保存失败: ${this.errorMessage}`
      case SaveStatus.Conflict:
        return '版本冲突'
      default:
        return ''
    }
  }

  /**
   * 格式化时间
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.status = SaveStatus.Idle
    this.errorMessage = ''
    this.lastSaveTime = null
  }
}

/**
 * 创建保存状态管理器
 */
export function createSaveStatusManager(
  statusChangeCallback?: (status: SaveStatus) => void
): SaveStatusManager {
  return new SaveStatusManager(statusChangeCallback)
}

