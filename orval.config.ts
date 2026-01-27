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

  writer: {
    input: {
      target: '../Qingyu_backend/docs/swagger.yaml',
      filters: {
        paths: ['^/api/v1/writer/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/writer/api/generated/writer.ts',
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

  social: {
    input: {
      target: '../Qingyu_backend/docs/swagger.yaml',
      filters: {
        paths: ['^/api/v1/social/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/social/api/generated/social.ts',
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

  ai: {
    input: {
      target: '../Qingyu_backend/docs/swagger.yaml',
      filters: {
        paths: ['^/api/v1/ai/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/ai/api/generated/ai.ts',
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

  finance: {
    input: {
      target: '../Qingyu_backend/docs/swagger.yaml',
      filters: {
        paths: ['^/api/v1/finance/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/finance/api/generated/finance.ts',
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

  notification: {
    input: {
      target: '../Qingyu_backend/docs/swagger.yaml',
      filters: {
        paths: ['^/api/v1/notification/'],
      },
    },
    output: {
      mode: 'single',
      client: 'axios',
      target: 'src/modules/notification/api/generated/notification.ts',
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
