// ============================================================
// Coupon.model.js - Schema/Model dữ liệu mã giảm giá
// ============================================================

/**
 * @typedef {Object} Coupon
 * @property {string} id        - ID tự động Firestore
 * @property {string} code      - Mã giảm giá (unique)
 * @property {string} name      - Tên chương trình (optional)
 * @property {string} type      - 'fixed' | 'percent' 
 * @property {number} value     - Giá trị giảm ('fixed': VNĐ, 'percent': %)
 * @property {number} minOrder  - Đơn hàng tối thiểu
 * @property {number} maxUses   - Số lần sử dụng tối đa
 * @property {number} usedCount - Đã sử dụng
 * @property {boolean} isActive - Kích hoạt/tắt
 * @property {Date} expiresAt   - Ngày hết hạn
 */

/**
 * Tạo coupon model mặc định
 */
export const createCouponModel = (overrides = {}) => ({
  code: '',
  name: '',
  type: 'percent',
  value: 0,
  minOrder: 0,
  maxUses: 0,
  usedCount: 0,
  isActive: true,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  ...overrides,
});

