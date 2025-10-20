export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  total?: number
  page?: number
  size?: number
}

export interface PaginationParams {
  page?: number
  size?: number
}

export interface RecommendationItem {
  bookId: string
  title: string
  author: string
  cover?: string
  rating?: number
  reason?: string
  score?: number
}

export interface RecommendationBehavior {
  itemId: string
  behaviorType: 'view' | 'click' | 'favorite' | 'purchase'
  context?: Record<string, unknown>
}



