/**
 * 共享服务API统一导出
 */
import * as authAPI from './auth'
import * as walletAPI from './wallet'
import * as storageAPI from './storage'
import * as adminAPI from './admin'

export default {
  auth: authAPI,
  wallet: walletAPI,
  storage: storageAPI,
  admin: adminAPI
}

// 也可以单独导出
export { authAPI, walletAPI, storageAPI, adminAPI }

