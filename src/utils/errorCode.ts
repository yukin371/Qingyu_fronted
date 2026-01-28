/**
 * 错误码映射模块
 * 将后端6位数字错误码映射为前端字符串错误码
 * 支持国际化错误消息
 */

// ============================================
// i18n 支持（可选依赖）
// ============================================

// 声明 useI18n 类型
type UseI18nFunction = () => { locale: { value: string } }

// 尝试获取 useI18n，如果不可用则返回 null
function getUseI18n(): UseI18nFunction | null {
  try {
    // 在运行时动态检查 vue-i18n
    const vueI18n = (window as any).__VUE_I18N__
    if (vueI18n && vueI18n.useI18n) {
      return vueI18n.useI18n as UseI18nFunction
    }
  } catch {
    // 忽略错误
  }
  return null
}

// ============================================
// 后端错误码定义（与后端 pkg/errors/codes.go 保持一致）
// ============================================

/**
 * 后端错误码枚举
 * 格式：6位数字，前2位表示类别，后4位为具体编号
 */
export enum BackendErrorCode {
  // 成功
  SUCCESS = 0,

  // 10xxxx - 客户端错误（通用）
  INVALID_PARAMS = 100001,
  INVALID_REQUEST_BODY = 100002,
  INVALID_QUERY_PARAMS = 100003,
  MISSING_REQUIRED_FIELD = 100004,

  // 11xxxx - 客户端错误（认证授权）
  UNAUTHORIZED = 110001,
  FORBIDDEN = 110002,
  INVALID_CREDENTIALS = 110101,
  TOKEN_EXPIRED = 110102,
  TOKEN_INVALID = 110103,
  TOKEN_MISSING = 110104,
  PASSWORD_TOO_WEAK = 110105,
  ACCOUNT_LOCKED = 110106,
  ACCOUNT_DISABLED = 110107,
  SESSION_EXPIRED = 110108,
  PERMISSION_DENIED = 110109,

  // 12xxxx - 客户端错误（资源操作）
  NOT_FOUND = 120001,
  ALREADY_EXISTS = 120002,
  CONFLICT = 120003,
  RESOURCE_GONE = 120004,
  RESOURCE_LOCKED = 120005,

  // 13xxxx - 客户端错误（业务逻辑）
  INSUFFICIENT_BALANCE = 130001,
  INSUFFICIENT_QUOTA = 130002,
  WALLET_FROZEN = 130003,
  CONTENT_NOT_PUBLISHED = 130004,
  CHAPTER_LOCKED = 130005,
  OPERATION_NOT_ALLOWED = 130006,
  RATE_LIMIT_EXCEEDED = 130007,

  // 14xxxx - 客户端错误（内容审核）
  CONTENT_PENDING_REVIEW = 140001,
  CONTENT_REJECTED = 140002,
  CONTENT_VIOLATION = 140003,
  CONTENT_SPAM = 140004,

  // 99xxxx - 服务器错误
  INTERNAL_ERROR = 990001,
  DATABASE_ERROR = 990002,
  REDIS_ERROR = 990003,
  EXTERNAL_API_ERROR = 990004,
  SERVICE_UNAVAILABLE = 990005,
  TIMEOUT_ERROR = 990006
}

// ============================================
// 前端错误码定义
// ============================================

/**
 * 前端错误类型枚举
 * 使用字符串常量，便于理解和维护
 */
export enum FrontendErrorCode {
  // 网络层错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // 认证授权错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',

  // 请求错误
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',
  RESOURCE_GONE = 'RESOURCE_GONE',

  // 业务错误
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_QUOTA = 'INSUFFICIENT_QUOTA',
  WALLET_FROZEN = 'WALLET_FROZEN',
  CONTENT_LOCKED = 'CONTENT_LOCKED',
  RATE_LIMITED = 'RATE_LIMITED',

  // 内容审核错误
  CONTENT_PENDING = 'CONTENT_PENDING',
  CONTENT_REJECTED = 'CONTENT_REJECTED',
  CONTENT_VIOLATION = 'CONTENT_VIOLATION',

