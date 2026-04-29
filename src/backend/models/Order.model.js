// ============================================================
// Order.model.js - Schema/Model dữ liệu đơn hàng
// ============================================================

/**
 * @typedef {Object} OrderItem
 * @property {string} productId   - ID sản phẩm
 * @property {string} productName - Tên sản phẩm
 * @property {number} quantity    - Số lượng
 * @property {number} price       - Giá tại thời điểm đặt hàng
 * @property {string} imageUrl    - Ảnh sản phẩm
 */

/**
 * @typedef {Object} Order
 * @property {string}      id             - ID đơn hàng
 * @property {string}      userId         - ID người dùng đặt hàng
 * @property {string}      userName       - Tên người đặt hàng
 * @property {string}      phone          - Số điện thoại
 * @property {string}      address        - Địa chỉ giao hàng
 * @property {OrderItem[]} items          - Danh sách sản phẩm đặt
 * @property {number}      subtotal       - Tạm tính trước giảm giá
 * @property {number}      totalAmount    - Tổng tiền đơn hàng (sau giảm giá)
 * @property {number}      discountAmount - Số tiền giảm giá
 * @property {string}      couponId       - ID mã giảm giá (nếu có)
 * @property {string}      couponCode     - Mã giảm giá (nếu có)
 * @property {string}      paymentMethod  - Phương thức thanh toán (COD)
 * @property {string}      paymentStatus  - Trạng thái thanh toán (UNPAID/PENDING/PAID/FAILED)
 * @property {string}      paymentProvider - Nhà cung cấp thanh toán (LOCAL)
 * @property {string}      paidAt         - Thời điểm thanh toán thành công
 * @property {string}      status         - Trạng thái đơn hàng (UPPERCASE)
 * @property {string}      type           - Loại đơn (DELIVERY/DINE_IN)
 * @property {string}      table_id       - Mã bàn (nếu DINE_IN)
 * @property {string}      note           - Ghi chú của khách hàng
 * @property {string}      shipperId      - ID shipper (nếu có)
 * @property {string}      shipperName    - Tên shipper (nếu có)
 * @property {Date}        createdAt      - Thời gian đặt hàng
 * @property {Date}        updatedAt      - Thời gian cập nhật
 */

export const PAYMENT_METHOD = {
  COD: "COD",
};

export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
};

export const PAYMENT_PROVIDER = {
  LOCAL: "LOCAL",
};

export const ORDER_STATUS = {
  PENDING: "PENDING",
  WAITING_FOR_SHIPPER: "WAITING_FOR_SHIPPER",
  CONFIRMED: "CONFIRMED",
  DELIVERING: "DELIVERING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

export const ORDER_STATUS_LABEL = {
  PENDING: "Chờ xử lý",
  WAITING_FOR_SHIPPER: "Chờ shipper",
  CONFIRMED: "Đã xác nhận",
  DELIVERING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
};

export const ORDER_STATUS_COLOR = {
  PENDING: "warning",
  WAITING_FOR_SHIPPER: "secondary",
  CONFIRMED: "info",
  DELIVERING: "primary",
  COMPLETED: "success",
  FAILED: "danger",
  CANCELLED: "dark",
};

export const createOrderModel = (overrides = {}) => ({
  userId: "",
  userName: "",
  phone: "",
  address: "",
  items: [],
  subtotal: 0,
  totalAmount: 0,
  discountAmount: 0,
  couponId: "",
  couponCode: "",
  paymentMethod: PAYMENT_METHOD.COD,
  paymentStatus: PAYMENT_STATUS.UNPAID,
  paymentProvider: PAYMENT_PROVIDER.LOCAL,
  paidAt: null,
  status: ORDER_STATUS.PENDING,
  type: "DELIVERY",
  table_id: "",
  note: "",
  shipperId: "",
  shipperName: "",
  ...overrides,
});

/**
 * Tính tổng tiền từ danh sách sản phẩm
 * @param {OrderItem[]} items
 * @returns {number}
 */
export const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);
