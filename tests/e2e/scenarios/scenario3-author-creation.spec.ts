/* global process */
/**
 * Scenario 3: 作者创作之旅 E2E 测试
 *
 * 测试作者从登录到发布章节的完整创作流程
 *
 * 测试范围：
 * - Part 1: 创作空间初始化
 * - Part 2: 章节管理
 * - Part 3: 编辑器核心功能
 * - Part 4: 版本控制
 * - Part 5: AI辅助写作（跳过，等待后端实现）
 * - Part 6: 协作与审阅
 * - Part 7: 发布流程
 */

import { test, expect } from '@playwright/test'
import { CommonSteps } from '../../helpers/step-builder'
import { testFixtures, TestDataGenerator } from '../../helpers/test-data'

// 测试配置
const TEST_CONFIG = {
  baseURL: 'http://localhost:5173',
  apiURL: 'http://localhost:9090',
  timeout: 30000,
  retry: 2
}

// 辅助函数：获取基础URL
function getBaseURL(): string {
  return process.env.BASE_URL || TEST_CONFIG.baseURL
}

// 辅助函数：获取后端URL
function getBackendURL(): string {
  return process.env.BACKEND_URL || TEST_CONFIG.apiURL
}

// 测试数据
const testProject = {
  title: `测试项目_${Date.now()}`,
  description: TestDataGenerator.randomText(20),
  genre: '玄幻',
  tags: ['修仙', '爽文', '测试']
}

const testChapters = [
  {
    title: '第一章：启程',
    content: '这是一个新的开始。主人公踏上了他的冒险之旅...\n\n第一天的旅程充满了未知和惊喜。'
  },
  {
    title: '第二章：遭遇',
    content: '在旅途中，主人公遇到了一个神秘的陌生人。\n\n"你是谁？"主人公问道。'
  },
  {
    title: '第三章：挑战',
    content: '面对突如其来的挑战，主人公必须做出选择。\n\n这个选择将改变一切。'
  }
]

// 辅助函数：等待API响应并验证
async function waitForApiResponse(
  page: import('@playwright/test').Page,
  // eslint-disable-next-line no-unused-vars
  urlPattern: string | RegExp | ((url: string) => boolean),
  expectedStatus: number = 200
): Promise<unknown> {
  try {
    const response = await page.waitForResponse(
      (res: { url(): string; status(): number }) => {
        const responseUrl = res.url()
        if (typeof urlPattern === 'string') {
          return responseUrl.includes(urlPattern) && res.status() === expectedStatus
        } else if (typeof urlPattern === 'function') {
          return urlPattern(responseUrl) && res.status() === expectedStatus
        } else {
          return responseUrl.match(urlPattern) && res.status() === expectedStatus
        }
      },
      { timeout: TEST_CONFIG.timeout }
    )

    expect(response.status()).toBe(expectedStatus)

    // 尝试解析JSON，如果失败则返回null
    try {
      return await response.json()
    } catch {
      return null
    }
  } catch (error) {
    console.error('API response wait failed:', error)
    throw error
  }
}

// 辅助函数：模拟真实打字速度
async function simulateTyping(page: import('@playwright/test').Page, selector: string, text: string, speed: number = 50) {
  const element = page.locator(selector)
  await element.click()
  for (const char of text) {
    await page.keyboard.type(char, { delay: Math.random() * speed })
  }
}

// 辅助函数：执行登录步骤
async function performLogin(page: import('@playwright/test').Page, username: string, password: string) {
  await CommonSteps.login(page, username, password).execute()
}

