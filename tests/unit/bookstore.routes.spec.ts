import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

// Mock the MainLayout component
vi.mock('@/shared/components/layout/MainLayout.vue', () => ({
  default: {
    template: '<div><router-view /></div>',
    name: 'MainLayout'
  }
}))

// Import after mocking
import bookstoreRoutes from '@/modules/bookstore/routes'

describe('Bookstore Routes - Browse Integration', () => {
  it('should have browse route', () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: bookstoreRoutes
    })
    
    const route = router.resolve('/bookstore/browse')
    expect(route.name).toBe('browse')
  })

  it('should redirect search to browse with query', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: bookstoreRoutes
    })
    
    await router.push('/bookstore/search?q=测试')
    expect(router.currentRoute.value.path).toBe('/bookstore/browse')
    expect(router.currentRoute.value.query.q).toBe('测试')
  })

  it('should redirect books to browse', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: bookstoreRoutes
    })
    
    await router.push('/bookstore/books')
    expect(router.currentRoute.value.path).toBe('/bookstore/browse')
  })

  it('should redirect categories with id to browse with categoryId', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: bookstoreRoutes
    })
    
    await router.push('/bookstore/categories?id=123')
    expect(router.currentRoute.value.path).toBe('/bookstore/browse')
    expect(router.currentRoute.value.query.categoryId).toBe('123')
  })
})
