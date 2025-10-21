/**
 * 管理员工具函数
 */

/**
 * 格式化金额
 */
export function formatCurrency(amount: number, currency: string = '¥'): string {
  return `${currency}${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * 格式化大数字（万、亿）
 */
export function formatLargeNumber(num: number): string {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num.toString()
}

/**
 * 计算增长率
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * 导出CSV
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // 获取列名
  const columns = headers || Object.keys(data[0])

  // 构建CSV内容
  let csvContent = columns.join(',') + '\n'

  data.forEach((row) => {
    const values = columns.map((col) => {
      const value = row[col]
      // 处理包含逗号或换行的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csvContent += values.join(',') + '\n'
  })

  // 创建Blob并下载
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${Date.now()}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * 导出JSON
 */
export function exportToJSON(data: any, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${Date.now()}.json`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * 生成随机颜色
 */
export function generateRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

/**
 * 生成颜色数组
 */
export function generateColorArray(count: number): string[] {
  const colors = [
    '#409EFF',
    '#67C23A',
    '#E6A23C',
    '#F56C6C',
    '#909399',
    '#00D2D3',
    '#FF6B81',
    '#A29BFE',
    '#6C5CE7',
    '#FD79A8'
  ]

  if (count <= colors.length) {
    return colors.slice(0, count)
  }

  // 如果需要更多颜色，生成随机颜色
  const result = [...colors]
  for (let i = colors.length; i < count; i++) {
    result.push(generateRandomColor())
  }

  return result
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * 生成唯一ID
 */
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * 验证手机号
 */
export function validatePhone(phone: string): boolean {
  const re = /^1[3-9]\d{9}$/
  return re.test(phone)
}

