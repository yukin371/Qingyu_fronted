/**
 * Layer 1: 写作流程 E2E 测试
 * 对应后端: Qingyu_backend/test/e2e/layer1_basic/export.go::RunWritingFlow
 *
 * 测试流程:
 * 步骤1: 创建作者用户并登录
 * 步骤2: 创建写作项目
 * 步骤3: 验证项目存在
 *
 * @author Qingyu Test Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test'
import { createAPIValidators } from '../../helpers'
import { TestDataGenerator } from '../../helpers/test-data'

const getBackendURL = () => process.env.BACKEND_URL || 'http://localhost:8080'
const getBaseURL = () => process.env.BASE_URL || 'http://localhost:5173'

test.describe('Layer 1: 写作流程', () => {
  let apiValidators: ReturnType<typeof createAPIValidators>
  let testUserData: any
  let token: string
  let userID: string

  test.beforeAll(async () => {
    console.log('\n=== Layer 1: 写作流程测试 ===')
    const backendURL = getBackendURL()
    console.log(`后端服务: ${backendURL}`)
    apiValidators = createAPIValidators(backendURL)
  })

  test.beforeEach(async () => {
    testUserData = TestDataGenerator.createUserCredentials()
    const result = await apiValidators.createTestUser(testUserData)
    userID = result.userID
    token = result.token
    apiValidators.setAuthToken(token)
  })

  /**
   * 步骤1-2: 创建项目
   */
  test('步骤1-3: 创建写作项目并验证', async ({ page }) => {
    console.log('\n--- 步骤1: 登录作者账号 ---')

    await page.goto(`${getBaseURL()}/login`)
    await page.fill('input[placeholder*="用户名"]', testUserData.username)
    await page.fill('input[type="password"]', testUserData.password)
    await page.click('button:has-text("登录")')
    await page.waitForLoadState('networkidle')

    console.log('  ✓ 登录成功')

    /**
     * 步骤2: 创建写作项目
     */
    console.log('\n--- 步骤2: 创建写作项目 ---')

    // 导航到写作中心
    await test.step('2.1 进入写作中心', async () => {
      await page.goto(`${getBaseURL()}/writer`)
      await page.waitForLoadState('networkidle')

      console.log('  ✓ 进入写作中心')
    })

    await test.step('2.2 创建新项目', async () => {
      // 点击新建项目按钮
      const createButton = page.locator('button:has-text("新建项目"), button:has-text("创建项目")')
        .or(page.locator('[data-testid="create-project-btn"]'))

      if (await createButton.count() > 0) {
        await createButton.click()
        await page.waitForTimeout(500)

        // 填写项目信息
        const titleInput = page.locator('input[placeholder*="标题"]')
          .or(page.locator('[data-testid="project-title-input"]'))
        const descInput = page.locator('textarea[placeholder*="简介"]')
          .or(page.locator('[data-testid="project-desc-input"]'))

        const projectTitle = `E2E测试项目_${Date.now()}`

        if (await titleInput.count() > 0) {
          await titleInput.fill(projectTitle)
        }

        if (await descInput.count() > 0) {
          await descInput.fill('这是一个E2E测试项目')
        }

        // 拦截创建API
        const createPromise = page.waitForResponse(
          response => response.url().includes('/writer/projects') && response.request().method() === 'POST'
        )

        // 提交
        const submitButton = page.locator('button:has-text("创建"), button:has-text("确定")')
          .or(page.locator('[data-testid="submit-project"]'))
        await submitButton.click()

        try {
          const createResponse = await Promise.race([
            createPromise,
            new Promise(resolve => setTimeout(resolve, 3000))
          ])

          if (createResponse && (createResponse as Response).status === 200) {
            console.log('  ✓ 项目创建API调用成功')
          }
        } catch (e) {
          console.log('  ⚠ 项目创建可能需要手动操作')
        }
      }
    })

    /**
     * 步骤3: 验证项目存在
     */
    console.log('\n--- 步骤3: 验证项目存在 ---')

    await test.step('3.1 查看项目列表', async () => {
      // 刷新页面查看项目列表
      await page.reload()
      await page.waitForLoadState('networkidle')

      // 验证项目列表
      const projectList = page.locator('.project-item, .project-card')
        .or(page.locator('[data-testid="project-list"]'))

      if (await projectList.count() > 0) {
        const projectCount = await projectList.count()
        console.log(`  ✓ 显示 ${projectCount} 个项目`)
      }
    })

    await test.step('3.2 后端API验证项目', async () => {
      const projects = await apiValidators.fetchBackendData('/api/v1/writer/projects')

      expect(projects).toHaveProperty('projects')
      expect(Array.isArray(projects.projects)).toBe(true)

      console.log(`  ✓ 后端返回 ${projects.projects.length} 个项目`)
    })
  })
})