  // 服务器错误
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_ERROR = 'EXTERNAL_ERROR',

  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// ============================================
// 错误码映射表
// ============================================

/**
 * 后端错误码到前端错误码的映射关系
 */
export const errorCodeMap: Record<number, FrontendErrorCode> = {
  // 10xxxx - 客户端错误（通用）
  [BackendErrorCode.INVALID_PARAMS]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.INVALID_REQUEST_BODY]: FrontendErrorCode.BAD_REQUEST,
  [BackendErrorCode.INVALID_QUERY_PARAMS]: FrontendErrorCode.BAD_REQUEST,
  [BackendErrorCode.MISSING_REQUIRED_FIELD]: FrontendErrorCode.VALIDATION_ERROR,

  // 11xxxx - 客户端错误（认证授权）
  [BackendErrorCode.UNAUTHORIZED]: FrontendErrorCode.UNAUTHORIZED,
  [BackendErrorCode.FORBIDDEN]: FrontendErrorCode.FORBIDDEN,
  [BackendErrorCode.INVALID_CREDENTIALS]: FrontendErrorCode.UNAUTHORIZED,
  [BackendErrorCode.TOKEN_EXPIRED]: FrontendErrorCode.TOKEN_EXPIRED,
  [BackendErrorCode.TOKEN_INVALID]: FrontendErrorCode.TOKEN_INVALID,
  [BackendErrorCode.TOKEN_MISSING]: FrontendErrorCode.UNAUTHORIZED,
  [BackendErrorCode.PASSWORD_TOO_WEAK]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.ACCOUNT_LOCKED]: FrontendErrorCode.ACCOUNT_LOCKED,
  [BackendErrorCode.ACCOUNT_DISABLED]: FrontendErrorCode.ACCOUNT_DISABLED,
  [BackendErrorCode.SESSION_EXPIRED]: FrontendErrorCode.TOKEN_EXPIRED,
  [BackendErrorCode.PERMISSION_DENIED]: FrontendErrorCode.FORBIDDEN,

  // 12xxxx - 客户端错误（资源操作）
  [BackendErrorCode.NOT_FOUND]: FrontendErrorCode.NOT_FOUND,
  [BackendErrorCode.ALREADY_EXISTS]: FrontendErrorCode.RESOURCE_EXISTS,
  [BackendErrorCode.CONFLICT]: FrontendErrorCode.CONFLICT,
  [BackendErrorCode.RESOURCE_GONE]: FrontendErrorCode.RESOURCE_GONE,
  [BackendErrorCode.RESOURCE_LOCKED]: FrontendErrorCode.CONTENT_LOCKED,

  // 13xxxx - 客户端错误（业务逻辑）
  [BackendErrorCode.INSUFFICIENT_BALANCE]: FrontendErrorCode.INSUFFICIENT_BALANCE,
  [BackendErrorCode.INSUFFICIENT_QUOTA]: FrontendErrorCode.INSUFFICIENT_QUOTA,
  [BackendErrorCode.WALLET_FROZEN]: FrontendErrorCode.WALLET_FROZEN,
  [BackendErrorCode.CONTENT_NOT_PUBLISHED]: FrontendErrorCode.CONTENT_LOCKED,
  [BackendErrorCode.CHAPTER_LOCKED]: FrontendErrorCode.CONTENT_LOCKED,
  [BackendErrorCode.OPERATION_NOT_ALLOWED]: FrontendErrorCode.FORBIDDEN,
  [BackendErrorCode.RATE_LIMIT_EXCEEDED]: FrontendErrorCode.RATE_LIMITED,

  // 14xxxx - 客户端错误（内容审核）
  [BackendErrorCode.CONTENT_PENDING_REVIEW]: FrontendErrorCode.CONTENT_PENDING,
  [BackendErrorCode.CONTENT_REJECTED]: FrontendErrorCode.CONTENT_REJECTED,
  [BackendErrorCode.CONTENT_VIOLATION]: FrontendErrorCode.CONTENT_VIOLATION,
  [BackendErrorCode.CONTENT_SPAM]: FrontendErrorCode.CONTENT_VIOLATION,

  // 99xxxx - 服务器错误
  [BackendErrorCode.INTERNAL_ERROR]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.DATABASE_ERROR]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.REDIS_ERROR]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.EXTERNAL_API_ERROR]: FrontendErrorCode.EXTERNAL_ERROR,
  [BackendErrorCode.SERVICE_UNAVAILABLE]: FrontendErrorCode.SERVICE_UNAVAILABLE,
  [BackendErrorCode.TIMEOUT_ERROR]: FrontendErrorCode.TIMEOUT
}

// ============================================
// HTTP状态码兜底映射
// ============================================

