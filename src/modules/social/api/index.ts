// ✅ 使用 wrapper 层（兼容旧API）
export * from './social'
export { default } from './social'

// 🔁 需要回滚到原始 generated API 时，改成：
// export * from './generated/social'

// 🔁 需要回滚到手动实现的 API 时，改成：
// export * from './manual'
