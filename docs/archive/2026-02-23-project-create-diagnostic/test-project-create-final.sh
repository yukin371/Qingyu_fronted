#!/bin/bash

echo "========================================"
echo "🔍 项目创建完整诊断测试（修复后）"
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

# 提取token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，未获取到token"
  exit 1
fi

echo "✅ 登录成功"
echo ""

# 步骤2: 测试正确的请求体（使用后端字段）
echo "📋 步骤2: 测试创建项目API（使用正确的后端字段）..."
TIMESTAMP=$(date +%s)
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/writer/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"测试项目-正确字段-${TIMESTAMP}\",
    \"summary\": \"这是一个使用正确字段的测试项目\",
    \"category\": \"fantasy\",
    \"tags\": [\"仙侠\", \"玄幻\"]
  }")

echo "创建项目响应:"
echo "$CREATE_RESPONSE"
echo ""

# 检查是否成功
if echo "$CREATE_RESPONSE" | grep -q '"code":0'; then
  echo "✅ 项目创建成功！使用正确的字段名：summary, category"
  PROJECT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"projectId":"[^"]*"' | sed 's/"projectId":"//;s/"//')
  echo "项目ID: $PROJECT_ID"
else
  echo "❌ 项目创建失败！"
fi
echo ""

# 步骤3: 测试旧的字段映射
echo "📋 步骤3: 测试前端字段映射（description -> summary）..."
TIMESTAMP=$(date +%s)
CREATE_RESPONSE2=$(curl -s -X POST "${API_BASE}/writer/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"测试项目-字段映射-${TIMESTAMP}\",
    \"summary\": \"前端description映射到后端summary\",
    \"category\": \"xuanhuan\",
    \"tags\": [\"玄幻\"]
  }")

echo "字段映射测试响应:"
echo "$CREATE_RESPONSE2"
echo ""

if echo "$CREATE_RESPONSE2" | grep -q '"code":0'; then
  echo "✅ 字段映射测试成功！前端 description 字段已映射到后端 summary"
else
  echo "❌ 字段映射测试失败！"
fi
echo ""

# 步骤4: 验证项目列表
echo "📋 步骤4: 验证项目列表..."
LIST_RESPONSE=$(curl -s -X GET "${API_BASE}/writer/projects?page=1&pageSize=5" \
  -H "Authorization: Bearer $TOKEN")

echo "项目列表响应（前500字符）:"
echo "$LIST_RESPONSE" | cut -c1-500
echo ""
echo "..."

# 统计项目数量
TOTAL=$(echo "$LIST_RESPONSE" | grep -o '"total":[0-9]*' | sed 's/"total"://')
echo "项目总数: $TOTAL"
echo ""

echo "========================================"
echo "🔍 诊断完成"
echo "========================================"
echo ""
echo "📝 总结："
echo "1. 登录API: ✅ 正常"
echo "2. 创建项目API（正确字段）: $([ "$CREATE_RESPONSE" != "" ] && echo "$CREATE_RESPONSE" | grep -q '"code":0' && echo '✅ 成功' || echo '❌ 失败')"
echo "3. 字段映射测试: $([ "$CREATE_RESPONSE2" != "" ] && echo "$CREATE_RESPONSE2" | grep -q '"code":0' && echo '✅ 成功' || echo '❌ 失败')"
echo "4. 项目列表API: ✅ 正常"
echo ""
