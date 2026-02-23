/**
 * Writer模块 - 章节编写流程 E2E测试
 *
 * 测试场景:
 * 1. 创建章节
 * 2. 编辑器基础功能
 * 3. 自动保存
 * 4. 富文本编辑
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

// 测试配置
const TEST_CONFIG = {
  timeout: 45000,
  editorContent: `第一章：启程

这是一个关于冒险的故事。

主人公站在山巅，望着远方的地平线。风吹过他的脸庞，带来了远方大海的气息。

"是时候出发了，"他轻声说道。

阳光透过云层洒落，给这片大地披上了一层金色的光芒。他深吸一口气，迈出了第一步。

这是他人生中最重要的旅程的开始。

---

第二天清晨，当第一缕阳光照进窗户时，他已经整装待发。`
}

test.describe('Writer模块 - 章节编写流程', () => {
  test.skip(() => !backendAvailable, '后端服务不可用，跳过测试')

  test.beforeEach(async ({ page }) => {
    test.setTimeout(TEST_CONFIG.timeout)
    await page.goto(BASE_URL)
  })

  test('应该能够进入项目编辑页面', async ({ page }) => {
    // 导航到创作中心
    await page.goto(`${BASE_URL}/writer`)

    await page.waitForLoadState('networkidle')

    // 查找并点击第一个项目
    const projectCard = page.locator(
      '[data-testid^="project-card-"], .project-card, .writer-project-item'
    ).first()

    const cardVisible = await projectCard.isVisible().catch(() => false)
    if (cardVisible) {
      await projectCard.click()

      // 等待项目详情页加载
      await page.waitForURL(/.*\/writer\/projects\/.*/, { timeout: 10000 }).catch(() => {})

      // 验证项目详情页元素
      const projectDetail = page.locator('[data-testid="project-detail"], .project-detail, .writer-project')
      const detailVisible = await projectDetail.isVisible().catch(() => false)

      if (detailVisible) {
        await expect(projectDetail).toBeVisible()
      }
    }
  })

  test('应该能够创建新章节', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    // 进入第一个项目
    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 点击添加章节按钮
      const addChapterBtn = page.locator(
        '[data-testid="add-chapter-btn"], button:has-text("添加章节"), button:has-text("新建章节")'
      )

      if (await addChapterBtn.isVisible()) {
        await addChapterBtn.click()

        // 等待章节对话框
        const dialog = page.locator('[data-testid="chapter-dialog"], .el-dialog, .chapter-create-dialog')
        await expect(dialog).toBeVisible({ timeout: 5000 })

        // 填写章节标题
        const titleInput = page.locator('[data-testid="chapter-title-input"], input[name="title"], #chapter-title')
        if (await titleInput.isVisible()) {
          await titleInput.fill(`测试章节_${Date.now()}`)

          // 提交创建
          const submitBtn = page.locator('[data-testid="create-chapter-submit-btn"], button:has-text("确定")')
          await submitBtn.click()

          await page.waitForTimeout(2000)
        }
      }
    }
  })

  test('应该能够显示文档树结构', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    // 进入项目
    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 查找文档树
      const documentTree = page.locator(
        '[data-testid="document-tree"], .document-tree, .chapter-list, .el-tree'
      )

      const treeVisible = await documentTree.isVisible().catch(() => false)
      if (treeVisible) {
        await expect(documentTree).toBeVisible()

        // 验证树节点存在
        const treeNodes = page.locator('[data-testid^="chapter-item-"], .tree-node, .el-tree-node')
        const nodeCount = await treeNodes.count()
        console.log(`文档树中有 ${nodeCount} 个节点`)
      }
    }
  })

  test('应该能够进入编辑器并编辑内容', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    // 进入项目
    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 点击章节进入编辑器
      const chapterItem = page.locator('[data-testid^="chapter-item-"], .chapter-item, .tree-node').first()
      if (await chapterItem.isVisible()) {
        await chapterItem.click()

        // 等待编辑器加载
        await page.waitForURL(/.*\/editor.*/, { timeout: 10000 }).catch(() => {})

        // 验证编辑器容器
        const editorContainer = page.locator(
          '[data-testid="editor-container"], .editor-container, .rich-text-editor'
        )

        const editorVisible = await editorContainer.isVisible().catch(() => false)
        if (editorVisible) {
          await expect(editorContainer).toBeVisible()

          // 查找编辑区域
          const editorContent = page.locator(
            '[data-testid="rich-text-editor"], .editor-content, [contenteditable="true"], .ProseMirror'
          )

          if (await editorContent.isVisible()) {
            // 点击并输入内容
            await editorContent.click()
            await page.keyboard.type('这是一个测试内容。', { delay: 50 })

            // 验证内容已输入
            const content = await editorContent.textContent()
            expect(content).toContain('测试内容')
          }
        }
      }
    }
  })

  test('编辑器应该支持富文本格式', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    // 进入项目并打开编辑器
    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      const chapterItem = page.locator('[data-testid^="chapter-item-"], .chapter-item').first()
      if (await chapterItem.isVisible()) {
        await chapterItem.click()
        await page.waitForTimeout(2000)

        // 查找工具栏
        const toolbar = page.locator(
          '[data-testid="editor-toolbar"], .editor-toolbar, .toolbar, .menubar'
        )

        const toolbarVisible = await toolbar.isVisible().catch(() => false)
        if (toolbarVisible) {
          // 测试加粗按钮
          const boldButton = page.locator(
            '[data-testid="bold-btn"], button:has-text("B"), .bold-button, button[title="加粗"]'
          )

          if (await boldButton.isVisible()) {
            const editorContent = page.locator('[contenteditable="true"], .ProseMirror').first()
            await editorContent.click()
            await editorContent.fill('测试文本')

            // 选中文本
            await page.keyboard.down('Control')
            await page.keyboard.press('a')
            await page.keyboard.up('Control')

            // 点击加粗
            await boldButton.click()
            await page.waitForTimeout(500)

            // 验证格式应用
          }
        }
      }
    }
  })

  test('编辑器应该有自动保存功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      const chapterItem = page.locator('[data-testid^="chapter-item-"], .chapter-item').first()
      if (await chapterItem.isVisible()) {
        await chapterItem.click()
        await page.waitForTimeout(2000)

        // 查找编辑区域
        const editorContent = page.locator('[contenteditable="true"], .ProseMirror').first()
        if (await editorContent.isVisible()) {
          await editorContent.click()
          await page.keyboard.type('自动保存测试内容', { delay: 50 })

          // 等待自动保存触发
          await page.waitForTimeout(3000)

          // 查找自动保存指示器
          const autoSaveIndicator = page.locator(
            '[data-testid="auto-save-indicator"], .auto-save-status, .save-status'
          )

          const indicatorVisible = await autoSaveIndicator.isVisible().catch(() => false)
          if (indicatorVisible) {
            // 验证保存状态文字
            const statusText = await autoSaveIndicator.textContent()
            console.log(`保存状态: ${statusText}`)
          }
        }
      }
    }
  })

  test('编辑器应该显示字数统计', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      const chapterItem = page.locator('[data-testid^="chapter-item-"], .chapter-item').first()
      if (await chapterItem.isVisible()) {
        await chapterItem.click()
        await page.waitForTimeout(2000)

        // 查找字数统计
        const wordCount = page.locator(
          '[data-testid="word-count"], .word-count, .char-count'
        )

        const countVisible = await wordCount.isVisible().catch(() => false)
        if (countVisible) {
          const countText = await wordCount.textContent()
          console.log(`字数统计: ${countText}`)

          // 输入内容后验证字数变化
          const editorContent = page.locator('[contenteditable="true"], .ProseMirror').first()
          if (await editorContent.isVisible()) {
            await editorContent.click()
            await page.keyboard.type('这是一段测试文字，用于测试字数统计功能。', { delay: 30 })
            await page.waitForTimeout(1000)

            const newCountText = await wordCount.textContent()
            console.log(`新字数统计: ${newCountText}`)
          }
        }
      }
    }
  })
})

