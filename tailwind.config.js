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
        cyan: qingyuTheme.primary,
        // 辅助色（蓝色系）
        blue: qingyuTheme.secondary,
        // 功能色
        success: qingyuTheme.success,
        warning: qingyuTheme.warning,
        danger: qingyuTheme.danger,
        info: qingyuTheme.info,
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
      boxShadow: {
        'glow': '0 4px 20px rgba(6, 182, 212, 0.3)',
        'glow-strong': '0 6px 30px rgba(6, 182, 212, 0.5)',
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
