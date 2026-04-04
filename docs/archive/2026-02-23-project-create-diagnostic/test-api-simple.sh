#!/bin/bash

echo "========================================"
echo "🔍 项目创建API诊断测试"
echo "========================================"
echo ""

# 配置
API_BASE="http://localhost:9090/api/v1"

# 步骤1: 登录
echo "📋 步骤1: 登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/shared/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "author1", "password": "password123"}')

echo "登录响应:"
echo "$LOGIN_RESPONSE"
echo ""

# 提取token（使用grep和sed）
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，未获取到token"
  exit 1
fi

echo "✅ 登录成功，Token: ${TOKEN:0:20}..."
echo ""

# 步骤2: 测试空请求体
echo "📋 步骤2: 测试创建项目API（空请求体）..."
EMPTY_RESPONSE=$(curl -s -X POST "${API_BASE}/writer/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "空请求体响应:"
echo "$EMPTY_RESPONSE"
echo ""

# 步骤3: 测试正确的请求体
echo "📋 步骤3: 测试创建项目API（正确的请求体）..."
TIMESTAMP=$(date +%s)
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/writer/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"测试项目-${TIMESTAMP}\", \"summary\": \"这是一个诊断测试创建的项目\", \"category\": \"fantasy\", \"tags\": [\"仙侠\", \"玄幻\"]}")

echo "创建项目响应:"
echo "$CREATE_RESPONSE"
echo ""

# 检查是否成功
if echo "$CREATE_RESPONSE" | grep -q '"code":200\|"code":201'; then
  echo "✅ 项目创建成功！"
else
  echo "❌ 项目创建失败！"
fi
echo ""

# 步骤4: 获取项目列表
echo "📋 步骤4: 测试获取项目列表..."
LIST_RESPONSE=$(curl -s -X GET "${API_BASE}/writer/projects" \
  -H "Authorization: Bearer $TOKEN")

echo "项目列表响应:"
echo "$LIST_RESPONSE"
echo ""

# 步骤5: 测试无Token访问
echo "📋 步骤5: 测试无Token访问..."
NO_TOKEN_RESPONSE=$(curl -s -X POST "${API_BASE}/writer/projects" \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"测试项目-${TIMESTAMP}\", \"summary\": \"这是一个诊断测试创建的项目\"}")

echo "无Token响应:"
echo "$NO_TOKEN_RESPONSE"
echo ""

# 步骤6: 测试错误的API路径
echo "📋 步骤6: 测试错误的API路径（/api/v1/projects）..."
WRONG_PATH_RESPONSE=$(curl -s -X POST "${API_BASE}/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"测试项目-${TIMESTAMP}\", \"summary\": \"这是一个诊断测试创建的项目\"}")

echo "错误路径响应:"
echo "$WRONG_PATH_RESPONSE"
echo ""

echo "========================================"
echo "🔍 诊断完成"
echo "========================================"
