/**
 * 批量操作E2E测试
 * 测试文档批量删除、多选模式、撤销等功能
 */

import { test, expect } from '@playwright/test'

test.describe('Batch Operations', () => {
  test.beforeEach(async ({ page }) => {
    // 登录并导航到写作页面
    await page.goto('/writer/projects/test-project')
    await page.waitForLoadState('networkidle')
  })

  test('should enter multi-select mode', async ({ page }) => {
    // 点击多选按钮
    await page.click('[data-testid="multi-select-toggle"]')

    // 验证多选模式UI显示
    await expect(page.locator('.multi-select-hint')).toBeVisible()
    await expect(page.locator('text=已选择 0 个文档')).toBeVisible()
  })

  test('should select documents with Ctrl+Click', async ({ page }) => {
    await page.click('[data-testid="multi-select-toggle"]')

    // Ctrl+Click选择第一个文档
    await page.click('.el-tree-node__content:first-child', {
      modifiers: ['Control']
    })

    // 验证选择状态
    await expect(page.locator('.custom-tree-node.is-selected')).toHaveCount(1)
    await expect(page.locator('text=已选择 1 个文档')).toBeVisible()

    // Ctrl+Click选择第二个文档
    await page.click('.el-tree-node__content:nth-child(2)', {
      modifiers: ['Control']
    })

    // 验证多选状态
    await expect(page.locator('.custom-tree-node.is-selected')).toHaveCount(2)
    await expect(page.locator('text=已选择 2 个文档')).toBeVisible()
  })

  test('should execute batch delete', async ({ page }) => {
    // 进入多选模式并选择2个文档
    await page.click('[data-testid="multi-select-toggle"]')
    await page.click('.el-tree-node__content:first-child', {
      modifiers: ['Control']
    })
    await page.click('.el-tree-node__content:nth-child(2)', {
      modifiers: ['Control']
    })

    // 记录删除前的文档数量
    const beforeCount = await page.locator('.el-tree-node').count()

    // 点击批量删除按钮
    await page.click('button:has-text("批量删除")')

    // 验证确认对话框显示
    await expect(page.locator('.el-dialog__title:has-text("确认批量操作")')).toBeVisible()
    await expect(page.locator('text=确定要批量删除这 2 个文档吗？')).toBeVisible()

    // 点击确认
    await page.click('.dialog-footer button:has-text("确认执行")')

    // 验证进度对话框显示
    await expect(page.locator('.el-dialog__title:has-text("批量操作执行中")')).toBeVisible()
    await expect(page.locator('.el-progress')).toBeVisible()

    // 等待操作完成
    await page.waitForSelector('text=已完成', { timeout: 10000 })

    // 验证文档已被删除
    const afterCount = await page.locator('.el-tree-node').count()
    expect(afterCount).toBeLessThan(beforeCount)
  })

  test('should cancel batch operation', async ({ page }) => {
    // 进入多选模式并选择文档
    await page.click('[data-testid="multi-select-toggle"]')
    await page.click('.el-tree-node__content:first-child', {
      modifiers: ['Control']
    })

    // 记录文档数量
    const beforeCount = await page.locator('.el-tree-node').count()

    // 点击批量删除按钮
    await page.click('button:has-text("批量删除")')

    // 点击取消
    await page.click('.dialog-footer button:has-text("取消")')

    // 验证对话框关闭
    await expect(page.locator('.el-dialog')).not.toBeVisible()

    // 验证文档未被删除
    const afterCount = await page.locator('.el-tree-node').count()
    expect(afterCount).toBe(beforeCount)
  })

  test('should undo batch operation', async ({ page }) => {
    // 执行批量删除
    await page.click('[data-testid="multi-select-toggle"]')
    await page.click('.el-tree-node__content:first-child', {
      modifiers: ['Control']
    })
    await page.click('button:has-text("批量删除")')
    await page.click('.dialog-footer button:has-text("确认执行")')

    // 等待完成
    await page.waitForSelector('text=已完成', { timeout: 10000 })

    // 记录删除后的文档数量
    const deletedCount = await page.locator('.el-tree-node').count()

    // 点击撤销
    await page.click('button:has-text("撤销操作")')

    // 验证撤销确认对话框
    await expect(page.locator('.el-dialog__title:has-text("确认撤销")')).toBeVisible()

    // 确认撤销
    await page.click('.dialog-footer button:has-text("确认撤销")')

    // 等待撤销完成
    await page.waitForTimeout(2000)

    // 验证文档已恢复
    const restoredCount = await page.locator('.el-tree-node').count()
    expect(restoredCount).toBeGreaterThan(deletedCount)
  })

  test('should deselect document with Ctrl+Click', async ({ page }) => {
    await page.click('[data-testid="multi-select-toggle"]')

    // 选择第一个文档
    await page.click('.el-tree-node__content:first-child', {
      modifiers: ['Control']
    })

    await expect(page.locator('.custom-tree-node.is-selected')).toHaveCount(1)

    // Ctrl+Click取消选择
    await page.click('.el-tree-node__content:first-child', {
      modifiers: ['Control']
    })

    // 验证取消选择状态
    await expect(page.locator('.custom-tree-node.is-selected')).toHaveCount(0)
    await expect(page.locator('text=已选择 0 个文档')).toBeVisible()
  })

  test('should show error for invalid document selection', async ({ page }) => {
    await page.click('[data-testid="multi-select-toggle"]')

    // 尝试删除未选择的文档
    await page.click('button:has-text("批量删除")')

    // 验证错误提示
    await expect(page.locator('.el-message--error')).toBeVisible()
    await expect(page.locator('text=请至少选择一个文档')).toBeVisible()
  })

  test('should handle batch operation progress correctly', async ({ page }) => {
    // 进入多选模式并选择多个文档
    await page.click('[data-testid="multi-select-toggle"]')
    await page.click('.el-tree-node__content:first-child', {
      modifiers: ['Control']
    })
    await page.click('.el-tree-node__content:nth-child(2)', {
      modifiers: ['Control']
    })
    await page.click('.el-tree-node__content:nth-child(3)', {
      modifiers: ['Control']
    })

    // 点击批量删除
    await page.click('button:has-text("批量删除")')
    await page.click('.dialog-footer button:has-text("确认执行")')

    // 验证进度条显示
    const progressBar = page.locator('.el-progress__text')
    await expect(progressBar).toBeVisible()

    // 验证进度更新
    const initialProgress = await progressBar.textContent()
    expect(initialProgress).toContain('0%')

    // 等待进度更新
    await page.waitForTimeout(1000)
    const updatedProgress = await progressBar.textContent()
    expect(updatedProgress).toBeDefined()

    // 等待完成
    await page.waitForSelector('text=已完成', { timeout: 10000 })

    // 验证完成状态
    await expect(page.locator('text=操作已完成')).toBeVisible()
  })

  test('should exit multi-select mode when exiting', async ({ page }) => {
    // 进入多选模式
    await page.click('[data-testid="multi-select-toggle"]')

    // 验证多选模式UI显示
    await expect(page.locator('.multi-select-hint')).toBeVisible()

    // 退出多选模式
    await page.click('[data-testid="multi-select-toggle"]')

    // 验证多选模式UI消失
    await expect(page.locator('.multi-select-hint')).not.toBeVisible()

    // 验证选择状态清除
    await expect(page.locator('.custom-tree-node.is-selected')).toHaveCount(0)
  })

  test('should support Shift+Click for range selection', async ({ page }) => {
    await page.click('[data-testid="multi-select-toggle"]')

    // 点击第一个文档
    await page.click('.el-tree-node__content:first-child')

    // Shift+Click选择范围
    await page.click('.el-tree-node__content:nth-child(3)', {
      modifiers: ['Shift']
    })

    // 验证范围选择（应该选中1-3个文档）
    const selectedCount = await page.locator('.custom-tree-node.is-selected').count()
    expect(selectedCount).toBeGreaterThanOrEqual(2)
  })
})