/**
 * HTTP状态码到前端错误码的兜底映射
 * 当后端错误码未在映射表中找到时使用
 */
export const httpStatusCodeMap: Record<number, FrontendErrorCode> = {
  400: FrontendErrorCode.BAD_REQUEST,
  401: FrontendErrorCode.UNAUTHORIZED,
  403: FrontendErrorCode.FORBIDDEN,
  404: FrontendErrorCode.NOT_FOUND,
  409: FrontendErrorCode.CONFLICT,
  422: FrontendErrorCode.VALIDATION_ERROR,
  429: FrontendErrorCode.RATE_LIMITED,
  500: FrontendErrorCode.SERVER_ERROR,
  502: FrontendErrorCode.EXTERNAL_ERROR,
  503: FrontendErrorCode.SERVICE_UNAVAILABLE,
  504: FrontendErrorCode.TIMEOUT
}

// ============================================
// 错误码范围映射（向后兼容）
// ============================================

/**
 * 根据错误码范围获取前端错误码
 * 用于处理未明确定义的后端错误码
 */
export function getFrontendCodeByRange(backendCode: number): FrontendErrorCode {
  // 根据错误码范围判断
  if (backendCode >= 100000 && backendCode < 110000) {
    return FrontendErrorCode.BAD_REQUEST
  }
  if (backendCode >= 110000 && backendCode < 120000) {
    return FrontendErrorCode.UNAUTHORIZED
  }
  if (backendCode >= 120000 && backendCode < 130000) {
    return FrontendErrorCode.NOT_FOUND
  }
  if (backendCode >= 130000 && backendCode < 140000) {
    return FrontendErrorCode.BAD_REQUEST
  }
  if (backendCode >= 140000 && backendCode < 150000) {
    return FrontendErrorCode.CONTENT_REJECTED
  }
  if (backendCode >= 990000 && backendCode < 1000000) {
    return FrontendErrorCode.SERVER_ERROR
  }
  return FrontendErrorCode.UNKNOWN_ERROR
}

// ============================================
// 错误码转换函数
// ============================================

/**
 * 将后端错误码转换为前端错误码
 * @param backendCode - 后端6位数字错误码
 * @param httpStatus - HTTP状态码（可选，用于兜底）
 * @returns 前端错误码
 */
export function mapBackendCodeToFrontend(
  backendCode: number,
  httpStatus?: number
): FrontendErrorCode {
  // 成功
  if (backendCode === 0) {
    return FrontendErrorCode.UNKNOWN_ERROR // 成功不应该调用此函数
  }

  // 优先使用精确映射
  if (errorCodeMap[backendCode]) {
    return errorCodeMap[backendCode]
  }

  // 使用HTTP状态码兜底
  if (httpStatus && httpStatusCodeMap[httpStatus]) {
    return httpStatusCodeMap[httpStatus]
  }

  // 根据错误码范围兜底
  return getFrontendCodeByRange(backendCode)
}

// ============================================
// 错误消息定义
// ============================================

/**
 * 错误消息结构
 */
export interface ErrorMessage {
  code: FrontendErrorCode
  title: string
  message: string
  description?: string
  action?: string
}

/**
 * 中文错误消息
 */
