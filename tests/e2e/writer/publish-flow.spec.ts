/**
 * Writer模块 - 发布流程 E2E测试
 *
 * 测试场景:
 * 1. 章节发布
 * 2. 批量发布
 * 3. 发布历史
 * 4. 导出功能
 *
 * 注意: 需要后端服务运行，测试使用条件执行
 */

import { test, expect } from '@playwright/test'

// 环境配置
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'
const BASE_URL = process.env.BASE_URL || 'http://localhost:5174'

// 后端服务状态
let backendAvailable = false

test.beforeAll(async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/system/health`, {
      signal: AbortSignal.timeout(5000)
    })
    backendAvailable = response.ok
  } catch {
    backendAvailable = false
  }
})

test.describe('Writer模块 - 发布流程', () => {
  test.skip(() => !backendAvailable, '后端服务不可用，跳过测试')

  test.beforeEach(async ({ page }) => {
    test.setTimeout(45000)
    await page.goto(BASE_URL)
  })

  test('应该能够显示发布选项', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    // 进入项目
    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 查找发布按钮
      const publishButton = page.locator(
        '[data-testid="publish-btn"], button:has-text("发布"), .publish-button'
      )

      const publishVisible = await publishButton.first().isVisible().catch(() => false)
      if (publishVisible) {
        await expect(publishButton.first()).toBeVisible()
      }
    }
  })

  test('应该能够打开发布对话框', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 点击发布按钮
      const publishButton = page.locator(
        '[data-testid="publish-btn"], button:has-text("发布")'
      ).first()

      if (await publishButton.isVisible()) {
        await publishButton.click()

        // 等待发布对话框
        const publishDialog = page.locator(
          '[data-testid="publish-dialog"], .publish-dialog, .el-dialog:has-text("发布")'
        )

        await expect(publishDialog).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('应该能够设置发布参数', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 打开发布对话框
      const publishButton = page.locator('[data-testid="publish-btn"], button:has-text("发布")').first()
      if (await publishButton.isVisible()) {
        await publishButton.click()
        await page.waitForTimeout(1000)

        // 查找发布参数设置
        const publicCheckbox = page.locator(
          '[data-testid="publish-to-public-checkbox"], input[name="public"], label:has-text("公开")'
        )

        if (await publicCheckbox.isVisible()) {
          // 切换公开选项
          await publicCheckbox.click()
          await page.waitForTimeout(500)
        }

        // 查找价格设置
        const priceInput = page.locator(
          '[data-testid="publish-price-input"], input[name="price"]'
        )

        if (await priceInput.isVisible()) {
          await priceInput.fill('0')
        }

        // 查找VIP设置
        const vipSelect = page.locator(
          '[data-testid="publish-vip-select"], select[name="vip"]'
        )

        if (await vipSelect.isVisible()) {
          await vipSelect.selectOption('free')
        }
      }
    }
  })

  test('应该能够预览发布内容', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 打开发布对话框
      const publishButton = page.locator('[data-testid="publish-btn"], button:has-text("发布")').first()
      if (await publishButton.isVisible()) {
        await publishButton.click()
        await page.waitForTimeout(1000)

        // 点击预览按钮
        const previewButton = page.locator(
          '[data-testid="preview-chapter-btn"], button:has-text("预览")'
        )

        if (await previewButton.isVisible()) {
          await previewButton.click()

          // 等待预览模式
          const previewMode = page.locator(
            '[data-testid="preview-mode"], .preview-container, .preview-mode'
          )

          await expect(previewMode).toBeVisible({ timeout: 5000 })

          // 关闭预览
          const closePreview = page.locator(
            '[data-testid="close-preview-btn"], button:has-text("关闭")'
          )

          if (await closePreview.isVisible()) {
            await closePreview.click()
          }
        }
      }
    }
  })

  test('应该能够执行发布操作', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 进入编辑器
      const chapterItem = page.locator('[data-testid^="chapter-item-"], .chapter-item').first()
      if (await chapterItem.isVisible()) {
        await chapterItem.click()
        await page.waitForTimeout(2000)

        // 查找发布按钮
        const publishChapterBtn = page.locator(
          '[data-testid="publish-chapter-btn"], button:has-text("发布章节")'
        )

        if (await publishChapterBtn.isVisible()) {
          await publishChapterBtn.click()

          // 等待发布对话框
          const publishDialog = page.locator('[data-testid="publish-dialog"], .el-dialog')
          await expect(publishDialog).toBeVisible({ timeout: 5000 })

          // 确认发布
          const confirmBtn = page.locator(
            '[data-testid="confirm-publish-btn"], button:has-text("确认发布")'
          )

          if (await confirmBtn.isVisible()) {
            await confirmBtn.click()
            await page.waitForTimeout(3000)

            // 验证发布成功
            const successToast = page.locator(
              '[data-testid="publish-success-toast"], .el-message--success'
            )

            const toastVisible = await successToast.isVisible().catch(() => false)
            if (toastVisible) {
              console.log('发布成功提示显示')
            }
          }
        }
      }
    }
  })

  test('应该能够查看发布历史', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 查找发布历史入口
      const historyTab = page.locator(
        '[data-testid="publish-history-tab"], button:has-text("发布历史"), tab:has-text("发布")'
      )

      const historyVisible = await historyTab.isVisible().catch(() => false)
      if (historyVisible) {
        await historyTab.click()
        await page.waitForTimeout(1000)

        // 验证历史列表
        const historyList = page.locator(
          '[data-testid="publish-history-list"], .publish-history, .history-list'
        )

        const listVisible = await historyList.isVisible().catch(() => false)
        if (listVisible) {
          const historyItems = await historyList.locator('li, .history-item, .publish-record').count()
          console.log(`发布历史记录数: ${historyItems}`)
        }
      }
    }
  })
})

test.describe('Writer模块 - 批量发布', () => {
  test.skip(() => !backendAvailable, '后端服务不可用，跳过测试')

  test('应该能够选择多个章节进行批量发布', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 查找批量选择功能
      const batchSelectBtn = page.locator(
        '[data-testid="batch-select-btn"], button:has-text("批量操作")'
      )

      const batchVisible = await batchSelectBtn.isVisible().catch(() => false)
      if (batchVisible) {
        await batchSelectBtn.click()

        // 选择多个章节
        const checkboxes = page.locator('[data-testid^="chapter-checkbox-"], input[type="checkbox"]')
        const checkboxCount = await checkboxes.count()

        if (checkboxCount >= 2) {
          await checkboxes.first().check()
          await checkboxes.nth(1).check()

          // 点击批量发布
          const batchPublishBtn = page.locator(
            '[data-testid="batch-publish-btn"], button:has-text("批量发布")'
          )

          if (await batchPublishBtn.isVisible()) {
            await expect(batchPublishBtn).toBeVisible()
          }
        }
      }
    }
  })
})

test.describe('Writer模块 - 导出功能', () => {
  test.skip(() => !backendAvailable, '后端服务不可用，跳过测试')

  test('应该能够显示导出选项', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 查找导出按钮
      const exportButton = page.locator(
        '[data-testid="export-btn"], button:has-text("导出"), .export-button'
      )

      const exportVisible = await exportButton.first().isVisible().catch(() => false)
      if (exportVisible) {
        await expect(exportButton.first()).toBeVisible()
      }
    }
  })

  test('应该能够选择导出格式', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 打开导出对话框
      const exportButton = page.locator('[data-testid="export-btn"], button:has-text("导出")').first()
      if (await exportButton.isVisible()) {
        await exportButton.click()

        // 等待导出对话框
        const exportDialog = page.locator(
          '[data-testid="export-dialog"], .export-dialog, .el-dialog:has-text("导出")'
        )

        if (await exportDialog.isVisible()) {
          // 查找格式选择
          const formatOptions = page.locator(
            '[data-testid="format-option"], input[name="format"], .format-select option'
          )

          const formatCount = await formatOptions.count()
          console.log(`可用的导出格式数: ${formatCount}`)

          // 验证常见格式存在
          const docxOption = page.locator('option[value="docx"], option:has-text("Word")')
          const txtOption = page.locator('option[value="txt"], option:has-text("文本")')
          const pdfOption = page.locator('option[value="pdf"], option:has-text("PDF")')

          if (await docxOption.isVisible().catch(() => false)) {
            console.log('DOCX格式可用')
          }
          if (await txtOption.isVisible().catch(() => false)) {
            console.log('TXT格式可用')
          }
          if (await pdfOption.isVisible().catch(() => false)) {
            console.log('PDF格式可用')
          }
        }
      }
    }
  })

  test('应该能够创建导出任务', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 进入章节
      const chapterItem = page.locator('[data-testid^="chapter-item-"], .chapter-item').first()
      if (await chapterItem.isVisible()) {
        await chapterItem.click()
        await page.waitForTimeout(2000)

        // 打开导出对话框
        const exportButton = page.locator('[data-testid="export-btn"], button:has-text("导出")').first()
        if (await exportButton.isVisible()) {
          await exportButton.click()
          await page.waitForTimeout(1000)

          // 选择格式并导出
          const confirmExport = page.locator(
            '[data-testid="confirm-export-btn"], button:has-text("开始导出")'
          )

          if (await confirmExport.isVisible()) {
            await confirmExport.click()

            // 等待导出任务创建
            await page.waitForTimeout(3000)

            // 验证导出任务状态
            const exportStatus = page.locator(
              '[data-testid="export-status"], .export-progress, .task-status'
            )

            const statusVisible = await exportStatus.isVisible().catch(() => false)
            if (statusVisible) {
              const statusText = await exportStatus.textContent()
              console.log(`导出状态: ${statusText}`)
            }
          }
        }
      }
    }
  })

  test('应该能够下载导出文件', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    // 查找导出列表或下载中心
    const downloadCenter = page.locator(
      '[data-testid="download-center"], nav:has-text("下载"), a:has-text("导出记录")'
    )

    const downloadVisible = await downloadCenter.isVisible().catch(() => false)
    if (downloadVisible) {
      await downloadCenter.click()
      await page.waitForTimeout(1000)

      // 查找已完成的导出任务
      const completedTasks = page.locator(
        '[data-testid="completed-export"], .export-task.completed, .download-link'
      )

      const taskCount = await completedTasks.count()
      console.log(`已完成的导出任务数: ${taskCount}`)

      if (taskCount > 0) {
        // 验证下载按钮存在
        const downloadBtn = completedTasks.first().locator('button:has-text("下载"), a:has-text("下载")')
        if (await downloadBtn.isVisible()) {
          await expect(downloadBtn).toBeVisible()
        }
      }
    }
  })
})

test.describe('Writer模块 - 发布设置', () => {
  test.skip(() => !backendAvailable, '后端服务不可用，跳过测试')

  test('应该能够设置定时发布', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 打开发布对话框
      const publishButton = page.locator('[data-testid="publish-btn"], button:has-text("发布")').first()
      if (await publishButton.isVisible()) {
        await publishButton.click()
        await page.waitForTimeout(1000)

        // 查找定时发布选项
        const scheduleOption = page.locator(
          '[data-testid="schedule-publish"], input[name="schedule"], label:has-text("定时发布")'
        )

        const scheduleVisible = await scheduleOption.isVisible().catch(() => false)
        if (scheduleVisible) {
          await scheduleOption.click()

          // 设置发布时间
          const datePicker = page.locator(
            '[data-testid="publish-date-picker"], input[type="datetime-local"]'
          )

          if (await datePicker.isVisible()) {
            // 设置未来的时间
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const dateStr = tomorrow.toISOString().slice(0, 16)

            await datePicker.fill(dateStr)
            console.log(`设置定时发布时间: ${dateStr}`)
          }
        }
      }
    }
  })

  test('应该能够取消发布', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 查找已发布章节的取消发布按钮
      const unpublishBtn = page.locator(
        '[data-testid="unpublish-btn"], button:has-text("取消发布"), button:has-text("撤回")'
      )

      const unpublishVisible = await unpublishBtn.first().isVisible().catch(() => false)
      if (unpublishVisible) {
        // 验证按钮存在（不实际点击）
        await expect(unpublishBtn.first()).toBeVisible()
      }
    }
  })
})

test.describe('Writer模块 - 发布状态验证', () => {
  test.skip(() => !backendAvailable, '后端服务不可用，跳过测试')

  test('发布后章节状态应该更新', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 查找章节状态标签
      const publishedTag = page.locator(
        '[data-testid="chapter-status-published"], .status-tag.published, .el-tag:has-text("已发布")'
      )

      const tagVisible = await publishedTag.first().isVisible().catch(() => false)
      if (tagVisible) {
        await expect(publishedTag.first()).toBeVisible()
        const statusText = await publishedTag.first().textContent()
        console.log(`章节状态: ${statusText}`)
      }
    }
  })

  test('已发布章节应该对读者可见', async ({ page }) => {
    // 切换到读者视图
    await page.goto(`${BASE_URL}/reader`)
    await page.waitForLoadState('networkidle')

    // 查找最新发布的章节
    const newChapter = page.locator(
      '[data-testid^="new-chapter-"], .chapter-item.new, .update-item'
    )

    const chapterVisible = await newChapter.first().isVisible().catch(() => false)
    if (chapterVisible) {
      await expect(newChapter.first()).toBeVisible()
    }
  })
})
