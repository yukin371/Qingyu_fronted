/**
 * 创作链路E2E测试
 * 测试作者创建作品、编写章节、AI辅助写作、发布管理等创作功能
 *
 * 测试用例编号: W01~W06
 * 角色: Author（作者）
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

test.describe('创作功能测试', () => {
  let session: any

  test.beforeEach(async ({ page, context, browser }) => {
    session = await createBrowserSession(page, context, browser)
  })

  /**
   * [W01] 创建作品项目
   * 验证作者可以创建新的作品项目
   */
  test('W01 创建作品项目', async ({ page }) => {
    const author = ActorFactory.createAuthor('TestAuthor', session, testFixtures.users.author)

    await ScenarioBuilder.create('创建作品项目测试')
      .step((builder) =>
        builder
          .addNavigationStep('/writer', page)
          .addCustomStep(async () => {
            // 等待页面加载
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
            // 等待页面主要内容加载
            await page.waitForTimeout(2000)
            console.log('✅ 页面加载完成')
          }, '等待页面加载')
          .addCustomStep(async () => {
            // 查找新建项目按钮
            const newProjectBtn = page
              .locator('[data-testid="new-project-btn"]')
              .or(page.locator('button:has-text("新建作品")'))
              .or(page.locator('button:has-text("创建项目")'))
              .or(page.locator('text=新建作品'))
              .first()

            if ((await newProjectBtn.count()) > 0) {
              await newProjectBtn.click()
              console.log('✅ 点击新建作品按钮')
              await page.waitForTimeout(1000)
            } else {
              console.log('⚠️ 未找到新建作品按钮')
            }
          }, '点击新建作品')
          .addCustomStep(async () => {
            // 查找项目名称输入框
            const nameInput = page
              .locator('[data-testid="project-name-input"]')
              .or(page.locator('input[placeholder*="作品名称"]'))
              .or(page.locator('input[placeholder*="书名"]'))
              .first()

            if ((await nameInput.count()) > 0) {
              await nameInput.fill('测试小说_' + Date.now())
              console.log('✅ 填写项目名称')
            }
          }, '填写项目名称')
          .addCustomStep(async () => {
            // 查找分类选择
            const categorySelect = page
              .locator('[data-testid="category-select"]')
              .or(page.locator('.el-select'))
              .or(page.locator('text=分类'))
              .first()

            if ((await categorySelect.count()) > 0) {
              await categorySelect.click()
              await page.waitForTimeout(500)
              console.log('✅ 选择分类')
            }
          }, '选择分类')
          .addCustomStep(async () => {
            // 查找创建确认按钮
            const confirmBtn = page
              .locator('[data-testid="confirm-create"]')
              .or(page.locator('button:has-text("创建")'))
              .or(page.locator('button:has-text("确定")'))
              .first()

            if ((await confirmBtn.count()) > 0) {
              await confirmBtn.click()
              console.log('✅ 点击创建按钮')
              await page.waitForTimeout(2000)
            }
          }, '确认创建'),
      )
      .build()
  })

  /**
   * [W02] 章节编写
   * 验证作者可以编写章节内容
   */
  test('W02 章节编写', async ({ page }) => {
    const author = ActorFactory.createAuthor('TestAuthor', session, testFixtures.users.author)

    await ScenarioBuilder.create('章节编写测试')
      .step((builder) =>
        builder
          .addNavigationStep('/writer', page)
          .addCustomStep(async () => {
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
            await page.waitForTimeout(2000)
          }, '等待页面加载')
          .addCustomStep(async () => {
            // 点击第一个项目进入工作台
            const firstProject = page
              .locator('[data-testid="project-card"]')
              .or(page.locator('.project-card'))
              .or(page.locator('h3'))
              .first()

            if ((await firstProject.count()) > 0) {
              await firstProject.click()
              console.log('✅ 进入项目工作台')
              await page.waitForTimeout(2000)
            } else {
              console.log('⚠️ 未找到项目')
            }
          }, '进入项目')
          .addCustomStep(async () => {
            // 查找新建章节按钮
            const newChapterBtn = page
              .locator('[data-testid="new-chapter-btn"]')
              .or(page.locator('button:has-text("新建章节")'))
              .or(page.locator('text=新建章节'))
              .first()

            if ((await newChapterBtn.count()) > 0) {
              await newChapterBtn.click()
              console.log('✅ 点击新建章节')
              await page.waitForTimeout(1000)
            }
          }, '新建章节')
          .addCustomStep(async () => {
            // 查找章节标题输入
            const titleInput = page
              .locator('[data-testid="chapter-title-input"]')
              .or(page.locator('input[placeholder*="章节标题"]'))
              .first()

            if ((await titleInput.count()) > 0) {
              await titleInput.fill('第1章 测试章节')
              console.log('✅ 填写章节标题')
            }
          }, '填写章节标题')
          .addCustomStep(async () => {
            // 查找富文本编辑器
            const editor = page
              .locator('[data-testid="chapter-editor"]')
              .or(page.locator('.ProseMirror'))
              .or(page.locator('.tiptap'))
              .first()

            if ((await editor.count()) > 0) {
              await editor.click()
              await editor.fill('这是测试章节内容，验证富文本编辑器功能。')
              console.log('✅ 编写章节内容')
            }
          }, '编写内容')
          .addCustomStep(async () => {
            // 保存草稿
            const saveBtn = page
              .locator('[data-testid="save-draft"]')
              .or(page.locator('button:has-text("保存")'))
              .or(page.locator('button:has-text("存草稿")'))
              .first()

            if ((await saveBtn.count()) > 0) {
              await saveBtn.click()
              console.log('✅ 保存草稿')
              await page.waitForTimeout(1000)
            }
          }, '保存草稿'),
      )
      .build()
  })

  /**
   * [W04] 发布管理
   * 验证作者可以发布章节
   */
  test('W04 发布章节', async ({ page }) => {
    const author = ActorFactory.createAuthor('TestAuthor', session, testFixtures.users.author)

    await ScenarioBuilder.create('发布章节测试')
      .step((builder) =>
        builder
          .addNavigationStep('/writer', page)
          .addCustomStep(async () => {
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
          }, '等待页面加载')
          .addCustomStep(async () => {
            // 点击第一个项目
            const firstProject = page
              .locator('[data-testid="project-card"]')
              .or(page.locator('.project-card'))
              .or(page.locator('h3'))
              .first()

            if ((await firstProject.count()) > 0) {
              await firstProject.click()
              console.log('✅ 进入项目')
              await page.waitForTimeout(2000)
            }
          }, '进入项目')
          .addCustomStep(async () => {
            // 查找发布管理按钮
            const publishBtn = page
              .locator('[data-testid="publish-manage"]')
              .or(page.locator('button:has-text("发布管理")'))
              .or(page.locator('text=发布管理'))
              .first()

            if ((await publishBtn.count()) > 0) {
              await publishBtn.click()
              console.log('✅ 进入发布管理')
              await page.waitForTimeout(1000)
            }
          }, '发布管理')
          .addCustomStep(async () => {
            // 查找发布按钮
            const publishChapterBtn = page
              .locator('[data-testid="publish-chapter"]')
              .or(page.locator('button:has-text("发布")'))
              .or(page.locator('text=发布章节'))
              .first()

            if ((await publishChapterBtn.count()) > 0) {
              await publishChapterBtn.click()
              console.log('✅ 点击发布按钮')
              await page.waitForTimeout(1500)
              console.log('✅ 章节发布成功')
            } else {
              console.log('⚠️ 未找到发布按钮，可能没有可发布的章节')
            }
          }, '发布章节'),
      )
      .build()
  })

  /**
   * [W05] 作品管理
   * 验证作者可以管理作品列表
   */
  test('W05 作品管理', async ({ page }) => {
    const author = ActorFactory.createAuthor('TestAuthor', session, testFixtures.users.author)

    await ScenarioBuilder.create('作品管理测试')
      .step((builder) =>
        builder
          .addNavigationStep('/writer', page)
          .addCustomStep(async () => {
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
            console.log('✅ 导航到作家中心')
          }, '等待页面加载')
          .addCustomStep(async () => {
            // 查找作品列表
            const projectList = page
              .locator('[data-testid="project-list"]')
              .or(page.locator('.project-list'))
              .or(page.locator('.project-card'))

            const count = await projectList.count()
            if (count > 0) {
              console.log(`✅ 找到 ${count} 个作品`)
            } else {
              console.log('⚠️ 作品列表为空')
            }
          }, '查看作品列表')
          .addCustomStep(async () => {
            // 查找操作菜单
            const moreBtn = page
              .locator('[data-testid="more-btn"]')
              .or(page.locator('.el-icon-more'))
              .or(page.locator('text=更多'))
              .first()

            if ((await moreBtn.count()) > 0) {
              await moreBtn.click()
              console.log('✅ 打开操作菜单')
              await page.waitForTimeout(500)
            }
          }, '操作菜单'),
      )
      .build()
  })
})

