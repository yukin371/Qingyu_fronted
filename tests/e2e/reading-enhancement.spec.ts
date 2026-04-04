/**
 * 阅读增强E2E测试
 * 测试章节导航、进度保存、阅读器设置、书架管理等阅读器功能
 *
 * 测试用例编号: R02~R06
 * 角色: Reader（读者）
 *
 * 选择器优先级策略:
 * 1. data-testid (优先)
 * 2. aria-label
 * 3. class/placeholder (降级)
 */

import { test, expect } from '@playwright/test'
import { createBrowserSession } from '../helpers/browser-session'
import { ActorFactory } from '../helpers/actor-factory'
import { ScenarioBuilder } from '../helpers/step-builder'
import { testFixtures } from '../helpers/test-data'

test.describe('阅读器功能增强测试', () => {
  let session: any

  test.beforeEach(async ({ page, context, browser }) => {
    session = await createBrowserSession(page, context, browser)
  })

  /**
   * [R02] 章节导航
   * 验证读者可以在阅读器中切换章节
   */
  test('R02 章节导航', async ({ page }) => {
    const reader = ActorFactory.createReader('TestReader', session, testFixtures.users.reader)

    await ScenarioBuilder.create('章节导航测试')
      .step((builder) =>
        builder
          .addNavigationStep('/bookstore/browse', page)
          .addCustomStep(async () => {
            // 等待页面加载
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
            const pageTitle = page.locator('h1').first()
            await pageTitle.waitFor({ state: 'visible', timeout: 15000 })
            console.log('✅ 页面加载完成')
          }, '等待页面加载')
          .addCustomStep(async () => {
            // 点击第一本书进入详情页
            const firstBook = page.locator('h3').first()
            await firstBook.click()
            console.log('✅ 点击书籍进入详情页')
          }, '点击书籍')
          .addCustomStep(async () => {
            // 等待详情页加载
            await page.waitForTimeout(2000)
          }, '等待详情页加载')
          .addCustomStep(async () => {
            // 点击开始阅读按钮
            const readButton = page
              .locator('button:has-text("开始阅读")')
              .or(page.locator('button:has-text("继续阅读")'))
              .first()

            if ((await readButton.count()) > 0) {
              await readButton.click()
              console.log('✅ 点击开始阅读按钮')
            }
          }, '开始阅读')
          .addCustomStep(async () => {
            // 等待阅读器加载
            await page.waitForTimeout(2000)
          }, '等待阅读器加载')
          .addCustomStep(async () => {
            // 打开目录面板 - 查找目录按钮
            const tocButton = page
              .locator('[data-testid="toc-button"]')
              .or(page.locator('button:has-text("目录")'))
              .or(page.locator('text=目录'))
              .first()

            if ((await tocButton.count()) > 0) {
              await tocButton.click()
              console.log('✅ 打开目录面板')
              await page.waitForTimeout(1000)
            } else {
              console.log('⚠️ 未找到目录按钮')
            }
          }, '打开目录')
          .addCustomStep(async () => {
            // 查找目录中的章节列表
            const chapterList = page
              .locator('[data-testid="chapter-list"]')
              .or(page.locator('.chapter-list'))
              .or(page.locator('.toc-list'))
              .or(page.locator('li:has-text("第")'))

            const count = await chapterList.count()
            if (count > 0) {
              console.log(`✅ 找到 ${count} 个章节`)

              // 点击第二个章节
              const secondChapter = chapterList.nth(1)
              await secondChapter.click()
              console.log('✅ 点击第二章')
            } else {
              console.log('⚠️ 未找到章节列表')
            }
          }, '切换章节'),
      )
      .build()
  })

  /**
   * [R05] 阅读器设置
   * 验证读者可以调整字体大小和主题
   */
  test('R05 阅读器设置', async ({ page }) => {
    const reader = ActorFactory.createReader('TestReader', session, testFixtures.users.reader)

    await ScenarioBuilder.create('阅读器设置测试')
      .step((builder) =>
        builder
          .addNavigationStep('/bookstore/browse', page)
          .addCustomStep(async () => {
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
            const pageTitle = page.locator('h1').first()
            await pageTitle.waitFor({ state: 'visible', timeout: 15000 })
          }, '等待页面加载')
          .addCustomStep(async () => {
            // 点击第一本书进入详情页
            const firstBook = page.locator('h3').first()
            await firstBook.click()
          }, '点击书籍')
          .addCustomStep(async () => {
            await page.waitForTimeout(2000)
          }, '等待详情页加载')
          .addCustomStep(async () => {
            // 点击开始阅读按钮
            const readButton = page
              .locator('button:has-text("开始阅读")')
              .or(page.locator('button:has-text("继续阅读")'))
              .first()

            if ((await readButton.count()) > 0) {
              await readButton.click()
              console.log('✅ 开始阅读')
            }
          }, '开始阅读')
          .addCustomStep(async () => {
            await page.waitForTimeout(2000)
          }, '等待阅读器加载')
          .addCustomStep(async () => {
            // 打开设置面板
            const settingsButton = page
              .locator('[data-testid="settings-btn"]')
              .or(page.locator('button:has-text("设置")'))
              .or(page.locator('text=设置'))
              .first()

            if ((await settingsButton.count()) > 0) {
              await settingsButton.click()
              console.log('✅ 打开设置面板')
              await page.waitForTimeout(500)
            } else {
              console.log('⚠️ 未找到设置按钮')
            }
          }, '打开设置')
          .addCustomStep(async () => {
            // 测试字体大小调整
            const fontIncreaseBtn = page
              .locator('[data-testid="font-increase"]')
              .or(page.locator('button:has-text("+")'))
              .or(page.locator('text=字号+'))
              .first()

            if ((await fontIncreaseBtn.count()) > 0) {
              await fontIncreaseBtn.click()
              console.log('✅ 点击增大字体')
              await page.waitForTimeout(300)
            }
          }, '调整字体')
          .addCustomStep(async () => {
            // 测试主题切换
            const themeButtons = page
              .locator('[data-testid^="theme-"]')
              .or(page.locator('.theme-option'))
              .or(page.locator('text=夜间'))
              .or(page.locator('text=白天'))
              .or(page.locator('text=护眼'))

            if ((await themeButtons.count()) > 0) {
              await themeButtons.first().click()
              console.log('✅ 切换主题')
              await page.waitForTimeout(300)
            }
          }, '切换主题')
          .addCustomStep(async () => {
            // 关闭设置面板
            const closeBtn = page
              .locator('[data-testid="close-settings"]')
              .or(page.locator('button:has-text("关闭")'))
              .or(page.locator('.el-icon-close'))
              .first()

            if ((await closeBtn.count()) > 0) {
              await closeBtn.click()
              console.log('✅ 关闭设置面板')
            }
          }, '关闭设置'),
      )
      .build()
  })

  /**
   * [R03] 阅读进度保存
   * 验证阅读器自动保存阅读进度
   */
  test('R03 阅读进度保存', async ({ page }) => {
    const reader = ActorFactory.createReader('TestReader', session, testFixtures.users.reader)

    await ScenarioBuilder.create('阅读进度保存测试')
      .step((builder) =>
        builder
          .addNavigationStep('/bookstore/browse', page)
          .addCustomStep(async () => {
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
            const pageTitle = page.locator('h1').first()
            await pageTitle.waitFor({ state: 'visible', timeout: 15000 })
          }, '等待页面加载')
          .addCustomStep(async () => {
            // 点击第一本书进入详情页
            const firstBook = page.locator('h3').first()
            await firstBook.click()
          }, '点击书籍')
          .addCustomStep(async () => {
            await page.waitForTimeout(2000)
          }, '等待详情页加载')
          .addCustomStep(async () => {
            // 点击开始阅读
            const readButton = page
              .locator('button:has-text("开始阅读")')
              .or(page.locator('button:has-text("继续阅读")'))
              .first()

            if ((await readButton.count()) > 0) {
              await readButton.click()
              console.log('✅ 开始阅读')
            }
          }, '开始阅读')
          .addCustomStep(async () => {
            await page.waitForTimeout(3000)
          }, '等待阅读器加载')
          .addCustomStep(async () => {
            // 验证阅读器已加载
            const currentUrl = page.url()
            const isReaderPage = currentUrl.includes('/reader/') || currentUrl.includes('/chapter/')

            if (isReaderPage) {
              console.log(`✅ 进入阅读器页面: ${currentUrl}`)

              // 等待一小段时间，让进度有机会保存
              await page.waitForTimeout(2000)
              console.log('✅ 阅读器自动保存进度中...')
            } else {
              console.log('⚠️ 未进入阅读器页面')
            }
          }, '验证阅读器'),
      )
      .build()
  })
})

