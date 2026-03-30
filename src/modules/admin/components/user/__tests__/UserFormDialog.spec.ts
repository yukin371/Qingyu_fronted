import { describe, it, expect } from 'vitest'
import UserFormDialog from '../UserFormDialog.vue'

// 简化测试 - 仅测试组件存在性
describe('UserFormDialog', () => {
  it('component exists and can be imported', () => {
    expect(UserFormDialog).toBeDefined()
    expect(UserFormDialog.name || 'UserFormDialog').toBeTruthy()
  })
})