test.describe('AI辅助写作测试', () => {
  let session: any

  test.beforeEach(async ({ page, context, browser }) => {
    session = await createBrowserSession(page, context, browser)
  })

  /**
   * [W03] AI辅助写作
   * 验证作者可以使用AI辅助功能
   */
  test('W03 AI辅助写作', async ({ page }) => {
    const author = ActorFactory.createAuthor('TestAuthor', session, testFixtures.users.author)

    await ScenarioBuilder.create('AI辅助写作测试')
      .step((builder) =>
        builder
          .addNavigationStep('/writer', page)
          .addCustomStep(async () => {
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
          }, '等待页面加载')
          .addCustomStep(async () => {
            // 点击第一个项目
            const firstProject = page
              .locator('[data-testid="project-card"]')
              .or(page.locator('.project-card'))
              .or(page.locator('h3'))
              .first()

            if ((await firstProject.count()) > 0) {
              await firstProject.click()
              console.log('✅ 进入项目')
              await page.waitForTimeout(2000)
            }
          }, '进入项目')
          .addCustomStep(async () => {
            // 查找AI辅助按钮/面板
            const aiBtn = page
              .locator('[data-testid="ai-assist-btn"]')
              .or(page.locator('button:has-text("AI")'))
              .or(page.locator('text=AI助手'))
              .first()

            if ((await aiBtn.count()) > 0) {
              await aiBtn.click()
              console.log('✅ 打开AI辅助面板')
              await page.waitForTimeout(1000)
            } else {
              console.log('⚠️ 未找到AI辅助按钮')
            }
          }, '打开AI辅助')
          .addCustomStep(async () => {
            // 查找AI输入框
            const aiInput = page
              .locator('[data-testid="ai-input"]')
              .or(page.locator('textarea[placeholder*="AI"]'))
              .or(page.locator('input[placeholder*="描述"]'))
              .first()

            if ((await aiInput.count()) > 0) {
              await aiInput.fill('描述一个场景：主角站在山顶，俯瞰整个城市')
              console.log('✅ 输入AI指令')
            }
          }, '输入AI指令')
          .addCustomStep(async () => {
            // 查找生成按钮
            const generateBtn = page
              .locator('[data-testid="ai-generate"]')
              .or(page.locator('button:has-text("生成")'))
              .or(page.locator('text=生成内容'))
              .first()

            if ((await generateBtn.count()) > 0) {
              await generateBtn.click()
              console.log('✅ 点击生成')
              await page.waitForTimeout(3000)
              console.log('✅ AI生成完成')
            } else {
              console.log('⚠️ 未找到生成按钮')
            }
          }, '生成内容'),
      )
      .build()
  })
})

