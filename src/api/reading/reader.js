  import request from '@/utils/request'

/**
 * 阅读器API接口
 * 基于后端阅读端API文档 v1.0
 */
export const readerAPI = {
  // ==================== 章节阅读 ====================

  /**
   * 获取章节信息
   * @param {string} chapterId - 章节ID
   * @returns {Promise} 章节信息
   */
  getChapterInfo(chapterId) {
    return request.get(`/reader/chapters/${chapterId}`)
  },

  /**
   * 获取章节内容（需要登录）
   * @param {string} chapterId - 章节ID
   * @returns {Promise} 章节内容
   */
  getChapterContent(chapterId) {
    return request.get(`/reader/chapters/${chapterId}/content`)
  },

  /**
   * 获取书籍章节列表
   * @param {string} bookId - 书籍ID
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise} 章节列表
   */
  getChapterList(bookId, page = 1, size = 20) {
    return request.get('/reader/chapters', {
      params: { bookId, page, size }
    })
  },

  /**
   * 获取章节导航（上一章、下一章）
   * @param {string} bookId - 书籍ID
   * @param {number} chapterNum - 当前章节号
   * @returns {Promise} 章节导航信息
   */
  getChapterNavigation(bookId, chapterNum) {
    return request.get('/reader/chapters/navigation', {
      params: { bookId, chapterNum }
    })
  },

  /**
   * 获取第一章
   * @param {string} bookId - 书籍ID
   * @returns {Promise} 第一章信息
   */
  getFirstChapter(bookId) {
    return request.get('/reader/chapters/first', {
      params: { bookId }
    })
  },

  /**
   * 获取最后一章
   * @param {string} bookId - 书籍ID
   * @returns {Promise} 最后一章信息
   */
  getLastChapter(bookId) {
    return request.get('/reader/chapters/last', {
      params: { bookId }
    })
  },

  // ==================== 阅读进度 ====================

  /**
   * 获取阅读进度
   * @param {string} bookId - 书籍ID
   * @returns {Promise} 阅读进度信息
   */
  getProgress(bookId) {
    return request.get(`/reader/progress/${bookId}`)
  },

  /**
   * 保存阅读进度
   * @param {Object} progressData - 进度数据
   * @param {string} progressData.bookId - 书籍ID
   * @param {string} progressData.chapterId - 章节ID
   * @param {number} progressData.progress - 进度 (0.0-1.0)
   * @returns {Promise} 保存响应
   */
  saveProgress(progressData) {
    return request.post('/reader/progress', progressData)
  },

  /**
   * 更新阅读时长
   * @param {Object} timeData - 时长数据
   * @param {string} timeData.bookId - 书籍ID
   * @param {number} timeData.duration - 时长（秒）
   * @returns {Promise} 更新响应
   */
  updateReadingTime(timeData) {
    return request.put('/reader/progress/time', timeData)
  },

  /**
   * 获取阅读历史
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise} 阅读历史
   */
  getReadingHistory(page = 1, size = 20) {
    return request.get('/reader/progress/history', {
      params: { page, size }
    })
  },

  /**
   * 获取总阅读时长
   * @returns {Promise} 阅读时长统计
   */
  getTotalReadingTime() {
    return request.get('/reader/progress/total-time')
  },

  // ==================== 注记功能 ====================

  /**
   * 创建注记
   * @param {Object} annotation - 注记数据
   * @param {string} annotation.bookId - 书籍ID
   * @param {string} annotation.chapterId - 章节ID
   * @param {string} annotation.type - 注记类型 (bookmark/highlight/note)
   * @param {string} annotation.text - 选中的文本
   * @param {string} [annotation.note] - 笔记内容
   * @param {string} [annotation.range] - 文本范围
   * @returns {Promise} 创建响应
   */
  createAnnotation(annotation) {
    return request.post('/reader/annotations', annotation)
  },

  /**
   * 更新注记
   * @param {string} id - 注记ID
   * @param {Object} annotation - 注记数据
   * @returns {Promise} 更新响应
   */
  updateAnnotation(id, annotation) {
    return request.put(`/reader/annotations/${id}`, annotation)
  },

  /**
   * 删除注记
   * @param {string} id - 注记ID
   * @returns {Promise} 删除响应
   */
  deleteAnnotation(id) {
    return request.delete(`/reader/annotations/${id}`)
  },

  /**
   * 获取书籍注记列表
   * @param {string} bookId - 书籍ID
   * @param {string} type - 注记类型
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise} 注记列表
   */
  getBookAnnotations(bookId, type = '', page = 1, size = 20) {
    return request.get(`/reader/annotations/book/${bookId}`, {
      params: { type, page, size }
    })
  },

  /**
   * 获取章节注记列表
   * @param {string} chapterId - 章节ID
   * @returns {Promise} 注记列表
   */
  getChapterAnnotations(chapterId) {
    return request.get(`/reader/annotations/chapter/${chapterId}`)
  },

  /**
   * 获取注记统计
   * @returns {Promise} 注记统计数据
   */
  getAnnotationStats() {
    return request.get('/reader/annotations/stats')
  },

  /**
   * 批量创建注记
   * @param {Array} annotations - 注记列表
   * @returns {Promise} 创建响应
   */
  batchCreateAnnotations(annotations) {
    return request.post('/reader/annotations/batch', { annotations })
  },

  // ==================== 阅读设置 ====================

  /**
   * 获取阅读设置
   * @returns {Promise} 阅读设置
   */
  getSettings() {
    return request.get('/reader/settings')
  },

  /**
   * 保存阅读设置
   * @param {Object} settings - 设置数据
   * @returns {Promise} 保存响应
   */
  saveSettings(settings) {
    return request.post('/reader/settings', settings)
  },

  /**
   * 更新阅读设置
   * @param {Object} settings - 设置数据
   * @returns {Promise} 更新响应
   */
  updateSettings(settings) {
    return request.put('/reader/settings', settings)
  }
}

export default readerAPI