export const zhCNMessages: Record<FrontendErrorCode, ErrorMessage> = {
  [FrontendErrorCode.NETWORK_ERROR]: {
    code: FrontendErrorCode.NETWORK_ERROR,
    title: '网络错误',
    message: '网络连接失败，请检查网络设置',
    action: '请检查网络连接后重试'
  },
  [FrontendErrorCode.TIMEOUT]: {
    code: FrontendErrorCode.TIMEOUT,
    title: '请求超时',
    message: '请求超时，请稍后重试',
    action: '请稍后重试'
  },
  [FrontendErrorCode.CONNECTION_REFUSED]: {
    code: FrontendErrorCode.CONNECTION_REFUSED,
    title: '连接被拒绝',
    message: '无法连接到服务器',
    action: '请稍后重试或联系客服'
  },
  [FrontendErrorCode.UNAUTHORIZED]: {
    code: FrontendErrorCode.UNAUTHORIZED,
    title: '未登录',
    message: '您需要登录后才能继续操作',
    action: '请前往登录页面'
  },
  [FrontendErrorCode.FORBIDDEN]: {
    code: FrontendErrorCode.FORBIDDEN,
    title: '权限不足',
    message: '您没有权限执行此操作',
    action: '请联系管理员获取权限'
  },
  [FrontendErrorCode.TOKEN_EXPIRED]: {
    code: FrontendErrorCode.TOKEN_EXPIRED,
    title: '登录已过期',
    message: '您的登录状态已过期，请重新登录',
    action: '点击重新登录'
  },
  [FrontendErrorCode.TOKEN_INVALID]: {
    code: FrontendErrorCode.TOKEN_INVALID,
    title: '登录无效',
    message: '您的登录凭证无效，请重新登录',
    action: '点击重新登录'
  },
  [FrontendErrorCode.ACCOUNT_LOCKED]: {
    code: FrontendErrorCode.ACCOUNT_LOCKED,
    title: '账户已锁定',
    message: '您的账户已被锁定，暂时无法使用',
    action: '请联系客服解锁账户'
  },
  [FrontendErrorCode.ACCOUNT_DISABLED]: {
    code: FrontendErrorCode.ACCOUNT_DISABLED,
    title: '账户已禁用',
    message: '您的账户已被禁用',
    action: '请联系客服了解详情'
  },
  [FrontendErrorCode.BAD_REQUEST]: {
    code: FrontendErrorCode.BAD_REQUEST,
    title: '请求错误',
    message: '请求参数有误，请检查后重试',
    action: '请检查输入内容'
  },
  [FrontendErrorCode.NOT_FOUND]: {
    code: FrontendErrorCode.NOT_FOUND,
    title: '内容不存在',
    message: '您请求的内容不存在或已被删除',
    action: '请确认链接是否正确'
  },
  [FrontendErrorCode.CONFLICT]: {
    code: FrontendErrorCode.CONFLICT,
    title: '资源冲突',
    message: '操作冲突，请稍后重试',
    action: '请刷新页面后重试'
  },
  [FrontendErrorCode.VALIDATION_ERROR]: {
    code: FrontendErrorCode.VALIDATION_ERROR,
    title: '验证失败',
    message: '输入数据验证失败，请检查后重试',
    action: '请检查输入内容'
  },
  [FrontendErrorCode.RESOURCE_EXISTS]: {
    code: FrontendErrorCode.RESOURCE_EXISTS,
    title: '资源已存在',
    message: '您要创建的资源已存在',
    action: '请使用其他名称或编辑现有资源'
  },
  [FrontendErrorCode.RESOURCE_GONE]: {
    code: FrontendErrorCode.RESOURCE_GONE,
    title: '资源已删除',
    message: '该资源已被永久删除',
    action: '请联系管理员'
  },
  [FrontendErrorCode.INSUFFICIENT_BALANCE]: {
    code: FrontendErrorCode.INSUFFICIENT_BALANCE,
    title: '余额不足',
    message: '您的账户余额不足，无法完成操作',
    action: '请充值后重试'
  },
  [FrontendErrorCode.INSUFFICIENT_QUOTA]: {
    code: FrontendErrorCode.INSUFFICIENT_QUOTA,
    title: '配额不足',
    message: '您的使用配额已用完',
    action: '请升级套餐或等待配额重置'
  },
  [FrontendErrorCode.WALLET_FROZEN]: {
    code: FrontendErrorCode.WALLET_FROZEN,
    title: '钱包已冻结',
    message: '您的钱包已被冻结，暂时无法使用',
    action: '请联系客服解冻'
  },
  [FrontendErrorCode.CONTENT_LOCKED]: {
    code: FrontendErrorCode.CONTENT_LOCKED,
    title: '内容已锁定',
    message: '该内容已被锁定，暂时无法访问',
    action: '请购买或解锁后查看'
  },
  [FrontendErrorCode.RATE_LIMITED]: {
    code: FrontendErrorCode.RATE_LIMITED,
    title: '请求过于频繁',
    message: '您的操作过于频繁，请稍后再试',
    action: '请等待一段时间后重试'
  },
  [FrontendErrorCode.CONTENT_PENDING]: {
    code: FrontendErrorCode.CONTENT_PENDING,
    title: '内容审核中',
    message: '您的内容正在审核中，请耐心等待',
    action: '审核通过后将自动发布'
  },
  [FrontendErrorCode.CONTENT_REJECTED]: {
    code: FrontendErrorCode.CONTENT_REJECTED,
    title: '内容未通过审核',
    message: '您的内容未通过审核，请修改后重试',
    action: '请根据审核意见修改'
  },
  [FrontendErrorCode.CONTENT_VIOLATION]: {
    code: FrontendErrorCode.CONTENT_VIOLATION,
    title: '内容违规',
    message: '您的内容违反相关规定，已被处理',
    action: '请遵守社区规范'
  },
  [FrontendErrorCode.SERVER_ERROR]: {
    code: FrontendErrorCode.SERVER_ERROR,
    title: '服务器错误',
    message: '服务器出现错误，请稍后重试',
    action: '请稍后重试或联系客服'
  },
  [FrontendErrorCode.SERVICE_UNAVAILABLE]: {
    code: FrontendErrorCode.SERVICE_UNAVAILABLE,
    title: '服务不可用',
    message: '服务暂时不可用，请稍后再试',
    action: '请稍后重试'
  },
  [FrontendErrorCode.EXTERNAL_ERROR]: {
    code: FrontendErrorCode.EXTERNAL_ERROR,
    title: '外部服务错误',
    message: '外部服务出现错误，请稍后重试',
    action: '请稍后重试'
  },
  [FrontendErrorCode.UNKNOWN_ERROR]: {
    code: FrontendErrorCode.UNKNOWN_ERROR,
    title: '未知错误',
    message: '发生未知错误，请稍后重试',
    action: '请稍后重试或联系客服'
  }
}

