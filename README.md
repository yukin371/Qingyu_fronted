# Qingyu 青羽

在线阅读平台前端项目 - Vue 3 + TypeScript + Vite

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript + JavaScript (渐进式迁移中)
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI组件**: Element Plus
- **HTTP客户端**: Axios

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### TypeScript Type Check

```sh
npm run type-check
```

## TypeScript 支持

本项目正在进行 TypeScript 渐进式迁移：

- ✅ **已迁移**: 核心工具层 (utils/request.ts)、API类型定义 (types/api.ts)、推荐系统API
- ⏳ **进行中**: 其他API层、Store层
- 📝 **新功能**: 所有新代码必须使用 TypeScript

详细信息请查看 [TypeScript迁移报告](./TypeScript迁移报告.md)

## 项目文档

- 📖 [API文档](./src/api/README.md)
- 🏗️ [前端架构](./doc/architecture/)
- 🧪 [API测试工具](./src/views/ComprehensiveAPITestView.vue) - 访问 `/api-test-comprehensive`