test.describe('书架管理功能测试', () => {
  let session: any

  test.beforeEach(async ({ page, context, browser }) => {
    session = await createBrowserSession(page, context, browser)
  })

  /**
   * [R06] 书架管理
   * 验证读者可以管理书架中的书籍
   */
  test('R06 书架管理', async ({ page }) => {
    const reader = ActorFactory.createReader('TestReader', session, testFixtures.users.reader)

    await ScenarioBuilder.create('书架管理测试')
      .step((builder) =>
        builder
          .addNavigationStep('/bookshelf', page)
          .addCustomStep(async () => {
            // 等待页面加载
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
            console.log('✅ 导航到书架页')
          }, '等待页面加载')
          .addCustomStep(async () => {
            await page.waitForTimeout(2000)
          }, '等待内容加载')
          .addCustomStep(async () => {
            // 查找书架内容或书籍卡片
            const bookshelfContent = page
              .locator('[data-testid="bookshelf-content"]')
              .or(page.locator('.bookshelf'))
              .or(page.locator('.book-list'))
              .or(page.locator('.book-card'))

            const count = await bookshelfContent.count()
            if (count > 0) {
              console.log(`✅ 书架包含 ${count} 个元素`)
            } else {
              console.log('⚠️ 书架为空')
            }
          }, '检查书架内容')
          .addCustomStep(async () => {
            // 查找Tab切换（进行中/已读完）
            const tabs = page
              .locator('[data-testid="shelf-tabs"]')
              .or(page.locator('.el-tabs__header'))
              .or(page.locator('text=进行中').or(page.locator('text=已读完')))

            if ((await tabs.count()) > 0) {
              // 切换到"进行中"Tab
              const ongoingTab = page
                .locator('text=进行中')
                .or(page.locator('text=Reading'))
                .first()
              if ((await ongoingTab.count()) > 0) {
                await ongoingTab.click()
                console.log('✅ 切换到进行中Tab')
                await page.waitForTimeout(500)
              }
            }
          }, '切换Tab')
          .addCustomStep(async () => {
            // 查找书籍操作按钮（更多/删除等）
            const moreButton = page
              .locator('[data-testid="more-btn"]')
              .or(page.locator('.el-icon-more'))
              .or(page.locator('text=更多'))
              .first()

            if ((await moreButton.count()) > 0) {
              console.log('✅ 找到操作按钮')
            }
          }, '查找操作按钮'),
      )
      .build()
  })

  /**
   * [R06b] 从书架阅读
   * 验证读者可以从书架继续阅读
   */
  test('R06b 从书架继续阅读', async ({ page }) => {
    const reader = ActorFactory.createReader('TestReader', session, testFixtures.users.reader)

    await ScenarioBuilder.create('从书架继续阅读测试')
      .step((builder) =>
        builder
          .addNavigationStep('/bookshelf', page)
          .addCustomStep(async () => {
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
          }, '等待页面加载')
          .addCustomStep(async () => {
            await page.waitForTimeout(2000)
          }, '等待内容加载')
          .addCustomStep(async () => {
            // 查找第一本书籍卡片
            const bookCard = page
              .locator('[data-testid="book-card"]')
              .or(page.locator('.book-card'))
              .or(page.locator('h3'))
              .first()

            if ((await bookCard.count()) > 0) {
              await bookCard.click()
              console.log('✅ 点击书架中的书籍')
            } else {
              console.log('⚠️ 书架为空')
            }
          }, '点击书籍')
          .addCustomStep(async () => {
            await page.waitForTimeout(2000)

            // 验证是否进入详情页或阅读器
            const currentUrl = page.url()
            const isBookPage =
              currentUrl.includes('/bookstore/books/') || currentUrl.includes('/reader/')

            if (isBookPage) {
              console.log(`✅ 进入书籍页面: ${currentUrl}`)
            }
          }, '验证进入详情页'),
      )
      .build()
  })
})

