/**
 * 编辑器工具函数
 */

/**
 * 计算字数（支持中英文混合）
 * @param text 文本内容
 * @param filterMarkdown 是否过滤Markdown语法
 */
export function calculateWordCount(text: string, filterMarkdown: boolean = false): number {
  if (!text) return 0

  let content = text

  if (filterMarkdown) {
    // 移除Markdown标记
    content = content
      .replace(/#+\s/g, '') // 标题
      .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
      .replace(/\*([^*]+)\*/g, '$1') // 斜体
      .replace(/~~([^~]+)~~/g, '$1') // 删除线
      .replace(/`([^`]+)`/g, '$1') // 行内代码
      .replace(/```[\s\S]*?```/g, '') // 代码块
      .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // 链接
      .replace(/>\s/g, '') // 引用
      .replace(/[-*+]\s/g, '') // 列表
      .replace(/\d+\.\s/g, '') // 有序列表
  }

  // 匹配中文字符
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g) || []

  // 匹配英文单词
  const englishWords = content.match(/[a-zA-Z]+/g) || []

  return chineseChars.length + englishWords.length
}

/**
 * 格式化字数显示
 * @param count 字数
 */
export function formatWordCount(count: number): string {
  if (count < 1000) {
    return `${count}字`
  }
  if (count < 10000) {
    return `${(count / 1000).toFixed(1)}千字`
  }
  return `${(count / 10000).toFixed(2)}万字`
}

/**
 * 计算阅读时长（分钟）
 * @param wordCount 字数
 * @param readingSpeed 阅读速度（字/分钟），默认300
 */
export function estimateReadingTime(wordCount: number, readingSpeed: number = 300): number {
  return Math.ceil(wordCount / readingSpeed)
}

/**
 * 插入文本到光标位置
 * @param element 文本框元素
 * @param text 要插入的文本
 */
export function insertTextAtCursor(element: HTMLTextAreaElement, text: string): void {
  const start = element.selectionStart
  const end = element.selectionEnd
  const value = element.value

  element.value = value.substring(0, start) + text + value.substring(end)
  element.selectionStart = element.selectionEnd = start + text.length
  element.focus()
}

/**
 * 获取选中的文本
 * @param element 文本框元素
 */
export function getSelectedText(element: HTMLTextAreaElement): string {
  const start = element.selectionStart
  const end = element.selectionEnd
  return element.value.substring(start, end)
}

/**
 * 替换选中的文本
 * @param element 文本框元素
 * @param replacement 替换文本
 */
export function replaceSelectedText(element: HTMLTextAreaElement, replacement: string): void {
  const start = element.selectionStart
  const end = element.selectionEnd
  const value = element.value

  element.value = value.substring(0, start) + replacement + value.substring(end)
  element.selectionStart = start
  element.selectionEnd = start + replacement.length
  element.focus()
}

/**
 * 包裹选中的文本
 * @param element 文本框元素
 * @param prefix 前缀
 * @param suffix 后缀
 */
export function wrapSelectedText(
  element: HTMLTextAreaElement,
  prefix: string,
  suffix: string = prefix
): void {
  const start = element.selectionStart
  const end = element.selectionEnd
  const value = element.value
  const selectedText = value.substring(start, end)

  const wrappedText = prefix + selectedText + suffix
  element.value = value.substring(0, start) + wrappedText + value.substring(end)

  element.selectionStart = start + prefix.length
  element.selectionEnd = end + prefix.length
  element.focus()
}

/**
 * 格式化Markdown
 * @param type 格式类型
 * @param element 文本框元素
 */
export function formatMarkdown(type: string, element: HTMLTextAreaElement): void {
  switch (type) {
    case 'bold':
      wrapSelectedText(element, '**')
      break
    case 'italic':
      wrapSelectedText(element, '*')
      break
    case 'strikethrough':
      wrapSelectedText(element, '~~')
      break
    case 'code':
      wrapSelectedText(element, '`')
      break
    case 'link':
      const linkText = getSelectedText(element) || '链接文本'
      replaceSelectedText(element, `[${linkText}](url)`)
      break
    case 'image':
      const imageText = getSelectedText(element) || '图片描述'
      replaceSelectedText(element, `![${imageText}](url)`)
      break
    case 'heading1':
      insertLinePrefix(element, '# ')
      break
    case 'heading2':
      insertLinePrefix(element, '## ')
      break
    case 'heading3':
      insertLinePrefix(element, '### ')
      break
    case 'quote':
      insertLinePrefix(element, '> ')
      break
    case 'list':
      insertLinePrefix(element, '- ')
      break
    case 'orderedList':
      insertLinePrefix(element, '1. ')
      break
  }
}

/**
 * 在行首插入前缀
 * @param element 文本框元素
 * @param prefix 前缀
 */
function insertLinePrefix(element: HTMLTextAreaElement, prefix: string): void {
  const start = element.selectionStart
  const value = element.value

  // 找到当前行的起始位置
  let lineStart = start
  while (lineStart > 0 && value[lineStart - 1] !== '\n') {
    lineStart--
  }

  element.value = value.substring(0, lineStart) + prefix + value.substring(lineStart)
  element.selectionStart = element.selectionEnd = start + prefix.length
  element.focus()
}

/**
 * 检测版本冲突
 * @param localVersion 本地版本号
 * @param serverVersion 服务器版本号
 */
export function detectVersionConflict(localVersion: number, serverVersion: number): boolean {
  return serverVersion > localVersion
}

/**
 * 生成防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * 生成节流函数
 * @param func 要节流的函数
 * @param limit 时间限制（毫秒）
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
 * 保存草稿到本地存储
 * @param documentId 文档ID
 * @param content 内容
 */
export function saveDraftToLocal(documentId: string, content: string): void {
  try {
    const drafts = JSON.parse(localStorage.getItem('editor_drafts') || '{}')
    drafts[documentId] = {
      content,
      timestamp: Date.now()
    }
    localStorage.setItem('editor_drafts', JSON.stringify(drafts))
  } catch (error) {
    console.error('保存草稿失败:', error)
  }
}

/**
 * 从本地存储加载草稿
 * @param documentId 文档ID
 */
export function loadDraftFromLocal(documentId: string): string | null {
  try {
    const drafts = JSON.parse(localStorage.getItem('editor_drafts') || '{}')
    return drafts[documentId]?.content || null
  } catch (error) {
    console.error('加载草稿失败:', error)
    return null
  }
}

/**
 * 清除本地草稿
 * @param documentId 文档ID
 */
export function clearDraftFromLocal(documentId: string): void {
  try {
    const drafts = JSON.parse(localStorage.getItem('editor_drafts') || '{}')
    delete drafts[documentId]
    localStorage.setItem('editor_drafts', JSON.stringify(drafts))
  } catch (error) {
    console.error('清除草稿失败:', error)
  }
}

