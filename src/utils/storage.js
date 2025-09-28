/**
 * 本地存储工具类
 * 提供统一的本地存储接口，支持localStorage和sessionStorage
 */

const STORAGE_KEYS = {
  TOKEN: 'qingyu_token',
  REFRESH_TOKEN: 'qingyu_refresh_token',
  USER_INFO: 'qingyu_user_info',
  THEME: 'qingyu_theme',
  LANGUAGE: 'qingyu_language',
  READING_HISTORY: 'qingyu_reading_history',
  SEARCH_HISTORY: 'qingyu_search_history'
}

class Storage {
  /**
   * 设置localStorage数据
   * @param {string} key 存储键
   * @param {any} value 存储值
   */
  setLocal(key, value) {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error('设置localStorage失败:', error)
    }
  }

  /**
   * 获取localStorage数据
   * @param {string} key 存储键
   * @param {any} defaultValue 默认值
   * @returns {any} 存储的值或默认值
   */
  getLocal(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('获取localStorage失败:', error)
      return defaultValue
    }
  }

  /**
   * 删除localStorage数据
   * @param {string} key 存储键
   */
  removeLocal(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('删除localStorage失败:', error)
    }
  }

  /**
   * 设置sessionStorage数据
   * @param {string} key 存储键
   * @param {any} value 存储值
   */
  setSession(key, value) {
    try {
      const serializedValue = JSON.stringify(value)
      sessionStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error('设置sessionStorage失败:', error)
    }
  }

  /**
   * 获取sessionStorage数据
   * @param {string} key 存储键
   * @param {any} defaultValue 默认值
   * @returns {any} 存储的值或默认值
   */
  getSession(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('获取sessionStorage失败:', error)
      return defaultValue
    }
  }

  /**
   * 删除sessionStorage数据
   * @param {string} key 存储键
   */
  removeSession(key) {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error('删除sessionStorage失败:', error)
    }
  }

  /**
   * 清空所有本地存储
   */
  clearAll() {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (error) {
      console.error('清空存储失败:', error)
    }
  }

  /**
   * 清空应用相关的存储数据
   */
  clearAppData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeLocal(key)
      this.removeSession(key)
    })
  }

  // Token相关方法
  setToken(token) {
    this.setLocal(STORAGE_KEYS.TOKEN, token)
  }

  getToken() {
    return this.getLocal(STORAGE_KEYS.TOKEN)
  }

  removeToken() {
    this.removeLocal(STORAGE_KEYS.TOKEN)
  }

  setRefreshToken(refreshToken) {
    this.setLocal(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  }

  getRefreshToken() {
    return this.getLocal(STORAGE_KEYS.REFRESH_TOKEN)
  }

  removeRefreshToken() {
    this.removeLocal(STORAGE_KEYS.REFRESH_TOKEN)
  }

  // 用户信息相关方法
  setUserInfo(userInfo) {
    this.setLocal(STORAGE_KEYS.USER_INFO, userInfo)
  }

  getUserInfo() {
    return this.getLocal(STORAGE_KEYS.USER_INFO)
  }

  removeUserInfo() {
    this.removeLocal(STORAGE_KEYS.USER_INFO)
  }

  // 主题相关方法
  setTheme(theme) {
    this.setLocal(STORAGE_KEYS.THEME, theme)
  }

  getTheme() {
    return this.getLocal(STORAGE_KEYS.THEME, 'light')
  }

  // 语言相关方法
  setLanguage(language) {
    this.setLocal(STORAGE_KEYS.LANGUAGE, language)
  }

  getLanguage() {
    return this.getLocal(STORAGE_KEYS.LANGUAGE, 'zh-CN')
  }

  // 阅读历史相关方法
  setReadingHistory(history) {
    this.setLocal(STORAGE_KEYS.READING_HISTORY, history)
  }

  getReadingHistory() {
    return this.getLocal(STORAGE_KEYS.READING_HISTORY, [])
  }

  addReadingHistory(book) {
    const history = this.getReadingHistory()
    const existingIndex = history.findIndex(item => item.id === book.id)
    
    if (existingIndex > -1) {
      // 更新现有记录
      history[existingIndex] = {
        ...history[existingIndex],
        ...book,
        lastReadTime: new Date().toISOString()
      }
    } else {
      // 添加新记录
      history.unshift({
        ...book,
        lastReadTime: new Date().toISOString()
      })
    }
    
    // 限制历史记录数量
    const maxHistory = 100
    if (history.length > maxHistory) {
      history.splice(maxHistory)
    }
    
    this.setReadingHistory(history)
  }

  // 搜索历史相关方法
  setSearchHistory(history) {
    this.setLocal(STORAGE_KEYS.SEARCH_HISTORY, history)
  }

  getSearchHistory() {
    return this.getLocal(STORAGE_KEYS.SEARCH_HISTORY, [])
  }

  addSearchHistory(keyword) {
    if (!keyword || keyword.trim() === '') return
    
    const history = this.getSearchHistory()
    const trimmedKeyword = keyword.trim()
    
    // 移除重复项
    const filteredHistory = history.filter(item => item !== trimmedKeyword)
    
    // 添加到开头
    filteredHistory.unshift(trimmedKeyword)
    
    // 限制搜索历史数量
    const maxHistory = 20
    if (filteredHistory.length > maxHistory) {
      filteredHistory.splice(maxHistory)
    }
    
    this.setSearchHistory(filteredHistory)
  }

  clearSearchHistory() {
    this.removeLocal(STORAGE_KEYS.SEARCH_HISTORY)
  }
}

// 创建单例实例
const storage = new Storage()

export default storage
export { STORAGE_KEYS }