test.describe('Batch Operations - Error Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/writer/projects/test-project')
    await page.waitForLoadState('networkidle')
  })

  test('should handle network error gracefully', async ({ page }) => {
    // 进入多选模式
    await page.click('[data-testid="multi-select-toggle"]')
    await page.click('.el-tree-node__content:first-child', {
      modifiers: ['Control']
    })

    // 模拟网络错误
    await page.context().setOffline(true)

    // 尝试批量删除
    await page.click('button:has-text("批量删除")')
    await page.click('.dialog-footer button:has-text("确认执行")')

    // 验证错误提示
    await expect(page.locator('.el-message--error')).toBeVisible()

    // 恢复网络
    await page.context().setOffline(false)
  })

  test('should handle concurrent batch operations', async ({ page }) => {
    // 启动第一个批量操作
    await page.click('[data-testid="multi-select-toggle"]')
    await page.click('.el-tree-node__content:first-child', {
      modifiers: ['Control']
    })
    await page.click('button:has-text("批量删除")')

    // 在第一个操作进行时尝试启动第二个操作
    await page.click('[data-testid="multi-select-toggle"]')

    // 验证错误提示或禁用状态
    const errorMessage = page.locator('.el-message--warning')
    const disabledButton = page.locator('button:has-text("批量删除"):disabled')

    expect(await errorMessage.count() + await disabledButton.count()).toBeGreaterThan(0)
  })

  test('should validate document permissions', async ({ page }) => {
    // 尝试选择没有权限的文档（假设存在只读文档）
    await page.click('[data-testid="multi-select-toggle"]')

    const readOnlyDoc = page.locator('.custom-tree-node.read-only:first-child .el-tree-node__content')
    if (await readOnlyDoc.count() > 0) {
      await readOnlyDoc.click({ modifiers: ['Control'] })

      // 尝试批量删除
      await page.click('button:has-text("批量删除")')

      // 验证权限错误提示
      await expect(page.locator('text=部分文档无权限操作')).toBeVisible()
    }
  })
})

test.describe('Batch Operations - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/writer/projects/test-project')
    await page.waitForLoadState('networkidle')
  })

  test('should handle large batch operations efficiently', async ({ page }) => {
    // 选择大量文档（假设有足够多的文档）
    await page.click('[data-testid="multi-select-toggle"]')

    // 模拟选择10个文档
    for (let i = 1; i <= 10; i++) {
      await page.click(`.el-tree-node__content:nth-child(${i})`, {
        modifiers: ['Control']
      })
    }

    const startTime = Date.now()

    // 执行批量删除
    await page.click('button:has-text("批量删除")')
    await page.click('.dialog-footer button:has-text("确认执行")')

    // 等待完成
    await page.waitForSelector('text=已完成', { timeout: 15000 })

    const endTime = Date.now()
    const duration = endTime - startTime

    // 验证操作在合理时间内完成（30秒内）
    expect(duration).toBeLessThan(30000)
  })

  test('should update UI responsively during operation', async ({ page }) => {
    await page.click('[data-testid="multi-select-toggle"]')
    await page.click('.el-tree-node__content:first-child', {
      modifiers: ['Control']
    })
    await page.click('button:has-text("批量删除")')
    await page.click('.dialog-footer button:has-text("确认执行")')

    // 验证进度对话框及时显示（1秒内）
    const progressVisible = await page.locator('.el-progress').isVisible({ timeout: 1000 })
    expect(progressVisible).toBe(true)
  })
})