/**
 * 英文错误消息
 */
export const enUSMessages: Record<FrontendErrorCode, ErrorMessage> = {
  [FrontendErrorCode.NETWORK_ERROR]: {
    code: FrontendErrorCode.NETWORK_ERROR,
    title: 'Network Error',
    message: 'Network connection failed. Please check your network settings.',
    action: 'Please check your connection and try again'
  },
  [FrontendErrorCode.TIMEOUT]: {
    code: FrontendErrorCode.TIMEOUT,
    title: 'Request Timeout',
    message: 'Request timed out. Please try again later.',
    action: 'Please try again later'
  },
  [FrontendErrorCode.CONNECTION_REFUSED]: {
    code: FrontendErrorCode.CONNECTION_REFUSED,
    title: 'Connection Refused',
    message: 'Unable to connect to the server.',
    action: 'Please try again later or contact support'
  },
  [FrontendErrorCode.UNAUTHORIZED]: {
    code: FrontendErrorCode.UNAUTHORIZED,
    title: 'Not Logged In',
    message: 'You need to log in to continue.',
    action: 'Please go to the login page'
  },
  [FrontendErrorCode.FORBIDDEN]: {
    code: FrontendErrorCode.FORBIDDEN,
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.',
    action: 'Please contact your administrator'
  },
  [FrontendErrorCode.TOKEN_EXPIRED]: {
    code: FrontendErrorCode.TOKEN_EXPIRED,
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    action: 'Click to log in again'
  },
  [FrontendErrorCode.TOKEN_INVALID]: {
    code: FrontendErrorCode.TOKEN_INVALID,
    title: 'Invalid Session',
    message: 'Your session is invalid. Please log in again.',
    action: 'Click to log in again'
  },
  [FrontendErrorCode.ACCOUNT_LOCKED]: {
    code: FrontendErrorCode.ACCOUNT_LOCKED,
    title: 'Account Locked',
    message: 'Your account has been locked and is temporarily unavailable.',
    action: 'Please contact support to unlock'
  },
  [FrontendErrorCode.ACCOUNT_DISABLED]: {
    code: FrontendErrorCode.ACCOUNT_DISABLED,
    title: 'Account Disabled',
    message: 'Your account has been disabled.',
    action: 'Please contact support for more information'
  },
  [FrontendErrorCode.BAD_REQUEST]: {
    code: FrontendErrorCode.BAD_REQUEST,
    title: 'Bad Request',
    message: 'Invalid request parameters. Please check and try again.',
    action: 'Please check your input'
  },
  [FrontendErrorCode.NOT_FOUND]: {
    code: FrontendErrorCode.NOT_FOUND,
    title: 'Not Found',
    message: 'The requested content does not exist or has been deleted.',
    action: 'Please verify the link is correct'
  },
  [FrontendErrorCode.CONFLICT]: {
    code: FrontendErrorCode.CONFLICT,
    title: 'Conflict',
    message: 'Operation conflict. Please try again later.',
    action: 'Please refresh the page and try again'
  },
  [FrontendErrorCode.VALIDATION_ERROR]: {
    code: FrontendErrorCode.VALIDATION_ERROR,
    title: 'Validation Failed',
    message: 'Input validation failed. Please check and try again.',
    action: 'Please check your input'
  },
  [FrontendErrorCode.RESOURCE_EXISTS]: {
    code: FrontendErrorCode.RESOURCE_EXISTS,
    title: 'Resource Exists',
    message: 'The resource you are creating already exists.',
    action: 'Please use a different name or edit the existing resource'
  },
  [FrontendErrorCode.RESOURCE_GONE]: {
    code: FrontendErrorCode.RESOURCE_GONE,
    title: 'Resource Gone',
    message: 'This resource has been permanently deleted.',
    action: 'Please contact your administrator'
  },
  [FrontendErrorCode.INSUFFICIENT_BALANCE]: {
    code: FrontendErrorCode.INSUFFICIENT_BALANCE,
    title: 'Insufficient Balance',
    message: 'Your account balance is insufficient to complete this operation.',
    action: 'Please recharge and try again'
  },
  [FrontendErrorCode.INSUFFICIENT_QUOTA]: {
    code: FrontendErrorCode.INSUFFICIENT_QUOTA,
    title: 'Insufficient Quota',
    message: 'You have used up your quota.',
    action: 'Please upgrade your plan or wait for quota reset'
  },
  [FrontendErrorCode.WALLET_FROZEN]: {
    code: FrontendErrorCode.WALLET_FROZEN,
    title: 'Wallet Frozen',
    message: 'Your wallet has been frozen and is temporarily unavailable.',
    action: 'Please contact support to unfreeze'
  },
  [FrontendErrorCode.CONTENT_LOCKED]: {
    code: FrontendErrorCode.CONTENT_LOCKED,
    title: 'Content Locked',
    message: 'This content is locked and temporarily unavailable.',
    action: 'Please purchase or unlock to view'
  },
  [FrontendErrorCode.RATE_LIMITED]: {
    code: FrontendErrorCode.RATE_LIMITED,
    title: 'Too Many Requests',
    message: 'You are making requests too frequently. Please try again later.',
    action: 'Please wait a while before trying again'
  },
  [FrontendErrorCode.CONTENT_PENDING]: {
    code: FrontendErrorCode.CONTENT_PENDING,
    title: 'Content Under Review',
    message: 'Your content is under review. Please be patient.',
    action: 'It will be published automatically after approval'
  },
  [FrontendErrorCode.CONTENT_REJECTED]: {
    code: FrontendErrorCode.CONTENT_REJECTED,
    title: 'Content Rejected',
    message: 'Your content was not approved. Please modify and resubmit.',
    action: 'Please modify according to the review feedback'
  },
  [FrontendErrorCode.CONTENT_VIOLATION]: {
    code: FrontendErrorCode.CONTENT_VIOLATION,
    title: 'Content Violation',
    message: 'Your content violates relevant regulations and has been processed.',
    action: 'Please follow community guidelines'
  },
  [FrontendErrorCode.SERVER_ERROR]: {
    code: FrontendErrorCode.SERVER_ERROR,
    title: 'Server Error',
    message: 'A server error occurred. Please try again later.',
    action: 'Please try again later or contact support'
  },
  [FrontendErrorCode.SERVICE_UNAVAILABLE]: {
    code: FrontendErrorCode.SERVICE_UNAVAILABLE,
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable. Please try again later.',
    action: 'Please try again later'
  },
  [FrontendErrorCode.EXTERNAL_ERROR]: {
    code: FrontendErrorCode.EXTERNAL_ERROR,
    title: 'External Service Error',
    message: 'An external service error occurred. Please try again later.',
    action: 'Please try again later'
  },
  [FrontendErrorCode.UNKNOWN_ERROR]: {
    code: FrontendErrorCode.UNKNOWN_ERROR,
    title: 'Unknown Error',
    message: 'An unknown error occurred. Please try again later.',
    action: 'Please try again later or contact support'
  }
}