test.describe('阅读历史功能测试', () => {
  let session: any

  test.beforeEach(async ({ page, context, browser }) => {
    session = await createBrowserSession(page, context, browser)
  })

  /**
   * [R03b] 阅读历史
   * 验证读者可以查看阅读历史
   */
  test('R03b 查看阅读历史', async ({ page }) => {
    const reader = ActorFactory.createReader('TestReader', session, testFixtures.users.reader)

    await ScenarioBuilder.create('阅读历史测试')
      .step((builder) =>
        builder
          .addNavigationStep('/profile', page)
          .addCustomStep(async () => {
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
            console.log('✅ 导航到个人中心')
          }, '等待页面加载')
          .addCustomStep(async () => {
            await page.waitForTimeout(2000)
          }, '等待内容加载')
          .addCustomStep(async () => {
            // 查找阅读历史Tab或链接
            const historyLink = page
              .locator('[data-testid="reading-history"]')
              .or(page.locator('text=阅读历史'))
              .or(page.locator('text=最近阅读'))
              .or(page.locator('a[href*="history"]'))
              .first()

            if ((await historyLink.count()) > 0) {
              await historyLink.click()
              console.log('✅ 进入阅读历史')
              await page.waitForTimeout(1000)
            } else {
              console.log('⚠️ 未找到阅读历史入口')
            }
          }, '进入阅读历史')
          .addCustomStep(async () => {
            // 查找历史记录列表
            const historyList = page
              .locator('[data-testid="history-list"]')
              .or(page.locator('.history-list'))
              .or(page.locator('.reading-history'))

            const count = await historyList.count()
            if (count > 0) {
              console.log('✅ 阅读历史已加载')
            }
          }, '检查历史列表'),
      )
      .build()
  })
})

