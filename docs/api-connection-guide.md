# API 连接配置指南

本文档说明如何配置青羽写作平台前端的API连接，包括开发环境、预发布环境和生产环境的配置。

## 目录

- [环境配置](#环境配置)
- [开发环境配置](#开发环境配置)
- [生产环境配置](#生产环境配置)
- [部署平台配置](#部署平台配置)
- [API健康检查](#api健康检查)
- [故障排查](#故障排查)

---

## 环境配置

项目支持三种环境：

| 环境 | 用途 | 配置文件 | 启动命令 |
|------|------|----------|----------|
| development | 本地开发 | `.env.development` | `npm run dev` |
| staging | 预发布/测试 | `.env.staging` | `npm run build:staging` |
| production | 生产环境 | `.env.production` | `npm run build:prod` |

---

## 开发环境配置

### 1. 本地开发（推荐）

开发环境使用 **Vite Proxy** 代理API请求到后端，避免跨域问题。

**配置步骤：**

1. 确保 `.env.development` 配置正确：
```bash
VITE_API_BASE_URL=/api/v1
VITE_WS_BASE_URL=/ws
```

2. 启动后端服务（在 `localhost:8080`）

3. 启动前端开发服务器：
```bash
npm run dev
```

**工作原理：**
- 前端请求 `/api/v1/books`
- Vite自动代理到 `http://localhost:8080/api/v1/books`
- 解决跨域问题

### 2. 连接远程后端

如果后端部署在其他服务器（如测试服务器），修改 `.env.development`：

```bash
VITE_API_BASE_URL=http://your-server:8080/api/v1
VITE_WS_BASE_URL=ws://your-server:8080/ws
```

**注意：** 远程后端必须配置CORS允许本地开发服务器访问。

---

## 生产环境配置

### 腾讯云 CloudBase（推荐）

**适用场景：** 无独立服务器，主要面向国内用户

**配置步骤：**

1. 注册腾讯云账号并开通CloudBase服务
2. 创建环境，获取环境ID
3. 修改 `.env.production`：
```bash
VITE_API_BASE_URL=https://your-env-id.service.tcloudbase.com/api/v1
VITE_WS_BASE_URL=wss://your-env-id.service.tcloudbase.com/ws
```

4. 构建并部署：
```bash
npm run deploy:cloudbase your-env-id
```

**成本：**
- 免费版：2GB存储 + 5GB流量/月
- 基础版：19.9元/月
- 专业版：99元/月

### 阿里云 Serverless

**配置步骤：**

1. 在阿里云创建Serverless应用
2. 获取应用访问地址
3. 修改 `.env.production`：
```bash
VITE_API_BASE_URL=https://your-app.cn-hangzhou.fcapp.com/api/v1
VITE_WS_BASE_URL=wss://your-app.cn-hangzhou.fcapp.com/ws
```

### 自有服务器

**适用场景：** 有独立IP服务器

**配置步骤：**

1. 使用Nginx反向代理配置：
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端静态资源
    location / {
        root /var/www/qingyu/dist;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket代理
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

2. 修改 `.env.production`：
```bash
VITE_API_BASE_URL=https://yourdomain.com/api/v1
VITE_WS_BASE_URL=wss://yourdomain.com/ws
```

3. 构建并上传：
```bash
npm run build:prod
# 手动上传 dist 目录到服务器
```

---

## 部署平台配置

### Vercel（海外用户）

**适用场景：** 主要面向海外用户

**配置步骤：**

1. 安装Vercel CLI：
```bash
npm install -g vercel
```

2. 修改 `vercel.json` 中的后端地址：
```json
{
  "env": {
    "VITE_API_BASE_URL": "https://your-backend.com/api/v1",
    "VITE_WS_BASE_URL": "wss://your-backend.com/ws"
  }
}
```

3. 部署：
```bash
npm run deploy:vercel
```

**注意：** Vercel在国内访问速度不稳定，建议仅用于海外用户。

### 跨平台部署脚本

项目提供了跨平台部署脚本（支持Windows/Linux/Mac）：

```bash
# Node.js版本（推荐，跨平台）
node scripts/deploy.js vercel
node scripts/deploy.js cloudbase
node scripts/deploy.js server

# 或者使用npm脚本
npm run deploy:vercel
npm run deploy:cloudbase
npm run deploy:server
```

---

## API健康检查

项目内置API健康检查功能，在开发环境启动时自动检测后端连接状态。

**启动时输出：**

```
✓ API服务正常 (45ms)
```

或

```
⚠️ API服务异常: 后端服务未启动或无法连接
提示: 请确保后端服务已启动在 http://localhost:8080
```

**手动检查：**

在组件中导入健康检查工具：

```typescript
import { checkApiHealth, createApiStatusMonitor } from '@/utils/api-health'

// 单次检查
const result = await checkApiHealth()
console.log(result.healthy, result.latency)

// 创建监控（自动定期检查）
const { status, latency, error } = createApiStatusMonitor()
```

---

## 故障排查

### 问题1：CORS错误

**症状：**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/v1/books'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**解决方案：**

1. **开发环境：** 确保使用Vite Proxy（`.env.development` 中使用相对路径 `/api/v1`）
2. **生产环境：** 后端配置CORS允许前端域名

后端CORS配置示例（Go）：
```go
c := cors.New(cors.Options{
    AllowedOrigins:   []string{"https://yourdomain.com"},
    AllowCredentials: true,
    AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
})
```

### 问题2：API请求404

**症状：** 所有API请求返回404

**检查清单：**

1. 确认后端服务已启动
2. 检查 `.env` 文件中的 `VITE_API_BASE_URL` 配置
3. 开发环境检查Vite Proxy配置（`vite.config.ts`）
4. 生产环境检查Nginx/云服务配置

### 问题3：WebSocket连接失败

**症状：** 实时通知、评论等功能无法使用

**解决方案：**

1. 检查 `VITE_WS_BASE_URL` 配置
2. 确认WebSocket代理配置正确（`vite.config.ts` 或 Nginx）
3. 检查防火墙是否阻止WebSocket连接

### 问题4：环境变量不生效

**症状：** 修改 `.env` 文件后配置未生效

**解决方案：**

1. **开发环境：** 重启开发服务器（`npm run dev`）
2. **生产环境：** 重新构建（`npm run build`）
3. 检查环境变量名称必须以 `VITE_` 开头

---

## 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone <repository-url>
cd Qingyu_fronted

# 2. 安装依赖
npm install

# 3. 配置环境（使用默认配置即可）
cp .env.example .env.development

# 4. 启动后端服务（另一个终端）
cd Qingyu_backend
go run cmd/server/main.go

# 5. 启动前端
npm run dev
```

### 部署到生产

```bash
# 1. 配置生产环境变量
编辑 .env.production

# 2. 构建并部署
npm run deploy:cloudbase  # 腾讯云
# 或
npm run deploy:vercel     # Vercel
```

---

## 相关文档

- [部署指南](./deployment-guide.md) - 详细的多平台部署说明
- [环境变量说明](../.env.example) - 完整的环境变量配置模板
- [API文档](../README.md#API) - 后端API接口文档

---

## 更新日志

- **2025-01-14**: 创建API连接配置文档
- 添加多环境支持
- 集成API健康检查
- 提供跨平台部署脚本
