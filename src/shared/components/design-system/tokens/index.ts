/**
 * 设计系统Token统一导出
 */

export { colors, colorsToCssVars } from './colors'
export { spacing, getSpacing, spacingToCssVars } from './spacing'
export { typography, typographyToCssVars } from './typography'

// 导出所有Token的CSS变量
export const allTokensToCssVars = () => {
  const { colorsToCssVars } = require('./colors')
  const { spacingToCssVars } = require('./spacing')
  const { typographyToCssVars } = require('./typography')

  return {
    ...colorsToCssVars(),
    ...spacingToCssVars(),
    ...typographyToCssVars()
  }
}

