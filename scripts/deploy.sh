#!/bin/bash

# 青羽写作平台 - 部署脚本
# 支持多种部署平台

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境变量
check_env() {
    if [ ! -f ".env.$1" ]; then
        print_error "环境文件 .env.$1 不存在"
        exit 1
    fi
    print_info "使用环境: $1"
}

# 构建项目
build_project() {
    print_info "开始构建项目..."

    # 复制环境变量文件
    cp .env.$1 .env.production

    # 安装依赖
    print_info "安装依赖..."
    npm ci

    # 构建项目
    print_info "构建生产版本..."
    npm run build

    print_info "构建完成！"
}

# 部署到Vercel
deploy_vercel() {
    print_info "部署到 Vercel..."

    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI 未安装，请运行: npm install -g vercel"
        exit 1
    fi

    vercel --prod
}

# 部署到腾讯云CloudBase
deploy_cloudbase() {
    print_info "部署到腾讯云 CloudBase..."

    if ! command -v tcb &> /dev/null; then
        print_error "CloudBase CLI 未安装，请运行: npm install -g @cloudbase/cli"
        exit 1
    fi

    tcb hosting deploy dist -e $1
}

# 部署到阿里云OSS
deploy_oss() {
    print_info "部署到阿里云 OSS..."

    if ! command -v ossutil &> /dev/null; then
        print_error "ossutil 未安装"
        print_warn "请手动上传 dist 目录到 OSS"
        return
    fi

    # 需要配置 OSS bucket 信息
    ossutil cp -rf dist/ oss://your-bucket/ --update
}

# 部署到服务器
deploy_server() {
    print_info "部署到服务器..."

    if [ -z "$SERVER_HOST" ]; then
        print_error "请设置服务器地址: export SERVER_HOST=user@host"
        exit 1
    fi

    # 上传到服务器
    rsync -avz --delete dist/ $SERVER_HOST:/var/www/qingyu/dist/

    print_info "部署完成！"
}

# 主函数
main() {
    case "$1" in
        vercel)
            check_env "production"
            build_project "production"
            deploy_vercel
            ;;
        cloudbase)
            check_env "production"
            build_project "production"
            deploy_cloudbase "$2"
            ;;
        oss)
            check_env "production"
            build_project "production"
            deploy_oss
            ;;
        server)
            check_env "production"
            build_project "production"
            deploy_server
            ;;
        build)
            check_env "${2:-production}"
            build_project "$2"
            ;;
        *)
            echo "用法: $0 {vercel|cloudbase|oss|server|build} [环境]"
            echo ""
            echo "示例:"
            echo "  $0 build production   # 构建生产环境"
            echo "  $0 vercel              # 部署到 Vercel"
            echo "  $0 cloudbase env-id    # 部署到 CloudBase"
            echo "  $0 server              # 部署到服务器"
            exit 1
            ;;
    esac
}

main "$@"
