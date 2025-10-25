# Architecture Refactoring Guide

## Overview

This document describes the major architecture refactoring completed for the Qingyu frontend project. The refactoring establishes a clear, maintainable layered structure with complete TypeScript migration and hybrid modular organization.

## What Changed

### 1. Complete TypeScript Migration

- ✅ Removed all duplicate `.js` files
- ✅ All code is now in TypeScript for better type safety
- ✅ Consistent type definitions across the application

### 2. New Directory Structure

```
src/
├── core/                    # Core infrastructure (NEW)
│   ├── config/             # Application configuration
│   ├── services/           # Core services (http, storage, validation)
│   ├── types/              # Core type definitions
│   └── utils/              # Core utilities
│
├── shared/                  # Shared resources (NEW)
│   ├── components/         # Shared components
│   │   ├── base/          # Base UI components
│   │   ├── common/        # Common business components
│   │   └── layout/        # Layout components
│   ├── composables/       # Shared composables
│   └── types/             # Shared types
│
├── modules/                # Feature modules (REORGANIZED)
│   ├── bookstore/         # Book discovery & browsing
│   │   ├── api/          # Bookstore API calls
│   │   ├── components/   # Bookstore components
│   │   ├── services/     # Bookstore business logic
│   │   ├── stores/       # Bookstore state management
│   │   ├── types/        # Bookstore types
│   │   ├── views/        # Bookstore pages
│   │   ├── routes.ts     # Bookstore routes
│   │   └── index.ts      # Module exports
│   │
│   ├── reader/           # Reading experience
│   ├── writer/           # Content creation
│   ├── user/             # User management
│   └── admin/            # Admin dashboard
│
├── router/               # Router configuration
│   ├── index.ts         # Main router setup
│   └── guards.ts        # Navigation guards
│
└── main.ts              # Application entry point
```

### 3. Layered Architecture

The new architecture follows a clear 4-layer structure:

```
┌─────────────────────────────────────────┐
│      Presentation Layer                 │
│      (views/, layouts/, components/)    │
├─────────────────────────────────────────┤
│      Business Logic Layer               │
│      (services/, stores/, composables/) │
├─────────────────────────────────────────┤
│      Data Access Layer                  │
│      (api/, types/)                     │
├─────────────────────────────────────────┤
│      Infrastructure Layer               │
│      (utils/, config/)                  │
└─────────────────────────────────────────┘
```

### 4. Service Layer Introduction

A new service layer has been introduced to separate business logic from state management:

**Before:**
```typescript
// Store had both state management AND business logic
export const useBookstoreStore = defineStore('bookstore', {
  actions: {
    async fetchHomepageData() {
      // Complex business logic mixed with state updates
      const response = await bookstoreAPI.getHomepage()
      // Data transformation
      // Caching logic
      // State updates
    }
  }
})
```

**After:**
```typescript
// Service handles business logic
class BookstoreService {
  async getHomepageData(): Promise<HomepageData> {
    // Caching
    const cached = cacheUtil.get(CACHE_KEYS.HOMEPAGE_DATA)
    if (cached) return cached
    
    // Data fetching
    const data = await bookstoreAPI.getHomepage()
    
    // Caching
    cacheUtil.set(CACHE_KEYS.HOMEPAGE_DATA, data, CACHE_TTL.SHORT)
    
    return data
  }
}

// Store focuses on state management
export const useBookstoreStore = defineStore('bookstore', {
  actions: {
    async fetchHomepageData() {
      this.loading = true
      try {
        this.homepageData = await bookstoreService.getHomepageData()
      } finally {
        this.loading = false
      }
    }
  }
})
```

### 5. Module-Based Routing

Routes are now organized by feature module:

```typescript
// src/router/index.ts
import bookstoreRoutes from '@/modules/bookstore/routes'
import readerRoutes from '@/modules/reader/routes'
import userRoutes from '@/modules/user/routes'
import writerRoutes from '@/modules/writer/routes'
import adminRoutes from '@/modules/admin/routes'

const routes = [
  ...bookstoreRoutes,
  ...readerRoutes,
  ...userRoutes,
  ...writerRoutes,
  ...adminRoutes
]
```

### 6. Path Aliases

New path aliases for cleaner imports:

```typescript
// tsconfig.json & vite.config.js
{
  "@/*": ["./src/*"],
  "@core/*": ["./src/core/*"],
  "@shared/*": ["./src/shared/*"],
  "@bookstore/*": ["./src/modules/bookstore/*"],
  "@reader/*": ["./src/modules/reader/*"],
  "@writer/*": ["./src/modules/writer/*"],
  "@user/*": ["./src/modules/user/*"],
  "@admin/*": ["./src/modules/admin/*"]
}
```

**Usage:**
```typescript
// Before
import { bookstoreAPI } from '@/api/bookstore'
import { useBookstoreStore } from '@/stores/bookstore'

// After
import { bookstoreAPI, bookstoreService } from '@bookstore'
import { httpService } from '@core/services/http.service'
```

## Benefits

### 1. Clear Separation of Concerns

- **Services**: Business logic, data transformation, caching
- **Stores**: State management only
- **API**: HTTP requests
- **Components**: UI rendering

### 2. Improved Type Safety

- Complete TypeScript coverage
- Consistent type definitions
- Better IDE support and autocomplete

### 3. Better Scalability

- Feature modules can be developed independently
- Easy to add new features
- Clear boundaries between modules

### 4. Easier Testing

