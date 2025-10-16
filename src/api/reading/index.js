/**
 * 阅读端API统一导出
 */
export { readerAPI } from './reader'
export { ratingAPI } from './rating'
export { booksAPI } from './books'

// 默认导出
export default {
  reader: () => import('./reader').then(m => m.readerAPI),
  rating: () => import('./rating').then(m => m.ratingAPI),
  books: () => import('./books').then(m => m.booksAPI)
}


