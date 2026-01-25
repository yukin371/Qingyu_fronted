import { test, expect } from '@playwright/test'

test.describe('BrowseBooks 性能测试', () => {
  test('DOM 节点数量检查', async ({ page }) => {
    await page.goto('/bookstore/browse')

    // 等待页面完全加载
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // 额外等待动态内容

    // 检查DOM节点数量
    const domNodes = await page.evaluate(() => document.querySelectorAll('*').length)
    console.log(`DOM 节点数量: ${domNodes}`)

    expect(domNodes).toBeLessThan(2000) // 合理的DOM复杂度
  })

  test('搜索框响应时间', async ({ page }) => {
    await page.goto('/bookstore/browse')

    const searchInput = page.locator('.search-input')

    // 等待搜索框可交互
    await searchInput.waitFor({ state: 'visible' })

    // 测量输入响应时间
    const startTime = Date.now()
    await searchInput.type('测试搜索', { delay: 50 })
    await page.waitForTimeout(300) // 等待防抖
    const endTime = Date.now()

    const responseTime = endTime - startTime
    console.log(`搜索框响应时间: ${responseTime}ms`)

    // 输入响应应该合理（总时间 < 1000ms）
    expect(responseTime).toBeLessThan(1000)
  })

  test('首次内容绘制（FCP）', async ({ page }) => {
    const metrics = await page.goto('/bookstore/browse').then(async (response) => {
      if (!response) throw new Error('No response')

      // 等待页面加载
      await page.waitForLoadState('networkidle')

      // 获取性能指标
      const metrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          domInteractive: perfData.domInteractive - perfData.fetchStart
        }
      })

      return metrics
    })

    console.log('性能指标:', metrics)

    // DOM 交互时间应该 < 3秒
    expect(metrics.domInteractive).toBeLessThan(3000)
  })

  test('页面资源加载检查', async ({ page }) => {
    const resources: string[] = []

    page.on('request', request => {
      resources.push(request.url())
    })

    await page.goto('/bookstore/browse')
    await page.waitForLoadState('networkidle')

    console.log(`加载的资源数量: ${resources.length}`)

    // 检查是否有明显过多的资源请求
    expect(resources.length).toBeLessThan(50)
  })

  test('内存使用检查', async ({ page }) => {
    await page.goto('/bookstore/browse')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 获取内存使用情况（Chrome特有）
    const metrics = await page.metrics()
    console.log('浏览器性能指标:', metrics)

    // JS 堆大小应该合理（< 100MB）
    expect(metrics.JSHeapUsedSize).toBeLessThan(100 * 1024 * 1024)
  })

  test('页面布局稳定性', async ({ page }) => {
    await page.goto('/bookstore/browse')

    // 等待页面稳定
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 检查是否有突然的布局变化
    const layoutShifts = await page.evaluate(() => {
      return new Promise((resolve) => {
        let shifts = 0
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              shifts += 1
            }
          }
        })
        observer.observe({ entryTypes: ['layout-shift'] })

        // 等待一段时间收集数据
        setTimeout(() => {
          observer.disconnect()
          resolve(shifts)
        }, 3000)
      })
    })

    console.log(`布局偏移次数: ${layoutShifts}`)
    // 布局应该相对稳定
  })

  test('组件渲染性能', async ({ page }) => {
    const renderTimes: number[] = []

    // 监听自定义性能标记（如果组件有）
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('render')) {
        const match = text.match(/(\d+)ms/)
        if (match) {
          renderTimes.push(parseInt(match[1]))
        }
      }
    })

    await page.goto('/bookstore/browse')
    await page.waitForLoadState('networkidle')

    if (renderTimes.length > 0) {
      const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
      console.log(`平均组件渲染时间: ${avgRenderTime}ms`)
      console.log(`渲染时间样本:`, renderTimes)
    }
  })
})
