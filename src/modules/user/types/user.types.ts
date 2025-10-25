/**
 * User Types
 */

/**
 * User Profile
 */
export interface UserProfile {
  id: string
  username: string
  email?: string
  phone?: string
  avatar?: string
  nickname?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  bio?: string
  roles: string[]
  registerTime: number
  lastLoginTime?: number
}

/**
 * Update Profile Parameters
 */
export interface UpdateProfileParams {
  nickname?: string
  email?: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  bio?: string
}

/**
 * Change Password Parameters
 */
export interface ChangePasswordParams {
  old_password: string
  new_password: string
}

/**
 * Wallet Balance
 */
export interface WalletBalance {
  userId: string
  balance: number
  frozenBalance: number
  totalIncome?: number
  totalExpense?: number
}

/**
 * Transaction
 */
export interface Transaction {
  id: string
  userId: string
  type: 'recharge' | 'purchase' | 'reward' | 'withdraw' | 'refund' | 'income'
  amount: number
  balance: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description?: string
  relatedId?: string
  createTime: number
  completeTime?: number
}

/**
 * Recharge Parameters
 */
export interface RechargeParams {
  amount: number
  payment_method: 'alipay' | 'wechat' | 'card'
}

/**
 * Withdraw Parameters
 */
export interface WithdrawParams {
  amount: number
  account: string
  account_type: 'alipay' | 'bank'
}

/**
 * Auth Types
 */
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

export interface RegisterParams {
  username: string
  password: string
  email?: string
  phone?: string
  code?: string
}

export interface AuthResponse {
  token: string
  user: UserProfile
  expiresIn?: number
}

export default {
  UserProfile,
  UpdateProfileParams,
  ChangePasswordParams,
  WalletBalance,
  Transaction,
  RechargeParams,
  WithdrawParams,
  LoginParams,
  RegisterParams,
  AuthResponse
}

