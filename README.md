# Qingyu 青羽 - 在线阅读与创作平台

> 一个基于 Vue 3 + TypeScript 的现代化在线阅读与写作平台前端项目

## 项目简介

青羽是一个功能完整的在线阅读与创作平台，为读者提供沉浸式阅读体验，为作者提供专业的创作工具。平台集成了书店、阅读器、作者工作台、社交互动等核心功能模块。

### 核心特性

- **沉浸式阅读体验** - 支持自定义字体、行距、主题，提供滚动/翻页两种阅读模式
- **专业创作工具** - 富文本编辑器、章节管理、AI写作助手
- **完整的书店系统** - 图书浏览、搜索、分类、排行、推荐系统
- **社交互动** - 关注作者、书评、评论、点赞收藏
- **用户中心** - 书架管理、阅读历史、会员系统、钱包支付
- **管理后台** - 用户管理、内容审核、数据统计、系统配置

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript + JavaScript (渐进式迁移)
- **构建工具**: Vite 7.x
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **UI组件**: Element Plus
- **HTTP客户端**: Axios
- **图表**: ECharts
- **样式**: SCSS + Tailwind CSS
- **Markdown**: Marked

## 项目结构

```
Qingyu_fronted/
├── src/
│   ├── modules/              # 功能模块
│   │   ├── bookstore/        # 书店模块
│   │   ├── reader/           # 阅读器模块
│   │   ├── writer/           # 作者创作模块
│   │   ├── user/             # 用户中心模块
│   │   ├── admin/            # 管理后台模块
│   │   ├── finance/          # 财务支付模块
│   │   ├── notification/     # 通知消息模块
│   │   ├── social/           # 社交互动模块
│   │   ├── ai/               # AI助手模块
│   │   └── shared/           # 共享组件和工具
│   ├── router/               # 路由配置
│   ├── stores/               # Pinia状态管理
│   ├── styles/               # 全局样式
│   ├── utils/                # 工具函数
│   ├── types/                # TypeScript类型定义
│   ├── directives/           # Vue指令
│   ├── composables/          # 组合式函数
│   ├── App.vue               # 根组件
│   └── main.ts               # 入口文件
├── public/                   # 静态资源
├── docs/                     # 项目文档
├── vite.config.ts            # Vite配置
├── tsconfig.json             # TypeScript配置
└── package.json              # 项目依赖
```

## 快速开始

> 💡 **首次使用？** 查看 [快速开始指南](./docs/QUICK_START.md) 获取详细步骤

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

### 安装与启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:8080 (需单独启动)
```

### 完整服务（前端+后端）

```bash
# 终端1: 启动后端
cd Qingyu_backend
go run cmd/server/main.go

# 终端2: 启动前端
cd Qingyu_fronted
npm run dev
```

### 生产构建

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview
```

---

📚 **更多文档：**
- [快速开始指南](./docs/QUICK_START.md) - 5分钟上手
- [使用指南](./docs/USER_GUIDE.md) - 完整功能说明
- [API连接配置](./docs/api-connection-guide.md) - 环境配置
- [部署指南](./docs/deployment-guide.md) - 生产部署

---

## 开发指南

### 代码规范

- 使用 TypeScript 类型注解
- 遵循 Vue 3 Composition API 最佳实践
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case 或 PascalCase（组件文件）

### 路由配置

路由按模块组织，每个模块有自己的路由配置文件：

```typescript
// src/modules/bookstore/routes.ts
export default [
  {
    path: '/bookstore',
    component: () => import('@/modules/bookstore/views/BooksView.vue'),
    meta: { requiresAuth: false }
  }
]
```

### API调用

使用统一的 `httpService` 进行 API 调用：

```typescript
import { httpService } from '@/core/services/http.service'

export const getBookList = (params?: BookListParams) => {
  return httpService.get<BookListResponse>('/books', { params })
}

export const getBookDetail = (bookId: string) => {
  return httpService.get<BookDetail>(`/books/${bookId}`)
}
```

每个模块都有自己的API文件，位于 `src/modules/{module}/api/`：
```typescript
// 使用模块API
import { getBookList, getBookDetail } from '@bookstore/api'
import { addToBookshelf } from '@reader/api'
```

### 状态管理