- Services can be unit tested without UI
- Mocked dependencies are clearer
- Better test isolation

### 5. Enhanced Maintainability

- Related code is co-located
- Consistent patterns across features
- Easier to understand and modify

### 6. Better Code Navigation

- Module-based organization
- Clear file naming conventions
- Logical grouping of files

## Migration Examples

### Example 1: Using Bookstore Service

**Before:**
```vue
<script setup>
import { bookstoreAPI } from '@/api/bookstore'
import { ref } from 'vue'

const books = ref([])

async function loadBooks() {
  const response = await bookstoreAPI.getRecommendedBooks()
  books.value = response.data
}
</script>
```

**After:**
```vue
<script setup lang="ts">
import { bookstoreService } from '@bookstore'
import { ref } from 'vue'

const books = ref<BookBrief[]>([])

async function loadBooks() {
  books.value = await bookstoreService.getRecommendedBooks()
}
</script>
```

### Example 2: Using Core Services

**Before:**
```typescript
// Custom implementation scattered everywhere
localStorage.setItem('key', JSON.stringify(data))
const data = JSON.parse(localStorage.getItem('key') || '{}')
```

**After:**
```typescript
import { storageService } from '@core'

// Centralized with TTL support
storageService.set('key', data, { ttl: 5 * 60 * 1000 })
const data = storageService.get<DataType>('key')
```

### Example 3: Module Imports

**Before:**
```typescript
import { useBookstoreStore } from '@/stores/bookstore'
import { bookstoreAPI } from '@/api/bookstore'
import type { Book } from '@/types/bookstore'
```

**After:**
```typescript
import { useBookstoreStore, bookstoreService, type Book } from '@bookstore'
```

## Core Services Reference

### HTTP Service

```typescript
import { httpService } from '@core'

// Set auth token
httpService.setAuthToken(token)

// Make requests
const data = await httpService.get<T>('/api/endpoint')
await httpService.post('/api/endpoint', payload)
```

### Storage Service

```typescript
import { storageService } from '@core'

// Set with TTL
storageService.set('key', data, { ttl: 5 * 60 * 1000 })

// Get
const data = storageService.get<Type>('key')

// Remove
storageService.remove('key')

// Clean expired items
storageService.cleanExpired()
```

### Validation Service

```typescript
import { validationService } from '@core'

// Validate email
const result = validationService.validateEmail(email)
if (!result.valid) {
  console.error(result.message)
}

// Validate password
const result = validationService.validatePassword(password)

// Custom validation
const result = validationService.validatePattern(
  value,
  /^pattern$/,
  'Custom error message'
)
```

## Constants Reference

```typescript
import { 
  STORAGE_KEYS, 
  CACHE_KEYS, 
  CACHE_TTL,
  HTTP_STATUS,
  ERROR_MESSAGES 
} from '@core/config/constants'

// Use predefined constants
storageService.set(STORAGE_KEYS.AUTH_TOKEN, token)
cacheUtil.set(CACHE_KEYS.HOMEPAGE_DATA, data, CACHE_TTL.SHORT)
```

## Development Guidelines

### Creating a New Feature Module

1. Create module directory structure:
```bash
src/modules/feature-name/
├── api/
├── components/
├── services/
├── stores/
├── types/
├── views/
├── routes.ts
└── index.ts
```

2. Implement service layer for business logic
3. Create API functions for HTTP calls
4. Define TypeScript types
5. Create Pinia store for state management
6. Build UI components and views
7. Define routes
8. Export public API in index.ts
9. Import routes in main router

### Service Layer Best Practices

1. **Keep services focused**: One service per domain
2. **Handle errors gracefully**: Use try-catch and log errors
3. **Implement caching**: Use cacheUtil for frequently accessed data
4. **Validate input**: Check parameters before API calls
5. **Transform data**: Format data for UI consumption
6. **Document methods**: Add JSDoc comments

### Testing Strategy

- **Services**: Unit tests with mocked APIs
- **Stores**: Integration tests with mocked services
- **Components**: Component tests with mocked stores
- **E2E**: Critical user flows

## Troubleshooting

### Import Errors

If you see import errors after the refactoring:

1. **Check path aliases**: Ensure tsconfig.json and vite.config.js are updated
2. **Restart dev server**: Run `npm run dev` again
3. **Clear cache**: Delete `node_modules/.vite` directory
4. **IDE restart**: Restart your IDE/editor to reload TypeScript config

### Type Errors

1. **Check imports**: Use correct module paths
2. **Update types**: Ensure types are exported from module index.ts
3. **Type assertions**: Use proper TypeScript types, not `any`

### Module Resolution

If modules aren't resolving:

1. Verify alias configuration in both tsconfig.json and vite.config.js
2. Check that module index.ts exports the required items
3. Ensure file extensions are correct (.ts for TypeScript)

## Next Steps

1. ✅ Complete TypeScript migration
2. ✅ Establish core infrastructure
3. ✅ Create service layer
4. ✅ Reorganize into feature modules
5. ✅ Update routing structure
6. ✅ Configure path aliases
7. 🔄 Move existing views and components to modules
8. 🔄 Update component imports across the codebase
9. 📝 Write unit tests for services
10. 📝 Update component documentation

## Support

For questions or issues related to the new architecture:

1. Review this guide and architecture documentation
2. Check module README files for specific features
3. Review code examples in each module
4. Consult with the development team

---

**Last Updated**: 2025-10-25  
**Version**: 2.0.0

