/**
 * API 类型推断测试
 *
 * 验证生成的 API 是否具有完整的类型信息
 */

// 假设我们使用生成的 API
import { getApi } from '../src/modules/reader/api/generated/reader'

// 获取 API 实例
const api = getApi()

// 测试 1: 函数签名类型推断
async function testFunctionSignatures() {
  // GET 请求（带参数）
  const books = await api.getApiV1Books({
    page: 1,
    pageSize: 20,
    category: 'fantasy'
  })
  // books 的类型应该被自动推断

  // POST 请求（带 body）
  const loginResult = await api.postApiV1SharedAuthLogin({
    username: 'test',
    password: 'password'
  })

  // DELETE 请求（带路径参数）
  await api.deleteApiV1BooksId('book-123')

  // PUT 请求（带路径参数和 body）
  await api.putApiV1UsersProfile({
    nickname: 'New Name'
  })
}

// 测试 2: 参数类型检查
async function testParameterTypes() {
  // ✅ 正确的类型
  await api.getApiV1Books({
    page: 1,
    pageSize: 20
  })

  // ❌ 错误的类型（TypeScript 应该报错）
  // await api.getApiV1Books({
  //   page: 'invalid',  // 类型错误：应该是 number
  //   pageSize: true    // 类型错误：应该是 number
  // })
}

// 测试 3: 返回值类型推断
async function testReturnTypeInference() {
  const chapters = await api.getApiV1BooksBookIdChapters('book-123', {
    page: 1,
    pageSize: 10
  })

  // chapters 的类型应该是 SharedAPIResponse
  // TypeScript 知道它的结构
}

// 测试 4: 可选参数
async function testOptionalParameters() {
  // 所有参数都是可选的
  const result1 = await api.getApiV1Books()

  // 部分参数
  const result2 = await api.getApiV1Books({
    page: 1
  })

  // 所有参数
  const result3 = await api.getApiV1Books({
    page: 1,
    pageSize: 20,
    category: 'fantasy',
    status: ['published'],
    tags: ['tag1', 'tag2']
  })
}

// 测试 5: 路径参数和查询参数组合
async function testPathAndQueryParams() {
  // 路径参数 + 查询参数
  const chapter = await api.getApiV1BooksBookIdChapters(
    'book-123',  // 路径参数（必需）
    {            // 查询参数（可选）
      page: 1,
      pageSize: 20
    }
  )
}

console.log('API 类型推断测试文件创建成功！')
console.log('请使用 VSCode 或其他 TypeScript 编辑器打开此文件')
console.log('悬停在函数调用上查看类型推断结果')
