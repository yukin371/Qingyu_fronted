/**
 * 项目创建诊断测试
 * 目的：诊断作者创建项目失败的原因
 */

import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:9090/api/v1';

test.describe('项目创建诊断测试', () => {
  test('完整的创建项目流程诊断', async ({ request }) => {
    console.log('\n========================================');
    console.log('🔍 开始诊断项目创建流程');
    console.log('========================================\n');

    // 步骤1: 登录获取token
    console.log('📋 步骤1: 尝试登录...');
    const loginResponse = await request.post(`${API_BASE}/shared/auth/login`, {
      data: {
        username: 'author1',
        password: 'password123'
      }
    });

    console.log('登录状态码:', loginResponse.status());
    const loginData = await loginResponse.json();
    console.log('登录响应数据:', JSON.stringify(loginData, null, 2));

    const token = loginData.data?.token;
    expect(token, '❌ 登录失败，未获取到token').toBeTruthy();
    console.log('✅ 登录成功，Token已获取\n');

    // 步骤2: 测试创建项目API（不带请求体）
    console.log('📋 步骤2: 测试创建项目API（空请求体）...');
    const emptyCreateResponse = await request.post(`${API_BASE}/writer/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {}
    });

    console.log('空请求体状态码:', emptyCreateResponse.status());
    const emptyCreateData = await emptyCreateResponse.json();
    console.log('空请求体响应:', JSON.stringify(emptyCreateData, null, 2));
    console.log('');

    // 步骤3: 测试创建项目API（带必填字段）
    console.log('📋 步骤3: 测试创建项目API（带必填字段）...');
    const createData = {
      title: '测试项目-' + Date.now(),
      summary: '这是一个诊断测试创建的项目',
      category: 'fantasy',
      tags: ['仙侠', '玄幻']
    };

    console.log('请求体:', JSON.stringify(createData, null, 2));

    const createResponse = await request.post(`${API_BASE}/writer/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: createData
    });

    console.log('创建项目状态码:', createResponse.status());
    const createResult = await createResponse.json();
    console.log('创建项目响应:', JSON.stringify(createResult, null, 2));

    if (createResponse.status() === 200 || createResponse.status() === 201) {
      console.log('✅ 项目创建成功！');
    } else {
      console.log('❌ 项目创建失败！');
      console.log('错误详情:', {
        status: createResponse.status(),
        message: createResult.message || createResult.error,
        details: createResult.details || createResult.data
      });
    }
    console.log('');

    // 步骤4: 测试获取项目列表（验证权限）
    console.log('📋 步骤4: 测试获取项目列表...');
    const listResponse = await request.get(`${API_BASE}/writer/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('获取列表状态码:', listResponse.status());
    const listData = await listResponse.json();
    console.log('项目列表响应:', JSON.stringify(listData, null, 2));

    if (listResponse.status() === 200) {
      console.log('✅ 获取项目列表成功');
    } else {
      console.log('❌ 获取项目列表失败');
    }
    console.log('');

    // 步骤5: 测试无Token访问
    console.log('📋 步骤5: 测试无Token访问...');
    const noTokenResponse = await request.post(`${API_BASE}/writer/projects`, {
      data: createData
    });

    console.log('无Token状态码:', noTokenResponse.status());
    const noTokenData = await noTokenResponse.json();
    console.log('无Token响应:', JSON.stringify(noTokenData, null, 2));
    console.log('');

    // 步骤6: 测试错误的API路径
    console.log('📋 步骤6: 测试错误的API路径...');
    const wrongPathResponse = await request.post(`${API_BASE}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: createData
    });

    console.log('错误路径状态码:', wrongPathResponse.status());
    const wrongPathData = await wrongPathResponse.json();
    console.log('错误路径响应:', JSON.stringify(wrongPathData, null, 2));
    console.log('');

    console.log('========================================');
    console.log('🔍 诊断完成');
    console.log('========================================\n');
  });

  test('验证前端API配置', async ({ page }) => {
    console.log('\n========================================');
    console.log('🔍 验证前端API配置');
    console.log('========================================\n');

    // 访问前端页面
    await page.goto('http://localhost:5173');

    // 监听网络请求
    const requests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/writer/projects')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });

    // 模拟用户操作
    console.log('请在浏览器中手动尝试创建项目...');
    console.log('等待30秒以收集网络请求...');

    await page.waitForTimeout(30000);

    console.log('\n捕获到的请求:');
    requests.forEach((req, index) => {
      console.log(`\n请求 ${index + 1}:`);
      console.log('  URL:', req.url);
      console.log('  Method:', req.method);
      console.log('  Headers:', JSON.stringify(req.headers, null, 2));
    });

    console.log('\n========================================');
    console.log('🔍 前端API验证完成');
    console.log('========================================\n');
  });
});
