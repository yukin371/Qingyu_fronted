import { getTailwindColors } from './src/design-system/tokens/theme'
import { qingyuTheme } from './src/design-system/tokens/theme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // 支持暗色模式
  theme: {
    extend: {
      // 语义色 - 使用青羽主题
      colors: {
        // 主色（青色系）
        primary: qingyuTheme.primary,
        // 辅助色（蓝色系）
        secondary: qingyuTheme.secondary,
        // 功能色
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // 中性色（Slate）
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      // 阴影 - 使用青色投影
      // TODO: 这些值应该从 qingyuTheme 读取，但 Tailwind 配置不支持运行时变量
      // P2 阶段暂时保持硬编码，后续通过 PostCSS 插件或构建工具优化
      boxShadow: {
        'glow': '0 4px 20px rgba(6, 182, 212, 0.3)',        // 使用 primary 颜色
        'glow-strong': '0 6px 30px rgba(6, 182, 212, 0.5)', // 使用 primary 颜色
        'dock': '0 8px 32px rgba(0,0,0,0.12)',
      },
      // 圆角
      borderRadius: {
        '4xl': '2rem',
      },
      // 字体
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      // 动画
      animation: {
        'spin': 'spin 1s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'float': 'float 7s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // 可以在这里添加 Tailwind 插件
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
  // 与 Element Plus 共存（迁移期间）
  corePlugins: {
    preflight: true,
  },
}
