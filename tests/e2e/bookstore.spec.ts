/**
 * 书城功能E2E测试
 * 测试书籍浏览、详情查看等核心流程
 */

import { test, expect } from '@playwright/test'
import { createBrowserSession } from '../helpers/browser-session'
import { ActorFactory } from '../helpers/actor-factory'
import { ScenarioBuilder } from '../helpers/step-builder'
import { testFixtures } from '../helpers/test-data'

test.describe('书城功能测试', () => {
  let session: any

  test.beforeEach(async ({ page, context, browser }) => {
    session = await createBrowserSession(page, context, browser)
  })

  test('访客可以浏览书籍列表', async ({ page }) => {
    const guest = ActorFactory.createGuest('Guest User', session)

    await ScenarioBuilder
      .create('访客浏览书籍列表')
      .step(builder => builder
        .addNavigationStep('/bookstore/books', page)
        .addWaitStep('.book-card, .book-list-item', page)
        .addAssertionStep('.book-card, .book-list-item', 'visible', page)
      )
      .build()
  })

  test('访客可以查看书籍详情', async ({ page }) => {
    const testBook = testFixtures.books.novel

    await ScenarioBuilder
      .create('访客查看书籍详情')
      .step(builder => builder
        .addNavigationStep(`/bookstore/books/${testBook.id}`, page)
        .addWaitStep('[data-testid="book-detail"]', page)
        .addAssertionStep('[data-testid="book-title"]', 'visible', page)
        .addTextAssertionStep('[data-testid="book-title"]', testBook.title, page)
      )
      .build()
  })

  test('访客可以搜索书籍', async ({ page }) => {
    await ScenarioBuilder
      .create('访客搜索书籍')
      .step(builder => builder
        .addNavigationStep('/bookstore/books', page)
        .addWaitStep('.filter-bar', page)
        .addFillStep('input[placeholder*="搜索"]', '测试', page)
        .addClickStep('button[type="submit"]', page)
        .addWaitStep('.search-results', page)
      )
      .build()
  })

  test('访客可以使用分类筛选', async ({ page }) => {
    await ScenarioBuilder
      .create('访客使用分类筛选')
      .step(builder => builder
        .addNavigationStep('/bookstore/books', page)
        .addWaitStep('.filter-bar', page)
        .addClickStep('.el-select', page)
        .addClickStep('.el-option:has-text("玄幻")', page)
        .addWaitStep('.book-card', page)
      )
      .build()
  })
})

test.describe('用户认证流程测试', () => {
  let session: any

  test.beforeEach(async ({ page, context, browser }) => {
    session = await createBrowserSession(page, context, browser)
  })

  test('用户可以注册新账号', async ({ page }) => {
    const newUser = testFixtures.generator.createUserCredentials()

    await ScenarioBuilder
      .create('用户注册')
      .step(builder => builder
        .addNavigationStep('/register', page)
        .addWaitStep('.auth-form', page)
        .addCustomStep(async () => {
          // 切换到注册tab
          await page.click('text=注册')
          await page.waitForTimeout(500)
        }, '切换到注册tab')
        .addCustomStep(async () => {
          // 填写用户名 - 使用可见的元素
          const visibleInputs = await page.locator('input[placeholder*="用户名"]').all()
          for (const input of visibleInputs) {
            if (await input.isVisible()) {
              await input.fill(newUser.username)
              break
            }
          }
        }, '填写用户名')
        .addCustomStep(async () => {
          // 填写邮箱
          const visibleInputs = await page.locator('input[placeholder*="邮箱"], input[placeholder*="电子"]').all()
          for (const input of visibleInputs) {
            if (await input.isVisible()) {
              await input.fill(newUser.email)
              break
            }
          }
        }, '填写邮箱')
        .addCustomStep(async () => {
          // 填写密码
          const visibleInputs = await page.locator('input[placeholder*="密码"]').all()
          for (const input of visibleInputs) {
            if (await input.isVisible()) {
              await input.fill(newUser.password)
              break
            }
          }
        }, '填写密码')
        .addCustomStep(async () => {
          // 填写确认密码
          const visibleInputs = await page.locator('input[placeholder*="确认密码"]').all()
          for (const input of visibleInputs) {
            if (await input.isVisible()) {
              await input.fill(newUser.password)
              break
            }
          }
        }, '填写确认密码')
        .addClickStep('.auth-form button:has-text("注册账号")', page)
        .addWaitForTimeStep(2000)
      )
      .build()
  })

  test('用户可以登录', async ({ page }) => {
    const testUser = testFixtures.users.reader

    await ScenarioBuilder
      .create('用户登录')
      .step(builder => builder
        .addNavigationStep('/login', page)
        .addWaitStep('.auth-form', page)
        .addFillStep('input[placeholder*="用户名"], input[placeholder*="邮箱"]', testUser.username, page)
        .addFillStep('input[placeholder*="密码"]', testUser.password, page)
        .addClickStep('button:has-text("立即登录")', page)
        .addWaitForTimeStep(2000)
      )
      .build()
  })
})

test.describe('阅读器功能测试', () => {
  let session: any

  test.beforeEach(async ({ page, context, browser }) => {
    session = await createBrowserSession(page, context, browser)
  })

  test('用户可以阅读书籍章节', async ({ page }) => {
    const testBook = testFixtures.books.novel
    const testChapter = testFixtures.chapters.chapter1

    await ScenarioBuilder
      .create('用户阅读章节')
      .step(builder => builder
        .addNavigationStep(`/bookstore/books/${testBook.id}`, page)
        .addWaitStep('[data-testid="book-detail"]', page)
        .addClickStep('[data-testid="start-reading"]', page)
        .addWaitStep('[data-testid="reader-content"]', page)
        .addTextAssertionStep('[data-testid="chapter-title"]', testChapter.title, page)
      )
      .build()
  })
})
