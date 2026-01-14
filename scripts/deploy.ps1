# 青羽写作平台 - 部署脚本 (PowerShell版本)
# 支持多种部署平台

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("vercel", "cloudbase", "oss", "server", "build")]
    [string]$Platform,

    [Parameter(Mandatory=$false)]
    [string]$Environment = "production"
)

# 颜色函数
function Print-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Print-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# 检查环境文件
function Test-Environment {
    $envFile = ".env.$Environment"
    if (-not (Test-Path $envFile)) {
        Print-Error "环境文件 $envFile 不存在"
        exit 1
    }
    Print-Info "使用环境: $Environment"
}

# 构建项目
function Build-Project {
    Print-Info "开始构建项目..."

    # 复制环境变量文件
    Copy-Item ".env.$Environment" .env.production -Force

    # 安装依赖
    Print-Info "安装依赖..."
    npm ci

    # 构建项目
    Print-Info "构建生产版本..."
    npm run build

    Print-Info "构建完成！"
}

# 部署到Vercel
function Deploy-Vercel {
    Print-Info "部署到 Vercel..."

    try {
        vercel --prod
    } catch {
        Print-Error "Vercel CLI 未安装，请运行: npm install -g vercel"
        exit 1
    }
}

# 部署到腾讯云CloudBase
function Deploy-CloudBase {
    Print-Info "部署到腾讯云 CloudBase..."

    try {
        tcb hosting deploy dist -e $Environment
    } catch {
        Print-Error "CloudBase CLI 未安装，请运行: npm install -g @cloudbase/cli"
        exit 1
    }
}

# 部署到服务器
function Deploy-Server {
    Print-Info "部署到服务器..."

    $serverHost = $env:SERVER_HOST
    if ([string]::IsNullOrEmpty($serverHost)) {
        Print-Error "请设置服务器地址: `$env:SERVER_HOST='user@host'"
        exit 1
    }

    # 使用SCP上传（需要安装OpenSSH）
    scp -r dist/* "$serverHost`:/var/www/qingyu/dist/"

    Print-Info "部署完成！"
}

# 主逻辑
switch ($Platform) {
    "build" {
        Test-Environment
        Build-Project
    }
    "vercel" {
        Test-Environment
        Build-Project
        Deploy-Vercel
    }
    "cloudbase" {
        Test-Environment
        Build-Project
        Deploy-CloudBase
    }
    "oss" {
        Print-Warn "OSS部署需要手动操作，请上传 dist 目录"
    }
    "server" {
        Test-Environment
        Build-Project
        Deploy-Server
    }
    default {
        Write-Host "用法: .\deploy.ps1 -Platform <vercel|cloudbase|oss|server|build> [-Environment <env>]"
        exit 1
    }
}
