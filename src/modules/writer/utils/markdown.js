import { marked } from 'marked'

/**
 * Markdown 渲染工具
 * 使用 marked 库将 Markdown 文本转换为 HTML
 * @param {string} markdown - Markdown 文本
 * @returns {string} - 渲染后的 HTML
 */
export function renderMarkdown(markdown) {
  if (!markdown) return ''
  return marked(markdown)
}

