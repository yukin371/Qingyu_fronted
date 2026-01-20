/**
 * 完整登录到阅读流程 E2E 测试
 * 用于诊断登录认证问题
 */

import { test, expect } from '@playwright/test'

const TEST_USER = {
  username: 'testuser',
  password: '123456'
}

test.describe('登录到阅读流程诊断测试', () => {
  test('应该能够成功登录并获取token', async ({ page, context }) => {
    console.log('🔐 测试：登录流程')

    // 监听所有网络请求
    const requests: { url: string; method: string; status?: number; headers?: any }[] = []

    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method()
      })
    })

    page.on('response', response => {
      const req = requests.find(r => r.url === response.url())
      if (req) {
        req.status = response.status()
        req.headers = response.headers()
      }
    })

    // 导航到登录页
    await page.goto('/login')
    await page.waitForLoadState('load')

    // 填写登录表单
    await page.fill('input[placeholder*="用户名"], input[type="text"]', TEST_USER.username)
    await page.fill('input[placeholder*="密码"], input[type="password"]', TEST_USER.password)

    // 点击登录按钮
    await page.click('button:has-text("登录"), button:has-text("立即登录")')

    // 等待登录完成
    await page.waitForTimeout(3000)

    // 检查登录请求
    const loginReq = requests.find(r => r.url.includes('/login'))
    console.log('登录请求:', loginReq)

    if (loginReq) {
      console.log('登录请求状态:', loginReq.status)
      expect(loginReq.status).toBe(200)

      // 检查响应内容
      if (loginReq.headers && loginReq.headers['content-type']?.includes('application/json')) {
        console.log('✅ 登录API返回JSON响应')
      }
    }

    // 检查是否成功登录（通过URL变化或页面元素判断）
    const currentUrl = page.url()
    console.log('登录后URL:', currentUrl)

    // 检查localStorage中是否有token（包括qingyu_前缀）
    const storageInfo = await page.evaluate(() => {
      const tokenKeys = ['token', 'qingyu_token', 'auth_token', 'qingyu_auth_token']
      const found: { key: string; value: string }[] = []

      tokenKeys.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) {
          found.push({ key, value })
        }
      })

      // 返回所有localStorage keys
      return {
        foundTokens: found,
        allKeys: Object.keys(localStorage)
      }
    })

    console.log('Storage信息:', JSON.stringify(storageInfo, null, 2))

    const token = storageInfo.foundTokens[0]?.value
    console.log('Token存在:', !!token)
    console.log('Token长度:', token?.length || 0)

    if (token) {
      console.log('Token前20个字符:', token.substring(0, 20))
    } else {
      console.error('❌ Token未保存到localStorage')
    }

    // 检查Pinia store状态
    const authState = await page.evaluate(() => {
      // 尝试从window对象获取store状态
      return {
        hasStore: !!(window as any).__PINIA_STORE__,
        // 这个检查可能在你的项目中不适用，取决于Pinia的配置
      }
    })

    console.log('Auth状态检查:', authState)
  })

  test('应该能够登录后访问书店页面', async ({ page }) => {
    console.log('📚 测试：登录后访问书店')

    // 监听401错误
    const unauthorizedRequests: string[] = []

    page.on('response', response => {
      if (response.status() === 401) {
        unauthorizedRequests.push(response.url())
      }
    })

    // 先登录
    await page.goto('/login')
    await page.waitForLoadState('load')

    await page.fill('input[placeholder*="用户名"], input[type="text"]', TEST_USER.username)
    await page.fill('input[placeholder*="密码"], input[type="password"]', TEST_USER.password)
    await page.click('button:has-text("登录"), button:has-text("立即登录")')

    // 等待登录完成
    await page.waitForTimeout(3000)

    // 导航到书店页面
    await page.goto('/bookstore/books')
    await page.waitForLoadState('load')
    await page.waitForTimeout(2000)

    // 检查是否有401错误
    console.log(`发现 ${unauthorizedRequests.length} 个401错误`)

    if (unauthorizedRequests.length > 0) {
      console.error('401错误的URL:', unauthorizedRequests)
    }

    // 验证书籍列表加载成功
    const bookTitles = page.locator('h4')
    const count = await bookTitles.count()
    console.log(`找到 ${count} 本书`)

    // 至少应该有一些书
    expect(count).toBeGreaterThan(0)

    // 不应该有401错误
    expect(unauthorizedRequests.length).toBe(0)
  })

  test('应该能够点击书籍并查看详情', async ({ page }) => {
    console.log('📖 测试：查看书籍详情')

    const unauthorizedRequests: string[] = []
    page.on('response', response => {
      if (response.status() === 401) {
        unauthorizedRequests.push(response.url())
      }
    })

    // 登录
    await page.goto('/login')
    await page.waitForLoadState('load')

    await page.fill('input[placeholder*="用户名"], input[type="text"]', TEST_USER.username)
    await page.fill('input[placeholder*="密码"], input[type="password"]', TEST_USER.password)
    await page.click('button:has-text("登录"), button:has-text("立即登录")')
    await page.waitForTimeout(3000)

    // 导航到书店
    await page.goto('/bookstore/books')
    await page.waitForLoadState('load')
    await page.waitForSelector('h4', { timeout: 10000 })

    // 点击第一本书
    const firstBook = page.locator('h4').first()
    const bookTitle = await firstBook.textContent()
    console.log(`点击书籍: ${bookTitle}`)

    await firstBook.click()
    await page.waitForTimeout(2000)

    // 检查当前URL
    const currentUrl = page.url()
    console.log('书籍详情页URL:', currentUrl)

    // 检查是否在书籍详情页
    const isBookDetail = currentUrl.includes('/bookstore/books/')
    console.log('是否在书籍详情页:', isBookDetail)

    // 检查页面内容
    const pageContent = await page.textContent('body')
    const hasContent = pageContent && pageContent.length > 0
    console.log('页面有内容:', hasContent)

    // 检查401错误
    console.log(`401错误数量: ${unauthorizedRequests.length}`)

    if (unauthorizedRequests.length > 0) {
      console.error('发现401错误:', unauthorizedRequests)
    }

    // 验证：不应该有401错误
    expect(unauthorizedRequests.length).toBe(0)
  })

  test('应该能够检查Authorization header是否正确发送', async ({ page, context }) => {
    console.log('🔍 测试：检查Authorization header')

    // 启用CDP (Chrome DevTools Protocol) 来监听网络请求
    const client = await context.newCDPSession(page)

    await client.send('Network.enable')

    const requestHeaders: { url: string; authorization?: string }[] = []

    client.on('Network.requestWillBeSent', (params: any) => {
      const request = params.request
      const url = request.url

      // 只记录API请求
      if (url.includes('/api/')) {
        requestHeaders.push({
          url: url,
          authorization: request.headers['Authorization'] || request.headers['authorization']
        })
      }
    })

    // 登录
    await page.goto('/login')
    await page.waitForLoadState('load')

    await page.fill('input[placeholder*="用户名"], input[type="text"]', TEST_USER.username)
    await page.fill('input[placeholder*="密码"], input[type="password"]', TEST_USER.password)
    await page.click('button:has-text("登录"), button:has-text("立即登录")')
    await page.waitForTimeout(3000)

    // 访问需要认证的API
    await page.goto('/reading/bookshelf')
    await page.waitForLoadState('load')
    await page.waitForTimeout(2000)

    // 检查请求头
    console.log(`检查了 ${requestHeaders.length} 个API请求`)

    const requestsWithAuth = requestHeaders.filter(r => r.authorization)
    const requestsWithoutAuth = requestHeaders.filter(r => !r.authorization)

    console.log(`有Authorization头的请求: ${requestsWithAuth.length}`)
    console.log(`没有Authorization头的请求: ${requestsWithoutAuth.length}`)

    if (requestsWithoutAuth.length > 0) {
      console.error('缺少Authorization的请求:', requestsWithoutAuth)
    }

    // 显示几个有Authorization的请求示例
    if (requestsWithAuth.length > 0) {
      console.log('Authorization header示例:')
      requestsWithAuth.slice(0, 3).forEach(r => {
        const authPreview = r.authorization ? r.authorization.substring(0, 30) + '...' : 'none'
        console.log(`  ${r.url.substring(0, 60)}...`)
        console.log(`    Authorization: ${authPreview}`)
      })
    }

    // 所有API请求都应该有Authorization头（除了登录接口）
    const apiRequests = requestHeaders.filter(r =>
      !r.url.includes('/login') &&
      !r.url.includes('/register') &&
      r.url.includes('/api/')
    )

    const unauthorizedApiRequests = apiRequests.filter(r => !r.authorization)

    console.log(`需要认证的API请求: ${apiRequests.length}`)
    console.log(`缺少认证的API请求: ${unauthorizedApiRequests.length}`)

    // 验证：不应该有缺少认证的API请求
    expect(unauthorizedApiRequests.length).toBe(0)
  })

  test('诊断报告：完整登录流程检查', async ({ page }) => {
    console.log('📋 完整诊断测试')

    const diagnostics = {
      loginSuccess: false,
      tokenSaved: false,
      tokenValue: '',
      canAccessBookstore: false,
      canAccessBookDetail: false,
      canAccessBookshelf: false,
      requestsWith401: [] as string[]
    }

    // 监听网络请求
    page.on('response', response => {
      if (response.status() === 401) {
        diagnostics.requestsWith401.push(response.url())
      }
    })

    // 1. 测试登录
    console.log('\n=== 步骤1: 测试登录 ===')
    await page.goto('/login')
    await page.waitForLoadState('load')

    await page.fill('input[placeholder*="用户名"], input[type="text"]', TEST_USER.username)
    await page.fill('input[placeholder*="密码"], input[type="password"]', TEST_USER.password)
    await page.click('button:has-text("登录"), button:has-text("立即登录")')
    await page.waitForTimeout(3000)

    // 检查token（包括qingyu_前缀）
    const storageInfo = await page.evaluate(() => {
      const tokenKeys = ['token', 'qingyu_token', 'auth_token', 'qingyu_auth_token']
      const found: { key: string; value: string }[] = []

      tokenKeys.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) {
          found.push({ key, value })
        }
      })

      return {
        foundTokens: found,
        allKeys: Object.keys(localStorage)
      }
    })

    diagnostics.tokenValue = storageInfo.foundTokens[0]?.value || ''
    diagnostics.tokenSaved = !!diagnostics.tokenValue
    diagnostics.loginSuccess = diagnostics.tokenSaved

    console.log('登录成功:', diagnostics.loginSuccess)
    console.log('Token已保存:', diagnostics.tokenSaved)
    console.log('Storage信息:', JSON.stringify(storageInfo, null, 2))

    // 2. 测试访问书店
    console.log('\n=== 步骤2: 测试访问书店 ===')
    await page.goto('/bookstore/books')
    await page.waitForLoadState('load')
    await page.waitForTimeout(2000)

    const bookCount = await page.locator('h4').count()
    diagnostics.canAccessBookstore = bookCount > 0

    console.log('可以访问书店:', diagnostics.canAccessBookstore)
    console.log('书籍数量:', bookCount)

    // 3. 测试访问书籍详情
    console.log('\n=== 步骤3: 测试访问书籍详情 ===')
    if (bookCount > 0) {
      await page.locator('h4').first().click()
      await page.waitForTimeout(2000)

      const currentUrl = page.url()
      diagnostics.canAccessBookDetail = currentUrl.includes('/bookstore/books/')

      console.log('可以访问书籍详情:', diagnostics.canAccessBookDetail)
      console.log('详情页URL:', currentUrl)
    }

    // 4. 测试访问书架
    console.log('\n=== 步骤4: 测试访问书架 ===')
    await page.goto('/reading/bookshelf')
    await page.waitForLoadState('load')
    await page.waitForTimeout(2000)

    const currentUrl = page.url()
    diagnostics.canAccessBookshelf = currentUrl.includes('/reading/bookshelf')

    console.log('可以访问书架:', diagnostics.canAccessBookshelf)
    console.log('书架页URL:', currentUrl)

    // 5. 生成诊断报告
    console.log('\n=== 诊断报告 ===')
    console.log('登录成功:', diagnostics.loginSuccess ? '✅' : '❌')
    console.log('Token已保存:', diagnostics.tokenSaved ? '✅' : '❌')
    console.log('可以访问书店:', diagnostics.canAccessBookstore ? '✅' : '❌')
    console.log('可以访问书籍详情:', diagnostics.canAccessBookDetail ? '✅' : '❌')
    console.log('可以访问书架:', diagnostics.canAccessBookshelf ? '✅' : '❌')
    console.log('401错误数量:', diagnostics.requestsWith401.length)

    if (diagnostics.requestsWith401.length > 0) {
      console.log('\n401错误的请求:')
      diagnostics.requestsWith401.slice(0, 5).forEach(url => {
        console.log(`  - ${url}`)
      })
    }

    // 断言关键功能
    expect(diagnostics.loginSuccess).toBe(true)
    expect(diagnostics.tokenSaved).toBe(true)
    expect(diagnostics.canAccessBookstore).toBe(true)
    expect(diagnostics.requestsWith401.length).toBe(0)
  })
})
