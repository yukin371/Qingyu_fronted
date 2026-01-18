/**
 * 阅读器 API 统一导出
 *
 * 导出所有阅读器相关 API 模块
 *
 * @module reader/api
 */

// 书架管理
export * from './books'
export { bookshelfAPI, getBookshelf, getRecentReading, getUnfinishedBooks, getFinishedBooks, addToBookshelf, removeFromBookshelf } from './books'

// 章节内容
export * from './chapters'
export { chaptersAPI, getBookChapters, getChapterById, getChapterContent, getNavigationChapters, getFirstChapter, getLastChapter } from './chapters'

// 阅读进度
export * from './progress'
export { progressAPI, getReadingProgress, saveReadingProgress, updateReadingTime, getRecentReading as getRecentReadingProgress, getReadingHistory, getReadingStats, getUnfinishedBooks as getUnfinishedBooksProgress, getFinishedBooks as getFinishedBooksProgress } from './progress'

// 书签管理
export * from './bookmarks'
export { bookmarksAPI, getUserBookmarks, createBookmark, updateBookmark, deleteBookmark, getChapterBookmarks, batchDeleteBookmarks } from './bookmarks'

// 评论系统
export * from './comments'
export { commentsAPI, getBookComments, createComment, replyComment, deleteComment, likeComment, unlikeComment, getChapterComments } from './comments'

// 点赞功能
export * from './likes'
export { likesAPI, likeBook, unlikeBook, getBookLikeInfo, getUserLikedBooks, getUserLikeStats } from './likes'

// 收藏管理
export * from './collections'
export { collectionsAPI, addCollection, getCollections, updateCollection, deleteCollection, checkCollected, getCollectionsByTag, getCollectionStats, shareCollection, unshareCollection, createFolder, getFolders, updateFolder, deleteFolder } from './collections'

// 阅读历史
export * from './history'
export { historyAPI, getReadingHistories, recordReadingHistory, deleteHistory, batchDeleteHistory, clearAllHistory, clearHistory } from './history'

// 评分功能
export * from './rating'
export { ratingAPI, getBookRating, rateBook, getUserBookRating, updateRating, deleteRating } from './rating'

// 阅读器核心
export * from './reader'
export { readerAPI } from './reader'

// 主题管理
export * from './themes'

// 字体管理
export * from './fonts'
