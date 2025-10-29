/**
 * Markdown 渲染工具
 */

/**
 * 简单的Markdown渲染器
 * 支持基础的Markdown语法
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''

  let html = markdown

  // 标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // 粗体
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')

  // 斜体
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>')

  // 链接
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')

  // 换行
  html = html.replace(/\n/gim, '<br>')

  return html
}








