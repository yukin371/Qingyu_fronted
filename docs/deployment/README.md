# 部署运维

构建、部署和运维文档。

## 部署文档

### [构建配置](./build.md)

- Vite构建配置
- 环境变量配置
- 代码分割
- 资源优化

### [部署指南](./deploy.md)

- 部署流程
- Nginx配置
- Docker部署
- CI/CD配置

### [环境配置](./env-config.md)

- 开发环境
- 测试环境
- 生产环境

## 快速部署

### 构建生产版本

```bash
# 构建
pnpm build

# 输出目录：dist/
```

### 本地预览

```bash
# 预览构建结果
pnpm preview
```

### 环境变量

```bash
# .env.production
VITE_API_BASE_URL=https://api.qingyu.com/api/v1
VITE_APP_TITLE=青羽书城
```

## Nginx配置示例

```nginx
server {
    listen 80;
    server_name qingyu.com;
    root /var/www/qingyu-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
    }
}
```

## Docker部署

```dockerfile
FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

**最后更新**：2025年10月17日
