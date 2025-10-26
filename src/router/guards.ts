/**
 * Router Guards
 * Additional navigation guards for specific use cases
 */

import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Setup additional router guards
 */
export function setupRouterGuards(router: Router): void {
  // Example: Track page load times
  router.beforeEach((to, from, next) => {
    // Add any additional global guards here
    next()
  })
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: string): boolean {
  const authStore = useAuthStore()
  // Implement permission checking logic
  return authStore.isLoggedIn
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const authStore = useAuthStore()
  // Check both user.role (single) and user.roles (array) for compatibility
  return authStore.user?.role === role || authStore.user?.roles?.includes(role) || false
}

export default {
  setupRouterGuards,
  hasPermission,
  hasRole
}

