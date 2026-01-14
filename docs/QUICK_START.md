# 快速开始指南

本指南帮助你在5分钟内启动青羽写作平台。

## 前置要求

- **Node.js**: >= 18.0.0 ([下载](https://nodejs.org/))
- **npm**: >= 9.0.0 (随Node.js安装)
- **后端服务**: Go 1.21+ (可选，如需完整功能)

## 方式一：仅前端（快速体验）

适合快速查看界面和UI设计。

### 1. 安装依赖

```bash
cd Qingyu_fronted
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问应用

打开浏览器访问: http://localhost:5173

**注意**: 此方式仅展示UI，部分功能需要后端支持。

---

## 方式二：完整服务（推荐）

适合开发和功能测试。

### 1. 启动后端服务

**新终端窗口1:**
```bash
cd Qingyu_backend
go run cmd/server/main.go
```

后端将启动在: http://localhost:8080

### 2. 启动前端服务

**新终端窗口2:**
```bash
cd Qingyu_fronted
npm install
npm run dev
```

前端将启动在: http://localhost:5173

### 3. 验证连接

启动后查看控制台，应该看到：
```
✓ API服务正常 (45ms)
```

如果看到警告：
```
⚠️ API服务异常: 后端服务未启动或无法连接
```
请确保后端服务已启动。

---

## 项目结构速览

```
Qingyu_fronted/
├── src/
│   ├── modules/       # 功能模块
│   │   ├── bookstore/ # 书店
│   │   ├── reader/    # 阅读器
│   │   ├── writer/    # 写作
│   │   ├── user/      # 用户
│   │   └── social/    # 社交
│   ├── core/          # 核心服务
│   ├── stores/        # 状态管理
│   └── router/        # 路由
└── docs/              # 文档
```

---

## 核心功能

### 读者功能
- 📚 浏览书店
- 📖 在线阅读
- 📑 书架管理
- ⭐ 评论点赞
- 📖 阅读历史

### 作者功能
- ✍️ 作品管理
- 📝 章节创作
- 📊 数据统计
- 💰 收益管理
- ✅ 发布审核

### 社交功能
- 👥 关注作者
- 📋 创建书单
- 💬 评论互动
- 🔔 消息通知

---

## 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 生产构建
npm run preview          # 预览构建结果

# 类型检查
npm run type-check       # TypeScript类型检查

# 部署
npm run deploy:vercel    # 部署到Vercel
npm run deploy:cloudbase # 部署到腾讯云
```

---

## 下一步

- 📖 查看[使用指南](./USER_GUIDE.md)了解详细功能
- 🔧 查看[API连接配置](./api-connection-guide.md)配置环境
- 🚀 查看[部署指南](./deployment-guide.md)部署到生产环境

---

## 遇到问题？

### 安装依赖失败
```bash
# 清除缓存重试
rm -rf node_modules package-lock.json
npm install
```

### 端口被占用
```bash
# 修改端口
# 编辑 vite.config.ts，修改 server.port
```

### API连接失败
1. 确保后端服务已启动
2. 检查 `.env.development` 配置
3. 查看浏览器控制台错误信息

---

## 获取帮助

- 📖 [完整文档](./USER_GUIDE.md)
- 🐛 [提交问题](https://github.com/your-org/qingyu/issues)
- 💬 [讨论区](https://github.com/your-org/qingyu/discussions)