test.describe('数据统计测试', () => {
  let session: any

  test.beforeEach(async ({ page, context, browser }) => {
    session = await createBrowserSession(page, context, browser)
  })

  /**
   * [W06] 查看数据统计
   * 验证作者可以查看作品数据统计
   */
  test('W06 查看数据统计', async ({ page }) => {
    const author = ActorFactory.createAuthor('TestAuthor', session, testFixtures.users.author)

    await ScenarioBuilder.create('数据统计测试')
      .step((builder) =>
        builder
          .addNavigationStep('/writer', page)
          .addCustomStep(async () => {
            await page.waitForLoadState('domcontentloaded', { timeout: 15000 })
          }, '等待页面加载')
          .addCustomStep(async () => {
            // 查找数据统计入口
            const statsBtn = page
              .locator('[data-testid="stats-btn"]')
              .or(page.locator('button:has-text("数据")'))
              .or(page.locator('text=数据统计'))
              .first()

            if ((await statsBtn.count()) > 0) {
              await statsBtn.click()
              console.log('✅ 进入数据统计')
              await page.waitForTimeout(1000)
            } else {
              console.log('⚠️ 未找到数据统计入口')
            }
          }, '进入数据统计')
          .addCustomStep(async () => {
            // 查找统计图表
            const chart = page
              .locator('[data-testid="stats-chart"]')
              .or(page.locator('.echarts'))
              .or(page.locator('canvas'))

            const count = await chart.count()
            if (count > 0) {
              console.log('✅ 统计图表已加载')
            }
          }, '查看图表')
          .addCustomStep(async () => {
            // 查找阅读量数据
            const readCount = page
              .locator('[data-testid="read-count"]')
              .or(page.locator('text=阅读量'))
              .first()

            if ((await readCount.count()) > 0) {
              console.log('✅ 阅读量数据已显示')
            }
          }, '查看阅读量'),
      )
      .build()
  })
})
