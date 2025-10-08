# 前端 Docker 配置

前端项目的 Docker 配置文件，支持开发和生产环境。

## 📁 目录结构

```
Qingyu/docker/
├── Dockerfile.dev          # 开发环境Dockerfile
├── Dockerfile.prod         # 生产环境Dockerfile
├── .dockerignore           # Docker忽略文件
├── nginx.conf              # Nginx配置（生产环境）
├── docker-compose.dev.yml  # 开发环境编排
├── docker-compose.prod.yml # 生产环境编排
├── dev.bat                 # 开发环境启动脚本
├── stop.bat                # 停止服务脚本
└── README.md               # 本文件
```

## 🚀 快速开始

### 开发环境

#### 使用脚本（推荐）

```bash
# 在 Qingyu 目录下
cd docker
dev.bat
```

#### 使用 docker-compose

```bash
cd Qingyu/docker
docker-compose -f docker-compose.dev.yml up -d
```

### 生产环境

```bash
cd Qingyu/docker
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📋 前置要求

### 网络配置

前后端需要在同一个Docker网络中通信：

```bash
# 创建共享网络（如果不存在）
docker network create qingyu-network
```

### 后端服务

前端需要后端服务运行才能正常工作，请确保后端服务已启动：

```bash
# 启动后端服务
cd ../Qingyu_backend/docker
docker-compose -f docker-compose.dev.yml up -d
```

## 🔧 配置说明

### 开发环境特性

- ✅ Vite热模块替换（HMR）
- ✅ 源代码实时挂载
- ✅ 自动刷新
- ✅ 开发工具支持

### 生产环境特性

- ✅ 多阶段构建优化
- ✅ Nginx反向代理
- ✅ Gzip压缩
- ✅ 静态资源缓存
- ✅ Vue Router支持

### 环境变量

开发环境默认配置：

- `NODE_ENV=development`
- `VITE_API_BASE_URL=http://localhost:8080`

## 📝 常用命令

### 启动服务

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 停止服务

```bash
docker-compose -f docker-compose.dev.yml down
```

### 查看日志

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### 重建服务

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## 🌐 访问地址

- **开发环境**: <http://localhost:5173>
- **生产环境**: <http://localhost>

## 🔍 故障排除

### 端口冲突

修改 `docker-compose.dev.yml` 中的端口映射：

```yaml
ports:
  - "5174:5173"  # 改为其他端口
```

### 网络问题

确保网络已创建：

```bash
docker network create qingyu-network
```

### 热重载不工作

1. 检查文件挂载是否正确
2. 重启容器

## 📚 相关文档

- [主项目文档](../../README.md)
- [Docker使用指南](../../README.Docker.md)
