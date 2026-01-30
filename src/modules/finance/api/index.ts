/**
 * 财务模块 API 统一导出
 */
export * from './finance'
export * from './wrapper'

// 解决命名冲突：membership.ts的getMembershipPlans优先
export { getMembershipPlans } from './membership'
export { getMembershipPlans as getMembershipPlansFromWrapper } from './wrapper'

// 解决命名冲突：author-revenue.ts的函数优先
export {
  getRevenueOverview,
  getAuthorEarnings,
  getDailyEarnings,
  getMonthlyEarnings,
  withdrawEarnings,
  getWithdrawalHistory,
  getWithdrawalRequests,
  createWithdrawal,
  createWithdrawalRequest,
  cancelWithdrawalRequest,
  getSettlements,
  getSettlementDetail
} from './author-revenue'
export {
  getRevenueOverview as getRevenueOverviewFromWrapper,
  getAuthorEarnings as getAuthorEarningsFromWrapper,
  getDailyEarnings as getDailyEarningsFromWrapper,
  getMonthlyEarnings as getMonthlyEarningsFromWrapper
} from './wrapper'

// 导出membership.ts的其他函数
export {
  getUserMembership,
  subscribeMembership,
  cancelMembership,
  renewMembership,
  getMembershipCards,
  redeemMembershipCard,
  getMembershipBenefits,
  getMembershipUsage,
  getMembershipBenefitsUsage
} from './membership'
