/**
 * 支付二次确认功能 E2E 测试
 *
 * 测试场景：
 * 1. 充值二次确认 - RechargeDialog
 * 2. 提现二次确认 - WithdrawDialog
 * 3. 会员购买二次确认 - MembershipView
 * 4. 取消会员二次确认 - MembershipView
 */

import { test, expect } from '@playwright/test'
import { login } from './helpers/auth-helper'

test.describe('支付二次确认功能', () => {
  // 每个测试前登录
  test.beforeEach(async ({ page }) => {
    await login(page, 'testuser', 'password123')
  })

  test.describe('充值二次确认', () => {
    test('应该显示充值二次确认对话框', async ({ page }) => {
      // 导航到钱包页面
      await page.goto('/wallet')
      await page.waitForLoadState('networkidle')

      // 点击充值按钮
      await page.click('button:has-text("充值")')

      // 等待充值对话框出现
      await expect(page.locator('.el-dialog:has-text("充值")')).toBeVisible()

      // 选择充值金额
      await page.click('.el-tag:has-text("¥100")')

      // 选择支付方式
      await page.click('label:has-text("支付宝")')

      // 点击确认充值按钮
      await page.click('button:has-text("确认充值")')

      // 验证二次确认对话框出现
      await expect(page.locator('.qy-modal:has-text("确认充值")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("请确认充值信息")')).toBeVisible()

      // 验证显示充值详情
      await expect(page.locator('.qy-modal:has-text("充值金额")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("¥100.00")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("支付方式")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("支付宝")')).toBeVisible()
    })

    test('应该能够取消充值二次确认', async ({ page }) => {
      // 导航到钱包页面
      await page.goto('/wallet')
      await page.waitForLoadState('networkidle')

      // 点击充值按钮
      await page.click('button:has-text("充值")')

      // 选择充值金额和支付方式
      await page.click('.el-tag:has-text("¥100")')
      await page.click('label:has-text("支付宝")')

      // 点击确认充值按钮
      await page.click('button:has-text("确认充值")')

      // 等待二次确认对话框出现
      await expect(page.locator('.qy-modal:has-text("确认充值")')).toBeVisible()

      // 点击取消按钮
      await page.click('.qy-modal button:has-text("取消")')

      // 验证二次确认对话框关闭
      await expect(page.locator('.qy-modal:has-text("确认充值")')).not.toBeVisible()

      // 验证充值对话框仍然打开
      await expect(page.locator('.el-dialog:has-text("充值")')).toBeVisible()
    })

    test('应该能够在二次确认后完成充值', async ({ page }) => {
      // 导航到钱包页面
      await page.goto('/wallet')
      await page.waitForLoadState('networkidle')

      // 点击充值按钮
      await page.click('button:has-text("充值")')

      // 选择充值金额和支付方式
      await page.click('.el-tag:has-text("¥100")')
      await page.click('label:has-text("支付宝")')

      // 点击确认充值按钮
      await page.click('button:has-text("确认充值")')

      // 等待二次确认对话框出现
      await expect(page.locator('.qy-modal:has-text("确认充值")')).toBeVisible()

      // 点击确认按钮
      const confirmButton = page.locator('.qy-modal button:has-text("确认")')
      await confirmButton.click()

      // 验证按钮显示加载状态
      await expect(confirmButton).toHaveAttribute('loading', '')
    })
  })

  test.describe('提现二次确认', () => {
    test('应该显示提现二次确认对话框', async ({ page }) => {
      // 导航到钱包页面
      await page.goto('/wallet')
      await page.waitForLoadState('networkidle')

      // 点击提现按钮
      await page.click('button:has-text("提现")')

      // 等待提现对话框出现
      await expect(page.locator('.el-dialog:has-text("申请提现")')).toBeVisible()

      // 输入提现金额
      await page.fill('input[role="spinbutton"]', '100')

      // 输入提现账户
      await page.fill('input[placeholder*="支付宝账号"]', 'alipay:test@example.com')

      // 点击确认提现按钮
      await page.click('button:has-text("确认提现")')

      // 验证二次确认对话框出现
      await expect(page.locator('.qy-modal:has-text("确认提现")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("请确认提现信息")')).toBeVisible()

      // 验证显示提现详情
      await expect(page.locator('.qy-modal:has-text("提现金额")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("¥100.00")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("手续费")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("实际到账")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("提现账户")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("alipay:test@example.com")')).toBeVisible()
    })

    test('应该能够取消提现二次确认', async ({ page }) => {
      // 导航到钱包页面
      await page.goto('/wallet')
      await page.waitForLoadState('networkidle')

      // 点击提现按钮
      await page.click('button:has-text("提现")')

      // 输入提现金额和账户
      await page.fill('input[role="spinbutton"]', '100')
      await page.fill('input[placeholder*="支付宝账号"]', 'alipay:test@example.com')

      // 点击确认提现按钮
      await page.click('button:has-text("确认提现")')

      // 等待二次确认对话框出现
      await expect(page.locator('.qy-modal:has-text("确认提现")')).toBeVisible()

      // 点击取消按钮
      await page.click('.qy-modal button:has-text("取消")')

      // 验证二次确认对话框关闭
      await expect(page.locator('.qy-modal:has-text("确认提现")')).not.toBeVisible()

      // 验证提现对话框仍然打开
      await expect(page.locator('.el-dialog:has-text("申请提现")')).toBeVisible()
    })

    test('应该能够显示正确的手续费和到账金额', async ({ page }) => {
      // 导航到钱包页面
      await page.goto('/wallet')
      await page.waitForLoadState('networkidle')

      // 点击提现按钮
      await page.click('button:has-text("提现")')

      // 输入提现金额（100元，手续费应该是1元）
      await page.fill('input[role="spinbutton"]', '100')
      await page.fill('input[placeholder*="支付宝账号"]', 'alipay:test@example.com')

      // 点击确认提现按钮
      await page.click('button:has-text("确认提现")')

      // 验证手续费计算（1%）
      await expect(page.locator('.qy-modal:has-text("¥1.00")')).toBeVisible()

      // 验证实际到账金额（99元）
      await expect(page.locator('.qy-modal:has-text("¥99.00")')).toBeVisible()
    })
  })

  test.describe('会员购买二次确认', () => {
    test('应该显示会员购买二次确认对话框', async ({ page }) => {
      // 导航到会员页面
      await page.goto('/membership')
      await page.waitForLoadState('networkidle')

      // 点击第一个套餐的开通按钮
      await page.click('.plan-card button:has-text("立即开通")')

      // 等待订阅对话框出现
      await expect(page.locator('.el-dialog:has-text("确认订阅")')).toBeVisible()

      // 选择支付方式
      await page.click('label:has-text("支付宝")')

      // 点击确认支付按钮
      await page.click('button:has-text("确认支付")')

      // 验证二次确认对话框出现
      await expect(page.locator('.qy-modal:has-text("确认订阅")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("请确认订阅信息")')).toBeVisible()

      // 验证显示订阅详情
      await expect(page.locator('.qy-modal:has-text("套餐名称")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("价格")')).toBeVisible()
      await expect(page.locator('.qy-modal:has-text("支付方式")')).toBeVisible()
    })

    test('应该能够取消会员购买二次确认', async ({ page }) => {
      // 导航到会员页面
      await page.goto('/membership')
      await page.waitForLoadState('networkidle')

      // 点击套餐的开通按钮
      await page.click('.plan-card button:has-text("立即开通")')

      // 选择支付方式
      await page.click('label:has-text("支付宝")')

      // 点击确认支付按钮
      await page.click('button:has-text("确认支付")')

      // 等待二次确认对话框出现
      await expect(page.locator('.qy-modal:has-text("确认订阅")')).toBeVisible()

      // 点击取消按钮
      await page.click('.qy-modal button:has-text("取消")')

      // 验证二次确认对话框关闭
      await expect(page.locator('.qy-modal:has-text("确认订阅")')).not.toBeVisible()

      // 验证订阅对话框仍然打开
      await expect(page.locator('.el-dialog:has-text("确认订阅")')).toBeVisible()
    })
  })

  test.describe('取消会员二次确认', () => {
    test('应该显示取消会员二次确认对话框', async ({ page }) => {
      // 导航到会员页面
      await page.goto('/membership')
      await page.waitForLoadState('networkidle')

      // 点击取消会员按钮（假设用户已有会员）
      const cancelButton = page.locator('button:has-text("取消会员")')
      if (await cancelButton.isVisible()) {
        await cancelButton.click()

        // 验证二次确认对话框出现
        await expect(page.locator('.qy-modal:has-text("取消会员")')).toBeVisible()
        await expect(page.locator('.qy-modal:has-text("确定要取消会员吗？")')).toBeVisible()

        // 验证对话框类型为危险类型
        await expect(page.locator('.qy-confirm-dialog__icon--danger')).toBeVisible()
      }
    })

    test('应该能够取消取消会员操作', async ({ page }) => {
      // 导航到会员页面
      await page.goto('/membership')
      await page.waitForLoadState('networkidle')

      // 点击取消会员按钮
      const cancelButton = page.locator('button:has-text("取消会员")')
      if (await cancelButton.isVisible()) {
        await cancelButton.click()

        // 等待二次确认对话框出现
        await expect(page.locator('.qy-modal:has-text("取消会员")')).toBeVisible()

        // 点击取消按钮
        await page.click('.qy-modal button:has-text("取消")')

        // 验证二次确认对话框关闭
        await expect(page.locator('.qy-modal:has-text("取消会员")')).not.toBeVisible()
      }
    })
  })

  test.describe('确认对话框样式和交互', () => {
    test('充值确认对话框应该显示警告图标', async ({ page }) => {
      // 导航到钱包页面并打开充值对话框
      await page.goto('/wallet')
      await page.waitForLoadState('networkidle')
      await page.click('button:has-text("充值")')
      await page.click('.el-tag:has-text("¥100")')
      await page.click('label:has-text("支付宝")')
      await page.click('button:has-text("确认充值")')

      // 验证警告图标显示
      await expect(page.locator('.qy-confirm-dialog__icon--warning')).toBeVisible()
    })

    test('取消会员确认对话框应该显示危险图标', async ({ page }) => {
      // 导航到会员页面
      await page.goto('/membership')
      await page.waitForLoadState('networkidle')

      const cancelButton = page.locator('button:has-text("取消会员")')
      if (await cancelButton.isVisible()) {
        await cancelButton.click()

        // 验证危险图标显示
        await expect(page.locator('.qy-confirm-dialog__icon--danger')).toBeVisible()
      }
    })

    test('确认对话框应该支持ESC键关闭', async ({ page }) => {
      // 导航到钱包页面并打开充值确认对话框
      await page.goto('/wallet')
      await page.waitForLoadState('networkidle')
      await page.click('button:has-text("充值")')
      await page.click('.el-tag:has-text("¥100")')
      await page.click('label:has-text("支付宝")')
      await page.click('button:has-text("确认充值")')

      // 验证确认对话框出现
      await expect(page.locator('.qy-modal:has-text("确认充值")')).toBeVisible()

      // 按ESC键
      await page.keyboard.press('Escape')

      // 验证确认对话框关闭
      await expect(page.locator('.qy-modal:has-text("确认充值")')).not.toBeVisible()
    })
  })
})