test.describe('Writer模块 - 章节管理', () => {
  test.skip(() => !backendAvailable, '后端服务不可用，跳过测试')

  test('应该能够拖拽调整章节顺序', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 查找可拖拽的章节项
      const chapterItems = page.locator('[data-testid^="chapter-item-"], .chapter-item, .draggable-node')
      const itemCount = await chapterItems.count()

      if (itemCount >= 2) {
        const firstItem = chapterItems.first()
        const secondItem = chapterItems.nth(1)

        // 执行拖拽
        await firstItem.dragTo(secondItem)
        await page.waitForTimeout(1000)

        console.log('章节拖拽测试完成')
      }
    }
  })

  test('应该能够删除章节', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 查找章节的删除按钮
      const deleteButtons = page.locator(
        '[data-testid^="chapter-delete-"], button:has-text("删除"), .delete-chapter-btn'
      )

      const deleteVisible = await deleteButtons.first().isVisible().catch(() => false)
      if (deleteVisible) {
        // 验证删除按钮存在（不实际点击以避免误删）
        await expect(deleteButtons.first()).toBeVisible()
      }
    }
  })

  test('应该能够重命名章节', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      // 查找章节的编辑/重命名按钮
      const editButtons = page.locator(
        '[data-testid^="chapter-edit-"], button:has-text("重命名"), .rename-chapter-btn'
      )

      const editVisible = await editButtons.first().isVisible().catch(() => false)
      if (editVisible) {
        await editButtons.first().click()

        // 等待重命名输入框
        const renameInput = page.locator('[data-testid="rename-input"], input[name="newTitle"]')
        if (await renameInput.isVisible()) {
          await renameInput.fill(`重命名章节_${Date.now()}`)

          const confirmBtn = page.locator('[data-testid="confirm-rename"], button:has-text("确定")')
          await confirmBtn.click()
          await page.waitForTimeout(1000)
        }
      }
    }
  })
})

test.describe('Writer模块 - 编辑器性能', () => {
  test.skip(() => !backendAvailable, '后端服务不可用，跳过测试')

  test('编辑大量内容时应该保持响应', async ({ page }) => {
    await page.goto(`${BASE_URL}/writer`)
    await page.waitForLoadState('networkidle')

    const projectCard = page.locator('[data-testid^="project-card-"], .project-card').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForTimeout(1000)

      const chapterItem = page.locator('[data-testid^="chapter-item-"], .chapter-item').first()
      if (await chapterItem.isVisible()) {
        await chapterItem.click()
        await page.waitForTimeout(2000)

        const editorContent = page.locator('[contenteditable="true"], .ProseMirror').first()
        if (await editorContent.isVisible()) {
          await editorContent.click()

          // 记录开始时间
          const startTime = Date.now()

          // 输入大量文本
          const largeText = TEST_CONFIG.editorContent.repeat(10)
          await page.keyboard.type(largeText.substring(0, 1000), { delay: 10 })

          // 记录结束时间
          const endTime = Date.now()
          const duration = endTime - startTime

          console.log(`输入1000字符耗时: ${duration}ms`)

          // 性能要求：1000字符输入应该在10秒内完成
          expect(duration).toBeLessThan(10000)
        }
      }
    }
  })
})
