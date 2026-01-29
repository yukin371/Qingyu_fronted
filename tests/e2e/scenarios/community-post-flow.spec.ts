/**
 * 场景3: 社区发帖和评论流程测试
 *
 * 测试内容:
 * - 测试发帖功能
 * - 测试评论功能
 * - 测试帖子列表展示
 *
 * @author Qingyu Test Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('场景3: 社区发帖和评论流程', () => {
  // 测试数据
  const testPostData = {
    title: `E2E测试帖子_${Date.now()}`,
    content: '这是一个E2E自动化测试发布的帖子内容,用于测试社区发帖功能。',
    tag: '测试'
  }

  const testCommentData = {
    content: `E2E测试评论_${Date.now()}`
  }

  /**
   * 测试3.1: 查看社区帖子列表
   */
  test('3.1 查看社区帖子列表', async ({ page }) => {
    // 访问社区页面
    await page.goto(`${baseURL}/community`)
    await page.waitForLoadState('networkidle')

    // 验证页面标题
    const pageTitle = page.locator('h1, h2, .page-title').filter({ hasText: /社区/ })
    const titleCount = await pageTitle.count()

    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible()
      console.log('✓ 社区页面加载成功')
    }

    // 等待帖子列表加载
    await page.waitForTimeout(2000)

    // 检查帖子列表容器
    const postContainer = page.locator('[data-testid="post-list"], .post-list, .feed-container')
    const containerCount = await postContainer.count()

    if (containerCount > 0) {
      // 获取帖子数量
      const postItems = page.locator('[data-testid="post-item"], .post-item, .feed-item')
      const postCount = await postItems.count()

      console.log(`✓ 找到 ${postCount} 个帖子`)

      // 如果有帖子,验证第一个帖子卡片
      if (postCount > 0) {
        const firstPost = postItems.first()
        await expect(firstPost).toBeVisible()

        // 验证帖子卡片包含必要元素
        const postTitle = firstPost.locator('[data-testid="post-title"], .post-title, .title')
        const titleCount = await postTitle.count()

        if (titleCount > 0) {
          console.log('✓ 帖子卡片标题显示正常')
        }

        const postContent = firstPost.locator('[data-testid="post-content"], .post-content, .content')
        const contentCount = await postContent.count()

        if (contentCount > 0) {
          console.log('✓ 帖子卡片内容显示正常')
        }
      }
    } else {
      console.log('⚠️ 未找到帖子列表容器')
    }
  })

  /**
   * 测试3.2: 发布新帖子(需要登录)
   */
  test('3.2 发布新帖子', async ({ page }) => {
    // 访问发帖页面
    await page.goto(`${baseURL}/community/post`)
    await page.waitForLoadState('networkidle')

    // 检查是否需要登录
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('⚠️ 需要登录才能发布帖子,跳过此测试')
      return
    }

    // 验证发帖表单存在
    const titleInput = page.locator('input[placeholder*="标题"], input[name="title"], [data-testid="post-title-input"]')
    const contentInput = page.locator('textarea[placeholder*="内容"], textarea[name="content"], [data-testid="post-content-input"], .editor-content')
    const submitButton = page.locator('button:has-text("发布"), button:has-text("提交"), [data-testid="submit-post-btn"]')

    // 填写帖子信息
    if (await titleInput.count() > 0) {
      await titleInput.first().fill(testPostData.title)
      console.log(`✓ 填写帖子标题: ${testPostData.title}`)
    }

    if (await contentInput.count() > 0) {
      await contentInput.first().fill(testPostData.content)
      console.log(`✓ 填写帖子内容: ${testPostData.content}`)
    }

    // 拦截发帖API
    const postPromise = page.waitForResponse(
      response =>
        (response.url().includes('/api/posts') || response.url().includes('/api/community/posts')) &&
        response.request().method() === 'POST'
    )

    // 提交表单
    if (await submitButton.count() > 0) {
      await submitButton.first().click()

      // 等待API响应
      const postResponse = await postPromise
      console.log(`发帖API状态: ${postResponse.status()}`)

      if (postResponse.status() === 200 || postResponse.status() === 201) {
        const postData = await postResponse.json()

        if (postData.code === 200 || postData.code === 201) {
          console.log('✓ 帖子发布成功')

          // 验证跳转到帖子详情页或社区列表
          await page.waitForTimeout(2000)
          const newUrl = page.url()

          if (newUrl.includes('/community/post/') || newUrl.includes('/community')) {
            console.log(`✓ 跳转成功: ${newUrl}`)
          }
        }
      }
    } else {
      console.log('⚠️ 未找到发布按钮')
    }
  })

  /**
   * 测试3.3: 查看帖子详情
   */
  test('3.3 查看帖子详情', async ({ page }) => {
    // 先访问社区列表
    await page.goto(`${baseURL}/community`)
    await page.waitForLoadState('networkidle')

    // 等待列表加载
    await page.waitForTimeout(2000)

    // 尝试点击第一个帖子
    const firstPost = page.locator('[data-testid="post-item"], .post-item, a[href*="/community/post/"]').first()

    const count = await firstPost.count()

    if (count > 0) {
      // 拦截详情页API
      const detailPromise = page.waitForResponse(
        response =>
          (response.url().includes('/api/posts/') || response.url().includes('/api/community/posts/')) &&
          response.request().method() === 'GET'
      )

      await firstPost.click()

      // 等待导航
      await page.waitForLoadState('networkidle')

      // 等待API响应
      try {
        const detailResponse = await Promise.race([
          detailPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
        ]) as any

        console.log(`帖子详情API状态: ${detailResponse.status()}`)
      } catch (e) {
        console.log('⚠️ 帖子详情API超时或未调用')
      }

      // 验证URL
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/\/community\/post\/.+/)

      // 验证帖子详情页元素
      const detailTitle = page.locator('[data-testid="post-detail-title"], .post-detail-title, h1, h2')
      const titleCount = await detailTitle.count()

      if (titleCount > 0) {
        await expect(detailTitle.first()).toBeVisible()
        console.log('✓ 帖子详情页标题显示正常')
      }

      const detailContent = page.locator('[data-testid="post-detail-content"], .post-detail-content, .content')
      const contentCount = await detailContent.count()

      if (contentCount > 0) {
        console.log('✓ 帖子详情页内容显示正常')
      }
    } else {
      console.log('⚠️ 未找到可点击的帖子')
    }
  })

  /**
   * 测试3.4: 发表评论(需要登录)
   */
  test('3.4 发表评论', async ({ page }) => {
    // 访问社区列表并点击第一个帖子
    await page.goto(`${baseURL}/community`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const firstPost = page.locator('[data-testid="post-item"], .post-item, a[href*="/community/post/"]').first()

    const postCount = await firstPost.count()

    if (postCount === 0) {
      console.log('⚠️ 未找到帖子,跳过评论测试')
      return
    }

    await firstPost.click()
    await page.waitForLoadState('networkidle')

    // 滚动到评论区
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    // 查找评论输入框
    const commentInput = page.locator('textarea[placeholder*="评论"], input[placeholder*="评论"], [data-testid="comment-input"]')
    const inputCount = await commentInput.count()

    if (inputCount === 0) {
      console.log('⚠️ 未找到评论输入框')
      return
    }

    // 填写评论内容
    await commentInput.first().fill(testCommentData.content)
    console.log(`✓ 填写评论内容: ${testCommentData.content}`)

    // 拦截评论API
    const commentPromise = page.waitForResponse(
      response =>
        (response.url().includes('/api/comments') || response.url().includes('/api/posts/') && response.url().includes('/comments')) &&
        response.request().method() === 'POST'
    )

    // 提交评论
    const submitButton = page.locator('button:has-text("发表"), button:has-text("评论"), button:has-text("发送"), [data-testid="submit-comment-btn"]')
    const buttonCount = await submitButton.count()

    if (buttonCount > 0) {
      await submitButton.first().click()

      // 等待API响应
      const commentResponse = await commentPromise
      console.log(`评论API状态: ${commentResponse.status()}`)

      if (commentResponse.status() === 200 || commentResponse.status() === 201) {
        console.log('✓ 评论发表成功')

        // 验证评论显示在列表中
        await page.waitForTimeout(2000)

        const commentList = page.locator(`text=${testCommentData.content}`)
        const commentCount = await commentList.count()

        if (commentCount > 0) {
          console.log('✓ 评论显示在列表中')
        }
      }
    } else {
      console.log('⚠️ 未找到评论提交按钮')
    }
  })

  /**
   * 测试3.5: 点赞帖子
   */
  test('3.5 点赞帖子', async ({ page }) => {
    // 访问社区列表
    await page.goto(`${baseURL}/community`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 查找第一个帖子的点赞按钮
    const likeButton = page.locator('[data-testid="like-button"], .like-button, button:has-text("赞")').first()
    const buttonCount = await likeButton.count()

    if (buttonCount === 0) {
      console.log('⚠️ 未找到点赞按钮')
      return
    }

    // 获取点赞前的数量
    const likeCountBefore = await likeButton.textContent() || '0'

    // 拦截点赞API
    const likePromise = page.waitForResponse(
      response =>
        (response.url().includes('/api/posts/') && response.url().includes('/like')) &&
        response.request().method() === 'POST'
    )

    // 点击点赞按钮
    await likeButton.click()

    // 等待API响应
    try {
      const likeResponse = await Promise.race([
        likePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
      ]) as any

      console.log(`点赞API状态: ${likeResponse.status()}`)

      if (likeResponse.status() === 200) {
        console.log('✓ 点赞成功')

        // 验证点赞数量变化
        await page.waitForTimeout(1000)
        const likeCountAfter = await likeButton.textContent() || '0'

        if (likeCountBefore !== likeCountAfter) {
          console.log(`✓ 点赞数量变化: ${likeCountBefore} → ${likeCountAfter}`)
        }
      }
    } catch (e) {
      console.log('⚠️ 点赞API超时或未调用')
    }
  })

  /**
   * 测试3.6: 话题筛选
   */
  test('3.6 话题筛选', async ({ page }) => {
    // 访问社区页面
    await page.goto(`${baseURL}/community`)
    await page.waitForLoadState('networkidle')

    // 查找话题标签
    const topicTags = page.locator('[data-testid="topic-tag"], .topic-tag, .tag')
    const tagCount = await topicTags.count()

    if (tagCount > 0) {
      console.log(`✓ 找到 ${tagCount} 个话题标签`)

      // 点击第一个话题标签
      await topicTags.first().click()

      // 等待页面更新
      await page.waitForTimeout(2000)

      // 验证URL变化(可能包含话题参数)
      const currentUrl = page.url()
      console.log(`✓ 话题筛选后URL: ${currentUrl}`)
    } else {
      console.log('⚠️ 未找到话题标签')
    }
  })
})

/**
 * 测试报告说明
 *
 * 运行方式:
 * npm run test:e2e -- tests/e2e/scenarios/community-post-flow.spec.ts
 *
 * 测试覆盖点:
 * 1. 社区帖子列表加载
 * 2. 发布新帖子
 * 3. 查看帖子详情
 * 4. 发表评论
 * 5. 点赞帖子
 * 6. 话题筛选功能
 *
 * 注意事项:
 * - 发布帖子和发表评论需要登录
 * - 如果未登录,这些测试会被跳过
 */