// ============================================
// 错误消息获取函数
// ============================================

/**
 * 语言消息映射
 */
const messagesMap: Record<string, Record<FrontendErrorCode, ErrorMessage>> = {
  'zh-CN': zhCNMessages,
  'en-US': enUSMessages
}

/**
 * 获取错误消息
 * @param code - 前端错误码
 * @param locale - 语言代码（可选，默认中文）
 * @returns 错误消息对象
 */
export function getErrorMessage(
  code: FrontendErrorCode,
  locale: string = 'zh-CN'
): ErrorMessage {
  const messages = messagesMap[locale] || messagesMap['zh-CN']
  return (
    messages[code] || {
      code,
      title: '未知错误',
      message: '发生未知错误，请稍后重试',
      action: '请稍后重试或联系客服'
    }
  )
}

/**
 * 使用i18n获取错误消息（在Vue组件中使用）
 * @param code - 前端错误码
 * @returns 错误消息对象
 */
export function useErrorMessage(code: FrontendErrorCode): ErrorMessage {
  try {
    const useI18nFn = getUseI18n()
    if (useI18nFn) {
      const { locale } = useI18nFn()
      return getErrorMessage(code, locale.value)
    }
  } catch {
    // i18n 未初始化或出错，使用默认中文
  }
  // 默认使用中文
  return getErrorMessage(code, 'zh-CN')
}

