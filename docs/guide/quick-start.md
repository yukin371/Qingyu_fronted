# 快速开始

本文档帮助你快速搭建开发环境并启动青羽书城前端项目。

## 环境要求

| 软件     | 最低版本 | 推荐版本 |
| -------- | -------- | -------- |
| Node.js  | 16.x     | 18.x LTS |
| npm/pnpm | 8.x      | 最新版   |
| Git      | 2.30+    | 最新版   |

## 1. 安装 Node.js

### Windows
```bash
# 访问 https://nodejs.org/ 下载 LTS 版本
# 或使用 nvm-windows
nvm install 18
nvm use 18
```

### macOS
```bash
# 使用 Homebrew
brew install node@18

# 或使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**验证安装**：
```bash
node -v  # 应显示 v18.x.x
npm -v   # 应显示 9.x.x
```

## 2. 安装 pnpm（推荐）

```bash
npm install -g pnpm
pnpm -v
```

### 配置镜像源
```bash
# 使用淘宝镜像（国内用户）
pnpm config set registry https://registry.npmmirror.com

# 使用官方镜像
pnpm config set registry https://registry.npmjs.org
```

## 3. 配置 Git

```bash
# 设置用户信息
git config --global user.name "你的姓名"
git config --global user.email "your.email@example.com"

# 配置SSH Key（推荐）
ssh-keygen -t ed25519 -C "your.email@example.com"
# 将 ~/.ssh/id_ed25519.pub 添加到 GitHub
```

## 4. 克隆项目

```bash
# 使用 SSH（推荐）
git clone git@github.com:your-org/qingyu-frontend.git
cd qingyu-frontend

# 或使用 HTTPS
git clone https://github.com/your-org/qingyu-frontend.git
cd qingyu-frontend
```

## 5. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

## 6. 配置环境变量

项目根目录已包含 `.env.development` 文件：

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_TITLE=青羽书城（开发环境）
```

如需自定义配置，创建 `.env.local` 文件（不会被提交到 Git）：

```bash
# .env.local
VITE_API_BASE_URL=http://192.168.1.100:8080/api/v1
```

## 7. 启动开发服务器

```bash
pnpm dev
```

启动成功后，浏览器访问：
- **本地**：http://localhost:5173
- **局域网**：http://192.168.1.100:5173

## 8. VS Code 配置

### 推荐插件
```
必装：
- Volar (Vue 3 官方插件)
- ESLint
- Prettier

推荐：
- GitLens
- Path Intellisense
```

### 安装方式
在 VS Code 中按 `Ctrl+Shift+X`，搜索并安装上述插件。

或使用命令行：
```bash
code --install-extension Vue.volar
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

## 9. 常用命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 运行测试
pnpm test
```

## 10. 验证安装

启动开发服务器后，打开浏览器访问 http://localhost:5173，应该能看到青羽书城首页。

**打开浏览器开发者工具**（F12）：
- 安装 [Vue DevTools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- 在 Console 中应该没有错误
- 在 Network 中可以看到 API 请求

## 常见问题

### 端口被占用
```bash
# 指定其他端口
pnpm dev -- --port 3000
```

### 依赖安装失败
```bash
# 清除缓存
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 模块找不到
确保路径别名配置正确，重启开发服务器。

## 下一步

- 阅读 [项目结构](./project-structure.md) 了解项目组织
- 查看 [组件开发指南](./component-guide.md) 学习组件开发
- 参考 [API集成](./api-integration.md) 了解接口调用

---

**最后更新**：2025年10月17日