使用 Pinia 进行状态管理：

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null
  }),
  actions: {
    async fetchUserInfo() {
      // ...
    }
  }
})
```

## 性能优化

项目已实现以下优化措施：

### 构建优化
- **代码分割** - 手动配置 vendor chunks，分离 Vue、Element Plus、ECharts 等库
- **路由懒加载** - 所有页面组件使用动态 import
- **Tree Shaking** - 自动移除未使用的代码
- **CSS 代码分割** - 每个组件的 CSS 独立打包
- **Terser 压缩** - 生产环境自动移除 console 和 debugger

### 运行时优化
- **图片懒加载** - 使用 v-lazy 指令
- **虚拟滚动** - 长列表使用虚拟滚动
- **防抖节流** - 搜索、滚动等操作使用防抖节流
- **组件缓存** - 使用 keep-alive 缓存页面
- **性能监控** - 集成性能监控工具

### 构建产物

主 bundle 大小：
- 未压缩: ~1,122 KB
- Gzip: ~372 KB
- 符合性能要求（< 500KB gzip）

## 环境配置

项目支持三种环境配置：

- `.env.development` - 本地开发环境
- `.env.staging` - 预发布/测试环境
- `.env.production` - 生产环境

### 开发环境配置

开发环境使用 Vite Proxy 代理API请求，无需额外配置：

```bash
# .env.development（已配置）
VITE_API_BASE_URL=/api/v1
VITE_WS_BASE_URL=/ws
```

启动开发服务器：
```bash
npm run dev
```

### 生产环境配置

根据部署平台修改 `.env.production`：

**腾讯云 CloudBase：**
```bash
VITE_API_BASE_URL=https://your-env-id.service.tcloudbase.com/api/v1
```

**自有服务器：**
```bash
VITE_API_BASE_URL=https://yourdomain.com/api/v1
```

详细的配置说明请参考 [API连接配置指南](./docs/api-connection-guide.md)

### 构建命令

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预发布构建
npm run build:staging

# 类型检查
npm run type-check
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 模块功能说明

### 书店模块 (Bookstore)
- 图书列表与详情
- 分类浏览
- 搜索功能
- 排行榜
- 推荐系统

### 阅读器模块 (Reader)
- 章节阅读
- 阅读设置（字体、行距、主题）
- 目录导航
- 阅读进度保存
- AI阅读助手

### 作者模块 (Writer)
- 作品管理
- 章节创作
- 富文本编辑器
- 数据统计
- 收益管理

### 用户模块 (User)
- 个人资料
- 书架管理
- 阅读历史
- 会员中心
- 钱包充值

### 管理模块 (Admin)
- 用户管理
- 内容审核
- 数据统计
- 系统配置
- 操作日志

## 常见问题

### 开发相关

**Q: 如何修改 API 地址？**
A: 编辑对应环境的 `.env` 文件（如 `.env.development`），修改 `VITE_API_BASE_URL`

**Q: 开发环境跨域如何解决？**
A: Vite 已配置代理，API请求会自动转发到后端。确保后端运行在 `localhost:8080`

**Q: 如何添加新模块？**
A: 在 `src/modules` 下创建新模块目录，包含 api、views、components 等。详见[使用指南](./docs/USER_GUIDE.md)

**Q: 构建失败怎么办？**
A:
1. 检查 Node.js 版本（>= 18.0.0）
2. 删除 `node_modules` 和 `package-lock.json`
3. 重新安装依赖：`npm install`
4. 如果仍有问题，尝试使用 `npm run build` 跳过类型检查

**Q: 如何启用 API 健康检查？**
A: 开发环境自动启用，启动项目后查看控制台输出

### 部署相关

**Q: 如何部署到生产环境？**
A: 参考 [API连接配置指南](./docs/api-connection-guide.md) 和 [部署指南](./docs/deployment-guide.md)

**Q: 支持哪些部署平台？**
A:
- 腾讯云 CloudBase（推荐，国内访问快）
- 阿里云 Serverless
- Vercel（海外用户）
- 自有服务器 + Nginx

**Q: 如何配置环境变量？**
A: 复制 `.env.example` 为 `.env.production`，修改其中的配置值

## 项目文档

- **[使用指南](./docs/USER_GUIDE.md)** - 开发者和用户完整使用指南
- **[API连接配置](./docs/api-connection-guide.md)** - 环境配置和多平台部署
- **[部署指南](./docs/deployment-guide.md)** - 生产环境部署详细说明
- **[集成测试报告](./docs/integration-test-results.md)** - 功能测试验证
- **[API迁移文档](./docs/api-migration.md)** - API架构迁移说明

### 外部文档

- [Vite 文档](https://vitejs.dev/)
- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## License

MIT

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 联系方式

- 项目地址: [GitHub](https://github.com/your-org/qingyu)
- 问题反馈: [Issues](https://github.com/your-org/qingyu/issues)
