# Qingyu

This template should help get you started developing with Vue 3 in Vite.

## 路由系统

本项目使用 `unplugin-vue-router` 实现约定式自动路由。

### 添加新路由

1. 在 `src/pages/` 下创建 `.page.vue` 文件
2. 路由自动生成，无需手动配置

### 文件命名规范

- 页面文件必须使用 `.page.vue` 扩展名
- 动态参数使用 `[paramName].vue` 格式
- 嵌套路由使用目录结构，如 `user/[userId]/profile.page.vue`

### 类型安全的路由跳转

```typescript
// 使用路由名称进行类型安全的导航
router.push({ name: 'bookstore:books' })

// 带参数的导航
router.push({
  name: 'bookstore:book-detail',
  params: { id: '123' }
})
```

### 布局系统

项目支持三种布局：
- `main` - 主布局（默认）
- `writer` - 作者布局
- `blank` - 空白布局

在页面的 `<route>` 块中指定：
```vue
<route lang="json5">
{
  meta: { layout: 'writer' }
}
</route>
```

详见 [路由规范文档](./docs/route-convention.md)

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

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

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