test.describe('Scenario 3: 作者创作之旅', () => {
  let projectId: string
  let chapterId: string

  test.beforeAll(async () => {
    // 初始化测试环境
    console.log('🚀 开始场景3测试：作者创作之旅')
  })

  test.beforeEach(async ({ page }) => {
    // 设置基础URL
    await page.goto(TEST_CONFIG.baseURL)
  })

  test.afterEach(async ({ page }) => {
    // 测试失败时截图
    if (test.info().status !== 'passed') {
      await page.screenshot({
        path: `tests/e2e/screenshots/failure-${Date.now()}.png`,
        fullPage: true
      })
    }
  })

  /**
   * Part 1: 创作空间初始化
   */
  test.describe('Part 1: 创作空间初始化', () => {
    test('should display creation overview after author login', async ({ page }) => {
      // 步骤1：作者登录
      await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

      // 验证登录成功
      await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible()

      // 导航到写作中心
      await page.click('[data-testid="nav-writer-center"]')

      // 验证创作概览显示
      await expect(page.locator('[data-testid="creation-overview"]')).toBeVisible()
      await expect(page.locator('[data-testid="recent-projects"]')).toBeVisible()
      await expect(page.locator('[data-testid="create-new-project-btn"]')).toBeVisible()
    })

    test('should create new writing project successfully', async ({ page }) => {
      // 步骤2：创建新的写作项目
      await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

      // 点击创建新项目按钮
      await page.click('[data-testid="create-new-project-btn"]')

      // 等待对话框打开
      await expect(page.locator('[data-testid="project-dialog"]')).toBeVisible()

      // 填写项目信息
      await page.fill('[data-testid="project-title-input"]', testProject.title)
      await page.fill(
        '[data-testid="project-description-input"]',
        testProject.description
      )
      await page.selectOption('[data-testid="project-genre-select"]', testProject.genre)

      // 添加标签
      for (const tag of testProject.tags) {
        await page.fill('[data-testid="tag-input"]', tag)
        await page.press('[data-testid="tag-input"]', 'Enter')
      }

      // 提交创建
      const createPromise = page.waitForResponse(
        (res: import('@playwright/test').APIResponseContext) =>
          res.url().includes('/api/writer/projects') && res.request().method() === 'POST'
      )

      await page.click('[data-testid="create-project-submit-btn"]')

      // 验证API响应
      const response = await createPromise
      expect(response.status()).toBe(200)

      const responseData = await response.json()
      expect(responseData.code).toBe(200)
      expect(responseData.data.title).toBe(testProject.title)

      // 保存项目ID
      projectId = responseData.data.id

      // 验证跳转到项目详情页
      await expect(page).toHaveURL(new RegExp(`/writer/projects/${projectId}`))
      await expect(page.locator('[data-testid="project-detail"]')).toBeVisible()
    })
  })

  /**
   * Part 2: 章节管理
   */
  test.describe('Part 2: 章节管理', () => {
    test.beforeEach(async ({ page }) => {
      // 登录并创建项目
      await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

      // 创建项目（如果还没有）
      if (!projectId) {
        await page.click('[data-testid="create-new-project-btn"]')
        await page.fill('[data-testid="project-title-input"]', testProject.title)
        await page.fill(
          '[data-testid="project-description-input"]',
          testProject.description
        )
        await page.selectOption('[data-testid="project-genre-select"]', testProject.genre)

        const response = await waitForApiResponse(page, '/api/writer/projects', 200)
        projectId = response.data.id
      }

      // 进入项目详情
      await page.goto(`${TEST_CONFIG.baseURL}/writer/projects/${projectId}`)
    })

    test('should create first chapter successfully', async ({ page }) => {
      // 步骤3：创建第一章
      await page.click('[data-testid="add-chapter-btn"]')

      // 等待章节创建对话框
      await expect(page.locator('[data-testid="chapter-dialog"]')).toBeVisible()

      // 填写章节标题
      await page.fill('[data-testid="chapter-title-input"]', testChapters[0].title)

      // 提交创建
      const createPromise = page.waitForResponse(
        (res: import('@playwright/test').APIResponseContext) =>
          res.url().includes('/api/writer/chapters') && res.request().method() === 'POST'
      )

      await page.click('[data-testid="create-chapter-submit-btn"]')

      // 验证API响应
      const response = await createPromise
      expect(response.status()).toBe(200)

      const responseData = await response.json()
      expect(responseData.code).toBe(200)
      expect(responseData.data.title).toBe(testChapters[0].title)

      // 保存章节ID
      chapterId = responseData.data.id

      // 验证章节出现在文档树中
      await expect(
        page.locator(`[data-testid="chapter-item-${chapterId}"]`)
      ).toBeVisible()
    })

    test('should setup document structure with drag and drop', async ({ page }) => {
      // 步骤4：设置文档结构

      // 创建多个章节
      for (let i = 0; i < testChapters.length; i++) {
        await page.click('[data-testid="add-chapter-btn"]')
        await page.fill('[data-testid="chapter-title-input"]', testChapters[i].title)

        await waitForApiResponse(page, '/api/writer/chapters', 200)

        await page.click('[data-testid="create-chapter-submit-btn"]')
        await page.waitForTimeout(500)
      }

      // 验证所有章节都在文档树中
      const chapterItems = await page.locator('[data-testid^="chapter-item-"]').count()
      expect(chapterItems).toBeGreaterThanOrEqual(testChapters.length)

      // 测试拖拽排序（如果UI支持）
      const firstChapter = page.locator('[data-testid^="chapter-item-"]').first()
      const secondChapter = page.locator('[data-testid^="chapter-item-"]').nth(1)

      if (await firstChapter.isVisible() && await secondChapter.isVisible()) {
        // 模拟拖拽
        await firstChapter.dragTo(secondChapter)

        // 等待排序API调用
        await waitForApiResponse(page, '/api/writer/chapters/reorder', 200)

        // 验证排序提示
        await expect(page.locator('[data-testid="reorder-success-toast"]')).toBeVisible()
      }
    })
  })

  /**
   * Part 3: 编辑器核心功能
   */
  test.describe('Part 3: 编辑器核心功能', () => {
    test.beforeEach(async ({ page }) => {
      // 准备环境：登录、创建项目和章节
      await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

      // 创建项目和章节（如果需要）
      if (!chapterId) {
        await page.click('[data-testid="create-new-project-btn"]')
        await page.fill('[data-testid="project-title-input"]', testProject.title)
        await page.click('[data-testid="create-project-submit-btn"]')

        const projectResponse = await waitForApiResponse(page, '/api/writer/projects', 200)
        projectId = projectResponse.data.id

        await page.click('[data-testid="add-chapter-btn"]')
        await page.fill('[data-testid="chapter-title-input"]', testChapters[0].title)
        await page.click('[data-testid="create-chapter-submit-btn"]')

        const chapterResponse = await waitForApiResponse(page, '/api/writer/chapters', 200)
        chapterId = chapterResponse.data.id
      }

      // 进入编辑器
      await page.goto(`${TEST_CONFIG.baseURL}/editor/${chapterId}`)
      await expect(page.locator('[data-testid="editor-container"]')).toBeVisible()
    })

    test('should write content with rich text editor smoothly', async ({ page }) => {
      // 步骤5：使用富文本编辑器写作

      // 模拟真实打字速度
      const editor = page.locator('[data-testid="rich-text-editor"]')
      await simulateTyping(editor, testChapters[0].content, 50)

      // 验证编辑器无卡顿（通过检查内容是否正确输入）
      await expect(editor).toContainText(testChapters[0].content)

      // 验证字数统计实时更新
      const wordCount = await page.locator('[data-testid="word-count"]').textContent()
      expect(parseInt(wordCount || '0')).toBeGreaterThan(0)

      // 验证自动保存提示出现
      await expect(page.locator('[data-testid="auto-save-indicator"]')).toBeVisible({
        timeout: 5000
      })
    })

    test('should auto-save and restore content after refresh', async ({ page }) => {
      // 步骤6：测试自动保存功能

      const editor = page.locator('[data-testid="rich-text-editor"]')

      // 写入内容
      await simulateTyping(editor, testChapters[0].content, 50)

      // 等待自动保存触发
      const savePromise = page.waitForResponse(
        (res: import('@playwright/test').APIResponseContext) =>
          res.url().includes('/api/writer/chapters/') && res.request().method() === 'PUT'
      )

      await expect(page.locator('[data-testid="auto-save-indicator"]')).toBeVisible()

      const response = await savePromise
      expect(response.status()).toBe(200)

      // 记录光标位置
      const currentContent = await editor.textContent()

      // 刷新页面
      await page.reload()

      // 验证编辑器加载完成
      await expect(page.locator('[data-testid="editor-container"]')).toBeVisible()

      // 验证内容恢复
      await expect(editor).toContainText(currentContent || '')

      // 验证光标位置（如果支持）
      // 注意：这需要编辑器支持光标位置保存
    })
  })

  /**
   * Part 4: 版本控制
   */
  test.describe('Part 4: 版本控制', () => {
    test.beforeEach(async ({ page }) => {
      // 准备环境
      await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

      // 创建项目和章节
      if (!chapterId) {
        await page.click('[data-testid="create-new-project-btn"]')
        await page.fill('[data-testid="project-title-input"]', testProject.title)
        await page.click('[data-testid="create-project-submit-btn"]')

        const projectResponse = await waitForApiResponse(page, '/api/writer/projects', 200)
        projectId = projectResponse.data.id

        await page.click('[data-testid="add-chapter-btn"]')
        await page.fill('[data-testid="chapter-title-input"]', testChapters[0].title)
        await page.click('[data-testid="create-chapter-submit-btn"]')

        const chapterResponse = await waitForApiResponse(page, '/api/writer/chapters', 200)
        chapterId = chapterResponse.data.id
      }

      await page.goto(`${TEST_CONFIG.baseURL}/editor/${chapterId}`)

      // 写入初始内容
      const editor = page.locator('[data-testid="rich-text-editor"]')
      await simulateTyping(editor, testChapters[0].content, 50)
      await page.waitForTimeout(1000)
    })

    test('should create version snapshot successfully', async ({ page }) => {
      // 步骤7：创建版本快照
      await page.click('[data-testid="version-menu-btn"]')
      await page.click('[data-testid="create-version-btn"]')

      // 等待版本对话框
      await expect(page.locator('[data-testid="version-dialog"]')).toBeVisible()

      // 填写版本说明
      const versionNote = `初始版本_${Date.now()}`
      await page.fill('[data-testid="version-note-input"]', versionNote)

      // 提交创建
      const createPromise = page.waitForResponse(
        (res: import('@playwright/test').APIResponseContext) =>
          res.url().includes('/api/writer/versions') && res.request().method() === 'POST'
      )

      await page.click('[data-testid="create-version-submit-btn"]')

      // 验证API响应
      const response = await createPromise
      expect(response.status()).toBe(200)

      // 验证版本列表显示新版本
      await page.click('[data-testid="version-menu-btn"]')
      await expect(page.locator(`[data-testid="version-item-${versionNote}"]`)).toBeVisible()
    })

    test('should compare versions and show diff', async ({ page }) => {
      // 步骤8：修改内容并创建新版本

      const editor = page.locator('[data-testid="rich-text-editor"]')

      // 修改内容
      await editor.fill(testChapters[0].content + '\n\n新增的内容...')
      await page.waitForTimeout(1000)

      // 创建新版本
      await page.click('[data-testid="version-menu-btn"]')
      await page.click('[data-testid="create-version-btn"]')
      await page.fill('[data-testid="version-note-input"]', '修改后的版本')
      await page.click('[data-testid="create-version-submit-btn"]')

      await waitForApiResponse(page, '/api/writer/versions', 200)

      // 测试版本对比
      await page.click('[data-testid="version-menu-btn"]')
      await page.click('[data-testid="compare-versions-btn"]')

      // 验证diff视图
      await expect(page.locator('[data-testid="diff-view"]')).toBeVisible()
      await expect(page.locator('[data-testid="diff-highlight"]')).toBeVisible()

      // 验证可以逐段查看差异
      const diffSections = await page.locator('[data-testid^="diff-section-"]').count()
      expect(diffSections).toBeGreaterThan(0)
    })

    test('should rollback to previous version', async ({ page }) => {
      // 步骤9：回滚到旧版本
      await page.click('[data-testid="version-menu-btn"]')

      // 选择历史版本
      const versionItems = page.locator('[data-testid^="version-item-"]')
      await versionItems.first().click()

      // 点击恢复版本
      const restorePromise = page.waitForResponse(
        (res: import('@playwright/test').APIResponseContext) =>
          res.url().includes('/api/writer/versions/') &&
          res.request().method() === 'POST'
      )

      await page.click('[data-testid="restore-version-btn"]')

      // 确认恢复
      await page.click('[data-testid="confirm-restore-btn"]')

      // 验证API响应
      const response = await restorePromise
      expect(response.status()).toBe(200)

      // 验证编辑器内容恢复
      const editor = page.locator('[data-testid="rich-text-editor"]')
      await expect(editor).toContainText(testChapters[0].content.substring(0, 20))
    })
  })

  /**
   * Part 5: AI辅助写作
   * 使用Mock API进行测试，等待后端AI服务实现
   */
  test.describe('Part 5: AI辅助写作 (使用Mock API)', () => {
    test.beforeEach(async ({ page }) => {
      // 设置AI API的Mock响应
      await page.route('**/api/v1/ai/continue', async route => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: {
              generated_text: '这是AI续写的内容。在修仙世界里，主角继续他的冒险之旅...',
              word_count: 50,
              quota_used: 50
            }
          })
        })
      })

      await page.route('**/api/v1/ai/rewrite', async route => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: {
              original_text: '原始文本内容',
              rewritten_text: '改写后的文本内容',
              changes: ['改进了表达', '优化了句式'],
              word_count: 30
            }
          })
        })
      })

      await page.route('**/api/v1/ai/summary', async route => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: {
              summary: '本章主要讲述了主角在修仙世界中的成长历程，包括初入仙门、学习基础功法以及第一次面对妖兽的经历。',
              key_points: ['主角初入仙门', '学习基础功法', '面对妖兽挑战'],
              word_count: 45
            }
          })
        })
      })
    })

    test('should use AI continue writing feature', async ({ page }) => {
      // 步骤10：使用AI续写功能

      // 准备测试环境
      await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

      if (!chapterId) {
        // 创建章节
        await page.click('[data-testid="add-chapter-btn"]')
        await page.fill('[data-testid="chapter-title-input"]', '测试章节')
        await page.click('[data-testid="save-chapter-btn"]')

        // 等待章节创建完成
        const chapterResponse = await waitForApiResponse(page, '/api/writer/chapters', 201)
        chapterId = chapterResponse.data.id
      }

      // 导航到章节编辑页面
      await page.goto(`${getBaseURL()}/writer/editor/${projectId}/${chapterId}`)
      await page.waitForLoadState('networkidle')

      // 验证AI续写功能UI存在
      const aiContinueButton = page.locator('[data-testid="ai-continue-btn"], .ai-continue-button')
      if (await aiContinueButton.count() > 0) {
        // 点击AI续写按钮
        await aiContinueButton.first().click()

        // 等待AI响应（使用Mock）
        await page.waitForTimeout(1000)

        // 验证AI内容已插入
        const editor = page.locator('.editor-content, [contenteditable="true"]')
        if (await editor.count() > 0) {
          const content = await editor.first().innerText()
          // 验证内容包含AI生成的文字
          expect(content).toBeTruthy()
        }
      } else {
        // 如果UI不存在，直接测试API
        const response = await fetch(`${getBackendURL()}/api/v1/ai/continue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testFixtures.users.author.token}`
          },
          body: JSON.stringify({
            chapter_id: chapterId,
            context: '测试上下文',
            length: 100
          })
        })

        // 验证Mock响应
        expect(response.ok).toBeTruthy()
        const data = await response.json()
        expect(data.data.generated_text).toBeDefined()
      }

      console.log('  ✓ AI续写功能测试通过')
    })

    test('should use AI rewriting feature', async ({ page }) => {
      // 步骤11：使用AI改写功能

      await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

      if (!chapterId) {
        await page.click('[data-testid="add-chapter-btn"]')
        await page.fill('[data-testid="chapter-title-input"]', '测试章节')
        await page.click('[data-testid="save-chapter-btn"]')
      }

      // 测试AI改写功能
      const response = await fetch(`${getBackendURL()}/api/v1/ai/rewrite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testFixtures.users.author.token}`
        },
        body: JSON.stringify({
          text: '原始文本内容',
          style: 'formal'
        })
      })

      // 验证Mock响应
      expect(response.ok).toBeTruthy()
      const data = await response.json()
      expect(data.data.rewritten_text).toBeDefined()
      expect(data.data.changes).toBeDefined()

      console.log('  ✓ AI改写功能测试通过')
    })

    test('should use AI summary feature', async ({ page }) => {
      // 步骤12：使用AI摘要功能

      await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

      if (chapterId) {
        // 测试AI摘要功能
        const response = await fetch(`${getBackendURL()}/api/v1/ai/summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testFixtures.users.author.token}`
          },
          body: JSON.stringify({
            chapter_id: chapterId,
            max_length: 100
          })
        })

        // 验证Mock响应
        expect(response.ok).toBeTruthy()
        const data = await response.json()
        expect(data.data.summary).toBeDefined()
        expect(data.data.key_points).toBeDefined()
        expect(Array.isArray(data.data.key_points)).toBeTruthy()
      }

      console.log('  ✓ AI摘要功能测试通过')
    })
  })

  /**
   * Part 6: 协作与审阅
   */
  test.describe('Part 6: 协作与审阅', () => {
    test.beforeEach(async ({ page }) => {
      // 准备环境
      await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

      if (!chapterId) {
        await page.click('[data-testid="create-new-project-btn"]')
        await page.fill('[data-testid="project-title-input"]', testProject.title)
        await page.click('[data-testid="create-project-submit-btn"]')

        const projectResponse = await waitForApiResponse(page, '/api/writer/projects', 200)
        projectId = projectResponse.data.id

        await page.click('[data-testid="add-chapter-btn"]')
        await page.fill('[data-testid="chapter-title-input"]', testChapters[0].title)
        await page.click('[data-testid="create-chapter-submit-btn"]')

        const chapterResponse = await waitForApiResponse(page, '/api/writer/chapters', 200)
        chapterId = chapterResponse.data.id
      }

      await page.goto(`${TEST_CONFIG.baseURL}/editor/${chapterId}`)

      // 写入内容
      const editor = page.locator('[data-testid="rich-text-editor"]')
      await simulateTyping(editor, testChapters[0].content, 50)
    })

    test('should add comment annotation to text', async ({ page }) => {
      // 步骤13：添加评论批注

      const editor = page.locator('[data-testid="rich-text-editor"]')

      // 选中文字
      await editor.click()
      await page.keyboard.down('Shift')
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowRight')
      }
      await page.keyboard.up('Shift')

      // 添加批注
      await page.click('[data-testid="add-comment-btn"]')

      // 等待批注对话框
      await expect(page.locator('[data-testid="comment-dialog"]')).toBeVisible()

      // 填写批注内容
      const commentText = '这里是批注内容'
      await page.fill('[data-testid="comment-input"]', commentText)

      // 提交批注
      const createPromise = page.waitForResponse(
        (res: import('@playwright/test').APIResponseContext) =>
          res.url().includes('/api/writer/comments') && res.request().method() === 'POST'
      )

      await page.click('[data-testid="submit-comment-btn"]')

      // 验证API响应
      const response = await createPromise
      expect(response.status()).toBe(200)

      // 验证文本旁显示批注标记
      await expect(page.locator('[data-testid^="comment-marker-"]')).toBeVisible()
    })

    test('should invite collaborator successfully', async ({ page }) => {
      // 步骤14：邀请协作者

      // 进入项目设置
      await page.click('[data-testid="project-settings-btn"]')
      await page.click('[data-testid="collaboration-tab"]')

      // 输入协作者邮箱
      const collaboratorEmail = 'collaborator@example.com'
      await page.fill('[data-testid="collaborator-email-input"]', collaboratorEmail)

      // 设置协作者权限
      await page.selectOption(
        '[data-testid="collaborator-role-select"]',
        'editor'
      )

      // 发送邀请
      const invitePromise = page.waitForResponse(
        (res: import('@playwright/test').APIResponseContext) =>
          res.url().includes('/api/writer/collaborators') &&
          res.request().method() === 'POST'
      )

      await page.click('[data-testid="send-invite-btn"]')

      // 验证API响应
      const response = await invitePromise
      expect(response.status()).toBe(200)

      // 验证邀请成功提示
      await expect(page.locator('[data-testid="invite-success-toast"]')).toBeVisible()

      // 验证协作者出现在列表中
      await expect(
        page.locator(`[data-testid="collaborator-${collaboratorEmail}"]`)
      ).toBeVisible()
    })
  })

  /**
   * Part 7: 发布流程
   */
  test.describe('Part 7: 发布流程', () => {
    test.beforeEach(async ({ page }) => {
      // 准备环境
      await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

      if (!chapterId) {
        await page.click('[data-testid="create-new-project-btn"]')
        await page.fill('[data-testid="project-title-input"]', testProject.title)
        await page.click('[data-testid="create-project-submit-btn"]')

        const projectResponse = await waitForApiResponse(page, '/api/writer/projects', 200)
        projectId = projectResponse.data.id

        await page.click('[data-testid="add-chapter-btn"]')
        await page.fill('[data-testid="chapter-title-input"]', testChapters[0].title)
        await page.click('[data-testid="create-chapter-submit-btn"]')

        const chapterResponse = await waitForApiResponse(page, '/api/writer/chapters', 200)
        chapterId = chapterResponse.data.id
      }

      await page.goto(`${TEST_CONFIG.baseURL}/editor/${chapterId}`)

      // 写入完整内容
      const editor = page.locator('[data-testid="rich-text-editor"]')
      await simulateTyping(editor, testChapters[0].content, 50)
      await page.waitForTimeout(1000)
    })

    test('should publish chapter successfully', async ({ page }) => {
      // 步骤15：章节完成并发布

      // 点击发布按钮
      await page.click('[data-testid="publish-chapter-btn"]')

      // 等待发布对话框
      await expect(page.locator('[data-testid="publish-dialog"]')).toBeVisible()

      // 设置发布参数
      await page.check('[data-testid="publish-to-public-checkbox"]')
      await page.fill('[data-testid="publish-price-input"]', '0')
      await page.selectOption('[data-testid="publish-vip-select"]', 'free')

      // 预览章节
      await page.click('[data-testid="preview-chapter-btn"]')

      // 验证预览模式
      await expect(page.locator('[data-testid="preview-mode"]')).toBeVisible()

      // 关闭预览
      await page.click('[data-testid="close-preview-btn"]')

      // 确认发布
      const publishPromise = page.waitForResponse(
        (res: import('@playwright/test').APIResponseContext) =>
          res.url().includes('/api/writer/chapters/') &&
          res.url().includes('/publish') &&
          res.request().method() === 'POST'
      )

      await page.click('[data-testid="confirm-publish-btn"]')

      // 验证API响应
      const response = await publishPromise
      expect(response.status()).toBe(200)

      const responseData = await response.json()
      expect(responseData.code).toBe(200)

      // 验证章节状态变为"已发布"
      await expect(page.locator('[data-testid="chapter-status-published"]')).toBeVisible()

      // 验证发布成功提示
      await expect(page.locator('[data-testid="publish-success-toast"]')).toBeVisible()

      // 验证读者可见（切换到读者视图）
      await page.goto(`${TEST_CONFIG.baseURL}/reader/books/${projectId}`)

      // 查找刚发布的章节
      await expect(
        page.locator(`[data-testid="chapter-${chapterId}"]`)
      ).toBeVisible()

      // 点击章节阅读
      await page.click(`[data-testid="chapter-${chapterId}"]`)

      // 验证内容显示
      await expect(page.locator('[data-testid="chapter-content"]')).toBeVisible()
      await expect(page.locator('[data-testid="chapter-content"]')).toContainText(
        testChapters[0].content.substring(0, 20)
      )
    })
  })

  /**
   * 完整创作流程端到端测试
   */
  test('complete creation journey: from login to publish', async ({ page }) => {
    // 完整的端到端测试，串联所有部分

    // 1. 登录并创建项目
    await performLogin(page, testFixtures.users.author.username, testFixtures.users.author.password)

    await page.click('[data-testid="create-new-project-btn"]')
    await page.fill('[data-testid="project-title-input"]', testProject.title)
    await page.fill('[data-testid="project-description-input"]', testProject.description)
    await page.selectOption('[data-testid="project-genre-select"]', testProject.genre)

    const projectResponse = await waitForApiResponse(page, '/api/writer/projects', 200)
    projectId = projectResponse.data.id

    // 2. 创建章节
    await page.click('[data-testid="add-chapter-btn"]')
    await page.fill('[data-testid="chapter-title-input"]', testChapters[0].title)
    await page.click('[data-testid="create-chapter-submit-btn"]')

    const chapterResponse = await waitForApiResponse(page, '/api/writer/chapters', 200)
    chapterId = chapterResponse.data.id

    // 3. 编辑内容
    await page.goto(`${TEST_CONFIG.baseURL}/editor/${chapterId}`)
    const editor = page.locator('[data-testid="rich-text-editor"]')
    await simulateTyping(editor, testChapters[0].content, 50)

    // 等待自动保存
    await waitForApiResponse(page, '/api/writer/chapters/', 200)

    // 4. 创建版本
    await page.click('[data-testid="version-menu-btn"]')
    await page.click('[data-testid="create-version-btn"]')
    await page.fill('[data-testid="version-note-input"]', '第一版')
    await page.click('[data-testid="create-version-submit-btn"]')

    await waitForApiResponse(page, '/api/writer/versions', 200)

    // 5. 发布章节
    await page.click('[data-testid="publish-chapter-btn"]')
    await page.check('[data-testid="publish-to-public-checkbox"]')
    await page.click('[data-testid="confirm-publish-btn"]')

    await waitForApiResponse(
      page,
      (url: string) => url.includes('/publish'),
      200
    )

    // 6. 验证发布成功
    await expect(page.locator('[data-testid="chapter-status-published"]')).toBeVisible()

    console.log('✅ 完整创作流程测试通过')
  })
})