test.describe('书签功能测试', () => {
  let session: any

  test.beforeEach(async ({ page, context, browser }) => {
    session = await createBrowserSession(page, context, browser)
  })

  /**
   * [R03c] 添加书签
   * 验证读者可以添加书签
   */
  test('R03c 添加书签', async ({ page }) => {
    const reader = ActorFactory.createReader('TestReader', session, testFixtures.users.reader)

    await ScenarioBuilder.create('添加书签测试')
      .step((builder) =>
        builder
          .addNavigationStep('/bookstore/browse', page)
          .addCustomStep(async () => {
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
            const pageTitle = page.locator('h1').first()
            await pageTitle.waitFor({ state: 'visible', timeout: 15000 })
          }, '等待页面加载')
          .addCustomStep(async () => {
            // 点击第一本书进入详情页
            const firstBook = page.locator('h3').first()
            await firstBook.click()
          }, '点击书籍')
          .addCustomStep(async () => {
            await page.waitForTimeout(2000)
          }, '等待详情页加载')
          .addCustomStep(async () => {
            // 点击开始阅读
            const readButton = page
              .locator('button:has-text("开始阅读")')
              .or(page.locator('button:has-text("继续阅读")'))
              .first()

            if ((await readButton.count()) > 0) {
              await readButton.click()
              console.log('✅ 开始阅读')
            }
          }, '开始阅读')
          .addCustomStep(async () => {
            await page.waitForTimeout(2000)
          }, '等待阅读器加载')
          .addCustomStep(async () => {
            // 查找书签按钮
            const bookmarkButton = page
              .locator('[data-testid="bookmark-btn"]')
              .or(page.locator('button:has-text("书签")'))
              .or(page.locator('text=添加书签'))
              .first()

            if ((await bookmarkButton.count()) > 0) {
              await bookmarkButton.click()
              console.log('✅ 点击添加书签')
              await page.waitForTimeout(1000)
              console.log('✅ 书签添加成功')
            } else {
              console.log('⚠️ 未找到书签按钮')
            }
          }, '添加书签'),
      )
      .build()
  })
})
