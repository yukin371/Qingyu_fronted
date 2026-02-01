/**
 * API Validators
 * API响应验证和数据一致性检查工具
 */

import { expect } from '@playwright/test'

/**
 * 标准API响应格式
 */
export interface StandardAPIResponse<T = unknown> {
  code: number
  message: string
  data?: T
  request_id?: string
}

/**
 * API验证配置
 */
export interface APIValidationConfig {
  expectedCode?: number
  expectedMessage?: string | RegExp
  expectData?: boolean
  dataSchema?: object
  timeout?: number
}

/**
 * 数据对比配置
 */
export interface DataComparisonConfig {
  ignoreFields?: string[]
  allowExtraFields?: boolean
  strictOrder?: boolean
}

/**
 * API验证器类
 */
export class APIValidators {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * 设置认证Token
   */
  setAuthToken(token: string): void {
    this.token = token
  }

  /**
   * 清除认证Token
   */
  clearAuthToken(): void {
    this.token = null
  }

  /**
   * 获取请求头
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  /**
   * 验证API响应
   */
  async assertAPIResponse(
    response: Response,
    config: APIValidationConfig = {}
  ): Promise<StandardAPIResponse> {
    const {
      expectedCode = 200,
      expectedMessage,
      expectData = true,
      dataSchema,
      timeout = 5000
    } = config

    // 超时控制
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`API响应超时 (${timeout}ms)`)), timeout)
    })

    // 解析响应
    const dataPromise = response.json()
    const data: StandardAPIResponse = await Promise.race([dataPromise, timeoutPromise])

    // 验证状态码
    expect(response.status).toBe(expectedCode)

    // 验证响应格式
    expect(data).toHaveProperty('code')
    expect(data).toHaveProperty('message')

    // 验证code字段
    expect(data.code).toBe(expectedCode)

    // 验证message
    if (expectedMessage) {
      if (expectedMessage instanceof RegExp) {
        expect(data.message).toMatch(expectedMessage)
      } else {
        expect(data.message).toBe(expectedMessage)
      }
    }

    // 验证data字段
    if (expectData) {
      expect(data).toHaveProperty('data')
    }

    // 验证data schema
    if (dataSchema && data.data) {
      this.assertSchema(data.data, dataSchema)
    }

    return data
  }

  /**
   * 验证对象Schema
   */
  private assertSchema(obj: Record<string, unknown>, schema: object): void {
    for (const [key, expectedType] of Object.entries(schema)) {
      expect(obj).toHaveProperty(key)

      const actualValue = obj[key]
      const typeString = typeof expectedType

      if (typeString === 'string') {
        // 预期类型字符串
        expect(typeof actualValue).toBe(expectedType)
      } else if (expectedType instanceof RegExp) {
        // 正则表达式验证
        expect(actualValue).toMatch(expectedType)
      } else if (typeof expectedType === 'object') {
        // 嵌套对象验证
        this.assertSchema(actualValue, expectedType)
      } else if (Array.isArray(expectedType)) {
        // 数组验证
        expect(Array.isArray(actualValue)).toBe(true)
      }
    }
  }

  /**
   * 验证前后端数据一致性
   */
  async assertDataConsistency(
    frontendData: Record<string, unknown>,
    backendAPI: string,
    config: DataComparisonConfig = {}
  ): Promise<void> {
    const { ignoreFields = [], allowExtraFields = false } = config

    // 从后端API获取数据
    const backendData = await this.fetchBackendData(backendAPI)

    // 对比数据
    this.compareData(frontendData, backendData, { ignoreFields, allowExtraFields })
  }

  /**
   * 从后端API获取数据
   */
  async fetchBackendData(endpoint: string): Promise<unknown> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`获取后端数据失败: ${response.status} ${response.statusText}`)
    }

    const result: StandardAPIResponse = await response.json()

    // 后端返回 code: 0 表示成功，兼容 code: 200
    if (result.code !== 0 && result.code !== 200) {
      throw new Error(`后端返回错误: ${result.message}`)
    }

    return result.data
  }

  /**
   * 对比两个数据对象
   */
  compareData(
    frontendData: Record<string, unknown>,
    backendData: Record<string, unknown>,
    config: DataComparisonConfig = {}
  ): void {
    const { ignoreFields = [], allowExtraFields = true } = config

    // 递归对比
    this._compareData(frontendData, backendData, '', { ignoreFields, allowExtraFields })
  }

  /**
   * 内部数据对比逻辑
   */
  private _compareData(
    frontend: unknown,
    backend: unknown,
    path: string,
    config: DataComparisonConfig
  ): void {
    const { ignoreFields, allowExtraFields } = config

    // 处理null/undefined
    if (frontend == null || backend == null) {
      expect(frontend).toBe(backend)
      return
    }

    // 处理基本类型
    if (typeof frontend !== 'object') {
      expect(frontend).toBe(backend)
      return
    }

    // 处理数组
    if (Array.isArray(frontend) && Array.isArray(backend)) {
      expect(frontend.length).toBe(backend.length)

      for (let i = 0; i < frontend.length; i++) {
        this._compareData(frontend[i], backend[i], `${path}[${i}]`, config)
      }
      return
    }

    // 处理对象
    const frontendKeys = Object.keys(frontend).filter(k => !ignoreFields.includes(k))
    const backendKeys = Object.keys(backend).filter(k => !ignoreFields.includes(k))

    // 检查前端是否缺少字段
    for (const key of backendKeys) {
      if (!frontendKeys.includes(key) && !allowExtraFields) {
        throw new Error(`前端数据缺少字段: ${path ? path + '.' : ''}${key}`)
      }
    }

    // 递归对比每个字段
    for (const key of frontendKeys) {
      if (backendKeys.includes(key)) {
        this._compareData(frontend[key], backend[key], `${path ? path + '.' : ''}${key}`, config)
      }
    }
  }

  /**
   * 验证用户数据
   */
  async assertUserData(userID: string, expectedData: {
    username?: string
    email?: string
    vipLevel?: number
    status?: string
  }): Promise<void> {
    const userData = await this.fetchBackendData(`/api/v1/users/${userID}`)

    if (expectedData.username) {
      expect(userData.username).toBe(expectedData.username)
    }

    if (expectedData.email) {
      expect(userData.email).toBe(expectedData.email)
    }

    if (expectedData.vipLevel !== undefined) {
      expect(userData.vip_level).toBe(expectedData.vipLevel)
    }

    if (expectedData.status) {
      expect(userData.status).toBe(expectedData.status)
    }
  }

  /**
   * 验证书籍数据
   */
  async assertBookData(bookID: string, expectedData: {
    title?: string
    author?: string
    chapterCount?: number
    status?: string
  }): Promise<void> {
    const bookData = await this.fetchBackendData(`/api/v1/bookstore/books/${bookID}`)

    if (expectedData.title) {
      expect(bookData.title).toBe(expectedData.title)
    }

    if (expectedData.author) {
      expect(bookData.author).toBe(expectedData.author)
    }

    if (expectedData.chapterCount !== undefined) {
      expect(bookData.chapter_count).toBe(expectedData.chapterCount)
    }

    if (expectedData.status) {
      expect(bookData.status).toBe(expectedData.status)
    }
  }

  /**
   * 验证阅读进度
   */
  async assertReadingProgress(userID: string, bookID: string, expectedChapter?: string): Promise<void> {
    const progressData = await this.fetchBackendData(`/api/v1/reading/progress/${userID}/${bookID}`)

    expect(progressData).toHaveProperty('chapter_id')
    expect(progressData).toHaveProperty('position')

    if (expectedChapter) {
      expect(progressData.chapter_id).toBe(expectedChapter)
    }
  }

  /**
   * 验证评论数据
   */
  async assertCommentExists(userID: string, bookID: string): Promise<void> {
    const comments = await this.fetchBackendData(`/api/v1/comments?user_id=${userID}&book_id=${bookID}`)

    expect(Array.isArray(comments)).toBe(true)
    expect(comments.length).toBeGreaterThan(0)
  }

  /**
   * 验证收藏数据
   */
  async assertCollectionExists(userID: string, bookID: string): Promise<void> {
    const collections = await this.fetchBackendData(`/api/v1/reader/collections/${userID}`)

    const hasBook = collections.some((collection: Record<string, unknown>) =>
      collection.book_id === bookID || (Array.isArray(collection.books) && collection.books.some((b: Record<string, unknown>) => b.id === bookID))
    )

    expect(hasBook).toBe(true)
  }

  /**
   * 验证社交互动数据
   */
  async assertSocialData(userID: string, expectedData: {
    commentCount?: number
    collectionCount?: number
    likeCount?: number
  }): Promise<void> {
    const socialData = await this.fetchBackendData(`/api/v1/social/stats/${userID}`)

    if (expectedData.commentCount !== undefined) {
      expect(socialData.comment_count).toBeGreaterThanOrEqual(expectedData.commentCount)
    }

    if (expectedData.collectionCount !== undefined) {
      expect(socialData.collection_count).toBeGreaterThanOrEqual(expectedData.collectionCount)
    }

    if (expectedData.likeCount !== undefined) {
      expect(socialData.like_count).toBeGreaterThanOrEqual(expectedData.likeCount)
    }
  }

  /**
   * 创建测试数据（通过API）
   */
  async createTestUser(userData: {
    username: string
    email: string
    password: string
  }): Promise<{ userID: string; token: string }> {
    const response = await fetch(`${this.baseURL}/api/v1/shared/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password
        // 注意：后端注册API不需要验证码字段
      })
    })

    const result: StandardAPIResponse = await response.json()

    // 添加调试日志
    console.log(`[createTestUser] Response status: ${response.status}`)
    console.log(`[createTestUser] Response code: ${result.code}`)
    console.log(`[createTestUser] Response message: ${result.message}`)
    console.log(`[createTestUser] Response data:`, JSON.stringify(result.data))

    // 后端返回 code: 0 表示成功
    if (result.code !== 0) {
      throw new Error(`创建测试用户失败: ${result.message}`)
    }

    // shared/auth/register 返回的数据结构是 data.user.id 和 data.token
    const token = result.data.token
    const userID = result.data.user?.id || result.data.user_id

    console.log(`[createTestUser] Extracted token: ${token ? 'exists' : 'MISSING'}`)
    console.log(`[createTestUser] Extracted userID: ${userID || 'MISSING'}`)

    if (!token || !userID) {
      throw new Error(`注册响应数据不完整: ${JSON.stringify(result.data)}`)
    }

    return {
      userID,
      token
    }
  }

  /**
   * 登录获取 token
   */
  async loginUser(username: string, password: string): Promise<{ userID: string; token: string }> {
    const response = await fetch(`${this.baseURL}/api/v1/shared/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        username,
        password
      })
    })

    const result: StandardAPIResponse = await response.json()

    if (result.code !== 200 && result.code !== 201) {
      throw new Error(`登录失败: ${result.message}`)
    }

    return {
      userID: result.data.user?.id || result.data.user_id,
      token: result.data.token
    }
  }

  /**
   * 创建测试书籍
   */
  async createTestBook(authorID: string, bookData: {
    title: string
    description: string
    category: string
  }): Promise<string> {
    // 需要作者权限
    const response = await fetch(`${this.baseURL}/api/v1/writer/books`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bookData)
    })

    const result: StandardAPIResponse = await response.json()

    if (result.code !== 200) {
      throw new Error(`创建测试书籍失败: ${result.message}`)
    }

    return result.data.id
  }
}

/**
 * 创建API验证器实例的工厂函数
 */
export function createAPIValidators(baseURL: string): APIValidators {
  return new APIValidators(baseURL)
}
