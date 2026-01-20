import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**', 'tests/e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),

      // 测试文件匹配模式
      include: [
        'tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}',
        'src/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}'
      ],

      // 覆盖率配置
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.d.ts',
          '**/*.config.{js,ts}',
          '**/mockData/**',
          'dist/',
          'build/'
        ],
        // 覆盖率阈值
        thresholds: {
          statements: 60,
          branches: 60,
          functions: 60,
          lines: 60
        }
      },

      // 全局配置
      globals: true,
      setupFiles: ['./tests/unit/setup.ts'],

      // 测试超时
      testTimeout: 10000,
      hookTimeout: 10000,

      // 并发配置
      threads: true,
      maxThreads: 4,
      minThreads: 1,

      // 报告器
      reporter: ['verbose', 'json', 'html']
    },
  }),
)
