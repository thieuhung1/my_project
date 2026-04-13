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
 * @property {string}      id            - ID đơn hàng
 * @property {string}      userId        - ID người dùng đặt hàng
 * @property {string}      userName      - Tên người đặt hàng
 * @property {string}      phone         - Số điện thoại
 * @property {string}      address       - Địa chỉ giao hàng
 * @property {OrderItem[]} items         - Danh sách sản phẩm đặt
 * @property {number}      subtotal      - Tạm tính trước giảm giá
 * @property {number}      totalAmount   - Tổng tiền đơn hàng (sau giảm giá)
 * @property {number}      discountAmount - Số tiền giảm giá
 * @property {string}      couponId      - ID mã giảm giá (nếu có)
 * @property {string}      couponCode    - Mã giảm giá (nếu có)
 * @property {string}      paymentMethod - Phương thức thanh toán (COD/CASH)
 * @property {string}      paymentStatus - Trạng thái thanh toán (UNPAID/PAID)
 * @property {string}      status        - Trạng thái đơn hàng (UPPERCASE)
 * @property {string}      type          - Loại đơn (DELIVERY/DINE_IN)
 * @property {string}      table_id      - Mã bàn (nếu DINE_IN)
 * @property {string}      note          - Ghi chú của khách hàng
 * @property {string}      shipperId     - ID shipper (nếu có)
 * @property {string}      shipperName   - Tên shipper (nếu có)
 * @property {Date}        createdAt     - Thời gian đặt hàng
 * @property {Date}        updatedAt     - Thời gian cập nhật
 */

/**
 * Tạo một object đơn hàng mặc định
 * @param {Partial<Order>} overrides
 * @returns {Order}
 */
export const createOrderModel = (overrides = {}) => ({
  userId: "",
  userName: "",
  phone: "",
  address: "",
  items: [],
  subtotal: 0,
  totalAmount: 0,
  discountAmount: 0,
  paymentMethod: "COD",
  paymentStatus: "UNPAID",
  status: "PENDING",
  type: "DELIVERY",
  note: "",
  ...overrides,
});

// ── Các trạng thái đơn hàng hợp lệ (UPPERCASE - khớp với orderService.js) ──
export const ORDER_STATUS = {
  PENDING: "PENDING",                       // Chờ xử lý
  WAITING_FOR_SHIPPER: "WAITING_FOR_SHIPPER", // Chờ shipper nhận
  CONFIRMED: "CONFIRMED",                   // Đã xác nhận
  DELIVERING: "DELIVERING",                 // Đang giao hàng
  COMPLETED: "COMPLETED",                   // Hoàn thành
  FAILED: "FAILED",                         // Giao hàng thất bại
  CANCELLED: "CANCELLED",                   // Đã hủy
};

// Label tiếng Việt cho từng trạng thái
export const ORDER_STATUS_LABEL = {
  PENDING: "Chờ xử lý",
  WAITING_FOR_SHIPPER: "Chờ shipper",
  CONFIRMED: "Đã xác nhận",
  DELIVERING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
};

// Màu badge cho từng trạng thái
export const ORDER_STATUS_COLOR = {
  PENDING: "warning",
  WAITING_FOR_SHIPPER: "secondary",
  CONFIRMED: "info",
  DELIVERING: "primary",
  COMPLETED: "success",
  FAILED: "danger",
  CANCELLED: "dark",
};

/**
 * Tính tổng tiền từ danh sách sản phẩm
 * @param {OrderItem[]} items
 * @returns {number}
 */
export const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
