/**
 * Qingyu 主题系统
 * 统一管理所有主题色，方便切换和扩展
 */

// 主题类型定义
export interface ThemeColors {
  // 品牌色
  primary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  // 辅助色
  secondary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  // 渐变色
  gradient: {
    from: string
    to: string
    soft: {
      from: string
      to: string
    }
  }
  // 功能色
  success: {
    light: string
    DEFAULT: string
    dark: string
  }
  warning: {
    light: string
    DEFAULT: string
    dark: string
  }
  danger: {
    light: string
    DEFAULT: string
    dark: string
  }
  info: {
    light: string
    DEFAULT: string
    dark: string
  }
}

// 青羽主题（青蓝渐变）- 默认主题
export const qingyuTheme: ThemeColors = {
  primary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',  // 悬停状态
    500: '#06b6d4',  // 主色
    600: '#0891b2',  // 激活状态
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // 辅助色
    600: '#2563eb',  // 深色状态
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gradient: {
    from: '#0891b2',  // cyan-600
    to: '#2563eb',    // blue-600
    soft: {
      from: '#22d3ee', // cyan-400
      to: '#3b82f6',   // blue-500
    },
  },
  success: {
    light: '#34d399',
    DEFAULT: '#10b981',
    dark: '#059669',
  },
  warning: {
    light: '#fbbf24',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  danger: {
    light: '#f87171',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#38bdf8',
    DEFAULT: '#0ea5e9',
    dark: '#0284c7',
  },
}

// 紫粉主题（备选）
export const berryTheme: ThemeColors = {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  secondary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  gradient: {
    from: '#9333ea',  // purple-600
    to: '#db2777',    // pink-600
    soft: {
      from: '#c084fc', // purple-400
      to: '#f472b6',   // pink-400
    },
  },
  success: {
    light: '#34d399',
    DEFAULT: '#10b981',
    dark: '#059669',
  },
  warning: {
    light: '#fbbf24',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  danger: {
    light: '#f87171',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#38bdf8',
    DEFAULT: '#0ea5e9',
    dark: '#0284c7',
  },
}

// 森林主题（绿蓝渐变）
export const forestTheme: ThemeColors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  gradient: {
    from: '#16a34a',  // green-600
    to: '#0891b2',    // cyan-600
    soft: {
      from: '#4ade80', // green-400
      to: '#22d3ee',   // cyan-400
    },
  },
  success: {
    light: '#34d399',
    DEFAULT: '#10b981',
    dark: '#059669',
  },
  warning: {
    light: '#fbbf24',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  danger: {
    light: '#f87171',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#38bdf8',
    DEFAULT: '#0ea5e9',
    dark: '#0284c7',
  },
}

// 主题映射
export const themes = {
  qingyu: qingyuTheme,     // 青羽主题（默认）
  berry: berryTheme,       // 紫粉主题
  forest: forestTheme,     // 森林主题
}

// 主题类型
export type ThemeName = keyof typeof themes

// 当前活动主题（默认青羽主题）
export let currentTheme: ThemeColors = qingyuTheme
export let currentThemeName: ThemeName = 'qingyu'

/**
 * 切换主题
 * @param themeName 主题名称
 */
export function setTheme(themeName: ThemeName): void {
  currentTheme = themes[themeName]
  currentThemeName = themeName

  // 更新 CSS 变量
  updateCSSVariables(currentTheme)
}

/**
 * 更新 CSS 变量
 * @param theme 主题色配置
 */
function updateCSSVariables(theme: ThemeColors): void {
  const root = document.documentElement

  // 主色
  root.style.setProperty('--color-primary-400', theme.primary[400])
  root.style.setProperty('--color-primary-500', theme.primary[500])
  root.style.setProperty('--color-primary-600', theme.primary[600])

  // 辅助色
  root.style.setProperty('--color-secondary-500', theme.secondary[500])
  root.style.setProperty('--color-secondary-600', theme.secondary[600])

  // 渐变
  root.style.setProperty('--gradient-from', theme.gradient.from)
  root.style.setProperty('--gradient-to', theme.gradient.to)
  root.style.setProperty('--gradient-soft-from', theme.gradient.soft.from)
  root.style.setProperty('--gradient-soft-to', theme.gradient.soft.to)

  // 功能色
  root.style.setProperty('--color-success', theme.success.DEFAULT)
  root.style.setProperty('--color-warning', theme.warning.DEFAULT)
  root.style.setProperty('--color-danger', theme.danger.DEFAULT)
  root.style.setProperty('--color-info', theme.info.DEFAULT)
}

/**
 * 获取 Tailwind 颜色配置
 * @param theme 主题色配置
 */
export function getTailwindColors(theme: ThemeColors = currentTheme) {
  return {
    primary: theme.primary,
    secondary: theme.secondary,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
    info: theme.info,
  }
}

/**
 * 初始化主题（在应用启动时调用）
 */
export function initTheme(themeName: ThemeName = 'qingyu'): void {
  setTheme(themeName)
}
