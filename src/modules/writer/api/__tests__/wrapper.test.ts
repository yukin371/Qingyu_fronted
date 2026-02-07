/**
 * Writer API Wrapper 测试
 * 测试wrapper层是否可以正常工作
 */



// Mock orval mutator
vi.mock('@/core/config/orval-mutator', () => ({
  orvalMutator: vi.fn((config) => {
    // 模拟返回数据
    return Promise.resolve({
      projects: [],
      total: 0,
      page: config.params?.page || 1,
      size: config.params?.size || 20,
    })
  }),
}))

describe('Writer API Wrapper', () => {
  describe('导入测试', () => {
    it('应该能够导入wrapper', async () => {
      const wrapper = await import('../wrapper')
      expect(wrapper).toBeDefined()
    })

    it('应该导出核心API方法', async () => {
      const wrapper = await import('../wrapper')

      // 检查核心方法是否存在
      expect(wrapper.getProjects).toBeDefined()
      expect(wrapper.getProjectDocuments).toBeDefined()
      expect(wrapper.createDocument).toBeDefined()
      expect(wrapper.updateDocument).toBeDefined()
    })
  })

  describe('API调用测试', () => {
    it('应该能调用getProjects', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const result = await wrapper.getProjects({ page: 1, size: 20 })

      expect(orvalMutator).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('应该能调用createDocument', async () => {
      const wrapper = await import('../wrapper')
      const { orvalMutator } = await import('@/core/config/orval-mutator')

      const documentData = {
        projectId: 'project-123',
        title: 'Test Document',
        content: 'Test content',
      }

      await wrapper.createDocument(documentData as any)

      expect(orvalMutator).toHaveBeenCalled()
    })
  })
})
