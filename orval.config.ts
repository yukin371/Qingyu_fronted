import { defineConfig } from 'orval'

export default defineConfig({
  reader: {
    input: {
      target: '../Qingyu_backend/docs/swagger.yaml',
      filters: {
        paths: ['^/api/v1/reader/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/reader/api/generated/reader.ts',
      schemas: 'src/api/generated/model.ts',
      override: {
        mutator: {
          path: 'src/core/config/orval-mutator.ts',
          name: 'default',
        },
      },
    },
    hooks: {
      afterAllFilesWrite:
        'prettier --write "src/**/api/generated/**/*.{ts,tsx}" "src/api/generated/**/*.{ts,tsx}"',
    },
  },

  bookstore: {
    input: {
      target: '../Qingyu_backend/docs/swagger.yaml',
      filters: {
        paths: ['^/api/v1/bookstore/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/bookstore/api/generated/bookstore.ts',
      schemas: 'src/api/generated/model.ts',
      override: {
        mutator: {
          path: 'src/core/config/orval-mutator.ts',
          name: 'default',
        },
      },
    },
    hooks: {
      afterAllFilesWrite:
        'prettier --write "src/**/api/generated/**/*.{ts,tsx}" "src/api/generated/**/*.{ts,tsx}"',
    },
  },

  admin: {
    input: {
      target: '../Qingyu_backend/docs/swagger.yaml',
      filters: {
        paths: ['^/api/v1/admin/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/admin/api/generated/admin.ts',
      schemas: 'src/api/generated/model.ts',
      override: {
        mutator: {
          path: 'src/core/config/orval-mutator.ts',
          name: 'default',
        },
      },
    },
    hooks: {
      afterAllFilesWrite:
        'prettier --write "src/**/api/generated/**/*.{ts,tsx}" "src/api/generated/**/*.{ts,tsx}"',
    },
  },
})
