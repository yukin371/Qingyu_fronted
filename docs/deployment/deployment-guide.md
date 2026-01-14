# 青羽前端部署指南

本文档提供青羽前端项目的完整部署指南，包括环境配置、构建优化和各种部署方案。

## 目录

- [环境准备](#环境准备)
- [环境变量配置](#环境变量配置)
- [构建项目](#构建项目)
- [部署方案](#部署方案)
- [生产环境检查清单](#生产环境检查清单)
- [性能优化](#性能优化)
- [监控与日志](#监控与日志)

## 环境准备

### 系统要求

- **Node.js**: >= 16.x (推荐使用 LTS 版本)
- **npm**: >= 8.x 或 **pnpm**: >= 7.x
- **磁盘空间**: 至少 2GB 可用空间
- **内存**: 至少 2GB RAM

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐)
pnpm install
```

## 环境变量配置

### 1. 创建环境变量文件

在项目根目录创建 `.env.production` 文件：

```bash
# API 基础路径
VITE_API_BASE_URL=https://api.yourdomain.com/api

# 应用标题
VITE_APP_TITLE=青羽阅读

# 其他配置
VITE_ENABLE_MOCK=false

# CDN 配置（可选）
VITE_CDN_URL=https://cdn.yourdomain.com
```

### 2. 环境变量说明

| 变量名 | 说明 | 示例值 | 必填 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `https://api.example.com/api` | 是 |
| `VITE_APP_TITLE` | 应用标题 | `青羽阅读` | 否 |
| `VITE_ENABLE_MOCK` | 是否启用 Mock 数据 | `false` | 否 |
| `VITE_CDN_URL` | CDN 地址（可选） | `https://cdn.example.com` | 否 |

## 构建项目

### 开发环境构建

```bash
npm run build
```

### 生产环境构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 构建产物说明

构建完成后，`dist/` 目录结构如下：

```
dist/
├── index.html              # 入口 HTML
├── assets/                 # 静态资源
│   ├── index-xxx.js       # 主 bundle
│   ├── index-xxx.css      # 主样式
│   ├── vue-vendor-xxx.js  # Vue 核心库
│   ├── element-plus-xxx.js # UI 库
│   └── ...                # 其他 chunks
└── favicon.ico            # 网站图标
```

### 构建优化检查

构建完成后，检查以下指标：

1. **主 Bundle 大小**
   - 未压缩: < 1,500 KB
   - Gzip: < 500 KB
   - Brotli: < 400 KB

2. **代码分割**
   - Vue 核心库独立打包
   - Element Plus 独立打包
   - 路由懒加载生效

3. **CSS 优化**
   - 每个 CSS 文件 < 50 KB (gzip)
   - 无重复样式

## 部署方案

### 方案一：Vercel 部署（推荐）

Vercel 是一个优秀的静态网站托管平台，提供全球 CDN 加速。

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署项目

```bash
# 在项目根目录执行
vercel --prod
```

#### 4. 配置 vercel.json

在项目根目录创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 5. 环境变量配置

在 Vercel 控制台配置环境变量：

- `VITE_API_BASE_URL`: 你的后端 API 地址

### 方案二：Nginx 部署

#### 1. 构建项目

```bash
npm run build
```

#### 2. 上传构建产物

将 `dist/` 目录上传到服务器：

```bash
# 使用 scp
scp -r dist/* user@server:/var/www/qingyu/

# 或使用 rsync
rsync -avz dist/ user@server:/var/www/qingyu/
```

#### 3. 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/qingyu`：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 强制 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL 证书配置
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 根目录
    root /var/www/qingyu;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML 文件不缓存
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（可选）
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

#### 4. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/qingyu /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 方案三：Docker 部署

#### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 多阶段构建
# 阶段1: 构建应用
FROM node:16-alpine as build-stage

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 阶段2: 生产环境
FROM nginx:alpine as production-stage

# 复制构建产物
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建 Nginx 配置

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 3. 构建和运行 Docker 镜像

```bash
# 构建镜像
docker build -t qingyu-frontend .

# 运行容器
docker run -d -p 80:80 --name qingyu-web qingyu-frontend
```

#### 4. 使用 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    restart: always
    networks:
      - qingyu-network

networks:
  qingyu-network:
    driver: bridge
```

运行：

```bash
docker-compose up -d
```

### 方案四：Netlify 部署

#### 1. 创建 netlify.toml

在项目根目录创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### 2. 连接 Git 仓库

1. 登录 Netlify
2. 点击 "New site from Git"
3. 选择你的 Git 仓库
4. 配置构建命令和发布目录
5. 部署

#### 3. 配置环境变量

在 Netlify 控制台配置：
- `VITE_API_BASE_URL`

## 生产环境检查清单

### 部署前检查

- [ ] 所有环境变量已配置
- [ ] API 地址正确指向生产环境
- [ ] 移除所有 console.log 和调试代码
- [ ] 检查构建产物大小是否合理
- [ ] 确认所有静态资源路径正确
- [ ] 测试所有核心功能是否正常

### 安全检查

- [ ] 启用 HTTPS
- [ ] 配置安全响应头
- [ ] API 请求使用安全的认证方式
- [ ] 敏感信息不暴露在前端代码中
- [ ] XSS 防护已启用
- [ ] CSRF 防护已配置

### 性能检查

- [ ] 启用 Gzip/Brotli 压缩
- [ ] 配置静态资源缓存策略
- [ ] 图片已优化（使用 WebP 格式）
- [ ] CDN 加速已启用
- [ ] 代码分割生效
- [ ] 懒加载功能正常

### SEO 检查

- [ ] 配置页面标题和描述
- [ ] 添加 meta 标签
- [ ] 配置 sitemap.xml
- [ ] 配置 robots.txt
- [ ] Open Graph 标签配置
- [ ] 结构化数据

### 监控检查

- [ ] 错误监控已配置（Sentry）
- [ ] 性能监控已配置
- [ ] 用户行为分析已配置
- [ ] 日志收集已配置

## 性能优化

### 1. CDN 配置

将静态资源上传到 CDN：

```bash
# 使用 CDN 地址
VITE_CDN_URL=https://cdn.example.com
```

### 2. 图片优化

使用 WebP 格式，添加响应式图片：

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="描述">
</picture>
```

### 3. 预加载关键资源

在 `index.html` 中添加：

```html
<link rel="preload" href="/assets/main.js" as="script">
<link rel="preload" href="/assets/main.css" as="style">
<link rel="prefetch" href="/assets/editor.js">
```

### 4. 服务端渲染（可选）

对于 SEO 要求高的页面，可以考虑使用 SSR：

```bash
npm install @vue/server-renderer
```

## 监控与日志

### 1. 错误监控

集成 Sentry：

```bash
npm install @sentry/vue
```

```typescript
// main.ts
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.MODE
})
```

### 2. 性能监控

使用 Web Vitals：

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

onCLS(console.log)
onFID(console.log)
onFCP(console.log)
onLCP(console.log)
onTTFB(console.log)
```

### 3. 用户行为分析

集成 Google Analytics：

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || []
  function gtag(){dataLayer.push(arguments)}
  gtag('js', new Date())
  gtag('config', 'GA_MEASUREMENT_ID')
</script>
```

## 故障排查

### 问题 1: 白屏

**原因**: 路由配置错误或构建失败

**解决**:
1. 检查 Nginx 配置中的 `try_files`
2. 确认构建成功，检查 `dist/index.html`
3. 查看浏览器控制台错误

### 问题 2: API 请求失败

**原因**: 跨域问题或 API 地址错误

**解决**:
1. 检查环境变量配置
2. 配置 Nginx 代理或后端 CORS
3. 确认 API 服务可访问

### 问题 3: 静态资源 404

**原因**: 资源路径错误或缓存问题

**解决**:
1. 清除浏览器缓存
2. 检查 CDN 配置
3. 确认 `vite.config.ts` 中的 `base` 配置

### 问题 4: 性能问题

**原因**: Bundle 过大或未优化

**解决**:
1. 检查构建产物大小
2. 确认代码分割生效
3. 启用 Gzip 压缩
4. 优化图片资源

## 更新部署

### Vercel 自动部署

推送到 main 分支自动触发部署。

### Nginx 手动部署

```bash
# 1. 拉取最新代码
git pull

# 2. 安装依赖
npm install

# 3. 构建
npm run build

# 4. 备份旧版本
cp -r /var/www/qingyu /var/www/qingyu.backup

# 5. 部署新版本
rm -rf /var/www/qingyu/*
cp -r dist/* /var/www/qingyu/

# 6. 清理缓存（可选）
rm -rf /var/www/qingyu/assets/*
```

### Docker 滚动更新

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker build -t qingyu-frontend:latest .

# 3. 停止旧容器
docker stop qingyu-web

# 4. 启动新容器
docker run -d -p 80:80 --name qingyu-web-new qingyu-frontend:latest

# 5. 切换流量
# (使用负载均衡器或修改 DNS)

# 6. 清理旧容器
docker rm qingyu-web
docker rename qingyu-web-new qingyu-web
```

## 回滚策略

### Nginx 回滚

```bash
# 恢复备份
rm -rf /var/www/qingyu/*
cp -r /var/www/qingyu.backup/* /var/www/qingyu/
```

### Docker 回滚

```bash
# 使用旧版本镜像
docker stop qingyu-web
docker run -d -p 80:80 --name qingyu-web qingyu-frontend:previous-version
```

## 常用命令

```bash
# 开发环境
npm run dev

# 构建生产版本
npm run build

# 预览构建
npm run preview

# 类型检查
npm run type-check

# 代码检查
npm run lint

# Docker 构建
docker build -t qingyu-frontend .

# Docker 运行
docker run -d -p 80:80 --name qingyu-web qingyu-frontend
```

## 参考资料

- [Vite 部署指南](https://vitejs.dev/guide/build.html)
- [Vue 3 生产环境指南](https://vuejs.org/guide/best-practices/production-deployment.html)
- [Nginx 性能优化](https://www.nginx.com/blog/tuning-nginx/)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)

## 支持

如有问题，请提交 Issue 或联系技术支持。