// ============================================
// 错误处理建议
// ============================================

/**
 * 错误处理建议
 */
export interface ErrorHandlingAdvice {
  shouldRetry: boolean
  shouldLogout: boolean
  shouldRedirect?: string
  retryDelay?: number
}

/**
 * 获取错误处理建议
 * @param code - 前端错误码
 * @returns 处理建议
 */
export function getErrorHandlingAdvice(code: FrontendErrorCode): ErrorHandlingAdvice {
  const adviceMap: Record<FrontendErrorCode, ErrorHandlingAdvice> = {
    [FrontendErrorCode.NETWORK_ERROR]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 3000
    },
    [FrontendErrorCode.TIMEOUT]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 2000
    },
    [FrontendErrorCode.CONNECTION_REFUSED]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 5000
    },
    [FrontendErrorCode.UNAUTHORIZED]: {
      shouldRetry: false,
      shouldLogout: true,
      shouldRedirect: '/login'
    },
    [FrontendErrorCode.FORBIDDEN]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.TOKEN_EXPIRED]: {
      shouldRetry: false,
      shouldLogout: true,
      shouldRedirect: '/login'
    },
    [FrontendErrorCode.TOKEN_INVALID]: {
      shouldRetry: false,
      shouldLogout: true,
      shouldRedirect: '/login'
    },
    [FrontendErrorCode.ACCOUNT_LOCKED]: {
      shouldRetry: false,
      shouldLogout: false,
      shouldRedirect: '/support'
    },
    [FrontendErrorCode.ACCOUNT_DISABLED]: {
      shouldRetry: false,
      shouldLogout: false,
      shouldRedirect: '/support'
    },
    [FrontendErrorCode.BAD_REQUEST]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.NOT_FOUND]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.CONFLICT]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 1000
    },
    [FrontendErrorCode.VALIDATION_ERROR]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.RESOURCE_EXISTS]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.RESOURCE_GONE]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.INSUFFICIENT_BALANCE]: {
      shouldRetry: false,
      shouldLogout: false,
      shouldRedirect: '/wallet/recharge'
    },
    [FrontendErrorCode.INSUFFICIENT_QUOTA]: {
      shouldRetry: false,
      shouldLogout: false,
      shouldRedirect: '/subscription'
    },
    [FrontendErrorCode.WALLET_FROZEN]: {
      shouldRetry: false,
      shouldLogout: false,
      shouldRedirect: '/support'
    },
    [FrontendErrorCode.CONTENT_LOCKED]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.RATE_LIMITED]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 5000
    },
    [FrontendErrorCode.CONTENT_PENDING]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.CONTENT_REJECTED]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.CONTENT_VIOLATION]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.SERVER_ERROR]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 3000
    },
    [FrontendErrorCode.SERVICE_UNAVAILABLE]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 5000
    },
    [FrontendErrorCode.EXTERNAL_ERROR]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 3000
    },
    [FrontendErrorCode.UNKNOWN_ERROR]: {
      shouldRetry: false,
      shouldLogout: false
    }
  }

  return (
    adviceMap[code] || {
      shouldRetry: false,
      shouldLogout: false
    }
  )
}

// ============================================
// 便捷导出
// ============================================

export default {
  BackendErrorCode,
  FrontendErrorCode,
  errorCodeMap,
  httpStatusCodeMap,
  mapBackendCodeToFrontend,
  getFrontendCodeByRange,
  getErrorMessage,
  useErrorMessage,
  getErrorHandlingAdvice,
  zhCNMessages,
  enUSMessages
}
